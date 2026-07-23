"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ActivityLogEntry } from "@/types/database"
import { ProfileAvatar } from "@/components/portal/ProfileAvatar"
import { EmptyState } from "@/components/portal/EmptyState"
import { supabase } from "@/supabaseClient"

function entityHref(entry: ActivityLogEntry) {
  if (entry.entity_type === "speaker" && entry.entity_id) return `/admin/speakers?speaker=${entry.entity_id}`
  if (entry.entity_type === "request" && entry.entity_id) return `/admin/requests?request=${entry.entity_id}`
  return null
}

function timeLabel(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
}

export function ActivityFeed({ compact = false }: { compact?: boolean }) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState("")
  const [activityAvailable, setActivityAvailable] = useState(true)

  async function load(offset = 0) {
    const response = await fetch(`/api/admin/activity?offset=${offset}`)
    const data = await response.json().catch(() => ({})) as { entries?: ActivityLogEntry[]; hasMore?: boolean; activityAvailable?: boolean; error?: string }
    if (!response.ok) { setError(data.error ? `Activity could not be loaded. ${data.error}` : "Activity could not be loaded."); setLoading(false); return }
    if (!Array.isArray(data.entries)) { setError("Activity could not be loaded. The service returned an invalid response."); setLoading(false); return }
    const loadedEntries = data.entries
    setError("")
    setEntries((current) => offset ? [...current, ...loadedEntries] : loadedEntries)
    setHasMore(data.hasMore === true)
    setActivityAvailable(data.activityAvailable !== false)
    setLoading(false)
  }

  useEffect(() => {
    // load updates React state only after its awaited network response resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    const channel = supabase.channel("portal-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, () => { void load() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
    // The mount-scoped loader and Realtime subscription must not be recreated after state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => compact ? entries.slice(0, 6) : entries, [compact, entries])
  if (loading) return <div role="status" className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-muted)]">Loading activity…</div>
  if (error) return <p role="alert" className="text-sm text-[var(--error)]">{error}</p>
  if (!activityAvailable) return <EmptyState title="Activity tracking is not enabled yet" description="Apply the activity-log database migration to begin recording team changes." />
  if (!visible.length) return <EmptyState title="No activity yet" description="Speaker, seminar, request, import, and profile changes will appear here." />

  return (
    <div className="overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
      <ol className="divide-y divide-[var(--border)]">
        {visible.map((entry) => {
          const href = entityHref(entry)
          const content = (
            <div className="flex min-w-0 gap-3 p-4 sm:p-5">
              <ProfileAvatar name={entry.actor?.full_name} url={entry.actor?.avatar_url} size={38} />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-[var(--navy-950)]">{entry.description}</p>
                <time dateTime={entry.created_at} title={new Date(entry.created_at).toLocaleString()} className="mt-1 block text-xs text-[var(--text-muted)]">{timeLabel(entry.created_at)}</time>
              </div>
            </div>
          )
          return <li key={entry.id}>{href ? <Link href={href} className="block transition hover:bg-[var(--canvas-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--blue-600)]">{content}</Link> : content}</li>
        })}
      </ol>
      {!compact && hasMore && <div className="border-t border-[var(--border)] p-4 text-center"><button type="button" onClick={() => load(entries.length)} className="text-sm font-semibold text-[var(--green-700)] hover:underline">Load more activity</button></div>}
    </div>
  )
}
