"use client"

import { motion } from "framer-motion"
import type { ButtonHTMLAttributes, ReactNode } from "react"

// See Button.tsx for why these specific keys are omitted — Framer Motion's
// drag/animation event props don't structurally match the native DOM
// handlers of the same name.
type MotionConflictingProps = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | MotionConflictingProps> {
  active?: boolean
  children: ReactNode
}

/** Filter/category pill — default outline state, active state fills with the primary gradient. */
export function Chip({ active = false, children, className = "", type = "button", ...props }: ChipProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      aria-pressed={active}
      className={`inline-flex h-9 items-center justify-center whitespace-nowrap border px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] focus-visible:ring-offset-2 ${
        active
          ? "border-transparent text-white"
          : "border-[var(--border)] bg-[var(--canvas)] text-[var(--navy-800)] hover:border-[var(--teal-500)]/60 hover:text-[var(--navy-950)]"
      } ${className}`}
      style={{
        borderRadius: "var(--radius-circle)",
        ...(active ? { backgroundColor: "var(--green-600)" } : {}),
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
