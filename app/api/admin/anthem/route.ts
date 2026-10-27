import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const PATH = "anthem/anthem.mp3";
// Which anthem is live: an admin-uploaded MP3 (fixed storage path) or the built-in?
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ custom: false });
  const { data } = await w.storage.from("gallery").list("anthem");
  return NextResponse.json({ custom: (data ?? []).some((f: any) => f.name === "anthem.mp3") }); }
// Upload a new anthem — overwrites the same fixed path, so the homepage
// switches automatically (its resolver prefers the storage copy).
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("audio");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an MP3 file first" }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "File too large — keep the anthem under 12 MB" }, { status: 400 });
  if (!/audio|\.mp3$/i.test(file.type + " " + file.name)) return NextResponse.json({ error: "That file is not an audio file — choose an MP3" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await w.storage.from("gallery").upload(PATH, buf, { contentType: "audio/mpeg", upsert: true });
  if (up.error) return NextResponse.json({ error: "Upload failed — please try again" }, { status: 500 });
  return NextResponse.json({ ok: true }); }
// Reset: delete the uploaded copy — the built-in anthem takes over again.
export async function DELETE() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const { error } = await w.storage.from("gallery").remove([PATH]);
  if (error) return NextResponse.json({ error: "Reset failed — please try again" }, { status: 500 });
  return NextResponse.json({ ok: true }); }
