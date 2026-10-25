import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function PATCH(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({})); const patch: Record<string, unknown> = {};
  if (["pending", "approved", "rejected"].includes(b.status)) patch.status = b.status;
  if ("player_id" in b) patch.player_id = b.player_id || null;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  // Approving only makes sense once the account is linked to a squad player.
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Not set up" }, { status: 501 });
  const { error } = await w.from("player_accounts").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true }); }
