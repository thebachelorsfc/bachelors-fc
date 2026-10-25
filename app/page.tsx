import Link from "next/link"; import Image from "next/image";
import { SITE, PILLARS, TOUR, KIT } from "@/lib/site";
import { SEED_PLAYERS, OPEN_NUMBERS } from "@/lib/players";
import { getPlayers, getNextSession, getHighlights } from "@/lib/data";
import HighlightCard from "@/components/HighlightCard";
export const dynamic = "force-dynamic";
import PlayerCard, { OpenShirt } from "@/components/PlayerCard";
import Counter from "@/components/Counter";
import FacebookFeed from "@/components/FacebookFeed";

export default async function Home(){
  const players:any[] = (await getPlayers()) ?? SEED_PLAYERS; const next:any = await getNextSession(); const highlights:any[] = await getHighlights();
  return(<main>
    <section className="hero" style={{textAlign:"center"}}>
      <div className="wrap" style={{position:"relative",zIndex:1}}>
        <p className="eyebrow rise" style={{justifyContent:"center"}}>Khulshi · Chittagong — Est. 2026</p>
        <div className="rise rise-1"><Image className="hero-crest" src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={168} height={198} style={{objectFit:"contain"}} priority/></div>
        <h1 className="hero-title rise rise-2">Forged in<br/><span className="gold-text">Brotherhood</span></h1>
        <p className="rise rise-3" style={{maxWidth:640,margin:"16px auto 0",color:"var(--muted)"}}>An apolitical, non-profit football club in Khulshi, Chittagong — built for bachelor youth who chose purpose over loneliness.</p>
        <p className="rise rise-4" style={{display:"flex",gap:12,justifyContent:"center",marginTop:26,flexWrap:"wrap"}}><Link className="btn" href="/join">Join the Squad</Link><Link className="btn ghost" href="/squad">Meet the Squad</Link></p>
      </div>
    </section>

    <section className="wrap" style={{paddingTop:54,paddingBottom:0}}>
      <div className="stat-strip">
        <div><strong><Counter to={players.length + OPEN_NUMBERS.length}/></strong><span>Squad shirts</span></div>
        <div><strong><Counter to={players.length}/></strong><span>Active players</span></div>
        <div><strong><Counter to={2026}/></strong><span>Founded</span></div>
        <div><strong>100%</strong><span>Brotherhood</span></div>
      </div>
    </section>

    <section className="wrap"><p className="eyebrow">Why we exist</p><h2>Character over trophies</h2>
      <p style={{color:"var(--muted)",maxWidth:720}}>Bachelor life is its own quiet battle. No partner, no family of your own yet — just time, energy, and choices that can go either way. We built The Bachelors FC because that energy deserved a better outlet than loneliness, comparison, and the habits that follow. Through real football, we grow discipline. Through brotherhood, we grow leadership. Every session, every match, every story — documented, so it never stays confined to just us.</p>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>{PILLARS.map(p=><div className="card" key={p.no}><div className="eyebrow">{p.no} / {p.title}</div><h3>{p.sub}</h3><p style={{color:"var(--muted)"}}>{p.text}</p></div>)}</div>
    </section>

    <section className="wrap" id="kit"><p className="eyebrow">Home Kit</p><h2>Our colors, our identity</h2>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",alignItems:"center"}}><Image src={KIT.image} alt="The Bachelors FC home jersey" width={400} height={700} style={{width:"100%",height:"auto",borderRadius:16}}/><div className="card"><p>White and navy pinstripes, gold crest on the chest — the kit isn&apos;t just fabric. It&apos;s what eleven men chose to belong to.</p><ul style={{color:"var(--muted)"}}><li>Base: {KIT.base}</li><li>Trim: {KIT.trim}</li><li>Crest: {KIT.crest}</li></ul></div></div>
    </section>

    <section className="wrap" id="tour"><p className="eyebrow">Off the pitch</p><h2>The Bachelors on Tour</h2>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>{TOUR.map(t=><div className="card" key={t.stop}><div className="eyebrow">Stop {t.stop}</div><h3>{t.name}</h3><p style={{color:"var(--muted)"}}>{t.note}</p></div>)}</div>
    </section>

    <section className="wrap"><p className="eyebrow">The Lineup</p><h2>Meet the Squad</h2>
      <div className="squad-grid">{players.map((p:any)=><PlayerCard key={p.jersey_no} p={p}/> )}{OPEN_NUMBERS.slice(0,3).map(n=><OpenShirt key={n} n={n}/>)}</div>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/squad">Full squad →</Link></p>
    </section>

    {highlights.length>0 && (<section className="wrap"><p className="eyebrow">Watch</p><h2>Highlights</h2>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))"}}>{highlights.slice(0,3).map((h:any)=><HighlightCard key={h.id} h={h}/>)}</div>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/gallery">Gallery & all highlights →</Link></p>
    </section>)}

    <FacebookFeed/>

    <section className="wrap" style={{paddingTop:0}}>
      <div className="card" style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <span className="eyebrow">Next Session</span>
        <span style={{fontSize:17}}>{next ? <><strong>{next.title}</strong>{next.session_date?` · ${next.session_date}`:""}{next.session_time?` · ${next.session_time}`:""}{next.ground?` · ${next.ground}`:""}{next.opponent?` · vs ${next.opponent}`:""}</> : "No upcoming session scheduled yet — check back soon."}</span>
        <Link className="btn ghost" href="/join" style={{marginLeft:"auto",padding:".55rem 1.1rem"}}>Join Us</Link>
      </div>
    </section>
  </main>);
}
