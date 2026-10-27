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

  const showMini = started && (playing || cur > 0) && pathname !== "/" && !(pathname || "").startsWith("/admin");

  return (
    <Ctx.Provider value={{ playing, cur, dur, started, toggle, seekFrac, skip, stop }}>
      {src && <audio ref={audioRef} src={src} preload="metadata"
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onDurationChange={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onEnded={() => { setPlaying(false); setCur(0); }} />}
      {children}
      {showMini && (
        <div className="anthem-mini" role="region" aria-label="Club anthem player">
          <button className="anthem-mini-play" onClick={toggle} aria-label={playing ? "Pause the club anthem" : "Play the club anthem"}>
            {playing
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true" style={{ marginLeft: 2 }}><path d="M8 5.4v13.2c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L9.8 4.4C9 3.9 8 4.5 8 5.4z" /></svg>}
          </button>
          <div className="anthem-mini-tx">
            <span className="anthem-mini-name">Club Anthem</span>
            <span className="anthem-mini-time">{fmt(cur)} / {fmt(dur)}</span>
          </div>
          <div className={`anthem-eq anthem-mini-eq${playing ? " on" : ""}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <button className="anthem-mini-x" onClick={stop} aria-label="Stop the club anthem">✕</button>
        </div>
      )}
    </Ctx.Provider>
  );
}
