"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useSpeakers } from "@/hooks/useSpeakers"
import { getCategoryName } from "@/lib/speakerPresentation"
import { formatSpeakerName } from "@/lib/speakerName"
import { SpeakerCard, SpeakerCardSkeleton } from "@/components/design-system/SpeakerCard"
import { CategoryFilterGrid } from "@/components/speakers/CategoryFilterGrid"
import { SortControl, type SpeakerSort } from "@/components/speakers/SortControl"
import { SiteHeader } from "@/components/design-system/layout/SiteHeader"
import { SiteFooter } from "@/components/design-system/layout/SiteFooter"
import { Container } from "@/components/design-system/layout/Container"
import { LinkButton } from "@/components/design-system/ui/Button"

const PAGE_SIZE = 12

export default function SpeakersPage() {
  const { speakers, categories, loading, error } = useSpeakers()
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [availability, setAvailability] = useState<"all" | "available" | "limited">("all")
  const [sort, setSort] = useState<SpeakerSort>("az")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const dataCategories = useMemo(() => Array.from(new Set(speakers.map(getCategoryName))).filter(Boolean), [speakers])
  const categoryOptions = categories.length ? categories : dataCategories

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = speakers.filter((speaker) => {
      const category = getCategoryName(speaker)
      const seminars = speaker.seminars?.map((item) => `${item.title} ${item.description ?? ""}`).join(" ") ?? ""
      const topics = speaker.speaker_topics?.map((item) => item.topics?.title ?? "").join(" ") ?? ""
      const haystack = `${speaker.full_name} ${formatSpeakerName(speaker.full_name)} ${speaker.credentials ?? ""} ${category} ${seminars} ${topics}`.toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category)
      const isAvailable = speaker.is_active ?? true
      const matchesAvailability = availability === "all" || (availability === "available" ? isAvailable : !isAvailable)
      return matchesSearch && matchesCategory && matchesAvailability
    })

    return result.sort((a, b) => {
      if (sort === "za") return (b.full_name ?? "").localeCompare(a.full_name ?? "")
      if (sort === "recent") {
        const aDate = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
        const bDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
        return bDate - aDate
      }
      return (a.full_name ?? "").localeCompare(b.full_name ?? "")
    })
  }, [availability, search, selectedCategories, sort, speakers])

  function toggleCategory(category: string) {
    setVisibleCount(PAGE_SIZE)
    setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])
  }

  function clearFilters() {
    setSearch("")
    setSelectedCategories([])
    setAvailability("all")
    setVisibleCount(PAGE_SIZE)
  }

  const hasFilters = Boolean(search.trim() || selectedCategories.length || availability !== "all")

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[var(--navy-950)]">
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--canvas-subtle)] py-12 sm:py-16 lg:py-20">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.96fr)_minmax(400px,1.04fr)] lg:gap-[clamp(2.5rem,5vw,5.5rem)]">
              <div className="min-w-0 lg:pl-[clamp(0rem,1.5vw,1.25rem)]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--blue-600)]">Community education</p>
                <h1 className="mt-4 max-w-[720px] text-[clamp(2.7rem,5vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[var(--green-600)]">
                  Find the right speaker for your next event.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
                  Explore Lee Health experts and practical health topics for your community, workplace, or organization.
                </p>
                <label className="mt-8 flex h-14 max-w-xl items-center gap-3 rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 shadow-[var(--shadow-sm)] focus-within:border-[var(--blue-600)] focus-within:ring-2 focus-within:ring-[var(--blue-600)]/20">
                  <Search className="h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  <span className="sr-only">Search speakers</span>
                  <input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]" placeholder="Search by name, topic, or expertise" />
                  {search && <button type="button" onClick={() => { setSearch(""); setVisibleCount(PAGE_SIZE) }} aria-label="Clear search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-[var(--canvas-subtle)]"><X className="h-4 w-4" /></button>}
                </label>
              </div>
              <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-[var(--radius-hero-image)] border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
                <Image src="/hero_image.png" alt="A Lee Health speaker presenting to a community audience" fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" priority />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-16" aria-labelledby="directory-heading">
          <Container>
            <div className="grid gap-8 xl:grid-cols-[minmax(250px,330px)_minmax(0,1fr)] xl:items-start">
              <aside className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-[var(--canvas-subtle)] p-5 sm:p-6 xl:sticky xl:top-28">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--navy-950)]">Browse categories</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Select one or more topics.</p>
                  </div>
                  {selectedCategories.length > 0 && <button type="button" onClick={() => { setSelectedCategories([]); setVisibleCount(PAGE_SIZE) }} className="text-sm font-semibold text-[var(--green-700)] hover:underline">Clear</button>}
                </div>
                <div className="mt-5">
                  <CategoryFilterGrid categories={categoryOptions} selected={selectedCategories} onToggle={toggleCategory} />
                </div>
                <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-muted)]">Showing all departments</p>
                <label className="mt-4 block text-sm font-semibold text-[var(--navy-950)]">
                  Availability
                  <select value={availability} onChange={(event) => { setAvailability(event.target.value as typeof availability); setVisibleCount(PAGE_SIZE) }} className="mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20">
                    <option value="all">All availability</option>
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                  </select>
                </label>
              </aside>

              <div className="min-w-0">
                <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 id="directory-heading" className="text-2xl font-bold tracking-tight text-[var(--navy-950)]">Speaker directory</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]" aria-live="polite">{loading ? "Loading speakers…" : `${filtered.length} speaker${filtered.length === 1 ? "" : "s"} found`}</p>
                  </div>
                  <SortControl value={sort} onChange={(value) => { setSort(value); setVisibleCount(PAGE_SIZE) }} />
                </div>

                {error && <div role="alert" className="mt-6 rounded-[var(--radius-card-sm)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">Speakers could not be loaded. {error}</div>}

                {loading ? (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <SpeakerCardSkeleton key={index} />)}</div>
                ) : filtered.length ? (
                  <>
                    <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                      {filtered.slice(0, visibleCount).map((speaker) => <SpeakerCard key={speaker.speaker_id} speaker={speaker} />)}
                    </div>
                    {visibleCount < filtered.length && <div className="mt-8 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="h-11 rounded-[var(--radius-button)] border border-[var(--border)] bg-white px-6 text-sm font-semibold shadow-[var(--shadow-sm)] hover:border-[var(--green-600)]">Show more speakers</button></div>}
                  </>
                ) : (
                  <div className="mt-6 rounded-[var(--radius-card-lg)] border border-dashed border-[var(--border)] bg-[var(--canvas-subtle)] px-6 py-16 text-center">
                    <h3 className="text-lg font-bold">No speakers match these filters</h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">Try another keyword or clear the selected categories.</p>
                    {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 text-sm font-semibold text-[var(--green-700)] hover:underline">Clear all filters</button>}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--canvas-subtle)] py-14 sm:py-18">
          <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div><h2 className="text-2xl font-bold">Need help choosing a speaker?</h2><p className="mt-2 text-[var(--text-muted)]">Tell our outreach team about your event and we’ll help identify a good fit.</p></div>
            <LinkButton href="/partners">Request a speaker</LinkButton>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
