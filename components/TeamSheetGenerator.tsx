"use client";
import { useCallback, useEffect, useState } from "react";

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

export default function TeamSheetGenerator({ session, players, onClose }: { session: any; players: any[]; onClose: () => void }) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const inIds = new Set((session.players || []).filter((p: any) => p.status === "in").map((p: any) => p.id));
  const lineup = inIds.size > 0 ? players.filter(p => inIds.has(p.id)) : players;
  const usingSquad = inIds.size === 0;

  const render = useCallback(async () => {
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d"); if (!ctx) return null;
    try { await (document as any).fonts.load('700 90px Oswald'); await (document as any).fonts.load('600 40px Oswald'); await (document as any).fonts.load('italic 400 30px Inter'); await (document as any).fonts.load('400 28px Inter'); } catch {}

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

    // ── backdrop: navy + pinstripes + crest watermark ──
    const crest = await loadImg("/assets/logo-transparent.png");
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.030)"; ctx.lineWidth = 5;
    for (let x = 30; x < W - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); }
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

    // ── header ──
    let y = 40;
    if (crest) { const cw = 104; ctx.drawImage(crest, (W - cw) / 2, y, cw, cw); y += cw + 26; }
    const kicker = "TEAM SHEET";
    ctx.font = "600 30px Oswald";
    const kw = ctx.measureText(kicker.split("").join("  ")).width + 64;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.fillStyle = "rgba(6,8,16,0.72)";
    ctx.beginPath(); (ctx as any).roundRect((W - kw) / 2, y, kw, 52, 26); ctx.fill(); ctx.stroke();
    center(kicker.split("").join("  "), y + 37, "600 30px Oswald", GOLD2);
    y += 52 + 26;
    center("THE BACHELORS FC", y + 62, `700 ${fit("THE BACHELORS FC", 920, 64)}px Oswald`, PAPER);
    y += 62 + 8;
    if (session.opponent) {
      const opp = `VS ${String(session.opponent).toUpperCase()}`;
      const os = fit(opp, 900, 46);
      center(opp, y + os, `700 ${os}px Oswald`, foil(W / 2 - 280, W / 2 + 280));
      y += os + 12;
    }
    const tm = fmtTime(session.session_time);
    const meta = [fmtDate(session.session_date), tm, session.ground].filter(Boolean).join("  ·  ");
    center(meta.toUpperCase(), y + 30, "400 27px Inter", MUTE);
    const chip = usingSquad ? "FULL SQUAD — RSVP STILL OPEN" : `✓ ${lineup.length} PLAYERS IN`;
    center(chip, y + 66, "600 24px Oswald", GOLD2);
    y += 84;

    // ── pitch ──
    const px = 70, pw = W - 140, py = y + 8, ph = 1086 - py;
    const pg = ctx.createLinearGradient(0, py, 0, py + ph);
    pg.addColorStop(0, "#20653c"); pg.addColorStop(1, "#17492b");
    ctx.fillStyle = pg;
    ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 22); ctx.fill();
    ctx.save();
    ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 22); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    const stripe = ph / 8;
    for (let i = 0; i < 8; i += 2) ctx.fillRect(px, py + i * stripe, pw, stripe);
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + pw, py + ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, py + ph / 2, 86, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(px + pw * 0.27, py, pw * 0.46, 74);
    ctx.strokeRect(px + pw * 0.27, py + ph - 74, pw * 0.46, 74);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 3;
    ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 22); ctx.stroke();

    // ── players on the pitch ──
    const groups: Record<string, any[]> = { FWD: [], MID: [], DEF: [], GK: [] };
    for (const p of lineup) { const k = String(p.position_code || "MID"); (groups[k] ?? groups.MID).push(p); }
    const rows: [string, number][] = [["FWD", 0.16], ["MID", 0.40], ["DEF", 0.64], ["GK", 0.88]];
    const photos = new Map<string, HTMLImageElement | null>();
    await Promise.all(lineup.map(async p => { photos.set(p.id, p.photo_url ? await loadImg(p.photo_url) : null); }));
    for (const [key, frac] of rows) {
      const arr = groups[key];
      const r = arr.length > 4 ? 46 : 54;
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
        // name pill
        const label = `${String(p.name).split(" ")[0].toUpperCase()} #${p.jersey_no}${p.is_captain ? " ©" : ""}`;
        ctx.font = "700 25px Oswald";
        const lw = ctx.measureText(label).width + 30;
        ctx.fillStyle = "rgba(4,10,6,0.78)";
        ctx.beginPath(); (ctx as any).roundRect(cx - lw / 2, cy + r + 10, lw, 38, 19); ctx.fill();
        ctx.font = "700 25px Oswald"; ctx.fillStyle = PAPER; ctx.textAlign = "center";
        ctx.fillText(label, cx, cy + r + 38); ctx.textAlign = "left";
      });
    }

    // ── footer ──
    center("Forged in Brotherhood, Driven by Purpose", 1152, "italic 400 29px Inter", MUTE);
    const url = "BACHELORS-FC.VERCEL.APP";
    ctx.font = "700 38px Oswald";
    const uw = ctx.measureText(url).width + 88;
    ctx.fillStyle = foil((W - uw) / 2, (W + uw) / 2);
    ctx.beginPath(); (ctx as any).roundRect((W - uw) / 2, 1176, uw, 70, 35); ctx.fill();
    center(url, 1176 + 48, "700 38px Oswald", "#0a0a12");
    center("U N I T E D ,  N O T  A L O N E", 1304, "600 22px Oswald", GOLD2);

    return cv;
  }, [session, lineup, usingSquad]);

  useEffect(() => {
    let live = true;
    setBusy(true);
    render().then(cv => {
      if (live && cv) setPreview(cv.toDataURL("image/jpeg", 0.88));
      if (live) setBusy(false);
    });
    return () => { live = false; };
  }, [render]);

  async function download() {
    setBusy(true); setNote("");
    const cv = await render();
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
