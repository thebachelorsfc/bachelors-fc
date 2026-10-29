"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CapBadge from "@/components/CapBadge";

/* Public Leaderboard — live from the players' real stats (same numbers as the
   card backs). Podium for the top 3 + ranked rows. Plus the latest awarded
   Man of the Match spotlight from /api/motm. Renders nothing if no stats yet. */

type Cat = { key: string; label: string; icon: string; unit: string; value: (p: any) => number; sub: (p: any) => string };
const CATS: Cat[] = [
  { key: "goals", label: "Top Scorers", icon: "⚽", unit: "goals", value: p => Number(p.goals ?? 0), sub: p => `${p.matches_played ?? 0} matches` },
  { key: "assists", label: "Playmakers", icon: "🎯", unit: "assists", value: p => Number(p.assists ?? 0), sub: p => `${p.matches_played ?? 0} matches` },
  { key: "motm", label: "Most MOTM", icon: "🏆", unit: "MOTM awards", value: p => Number(p.motm ?? 0), sub: p => `${p.matches_played ?? 0} matches` },
  { key: "saves", label: "The Wall", icon: "🧤", unit: "saves", value: p => Number(p.saves ?? 0), sub: p => `${p.matches_played ?? 0} matches · ${p.clean_sheets ?? 0} clean sheets` },
];

function fmtDay(d?: string | null): string {
  if (!d) return "";
  const [y, m, dd] = d.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return y && m && dd ? `${dd} ${months[m - 1]} ${y}` : d;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<any[] | null>(null);
  const [latest, setLatest] = useState<any>(null);
  const [catKey, setCatKey] = useState("goals");

  useEffect(() => {
    fetch("/api/players").then(r => r.ok ? r.json() : []).then(j => setPlayers(Array.isArray(j) ? j : [])).catch(() => setPlayers([]));
    fetch("/api/motm").then(r => r.ok ? r.json() : { latest: null }).then(j => setLatest(j.latest)).catch(() => setLatest(null));
  }, []);

  const available = useMemo(() => CATS.filter(c => (players ?? []).some(p => c.value(p) > 0)), [players]);
  const cat = available.find(c => c.key === catKey) ?? available[0];
  const ranked = useMemo(() => {
    if (!cat || !players) return [];
    return players.filter(p => cat.value(p) > 0)
      .sort((a, b) => cat.value(b) - cat.value(a) || String(a.name).localeCompare(String(b.name)))
      .slice(0, 8);
  }, [cat, players]);

  if (players === null) return <p style={{ color: "var(--muted)" }}>Loading the leaderboard…</p>;
  if (!cat) return null;

  const [first, second, third, ...rest] = ranked;
  const Person = ({ p, big }: { p: any; big?: boolean }) => (
    <>
      {p.photo_url
        ? <Image className={big ? "lb-ava big" : "lb-ava"} src={p.photo_url} alt={p.name} width={128} height={128} loading="lazy" />
        : <span className={big ? "lb-ava big lb-ava-fb" : "lb-ava lb-ava-fb"}>{String(p.name).split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("")}</span>}
      <span className="lb-who"><strong><span className="name-row">{p.name}{p.is_captain ? <CapBadge /> : null}</span></strong><em>#{p.jersey_no} · {cat.sub(p)}</em></span>
      <span className={big ? "lb-val big" : "lb-val"}>{cat.value(p)}<small>{cat.unit}</small></span>
    </>
  );

  return (
    <div>
      {latest && (
        <div className="lb-spot">
          {latest.player.photo_url && <Image src={latest.player.photo_url} alt={latest.player.name} width={152} height={152} loading="lazy" />}
          <div className="lb-spot-body">
            <span className="lb-spot-kicker">🏆 Man of the Match</span>
            <strong><span className="name-row">{latest.player.name}{latest.player.is_captain ? <CapBadge /> : null}</span></strong>
            <em>{[latest.session.opponent ? `vs ${latest.session.opponent}` : latest.session.title, fmtDay(latest.session.session_date), latest.session.ground].filter(Boolean).join(" · ")}</em>
          </div>
          <span className="lb-spot-count">MOTM ×{latest.player.motm ?? 1}</span>
        </div>
      )}

      <div className="lb-tabs" role="tablist">
        {available.map(c => (
          <button key={c.key} role="tab" aria-selected={c.key === cat.key} className="btn"
            style={c.key === cat.key ? {} : { background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)" }}
            onClick={() => setCatKey(c.key)}>{c.icon} {c.label}</button>
        ))}
      </div>

      {first && (
        <div className="lb-first"><span className="lb-rank gold">1</span><Person p={first} big /></div>
      )}
      {(second || third) && (
        <div className="lb-podium2">
          {second && <div className="lb-mini"><span className="lb-rank">2</span><Person p={second} /></div>}
          {third && <div className="lb-mini"><span className="lb-rank">3</span><Person p={third} /></div>}
        </div>
      )}
      {rest.length > 0 && (
        <div className="lb-rows">
          {rest.map((p, i) => (
            <div className="lb-row" key={p.id || p.jersey_no}><span className="lb-rank sm">{i + 4}</span><Person p={p} /></div>
          ))}
        </div>
      )}
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 12 }}>Live from the squad&apos;s season stats — the same numbers on the back of every player card. MOTM is voted by the players after each match.</p>
    </div>
  );
}
