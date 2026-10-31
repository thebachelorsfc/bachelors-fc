// Hero slideshow (2026-11-01): the owner manages up to 5 hero photos from
// Admin → Content → Hero (direct uploads to Storage gallery/hero/). The
// slide list lives in a small public JSON in the same bucket — no table,
// no migration. With no slides the built-in team photo is the hero.
export type HeroSlide = { url: string; path: string };
export const HERO_FALLBACK: HeroSlide[] = [{ url: "/assets/team-photo-band.jpg", path: "" }];
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gpjkjrvxacgojwmfukdy.supabase.co";
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const r = await fetch(`${SB}/storage/v1/object/public/gallery/hero/slides.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return HERO_FALLBACK;
    const j = await r.json();
    const slides = Array.isArray(j?.slides) ? j.slides.filter((s: any) => s && typeof s.url === "string" && typeof s.path === "string") : [];
    return slides.length ? slides.slice(0, 5) : HERO_FALLBACK;
  } catch { return HERO_FALLBACK; }
}
