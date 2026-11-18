-- Migration 018: People cards gain a personal-website (globe) button.
-- Adds one optional column to `people`, then fills the founder's row with
-- his personal website (owner request, 2026-11-18). The button renders
-- right after the Email button on the People cards.
-- Editable afterwards in Admin -> People.

alter table people add column if not exists website_url text;

update people
set website_url = 'https://saidul-mostafa-chowdhury.vercel.app'
where role ilike '%founder%' or name ilike '%mostafa%';
