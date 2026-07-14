export interface Seminar {
  seminar_id: number
  speaker_id?: number | null
  department_id?: number | null
  category_id?: number | null
  status_id?: number | null
  title: string
  description?: string | null
  scheduled_at?: string | null
  categories?: {
    name: string | null
    color_hex?: string | null
  } | null
  departments?: {
    name: string | null
  } | null
  statuses?: {
    label: string | null
    color_hex?: string | null
  } | null
}

export interface Speaker {
  speaker_id: number
  full_name: string
  email?: string | null
  contact_info?: string | null
  credentials?: string | null
  title?: string | null
  bio?: string | null
  headshot_url?: string | null
  state?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string | null
  seminars?: Seminar[]
  speaker_topics?: { topics: { title: string } | null }[]
  speaker_contacts?: { contact_id: number; contact: string | null }[]
}
