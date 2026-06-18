import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useSpeakers(filters = {}) {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('speakers')
        .select(`
          *,
          seminars (
            seminar_id, title, scheduled_at,
            categories ( name, color_hex ),
            departments ( name ),
            statuses ( label, color_hex )
          ),
          speaker_topics (
            topics ( title )
          )
        `)
        .order('full_name', { ascending: true })

      if (filters.is_active !== undefined)
        query = query.eq('is_active', filters.is_active)

      const { data, error } = await query
      if (error) setError(error)
      else setSpeakers(data)
      setLoading(false)
    }
    fetch()
  }, [filters.is_active])

  return { speakers, loading, error }
}