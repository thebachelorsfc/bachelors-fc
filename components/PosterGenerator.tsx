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

// Image loading hardened (2026-11-01): fetch with an 8s timeout (a dead-slow
// connection used to hang the render - and the Download button - forever) and
// a per-session promise cache, so a photo is fetched at most once and any
// re-render is instant. A photo that cannot load becomes the navy # disc.
const imgCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadImg(src: string): Promise<HTMLImageElement | null> {
  const hit = imgCache.get(src);
  if (hit) return hit;
  const p = (async () => {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(src, { signal: ctl.signal });
      clearTimeout(to);
      if (!r.ok) return null;
      const url = URL.createObjectURL(await r.blob());
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } catch { return null; }
  })();
  imgCache.set(src, p);
  return p;
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
    try { await (document as any).fonts.load('240px Anton'); await (document as any).fonts.load('104px Anton'); await (document as any).fonts.load('700 90px Oswald'); await (document as any).fonts.load('600 40px Oswald'); await (document as any).fonts.load('italic 400 30px Inter'); await (document as any).fonts.load('400 28px Inter'); } catch {}

    // Editorial Matchday design (2026-11-06): full-bleed duotone ground photo,
    // giant cropped Anton type, left-aligned asymmetric info column, hairline
    // rules, no centred template layout, no URL pill.
    const X = 64, XR = W - 64;
    const foil = (x0: number, x1: number) => {
      const fg = ctx.createLinearGradient(x0, 0, x1, 0);
      fg.addColorStop(0, "#8f6f14"); fg.addColorStop(0.35, GOLD2); fg.addColorStop(0.55, "#fff2b0"); fg.addColorStop(0.8, GOLD); fg.addColorStop(1, "#8f6f14");
      return fg;
    };
    const spaced = (v: string) => { try { (ctx as any).letterSpacing = v; } catch {} };
    const left = (text: string, x: number, y: number, font: string, fill: string | CanvasGradient) => {
      ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = "left"; ctx.fillText(text, x, y);
    };
    const right = (text: string, x: number, y: number, font: string, fill: string | CanvasGradient) => {
      ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = "right"; ctx.fillText(text, x, y); ctx.textAlign = "left";
    };
    const fitA = (text: string, maxW: number, start: number) => {
      let s = start; ctx.font = `${s}px Anton`;
      while (ctx.measureText(text).width > maxW && s > 40) { s -= 6; ctx.font = `${s}px Anton`; }
      return s;
    };
    const hairline = (y: number, alpha = 0.4) => {
      ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(XR, y); ctx.stroke();
    };

    // ── backdrop: ground photo duotone, or navy + crest watermark ──
    const photo = matched?.photo_url ? await loadImg(matched.photo_url) : null;
    const crest = await loadImg("/assets/logo-transparent.png");
    if (photo) {
      const s = Math.max(W / photo.width, H / photo.height);
      ctx.drawImage(photo, (W - photo.width * s) / 2, (H - photo.height * s) / 2, photo.width * s, photo.height * s);
      // navy-gold grade: deep navy shadows, lighter middle so the photo lives
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, "rgba(7,10,24,0.66)"); ov.addColorStop(0.42, "rgba(7,10,24,0.34)");
      ov.addColorStop(0.74, "rgba(5,6,14,0.80)"); ov.addColorStop(1, "rgba(4,5,11,0.95)");
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(10,17,44,0.20)"; ctx.fillRect(0, 0, W, H);
      try { ctx.globalCompositeOperation = "overlay"; ctx.fillStyle = "rgba(212,175,55,0.10)"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over"; } catch {}
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.030)"; ctx.lineWidth = 5;
      for (let x = 30; x < W - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); }
      if (crest) { ctx.globalAlpha = 0.07; const cw = 780; ctx.drawImage(crest, W - cw + 130, H * 0.30, cw, cw); ctx.globalAlpha = 1; }
    }

    // ── top bar: crest + club name left, city right ──
    const ty0 = 56;
    if (crest) ctx.drawImage(crest, X, ty0, 84, 84);
    spaced("3px");
    left("THE BACHELORS FC", X + 104, ty0 + 40, "600 31px Oswald", PAPER);
    spaced("0px");
    left("FOOTBALL CLUB · EST. 2026", X + 104, ty0 + 74, "400 21px Inter", MUTE);
    spaced("4px");
    right("KHULSHI, CHITTAGONG", XR, ty0 + 40, "600 21px Oswald", GOLD2);
    spaced("0px");
    hairline(ty0 + 116);

    // ── kicker tag (solid block, left aligned) ──
    const isToday = session.session_date && session.session_date === dhakaToday();
    const kicker = session.opponent ? (isToday ? "MATCH TODAY" : "MATCHDAY") : "CLUB SESSION";
    const tagY = ty0 + 116 + Math.round(42 * S), tagH = 54;
    ctx.font = "600 29px Oswald"; spaced("6px");
    const kw = ctx.measureText(kicker).width + 52; spaced("0px");
    ctx.fillStyle = isToday ? "#a01e1e" : "rgba(212,175,55,0.16)";
    ctx.beginPath(); (ctx as any).roundRect(X, tagY, kw, tagH, 6); ctx.fill();
    if (!isToday) { ctx.strokeStyle = GOLD; ctx.lineWidth = 1.4; ctx.stroke(); }
    spaced("6px");
    left(kicker, X + 26, tagY + 38, "600 29px Oswald", isToday ? "#ffe1e1" : GOLD2);
    spaced("0px");

    // ── giant headline, cropped at the left edge ──
    let cur = tagY + tagH + Math.round(26 * S);
    const headLines = session.opponent
      ? ["MATCH", "DAY"]
      : String(session.title || "Club Session").toUpperCase().split(/\s+/).filter(Boolean).slice(0, 2);
    const HS = Math.min(...headLines.map(l => fitA(l, W - X - 30, size === "story" ? 264 : 222)), size === "story" ? 264 : 222);
    headLines.forEach((ln, i) => {
      cur += HS * 0.88;
      left(ln, X - 6, cur, `${HS}px Anton`, i === 0 ? PAPER : foil(X, XR));
    });
    cur += Math.round(30 * S);

    // ── opponent ──
    if (session.opponent) {
      spaced("5px");
      left("VERSUS", X, cur + 22, "600 23px Oswald", MUTE);
      spaced("0px");
      cur += Math.round(38 * S);
      const opp = String(session.opponent).toUpperCase();
      const os = fitA(opp, W - 2 * X, 102);
      left(opp, X - 2, cur + os * 0.84, `${os}px Anton`, PAPER);
      cur += os * 0.84 + Math.round(20 * S);
      ctx.fillStyle = GOLD; ctx.fillRect(X, cur, 118, 6);
      cur += Math.round(30 * S);
    }

    // ── players-in line ──
    if (inCount > 0) {
      ctx.strokeStyle = GOLD2; ctx.lineWidth = 5; ctx.lineCap = "round";
      const chy = cur + 16;
      ctx.beginPath(); ctx.moveTo(X + 2, chy); ctx.lineTo(X + 10, chy + 9); ctx.lineTo(X + 26, chy - 9); ctx.stroke();
      spaced("2px");
      left(`${inCount} PLAYERS ALREADY IN`, X + 42, cur + 24, "600 27px Oswald", GOLD2);
      spaced("0px");
      cur += 24 + Math.round(20 * S);
    }

    // ── info column, anchored to the bottom ──
    const tm = fmtTime(session.session_time);
    const rows: [string, string, string?][] = [];
    if (size === "post" && tm && session.session_date) rows.push(["DATE & TIME", `${fmtDate(session.session_date)} — ${tm}`]);
    else {
      rows.push(["DATE", fmtDate(session.session_date)]);
      if (tm) rows.push(["KICK-OFF", tm]);
    }
    if (groundName) rows.push(["VENUE", groundName.toUpperCase(), matched?.address || undefined]);
    const rowH = (r: [string, string, string?]) => 92 + (r[2] ? 34 : 0);
    const blockH = rows.reduce((a, r) => a + rowH(r), 0);
    let ry = Math.max(cur + Math.round(26 * S), H - 148 - blockH);
    rows.forEach(r => {
      hairline(ry, 0.35);
      spaced("4px");
      left(r[0], X, ry + 30, "600 21px Oswald", GOLD2);
      spaced("0px");
      let vs = 38; ctx.font = `600 ${vs}px Oswald`;
      while (ctx.measureText(r[1]).width > W - 2 * X && vs > 24) { vs -= 2; ctx.font = `600 ${vs}px Oswald`; }
      left(r[1], X, ry + 30 + vs + 6, `600 ${vs}px Oswald`, PAPER);
      if (r[2]) left(r[2], X, ry + 30 + vs + 6 + 32, "400 25px Inter", MUTE);
      ry += rowH(r);
    });

    // ── footer: hairline, motto left, URL right ──
    hairline(H - 118, 0.5);
    left("Forged in Brotherhood, Driven by Purpose", X, H - 64, "italic 400 27px Inter", MUTE);
    right("BACHELORS-FC.VERCEL.APP", XR, H - 64, "700 25px Oswald", GOLD2);
    spaced("5px");
    left("UNITED, NOT ALONE", X, H - 28, "600 18px Oswald", GOLD2);
    spaced("0px");

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
