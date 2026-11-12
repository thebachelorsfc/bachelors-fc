import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CapBadge from "@/components/CapBadge";
import { getAllSessions, getPlayers } from "@/lib/data";
import { getInPlayers } from "@/lib/rsvps";
import { getReports } from "@/lib/reports";
import { getSessionMatchStats } from "@/lib/matchStats";

export const dynamic = "force-dynamic";

// Match Report (2026-11-12): one page per played session — the fixture
// facts, Man of the Match, who played (with their per-match numbers from
// the stats tracker) and the written report the club adds in Admin.
// Standing rule: NO scoreline is ever published, out of respect for the
// opponent — per-player goals are shown, never a match score.
const sessMs = (x: any) => {
  const [Y, M, D] = String(x.session_date).split("-").map(Number);
  const [h, mi] = String(x.session_time || "12:00").slice(0, 5).split(":").map(Number);
  return Date.UTC(Y, (M || 1) - 1, D || 1, (h || 0) - 6, mi || 0);
};
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtTime = (t?: string | null) => {
  if (!t) return "";
  const [h, mi] = String(t).slice(0, 5).split(":").map(Number);
  if (isNaN(h)) return String(t);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mi || 0).padStart(2, "0")} ${ap}`;
};
const fxTitle = (s: any) => (s.opponent ? `The Bachelors FC vs ${s.opponent}` : s.title || "Club Session");

async function loadSession(id: string) {
  const sessions: any[] = (await getAllSessions()) ?? [];
  return sessions.find((s: any) => s.id === id) || null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const s = await loadSession(params.id);
  if (!s) return { title: "Match Report | The Bachelors FC" };
  return {
    title: `Match Report — ${fxTitle(s)} | The Bachelors FC`,
    description: `The story of ${fxTitle(s)} — played ${s.session_date ? fmtDate(s.session_date) : ""} in Khulshi, Chittagong. Friendlies are about brotherhood; no scorelines, ever.`,
    alternates: { canonical: `/match/${params.id}` },
  };
}

export default async function MatchReportPage({ params }: { params: { id: string } }) {
  const s = await loadSession(params.id);
  if (!s) notFound();
  const playedMatch = s.session_date ? sessMs(s) <= Date.now() : false;
  const [playersRaw, reports, stats, inMap] = await Promise.all([
    getPlayers(),
    getReports(),
    playedMatch ? getSessionMatchStats(s.id) : Promise.resolve([]),
    getInPlayers([s.id]),
  ]);
  const players: any[] = playersRaw ?? [];
  const pmap = new Map(players.map((p: any) => [p.id, p]));
  const motm: any = s.motm_player_id ? pmap.get(s.motm_player_id) : null;
  const report = reports[s.id];
  const playedEntries = (stats || []).filter((e: any) => e.played);
  const statByPlayer = new Map(playedEntries.map((e: any) => [e.player_id, e]));
  const lineup: any[] = playedEntries.length
    ? playedEntries.map((e: any) => pmap.get(e.player_id)).filter(Boolean)
    : (inMap[s.id] || []).map((x: any) => pmap.get(x.id)).filter(Boolean);
  const lineupLabel = playedEntries.length ? "Who played" : "Players who were in";
  const bits = (p: any) => {
    const e: any = statByPlayer.get(p.id);
    if (!e) return "";
    const parts: string[] = [];
    if (e.goals) parts.push(`⚽ ${e.goals}`);
    if (e.assists) parts.push(`🎯 ${e.assists}`);
    if (e.saves) parts.push(`🧤 ${e.saves} saves`);
    if (e.penalties_saved) parts.push(`🧤 ${e.penalties_saved} pen. saved`);
    if (e.clean_sheet) parts.push("🧱 Clean sheet");
    if (e.yellow_cards) parts.push(`🟨 ${e.yellow_cards}`);
    if (e.red_cards) parts.push(`🟥 ${e.red_cards}`);
    return parts.join(" · ");
  };

  return (
    <main className="wrap">
      <section>
        <p style={{ margin: "0 0 14px" }}><Link className="btn ghost" style={{ padding: "8px 14px", fontSize: 13 }} href="/fixtures">← Fixtures &amp; Results</Link></p>
        <p className="eyebrow">Match Report</p>
        <h1>{fxTitle(s)}</h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 6 }}>
          {s.session_date ? fmtDate(s.session_date) : ""}{s.session_time ? ` · 🕒 ${fmtTime(s.session_time)}` : ""}{s.ground ? ` · 📍 ${s.ground}` : ""}
        </p>

        {!playedMatch ? (
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>This match has not been played yet</h3>
            <p className="copy" style={{ margin: 0 }}>The report lands here after the final whistle. Until then — see the fixture, rally the brotherhood, and be there.</p>
          </div>
        ) : (
          <>
            {motm && (
              <div className="card" style={{ marginTop: 20, borderColor: "var(--line-gold)" }}>
                <p className="eyebrow" style={{ margin: 0 }}>🏆 Man of the Match</p>
                <h3 className="name-row" style={{ margin: "8px 0 2px" }}>{motm.name}{motm.is_captain ? <CapBadge /> : null}</h3>
                <p style={{ color: "var(--muted)", margin: 0 }}>#{motm.jersey_no} · {motm.position}</p>
              </div>
            )}

            {report ? (
              <div className="card" style={{ marginTop: 18 }}>
                <p className="eyebrow">The Story</p>
                {report.text.split(/\n{2,}/).map((para: string, i: number) => (
                  <p className="copy" key={i} style={{ marginTop: i === 0 ? 8 : 14 }}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="card" style={{ marginTop: 18 }}>
                <p className="copy" style={{ margin: 0 }}>The written story of this one is still being put into words by the brotherhood. The facts below are already on the record.</p>
              </div>
            )}

            {lineup.length > 0 && (
              <div className="card" style={{ marginTop: 18 }}>
                <p className="eyebrow">{lineupLabel}</p>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {lineup.map((p: any) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                      <strong className="name-row">{p.name}{p.is_captain ? <CapBadge /> : null}</strong>
                      <span style={{ color: "var(--muted)", fontSize: 13.5 }}>#{p.jersey_no} · {p.position}</span>
                      {bits(p) && <span style={{ color: "var(--gold-text)", fontSize: 13.5, fontWeight: 600 }}>{bits(p)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ color: "var(--muted)", marginTop: 18, fontSize: 14.5 }}>Friendlies are for enjoyment and brotherhood — out of respect for our opponents, we never publish scorelines.</p>
          </>
        )}
      </section>
    </main>
  );
}
