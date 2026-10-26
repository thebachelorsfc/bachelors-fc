import type { GroundSlide } from "@/components/GroundsCarousel";

// Shared by the /grounds page and the homepage Grounds section, so both
// always show the same played / last-played / next-session figures.
const fmt = (d?: string | null) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

export function buildGroundSlides(grounds: any[], sessions: any[]): GroundSlide[] {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const match = (s: any, g: any) => {
    if (s.ground_id && g.id && s.ground_id === g.id) return true;
    const sg = String(s.ground || "").trim().toLowerCase(); const gn = String(g.name || "").trim().toLowerCase();
    return !!sg && !!gn && (sg.includes(gn) || gn.includes(sg));
  };
  return grounds.map(g => {
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
}
