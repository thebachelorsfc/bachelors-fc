import Link from "next/link"; import Image from "next/image";
import { SITE, PILLARS, TOUR, KIT } from "@/lib/site";
import { SEED_PLAYERS, openNumbers } from "@/lib/players";
import { getPlayers, getHighlights, getPeople, getGrounds, getAllSessions, getGalleryItems } from "@/lib/data";
import { buildGroundSlides } from "@/lib/groundSlides";
import GroundsCarousel from "@/components/GroundsCarousel";
import GalleryPreview from "@/components/GalleryPreview";
import HighlightCard from "@/components/HighlightCard";
export const dynamic = "force-dynamic";
import PlayerCard, { OpenShirt } from "@/components/PlayerCard";
import Counter from "@/components/Counter";
import FacebookFeed from "@/components/FacebookFeed";
import AnthemPlayer from "@/components/AnthemPlayer";
import NextMatchCard from "@/components/NextMatchCard";
import SquadCarousel from "@/components/SquadCarousel";
import CardCarousel from "@/components/CardCarousel";
import PersonCard from "@/components/PersonCard";

export default async function Home(){
  const players:any[] = (await getPlayers()) ?? SEED_PLAYERS; const highlights:any[] = await getHighlights(); const people:any[] = await getPeople();
  const allSessions:any[] = await getAllSessions();
  const groundSlides = buildGroundSlides(await getGrounds(), allSessions); const galleryItems:any[] = await getGalleryItems();
  // Slim Next Match card (owner re-requested 2026-10-27 after the old Next
  // Session section was removed): next upcoming session only, hidden if none.
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  // Card rule (owner, 2026-10-28 — supersedes the 24h-tail rule): the card
  // shows the earliest UPCOMING session with a live kick-off countdown;
  // when the countdown reaches zero the card vanishes; a newly created
  // session makes it reappear. Session times are Dhaka wall time (UTC+6,
  // no DST) — convert to an absolute instant so the countdown is right in
  // any visitor's timezone.
  const sessMs = (x:any) => { const [Y,M,D] = String(x.session_date).split("-").map(Number); const [h,mi] = String(x.session_time || "12:00").slice(0,5).split(":").map(Number); return Date.UTC(Y, (M||1)-1, D||1, (h||0)-6, mi||0); };
  const nextMatch:any = allSessions.filter((x:any)=>x.session_date && sessMs(x) > Date.now()).sort((a:any,b:any)=>sessMs(a)-sessMs(b))[0] || null;
  const nmStartISO = nextMatch ? new Date(sessMs(nextMatch)).toISOString() : "";
  // Directions to the session's ground (owner, 2026-10-28): reuse the
  // matched ground slide's Google Maps directions URL; fall back to a
  // name search; no ground on the session = no directions button.
  const nmSlide:any = nextMatch ? groundSlides.find((g:any)=>{ if (nextMatch.ground_id && g.id === nextMatch.ground_id) return true; const sg = String(nextMatch.ground || "").trim().toLowerCase(); const gn = String(g.name || "").trim().toLowerCase(); return !!sg && !!gn && (sg.includes(gn) || gn.includes(sg)); }) : null;
  const nmDirections = nextMatch ? (nmSlide?.directions || (nextMatch.ground ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextMatch.ground + ", Chittagong")}` : "")) : "";
  const nmDate = nextMatch ? new Date(nextMatch.session_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  const nmTime = nextMatch?.session_time ? (()=>{ const [h,m] = String(nextMatch.session_time).slice(0,5).split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2,"0")} ${ap}`; })() : "";
  const order:Record<string,number>={FWD:0,MID:1,DEF:2,GK:3}; const sortedPlayers=[...players].sort((a:any,b:any)=>((order[a.position_code]??9)-(order[b.position_code]??9))||(a.jersey_no-b.jersey_no));
  return(<main>
    <section className="hero" style={{textAlign:"center"}}>
      <div className="wrap" style={{position:"relative",zIndex:1}}>
        <div className="rise rise-1"><Image className="hero-crest" src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={168} height={198} style={{objectFit:"contain"}} priority/></div>
        <h1 className="hero-title rise rise-2">Forged in<br/><span className="gold-text">Brotherhood</span></h1>
        <p className="rise rise-3" style={{maxWidth:640,margin:"16px auto 0",color:"var(--muted)"}}>An apolitical, non-profit football club in Khulshi, Chittagong — built for bachelor youth who chose purpose over loneliness.</p>
        <p className="rise rise-4" style={{display:"flex",gap:12,justifyContent:"center",marginTop:26,flexWrap:"wrap"}}><Link className="btn" href="/join">Join the Squad</Link><Link className="btn ghost" href="/squad">Meet the Squad</Link></p>
      </div>
    </section>

    {nextMatch && (<section className="wrap nm-section">
      <NextMatchCard tag={nextMatch.session_date === todayStr ? "🔴 Match Today" : "Next Match"} opponent={nextMatch.opponent || ""} meta={`📅 ${nmDate}${nmTime ? ` · 🕒 ${nmTime}` : ""}${nextMatch.ground ? ` · 📍 ${nextMatch.ground}` : ""}`} startsAt={nmStartISO} directions={nmDirections} />
    </section>)}

    <section className="wrap">
      <CardCarousel slide="min(270px,47%)" auto>
        <div className="stat-card"><div className="stat-ico"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.9M17.8 14.9c1.7.6 2.7 1.9 3 4.1"/></svg></div><strong><Counter to={16}/></strong><span className="stat-label">Total Members</span></div>
        <div className="stat-card"><div className="stat-ico"><svg viewBox="0 0 24 24"><path d="M9 3 3 6l2 5 2-1v11h10V10l2 1 2-5-6-3a3 3 0 0 1-6 0Z"/></svg></div><strong><Counter to={players.length}/></strong><span className="stat-label">Active players</span></div>
        <div className="stat-card"><div className="stat-ico"><svg viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/></svg></div><strong><Counter to={2026}/></strong><span className="stat-label">Founded</span></div>
        <div className="stat-card"><div className="stat-ico"><svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.5 2.9c0 3.7-3.5 6.9-8.5 10.9Z"/></svg></div><strong>100%</strong><span className="stat-label">Brotherhood</span></div>
      </CardCarousel>
    </section>

    <section className="wrap"><p className="eyebrow">Why we exist</p><h2>Character over trophies</h2>
      <p style={{color:"var(--muted)",maxWidth:720}}>Bachelor life is its own quiet battle. No partner, no family of your own yet — just time, energy, and choices that can go either way. We built The Bachelors FC because that energy deserved a better outlet than loneliness, comparison, and the habits that follow. Through real football, we grow discipline. Through brotherhood, we grow leadership. Every session, every match, every story — documented, so it never stays confined to just us.</p>
      <CardCarousel slide="min(320px,84%)">{PILLARS.map(p=><div className="card" key={p.no}><div className="eyebrow">{p.no} / {p.title}</div><h3>{p.sub}</h3><p style={{color:"var(--muted)"}}>{p.text}</p></div>)}</CardCarousel>
    </section>

    {SITE.anthemSrc && (
      <section className="wrap">
        <p className="eyebrow">Club Anthem</p>
        <h2>Our Anthem</h2>
        <p style={{ color: "var(--muted)", maxWidth: 640 }}>The song of the brotherhood — press play, sing along, and feel what this club stands for.</p>
        <AnthemPlayer />
      </section>
    )}

    <section className="wrap" id="kit"><p className="eyebrow">Home Kit</p><h2>Our colors, our identity</h2>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",alignItems:"center"}}><Image src={KIT.image} alt="The Bachelors FC home jersey" width={400} height={700} style={{width:"100%",height:"auto",borderRadius:16}}/><div className="card"><p>White and navy pinstripes, gold crest on the chest — the kit isn&apos;t just fabric. It&apos;s what eleven men chose to belong to.</p><ul style={{color:"var(--muted)"}}><li>Base: {KIT.base}</li><li>Trim: {KIT.trim}</li><li>Crest: {KIT.crest}</li></ul></div></div>
    </section>

    <section className="wrap" id="tour"><p className="eyebrow">Off the pitch</p><h2>The Bachelors on Tour</h2>
      <CardCarousel slide="min(320px,84%)">{TOUR.map(t=><div className="card" key={t.stop}><div className="eyebrow">Stop {t.stop}</div><h3>{t.name}</h3><p style={{color:"var(--muted)"}}>{t.note}</p></div>)}</CardCarousel>
    </section>

    <section className="wrap"><p className="eyebrow">Join Us</p><h2>How to Join</h2>
      <p style={{color:"var(--muted)",maxWidth:680}}>Three steps between you and the shirt — no trials by fire, no politics. Just football, brotherhood and purpose.</p>
      <CardCarousel slide="min(320px,84%)">
        <div className="card join-card"><span className="step-no">01</span><div className="step-ico"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5a3 3 0 0 1 6 0"/><path d="M9 12h6M9 16h4"/></svg></div><h3>Apply in 3 minutes</h3><p style={{color:"var(--muted)"}}>Fill the Join form with your details and a photo — and set a password. Your player account is created with the same application; no separate sign-up.</p></div>
        <div className="card join-card"><span className="step-no">02</span><div className="step-ico"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.9M17.8 14.9c1.7.6 2.7 1.9 3 4.1"/></svg></div><h3>Review &amp; trial</h3><p style={{color:"var(--muted)"}}>Every application is reviewed by hand. If it fits the club, you are invited to a trial session — show up, play your game and meet the brotherhood.</p></div>
        <div className="card join-card"><span className="step-no">03</span><div className="step-ico"><svg viewBox="0 0 24 24"><path d="M9 3 3 6l2 5 2-1v11h10V10l2 1 2-5-6-3a3 3 0 0 1-6 0Z"/></svg></div><h3>Get your shirt</h3><p style={{color:"var(--muted)"}}>Once approved, your account unlocks the player dashboard — RSVP for sessions, follow the squad, and your name joins the squad list.</p></div>
      </CardCarousel>
      <p style={{marginTop:16}}><Link className="btn" href="/join">Start your application →</Link></p>
    </section>

    <section className="wrap"><p className="eyebrow">The Lineup</p><h2>Meet the Squad</h2>
      <SquadCarousel>{sortedPlayers.map((p:any)=><PlayerCard key={p.jersey_no} p={p}/>)}{openNumbers(sortedPlayers).slice(0,3).map(n=><OpenShirt key={n} n={n}/>)}</SquadCarousel>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/squad">Full squad →</Link></p>
    </section>

    {groundSlides.length>0 && (<section className="wrap"><p className="eyebrow">Our Grounds</p><h2>Where we play</h2>
      <p style={{color:"var(--muted)",maxWidth:720}}>No stadium of our own — these are the turfs and fields around Chittagong where the brotherhood shows up, session after session.</p>
      <GroundsCarousel grounds={groundSlides}/>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/grounds">All grounds →</Link></p>
    </section>)}

    {galleryItems.length>0 && (<section className="wrap"><p className="eyebrow">The Club Album</p><h2>Gallery</h2>
      <p style={{color:"var(--muted)",maxWidth:680}}>Legacy: documented, not forgotten. The brotherhood, in frames — tap any photo to view it full screen.</p>
      <GalleryPreview items={galleryItems.slice(0,8)}/>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/gallery">Full gallery →</Link></p>
    </section>)}

    {people.length>0 && (<section className="wrap people-band"><p className="eyebrow">The People</p><h2>Founders &amp; Leadership</h2>
      <CardCarousel slide="min(560px,94%)">{people.map((p:any)=><PersonCard key={p.id} p={p}/>)}</CardCarousel>
    </section>)}
    {highlights.length>0 && (<section className="wrap"><p className="eyebrow">Watch</p><h2>Highlights</h2>
      <CardCarousel slide="min(560px,92%)">{highlights.map((h:any)=><HighlightCard key={h.id} h={h}/>)}</CardCarousel>
      <p style={{marginTop:16}}><Link className="btn ghost" href="/gallery">Gallery & all highlights →</Link></p>
    </section>)}

    <FacebookFeed/>
  </main>);
}
