import { supabase } from "./supabase/client"; import { store } from "./store";
// Unified reads: Supabase when connected, local store otherwise.
export async function getPlayers() {
  const sb = supabase();
  if (sb) { const { data } = await sb.from("players").select("*").order("jersey_no"); if (data?.length) return data; }
  return store.players();
}
export async function getNextSession() {
  const sb = supabase();
  if (sb) { const { data } = await sb.from("sessions").select("*").order("session_date", { ascending:true }).limit(1); if (data?.length) return data[0]; return null; }
  const all = await store.sessions(); return all[0] ?? null;
}
export async function getGrounds() {
  const sb = supabase();
  if (sb) { const { data } = await sb.from("grounds").select("*"); if (data) return data; }
  return store.grounds();
}
export const usingSupabase = () => !!supabase();
