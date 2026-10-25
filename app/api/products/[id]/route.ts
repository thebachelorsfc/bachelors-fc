import { NextResponse } from "next/server"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function PATCH(req: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const patch: Record<string, unknown> = {};
  if ("price_bdt" in b) patch.price_bdt = b.price_bdt===""||b.price_bdt==null ? null : Number(b.price_bdt);
  if ("stock" in b) patch.stock = b.stock===""||b.stock==null ? null : Number(b.stock);
  if ("is_available" in b) patch.is_available = !!b.is_available;
  if ("name" in b) patch.name = String(b.name).trim();
  if ("description" in b) patch.description = b.description||null;
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("products").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error:"Update failed" }, { status:500 }); return NextResponse.json({ ok:true }); }
  const p = await store.updateProduct(params.id, patch as any); return p ? NextResponse.json(p) : NextResponse.json({ error:"Not found" }, { status:404 }); }
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite(); if (sb) await sb.from("products").delete().eq("id", params.id); else await store.deleteProduct(params.id);
  return NextResponse.json({ ok:true }); }
