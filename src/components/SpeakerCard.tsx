"use client"

import type { Speaker } from "@/models/Speaker"
import Image from "next/image"
import Link from "next/link"

interface SpeakerCardProps {
  speaker: Speaker
}

export default function SpeakerCard({ speaker }: SpeakerCardProps) {
  const initials = speaker.full_name
    ? speaker.full_name
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  const firstSeminar = speaker.seminars?.[0]
  const category = firstSeminar?.categories
  const department = firstSeminar?.departments?.name
  const status = firstSeminar?.statuses?.label ?? "Active"
  const isActive = status.toLowerCase() === "active" || status.toLowerCase() === ""

  return (
    <Link href={`/speakers/${speaker.speaker_id}`} className="block group">
      <article
        className="
          relative overflow-hidden rounded-[24px]
          border border-white/70 bg-white/80 backdrop-blur-xl
          shadow-[0_6px_22px_rgba(15,23,42,0.05)]
          transition-all duration-300
          hover:-translate-y-0.5 hover:bg-white/90
          hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]
        "
      >
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-br from-teal-100/70 via-blue-100/60 to-transparent" />

        <div className="relative flex min-h-[185px] flex-col items-center justify-center px-4 py-5 text-center">
          <div className="relative mb-3">
            {speaker.headshot_url ? (
              <Image
                src={speaker.headshot_url}
                alt={speaker.full_name ?? "Speaker"}
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-full object-cover ring-[3px] ring-white shadow-sm"
              />
            ) : (
              <div
                className="
                  flex h-[72px] w-[72px] items-center justify-center rounded-full
                  bg-gradient-to-br from-teal-100 to-blue-100
                  text-lg font-bold text-teal-700
                  ring-[3px] ring-white shadow-sm
                "
              >
                {initials}
              </div>
            )}

            <span
              className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-white ${
                isActive ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
            {speaker.full_name}
          </h3>

          {speaker.credentials && (
            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-gray-400">
              {speaker.credentials}
            </p>
          )}

          {department && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
              {department}
            </p>
          )}

          {category && (
            <span
              className="mt-3 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `${category.color_hex}18`,
                color: category.color_hex,
                border: `1px solid ${category.color_hex}30`,
              }}
            >
              {category.name}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}