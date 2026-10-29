import { supabaseWrite } from "./supabase/admin";
import { VAPID_PUBLIC_KEY, VAPID_SUBJECT } from "./pushConfig";

// Session notifications — 100% free channels only:
//  • Web Push to subscribed devices (needs VAPID_PRIVATE_KEY env)
//  • Email via the club's own Gmail (needs GMAIL_USER + GMAIL_APP_PASSWORD env)
// Both silently no-op until their env vars exist, and neither may ever break
// session creation — callers wrap this in try/catch and we settle all promises.

const SITE = "https://bachelors-fc.vercel.app";

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
  await Promise.allSettled([sendPush(s), sendEmail(s)]);
}

async function sendPush(s: any) {
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

async function sendEmail(s: any) {
  const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return;
  const sb = supabaseWrite(); if (!sb) return;
  const { data: accs } = await sb.from("player_accounts").select("email").eq("status", "approved").not("player_id", "is", null);
  const emails = Array.from(new Set((accs ?? []).map((a: any) => a.email).filter(Boolean)));
  if (emails.length === 0) return;
  const nodemailer = (await import("nodemailer")).default;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  const detail = lines(s).map(l => `<p style="margin:4px 0;font-size:16px">${l}</p>`).join("");
  const html = `<div style="background:#06060a;padding:28px 16px;font-family:Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#0a1230;border:1px solid #d4af37;border-radius:16px;padding:28px;color:#f7f5ef">
      <p style="margin:0 0 6px;color:#f0cb6e;font-size:12px;letter-spacing:3px">THE BACHELORS FC</p>
      <h1 style="margin:0 0 14px;font-size:24px">⚽ New session: ${s.title}</h1>
      ${detail}
      <p style="margin:18px 0"><a href="${SITE}/dashboard" style="background:#d4af37;color:#06060a;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">RSVP now →</a></p>
      <p style="margin:0;color:#a8afc4;font-size:13px">Forged in Brotherhood, Driven by Purpose · Khulshi, Chittagong</p>
    </div></div>`;
  const text = `The Bachelors FC — New session: ${s.title}\n${lines(s).join("\n")}\nRSVP: ${SITE}/dashboard`;
  await t.sendMail({
    from: `"The Bachelors FC" <${user}>`,
    bcc: emails,
    subject: `⚽ New session: ${s.title}${s.session_date ? ` — ${fmtDate(s.session_date)}` : ""}`,
    html,
    text,
  });
}
