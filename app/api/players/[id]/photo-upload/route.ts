import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { newId } from "@/lib/store";
export const dynamic = "force-dynamic";
const EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
// Start a player-photo upload (2026-10-31): returns a one-time signed URL so
// the browser sends the photo DIRECTLY to Supabase Storage. The old
// through-the-server POST died on Vercel's ~4.5 MB function payload cap for
// ordinary phone photos — the anthem lesson. The client PATCHes photo_url
// with the returned public URL once the upload lands.
export async function POST(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  const ext = String(b.ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!EXTS.includes(ext)) return NextResponse.json({ error: "That file is not a photo format the site can show — JPG, PNG or WebP works best." }, { status: 400 });
  const path = `players/player-${newId()}.${ext}`;
  const { data, error } = await w.storage.from("gallery").createSignedUploadUrl(path);
  if (error || !data?.token) return NextResponse.json({ error: "Could not start the upload — please try again" }, { status: 500 });
  const publicUrl = w.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ token: data.token, path, publicUrl }); }
