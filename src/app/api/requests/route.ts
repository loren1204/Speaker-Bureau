import { createAdminClient } from "@/lib/supabase/admin"
import { cleanEmail, cleanText, optionalInteger } from "@/lib/validation"

const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzjnzkn"

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return Response.json({ error: "Invalid request" }, { status: 400 }) }

  const requesterName = cleanText(body.requester_name, 150, true)
  const requesterEmail = cleanEmail(body.requester_email, true)
  const community = cleanText(body.community, 200, true)
  const speakerName = cleanText(body.speaker_name, 150, true)
  if (!requesterName || !requesterEmail || !community || !speakerName) {
    return Response.json({ error: "Name, email, organization, and preferred speaker are required" }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const payload = {
      requester_name: requesterName,
      requester_email: requesterEmail,
      requester_phone: cleanText(body.requester_phone, 40) || null,
      community,
      speaker_name: speakerName,
      talk_title: cleanText(body.talk_title, 500) || null,
      desired_date: cleanText(body.desired_date, 300) || null,
      event_location: cleanText(body.event_location, 300) || null,
      expected_attendance: optionalInteger(body.expected_attendance),
      message: cleanText(body.message, 5000) || null,
      status: "new",
      formspree_delivery_status: "pending",
    }
    const { data, error } = await admin.from("speaker_requests").insert(payload).select("id").single()
    if (error) return Response.json({ error: "Your request could not be saved. Please try again." }, { status: 500 })

    const endpoint = process.env.FORMSPREE_ENDPOINT || DEFAULT_FORMSPREE_ENDPOINT
    let delivered = false
    try {
      const formspreeResponse = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name: requesterName, email: requesterEmail, community, preferred_speaker: speakerName, talk_title: payload.talk_title, desired_date: payload.desired_date, event_location: payload.event_location, phone: payload.requester_phone, expected_attendance: payload.expected_attendance, message: payload.message }) })
      delivered = formspreeResponse.ok
    } catch { delivered = false }

    await admin.from("speaker_requests").update({ formspree_delivery_status: delivered ? "delivered" : "failed" }).eq("id", data.id)
    if (!delivered) return Response.json({ success: true, partial: true, message: "Your request was saved, but email delivery could not be confirmed. The team can still review it in the portal." }, { status: 202 })
    return Response.json({ success: true, message: "Your request was submitted." }, { status: 201 })
  } catch {
    return Response.json({ error: "Your request could not be submitted. Please try again." }, { status: 500 })
  }
}
