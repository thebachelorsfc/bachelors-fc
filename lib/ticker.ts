// Top ticker phrases (2026-11-05): the scrolling line at the very top of
// every page. The owner edits the phrases from Admin → Content → Ticker;
// the list lives in a small public JSON in the gallery bucket — no table,
// no migration. With no saved list the built-in phrases below run. The
// fetch is cached for 60s so the root layout stays fast — a saved change
// appears on the site within about a minute.
export const TICKER_DEFAULTS: string[] = [
  "Forged in Brotherhood",
  "Driven by Purpose",
  "United, Not Alone",
  "Khulshi · Chittagong",
  "Est. 2026",
  "No Sponsors · No Stadium · Just Us",
];
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gpjkjrvxacgojwmfukdy.supabase.co";
export async function getTickerItems(): Promise<string[]> {
  try {
    const r = await fetch(`${SB}/storage/v1/object/public/gallery/ticker.json`, { next: { revalidate: 60 } });
    if (!r.ok) return TICKER_DEFAULTS;
    const j = await r.json();
    const items = Array.isArray(j?.items) ? j.items.filter((s: any) => typeof s === "string" && s.trim()).map((s: string) => s.trim()).slice(0, 12) : [];
    return items.length ? items : TICKER_DEFAULTS;
  } catch { return TICKER_DEFAULTS; }
}
