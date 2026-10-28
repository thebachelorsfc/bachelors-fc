"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Slim Next Match card with a live kick-off countdown (2026-10-28, owner):
// the countdown chip sits in the card's top-right corner and ticks every
// second; the moment it reaches zero the whole card vanishes, and it only
// reappears when a new upcoming session exists (the server passes the
// earliest upcoming session only). startsAt is an absolute instant — the
// session's Dhaka wall time converted to UTC — so the countdown is right
// in any visitor's timezone.
export default function NextMatchCard({ tag, opponent, meta, startsAt }: { tag: string; opponent: string; meta: string; startsAt: string }) {
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
  return (
    <div className="nm-card">
      <div className="nm-toprow">
        <span className="nm-tag">{tag}</span>
        <span className="nm-count"><span className="nm-count-label">Kick-off in</span><span className="nm-count-val" suppressHydrationWarning>{val}</span></span>
      </div>
      <div className="nm-bottom">
        <div>
          <div className="nm-title">The Bachelors FC{opponent ? ` vs ${opponent}` : ""}</div>
          <div className="nm-meta">{meta}</div>
        </div>
        <Link className="btn" href="/login">Player Login · RSVP →</Link>
      </div>
    </div>
  );
}
