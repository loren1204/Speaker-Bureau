import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { recordActivity } from "@/lib/activity"

const MIME_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, profile } = await requireTeamMember()
    const speakerId = Number((await context.params).id)
    const formData = await request.formData()
    const file = formData.get("photo")
    if (!Number.isSafeInteger(speakerId) || !(file instanceof File)) return Response.json({ error: "A photo is required" }, { status: 400 })
    const extension = MIME_EXTENSIONS[file.type]
    if (!extension) return Response.json({ error: "Use a JPEG, PNG, or WebP image" }, { status: 415 })
    if (file.size > MAX_SIZE) return Response.json({ error: "Photos must be 5 MB or smaller" }, { status: 413 })

    const admin = createAdminClient()
    const path = `${speakerId}/profile.${extension}`
    const { error: uploadError } = await admin.storage.from("speaker-photos").upload(path, file, { contentType: file.type, upsert: true, cacheControl: "3600" })
    if (uploadError) return Response.json({ error: uploadError.message }, { status: 400 })
    const { data: { publicUrl } } = admin.storage.from("speaker-photos").getPublicUrl(path)
    const stableUrl = `${publicUrl}?v=${Date.now()}`
    const { data, error } = await admin.from("speakers").update({ headshot_url: stableUrl }).eq("speaker_id", speakerId).select("full_name, headshot_url").single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    await recordActivity({ actorUserId: user.id, actionType: "speaker_photo_changed", entityType: "speaker", entityId: speakerId, targetLabel: data.full_name, description: `${profile.full_name || profile.email || "A team member"} updated the photo for ${data.full_name}.` })
    return Response.json({ headshot_url: data.headshot_url })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to upload photo" }, { status: 500 })
  }
}
