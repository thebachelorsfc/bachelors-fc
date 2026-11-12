import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";

// Match report admin API (2026-11-12): reports live in one JSON file in
// the public gallery bucket (reports.json) — the same no-migration pattern
// as the ticker and hero slides. GET returns the whole map for the admin
// editor; POST saves (or, with empty text, removes) one session's report.
const FILE = "reports.json";
const MAX_LEN = 4000;

async function readReports(w: any): Promise<Record<string, { text: string; updated?: string }>> {
  const { data } = await w.storage.from("gallery").download(FILE);
  if (!data) return {};
  try {
    const j = JSON.parse(await data.text());
    return (j && typeof j.reports === "object" && j.reports) ? j.reports : {};
  } catch { return {}; }
}
async function saveReports(w: any, reports: any) {
  return w.storage.from("gallery").upload(FILE, new Blob([JSON.stringify({ reports })], { type: "application/json" }), { upsert: true, contentType: "application/json", cacheControl: "0" });
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ reports: {} });
  return NextResponse.json({ reports: await readReports(w) });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite();
  if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  const sid = String(b.session_id || "");
  if (!sid) return NextResponse.json({ error: "Missing session" }, { status: 400 });
  const text = String(b.text || "").trim().slice(0, MAX_LEN);
  const reports = await readReports(w);
  if (text) reports[sid] = { text, updated: new Date().toISOString() };
  else delete reports[sid];
  const { error } = await saveReports(w, reports);
  if (error) return NextResponse.json({ error: "Could not save the report" }, { status: 500 });
  return NextResponse.json({ ok: true, reports });
}
