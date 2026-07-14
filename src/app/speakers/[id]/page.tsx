import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Speaker } from "@/models/Speaker"
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto"
import { SiteHeader } from "@/components/design-system/layout/SiteHeader"
import { SiteFooter } from "@/components/design-system/layout/SiteFooter"
import { Container } from "@/components/design-system/layout/Container"
import { getCategoryName, getDepartmentName } from "@/lib/speakerPresentation"

async function getSpeaker(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("speakers").select(`*, seminars (seminar_id, speaker_id, department_id, category_id, status_id, title, description, scheduled_at, categories(name, color_hex), departments(name), statuses(label, color_hex)), speaker_topics(topics(title)), speaker_contacts(contact_id, contact)`).eq("speaker_id", id).maybeSingle()
  return data as unknown as Speaker | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const speaker = await getSpeaker((await params).id)
  return speaker ? { title: speaker.full_name, description: speaker.bio ?? `View seminars and request ${speaker.full_name}.` } : { title: "Speaker not found" }
}

export default async function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const speaker = await getSpeaker((await params).id)
  if (!speaker) notFound()
  const category = getCategoryName(speaker)
  const department = getDepartmentName(speaker)
  return <div className="min-h-screen bg-[var(--canvas-subtle)]"><SiteHeader /><main className="py-10 sm:py-14"><Container><Link href="/speakers" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--green-700)] hover:underline"><ArrowLeft className="h-4 w-4" /> Back to speakers</Link><div className="mt-7 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start"><aside className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 text-center shadow-[var(--shadow-sm)] lg:sticky lg:top-28"><SpeakerPhoto name={speaker.full_name} url={speaker.headshot_url} className="mx-auto h-32 w-32 text-3xl" priority /><h1 className="mt-5 text-2xl font-bold leading-tight [overflow-wrap:anywhere]">{speaker.full_name}</h1>{speaker.credentials && <p className="mt-2 text-[var(--text-muted)] [overflow-wrap:anywhere]">{speaker.credentials}</p>}{speaker.title && <p className="mt-1 text-sm text-[var(--text-muted)]">{speaker.title}</p>}<div className="mt-5 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[var(--blue-100)] px-3 py-1 text-xs font-semibold text-[var(--blue-600)]">{category}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mint-100)] px-3 py-1 text-xs font-semibold text-[var(--green-700)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--green-600)]" />{speaker.is_active ? "Available" : "Limited"}</span></div>{department && <p className="mt-5 text-sm text-[var(--text-muted)]">{department}</p>}<Link href="/partners" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white">Request this speaker</Link></aside><div className="min-w-0 space-y-8">{speaker.bio && <section className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"><h2 className="text-xl font-bold">About</h2><p className="mt-4 whitespace-pre-line leading-8 text-[var(--navy-800)]">{speaker.bio}</p></section>}<section className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-600)]">Topics</p><h2 className="mt-2 text-2xl font-bold">Available seminars</h2></div><p className="text-sm text-[var(--text-muted)]">{speaker.seminars?.length ?? 0} listed</p></div>{speaker.seminars?.length ? <div className="mt-6 space-y-4">{speaker.seminars.map((seminar) => <article key={seminar.seminar_id} className="rounded-[var(--radius-card-sm)] border border-[var(--border)] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="min-w-0 flex-1 text-lg font-bold leading-6 [overflow-wrap:anywhere]">{seminar.title}</h3>{seminar.categories?.name && <span className="shrink-0 rounded-full bg-[var(--blue-100)] px-2.5 py-1 text-xs font-semibold text-[var(--blue-600)]">{seminar.categories.name}</span>}</div>{seminar.description && <p className="mt-3 leading-7 text-[var(--text-muted)]">{seminar.description}</p>}{seminar.scheduled_at && <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]"><CalendarDays className="h-4 w-4" />{new Date(seminar.scheduled_at).toLocaleDateString()}</p>}</article>)}</div> : <p className="mt-6 rounded-[var(--radius-input)] bg-[var(--canvas-subtle)] p-5 text-sm text-[var(--text-muted)]">No seminars are listed yet. The outreach team can still help with this speaker.</p>}</section></div></div></Container></main><SiteFooter /></div>
}
