"use client";
import { Children, useEffect, useRef, useState } from "react";
// The site-wide card rule: a section with ONE card shows it centered on its
// own; a section with TWO OR MORE cards becomes a side-by-side carousel
// (peek + arrows + dots), so new cards join the carousel automatically.
export default function CardCarousel({ children, slide = "min(340px,86%)", auto = false }: { children: React.ReactNode; slide?: string; auto?: boolean }) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0); idxRef.current = idx;
  const pauseUntil = useRef(0);
  const go = (i: number) => { const el = trackRef.current; if (!el) return; const c = Math.max(0, Math.min(slides.length - 1, i)); const card = el.children[c] as HTMLElement | undefined; if (card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" }); };
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; Array.from(el.children).forEach((c, i) => { const card = c as HTMLElement; const d = Math.abs(card.offsetLeft - (el.clientWidth - card.clientWidth) / 2 - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); setIdx(best); };
  const hold = () => { pauseUntil.current = Date.now() + 9000; };
  useEffect(() => {
    if (!auto || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (Date.now() < pauseUntil.current || document.hidden) return; go((idxRef.current + 1) % slides.length); }, 4200);
    return () => clearInterval(t);
  }, [auto, slides.length]);
  if (slides.length === 1) return <div className="cc-single">{slides[0]}</div>;
  return (
    <div className="cc-wrap" onPointerDown={hold} onTouchStart={hold}>
      <div className="cc-track" ref={trackRef} onScroll={onScroll}>
        {slides.map((s, i) => (<div className="cc-slide" key={i} style={{ flex: `0 0 ${slide}` }}>{s}</div>))}
      </div>
      {slides.length > 1 && (<>
        <button className="cc-arrow cc-prev" aria-label="Previous card" onClick={() => { hold(); go(idx - 1); }}>‹</button>
        <button className="cc-arrow cc-next" aria-label="Next card" onClick={() => { hold(); go(idx + 1); }}>›</button>
        <div className="cc-dots">{slides.map((_, i) => (<button key={i} className={i === idx ? "on" : ""} aria-label={`Go to card ${i + 1}`} onClick={() => { hold(); go(i); }} />))}</div>
      </>)}
    </div>
  );
}
