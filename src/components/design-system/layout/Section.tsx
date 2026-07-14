import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

type SectionSpacing = "sm" | "md" | "lg"

const SPACING: Record<SectionSpacing, string> = {
  sm: "py-10 sm:py-14",
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-28",
}

interface SectionOwnProps {
  children: ReactNode
  spacing?: SectionSpacing
  className?: string
  as?: ElementType
}

type SectionProps = SectionOwnProps & Omit<ComponentPropsWithoutRef<"section">, keyof SectionOwnProps>

/** Consistent vertical rhythm wrapper — every page section shares one of three spacing steps. */
export function Section({ children, spacing = "lg", className = "", as: Tag = "section", ...rest }: SectionProps) {
  return (
    <Tag className={`${SPACING[spacing]} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
