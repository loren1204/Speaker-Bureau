import type { Speaker } from "@/models/Speaker"

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

function integer(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN
  return Number.isInteger(parsed) ? parsed : null
}

function relatedRecord(value: unknown): UnknownRecord | null {
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0] : null
  return isRecord(value) ? value : null
}

function normalizeSeminar(value: unknown): NonNullable<Speaker["seminars"]>[number] | null {
  if (!isRecord(value)) return null
  const seminarId = integer(value.seminar_id)
  const title = text(value.title)
  if (seminarId === null || !title) return null

  const category = relatedRecord(value.categories)
  const department = relatedRecord(value.departments)
  const status = relatedRecord(value.statuses)

  return {
    seminar_id: seminarId,
    speaker_id: integer(value.speaker_id),
    department_id: integer(value.department_id),
    category_id: integer(value.category_id),
    status_id: integer(value.status_id),
    title,
    description: text(value.description),
    scheduled_at: text(value.scheduled_at),
    categories: category ? { name: text(category.name), color_hex: text(category.color_hex) } : null,
    departments: department ? { name: text(department.name) } : null,
    statuses: status ? { label: text(status.label), color_hex: text(status.color_hex) } : null,
  }
}

/** Convert an untrusted Supabase row into the one existing Speaker UI model. */
export function normalizeSpeakerRecord(value: unknown): Speaker | null {
  if (!isRecord(value)) return null
  const speakerId = integer(value.speaker_id)
  if (speakerId === null) return null

  const firstName = text(value.first_name)
  const lastName = text(value.last_name)
  const combinedName = [firstName, lastName].filter(Boolean).join(" ")
  const fullName = text(value.full_name) ?? (combinedName || "Unnamed speaker")
  const seminars = Array.isArray(value.seminars) ? value.seminars.map(normalizeSeminar).filter((item): item is NonNullable<typeof item> => item !== null) : []
  const topics = Array.isArray(value.speaker_topics) ? value.speaker_topics.flatMap((item) => {
    if (!isRecord(item)) return []
    const topic = relatedRecord(item.topics)
    const title = topic ? text(topic.title) : null
    return title ? [{ topics: { title } }] : []
  }) : []
  const contacts = Array.isArray(value.speaker_contacts) ? value.speaker_contacts.flatMap((item) => {
    if (!isRecord(item)) return []
    const contactId = integer(item.contact_id)
    if (contactId === null) return []
    return [{ contact_id: contactId, contact: text(item.contact) }]
  }) : []

  return {
    speaker_id: speakerId,
    full_name: fullName,
    email: text(value.email),
    contact_info: text(value.contact_info),
    credentials: text(value.credentials),
    title: text(value.title),
    bio: text(value.bio),
    headshot_url: text(value.headshot_url),
    state: text(value.state),
    is_active: typeof value.is_active === "boolean" ? value.is_active : false,
    created_at: text(value.created_at) ?? undefined,
    updated_at: text(value.updated_at),
    seminars,
    speaker_topics: topics,
    speaker_contacts: contacts,
  }
}

export function normalizeSpeakerRecords(value: unknown): { speakers: Speaker[]; malformedCount: number } {
  if (!Array.isArray(value)) return { speakers: [], malformedCount: value == null ? 0 : 1 }
  const normalized = value.map(normalizeSpeakerRecord)
  return {
    speakers: normalized.filter((speaker): speaker is Speaker => speaker !== null),
    malformedCount: normalized.filter((speaker) => speaker === null).length,
  }
}

export type CategoryStyle = { badge: string; dot: string; glow: string; tint: string }

