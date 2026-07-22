export const MASTER_WORKSHEET_NAME = "Master"

export const SPEAKER_IMPORT_HEADER_MAP = {
  provider: "providerName",
  credentials: "credentials",
  department: "department",
  category: "category",
  status: "status",
  seminars: "seminarTitle",
  description: "seminarDescription",
} as const

export const REQUIRED_SPEAKER_IMPORT_COLUMNS = ["Provider", "Department", "Category", "Seminars"] as const
export const OPTIONAL_SPEAKER_IMPORT_COLUMNS = ["Credentials", "Status", "Description"] as const

type ImportField = (typeof SPEAKER_IMPORT_HEADER_MAP)[keyof typeof SPEAKER_IMPORT_HEADER_MAP]
type LookupField = "category" | "status"

export interface SpeakerImportLookups {
  categories: string[]
  departments: string[]
  statuses: string[]
}

export interface SpeakerImportExistingSpeaker {
  speaker_id: number
  full_name: string
  credentials?: string | null
  seminars?: { title: string }[]
}

export interface SpeakerImportPayloadRow {
  sourceRow: number
  providerName: string
  credentials: string | null
  department: string
  category: string
  status: string | null
  seminarTitle: string
  seminarDescription: string | null
}

export interface SpeakerImportIssue {
  row: number
  provider: string
  field: string
  sourceValue: string
  reason: string
  willSkip: boolean
}

export interface SpeakerImportRow extends SpeakerImportPayloadRow {
  providerKey: string
  resolvedDepartment: string | null
  resolvedCategory: string | null
  resolvedStatus: string | null
  duplicateOfRow: number | null
  issues: SpeakerImportIssue[]
}

export type SpeakerImportSpeakerAction = "matched" | "updated" | "inserted" | "skipped"

export interface SpeakerImportGroup {
  providerKey: string
  providerName: string
  credentials: string | null
  speakerId: number | null
  speakerAction: SpeakerImportSpeakerAction
  existingSeminarTitles: string[]
  seminars: SpeakerImportRow[]
  warnings: string[]
}

export interface SpeakerImportGroupedIssue {
  field: string
  sourceValue: string
  reason: string
  willSkip: boolean
  count: number
  rows: number[]
}

export interface SpeakerImportSummary {
  totalWorksheetRows: number
  uniqueProviders: number
  totalSeminarRows: number
  validRows: number
  invalidRows: number
  duplicateSeminarRows: number
  distinctDepartments: number
  unmatchedCategories: number
  unmatchedStatuses: number
}

export interface SpeakerImportResultSummary {
  speakersMatched: number
  speakersInserted: number
  speakersUpdated: number
  seminarsMatched: number
  seminarsInserted: number
  seminarsUpdated: number
  duplicateRowsSkipped: number
  invalidRows: number
  databaseFailures: number
  validCandidateRows: number
  errors: SpeakerImportIssue[]
}

export type SpeakerImportResultTone = "green" | "blue" | "amber" | "red"

export interface SpeakerImportResultPresentation {
  tone: SpeakerImportResultTone
  title: string
  message: string
  failedReviewCount: number
}

export interface ParsedSpeakerWorksheet {
  rows: SpeakerImportRow[]
  groups: SpeakerImportGroup[]
  issues: SpeakerImportIssue[]
  groupedIssues: SpeakerImportGroupedIssue[]
  ignoredHeaders: string[]
  summary: SpeakerImportSummary
}

const DISPLAY_NAMES: Record<ImportField, string> = {
  providerName: "Provider",
  credentials: "Credentials",
  department: "Department",
  category: "Category",
  status: "Status",
  seminarTitle: "Seminars",
  seminarDescription: "Description",
}

const MAX_LENGTHS: Partial<Record<ImportField, number>> = {
  providerName: 100,
  credentials: 100,
  department: 100,
  category: 100,
  status: 50,
  seminarTitle: 500,
  seminarDescription: 5000,
}

const LOOKUP_ALIASES: Record<LookupField, Record<string, string>> = {
  category: {
    "integrative&lifestyle&mental": "Integrative/Lifestyle",
    "integrative,lifestyle,mental": "Integrative/Lifestyle",
    specialist: "Specialists",
  },
  status: {},
}

function displayText(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).replace(/\u00a0/g, " ").trim()
}

export function normalizeSpeakerImportKey(value: unknown) {
  return displayText(value).replace(/\s+/g, " ").toLocaleLowerCase()
}

export function normalizeSpeakerImportHeader(value: unknown) {
  return normalizeSpeakerImportKey(value)
}

export function normalizeSpeakerImportSheetName(value: unknown) {
  return normalizeSpeakerImportKey(value)
}

function nullableText(value: unknown) {
  return displayText(value) || null
}

