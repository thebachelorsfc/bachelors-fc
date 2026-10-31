"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

export type GalleryLike = { id: string; photo_url: string; caption?: string | null; category: string; taken_on?: string | null };
const CATS: [string, string][] = [["all", "All"], ["match", "Match Day"], ["training", "Training"], ["tour", "On Tour"], ["team", "Team"]];
const CAT_LABEL: Record<string, string> = { match: "Match Day", training: "Training", tour: "On Tour", team: "Team" };

export default function GalleryClient({ items }: { items: GalleryLike[] }) {
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = useMemo(() => (cat === "all" ? items : items.filter((i) => i.category === cat)), [cat, items]);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 20px" }}>
        {CATS.map(([k, l]) => (
          <button key={k} className="btn" style={cat === k ? { padding: ".55rem 1.1rem" } : { padding: ".55rem 1.1rem", background: "transparent", color: "var(--paper)", border: "1px solid var(--line)", boxShadow: "none" }} onClick={() => setCat(k)}>{l}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "44px 22px" }}>
          <h3 style={{ margin: "0 0 6px" }}>Photos are on the way</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>Match, training, tour and team photos will live here — the gallery fills up as the club shares its moments.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {shown.map((it, i) => (
            <figure key={it.id} className="g-item" onClick={() => setOpen(i)}>
              <Image src={it.photo_url} alt={it.caption || "The Bachelors FC photo"} fill sizes="(max-width:640px) 50vw, 360px" style={{ objectFit: "cover" }} />
              <span className="g-chip">{CAT_LABEL[it.category] || ""}</span>
            </figure>
          ))}
        </div>
      )}

      {open !== null && shown[open] && (
        <div className="lightbox" onClick={close}>
          <span className="lb-count">{open + 1} / {shown.length}</span>
          <button className="lb-btn lb-close" aria-label="Close" onClick={close}>✕</button>
          <button className="lb-btn lb-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
          <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
            <Image src={shown[open].photo_url} alt={shown[open].caption || "The Bachelors FC photo"} width={1200} height={900} style={{ width: "auto", height: "auto", maxWidth: "92vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 10 }} />
            <figcaption>{shown[open].caption || CAT_LABEL[shown[open].category] || ""}{shown[open].taken_on ? ` · ${shown[open].taken_on}` : ""}</figcaption>
          </figure>
          <button className="lb-btn lb-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
        </div>
      )}
    </>
  );
}
