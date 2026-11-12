"use client";
import { useState } from "react";

/* Match report editor (2026-11-12): write the story of a played session;
   it appears on the public /match/<session-id> page linked from
   /fixtures. Saved as plain text in the gallery bucket (reports.json) via
   /api/admin/report — no scorelines, ever (respect-for-opponents rule);
   a blank line starts a new paragraph. Clearing the text removes the
   written story (the page keeps its facts: MOTM, who played, stats). */

const ta: React.CSSProperties = { width: "100%", minHeight: 150, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)", marginTop: 8, fontSize: 15, lineHeight: 1.6, fontFamily: "inherit" };

export default function MatchReportPanel({ session, notify }: { session: any; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState("");
  const [hasSaved, setHasSaved] = useState<boolean | null>(null);
  const [err, setErr] = useState("");

  async function loadPanel() {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/admin/report");
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Could not load the report"); setLoading(false); return; }
      const rep = (j.reports || {})[session.id];
      setText(rep?.text || "");
      setHasSaved(!!rep);
      setOpen(true);
    } catch { setErr("Could not load the report"); }
    setLoading(false);
  }

  async function save() {
    setSaving(true); setErr("");
    const r = await fetch("/api/admin/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: session.id, text }) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (r.ok) { setHasSaved(!!text.trim()); notify(text.trim() ? "Match report saved — live on the Match Report page within a minute ✓" : "Match report cleared ✓"); }
    else setErr(j.error || "Save failed — if your admin session expired, log out and log in again");
  }

  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <strong>{session.title}</strong>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>{session.session_date || ""}{session.opponent ? ` · vs ${session.opponent}` : ""}</span>
        {hasSaved === true && <span style={{ color: "var(--ok)", fontSize: 12.5, fontWeight: 700 }}>✓ Report live</span>}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <a className="btn ghost" style={{ padding: ".3rem .7rem", fontSize: 12.5, textDecoration: "none" }} href={`/match/${session.id}`} target="_blank" rel="noreferrer">View page ↗</a>
          {!open && <button className="btn ghost" style={{ padding: ".3rem .7rem", fontSize: 12.5 }} onClick={loadPanel} disabled={loading}>{loading ? "Loading…" : "📝 Report"}</button>}
        </span>
      </div>
      {err && !open && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: "6px 0 0" }}>{err}</p>}
      {open && (
        <div>
          <textarea style={ta} value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} placeholder={"Match-er golpo ta likho — ke kemon khello, sera muhurto, brotherhood-er kotha. Blank line dile notun paragraph hobe. Kono scoreline likho na — seta amader niyom."} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            <button className="btn" style={{ padding: ".5rem 1.1rem" }} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save report"}</button>
            <button className="btn ghost" style={{ padding: ".5rem 1rem" }} onClick={() => setOpen(false)}>Close</button>
            <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{text.length} / 4000</span>
          </div>
          {err && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: "6px 0 0" }}>{err}</p>}
        </div>
      )}
    </div>
  );
}
