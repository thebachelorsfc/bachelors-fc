"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
// Homepage hero slideshow (2026-11-01): photos crossfade one after another
// (~5s each) with a slow Ken Burns zoom on the visible slide; dots below
// mirror the reference layout and jump to a photo on tap. Managed from
// Admin → Content → Hero. Reduced motion: first photo, still.
export default function HeroSlides({ slides }: { slides: { url: string }[] }) {
  const [i, setI] = useState(0);
  // Perf (2026-11-02): only the first photo loads with the page; the rest
  // mount ~900ms later (long before the first 5.2s crossfade), so they stop
  // competing for bandwidth during the critical first paint. Invisible.
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 900); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!document.hidden) setI((v) => (v + 1) % slides.length); }, 5200);
    return () => clearInterval(t);
  }, [slides.length]);
  return (<>
    <div className="hero-bg" aria-hidden="true">
      {slides.map((s, k) => (k === 0 || ready || k === i) ? (<Image key={s.url} className={"hero-bg-img" + (k === i ? " on" : "")} src={s.url} alt="" fill priority={k === 0} sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 30%" }} />) : null)}
    </div>
    <div className="hero-shade" aria-hidden="true"></div>
    {slides.length > 1 && (<div className="hero-dots">{slides.map((s, k) => (<button key={s.url} type="button" aria-label={`Show photo ${k + 1}`} className={"hero-dot" + (k === i ? " on" : "")} onClick={() => setI(k)} />))}</div>)}
  </>);
}
