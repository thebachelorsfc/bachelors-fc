"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let cached: SupabaseClient | null = null;
// Browser-side client for PLAYER login (Supabase Auth). Uses only the public
// publishable key; all privileged reads/writes happen in server APIs after the
// player's access token is verified there.
export function supabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached ??= createClient(url, key);
  return cached;
}
