import type { ElementType, ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

/** max-width 1440px, margin-inline auto, padding-inline clamp(20px, 4vw, 72px). */
export function Container({ children, className = "", as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-[1440px] px-[clamp(20px,4vw,72px)] ${className}`}>
      {children}
    </Tag>
  )
}
