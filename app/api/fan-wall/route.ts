import { NextResponse } from "next/server";
import { supabaseWrite } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Fan Wall — public read of APPROVED messages; public submit lands as
// "pending" and only appears after the admin approves it (Admin → Content
// → Fan Wall). Names + messages only; plain text, length-capped.
const clean = (v: unknown, max: number) =>
  String(v ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const cleanMsg = (v: unknown, max: number) =>
  String(v ?? "").replace(/<[^>]*>/g, "").trim().slice(0, max);

export async function GET() {
  const w = supabaseWrite();
  if (!w) return NextResponse.json([]);
  const { data, error } = await w
    .from("fan_messages")
    .select("id,name,message,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  // Honeypot: real visitors never fill this hidden field.
  if (b.website) return NextResponse.json({ ok: true });
  const name = clean(b.name, 40);
  const message = cleanMsg(b.message, 280);
  if (name.length < 2) return NextResponse.json({ error: "Please add your name (at least 2 characters)" }, { status: 400 });
  if (message.length < 3) return NextResponse.json({ error: "Please write a message (at least 3 characters)" }, { status: 400 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ error: "The wall is not available right now" }, { status: 501 });
  const { error } = await w.from("fan_messages").insert({ name, message, status: "pending" });
  if (error) return NextResponse.json({ error: "Could not post your message — please try again later" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
