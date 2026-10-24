import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getNextSession } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getNextSession()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); if (!String(b.title||"").trim()) return NextResponse.json({ error:"Title required" }, { status:400 });
  const s = { id:newId(), title:String(b.title).trim(), session_date:b.session_date||undefined, session_time:b.session_time||undefined, ground:b.ground||undefined, opponent:b.opponent||undefined, created_at:new Date().toISOString() };
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("sessions").insert({ ...s, id:undefined }); if (error) return NextResponse.json({ error:"Could not save session" }, { status:500 }); }
  else await store.addSession(s);
  return NextResponse.json(s); }
