"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { label: "Speakers", href: "/speakers" },
    { label: "About Us", href: "/about" },
    { label: "For Partners", href: "/partners" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/50 bg-white/80 shadow-[0_1px_20px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                  active ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:inline-flex"
          >
            Sign In
          </button>

          <Link
            href="/request"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            Request a Speaker
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Mobile menu — hamburger (wire up as needed) */}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
