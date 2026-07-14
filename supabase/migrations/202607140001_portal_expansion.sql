-- Lee Health Speakers Bureau: portal, requests, profiles, photos, and audit support.
-- Safe to run once in the Supabase SQL editor. Existing speaker/request data is preserved.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.speakers
  add column if not exists updated_at timestamptz default now();

update public.speakers
set updated_at = coalesce(created_at, now())
where updated_at is null;

drop trigger if exists speakers_set_updated_at on public.speakers;
create trigger speakers_set_updated_at
before update on public.speakers
for each row execute function public.set_updated_at();

alter table public.profiles
  add column if not exists email text,
  add column if not exists title text,
  add column if not exists avatar_url text,
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists updated_at timestamptz default now();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.speaker_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  community text not null,
  speaker_name text,
  talk_title text,
  desired_date text,
  status text not null default 'new',
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.speaker_requests
  add column if not exists requester_email text,
  add column if not exists requester_phone text,
  add column if not exists event_location text,
  add column if not exists expected_attendance integer,
  add column if not exists preferred_speaker_id integer references public.speakers(speaker_id) on delete set null,
  add column if not exists preferred_category text,
  add column if not exists message text,
  add column if not exists assigned_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists formspree_delivery_status text not null default 'pending';

drop trigger if exists speaker_requests_set_updated_at on public.speaker_requests;
create trigger speaker_requests_set_updated_at
before update on public.speaker_requests
for each row execute function public.set_updated_at();

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  entity_type text not null,
  entity_id text,
  target_label text,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists speakers_updated_at_idx on public.speakers(updated_at desc);
create index if not exists speaker_requests_status_created_idx on public.speaker_requests(status, created_at desc);
create index if not exists speaker_requests_assigned_user_idx on public.speaker_requests(assigned_user_id);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log(entity_type, entity_id);

create or replace function public.is_stakeholder(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = check_user_id and role = 'stakeholder'
  );
$$;

revoke all on function public.is_stakeholder(uuid) from public;
grant execute on function public.is_stakeholder(uuid) to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.speaker_requests enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "profiles_select_team" on public.profiles;
create policy "profiles_select_team"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_stakeholder());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.id := old.id;
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_identity on public.profiles;
create trigger profiles_protect_identity
before update on public.profiles
for each row execute function public.protect_profile_identity();

drop policy if exists "requests_team_read" on public.speaker_requests;
create policy "requests_team_read"
on public.speaker_requests for select to authenticated
using (public.is_stakeholder());

drop policy if exists "requests_team_update" on public.speaker_requests;
create policy "requests_team_update"
on public.speaker_requests for update to authenticated
using (public.is_stakeholder())
with check (public.is_stakeholder());

drop policy if exists "activity_team_read" on public.activity_log;
create policy "activity_team_read"
on public.activity_log for select to authenticated
using (public.is_stakeholder());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaker-photos',
  'speaker-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-avatars',
  'team-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "speaker_photos_public_read" on storage.objects;
create policy "speaker_photos_public_read"
on storage.objects for select to public
using (bucket_id = 'speaker-photos');

drop policy if exists "speaker_photos_team_insert" on storage.objects;
create policy "speaker_photos_team_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'speaker-photos' and public.is_stakeholder());

drop policy if exists "speaker_photos_team_update" on storage.objects;
create policy "speaker_photos_team_update"
on storage.objects for update to authenticated
using (bucket_id = 'speaker-photos' and public.is_stakeholder())
with check (bucket_id = 'speaker-photos' and public.is_stakeholder());

drop policy if exists "speaker_photos_team_delete" on storage.objects;
create policy "speaker_photos_team_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'speaker-photos' and public.is_stakeholder());

drop policy if exists "team_avatars_public_read" on storage.objects;
create policy "team_avatars_public_read"
on storage.objects for select to public
using (bucket_id = 'team-avatars');

drop policy if exists "team_avatars_self_insert" on storage.objects;
create policy "team_avatars_self_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'team-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "team_avatars_self_update" on storage.objects;
create policy "team_avatars_self_update"
on storage.objects for update to authenticated
using (bucket_id = 'team-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'team-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'speaker_requests'
  ) then
    alter publication supabase_realtime add table public.speaker_requests;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end $$;
