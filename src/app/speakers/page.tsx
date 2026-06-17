"use client"

import CsvImport from "@/components/CsvImport"
import SpeakerCard from "@/components/SpeakerCard"
import { categories } from "@/data/speakers"
import type { Speaker } from "@/models/Speaker"
import { useMemo, useState, useRef, useEffect } from "react"
import { useSpeakers } from "@/hooks/useSpeakers"
import Image from "next/image"

function Dropdown({ label, options, selected, onSelect, accentColor }: {
  label: string
  options: string[]
  selected: string
  onSelect: (v: string) => void
  accentColor: "teal" | "blue"
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const accent = accentColor === "teal"
    ? { bg: "bg-teal-500/10", text: "text-teal-700", border: "border-teal-200/60" }
    : { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-200/60" }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          selected !== "All"
            ? `${accent.bg} ${accent.text} ${accent.border}`
            : "bg-white/60 text-gray-600 border-white/60 hover:bg-white/80"
        } backdrop-blur-md shadow-sm`}
      >
        <span>{label}</span>
        {selected !== "All" && (
          <span className="max-w-24 truncate">{selected}</span>
        )}
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-52 rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setOpen(false) }}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors font-medium ${
                  selected === opt
                    ? `${accent.bg} ${accent.text}`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpeakersPage() {
  const { speakers: dbSpeakers, loading } = useSpeakers({})
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDept, setSelectedDept] = useState("All")
  const [importedSpeakers, setImportedSpeakers] = useState<Partial<Speaker>[]>([])
  const [showImport, setShowImport] = useState(false)

  async function handleImport(imported: Partial<Speaker>[]) {
    setImportedSpeakers(imported)
    setShowImport(false)

    const speakerMap = new Map<string, Partial<Speaker>>()
    const seminarRows: { full_name: string; title: string; description?: string | null }[] = []

    for (const row of imported) {
      if (!row.full_name) continue
      if (!speakerMap.has(row.full_name)) {
        speakerMap.set(row.full_name, {
          full_name:    row.full_name,
          credentials:  row.credentials,
          email:        row.email,
          contact_info: row.contact_info,
          is_active:    row.is_active ?? true,
        })
      }
      if (row.seminars?.[0]) {
        seminarRows.push({
          full_name:   row.full_name,
          title:       row.seminars[0].title,
          description: row.seminars[0].description,
        })
      }
    }

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speakers: Array.from(speakerMap.values()),
        seminars: seminarRows,
      }),
    })
    const result = await res.json()
    if (result.error) console.error("Import failed:", result.error)
    else console.log(`Imported ${result.count} speakers`)
  }

  const speakerList = importedSpeakers.length > 0 ? importedSpeakers : dbSpeakers

  const departments = useMemo(() => {
    const depts = new Set<string>()
    speakerList.forEach(s => {
      const d = s.seminars?.[0]?.departments?.name
      if (d) depts.add(d)
    })
    return ["All", ...Array.from(depts).sort()]
  }, [speakerList])

  const filtered = useMemo(() => {
    return speakerList.filter((speaker) => {
      const firstSeminar   = speaker.seminars?.[0]
      const categoryName   = firstSeminar?.categories?.name ?? ""
      const departmentName = firstSeminar?.departments?.name ?? ""
      const seminarTitle   = firstSeminar?.title ?? ""
      const description    = firstSeminar?.description ?? ""
      const topicTitles    = speaker.speaker_topics?.map((t) => t.topics.title).join(" ") ?? ""
      const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory
      const matchesDept     = selectedDept === "All" || departmentName === selectedDept
      const searchValue     = search.trim().toLowerCase()
      const matchesSearch   = !searchValue ||
        [speaker.full_name ?? "", speaker.credentials ?? "", departmentName, categoryName, seminarTitle, description, topicTitles]
          .join(" ").toLowerCase().includes(searchValue)
      return matchesCategory && matchesDept && matchesSearch
    })
  }, [search, selectedCategory, selectedDept, speakerList])

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #f8fffe 45%, #eff6ff 100%)" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }} />
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen p-6 gap-7"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(240,253,250,0.92) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "4px 0 24px rgba(20,184,166,0.08), 2px 0 8px rgba(59,130,246,0.06)"
          }}>

          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400/40 via-blue-400/30 to-transparent" />

          {/* Logo */}
          <div className="pt-2">
            <Image
              src="/speaker_logo.png"
              alt="Lee Health Speakers Bureau"
              width={200}
              height={48}
              className="object-contain"
            />
            <p className="text-xs text-gray-400 mt-1">Community Education Directory</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-teal-200/40 via-blue-200/40 to-transparent" />

          {/* Filters */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-bold tracking-widest text-teal-600/70 mb-3">CATEGORY</p>
            <div className="flex flex-col gap-0.5">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition-all duration-150 font-medium ${
                    selectedCategory === cat
                      ? "bg-teal-500/10 text-teal-700 border border-teal-200/50 shadow-sm"
                      : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-blue-200/40 via-teal-200/40 to-transparent my-4" />

            <p className="text-xs font-bold tracking-widest text-blue-600/70 mb-3">DEPARTMENT</p>
            <div className="flex flex-col gap-0.5">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition-all duration-150 font-medium ${
                    selectedDept === dept
                      ? "bg-blue-500/10 text-blue-700 border border-blue-200/50 shadow-sm"
                      : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Import */}
          <div>
            <button
              onClick={() => setShowImport(!showImport)}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border"
              style={{
                background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(59,130,246,0.10))",
                borderColor: "rgba(20,184,166,0.25)",
                color: "#0f766e",
                boxShadow: "0 2px 8px rgba(20,184,166,0.12)"
              }}
            >
              {showImport ? "Hide Import" : "↑ Import CSV"}
            </button>
            {showImport && (
              <div className="mt-3">
                <CsvImport onImport={handleImport} />
              </div>
            )}
          </div>
        </aside>

{/* ── MAIN ── */}
<main className="flex-1 px-5 lg:px-8 py-8">
  <section className="mx-auto max-w-7xl rounded-[32px] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden">

    {/* Sticky Dashboard */}
    <header
     className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-2xl px-6 pt-8 pb-6"
    >
      <div className="mb-5">
      

      
      
      </div>

      {/* Search */}
     <div className="mb-7">
  <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-600/70">
    Lee Health Speakers Bureau
  </p>

  <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 lg:text-5xl">
    Find the right speaker for your event
  </h1>

  <p className="mt-4 text-base leading-7 text-gray-500 lg:text-lg">
    Browse Lee Health experts, specialties, and community education topics.
  </p>
</div>

<div className="relative mb-5">
  <svg
    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>

  <input
    type="text"
    placeholder="Search by name, expertise, or keyword..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      block w-full rounded-2xl border border-gray-200 bg-white
      px-4 py-3.5 pl-12
      text-sm text-gray-700 placeholder-gray-400
      shadow-sm outline-none transition
      focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10
    "
  />
</div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          label="Category"
          options={["All", ...categories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          accentColor="teal"
        />

        <Dropdown
          label="Department"
          options={departments}
          selected={selectedDept}
          onSelect={setSelectedDept}
          accentColor="blue"
        />

        {(selectedCategory !== "All" || selectedDept !== "All" || search) && (
          <button
            onClick={() => {
              setSelectedCategory("All")
              setSelectedDept("All")
              setSearch("")
            }}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Count */}
      <div className="mt-5 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.16)]" />

        <p className="text-base font-semibold text-gray-700">
          {loading ? "Loading speakers..." : `${filtered.length} speakers found`}
        </p>
      </div>
    </header>

    {/* Grid */}
    <div className="px-6 py-6">
      {filtered.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <p className="text-sm text-gray-400">
            No speakers matched your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((speaker, index) => (
            <SpeakerCard
              key={speaker.speaker_id ?? `${speaker.full_name}-${index}`}
              speaker={speaker as Speaker}
            />
          ))}
        </div>
      )}
    </div>
  </section>
</main>
      </div>
    </div>
  )
}
