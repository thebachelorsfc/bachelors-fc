"use client";
import Image from "next/image";
import CapBadge from "@/components/CapBadge";
import { useState } from "react";
import type { Player } from "@/lib/players";
// Player trading card with a 3D flip (owner's feature, 2026-10-27): tap/click
// the front to flip to the back — season stats (matches/goals/assists; GK:
// clean sheets/saves), Passing & Passion rating bars, and the club crest.
// Stats are owner-entered in Admin → Players (SQL 009 + 010).
// Owner's final call 2026-10-27: NO social-media links on player cards.
// PRIVACY RULE (owner, 2026-10-27): the card shows ONLY performance stats
// and PUBLIC social profile links — never personal data (no phone number,
// age, address, education or anything else from the join application).
export default function PlayerCard({ p }: { p: Player }) {
  const [flip, setFlip] = useState(false);
  const matches = p.matches_played || 0, goals = p.goals || 0, assists = p.assists || 0;
  const isGK = p.position_code === "GK"; // GK card back: Clean Sheets / Saves instead of Goals / Assists
  const cleanSheets = p.clean_sheets || 0, saves = p.saves || 0;
  const motm = p.motm || 0, yc = p.yellow_cards || 0, rc = p.red_cards || 0, pens = p.penalties_saved || 0;
  const speed = Math.max(0, Math.min(100, p.speed || 0));
  const passing = Math.max(0, Math.min(100, p.passing || 0));
  const passion = Math.max(0, Math.min(100, p.passion || 0));
  return (
    <div className={flip ? "flip on" : "flip"}>
      <div className="flip-in">
        <article className="card player-card flip-face flip-front" onClick={() => setFlip(true)} role="button" tabIndex={0} aria-label={`Flip ${p.name}'s card to see stats`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip(true); } }}>
          {p.photo_url ? (<div className="photo"><Image src={p.photo_url} alt={p.name} fill sizes="(max-width:560px) 45vw, 255px" /><span className="num">#{p.jersey_no}</span><span className="flip-hint">↻ Stats</span></div>) : (<div className="photo" style={{ display: "grid", placeItems: "center" }}><span style={{ fontSize: 64, fontWeight: 800, color: "var(--gold)" }}>#{p.jersey_no}</span><span className="flip-hint">↻ Stats</span></div>)}
          <div className="eyebrow" style={{ marginTop: 12 }}>{p.position_code} · #{p.jersey_no}</div>
          <h3 style={{ margin: "6px 0" }}>{p.name}{p.is_captain ? <CapBadge /> : null}</h3>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>{p.position} · Joined {p.joined_year} · Active Member</p>
        </article>
        <article className="card player-card flip-face flip-back" onClick={() => setFlip(false)} role="button" tabIndex={0} aria-label={`Flip ${p.name}'s card back`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip(false); } }}>
          <span className="pb-ghost" aria-hidden="true">#{p.jersey_no}</span>
          <Image className="pb-wm" src="/assets/logo-transparent.png" alt="" width={240} height={284} style={{ objectFit: "contain" }} aria-hidden="true" />
          <div className="pb-top"><span className="pb-chip">{p.position_code} · #{p.jersey_no}</span><span className="pb-season">Season 2026</span></div>
          <h3 className="pb-name">{p.name}{p.is_captain ? <CapBadge /> : null}</h3>
          <p className="pb-pos">{p.position}{p.preferred_foot ? ` · ${p.preferred_foot} foot` : ""}</p>
          <div className="pb-stats">
            <div className="pb-stat"><b>{matches}</b><span>Matches</span></div>
            {isGK ? (<><div className="pb-stat"><b>{cleanSheets}</b><span>Clean Sheets</span></div><div className="pb-stat"><b>{saves}</b><span>Saves</span></div></>) : (<><div className="pb-stat"><b>{goals}</b><span>Goals</span></div><div className="pb-stat"><b>{assists}</b><span>Assists</span></div></>)}
          </div>
          <div className="pb-stats pb-stats2">
            <div className="pb-stat"><b>{motm}</b><span>MOTM 🏆</span></div>
            {isGK ? (<><div className="pb-stat"><b>{pens}</b><span>Pen. Saved</span></div><div className="pb-stat"><b>{yc}</b><span>Yellow 🟨</span></div></>) : (<><div className="pb-stat"><b>{yc}</b><span>Yellow 🟨</span></div><div className="pb-stat"><b>{rc}</b><span>Red 🟥</span></div></>)}
          </div>
          <div className="pb-bars">
            <div className="pb-bar"><span className="pb-bar-label">Passing</span><div className="pb-track"><i style={{ width: `${passing}%` }} /></div><b>{passing}</b></div>
            <div className="pb-bar"><span className="pb-bar-label">Passion</span><div className="pb-track"><i style={{ width: `${passion}%` }} /></div><b>{passion}</b></div>
            <div className="pb-bar"><span className="pb-bar-label">Speed</span><div className="pb-track"><i style={{ width: `${speed}%` }} /></div><b>{speed}</b></div>
          </div>
          <p className="pb-flipback">↩ Tap to flip back</p>
        </article>
      </div>
    </div>
  );
}
export function OpenShirt({ n }: { n: number }) { return (<article className="card player-card" style={{ opacity: .75 }}><div className="photo" style={{ display: "grid", placeItems: "center" }}><span style={{ fontSize: 64, fontWeight: 800 }}>#{n}</span></div><div className="eyebrow" style={{ marginTop: 12 }}>Squad spot open</div><h3 style={{ margin: "6px 0" }}>Player TBA</h3><p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>This shirt is waiting for its player.</p></article>) }
