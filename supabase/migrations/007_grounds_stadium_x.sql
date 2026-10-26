-- The Bachelors FC — Phase: Grounds upgrade (Brotherhood-style ground cards)
-- Adds address/photo/playing-history columns to grounds and seeds the club's
-- first ground, Stadium X (owner-supplied details, 2026-10-26).
-- Run once in Supabase → SQL Editor → New query → paste → Run.

alter table public.grounds add column if not exists address text;
alter table public.grounds add column if not exists photo_url text;
alter table public.grounds add column if not exists matches_played integer not null default 0;
alter table public.grounds add column if not exists last_played date;

insert into public.grounds (name, area, address, maps_url, photo_url, matches_played, last_played)
select 'Stadium X', 'Khulshi', 'Abdul Hannan Road, Khulshi, Chittagong',
       'https://maps.app.goo.gl/7YFCNrEpMvnMUKr39', '/assets/grounds/stadium-x.jpg', 3, '2026-08-31'
where not exists (select 1 from public.grounds where name = 'Stadium X');
