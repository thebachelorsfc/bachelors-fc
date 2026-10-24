"use client";
import { useEffect, useRef, useState } from "react";
export default function Counter({to,suffix=""}:{to:number;suffix?:string}){
  const [v,setV]=useState(0); const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{ const el=ref.current; if(!el) return; let raf=0;
    const io=new IntersectionObserver(([e])=>{ if(!e.isIntersecting) return; io.disconnect(); const t0=performance.now();
      const tick=(t:number)=>{ const p=Math.min(1,(t-t0)/1200); setV(Math.round(to*(1-Math.pow(1-p,3)))); if(p<1) raf=requestAnimationFrame(tick); };
      raf=requestAnimationFrame(tick); },{threshold:.4});
    io.observe(el); return ()=>{io.disconnect(); cancelAnimationFrame(raf);} },[to]);
  return <span ref={ref}>{v}{suffix}</span>;
}
