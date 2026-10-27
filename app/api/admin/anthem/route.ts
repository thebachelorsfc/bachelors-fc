import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const PATH = "anthem/anthem.mp3";
// Which anthem is live: an admin-uploaded MP3 (fixed storage path) or the built-in?
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ custom: false });
  const { data } = await w.storage.from("gallery").list("anthem");
  return NextResponse.json({ custom: (data ?? []).some((f: any) => f.name === "anthem.mp3") }); }
// Start an upload: returns a one-time signed URL so the browser sends the
// MP3 DIRECTLY to Supabase Storage. (The old through-the-server upload hit
// Vercel's ~4.5 MB function payload cap and failed for full-size songs.)
export async function POST() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  await w.storage.from("gallery").remove([PATH]).catch(() => {});
  const { data, error } = await w.storage.from("gallery").createSignedUploadUrl(PATH);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Could not start the upload — please try again" }, { status: 500 });
  return NextResponse.json({ signedUrl: data.signedUrl }); }
// Reset: delete the uploaded copy — the built-in anthem takes over again.
export async function DELETE() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const { error } = await w.storage.from("gallery").remove([PATH]);
  if (error) return NextResponse.json({ error: "Reset failed — please try again" }, { status: 500 });
  return NextResponse.json({ ok: true }); }
