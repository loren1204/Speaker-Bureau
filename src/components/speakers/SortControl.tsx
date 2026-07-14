export type SpeakerSort = "az" | "za" | "recent"

export function SortControl({ value, onChange }: { value: SpeakerSort; onChange: (value: SpeakerSort) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
      Sort
      <select value={value} onChange={(event) => onChange(event.target.value as SpeakerSort)} className="h-10 rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--navy-950)] outline-none focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]/20">
        <option value="az">Name: A–Z</option>
        <option value="za">Name: Z–A</option>
        <option value="recent">Recently updated</option>
      </select>
    </label>
  )
}
