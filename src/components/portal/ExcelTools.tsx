"use client"

import * as XLSX from "xlsx"
import { useState } from "react"
import type { Speaker } from "@/models/Speaker"

interface Lookup { categories: { name: string }[]; departments: { name: string }[]; statuses: { label: string }[] }
interface ImportRow { speaker_id: number | null; full_name: string; credentials: string; email: string; contact_info: string; is_active: string; headshot_url: string; seminar_title: string; seminar_description: string; category: string; department: string; status: string; errors: string[] }

const HEADERS = ["Speaker ID", "Full Name", "Credentials", "Email", "Contact Info", "Availability", "Photo URL", "Seminar Title", "Seminar Description", "Category", "Department", "Status"]

function downloadWorkbook(rows: Record<string, string | number | boolean | null>[], filename: string) {
  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Speakers")
  XLSX.writeFile(workbook, filename)
}

export function ExcelTools({ speakers, lookups, onImported }: { speakers: Speaker[]; lookups: Lookup; onImported: () => void }) {
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [filename, setFilename] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")

  function exportSpeakers() {
    const rows = speakers.flatMap((speaker) => {
      const seminars = speaker.seminars?.length ? speaker.seminars : [null]
      return seminars.map((seminar) => ({ "Speaker ID": speaker.speaker_id, "Full Name": speaker.full_name, Credentials: speaker.credentials ?? "", Email: speaker.email ?? "", "Contact Info": speaker.contact_info ?? "", Availability: speaker.is_active ? "Available" : "Limited", "Photo URL": speaker.headshot_url ?? "", "Seminar Title": seminar?.title ?? "", "Seminar Description": seminar?.description ?? "", Category: seminar?.categories?.name ?? "", Department: seminar?.departments?.name ?? "", Status: seminar?.statuses?.label ?? "" }))
    })
    downloadWorkbook(rows, `lee-health-speakers-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  function downloadTemplate() {
    downloadWorkbook([{ "Speaker ID": "", "Full Name": "Lastname, Firstname", Credentials: "MD", Email: "speaker@example.org", "Contact Info": "", Availability: "Available", "Photo URL": "", "Seminar Title": "Example seminar", "Seminar Description": "", Category: lookups.categories[0]?.name ?? "", Department: lookups.departments[0]?.name ?? "", Status: lookups.statuses[0]?.label ?? "Active" }], "lee-health-speaker-import-template.xlsx")
  }

  async function chooseFile(file?: File) {
    if (!file) return
    setError(""); setSummary("")
    if (!/\.(xlsx|xls)$/i.test(file.name)) { setError("Choose an .xlsx or .xls workbook."); return }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
      if (!raw.length) throw new Error("The workbook does not contain any data rows.")
      const keys = Object.keys(raw[0])
      if (!keys.includes("Full Name")) throw new Error("The workbook needs a “Full Name” column. Download the template for the expected columns.")
      const categoryNames = new Set(lookups.categories.map((item) => item.name.toLowerCase()))
      const departmentNames = new Set(lookups.departments.map((item) => item.name.toLowerCase()))
      const statusNames = new Set(lookups.statuses.map((item) => item.label.toLowerCase()))
      const rows = raw.map((row) => {
        const value = (key: string) => String(row[key] ?? "").trim()
        const errors: string[] = []
        if (!value("Full Name")) errors.push("Full Name is required")
        if (value("Email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("Email"))) errors.push("Email is invalid")
        if (value("Category") && !categoryNames.has(value("Category").toLowerCase())) errors.push(`Unknown category “${value("Category")}”`)
        if (value("Department") && !departmentNames.has(value("Department").toLowerCase())) errors.push(`Unknown department “${value("Department")}”`)
        if (value("Status") && !statusNames.has(value("Status").toLowerCase())) errors.push(`Unknown status “${value("Status")}”`)
        return { speaker_id: value("Speaker ID") ? Number(value("Speaker ID")) : null, full_name: value("Full Name"), credentials: value("Credentials"), email: value("Email"), contact_info: value("Contact Info"), is_active: value("Availability"), headshot_url: value("Photo URL"), seminar_title: value("Seminar Title"), seminar_description: value("Seminar Description"), category: value("Category"), department: value("Department"), status: value("Status"), errors }
      })
      setPreview(rows); setFilename(file.name)
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The workbook could not be read.") }
  }

  async function confirmImport() {
    const valid = preview.filter((row) => !row.errors.length)
    if (!valid.length) { setError("There are no valid rows to import."); return }
    setLoading(true); setError("")
    const response = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: valid.map(({ errors: _errors, ...row }) => row) }) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Import failed.")
    else { const value = result.summary; setSummary(`${value.inserted} inserted, ${value.updated} updated, ${preview.length - valid.length} skipped in preview, and ${value.failed} failed during import.`); setPreview([]); onImported() }
    setLoading(false)
  }

  return (
    <>
      <button type="button" onClick={exportSpeakers} className="h-10 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Export speakers</button>
      <label className="inline-flex h-10 cursor-pointer items-center rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Import speakers<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} /></label>
      <button type="button" onClick={downloadTemplate} className="h-10 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Download template</button>
      {error && <p role="alert" className="basis-full text-sm text-[var(--error)]">{error}</p>}
      {summary && <p role="status" className="basis-full text-sm text-[var(--green-700)]">Import complete: {summary}</p>}
      {preview.length > 0 && <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[var(--navy-950)]/40 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="excel-preview-title"><div className="my-auto max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[var(--radius-card-lg)] bg-white shadow-[var(--shadow-lg)]"><div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6"><div><h2 id="excel-preview-title" className="text-xl font-bold">Preview {filename}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Review row errors before confirming. Invalid rows will be skipped.</p></div><button type="button" onClick={() => setPreview([])} className="text-sm font-semibold text-[var(--text-muted)]">Close</button></div><div className="max-h-[60vh] overflow-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="sticky top-0 bg-[var(--canvas-subtle)]"><tr>{["Row", "Full Name", "Email", "Seminar", "Category", "Result"].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{preview.map((row, index) => <tr key={index} className={row.errors.length ? "bg-red-50" : ""}><td className="px-4 py-3">{index + 2}</td><td className="max-w-[240px] px-4 py-3 [overflow-wrap:anywhere]">{row.full_name}</td><td className="max-w-[240px] px-4 py-3 [overflow-wrap:anywhere]">{row.email || "—"}</td><td className="max-w-[260px] px-4 py-3">{row.seminar_title || "—"}</td><td className="px-4 py-3">{row.category || "—"}</td><td className={`px-4 py-3 font-medium ${row.errors.length ? "text-[var(--error)]" : "text-[var(--green-700)]"}`}>{row.errors.join("; ") || "Ready"}</td></tr>)}</tbody></table></div><div className="flex flex-col gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[var(--text-muted)]">{preview.filter((row) => !row.errors.length).length} of {preview.length} rows ready</p><button type="button" disabled={loading || !preview.some((row) => !row.errors.length)} onClick={confirmImport} className="h-11 rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Importing…" : "Confirm import"}</button></div></div></div>}
    </>
  )
}
