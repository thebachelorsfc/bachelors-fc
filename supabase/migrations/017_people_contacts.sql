-- Migration 017: People cards gain Email + Telegram buttons.
-- Adds two optional contact columns to `people`, then fills the founder's
-- row with the contact details the owner supplied on 2026-10-31
-- (his own email + Telegram, shown next to Facebook / WhatsApp on /people).
-- Both fields stay editable afterwards in Admin -> People.

alter table people add column if not exists email text;
alter table people add column if not exists telegram_url text;

update people
set email = 'saidulmostafachy@gmail.com',
    telegram_url = 'https://t.me/saidulmostafachowdhury'
where role ilike '%founder%' or name ilike '%mostafa%';
