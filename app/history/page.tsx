import type { Metadata } from "next";
import CardCarousel from "@/components/CardCarousel";
import CapBadge from "@/components/CapBadge";
import { getPlayers } from "@/lib/data";
import { computeStreaks } from "@/lib/streaks";

export const metadata: Metadata = { title: "History | The Bachelors FC", alternates: { canonical: "/history" } };
export const dynamic = "force-dynamic";

// Only verified events. Add real match results here as the owner supplies them — do not invent results.
const EVENTS = [{ date: "2026", title: "The club is founded", text: "The Bachelors FC is founded in Khulshi, Chittagong." }, { date: "2026", title: "First squad named", text: "Atikur Jr. (#10), Parvez (#18) and Chowdhury (#99) are the first named players on the official site." }, { date: "2026", title: "The Bachelors on Tour", text: "One day, three destinations — Suptodhara Falls, Sohosrodhara Falls and Guliakhali Beach." }, { date: "28 Oct 2026", title: "First friendly — cricket day", text: "The club played its first-ever friendly cricket match, against Nightingale at Shahid Sahjahan Field. The Bachelors FC came out on top — but the day was never about the score. It was about friendship, laughter and the love of the game, exactly how a friendly should be." }];

export default async function History() {
  const [playersRaw, streaks] = await Promise.all([getPlayers(), computeStreaks()]);
  const players: any[] = playersRaw ?? [];
  const best = (list: any[], fn: (p: any) => number) => {
    let bp: any = null, bv = 0;
    list.forEach(p => { const v = Number(fn(p)) || 0; if (v > bv) { bv = v; bp = p; } });
    return { p: bp, v: bv };
  };
  let streakRec: { p: any; v: number } | null = null;
  Object.entries(streaks || {}).forEach(([pid, s]: [string, any]) => {
    if (s.streak >= 2 && (!streakRec || s.streak > streakRec.v)) {
      const p = players.find(x => x.id === pid);
      if (p) streakRec = { p, v: s.streak };
    }
  });
  const gks = players.filter(p => p.position_code === "GK");
  const recList: any[] = [
    { label: "Top Scorer", unit: "goals", ...best(players, p => p.goals) },
    { label: "Top Playmaker", unit: "assists", ...best(players, p => p.assists) },
    { label: "Most Appearances", unit: "matches", ...best(players, p => p.matches_played) },
    { label: "Most MOTM Awards", unit: "awards", ...best(players, p => p.motm) },
    { label: "The Wall", unit: "clean sheets", ...best(gks, p => p.clean_sheets) },
  ];
  if (streakRec) recList.push({ label: "Iron Man — Best Streak", unit: "straight INs", p: (streakRec as any).p, v: (streakRec as any).v });
  const records = recList.filter((r: any) => r.p && r.v > 0) as any[];

  return (
    <main className="wrap">
      <section>
        <p className="eyebrow">Club History</p>
        <h1>Our timeline</h1>
        <CardCarousel slide="min(340px,86%)">
          {EVENTS.map(e => <div className="card" key={e.title}><div className="eyebrow">{e.date}</div><h3>{e.title}</h3><p style={{ color: "var(--muted)" }}>{e.text}</p></div>)}
        </CardCarousel>
      </section>
      {records.length > 0 && (
        <section>
          <p className="eyebrow">Club Records</p>
          <h2>Record book</h2>
          <CardCarousel slide="min(340px,86%)">
            {records.map(r => (
              <div className="card" key={r.label}>
                <div className="eyebrow">{r.label}</div>
                <div className="rec-val">{r.v}<span className="rec-unit">{r.unit}</span></div>
                <h3 className="name-row">{r.p.name}{r.p.is_captain ? <CapBadge /> : null}</h3>
                <p style={{ color: "var(--muted)" }}>#{r.p.jersey_no} · {r.p.position}</p>
              </div>
            ))}
          </CardCarousel>
        </section>
      )}
    </main>
  );
}
