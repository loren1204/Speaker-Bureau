import { supabase } from '../supabaseClient'

export async function uploadHeadshot(file, speakerId) {
  const ext      = file.name.split('.').pop()
  const filePath = `${speakerId}/headshot.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('speaker-headshots')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('speaker-headshots')
    .getPublicUrl(filePath)

  return publicUrl
}