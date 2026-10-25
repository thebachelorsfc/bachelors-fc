-- The Bachelors FC — Phase 4 (Step 4): Player accounts for Player Login + RSVP
-- Run in Supabase SQL Editor (same as migrations 001–004). Safe to re-run.
-- Players sign up with Supabase Auth (email + password). Each auth user gets ONE row here;
-- the admin approves the account and links it to a squad player record. RSVPs then write
-- into session_rsvps (created in migration 001) against that linked player.

create table if not exists player_accounts (
  id uuid primary key,                       -- = Supabase Auth user id
  email text not null unique,
  player_id uuid references players(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table player_accounts enable row level security;
-- No public policies: accounts are only ever read/written by the site's server APIs
-- (service-role key) after verifying the player's login token. Nothing is public.

-- Migration 001 left RLS off on session_rsvps; close that now — RSVP data is
-- served only through the site's verified APIs, never directly to the public.
alter table session_rsvps enable row level security;
