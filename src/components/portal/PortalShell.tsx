"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Activity, BookOpen, LayoutDashboard, Menu, Mic2, X, Inbox, Bell, LogOut, Eye, ChevronDown, UserRound } from "lucide-react"
import { supabase } from "@/supabaseClient"
import type { TeamProfile } from "@/types/database"
import { ProfileAvatar } from "@/components/portal/ProfileAvatar"

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Speakers", href: "/admin/speakers", icon: Mic2 },
  { label: "Requests", href: "/admin/requests", icon: Inbox },
  { label: "Activity", href: "/admin/activity", icon: Activity },
  { label: "FAQ and Support", href: "/admin/faq", icon: BookOpen },
]

function NotificationIndicator({ enabled }: { enabled: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const refresh = async () => {
      const response = await fetch("/api/admin/requests?countOnly=1")
      if (response.ok) setCount((await response.json()).count ?? 0)
    }
    void refresh()
    const channel = supabase.channel("portal-new-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "speaker_requests" }, () => {
        setCount((value) => value + 1)
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [enabled])

  return (
    <Link href="/admin/requests" className="relative grid h-10 w-10 place-items-center rounded-[var(--radius-input)] border border-[var(--border)] bg-white text-[var(--navy-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]" aria-label={`${count} new requests`}>
      <Bell className="h-4.5 w-4.5" aria-hidden="true" />
      {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--green-600)] px-1 text-[10px] font-bold text-white">{Math.min(count, 99)}</span>}
    </Link>
  )
}

export function PortalShell({ profile, children }: { profile: TeamProfile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const displayName = profile.full_name || profile.email || "Team member"

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setOpen(false)
      setProfileMenuOpen(false)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [pathname])

  useEffect(() => {
    if (!profileMenuOpen) return
    function closeProfileMenu(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setProfileMenuOpen(false)
        return
      }
      if (profileMenuRef.current && event.target instanceof Node && !profileMenuRef.current.contains(event.target)) setProfileMenuOpen(false)
    }
    document.addEventListener("mousedown", closeProfileMenu)
    document.addEventListener("keydown", closeProfileMenu)
    return () => {
      document.removeEventListener("mousedown", closeProfileMenu)
      document.removeEventListener("keydown", closeProfileMenu)
    }
  }, [profileMenuOpen])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError("")
    const { error } = await supabase.auth.signOut()
    if (error) {
      setSignOutError(error.message)
      setSigningOut(false)
      return
    }
    router.replace("/login")
    router.refresh()
  }

  const navigation = (
    <>
      <Link href="/admin" className="flex h-20 items-center border-b border-[var(--border)] px-6" aria-label="Team Dashboard">
        <Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={170} height={46} className="h-9 w-auto object-contain" unoptimized />
      </Link>
      <nav aria-label="Team portal" className="flex-1 space-y-1 p-4">
        {items.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-input)] px-3.5 text-sm font-semibold transition ${active ? "bg-[var(--mint-100)] text-[var(--green-600)]" : "text-[var(--navy-800)] hover:bg-[var(--canvas-subtle)]"}`}>
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Link href="/speakers" className="flex min-h-11 items-center gap-3 rounded-[var(--radius-input)] px-3.5 text-sm font-semibold text-[var(--blue-600)] transition hover:bg-[var(--blue-100)]">
            <Eye className="h-4.5 w-4.5" aria-hidden="true" />
            Public View
          </Link>
        </div>
      </nav>
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex min-w-0 items-center gap-3 px-2 py-2">
          <ProfileAvatar name={displayName} url={profile.avatar_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--navy-950)]">{displayName}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{profile.title || "Team member"}</p>
          </div>
        </div>
        <button type="button" onClick={signOut} disabled={signingOut} className="mt-2 flex min-h-10 w-full items-center gap-3 rounded-[var(--radius-input)] px-3 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--canvas-subtle)] hover:text-[var(--navy-950)] disabled:opacity-60">
          <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--canvas-subtle)] text-[var(--navy-950)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[var(--border)] bg-white lg:flex">{navigation}</aside>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[var(--navy-950)]/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col bg-white shadow-[var(--shadow-lg)] transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>{navigation}</aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-[var(--radius-input)] border border-[var(--border)] lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open navigation">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="hidden text-sm font-semibold text-[var(--text-muted)] sm:block">Team Dashboard <span aria-hidden="true">·</span> Lee Health Speakers Bureau</p>
          <div className="flex items-center gap-3">
            <NotificationIndicator enabled={profile.notifications_enabled} />
            <div ref={profileMenuRef} className="relative">
              <button type="button" onClick={() => { setProfileMenuOpen((value) => !value); setSignOutError("") }} aria-haspopup="menu" aria-expanded={profileMenuOpen} aria-controls="team-profile-menu" className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] border border-transparent px-1.5 text-left transition hover:border-[var(--border)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]" aria-label="Open team member profile menu">
                <ProfileAvatar name={displayName} url={profile.avatar_url} size={36} />
                <span className="hidden max-w-36 truncate text-sm font-semibold text-[var(--navy-950)] md:block">{displayName}</span>
                <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {profileMenuOpen && (
                <div id="team-profile-menu" role="menu" aria-label="Team member profile" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-[var(--radius-card-sm)] border border-[var(--border)] bg-white shadow-[var(--shadow-lg)]">
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="truncate text-sm font-bold text-[var(--navy-950)]">{displayName}</p>
                    {profile.email && <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{profile.email}</p>}
                    <p className="mt-1 text-xs font-semibold text-[var(--green-700)]">Team member</p>
                  </div>
                  <div className="p-2">
                    <Link href="/admin#profile-settings" role="menuitem" className="flex min-h-10 items-center gap-3 rounded-[var(--radius-input)] px-3 text-sm font-semibold text-[var(--navy-800)] hover:bg-[var(--canvas-subtle)]">
                      <UserRound className="h-4 w-4" aria-hidden="true" /> Profile settings
                    </Link>
                    <Link href="/speakers" role="menuitem" className="flex min-h-10 items-center gap-3 rounded-[var(--radius-input)] px-3 text-sm font-semibold text-[var(--navy-800)] hover:bg-[var(--canvas-subtle)]">
                      <Eye className="h-4 w-4" aria-hidden="true" /> Public View
                    </Link>
                    <button type="button" role="menuitem" onClick={signOut} disabled={signingOut} className="flex min-h-10 w-full items-center gap-3 rounded-[var(--radius-input)] px-3 text-left text-sm font-semibold text-[var(--error)] hover:bg-red-50 disabled:opacity-60">
                      <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
                    </button>
                    {signOutError && <p role="alert" className="px-3 py-2 text-xs text-[var(--error)]">{signOutError}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
