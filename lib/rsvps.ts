import { supabaseWrite } from "./supabase/admin";

// Public-safe RSVP "IN" lists per session — player names + photos only (the
// Who's In stack on the Next Match card and the fixture cards). Personal
// data never leaves through here.
export async function getInPlayers(
  sessionIds: string[]
): Promise<Record<string, { id: string; name: string; photo_url: string | null }[]>> {
  const out: Record<string, { id: string; name: string; photo_url: string | null }[]> = {};
  if (!sessionIds.length) return out;
  const sb = supabaseWrite();
  if (!sb) return out;
  const { data: rsvps } = await sb
    .from("session_rsvps")
    .select("player_id,session_id,status")
    .in("session_id", sessionIds);
  const ins = (rsvps ?? []).filter((r: any) => String(r.status || "").toLowerCase() === "in");
  if (!ins.length) return out;
  const pids = Array.from(new Set(ins.map((r: any) => r.player_id)));
  const { data: players } = await sb.from("players").select("id,name,photo_url").in("id", pids);
  const pmap = new Map((players ?? []).map((p: any) => [p.id, p]));
  ins.forEach((r: any) => {
    const p: any = pmap.get(r.player_id);
    if (!p) return;
    (out[r.session_id] = out[r.session_id] || []).push({ id: p.id, name: p.name, photo_url: p.photo_url || null });
  });
  return out;
}
