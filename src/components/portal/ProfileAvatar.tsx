import Image from "next/image"
import { getSpeakerInitials } from "@/lib/speakerName"

export function ProfileAvatar({ name, url, size = 40 }: { name?: string | null; url?: string | null; size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--mint-100)] font-bold text-[var(--green-600)]"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      aria-hidden="true"
    >
      {url ? <Image src={url} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized /> : getSpeakerInitials(name)}
    </span>
  )
}

