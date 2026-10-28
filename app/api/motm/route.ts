import { NextResponse } from "next/server";
import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";

// Public: the most recent awarded Man of the Match (for the homepage spotlight).
// Returns { latest: null } until migration 012 is run and an award exists.
export async function GET() {
  const w = supabaseWrite(); if (!w) return NextResponse.json({ latest: null });
  const { data: sessions, error } = await w.from("sessions")
    .select("id,title,session_date,opponent,ground,motm_player_id")
    .not("motm_player_id", "is", null)
    .order("session_date", { ascending: false }).limit(1);
  if (error || !sessions?.length) return NextResponse.json({ latest: null });
  const s: any = sessions[0];
  const { data: pl } = await w.from("players").select("id,name,jersey_no,position,position_code,photo_url,motm").eq("id", s.motm_player_id).limit(1);
  if (!pl?.length) return NextResponse.json({ latest: null });
  return NextResponse.json({ latest: { player: pl[0], session: { title: s.title, session_date: s.session_date, opponent: s.opponent, ground: s.ground } } });
}
