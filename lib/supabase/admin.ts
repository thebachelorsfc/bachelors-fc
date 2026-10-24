import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// SERVER-ONLY admin client using the service-role key (bypasses RLS).
// The key must NEVER be exposed to the browser or committed — set SUPABASE_SERVICE_ROLE_KEY in env only.
// Used by the password-gated /admin API routes so club admins can review applications and manage players/sessions.
export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession:false } });
}
// For mutations: prefer admin client, fall back to anon client (RLS may reject), else null (= use local store)
export function supabaseWrite(): SupabaseClient | null {
  return supabaseAdmin() ?? (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : null);
}
