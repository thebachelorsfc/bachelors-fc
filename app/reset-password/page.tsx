"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)", marginTop: 10 };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [pw1, setPw1] = useState(""); const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) { setChecking(false); return; }
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) { setReady(true); setChecking(false); }
    });
    sb.auth.getSession().then(({ data }) => { if (data.session) setReady(true); setChecking(false); });
    const t = setTimeout(() => setChecking(false), 2500);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  async function save() {
    const sb = supabaseBrowser(); if (!sb) return;
    if (pw1.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw1 !== pw2) { setMsg("The two passwords do not match — type the same password twice."); return; }
    setBusy(true); setMsg("");
    const { error } = await sb.auth.updateUser({ password: pw1 });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setDone(true);
  }

  return (
    <main className="wrap">
      <section style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 40 }}>
        <p className="eyebrow">Players Only</p>
        <h1>Set a new password</h1>
        {checking ? (
          <p style={{ color: "var(--muted)" }}>Checking your reset link…</p>
        ) : done ? (
          <div className="card">
            <p style={{ fontSize: 16 }}>✅ Password updated! You are logged in with your new password.</p>
            <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => router.push("/dashboard")}>Go to my dashboard →</button>
          </div>
        ) : ready ? (
          <div className="card">
            <p style={{ color: "var(--muted)", marginTop: 0 }}>Type a new password for your player account. Use at least 6 characters — and this time, note it down somewhere safe.</p>
            <input style={inp} type="password" placeholder="New password (min. 6 characters)" value={pw1} onChange={(e) => setPw1(e.target.value)} autoComplete="new-password" />
            <input style={inp} type="password" placeholder="Type the new password again" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            {msg && <p style={{ color: "var(--note)", fontSize: 14, marginTop: 12 }}>{msg}</p>}
            <button className="btn" style={{ width: "100%", marginTop: 14 }} disabled={busy || !pw1 || !pw2} onClick={save}>{busy ? "Please wait…" : "Save new password"}</button>
          </div>
        ) : (
          <div className="card">
            <p style={{ fontSize: 15.5 }}>⚠️ This reset link is invalid or has expired — reset links work only once and for a short time.</p>
            <p style={{ color: "var(--muted)" }}>Go back to the login page, type your email and tap <strong>Forgot password?</strong> to get a fresh link.</p>
            <Link className="btn" href="/login" style={{ width: "100%", marginTop: 8, textAlign: "center" }}>Back to login →</Link>
          </div>
        )}
      </section>
    </main>
  );
}
