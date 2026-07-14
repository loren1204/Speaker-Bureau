"use client"

import { useEffect, useState } from "react"
import type { Speaker } from "@/models/Speaker"

export function useSpeakers(filters: { is_active?: boolean } = {}) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    let active = true
    async function fetchSpeakers() {
      setLoading(true)
      const response = await fetch("/api/speakers")
      if (!active) return
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Speakers could not be loaded")
        setSpeakers([])
      } else {
        setError(null)
        const all = (result.speakers ?? []) as Speaker[]
        setSpeakers(filters.is_active === undefined ? all : all.filter((speaker) => speaker.is_active === filters.is_active))
        setCategories(result.categories ?? [])
      }
      setLoading(false)
    }
    void fetchSpeakers()
    return () => { active = false }
  }, [filters.is_active])

  return { speakers, categories, loading, error }
}
