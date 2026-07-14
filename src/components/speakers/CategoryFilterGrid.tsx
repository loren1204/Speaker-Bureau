export function CategoryFilterGrid({ categories, selected, onToggle }: { categories: string[]; selected: string[]; onToggle: (category: string) => void }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-2.5 @[15rem]:grid-cols-2 @[30rem]:grid-cols-3 @[44rem]:grid-cols-4" aria-label="Filter by category">
        {categories.map((category) => {
          const active = selected.includes(category)
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(category)}
              className={`h-auto min-h-[3.75rem] min-w-0 rounded-[var(--radius-input)] border px-3 py-2.5 text-center text-sm font-semibold leading-[1.25] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-600)] ${active ? "border-[var(--green-600)] bg-[var(--mint-100)] text-[var(--green-700)]" : "border-[var(--border)] bg-white text-[var(--navy-800)] hover:border-[var(--green-600)]/50"}`}
            >
              <span className="block min-w-0 whitespace-normal [overflow-wrap:break-word] [word-break:normal]">
                {category}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
