-- Migration 015: Web Push subscriptions for session notifications.
-- One row per subscribed device of an approved, linked player. All access
-- goes through the server APIs (service role) — no public policies.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
