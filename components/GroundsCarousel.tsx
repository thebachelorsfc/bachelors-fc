"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDragScroll } from "@/components/useDragScroll";
export type GroundSlide = { id: string; name: string; address: string; photo_url?: string | null; played: number; lastLabel: string; nextLabel?: string | null; directions: string };
export default function GroundsCarousel({ grounds }: { grounds: GroundSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0); idxRef.current = idx;
  const pauseUntil = useRef(0);
  const go = (i: number) => { const el = trackRef.current; if (!el) return; const c = Math.max(0, Math.min(grounds.length - 1, i)); const card = el.children[c] as HTMLElement | undefined; if (card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" }); };
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; Array.from(el.children).forEach((c, i) => { const card = c as HTMLElement; const d = Math.abs(card.offsetLeft - (el.clientWidth - card.clientWidth) / 2 - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); setIdx(best); };
  const hold = () => { pauseUntil.current = Date.now() + 9000; };
  const drag = useDragScroll(trackRef);
  // Gentle auto-slide: drifts to the next ground every few seconds, loops back
  // to the first, and pauses whenever the visitor is touching/reading.
  useEffect(() => {
    const el = wrapRef.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver((e) => { visible.current = e[0].isIntersecting; }, { rootMargin: "60px" });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  useEffect(() => {
    if (grounds.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!visible.current || Date.now() < pauseUntil.current || document.hidden) return; go((idxRef.current + 1) % grounds.length); }, 4200);
    return () => clearInterval(t);
  }, [grounds.length]);
  return (
    <div className="grd-wrap" ref={wrapRef} onPointerDown={hold} onTouchStart={hold} onClickCapture={drag.onClickCapture}>
      <div className="grd-track" ref={trackRef} onScroll={onScroll} {...drag}>
        {grounds.map((g, gi) => (
          <article className="gcard" key={g.id}>
            {g.photo_url && <div className="gcard-photo"><Image src={g.photo_url} alt={g.name} width={680} height={336} sizes="(max-width:560px) 86vw, 340px" loading={gi === 0 ? "eager" : "lazy"} /></div>}
            <div className="gcard-body">
              <h3 style={{ margin: "0 0 4px" }}>{g.name}</h3>
              <p style={{ color: "var(--muted)", margin: 0 }}>📍 {g.address}</p>
              <div className="gstats">
                <div className="gstat"><b>{g.played}</b><span>Matches played</span></div>
                <div className="gstat"><b>{g.lastLabel}</b><span>Last played</span></div>
              </div>
              <div className="gnext">{g.nextLabel ? <>Next here: <strong style={{ color: "var(--gold-text)" }}>{g.nextLabel}</strong></> : "No session scheduled here right now."}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="btn" href={g.directions} target="_blank" rel="noreferrer">Get directions</a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {grounds.length > 1 && (<>
        <button className="grd-arrow grd-prev" aria-label="Previous ground" onClick={() => { hold(); go(idx - 1); }}>‹</button>
        <button className="grd-arrow grd-next" aria-label="Next ground" onClick={() => { hold(); go(idx + 1); }}>›</button>
        <div className="grd-dots">{grounds.map((g, i) => (<button key={g.id} className={i === idx ? "on" : ""} aria-label={`Go to ground ${i + 1}`} onClick={() => { hold(); go(i); }} />))}</div>
      </>)}
    </div>
  );
}
