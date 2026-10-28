import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";
import { MIGRATION_HINT, looksLikeMissingSchema } from "@/lib/motm";
export const dynamic = "force-dynamic";

// Admin MOTM control: { session_id, action: "open" | "close" | "award", player_id? }
// Award stores the winner on the session and adds +1 to that player's motm stat.
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action || "");
  if (!b.session_id || !["open", "close", "award"].includes(action)) return NextResponse.json({ error: "Session and a valid action are required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Database not connected" }, { status: 501 });

  if (action === "open" || action === "close") {
    const { error } = await w.from("sessions").update({ motm_open: action === "open" }).eq("id", b.session_id);
    if (error) return NextResponse.json({ error: looksLikeMissingSchema(error) ? MIGRATION_HINT : "Could not update voting" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // award
  if (!b.player_id) return NextResponse.json({ error: "Pick the winning player" }, { status: 400 });
  const { data: sess, error: se } = await w.from("sessions").select("id,motm_player_id").eq("id", b.session_id).limit(1);
  if (se) return NextResponse.json({ error: looksLikeMissingSchema(se) ? MIGRATION_HINT : "Could not load the session" }, { status: 500 });
  if (sess?.[0]?.motm_player_id) return NextResponse.json({ error: "MOTM was already awarded for this session" }, { status: 400 });
  const { error: ue } = await w.from("sessions").update({ motm_player_id: b.player_id, motm_open: false }).eq("id", b.session_id);
  if (ue) return NextResponse.json({ error: looksLikeMissingSchema(ue) ? MIGRATION_HINT : "Could not save the award" }, { status: 500 });
  const { data: pl } = await w.from("players").select("motm").eq("id", b.player_id).limit(1);
  const cur = Number(pl?.[0]?.motm ?? 0);
  await w.from("players").update({ motm: cur + 1 }).eq("id", b.player_id);
  return NextResponse.json({ ok: true, motm: cur + 1 });
}
