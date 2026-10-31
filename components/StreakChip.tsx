"use client";
import { useEffect, useState } from "react";

// Dashboard chip: the player's Iron Man streak (consecutive sessions
// answered IN) from /api/player/streak. Renders nothing until he has at
// least one IN — the streak has to be earned before it is shown.
export default function StreakChip({ token, initial }: { token: string; initial?: { streak: number; totalIn: number } | null }) {
  const [d, setD] = useState<{ streak: number; totalIn: number } | null>(initial && initial.totalIn > 0 ? initial : null);

  useEffect(() => {
    // Perf (2026-10-31): seed from the dashboard aggregate when provided.
    if (initial !== undefined) { setD(initial && initial.totalIn > 0 ? initial : null); return; }
    fetch("/api/player/streak", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (j && j.totalIn > 0) setD(j); })
      .catch(() => {});
  }, [token, initial]);

  if (!d) return null;
  return (
    <div className="card" style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 22 }} aria-hidden="true">🔥</span>
      <div style={{ flex: "1 1 220px" }}>
        <strong>Iron Man streak</strong>
        <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 14 }}>
          {d.streak >= 2
            ? <>You&apos;re on fire — <b style={{ color: "var(--gold-text)" }}>{d.streak} sessions IN a row</b> · {d.totalIn} IN in total. Keep the streak alive!</>
            : <>You&apos;ve said IN to {d.totalIn} session{d.totalIn === 1 ? "" : "s"} so far. String a few together to build your Iron Man streak!</>}
        </p>
      </div>
      <span className="eyebrow">🔥 {d.streak}</span>
    </div>
  );
}
