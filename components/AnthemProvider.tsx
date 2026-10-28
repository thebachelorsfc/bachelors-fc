"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Persistent club anthem (2026-10-28, owner's request): the single <audio>
// element lives HERE, in the root layout, so client-side navigation never
// unmounts it — once a visitor presses play, the anthem keeps playing on
// every page until the visitor pauses/stops it. When the track ends it
// stays ended: no loop, no autoplay, on any page. A full browser reload
// still stops it (browser rule — sound cannot autoplay after a reload).
// Pages get a floating mini player (not on the homepage, which has the
// full card, and not in /admin) so the visitor can pause/stop anywhere.
type AnthemCtx = {
  playing: boolean; cur: number; dur: number; started: boolean;
  toggle: () => void; seekFrac: (f: number) => void; skip: (sec: number) => void; stop: () => void;
};
const Ctx = createContext<AnthemCtx>({ playing: false, cur: 0, dur: 0, started: false, toggle: () => {}, seekFrac: () => {}, skip: () => {}, stop: () => {} });
export const useAnthem = () => useContext(Ctx);

export default function AnthemProvider({ src, children }: { src: string; children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const pathname = usePathname();
  // Mini player is draggable (2026-10-28, owner): the visitor can drag it
  // anywhere on screen; the spot is remembered on this device.
  const miniRef = useRef<HTMLDivElement | null>(null);
  const showMini = started && (playing || cur > 0) && pathname !== "/" && !(pathname || "").startsWith("/admin");
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const suppressRef = useRef(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bfc-mini-pos");
      if (raw) { const p = JSON.parse(raw); if (typeof p?.x === "number" && typeof p?.y === "number") setPos({ x: Math.max(4, Math.min(p.x, window.innerWidth - 80)), y: Math.max(4, Math.min(p.y, window.innerHeight - 60)) }); }
    } catch {}
  }, []);
  const clampPos = (x: number, y: number) => {
    const el = miniRef.current; const w = el?.offsetWidth ?? 240; const h = el?.offsetHeight ?? 54;
    return { x: Math.min(Math.max(6, x), Math.max(6, window.innerWidth - w - 6)), y: Math.min(Math.max(6, y), Math.max(6, window.innerHeight - h - 6)) };
  };
  // Native drag listeners (replaces React prop handlers 2026-10-28 after
  // the owner reported the mini would not move on his phone): window-level
  // move/up tracking + preventDefault makes the drag immune to React
  // delegation quirks and mid-gesture scroll takeover.
  useEffect(() => {
    const el = miniRef.current; if (!el || !showMini) return;
    let st: { sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      const r = el.getBoundingClientRect();
      st = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!st) return;
      const dx = e.clientX - st.sx, dy = e.clientY - st.sy;
      if (!st.moved && Math.abs(dx) + Math.abs(dy) < 7) return;
      st.moved = true; setDragging(true);
      if (e.cancelable) e.preventDefault();
      setPos(clampPos(st.ox + dx, st.oy + dy));
    };
    const up = () => {
      if (!st) return;
      const moved = st.moved; st = null; setDragging(false);
      if (moved) {
        suppressRef.current = true;
        setTimeout(() => { suppressRef.current = false; }, 350);
        setPos((p) => { if (p) { try { localStorage.setItem("bfc-mini-pos", JSON.stringify(p)); } catch {} } return p; });
      }
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, [showMini]);
  function guard(fn: () => void) { if (suppressRef.current) { suppressRef.current = false; return; } fn(); }
  const fmt = (t: number) => (!isFinite(t) || t < 0 ? "0:00" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const sync = () => { if (isFinite(a.duration) && a.duration > 0) setDur(a.duration); };
    sync();
    a.addEventListener("loadedmetadata", sync);
    a.addEventListener("durationchange", sync);
    return () => { a.removeEventListener("loadedmetadata", sync); a.removeEventListener("durationchange", sync); };
  }, []);

  function toggle() {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => { setPlaying(true); setStarted(true); }).catch(() => setPlaying(false)); }
  }
  function seekFrac(f: number) {
    const a = audioRef.current; if (!a) return;
    const d = a.duration; if (!isFinite(d) || d <= 0) return;
    a.currentTime = Math.min(Math.max(0, f), 1) * d;
  }
  function skip(sec: number) {
    const a = audioRef.current; if (!a) return;
    const d = a.duration;
    const t = a.currentTime + sec;
    a.currentTime = isFinite(d) && d > 0 ? Math.min(Math.max(0, t), d) : Math.max(0, t);
  }
  function stop() {
    const a = audioRef.current; if (!a) return;
    a.pause(); a.currentTime = 0; setPlaying(false); setCur(0); setStarted(false);
  }


  return (
    <Ctx.Provider value={{ playing, cur, dur, started, toggle, seekFrac, skip, stop }}>
      {src && <audio ref={audioRef} src={src} preload="metadata"
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onDurationChange={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onEnded={() => { setPlaying(false); setCur(0); }} />}
      {children}
      {showMini && (
        <div ref={miniRef} className={`anthem-mini${dragging ? " dragging" : ""}`} role="region" aria-label="Club anthem player — drag to move" title="Drag to move" style={pos ? { left: pos.x, top: pos.y, bottom: "auto" } : undefined}>
          <button className="anthem-mini-play" onClick={() => guard(toggle)} aria-label={playing ? "Pause the club anthem" : "Play the club anthem"}>
            {playing
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true" style={{ marginLeft: 2 }}><path d="M8 5.4v13.2c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L9.8 4.4C9 3.9 8 4.5 8 5.4z" /></svg>}
          </button>
          <div className="anthem-mini-tx">
            <span className="anthem-mini-name">Club Anthem</span>
            <span className="anthem-mini-time">{fmt(cur)} / {fmt(dur)}</span>
          </div>
          <div className={`anthem-eq anthem-mini-eq${playing ? " on" : ""}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <button className="anthem-mini-x" onClick={() => guard(stop)} aria-label="Stop the club anthem">✕</button>
        </div>
      )}
    </Ctx.Provider>
  );
}
