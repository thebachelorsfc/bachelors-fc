// Match reports (2026-11-12): the written story of a played session, shown
// on /match/<session-id> and linked from /fixtures. The owner writes them
// in Admin → Sessions → Match Reports. Like the ticker and the hero list,
// the reports live in one small public JSON in the gallery bucket
// (reports.json) — no table, no migration. Reports never carry a
// scoreline (standing respect-for-opponents rule).
export type MatchReport = { text: string; updated?: string };
export type ReportsMap = Record<string, MatchReport>;
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gpjkjrvxacgojwmfukdy.supabase.co";
export async function getReports(): Promise<ReportsMap> {
  try {
    const r = await fetch(`${SB}/storage/v1/object/public/gallery/reports.json`, { next: { revalidate: 60 } });
    if (!r.ok) return {};
    const j = await r.json();
    const out: ReportsMap = {};
    const src = (j && typeof j === "object" && j.reports && typeof j.reports === "object") ? j.reports : {};
    Object.entries(src).forEach(([k, v]: [string, any]) => {
      if (v && typeof v.text === "string" && v.text.trim()) out[k] = { text: v.text, updated: typeof v.updated === "string" ? v.updated : undefined };
    });
    return out;
  } catch { return {}; }
}
