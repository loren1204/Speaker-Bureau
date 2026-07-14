"use client"

import { FormEvent, useEffect, useState } from "react"
import { SiteHeader } from "@/components/design-system/layout/SiteHeader"
import { SiteFooter } from "@/components/design-system/layout/SiteFooter"
import { Container } from "@/components/design-system/layout/Container"
import { supabase } from "@/supabaseClient"

const initialForm = { requester_name: "", requester_email: "", requester_phone: "", community: "", speaker_name: "", talk_title: "", desired_date: "", event_location: "", expected_attendance: "", message: "" }
const inputClass = "mt-2 h-[52px] w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20"

export default function PartnersPage() {
  const [form, setForm] = useState(initialForm)
  const [speakerNames, setSpeakerNames] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    void supabase.from("speakers").select("full_name").eq("is_active", true).order("full_name").then(({ data }) => setSpeakerNames((data ?? []).map((item) => item.full_name).filter(Boolean)))
  }, [])

  function set(name: keyof typeof form, value: string) { setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError(""); setSuccess("")
    const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Your request could not be submitted.")
    else { setSuccess(result.message); setForm(initialForm) }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white"><SiteHeader /><main>
      <section className="border-b border-[var(--border)] bg-[var(--canvas-subtle)] py-14 sm:py-20"><Container><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">For community partners</p><h1 className="mt-4 text-[clamp(2.7rem,5vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.045em]">Request a speaker for your event.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">Tell us about your audience, preferred topic, and event details. A member of the outreach team will review your request and follow up.</p></div></Container></section>
      <section className="py-12 sm:py-16"><Container><div className="grid gap-10 lg:grid-cols-[minmax(0,0.65fr)_minmax(520px,1fr)] lg:items-start"><aside className="lg:sticky lg:top-28"><h2 className="text-2xl font-bold">What happens next</h2><ol className="mt-6 space-y-5">{["We review your preferred speaker and topic.", "A team member contacts you to confirm timing and availability.", "Together, we finalize the event details."].map((item, index) => <li key={item} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--mint-100)] text-sm font-bold text-[var(--green-700)]">{index + 1}</span><p className="pt-1 text-[var(--navy-800)]">{item}</p></li>)}</ol><p className="mt-8 rounded-[var(--radius-card-sm)] border border-[var(--border)] bg-[var(--canvas-subtle)] p-4 text-sm leading-6 text-[var(--text-muted)]">Required fields are marked with an asterisk. Request details are stored privately for the outreach team and also sent through the existing email workflow.</p></aside>
        <form onSubmit={submit} className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-8" noValidate><h2 className="text-2xl font-bold">Event details</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Your name *<input required value={form.requester_name} onChange={(event) => set("requester_name", event.target.value)} className={inputClass} autoComplete="name" /></label><label className="text-sm font-semibold">Email *<input required type="email" value={form.requester_email} onChange={(event) => set("requester_email", event.target.value)} className={inputClass} autoComplete="email" /></label><label className="text-sm font-semibold">Phone<input value={form.requester_phone} onChange={(event) => set("requester_phone", event.target.value)} className={inputClass} autoComplete="tel" /></label><label className="text-sm font-semibold">Organization or community *<input required value={form.community} onChange={(event) => set("community", event.target.value)} className={inputClass} /></label><label className="text-sm font-semibold">Preferred speaker *<input required list="speaker-options" value={form.speaker_name} onChange={(event) => set("speaker_name", event.target.value)} className={inputClass} placeholder="Choose or enter a name" /><datalist id="speaker-options">{speakerNames.map((name) => <option key={name} value={name} />)}</datalist></label><label className="text-sm font-semibold">Talk or topic<input value={form.talk_title} onChange={(event) => set("talk_title", event.target.value)} className={inputClass} /></label><label className="text-sm font-semibold">Preferred date<input value={form.desired_date} onChange={(event) => set("desired_date", event.target.value)} className={inputClass} placeholder="Date or timeframe" /></label><label className="text-sm font-semibold">Event location<input value={form.event_location} onChange={(event) => set("event_location", event.target.value)} className={inputClass} /></label><label className="text-sm font-semibold">Expected attendance<input type="number" min="0" value={form.expected_attendance} onChange={(event) => set("expected_attendance", event.target.value)} className={inputClass} /></label></div><label className="mt-5 block text-sm font-semibold">Additional details<textarea rows={5} value={form.message} onChange={(event) => set("message", event.target.value)} className={`${inputClass} h-auto resize-y py-3 leading-6`} /></label>{error && <p role="alert" className="mt-5 text-sm font-medium text-[var(--error)]">{error}</p>}{success && <p role="status" className="mt-5 rounded-[var(--radius-input)] bg-[var(--mint-100)] p-4 text-sm font-medium text-[var(--green-700)]">{success}</p>}<button disabled={submitting} className="mt-6 h-[52px] rounded-[var(--radius-button)] bg-[var(--green-600)] px-7 text-sm font-bold text-white hover:bg-[var(--green-700)] disabled:opacity-60">{submitting ? "Submitting…" : "Submit request"}</button></form>
      </div></Container></section>
    </main><SiteFooter /></div>
  )
}
