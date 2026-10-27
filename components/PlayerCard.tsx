"use client";
import Image from "next/image";
import { useState } from "react";
import type { Player } from "@/lib/players";
// Player trading card with a 3D flip (owner's feature, 2026-10-27): tap/click
// the front to flip to the back — season stats (matches/goals/assists),
// Passing & Passion rating bars, and the player's social profiles at the
// bottom. Stats & socials are owner-entered in Admin → Players (SQL 009).
// PRIVACY RULE (owner, 2026-10-27): the card shows ONLY performance stats
// and PUBLIC social profile links — never personal data (no phone number,
// age, address, education or anything else from the join application).
export default function PlayerCard({ p }: { p: Player }) {
  const [flip, setFlip] = useState(false);
  const matches = p.matches_played || 0, goals = p.goals || 0, assists = p.assists || 0;
  const isGK = p.position_code === "GK"; // GK card back: Clean Sheets / Saves instead of Goals / Assists
  const cleanSheets = p.clean_sheets || 0, saves = p.saves || 0;
  const passing = Math.max(0, Math.min(100, p.passing || 0));
  const passion = Math.max(0, Math.min(100, p.passion || 0));
  const hasSocials = !!(p.facebook_url || p.instagram_url);
  return (
    <div className={flip ? "flip on" : "flip"}>
      <div className="flip-in">
        <article className="card player-card flip-face flip-front" onClick={() => setFlip(true)} role="button" tabIndex={0} aria-label={`Flip ${p.name}'s card to see stats`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip(true); } }}>
          {p.photo_url ? (<div className="photo"><Image src={p.photo_url} alt={p.name} fill sizes="(max-width:560px) 45vw, 255px" /><span className="num">#{p.jersey_no}</span><span className="flip-hint">↻ Stats</span></div>) : (<div className="photo" style={{ display: "grid", placeItems: "center" }}><span style={{ fontSize: 64, fontWeight: 800, color: "var(--gold)" }}>#{p.jersey_no}</span><span className="flip-hint">↻ Stats</span></div>)}
          <div className="eyebrow" style={{ marginTop: 12 }}>{p.position_code} · #{p.jersey_no}</div>
          <h3 style={{ margin: "6px 0" }}>{p.name}</h3>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>{p.position} · Joined {p.joined_year} · Active Member</p>
        </article>
        <article className="card player-card flip-face flip-back" onClick={() => setFlip(false)} role="button" tabIndex={0} aria-label={`Flip ${p.name}'s card back`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip(false); } }}>
          <div className="pb-top"><span className="pb-chip">{p.position_code} · #{p.jersey_no}</span><span className="pb-season">Season 2026</span></div>
          <h3 className="pb-name">{p.name}</h3>
          <p className="pb-pos">{p.position}</p>
          <div className="pb-stats">
            <div className="pb-stat"><b>{matches}</b><span>Matches</span></div>
            {isGK ? (<><div className="pb-stat"><b>{cleanSheets}</b><span>Clean Sheets</span></div><div className="pb-stat"><b>{saves}</b><span>Saves</span></div></>) : (<><div className="pb-stat"><b>{goals}</b><span>Goals</span></div><div className="pb-stat"><b>{assists}</b><span>Assists</span></div></>)}
          </div>
          <div className="pb-bars">
            <div className="pb-bar"><span className="pb-bar-label">Passing</span><div className="pb-track"><i style={{ width: `${passing}%` }} /></div><b>{passing}</b></div>
            <div className="pb-bar"><span className="pb-bar-label">Passion</span><div className="pb-track"><i style={{ width: `${passion}%` }} /></div><b>{passion}</b></div>
          </div>
          <div className="pb-spacer" />
          {hasSocials && (<div className="pb-socials">
            <span className="pb-connect">Connect</span>
            <div className="pb-soc-row">
              {p.facebook_url && <a className="person-soc" href={p.facebook_url} target="_blank" rel="noreferrer" title={`${p.name} on Facebook`} aria-label={`${p.name} on Facebook`} onClick={(e) => e.stopPropagation()}>f</a>}
              {p.instagram_url && <a className="person-soc" href={p.instagram_url} target="_blank" rel="noreferrer" title={`${p.name} on Instagram`} aria-label={`${p.name} on Instagram`} onClick={(e) => e.stopPropagation()}><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></svg></a>}
            </div>
          </div>)}
          <p className="pb-flipback">↩ Tap to flip back</p>
        </article>
      </div>
    </div>
  );
}
export function OpenShirt({ n }: { n: number }) { return (<article className="card player-card" style={{ opacity: .75 }}><div className="photo" style={{ display: "grid", placeItems: "center" }}><span style={{ fontSize: 64, fontWeight: 800 }}>#{n}</span></div><div className="eyebrow" style={{ marginTop: 12 }}>Squad spot open</div><h3 style={{ margin: "6px 0" }}>Player TBA</h3><p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>This shirt is waiting for its player.</p></article>) }
