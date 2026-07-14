import { SiteHeader } from "@/components/design-system/layout/SiteHeader"
import { SiteFooter } from "@/components/design-system/layout/SiteFooter"
import { Container } from "@/components/design-system/layout/Container"
import { FaqBrowser } from "@/components/faq/FaqBrowser"
import { faqItems } from "@/data/faq"

export default function FaqPage() {
  return <div className="min-h-screen bg-[var(--canvas-subtle)]"><SiteHeader /><main><section className="py-14 sm:py-20"><Container><header className="mb-10 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">Help center</p><h1 className="mt-3 text-[clamp(2.7rem,5vw,4.4rem)] font-bold tracking-[-0.045em]">FAQ and support</h1><p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">Find focused answers about the public directory, team portal, speaker management, requests, and Excel tools.</p></header><FaqBrowser items={faqItems} /></Container></section></main><SiteFooter /></div>
}

