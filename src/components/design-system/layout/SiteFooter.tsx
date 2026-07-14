import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/design-system/layout/Container"

const NAV_LINKS = [
  { label: "Speakers", href: "/speakers" },
  { label: "About Us", href: "/about" },
  { label: "For Partners", href: "/partners" },
  { label: "FAQ", href: "/faq" },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--canvas-subtle)]">
      <Container className="flex flex-col items-center gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]">
          <Image
            src="/speaker_logo.png"
            alt="Lee Health Speakers Bureau"
            width={160}
            height={44}
            className="h-8 w-auto object-contain"
            style={{ width: "auto" }}
            unoptimized
          />
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[var(--navy-800)] transition-colors hover:text-[var(--green-600)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-[length:var(--type-label-size)] text-[var(--text-muted)]">
          © {new Date().getFullYear()} Lee Health Speakers Bureau
        </p>
      </Container>
    </footer>
  )
}
