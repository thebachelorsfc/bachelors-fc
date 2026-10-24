import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getPlayers } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getPlayers()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const name=String(b.name||"").trim(), jersey_no=Number(b.jersey_no), position=String(b.position||"").trim(), position_code=String(b.position_code||"").trim();
  if (!name || !jersey_no || !position || !["FWD","MID","DEF","GK"].includes(position_code)) return NextResponse.json({ error:"Name, jersey number, position and code (FWD/MID/DEF/GK) required" }, { status:400 });
  const p = { id:newId(), name, jersey_no, position, position_code, photo_url:b.photo_url||null, joined_year:Number(b.joined_year)||2026, status:"active" as const };
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("players").insert({ ...p, id:undefined }); if (error) return NextResponse.json({ error:"Could not add player (jersey number may be taken)" }, { status:400 }); }
  else { const all = await store.players(); if (all.some(x=>x.jersey_no===jersey_no)) return NextResponse.json({ error:"Jersey number already taken" }, { status:400 }); await store.addPlayer(p); }
  return NextResponse.json(p); }
