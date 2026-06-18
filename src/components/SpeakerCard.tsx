"use client"

import type { Speaker } from "@/models/Speaker"
import Image from "next/image"
import Link from "next/link"

interface SpeakerCardProps {
  speaker: Speaker
}

export default function SpeakerCard({ speaker }: SpeakerCardProps) {
  const initials = speaker.full_name
    ? speaker.full_name.split(/[,\s]+/).filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  const firstSeminar = speaker.seminars?.[0]
  const category     = firstSeminar?.categories
  const department   = firstSeminar?.departments?.name
  const isActive     = speaker.is_active ?? true

  // Get all unique categories from all seminars
  const allCategories = speaker.seminars
    ?.map(s => s.categories)
    .filter((c): c is { name: string; color_hex: string } => !!c)
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    .slice(0, 2) ?? []

  return (
    <Link href={`/speakers/${speaker.speaker_id}`} className="block group">
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden p-5">

        {/* Status dot */}
        <div className="absolute top-3.5 right-3.5">
          <span className={`w-2.5 h-2.5 rounded-full block ${isActive ? "bg-emerald-400" : "bg-yellow-400"}`} />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            {speaker.headshot_url ? (
              <Image
                src={speaker.headshot_url}
                alt={speaker.full_name ?? "Speaker"}
                width={80}
                height={80}
                className="rounded-full object-cover ring-2 ring-gray-100"
                style={{ width: 80, height: 80 }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center text-xl font-bold text-gray-500 bg-gray-100 ring-2 ring-gray-100"
                style={{ width: 80, height: 80 }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {speaker.full_name}
            </h3>
            {speaker.credentials && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{speaker.credentials}</p>
            )}
            {department && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{department}</p>
            )}
          </div>

          {/* Category badges */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {allCategories.map(cat => (
                <span
                  key={cat.name}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: cat.color_hex + "18",
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
      </div>
    </Link>
  )
}
