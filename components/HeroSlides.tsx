"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
// Homepage hero slideshow (2026-11-01): photos crossfade one after another
// (~5s each) with a slow Ken Burns zoom on the visible slide; dots below
// mirror the reference layout and jump to a photo on tap. Managed from
// Admin → Content → Hero (up to 15 since 2026-11-09). Reduced motion:
// first photo, still.
export default function HeroSlides({ slides }: { slides: { url: string }[] }) {
  const [i, setI] = useState(0);
  // Progressive loading (2026-11-09, for up to 15 slides): only the first
  // two photos mount with the page; one more mounts every ~2.6s after
  // that, so a long slideshow never floods a slow connection at first
  // paint. A slide the visitor taps to is mounted instantly regardless.
  const [upto, setUpto] = useState(1);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      setUpto((v) => {
        if (v >= slides.length - 1) { clearInterval(t); return v; }
        return v + 1;
      });
    }, 2600);
    return () => clearInterval(t);
  }, [slides.length]);
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!document.hidden) setI((v) => (v + 1) % slides.length); }, 5200);
    return () => clearInterval(t);
  }, [slides.length]);
  return (<>
    <div className="hero-bg" aria-hidden="true">
      {slides.map((s, k) => (k <= upto || k === i) ? (<Image key={s.url} className={"hero-bg-img" + (k === i ? " on" : "")} src={s.url} alt="" fill priority={k === 0} sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 30%" }} />) : null)}
    </div>
    <div className="hero-shade" aria-hidden="true"></div>
    {slides.length > 1 && (<div className={"hero-dots" + (slides.length > 8 ? " many" : "")}>{slides.map((s, k) => (<button key={s.url} type="button" aria-label={`Show photo ${k + 1}`} className={"hero-dot" + (k === i ? " on" : "")} onClick={() => setI(k)} />))}</div>)}
  </>);
}
