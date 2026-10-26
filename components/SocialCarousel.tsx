"use client";
import { useRef, useState } from "react";
export type SocialPostLike = { id: string; post_url: string };
export default function SocialCarousel({ posts }: { posts: SocialPostLike[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const go = (i: number) => { const el = trackRef.current; if (!el) return; const c = Math.max(0, Math.min(posts.length - 1, i)); const card = el.children[c] as HTMLElement | undefined; if (card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" }); };
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; Array.from(el.children).forEach((c, i) => { const card = c as HTMLElement; const d = Math.abs(card.offsetLeft - (el.clientWidth - card.clientWidth) / 2 - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); setIdx(best); };
  return (
    <div className="soc-wrap">
      <div className="soc-track" ref={trackRef} onScroll={onScroll}>
        {posts.map((p, i) => (
          <article key={p.id} className="soc-card">
            <div className="fb-panel-head"><span className="fb-f">f</span><strong>Facebook</strong><a href={p.post_url} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 13.5, textDecoration: "none" }}>Open ↗</a></div>
            <div className="soc-body"><iframe title="The Bachelors FC on Facebook" loading="lazy" src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(p.post_url)}&show_text=true&width=500`} width="500" height="640" scrolling="no" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div>
          </article>
        ))}
      </div>
      {posts.length > 1 && (<>
        <button className="soc-arrow soc-prev" aria-label="Previous post" onClick={() => go(idx - 1)}>‹</button>
        <button className="soc-arrow soc-next" aria-label="Next post" onClick={() => go(idx + 1)}>›</button>
        <div className="soc-dots">{posts.map((p, i) => (<button key={p.id} className={i === idx ? "on" : ""} aria-label={`Go to post ${i + 1}`} onClick={() => go(i)} />))}</div>
      </>)}
    </div>
  );
}
