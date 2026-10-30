"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Slim Next Match card with a live kick-off countdown (2026-10-28, owner):
// the countdown chip sits in the card's top-right corner and ticks every
// second; the moment it reaches zero the whole card vanishes, and it only
// reappears when a new upcoming session exists (the server passes the
// earliest upcoming session only). startsAt is an absolute instant — the
// session's Dhaka wall time converted to UTC — so the countdown is right
// in any visitor's timezone.
export default function NextMatchCard({ tag, opponent, meta, startsAt, directions, matchday, ground, inPlayers }: { tag: string; opponent: string; meta: string; startsAt: string; directions?: string; matchday?: boolean; ground?: string; inPlayers?: { id: string; name: string; photo_url?: string | null }[] }) {
  const start = new Date(startsAt).getTime();
  const [left, setLeft] = useState<number>(() => start - Date.now());
  useEffect(() => {
    setLeft(start - Date.now());
    const id = setInterval(() => setLeft(start - Date.now()), 1000);
    return () => clearInterval(id);
  }, [start]);
  if (!isFinite(start) || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const val = d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
  const downloadIcs = () => {
    const dt = (x: Date) => x.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const startD = new Date(startsAt);
    const endD = new Date(startD.getTime() + 2 * 3600 * 1000);
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Bachelors FC//Fixtures//EN", "BEGIN:VEVENT", `UID:${startD.getTime()}@bachelors-fc.vercel.app`, `DTSTAMP:${dt(new Date())}`, `DTSTART:${dt(startD)}`, `DTEND:${dt(endD)}`, `SUMMARY:The Bachelors FC${opponent ? ` vs ${opponent}` : " — Club Session"}`];
    if (ground) lines.push(`LOCATION:${ground}, Chittagong`);
    lines.push("END:VEVENT", "END:VCALENDAR");
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = "bachelors-fc-match.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  return (
    <div className={matchday ? "nm-card matchday" : "nm-card"}>
      <div className="nm-toprow">
        <span className="nm-tag">{tag}</span>
        <span className="nm-count"><span className="nm-count-label">Kick-off in</span><span className="nm-count-val" suppressHydrationWarning>{val}</span></span>
      </div>
      <div className="nm-bottom">
        <div>
          <div className="nm-title">The Bachelors FC{opponent ? ` vs ${opponent}` : ""}</div>
          <div className="nm-meta">{meta}</div>
        </div>
        <div className="nm-actions">
          <Link className="btn nm-rsvp" href="/login">Player Login · RSVP →</Link>
          {directions ? <a className="btn ghost nm-dir" href={directions} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>Get Directions</a> : null}
          <button type="button" className="btn ghost nm-dir" onClick={downloadIcs}>📅 Add to Calendar</button>
        </div>
      </div>
      {inPlayers && inPlayers.length > 0 && (
        <div className="nm-who">
          <span className="nm-who-stack">
            {inPlayers.slice(0, 6).map(p => p.photo_url
              ? <Image key={p.id} src={p.photo_url} alt={p.name} width={30} height={30} />
              : <span key={p.id} className="nm-who-fallback">{(p.name || "?").trim().charAt(0)}</span>)}
          </span>
          <span className="nm-who-text"><strong>{inPlayers.length}</strong> {inPlayers.length === 1 ? "player is" : "players are"} already in{inPlayers.length > 6 ? ` · +${inPlayers.length - 6} more` : ""}</span>
        </div>
      )}
    </div>
  );
}
