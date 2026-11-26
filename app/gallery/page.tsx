import { getGalleryItems } from "@/lib/data";
import GalleryClient from "./GalleryClient";
export const dynamic = "force-dynamic";
import { pageMeta } from "@/lib/meta";
export const metadata = pageMeta("Gallery | The Bachelors FC", "Photos of The Bachelors FC — match days, tours and brotherhood moments from the football club in Khulshi, Chittagong.", "/gallery");
export default async function GalleryPage() {
  const items: any[] = await getGalleryItems();
  return (
    <main className="wrap">
      <section style={{ paddingBottom: 24 }}>
        <p className="eyebrow">The Club Album</p>
        <h1>Gallery</h1>
        <p className="copy" style={{maxWidth: 680}}>Legacy: documented, not forgotten. Every match day, every training night, every tour — the brotherhood, in frames.</p>
        <GalleryClient items={items} />
      </section>
    </main>
  );
}
