import type { Metadata } from "next"; import { SITE, PILLARS } from "@/lib/site";
export const metadata: Metadata = { title: "About | The Bachelors FC", description: SITE.ogDescription, alternates:{canonical:"/about"} };
export default function About(){return(<main className="wrap"><section><p className="eyebrow">Our Story</p><h1>Why we exist</h1>
<p style={{color:"var(--muted)",maxWidth:760}}>Bachelor life is its own quiet battle. No partner, no family of your own yet — just time, energy, and choices that can go either way. We built The Bachelors FC because that energy deserved a better outlet than loneliness, comparison, and the habits that follow. Through real football, we grow discipline. Through brotherhood, we grow leadership. Every session, every match, every story — documented, so it never stays confined to just us.</p>
<p>— {SITE.founder}, Founder &amp; Bot Player of BFC</p>
<div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>{PILLARS.map(p=><div className="card" key={p.no}><div className="eyebrow">{p.no} / {p.title}</div><h3>{p.sub}</h3><p style={{color:"var(--muted)"}}>{p.text}</p></div>)}</div>
<p style={{color:"var(--muted)"}}>Apolitical · Non-profit · {SITE.location} · Est. {SITE.founded} · No sponsors. No stadium. Just us.</p></section></main>)}
