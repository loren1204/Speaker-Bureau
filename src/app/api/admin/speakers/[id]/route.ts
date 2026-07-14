import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanEmail, cleanText } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, profile } = await requireTeamMember()
    const id = Number((await context.params).id)
    if (!Number.isSafeInteger(id)) return Response.json({ error: "Invalid speaker id" }, { status: 400 })
    const body = await request.json() as Record<string, unknown>
    const fullName = cleanText(body.full_name, 100, true)
    const email = cleanEmail(body.email)
    if (!fullName || email === null) return Response.json({ error: "A valid name and email are required" }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from("speakers").update({
      full_name: fullName,
      credentials: cleanText(body.credentials, 100) || null,
      email: email || null,
      title: cleanText(body.title, 150) || null,
      bio: cleanText(body.bio, 5000) || null,
      contact_info: cleanText(body.contact_info, 255) || null,
      is_active: body.is_active !== false,
    }).eq("speaker_id", id).select("*").single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    await recordActivity({ actorUserId: user.id, actionType: "speaker_updated", entityType: "speaker", entityId: id, targetLabel: fullName, description: `${profile.full_name || profile.email || "A team member"} updated ${fullName}.` })
    return Response.json({ speaker: data })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to update speaker" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, profile } = await requireTeamMember()
    const id = Number((await context.params).id)
    if (!Number.isSafeInteger(id)) return Response.json({ error: "Invalid speaker id" }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from("speakers").update({ is_active: false }).eq("speaker_id", id).select("full_name").single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    await recordActivity({ actorUserId: user.id, actionType: "speaker_archived", entityType: "speaker", entityId: id, targetLabel: data.full_name, description: `${profile.full_name || profile.email || "A team member"} archived ${data.full_name}.` })
    return Response.json({ success: true })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to archive speaker" }, { status: 500 })
  }
}

