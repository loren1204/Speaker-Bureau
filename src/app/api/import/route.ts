import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { speakers, seminars } = await request.json()

  // 1 — Upsert speakers
  const { data: upsertedSpeakers, error: speakerError } = await supabaseAdmin
    .from("speakers")
    .upsert(speakers, { onConflict: "full_name" })
    .select("speaker_id, full_name")

  if (speakerError) {
    return NextResponse.json({ error: speakerError.message }, { status: 500 })
  }

  // 2 — Build name → speaker_id map
  const nameToId = new Map(
    upsertedSpeakers?.map((s: any) => [s.full_name, s.speaker_id]) ?? []
  )

  // 3 — Build seminar payload
  const seminarPayload = seminars
    .map((row: any) => {
      const speaker_id = nameToId.get(row.full_name)
      if (!speaker_id) return null
      return {
        speaker_id,
        title:       row.title,
        description: row.description ?? null,
      }
    })
    .filter(Boolean)

  // 4 — Deduplicate by speaker_id + title before upsert
  const seen = new Set<string>()
  const dedupedSeminars = seminarPayload.filter((s: any) => {
    const key = `${s.speaker_id}|${s.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // 5 — Upsert seminars
  const { error: seminarError } = await supabaseAdmin
    .from("seminars")
    .upsert(dedupedSeminars, { onConflict: "speaker_id,title" })

  if (seminarError) {
    return NextResponse.json({ error: seminarError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: upsertedSpeakers?.length })
}