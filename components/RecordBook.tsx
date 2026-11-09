import CardCarousel from "@/components/CardCarousel";
import CapBadge from "@/components/CapBadge";

// Club Record Book — moved from /history to the homepage, directly under
// the Leaderboard, at the owner's request (2026-11-09). Same rules as
// before: records auto-compute from live player data, zero-value records
// hide, the Iron Man card appears only at a streak of 2+, and a tie shows
// the first-listed holder (the owner's show-all-ties decision is pending).
export default function RecordBook({ players, streaks }: { players: any[]; streaks: Record<string, { streak: number; totalIn: number }> }) {
  const list: any[] = players ?? [];
  const best = (l: any[], fn: (p: any) => number) => {
    let bp: any = null, bv = 0;
    l.forEach(p => { const v = Number(fn(p)) || 0; if (v > bv) { bv = v; bp = p; } });
    return { p: bp, v: bv };
  };
  let streakRec: { p: any; v: number } | null = null;
  Object.entries(streaks || {}).forEach(([pid, s]: [string, any]) => {
    if (s.streak >= 2 && (!streakRec || s.streak > streakRec.v)) {
      const p = list.find(x => x.id === pid);
      if (p) streakRec = { p, v: s.streak };
    }
  });
  const gks = list.filter(p => p.position_code === "GK");
  const recList: any[] = [
    { label: "Top Scorer", unit: "goals", ...best(list, p => p.goals) },
    { label: "Top Playmaker", unit: "assists", ...best(list, p => p.assists) },
    { label: "Most Appearances", unit: "matches", ...best(list, p => p.matches_played) },
    { label: "Most MOTM Awards", unit: "awards", ...best(list, p => p.motm) },
    { label: "The Wall", unit: "clean sheets", ...best(gks, p => p.clean_sheets) },
  ];
  if (streakRec) recList.push({ label: "Iron Man — Best Streak", unit: "straight INs", p: (streakRec as any).p, v: (streakRec as any).v });
  const records = recList.filter((r: any) => r.p && r.v > 0) as any[];
  if (records.length === 0) return null;
  return (
    <section className="wrap">
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
  );
}
