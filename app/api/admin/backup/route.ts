import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
// Data backup (2026-11-05): one JSON file with every club table, so the
// owner can keep an offline copy — the free Supabase plan has no automatic
// backups. Admin-only. A table that fails to read lands in `errors` and
// never blocks the rest. Storage photos are listed by path (an inventory
// for a restore), the photo files themselves stay in the bucket.
const TABLES = ["players","sessions","session_rsvps","match_stats","motm_votes","applications","player_accounts","orders","products","grounds","people","social_posts","fan_messages","gallery_items","highlights","push_subscriptions"];
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Database is not set up yet" }, { status: 501 });
  const tables: Record<string, unknown> = {}; const errors: Record<string, string> = {}; const summary: Record<string, number> = {};
  await Promise.all(TABLES.map(async (t) => {
    const { data, error } = await w.from(t).select("*");
    if (error) { errors[t] = error.message; summary[t] = -1; }
    else { tables[t] = data ?? []; summary[t] = (data ?? []).length; }
  }));
  const storageFiles: string[] = [];
  try {
    for (const prefix of ["", "hero", "grounds", "people", "anthem"]) {
      const { data } = await w.storage.from("gallery").list(prefix, { limit: 1000 });
      for (const f of data ?? []) if ((f as any).id) storageFiles.push(prefix ? `${prefix}/${f.name}` : f.name);
    }
  } catch { /* listing is best-effort */ }
  const now = new Date();
  const dhakaDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const payload = { club: "The Bachelors FC", exportedAt: now.toISOString(), summary, tables, storageFiles, errors: Object.keys(errors).length ? errors : undefined };
  return new NextResponse(JSON.stringify(payload, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="bfc-backup-${dhakaDate}.json"`, "Cache-Control": "no-store" } }); }
