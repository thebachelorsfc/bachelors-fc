import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";
import { NEWS_SEED, sanitizeNews } from "@/lib/news";

export const dynamic = "force-dynamic";

// Club News editor API (2026-11-26): the news list is stored as one small
// JSON in the public gallery bucket (news.json), same pattern as the
// ticker. GET returns the saved list, or the starter milestones when none
// are saved yet (custom:false). POST action "save" replaces the whole
// list (an empty list is allowed — the public site then shows no news);
// action "reset" deletes the file so the starter milestones return.
const FILE = "news.json";

async function readSaved(w: any): Promise<ReturnType<typeof sanitizeNews> | null> {
  const { data } = await w.storage.from("gallery").download(FILE);
  if (!data) return null;
  try {
    const j = JSON.parse(await data.text());
    return Array.isArray(j?.items) ? sanitizeNews(j.items) : null;
  } catch { return null; }
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ items: NEWS_SEED, custom: false });
  const saved = await readSaved(w);
  return NextResponse.json(saved === null ? { items: NEWS_SEED, custom: false } : { items: saved, custom: true });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  if (b.action === "save") {
    const items = sanitizeNews(Array.isArray(b.items) ? b.items : []);
    const { error } = await w.storage.from("gallery").upload(FILE, new Blob([JSON.stringify({ items })], { type: "application/json" }), { upsert: true, contentType: "application/json", cacheControl: "0" });
    if (error) return NextResponse.json({ error: "Could not save — please try again" }, { status: 500 });
    return NextResponse.json({ items, custom: true });
  }
  if (b.action === "reset") {
    await w.storage.from("gallery").remove([FILE]);
    return NextResponse.json({ items: NEWS_SEED, custom: false });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
