"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Pencil } from "lucide-react"
import type { Speaker } from "@/models/Speaker"
import { formatSpeakerName } from "@/lib/speakerName"
import { formatCategoryLabel, getCategoryName, getDepartmentName, getPrimaryTopic, getSpeakerPhoto, isSpeakerAvailable } from "@/lib/speakerPresentation"
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto"

interface SpeakerCardProps {
  speaker: Partial<Speaker>
  onEdit?: () => void
}

/**
 * Directory/grid card. No fixed height anywhere in this tree — the card and
 * every text row use min-height, so long names/credentials/topics wrap and
 * push the card taller instead of being clipped. The circular "view" arrow
 * sits inside the card's own padding with shrink-0 and no overflow-hidden
 * ancestor, so it can never be cropped.
 */
export function SpeakerCard({ speaker, onEdit }: SpeakerCardProps) {
  const name = formatSpeakerName(speaker.full_name)
  const credentials = speaker.credentials ?? getDepartmentName(speaker) ?? null
  const category = getCategoryName(speaker)
  const topic = getPrimaryTopic(speaker)
  const photo = getSpeakerPhoto(speaker)
  const available = isSpeakerAvailable(speaker)

  const card = (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      aria-label={onEdit ? `Edit profile for ${name}` : undefined}
      onClick={onEdit}
      onKeyDown={onEdit ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onEdit()
        }
      } : undefined}
      className={`group flex h-full min-h-[220px] min-w-0 flex-col border border-[var(--border)] bg-[var(--canvas)] p-5 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] ${onEdit ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]" : ""}`}
      style={{ borderRadius: "var(--radius-card-sm)" }}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <SpeakerPhoto name={name} url={photo} className="h-14 w-14 text-base" />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 title={name} className="text-clamp-2 min-h-10 min-w-0 text-[16px] font-bold leading-[1.25] text-[var(--navy-950)] [overflow-wrap:anywhere]">
                {name}
              </h3>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${available ? "bg-[var(--mint-100)] text-[var(--green-700)]" : "bg-[var(--canvas-subtle)] text-[var(--navy-800)]"}`}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: available ? "var(--green-600)" : "var(--text-muted)" }} />
              {available ? "Available" : "Limited"}
            </span>
          </div>
          {credentials && (
            <p title={credentials} className="text-clamp-2 mt-1 min-w-0 text-[13px] font-medium leading-snug text-[var(--text-muted)] [overflow-wrap:anywhere]">
              {credentials}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex min-w-0 flex-wrap items-center gap-2">
        <span
          className="inline-flex min-w-0 items-center px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--blue-600)]"
          style={{ borderRadius: "var(--radius-circle)", backgroundColor: "var(--blue-100)" }}
        >
          <span className="truncate">{formatCategoryLabel(category)}</span>
        </span>
      </div>

      {topic && (
        <div className="mt-3 flex min-w-0 flex-1 items-start gap-2 border-t border-[var(--border)] pt-3">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.25c-1.14 0-2.7-.44-3.85-1.15A9.51 9.51 0 0 0 3 4v13a9.51 9.51 0 0 1 5.15 1.1c1.15.71 2.71 1.15 3.85 1.15m0-13.25c1.14 0 2.7-.44 3.85-1.15A9.51 9.51 0 0 1 21 4v13a9.51 9.51 0 0 0-5.15 1.1C14.7 18.81 13.14 19.25 12 19.25m0-13.25v13.25"
            />
          </svg>
          <p title={topic} className="text-clamp-2 min-w-0 flex-1 text-[13px] leading-snug text-[var(--text-muted)]">
            {topic}
          </p>
        </div>
      )}

      <div className={`mt-3 flex items-center ${onEdit ? "justify-between" : "justify-end"}`}>
        {onEdit && <span className="text-sm font-semibold text-[var(--green-700)]">Edit profile</span>}
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center text-[var(--green-600)] transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ borderRadius: "var(--radius-circle)", backgroundColor: "var(--mint-100)" }}
        >
          {onEdit ? <Pencil className="h-4 w-4" strokeWidth={2.25} /> : <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
        </span>
      </div>
    </motion.article>
  )

  if (onEdit || !speaker.speaker_id) return card

  return (
    <Link
      href={`/speakers/${speaker.speaker_id}`}
      className="block h-full min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]"
      style={{ borderRadius: "var(--radius-card-sm)" }}
      aria-label={`View profile for ${name}`}
    >
      {card}
    </Link>
  )
}

export function SpeakerCardSkeleton() {
  return (
    <div
      className="flex h-full min-h-[220px] min-w-0 flex-col border border-[var(--border)] bg-[var(--canvas)] p-5 shadow-[var(--shadow-sm)]"
      style={{ borderRadius: "var(--radius-card-sm)" }}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3.5">
        <div className="h-14 w-14 shrink-0 animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-circle)" }} />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-input)" }} />
          <div className="h-3 w-1/2 animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-input)" }} />
        </div>
      </div>
      <div className="mt-3.5 h-6 w-28 animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-circle)" }} />
      <div className="mt-3 flex-1 space-y-2 border-t border-[var(--border)] pt-3">
        <div className="h-3 w-full animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-input)" }} />
        <div className="h-3 w-2/3 animate-pulse bg-[var(--canvas-subtle)]" style={{ borderRadius: "var(--radius-input)" }} />
      </div>
    </div>
  )
}
