import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { newId } from "@/lib/store";
export const dynamic = "force-dynamic";
const EXTS = ["mp4", "webm", "mov", "m4v"];
// Start a phone-gallery video upload (2026-10-31): returns a one-time signed
// URL so the browser sends the video DIRECTLY to Supabase Storage — the
// anthem pattern. Through-the-server uploads die on Vercel's ~4.5 MB cap.
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  const ext = String(b.ext || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!EXTS.includes(ext)) return NextResponse.json({ error: "That file type is not a video the site can play — MP4 works best." }, { status: 400 });
  const path = `highlights/${newId()}.${ext}`;
  const { data, error } = await w.storage.from("gallery").createSignedUploadUrl(path);
  if (error || !data?.token) return NextResponse.json({ error: "Could not start the upload — please try again" }, { status: 500 });
  const publicUrl = w.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ token: data.token, path, publicUrl }); }
