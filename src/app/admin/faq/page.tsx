import { FaqBrowser } from "@/components/faq/FaqBrowser"
import { SectionHeader } from "@/components/portal/SectionHeader"
import { teamFaqItems } from "@/data/teamFaq"

export default function AdminFaqPage() {
  return <div><SectionHeader eyebrow="Team help center" title="FAQ and support" description="Internal guidance for authorized team members using the portal and its administrative tools." /><div className="mt-8"><FaqBrowser items={teamFaqItems} /></div></div>
}
