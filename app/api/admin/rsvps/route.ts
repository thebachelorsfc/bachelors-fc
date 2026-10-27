import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
// RSVP overview for the admin Sessions tab: recent sessions with who's in/out/maybe.
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json([]);
  const { data: sessions } = await w.from("sessions").select("*").order("session_date", { ascending: false }).limit(6);
  if (!sessions?.length) return NextResponse.json([]);
  const ids = sessions.map((s: any) => s.id);
  const { data: rsvps } = await w.from("session_rsvps").select("*").in("session_id", ids);
  const { data: players } = await w.from("players").select("id,name,jersey_no").order("jersey_no");
  const nameOf = new Map((players ?? []).map((p: any) => [p.id, p.name]));
  return NextResponse.json(sessions.map((s: any) => ({ id: s.id, title: s.title, session_date: s.session_date, session_time: s.session_time,
    list: (rsvps ?? []).filter((r: any) => r.session_id === s.id).map((r: any) => ({ name: nameOf.get(r.player_id) || "Player", status: r.status })),
    players: (players ?? []).map((p: any) => ({ id: p.id, name: p.name, jersey_no: p.jersey_no, status: (rsvps ?? []).find((r: any) => r.session_id === s.id && r.player_id === p.id)?.status || null })) }))); }
// Admin override (2026-10-27): the admin can mark any squad player IN/OUT/MAYBE
// for a session — session_rsvps is keyed by player_id, so this works even for
// players who have no login account yet. Players can still change it later
// from their own dashboard; last write wins.
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const status = String(b.status || "");
  if (!["in", "out", "maybe"].includes(status)) return NextResponse.json({ error: "Status must be in, out or maybe" }, { status: 400 });
  if (!b.session_id || !b.player_id) return NextResponse.json({ error: "Session and player required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "RSVP is not set up yet" }, { status: 501 });
  const { error } = await w.from("session_rsvps").upsert({ session_id: b.session_id, player_id: b.player_id, status }, { onConflict: "session_id,player_id" });
  if (error) return NextResponse.json({ error: "Could not save RSVP" }, { status: 500 });
  return NextResponse.json({ ok: true }); }
