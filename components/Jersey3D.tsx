"use client";
import { useRef, useState } from "react";
import Image from "next/image";

// Interactive 3D-feel jersey showcase: the shirt tilts in 3D toward the visitor's
// finger/mouse with a moving light glare and a soft floating shadow.
export default function Jersey3D({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 35, active: false });
  function onMove(e: React.PointerEvent) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setT({ rx: (0.5 - y) * 16, ry: (x - 0.5) * 20, gx: x * 100, gy: y * 100, active: true });
  }
  function onLeave() { setT({ rx: 0, ry: 0, gx: 50, gy: 35, active: false }); }
  return (
    <div style={{ perspective: 1000, padding: "10px 4px 0" }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{
          position: "relative", width: "100%", aspectRatio: "4/3.4", borderRadius: 18, overflow: "hidden",
          background: "radial-gradient(120% 120% at 50% 0%, #1b326e 0%, #0a1633 58%, #060913 100%)",
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.active ? 1.02 : 1})`,
          transition: t.active ? "transform .08s linear" : "transform .6s cubic-bezier(.2,.7,.2,1)",
          transformStyle: "preserve-3d", boxShadow: "0 34px 60px #00000080, inset 0 0 0 1px #ffffff14",
          animation: t.active ? "none" : "jerseyFloat 6s ease-in-out infinite", touchAction: "pan-y", cursor: "grab",
        }}
      >
        <Image src={src} alt={alt} fill quality={95} sizes="(max-width:800px) 92vw, 760px" style={{ objectFit: "contain", padding: "4.5%", transform: "translateZ(46px)", filter: "drop-shadow(0 26px 22px rgba(0,0,0,.55))" }} priority />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: "translateZ(60px)", background: `radial-gradient(420px circle at ${t.gx}% ${t.gy}%, #ffffff2b, transparent 65%)`, opacity: t.active ? 1 : 0.35, transition: "opacity .3s" }} />
        <button onClick={() => setZoom(true)} style={{ position: "absolute", bottom: 12, right: 14, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "#14100a", background: "linear-gradient(120deg,#e8c766,#c9a227)", border: "none", borderRadius: 999, padding: "7px 13px", fontWeight: 800, cursor: "pointer" }}>🔍 Zoom — full quality</button>
        <span style={{ position: "absolute", bottom: 16, left: 16, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#d8c98a", opacity: 0.85 }}>Tilt · 3D</span>
      </div>
      <style>{`@keyframes jerseyFloat{0%,100%{transform:rotateX(0deg) rotateY(-3deg) translateY(0)}50%{transform:rotateX(1.5deg) rotateY(3deg) translateY(-7px)}}`}</style>
      {zoom && (
        <div onClick={() => setZoom(false)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "#04040af2", overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "26px 10px 40px" }}>
          <button aria-label="Close zoom" onClick={() => setZoom(false)} style={{ position: "fixed", top: 16, right: 16, zIndex: 2, background: "#ffffff1a", border: "1px solid #ffffff33", color: "#fff", borderRadius: 999, width: 44, height: 44, fontSize: 19, cursor: "pointer" }}>✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ width: "min(96vw, 768px)", height: "auto", borderRadius: 12, boxShadow: "0 30px 80px #000" }} />
          <p style={{ position: "fixed", bottom: 10, left: 0, right: 0, textAlign: "center", color: "#9aa3b2", fontSize: 12.5, margin: 0 }}>Pinch or scroll to inspect every stitch — tap ✕ to close</p>
        </div>
      )}
    </div>
  );
}
