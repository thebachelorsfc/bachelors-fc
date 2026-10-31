import type { Metadata } from "next";
import Link from "next/link";
import CardCarousel from "@/components/CardCarousel";
import { getAllSessions, getPlayers } from "@/lib/data";
import { getInPlayers } from "@/lib/rsvps";

export const metadata: Metadata = {
  title: "Fixtures & Results | The Bachelors FC",
  description: "Upcoming fixtures and played friendlies of The Bachelors FC, Khulshi, Chittagong. Friendlies are about brotherhood — no scorelines, ever.",
  alternates: { canonical: "/fixtures" },
};
export const dynamic = "force-dynamic";

// Same kick-off rule as the homepage card: Dhaka wall time as an absolute
// instant; a fixture is "upcoming" until its kick-off, then it is "played".
const sessMs = (x: any) => {
  const [Y, M, D] = String(x.session_date).split("-").map(Number);
  const [h, mi] = String(x.session_time || "12:00").slice(0, 5).split(":").map(Number);
  return Date.UTC(Y, (M || 1) - 1, D || 1, (h || 0) - 6, mi || 0);
};
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtTime = (t?: string | null) => {
  if (!t) return "";
  const [h, mi] = String(t).slice(0, 5).split(":").map(Number);
  if (isNaN(h)) return String(t);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mi || 0).padStart(2, "0")} ${ap}`;
};
const fxTitle = (s: any) => (s.opponent ? `The Bachelors FC vs ${s.opponent}` : s.title || "Club Session");

export default async function Fixtures() {
  const [sessions, players] = await Promise.all([getAllSessions(), getPlayers()]);
  const now = Date.now();
  const upcoming = (sessions as any[]).filter(s => s.session_date && sessMs(s) > now).sort((a, b) => sessMs(a) - sessMs(b));
  const played = (sessions as any[]).filter(s => s.session_date && sessMs(s) <= now).sort((a, b) => sessMs(b) - sessMs(a)).slice(0, 20);
  const inMap = await getInPlayers(upcoming.map(s => s.id));
  const pmap = new Map((players as any[]).map(p => [p.id, p]));
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

  return (
    <main className="wrap">
      <section>
        <p className="eyebrow">Match Centre</p>
        <h1>Fixtures &amp; Results</h1>
        <h2 style={{ marginTop: 34 }}>Upcoming</h2>
        {upcoming.length ? (
          <CardCarousel slide="min(340px,86%)">
            {upcoming.map(s => {
              const ins = inMap[s.id] || [];
              return (
                <div className="card" key={s.id}>
                  <div className="eyebrow">{s.session_date === todayStr ? "🔴 Match Today" : fmtDate(s.session_date)}</div>
                  <h3>{fxTitle(s)}</h3>
                  <p style={{ color: "var(--muted)" }}>
                    {s.session_date === todayStr ? `${fmtDate(s.session_date)}` : ""}{s.session_time ? `🕒 ${fmtTime(s.session_time)}` : ""}{s.ground ? `${s.session_time ? " · " : ""}📍 ${s.ground}` : ""}
                  </p>
                  {ins.length > 0 && <p style={{ color: "var(--gold-text)", fontWeight: 600 }}>✓ {ins.length} {ins.length === 1 ? "player" : "players"} already in</p>}
                  <p style={{ marginTop: 12 }}><Link className="btn" style={{ padding: "9px 16px", fontSize: 13 }} href="/login">Player Login · RSVP →</Link></p>
                </div>
              );
            })}
          </CardCarousel>
        ) : (
          <CardCarousel slide="min(340px,86%)">
            <div className="card">
              <div className="eyebrow">To Be Announced</div>
              <h3>Next fixture — to be announced</h3>
              <p className="copy">No match is scheduled right now. When the next battle is set, it will appear here first.</p>
            </div>
          </CardCarousel>
        )}
      </section>
      {played.length > 0 && (
        <section>
          <h2>Played</h2>
          <p className="copy" style={{maxWidth: 560, marginBottom: 18}}>Friendlies are for enjoyment and brotherhood — out of respect for our opponents, we never publish scorelines.</p>
          <CardCarousel slide="min(340px,86%)">
            {played.map(s => {
              const motm: any = s.motm_player_id ? pmap.get(s.motm_player_id) : null;
              return (
                <div className="card" key={s.id}>
                  <div className="eyebrow">{fmtDate(s.session_date)}</div>
                  <h3>{fxTitle(s)}</h3>
                  <p style={{ color: "var(--muted)" }}>{s.session_time ? `🕒 ${fmtTime(s.session_time)}` : ""}{s.ground ? `${s.session_time ? " · " : ""}📍 ${s.ground}` : ""}</p>
                  {motm && <p style={{ color: "var(--gold-text)", fontWeight: 600 }}>🏆 Man of the Match: {motm.name}</p>}
                </div>
              );
            })}
          </CardCarousel>
        </section>
      )}
    </main>
  );
}
