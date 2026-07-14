import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanEmail, cleanText, optionalInteger } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"

interface ImportRow {
  speaker_id?: unknown
  full_name?: unknown
  credentials?: unknown
  email?: unknown
  contact_info?: unknown
  is_active?: unknown
  headshot_url?: unknown
  seminar_title?: unknown
  seminar_description?: unknown
  category?: unknown
  department?: unknown
  status?: unknown
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const body = await request.json() as { rows?: ImportRow[] }
    if (!Array.isArray(body.rows) || !body.rows.length || body.rows.length > 1000) return Response.json({ error: "Import between 1 and 1,000 rows" }, { status: 400 })
    const admin = createAdminClient()
    const [categoryResult, departmentResult, statusResult] = await Promise.all([
      admin.from("categories").select("category_id, name"), admin.from("departments").select("department_id, name"), admin.from("statuses").select("status_id, label"),
    ])
    if (categoryResult.error || departmentResult.error || statusResult.error) return Response.json({ error: "Lookup data could not be loaded" }, { status: 500 })
    const categories = new Map((categoryResult.data ?? []).map((item) => [item.name.toLowerCase(), item.category_id]))
    const departments = new Map((departmentResult.data ?? []).map((item) => [item.name.toLowerCase(), item.department_id]))
    const statuses = new Map((statusResult.data ?? []).map((item) => [item.label.toLowerCase(), item.status_id]))
    const summary = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] as { row: number; error: string }[] }

    for (let index = 0; index < body.rows.length; index += 1) {
      const row = body.rows[index]
      const rowNumber = index + 2
      const fullName = cleanText(row.full_name, 100, true)
      const email = cleanEmail(row.email)
      if (!fullName || email === null) { summary.failed += 1; summary.errors.push({ row: rowNumber, error: "A valid Full Name and Email are required" }); continue }

      try {
        let speakerId = optionalInteger(row.speaker_id)
        let existing: { speaker_id: number } | null = null
        if (speakerId) {
          const result = await admin.from("speakers").select("speaker_id").eq("speaker_id", speakerId).maybeSingle()
          existing = result.data
        }
        if (!existing && email) {
          const result = await admin.from("speakers").select("speaker_id").ilike("email", email).limit(2)
          if ((result.data?.length ?? 0) > 1) throw new Error("Email matches more than one speaker")
          existing = result.data?.[0] ?? null
        }
        if (!existing) {
          const result = await admin.from("speakers").select("speaker_id").eq("full_name", fullName).limit(2)
          if ((result.data?.length ?? 0) > 1) throw new Error("Name matches more than one speaker; add Speaker ID or Email")
          existing = result.data?.[0] ?? null
        }

        const speakerPayload = {
          full_name: fullName,
          credentials: cleanText(row.credentials, 100) || null,
          email: email || null,
          contact_info: cleanText(row.contact_info, 255) || null,
          headshot_url: cleanText(row.headshot_url, 500) || null,
          is_active: String(row.is_active ?? "true").toLowerCase() !== "false" && String(row.is_active ?? "true").toLowerCase() !== "limited",
        }
        if (existing) {
          speakerId = existing.speaker_id
          const { error } = await admin.from("speakers").update(speakerPayload).eq("speaker_id", speakerId)
          if (error) throw error
          summary.updated += 1
        } else {
          const { data, error } = await admin.from("speakers").insert(speakerPayload).select("speaker_id").single()
          if (error) throw error
          speakerId = data.speaker_id
          summary.inserted += 1
        }

        const seminarTitle = cleanText(row.seminar_title, 500)
        if (seminarTitle && speakerId) {
          const categoryName = cleanText(row.category, 100)
          const departmentName = cleanText(row.department, 100)
          const statusName = cleanText(row.status, 50)
          const categoryId = categoryName ? categories.get(categoryName.toLowerCase()) : null
          const departmentId = departmentName ? departments.get(departmentName.toLowerCase()) : null
          const statusId = statusName ? statuses.get(statusName.toLowerCase()) : null
          if (categoryName && !categoryId) throw new Error(`Unknown category “${categoryName}”`)
          if (departmentName && !departmentId) throw new Error(`Unknown department “${departmentName}”`)
          if (statusName && !statusId) throw new Error(`Unknown status “${statusName}”`)
          const { error } = await admin.from("seminars").upsert({ speaker_id: speakerId, title: seminarTitle, description: cleanText(row.seminar_description, 5000) || null, category_id: categoryId ?? null, department_id: departmentId ?? null, status_id: statusId ?? null }, { onConflict: "speaker_id,title" })
          if (error) throw error
        }
      } catch (error) {
        summary.failed += 1
        summary.errors.push({ row: rowNumber, error: error instanceof Error ? error.message : "Import failed" })
      }
    }

    await recordActivity({ actorUserId: user.id, actionType: "excel_import_completed", entityType: "import", targetLabel: `${body.rows.length} rows`, description: `${profile.full_name || profile.email || "A team member"} completed an Excel import: ${summary.inserted} inserted, ${summary.updated} updated, ${summary.failed} failed.`, metadata: summary })
    return Response.json({ summary })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "The import could not be completed" }, { status: 500 })
  }
}
