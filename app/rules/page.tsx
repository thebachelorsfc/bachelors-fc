import type { Metadata } from "next"; import CardCarousel from "@/components/CardCarousel";
export const metadata: Metadata = { title: "Rules | The Bachelors FC", alternates: { canonical: "/rules" } };
// Official club rules & policy — owner's own text, supplied 2026-10-26. Keep verbatim.
// NOTE: section 3 has one line still to come from the owner — the fee amount + payment method.
const SECTIONS: { no: string; title: string; points: string[] }[] = [
  { no: "1", title: "Membership", points: [
    "The Bachelors FC is open to young unmarried men in and around Khulshi, Chittagong who share our values: brotherhood, discipline, leadership and purpose.",
    "New members join through the Join Us form and are approved by club management.",
    "Membership ends automatically upon marriage, because this is The Bachelors FC, not Marital FC.",
    "We are an apolitical, non-profit club. Politics stays outside the gate.",
  ] },
  { no: "2", title: "Attendance and RSVP", points: [
    "Respond to every training and match RSVP before the deadline. “Maybe” is not an answer.",
    "Be on time. Arriving after the biryani is served counts as being late.",
    "Cannot make it? Tell the team in advance. Disappearing without notice is not a tactic.",
  ] },
  { no: "3", title: "Fees and Funds", points: [
    "We have no sponsors and no stadium, so every contribution goes into kit, ground bookings and club activities.",
    "Expenses are shared openly with the squad. Nothing is hidden, except the Skipper's tactics.",
  ] },
  { no: "4", title: "Discipline and Conduct", points: [
    "Respect teammates, opponents, referees and the ground. No abuse, no arguments.",
    "Wear the official kit on match days. Ironing is optional, team spirit is mandatory.",
    "The Skipper's decisions on the pitch are final. The Managing Dictator's decisions off the pitch are also final, though appeals are warmly accepted in the form of biryani.",
    "Repeated misconduct may lead to a warning, a suspension or removal from the squad.",
  ] },
  { no: "5", title: "Rewards", points: [
    "Our players are paid in brotherhood, character and, after matches, biryani with soft drinks.",
    "Goals may increase the portions. No goals, no biryani.",
  ] },
  { no: "6", title: "Photos, Media and Privacy", points: [
    "Our matches and moments are documented on our website and Facebook page, so every member may appear in team photos and videos.",
    "Individual tagging is done with consent. If you want a photo removed, tell us and we will remove it promptly.",
    "Personal details shared with the club, such as phone numbers, are used only for club communication and are never sold or shared outside the club.",
    "Standing in the correct place for a team photo is not required. Chaos is part of the brand.",
  ] },
];
// Website Privacy Policy — owner-approved text (draft 2026-11-01, published 2026-11-03).
// Owner's call 2026-11-03: the policy lives on this page (Rules & Policy), not a separate page;
// /privacy permanently redirects here. Payment wording is bKash only (sudhu-bKash rule).
const PRIV_SUB: { h: string; p: string }[] = [
  { h: "Join application (/join)", p: "Your full name, location/address, email address, mobile number, WhatsApp number (if different), profile photo, educational background, age, marital status, occupation, blood group, preferred position, and anything you write in “Why do you want to join”. Creating a player account also sets a password for your login." },
  { h: "Store order (/store)", p: "Your name, mobile number, delivery address, payment method, the number you sent payment from, and your bKash Transaction ID (TrxID)." },
  { h: "Fan Wall (homepage)", p: "Only the name and message you choose to write. Messages are checked by the club first and appear publicly only after approval." },
  { h: "Player dashboard", p: "Your session RSVP (IN / OUT / MAYBE), Man of the Match vote, and — only if you choose it — a push-notification subscription so the club can tell you about a new session. You can turn push off at any time." },
];
const PRIV_USES: string[] = [
  "Review join applications and run player accounts, sessions and RSVPs.",
  "Confirm and deliver store orders, and check payment Transaction IDs.",
  "Publish approved Fan Wall messages.",
  "Send session notices by push notification, only to players who opted in.",
];
const PRIV_CHOICES: string[] = [
  "Ask us to correct or delete your application, account or Fan Wall message by emailing thebachelorsfc@gmail.com.",
  "Change your own RSVP and push-notification choice from your player dashboard.",
  "If you leave the club, ask us to remove your personal details from public pages; match history already published as a club record may remain in anonymised or summary form.",
];
export default function Rules() {
  return (<main className="wrap"><section><p className="eyebrow">Rules &amp; Policy</p><h1>Club Rules</h1>
    <p className="copy" style={{maxWidth: 720}}>Every great club runs on rules. Ours are few, fair and slightly funny. Read them once, follow them always, and the Managing Dictator will have very little to dictate.</p>
    <div style={{ marginTop: 24 }}><CardCarousel slide="min(560px,94%)">{SECTIONS.map(s => (<div className="card rule-sec" key={s.no}>
      <div className="rule-head"><span className="rule-no">{s.no}</span><h2>{s.title}</h2></div>
      <ul className="rule-list">{s.points.map(pt => <li key={pt.slice(0, 24)}>{pt}</li>)}</ul>
    </div>))}</CardCarousel></div>
    <div className="rule-final">
      <div className="rule-head"><span className="rule-no">✦</span><h2>The Final Word</h2></div>
      <p className="copy" style={{margin: 0}}>Club management may update these rules when needed. Questions? Contact us, and the Managing Dictator will reply after he finishes his biryani.</p>
    </div>
    <p className="rule-sign">Brotherhood. Discipline. Leadership. Purpose.</p>
    <div style={{ marginTop: 44, borderTop: "1px solid var(--chip-br)", paddingTop: 30 }}>
      <p className="eyebrow">Privacy</p><h2>Privacy Policy</h2>
      <p className="copy" style={{ maxWidth: 720 }}>The Bachelors FC is an apolitical, non-profit football club in Khulshi, Chittagong. This policy explains, in plain words, what information this website collects and what we do with it.</p>
      <p className="copy" style={{ maxWidth: 720 }}>Contact us about anything here: thebachelorsfc@gmail.com</p>
      <h3 style={{ marginTop: 26 }}>1. What we collect</h3>
      {PRIV_SUB.map(s => (<p className="copy" style={{ maxWidth: 720 }} key={s.h}><strong>{s.h}:</strong> {s.p}</p>))}
      <h3 style={{ marginTop: 26 }}>2. What is public, and what is never public</h3>
      <p className="copy" style={{ maxWidth: 720 }}>Public on the site are only: a squad player&apos;s name, photo, position, shirt number, and match statistics.</p>
      <p className="copy" style={{ maxWidth: 720 }}>We never publish a player&apos;s phone number, address, age, educational background, or other application details on a public card. Application details are seen only by the club&apos;s admins, for reviewing the application and running the club.</p>
      <h3 style={{ marginTop: 26 }}>3. What we do with it</h3>
      <ul className="rule-list" style={{ maxWidth: 720 }}>{PRIV_USES.map(u => (<li key={u.slice(0, 24)}>{u}</li>))}</ul>
      <p className="copy" style={{ maxWidth: 720 }}>We do not sell your information, and we do not share it for advertising.</p>
      <h3 style={{ marginTop: 26 }}>4. Photos and media</h3>
      <p className="copy" style={{ maxWidth: 720 }}>Photos you upload for your application or player profile may appear on your public squad card once you are approved. Gallery and match photos are published as club photos, as described in the club Rules (Photos, Media and Privacy).</p>
      <h3 style={{ marginTop: 26 }}>5. Your choices</h3>
      <ul className="rule-list" style={{ maxWidth: 720 }}>{PRIV_CHOICES.map(c => (<li key={c.slice(0, 24)}>{c}</li>))}</ul>
      <h3 style={{ marginTop: 26 }}>6. Changes</h3>
      <p className="copy" style={{ maxWidth: 720 }}>If this policy changes, the updated version will be published here.</p>
      <p style={{ marginTop: 24, opacity: .6, fontSize: 13 }}>Last updated: 3 November 2026</p>
    </div>
  </section></main>);
}
