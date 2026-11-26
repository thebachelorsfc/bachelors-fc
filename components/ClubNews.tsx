import Link from "next/link";
import CardCarousel from "@/components/CardCarousel";
import type { NewsItem } from "@/lib/news";

// Club News homepage section (2026-11-26): latest published items as a
// card carousel (the house rule for multi-card sections), each card an
// excerpt linking to the full /news page. Renders nothing when there is
// no published news. Items come from lib/news (Admin → Content → News).
export const fmtNewsDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const newsTagChip: React.CSSProperties = {
  background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)",
  borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600, letterSpacing: ".04em",
  textTransform: "uppercase", whiteSpace: "nowrap",
};

export default function ClubNews({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;
  const shown = items.slice(0, 6);
  return (
    <section className="wrap" id="news">
      <p className="eyebrow">Club News</p>
      <h2>Latest from the club</h2>
      <p className="copy" style={{ maxWidth: 680 }}>
        Announcements, milestones and brotherhood business — straight from the club, as it happens.
      </p>
      <CardCarousel slide="min(340px,86%)">
        {shown.map(n => (
          <article className="card" key={n.id}>
            <p style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "0 0 10px" }}>
              <span style={newsTagChip}>{n.tag}</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{fmtNewsDate(n.date)}</span>
            </p>
            <h3 style={{ marginTop: 0 }}>{n.title}</h3>
            <p style={{ color: "var(--muted)" }}>
              {n.body.length > 200 ? n.body.slice(0, 200).trimEnd() + "…" : n.body}
            </p>
            <p style={{ marginBottom: 0 }}><Link href="/news">Read on the News page →</Link></p>
          </article>
        ))}
      </CardCarousel>
      <p style={{ marginTop: 16 }}><Link className="btn ghost" href="/news">All club news →</Link></p>
    </section>
  );
}
