"use client";
import { Children, useEffect, useRef, useState } from "react";
import { useDragScroll } from "@/components/useDragScroll";
// The site-wide card rule: a section with ONE card shows it centered on its
// own; a section with TWO OR MORE cards becomes a side-by-side carousel
// (peek + arrows + the signature gold progress bar & counter), so new cards
// join the carousel automatically. Perf: auto-slide runs ONLY while the
// carousel is on screen (IntersectionObserver), never in the background.
// (A fancier progress-bar/fade redesign was tried 2026-10-26 and reverted
// the same day at the owner's request — keep the classic dots look.)
export default function CardCarousel({ children, slide = "min(340px,86%)", auto = false }: { children: React.ReactNode; slide?: string; auto?: boolean }) {
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
  useEffect(() => {
    const el = wrapRef.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver((e) => { visible.current = e[0].isIntersecting; }, { rootMargin: "60px" });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!visible.current || document.hidden || Date.now() < pauseUntil.current) return; go((idxRef.current + 1) % slides.length); }, 4600);
    return () => clearInterval(t);
  }, [auto, slides.length]);
  if (slides.length === 1) return <div className="cc-single">{slides[0]}</div>;
  return (
    <div className="cc-wrap" ref={wrapRef} onPointerDown={hold} onTouchStart={hold} onClickCapture={drag.onClickCapture}>
      <div className="cc-track" ref={trackRef} onScroll={onScroll} style={{ ["--slide" as string]: slide }} {...drag}>
        {slides.map((s, i) => (<div className="cc-slide" key={i}>{s}</div>))}
      </div>
      <div className="cc-controls">
        <div className="cc-dots">{slides.map((_, i) => (<button key={i} className={i === idx ? "on" : ""} aria-label={`Go to card ${i + 1}`} onClick={() => { hold(); go(i); }} />))}</div>
        <div className="cc-arrows">
          <button className="cc-arrow" aria-label="Previous" onClick={() => { hold(); go(idx - 1); }}>‹</button>
          <button className="cc-arrow" aria-label="Next" onClick={() => { hold(); go(idx + 1); }}>›</button>
        </div>
      </div>
    </div>
  );
}
