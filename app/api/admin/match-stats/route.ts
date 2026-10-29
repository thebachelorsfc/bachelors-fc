import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";

// Squad Stats Tracker (migration 014): per-session, per-player match stats.
// Saving a session's stats adjusts the season totals on `players` by the
// DIFFERENCE from what was saved before for that session — so totals the
// owner entered by hand earlier are never wiped, edits correct themselves,
// and saving the same numbers twice changes nothing.
const HINT = "Match stats are not switched on yet — run migration 014 in Supabase (SQL Editor) first.";
const missing = (e: any) => !!e && (e.code === "42P01" || /match_stats/i.test(String(e.message || "")) || /does not exist|schema cache/i.test(String(e.message || "")));
const num = (v: any) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(99, Math.max(0, n)) : 0; };

type Entry = { player_id: string; played: boolean; goals: number; assists: number; yellow_cards: number; red_cards: number; saves: number; penalties_saved: number; clean_sheet: boolean };
const blank = (player_id: string): Entry => ({ player_id, played: false, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, saves: 0, penalties_saved: 0, clean_sheet: false });
const clean = (r: any): Entry => ({ player_id: String(r.player_id), played: !!r.played, goals: num(r.goals), assists: num(r.assists), yellow_cards: num(r.yellow_cards), red_cards: num(r.red_cards), saves: num(r.saves), penalties_saved: num(r.penalties_saved), clean_sheet: !!r.clean_sheet });
const hasData = (e: Entry) => e.played || e.goals > 0 || e.assists > 0 || e.yellow_cards > 0 || e.red_cards > 0 || e.saves > 0 || e.penalties_saved > 0 || e.clean_sheet;

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sid = new URL(req.url).searchParams.get("session_id");
  if (!sid) return NextResponse.json({ error: "session_id required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Database not connected" }, { status: 501 });
  const { data: players, error: pe } = await w.from("players").select("id,name,jersey_no,position_code").order("jersey_no");
  if (pe) return NextResponse.json({ error: "Could not load players" }, { status: 500 });
  const { data: rsvps } = await w.from("session_rsvps").select("player_id,status").eq("session_id", sid);
  const rsvpOf = new Map((rsvps ?? []).map((r: any) => [r.player_id, r.status]));
  const { data: entries, error: ee } = await w.from("match_stats").select("*").eq("session_id", sid);
  if (ee) return NextResponse.json({ error: missing(ee) ? HINT : "Could not load match stats" }, { status: 500 });
  return NextResponse.json({
    roster: (players ?? []).map((p: any) => ({ ...p, rsvp: rsvpOf.get(p.id) ?? null })),
    entries: (entries ?? []).map(clean),
  });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.session_id || !Array.isArray(b.entries)) return NextResponse.json({ error: "Session and entries are required" }, { status: 400 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Database not connected" }, { status: 501 });

  const { data: oldRows, error: oe } = await w.from("match_stats").select("*").eq("session_id", b.session_id);
  if (oe) return NextResponse.json({ error: missing(oe) ? HINT : "Could not load existing stats" }, { status: 500 });
  const oldMap = new Map<string, Entry>((oldRows ?? []).map((r: any) => { const e = clean(r); return [e.player_id, e]; }));
  const newMap = new Map<string, Entry>();
  for (const r of b.entries) { if (r && r.player_id) { const e = clean(r); newMap.set(e.player_id, e); } }

  // Apply per-player deltas to the season totals.
  const idSet: Record<string, true> = {};
  oldMap.forEach((_v, k) => { idSet[k] = true; });
  newMap.forEach((_v, k) => { idSet[k] = true; });
  const ids = Object.keys(idSet);
  for (const pid of ids) {
    const o = oldMap.get(pid) ?? blank(pid);
    const n = newMap.get(pid) ?? blank(pid);
    const d = {
      matches_played: (n.played ? 1 : 0) - (o.played ? 1 : 0),
      goals: n.goals - o.goals,
      assists: n.assists - o.assists,
      yellow_cards: n.yellow_cards - o.yellow_cards,
      red_cards: n.red_cards - o.red_cards,
      saves: n.saves - o.saves,
      penalties_saved: n.penalties_saved - o.penalties_saved,
      clean_sheets: (n.clean_sheet ? 1 : 0) - (o.clean_sheet ? 1 : 0),
    };
    if (Object.keys(d).every(k => (d as Record<string, number>)[k] === 0)) continue;
    const { data: pl, error: ple } = await w.from("players").select("matches_played,goals,assists,yellow_cards,red_cards,saves,penalties_saved,clean_sheets").eq("id", pid).limit(1);
    if (ple || !pl?.[0]) continue;
    const cur: any = pl[0];
    const upd: Record<string, number> = {};
    for (const k of Object.keys(d) as (keyof typeof d)[]) upd[k] = Math.max(0, Number(cur[k] ?? 0) + d[k]);
    const { error: ue } = await w.from("players").update(upd).eq("id", pid);
    if (ue) return NextResponse.json({ error: "Could not update a player's totals", detail: ue.message }, { status: 500 });
  }

  // Persist this session's entries (only rows that carry data).
  const { error: de } = await w.from("match_stats").delete().eq("session_id", b.session_id);
  if (de) return NextResponse.json({ error: missing(de) ? HINT : "Could not save match stats", detail: de.message }, { status: 500 });
  const rows = Array.from(newMap.values()).filter(hasData).map(e => ({ session_id: b.session_id, player_id: e.player_id, played: e.played, goals: e.goals, assists: e.assists, yellow_cards: e.yellow_cards, red_cards: e.red_cards, saves: e.saves, penalties_saved: e.penalties_saved, clean_sheet: e.clean_sheet }));
  if (rows.length) {
    const { error: ie } = await w.from("match_stats").insert(rows);
    if (ie) return NextResponse.json({ error: missing(ie) ? HINT : "Could not save match stats", detail: ie.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved: rows.length });
}
