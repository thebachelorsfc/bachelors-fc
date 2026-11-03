import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy | The Bachelors FC", alternates: { canonical: "/privacy" } };
// Privacy Policy — owner-approved text: draft of 2026-11-01, approved & published 2026-11-03.
// One edit vs the draft: payment wording is bKash only (owner's sudhu-bKash rule; no Nagad).
const SUB: { h: string; p: string }[] = [
  { h: "Join application (/join)", p: "Your full name, location/address, email address, mobile number, WhatsApp number (if different), profile photo, educational background, age, marital status, occupation, blood group, preferred position, and anything you write in “Why do you want to join”. Creating a player account also sets a password for your login." },
  { h: "Store order (/store)", p: "Your name, mobile number, delivery address, payment method, the number you sent payment from, and your bKash Transaction ID (TrxID)." },
  { h: "Fan Wall (homepage)", p: "Only the name and message you choose to write. Messages are checked by the club first and appear publicly only after approval." },
  { h: "Player dashboard", p: "Your session RSVP (IN / OUT / MAYBE), Man of the Match vote, and — only if you choose it — a push-notification subscription so the club can tell you about a new session. You can turn push off at any time." },
];
const USES: string[] = [
  "Review join applications and run player accounts, sessions and RSVPs.",
  "Confirm and deliver store orders, and check payment Transaction IDs.",
  "Publish approved Fan Wall messages.",
  "Send session notices by push notification, only to players who opted in.",
];
const CHOICES: string[] = [
  "Ask us to correct or delete your application, account or Fan Wall message by emailing thebachelorsfc@gmail.com.",
  "Change your own RSVP and push-notification choice from your player dashboard.",
  "If you leave the club, ask us to remove your personal details from public pages; match history already published as a club record may remain in anonymised or summary form.",
];
export default function Privacy() {
  return (<main className="wrap"><section>
    <p className="eyebrow">Privacy</p><h1>Privacy Policy</h1>
    <p className="copy" style={{ maxWidth: 720 }}>The Bachelors FC is an apolitical, non-profit football club in Khulshi, Chittagong. This page explains, in plain words, what information this website collects and what we do with it.</p>
    <p className="copy" style={{ maxWidth: 720 }}>Contact us about anything here: thebachelorsfc@gmail.com</p>

    <h2 style={{ marginTop: 34 }}>1. What we collect</h2>
    {SUB.map(s => (<p className="copy" style={{ maxWidth: 720 }} key={s.h}><strong>{s.h}:</strong> {s.p}</p>))}

    <h2 style={{ marginTop: 34 }}>2. What is public, and what is never public</h2>
    <p className="copy" style={{ maxWidth: 720 }}>Public on the site are only: a squad player&apos;s name, photo, position, shirt number, and match statistics.</p>
    <p className="copy" style={{ maxWidth: 720 }}>We never publish a player&apos;s phone number, address, age, educational background, or other application details on a public card. Application details are seen only by the club&apos;s admins, for reviewing the application and running the club.</p>

    <h2 style={{ marginTop: 34 }}>3. What we do with it</h2>
    <ul className="rule-list" style={{ maxWidth: 720 }}>{USES.map(u => (<li key={u.slice(0, 24)}>{u}</li>))}</ul>
    <p className="copy" style={{ maxWidth: 720 }}>We do not sell your information, and we do not share it for advertising.</p>

    <h2 style={{ marginTop: 34 }}>4. Photos and media</h2>
    <p className="copy" style={{ maxWidth: 720 }}>Photos you upload for your application or player profile may appear on your public squad card once you are approved. Gallery and match photos are published as club photos, as described in the club Rules (Photos, Media and Privacy).</p>

    <h2 style={{ marginTop: 34 }}>5. Your choices</h2>
    <ul className="rule-list" style={{ maxWidth: 720 }}>{CHOICES.map(c => (<li key={c.slice(0, 24)}>{c}</li>))}</ul>

    <h2 style={{ marginTop: 34 }}>6. Changes</h2>
    <p className="copy" style={{ maxWidth: 720 }}>If this policy changes, the updated version will be published here.</p>

    <p style={{ marginTop: 30, opacity: .75 }}>— The Bachelors FC, Khulshi, Chittagong · Est. 2026</p>
    <p style={{ opacity: .6, fontSize: 13 }}>Last updated: 3 November 2026</p>
  </section></main>);
}
