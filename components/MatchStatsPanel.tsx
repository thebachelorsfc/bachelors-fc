"use client";
import { useState } from "react";

/* Per-session match-stats entry (Squad Stats Tracker, migration 014).
   Open a session, mark who played, enter goals/assists/cards (+ GK saves) —
   the API adjusts season totals on the player cards + leaderboard by the
   difference from what was saved before, so edits self-correct. */

const inp: React.CSSProperties = { width: 54, padding: ".38rem .3rem", borderRadius: 8, border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)", fontSize: 14, textAlign: "center" };
const selInp: React.CSSProperties = { padding: ".45rem .6rem", borderRadius: 8, border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)", fontSize: 13.5, maxWidth: 260 };

type Row = { played: boolean; goals: number; assists: number; yellow_cards: number; red_cards: number; saves: number; penalties_saved: number; clean_sheet: boolean };
const blankRow = (played: boolean): Row => ({ played, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, saves: 0, penalties_saved: 0, clean_sheet: false });

export default function MatchStatsPanel({ session, notify, onSaved }: { session: any; notify: (m: string) => void; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState<any[]>([]);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [visible, setVisible] = useState<string[]>([]);
  const [err, setErr] = useState("");

  async function loadPanel() {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`/api/admin/match-stats?session_id=${session.id}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Could not load match stats"); setLoading(false); return; }
      const ros: any[] = j.roster || [];
      setRoster(ros);
      const entryMap = new Map<string, any>((j.entries || []).map((e: any) => [e.player_id, e]));
      const init: Record<string, Row> = {};
      const vis: string[] = [];
      for (const p of ros) {
        const e = entryMap.get(p.id);
        if (e) {
          init[p.id] = { played: !!e.played, goals: e.goals || 0, assists: e.assists || 0, yellow_cards: e.yellow_cards || 0, red_cards: e.red_cards || 0, saves: e.saves || 0, penalties_saved: e.penalties_saved || 0, clean_sheet: !!e.clean_sheet };
          vis.push(p.id);
        } else if (p.rsvp === "in") { init[p.id] = blankRow(true); vis.push(p.id); }
        else init[p.id] = blankRow(false);
      }
      setRows(init); setVisible(vis); setOpen(true);
    } catch { setErr("Could not load match stats"); }
    setLoading(false);
  }

  const set = (id: string, k: keyof Row, v: any) => setRows(prev => ({ ...prev, [id]: { ...(prev[id] || blankRow(false)), [k]: v } }));
  const numField = (id: string, k: keyof Row, label: string) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11, color: "var(--muted)", alignItems: "center" }}>{label}
      <input style={inp} type="number" min={0} max={99} inputMode="numeric" value={(rows[id]?.[k] as number) ?? 0} onChange={e => set(id, k, Math.max(0, Math.min(99, parseInt(e.target.value || "0", 10) || 0)))} />
    </label>
  );

  async function save() {
    setSaving(true);
    const entries = visible.map(id => ({ player_id: id, ...(rows[id] || blankRow(false)) }));
    const r = await fetch("/api/admin/match-stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: session.id, entries }) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (r.ok) { notify(`📊 Stats saved for ${session.title} — player cards + leaderboard updated ✓`); onSaved?.(); }
    else notify(j.detail ? `${j.error} (${j.detail})` : (j.error || "Stats save failed"));
  }

  const hidden = roster.filter(p => !visible.includes(p.id));

  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "10px 0" }}>
      <strong>{session.title}</strong> <span style={{ color: "var(--muted)", fontSize: 13 }}>{session.session_date || ""}</span>
      <button className="btn ghost" style={{ marginLeft: 8, padding: ".3rem .7rem", fontSize: 12.5 }} disabled={loading} onClick={() => open ? setOpen(false) : loadPanel()}>{loading ? "Loading…" : open ? "Close" : "📊 Match stats"}</button>
      {err && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: "6px 0 0" }}>{err}</p>}
      {open && (
        <div style={{ marginTop: 6 }}>
          {visible.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0" }}>No players listed yet — add who played below.</p>}
          {visible.map(id => {
            const p = roster.find(x => x.id === id); if (!p) return null;
            const row = rows[id] || blankRow(false);
            const gk = p.position_code === "GK";
            return (
              <div key={id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ flex: "1 1 130px", fontSize: 13.5 }}>#{p.jersey_no} {p.name} <span style={{ color: "var(--muted)" }}>({p.position_code})</span></span>
                  <label style={{ fontSize: 12.5, display: "flex", gap: 5, alignItems: "center" }}>
                    <input type="checkbox" checked={!!row.played} onChange={e => set(id, "played", e.target.checked)} /> Played
                  </label>
                  {gk && (
                    <label style={{ fontSize: 12.5, display: "flex", gap: 5, alignItems: "center" }}>
                      <input type="checkbox" checked={!!row.clean_sheet} onChange={e => set(id, "clean_sheet", e.target.checked)} /> Clean sheet
                    </label>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {numField(id, "goals", "Goals")}
                  {numField(id, "assists", "Assists")}
                  {numField(id, "yellow_cards", "🟨 Yel")}
                  {numField(id, "red_cards", "🟥 Red")}
                  {gk && numField(id, "saves", "Saves")}
                  {gk && numField(id, "penalties_saved", "Pen saved")}
                </div>
              </div>
            );
          })}
          {hidden.length > 0 && (
            <select value="" style={{ ...selInp, marginTop: 8 }} onChange={e => { const id = e.target.value; if (!id) return; setRows(prev => ({ ...prev, [id]: { ...(prev[id] || blankRow(true)), played: true } })); setVisible(v => [...v, id]); }}>
              <option value="">＋ Add a player who played…</option>
              {hidden.map(p => <option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>)}
            </select>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "💾 Save match stats"}</button>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Saving updates the season totals everywhere. To remove a player: untick Played, set everything to 0, save again.</span>
          </div>
        </div>
      )}
    </div>
  );
}
