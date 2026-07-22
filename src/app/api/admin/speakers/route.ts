import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanEmail, cleanText } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"
import { normalizeSpeakerRecords } from "@/lib/speakerPresentation"
import { findOrCreateDepartment } from "@/lib/departments"

interface DatabaseError {
  code?: string
  message: string
  details?: string | null
  hint?: string | null
}

function databaseErrorResponse(operation: string, error: DatabaseError, status = 400) {
  return Response.json({
    error: `${operation} failed${error.code ? ` (${error.code})` : ""}: ${error.message}`,
    code: error.code ?? null,
    operation,
  }, { status })
}

function optionalLookupId(value: unknown, field: string) {
  if (value === "" || value === null || value === undefined) return { value: null, error: null }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return { value: null, error: `${field} must be a valid lookup ID.` }
  return { value: parsed, error: null }
}

function normalizedName(value: string) {
  return value.replace(/\u00a0/g, " ").trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

export async function GET() {
  try {
    await requireTeamMember()
    const admin = createAdminClient()
    const [speakers, categories, departments, statuses] = await Promise.all([
      admin.from("speakers").select("*, seminars(*, categories(*), departments(*), statuses(*)), speaker_topics(topics(title)), speaker_contacts(contact_id, contact)").order("full_name"),
      admin.from("categories").select("category_id, name").order("category_id"),
      admin.from("departments").select("department_id, name").order("name"),
      admin.from("statuses").select("status_id, label").order("status_id"),
    ])
    const error = speakers.error || categories.error || departments.error || statuses.error
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const normalized = normalizeSpeakerRecords(speakers.data)
    return Response.json({ speakers: normalized.speakers, malformedSpeakerCount: normalized.malformedCount, categories: categories.data ?? [], departments: departments.data ?? [], statuses: statuses.data ?? [] })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to load speaker data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const body = await request.json() as Record<string, unknown>
    const fullName = cleanText(body.full_name, 100, true)
    const email = cleanEmail(body.email)
    if (!fullName) return Response.json({ error: "Full name is required.", operation: "validation" }, { status: 400 })
    if (email === null) return Response.json({ error: "Email is optional, but it must be a valid email address when provided.", operation: "validation" }, { status: 400 })

    const seminarTitle = cleanText(body.seminar_title, 500)
    const seminarDescription = cleanText(body.seminar_description, 5000) || null
    const departmentLabel = cleanText(body.department, 100) || null
    const categoryId = optionalLookupId(body.category_id, "Category")
    const statusId = optionalLookupId(body.status_id, "Status")
    const lookupError = categoryId.error || statusId.error
    if (lookupError) return Response.json({ error: lookupError, operation: "validation" }, { status: 400 })
    if (!seminarTitle && (seminarDescription || departmentLabel || categoryId.value || statusId.value)) {
      return Response.json({ error: "A seminar title is required when seminar details or lookup values are provided.", operation: "validation" }, { status: 400 })
    }

    const admin = createAdminClient()
    const duplicateResult = await admin.from("speakers").select("speaker_id, full_name")
    if (duplicateResult.error) return databaseErrorResponse("Duplicate speaker check", duplicateResult.error, 500)
    const duplicate = (duplicateResult.data ?? []).find((speaker) => normalizedName(speaker.full_name ?? "") === normalizedName(fullName))
    if (duplicate) {
      return Response.json({
        error: `A speaker named “${duplicate.full_name}” already exists. Open that speaker instead of creating a duplicate.`,
        code: "DUPLICATE_SPEAKER",
        operation: "duplicate speaker check",
        existingSpeakerId: duplicate.speaker_id,
      }, { status: 409 })
    }

    if (seminarTitle) {
      const [category, status] = await Promise.all([
        categoryId.value ? admin.from("categories").select("category_id").eq("category_id", categoryId.value).maybeSingle() : Promise.resolve({ data: null, error: null }),
        statusId.value ? admin.from("statuses").select("status_id").eq("status_id", statusId.value).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ])
      const lookupDatabaseError = category.error || status.error
      if (lookupDatabaseError) return databaseErrorResponse("Seminar lookup validation", lookupDatabaseError, 500)
      if (categoryId.value && !category.data) return Response.json({ error: `Category ID ${categoryId.value} does not exist.`, operation: "validation" }, { status: 400 })
      if (statusId.value && !status.data) return Response.json({ error: `Status ID ${statusId.value} does not exist.`, operation: "validation" }, { status: 400 })
    }

    const { data: speaker, error } = await admin.from("speakers").insert({
      full_name: fullName,
      credentials: cleanText(body.credentials, 100) || null,
      email: email || null,
      title: cleanText(body.title, 150) || null,
      bio: cleanText(body.bio, 5000) || null,
      contact_info: cleanText(body.contact_info, 255) || null,
      is_active: body.is_active !== false,
    }).select("*").single()
    if (error) return databaseErrorResponse("Speaker insert", error, error.code === "23505" ? 409 : 400)

    await recordActivity({ actorUserId: user.id, actionType: "speaker_created", entityType: "speaker", entityId: speaker.speaker_id, targetLabel: fullName, description: `${profile.full_name || profile.email || "A team member"} added speaker ${fullName}.` })

    let seminar = null
    if (seminarTitle) {
      const department = await findOrCreateDepartment(admin, departmentLabel)
      if (department.error) {
        return Response.json({
          error: `Speaker “${fullName}” was created, but department “${departmentLabel}” could not be saved: ${department.error}`,
          operation: "Department insert",
          partial: true,
          speaker,
        }, { status: 207 })
      }
      const { data: seminarData, error: seminarError } = await admin.from("seminars").insert({
        speaker_id: speaker.speaker_id,
        title: seminarTitle,
        description: seminarDescription,
        category_id: categoryId.value,
        department_id: department.id,
        status_id: statusId.value,
      }).select("*").single()
      if (seminarError) {
        return Response.json({
          error: `Speaker “${fullName}” was created, but the first seminar could not be added${seminarError.code ? ` (${seminarError.code})` : ""}: ${seminarError.message}`,
          code: seminarError.code ?? null,
          operation: "Seminar insert",
          partial: true,
          speaker,
        }, { status: 207 })
      }
      seminar = seminarData
    }

    return Response.json({ speaker, seminar, partial: false, message: seminar ? "Speaker and first seminar created." : "Speaker created." }, { status: 201 })
  } catch (error) {
    const authResponse = authErrorResponse(error)
    if (authResponse) return authResponse
    const message = error instanceof Error ? error.message : "Unexpected server error."
    console.error("Unable to create speaker", message)
    return Response.json({ error: `Unable to create speaker: ${message}`, operation: "request processing" }, { status: 500 })
  }
}
