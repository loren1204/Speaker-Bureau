"use client"

import Image from "next/image"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setReady(true) })
    void supabase.auth.getSession().then(({ data: { session } }) => { if (session) setReady(true) })
    return () => subscription.unsubscribe()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("")
    if (password.length < 8) { setError("Use at least 8 characters."); return }
    if (password !== confirm) { setError("The passwords do not match."); return }
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) setError(updateError.message)
    else { setSuccess(true); window.setTimeout(() => router.replace("/login"), 1800) }
  }

  return <main className="grid min-h-screen place-items-center bg-[var(--canvas-subtle)] px-4 py-8"><section className="w-full max-w-md rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8"><Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={170} height={46} className="h-9 w-auto" unoptimized />{!ready ? <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">Verifying your reset link…</p> : success ? <div role="status" className="mt-10 rounded-[var(--radius-input)] bg-[var(--mint-100)] p-4 text-sm text-[var(--green-700)]">Password updated. Returning to team login…</div> : <form onSubmit={submit} className="mt-10"><h1 className="text-3xl font-bold tracking-tight">Set a new password</h1><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Choose a secure password for your team account.</p><label className="mt-6 block text-sm font-semibold">New password<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-[var(--radius-input)] border border-[var(--border)] px-3 outline-none focus:border-[var(--blue-600)]" /></label><label className="mt-4 block text-sm font-semibold">Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 h-12 w-full rounded-[var(--radius-input)] border border-[var(--border)] px-3 outline-none focus:border-[var(--blue-600)]" /></label>{error && <p role="alert" className="mt-4 text-sm text-[var(--error)]">{error}</p>}<button className="mt-6 h-12 w-full rounded-[var(--radius-button)] bg-[var(--green-600)] text-sm font-bold text-white">Update password</button></form>}</section></main>
}
