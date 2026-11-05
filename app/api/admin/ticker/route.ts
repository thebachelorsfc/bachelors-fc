import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { TICKER_DEFAULTS } from "@/lib/ticker";
export const dynamic = "force-dynamic";
// Top ticker editor (2026-11-05): phrases are stored as one small JSON in
// the public gallery bucket (ticker.json), same pattern as the hero slides.
// GET returns the saved phrases, or the built-in defaults when none are
// saved yet (custom:false). POST action "save" replaces the list (1–12
// non-empty lines); action "reset" deletes the file so the defaults return.
async function readItems(w: any): Promise<string[]> {
  const { data } = await w.storage.from("gallery").download("ticker.json");
  if (!data) return [];
  try { const j = JSON.parse(await data.text()); return Array.isArray(j?.items) ? j.items.filter((s: any) => typeof s === "string" && s.trim()) : []; } catch { return []; }
}
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ items: TICKER_DEFAULTS, custom: false });
  const saved = await readItems(w);
  return NextResponse.json({ items: saved.length ? saved : TICKER_DEFAULTS, custom: saved.length > 0 }); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  if (b.action === "save") {
    const items = (Array.isArray(b.items) ? b.items : []).map((s: any) => String(s ?? "").trim()).filter(Boolean).slice(0, 12);
    if (!items.length) return NextResponse.json({ error: "At least one line is needed" }, { status: 400 });
    const { error } = await w.storage.from("gallery").upload("ticker.json", new Blob([JSON.stringify({ items })], { type: "application/json" }), { upsert: true, contentType: "application/json", cacheControl: "0" });
    if (error) return NextResponse.json({ error: "Could not save — please try again" }, { status: 500 });
    return NextResponse.json({ items, custom: true });
  }
  if (b.action === "reset") {
    await w.storage.from("gallery").remove(["ticker.json"]);
    return NextResponse.json({ items: TICKER_DEFAULTS, custom: false });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 }); }
