import { NextResponse } from "next/server"; import { promises as fs } from "fs"; import path from "path"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite();
  if (sb) { const { data } = await sb.from("gallery_items").select("photo_url").eq("id", params.id).single();
    if (data?.photo_url?.includes("/storage/v1/object/public/gallery/")) { const name = data.photo_url.split("/gallery/").pop(); if (name) await sb.storage.from("gallery").remove([name]); }
    await sb.from("gallery_items").delete().eq("id", params.id);
  } else { const item = (await store.gallery()).find(x=>x.id===params.id);
    if (item?.photo_url?.startsWith("/uploads/")) { try { await fs.unlink(path.join(process.cwd(),"public",item.photo_url)); } catch {} }
    await store.deleteGalleryItem(params.id); }
  return NextResponse.json({ ok:true }); }