function createIssue(
  row: Pick<SpeakerImportPayloadRow, "sourceRow" | "providerName">,
  field: string,
  sourceValue: string,
  reason: string,
  willSkip = true,
): SpeakerImportIssue {
  return { row: row.sourceRow, provider: row.providerName, field, sourceValue, reason, willSkip }
}

function lookupValues(field: LookupField, lookups: SpeakerImportLookups) {
  if (field === "category") return lookups.categories
  return lookups.statuses
}

function resolveLookup(
  row: SpeakerImportPayloadRow,
  field: LookupField,
  value: string | null,
  lookups: SpeakerImportLookups,
) {
  if (!value) return { value: null, issue: null }
  const allowed = lookupValues(field, lookups)
  const key = normalizeSpeakerImportKey(value)
  const exact = allowed.find((item) => normalizeSpeakerImportKey(item) === key)
  if (exact) return { value: exact, issue: null }

  const aliasTarget = LOOKUP_ALIASES[field][key]
  const alias = aliasTarget
    ? allowed.find((item) => normalizeSpeakerImportKey(item) === normalizeSpeakerImportKey(aliasTarget))
    : undefined
  if (alias) {
    return {
      value: alias,
      issue: createIssue(row, DISPLAY_NAMES[field], value, `Mapped to current lookup value “${alias}”.`, false),
    }
  }

  return {
    value: null,
    issue: createIssue(row, DISPLAY_NAMES[field], value, `No safe match exists in the current ${DISPLAY_NAMES[field].toLowerCase()} lookup.`),
  }
}

function normalizeSourceRow(value: unknown, fallbackRow: number): SpeakerImportPayloadRow {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {}
  const parsedRow = Number(input.sourceRow)
  const sourceRow = Number.isSafeInteger(parsedRow) && parsedRow >= 2 ? parsedRow : fallbackRow
  return {
    sourceRow,
    providerName: displayText(input.providerName),
    credentials: nullableText(input.credentials),
    department: displayText(input.department),
    category: displayText(input.category),
    status: nullableText(input.status),
    seminarTitle: displayText(input.seminarTitle),
    seminarDescription: nullableText(input.seminarDescription),
  }
}

function validateAndResolveRow(source: SpeakerImportPayloadRow, lookups: SpeakerImportLookups): SpeakerImportRow {
  const issues: SpeakerImportIssue[] = []
  const required: [ImportField, string][] = [
    ["providerName", source.providerName],
    ["department", source.department],
    ["category", source.category],
    ["seminarTitle", source.seminarTitle],
  ]
  for (const [field, value] of required) {
    if (!value) issues.push(createIssue(source, DISPLAY_NAMES[field], value, `${DISPLAY_NAMES[field]} is required.`))
  }

  for (const [field, maxLength] of Object.entries(MAX_LENGTHS) as [ImportField, number][]) {
    const value = source[field]
    if (typeof value === "string" && value.length > maxLength) {
      issues.push(createIssue(source, DISPLAY_NAMES[field], value, `Must be ${maxLength} characters or fewer.`))
    }
  }

  const category = resolveLookup(source, "category", source.category || null, lookups)
  const status = resolveLookup(source, "status", source.status, lookups)
  for (const result of [category, status]) if (result.issue) issues.push(result.issue)

  return {
    ...source,
    providerKey: normalizeSpeakerImportKey(source.providerName),
    resolvedDepartment: source.department || null,
    resolvedCategory: category.value,
    resolvedStatus: status.value,
    duplicateOfRow: null,
    issues,
  }
}

function groupIssues(issues: SpeakerImportIssue[]) {
  const grouped = new Map<string, SpeakerImportGroupedIssue>()
  for (const item of issues) {
    const key = [item.field, normalizeSpeakerImportKey(item.sourceValue), item.reason, item.willSkip].join("|")
    const current = grouped.get(key)
    if (current) {
      current.count += 1
      current.rows.push(item.row)
    } else {
      grouped.set(key, {
        field: item.field,
        sourceValue: item.sourceValue,
        reason: item.reason,
        willSkip: item.willSkip,
        count: 1,
        rows: [item.row],
      })
    }
  }
  return [...grouped.values()].sort((a, b) => b.count - a.count || a.rows[0] - b.rows[0])
}

