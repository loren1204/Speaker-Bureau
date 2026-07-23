-- Align the request workflow constraint with the statuses used by the team portal.
-- Existing request rows are preserved. NOT VALID avoids blocking the repair if a
-- legacy row still contains an older status value.

alter table public.speaker_requests
  drop constraint if exists speaker_requests_status_check;

alter table public.speaker_requests
  add constraint speaker_requests_status_check
  check (status in ('new', 'in_review', 'contacted', 'scheduled', 'closed'))
  not valid;

do $$
begin
  if not exists (
    select 1
    from public.speaker_requests
    where status not in ('new', 'in_review', 'contacted', 'scheduled', 'closed')
  ) then
    alter table public.speaker_requests
      validate constraint speaker_requests_status_check;
  end if;
end
$$;

notify pgrst, 'reload schema';
