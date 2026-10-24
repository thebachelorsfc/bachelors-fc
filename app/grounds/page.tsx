import type { Metadata } from "next"; import { getGrounds } from "@/lib/data";
export const metadata: Metadata = { title: "Grounds | The Bachelors FC", alternates:{canonical:"/grounds"} };
export const dynamic = "force-dynamic";
export default async function Grounds(){ const grounds:any[] = await getGrounds(); return(<main className="wrap"><section><p className="eyebrow">Our Grounds</p><h1>Where we play</h1>
{grounds.length===0 ? <div className="card"><p style={{color:"var(--muted)"}}>Grounds will be listed here as the club confirms them. The Bachelors FC has no stadium of its own — sessions are played at turfs around Chittagong.</p></div> :
<div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>{grounds.map(g=><div className="card" key={g.id}><h3>{g.name}</h3><p style={{color:"var(--muted)"}}>{g.area||""}</p>{g.maps_url&&<a className="btn ghost" href={g.maps_url} target="_blank">Get directions</a>}</div>)}</div>}
</section></main>)}
