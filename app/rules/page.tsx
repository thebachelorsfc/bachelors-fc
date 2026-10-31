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
  </section></main>);
}
