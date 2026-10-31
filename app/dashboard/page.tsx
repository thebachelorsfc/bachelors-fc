"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import MemberCard from "@/components/MemberCard";
import CapBadge from "@/components/CapBadge";
import MotmVote from "@/components/MotmVote";
import PushOptIn from "@/components/PushOptIn";
import ShareCard from "@/components/ShareCard";
import StreakChip from "@/components/StreakChip";
import GoalDoodle from "@/components/GoalDoodle";

type Sess = any;
const STATUS_BTN: Record<string, string> = { in: "✅ IN", out: "❌ OUT", maybe: "🤔 MAYBE" };
// Perf (2026-10-31): last dashboard payload is cached per user so a repeat
// visit paints instantly, then refreshes in the background.
const CACHE_KEY = "bfc-dash-v1";

export default function DashboardPage() {
  const [state, setState] = useState<"loading" | "anon" | "ready">("loading");
  const [me, setMe] = useState<any>(null);
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [motmOpen, setMotmOpen] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [goalFx, setGoalFx] = useState(false);
  const paintedRef = useRef(false);
  const uidRef = useRef("");

  const applyData = useCallback((j: any) => {
    setMe({ email: j.email, account: j.account, player: j.player });
    setSessions(j.sessions ?? []);
    setMotmOpen(j.motm?.open ?? []);
    setStreak(j.streak ?? null);
  }, []);

  const load = useCallback(async (tok: string) => {
    try {
      const r = await fetch("/api/player/dashboard", { headers: { Authorization: `Bearer ${tok}` } });
      if (!r.ok) { if (!paintedRef.current) setState("anon"); try { localStorage.removeItem(CACHE_KEY); } catch (e) {} return; }
      const j = await r.json();
      applyData(j);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ uid: uidRef.current, j })); } catch (e) {}
      setState("ready");
    } catch (e) { if (!paintedRef.current) setState("anon"); }
  }, [applyData]);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) { setState("anon"); return; }
    sb.auth.getSession().then(({ data }) => {
      const tok = data.session?.access_token;
      if (!tok) { setState("anon"); try { localStorage.removeItem(CACHE_KEY); } catch (e) {} return; }
      setToken(tok); uidRef.current = data.session?.user?.id ?? "";
      try { const c = localStorage.getItem(CACHE_KEY); if (c) { const parsed = JSON.parse(c); if (parsed && parsed.uid === uidRef.current && parsed.j) { applyData(parsed.j); paintedRef.current = true; setState("ready"); } } } catch (e) {}
      load(tok);
    });
  }, [load, applyData]);

  async function rsvp(session_id: string, status: string) {
    setMsg("");
    const r = await fetch("/api/player/rsvp", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id, status }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setMsg("RSVP saved ✓"); if (status === "in") { setGoalFx(true); window.setTimeout(() => setGoalFx(false), 3200); } load(token); } else setMsg(j.error || "Could not save RSVP");
  }
  async function logout() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} await supabaseBrowser()?.auth.signOut(); location.href = "/login"; }

  if (state === "loading") return <main className="wrap"><p style={{ color: "var(--muted)" }}>Loading your dashboard…</p></main>;
  if (state === "anon") return (
    <main className="wrap"><section style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", paddingBottom: 40 }}>
      <h1>Players only</h1><p style={{ color: "var(--muted)" }}>Log in with your player account to RSVP for sessions.</p>
      <Link className="btn" href="/login">Go to player login</Link>
    </section></main>
  );

  const account = me?.account; const player = me?.player;
  return (
    <main className="wrap">
      <section style={{ paddingBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="eyebrow">Player Dashboard</p>
            <h1 style={{ marginBottom: 4 }}>{player ? <span className="name-row">{player.name}{player.is_captain ? <CapBadge /> : null}</span> : "Welcome, Bachelor"}</h1>
            <p style={{ color: "var(--muted)", margin: 0 }}>{me?.email}{player ? ` · #${player.jersey_no} · ${player.position}` : ""}</p>
          </div>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>

        {!account && <div className="card" style={{ marginTop: 18 }}><strong>Setting up your account…</strong><p style={{ color: "var(--muted)", margin: "6px 0 0" }}>Refresh in a moment — your player account is being created.</p></div>}
        {account?.status === "pending" && (
          <div className="card" style={{ marginTop: 18, borderColor: "var(--line-gold)" }}>
            <strong>⏳ Waiting for approval</strong>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>Your account is created. The club admin will approve it and link it to your squad profile — then you can RSVP here. If it takes long, nudge the club on WhatsApp.</p>
          </div>
        )}
        {account?.status === "rejected" && (
          <div className="card" style={{ marginTop: 18 }}>
            <strong>Account not approved</strong>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>This account wasn&apos;t approved by the club admin. If you&apos;re a squad member, contact the club — accounts are for BFC players only.</p>
          </div>
        )}
        {account?.status === "approved" && !player && (
          <div className="card" style={{ marginTop: 18 }}>
            <strong>Almost there</strong>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>You&apos;re approved, but your account isn&apos;t linked to a squad profile yet — the admin finishes that in one tap. RSVP opens right after.</p>
          </div>
        )}
        {account?.status === "approved" && player && (
          <>
            <h2 style={{ marginTop: 30 }}>Your membership card</h2>
            <MemberCard player={player} />
            <ShareCard player={player} />
            <MotmVote token={token} initial={motmOpen} />
            <PushOptIn token={token} />
            <StreakChip token={token} initial={streak} />
            <h2 style={{ marginTop: 34 }}>Upcoming sessions</h2>
            {msg && <p style={{ color: "var(--note)" }}>{msg}</p>}
            {sessions.length === 0 && <div className="card"><p style={{ color: "var(--muted)", margin: 0 }}>No upcoming sessions scheduled yet. The next session will appear here as soon as the club sets it.</p></div>}
            <div className="grid">
              {sessions.map((s: Sess) => (
                <div className="card" key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 18 }}>{s.title}</strong>
                    <span className="eyebrow">{s.counts.in} IN · {s.counts.maybe} MAYBE · {s.counts.out} OUT</span>
                  </div>
                  <p style={{ color: "var(--muted)", margin: "6px 0 12px" }}>
                    {[s.session_date, s.session_time ? String(s.session_time).slice(0, 5) : "", s.ground, s.opponent ? `vs ${s.opponent}` : ""].filter(Boolean).join(" · ") || "Details to be announced"}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.entries(STATUS_BTN).map(([k, label]) => (
                      <button key={k} onClick={() => rsvp(s.id, k)} className="btn" style={s.my_status === k ? {} : { background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)" }}>{label}</button>
                    ))}
                  </div>
                  {s.rsvps.filter((r: any) => r.status === "in").length > 0 && (
                    <p style={{ color: "var(--muted)", fontSize: 14, margin: "12px 0 0" }}>
                      <strong style={{ color: "var(--gold-text)" }}>Playing:</strong> {s.rsvps.filter((r: any) => r.status === "in").map((r: any) => r.name).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      {goalFx && <GoalDoodle />}
    </main>
  );
}
