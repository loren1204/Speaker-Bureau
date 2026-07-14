import Image from "next/image"
import { getSpeakerInitials } from "@/lib/speakerName"

export function SpeakerPhoto({ name, url, className = "h-16 w-16", priority = false }: { name?: string | null; url?: string | null; className?: string; priority?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--mint-100)] ${className}`}>
      {url ? (
        <Image src={url} alt={`Portrait of ${name || "speaker"}`} fill sizes="128px" className="object-cover object-top" priority={priority} unoptimized />
      ) : (
        <div className="grid h-full w-full place-items-center font-bold text-[var(--green-600)]" aria-label={`Photo placeholder for ${name || "speaker"}`}>
          {getSpeakerInitials(name)}
        </div>
      )}
    </div>
  )
}

