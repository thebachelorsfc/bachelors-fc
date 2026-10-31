import { NextResponse } from "next/server"; import { store, newId, type Highlight } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getHighlights } from "@/lib/data"; import { isVideoUrl, isFbShareLink } from "@/lib/video";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getHighlights()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const title = String(b.title||"").trim(), video_url = String(b.video_url||"").trim();
  if (isFbShareLink(video_url)) return NextResponse.json({ error:"That is a Facebook share link — the video player can't open it. Open the link in your browser, copy the address it lands on (facebook.com/reel/… or facebook.com/watch?v=…), and paste that instead." }, { status:400 });
  if (!title || !isVideoUrl(video_url)) return NextResponse.json({ error:"Title and a YouTube/Facebook link — or an uploaded video — required" }, { status:400 });
  const h: Highlight = { id:newId(), title, video_url, played_on: b.played_on||undefined, created_at:new Date().toISOString() };
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("highlights").insert({ title, video_url, played_on: h.played_on||null }); if (error) return NextResponse.json({ error:"Could not save highlight — has the Phase 3 SQL been run in Supabase?" }, { status:500 }); }
  else await store.addHighlight(h);
  return NextResponse.json(h); }
