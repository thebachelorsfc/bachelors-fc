"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ffffff2a", background: "#0a1633", color: "#f7f5ef", marginTop: 10 };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const sb = supabaseBrowser();

  async function submit() {
    if (!sb) { setMsg("Player login is being set up — please try again shortly."); return; }
    setBusy(true); setMsg("");
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({ email, password: pw });
      if (error) { setBusy(false); setMsg(error.message); return; }
      if (data.session) {
        await fetch("/api/player/register", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } });
        router.push("/dashboard");
      } else {
        setBusy(false);
        setMsg("Account created! Check your email inbox and tap the confirmation link, then come back here and log in. After that, the club admin approves your account and links it to your squad profile.");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) { setBusy(false); setMsg(error.message); return; }
      if (data.session) await fetch("/api/player/register", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } });
      router.push("/dashboard");
    }
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
        <h1>{mode === "login" ? "Player login" : "Create player account"}</h1>
        <p style={{ color: "var(--muted)" }}>Squad members: log in to RSVP for sessions — IN, OUT or MAYBE — and see who&apos;s playing.</p>
        <p style={{ color: "var(--muted)", border: "1px solid var(--line-gold)", borderRadius: 12, padding: "10px 14px" }}>New to the club? Don&apos;t sign up here — joining starts on the <Link href="/join" style={{ color: "var(--gold2)", fontWeight: 700 }}>Join page</Link>, where your application and this account are created together in one single form.</p>
        <div className="card">
          <div style={{ display: "flex", gap: 8 }}>
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className="btn" style={mode === m ? { flex: 1 } : { flex: 1, background: "transparent", color: "#f7f5ef", border: "1px solid #ffffff33" }}>{m === "login" ? "Log in" : "Sign up"}</button>
            ))}
          </div>
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input style={inp} type="password" placeholder="Password (min. 6 characters)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          {msg && <p style={{ color: "#ffd97a", fontSize: 14, marginTop: 12 }}>{msg}</p>}
          <button className="btn" style={{ width: "100%", marginTop: 14 }} disabled={busy || !email || pw.length < 6} onClick={submit}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
          {mode === "login" && <button onClick={forgot} disabled={busy} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "var(--gold2)", fontWeight: 600, cursor: "pointer", fontSize: 14.5, padding: 8 }}>Forgot password?</button>}
        </div>
      </section>
    </main>
  );
}
