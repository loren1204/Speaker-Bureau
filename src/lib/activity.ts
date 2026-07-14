import "server-only"
import type { Json } from "@/types/database"
import { createAdminClient } from "@/lib/supabase/admin"

interface ActivityInput {
  actorUserId: string
  actionType: string
  entityType: string
  entityId?: string | number | null
  targetLabel?: string | null
  description: string
  metadata?: Json
}

export async function recordActivity(input: ActivityInput) {
  const admin = createAdminClient()
  const { error } = await admin.from("activity_log").insert({
    actor_user_id: input.actorUserId,
    action_type: input.actionType,
    entity_type: input.entityType,
    entity_id: input.entityId == null ? null : String(input.entityId),
    target_label: input.targetLabel ?? null,
    description: input.description,
    metadata: input.metadata ?? {},
  })
  if (error) console.error("Unable to record activity", error.message)
}
