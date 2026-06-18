import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { supabase } from "@/supabaseClient"
import type { Speaker } from "@/models/Speaker"
import {
  Apple,
  Stethoscope,
  Pill,
  Ribbon,
  Leaf,
  Activity,
  HeartPulse,
  Bone,
  UserRound,
  HandHeart,
  Baby,
  Brain,
  Info,
} from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  const { data, error } = await supabase
    .from("speakers")
    .select(`
      *,
      seminars (
        seminar_id, title, description, scheduled_at,
        categories ( name, color_hex ),
        departments ( name ),
        statuses ( label, color_hex )
      ),
      speaker_topics (
        topics ( title )
      ),
      speaker_contacts (
        contact_id, contact
      )
    `)
    .eq("speaker_id", id)
    .single()

  if (error || !data) return null
  return data as Speaker
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const speaker = await getSpeaker(id)

  if (!speaker) return {}

  return {
    title: speaker.full_name,
    description: speaker.bio ?? speaker.seminars?.[0]?.description ?? undefined,
  }
}

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase()

  const iconClass = "w-6 h-6"

  if (name.includes("nutrition")) {
    return <Apple className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("surgery")) {
    return <Stethoscope className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("pharmacy")) {
    return <Pill className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("cancer")) {
    return <Ribbon className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("integrative") || name.includes("lifestyle")) {
    return <Leaf className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("vascular")) {
    return <Activity className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("cardiac")) {
    return <HeartPulse className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("orthopedics") || name.includes("pt")) {
    return <Bone className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("specialists")) {
    return <UserRound className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("caregiving")) {
    return <HandHeart className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("pediatrics")) {
    return <Baby className={iconClass} strokeWidth={1.7} />
  }

  if (name.includes("mental")) {
    return <Brain className={iconClass} strokeWidth={1.7} />
  }

  return <Info className={iconClass} strokeWidth={1.7} />
}

function getCategoryBg(colorHex: string) {
  return colorHex + "20"
}

