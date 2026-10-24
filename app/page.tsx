import Link from "next/link"; import Image from "next/image";
import { SITE, PILLARS, TOUR, KIT } from "@/lib/site";
import { SEED_PLAYERS, OPEN_NUMBERS } from "@/lib/players";
import { getPlayers, getNextSession } from "@/lib/data";
export const dynamic = "force-dynamic";
import PlayerCard, { OpenShirt } from "@/components/PlayerCard";
import Counter from "@/components/Counter";

export default async function Home(){
  const players:any[] = (await getPlayers()) ?? SEED_PLAYERS; const next:any = await getNextSession();
  return(<main>
    <section className="wrap hero" style={{textAlign:"center"}}>
      <Image src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={150} height={177} style={{objectFit:"contain"}} priority/>
      <p className="eyebrow">{SITE.motto} · {SITE.mottoAlt}</p>
      <h1>Forged in Brotherhood</h1>
      <p style={{maxWidth:640,margin:"0 auto",color:"var(--muted)"}}>An apolitical, non-profit football club in Khulshi, Chittagong — built for bachelor youth who chose purpose over loneliness.</p>
      <p style={{display:"flex",gap:12,justifyContent:"center",marginTop:20}}><Link className="btn" href="/join">Join the Squad</Link><Link className="btn ghost" href="/about">Our Story</Link></p>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",marginTop:36}}>
        <div className="card"><strong style={{fontSize:28}}><Counter to={players.length + OPEN_NUMBERS.length}/></strong><br/><span style={{color:"var(--muted)"}}>Squad shirts</span></div>
        <div className="card"><strong style={{fontSize:28}}><Counter to={players.length}/></strong><br/><span style={{color:"var(--muted)"}}>Active players</span></div>
        <div className="card"><strong style={{fontSize:28}}><Counter to={2026}/></strong><br/><span style={{color:"var(--muted)"}}>Founded</span></div>
        <div className="card"><strong style={{fontSize:28}}>Next Session</strong><br/><span style={{color:"var(--muted)"}}>{next ? `${next.title}${next.session_date?` · ${next.session_date}`:""}${next.session_time?` · ${next.session_time}`:""}${next.ground?` · ${next.ground}`:""}${next.opponent?` · vs ${next.opponent}`:""}` : "No upcoming session scheduled yet — check back soon."}</span></div>
      </div>
    </section>

    <section className="wrap"><p className="eyebrow">Why we exist</p><h2>Character over trophies</h2>
      <p style={{color:"var(--muted)",maxWidth:720}}>Success here is measured by character, discipline and brotherhood — football is the vehicle, not the destination. — {SITE.founder}, Founder &amp; Bot Player of BFC</p>
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
  </main>);
}
