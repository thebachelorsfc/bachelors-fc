"use client";
import { useEffect, useRef, useState } from "react";

// Club anthem player (2026-10-27; premium layout pass same day): one tap
// plays the anthem MP3 (browsers block autoplay with sound, so it is always
// tap-to-play). Layout: crest (top-aligned, no ring) + title header row with
// the animated equalizer, gold seek bar with a knob, and a centred control
// row — back 10s · play/pause · forward 10s — so no dead space anywhere.
// Duration is read live from the <audio> element (mount check + native
// listeners): the React loadedmetadata event alone can be missed when the
// file is cached, which left the total at 0:00 and dead seek buttons.
export default function AnthemPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
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
    else { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  }
  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current; if (!a) return;
    const d = a.duration; if (!isFinite(d) || d <= 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * d;
  }
  function skip(sec: number) {
    const a = audioRef.current; if (!a) return;
    const d = a.duration;
    const t = a.currentTime + sec;
    a.currentTime = isFinite(d) && d > 0 ? Math.min(Math.max(0, t), d) : Math.max(0, t);
  }

  return (
    <div className="card anthem-card">
      <audio ref={audioRef} src={src} preload="metadata"
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onDurationChange={(e) => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDur(d); }}
        onEnded={() => { setPlaying(false); setCur(0); }} />
      <div className="anthem-head">
        <img className="anthem-crestimg" src="/assets/logo-transparent.png" alt="The Bachelors FC crest" />
        <div className="anthem-headtx">
          <div className="anthem-title">The Bachelors FC — Club Anthem</div>
          <div className="anthem-sub">Forged in Brotherhood, Driven by Purpose</div>
        </div>
        <div className={`anthem-eq${playing ? " on" : ""}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>
      </div>
      <div className="anthem-track" onClick={seek} role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(cur)}>
        <div className="anthem-fill" style={{ width: dur ? `${(cur / dur) * 100}%` : "0%" }} />
      </div>
      <div className="anthem-times"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
      <div className="anthem-controls">
        <button className="anthem-seekbtn" onClick={() => skip(-10)} aria-label="Back 10 seconds">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1.8L5.8 8 12 14.2V11a5.5 5.5 0 1 1-5.5 5.5H4A8 8 0 1 0 12 5z" /></svg>
          <span className="anthem-seeknum">10</span>
        </button>
        <button className="anthem-play" onClick={toggle} aria-label={playing ? "Pause the club anthem" : "Play the club anthem"}>
          {playing
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true" style={{ marginLeft: 3 }}><path d="M8 5.4v13.2c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L9.8 4.4C9 3.9 8 4.5 8 5.4z" /></svg>}
        </button>
        <button className="anthem-seekbtn" onClick={() => skip(10)} aria-label="Forward 10 seconds">
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: "scaleX(-1)" }}><path d="M12 5V1.8L5.8 8 12 14.2V11a5.5 5.5 0 1 1-5.5 5.5H4A8 8 0 1 0 12 5z" /></svg>
          <span className="anthem-seeknum">10</span>
        </button>
      </div>
    </div>
  );
}
