import { NextResponse } from "next/server";
import { verifyPlayer } from "@/lib/playerAuth";
import { supabaseWrite } from "@/lib/supabase/admin";
import { motmCandidates, motmCounts, MIGRATION_HINT, looksLikeMissingSchema } from "@/lib/motm";
export const dynamic = "force-dynamic";

// GET: open MOTM votes for the signed-in player (+ their current vote; counts are
// revealed only after they have voted, so early votes stay uninfluenced).
export async function GET(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user || account?.status !== "approved" || !account?.player_id) return NextResponse.json({ open: [] });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ open: [] });
  const { data: sessions, error } = await w.from("sessions").select("id,title,session_date,session_time,ground,opponent,motm_open").eq("motm_open", true).order("session_date", { ascending: false }).limit(3);
  if (error || !sessions?.length) return NextResponse.json({ open: [] });
  const out: any[] = [];
  for (const s of sessions) {
    const candidates = await motmCandidates(w, s.id);
    const { data: mine } = await w.from("motm_votes").select("candidate_player_id").eq("session_id", s.id).eq("voter_player_id", account.player_id).limit(1);
    const myVote = mine?.[0]?.candidate_player_id ?? null;
    const counts = myVote ? await motmCounts(w, s.id) : null;
    out.push({ session: { id: s.id, title: s.title, session_date: s.session_date, session_time: s.session_time, ground: s.ground, opponent: s.opponent }, candidates, my_vote: myVote, counts });
  }
  return NextResponse.json({ open: out });
}

// POST: cast or change my vote { session_id, candidate_id }.
export async function POST(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (account?.status !== "approved" || !account?.player_id) return NextResponse.json({ error: "Your account is not approved yet" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.session_id || !b.candidate_id) return NextResponse.json({ error: "Session and player required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Voting is not set up yet" }, { status: 501 });
  const { data: sess, error: se } = await w.from("sessions").select("id,motm_open").eq("id", b.session_id).limit(1);
  if (se) return NextResponse.json({ error: looksLikeMissingSchema(se) ? MIGRATION_HINT : "Could not load the session" }, { status: 500 });
  if (!sess?.[0]?.motm_open) return NextResponse.json({ error: "Voting is closed for this session" }, { status: 400 });
  const candidates = await motmCandidates(w, b.session_id);
  if (!candidates.some((c: any) => c.id === b.candidate_id)) return NextResponse.json({ error: "That player is not on this session's voting list" }, { status: 400 });
  const { error } = await w.from("motm_votes").upsert(
    { session_id: b.session_id, voter_player_id: account.player_id, candidate_player_id: b.candidate_id },
    { onConflict: "session_id,voter_player_id" }
  );
  if (error) return NextResponse.json({ error: looksLikeMissingSchema(error) ? MIGRATION_HINT : "Could not save your vote" }, { status: 500 });
  return NextResponse.json({ ok: true, counts: await motmCounts(w, b.session_id) });
}
