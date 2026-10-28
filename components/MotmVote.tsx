"use client";
import { useCallback, useEffect, useState } from "react";

/* Dashboard MOTM voting card — appears only while the admin has a vote open.
   One vote per player, changeable while open. Counts appear after you've voted. */
export default function MotmVote({ token }: { token: string }) {
  const [open, setOpen] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const r = await fetch("/api/player/motm", { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) { const j = await r.json(); setOpen(j.open ?? []); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function vote(sessionId: string, candidateId: string) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/player/motm", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id: sessionId, candidate_id: candidateId }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setMsg("Vote saved ✓"); load(); } else setMsg(j.error || "Could not save your vote");
    setBusy(false);
  }

  if (!open.length) return null;
  return (
    <>
      <h2 style={{ marginTop: 34 }}>Man of the Match — vote</h2>
      {msg && <p style={{ color: "var(--note)" }}>{msg}</p>}
      {open.map((o: any) => {
        const max = o.counts ? Math.max(1, ...Object.values(o.counts as Record<string, number>)) : 1;
        return (
          <div className="card" key={o.session.id} style={{ borderColor: "var(--line-gold)", marginBottom: 14 }}>
            <strong style={{ fontSize: 17 }}>🗳 {o.session.title}{o.session.opponent ? ` — vs ${o.session.opponent}` : ""}</strong>
            <p style={{ color: "var(--muted)", margin: "4px 0 12px", fontSize: 14 }}>
              {[o.session.session_date, o.session.ground].filter(Boolean).join(" · ")} — who was the best on the day? One vote each; you can change it while voting is open.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {o.candidates.map((c: any) => {
                const mine = o.my_vote === c.id;
                const votes = o.counts ? (o.counts[c.id] || 0) : null;
                return (
                  <button key={c.id} disabled={busy} onClick={() => vote(o.session.id, c.id)} className="btn"
                    style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-start", textAlign: "left", padding: ".55rem .8rem", ...(mine ? {} : { background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)" }) }}>
                    {votes !== null && <span style={{ position: "absolute", inset: 0, width: `${(votes / max) * 100}%`, background: mine ? "rgba(6,6,10,0.18)" : "rgba(212,175,55,0.16)" }} />}
                    {c.photo_url
                      ? <img src={c.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", objectPosition: "top", position: "relative" }} />
                      : <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#101c48", color: "#f0cb6e", display: "grid", placeItems: "center", fontFamily: "Oswald", position: "relative" }}>#{c.jersey_no}</span>}
                    <span style={{ position: "relative", flex: 1 }}>{c.name} <span style={{ opacity: 0.75 }}>· #{c.jersey_no}</span></span>
                    {votes !== null && <strong style={{ position: "relative" }}>{votes} {votes === 1 ? "vote" : "votes"}</strong>}
                    {mine && <span style={{ position: "relative" }}>✓ yours</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
