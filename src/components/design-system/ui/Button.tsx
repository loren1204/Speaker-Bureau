"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"

// Framer Motion's drag/animation event props have signatures that don't
// structurally match the native DOM event handlers of the same name, so
// spreading the full native attribute set onto a motion.* component is a
// type error. These are the only overlapping keys — everything else
// passes through untouched.
type MotionConflictingProps = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-[54px] px-8 text-base",
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border border-transparent text-white shadow-[var(--shadow-sm)]",
  secondary: "border border-[var(--border)] bg-[var(--canvas)] text-[var(--navy-950)] hover:border-[var(--navy-800)]/40",
  ghost: "border border-transparent bg-transparent text-[var(--navy-800)] hover:bg-[var(--mint-100)]",
}

function buttonClass(variant: ButtonVariant, size: ButtonSize, className: string) {
  return [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  ].join(" ")
}

function buttonStyle(variant: ButtonVariant, style?: CSSProperties): CSSProperties {
  return {
    borderRadius: "var(--radius-button)",
    ...(variant === "primary" ? { backgroundColor: "var(--green-600)" } : {}),
    ...style,
  }
}

// Hover lift + press scale. Framer Motion's reducedMotion="user" (set via
// MotionConfig at the app/preview root) automatically neutralizes these
// transforms for users who prefer reduced motion — no extra branching here.
const MOTION_PROPS = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const },
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
    </svg>
  )
}

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | MotionConflictingProps> {
  variant?: ButtonVariant
  size?: ButtonSize
  style?: CSSProperties
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", style, loading = false, disabled, children, type = "button", ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...MOTION_PROPS}
      className={buttonClass(variant, size, className)}
      style={buttonStyle(variant, style)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  )
})

// A real motion-enhanced <Link> — not a wrapper span around it — so a
// caller-supplied className like "w-full" applies to the actual anchor
// instead of fighting an inline-block wrapper's own sizing.
const MotionLink = motion.create(Link)

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "style" | MotionConflictingProps> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  style?: CSSProperties
  children: ReactNode
}

export function LinkButton({ href, variant = "primary", size = "md", className = "", style, children, ...props }: LinkButtonProps) {
  return (
    <MotionLink href={href} {...MOTION_PROPS} className={buttonClass(variant, size, className)} style={buttonStyle(variant, style)} {...props}>
      {children}
    </MotionLink>
  )
}
