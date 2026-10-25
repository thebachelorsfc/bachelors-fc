import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let cached: SupabaseClient | null = null;
// cache:"no-store" on every request — without it, Next.js can serve stale Supabase
// reads from its Data Cache inside page renders (e.g. an old product price).
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });
// Returns null when env is not set yet — pages then fall back to SEED_PLAYERS so the site never renders empty.
export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached ??= createClient(url, key, { global: { fetch: noStoreFetch } });
  return cached;
}
export async function getPlayers() {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from("players").select("*").order("jersey_no");
  if (error || !data?.length) return null;
  return data;
}
