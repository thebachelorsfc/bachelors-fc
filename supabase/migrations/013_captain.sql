-- Migration 013 — Club captain flag on players.
-- Exactly one player holds the armband: Admin → Players "Make © Captain" sets
-- this flag and the API clears it from everyone else. The captain headlines
-- the homepage Events section and gets a © chip on his player card.

alter table players add column if not exists is_captain boolean not null default false;
