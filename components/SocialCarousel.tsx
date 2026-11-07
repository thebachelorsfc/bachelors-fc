"use client";
import { useEffect, useRef, useState } from "react";
export type SocialPostLike = { id: string; post_url: string };

type CardState = "loading" | "ok" | "failed";
const LOAD_TIMEOUT_MS = 14000;

/** FB embed plugins are picky: use the canonical www URL, drop share junk. */
function normalizeFbUrl(u: string): string {
  try {
    const url = new URL(u);
    if (url.hostname === "m.facebook.com") url.hostname = "www.facebook.com";
    ["rdid", "mibextid", "__tn__", "_rdr", "ref"].forEach((k) => url.searchParams.delete(k));
    url.hash = "";
    return url.toString();
  } catch {
    return u;
  }
}

let sdkPromise: Promise<boolean> | null = null;
function loadFbSdk(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  const w = window as any;
  if (w.FB) return Promise.resolve(true);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    const prev = w.fbAsyncInit;
    w.fbAsyncInit = function () {
      try { if (typeof prev === "function") prev(); } catch { /* noop */ }
      resolve(true);
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0";
    s.async = true;
    s.defer = true;
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
    setTimeout(() => resolve(!!w.FB), 12000);
  });
  return sdkPromise;
}

export default function SocialCarousel({ posts }: { posts: SocialPostLike[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const bodyRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const startRef = useRef<{ [id: string]: number }>({});
  const [idx, setIdx] = useState(0);
  const [states, setStates] = useState<{ [id: string]: CardState }>({});
  const [attempts, setAttempts] = useState<{ [id: string]: number }>({});

  const go = (i: number) => { const el = trackRef.current; if (!el) return; const c = Math.max(0, Math.min(posts.length - 1, i)); const card = el.children[c] as HTMLElement | undefined; if (card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" }); };
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; Array.from(el.children).forEach((c, i) => { const card = c as HTMLElement; const d = Math.abs(card.offsetLeft - (el.clientWidth - card.clientWidth) / 2 - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); setIdx(best); };

  // Load the FB SDK once, parse the embeds, and watch each card: an embed
  // counts as loaded only when the SDK actually inserts its iframe. If that
  // never happens (slow network, FB refusing this device/IP), the card keeps
  // a designed fallback instead of Facebook's raw "refused to connect" page.
  useEffect(() => {
    let alive = true;
    posts.forEach((p) => { if (!startRef.current[p.id]) startRef.current[p.id] = Date.now(); });
    loadFbSdk().then((ok) => {
      if (!alive) return;
      const w = window as any;
      if (ok && w.FB && trackRef.current) {
        try { w.FB.XFBML.parse(trackRef.current); } catch { /* per-card watcher decides */ }
      }
    });
    const timer = setInterval(() => {
      if (!alive) return;
      setStates((prev) => {
        let changed = false;
        const next: { [id: string]: CardState } = { ...prev };
        posts.forEach((p) => {
          if (next[p.id] === "ok" || next[p.id] === "failed") return;
          const body = bodyRefs.current[p.id];
          const hasFrame = !!(body && body.querySelector(".fb-post iframe"));
          if (hasFrame) { next[p.id] = "ok"; changed = true; return; }
          const started = startRef.current[p.id] || Date.now();
          if (Date.now() - started > LOAD_TIMEOUT_MS) { next[p.id] = "failed"; changed = true; }
        });
        return changed ? next : prev;
      });
    }, 1200);
    return () => { alive = false; clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const retry = (p: SocialPostLike) => {
    startRef.current[p.id] = Date.now();
    setStates((s) => ({ ...s, [p.id]: "loading" }));
    setAttempts((a) => ({ ...a, [p.id]: (a[p.id] || 0) + 1 }));
    loadFbSdk().then((ok) => {
      const w = window as any;
      const body = bodyRefs.current[p.id];
      if (ok && w.FB && body) { try { w.FB.XFBML.parse(body); } catch { /* watcher decides */ } }
    });
  };

  return (
    <div className="soc-wrap">
      <div className="soc-track" ref={trackRef} onScroll={onScroll}>
        {posts.map((p) => {
          const st: CardState = states[p.id] || "loading";
          const href = normalizeFbUrl(p.post_url);
          return (
            <article key={p.id} className="soc-card">
              <div className="fb-panel-head"><span className="fb-f">f</span><strong>Facebook</strong><a href={href} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 13.5, textDecoration: "none" }}>Open ↗</a></div>
              <div
                className="soc-body"
                ref={(el) => { bodyRefs.current[p.id] = el; }}
                style={{ position: "relative" }}
              >
                <div
                  key={`${p.id}-${attempts[p.id] || 0}`}
                  className="fb-post"
                  data-href={href}
                  data-width="500"
                  data-show-text="true"
                />
                {st !== "ok" && (
                  <div className="soc-fallback">
                    <span className="soc-fb-badge" aria-hidden>f</span>
                    {st === "loading" ? (
                      <>
                        <p className="soc-fb-title">Loading post…</p>
                        <p className="soc-fb-sub">Fetching the latest from our Facebook page.</p>
                      </>
                    ) : (
                      <>
                        <p className="soc-fb-title">This post could not load here</p>
                        <p className="soc-fb-sub">Your connection or Facebook is not letting the post show inside the site. You can still read it on Facebook.</p>
                        <div className="soc-fb-actions">
                          <a className="soc-fb-btn" href={href} target="_blank" rel="noreferrer">View on Facebook ↗</a>
                          <button type="button" className="soc-fb-retry" onClick={() => retry(p)}>Retry</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {posts.length > 1 && (<>
        <button className="soc-arrow soc-prev" aria-label="Previous post" onClick={() => go(idx - 1)}>‹</button>
        <button className="soc-arrow soc-next" aria-label="Next post" onClick={() => go(idx + 1)}>›</button>
        <div className="soc-dots">{posts.map((p, i) => (<button key={p.id} className={i === idx ? "on" : ""} aria-label={`Go to post ${i + 1}`} onClick={() => go(i)} />))}</div>
      </>)}
    </div>
  );
}
