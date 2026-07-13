"use client"

import { categories } from "@/data/speakers"
import type { Speaker } from "@/models/Speaker"
import { useSpeakers } from "@/hooks/useSpeakers"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { AnimatePresence, motion } from "framer-motion"

const INITIAL_VISIBLE_COUNT = 12

const categoryConfig: Record<string, { badge: string; dot: string; glow: string; tint: string }> = {
  Nutrition: {
    badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(16,185,129,0.20)",
    tint: "from-emerald-50/80 to-white/70",
  },
  Surgery: {
    badge: "bg-blue-100/80 text-blue-700 border-blue-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(59,130,246,0.18)",
    tint: "from-blue-50/80 to-white/70",
  },
  Pharmacy: {
    badge: "bg-violet-100/80 text-violet-700 border-violet-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(139,92,246,0.18)",
    tint: "from-violet-50/80 to-white/70",
  },
  Cancer: {
    badge: "bg-rose-100/80 text-rose-700 border-rose-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(244,63,94,0.16)",
    tint: "from-rose-50/80 to-white/70",
  },
  "Integrative/Lifestyle": {
    badge: "bg-cyan-100/80 text-cyan-700 border-cyan-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(6,182,212,0.18)",
    tint: "from-cyan-50/80 to-white/70",
  },
  Vascular: {
    badge: "bg-sky-100/80 text-sky-700 border-sky-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(14,165,233,0.18)",
    tint: "from-sky-50/80 to-white/70",
  },
  Cardiac: {
    badge: "bg-rose-100/80 text-rose-700 border-rose-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(244,63,94,0.16)",
    tint: "from-rose-50/80 to-white/70",
  },
  Orthopedics: {
    badge: "bg-orange-100/80 text-orange-700 border-orange-200/70",
    dot: "bg-amber-400",
    glow: "rgba(249,115,22,0.18)",
    tint: "from-orange-50/80 to-white/70",
  },
  "Orthopedics and PT": {
    badge: "bg-orange-100/80 text-orange-700 border-orange-200/70",
    dot: "bg-amber-400",
    glow: "rgba(249,115,22,0.18)",
    tint: "from-orange-50/80 to-white/70",
  },
  Pediatrics: {
    badge: "bg-pink-100/80 text-pink-700 border-pink-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(236,72,153,0.18)",
    tint: "from-pink-50/80 to-white/70",
  },
  "Mental Health": {
    badge: "bg-indigo-100/80 text-indigo-700 border-indigo-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(99,102,241,0.18)",
    tint: "from-indigo-50/80 to-white/70",
  },
  Specialists: {
    badge: "bg-cyan-100/80 text-cyan-700 border-cyan-200/70",
    dot: "bg-emerald-500",
    glow: "rgba(20,184,166,0.16)",
    tint: "from-cyan-50/80 to-white/70",
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name?: string | null) {
  if (!name) return "LH"
  return name
    .split(/[\s,-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function getFirstSeminar(speaker: Partial<Speaker>) {
  return speaker.seminars?.[0]
}

function getCategoryName(speaker: Partial<Speaker>) {
  return getFirstSeminar(speaker)?.categories?.name ?? "Specialists"
}

function getDepartmentName(speaker: Partial<Speaker>) {
  return getFirstSeminar(speaker)?.departments?.name ?? ""
}

function getTopicTags(speaker: Partial<Speaker>) {
  const topicTitles = speaker.speaker_topics?.map((item) => item.topics?.title).filter(Boolean) ?? []
  const seminarTitle = getFirstSeminar(speaker)?.title
  const unique = Array.from(new Set([...topicTitles, seminarTitle].filter(Boolean) as string[]))
  return unique.slice(0, 3)
}

function getSpeakerPhoto(speaker: Partial<Speaker>) {
  const record = speaker as Partial<Speaker> & Record<string, unknown>
  const photo =
    record.photo_url || record.photoUrl || record.image_url || record.headshot_url || record.profile_image
  return typeof photo === "string" && photo.length > 0 ? photo : null
}

function formatCategoryLabel(category: string) {
  if (category === "Integrative/Lifestyle") return "Integrative"
  if (category === "Orthopedics and PT") return "Orthopedics"
  return category
}

// ── FilterChip ────────────────────────────────────────────────────────────────
function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex h-12 min-w-[118px] items-center justify-center rounded-full border px-9 text-sm font-bold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${
        active
          ? "border-emerald-400/70 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]"
          : "border-white/70 bg-white/68 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-700"
      }`}
    >
      {children}
    </button>
  )
}

// ── ActiveFilter tag ──────────────────────────────────────────────────────────
function ActiveFilter({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onRemove}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-6 text-xs font-bold text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_rgba(16,185,129,0.10)] transition hover:bg-emerald-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
    >
      {children}
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    </motion.button>
  )
}

// ── GlassSelect ───────────────────────────────────────────────────────────────
function GlassSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div className="min-w-[210px] flex-1 border-l border-slate-200/60 pl-6">
      <label className="mb-2 block text-xs font-bold text-slate-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-full border border-white/80 bg-white/72 px-7 pr-12 text-sm font-bold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/80"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

// ── Speaker Card ──────────────────────────────────────────────────────────────
function SpeakerCard({ speaker }: { speaker: Partial<Speaker> }) {
  const name = speaker.full_name ?? "Lee Health Speaker"
  const credentials = speaker.credentials ?? getDepartmentName(speaker) ?? "Lee Health Expert"
  const category = getCategoryName(speaker)
  const topics = getTopicTags(speaker)
  const remainingCount = Math.max(
    (speaker.speaker_topics?.length ?? 0) + (getFirstSeminar(speaker)?.title ? 1 : 0) - 3,
    0
  )
  const photo = getSpeakerPhoto(speaker)
  const isAvailable = speaker.is_active ?? true
  const config = categoryConfig[category] ?? categoryConfig.Specialists

  const content = (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 330, damping: 28 }}
      className={`group relative min-h-[172px] w-full min-w-0 overflow-hidden rounded-[30px] border border-white/75 bg-gradient-to-br ${config.tint} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-200/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_42px_rgba(15,23,42,0.10)]`}
      style={{ "--speaker-glow": config.glow } as CSSProperties}
    >
      {/* Shimmer line at top */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/90" />
      {/* Hover glow blob */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[var(--speaker-glow)] blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-80" />

      <div className="flex min-w-0 items-center gap-6">
        {/* Avatar */}
        <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-full border border-white/90 bg-white/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(15,23,42,0.10)]">
          <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-cyan-100">
            {photo ? (
              <img
                src={photo}
                alt={`${name} profile photo`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-300 to-cyan-500 text-2xl font-black text-white">
                {getInitials(name)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 py-1 pr-9">
          {/* Category badge */}
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <span className={`inline-flex max-w-full items-center rounded-full border px-3.5 py-1.5 text-xs font-black leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${config.badge}`}>
              <span className="truncate">{formatCategoryLabel(category)}</span>
            </span>
          </div>

          <h3 className="line-clamp-2 min-w-0 text-[19px] font-black leading-[1.12] tracking-[-0.025em] text-slate-950 [overflow-wrap:anywhere]">
            {name}
          </h3>
          <p className="mt-1 min-w-0 truncate text-[15px] font-bold leading-snug text-slate-500">
            {credentials}
          </p>

          {/* Topic tags */}
          {topics.length > 0 && (
            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  title={topic}
                  className="inline-flex max-w-[190px] items-center rounded-full border border-white/85 bg-white/72 px-4 py-1.5 text-[11px] font-black leading-none text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_14px_rgba(15,23,42,0.05)]"
                >
                  <span className="truncate">{topic}</span>
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-black leading-none text-emerald-700">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Availability dot */}
      <span
        className={`absolute right-6 top-6 h-3.5 w-3.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.72)] ${
          isAvailable ? config.dot : "bg-amber-400"
        }`}
        aria-label={isAvailable ? "Available" : "Limited availability"}
      />
    </motion.article>
  )

  if (speaker.speaker_id) {
    return (
      <Link
        href={`/speakers/${speaker.speaker_id}`}
        className="block min-w-0 rounded-[30px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
      >
        {content}
      </Link>
    )
  }

  return content
}

// ── Background ────────────────────────────────────────────────────────────────
function BackgroundAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fcff_0%,#eff7ff_38%,#f2fbf7_68%,#fbfdff_100%)]" />
      <div className="absolute left-[-160px] top-[180px] h-[360px] w-[360px] rounded-full border border-white/50 bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl" />
      <div className="absolute left-[92px] top-[145px] h-[118px] w-[118px] rounded-full bg-emerald-300/24 blur-sm" />
      <div className="absolute right-[-120px] top-[190px] h-[260px] w-[260px] rounded-full bg-sky-300/22 blur-sm" />
      <div className="absolute right-[20px] top-[72px] h-[86px] w-[86px] rounded-full bg-blue-300/25 blur-[1px]" />
      <div className="absolute left-[44%] top-[345px] h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-300/16 blur-3xl" />
      <div className="absolute right-[23%] top-[120px] h-[300px] w-[420px] rounded-full bg-cyan-200/22 blur-3xl" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SpeakersPage() {
  const { speakers: dbSpeakers, loading } = useSpeakers({})

  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  // Safely type the speaker list from the hook
  const speakerList = useMemo(() => (dbSpeakers ?? []) as Partial<Speaker>[], [dbSpeakers])

  // ── Derived filter data from actual DB ──────────────────────────────────────

  // Count how many speakers are in each category (from DB data)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    speakerList.forEach((sp) => {
      const cat = getCategoryName(sp)
      counts[cat] = (counts[cat] ?? 0) + 1
    })
    return counts
  }, [speakerList])

  // Sort categories by count, falling back to static list order
  // Only show categories that actually have speakers in the DB
  const sortedCategories = useMemo(() => {
    // Start from the static categories list (preserves intended order)
    const fromStatic = categories.filter((c) => categoryCounts[c] > 0)
    // Add any DB categories not in the static list
    const fromDB = Object.keys(categoryCounts).filter((c) => !categories.includes(c) && categoryCounts[c] > 0)
    const merged = Array.from(new Set([...fromStatic, ...fromDB]))
    return merged.sort((a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0))
  }, [categoryCounts])

  // Primary chips: prefer these if they have speakers, fill rest from sorted list
  const primaryCategories = useMemo(() => {
    const preferred = ["Nutrition", "Cardiac", "Surgery", "Mental Health", "Cancer", "Vascular", "Pharmacy"]
    const withSpeakers = preferred.filter((c) => categoryCounts[c] > 0)
    const extras = sortedCategories.filter((c) => !withSpeakers.includes(c)).slice(0, Math.max(0, 6 - withSpeakers.length))
    return [...withSpeakers, ...extras]
  }, [sortedCategories, categoryCounts])

  const extraCategories = useMemo(
    () => sortedCategories.filter((c) => !primaryCategories.includes(c)),
    [primaryCategories, sortedCategories]
  )

  // Departments from actual DB data
  const departments = useMemo(() => {
    const vals = speakerList.map(getDepartmentName).filter(Boolean)
    return Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b))
  }, [speakerList])

  const availableCount = useMemo(() => speakerList.filter((s) => s.is_active ?? true).length, [speakerList])
  const limitedCount = speakerList.length - availableCount

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return speakerList.filter((sp) => {
      const sem = getFirstSeminar(sp)
      const cat = getCategoryName(sp)
      const dept = getDepartmentName(sp)
      const topicsText = sp.speaker_topics?.map((t) => t.topics?.title).join(" ") ?? ""
      const haystack = [
        sp.full_name ?? "",
        sp.credentials ?? "",
        dept,
        cat,
        sem?.title ?? "",
        sem?.description ?? "",
        topicsText,
      ].join(" ").toLowerCase()

      const matchesSearch = !q || haystack.includes(q)
      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(cat)
      const matchesDept = selectedDepartment === "all" || dept === selectedDepartment
      const active = sp.is_active ?? true
      const matchesAvail =
        selectedAvailability === "all" ||
        (selectedAvailability === "available" && active) ||
        (selectedAvailability === "limited" && !active)

      return matchesSearch && matchesCat && matchesDept && matchesAvail
    })
  }, [search, selectedCategories, selectedDepartment, selectedAvailability, speakerList])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }, [search, selectedCategories, selectedDepartment, selectedAvailability])

  const visibleSpeakers = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const shownCount = Math.min(visibleCount, filtered.length)

  const activeFilterCount =
    selectedCategories.length +
    (selectedDepartment !== "all" ? 1 : 0) +
    (selectedAvailability !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0)

  function toggleCategory(cat: string) {
    setSelectedCategories((cur) =>
      cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat]
    )
  }

  function clearAll() {
    setSearch("")
    setSelectedCategories([])
    setSelectedDepartment("all")
    setSelectedAvailability("all")
    setShowMoreCategories(false)
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-950">
      <BackgroundAtmosphere />

      {/* ── NAV ── */}
      <header className="relative z-50 px-6 pt-5 sm:px-8 lg:px-14 xl:px-16">
        <nav className="mx-auto flex h-[72px] w-full max-w-[1900px] items-center justify-between rounded-[28px] border border-white/75 bg-white/72 px-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:px-9">
          <Link href="/" className="flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80">
            <Image
              src="/speaker_logo.png"
              alt="Lee Health Speakers Bureau"
              width={220}
              height={60}
              className="h-[58px] w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          <div className="hidden items-center gap-16 md:flex">
            {[
              { label: "Speakers", href: "/speakers" },
              { label: "About Us", href: "/about" },
              { label: "For Partners", href: "/partners" },
            ].map((item) => {
              const active = item.label === "Speakers"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-1 py-5 text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 ${
                    active ? "text-emerald-700" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden h-12 min-w-[122px] items-center justify-center rounded-full border border-white/80 bg-white/68 px-8 text-sm font-bold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 sm:inline-flex"
            >
              Team Login
            </Link>
            <Link
              href="/partners"
              className="inline-flex h-12 min-w-[224px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-10 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_rgba(16,185,129,0.36)] transition hover:-translate-y-[1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_38px_rgba(16,185,129,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
            >
              <span className="hidden sm:inline">Request a Speaker</span>
              <span className="sm:hidden">Request</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1900px] px-8 pb-20 pt-10 sm:px-10 lg:px-16 xl:px-20">

        {/* ── HERO ── */}
        <section className="grid items-center gap-16 pb-24 pt-12 lg:grid-cols-[minmax(680px,0.78fr)_minmax(720px,1fr)] lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[720px]"
          >
            <h1 className="text-[clamp(3.25rem,4.15vw,4.95rem)] font-black leading-[1.08] tracking-[-0.055em] text-slate-950">
              Find the right speaker
              <br />
              for{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                your next event.
              </span>
            </h1>
            <p className="mt-5 max-w-[470px] text-[17px] font-semibold leading-8 text-slate-500">
              Browse Lee Health experts and engaging topics
              <br className="hidden sm:block" /> for your community.
            </p>

            <div className="mt-8 flex h-14 w-full max-w-[650px] items-center gap-4 rounded-full border border-white/80 bg-white/72 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100/80">
              <svg className="h-6 w-6 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                aria-label="Search speakers"
                placeholder="Search by name, expertise, or keyword..."
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                aria-label="Search"
                className="inline-flex h-11 min-w-[66px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 px-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(16,185,129,0.38)] transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.35} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-4 rounded-[42px] bg-gradient-to-br from-emerald-300/25 via-cyan-200/20 to-blue-300/25 blur-2xl" />
            <div className="relative h-[280px] overflow-hidden rounded-[34px] border border-white/80 bg-white/60 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl xl:h-[310px]">
              <Image
                src="/hero_image.png"
                alt="Lee Health speaker presenting to a community audience"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="rounded-[28px] object-cover"
                priority
              />
              <div className="absolute inset-2 rounded-[28px] ring-1 ring-inset ring-white/55" />
            </div>
          </motion.div>
        </section>

        {/* ── FILTER BAR ── */}
        <section className="relative z-20 mt-10 rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start">

            {/* Filters label */}
            <div className="flex shrink-0 items-center gap-3 rounded-full border border-white/80 bg-white/70 px-8 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M7 12h10M10 18h4" />
              </svg>
              <span className="text-base font-black text-slate-800">Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs font-black text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.45fr)_minmax(260px,0.48fr)_auto] xl:items-start">

                {/* Category chips — driven by real DB data */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <span className="mr-2 text-sm font-bold text-slate-500">Category</span>
                    <FilterChip active={selectedCategories.length === 0} onClick={() => setSelectedCategories([])}>
                      All
                    </FilterChip>
                    {primaryCategories.map((cat) => (
                      <FilterChip
                        key={cat}
                        active={selectedCategories.includes(cat)}
                        onClick={() => toggleCategory(cat)}
                      >
                        {formatCategoryLabel(cat)}
                      </FilterChip>
                    ))}
                    {extraCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowMoreCategories((c) => !c)}
                        className="inline-flex h-12 min-w-[128px] items-center justify-center gap-2 rounded-full border border-white/80 bg-white/68 px-9 text-sm font-bold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:border-emerald-200 hover:text-emerald-700 focus:outline-none"
                      >
                        More
                        <motion.svg
                          animate={{ rotate: showMoreCategories ? 180 : 0 }}
                          className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showMoreCategories && extraCategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex flex-wrap gap-3">
                          {extraCategories.map((cat) => (
                            <FilterChip
                              key={cat}
                              active={selectedCategories.includes(cat)}
                              onClick={() => toggleCategory(cat)}
                            >
                              {formatCategoryLabel(cat)}
                            </FilterChip>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Department — only shown if DB has multiple departments */}
                {departments.length > 0 && (
                  <GlassSelect
                    label="Department"
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    options={[
                      { label: "All Departments", value: "all" },
                      ...departments.map((d) => ({ label: d, value: d })),
                    ]}
                  />
                )}

                {/* Availability */}
                <GlassSelect
                  label="Availability"
                  value={selectedAvailability}
                  onChange={setSelectedAvailability}
                  options={[
                    { label: "All Availability", value: "all" },
                    { label: `Available Now (${availableCount})`, value: "available" },
                    { label: `Limited (${limitedCount})`, value: "limited" },
                  ]}
                />

                {/* Collapse toggle */}
                <button
                  type="button"
                  onClick={() => setFiltersCollapsed((c) => !c)}
                  className="hidden h-11 w-11 place-items-center self-end rounded-full border border-white/80 bg-white/70 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.07)] transition hover:text-emerald-700 focus:outline-none xl:grid"
                  aria-label={filtersCollapsed ? "Expand filters" : "Collapse filters"}
                >
                  <motion.svg
                    animate={{ rotate: filtersCollapsed ? 180 : 0 }}
                    className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 15l7-7 7 7" />
                  </motion.svg>
                </button>
              </div>

              {/* Active filter tags */}
              <AnimatePresence>
                {!filtersCollapsed && activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200/55 pt-4">
                      <span className="text-xs font-bold text-slate-500">Active filters:</span>
                      <AnimatePresence>
                        {search.trim() && (
                          <ActiveFilter onRemove={() => setSearch("")}>Search: {search}</ActiveFilter>
                        )}
                        {selectedCategories.map((cat) => (
                          <ActiveFilter
                            key={cat}
                            onRemove={() => setSelectedCategories((c) => c.filter((i) => i !== cat))}
                          >
                            {formatCategoryLabel(cat)}
                          </ActiveFilter>
                        ))}
                        {selectedDepartment !== "all" && (
                          <ActiveFilter onRemove={() => setSelectedDepartment("all")}>
                            {selectedDepartment}
                          </ActiveFilter>
                        )}
                        {selectedAvailability !== "all" && (
                          <ActiveFilter onRemove={() => setSelectedAvailability("all")}>
                            {selectedAvailability === "available" ? "Available Now" : "Limited"}
                          </ActiveFilter>
                        )}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="ml-auto text-sm font-black text-emerald-700 transition hover:text-emerald-900 focus:outline-none"
                      >
                        Clear all
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── RESULTS HEADER ── */}
        <div className="mx-auto mt-8 flex w-full max-w-[1680px] items-center justify-between gap-4 px-1">
          <motion.p
            key={`${loading}-${filtered.length}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-sm font-black text-slate-800"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </span>
            {loading ? "Loading speakers..." : `${filtered.length} speakers found`}
          </motion.p>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm font-semibold text-slate-500">Sort by:</span>
            <button
              type="button"
              className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-full border border-white/80 bg-white/72 px-6 text-sm font-black text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(15,23,42,0.07)] backdrop-blur-xl"
            >
              Name (A–Z)
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── SPEAKER GRID ── */}
        {filtered.length === 0 && !loading ? (
          <div className="mx-auto mt-6 max-w-[1680px] rounded-[28px] border border-white/80 bg-white/72 px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-950">No speakers matched your search</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Try clearing a filter or searching a different topic.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 min-w-[160px] rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-9 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(16,185,129,0.32)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.section
            className="mx-auto mt-6 grid w-full max-w-[1680px] grid-cols-1 gap-7 px-1 sm:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.045 } } }}
            aria-label="Speaker directory"
          >
            {visibleSpeakers.map((speaker, i) => (
              <motion.div
                key={speaker.speaker_id ?? `${speaker.full_name}-${i}`}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              >
                <SpeakerCard speaker={speaker} />
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* ── LOAD MORE ── */}
        {filtered.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-slate-500">
              Showing {shownCount} of {filtered.length} speakers
            </p>
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + INITIAL_VISIBLE_COUNT)}
                className="inline-flex h-12 min-w-[270px] items-center justify-center gap-3 rounded-full border border-emerald-400/80 bg-white/60 px-8 text-sm font-black text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(16,185,129,0.13)] backdrop-blur-2xl transition hover:bg-emerald-50 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(16,185,129,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
              >
                Load More
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <section className="mx-auto mt-10 max-w-[1680px] overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-white/72 via-emerald-100/55 to-cyan-100/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_42px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-7">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div className="flex min-w-0 items-center gap-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/80 bg-emerald-400/25 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(16,185,129,0.15)] backdrop-blur-xl">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black tracking-[-0.03em] text-emerald-950">
                  Can&apos;t find the right speaker?
                </h2>
                <p className="mt-1 text-base font-semibold text-slate-600">
                  Our team is here to help you find the perfect match for your event.
                </p>
              </div>
            </div>
            <Link
              href="/partners"
              className="inline-flex h-12 min-w-[220px] shrink-0 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-10 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_rgba(16,185,129,0.36)] transition hover:-translate-y-[1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_38px_rgba(16,185,129,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
            >
              Contact Our Team
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
