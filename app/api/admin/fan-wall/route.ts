import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Admin Fan Wall moderation. GET lists every message (pending first).
// POST { id, action: "approve" | "reject" | "delete" }.
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json([]);
  const { data, error } = await w
    .from("fan_messages")
    .select("id,name,message,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json([]);
  const rows = data ?? [];
  rows.sort((a: any, b: any) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action || "");
  if (!b.id || !["approve", "reject", "delete"].includes(action)) {
    return NextResponse.json({ error: "Message and a valid action are required" }, { status: 400 });
  }
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ error: "Database not connected" }, { status: 501 });
  if (action === "delete") {
    const { error } = await w.from("fan_messages").delete().eq("id", b.id);
    if (error) return NextResponse.json({ error: "Could not delete — has migration 016 been run?" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const { error } = await w.from("fan_messages").update({ status: action === "approve" ? "approved" : "rejected" }).eq("id", b.id);
  if (error) return NextResponse.json({ error: "Could not update — has migration 016 been run?" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
