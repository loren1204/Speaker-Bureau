/**
 * Canonical speaker-name presentation.
 *
 * The `speakers.full_name` column is a single free-text field. The CSV/Excel
 * import pipeline (see src/lib/csv.ts + the admin FAQ) instructs data entry
 * as "Lastname, Firstname", and existing detail-page code already assumes a
 * comma means an inverted name — so a comma is the one reliable signal we
 * have for "this value is stored last-name-first" without risking a false
 * split on names that are simply already "First Last" (which never contain
 * a comma). We only ever transform for *display*; the stored value is never
 * rewritten.
 */

function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ")
}

/** "Anderson, Joseph" -> "Joseph Anderson". "Joseph Anderson" -> unchanged. */
export function formatSpeakerName(fullName?: string | null): string {
  if (!fullName) return "Lee Health Speaker"
  const cleaned = collapseWhitespace(fullName)
  if (!cleaned) return "Lee Health Speaker"

  const commaIndex = cleaned.indexOf(",")
  if (commaIndex === -1) return cleaned

  const last = cleaned.slice(0, commaIndex).trim()
  const rest = cleaned.slice(commaIndex + 1).trim()
  if (!last || !rest) return cleaned

  return collapseWhitespace(`${rest} ${last}`)
}

/** Stable last-name-first key for sorting, independent of display format. */
export function getSpeakerSortKey(fullName?: string | null): string {
  if (!fullName) return ""
  const cleaned = collapseWhitespace(fullName)
  if (!cleaned) return ""

  const commaIndex = cleaned.indexOf(",")
  if (commaIndex !== -1) return cleaned.toLowerCase()

  const parts = cleaned.split(" ")
  if (parts.length < 2) return cleaned.toLowerCase()

  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(" ")
  return `${last} ${rest}`.toLowerCase()
}

/** Up to 2 uppercase initials, derived from the display-formatted name. */
export function getSpeakerInitials(fullName?: string | null): string {
  const display = formatSpeakerName(fullName)
  if (display === "Lee Health Speaker") return "LH"

  const parts = display.split(" ").filter(Boolean)
  if (parts.length === 0) return "LH"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  const first = parts[0][0] ?? ""
  const last = parts[parts.length - 1][0] ?? ""
  return `${first}${last}`.toUpperCase()
}
