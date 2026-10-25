-- The Bachelors FC — Phase 3 (Step 2): Gallery + Highlights
-- Run in Supabase SQL Editor (same as migration 001). Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  photo_url text not null,
  caption text,
  category text not null default 'team' check (category in ('match','training','tour','team')),
  taken_on date,
  created_at timestamptz not null default now()
);

create table if not exists highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  played_on date,
  created_at timestamptz not null default now()
);

alter table gallery_items enable row level security;
alter table highlights enable row level security;

-- Public can READ gallery + highlights (writes only via the service-role key used by /admin APIs)
drop policy if exists "gallery public read" on gallery_items;
create policy "gallery public read" on gallery_items for select using (true);
drop policy if exists "highlights public read" on highlights;
create policy "highlights public read" on highlights for select using (true);

-- Public photo bucket for gallery images
insert into storage.buckets (id, name, public) values ('gallery','gallery', true)
on conflict (id) do nothing;

drop policy if exists "gallery images public read" on storage.objects;
create policy "gallery images public read" on storage.objects
  for select using (bucket_id = 'gallery');
