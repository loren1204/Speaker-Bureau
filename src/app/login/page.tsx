"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

function BackgroundAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fcff_0%,#eff7ff_38%,#f2fbf7_68%,#fbfdff_100%)]" />
      <div className="absolute left-[-160px] top-[180px] h-[360px] w-[360px] rounded-full border border-white/50 bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl" />
      <div className="absolute left-[92px] top-[145px] h-[118px] w-[118px] rounded-full bg-emerald-300/24 blur-sm" />
      <div className="absolute right-[-120px] top-[190px] h-[260px] w-[260px] rounded-full bg-sky-300/22 blur-sm" />
      <div className="absolute right-[20px] top-[72px] h-[86px] w-[86px] rounded-full bg-blue-300/25 blur-[1px]" />
      <div className="absolute left-[44%] top-[345px] h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-300/16 blur-3xl" />
      <div className="absolute right-[23%] top-[120px] h-[300px] w-[420px] rounded-full bg-cyan-200/22 blur-3xl" />
    </div>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const { signIn, resetPassword } = useAuth()

  async function handleLogin() {
    setLoading(true)
    setError("")
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/admin/speakers")
    }
  }

  async function handleForgotPassword() {
    setLoading(true)
    setError("")
    const result = await resetPassword(email)
    if (!result) {
      setError("Something went wrong. Please refresh the page and try again.")
      setLoading(false)
      return
    }
    const { error } = result
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setResetSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-clip px-6 py-16 text-slate-950">
      <BackgroundAtmosphere />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={180} height={48} className="h-10 w-auto object-contain" unoptimized />
        </Link>

        <div className="relative overflow-hidden rounded-[30px] border border-white/75 bg-white/72 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-10">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/90" />

          {mode === "login" ? (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Team Access</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Welcome back.</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Sign in to manage speakers, requests, and community outreach.
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@leehealth.org"
                    className="h-12 w-full rounded-full border border-white/80 bg-white/72 px-6 text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(""); setResetSent(false) }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="h-12 w-full rounded-full border border-white/80 bg-white/72 px-6 text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-rose-600">
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_rgba(16,185,129,0.36)] transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </motion.button>
              </div>

              <p className="mt-6 text-center text-xs font-semibold text-slate-400">
                Not a team member?{" "}
                <Link href="/speakers" className="font-bold text-emerald-600 hover:text-emerald-700">
                  Browse speakers →
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Reset Password</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Forgot your password?</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Enter your email and we'll send you a link to reset it.
              </p>

              {resetSent ? (
                <div className="mt-8 rounded-[22px] border border-emerald-200/80 bg-emerald-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="text-sm font-bold text-emerald-800">
                    Check your inbox — a reset link has been sent to {email}.
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@leehealth.org"
                      onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                      className="h-12 w-full rounded-full border border-white/80 bg-white/72 px-6 text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                    />
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-rose-600">
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || !email}
                    className="h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_rgba(16,185,129,0.36)] transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </motion.button>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setResetSent(false) }}
                className="mt-6 block w-full text-center text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}