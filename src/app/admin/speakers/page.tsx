"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Search, X } from "lucide-react"
import type { Seminar, Speaker } from "@/models/Speaker"
import { getCategoryName, getDepartmentName, getSeminarTitles, getSpeakerDescription, getStatusName, normalizeSpeakerRecords } from "@/lib/speakerPresentation"
import { SpeakerCard, SpeakerCardSkeleton } from "@/components/design-system/SpeakerCard"
import { SectionHeader } from "@/components/portal/SectionHeader"
import { EmptyState } from "@/components/portal/EmptyState"
import { ExcelTools } from "@/components/portal/ExcelTools"

type Lookup = { categories: { category_id: number; name: string }[]; departments: { department_id: number; name: string }[]; statuses: { status_id: number; label: string }[] }
const emptyLookup: Lookup = { categories: [], departments: [], statuses: [] }

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-[var(--navy-950)]">{label}{children}</label> }
const fieldClass = "mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20"

function SpeakerEditor({ speaker, lookup, onClose, onSaved }: { speaker: Speaker | null; lookup: Lookup; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ full_name: speaker?.full_name ?? "", credentials: speaker?.credentials ?? "", email: speaker?.email ?? "", title: speaker?.title ?? "", contact_info: speaker?.contact_info ?? "", bio: speaker?.bio ?? "", is_active: speaker?.is_active ?? true, seminar_title: "", seminar_description: "", category_id: "", department_id: "", status_id: "" })
  const [seminar, setSeminar] = useState<Partial<Seminar> | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function saveSpeaker(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("")
    const response = await fetch(speaker ? `/api/admin/speakers/${speaker.speaker_id}` : "/api/admin/speakers", { method: speaker ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Speaker could not be saved.")
    else { setMessage("Speaker saved."); onSaved() }
    setSaving(false)
  }

  async function uploadPhoto(file?: File) {
    if (!speaker || !file) return
    setSaving(true); setError("")
    const data = new FormData(); data.append("photo", file)
    const response = await fetch(`/api/admin/speakers/${speaker.speaker_id}/photo`, { method: "POST", body: data })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Photo could not be uploaded.")
    else { setMessage("Speaker photo updated."); onSaved() }
    setSaving(false)
  }

  async function saveSeminar(event: FormEvent) {
    event.preventDefault(); if (!speaker || !seminar) return
    setSaving(true); setError("")
    const editing = Boolean(seminar.seminar_id)
    const response = await fetch(editing ? `/api/admin/seminars/${seminar.seminar_id}` : `/api/admin/speakers/${speaker.speaker_id}/seminars`, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(seminar) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Seminar could not be saved.")
    else { setMessage("Seminar saved."); setSeminar(null); onSaved() }
    setSaving(false)
  }

  async function archive() {
    if (!speaker || !window.confirm(`Archive ${speaker.full_name}? The record and seminars will be preserved.`)) return
    const response = await fetch(`/api/admin/speakers/${speaker.speaker_id}`, { method: "DELETE" })
    if (response.ok) { onSaved(); onClose() } else setError("Speaker could not be archived.")
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[var(--navy-950)]/35" role="dialog" aria-modal="true" aria-labelledby="speaker-editor-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-[var(--shadow-lg)] sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">Speaker management</p><h2 id="speaker-editor-title" className="mt-2 text-2xl font-bold">{speaker ? `Edit ${speaker.full_name}` : "Add a speaker"}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-[var(--radius-input)] border border-[var(--border)]" aria-label="Close editor"><X className="h-5 w-5" /></button></div>
        <form onSubmit={saveSpeaker} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name"><input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className={fieldClass} /></Field><Field label="Credentials"><input value={form.credentials} onChange={(event) => setForm({ ...form, credentials: event.target.value })} className={fieldClass} /></Field></div>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Email"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} /></Field><Field label="Title"><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClass} /></Field></div>
          <Field label="Contact information"><input value={form.contact_info} onChange={(event) => setForm({ ...form, contact_info: event.target.value })} className={fieldClass} /></Field>
          <Field label="Biography"><textarea rows={5} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className={`${fieldClass} h-auto resize-y py-3 leading-6`} /></Field>
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 accent-[var(--green-600)]" /> Available for requests</label>
          {!speaker && <div className="rounded-[var(--radius-card-sm)] bg-[var(--canvas-subtle)] p-4"><p className="mb-4 text-sm font-bold">Optional first seminar</p><Field label="Seminar title"><input value={form.seminar_title} onChange={(event) => setForm({ ...form, seminar_title: event.target.value })} className={fieldClass} /></Field><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Category"><select value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className={fieldClass}><option value="">None</option>{lookup.categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.name}</option>)}</select></Field><Field label="Department"><select value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })} className={fieldClass}><option value="">None</option>{lookup.departments.map((item) => <option key={item.department_id} value={item.department_id}>{item.name}</option>)}</select></Field><Field label="Status"><select value={form.status_id} onChange={(event) => setForm({ ...form, status_id: event.target.value })} className={fieldClass}><option value="">None</option>{lookup.statuses.map((item) => <option key={item.status_id} value={item.status_id}>{item.label}</option>)}</select></Field></div></div>}
          {error && <p role="alert" className="text-sm text-[var(--error)]">{error}</p>}{message && <p role="status" className="text-sm text-[var(--green-700)]">{message}</p>}
          <div className="flex flex-wrap gap-3"><button disabled={saving} className="h-11 rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>{speaker && <label className="inline-flex h-11 cursor-pointer items-center rounded-[var(--radius-button)] border border-[var(--border)] px-5 text-sm font-semibold">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadPhoto(event.target.files?.[0])} /></label>}{speaker && <button type="button" onClick={archive} className="h-11 rounded-[var(--radius-button)] px-4 text-sm font-semibold text-[var(--error)]">Archive speaker</button>}</div>
        </form>

        {speaker && <section className="mt-10 border-t border-[var(--border)] pt-8"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">Seminars</h3><p className="mt-1 text-sm text-[var(--text-muted)]">Topics associated with this speaker.</p></div><button type="button" onClick={() => setSeminar({ title: "", description: "", category_id: null, department_id: null, status_id: null })} className="text-sm font-semibold text-[var(--green-700)]">Add seminar</button></div><div className="mt-4 space-y-2">{speaker.seminars?.length ? speaker.seminars.map((item) => <button key={item.seminar_id} type="button" onClick={() => setSeminar(item)} className="flex w-full items-start justify-between gap-4 rounded-[var(--radius-input)] border border-[var(--border)] p-4 text-left hover:bg-[var(--canvas-subtle)]"><span className="min-w-0"><span className="block font-semibold [overflow-wrap:anywhere]">{item.title}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{item.categories?.name || "No category"}</span></span><span className="shrink-0 text-sm font-semibold text-[var(--green-700)]">Edit</span></button>) : <p className="rounded-[var(--radius-input)] bg-[var(--canvas-subtle)] p-4 text-sm text-[var(--text-muted)]">No seminars yet.</p>}</div></section>}

        {seminar && <form onSubmit={saveSeminar} className="mt-6 rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-[var(--canvas-subtle)] p-5"><h3 className="font-bold">{seminar.seminar_id ? "Edit seminar" : "Add seminar"}</h3><Field label="Title"><input required value={seminar.title ?? ""} onChange={(event) => setSeminar({ ...seminar, title: event.target.value })} className={fieldClass} /></Field><div className="mt-4"><Field label="Description"><textarea rows={4} value={seminar.description ?? ""} onChange={(event) => setSeminar({ ...seminar, description: event.target.value })} className={`${fieldClass} h-auto py-3`} /></Field></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Category"><select value={seminar.category_id ?? ""} onChange={(event) => setSeminar({ ...seminar, category_id: event.target.value ? Number(event.target.value) : null })} className={fieldClass}><option value="">None</option>{lookup.categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.name}</option>)}</select></Field><Field label="Department"><select value={seminar.department_id ?? ""} onChange={(event) => setSeminar({ ...seminar, department_id: event.target.value ? Number(event.target.value) : null })} className={fieldClass}><option value="">None</option>{lookup.departments.map((item) => <option key={item.department_id} value={item.department_id}>{item.name}</option>)}</select></Field><Field label="Status"><select value={seminar.status_id ?? ""} onChange={(event) => setSeminar({ ...seminar, status_id: event.target.value ? Number(event.target.value) : null })} className={fieldClass}><option value="">None</option>{lookup.statuses.map((item) => <option key={item.status_id} value={item.status_id}>{item.label}</option>)}</select></Field></div><div className="mt-5 flex gap-3"><button disabled={saving} className="h-10 rounded-[var(--radius-button)] bg-[var(--green-600)] px-4 text-sm font-bold text-white">Save seminar</button><button type="button" onClick={() => setSeminar(null)} className="h-10 px-4 text-sm font-semibold">Cancel</button></div></form>}
      </div>
    </div>
  )
}

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [lookup, setLookup] = useState<Lookup>(emptyLookup)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] = useState("all")
  const [editing, setEditing] = useState<Speaker | null | undefined>(undefined)
  const [error, setError] = useState("")
  const [malformedCount, setMalformedCount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/speakers")
      const data = await response.json().catch(() => ({})) as { error?: string; speakers?: unknown; malformedSpeakerCount?: number; categories?: Lookup["categories"]; departments?: Lookup["departments"]; statuses?: Lookup["statuses"] }
      if (!response.ok) throw new Error(data.error || `Speaker data could not be loaded (${response.status}).`)

      const normalized = normalizeSpeakerRecords(data.speakers)
      setSpeakers(normalized.speakers)
      setMalformedCount((data.malformedSpeakerCount ?? 0) + normalized.malformedCount)
      setLookup({
        categories: Array.isArray(data.categories) ? data.categories : [],
        departments: Array.isArray(data.departments) ? data.departments : [],
        statuses: Array.isArray(data.statuses) ? data.statuses : [],
      })
      setEditing((current) => current ? normalized.speakers.find((item) => item.speaker_id === current.speaker_id) : current)
    } catch (caught) {
      setSpeakers([])
      setMalformedCount(0)
      setError(caught instanceof Error ? caught.message : "Speaker data could not be loaded.")
    } finally {
      setLoading(false)
    }
  // React state setters are stable; this loader intentionally has no state-value dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const handle = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(handle)
  }, [load])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return speakers.filter((speaker) => {
      const searchText = `${speaker.full_name} ${speaker.email ?? ""} ${speaker.credentials ?? ""} ${getDepartmentName(speaker)} ${getCategoryName(speaker)} ${getStatusName(speaker)} ${getSeminarTitles(speaker).join(" ")} ${getSpeakerDescription(speaker)}`
      const matchesSearch = !query || searchText.toLowerCase().includes(query)
      const matchesCategory = category === "all" || getCategoryName(speaker) === category
      const matchesAvailability = availability === "all" || (availability === "available" ? speaker.is_active : !speaker.is_active)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [availability, category, search, speakers])

  return (
    <div><SectionHeader eyebrow="Directory management" title="Speakers" description="Add and edit speaker records, photos, availability, and seminars." actions={<><ExcelTools speakers={filtered} lookups={lookup} onImported={() => void load()} /><button type="button" onClick={() => setEditing(null)} className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-button)] bg-[var(--green-600)] px-4 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add speaker</button></>} />
      <div className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:flex-row"><label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] px-3"><Search className="h-4 w-4 text-[var(--text-muted)]" /><span className="sr-only">Search speakers</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search speakers" className="min-w-0 flex-1 outline-none" /></label><select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}><option value="all">All categories</option>{lookup.categories.map((item) => <option key={item.category_id} value={item.name}>{item.name}</option>)}</select><select aria-label="Filter availability" value={availability} onChange={(event) => setAvailability(event.target.value)} className={fieldClass}><option value="all">All availability</option><option value="available">Available</option><option value="limited">Limited</option></select></div>
      {malformedCount > 0 && !loading && !error && <p role="status" className="mt-4 rounded-[var(--radius-input)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{malformedCount} malformed speaker {malformedCount === 1 ? "record was" : "records were"} skipped because no valid speaker ID was available.</p>}
      {loading ? (
        <div role="status" aria-label="Loading speakers" className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <SpeakerCardSkeleton key={index} />)}</div>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-[var(--radius-card-lg)] border border-red-200 bg-red-50 p-6 text-red-800"><h2 className="font-bold">Speakers could not be loaded</h2><p className="mt-2 text-sm">{error}</p><button type="button" onClick={() => void load()} className="mt-4 h-10 rounded-[var(--radius-button)] border border-red-300 bg-white px-4 text-sm font-semibold">Try again</button></div>
      ) : filtered.length ? (
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map((speaker) => {
          const seminars = getSeminarTitles(speaker)
          const description = getSpeakerDescription(speaker)
          return <div key={speaker.speaker_id} className="min-w-0"><SpeakerCard speaker={speaker} /><div className="mt-2 rounded-[var(--radius-card-sm)] border border-[var(--border)] bg-white p-4 text-xs leading-5 text-[var(--text-muted)]"><dl className="grid grid-cols-2 gap-x-3 gap-y-2"><div><dt className="font-semibold text-[var(--navy-950)]">Department</dt><dd>{getDepartmentName(speaker) || "Not assigned"}</dd></div><div><dt className="font-semibold text-[var(--navy-950)]">Status</dt><dd>{getStatusName(speaker) || (speaker.is_active ? "Available" : "Limited")}</dd></div></dl><div className="mt-3"><p className="font-semibold text-[var(--navy-950)]">Seminars</p><p className="text-clamp-2">{seminars.length ? seminars.join("; ") : "None listed"}</p></div>{description && <div className="mt-3"><p className="font-semibold text-[var(--navy-950)]">Description</p><p className="text-clamp-2">{description}</p></div>}</div><button type="button" onClick={() => setEditing(speaker)} className="mt-2 h-10 w-full rounded-[var(--radius-button)] border border-[var(--border)] bg-white text-sm font-semibold hover:border-[var(--green-600)]">Edit speaker</button></div>
        })}</div>
      ) : (
        <div className="mt-6"><EmptyState title="No speakers found" description={speakers.length ? "Adjust the search or filters to see more records." : "No speaker records are currently available in Supabase."} /></div>
      )}
      {editing !== undefined && <SpeakerEditor speaker={editing} lookup={lookup} onClose={() => setEditing(undefined)} onSaved={() => void load()} />}
    </div>
  )
}
