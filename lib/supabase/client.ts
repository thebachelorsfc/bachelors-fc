import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let cached: SupabaseClient | null = null;
// Returns null when env is not set yet — pages then fall back to SEED_PLAYERS so the site never renders empty.
export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached ??= createClient(url, key);
  return cached;
}
export async function getPlayers() {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from("players").select("*").order("jersey_no");
  if (error || !data?.length) return null;
  return data;
}
