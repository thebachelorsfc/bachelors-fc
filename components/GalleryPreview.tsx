"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import CardCarousel from "@/components/CardCarousel";

export type GalleryPreviewItem = { id: string; photo_url: string; caption?: string | null; category: string; taken_on?: string | null };
const CAT_LABEL: Record<string, string> = { match: "Match Day", training: "Training", tour: "On Tour", team: "Team" };

// Homepage gallery band: a carousel of the club's latest photos with the
// same lightbox as the full /gallery page. The full page keeps the
// category filters; this is the at-a-glance preview for home visitors.
export default function GalleryPreview({ items }: { items: GalleryPreviewItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)), [items.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <CardCarousel slide="min(340px,86%)">
        {items.map((it, i) => (
          <div key={it.id}>
            <figure className="g-item" style={{ width: "100%" }} onClick={() => setOpen(i)}>
              <Image src={it.photo_url} alt={it.caption || "The Bachelors FC photo"} fill sizes="(max-width:640px) 86vw, 340px" style={{ objectFit: "cover" }} />
              <span className="g-chip">{CAT_LABEL[it.category] || ""}</span>
            </figure>
            {it.caption && <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "10px 2px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.caption}</p>}
          </div>
        ))}
      </CardCarousel>

      {open !== null && items[open] && (
        <div className="lightbox" onClick={close}>
          <span className="lb-count">{open + 1} / {items.length}</span>
          <button className="lb-btn lb-close" aria-label="Close" onClick={close}>✕</button>
          <button className="lb-btn lb-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
          <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
            <Image src={items[open].photo_url} alt={items[open].caption || "The Bachelors FC photo"} width={1200} height={900} style={{ width: "auto", height: "auto", maxWidth: "92vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 10 }} />
            <figcaption>{items[open].caption || CAT_LABEL[items[open].category] || ""}{items[open].taken_on ? ` · ${items[open].taken_on}` : ""}</figcaption>
          </figure>
          <button className="lb-btn lb-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
        </div>
      )}
    </>
  );
}
