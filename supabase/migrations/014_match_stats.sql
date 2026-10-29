-- Migration 014: per-match player stats (Squad Stats Tracker).
-- One row per player per session: who played + what they did in that match.
-- Season totals on `players` are adjusted by the admin API whenever a
-- session's stats are saved or edited, so player cards + the leaderboard
-- stay correct without hand-editing totals.
create table if not exists public.match_stats (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  played boolean not null default true,
  goals int not null default 0,
  assists int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  saves int not null default 0,
  clean_sheet boolean not null default false,
  penalties_saved int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, player_id)
);
alter table public.match_stats enable row level security;
-- No public policies: reads and writes go through the admin API (service role).
