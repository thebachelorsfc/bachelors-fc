import { supabaseWrite } from "./supabase/admin";

// Iron Man streaks from RSVP history: for every player, the current streak
// of consecutive past sessions answered IN (walking back from the most
// recent session; any other status — or no answer — breaks it), plus the
// total number of IN answers. Public-safe aggregates: ids + counts only.
export async function computeStreaks(): Promise<Record<string, { streak: number; totalIn: number }>> {
  const sb = supabaseWrite();
  if (!sb) return {};
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const { data: sessions } = await sb
    .from("sessions")
    .select("id,session_date")
    .not("session_date", "is", null)
    .lte("session_date", today)
    .order("session_date", { ascending: false })
    .limit(24);
  if (!sessions || sessions.length === 0) return {};
  const ids = sessions.map((s: any) => s.id);
  const { data: rsvps } = await sb.from("session_rsvps").select("player_id,session_id,status").in("session_id", ids);
  const byPlayer = new Map<string, Map<string, string>>();
  (rsvps ?? []).forEach((r: any) => {
    if (!byPlayer.has(r.player_id)) byPlayer.set(r.player_id, new Map());
    byPlayer.get(r.player_id)!.set(r.session_id, String(r.status || "").toLowerCase());
  });
  const out: Record<string, { streak: number; totalIn: number }> = {};
  byPlayer.forEach((m, pid) => {
    let streak = 0;
    for (const s of sessions) {
      if (m.get((s as any).id) === "in") streak++;
      else break;
    }
    let totalIn = 0;
    m.forEach(v => { if (v === "in") totalIn++; });
    out[pid] = { streak, totalIn };
  });
  return out;
}
