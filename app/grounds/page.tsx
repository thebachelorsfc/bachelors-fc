import type { Metadata } from "next"; import { getGrounds, getAllSessions } from "@/lib/data"; import GroundsCarousel, { type GroundSlide } from "@/components/GroundsCarousel";
export const metadata: Metadata = { title: "Grounds | The Bachelors FC", alternates: { canonical: "/grounds" } };
export const dynamic = "force-dynamic";

const fmt = (d?: string | null) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

export default async function Grounds() {
  const grounds: any[] = await getGrounds();
  const sessions: any[] = await getAllSessions();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const match = (s: any, g: any) => {
    if (s.ground_id && g.id && s.ground_id === g.id) return true;
    const sg = String(s.ground || "").trim().toLowerCase(); const gn = String(g.name || "").trim().toLowerCase();
    return !!sg && !!gn && (sg.includes(gn) || gn.includes(sg));
  };
  const slides: GroundSlide[] = grounds.map(g => {
    const mine = sessions.filter(s => match(s, g) && s.session_date);
    const past = mine.filter(s => s.session_date < today);
    const played = (g.matches_played || 0) + past.length;
    const last = [g.last_played || null, past[0]?.session_date || null].filter(Boolean).sort().pop() || null;
    const next = mine.filter(s => s.session_date >= today).sort((a, b) => String(a.session_date).localeCompare(String(b.session_date)))[0];
    const q = encodeURIComponent(`${g.name}, ${g.address || (g.area ? g.area + ", Chittagong" : "Chittagong")}`);
    return {
      id: g.id, name: g.name, address: g.address || g.area || "Chittagong", photo_url: g.photo_url || null,
      played, lastLabel: last ? (fmt(last) as string) : "—",
      nextLabel: next ? `${next.title} · ${fmt(next.session_date)}${next.session_time ? ` · ${String(next.session_time).slice(0, 5)}` : ""}` : null,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    };
  });
  return (<main className="wrap"><section><p className="eyebrow">Our Grounds</p><h1>Where we play</h1>
    <p style={{ color: "var(--muted)", maxWidth: 720 }}>The Bachelors FC has no stadium of its own — these are the turfs and fields around Chittagong where the brotherhood shows up, session after session.</p>
    {slides.length === 0 ? <div className="card"><p style={{ color: "var(--muted)" }}>Grounds will be listed here as the club confirms them.</p></div> :
    <GroundsCarousel grounds={slides} />}
  </section></main>);
}
