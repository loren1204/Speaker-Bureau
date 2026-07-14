"use client"

import { motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"

export type CardRadius = "lg" | "sm"
export type CardShadow = "sm" | "md" | "lg" | "none"
export type CardPadding = "sm" | "md" | "lg" | "none"

const RADIUS_VAR: Record<CardRadius, string> = {
  lg: "var(--radius-card-lg)", // form-sized card: 22-24px
  sm: "var(--radius-card-sm)", // small card: 14-16px
}

const SHADOW_VAR: Record<Exclude<CardShadow, "none">, string> = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: "",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
}

interface CardProps {
  children: ReactNode
  radius?: CardRadius
  shadow?: CardShadow
  padding?: CardPadding
  /** ~3px lift on hover, 160-220ms — opt in per usage (e.g. clickable cards), not universal. */
  hoverLift?: boolean
  className?: string
  style?: CSSProperties
}

/** Base card — every other card in the system is this with different radius/shadow/padding. */
export function Card({ children, radius = "lg", shadow = "md", padding = "md", hoverLift = false, className = "", style }: CardProps) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -3 } : undefined}
      transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}
      className={`border border-[var(--border)] bg-[var(--canvas)] ${PADDING_CLASS[padding]} ${className}`}
      style={{
        borderRadius: RADIUS_VAR[radius],
        boxShadow: shadow === "none" ? undefined : SHADOW_VAR[shadow],
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}
