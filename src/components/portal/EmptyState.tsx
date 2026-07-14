export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card-lg)] border border-dashed border-[var(--border)] bg-[var(--canvas-subtle)] px-6 py-14 text-center">
      <h2 className="text-lg font-bold text-[var(--navy-950)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

