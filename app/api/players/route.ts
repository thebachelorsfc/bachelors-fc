import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getPlayers } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getPlayers()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const name=String(b.name||"").trim(), jersey_no=Number(b.jersey_no), position=String(b.position||"").trim(), position_code=String(b.position_code||"").trim();
  if (!name || !jersey_no || !position || !["FWD","MID","DEF","GK"].includes(position_code)) return NextResponse.json({ error:"Name, jersey number, position and code (FWD/MID/DEF/GK) required" }, { status:400 });
  // Photo: use the one sent with the request; otherwise AUTO-COPY the photo the
  // player attached to their join application (matched by name), so the admin
  // never has to re-upload it from the phone gallery.
  let photo_url: string|null = b.photo_url ? String(b.photo_url) : null;
  const sb = supabaseWrite();
  if (!photo_url) {
    const norm=(s:any)=>String(s||"").toLowerCase().replace(/\s+/g," ").trim();
    const toks=(s:any)=>norm(s).split(" ").filter(Boolean).sort().join(" ");
    let apps:any[]=[];
    if (sb) { const { data } = await sb.from("applications").select("full_name,photo_url,created_at").not("photo_url","is",null).order("created_at",{ascending:false}); apps=data||[]; }
    else { apps = await store.applications(); }
    const m = apps.find((a:any)=>a.photo_url && (norm(a.full_name)===norm(name) || toks(a.full_name)===toks(name)));
    if (m) photo_url = m.photo_url;
  }
  const p = { id:newId(), name, jersey_no, position, position_code, photo_url, joined_year:Number(b.joined_year)||2026, status:"active" as const };
  if (sb) { const { error } = await sb.from("players").insert({ ...p, id:undefined }); if (error) return NextResponse.json({ error:"Could not add player (jersey number may be taken)" }, { status:400 }); }
  else { const all = await store.players(); if (all.some(x=>x.jersey_no===jersey_no)) return NextResponse.json({ error:"Jersey number already taken" }, { status:400 }); await store.addPlayer(p); }
  return NextResponse.json(p); }
