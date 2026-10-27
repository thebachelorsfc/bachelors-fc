"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Login ONLY (owner, 2026-10-27): the Sign Up tab was removed — new accounts
// are created exclusively through the Join form (application + account in one
// submit via /api/player/register), so a second sign-up door only confused
// players. Password recovery lives here ("Forgot password?").
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const sb = supabaseBrowser();

  async function submit() {
    if (!sb) { setMsg("Player login is being set up — please try again shortly."); return; }
    setBusy(true); setMsg("");
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) { setBusy(false); setMsg(error.message); return; }
    if (data.session) await fetch("/api/player/register", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } });
    router.push("/dashboard");
  }

  async function forgot() {
    if (!sb) { setMsg("Player login is being set up — please try again shortly."); return; }
    if (!email) { setMsg("Type your email address above first, then tap Forgot password — the reset link will be sent to that email."); return; }
    setBusy(true); setMsg("");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    setMsg(error ? error.message : "Reset email sent ✓ — open your email inbox (check the spam folder too) and tap the link within an hour to set a new password.");
  }

  return (
    <main className="wrap">
      <section style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 40 }}>
        <p className="eyebrow">Players Only</p>
        <h1>Player login</h1>
        <p style={{ color: "var(--muted)" }}>Squad members: log in to RSVP for sessions — IN, OUT or MAYBE — and see who&apos;s playing.</p>
        <div className="card login-card">
          <div className="login-head">
            <img className="login-crest" src="/assets/logo-transparent.png" alt="The Bachelors FC crest" />
            <div className="login-brand">THE BACHELORS <span>FC</span></div>
          </div>
          <input className="login-inp" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className="login-inp" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          {msg && <p style={{ color: "#ffd97a", fontSize: 14, marginTop: 12 }}>{msg}</p>}
          <button className="btn login-btn" disabled={busy || !email || pw.length < 6} onClick={submit}>{busy ? "Please wait…" : "Log in"}</button>
          <button className="login-forgot" onClick={forgot} disabled={busy}>Forgot password?</button>
          <div className="login-foot">New to the club? Joining starts on the <Link href="/join">Join page</Link> — one single form creates your application and this account together.</div>
        </div>
      </section>
    </main>
  );
}
