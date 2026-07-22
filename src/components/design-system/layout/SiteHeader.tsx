"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { LinkButton } from "@/components/design-system/ui/Button"
import { useAuth } from "@/context/AuthContext"

const NAV_LINKS = [
  { label: "Speakers", href: "/speakers" },
  { label: "About Us", href: "/about" },
  { label: "For Partners", href: "/partners" },
  { label: "FAQ", href: "/faq" },
] as const

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SiteHeaderProps {
  /** Preview-only: lets the demo page show every nav state without real routing. */
  activeHrefOverride?: string
}

/**
 * White elevated shell, 3-column grid (logo | centered nav | auth actions),
 * ~80px tall, rounded 24-28px, soft shadow, thin border, backdrop-blur.
 * Active nav link is darker green text + an animated teal underline shared
 * via layoutId — no pill background.
 */
export function SiteHeader({ activeHrefOverride }: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isStakeholder } = useAuth()
  const isTeamMember = Boolean(user && isStakeholder)
  const teamLinkLabel = isTeamMember
    ? pathname.startsWith("/speakers") ? "Return to Team Dashboard" : "Team Dashboard"
    : "Team login"
  const teamLinkHref = isTeamMember ? "/admin" : "/login"

  useEffect(() => {
    const handle = window.setTimeout(() => setMenuOpen(false), 0)
    return () => window.clearTimeout(handle)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="mx-auto grid w-full max-w-[1440px] items-center gap-4 border border-[var(--border)] bg-[var(--canvas)]/92 px-6 shadow-[var(--shadow-md)] backdrop-blur-xl sm:px-8"
        style={{ gridTemplateColumns: "1fr auto 1fr", height: "80px", borderRadius: "var(--radius-header)" }}
      >
        <Link href="/" className="flex items-center justify-self-start rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]">
          <Image
            src="/speaker_logo.png"
            alt="Lee Health Speakers Bureau"
            width={180}
            height={48}
            className="h-9 w-auto object-contain"
            style={{ width: "auto" }}
            priority
            unoptimized
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-10 justify-self-center md:flex">
          {NAV_LINKS.map((item) => {
            const active = activeHrefOverride ? activeHrefOverride === item.href : isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] ${
                  active ? "text-[var(--green-600)]" : "text-[var(--navy-800)] hover:text-[var(--navy-950)]"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="ds-nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[var(--teal-500)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <Link href={teamLinkHref} className={`hidden text-sm font-semibold lg:block ${isTeamMember ? "rounded-[var(--radius-button)] bg-[var(--mint-100)] px-3 py-2 text-[var(--green-700)]" : "text-[var(--navy-800)] hover:text-[var(--green-600)]"}`}>
            {teamLinkLabel}
          </Link>
          <div className="hidden sm:block">
            <LinkButton href="/partners" size="md">
              Request a Speaker
            </LinkButton>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="ds-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center border border-[var(--border)] text-[var(--navy-800)] transition hover:text-[var(--navy-950)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] md:hidden"
            style={{ borderRadius: "var(--radius-circle)" }}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="ds-mobile-nav"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2 w-full max-w-[1440px] overflow-hidden border border-[var(--border)] bg-[var(--canvas)] shadow-[var(--shadow-lg)] md:hidden"
            style={{ borderRadius: "var(--radius-card-sm)" }}
          >
            <nav aria-label="Mobile" className="flex flex-col p-3">
              {NAV_LINKS.map((item) => {
                const active = activeHrefOverride ? activeHrefOverride === item.href : isActivePath(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`min-h-[44px] px-4 py-3 text-sm font-semibold ${active ? "bg-[var(--mint-100)] text-[var(--green-600)]" : "text-[var(--navy-800)]"}`}
                    style={{ borderRadius: "var(--radius-input)" }}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-2 border-t border-[var(--border)] pt-3">
                <Link href={teamLinkHref} className={`mb-2 flex min-h-11 items-center rounded-[var(--radius-input)] px-4 text-sm font-semibold ${isTeamMember ? "bg-[var(--mint-100)] text-[var(--green-700)]" : "text-[var(--navy-800)]"}`}>{teamLinkLabel}</Link>
                <LinkButton href="/partners" size="md" className="w-full">
                  Request a Speaker
                </LinkButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
