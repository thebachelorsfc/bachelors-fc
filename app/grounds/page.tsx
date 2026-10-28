import type { Metadata } from "next"; import { getGrounds, getAllSessions } from "@/lib/data"; import GroundsCarousel from "@/components/GroundsCarousel"; import { buildGroundSlides } from "@/lib/groundSlides";
export const metadata: Metadata = { title: "Grounds | The Bachelors FC", alternates: { canonical: "/grounds" } };
export const dynamic = "force-dynamic";

export default async function Grounds() {
  const [grounds, sessions]: any[] = await Promise.all([getGrounds(), getAllSessions()]);
  const slides = buildGroundSlides(grounds, sessions);
  return (<main className="wrap"><section><p className="eyebrow">Our Grounds</p><h1>Where we play</h1>
    <p style={{ color: "var(--muted)", maxWidth: 720 }}>The Bachelors FC has no stadium of its own — these are the turfs and fields around Chittagong where the brotherhood shows up, session after session.</p>
    {slides.length === 0 ? <div className="card"><p style={{ color: "var(--muted)" }}>Grounds will be listed here as the club confirms them.</p></div> :
    <GroundsCarousel grounds={slides} />}
  </section></main>);
}
