import type { Metadata } from "next"; import { getPeople } from "@/lib/data"; import CardCarousel from "@/components/CardCarousel"; import PersonCard from "@/components/PersonCard";
export const metadata: Metadata = { title: "People | The Bachelors FC", alternates: { canonical: "/people" } };
export const dynamic = "force-dynamic";
export default async function People() {
  const people: any[] = await getPeople();
  return (<main className="wrap"><section><p className="eyebrow">The People</p><h1>Founders &amp; Leadership</h1>
    <p style={{ color: "var(--muted)", maxWidth: 720 }}>Forged in brotherhood, held together by people. Meet the founders, mentors and well-wishers behind The Bachelors FC — in their own words.</p>
    {people.length === 0 ? <div className="card"><h3 style={{ margin: "0 0 6px" }}>Profiles are on the way</h3><p style={{ color: "var(--muted)", margin: 0 }}>The people behind the club — founder, manager, coach, players and well-wishers — will appear here with their own messages very soon.</p></div> :
    <CardCarousel slide="min(560px,94%)">{people.map((p: any) => <PersonCard key={p.id} p={p} />)}</CardCarousel>}
  </section></main>);
}
