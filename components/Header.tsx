"use client";
import Link from "next/link"; import Image from "next/image";
import { useEffect, useState } from "react";
const NAV: [string, string][] = [["Home","/"],["Mission","/about"],["Kit","/#kit"],["Tour","/#tour"],["Gallery","/gallery"],["Squad","/squad"],["Store","/store"],["History","/history"],["Grounds","/grounds"],["Rules","/rules"],["Contact","/contact"],["Login","/login"]];
const Moon = () => (<svg viewBox="0 0 24 24"><path d="M20 13.6A8.6 8.6 0 1 1 10.4 4 7 7 0 0 0 20 13.6Z"/></svg>);
const Sun = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>);
const Burger = () => (<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
const Close = () => (<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  useEffect(() => { setLight(document.documentElement.dataset.theme === "light"); }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open ]);
  useEffect(() => { const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn); }, []);
  const toggleTheme = () => {
    const next = !light; setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    try { localStorage.setItem("bfc-theme", next ? "light" : "dark"); } catch (e) {}
  };
  return (<>
    <header className="site-head"><div className="head-row">
      <Link href="/" className="brand"><Image src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={34} height={40} style={{objectFit:"contain"}}/><strong>THE BACHELORS <span style={{color:"var(--gold)"}}>FC</span></strong></Link>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Switch dark / light theme">{light ? <Sun/> : <Moon/>}</button>
        <Link href="/join" className="btn head-join">Join Us</Link>
        <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Burger/></button>
      </div>
    </div></header>
    <div className={`backdrop${open ? " open" : ""}`} onClick={() => setOpen(false)} />
    <aside className={`drawer${open ? " open" : ""}`} aria-hidden={!open}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{display:"flex",gap:9,alignItems:"center"}}><Image src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={28} height={33} style={{objectFit:"contain"}}/><strong style={{fontFamily:"var(--font-display)",letterSpacing:".12em",fontSize:15}}>THE BACHELORS <span style={{color:"var(--gold)"}}>FC</span></strong></span>
        <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><Close/></button>
      </div>
      <nav style={{marginTop:16,overflowY:"auto"}}>{NAV.map(([l,h]) => <Link key={h+l} className="dlink" href={h} onClick={() => setOpen(false)}>{l}<span style={{color:"var(--gold)",fontSize:19}}>→</span></Link>)}</nav>
      <div style={{marginTop:"auto",paddingTop:18}}>
        <Link href="/join" className="btn" style={{display:"block",textAlign:"center"}} onClick={() => setOpen(false)}>Join the Squad</Link>
        <p style={{color:"#9aa3b2",fontSize:12.5,marginTop:14,textAlign:"center"}}>Forged in Brotherhood · Khulshi, Chittagong</p>
      </div>
    </aside>
  </>);
}
