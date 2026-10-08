-- SpendWise: per-account browser session heartbeat tracking.
-- Run once in Supabase Dashboard > SQL Editor.
create table if not exists public.user_device_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  device_label text not null default 'Trình duyệt không xác định',
  user_agent text not null default '',
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

alter table public.user_device_sessions enable row level security;

drop policy if exists "Users can view own device sessions" on public.user_device_sessions;
create policy "Users can view own device sessions"
  on public.user_device_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add own device sessions" on public.user_device_sessions;
create policy "Users can add own device sessions"
  on public.user_device_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own device sessions" on public.user_device_sessions;
create policy "Users can update own device sessions"
  on public.user_device_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own device sessions" on public.user_device_sessions;
create policy "Users can delete own device sessions"
  on public.user_device_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_device_sessions to authenticated;

create index if not exists user_device_sessions_last_seen_idx
  on public.user_device_sessions (user_id, last_seen desc);
