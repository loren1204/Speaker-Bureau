"use client"

import { FormEvent, useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { ProfileAvatar } from "@/components/portal/ProfileAvatar"

export function ProfileSettings() {
  const { profile, user } = useAuth()
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // The authenticated profile arrives asynchronously and initializes this editable local form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(profile?.full_name ?? "")
    setTitle(profile?.title ?? "")
    setNotifications(profile?.notifications_enabled ?? true)
    setAvatar(profile?.avatar_url ?? null)
  }, [profile])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true); setError(""); setMessage("")
    const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: name, title, notifications_enabled: notifications }) })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Profile could not be saved.")
    else {
      let successMessage = "Profile saved."
      if (notifications && typeof Notification !== "undefined" && Notification.permission === "default") {
        try {
          const permission = await Notification.requestPermission()
          if (permission !== "granted") successMessage = "Profile saved. Browser notifications were not enabled."
        } catch {
          successMessage = "Profile saved. Browser notification permission could not be requested."
        }
      }
      setMessage(successMessage)
    }
    setSaving(false)
  }

  async function upload(file?: File) {
    if (!file) return
    setSaving(true); setError(""); setMessage("")
    const formData = new FormData(); formData.append("avatar", file)
    const response = await fetch("/api/admin/profile/avatar", { method: "POST", body: formData })
    const result = await response.json()
    if (!response.ok) setError(result.error || "Profile photo could not be uploaded.")
    else { setAvatar(result.avatar_url); setMessage("Profile photo updated. Refresh to see it in the navigation.") }
    setSaving(false)
  }

  return (
    <form onSubmit={save} className="rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="flex items-center gap-4">
        <ProfileAvatar name={name || user?.email} url={avatar} size={56} />
        <div><h2 className="font-bold">Your profile</h2><label className="mt-1 inline-block cursor-pointer text-sm font-semibold text-[var(--green-700)] hover:underline">Change photo<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} /></label></div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Display name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] px-3 outline-none focus:border-[var(--blue-600)]" /></label>
        <label className="text-sm font-semibold">Role or title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-11 w-full rounded-[var(--radius-input)] border border-[var(--border)] px-3 outline-none focus:border-[var(--blue-600)]" /></label>
      </div>
      <label className="mt-5 flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--canvas-subtle)] p-4"><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--green-600)]" /><span><span className="block text-sm font-semibold">New request notifications</span><span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">Show in-app counts and, when you grant browser permission, foreground browser alerts. Background push is not enabled.</span></span></label>
      {error && <p role="alert" className="mt-4 text-sm text-[var(--error)]">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-[var(--green-700)]">{message}</p>}
      <button disabled={saving} className="mt-5 h-11 rounded-[var(--radius-button)] bg-[var(--green-600)] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>
    </form>
  )
}
