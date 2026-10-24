-- The Bachelors FC — Phase 1 core schema (run in Supabase SQL Editor or via supabase db push)
create extension if not exists pgcrypto;

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jersey_no int not null unique,
  position text not null,
  position_code text not null check (position_code in ('FWD','MID','DEF','GK')),
  alt_position text, preferred_foot text check (preferred_foot in ('Left','Right','Both')),
  photo_url text, joined_year int not null default 2026,
  status text not null default 'active' check (status in ('active','inactive')),
  quote text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  -- Original BFC form fields, preserved exactly:
  full_name text not null, location text not null, email text not null, mobile text not null,
  educational_background text not null, marital_status text check (marital_status in ('Unmarried','Married')),
  age int not null, occupation text, why_join text,
  -- Brotherhood-style additions:
  whatsapp text, preferred_position text, blood_group text, photo_url text,
  status text not null default 'pending' check (status in ('pending','trial','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists grounds (
  id uuid primary key default gen_random_uuid(),
  name text not null, area text, maps_url text, created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null, session_date date, session_time time, ground text, ground_id uuid references grounds(id),
  opponent text, rsvp_deadline timestamptz, created_at timestamptz not null default now()
);

create table if not exists session_rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status text not null default 'in' check (status in ('in','out','maybe')),
  created_at timestamptz not null default now(), unique(session_id, player_id)
);

-- Public read for players/grounds/sessions; applications are insert-only for the public, review is admin/service-role only.
alter table players enable row level security;
alter table applications enable row level security;
alter table grounds enable row level security;
alter table sessions enable row level security;
create policy "players public read" on players for select using (true);
create policy "grounds public read" on grounds for select using (true);
create policy "sessions public read" on sessions for select using (true);
create policy "applications public insert" on applications for insert with check (true);

-- Seed: ONLY the 3 verified real players
insert into players (name, jersey_no, position, position_code, photo_url, joined_year) values
 ('Atikur Jr.', 10, 'Left Wing Forward', 'FWD', '/assets/players/atikur.jpg', 2026),
 ('Parvez', 18, 'Defender', 'DEF', '/assets/players/parvez.jpg', 2026),
 ('Chowdhury', 99, 'Goalkeeper', 'GK', '/assets/players/mostafa.png', 2026)
on conflict (jersey_no) do nothing;
