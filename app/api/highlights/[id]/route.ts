import { NextResponse } from "next/server"; import { store } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite();
  if (sb) {
    // If the highlight was an uploaded video, remove its Storage file too so
    // deleted clips don't pile up in the bucket.
    const { data } = await sb.from("highlights").select("video_url").eq("id", params.id).limit(1);
    const url = String(data?.[0]?.video_url || "");
    const m = url.match(/\/storage\/v1\/object\/public\/gallery\/(highlights\/[^?#]+)/);
    if (m) { try { await sb.storage.from("gallery").remove([decodeURIComponent(m[1])]); } catch (e) {} }
    await sb.from("highlights").delete().eq("id", params.id);
  } else await store.deleteHighlight(params.id);
  return NextResponse.json({ ok:true }); }
