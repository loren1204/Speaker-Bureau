"use client"

import { useState } from "react"
import { parseCsv, parseExcel } from "@/lib/csv"
import type { Speaker } from "@/models/Speaker"

interface CsvImportProps {
  onImport: (speakers: Partial<Speaker>[]) => void
}

export default function CsvImport({ onImport }: CsvImportProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let speakers: Partial<Speaker>[] = []
      if (file.name.endsWith(".csv")) {
        speakers = await parseCsv(file)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        speakers = await parseExcel(file)
      } else {
        setError("Please upload a .csv or .xlsx file")
        return
      }

      if (speakers.length === 0) {
        setError("No speakers found — check your column headers match the template")
        return
      }

      onImport(speakers)
      setSuccess(`${speakers.length} speakers imported successfully`)
    } catch {
      setError("Failed to parse file — check the format matches the template")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-200 rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-green-600 font-medium">
            {loading ? "Importing..." : "Click to upload CSV or Excel"}
          </p>
          <p className="text-xs text-green-400">.csv or .xlsx accepted</p>
        </div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFile}
          className="hidden"
          disabled={loading}
        />
      </label>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          ✓ {success}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        Required columns: Provider, Credentials, Department, Category, Status, Seminars, Description, Contacts
      </p>
    </div>
  )
}