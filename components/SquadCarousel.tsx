"use client";
import { Children, useEffect, useRef, useState } from "react";
import { useDragScroll } from "@/components/useDragScroll";
export default function SquadCarousel({ children, auto = true }: { children: React.ReactNode; auto?: boolean }) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0); idxRef.current = idx;
  const pauseUntil = useRef(0);
  const go = (i: number) => { const el = trackRef.current; if (!el) return; const c = Math.max(0, Math.min(slides.length - 1, i)); const card = el.children[c] as HTMLElement | undefined; if (card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" }); };
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; Array.from(el.children).forEach((c, i) => { const card = c as HTMLElement; const d = Math.abs(card.offsetLeft - (el.clientWidth - card.clientWidth) / 2 - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); setIdx(best); };
  const hold = () => { pauseUntil.current = Date.now() + 9000; };
  const drag = useDragScroll(trackRef);
  // Gentle auto-slide, same motion as the Grounds carousel: drifts to the next
  // card every few seconds, loops, and pauses while the visitor interacts.
  useEffect(() => {
    const el = wrapRef.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver((e) => { visible.current = e[0].isIntersecting; }, { rootMargin: "60px" });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!visible.current || Date.now() < pauseUntil.current || document.hidden) return; go((idxRef.current + 1) % slides.length); }, 4200);
    return () => clearInterval(t);
  }, [auto, slides.length]);
  return (
    <div className="sqd-wrap" ref={wrapRef} onPointerDown={hold} onTouchStart={hold} onClickCapture={drag.onClickCapture}>
      <div className="sqd-track" ref={trackRef} onScroll={onScroll} {...drag}>
        {slides.map((s, i) => (<div className="sqd-slide" key={i}>{s}</div>))}
      </div>
      {slides.length > 1 && (<>
        <button className="sqd-arrow sqd-prev" aria-label="Previous player" onClick={() => { hold(); go(idx - 1); }}>‹</button>
        <button className="sqd-arrow sqd-next" aria-label="Next player" onClick={() => { hold(); go(idx + 1); }}>›</button>
        <div className="sqd-dots">{slides.map((_, i) => (<button key={i} className={i === idx ? "on" : ""} aria-label={`Go to card ${i + 1}`} onClick={() => { hold(); go(i); }} />))}</div>
      </>)}
    </div>
  );
}
