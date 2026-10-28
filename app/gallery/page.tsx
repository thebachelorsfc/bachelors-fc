import { getGalleryItems, getHighlights } from "@/lib/data";
import GalleryClient from "./GalleryClient";
export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery & Highlights | The Bachelors FC" };
export default async function GalleryPage() {
  const [items, highlights]: any[] = await Promise.all([getGalleryItems(), getHighlights()]);
  return (
    <main className="wrap">
      <section style={{ paddingBottom: 24 }}>
        <p className="eyebrow">The Club Album</p>
        <h1>Gallery</h1>
        <p style={{ color: "var(--muted)", maxWidth: 680 }}>Legacy: documented, not forgotten. Every match day, every training night, every tour — the brotherhood, in frames.</p>
        <GalleryClient items={items} highlights={highlights} />
      </section>
    </main>
  );
}
