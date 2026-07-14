import type { Metadata } from "next"
import { DesignSystemPreview } from "./DesignSystemPreview"

// Internal review tool only — not part of the public site, not linked from
// any nav, and must never be indexed.
export const metadata: Metadata = {
  title: "Design System Preview",
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  return <DesignSystemPreview />
}
