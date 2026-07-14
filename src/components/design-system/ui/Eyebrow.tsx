import type { ElementType, ReactNode } from "react"

interface EyebrowProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

/** 12px / weight 750 / 0.18em tracking / uppercase / green-600 — the one small tracked label used everywhere. */
export function Eyebrow({ children, className = "", as: Tag = "p" }: EyebrowProps) {
  return (
    <Tag
      className={`text-[length:var(--type-eyebrow-size)] font-[var(--type-eyebrow-weight)] uppercase tracking-[var(--type-eyebrow-tracking)] text-[var(--green-600)] ${className}`}
    >
      {children}
    </Tag>
  )
}
