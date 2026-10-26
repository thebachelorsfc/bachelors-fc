import { supabase } from "./supabase/client"; import { store } from "./store";
// Unified reads: Supabase when connected, local store otherwise.
export async function getPlayers() {
  const sb = supabase();
  if (sb) { const { data } = await sb.from("players").select("*").order("jersey_no"); if (data?.length) return data; }
  return store.players();
}
export async function getAllSessions() {
  const sb = supabase();
  if (sb) { const { data } = await sb.from("sessions").select("*").order("session_date", { ascending: false }).limit(200); return (data as any[]) || []; }
  return ((await store.sessions()) as any[]).slice().sort((a, b) => String(b.session_date || "").localeCompare(String(a.session_date || "")));
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
export async function getGalleryItems() {
  const sb = supabase();
  if (sb) { const { data, error } = await sb.from("gallery_items").select("*").order("created_at", { ascending:false }); if (!error && data) return data; }
  return store.gallery();
}
export async function getProducts() {
  const sb = supabase();
  if (sb) { const { data, error } = await sb.from("products").select("*").order("sort").order("created_at"); if (!error && data) return data; }
  return store.products();
}
export async function getHighlights() {
  const sb = supabase();
  if (sb) { const { data, error } = await sb.from("highlights").select("*").order("created_at", { ascending:false }); if (!error && data) return data; }
  return store.highlights();
}
export async function getSocialPosts() {
  const sb = supabase();
  if (sb) { const { data, error } = await sb.from("social_posts").select("*").order("created_at", { ascending:false }); if (!error && data) return data; }
  return store.socialPosts();
}
export const usingSupabase = () => !!supabase();
