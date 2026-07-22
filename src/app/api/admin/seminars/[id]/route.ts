import { createAdminClient } from "@/lib/supabase/admin"
import { authErrorResponse, requireTeamMember } from "@/lib/auth/server"
import { cleanText, optionalInteger } from "@/lib/validation"
import { recordActivity } from "@/lib/activity"
import { findOrCreateDepartment } from "@/lib/departments"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, profile } = await requireTeamMember()
    const id = Number((await context.params).id)
    const body = await request.json() as Record<string, unknown>
    const title = cleanText(body.title, 500, true)
    if (!Number.isSafeInteger(id) || !title) return Response.json({ error: "A seminar title is required" }, { status: 400 })
    const admin = createAdminClient()
    const department = await findOrCreateDepartment(admin, body.department)
    if (department.error) return Response.json({ error: `Department could not be saved: ${department.error}` }, { status: 400 })
    const { data, error } = await admin.from("seminars").update({ title, description: cleanText(body.description, 5000) || null, category_id: optionalInteger(body.category_id), department_id: department.id, status_id: optionalInteger(body.status_id), scheduled_at: cleanText(body.scheduled_at, 40) || null }).eq("seminar_id", id).select("*").single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    await recordActivity({ actorUserId: user.id, actionType: "seminar_updated", entityType: "seminar", entityId: id, targetLabel: title, description: `${profile.full_name || profile.email || "A team member"} updated seminar “${title}”.` })
    return Response.json({ seminar: data })
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Unable to update seminar" }, { status: 500 })
  }
}
