-- Repair the speakers update trigger contract without changing speaker data.
-- The trigger already assigns NEW.updated_at, so the column must exist.

alter table public.speakers
  add column if not exists updated_at timestamptz default now();

update public.speakers
set updated_at = coalesce(created_at, now())
where updated_at is null;

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

drop trigger if exists speakers_set_updated_at on public.speakers;
create trigger speakers_set_updated_at
before update on public.speakers
for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
