import { NextResponse } from "next/server";
import { verifyPlayer } from "@/lib/playerAuth";
import { supabaseWrite } from "@/lib/supabase/admin";
import { motmCandidates, motmCounts } from "@/lib/motm";
import { computeStreaks } from "@/lib/streaks";
export const dynamic = "force-dynamic";

// Perf (2026-10-31): ONE aggregate call for the whole player dashboard.
// The page used to chain /api/player/me -> /api/player/sessions and then
// MotmVote + StreakChip fetched again on mount — 4 authenticated round
// trips in a row, each re-verifying the token. Here the token is verified
// ONCE and every query runs in parallel. Response shape mirrors the old
// endpoints: { email, account, player, sessions, motm: { open }, streak }.
export async function GET(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const base: any = { email: user.email, account, player: null, sessions: [], motm: { open: [] }, streak: null };
  const w = supabaseWrite();
  if (!w || !account?.player_id) return NextResponse.json(base);
  if (account.status !== "approved") {
    const { data } = await w.from("players").select("*").eq("id", account.player_id).limit(1);
    base.player = data?.[0] ?? null;
    return NextResponse.json(base);
  }

  const [playerRes, sessRes, motmRes, streaks] = await Promise.all([
    w.from("players").select("*").eq("id", account.player_id).limit(1),
    w.from("sessions").select("*").order("session_date", { ascending: true }),
    w.from("sessions").select("id,title,session_date,session_time,ground,opponent,motm_open").eq("motm_open", true).order("session_date", { ascending: false }).limit(3),
    computeStreaks(),
  ]);
  base.player = playerRes.data?.[0] ?? null;
  base.streak = streaks[account.player_id] ?? { streak: 0, totalIn: 0 };

  // Upcoming sessions with the full RSVP picture (same shape as
  // /api/player/sessions).
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (sessRes.data ?? []).filter((s: any) => !s.session_date || s.session_date >= today).slice(0, 8);
  if (upcoming.length) {
    const ids = upcoming.map((s: any) => s.id);
    const [rsvpRes, plRes] = await Promise.all([
      w.from("session_rsvps").select("*").in("session_id", ids),
      w.from("players").select("id,name"),
    ]);
    const nameOf = new Map((plRes.data ?? []).map((p: any) => [p.id, p.name]));
    base.sessions = upcoming.map((s: any) => {
      const list = (rsvpRes.data ?? []).filter((r: any) => r.session_id === s.id).map((r: any) => ({ player_id: r.player_id, name: nameOf.get(r.player_id) || "Player", status: r.status }));
      return { ...s, rsvps: list, my_status: list.find((r: any) => r.player_id === account.player_id)?.status ?? null,
        counts: { in: list.filter((r: any) => r.status === "in").length, out: list.filter((r: any) => r.status === "out").length, maybe: list.filter((r: any) => r.status === "maybe").length } };
    });
  }

  // Open MOTM votes (same shape as /api/player/motm).
  const openSessions = motmRes.error ? [] : (motmRes.data ?? []);
  const open: any[] = [];
  for (const s of openSessions) {
    const candidates = await motmCandidates(w, s.id);
    const { data: mine } = await w.from("motm_votes").select("candidate_player_id").eq("session_id", s.id).eq("voter_player_id", account.player_id).limit(1);
    const myVote = mine?.[0]?.candidate_player_id ?? null;
    const counts = myVote ? await motmCounts(w, s.id) : null;
    open.push({ session: { id: s.id, title: s.title, session_date: s.session_date, session_time: s.session_time, ground: s.ground, opponent: s.opponent }, candidates, my_vote: myVote, counts });
  }
  base.motm = { open };
  return NextResponse.json(base);
}
