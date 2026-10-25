import { NextResponse } from "next/server"; import { verifyPlayer } from "@/lib/playerAuth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
// Upcoming sessions with the full RSVP picture (names), for approved players only.
export async function GET(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!account || account.status !== "approved" || !account.player_id) return NextResponse.json({ sessions: [] });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ sessions: [] });
  const today = new Date().toISOString().slice(0, 10);
  const { data: sessions } = await w.from("sessions").select("*").order("session_date", { ascending: true });
  const upcoming = (sessions ?? []).filter((s: any) => !s.session_date || s.session_date >= today).slice(0, 8);
  if (!upcoming.length) return NextResponse.json({ sessions: [] });
  const ids = upcoming.map((s: any) => s.id);
  const { data: rsvps } = await w.from("session_rsvps").select("*").in("session_id", ids);
  const { data: players } = await w.from("players").select("id,name");
  const nameOf = new Map((players ?? []).map((p: any) => [p.id, p.name]));
  const out = upcoming.map((s: any) => {
    const list = (rsvps ?? []).filter((r: any) => r.session_id === s.id).map((r: any) => ({ player_id: r.player_id, name: nameOf.get(r.player_id) || "Player", status: r.status }));
    return { ...s, rsvps: list, my_status: list.find((r: any) => r.player_id === account.player_id)?.status ?? null,
      counts: { in: list.filter((r: any) => r.status === "in").length, out: list.filter((r: any) => r.status === "out").length, maybe: list.filter((r: any) => r.status === "maybe").length } };
  });
  return NextResponse.json({ sessions: out });
}
