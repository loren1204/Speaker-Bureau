import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortalShell } from "@/components/portal/PortalShell"
import type { TeamProfile } from "@/types/database"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin")

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  const raw = data as Partial<TeamProfile> | null
  const profile: TeamProfile = {
    id: user.id,
    full_name: raw?.full_name ?? user.user_metadata?.full_name ?? null,
    email: raw?.email ?? user.email ?? null,
    role: raw?.role === "stakeholder" ? "stakeholder" : "guest",
    title: raw?.title ?? null,
    avatar_url: raw?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    notifications_enabled: raw?.notifications_enabled ?? true,
    created_at: raw?.created_at ?? user.created_at,
    updated_at: raw?.updated_at ?? null,
  }

  if (profile.role !== "stakeholder") {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--canvas-subtle)] px-6">
        <section className="w-full max-w-lg rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--green-600)]">Team portal</p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--navy-950)]">Access has not been granted</h1>
          <p className="mt-3 text-[var(--text-muted)]">You are signed in, but this account is not assigned the stakeholder role. Ask a team administrator to update your profile.</p>
        </section>
      </main>
    )
  }

  return <PortalShell profile={profile}>{children}</PortalShell>
}
