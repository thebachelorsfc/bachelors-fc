"use client";
import Link from "next/link"; import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isIOS, isStandalone, promptInstall } from "@/lib/install";

const Moon = () => (<svg viewBox="0 0 24 24"><path d="M20 13.6A8.6 8.6 0 1 1 10.4 4 7 7 0 0 0 20 13.6Z"/></svg>);
const Sun = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>);
const Burger = () => (<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
const Close = () => (<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>);

const I = {
  home: <svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7"/><path d="M6.5 9.8V20h11V9.8"/></svg>,
  target: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>,
  shirt: <svg viewBox="0 0 24 24"><path d="M9 3 3 6l2 5 2-1v11h10V10l2 1 2-5-6-3a3 3 0 0 1-6 0Z"/></svg>,
  pin: <svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-10.2A6.5 6.5 0 0 1 12 4.5a6.5 6.5 0 0 1 6.5 6.3C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/></svg>,
  image: <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg>,
  users: <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.9M17.8 14.9c1.7.6 2.7 1.9 3 4.1"/></svg>,
  bag: <svg viewBox="0 0 24 24"><path d="M5.5 8h13l-1.1 12.5H6.6L5.5 8Z"/><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4"/></svg>,
  clock: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>,
  flag: <svg viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/></svg>,
  list: <svg viewBox="0 0 24 24"><path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><circle cx="4.6" cy="6.5" r="1.1" fill="currentColor"/><circle cx="4.6" cy="12" r="1.1" fill="currentColor"/><circle cx="4.6" cy="17.5" r="1.1" fill="currentColor"/></svg>,
  mail: <svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4.5 7.5 12 13l7.5-5.5"/></svg>,
  user: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.4 3.6-5 7-5s6.2 1.6 7 5"/></svg>,
  award: <svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M8.9 13.4 7.2 21l4.8-2.5L16.8 21l-1.7-7.6"/></svg>,
  trophy: <svg viewBox="0 0 24 24"><path d="M7.5 3.5h9V9a4.5 4.5 0 0 1-9 0V3.5Z"/><path d="M7.5 5H4.8a2.8 2.8 0 0 0 2.9 4.4M16.5 5h2.7a2.8 2.8 0 0 1-2.9 4.4"/><path d="M12 13.5V17M9 20.5h6M10.2 20.5 11.2 17h1.6l1 3.5"/></svg>,
  calendar: <svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10.2h16M8 3.5v4M16 3.5v4"/></svg>,
  phone: <svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.8 18.6h2.4"/></svg>,
};
const NAV: [string, string, keyof typeof I][] = [
  ["Home","/","home"],["Mission","/about","target"],["Kit","/#kit","shirt"],["Tour","/#tour","pin"],
  ["Gallery","/gallery","image"],["Squad","/squad","users"],["Leaderboard","/#leaderboard","trophy"],["Events","/#events","calendar"],["Fixtures","/fixtures","list"],["People","/people","award"],["Store","/store","bag"],["History","/history","clock"],
  ["Grounds","/grounds","flag"],["Rules","/rules","list"],["Login","/login","user"],
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => { setLight(document.documentElement.dataset.theme === "light"); setInstalled(isStandalone()); }, []);
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
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Switch dark / light theme">{light ? <Sun/> : <Moon/>}</button>
        <Link href="/join" className="btn head-join">Join Us</Link>
        <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Burger/></button>
      </div>
    </div></header>
    <div className={`backdrop${open ? " open" : ""}`} onClick={() => setOpen(false)} />
    <aside className={`drawer${open ? " open" : ""}`} aria-hidden={!open}>
      <svg className="drawer-pitch" viewBox="0 0 300 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="14" y="14" width="272" height="592"/><line x1="14" y1="310" x2="286" y2="310"/><circle cx="150" cy="310" r="72"/><rect x="80" y="14" width="140" height="96"/><rect x="80" y="510" width="140" height="96"/><circle className="fill" cx="150" cy="310" r="4"/></svg>
      <div className="dcard" style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px"}}>
        <Image src="/assets/logo-transparent.png" alt="The Bachelors FC crest" width={40} height={47} style={{objectFit:"contain"}}/>
        <strong className="dbrand">THE BACHELORS <span style={{color:"var(--gold)"}}>FC</span></strong>
        <button type="button" className="icon-btn" style={{marginLeft:"auto"}} onClick={() => setOpen(false)} aria-label="Close menu"><Close/></button>
      </div>
      <nav className="dcard" style={{marginTop:14,overflowY:"auto",padding:"6px 8px"}}>
        {NAV.map(([l,h,ic]) => <Link key={h+l} className={`drow${!h.startsWith("/#") && path === h ? " on" : ""}`} href={h} aria-current={!h.startsWith("/#") && path === h ? "page" : undefined} onClick={() => setOpen(false)}><span className="dico">{I[ic]}</span>{l}<span className="dchev">›</span></Link>)}
        {!installed && <button type="button" className="drow" style={{width:"100%",background:"none",border:0,cursor:"pointer",font:"inherit",textAlign:"left"}} onClick={async () => { setOpen(false); const ok = await promptInstall(); if (!ok) { alert(isIOS() ? "Install: Safari-te Share button chap diye 'Add to Home Screen' select koro." : "Install: browser-er menu (⋮) theke 'Install and create shortcut' ba 'Add to Home screen' chap dao."); } }}><span className="dico">{I.phone}</span>Install App<span className="dchev">›</span></button>}
      </nav>
      <div style={{marginTop:14}}>
        <Link href="/join" className="btn djoin" style={{display:"block",textAlign:"center"}} onClick={() => setOpen(false)}>Join the Squad</Link>
      </div>
    </aside>
  </>);
}
