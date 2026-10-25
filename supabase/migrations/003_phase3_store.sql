-- The Bachelors FC — Phase 3 (Step 3): Store (showcase first)
-- Run in Supabase SQL Editor (same as migrations 001 + 002). Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  sizes text[] not null default '{S,M,L,XL}',
  price_bdt int,            -- NULL = showcase only, not for sale yet
  stock int,                -- NULL = not tracked
  is_available boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Public can READ products (writes only via the service-role key used by /admin APIs)
drop policy if exists "products public read" on products;
create policy "products public read" on products for select using (true);

-- Seed: the 2026 home jersey as a SHOWCASE product (no price until the owner decides to sell)
insert into products (name, description, photo_url, price_bdt, sort)
select 'BFC Home Jersey — 2026',
       'White base with navy pinstripes, navy sleeves & collar, gold & black hexagonal crest with lion emblem. The shirt eleven men chose to belong to.',
       '/assets/jersey.jpg', null, 1
where not exists (select 1 from products where name = 'BFC Home Jersey — 2026');
