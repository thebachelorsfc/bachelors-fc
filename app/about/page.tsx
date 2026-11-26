import type { Metadata } from "next"; import Link from "next/link"; import { PILLARS } from "@/lib/site"; import CardCarousel from "@/components/CardCarousel";
import { pageMeta } from "@/lib/meta";
export const metadata: Metadata = pageMeta("About | The Bachelors FC", "The story of The Bachelors FC — why bachelor youth in Khulshi, Chittagong built a football club on brotherhood and purpose, not trophies.", "/about");
export default function About(){return(<main className="wrap"><section><p className="eyebrow">Our Story</p><h1>Why we exist</h1>
<p className="copy" style={{maxWidth:760}}>Bachelor life is its own quiet battle. No partner, no family of your own yet — just time, energy, and choices that can go either way. We built The Bachelors FC because that energy deserved a better outlet than loneliness, comparison, and the habits that follow. Through real football, we grow discipline. Through brotherhood, we grow leadership. Every session, every match, every story — documented, so it never stays confined to just us.</p>
<CardCarousel slide="min(320px,84%)">{PILLARS.map(p=><div className="card" key={p.no}><div className="eyebrow">{p.no} / {p.title}</div><h3>{p.sub}</h3><p style={{color:"var(--muted)"}}>{p.text}</p></div>)}</CardCarousel>
<p style={{marginTop:16}}><Link className="btn ghost" href="/people">Meet the people behind BFC →</Link></p>
</section></main>)}
