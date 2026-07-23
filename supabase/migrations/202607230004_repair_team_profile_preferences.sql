-- Restore the editable team title and notification preference fields.
-- Existing profile identities, roles, names, and avatars are preserved.

alter table public.profiles
  add column if not exists title text,
  add column if not exists notifications_enabled boolean not null default true;

notify pgrst, 'reload schema';
