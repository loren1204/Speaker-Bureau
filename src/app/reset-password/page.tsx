// src/app/reset-password/page.tsx
"use client"

import { useEffect, useState } from "react"
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
    // Supabase fires this event once it reads the recovery token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true)
    })

    // Fallback: if a session already exists by the time this mounts (token processed before listener attached)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    setError("")
    if (password.length < 6) return setError("Password must be at least 6 characters.")
    if (password !== confirm) return setError("Passwords don't match.")

    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500 text-sm">Verifying reset link…</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-emerald-700 font-semibold">Password updated. Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f0fdf8_0%,#eff6ff_50%,#f8faff_100%)] px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-slate-900">Set a new password</h1>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-white"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}