/**
 * Single source of truth for category → visual treatment. Previously
 * duplicated verbatim between the public directory and the admin directory
 * (see FAQ: "the public speakers page has its own hardcoded color mapping
 * ... separate from color_hex ... a developer would need to add a matching
 * entry"). New categories still fall back to the neutral "Specialists"
 * treatment until a maintainer adds an explicit entry here.
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Nutrition: { badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200/70", dot: "bg-emerald-500", glow: "rgba(16,185,129,0.20)", tint: "from-emerald-50/80 to-white/70" },
  Surgery: { badge: "bg-blue-100/80 text-blue-700 border-blue-200/70", dot: "bg-blue-500", glow: "rgba(59,130,246,0.18)", tint: "from-blue-50/80 to-white/70" },
  Pharmacy: { badge: "bg-violet-100/80 text-violet-700 border-violet-200/70", dot: "bg-violet-500", glow: "rgba(139,92,246,0.18)", tint: "from-violet-50/80 to-white/70" },
  Cancer: { badge: "bg-rose-100/80 text-rose-700 border-rose-200/70", dot: "bg-rose-500", glow: "rgba(244,63,94,0.16)", tint: "from-rose-50/80 to-white/70" },
  "Integrative/Lifestyle": { badge: "bg-cyan-100/80 text-cyan-700 border-cyan-200/70", dot: "bg-cyan-500", glow: "rgba(6,182,212,0.18)", tint: "from-cyan-50/80 to-white/70" },
  Vascular: { badge: "bg-sky-100/80 text-sky-700 border-sky-200/70", dot: "bg-sky-500", glow: "rgba(14,165,233,0.18)", tint: "from-sky-50/80 to-white/70" },
  Cardiac: { badge: "bg-rose-100/80 text-rose-700 border-rose-200/70", dot: "bg-rose-500", glow: "rgba(244,63,94,0.16)", tint: "from-rose-50/80 to-white/70" },
  Orthopedics: { badge: "bg-orange-100/80 text-orange-700 border-orange-200/70", dot: "bg-amber-500", glow: "rgba(249,115,22,0.18)", tint: "from-orange-50/80 to-white/70" },
  "Orthopedics and PT": { badge: "bg-orange-100/80 text-orange-700 border-orange-200/70", dot: "bg-amber-500", glow: "rgba(249,115,22,0.18)", tint: "from-orange-50/80 to-white/70" },
  Pediatrics: { badge: "bg-pink-100/80 text-pink-700 border-pink-200/70", dot: "bg-pink-500", glow: "rgba(236,72,153,0.18)", tint: "from-pink-50/80 to-white/70" },
  "Mental Health": { badge: "bg-indigo-100/80 text-indigo-700 border-indigo-200/70", dot: "bg-indigo-500", glow: "rgba(99,102,241,0.18)", tint: "from-indigo-50/80 to-white/70" },
  Caregiving: { badge: "bg-teal-100/80 text-teal-700 border-teal-200/70", dot: "bg-teal-500", glow: "rgba(20,184,166,0.16)", tint: "from-teal-50/80 to-white/70" },
  Specialists: { badge: "bg-cyan-100/80 text-cyan-700 border-cyan-200/70", dot: "bg-cyan-500", glow: "rgba(20,184,166,0.16)", tint: "from-cyan-50/80 to-white/70" },
}

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Specialists
}

export function formatCategoryLabel(category: string): string {
  if (category === "Integrative/Lifestyle") return "Integrative"
  if (category === "Orthopedics and PT") return "Orthopedics"
  return category
}

export function getFirstSeminar(speaker: Partial<Speaker>) {
  return speaker.seminars?.[0]
}

export function getCategoryName(speaker: Partial<Speaker>): string {
  return getFirstSeminar(speaker)?.categories?.name ?? "Specialists"
}

export function getDepartmentName(speaker: Partial<Speaker>): string {
  return getFirstSeminar(speaker)?.departments?.name ?? ""
}

export function getStatusName(speaker: Partial<Speaker>): string {
  return getFirstSeminar(speaker)?.statuses?.label ?? ""
}

export function getSeminarTitles(speaker: Partial<Speaker>): string[] {
  return speaker.seminars?.map((seminar) => seminar.title).filter(Boolean) ?? []
}

export function getSpeakerDescription(speaker: Partial<Speaker>): string {
  return speaker.bio ?? getFirstSeminar(speaker)?.description ?? ""
}

/** One representative seminar/topic title — cards show a single clear line, not a cluttered tag row. */
export function getPrimaryTopic(speaker: Partial<Speaker>): string | null {
  const seminarTitle = getFirstSeminar(speaker)?.title
  if (seminarTitle) return seminarTitle
  const topicTitle = speaker.speaker_topics?.[0]?.topics?.title
  return topicTitle ?? null
}

export function getAdditionalTopicCount(speaker: Partial<Speaker>): number {
  const seminarCount = speaker.seminars?.length ?? 0
  const topicCount = speaker.speaker_topics?.length ?? 0
  const total = seminarCount + topicCount
  return Math.max(total - 1, 0)
}

export function getSpeakerPhoto(speaker: Partial<Speaker>): string | null {
  const record = speaker as Partial<Speaker> & Record<string, unknown>
  const photo = record.headshot_url || record.photo_url || record.photoUrl || record.image_url || record.profile_image
  return typeof photo === "string" && photo.length > 0 ? photo : null
}

export function isSpeakerAvailable(speaker: Partial<Speaker>): boolean {
  return speaker.is_active ?? true
}
