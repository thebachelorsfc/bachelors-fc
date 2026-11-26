import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { getNews } from "@/lib/news";
import { fmtNewsDate, newsTagChip } from "@/components/ClubNews";

// Club News page (2026-11-26): every published item in full, newest
// first. Written by the owner in Admin → Content → News.
export const metadata: Metadata = pageMeta(
  "Club News | The Bachelors FC",
  "Club news from The Bachelors FC — announcements, milestones and updates from the bachelor football club in Khulshi, Chittagong.",
  "/news"
);
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const items = await getNews();
  return (
    <main className="wrap">
      <p className="eyebrow">Club News</p>
      <h1>Latest from the club</h1>
      <p className="copy" style={{ maxWidth: 680 }}>
        Announcements, milestones and brotherhood business — straight from the club, as it happens.
        Older news stays here; nothing is quietly deleted.
      </p>
      {items.length === 0 && (
        <div className="card"><p style={{ margin: 0 }}>No news yet — the next announcement lands here the moment the club makes it.</p></div>
      )}
      {items.map(n => (
        <article className="card" key={n.id} style={{ marginBottom: 14 }}>
          <p style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "0 0 10px" }}>
            <span style={newsTagChip}>{n.tag}</span>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>{fmtNewsDate(n.date)}</span>
          </p>
          <h3 style={{ marginTop: 0 }}>{n.title}</h3>
          <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{n.body}</p>
        </article>
      ))}
    </main>
  );
}
