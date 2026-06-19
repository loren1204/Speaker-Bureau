import Link from "next/link"
import Image from "next/image"

export default function PartnersPage() {
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
                  item.href === "/partners"
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
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-600 mb-3">For Community Partners</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
              Bring your community<br />
              <span className="text-green-500">together, easily.</span>
            </h1>
            <p className="text-gray-500 text-base max-w-md">
              A faster, more personal way to find the right Lee Health expert for your next event, workshop, or program.
            </p>
          </div>
          <div className="w-full lg:w-[480px] shrink-0 relative overflow-hidden min-h-[220px]">
            <Image src="/partners_hero.png" alt="Community partners working with Lee Health" fill
              className="object-cover" unoptimized loading="eager" />
          </div>
        </div>

        {/* ── INTRO ── */}
        <div className="py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-widest text-green-600 mb-3">SIMPLIFYING THE PROCESS</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              You shouldn&apos;t need a spreadsheet to plan a great event.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Community partners — schools, nonprofits, senior centers, employee groups, and civic organizations — rely on Lee Health experts to bring valuable health education to their communities. The Speakers Bureau was built specifically to make that connection effortless, replacing static documents with a directory you can actually search, browse, and trust.
            </p>
          </div>
        </div>

        {/* ── HOW TO USE IT ── */}
        <div className="py-12 border-t border-gray-100">
          <p className="text-xs font-bold tracking-widest text-green-600 mb-3 text-center">HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center max-w-2xl mx-auto leading-tight">
            Three simple steps to your next speaker
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Browse or search",
                body: "Filter by category, department, or availability — or simply search by name or topic to find exactly who you need.",
              },
              {
                step: "02",
                title: "Review the profile",
                body: "See a real photo, full credentials, areas of expertise, and a list of available seminars before you ever reach out.",
              },
              {
                step: "03",
                title: "Make the request",
                body: "Reach out directly through the platform and hear back within 1–2 business days from our team.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 relative overflow-hidden">
                <p className="text-5xl font-bold text-green-50 absolute top-4 right-5 select-none">{item.step}</p>
                <p className="text-xs font-bold text-green-600 tracking-widest mb-3 relative">STEP {item.step}</p>
                <h3 className="font-semibold text-gray-900 mb-2 relative">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed relative">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHO IT'S FOR ── */}
        <div className="py-12 border-t border-gray-100">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-green-600 mb-3">WHO WE WORK WITH</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Built for the organizations that power community wellness.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Whether you&apos;re organizing a senior health fair, a workplace wellness day, or a classroom presentation, our speakers bring real expertise and a genuine commitment to community education.
              </p>
              <Link href="/speakers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors">
                Browse Our Speakers
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Schools & Universities",
                "Senior Centers",
                "Nonprofits",
                "Employee Wellness Groups",
                "Civic Organizations",
                "Faith Communities",
              ].map((item) => (
                <div key={item} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="mb-16 rounded-2xl border border-gray-100 bg-gray-50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-gray-900 text-lg">Have questions about partnering with us?</p>
            <p className="text-sm text-gray-500 mt-1">Our team is happy to help you find the right fit for your event.</p>
          </div>
          <button className="shrink-0 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors">
            Contact Our Team
          </button>
        </div>

      </div>
    </div>
  )
}
