"use client";
import { useEffect, useState } from "react";
import { VAPID_PUBLIC_KEY } from "@/lib/pushConfig";

// "Session notifications" card on the player dashboard: one tap subscribes
// this device to Web Push, so a phone notification lands the moment the club
// sets a new session. Free forever (Web Push + VAPID, no middleman).
function urlB64ToUint8Array(base64String: string) {
  const pad = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type St = "loading" | "unsupported" | "off" | "on" | "blocked";

export default function PushOptIn({ token }: { token: string }) {
  const [state, setState] = useState<St>("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setState("unsupported"); return; }
      if (Notification.permission === "denied") { setState("blocked"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "blocked" : "off"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY) as any });
      const r = await fetch("/api/player/push-subscribe", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ subscription: sub.toJSON() }) });
      if (r.ok) setState("on");
      else { const j = await r.json().catch(() => ({})); setMsg(j.error || "Could not switch on notifications"); }
    } catch { setMsg("Notifications didn't switch on here — try from Chrome or the installed app."); }
  }

  async function disable() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/player/push-subscribe", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState("off");
    } catch { /* leave state as-is */ }
  }

  if (state === "loading" || state === "unsupported") return null;
  return (
    <div className="card" style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 22 }} aria-hidden="true">🔔</span>
      <div style={{ flex: "1 1 220px" }}>
        <strong>Session notifications</strong>
        <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 14 }}>
          {state === "on" ? "On — a notification will land on this phone the moment a new session is set."
            : state === "blocked" ? "Blocked in your browser settings — allow notifications for this site to switch this on."
            : "Get a phone notification the moment a new session is set — no need to keep checking the site."}
        </p>
        {msg && <p style={{ color: "var(--bad)", margin: "6px 0 0", fontSize: 13.5 }}>{msg}</p>}
      </div>
      {state === "on" ? <button className="btn ghost" onClick={disable}>Turn off</button>
        : state !== "blocked" ? <button className="btn" onClick={enable}>🔔 Turn on</button> : null}
    </div>
  );
}
