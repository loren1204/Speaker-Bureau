"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, type ChangeEvent, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

const communities = [
  { name: "Cape Coral Schools", initials: "CCS", color: "from-emerald-400 to-teal-500" },
  { name: "United Way SWFL", initials: "UW", color: "from-sky-400 to-blue-500" },
  { name: "Lee County Senior Ctr.", initials: "LC", color: "from-violet-400 to-purple-500" },
  { name: "Hope Healthcare", initials: "HH", color: "from-rose-400 to-pink-500" },
  { name: "YMCA Southwest Florida", initials: "YM", color: "from-orange-400 to-amber-500" },
  { name: "Golisano Foundation", initials: "GF", color: "from-teal-400 to-cyan-500" },
]

const steps = [
  { step: "01", text: "Browse speakers and find the right fit for your event" },
  { step: "02", text: "Submit a request with your preferred speaker and date" },
  { step: "03", text: "Molly, Ben, or Natalie will respond within 1–2 days" },
]

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzjnzkn"

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-white/70 bg-white/70 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      {children}
    </span>
  )
}

function TextInput({
  label,
  name,
  value,
  placeholder,
  required,
  icon,
  onChange,
}: {
  label: string
  name: string
  value: string
  placeholder: string
  required?: boolean
  icon: ReactNode
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-white/80 bg-white/78 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all focus-within:border-emerald-300 focus-within:shadow-[0_10px_28px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]">
        <FieldIcon>{icon}</FieldIcon>
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </label>
  )
}

function TextArea({
  label,
  name,
  value,
  placeholder,
  icon,
  onChange,
}: {
  label: string
  name: string
  value: string
  placeholder: string
  icon: ReactNode
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="flex min-w-0 items-start gap-3 rounded-[1.35rem] border border-white/80 bg-white/78 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all focus-within:border-emerald-300 focus-within:shadow-[0_10px_28px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]">
        <FieldIcon>{icon}</FieldIcon>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="min-w-0 flex-1 resize-none bg-transparent pt-2 text-sm font-semibold leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </label>
  )
}

