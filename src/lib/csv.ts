import Papa from "papaparse"
import * as XLSX from "xlsx"
import type { Speaker, Seminar } from "@/models/Speaker"

export function parseCsv(file: File): Promise<Partial<Speaker>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/ /g, "_"),
      complete: (results) => {
        resolve(results.data.map((row) => mapRowToSpeaker(row)))
      },
      error: (error) => reject(error),
    })
  })
}

export async function parseExcel(file: File): Promise<Partial<Speaker>[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)
  return rows.map((row) => mapRowToSpeaker(row))
}

export function exportSpeakersCsv(speakers: Speaker[]) {
  const csv = Papa.unparse(speakers.map(s => ({
    full_name: s.full_name,
    credentials: s.credentials,
    email: s.email,
    contact_info: s.contact_info,
    is_active: s.is_active,
  })))
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `speakers_bureau_${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function mapRowToSpeaker(row: Record<string, string>): Partial<Speaker> {
  const get = (...keys: string[]): string | null => {
    for (const key of keys) {
      const val = row[key] ?? row[key.toLowerCase()] ?? row[key.charAt(0).toUpperCase() + key.slice(1)]
      if (val !== undefined && val !== "") return String(val)
    }
    return null
  }

  const seminarTitle    = get("seminars", "seminar", "Seminars")
  const categoryName    = get("category", "Category")
  const departmentName  = get("department", "Department")
  const statusLabel     = get("status", "Status")
  const description     = get("description", "Description")

  const seminars: Seminar[] = seminarTitle
    ? [{
        seminar_id:  0,
        title:       seminarTitle,
        description: description ?? undefined,
        categories:  categoryName   ? { name: categoryName,   color_hex: "#cccccc" } : undefined,
        departments: departmentName ? { name: departmentName }                       : undefined,
        statuses:    statusLabel    ? { label: statusLabel,   color_hex: "#cccccc" } : undefined,
      }]
    : []

  return {
    full_name:        get("provider", "full_name", "Provider", "name") ?? "",
    credentials:      get("credentials", "Credentials"),
    email:            get("email", "Email"),
    contact_info:     get("contacts", "Contacts", "contact", "phone", "contact_info"),
    headshot_url:     get("image", "Image", "headshot_url", "photo"),
    is_active:        (statusLabel ?? "active").toLowerCase() === "active",
    seminars,
    speaker_topics:   [],
    speaker_contacts: [],
  }
}