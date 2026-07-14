export function SectionHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-[var(--navy-950)] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl leading-7 text-[var(--text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

