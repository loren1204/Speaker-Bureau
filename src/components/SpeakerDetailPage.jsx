import { useParams } from 'react-router-dom'
import { useSpeaker } from '../hooks/useSpeaker'

export default function SpeakerDetailPage() {
  const { id } = useParams()
  const { speaker, loading, error } = useSpeaker(id)

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error.message}</p>
  if (!speaker) return <p>Speaker not found.</p>

  return (
    <div>
      <img src={speaker.headshot_url} alt={speaker.first_name} />
      <h1>{speaker.first_name} {speaker.last_name}</h1>
      <p>{speaker.credentials}</p>
      <p>{speaker.bio}</p>
      <h2>Seminars</h2>
      <ul>
        {speaker.seminars.map(sem => (
          <li key={sem.seminar_id}>
            <strong>{sem.title}</strong>
            <span style={{ background: sem.categories?.color_hex }}>
              {sem.categories?.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
