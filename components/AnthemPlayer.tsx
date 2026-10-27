"use client";
import { useRef, useState } from "react";

// Club anthem player (2026-10-27): one tap plays the anthem MP3 (browsers
// block autoplay with sound, so it is always tap-to-play). Custom premium
// chrome — crest, animated equalizer while playing, gold seek bar.
export default function AnthemPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const fmt = (t: number) => (!isFinite(t) || t < 0 ? "0:00" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`);

  function toggle() {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  }
  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current; if (!a || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * dur;
  }

  return (
    <div className="card anthem-card">
      <audio ref={audioRef} src={src} preload="metadata"
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setCur(0); }} />
      <img className="anthem-crest" src="/assets/logo-transparent.png" alt="The Bachelors FC crest" />
      <div className="anthem-main">
        <div className="anthem-title">The Bachelors FC — Club Anthem</div>
        <div className="anthem-sub">Forged in Brotherhood, Driven by Purpose</div>
        <div className="anthem-track" onClick={seek} role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(cur)}>
          <div className="anthem-fill" style={{ width: dur ? `${(cur / dur) * 100}%` : "0%" }} />
        </div>
        <div className="anthem-times"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
      </div>
      <div className={`anthem-eq${playing ? " on" : ""}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <button className="anthem-play" onClick={toggle} aria-label={playing ? "Pause the club anthem" : "Play the club anthem"}>{playing ? "❚❚" : "▶"}</button>
    </div>
  );
}
