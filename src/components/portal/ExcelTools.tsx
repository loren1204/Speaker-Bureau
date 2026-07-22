"use client"

import * as XLSX from "xlsx"
import { useState } from "react"
import type { Speaker } from "@/models/Speaker"
import {
  MASTER_WORKSHEET_NAME,
  classifySpeakerImportResult,
  normalizeSpeakerImportSheetName,
  parseSpeakerWorksheet,
  speakerImportPayload,
  speakerImportRowWillBeSkipped,
  type ParsedSpeakerWorksheet,
  type SpeakerImportIssue,
  type SpeakerImportResultSummary,
} from "@/lib/speakerImport"

interface Lookup { categories: { name: string }[]; departments: { name: string }[]; statuses: { label: string }[] }

const EXPORT_HEADERS = ["Speaker ID", "Full Name", "Credentials", "Email", "Contact Info", "Availability", "Photo URL", "Seminar Title", "Seminar Description", "Category", "Department", "Status"]
const IMPORT_TEMPLATE_HEADERS = ["Provider", "Credentials", "Department", "Category", "Status", "Seminars", "Description"]

function downloadWorkbook(rows: Record<string, string | number | boolean | null>[], filename: string, headers = EXPORT_HEADERS) {
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Speakers")
  XLSX.writeFile(workbook, filename)
}

