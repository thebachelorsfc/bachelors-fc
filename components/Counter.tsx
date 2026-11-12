"use client";
import { useEffect, useRef, useState } from "react";
export default function Counter({to,suffix=""}:{to:number;suffix?:string}){
  // SEO fix (2026-11-12): render the REAL value in the server HTML so
  // search snippets show 16 / 12 / 2026 — the old useState(0) left "0
  // Total Members, 0 Active players" in Google's snippet. On the client
  // we reset to 0 at mount (below the fold on load, so nobody sees the
  // swap) and the count-up animation plays exactly as before.
  const [v,setV]=useState(to); const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{ const el=ref.current; if(!el) return; let raf=0; setV(0);
    const io=new IntersectionObserver(([e])=>{ if(!e.isIntersecting) return; io.disconnect(); const t0=performance.now();
      const tick=(t:number)=>{ const p=Math.min(1,(t-t0)/1200); setV(Math.round(to*(1-Math.pow(1-p,3)))); if(p<1) raf=requestAnimationFrame(tick); };
      raf=requestAnimationFrame(tick); },{threshold:.4});
    io.observe(el); return ()=>{io.disconnect(); cancelAnimationFrame(raf);} },[to]);
  return <span ref={ref}>{v}{suffix}</span>;
}
