import { createAdminClient } from "@/lib/supabase/admin"
import { cleanEmail, cleanText, optionalInteger } from "@/lib/validation"

const FORMSPREE_TIMEOUT_MS = 8_000

function getFormspreeEndpoint() {
  const configuredEndpoint = process.env.FORMSPREE_ENDPOINT?.trim()
  if (!configuredEndpoint) return null

  try {
    const endpoint = new URL(configuredEndpoint)
    return endpoint.protocol === "https:" ? endpoint : null
  } catch {
    return null
  }
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown delivery error"
}

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
    if (error) {
      console.error("Speaker request database insert failed", { code: error.code, message: error.message })
      return Response.json({ error: "Your request could not be saved. Please try again." }, { status: 500 })
    }

    const endpoint = getFormspreeEndpoint()
    let delivered = false
    if (!endpoint) {
      console.error("Formspree delivery is not configured", {
        operation: "submit speaker request",
        message: "FORMSPREE_ENDPOINT must be a valid HTTPS URL",
      })
    } else {
      try {
        const formspreeResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name: requesterName, email: requesterEmail, community, preferred_speaker: speakerName, talk_title: payload.talk_title, desired_date: payload.desired_date, event_location: payload.event_location, phone: payload.requester_phone, expected_attendance: payload.expected_attendance, message: payload.message }),
          signal: AbortSignal.timeout(FORMSPREE_TIMEOUT_MS),
        })
        delivered = formspreeResponse.ok
        if (!delivered) {
          console.error("Formspree delivery returned an error", {
            hostname: endpoint.hostname,
            operation: "submit speaker request",
            status: formspreeResponse.status,
            message: formspreeResponse.statusText || "Formspree rejected the request",
          })
        }
      } catch (error) {
        const timeoutType = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)
          ? error.name
          : "network"
        console.error("Formspree delivery failed", {
          hostname: endpoint.hostname,
          operation: "submit speaker request",
          timeoutType,
          message: safeErrorMessage(error),
        })
      }
    }

    const { error: statusError } = await admin.from("speaker_requests").update({ formspree_delivery_status: delivered ? "delivered" : "failed" }).eq("id", data.id)
    if (statusError) {
      console.error("Speaker request delivery status update failed", { code: statusError.code, message: statusError.message })
    }
    if (!delivered) return Response.json({ success: true, partial: true, message: "Your request was saved, but email delivery could not be confirmed. The team can still review it in the portal." }, { status: 202 })
    return Response.json({ success: true, message: "Your request was submitted." }, { status: 201 })
  } catch (error) {
    console.error("Speaker request submission failed", { message: safeErrorMessage(error) })
    return Response.json({ error: "Your request could not be submitted. Please try again." }, { status: 500 })
  }
}
