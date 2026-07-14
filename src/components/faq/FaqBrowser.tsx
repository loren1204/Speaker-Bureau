"use client"

import { useEffect, useMemo, useState } from "react"
import type { FaqItem } from "@/data/faq"

export function FaqBrowser({ items }: { items: FaqItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "")
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const topics = useMemo(() => Array.from(new Set(items.map((item) => item.topic))), [items])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (items.some((item) => item.id === hash)) setSelectedId(hash)
    const onHash = () => { const next = window.location.hash.slice(1); if (items.some((item) => item.id === next)) setSelectedId(next) }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [items])

  function select(id: string) { setSelectedId(id); window.history.replaceState(null, "", `#${id}`) }

  if (!selected) return null
  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <div className="lg:sticky lg:top-28">
        <label className="block text-sm font-semibold lg:hidden">Choose a question<select value={selectedId} onChange={(event) => select(event.target.value)} className="mt-2 h-12 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-3">{items.map((item) => <option key={item.id} value={item.id}>{item.question}</option>)}</select></label>
        <nav aria-label="FAQ questions" className="hidden overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white lg:block">{topics.map((topic) => <div key={topic} className="border-b border-[var(--border)] last:border-0"><p className="bg-[var(--canvas-subtle)] px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{topic}</p>{items.filter((item) => item.topic === topic).map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} aria-current={selectedId === item.id ? "true" : undefined} className={`block w-full border-t border-[var(--border)] px-4 py-3 text-left text-sm font-semibold leading-5 transition ${selectedId === item.id ? "bg-[var(--mint-100)] text-[var(--green-700)]" : "text-[var(--navy-800)] hover:bg-[var(--canvas-subtle)]"}`}>{item.question}</button>)}</div>)}</nav>
      </div>
      <article id={selected.id} className="min-w-0 rounded-[var(--radius-card-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8 lg:min-h-[420px]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-600)]">{selected.topic}</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em]">{selected.question}</h2><p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-[var(--navy-800)]">{selected.answer}</p>
        <section className="mt-12 border-t border-[var(--border)] pt-7" aria-labelledby="faq-support"><h3 id="faq-support" className="text-lg font-bold">Need additional support?</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">For bug reports, additional support, technical clarification, or problems using the directory, email <a href="mailto:lorenrisocontact@gmail.com" className="font-semibold text-[var(--green-700)] underline decoration-[var(--green-600)]/40 underline-offset-2">lorenrisocontact@gmail.com</a>.</p></section>
      </article>
    </div>
  )
}

