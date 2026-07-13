import Image from "next/image"
import Link from "next/link"

const team = [
  {
    name: "Molly Grubbs",
    initials: "MG",
    role: "Community Outreach Coordinator",
    bio: "Molly connects Lee Health speakers with community organizations across Southwest Florida. She manages speaker requests and ensures every event runs smoothly.",
    accent: "#10b981",
    gradient: "from-emerald-400 to-teal-500",
    iconBorder: "border-emerald-200 text-emerald-600",
  },
  {
    name: "Ben",
    initials: "B",
    role: "Community Outreach Specialist",
    bio: "Ben supports community partners in finding the right speaker for their events and programs. He handles scheduling and follow-up coordination.",
    accent: "#0ea5e9",
    gradient: "from-sky-400 to-blue-500",
    iconBorder: "border-blue-200 text-blue-600",
  },
  {
    name: "Natalie",
    initials: "N",
    role: "Community Engagement Lead",
    bio: "Natalie builds relationships with schools, nonprofits, and civic groups across the region, ensuring Lee Health's expertise reaches every corner of the community.",
    accent: "#8b5cf6",
    gradient: "from-violet-400 to-purple-500",
    iconBorder: "border-violet-200 text-violet-600",
  },
]

const stats = [
  {
    value: "75+",
    label: "Active speakers",
    body: "Clinicians, specialists, and experts across Lee Health.",
    color: "from-emerald-400 to-teal-500",
    icon: "people",
  },
  {
    value: "12",
    label: "Specialty categories",
    body: "From Cardiology to Mental Health and everything in between.",
    color: "from-sky-400 to-blue-500",
    icon: "book",
  },
  {
    value: "200+",
    label: "Seminars available",
    body: "Engaging topics for every audience and occasion.",
    color: "from-indigo-400 to-violet-500",
    icon: "calendar",
  },
  {
    value: "1–2",
    label: "Day response time",
    body: "We move quickly to match you with the right expert.",
    color: "from-teal-400 to-cyan-500",
    icon: "clock",
  },
]

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  if (name === "book") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
      </svg>
    )
  }

  if (name === "calendar") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3M5 11h14M6.5 21h11A2.5 2.5 0 0 0 20 18.5v-11A2.5 2.5 0 0 0 17.5 5h-11A2.5 2.5 0 0 0 4 7.5v11A2.5 2.5 0 0 0 6.5 21Z" />
      </svg>
    )
  }

  if (name === "clock") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  }

  if (name === "mail") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 7.5v9A2.25 2.25 0 0 1 19.5 18.75h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.626 5.176a2.25 2.25 0 0 1-2.248 0L2.25 7.5" />
      </svg>
    )
  }

  if (name === "phone") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.38-.285.543-.778.417-1.173L6.963 3.102A1.125 1.125 0 0 0 5.872 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    )
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.75v-.031m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a5.971 5.971 0 0 0-.941 3.197m0 0a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  )
}

