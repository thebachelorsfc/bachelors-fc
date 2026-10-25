import { NextResponse } from "next/server"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite(); if (sb) await sb.from("social_posts").delete().eq("id", params.id); else await store.deleteSocialPost(params.id);
  return NextResponse.json({ ok:true }); }
