-- Migration 016 — Fan Wall.
-- Visitors leave a name + short message on the homepage Fan Wall. Every
-- message starts as "pending"; the admin approves/rejects/deletes from
-- Admin → Content → Fan Wall, and only "approved" messages are public.
-- All access goes through the site's APIs (service role), so RLS stays
-- closed like the rest of the schema.

create table if not exists fan_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table fan_messages enable row level security;
