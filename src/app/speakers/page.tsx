"use client"

import CsvImport from "@/components/CsvImport"
import SpeakerCard from "@/components/SpeakerCard"
import { categories } from "@/data/speakers"
import type { Speaker } from "@/models/Speaker"
import { useMemo, useState, useRef, useEffect } from "react"
import { useSpeakers } from "@/hooks/useSpeakers"
import Image from "next/image"
import Link from "next/link"

// ── Dropdown ──────────────────────────────────────────────
function Dropdown({
  label, options, selected, onSelect,
}: {
  label: string; options: string[]; selected: string; onSelect: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors shadow-sm min-w-[140px] justify-between"
      >
        <span className="truncate">{selected === "All" ? label : selected}</span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-52 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((opt) => (
              <button key={opt} onClick={() => { onSelect(opt); setOpen(false) }}
                className={`w-full text-left text-sm px-4 py-2.5 transition-colors ${selected === opt ? "bg-green-50 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function SpeakersPage() {
  const { speakers: dbSpeakers, loading } = useSpeakers({})
  const [search, setSearch] = useState("")
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState("All Departments")
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [importedSpeakers, setImportedSpeakers] = useState<Partial<Speaker>[]>([])
  const [showImport, setShowImport] = useState(false)
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  async function handleImport(imported: Partial<Speaker>[]) {
    setImportedSpeakers(imported)
    setShowImport(false)
    const speakerMap = new Map<string, Partial<Speaker>>()
    const seminarRows: { full_name: string; title: string; description?: string | null }[] = []
    for (const row of imported) {
      if (!row.full_name) continue
      if (!speakerMap.has(row.full_name)) {
        speakerMap.set(row.full_name, { full_name: row.full_name, credentials: row.credentials, email: row.email, contact_info: row.contact_info, is_active: row.is_active ?? true })
      }
      if (row.seminars?.[0]) seminarRows.push({ full_name: row.full_name, title: row.seminars[0].title, description: row.seminars[0].description })
    }
    const res = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ speakers: Array.from(speakerMap.values()), seminars: seminarRows }) })
    const result = await res.json()
    if (result.error) console.error("Import failed:", result.error)
    else console.log(`Imported ${result.count} speakers`)
  }

  const speakerList = importedSpeakers.length > 0 ? importedSpeakers : dbSpeakers

  const departments = useMemo(() => {
    const depts = new Set<string>()
    speakerList.forEach(s => { const d = s.seminars?.[0]?.departments?.name; if (d) depts.add(d) })
    return ["All Departments", ...Array.from(depts).sort()]
  }, [speakerList])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    speakerList.forEach(s => {
      const cat = s.seminars?.[0]?.categories?.name
      if (cat) counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [speakerList])

  const sortedCategories = useMemo(() =>
    [...categories].sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0)),
    [categoryCounts]
  )

  const visibleCategories = showMoreCategories ? sortedCategories : sortedCategories.slice(0, 7)

  const filtered = useMemo(() => {
    return speakerList.filter((speaker) => {
      const firstSeminar   = speaker.seminars?.[0]
      const categoryName   = firstSeminar?.categories?.name ?? ""
      const departmentName = firstSeminar?.departments?.name ?? ""
      const seminarTitle   = firstSeminar?.title ?? ""
      const description    = firstSeminar?.description ?? ""
      const topicTitles    = speaker.speaker_topics?.map((t) => t.topics.title).join(" ") ?? ""
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(categoryName)
      const matchesDept = selectedDept === "All Departments" || departmentName === selectedDept
      const searchVal = (search || sidebarSearch).trim().toLowerCase()
      const matchesSearch = !searchVal ||
        [speaker.full_name ?? "", speaker.credentials ?? "", departmentName, categoryName, seminarTitle, description, topicTitles]
          .join(" ").toLowerCase().includes(searchVal)
      const isActive = speaker.is_active ?? true
      const matchesAvailability = selectedAvailability.length === 0 ||
        (selectedAvailability.includes("available") && isActive) ||
        (selectedAvailability.includes("limited") && !isActive)
      return matchesCategory && matchesDept && matchesSearch && matchesAvailability
    })
  }, [search, sidebarSearch, selectedCategories, selectedDept, selectedAvailability, speakerList])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
    setCurrentPage(1)
  }

  const availableCount = speakerList.filter(s => s.is_active).length
  const limitedCount   = speakerList.filter(s => !s.is_active).length

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
<Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={160} height={44} className="object-contain" style={{ width: 'auto', height: '44px' }} unoptimized />          </Link>
{/* Nav links */}
<div className="hidden md:flex items-center gap-8">
  {[
    { label: "Speakers", href: "/speakers" },
    { label: "About Us", href: "/about" },
    { label: "For Partners", href: "/partners" },
  ].map((item) => (
    <Link key={item.label} href={item.href}
      className={`text-sm font-medium pb-0.5 transition-colors ${
        item.label === "Speakers"
          ? "text-green-600 border-b-2 border-green-500"
          : "text-gray-600 hover:text-gray-900"
      }`}>
      {item.label}
    </Link>
  ))}
</div>
 {/* Actions */}
<div className="flex items-center gap-5">
  <button className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
    Sign In
  </button>

  <button className=" text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
    Request a Speaker
  </button>

  <button
    onClick={() => setShowImport(!showImport)}
    className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
  >
    Import
  </button>
</div>
        </div>

        {/* Import panel */}
        {showImport && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="max-w-xl">
              <CsvImport onImport={handleImport} />
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-[1400px] mx-auto px-6">

        {/* ── HERO ── */}
        <div className="my-6 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-stretch min-h-[220px]">
          {/* Left text */}
          <div className="flex-1 p-10 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
              Find the right speaker<br />
              for{" "}
              <span className="text-green-500">your next event.</span>
            </h1>
            <p className="text-gray-500 text-base max-w-md">
              Browse Lee Health experts and engaging topics for your community.
            </p>
          </div>
          {/* Right image */}
          <div className="hidden lg:block w-[680px] shrink-0 relative overflow-hidden min-h-[100px]">
            <Image
              src="/hero_image.png"
              alt="Lee Health Community"
              fill
              className="object-cover"
    unoptimized
    loading="eager"
  />
</div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex gap-8 pb-16">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Find the right speaker</h2>
              <p className="text-sm text-gray-500">Browse Lee Health experts by topic, department, or keyword.</p>
            </div>

           
            {/* Category checkboxes */}
            <div>
              <p className="text-xs font-bold tracking-widest text-green-600 mb-3">CATEGORY</p>
              <div className="flex flex-col gap-0.5">
                {/* All Categories */}
                <label className="flex items-center justify-between py-1.5 cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === 0}
                      onChange={() => { setSelectedCategories([]); setCurrentPage(1) }}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">All Categories</span>
                  </div>
                  <span className="text-xs text-gray-400">{speakerList.length}</span>
                </label>

                {visibleCategories.map((cat) => (
                  <label key={cat} className="flex items-center justify-between py-1.5 cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{cat}</span>
                    </div>
                    <span className="text-xs text-gray-400">{categoryCounts[cat] || 0}</span>
                  </label>
                ))}

                {sortedCategories.length > 7 && (
                  <button
                    onClick={() => setShowMoreCategories(!showMoreCategories)}
                    className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1 hover:text-green-700"
                  >
                    {showMoreCategories ? "Show less" : `Show more`}
                    <svg className={`w-4 h-4 transition-transform ${showMoreCategories ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Department dropdown */}
            <div>
              <p className="text-xs font-bold tracking-widest text-green-600 mb-3">DEPARTMENT</p>
              <Dropdown
                label="All Departments"
                options={departments}
                selected={selectedDept}
                onSelect={(v) => { setSelectedDept(v); setCurrentPage(1) }}
              />
            </div>

            {/* Availability */}
            <div>
              <p className="text-xs font-bold tracking-widest text-green-600 mb-3">AVAILABILITY</p>
              <div className="flex flex-col gap-1">
                <label className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox"
                      checked={selectedAvailability.includes("available")}
                      onChange={() => {
                        setSelectedAvailability(prev => prev.includes("available") ? prev.filter(a => a !== "available") : [...prev, "available"])
                        setCurrentPage(1)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Available Now
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{availableCount}</span>
                </label>
                <label className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox"
                      checked={selectedAvailability.includes("limited")}
                      onChange={() => {
                        setSelectedAvailability(prev => prev.includes("limited") ? prev.filter(a => a !== "limited") : [...prev, "limited"])
                        setCurrentPage(1)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                      Limited Availability
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{limitedCount}</span>
                </label>
              </div>
            </div>

            {/* Can't find card */}
            <div className="mt-auto rounded-xl border border-gray-100 bg-gray-50 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Can&apos;t find the right speaker?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Let us help you find the perfect match.</p>
                </div>
              </div>
              <button className="text-sm font-medium text-green-600 transition-colors hover:text-green-700">
                 Contact Us
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Search + filter bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
  type="text"
  placeholder="Search by name, expertise, or keyword..."
  value={search}
  onChange={e => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }}
  style={{ paddingLeft: "64px" }}
  className="w-full pr-4 py-3.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 bg-white shadow-sm"
/>
              </div>

              <Dropdown
                label="All Categories"
                options={["All", ...categories]}
                selected={selectedCategories[0] ?? "All"}
                onSelect={(v) => { setSelectedCategories(v === "All" ? [] : [v]); setCurrentPage(1) }}
              />

              <Dropdown
                label="All Departments"
                options={departments}
                selected={selectedDept}
                onSelect={(v) => { setSelectedDept(v); setCurrentPage(1) }}
              />

              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
              </button>
            </div>

            {/* Results bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {loading ? "Loading..." : `${filtered.length} speakers found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(selectedCategories.length > 0 || selectedDept !== "All Departments" || search || sidebarSearch) && (
                  <button
                    onClick={() => { setSelectedCategories([]); setSelectedDept("All Departments"); setSearch(""); setSidebarSearch(""); setCurrentPage(1) }}
                    className="text-xs text-green-600 font-medium hover:underline"
                  >
                    Clear all
                  </button>
                )}
                <span className="text-sm text-gray-500">Sort by:</span>
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  Name (A-Z)
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No speakers matched your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map((speaker, index) => (
                  <SpeakerCard
                    key={speaker.speaker_id ?? `${speaker.full_name}-${index}`}
                    speaker={speaker as Speaker}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1
                  if (totalPages > 5 && currentPage > 3) page = currentPage - 2 + i
                  if (page > totalPages) return null
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {page}
                    </button>
                  )
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button onClick={() => setCurrentPage(totalPages)}
                      className="w-9 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Footer CTA */}
            <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-8 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Looking for a specific topic or speaker?</p>
                  <p className="text-sm text-gray-500 mt-0.5">Our team can help you find the perfect speaker for your event.</p>
                </div>
              </div>
              <button className="shrink-0 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors">
                Contact Our Team
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
