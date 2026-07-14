export function cleanText(value: unknown, maxLength: number, required = false) {
  if (typeof value !== "string") return required ? null : ""
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength)
  return required && !cleaned ? null : cleaned
}

export function cleanEmail(value: unknown, required = false) {
  const email = cleanText(value, 254, required)
  if (email === null || (!email && required)) return null
  if (!email) return ""
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function optionalInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isSafeInteger(number) && number >= 0 ? number : null
}