export default function PartnersPage() {
  const [form, setForm] = useState({ name: "", community: "", speaker: "", talk: "", description: "" })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTextAreaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.community || !form.speaker) {
      setFormError("Please fill in your name, community, and preferred speaker.")
      return
    }

    setSubmitting(true)
    setFormError("")

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          community: form.community,
          speaker_and_talk: `${form.speaker} — ${form.talk}`,
          description: form.description,
        }),
      })

      if (res.ok) setSubmitted(true)
      else setFormError("Something went wrong. Please try again.")
    } catch {
      setFormError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_18%,rgba(16,185,129,0.16),transparent_23%),radial-gradient(circle_at_88%_30%,rgba(59,130,246,0.15),transparent_24%),linear-gradient(160deg,#f7fbff_0%,#edf7ff_43%,#f0fdf8_100%)] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glass-blob glass-blob-one" />
        <div className="glass-blob glass-blob-two" />
        <div className="glass-blob glass-blob-three" />
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-5rem] top-56 h-44 w-44 rounded-full border border-white/70 bg-gradient-to-br from-emerald-200/35 to-blue-200/25 blur-[1px]" />
        <div className="absolute right-[-6rem] top-64 h-64 w-64 rounded-full border border-white/70 bg-gradient-to-br from-blue-200/35 to-emerald-100/25 blur-[1px]" />
        <div className="absolute left-14 bottom-20 h-20 w-20 rounded-full bg-blue-200/30 blur-[1px]" />
        <div className="absolute right-28 bottom-28 h-24 w-24 rounded-full bg-emerald-200/30 blur-[1px]" />
        <div className="absolute left-[3%] top-[28%] text-white/90 drop-shadow-[0_0_10px_rgba(14,165,233,0.28)]">✦</div>
        <div className="absolute right-[8%] top-[24%] text-white/90 drop-shadow-[0_0_10px_rgba(16,185,129,0.28)]">✦</div>
        <div className="absolute right-[14%] bottom-[16%] text-white/90 drop-shadow-[0_0_10px_rgba(59,130,246,0.28)]">✦</div>
      </div>

      {/* Floating navigation */}
      <header className="relative z-50 mx-auto w-full max-w-[1480px] px-5 pt-5 sm:px-8 lg:px-12">
        <nav className="flex h-[4.25rem] items-center justify-between rounded-[1.75rem] border border-white/80 bg-white/82 px-5 shadow-[0_16px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:px-7">
          <Link href="/" className="flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
            <Image
              src="/speaker_logo.png"
              alt="Lee Health Speakers Bureau"
              width={176}
              height={48}
              className="h-12 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex lg:gap-14">
            {[
              { label: "Speakers", href: "/speakers" },
              { label: "About Us", href: "/about" },
              { label: "For Partners", href: "/partners" },
            ].map((item) => {
              const active = item.label === "For Partners"
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative px-1 py-2 text-sm font-black transition-colors ${active ? "text-emerald-700" : "text-slate-600 hover:text-slate-950"}`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-1 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-white/80 bg-white/72 px-6 py-3 text-sm font-black text-slate-800 shadow-[0_8px_22px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-white lg:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(16,185,129,0.34)] transition-all hover:-translate-y-px hover:shadow-[0_16px_38px_rgba(16,185,129,0.42)]"
            >
              Request a Speaker
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1360px] px-6 pb-24 pt-8 sm:px-8 lg:px-12">
        {/* Communities */}
        <section className="rounded-[2rem] border border-white/80 bg-white/72 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <p className="shrink-0 px-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Communities We Serve</p>
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              {communities.map(({ name, initials, color }) => (
                <motion.div
                  key={name}
                  whileHover={{ y: -2 }}
                  className="flex min-w-0 items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/76 px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-[11px] font-black text-white shadow-[0_8px_18px_rgba(15,23,42,0.10)]`}>
                    {initials}
                  </div>
                  <span className="min-w-0 text-sm font-black leading-tight text-slate-700">{name}</span>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 rounded-[1.2rem] border border-dashed border-emerald-300 bg-emerald-50/60 px-5 py-3 text-sm font-black text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl"
              >
                <span className="text-xl leading-none">+</span>
                Your organization next
              </motion.div>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-w-0"
          >
            <div className="absolute -inset-5 rounded-[2.75rem] bg-gradient-to-br from-emerald-400/24 via-teal-300/12 to-blue-400/18 blur-3xl" />
            <div className="relative h-[320px] overflow-hidden rounded-[2.15rem] border border-white/80 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.12),0_0_36px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:h-[380px] lg:h-[420px]">
              <Image
                src="/hero_image.png"
                alt="Lee Health speaker presenting to a community audience"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 52vw"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-transparent to-blue-400/10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:pl-4"
          >
            <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-emerald-700">For Community Partners</p>
            <h1 className="max-w-[700px] text-[clamp(2.8rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.055em] text-slate-950">
              Bring your community{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                together, easily.
              </span>
            </h1>
            <p className="mt-6 max-w-[650px] text-lg font-semibold leading-relaxed text-slate-500">
              A faster, more personal way to find the right Lee Health expert for your next event, workshop, or program. Submit a request below and our team will follow up within 1–2 business days.
            </p>

            <div className="mt-8 grid gap-4">
              {steps.map(({ step, text }) => (
                <div key={step} className="flex min-w-0 items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-xs font-black text-emerald-700 shadow-[0_8px_22px_rgba(16,185,129,0.12)]">
                    {step}
                  </span>
                  <p className="min-w-0 text-base font-semibold leading-snug text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Request form */}
        <section className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2.4rem] border border-white/80 bg-white/74 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="relative mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/80 bg-emerald-50 text-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a4 4 0 00-8 0v2m8-13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Submit a Request</p>
              </div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.02] tracking-[-0.04em] text-slate-950">
                Request a speaker for your event.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                Fill out the form below. Our team will reach out to confirm availability and details.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="relative rounded-[2rem] border border-white/80 bg-white/80 px-6 py-16 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl"
              >
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.32)]">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">Request submitted!</h3>
                <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
                  Molly, Ben, or Natalie will follow up with you within 1–2 business days.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Your Name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Jane Smith"
                    required
                    icon={
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
                      </svg>
                    }
                  />
                  <TextInput
                    label="Community You Represent"
                    name="community"
                    value={form.community}
                    onChange={handleInputChange}
                    placeholder="Cape Coral Senior Center"
                    required
                    icon={
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21V8.25L12 3l8.25 5.25V21M9 21v-6h6v6M9 9.75h.01M12 9.75h.01M15 9.75h.01" />
                      </svg>
                    }
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Preferred Speaker"
                    name="speaker"
                    value={form.speaker}
                    onChange={handleInputChange}
                    placeholder="Dr. Sarah Chen"
                    required
                    icon={
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14.25c3.314 0 6-2.35 6-5.25S15.314 3.75 12 3.75 6 6.1 6 9s2.686 5.25 6 5.25zM6.75 20.25a5.25 5.25 0 0110.5 0" />
                      </svg>
                    }
                  />
                  <TextInput
                    label="Talk / Topic"
                    name="talk"
                    value={form.talk}
                    onChange={handleInputChange}
                    placeholder="Heart Disease Prevention"
                    icon={
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9M7.5 12h6M21 12a8.25 8.25 0 11-15.41-4.125L3 3l4.875 2.59A8.25 8.25 0 0121 12z" />
                      </svg>
                    }
                  />
                </div>

                <TextArea
                  label="Desired Date & Location"
                  name="description"
                  value={form.description}
                  onChange={handleTextAreaChange}
                  placeholder="e.g. Saturday, September 14th, 2026 at Cape Coral Community Center"
                  icon={
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3.75M16 7V3.75M4.75 9.75h14.5M6.5 5.5h11A2.5 2.5 0 0120 8v10.25a2.5 2.5 0 01-2.5 2.5h-11a2.5 2.5 0 01-2.5-2.5V8a2.5 2.5 0 012.5-2.5z" />
                    </svg>
                  }
                />

                {formError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-bold text-rose-600">
                    {formError}
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-black text-white shadow-[0_14px_36px_rgba(16,185,129,0.32)] transition-all hover:shadow-[0_18px_44px_rgba(16,185,129,0.42)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                  {!submitting && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>

                <p className="text-center text-xs font-semibold text-slate-400">
                  Our team responds within 1–2 business days. Need immediate help?{" "}
                  <Link href="/about" className="font-black text-emerald-700 hover:text-emerald-800">
                    Contact us directly.
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}
