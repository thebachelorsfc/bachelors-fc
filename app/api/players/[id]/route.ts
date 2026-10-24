import { NextResponse } from "next/server"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite(); if (sb) { await sb.from("players").delete().eq("id", params.id); } else await store.deletePlayer(params.id);
  return NextResponse.json({ ok:true }); }
export async function PATCH(req: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const patch = await req.json(); const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("players").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error:"Update failed" }, { status:500 }); return NextResponse.json({ ok:true }); }
  const p = await store.updatePlayer(params.id, patch); return p ? NextResponse.json(p) : NextResponse.json({ error:"Not found" }, { status:404 }); }
