export interface Seminar {
  seminar_id: number
  title: string
  description?: string | null
  scheduled_at?: string | null
  categories?: {
    name: string
    color_hex: string
  }
  departments?: {
    name: string
  }
  statuses?: {
    label: string
    color_hex: string
  }
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
  seminars?: Seminar[]
  speaker_topics?: { topics: { title: string } }[]
  speaker_contacts?: { contact_id: number; contact: string }[]
}