function csvValue(value: string | number | boolean) {
  const text = String(value)
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

function downloadErrorReport(issues: SpeakerImportIssue[], filename: string) {
  const headers = ["Row", "Provider", "Field", "Source value", "Reason", "Row skipped"]
  const body = issues.map((item) => [item.row, item.provider, item.field, item.sourceValue, item.reason, item.willSkip ? "Yes" : "No"])
  const csv = [headers, ...body].map((row) => row.map(csvValue).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function formatImportSummary(value: SpeakerImportResultSummary) {
  return `${value.speakersMatched} speakers matched, ${value.speakersInserted} inserted, ${value.speakersUpdated} updated; ${value.seminarsMatched} seminars matched, ${value.seminarsInserted} inserted, ${value.seminarsUpdated} updated; ${value.duplicateRowsSkipped} duplicate rows skipped, ${value.invalidRows} invalid rows, ${value.databaseFailures} database failures.`
}

const resultToneClass = {
  green: "border-green-200 bg-green-50 text-green-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-900",
} as const

const wrapCell = "whitespace-normal px-3 py-2 align-top leading-5 [overflow-wrap:break-word] [word-break:normal]"

export function ExcelTools({ speakers, lookups, onImported }: { speakers: Speaker[]; lookups: Lookup; onImported: () => void }) {
  const [preview, setPreview] = useState<ParsedSpeakerWorksheet | null>(null)
  const [filename, setFilename] = useState("")
  const [selectedSheet, setSelectedSheet] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultSummary, setResultSummary] = useState<SpeakerImportResultSummary | null>(null)
  const [resultError, setResultError] = useState("")
  const [reviewResult, setReviewResult] = useState(false)
  const [showAllErrors, setShowAllErrors] = useState(false)

  function exportSpeakers() {
    const rows = speakers.flatMap((speaker) => {
      const seminars = speaker.seminars?.length ? speaker.seminars : [null]
      return seminars.map((seminar) => ({ "Speaker ID": speaker.speaker_id, "Full Name": speaker.full_name, Credentials: speaker.credentials ?? "", Email: speaker.email ?? "", "Contact Info": speaker.contact_info ?? "", Availability: speaker.is_active ? "Available" : "Limited", "Photo URL": speaker.headshot_url ?? "", "Seminar Title": seminar?.title ?? "", "Seminar Description": seminar?.description ?? "", Category: seminar?.categories?.name ?? "", Department: seminar?.department ?? seminar?.departments?.name ?? "", Status: seminar?.statuses?.label ?? "" }))
    })
    downloadWorkbook(rows, `lee-health-speakers-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  function downloadTemplate() {
    downloadWorkbook([{ Provider: "Lastname, Firstname", Credentials: "MD", Department: "Exact department or organization", Category: lookups.categories[0]?.name ?? "", Status: lookups.statuses[0]?.label ?? "Active", Seminars: "One complete seminar title", Description: "Description for this seminar" }], "lee-health-speaker-import-template.xlsx", IMPORT_TEMPLATE_HEADERS)
  }

  async function chooseFile(file?: File) {
    if (!file) return
    setError("")
    setResultSummary(null)
    setResultError("")
    setReviewResult(false)
    setPreview(null)
    setShowAllErrors(false)
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("Choose an .xlsx or .xls workbook. Apple Numbers files must first be exported as .xlsx.")
      return
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
      const masterName = workbook.SheetNames.find((name) => normalizeSpeakerImportSheetName(name) === normalizeSpeakerImportSheetName(MASTER_WORKSHEET_NAME))
      if (!masterName) throw new Error(`This workbook does not contain a “${MASTER_WORKSHEET_NAME}” worksheet. No other worksheet was read or imported.`)
      const sheet = workbook.Sheets[masterName]
      if (!sheet) throw new Error("The Master worksheet could not be read.")
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: true, raw: false })
      const parsed = parseSpeakerWorksheet(matrix, {
        categories: lookups.categories.map((item) => item.name),
        departments: lookups.departments.map((item) => item.name),
        statuses: lookups.statuses.map((item) => item.label),
      }, speakers.map((speaker) => ({
        speaker_id: speaker.speaker_id,
        full_name: speaker.full_name,
        credentials: speaker.credentials,
        seminars: speaker.seminars?.map((seminar) => ({ title: seminar.title })),
      })))
      setPreview(parsed)
      setSelectedSheet(masterName)
      setFilename(file.name)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The workbook could not be read.")
    }
  }

  async function confirmImport() {
    if (!preview || !preview.summary.validRows) {
      setError("There are no valid seminar rows to import.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: speakerImportPayload(preview.rows) }),
      })
      const result = await response.json() as { error?: string; summary?: SpeakerImportResultSummary }
      if (result.summary) {
        setResultSummary(result.summary)
        setResultError(result.error ?? "")
      }
      if (!response.ok) {
        if (result.summary) setPreview(null)
        else setError(result.error || "Import failed.")
        return
      }
      if (!result.summary) {
        setError("The import response did not include a summary.")
        return
      }
      setPreview(null)
      onImported()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.")
    } finally {
      setLoading(false)
    }
  }

  const detailedIssues = preview ? (showAllErrors ? preview.issues : preview.issues.slice(0, 10)) : []
  const resultPresentation = resultSummary ? classifySpeakerImportResult(resultSummary) : null

  return (
    <>
      <button type="button" onClick={exportSpeakers} className="h-10 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Export speakers</button>
      <label className="inline-flex h-10 cursor-pointer items-center rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Import speakers<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} /></label>
      <button type="button" onClick={downloadTemplate} className="h-10 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-4 text-sm font-semibold">Download template</button>
      {error && <p role="alert" className="basis-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {resultSummary && resultPresentation && <div role={resultPresentation.tone === "red" ? "alert" : "status"} className={`w-full min-w-0 max-w-full basis-full whitespace-normal rounded-lg border p-4 text-sm [overflow-wrap:break-word] [word-break:normal] ${resultToneClass[resultPresentation.tone]}`}>
        <p className="font-bold">{resultPresentation.title}</p>
        <p className="mt-1">{resultPresentation.message}</p>
        <p className="mt-2 text-xs leading-5">{formatImportSummary(resultSummary)}</p>
        {resultError && <p className="mt-2 text-xs font-semibold">{resultError}</p>}
        {resultPresentation.failedReviewCount > 0 && <button type="button" onClick={() => setReviewResult((value) => !value)} className="mt-3 rounded-[var(--radius-button)] border border-current/30 bg-white/70 px-3 py-2 text-xs font-bold">{reviewResult ? "Hide failed rows" : `Review ${resultPresentation.failedReviewCount} failed ${resultPresentation.failedReviewCount === 1 ? "row" : "rows"}`}</button>}
        {reviewResult && resultSummary.errors.length > 0 && <div className="mt-3 max-h-48 overflow-auto rounded border border-current/20 bg-white/70 p-3"><ul className="space-y-2 text-xs">{resultSummary.errors.slice(0, 10).map((item, index) => <li key={`${item.row}-${item.field}-${index}`}><span className="font-semibold">Row {item.row} · {item.provider || "Unknown provider"} · {item.field}:</span> {item.reason}</li>)}</ul>{resultSummary.errors.length > 10 && <p className="mt-2 font-semibold">Showing 10 of {resultSummary.errors.length} issues.</p>}<button type="button" onClick={() => downloadErrorReport(resultSummary.errors, "speaker-import-failed-rows.csv")} className="mt-3 font-bold underline">Download full CSV</button></div>}
      </div>}
      {preview && (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[var(--navy-950)]/40 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="excel-preview-title">
          <div className="my-auto flex max-h-[94vh] w-full max-w-[min(96vw,1500px)] flex-col overflow-hidden rounded-[var(--radius-card-lg)] bg-white shadow-[var(--shadow-lg)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6">
              <div className="min-w-0">
                <h2 id="excel-preview-title" className="truncate text-xl font-bold">Preview {filename}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Selected worksheet: <span className="font-semibold text-[var(--text)]">{selectedSheet}</span>. Only Master was read.</p>
                {preview.ignoredHeaders.length > 0 && <p className="mt-2 text-xs text-[var(--text-muted)]">Ignored extra {preview.ignoredHeaders.length === 1 ? "column" : "columns"}: {preview.ignoredHeaders.join(", ")}</p>}
              </div>
              <button type="button" onClick={() => setPreview(null)} className="shrink-0 text-sm font-semibold text-[var(--text-muted)]">Close</button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  ["Worksheet rows", preview.summary.totalWorksheetRows],
                  ["Unique providers", preview.summary.uniqueProviders],
                  ["Seminar rows", preview.summary.totalSeminarRows],
                  ["Valid rows", preview.summary.validRows],
                  ["Invalid rows", preview.summary.invalidRows],
                  ["Duplicate seminars", preview.summary.duplicateSeminarRows],
                  ["Departments accepted as entered", preview.summary.distinctDepartments],
                  ["Unmatched categories", preview.summary.unmatchedCategories],
                  ["Unmatched statuses", preview.summary.unmatchedStatuses],
                ].map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--canvas-subtle)] p-3"><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}
              </div>

              {preview.issues.length > 0 && (
                <section className="rounded-lg border border-[var(--border)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
                    <div><h3 className="font-bold">Validation report</h3><p className="text-sm text-[var(--text-muted)]">Repeated lookup and validation issues are grouped below.</p></div>
                    <button type="button" onClick={() => downloadErrorReport(preview.issues, "speaker-import-errors.csv")} className="h-9 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-3 text-xs font-semibold">Download CSV</button>
                  </div>
                  <div className="grid gap-4 p-4 lg:grid-cols-2">
                    <div className="max-h-56 overflow-y-auto rounded border border-[var(--border)]">
                      <ul className="divide-y divide-[var(--border)] text-sm">{preview.groupedIssues.map((item) => <li key={`${item.field}-${item.sourceValue}-${item.reason}`} className="p-3"><span className="font-semibold">{item.count} {item.count === 1 ? "row uses" : "rows use"} {item.field}</span> value <span className="font-mono text-xs">“{item.sourceValue || "blank"}”</span>. {item.reason}</li>)}</ul>
                    </div>
                    <div className="max-h-56 overflow-auto rounded border border-[var(--border)]">
                      <table className="w-full min-w-[760px] table-fixed text-left text-xs">
                        <colgroup><col className="w-[60px]" /><col className="w-[150px]" /><col className="w-[100px]" /><col className="w-[180px]" /><col className="w-[270px]" /></colgroup>
                        <thead className="sticky top-0 bg-[var(--canvas-subtle)]"><tr>{["Row", "Provider", "Field", "Source value", "Reason"].map((header) => <th key={header} className={wrapCell}>{header}</th>)}</tr></thead>
                        <tbody className="divide-y divide-[var(--border)]">{detailedIssues.map((item, index) => <tr key={`${item.row}-${item.field}-${index}`}><td className={wrapCell}>{item.row}</td><td className={wrapCell}>{item.provider || "—"}</td><td className={wrapCell}>{item.field}</td><td className={wrapCell}>{item.sourceValue || "—"}</td><td className={wrapCell}>{item.reason}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                  {preview.issues.length > 10 && <button type="button" onClick={() => setShowAllErrors((value) => !value)} className="mb-4 ml-4 text-sm font-semibold text-[var(--green-700)]">{showAllErrors ? "Show first 10 errors" : `Show all ${preview.issues.length} errors`}</button>}
                </section>
              )}

              <section>
                <h3 className="mb-3 font-bold">Provider groups</h3>
                <div className="space-y-2">{preview.groups.map((group) => {
                  const validSeminars = group.seminars.filter((row) => !speakerImportRowWillBeSkipped(row) && row.duplicateOfRow === null).length
                  return <details key={group.providerKey} className="rounded-lg border border-[var(--border)] bg-white">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4">
                      <span className="min-w-0 flex-1 font-semibold [overflow-wrap:break-word] [word-break:normal]">{group.providerName || "Missing Provider"}{group.credentials ? `, ${group.credentials}` : ""}</span>
                      <span className="text-sm text-[var(--text-muted)]">{validSeminars} of {group.seminars.length} seminars ready</span>
                      <span className="rounded-full bg-[var(--canvas-subtle)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide">{group.speakerAction}</span>
                    </summary>
                    <div className="border-t border-[var(--border)] p-4">
                      {group.warnings.length > 0 && <ul className="mb-3 space-y-1 text-sm text-amber-700">{group.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
                      <div className="w-full overflow-x-auto rounded border border-[var(--border)]">
                        <table className="w-full min-w-[1160px] table-fixed text-left text-xs">
                          <colgroup><col className="w-[64px]" /><col className="w-[300px]" /><col className="w-[180px]" /><col className="w-[180px]" /><col className="w-[120px]" /><col className="w-[260px]" /><col className="w-[220px]" /></colgroup>
                          <thead className="bg-[var(--canvas-subtle)]"><tr>{["Row", "Seminar", "Department", "Category", "Status", "Description", "Result"].map((header) => <th key={header} className={wrapCell}>{header}</th>)}</tr></thead>
                          <tbody className="divide-y divide-[var(--border)]">{group.seminars.map((row) => {
                            const skipped = speakerImportRowWillBeSkipped(row)
                            return <tr key={row.sourceRow} className={skipped ? "bg-red-50" : ""}><td className={wrapCell}>{row.sourceRow}</td><td className={wrapCell}>{row.seminarTitle || "—"}</td><td className={wrapCell}>{row.resolvedDepartment || row.department || "—"}</td><td className={wrapCell}>{row.resolvedCategory || row.category || "—"}</td><td className={wrapCell}>{row.resolvedStatus || "—"}</td><td className={wrapCell}><p title={row.seminarDescription ?? undefined} className="line-clamp-3">{row.seminarDescription || "—"}</p></td><td className={`${wrapCell} ${skipped ? "text-[var(--error)]" : row.duplicateOfRow ? "text-amber-700" : "text-[var(--green-700)]"}`}>{skipped ? "Requires review" : row.duplicateOfRow ? `Duplicate of row ${row.duplicateOfRow}; merge` : "Ready"}</td></tr>
                          })}</tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                })}</div>
              </section>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--text-muted)]">No database changes occur until you confirm. {preview.summary.validRows} seminar rows are ready.</p>
              <button type="button" disabled={loading || !preview.summary.validRows} onClick={confirmImport} className="h-11 rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Importing…" : "Confirm import"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
