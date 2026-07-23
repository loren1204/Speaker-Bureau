import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { recordActivity } from "@/lib/activity"

const MIME_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const AVATAR_BUCKET = "team-avatars"

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const file = (await request.formData()).get("avatar")
    if (!(file instanceof File)) return Response.json({ error: "Choose an image" }, { status: 400 })
    const extension = MIME_EXTENSIONS[file.type]
    if (!extension) return Response.json({ error: "Use a JPEG, PNG, or WebP image" }, { status: 415 })
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Images must be 5 MB or smaller" }, { status: 413 })
    const admin = createAdminClient()
    const path = `${user.id}/avatar.${extension}`
    const { error: uploadError } = await admin.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" })
    if (uploadError) {
      const missingBucket = uploadError.message.toLowerCase().includes("bucket") && uploadError.message.toLowerCase().includes("not found")
      return Response.json({
        error: missingBucket ? "Team profile photo storage is not configured. Apply the team-avatar storage migration." : uploadError.message,
        code: missingBucket ? "TEAM_AVATAR_BUCKET_MISSING" : null,
      }, { status: missingBucket ? 503 : 400 })
    }
    const { data: { publicUrl } } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    const avatarUrl = `${publicUrl}?v=${Date.now()}`
    const { error } = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
    if (error) {
      const missingColumn = error.code === "PGRST204" && error.message.includes("avatar_url")
      return Response.json({
        error: missingColumn ? "Team profile photos are not enabled in the profile schema. Apply the team-avatar storage migration." : error.message,
        code: missingColumn ? "PROFILE_AVATAR_COLUMN_MISSING" : error.code,
      }, { status: missingColumn ? 503 : 400 })
    }
    await recordActivity({ actorUserId: user.id, actionType: "team_profile_updated", entityType: "profile", entityId: user.id, targetLabel: profile.full_name, description: `${profile.full_name || profile.email || "A team member"} updated their profile photo.` })
    return Response.json({ avatar_url: avatarUrl })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to upload avatar" }, { status: 500 })
  }
}
