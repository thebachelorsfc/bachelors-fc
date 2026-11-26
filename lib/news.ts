// Club News (2026-11-26): announcements and milestones, shown as the
// "Club News" section on the homepage and in full on /news. The owner
// writes them in Admin → Content → News; the list lives in one small
// public JSON in the gallery bucket (news.json) — the same no-migration
// pattern as the ticker, hero slides and match reports. Until the owner
// saves his own list, three REAL past milestones below run as starter
// news (nothing invented — dates and facts are the club's own history).
export type NewsItem = {
  id: string;
  date: string; // YYYY-MM-DD
  tag: string;
  title: string;
  body: string;
  published: boolean;
};

export const NEWS_TAGS = ["Announcement", "Match", "Squad", "Kit", "Fan Zone", "Club"];
export const NEWS_MAX_ITEMS = 30;
export const NEWS_TITLE_MAX = 120;
export const NEWS_BODY_MAX = 1200;

export const NEWS_SEED: NewsItem[] = [
  {
    id: "seed-bot-assistant",
    date: "2026-11-24",
    tag: "Club",
    title: "Bot Assistant joins the club website",
    body: "The website now has its own assistant. Ask it about the squad, the next match, the grounds, the ৳500 home jersey or how to join — it answers from real club facts only, in English, Bangla or Banglish. You will find it at the bottom corner of every page.",
    published: true,
  },
  {
    id: "seed-build-your-xi",
    date: "2026-11-16",
    tag: "Fan Zone",
    title: "Build Your XI is live",
    body: "Think you can pick a better team? Choose a formation, tap a spot on the pitch and build your eleven from the real Bachelors FC squad — then download your XI card and show the group chat how it should be done. One rule of the house: every XI starts with the club's one and only goalkeeper.",
    published: true,
  },
  {
    id: "seed-new-kit",
    date: "2026-11-12",
    tag: "Kit",
    title: "New home kit chosen — DRACO Tornado in teal",
    body: "The brotherhood has new colours: a teal and mint DRACO Tornado shirt with the black-and-gold hexagonal lion crest on the chest and THE BACHELORS FC across the front. On the back of the captain's shirt: CHOWDHURY, a huge 99, and the club motto — Forged in Brotherhood, Driven by Purpose.",
    published: true,
  },
];

// Shared by the public getter and the admin API: keep only well-formed
// items, clamp lengths, default the tag and the published flag.
export function sanitizeNews(raw: any): NewsItem[] {
  if (!Array.isArray(raw)) return [];
  const out: NewsItem[] = [];
  raw.forEach((v: any, i: number) => {
    if (!v || typeof v !== "object") return;
    const title = String(v.title ?? "").trim().slice(0, NEWS_TITLE_MAX);
    if (!title) return;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(v.date ?? "")) ? String(v.date) : "2026-01-01";
    out.push({
      id: String(v.id || `news-${i}`).slice(0, 64),
      date,
      tag: NEWS_TAGS.includes(String(v.tag)) ? String(v.tag) : "Club",
      title,
      body: String(v.body ?? "").trim().slice(0, NEWS_BODY_MAX),
      published: v.published !== false,
    });
  });
  return out.slice(0, NEWS_MAX_ITEMS);
}

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gpjkjrvxacgojwmfukdy.supabase.co";

// Public read: published items only, newest first. Falls back to the
// starter milestones when no list has been saved yet.
export async function getNews(): Promise<NewsItem[]> {
  try {
    const r = await fetch(`${SB}/storage/v1/object/public/gallery/news.json`, { next: { revalidate: 60 } });
    if (!r.ok) return NEWS_SEED;
    const j = await r.json();
    if (!j || !Array.isArray(j.items)) return NEWS_SEED;
    return sanitizeNews(j.items)
      .filter(n => n.published)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch { return NEWS_SEED; }
}