function buildGroups(rows: SpeakerImportRow[], existingSpeakers: SpeakerImportExistingSpeaker[]) {
  const byProvider = new Map<string, SpeakerImportRow[]>()
  for (const row of rows) {
    const groupKey = row.providerKey || `__invalid-row-${row.sourceRow}`
    const group = byProvider.get(groupKey) ?? []
    group.push(row)
    byProvider.set(groupKey, group)
  }

  const existingByName = new Map<string, SpeakerImportExistingSpeaker[]>()
  for (const speaker of existingSpeakers) {
    const key = normalizeSpeakerImportKey(speaker.full_name)
    const matches = existingByName.get(key) ?? []
    matches.push(speaker)
    existingByName.set(key, matches)
  }

  return [...byProvider.entries()].map(([providerKey, seminars]): SpeakerImportGroup => {
    const warnings: string[] = []
    const credentials = seminars.find((row) => row.credentials)?.credentials ?? null
    const credentialKeys = new Set(seminars.flatMap((row) => row.credentials ? [normalizeSpeakerImportKey(row.credentials)] : []))
    if (credentialKeys.size > 1) warnings.push("Conflicting nonblank credentials were found; the first nonblank value will be used.")

    const matches = providerKey.startsWith("__invalid-row-") ? [] : existingByName.get(providerKey) ?? []
    if (matches.length > 1) {
      const reason = "More than one existing speaker has this normalized full name; this provider requires review."
      warnings.push(reason)
      for (const row of seminars) {
        row.issues.push(createIssue(row, "Provider", row.providerName, reason))
      }
      return {
        providerKey,
        providerName: seminars[0]?.providerName ?? "",
        credentials,
        speakerId: null,
        speakerAction: "skipped",
        existingSeminarTitles: [],
        seminars,
        warnings,
      }
    }

    const existing = matches[0]
    if (existing) warnings.push("Matched by normalized full name because the workbook does not contain a stable speaker ID.")
    const credentialsChanged = Boolean(
      existing && credentials && normalizeSpeakerImportKey(credentials) !== normalizeSpeakerImportKey(existing.credentials),
    )
    return {
      providerKey,
      providerName: seminars[0]?.providerName ?? "",
      credentials,
      speakerId: existing?.speaker_id ?? null,
      speakerAction: existing ? (credentialsChanged ? "updated" : "matched") : "inserted",
      existingSeminarTitles: existing?.seminars?.map((seminar) => seminar.title) ?? [],
      seminars,
      warnings,
    }
  })
}

export function buildSpeakerImportPreview(
  values: unknown[],
  lookups: SpeakerImportLookups,
  existingSpeakers: SpeakerImportExistingSpeaker[] = [],
  ignoredHeaders: string[] = [],
): ParsedSpeakerWorksheet {
  const rows = values.map((value, index) => validateAndResolveRow(normalizeSourceRow(value, index + 2), lookups))
  const duplicateKeys = new Map<string, number>()
  for (const row of rows) {
    if (!row.providerKey || !row.seminarTitle) continue
    const key = `${row.providerKey}|${normalizeSpeakerImportKey(row.seminarTitle)}`
    const firstRow = duplicateKeys.get(key)
    if (firstRow) {
      row.duplicateOfRow = firstRow
      row.issues.push(createIssue(
        row,
        "Seminars",
        row.seminarTitle,
        `Duplicates row ${firstRow} for the same normalized Provider and seminar title; it will be merged.`,
        false,
      ))
    } else {
      duplicateKeys.set(key, row.sourceRow)
    }
  }

  const groups = buildGroups(rows, existingSpeakers)
  const issues = rows.flatMap((row) => row.issues)
  const fatalRows = new Set(issues.filter((item) => item.willSkip).map((item) => item.row))
  const unmatched = (field: string) => new Set(issues
    .filter((item) => item.willSkip && item.field === field && item.sourceValue)
    .map((item) => normalizeSpeakerImportKey(item.sourceValue))).size
  const uniqueProviders = new Set(rows.flatMap((row) => row.providerKey ? [row.providerKey] : [])).size
  const duplicateSeminarRows = rows.filter((row) => row.duplicateOfRow !== null).length

  return {
    rows,
    groups,
    issues,
    groupedIssues: groupIssues(issues),
    ignoredHeaders,
    summary: {
      totalWorksheetRows: rows.length,
      uniqueProviders,
      totalSeminarRows: rows.length,
      validRows: rows.filter((row) => !fatalRows.has(row.sourceRow) && row.duplicateOfRow === null).length,
      invalidRows: fatalRows.size,
      duplicateSeminarRows,
      distinctDepartments: new Set(rows.flatMap((row) => row.department ? [normalizeSpeakerImportKey(row.department)] : [])).size,
      unmatchedCategories: unmatched("Category"),
      unmatchedStatuses: unmatched("Status"),
    },
  }
}

