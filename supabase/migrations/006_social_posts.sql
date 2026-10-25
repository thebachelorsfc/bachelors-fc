-- The Bachelors FC — Social posts carousel (Step: Facebook per-post carousel)
-- Run once in Supabase → SQL Editor. Safe to re-run.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  post_url text not null,
  created_at timestamptz not null default now()
);
alter table public.social_posts enable row level security;
drop policy if exists "social_posts public read" on public.social_posts;
create policy "social_posts public read" on public.social_posts for select using (true);
-- Writes happen only through the site's Admin (service role), never publicly.
