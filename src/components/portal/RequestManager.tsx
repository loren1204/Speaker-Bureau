"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import type { RequestStatus, SpeakerRequest, TeamProfile } from "@/types/database"
import { EmptyState } from "@/components/portal/EmptyState"
import { supabase } from "@/supabaseClient"

const statusOptions: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" }, { value: "new", label: "New" }, { value: "in_review", label: "In review" }, { value: "contacted", label: "Contacted" }, { value: "scheduled", label: "Scheduled" }, { value: "closed", label: "Closed" },
]

function statusLabel(status: RequestStatus) { return statusOptions.find((item) => item.value === status)?.label ?? status }

export function RequestManager() {
  const [requests, setRequests] = useState<SpeakerRequest[]>([])
  const [team, setTeam] = useState<Pick<TeamProfile, "id" | "full_name" | "email" | "avatar_url">[]>([])
  const [selected, setSelected] = useState<SpeakerRequest | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<RequestStatus | "all">("all")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    const response = await fetch("/api/admin/requests")
    if (!response.ok) { setError("Requests could not be loaded."); setLoading(false); return }
    const data = await response.json()
    setRequests(data.requests)
    setTeam(data.team)
    setLoading(false)
  }

  useEffect(() => {
    void load()
    const channel = supabase.channel("request-manager")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "speaker_requests" }, () => { void load() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((request) => {
      const matchesStatus = status === "all" || request.status === status
      const haystack = `${request.requester_name} ${request.requester_email ?? ""} ${request.community} ${request.speaker_name ?? ""} ${request.talk_title ?? ""}`.toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [requests, search, status])

  async function save() {
    if (!selected) return
    setSaving(true)
    setError("")
    const response = await fetch("/api/admin/requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, status: selected.status, assigned_user_id: selected.assigned_user_id, notes: selected.notes }) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Request could not be updated.")
    else { setRequests((current) => current.map((item) => item.id === result.request.id ? result.request : item)); setSelected(result.request) }
    setSaving(false)
  }

  if (loading) return <p role="status" className="mt-8 text-sm text-[var(--text-muted)]">Loading requests…</p>

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:flex-row">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] px-3 focus-within:border-[var(--blue-600)] focus-within:ring-2 focus-within:ring-[var(--blue-600)]/20"><Search className="h-4 w-4 text-[var(--text-muted)]" /><span className="sr-only">Search requests</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" className="min-w-0 flex-1 outline-none" /></label>
        <label className="sr-only" htmlFor="request-status-filter">Filter by status</label>
        <select id="request-status-filter" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-11 rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--blue-600)]">{statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-[var(--error)]">{error}</p>}
      {!filtered.length ? <div className="mt-6"><EmptyState title="No requests found" description="New public requests will appear here automatically." /></div> : (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[var(--canvas-subtle)] text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"><tr><th className="px-5 py-3 font-semibold">Requester</th><th className="px-5 py-3 font-semibold">Preferred speaker</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Submitted</th><th className="px-5 py-3 font-semibold"><span className="sr-only">Action</span></th></tr></thead>
              <tbody className="divide-y divide-[var(--border)]">{filtered.map((request) => <tr key={request.id} className="hover:bg-[var(--canvas-subtle)]"><td className="px-5 py-4"><p className="font-semibold text-[var(--navy-950)]">{request.requester_name}</p><p className="mt-0.5 max-w-[260px] truncate text-xs text-[var(--text-muted)]">{request.community}</p></td><td className="max-w-[260px] px-5 py-4"><p className="truncate">{request.speaker_name || "No preference"}</p><p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{request.talk_title || "Topic not specified"}</p></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === "new" ? "bg-[var(--mint-100)] text-[var(--green-700)]" : "bg-[var(--canvas-subtle)] text-[var(--navy-800)]"}`}>{statusLabel(request.status)}</span></td><td className="whitespace-nowrap px-5 py-4 text-[var(--text-muted)]">{new Date(request.created_at).toLocaleDateString()}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setSelected(request)} className="font-semibold text-[var(--green-700)] hover:underline">Review request</button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-[var(--navy-950)]/35" role="dialog" aria-modal="true" aria-labelledby="request-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}>
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-[var(--shadow-lg)] sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">Speaker request</p><h2 id="request-title" className="mt-2 text-2xl font-bold">{selected.requester_name}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Submitted {new Date(selected.created_at).toLocaleString()}</p></div><button type="button" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-[var(--radius-input)] border border-[var(--border)]" aria-label="Close request"><X className="h-5 w-5" /></button></div>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">{[
              ["Email", selected.requester_email], ["Phone", selected.requester_phone], ["Organization", selected.community], ["Preferred speaker", selected.speaker_name], ["Talk or topic", selected.talk_title], ["Date", selected.desired_date], ["Location", selected.event_location], ["Attendance", selected.expected_attendance?.toString()], ["Email delivery", selected.formspree_delivery_status],
            ].map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</dt><dd className="mt-1 [overflow-wrap:anywhere]">{value || "Not provided"}</dd></div>)}</dl>
            {selected.message && <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Message</p><p className="mt-2 whitespace-pre-wrap leading-7">{selected.message}</p></div>}
            <div className="mt-8 space-y-5 border-t border-[var(--border)] pt-6">
              <label className="block text-sm font-semibold">Status<select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as RequestStatus })} className="mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3">{statusOptions.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className="block text-sm font-semibold">Assigned to<select value={selected.assigned_user_id ?? ""} onChange={(event) => setSelected({ ...selected, assigned_user_id: event.target.value || null })} className="mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3"><option value="">Unassigned</option>{team.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select></label>
              <label className="block text-sm font-semibold">Internal notes<textarea value={selected.notes ?? ""} onChange={(event) => setSelected({ ...selected, notes: event.target.value })} rows={5} className="mt-2 w-full resize-y rounded-[var(--radius-input)] border border-[var(--border)] p-3 leading-6" /></label>
              <button type="button" disabled={saving} onClick={save} className="h-11 w-full rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

