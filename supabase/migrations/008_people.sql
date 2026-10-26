-- The Bachelors FC — People section (Founders & Leadership, Brotherhood-style)
-- One row per person: founder, manager, coach, player or well-wisher, with a
-- photo, role, quote, personal message (speech) and social profile links.
-- Run once in Supabase → SQL Editor. Safe to re-run.
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text,
  speech text,
  photo_url text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  whatsapp text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.people enable row level security;
drop policy if exists "people public read" on public.people;
create policy "people public read" on public.people for select using (true);
-- Writes happen only through the site's Admin (service role), never publicly.
-- Photos upload to the existing public "gallery" storage bucket (people/ prefix),
-- so no new bucket is needed.
