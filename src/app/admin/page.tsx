"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ActivityFeed } from "@/components/portal/ActivityFeed"
import { ProfileSettings } from "@/components/portal/ProfileSettings"
import { SectionHeader } from "@/components/portal/SectionHeader"

export default function OverviewPage() {
  const [stats, setStats] = useState({ speakers: 0, requests: 0 })
  useEffect(() => {
    void Promise.all([fetch("/api/admin/speakers"), fetch("/api/admin/requests?countOnly=1")]).then(async ([speakerResponse, requestResponse]) => {
      const speakerData = speakerResponse.ok ? await speakerResponse.json() : { speakers: [] }
      const requestData = requestResponse.ok ? await requestResponse.json() : { count: 0 }
      setStats({ speakers: speakerData.speakers?.length ?? 0, requests: requestData.count ?? 0 })
    })
  }, [])

  return (
    <div>
      <SectionHeader eyebrow="Team portal" title="Overview" description="Keep speaker information current and follow community requests from one shared workspace." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/speakers" className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition hover:border-[var(--green-600)]/40"><p className="text-sm font-semibold text-[var(--text-muted)]">Speaker records</p><p className="mt-3 text-4xl font-bold tracking-tight">{stats.speakers}</p><p className="mt-3 text-sm font-semibold text-[var(--green-700)]">Manage speakers →</p></Link>
        <Link href="/admin/requests" className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition hover:border-[var(--green-600)]/40"><p className="text-sm font-semibold text-[var(--text-muted)]">New requests</p><p className="mt-3 text-4xl font-bold tracking-tight">{stats.requests}</p><p className="mt-3 text-sm font-semibold text-[var(--green-700)]">Review requests →</p></Link>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]">
        <div><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Recent activity</h2><Link href="/admin/activity" className="text-sm font-semibold text-[var(--green-700)] hover:underline">View all</Link></div><ActivityFeed compact /></div>
        <div><h2 className="mb-4 text-xl font-bold">Profile and notifications</h2><ProfileSettings /></div>
      </div>
    </div>
  )
}
