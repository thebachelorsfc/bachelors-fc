import { supabaseWrite } from "./supabase/admin";

// Shared MOTM helpers (server-side). Candidates for a session = players who were
// RSVP'd IN for it; if nobody RSVP'd, the whole active squad can be voted for.
export async function motmCandidates(w: NonNullable<ReturnType<typeof supabaseWrite>>, sessionId: string) {
  const { data: rsvps } = await w.from("session_rsvps").select("player_id").eq("session_id", sessionId).eq("status", "in");
  const inIds = (rsvps ?? []).map((r: any) => r.player_id);
  let q = w.from("players").select("id,name,jersey_no,position,position_code,photo_url").order("jersey_no");
  if (inIds.length) q = q.in("id", inIds);
  else q = q.eq("status", "active");
  const { data } = await q;
  return data ?? [];
}

export async function motmCounts(w: NonNullable<ReturnType<typeof supabaseWrite>>, sessionId: string): Promise<Record<string, number>> {
  const { data } = await w.from("motm_votes").select("candidate_player_id").eq("session_id", sessionId);
  const counts: Record<string, number> = {};
  (data ?? []).forEach((v: any) => { counts[v.candidate_player_id] = (counts[v.candidate_player_id] || 0) + 1; });
  return counts;
}

export const MIGRATION_HINT = "MOTM voting is not switched on yet — run migration 012 in Supabase (SQL Editor) first.";
export function looksLikeMissingSchema(error: any): boolean {
  const s = `${error?.code || ""} ${error?.message || ""}`;
  return /motm_votes|motm_open|motm_player_id|42703|PGRST204|PGRST205/.test(s);
}
