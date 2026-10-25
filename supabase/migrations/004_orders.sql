-- The Bachelors FC — Store orders (manual bKash/Nagad payment with TrxID verification)
-- Run in Supabase SQL Editor (same as migrations 001–003). Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  product_name text not null,
  size text,
  amount_bdt int not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  payment_method text not null check (payment_method in ('bkash','nagad','messenger')),
  sender_number text,
  trx_id text,
  status text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- Anyone may PLACE an order; nobody can read orders publicly (admin reads via service-role key)
drop policy if exists "orders public insert" on orders;
create policy "orders public insert" on orders for insert with check (true);
