import { videoEmbed } from "@/lib/video";
export type HighlightLike = { id: string; title: string; video_url: string; played_on?: string | null };
export default function HighlightCard({ h }: { h: HighlightLike }) {
  const v = videoEmbed(h.video_url);
  return (
    <article className="card" style={{ padding: 14 }}>
      <div style={v.kind === "facebook-post" ? { position: "relative", width: "100%", height: 560, borderRadius: 12, overflow: "hidden", background: "#fff" } : { position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        {v.kind === "link" ? (
          <a href={h.video_url} target="_blank" rel="noreferrer" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--gold2)", fontWeight: 700, letterSpacing: ".08em" }}>▶ Watch video</a>
        ) : (
          <iframe src={v.embed} title={h.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
        )}
      </div>
      {(v.kind === "facebook" || v.kind === "facebook-post") && (<p style={{ margin: "10px 2px 0", fontSize: 13 }}><a href={h.video_url} target="_blank" rel="noreferrer" style={{ color: "var(--gold2)", fontWeight: 600 }}>Open on Facebook ↗</a></p>)}
      <h3 style={{ margin: "12px 2px 2px", fontSize: 20 }}>{h.title}</h3>
      {h.played_on && <p style={{ color: "var(--muted)", margin: "0 2px", fontSize: 13.5 }}>{h.played_on}</p>}
    </article>
  );
}
