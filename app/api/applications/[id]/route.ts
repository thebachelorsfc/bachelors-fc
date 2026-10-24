import { NextResponse } from "next/server"; import { store, type Application } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export async function PATCH(req: Request, { params }: { params:{ id:string } }) {
  if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const { status } = await req.json(); if (!["pending","trial","approved","rejected"].includes(status)) return NextResponse.json({ error:"Bad status" }, { status:400 });
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("applications").update({ status }).eq("id", params.id); if (error) return NextResponse.json({ error:"Update failed" }, { status:500 }); return NextResponse.json({ ok:true }); }
  const a = await store.setApplicationStatus(params.id, status as Application["status"]); return a ? NextResponse.json(a) : NextResponse.json({ error:"Not found" }, { status:404 });
}
