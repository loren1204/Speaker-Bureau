alter table public.speaker_requests
  add column if not exists requester_email text,
  add column if not exists requester_phone text,
  add column if not exists event_location text,
  add column if not exists expected_attendance integer,
  add column if not exists message text,
  add column if not exists formspree_delivery_status text not null default 'pending';

alter table public.speaker_requests
  drop constraint if exists speaker_requests_formspree_delivery_status_check;

alter table public.speaker_requests
  add constraint speaker_requests_formspree_delivery_status_check
  check (formspree_delivery_status in ('pending', 'delivered', 'failed'));
