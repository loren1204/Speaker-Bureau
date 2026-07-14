import { RequestManager } from "@/components/portal/RequestManager"
import { SectionHeader } from "@/components/portal/SectionHeader"

export default function RequestsPage() {
  return <div><SectionHeader eyebrow="Community outreach" title="Requests" description="Review public speaker requests, assign follow-up, and keep each event moving." /><RequestManager /></div>
}
