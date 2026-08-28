-- TokenHire storage. Run once in the Supabase SQL editor.
--
-- The API keeps one authoritative JSONB document. It is written only by the server
-- using the service-role key, which is why row level security denies everything by
-- default: no browser ever talks to this table directly.

create table if not exists public.app_state (
  id          text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- No policies are created on purpose. The service-role key bypasses RLS, and the
-- anon/authenticated keys therefore get nothing.
revoke all on public.app_state from anon, authenticated;

create index if not exists app_state_updated_at_idx on public.app_state (updated_at desc);

-- Point-in-time safety for a live hiring day: keep a rolling copy of each write so a
-- bad client push can be rolled back without losing the whole queue.
create table if not exists public.app_state_history (
  id          bigserial primary key,
  state_id    text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.app_state_history enable row level security;
revoke all on public.app_state_history from anon, authenticated;

create or replace function public.snapshot_app_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_state_history (state_id, data) values (old.id, old.data);
  delete from public.app_state_history
   where state_id = old.id
     and created_at < now() - interval '2 days';
  return new;
end;
$$;

drop trigger if exists app_state_history_trg on public.app_state;
create trigger app_state_history_trg
  before update on public.app_state
  for each row execute function public.snapshot_app_state();
