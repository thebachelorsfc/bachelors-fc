import { NextResponse } from "next/server"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const STATUSES = ["pending", "confirmed", "delivered", "cancelled"];
export async function PATCH(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const { status } = await req.json(); if (!STATUSES.includes(status)) return NextResponse.json({ error: "Bad status" }, { status: 400 });
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("orders").update({ status }).eq("id", params.id); if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 }); return NextResponse.json({ ok: true }); }
  const o = await store.setOrderStatus(params.id, status); return o ? NextResponse.json(o) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
