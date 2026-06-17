import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { supabase } from "@/supabaseClient"
import type { Speaker } from "@/models/Speaker"

interface Props {
  params: Promise<{ id: string }>
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  const { data, error } = await supabase
    .from("speakers")
    .select(`
      *,
      seminars (
        seminar_id, title, description, scheduled_at,
        categories ( name, color_hex ),
        departments ( name ),
        statuses ( label, color_hex )
      ),
      speaker_topics (
        topics ( title )
      ),
      speaker_contacts (
        contact_id, contact
      )
    `)
    .eq("speaker_id", id)
    .single()

  if (error || !data) return null
  return data as Speaker
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const speaker = await getSpeaker(id)
  if (!speaker) return {}
  return {
    title: speaker.full_name,
    description: speaker.seminars?.[0]?.description ?? undefined,
  }
}

export default async function SpeakerProfilePage({ params }: Props) {
  const { id } = await params
  const speaker = await getSpeaker(id)

  if (!speaker) notFound()

  const initials = speaker.full_name?.charAt(0) ?? "?"
  const department = speaker.seminars?.[0]?.departments?.name

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">

        {/* Back */}
        <Link
          href="/speakers"
          className="text-sm text-green-600 hover:underline mb-6 block"
        >
          ← Back to directory
        </Link>

        {/* Header */}
        <div className="flex gap-6 items-center mb-6">
          {speaker.headshot_url ? (
            <Image
              src={speaker.headshot_url}
              alt={speaker.full_name ?? "Speaker"}
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {speaker.full_name}
              {speaker.credentials && (
                <span className="font-normal text-gray-500 ml-2 text-lg">
                  {speaker.credentials}
                </span>
              )}
            </h1>
            {department && (
              <p className="text-gray-500 mt-1">{department}</p>
            )}
          </div>
        </div>

        {/* Topic badges */}
        {speaker.speaker_topics && speaker.speaker_topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {speaker.speaker_topics.map(({ topics }) => (
              <span
                key={topics.title}
                className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                {topics.title}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {speaker.bio && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest mb-2">
              ABOUT
            </h2>
            <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
          </div>
        )}

        {/* Seminars */}
        {speaker.seminars && speaker.seminars.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest mb-3">
              SEMINARS
            </h2>
            <div className="flex flex-col gap-3">
              {speaker.seminars.map((seminar) => (
                <div
                  key={seminar.seminar_id}
                  className="p-4 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {seminar.title}
                    </p>
                    {seminar.categories && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: seminar.categories.color_hex + "22",
                          color: seminar.categories.color_hex,
                          border: `1px solid ${seminar.categories.color_hex}44`,
                        }}
                      >
                        {seminar.categories.name}
                      </span>
                    )}
                    {seminar.statuses && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: seminar.statuses.color_hex + "22",
                          color: seminar.statuses.color_hex,
                          border: `1px solid ${seminar.statuses.color_hex}44`,
                        }}
                      >
                        {seminar.statuses.label}
                      </span>
                    )}
                  </div>
                  {seminar.description && (
                    <p className="text-sm text-gray-600">{seminar.description}</p>
                  )}
                  {seminar.scheduled_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(seminar.scheduled_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(speaker.email || speaker.contact_info || (speaker.speaker_contacts && speaker.speaker_contacts.length > 0)) && (
          <div>
            <h2 className="text-sm font-bold text-gray-400 tracking-widest mb-2">
              CONTACT
            </h2>
            {speaker.email && (
              <p className="text-sm text-gray-600">{speaker.email}</p>
            )}
            {speaker.contact_info && (
              <p className="text-sm text-gray-600">{speaker.contact_info}</p>
            )}
            {speaker.speaker_contacts?.map(({ contact_id, contact }) => (
              <p key={contact_id} className="text-sm text-gray-600">{contact}</p>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
