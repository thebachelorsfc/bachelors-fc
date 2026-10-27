"use client";
import { useAnthem } from "./AnthemProvider";

// Homepage anthem card (2026-10-27; premium layout pass same day; global
// playback 2026-10-28). This card is only the CONTROLS — the actual audio
// lives in AnthemProvider (root layout), so playback survives navigation
// to any page and this card always shows the true play state/time, even
// after leaving and coming back. Layout: crest (top-aligned, no ring) +
// title header row with the animated equalizer, gold seek bar with a
// knob, centred control row — back 10s · play/pause · forward 10s.
export default function AnthemPlayer() {
  const { playing, cur, dur, toggle, seekFrac, skip } = useAnthem();
  const fmt = (t: number) => (!isFinite(t) || t < 0 ? "0:00" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width > 0) seekFrac((e.clientX - r.left) / r.width);
  }

  return (
    <div className="card anthem-card">
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
