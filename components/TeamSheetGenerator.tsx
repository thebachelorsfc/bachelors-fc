"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* Team Sheet Generator — Admin → Sessions → 📋 Team Sheet.
   A 1080×1350 canvas graphic in the matchday-poster language: the session's
   RSVP-IN players arranged on a pitch by position (FWD top → GK bottom),
   falling back to the full squad when nobody has RSVP'd yet. Photos load via
   blob (no canvas taint); missing photos become navy discs with the number. */

const GOLD = "#d4af37";
const GOLD2 = "#f0cb6e";
const PAPER = "#f7f5ef";
const MUTE = "#a8afc4";
const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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

export default function TeamSheetGenerator({ session, players, onClose }: { session: any; players: any[]; onClose: () => void }) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  const inIds = new Set((session.players || []).filter((p: any) => p.status === "in").map((p: any) => p.id));
  const lineup = inIds.size > 0 ? players.filter(p => inIds.has(p.id)) : players;
  const usingSquad = inIds.size === 0;

  const render = useCallback(async () => {
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d"); if (!ctx) return null;
    try { await (document as any).fonts.load('58px Anton'); await (document as any).fonts.load('480px Anton'); await (document as any).fonts.load('700 90px Oswald'); await (document as any).fonts.load('600 40px Oswald'); await (document as any).fonts.load('italic 400 30px Inter'); await (document as any).fonts.load('400 28px Inter'); } catch {}

    // Editorial Team Sheet (2026-11-06): navy board, gold line-art pitch (no
    // green), small photo discs, and a numbered editorial lineup list below.
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
    const hairline = (y: number, alpha = 0.4) => {
      ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(XR, y); ctx.stroke();
    };
    const fitA = (text: string, maxW: number, start: number) => {
      let s = start; ctx.font = `${s}px Anton`;
      while (ctx.measureText(text).width > maxW && s > 30) { s -= 4; ctx.font = `${s}px Anton`; }
      return s;
    };

    // ── backdrop: navy + pinstripes + giant captain-number watermark ──
    const crest = await loadImg("/assets/logo-transparent.png");
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.028)"; ctx.lineWidth = 5;
    for (let x = 30; x < W - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); }
    const cap = lineup.find((p: any) => p.is_captain);
    if (cap?.jersey_no != null) {
      ctx.font = "470px Anton"; ctx.fillStyle = "rgba(247,245,239,0.05)"; ctx.textAlign = "right";
      ctx.fillText(String(cap.jersey_no), W - 6, 520); ctx.textAlign = "left";
    }

    // ── header: crest + title left, meta + chip under a hairline ──
    const ty0 = 52;
    if (crest) ctx.drawImage(crest, X, ty0, 78, 78);
    left("TEAM SHEET", X + 98, ty0 + 56, "56px Anton", PAPER);
    spaced("4px");
    right("THE BACHELORS FC", XR, ty0 + 52, "600 24px Oswald", GOLD2);
    spaced("0px");
    hairline(ty0 + 104);
    let cur = ty0 + 104;
    if (session.opponent) {
      const opp = `VS ${String(session.opponent).toUpperCase()}`;
      const os = fitA(opp, W - 2 * X, 46);
      left(opp, X - 1, cur + os + 14, `${os}px Anton`, foil(X, X + 480));
      cur += os + 14;
    }
    const tm = fmtTime(session.session_time);
    const meta = [fmtDate(session.session_date), tm, session.ground].filter(Boolean).join("  ·  ");
    left(meta.toUpperCase(), X, cur + 38, "400 25px Inter", MUTE);
    cur += 38;
    const chip = usingSquad ? "FULL SQUAD — RSVP STILL OPEN" : `✓ ${lineup.length} PLAYERS IN`;
    spaced("3px");
    left(chip, X, cur + 34, "600 23px Oswald", GOLD2);
    spaced("0px");
    cur += 48;

    // ── pitch: gold line-art on the navy board ──
    const px = X, pw = W - 2 * X, py = cur + 6, ph = 452;
    ctx.strokeStyle = "rgba(240,203,110,0.85)"; ctx.lineWidth = 3;
    ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + pw, py + ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, py + ph / 2, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(px + pw * 0.28, py, pw * 0.44, 52);
    ctx.strokeRect(px + pw * 0.28, py + ph - 52, pw * 0.44, 52);
    ctx.strokeStyle = "rgba(240,203,110,0.30)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); (ctx as any).roundRect(px + 12, py + 12, pw - 24, ph - 24, 12); ctx.stroke();

    const groups: Record<string, any[]> = { FWD: [], MID: [], DEF: [], GK: [] };
    for (const p of lineup) { const k = String(p.position_code || "MID"); (groups[k] ?? groups.MID).push(p); }
    const rows: [string, number][] = [["FWD", 0.17], ["MID", 0.41], ["DEF", 0.65], ["GK", 0.88]];
    const photos = new Map<string, HTMLImageElement | null>();
    await Promise.all(lineup.map(async p => { photos.set(p.id, p.photo_url ? await loadImg(p.photo_url) : null); }));
    for (const [key, frac] of rows) {
      const arr = groups[key];
      const r = arr.length > 4 ? 37 : 42;
      arr.forEach((p, i) => {
        const cx = px + ((i + 1) * pw) / (arr.length + 1);
        const cy = py + ph * frac;
        const img = photos.get(p.id);
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        if (img) {
          const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
          ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
        } else {
          ctx.fillStyle = "#0a1230"; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
          ctx.font = `700 ${r * 0.72}px Oswald`; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
          ctx.fillText(`#${p.jersey_no}`, cx, cy + r * 0.26); ctx.textAlign = "left";
        }
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = p.is_captain ? GOLD : GOLD2; ctx.lineWidth = p.is_captain ? 6 : 3.5; ctx.stroke();
        if (p.is_captain) {
          ctx.beginPath(); ctx.arc(cx + r * 0.78, cy - r * 0.78, 15, 0, Math.PI * 2);
          ctx.fillStyle = GOLD; ctx.fill();
          ctx.font = "700 19px Oswald"; ctx.fillStyle = "#0a0a12"; ctx.textAlign = "center";
          ctx.fillText("C", cx + r * 0.78, cy - r * 0.78 + 7); ctx.textAlign = "left";
        }
        const label = `${String(p.name).split(" ")[0].toUpperCase()} #${p.jersey_no}`;
        ctx.font = "600 22px Oswald"; ctx.fillStyle = p.is_captain ? GOLD2 : PAPER; ctx.textAlign = "center";
        ctx.fillText(label, cx, cy + r + 32); ctx.textAlign = "left";
      });
    }

    // ── editorial lineup list ──
    const order: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    const listed = [...lineup].sort((a, b) => (order[String(a.position_code || "MID")] ?? 2) - (order[String(b.position_code || "MID")] ?? 2) || (a.jersey_no ?? 0) - (b.jersey_no ?? 0));
    let ly = py + ph + 58;
    spaced("4px");
    left(usingSquad ? "FULL SQUAD" : "STARTING LINEUP", X, ly, "600 25px Oswald", GOLD2);
    spaced("0px");
    right(usingSquad ? `${listed.length} PLAYERS` : `${listed.length} IN`, XR, ly, "600 21px Oswald", MUTE);
    hairline(ly + 14, 0.35);
    ly += 14;
    const colW = (W - 2 * X - 56) / 2, rowH = 50;
    const perCol = Math.ceil(listed.length / 2);
    listed.forEach((p, i) => {
      const col = i < perCol ? 0 : 1;
      const row = col === 0 ? i : i - perCol;
      const bx = X + col * (colW + 56);
      const by = ly + 44 + row * rowH;
      left(String(p.jersey_no ?? "—"), bx, by, "30px Anton", GOLD);
      let ns = 26; ctx.font = `600 ${ns}px Oswald`;
      const name = String(p.name).toUpperCase() + (p.is_captain ? " ©" : "");
      while (ctx.measureText(name).width > colW - 150 && ns > 19) { ns -= 1; ctx.font = `600 ${ns}px Oswald`; }
      left(name, bx + 62, by, `600 ${ns}px Oswald`, PAPER);
      right(String(p.position_code || ""), bx + colW, by, "600 21px Oswald", MUTE);
      ctx.strokeStyle = "rgba(212,175,55,0.14)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by + 14); ctx.lineTo(bx + colW, by + 14); ctx.stroke();
    });

    // ── footer: hairline, motto left, URL right ──
    hairline(H - 104, 0.5);
    left("Forged in Brotherhood, Driven by Purpose", X, H - 52, "italic 400 26px Inter", MUTE);
    right("BACHELORS-FC.VERCEL.APP", XR, H - 52, "700 23px Oswald", GOLD2);

    return cv;
  }, [session, lineup, usingSquad]);

  useEffect(() => {
    let live = true;
    setBusy(true);
    render().then(cv => {
      if (live && cv) { cvRef.current = cv; setPreview(cv.toDataURL("image/jpeg", 0.88)); }
      if (live) setBusy(false);
    });
    return () => { live = false; };
  }, [render]);

  async function download() {
    setBusy(true); setNote("");
    // Use the canvas the preview already rendered - re-rendering here used to
    // re-fetch every photo and hang the button on "Preparing..." offline.
    const cv = cvRef.current || await render();
    if (cv) {
      const a = document.createElement("a");
      a.download = `bfc-team-sheet-${session.session_date || "session"}.png`;
      a.href = cv.toDataURL("image/png"); a.click();
      setNote("Team sheet downloaded ✓ — post it to the page & WhatsApp group.");
    }
    setBusy(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,3,8,0.78)", zIndex: 300, display: "grid", placeItems: "center", padding: 14, overflowY: "auto" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, background: "#0b0e18", border: "1px solid var(--line-gold)", borderRadius: 18, padding: 18 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <strong style={{ fontSize: 17 }}>📋 Team sheet</strong>
          <button className="btn ghost" style={{ padding: ".3rem .7rem" }} onClick={onClose}>✕</button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 12px" }}>{session.title}{session.session_date ? ` · ${session.session_date}` : ""} — {usingSquad ? "no RSVPs in yet, so the full squad is shown" : `${lineup.length} players are IN and line up on the pitch`}.</p>
        {preview
          ? <img src={preview} alt="Team sheet preview" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
          : <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>Drawing the team sheet…</div>}
        <button className="btn" style={{ width: "100%", marginTop: 14 }} onClick={download} disabled={busy}>{busy ? "Preparing…" : "⬇ Download team sheet (PNG)"}</button>
        {note && <p style={{ color: "var(--note)", fontSize: 13.5, margin: "10px 0 0" }}>{note}</p>}
      </div>
    </div>
  );
}