function NavBar() {
  const navItems = [
    { label: "Speakers", href: "/speakers", active: false },
    { label: "About Us", href: "/about", active: true },
    { label: "For Partners", href: "/partners", active: false },
  ]

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
      <nav className="flex h-[70px] items-center justify-between rounded-[1.75rem] border border-white/80 bg-white/82 px-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:px-8">
        <Link href="/" className="flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
          <Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={178} height={48} className="h-11 w-auto object-contain" priority unoptimized />
        </Link>

        <div className="hidden items-center gap-12 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative py-3 text-[15px] font-bold transition-colors focus:outline-none ${
                item.active ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute left-0 right-0 -bottom-1 mx-auto h-[2px] w-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden min-w-[96px] rounded-full border border-white/80 bg-white/78 px-7 py-3 text-center text-sm font-bold text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white sm:inline-flex sm:justify-center"
          >
            Sign In
          </Link>
          <Link
            href="/speakers"
            className="inline-flex min-w-[184px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,185,129,0.38)]"
          >
            Request a Speaker
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,#f6fbff_0%,#eef8ff_38%,#effdf8_70%,#fbfdff_100%)] text-slate-950">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-36 h-80 w-80 rounded-full border border-white/70 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95),rgba(125,211,252,0.28)_45%,rgba(16,185,129,0.10)_70%,transparent_72%)] blur-[1px]" />
        <div className="absolute right-12 top-40 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(204,251,241,0.70),rgba(125,211,252,0.18)_70%,transparent)]" />
        <div className="absolute left-[42%] top-32 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(167,243,208,0.55),rgba(255,255,255,0.20)_72%,transparent)]" />
        <div className="absolute right-[5%] top-[32rem] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(167,243,208,0.55),rgba(255,255,255,0.15)_72%,transparent)]" />
        <div className="absolute left-1/2 top-28 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-[560px] w-[560px] rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute inset-x-0 top-[32rem] h-72 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        <div className="absolute left-24 top-[18rem] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)]" />
        <div className="absolute right-28 top-[22rem] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)]" />
        <div className="absolute left-10 top-[29rem] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)]" />
      </div>

      <NavBar />

      <main className="mx-auto w-full max-w-[1380px] px-6 pb-24 pt-10 sm:px-8 lg:px-12">
        {/* HERO */}
        <section className="grid items-center gap-12 py-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:py-12">
          <div className="min-w-0 lg:pl-20">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-emerald-600">About the Bureau</p>
            <h1 className="max-w-[620px] text-[clamp(3rem,5.4vw,5.65rem)] font-black leading-[0.96] tracking-[-0.055em] text-slate-950">
              Putting a face <br />
              to{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                every expert.
              </span>
            </h1>
            <p className="mt-6 max-w-[620px] text-lg font-medium leading-[1.75] text-slate-600">
              The Lee Health Speakers Bureau connects healthcare experts with the communities that need them. We replaced static spreadsheets with a living directory — so finding the right speaker is simple, fast, and personal.
            </p>
            <Link
              href="/speakers"
              className="mt-7 inline-flex min-w-[190px] items-center justify-center gap-3 rounded-full border border-emerald-400/80 bg-white/72 px-8 py-3.5 text-sm font-black text-emerald-700 shadow-[0_12px_26px_rgba(16,185,129,0.16)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Browse Speakers
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="relative min-w-0 lg:pr-10">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-300/30 via-teal-200/18 to-sky-300/24 blur-3xl" />
            <div className="relative h-[320px] overflow-hidden rounded-[2.25rem] border border-white/85 bg-white/40 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:h-[390px]">
              <div className="relative h-full overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-br from-emerald-50 via-sky-50 to-white">
                <Image
                  src="/hero_image.png"
                  alt="Lee Health speaker presenting to a community audience"
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 rounded-[1.8rem] ring-1 ring-inset ring-white/70" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-500/12 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto mt-4 max-w-[1260px] rounded-[2rem] border border-white/75 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ value, label, body, color, icon }) => (
              <div key={label} className="group flex min-w-0 items-center gap-5 rounded-[1.5rem] border border-white/80 bg-white/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-all hover:-translate-y-1 hover:bg-white/82 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${color} text-white shadow-[0_16px_34px_rgba(14,165,233,0.24)] ring-8 ring-white/55`}>
                  <Icon name={icon} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[2.4rem] font-black leading-none tracking-[-0.06em] bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                  <p className="mt-1 text-sm font-black text-slate-600">{label}</p>
                  <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PURPOSE */}
        <section className="mx-auto grid max-w-[1260px] gap-12 py-16 lg:grid-cols-[0.9fr_1fr_0.9fr] lg:items-center lg:py-20">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-emerald-600">Our Purpose</p>
            <h2 className="max-w-[440px] text-[clamp(2.25rem,3.5vw,3.7rem)] font-black leading-[0.98] tracking-[-0.05em] text-slate-950">
              Simplifying how our community finds the <span className="text-emerald-600">right voice.</span>
            </h2>
          </div>

          <p className="max-w-[520px] text-lg font-medium leading-[1.7] text-slate-600">
            Every speaker has a face, a story, and a clear picture of the topics they're passionate about — making it easier for community partners to find someone who's genuinely right for their audience.
          </p>

          <div className="relative hidden min-h-[150px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/75 bg-white/62 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-2xl lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/45 via-white/35 to-sky-100/45" />
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-emerald-200/80 bg-white/62 text-emerald-500 shadow-[0_18px_40px_rgba(16,185,129,0.13)] backdrop-blur-xl">
              <Icon name="people" className="h-10 w-10" />
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="mx-auto max-w-[1260px] pb-16">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="min-w-0">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-emerald-600">The Team</p>
              <h2 className="max-w-[430px] text-[clamp(2.25rem,3.5vw,3.6rem)] font-black leading-[1] tracking-[-0.05em] text-slate-950">
                Your community outreach contacts.
              </h2>
              <p className="mt-5 max-w-[460px] text-base font-medium leading-relaxed text-slate-600">
                When you submit a speaker request, one of these team members will follow up with you directly.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {team.map(({ name, initials, role, bio, accent, gradient, iconBorder }) => (
                <article
                  key={name}
                  className="flex min-h-[285px] min-w-0 flex-col rounded-[1.75rem] border border-white/75 bg-white/72 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition-all hover:-translate-y-1 hover:bg-white/84 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
                >
                  <div className={`mb-5 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-[0_14px_26px_rgba(15,23,42,0.13)]`}>
                    {initials}
                  </div>
                  <h3 className="text-lg font-black leading-tight tracking-tight text-slate-950">{name}</h3>
                  <p className="mt-1 text-[13px] font-black leading-snug" style={{ color: accent }}>{role}</p>
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-600">{bio}</p>

                  <div className="mt-5 flex items-center gap-2">
                    <span className={`grid h-9 w-9 place-items-center rounded-full border bg-white/70 ${iconBorder}`}>
                      <Icon name="mail" className="h-4 w-4" />
                    </span>
                    <span className={`grid h-9 w-9 place-items-center rounded-full border bg-white/70 ${iconBorder}`}>
                      <Icon name="phone" className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1260px] overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
          <div className="relative overflow-hidden rounded-[1.65rem] bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 px-8 py-8 text-center sm:px-10">
            <div className="absolute left-16 top-6 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,1)]" />
            <div className="absolute right-20 bottom-8 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,1)]" />
            <h2 className="text-[clamp(1.75rem,2.5vw,2.55rem)] font-black leading-tight tracking-[-0.04em] text-slate-950">Ready to find your speaker?</h2>
            <p className="mx-auto mt-2 max-w-2xl text-base font-medium text-slate-600">Browse our directory and connect with the right expert for your event.</p>
            <Link
              href="/speakers"
              className="mt-6 inline-flex min-w-[210px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-9 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.34)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(16,185,129,0.42)]"
            >
              Browse Speakers
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
