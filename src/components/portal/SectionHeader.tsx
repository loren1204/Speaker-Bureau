export function SectionHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-600)]">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-[var(--navy-950)] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl leading-7 text-[var(--text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex w-full min-w-0 max-w-full flex-wrap gap-2 xl:w-auto xl:max-w-[70%] xl:justify-end">{actions}</div>}
    </header>
  )
}
