import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { TeamProfile } from "@/types/database"

export class AuthenticationError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message)
  }
}

export async function requireTeamMember() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new AuthenticationError(401, "Sign in required")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "stakeholder") {
    throw new AuthenticationError(403, "Team access is required")
  }

  const teamProfile: TeamProfile = {
    id: profile.id,
    full_name: profile.full_name,
    email: user.email ?? null,
    role: "stakeholder",
    title: null,
    avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    notifications_enabled: true,
    created_at: profile.created_at,
    updated_at: null,
  }

  return { user, profile: teamProfile, supabase }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthenticationError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  return null
}
