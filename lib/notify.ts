import { supabaseWrite } from "./supabase/admin";
import { VAPID_PUBLIC_KEY, VAPID_SUBJECT } from "./pushConfig";

// Session notifications — Web Push only (100% free, no middleman):
// a phone notification lands on every subscribed device the moment the club
// sets a new session. Needs the VAPID_PRIVATE_KEY env var; silently no-ops
// until it exists, and never breaks session creation (callers try/catch).
// (An email channel via the club Gmail was built the same day and removed
// again at the owner's request — push only, by his choice.)

function fmtDate(d?: string): string {
  if (!d) return "";
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return d; }
}

function lines(s: any): string[] {
  const out = [fmtDate(s.session_date), s.session_time ? `Kick-off ${s.session_time}` : "", s.ground ? `Ground: ${s.ground}` : "", s.opponent ? `vs ${s.opponent}` : ""];
  return out.filter(Boolean);
}

export async function notifyNewSession(s: any) {
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!priv) return;
  const sb = supabaseWrite(); if (!sb) return;
  const { data: subs } = await sb.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) return;
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, priv);
  const payload = JSON.stringify({
    title: `⚽ New session: ${s.title}`,
    body: lines(s).join(" · ") || "A new club session has been set — tap to RSVP.",
    url: "/dashboard",
  });
  await Promise.allSettled(subs.map(async (sub: any) => {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await sb.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }));
}