export function parseSpeakerWorksheet(
  matrix: unknown[][],
  lookups: SpeakerImportLookups,
  existingSpeakers: SpeakerImportExistingSpeaker[] = [],
): ParsedSpeakerWorksheet {
  if (!matrix.length) throw new Error("The Master worksheet does not contain a header row.")

  const headers = matrix[0] ?? []
  const fieldColumns = new Map<ImportField, number>()
  const ignoredHeaders: string[] = []
  headers.forEach((header, index) => {
    const original = displayText(header)
    if (!original) return
    const field = SPEAKER_IMPORT_HEADER_MAP[normalizeSpeakerImportHeader(header) as keyof typeof SPEAKER_IMPORT_HEADER_MAP]
    if (!field) {
      ignoredHeaders.push(original)
      return
    }
    if (fieldColumns.has(field)) throw new Error(`The Master worksheet contains more than one “${DISPLAY_NAMES[field]}” column.`)
    fieldColumns.set(field, index)
  })

  const missing = REQUIRED_SPEAKER_IMPORT_COLUMNS.filter((displayName) => {
    const field = SPEAKER_IMPORT_HEADER_MAP[normalizeSpeakerImportHeader(displayName) as keyof typeof SPEAKER_IMPORT_HEADER_MAP]
    return !fieldColumns.has(field)
  })
  if (missing.length) throw new Error(`The Master worksheet is missing required ${missing.length === 1 ? "column" : "columns"}: ${missing.join(", ")}. Provider is the speaker name; a full_name column is not required.`)

  const values: SpeakerImportPayloadRow[] = []
  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    const cells = matrix[rowIndex] ?? []
    if (cells.every((cell) => !displayText(cell))) continue
    const source = (field: ImportField) => displayText(cells[fieldColumns.get(field) ?? -1])
    values.push({
      sourceRow: rowIndex + 1,
      providerName: source("providerName"),
      credentials: nullableText(source("credentials")),
      department: source("department"),
      category: source("category"),
      status: nullableText(source("status")),
      seminarTitle: source("seminarTitle"),
      seminarDescription: nullableText(source("seminarDescription")),
    })
  }
  if (!values.length) throw new Error("The Master worksheet does not contain any nonblank data rows.")
  return buildSpeakerImportPreview(values, lookups, existingSpeakers, ignoredHeaders)
}

export function speakerImportRowWillBeSkipped(row: Pick<SpeakerImportRow, "issues">) {
  return row.issues.some((item) => item.willSkip)
}

export function speakerImportPayload(rows: SpeakerImportRow[]): SpeakerImportPayloadRow[] {
  return rows.map((row) => ({
    sourceRow: row.sourceRow,
    providerName: row.providerName,
    credentials: row.credentials,
    department: row.department,
    category: row.category,
    status: row.status,
    seminarTitle: row.seminarTitle,
    seminarDescription: row.seminarDescription,
  }))
}

export function classifySpeakerImportResult(summary: SpeakerImportResultSummary): SpeakerImportResultPresentation {
  const writes = summary.speakersInserted + summary.speakersUpdated + summary.seminarsInserted + summary.seminarsUpdated
  const matches = summary.speakersMatched + summary.seminarsMatched
  const processedSeminars = summary.seminarsMatched + summary.seminarsInserted + summary.seminarsUpdated
  const failedReviewCount = summary.invalidRows + summary.databaseFailures
  const warnings = failedReviewCount + summary.duplicateRowsSkipped

  if (summary.validCandidateRows === 0) {
    return {
      tone: "red",
      title: "No valid records to import",
      message: "No valid candidate rows were available. Review the validation report and try again.",
      failedReviewCount,
    }
  }
  const processedRecords = writes + matches
  if (processedRecords === 0 && processedSeminars === 0 && summary.databaseFailures >= summary.validCandidateRows) {
    return {
      tone: "red",
      title: "Import failed",
      message: "All valid candidate rows failed during database processing. No records were matched or written.",
      failedReviewCount,
    }
  }
  if (failedReviewCount > 0) {
    const lead = matches > 0 && writes === 0
      ? "Most records already matched existing database entries, so no new records were written."
      : "The import completed for the records that could be processed."
    return {
      tone: "amber",
      title: "Import completed with warnings",
      message: `${lead} ${failedReviewCount} ${failedReviewCount === 1 ? "row requires" : "rows require"} review.`,
      failedReviewCount,
    }
  }
  if (writes === 0 && matches > 0) {
    return {
      tone: warnings ? "amber" : "blue",
      title: "All records already matched",
      message: warnings
        ? `No new records were needed. ${summary.duplicateRowsSkipped} duplicate ${summary.duplicateRowsSkipped === 1 ? "row was" : "rows were"} skipped.`
        : "All valid records already matched existing database entries, so no new records were written.",
      failedReviewCount,
    }
  }
  if (warnings > 0) {
    return {
      tone: "amber",
      title: "Import completed with warnings",
      message: `Database changes completed. ${summary.duplicateRowsSkipped} duplicate ${summary.duplicateRowsSkipped === 1 ? "row was" : "rows were"} skipped.`,
      failedReviewCount,
    }
  }
  return {
    tone: "green",
    title: "Import completed",
    message: "All valid records were processed successfully.",
    failedReviewCount,
  }
}
