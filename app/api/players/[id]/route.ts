import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { promises as fs } from "fs"; import path from "path";
export const dynamic = "force-dynamic";
// Upload a NEW photo file for a player (replaces the current squad photo).
export async function POST(req: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const fd = await req.formData(); const file = fd.get("photo");
  if (!file || typeof file==="string" || file.size===0) return NextResponse.json({ error:"Choose a photo file" }, { status:400 });
  if (file.size > 10*1024*1024) return NextResponse.json({ error:"Photo must be under 10MB" }, { status:400 });
  const ext = (file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
  const name = `player-${newId()}.${ext}`; const buf = Buffer.from(await file.arrayBuffer());
  const sb = supabaseWrite(); let photo_url = "";
  if (sb) {
    const up = await sb.storage.from("gallery").upload(`players/${name}`, buf, { contentType: file.type || "image/jpeg" });
    if (up.error) return NextResponse.json({ error:"Upload failed" }, { status:500 });
    photo_url = sb.storage.from("gallery").getPublicUrl(`players/${name}`).data.publicUrl;
    const { error } = await sb.from("players").update({ photo_url }).eq("id", params.id);
    if (error) return NextResponse.json({ error:"Could not save photo" }, { status:500 });
  } else {
    await fs.mkdir(path.join(process.cwd(),"public","uploads","players"),{recursive:true});
    await fs.writeFile(path.join(process.cwd(),"public","uploads","players",name), buf); photo_url = `/uploads/players/${name}`;
    const p = await store.updatePlayer(params.id, { photo_url }); if (!p) return NextResponse.json({ error:"Not found" }, { status:404 });
  }
  return NextResponse.json({ ok:true, photo_url }); }
export async function DELETE(_: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite(); if (sb) { await sb.from("players").delete().eq("id", params.id); } else await store.deletePlayer(params.id);
  return NextResponse.json({ ok:true }); }
export async function PATCH(req: Request, { params }: { params:{ id:string } }) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const raw = await req.json();
  // Allowlist: photo + card-back stats/socials (migration 009) + captain flag (013).
  const ALLOW = ["photo_url","matches_played","goals","assists","passing","passion","clean_sheets","saves","motm","yellow_cards","red_cards","penalties_saved","speed","preferred_foot","is_captain"];
  const patch: Record<string, unknown> = {}; for (const k of ALLOW) if (k in raw) patch[k] = raw[k];
  const sb = supabaseWrite();
  if (sb) {
    // One armband only: crowning a new captain clears the flag from everyone else.
    if (raw.is_captain === true) { const { error: ce } = await sb.from("players").update({ is_captain:false }).neq("id", params.id); if (ce) return NextResponse.json({ error:"Update failed — has migration 013 been run in Supabase?" }, { status:500 }); }
    const { error } = await sb.from("players").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error:"Update failed" }, { status:500 }); return NextResponse.json({ ok:true }); }
  if (raw.is_captain === true) { const all = await store.players(); for (const pl of all) if (pl.id !== params.id && (pl as any).is_captain) await store.updatePlayer(pl.id, { is_captain:false } as any); }
  const p = await store.updatePlayer(params.id, patch); return p ? NextResponse.json(p) : NextResponse.json({ error:"Not found" }, { status:404 }); }
