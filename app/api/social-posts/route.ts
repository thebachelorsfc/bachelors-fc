import { NextResponse } from "next/server"; import { store, newId, type SocialPost } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getSocialPosts } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getSocialPosts()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const post_url = String(b.post_url||"").trim();
  if (/facebook\.com\/share\//.test(post_url)) return NextResponse.json({ error:"That is a Facebook share link — the embed can't open it. Open the link in your browser, copy the address it lands on (facebook.com/.../posts/...), and paste that instead." }, { status:400 });
  let ok=false; try { const u=new URL(post_url); ok=/(^|\.)facebook\.com$/.test(u.hostname)||u.hostname==="fb.watch"; } catch { ok=false; }
  if (!ok) return NextResponse.json({ error:"Paste a Facebook post link (facebook.com/...)" }, { status:400 });
  const p: SocialPost = { id:newId(), post_url, created_at:new Date().toISOString() };
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("social_posts").insert({ post_url }); if (error) return NextResponse.json({ error:"Could not save — has the Social Posts SQL been run in Supabase?" }, { status:500 }); }
  else await store.addSocialPost(p);
  return NextResponse.json(p); }
