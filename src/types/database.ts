export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface TeamProfile {
  id: string
  full_name: string | null
  email: string | null
  role: "guest" | "stakeholder"
  title: string | null
  avatar_url: string | null
  notifications_enabled: boolean
  created_at: string
  updated_at: string | null
}

export type RequestStatus = "new" | "in_review" | "contacted" | "scheduled" | "closed"

export interface SpeakerRequest {
  id: string
  requester_name: string
  requester_email: string | null
  requester_phone: string | null
  community: string
  speaker_name: string | null
  talk_title: string | null
  desired_date: string | null
  event_location: string | null
  expected_attendance: number | null
  preferred_speaker_id: number | null
  preferred_category: string | null
  message: string | null
  status: RequestStatus
  assigned_to: string | null
  assigned_user_id: string | null
  notes: string | null
  formspree_delivery_status: "pending" | "delivered" | "failed"
  created_at: string
  updated_at: string
}

export interface ActivityLogEntry {
  id: string
  actor_user_id: string | null
  action_type: string
  entity_type: string
  entity_id: string | null
  target_label: string | null
  description: string
  metadata: Json
  created_at: string
  actor?: Pick<TeamProfile, "full_name" | "avatar_url"> | null
}

