import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

// Admin-only: delete a session and everything hanging off it (RSVPs, match
// stats entries, MOTM votes). Children are cleared first so the delete works
// whatever the individual foreign-key rules are.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const id = params.id;
  const sb = supabaseWrite();
  if (sb) {
    await sb.from("session_rsvps").delete().eq("session_id", id);
    await sb.from("match_stats").delete().eq("session_id", id);
    await sb.from("motm_votes").delete().eq("session_id", id);
    const { error } = await sb.from("sessions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Could not delete session", detail: error.message }, { status: 500 });
  } else {
    await store.removeSession(id);
  }
  return NextResponse.json({ ok: true });
}
