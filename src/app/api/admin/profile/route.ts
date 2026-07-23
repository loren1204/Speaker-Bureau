import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanText } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"

export async function PATCH(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const body = await request.json() as Record<string, unknown>
    const displayName = cleanText(body.full_name, 150, true)
    if (!displayName) return Response.json({ error: "Display name is required" }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from("profiles").update({
      full_name: displayName,
      title: cleanText(body.title, 150) || null,
      notifications_enabled: body.notifications_enabled !== false,
    }).eq("id", user.id).select("*").single()
    if (error) {
      const missingPreferences = error.code === "PGRST204" && ["title", "notifications_enabled"].some((column) => error.message.includes(column))
      return Response.json({
        error: missingPreferences ? "Team profile preferences are not enabled in the database. Apply the profile-preferences migration." : error.message,
        code: missingPreferences ? "PROFILE_PREFERENCES_MISSING" : error.code,
      }, { status: missingPreferences ? 503 : 400 })
    }
    await recordActivity({ actorUserId: user.id, actionType: "team_profile_updated", entityType: "profile", entityId: user.id, targetLabel: displayName, description: `${profile.full_name || profile.email || "A team member"} updated their team profile.` })
    return Response.json({ profile: data })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to update profile" }, { status: 500 })
  }
}
