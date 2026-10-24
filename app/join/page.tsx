import type { Metadata } from "next"; import JoinForm from "./JoinForm";
export const metadata: Metadata = { title: "Join | The Bachelors FC", alternates:{canonical:"/join"} };
const STEPS=[["1 · Apply","Tell us about yourself and your position."],["2 · Trial","Join a session and show us what you've got."],["3 · Play","Get your jersey number and RSVP to sessions."]];
export default function Join(){return(<main className="wrap"><section><p className="eyebrow">How to Join</p><h1>Ready to belong to something real?</h1>
<p style={{color:"var(--muted)",maxWidth:720}}>The Bachelors FC is open to bachelor youth in Chittagong who want brotherhood, discipline, and a reason to show up. Fill out the form below — our team reviews every application before adding you to the club.</p>
<div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",marginBottom:20}}>{STEPS.map(([t,d])=><div className="card" key={t}><h3>{t}</h3><p style={{color:"var(--muted)"}}>{d}</p></div>)}</div>
<JoinForm/></section></main>)}