export default async function SpeakerProfilePage({ params }: Props) {
  const { id } = await params
  const speaker = await getSpeaker(id)

  if (!speaker) notFound()

  const initials = speaker.full_name
    ? speaker.full_name
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  const isActive = speaker.is_active ?? true
  const department = speaker.seminars?.[0]?.departments?.name
  const seminarCount = speaker.seminars?.length ?? 0

  const allCategories =
    speaker.seminars
      ?.map((s) => s.categories)
      .filter((c): c is { name: string; color_hex: string } => !!c)
      .filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/speakers" className="flex items-center shrink-0">
            <Image
              src="/speaker_logo.png"
              alt="Lee Health Speakers Bureau"
              width={160}
              height={44}
              className="object-contain"
              style={{ width: "auto", height: "44px" }}
              unoptimized
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Speakers", "About Us", "For Partners"].map((item) => (
              <Link
                key={item}
                href={item === "Speakers" ? "/speakers" : "#"}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  item === "Speakers"
                    ? "text-green-600 border-b-2 border-green-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
              Sign In
            </button>

            <button className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
              Request a Speaker
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Link
          href="/speakers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to directory
        </Link>

        <div className="flex gap-8 items-start">
          <aside className="w-72 shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-50">
                <div className="relative mb-4">
                  {speaker.headshot_url ? (
                    <Image
                      src={speaker.headshot_url}
                      alt={speaker.full_name ?? "Speaker"}
                      width={96}
                      height={96}
                      className="rounded-full object-cover ring-4 ring-white shadow-md"
                      style={{ width: 96, height: 96 }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-2xl font-bold text-green-700 ring-4 ring-white shadow-md">
                      {initials}
                    </div>
                  )}

                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                      isActive ? "bg-emerald-400" : "bg-yellow-400"
                    }`}
                  />
                </div>

                <h1 className="text-center font-bold text-gray-900 text-lg leading-snug">
                  {speaker.full_name}
                  {speaker.credentials && (
                    <span className="font-normal text-gray-500 text-base">
                      , {speaker.credentials}
                    </span>
                  )}
                </h1>

                {department && (
                  <p className="text-sm text-gray-500 mt-1 text-center">{department}</p>
                )}

                {allCategories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {allCategories.map((cat) => (
                      <span
                        key={cat.name}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: cat.color_hex + "20",
                          color: cat.color_hex,
                          border: `1px solid ${cat.color_hex}30`,
                        }}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {speaker.bio && (
                <div className="px-6 py-5 border-b border-gray-50">
                  <p className="text-xs font-bold tracking-widest text-green-600 mb-2">ABOUT</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{speaker.bio}</p>
                </div>
              )}

              {speaker.speaker_topics && speaker.speaker_topics.length > 0 && (
                <div className="px-6 py-5 border-b border-gray-50">
                  <p className="text-xs font-bold tracking-widest text-green-600 mb-3">
                    AREAS OF EXPERTISE
                  </p>

                  <div className="flex flex-col gap-2">
                    {speaker.speaker_topics.map(({ topics }) => (
                      <div key={topics.title} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">{topics.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-5">
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isActive
                      ? "bg-green-50 border border-green-100"
                      : "bg-yellow-50 border border-yellow-100"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-green-600" : "text-yellow-600"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-green-700" : "text-yellow-700"
                      }`}
                    >
                      {isActive ? "Available for events" : "Limited availability"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Typically responds within 1–2 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-8 py-7 border-b border-gray-100">
                <p className="text-xs font-bold tracking-[0.18em] text-green-600 mb-2">
                  SEMINARS & TOPICS
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Seminars by {speaker.full_name?.split(",").reverse().join(" ").trim()}
                  </h2>

                  <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 border border-green-100">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l3-2 3 2-.75-3M3 5h18M5 5h14v9H5V5z"
                      />
                    </svg>

                    <span className="text-sm font-semibold text-green-700">
                      {seminarCount} seminar{seminarCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <p className="text-base text-gray-500 leading-relaxed">
                  Explore available presentations, speaking topics, and educational programs.
                </p>
              </div>

              {!speaker.seminars || speaker.seminars.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <p className="text-gray-400 text-sm">No seminars listed yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {speaker.seminars.map((seminar) => {
                    const cat = seminar.categories
                    const statusLabel = seminar.statuses?.label ?? "Active"
                    const isAvailable =
                      statusLabel.toLowerCase() === "active" ||
                      statusLabel.toLowerCase() === ""
                    const isContact = statusLabel.toLowerCase() === "contact"

                    return (
                      <div
                        key={seminar.seminar_id}
                        className="flex items-start gap-5 px-8 py-8 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{
                            backgroundColor: cat ? getCategoryBg(cat.color_hex) : "#f3f4f6",
                            color: cat?.color_hex ?? "#6b7280",
                          }}
                        >
                          {getCategoryIcon(cat?.name ?? "")}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-2">
                            {seminar.title}
                          </h3>

                          {seminar.description && (
                            <p className="text-sm text-gray-500 leading-7 line-clamp-2 mb-3">
                              {seminar.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {cat && (
                              <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{
                                  backgroundColor: cat.color_hex + "18",
                                  color: cat.color_hex,
                                  border: `1px solid ${cat.color_hex}30`,
                                }}
                              >
                                {cat.name}
                              </span>
                            )}

                            {seminar.scheduled_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(seminar.scheduled_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                              isAvailable
                                ? "bg-green-50 text-green-700 border-green-200"
                                : isContact
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {isAvailable ? "Available" : isContact ? "Contact" : statusLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Looking for a specific topic or speaker?
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Our team can help you find the perfect speaker for your event.
                  </p>
                </div>
              </div>

              <Link
                href="/speakers"
                className="shrink-0 text-sm font-semibold text-green-600 transition-colors hover:text-green-700"
              >
                Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}