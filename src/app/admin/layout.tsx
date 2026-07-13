"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { label: "Manage Speaker Data", href: "/admin/speakers" },
  { label: "Handoff & FAQ Guide", href: "/admin/faq" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isStakeholder, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f0fdf8_0%,#eff6ff_50%,#f8faff_100%)]">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }
  if (!user) return null

  if (!isStakeholder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f0fdf8_0%,#eff6ff_50%,#f8faff_100%)] px-6">
        <div className="max-w-md rounded-[24px] border border-white/80 bg-white/72 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
          <h1 className="text-xl font-black text-slate-900">Access restricted</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account doesn't have stakeholder permissions yet. Contact an admin to be upgraded.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(160deg,#f8fcff_0%,#eff7ff_38%,#f2fbf7_68%,#fbfdff_100%)]">
      <aside className="flex w-72 shrink-0 flex-col border-r border-white/70 bg-white/70 p-6 backdrop-blur-2xl">
        <Link href="/speakers" className="mb-8 block">
          <Image src="/speaker_logo.png" alt="Lee Health" width={160} height={44} className="h-9 w-auto object-contain" unoptimized />
        </Link>

        <p className="mb-3 px-2 text-xs font-black uppercase tracking-widest text-slate-400">Admin</p>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 space-y-1.5 border-t border-slate-200/60 pt-4">
          <Link
            href="/speakers"
            className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            ← Back to public site
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-10">{children}</main>
    </div>
  )
}