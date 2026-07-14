"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { user, loading: authLoading, isStakeholder, signIn, resetPassword } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user && isStakeholder) router.replace("/admin")
  }, [authLoading, isStakeholder, router, user])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const result = await signIn(email.trim(), password)
    if (result.error) {
      setError(result.error.message === "Invalid login credentials" ? "The email or password is incorrect." : result.error.message)
      setSubmitting(false)
      return
    }
    router.replace("/admin")
    router.refresh()
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const result = await resetPassword(email.trim())
    if (result.error) setError(result.error.message)
    else setResetSent(true)
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[var(--canvas-subtle)] px-4 py-6 sm:px-6 sm:py-10 lg:grid lg:place-items-center">
      <section className="mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[var(--radius-section)] border border-[var(--border)] bg-white shadow-[var(--shadow-lg)] lg:min-h-[680px] lg:grid-cols-[1.02fr_0.98fr]" aria-labelledby="login-title">
        <div className="flex min-w-0 flex-col p-6 sm:p-10 lg:p-14">
          <Link href="/speakers" className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)]">
            <Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={190} height={52} className="h-10 w-auto object-contain" priority unoptimized />
          </Link>

          <div className="my-auto max-w-md py-12">
            {authLoading ? (
              <div role="status" aria-live="polite" className="flex min-h-72 items-center text-sm font-medium text-[var(--text-muted)]">Checking your session…</div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">Team portal</p>
                <h1 id="login-title" className="mt-3 text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-tight tracking-[-0.035em] text-[var(--navy-950)]">{mode === "login" ? "Welcome back" : "Reset your password"}</h1>
                <p className="mt-3 leading-7 text-[var(--text-muted)]">{mode === "login" ? "Sign in to manage speakers, requests, and community outreach." : "Enter your team email and we’ll send a secure reset link."}</p>

                {user && !isStakeholder && mode === "login" && (
                  <div role="alert" className="mt-5 rounded-[var(--radius-input)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This signed-in account has not been granted team access. Contact a team administrator.</div>
                )}

                {mode === "login" ? (
                  <form className="mt-8 space-y-5" onSubmit={handleLogin} noValidate>
                    <label className="block text-sm font-semibold text-[var(--navy-950)]">
                      Email
                      <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-[52px] w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20" placeholder="you@leehealth.org" />
                    </label>
                    <label className="block text-sm font-semibold text-[var(--navy-950)]">
                      <span className="flex items-center justify-between gap-4"><span>Password</span><button type="button" onClick={() => { setMode("forgot"); setError(""); setResetSent(false) }} className="text-sm font-semibold text-[var(--green-700)] hover:underline">Forgot password?</button></span>
                      <span className="relative mt-2 block">
                        <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-[52px] w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 pr-12 outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--canvas-subtle)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button>
                      </span>
                    </label>
                    {error && <p role="alert" className="text-sm font-medium text-[var(--error)]">{error}</p>}
                    <button disabled={submitting || !email || !password} className="h-[52px] w-full rounded-[var(--radius-button)] bg-[var(--green-600)] px-6 text-sm font-bold text-white transition hover:bg-[var(--green-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
                  </form>
                ) : resetSent ? (
                  <div role="status" className="mt-8 rounded-[var(--radius-card-sm)] border border-emerald-200 bg-[var(--mint-100)] p-5 text-sm leading-6 text-[var(--green-700)]">Check your inbox for a password reset link sent to <strong>{email}</strong>.</div>
                ) : (
                  <form className="mt-8 space-y-5" onSubmit={handleReset}>
                    <label className="block text-sm font-semibold text-[var(--navy-950)]">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-[52px] w-full rounded-[var(--radius-input)] border border-[var(--border)] px-4 outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20" /></label>
                    {error && <p role="alert" className="text-sm font-medium text-[var(--error)]">{error}</p>}
                    <button disabled={submitting || !email} className="h-[52px] w-full rounded-[var(--radius-button)] bg-[var(--green-600)] px-6 text-sm font-bold text-white disabled:opacity-60">{submitting ? "Sending…" : "Send reset link"}</button>
                  </form>
                )}

                {mode === "forgot" && <button type="button" onClick={() => { setMode("login"); setError(""); setResetSent(false) }} className="mt-6 text-sm font-semibold text-[var(--green-700)] hover:underline">Back to sign in</button>}
              </>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)]">Looking for a speaker? <Link href="/speakers" className="font-semibold text-[var(--green-700)] hover:underline">Browse the directory</Link></p>
        </div>

        <div className="relative min-h-[280px] bg-[var(--mint-100)] lg:min-h-full">
          <Image src="/hero_image.png" alt="Lee Health speaker presenting to a community audience" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
          <div className="absolute inset-x-0 bottom-0 bg-[var(--navy-950)]/80 p-6 text-white backdrop-blur-sm sm:p-8">
            <p className="max-w-md text-lg font-semibold leading-7">A shared workspace for keeping community education accurate, responsive, and easy to coordinate.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
