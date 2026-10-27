// Club anthem source resolution (2026-10-27). Two sources:
//  1) an MP3 the admin uploads from Admin → Anthem — stored at a FIXED path
//     in the public gallery bucket and overwritten on each upload;
//  2) the built-in file bundled with the site (SITE.anthemSrc).
// The uploaded one wins whenever it exists. The etag becomes a cache-buster
// so a re-upload takes effect instead of serving the browser-cached song.
import { SITE } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gpjkjrvxacgojwmfukdy.supabase.co";
export const ANTHEM_STORAGE_URL = `${BASE}/storage/v1/object/public/gallery/anthem/anthem.mp3`;

export async function resolveAnthemSrc(): Promise<string> {
  try {
    const r = await fetch(ANTHEM_STORAGE_URL, { method: "HEAD", next: { revalidate: 120 } });
    if (r.ok) {
      const etag = (r.headers.get("etag") || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
      return etag ? `${ANTHEM_STORAGE_URL}?v=${etag}` : ANTHEM_STORAGE_URL;
    }
  } catch { /* storage unreachable — fall through to the built-in anthem */ }
  return SITE.anthemSrc;
}
