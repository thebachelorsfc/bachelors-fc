import { supabaseWrite } from "./supabase/admin";

// Per-session match stats for the public Match Report page — performance
// fields only (who played, goals, assists, cards, GK saves), read
// server-side exactly like lib/rsvps.ts. Returns [] when the tracker has
// no entries for the session or the table is unavailable.
export type MatchStatEntry = {
  player_id: string; played: boolean; goals: number; assists: number;
  yellow_cards: number; red_cards: number; saves: number; penalties_saved: number; clean_sheet: boolean;
};
export async function getSessionMatchStats(sessionId: string): Promise<MatchStatEntry[]> {
  const sb = supabaseWrite();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("match_stats")
      .select("player_id,played,goals,assists,yellow_cards,red_cards,saves,penalties_saved,clean_sheet")
      .eq("session_id", sessionId);
    if (error || !data) return [];
    return data as MatchStatEntry[];
  } catch { return []; }
}
