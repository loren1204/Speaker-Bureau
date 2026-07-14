import type { ReactNode } from "react"

export type IconCircleVariant = "mint" | "outline"

const VARIANT_CLASSES: Record<IconCircleVariant, string> = {
  mint: "bg-[var(--mint-100)] text-[var(--green-600)]",
  outline: "border border-[var(--border)] bg-transparent text-[var(--navy-800)]",
}

interface IconCircleProps {
  children: ReactNode
  variant?: IconCircleVariant
  size?: number
  className?: string
}

/** Reusable circular icon container — mint-filled or outlined. */
export function IconCircle({ children, variant = "mint", size = 48, className = "" }: IconCircleProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${VARIANT_CLASSES[variant]} ${className}`}
      style={{ width: size, height: size, borderRadius: "var(--radius-circle)" }}
    >
      {children}
    </span>
  )
}
