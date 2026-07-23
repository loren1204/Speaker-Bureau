import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanText } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"
import type { RequestStatus } from "@/types/database"

const STATUSES = new Set<RequestStatus>(["new", "in_review", "contacted", "scheduled", "closed"])

export async function GET(request: Request) {
  try {
    await requireTeamMember()
    const admin = createAdminClient()
    const url = new URL(request.url)
    if (url.searchParams.get("countOnly") === "1") {
      const { count, error } = await admin.from("speaker_requests").select("id", { count: "exact", head: true }).eq("status", "new")
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ count: count ?? 0 })
    }
    const [{ data, error }, profiles, assignmentColumn] = await Promise.all([
      admin.from("speaker_requests").select("*").order("created_at", { ascending: false }).limit(250),
      admin.from("profiles").select("id, full_name").eq("role", "stakeholder").order("full_name"),
      admin.from("speaker_requests").select("assigned_user_id").limit(0),
    ])
    if (error || profiles.error) return Response.json({ error: error?.message || profiles.error?.message }, { status: 500 })
    const team = (profiles.data ?? []).map((member) => ({ ...member, email: null, avatar_url: null }))
    return Response.json({ requests: data ?? [], team, assignmentSupported: !assignmentColumn.error })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to load requests" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, profile } = await requireTeamMember()
    const body = await request.json() as Record<string, unknown>
    const id = cleanText(body.id, 80, true)
    const status = cleanText(body.status, 30, true) as RequestStatus | null
    if (!id || !status || !STATUSES.has(status)) return Response.json({ error: "A valid request and status are required" }, { status: 400 })
    const admin = createAdminClient()
    const assignedUserId = cleanText(body.assigned_user_id, 80) || null
    const update: { status: RequestStatus; notes: string | null; assigned_user_id?: string | null } = {
      status,
      notes: cleanText(body.notes, 5000) || null,
    }
    if (Object.hasOwn(body, "assigned_user_id")) update.assigned_user_id = assignedUserId

    let assignmentSupported = true
    let updateResult = await admin.from("speaker_requests").update(update).eq("id", id).select("*").single()
    if (updateResult.error?.code === "PGRST204" && updateResult.error.message.includes("assigned_user_id")) {
      assignmentSupported = false
      delete update.assigned_user_id
      updateResult = await admin.from("speaker_requests").update(update).eq("id", id).select("*").single()
    }
    const { data, error } = updateResult
    if (error) return Response.json({ error: error.message }, { status: 400 })
    await recordActivity({ actorUserId: user.id, actionType: "request_status_changed", entityType: "request", entityId: id, targetLabel: data.requester_name, description: `${profile.full_name || profile.email || "A team member"} moved ${data.requester_name}’s request to ${status.replaceAll("_", " ")}.`, metadata: { status } })
    return Response.json({ request: data, assignmentSupported })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to update request" }, { status: 500 })
  }
}
