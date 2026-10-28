-- Migration 012 — Man of the Match (MOTM) voting.
-- Players vote (one each, changeable while open) for the MOTM of a session the
-- admin opens voting for. On award, the winner is stored on the session and the
-- player's motm counter (migration 011) goes up by one. All access goes through
-- the site's verified APIs (service role), so RLS stays closed like the rest.

alter table sessions add column if not exists motm_open boolean not null default false;
alter table sessions add column if not exists motm_player_id uuid references players(id) on delete set null;

create table if not exists motm_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  voter_player_id uuid not null references players(id) on delete cascade,
  candidate_player_id uuid not null references players(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, voter_player_id)
);

alter table motm_votes enable row level security;
