import { NextResponse } from "next/server"; import { verifyPlayer } from "@/lib/playerAuth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!account || account.status !== "approved" || !account.player_id)
    return NextResponse.json({ error: "Your account is not approved/linked yet — the club admin links your account to your squad profile first." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const status = String(b.status || "");
  if (!["in", "out", "maybe"].includes(status)) return NextResponse.json({ error: "Status must be in, out or maybe" }, { status: 400 });
  if (!b.session_id) return NextResponse.json({ error: "Session required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "RSVP is not set up yet" }, { status: 501 });
  const { error } = await w.from("session_rsvps").upsert({ session_id: b.session_id, player_id: account.player_id, status }, { onConflict: "session_id,player_id" });
  if (error) return NextResponse.json({ error: "Could not save your RSVP" }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
