-- Restore generated integer IDs required by the authenticated speaker editor.
-- Existing IDs are preserved; the next generated value starts after the current maximum.

lock table public.speakers in share row exclusive mode;
lock table public.seminars in share row exclusive mode;

create sequence if not exists public.speakers_speaker_id_seq;
select setval(
  'public.speakers_speaker_id_seq',
  coalesce((select max(speaker_id) from public.speakers), 0) + 1,
  false
);
alter sequence public.speakers_speaker_id_seq owned by public.speakers.speaker_id;
alter table public.speakers
  alter column speaker_id set default nextval('public.speakers_speaker_id_seq');

create sequence if not exists public.seminars_seminar_id_seq;
select setval(
  'public.seminars_seminar_id_seq',
  coalesce((select max(seminar_id) from public.seminars), 0) + 1,
  false
);
alter sequence public.seminars_seminar_id_seq owned by public.seminars.seminar_id;
alter table public.seminars
  alter column seminar_id set default nextval('public.seminars_seminar_id_seq');
