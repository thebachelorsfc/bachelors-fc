import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
// RSVP overview for the admin Sessions tab: recent sessions with who's in/out/maybe.
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json([]);
  const { data: sessions } = await w.from("sessions").select("*").order("session_date", { ascending: false }).limit(6);
  if (!sessions?.length) return NextResponse.json([]);
  const ids = sessions.map((s: any) => s.id);
  const { data: rsvps } = await w.from("session_rsvps").select("*").in("session_id", ids);
  const { data: players } = await w.from("players").select("id,name");
  const nameOf = new Map((players ?? []).map((p: any) => [p.id, p.name]));
  return NextResponse.json(sessions.map((s: any) => ({ id: s.id, title: s.title, session_date: s.session_date, session_time: s.session_time,
    list: (rsvps ?? []).filter((r: any) => r.session_id === s.id).map((r: any) => ({ name: nameOf.get(r.player_id) || "Player", status: r.status })) }))); }
