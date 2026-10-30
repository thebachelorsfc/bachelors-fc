"use client";
import { useEffect, useState } from "react";
import CardCarousel from "@/components/CardCarousel";

// Fan Wall: visitors leave a name + short message. Nothing appears in
// public until the admin approves it (Admin → Content → Fan Wall) — the
// submit form says so, so nobody wonders where their message went.
type Msg = { id: string; name: string; message: string; created_at: string };

const field: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)",
  font: "inherit", fontSize: 15,
};

export default function FanWall() {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/fan-wall")
      .then(r => (r.ok ? r.json() : []))
      .then(j => setMsgs(Array.isArray(j) ? j : []))
      .catch(() => setMsgs([]));
  }, []);

  const submit = async () => {
    if (state === "sending") return;
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/fan-wall", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message: text, website: hp }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setState("sent"); setName(""); setText(""); }
      else { setState("error"); setErr(j.error || "Could not post — please try again"); }
    } catch { setState("error"); setErr("Could not post — please try again"); }
  };

  const fmtD = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="wrap" id="fanwall">
      <p className="eyebrow">Fan Wall</p>
      <h2>Words on the Wall</h2>
      <p style={{ color: "var(--muted)", maxWidth: 680 }}>
        This club runs on brotherhood — and on the people who cheer for it. Leave a message for the boys;
        every note is read by the club first, then pinned here.
      </p>

      {msgs === null && <p style={{ color: "var(--muted)" }}>Loading the wall…</p>}
      {msgs !== null && msgs.length > 0 && (
        <CardCarousel slide="min(320px,84%)">
          {msgs.map(m => (
            <div className="card" key={m.id}>
              <p style={{ fontSize: 16.5, lineHeight: 1.55, whiteSpace: "pre-wrap", margin: "2px 0 14px" }}>“{m.message}”</p>
              <p style={{ margin: 0 }}><strong style={{ color: "var(--gold-text)" }}>{m.name}</strong>{" "}
                <span style={{ color: "var(--muted)", fontSize: 13 }}>· {fmtD(m.created_at)}</span></p>
            </div>
          ))}
        </CardCarousel>
      )}
      {msgs !== null && msgs.length === 0 && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h3>The wall is empty — for now</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>No messages yet. Be the first name on the wall of the brotherhood.</p>
        </div>
      )}

      <div className="card" style={{ maxWidth: 640, marginTop: 22 }}>
        <h3 style={{ marginTop: 0 }}>Write on the wall</h3>
        {state === "sent" ? (
          <p style={{ color: "var(--ok)", marginBottom: 0 }}>✅ Message sent! It will appear here once the club approves it. Thank you for standing with the brotherhood.</p>
        ) : (
          <>
            <div style={{ display: "grid", gap: 10 }}>
              <input style={field} placeholder="Your name" maxLength={40} value={name} onChange={e => setName(e.target.value)} />
              <textarea style={{ ...field, minHeight: 92, resize: "vertical" }} placeholder="Your message for the club…" maxLength={280} value={text} onChange={e => setText(e.target.value)} />
              <input style={{ display: "none" }} tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} aria-hidden="true" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={submit} disabled={state === "sending"}>
                {state === "sending" ? "Posting…" : "Post message"}
              </button>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{text.length}/280 · Messages appear after a quick club check</span>
            </div>
            {state === "error" && <p style={{ color: "var(--bad)", marginBottom: 0 }}>{err}</p>}
          </>
        )}
      </div>
    </section>
  );
}
