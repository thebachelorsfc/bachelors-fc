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
// Homepage-only client (Phase 1, 2026-11-06): identical reads, but the fetch
// goes through Next's Data Cache with a 60s revalidate instead of no-store,
// so repeat homepage renders skip the database entirely. Used ONLY by the
// homepage bundle in app/page.tsx via the data getters' cached flag — every
// other page and API keeps the no-store client above.
let cached60: SupabaseClient | null = null;
const cachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, next: { revalidate: 60 } } as RequestInit);
export function supabaseCached(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached60 ??= createClient(url, key, { global: { fetch: cachedFetch } });
  return cached60;
}
export async function getPlayers() {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from("players").select("*").order("jersey_no");
  if (error || !data?.length) return null;
  return data;
}
