import { FaqBrowser } from "@/components/faq/FaqBrowser"
import { SectionHeader } from "@/components/portal/SectionHeader"
import { faqItems } from "@/data/faq"

export default function AdminFaqPage() {
  return <div><SectionHeader eyebrow="Help center" title="FAQ and support" description="Focused guidance for the directory, team portal, requests, and data tools." /><div className="mt-8"><FaqBrowser items={faqItems} /></div></div>
}
