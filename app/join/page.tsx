import type { Metadata } from "next"; import JoinForm from "./JoinForm"; import CardCarousel from "@/components/CardCarousel";
export const metadata: Metadata = { title: "Join | The Bachelors FC", alternates:{canonical:"/join"} };
const STEPS=[["1 · Apply","One single form: your details, your position — and your account password."],["2 · Trial","Join a session and show us what you've got."],["3 · Play","Get your jersey number and RSVP to sessions."]];
export default function Join(){return(<main className="wrap"><section><p className="eyebrow">How to Join</p><h1>Ready to belong to something real?</h1>
<p style={{color:"var(--muted)",maxWidth:720}}>The Bachelors FC is open to bachelor youth in Chittagong who want brotherhood, discipline, and a reason to show up. One single form does everything — your application and your player account are created together, so there is no second sign-up later. Our team reviews every application before adding you to the club.</p>
<div style={{marginBottom:20}}><CardCarousel slide="min(320px,84%)">{STEPS.map(([t,d])=><div className="card" key={t}><h3>{t}</h3><p style={{color:"var(--muted)"}}>{d}</p></div>)}</CardCarousel></div>
<JoinForm/></section></main>)}
