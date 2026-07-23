-- Restore the audit table used by the authenticated Activity page.
-- This migration creates infrastructure only; it does not alter existing
-- speaker, seminar, request, or profile records.

create extension if not exists pgcrypto;

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

create index if not exists activity_log_created_idx
  on public.activity_log(created_at desc);

create index if not exists activity_log_entity_idx
  on public.activity_log(entity_type, entity_id);

create or replace function public.is_stakeholder(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id and role = 'stakeholder'
  );
$$;

revoke all on function public.is_stakeholder(uuid) from public;
grant execute on function public.is_stakeholder(uuid) to authenticated, service_role;

alter table public.activity_log enable row level security;

drop policy if exists "activity_team_read" on public.activity_log;
create policy "activity_team_read"
on public.activity_log for select to authenticated
using (public.is_stakeholder());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end
$$;

notify pgrst, 'reload schema';
