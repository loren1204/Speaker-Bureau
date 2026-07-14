import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanEmail, cleanText, optionalInteger } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"
import { normalizeSpeakerRecords } from "@/lib/speakerPresentation"

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
    if (!fullName || email === null) return Response.json({ error: "A valid name and email are required" }, { status: 400 })

    const admin = createAdminClient()
    const { data: speaker, error } = await admin.from("speakers").insert({
      full_name: fullName,
      credentials: cleanText(body.credentials, 100) || null,
      email: email || null,
      title: cleanText(body.title, 150) || null,
      bio: cleanText(body.bio, 5000) || null,
      contact_info: cleanText(body.contact_info, 255) || null,
      is_active: body.is_active !== false,
    }).select("*").single()
    if (error) return Response.json({ error: error.message }, { status: 400 })

    const seminarTitle = cleanText(body.seminar_title, 500)
    if (seminarTitle) {
      const { error: seminarError } = await admin.from("seminars").insert({
        speaker_id: speaker.speaker_id,
        title: seminarTitle,
        description: cleanText(body.seminar_description, 5000) || null,
        category_id: optionalInteger(body.category_id),
        department_id: optionalInteger(body.department_id),
        status_id: optionalInteger(body.status_id),
      })
      if (seminarError) return Response.json({ error: `Speaker was created, but the seminar failed: ${seminarError.message}` }, { status: 500 })
    }

    await recordActivity({ actorUserId: user.id, actionType: "speaker_created", entityType: "speaker", entityId: speaker.speaker_id, targetLabel: fullName, description: `${profile.full_name || profile.email || "A team member"} added speaker ${fullName}.` })
    return Response.json({ speaker }, { status: 201 })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to create speaker" }, { status: 500 })
  }
}
