import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { recordActivity } from "@/lib/activity"
import {
  buildSpeakerImportPreview,
  normalizeSpeakerImportKey,
  speakerImportRowWillBeSkipped,
  type SpeakerImportExistingSpeaker,
  type SpeakerImportIssue,
  type SpeakerImportLookups,
  type SpeakerImportResultSummary,
  type SpeakerImportRow,
} from "@/lib/speakerImport"
import type { Json } from "@/types/database"

interface LookupRow { id: number; name: string }

function databaseIssue(row: SpeakerImportRow, reason: string): SpeakerImportIssue {
  return {
    row: row.sourceRow,
    provider: row.providerName,
    field: "Database",
    sourceValue: row.seminarTitle,
    reason,
    willSkip: true,
  }
}

function lookupIdMap(rows: LookupRow[]) {
  return new Map(rows.map((item) => [normalizeSpeakerImportKey(item.name), item.id]))
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const body = await request.json() as { rows?: unknown[] }
    if (!Array.isArray(body.rows) || !body.rows.length || body.rows.length > 1000) {
      return Response.json({ error: "Import between 1 and 1,000 normalized seminar rows." }, { status: 400 })
    }

    const admin = createAdminClient()
    const [categoryResult, departmentResult, statusResult, speakerResult] = await Promise.all([
      admin.from("categories").select("category_id, name"),
      admin.from("departments").select("department_id, name"),
      admin.from("statuses").select("status_id, label"),
      admin.from("speakers").select("speaker_id, full_name, credentials, seminars(seminar_id, title)"),
    ])
    if (categoryResult.error || departmentResult.error || statusResult.error || speakerResult.error) {
      return Response.json({ error: "Current speaker and lookup data could not be loaded." }, { status: 500 })
    }

    const categoryRows: LookupRow[] = (categoryResult.data ?? []).map((item) => ({ id: item.category_id, name: item.name }))
    const departmentRows: LookupRow[] = (departmentResult.data ?? []).map((item) => ({ id: item.department_id, name: item.name }))
    const statusRows: LookupRow[] = (statusResult.data ?? []).map((item) => ({ id: item.status_id, name: item.label }))
    const lookups: SpeakerImportLookups = {
      categories: categoryRows.map((item) => item.name),
      departments: departmentRows.map((item) => item.name),
      statuses: statusRows.map((item) => item.name),
    }
    const existingSpeakers: SpeakerImportExistingSpeaker[] = (speakerResult.data ?? []).map((speaker) => ({
      speaker_id: speaker.speaker_id,
      full_name: speaker.full_name,
      credentials: speaker.credentials,
      seminars: (speaker.seminars ?? []).map((seminar) => ({ title: seminar.title })),
    }))
    const preview = buildSpeakerImportPreview(body.rows, lookups, existingSpeakers)
    const categoryIds = lookupIdMap(categoryRows)
    const departmentIds = lookupIdMap(departmentRows)
    const statusIds = lookupIdMap(statusRows)

    const incomingDepartments = new Map(preview.rows
      .filter((row) => !speakerImportRowWillBeSkipped(row) && row.department)
      .map((row) => [normalizeSpeakerImportKey(row.department), row.department]))
    for (const [key, name] of incomingDepartments) {
      if (departmentIds.has(key)) continue
      const { data, error } = await admin.from("departments").insert({ name }).select("department_id").single()
      if (error) {
        return Response.json({ error: `Department “${name}” could not be saved: ${error.message}` }, { status: 500 })
      }
      departmentIds.set(key, data.department_id)
    }
    const summary: SpeakerImportResultSummary = {
      speakersMatched: 0,
      speakersInserted: 0,
      speakersUpdated: 0,
      seminarsInserted: 0,
      seminarsMatched: 0,
      seminarsUpdated: 0,
      duplicateRowsSkipped: preview.summary.duplicateSeminarRows,
      invalidRows: preview.summary.invalidRows,
      databaseFailures: 0,
      validCandidateRows: preview.summary.validRows,
      errors: preview.issues.filter((item) => item.willSkip),
    }

    for (const group of preview.groups) {
      const readyRows = group.seminars.filter((row) => !speakerImportRowWillBeSkipped(row) && row.duplicateOfRow === null)
      if (!readyRows.length || group.speakerAction === "skipped") continue

      let speakerId = group.speakerId
      try {
        if (speakerId) {
          if (group.speakerAction === "updated" && group.credentials) {
            const { error } = await admin.from("speakers").update({ credentials: group.credentials }).eq("speaker_id", speakerId)
            if (error) throw error
            summary.speakersUpdated += 1
          } else {
            summary.speakersMatched += 1
          }
        } else {
          const { data, error } = await admin.from("speakers").insert({
            full_name: group.providerName,
            credentials: group.credentials,
            is_active: true,
          }).select("speaker_id").single()
          if (error) throw error
          speakerId = data.speaker_id
          summary.speakersInserted += 1
        }
      } catch (caught) {
        const reason = caught instanceof Error ? caught.message : "Speaker matching or insertion failed."
        summary.databaseFailures += readyRows.length
        summary.errors.push(...readyRows.map((row) => databaseIssue(row, reason)))
        continue
      }

      const existingTitles = new Set(group.existingSeminarTitles.map(normalizeSpeakerImportKey))
      const seminarsToInsert = readyRows.filter((row) => {
        if (existingTitles.has(normalizeSpeakerImportKey(row.seminarTitle))) {
          summary.seminarsMatched += 1
          return false
        }
        return true
      })
      if (!seminarsToInsert.length) continue

      const payload = seminarsToInsert.map((row) => ({
        speaker_id: speakerId,
        title: row.seminarTitle,
        description: row.seminarDescription,
        department_id: row.resolvedDepartment ? departmentIds.get(normalizeSpeakerImportKey(row.resolvedDepartment)) ?? null : null,
        category_id: row.resolvedCategory ? categoryIds.get(normalizeSpeakerImportKey(row.resolvedCategory)) ?? null : null,
        status_id: row.resolvedStatus ? statusIds.get(normalizeSpeakerImportKey(row.resolvedStatus)) ?? null : null,
      }))
      const { error } = await admin.from("seminars").insert(payload)
      if (error) {
        summary.databaseFailures += seminarsToInsert.length
        summary.errors.push(...seminarsToInsert.map((row) => databaseIssue(row, error.message)))
      } else {
        summary.seminarsInserted += seminarsToInsert.length
      }
    }

    const activityMetadata: Json = {
      speakersMatched: summary.speakersMatched,
      speakersInserted: summary.speakersInserted,
      speakersUpdated: summary.speakersUpdated,
      seminarsInserted: summary.seminarsInserted,
      seminarsMatched: summary.seminarsMatched,
      seminarsUpdated: summary.seminarsUpdated,
      duplicateRowsSkipped: summary.duplicateRowsSkipped,
      invalidRows: summary.invalidRows,
      databaseFailures: summary.databaseFailures,
      validCandidateRows: summary.validCandidateRows,
      errors: summary.errors.map((item) => ({ row: item.row, provider: item.provider, field: item.field, sourceValue: item.sourceValue, reason: item.reason })),
    }
    await recordActivity({
      actorUserId: user.id,
      actionType: "excel_import_completed",
      entityType: "import",
      targetLabel: `${body.rows.length} Master rows`,
      description: `${profile.full_name || profile.email || "A team member"} completed a grouped speaker import: ${summary.speakersInserted} speakers and ${summary.seminarsInserted} seminars inserted; ${summary.invalidRows} invalid rows and ${summary.databaseFailures} database failures.`,
      metadata: activityMetadata,
    })

    if (summary.validCandidateRows === 0) {
      return Response.json({ error: "No valid candidate rows were available for import.", summary }, { status: 422 })
    }
    const processedSeminars = summary.seminarsMatched + summary.seminarsInserted + summary.seminarsUpdated
    const processedRecords = summary.speakersMatched + summary.speakersInserted + summary.speakersUpdated + processedSeminars
    if (processedRecords === 0 && summary.databaseFailures >= summary.validCandidateRows) {
      return Response.json({ error: "Database processing failed for every valid candidate row.", summary }, { status: 500 })
    }
    return Response.json({ summary })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "The import could not be completed." }, { status: 500 })
  }
}
