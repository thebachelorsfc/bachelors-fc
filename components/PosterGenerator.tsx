"use client";
import { useCallback, useEffect, useState } from "react";

/* Matchday Poster Generator — Admin → Sessions → 🖼 Poster.
   Renders a premium poster on a canvas from the session's REAL data (title, date,
   time, ground, opponent) + the matched ground's photo as backdrop. Two sizes:
   Post 1080×1350 (4:5) and Story 1080×1920 (9:16). Design language matches the
   membership card: navy/gold, foil gradients, pinstripes, corner diamonds. */

const GOLD = "#d4af37";
const GOLD2 = "#f0cb6e";
const PAPER = "#f7f5ef";
const MUTE = "#a8afc4";
const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dhakaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function fmtDate(d?: string | null): string {
  if (!d) return "TO BE ANNOUNCED";
  const [y, m, dd] = d.split("-").map(Number);
  if (!y || !m || !dd) return d;
  const dt = new Date(y, m - 1, dd);
  return `${WD[dt.getDay()]} · ${dd} ${MON[m - 1]} ${y}`;
}
function fmtTime(t?: string | null): string | null {
  if (!t) return null;
  const [h, mi] = t.slice(0, 5).split(":").map(Number);
  if (isNaN(h)) return t;
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mi || 0).padStart(2, "0")} ${ap}`;
}

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  try {
    const r = await fetch(src);
    if (!r.ok) return null;
    const url = URL.createObjectURL(await r.blob());
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch { return null; }
}

export default function PosterGenerator({ session, grounds, inCount, onClose }: { session: any; grounds: any[]; inCount: number; onClose: () => void }) {
  const [size, setSize] = useState<"post" | "story">("post");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const groundName = String(session.ground || "").trim();
  const matched = groundName
    ? grounds.find(g => String(g.name).toLowerCase() === groundName.toLowerCase())
      || grounds.find(g => String(g.name).toLowerCase().includes(groundName.toLowerCase()) || groundName.toLowerCase().includes(String(g.name).toLowerCase()))
    : null;

  const render = useCallback(async (forDownload: boolean) => {
    const W = 1080, H = size === "post" ? 1350 : 1920;
    const S = H / 1350; // vertical breathing scale
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d"); if (!ctx) return null;
    try { await (document as any).fonts.load('700 90px Oswald'); await (document as any).fonts.load('600 40px Oswald'); await (document as any).fonts.load('italic 400 30px Inter'); } catch {}

    const foil = (x0: number, x1: number) => {
      const fg = ctx.createLinearGradient(x0, 0, x1, 0);
      fg.addColorStop(0, "#8f6f14"); fg.addColorStop(0.35, GOLD2); fg.addColorStop(0.55, "#fff2b0"); fg.addColorStop(0.8, GOLD); fg.addColorStop(1, "#8f6f14");
      return fg;
    };
    const center = (text: string, y: number, font: string, fill: string | CanvasGradient) => {
      ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = "center";
      ctx.fillText(text, W / 2, y); ctx.textAlign = "left";
    };
    const fit = (text: string, maxW: number, start: number, weight = 700) => {
      let s = start; ctx.font = `${weight} ${s}px Oswald`;
      while (ctx.measureText(text).width > maxW && s > 30) { s -= 4; ctx.font = `${weight} ${s}px Oswald`; }
      return s;
    };

    // ── backdrop: ground photo (darkened) or navy + crest watermark ──
    const photo = matched?.photo_url ? await loadImg(matched.photo_url) : null;
    const crest = await loadImg("/assets/logo-transparent.png");
    if (photo) {
      const s = Math.max(W / photo.width, H / photo.height);
      ctx.drawImage(photo, (W - photo.width * s) / 2, (H - photo.height * s) / 2, photo.width * s, photo.height * s);
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, "rgba(5,7,18,0.88)"); ov.addColorStop(0.5, "rgba(5,7,18,0.82)"); ov.addColorStop(1, "rgba(5,7,18,0.96)");
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (crest) { ctx.globalAlpha = 0.08; const cw = 760; ctx.drawImage(crest, (W - cw) / 2, H * 0.30, cw, cw); ctx.globalAlpha = 1; }
    }
    // pinstripes + sheen
    ctx.strokeStyle = "rgba(255,255,255,0.030)"; ctx.lineWidth = 5;
    for (let x = 30; x < W - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); }
    ctx.save(); ctx.beginPath(); (ctx as any).roundRect(0, 0, W, H, 40); ctx.clip();
    const sh = ctx.createLinearGradient(180, 0, 1080, 0);
    sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,246,200,0.05)"); sh.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H); ctx.restore();
    // frame + corner diamonds
    ctx.strokeStyle = GOLD; ctx.globalAlpha = 0.85; ctx.lineWidth = 3;
    ctx.beginPath(); (ctx as any).roundRect(7, 7, W - 14, H - 14, 36); ctx.stroke();
    ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(20, 20, W - 40, H - 40, 28); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = GOLD;
    [[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]].forEach(([cx, cy]) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4); ctx.globalAlpha = 0.55; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
    });
    ctx.globalAlpha = 1;

    // ── header: crest + kicker pill ──
    let y = 56 * S;
    if (crest) { const cw = 150 * Math.min(S, 1.2); ctx.drawImage(crest, (W - cw) / 2, y, cw, cw); y += cw + 34 * S; }
    const isToday = session.session_date && session.session_date === dhakaToday();
    const kicker = session.opponent ? (isToday ? "MATCH TODAY" : "MATCHDAY") : "CLUB SESSION";
    ctx.font = "600 33px Oswald";
    const kw = ctx.measureText(kicker.split("").join("  ")).width + 72;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6;
    ctx.fillStyle = isToday ? "rgba(160,30,30,0.85)" : "rgba(6,8,16,0.72)";
    ctx.beginPath(); (ctx as any).roundRect((W - kw) / 2, y, kw, 58, 29); ctx.fill(); ctx.stroke();
    center(kicker.split("").join("  "), y + 41, "600 33px Oswald", isToday ? "#ffd9d9" : GOLD2);
    y += 58 + 44 * S;

    // ── headline ──
    center("THE BACHELORS FC", y + 80, `700 ${fit("THE BACHELORS FC", 920, 84)}px Oswald`, PAPER);
    y += 80 + 22 * S;
    if (session.opponent) {
      // VS diamond
      const dc = y + 52, ds = 96;
      ctx.save(); ctx.translate(W / 2, dc); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = foil(W / 2 - ds / 2, W / 2 + ds / 2); ctx.fillRect(-ds / 2, -ds / 2, ds, ds); ctx.restore();
      center("VS", dc + 21, "700 46px Oswald", "#0a0a12");
      y = dc + 48 + 20 * S;
      const opp = String(session.opponent).toUpperCase();
      const os = fit(opp, 920, 96);
      center(opp, y + os, `700 ${os}px Oswald`, foil(W / 2 - 300, W / 2 + 300));
      y += os + 32 * S;
    } else if (session.title) {
      const t = String(session.title).toUpperCase();
      const ts = fit(t, 900, 76);
      center(t, y + ts, `700 ${ts}px Oswald`, foil(W / 2 - 300, W / 2 + 300));
      y += ts + 32 * S;
    }

    // ── players-in chip ──
    if (inCount > 0) {
      const label = `${inCount} PLAYERS ALREADY IN`;
      ctx.font = "600 30px Oswald";
      const cw2 = ctx.measureText(label).width + 110;
      ctx.fillStyle = "rgba(212,175,55,0.14)"; ctx.strokeStyle = "rgba(212,175,55,0.55)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); (ctx as any).roundRect((W - cw2) / 2, y, cw2, 54, 27); ctx.fill(); ctx.stroke();
      // drawn check mark
      ctx.strokeStyle = GOLD2; ctx.lineWidth = 5; ctx.lineCap = "round";
      const chx = (W - cw2) / 2 + 30, chy = y + 27;
      ctx.beginPath(); ctx.moveTo(chx - 11, chy); ctx.lineTo(chx - 3, chy + 9); ctx.lineTo(chx + 13, chy - 10); ctx.stroke();
      center(label, y + 39, "600 30px Oswald", GOLD2);
      y += 54 + 28 * S;
    }

    // ── info panel (post size merges date+time into one row so everything breathes) ──
    const tm = fmtTime(session.session_time);
    const rows: [string, string, string?][] = [];
    if (size === "post" && tm && session.session_date) rows.push(["DATE & TIME", `${fmtDate(session.session_date)} — ${tm}`]);
    else {
      rows.push(["DATE", fmtDate(session.session_date)]);
      if (tm) rows.push(["TIME", tm]);
    }
    if (groundName) rows.push(["VENUE", groundName, matched?.address || undefined]);
    const panelH = rows.reduce((a, r) => a + 100 + (r[2] ? 30 : 0), 0) + 20;
    const panelY = size === "post" ? y + 10 : Math.max(y + 10, H * 0.56);
    ctx.fillStyle = "rgba(5,7,14,0.58)"; ctx.strokeStyle = "rgba(212,175,55,0.38)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); (ctx as any).roundRect(100, panelY, W - 200, panelH, 24); ctx.fill(); ctx.stroke();
    let ry = panelY + 26;
    rows.forEach(([k, v, sub], i) => {
      center(k.split("").join(" "), ry + 24, "600 24px Oswald", GOLD2);
      const vs = fit(v.toUpperCase(), 800, 40, 600);
      center(v.toUpperCase(), ry + 24 + vs + 8, `600 ${vs}px Oswald`, PAPER);
      ry += 24 + vs + 8;
      if (sub) { center(sub, ry + 28, "400 27px Inter", MUTE); ry += 30; }
      if (i < rows.length - 1) { ctx.strokeStyle = "rgba(212,175,55,0.16)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150, ry + 14); ctx.lineTo(W - 150, ry + 14); ctx.stroke(); ry += 28; }
    });

    const panelBottom = panelY + panelH;

    // ── footer: motto + URL pill (post flows after the panel; story anchors to H) ──
    const mottoY = size === "post" ? panelBottom + 56 : H - 218;
    const pillY = size === "post" ? panelBottom + 84 : H - 188;
    center("Forged in Brotherhood, Driven by Purpose", mottoY, "italic 400 30px Inter", MUTE);
    const url = "BACHELORS-FC.VERCEL.APP";
    ctx.font = "700 41px Oswald";
    const uw = ctx.measureText(url).width + 96;
    ctx.fillStyle = foil((W - uw) / 2, (W + uw) / 2);
    ctx.beginPath(); (ctx as any).roundRect((W - uw) / 2, pillY, uw, 76, 38); ctx.fill();
    center(url, pillY + 52, "700 41px Oswald", "#0a0a12");
    center("U N I T E D ,  N O T  A L O N E   ·   K H U L S H I ,  C H I T T A G O N G", size === "post" ? pillY + 122 : H - 66, "600 23px Oswald", GOLD2);

    return cv;
  }, [session, matched, inCount, size]);

  useEffect(() => {
    let live = true;
    setBusy(true);
    render(false).then(cv => {
      if (live && cv) setPreview(cv.toDataURL("image/jpeg", 0.88));
      if (live) setBusy(false);
    });
    return () => { live = false; };
  }, [render]);

  async function download() {
    setBusy(true); setNote("");
    const cv = await render(true);
    if (cv) {
      const a = document.createElement("a");
      a.download = `bfc-poster-${session.session_date || "session"}-${size}.png`;
      a.href = cv.toDataURL("image/png"); a.click();
      setNote("Poster downloaded ✓ — now post it to the page & WhatsApp group.");
    }
    setBusy(false);
  }

  const toggle: React.CSSProperties = { padding: ".45rem .9rem", fontSize: 13.5 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,3,8,0.78)", zIndex: 300, display: "grid", placeItems: "center", padding: 14, overflowY: "auto" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, background: "#0b0e18", border: "1px solid var(--line-gold)", borderRadius: 18, padding: 18 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <strong style={{ fontSize: 17 }}>🖼 Matchday poster</strong>
          <button className="btn ghost" style={{ padding: ".3rem .7rem" }} onClick={onClose}>✕</button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 12px" }}>{session.title}{session.session_date ? ` · ${session.session_date}` : ""} — ready-made poster from this session&apos;s real details{matched?.photo_url ? ", with the ground's photo as the backdrop" : ""}.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn" style={size === "post" ? toggle : { ...toggle, background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)" }} onClick={() => setSize("post")}>Post · 4:5</button>
          <button className="btn" style={size === "story" ? toggle : { ...toggle, background: "var(--chip-bg)", color: "var(--chip-tx)", border: "1px solid var(--chip-br)" }} onClick={() => setSize("story")}>Story · 9:16</button>
        </div>
        {preview
          ? <img src={preview} alt="Matchday poster preview" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
          : <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>Designing your poster…</div>}
        <button className="btn" style={{ width: "100%", marginTop: 14 }} onClick={download} disabled={busy}>{busy ? "Preparing…" : "⬇ Download poster (PNG)"}</button>
        {note && <p style={{ color: "var(--note)", fontSize: 13.5, margin: "10px 0 0" }}>{note}</p>}
      </div>
    </div>
  );
}
