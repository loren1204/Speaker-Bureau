import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"

export async function GET(request: Request) {
  try {
    await requireTeamMember()
    const url = new URL(request.url)
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0)
    const limit = 30
    const admin = createAdminClient()
    const [{ data, error }, profiles] = await Promise.all([
      admin.from("activity_log").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1),
      admin.from("profiles").select("id, full_name, avatar_url"),
    ])
    if (error || profiles.error) return Response.json({ error: error?.message || profiles.error?.message }, { status: 500 })
    const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.id, profile]))
    const entries = (data ?? []).map((entry) => ({ ...entry, actor: entry.actor_user_id ? profileMap.get(entry.actor_user_id) ?? null : null }))
    return Response.json({ entries, hasMore: entries.length === limit })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to load activity" }, { status: 500 })
  }
}

