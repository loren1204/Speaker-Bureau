import { ActivityFeed } from "@/components/portal/ActivityFeed"
import { SectionHeader } from "@/components/portal/SectionHeader"

export default function ActivityPage() {
  return <div><SectionHeader eyebrow="Collaboration" title="Activity" description="See meaningful changes made by everyone on the team, newest first." /><div className="mt-8"><ActivityFeed /></div></div>
}
