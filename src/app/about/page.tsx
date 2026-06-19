import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/speakers" className="flex items-center shrink-0">
            <Image src="/speaker_logo.png" alt="Lee Health Speakers Bureau" width={160} height={44}
              className="object-contain" style={{ width: "auto", height: "44px" }} unoptimized />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Speakers", href: "/speakers" },
              { label: "About Us", href: "/about" },
              { label: "For Partners", href: "/partners" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  item.href === "/about"
                    ? "text-green-600 border-b-2 border-green-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
              Request a Speaker
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6">

        {/* ── HERO ── */}
        <div className="my-6 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-stretch min-h-[220px] flex-col lg:flex-row">
          <div className="flex-1 p-10 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-600 mb-3">About the Bureau</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
              Putting a face<br />
              to <span className="text-green-500">every expert.</span>
            </h1>
            <p className="text-gray-500 text-base max-w-md">
              A modern, simpler way to discover and connect with the people behind Lee Health&apos;s community education programs.
            </p>
          </div>
          <div className="w-full lg:w-[480px] shrink-0 relative overflow-hidden min-h-[220px]">
            <Image src="/about_hero.png" alt="Lee Health community education" fill
              className="object-cover" unoptimized loading="eager" />
          </div>
        </div>

        {/* ── MISSION ── */}
        <div className="grid lg:grid-cols-2 gap-10 py-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-green-600 mb-3">OUR PURPOSE</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Simplifying how our community finds the right voice.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For years, finding the right speaker for a community event meant scrolling through dense, complex spreadsheets — rows of names, credentials, and topics with no real sense of who the person actually was. We built the Lee Health Speakers Bureau to change that.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This platform replaces static lists with a living, searchable directory. Every speaker has a face, a story, and a clear picture of the topics they&apos;re passionate about — making it easier for community partners to find someone who isn&apos;t just qualified, but genuinely right for their audience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { stat: "75+", label: "Active speakers across Lee Health" },
              { stat: "12", label: "Specialty categories represented" },
              { stat: "200+", label: "Seminars available to request" },
              { stat: "1–2", label: "Business days average response time" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                <p className="text-3xl font-bold text-green-600 mb-1">{item.stat}</p>
                <p className="text-sm text-gray-500 leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT HELPS ── */}
        <div className="py-12 border-t border-gray-100">
          <p className="text-xs font-bold tracking-widest text-green-600 mb-3 text-center">WHY IT MATTERS</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center max-w-2xl mx-auto leading-tight">
            A better experience for everyone involved
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Search, don't scroll",
                body: "Find speakers by name, specialty, department, or topic in seconds — no more scanning hundreds of spreadsheet rows.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "A face, not just a row",
                body: "Every profile includes a photo, credentials, and background — so you know who you're inviting before you ever reach out.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Built for real events",
                body: "See real-time availability, seminar topics, and direct ways to connect — built around how community partners actually plan events.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="mb-16 rounded-2xl border border-gray-100 bg-gray-50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-gray-900 text-lg">Ready to find your speaker?</p>
            <p className="text-sm text-gray-500 mt-1">Browse our directory and connect with the right expert for your event.</p>
          </div>
          <Link href="/speakers"
            className="shrink-0 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors">
            Browse Speakers
          </Link>
        </div>

      </div>
    </div>
  )
}
