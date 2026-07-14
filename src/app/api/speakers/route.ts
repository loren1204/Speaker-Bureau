import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeSpeakerRecords } from "@/lib/speakerPresentation"

export async function GET() {
  try {
    const admin = createAdminClient()
    const selectWithUpdatedAt = `speaker_id, full_name, credentials, title, bio, headshot_url, state, is_active, created_at, updated_at, seminars (seminar_id, speaker_id, department_id, category_id, status_id, title, description, scheduled_at, categories(name, color_hex), departments(name), statuses(label, color_hex)), speaker_topics(topics(title))`
    const selectWithoutUpdatedAt = `speaker_id, full_name, credentials, title, bio, headshot_url, state, is_active, created_at, seminars (seminar_id, speaker_id, department_id, category_id, status_id, title, description, scheduled_at, categories(name, color_hex), departments(name), statuses(label, color_hex)), speaker_topics(topics(title))`
    const initialSpeakerResult = await admin.from("speakers").select(selectWithUpdatedAt).order("full_name")
    let speakerData: unknown[] | null = initialSpeakerResult.data
    let speakerError = initialSpeakerResult.error
    if (speakerError?.message.includes("updated_at")) {
      const fallbackSpeakerResult = await admin.from("speakers").select(selectWithoutUpdatedAt).order("full_name")
      speakerData = fallbackSpeakerResult.data
      speakerError = fallbackSpeakerResult.error
    }
    const categories = await admin.from("categories").select("category_id, name").order("category_id")
    const error = speakerError || categories.error
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const normalized = normalizeSpeakerRecords(speakerData)
    return Response.json({ speakers: normalized.speakers, malformedSpeakerCount: normalized.malformedCount, categories: (categories.data ?? []).map((item) => item.name) }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } })
  } catch {
    return Response.json({ error: "Speaker directory is unavailable" }, { status: 500 })
  }
}
