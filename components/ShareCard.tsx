"use client";
import { useState } from "react";

/* Share Card — dashboard button that renders the player's own FIFA-style
   card as a 1080×1920 Story PNG (photo, foil name, season stats, rating
   bars) so he can post it to Facebook / WhatsApp status. Same navy-gold
   canvas language as the membership card and the matchday poster. */

const GOLD = "#d4af37";
const GOLD2 = "#f0cb6e";
const PAPER = "#f7f5ef";
const MUTE = "#a8afc4";

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

export default function ShareCard({ player }: { player: any }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function build() {
    setBusy(true); setNote("");
    try {
      const W = 1080, H = 1920;
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d"); if (!ctx) return;
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
        while (ctx.measureText(text).width > maxW && s > 34) { s -= 4; ctx.font = `${weight} ${s}px Oswald`; }
        return s;
      };

      // ── backdrop ──
      const crest = await loadImg("/assets/logo-transparent.png");
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (crest) { ctx.globalAlpha = 0.07; const cw = 820; ctx.drawImage(crest, (W - cw) / 2, 700, cw, cw); ctx.globalAlpha = 1; }
      ctx.strokeStyle = "rgba(255,255,255,0.030)"; ctx.lineWidth = 5;
      for (let x = 30; x < W - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); }
      const glow = ctx.createRadialGradient(W / 2, 240, 40, W / 2, 240, 520);
      glow.addColorStop(0, "rgba(212,175,55,0.16)"); glow.addColorStop(1, "rgba(212,175,55,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 800);
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
      if (crest) { const cw = 138; ctx.drawImage(crest, (W - cw) / 2, 62, cw, cw); }
      center("THE BACHELORS FC".split("").join("  "), 268, "600 30px Oswald", GOLD2);

      // ── photo ──
      const photo = player.photo_url ? await loadImg(player.photo_url) : null;
      const pcx = W / 2, pcy = 590, pr = 212;
      ctx.save();
      ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.clip();
      if (photo) {
        const s = Math.max((2 * pr) / photo.width, (2 * pr) / photo.height);
        ctx.drawImage(photo, pcx - (photo.width * s) / 2, pcy - (photo.height * s) / 2, photo.width * s, photo.height * s);
      } else {
        ctx.fillStyle = "#101c48"; ctx.fillRect(pcx - pr, pcy - pr, 2 * pr, 2 * pr);
        ctx.font = "700 120px Oswald"; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
        ctx.fillText(`#${player.jersey_no}`, pcx, pcy + 44); ctx.textAlign = "left";
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
      ctx.strokeStyle = foil(pcx - pr, pcx + pr); ctx.lineWidth = 9; ctx.stroke();
      ctx.beginPath(); ctx.arc(pcx, pcy, pr + 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212,175,55,0.35)"; ctx.lineWidth = 2; ctx.stroke();

      // ── name (+ captain badge) ──
      const name = String(player.name || "Player").toUpperCase();
      const ns = fit(name, 880, 102);
      ctx.font = `700 ${ns}px Oswald`;
      const nw = ctx.measureText(name).width;
      ctx.fillStyle = foil(W / 2 - nw / 2, W / 2 + nw / 2); ctx.textAlign = "center";
      ctx.fillText(name, W / 2, 952); ctx.textAlign = "left";
      if (player.is_captain) {
        const br = Math.round(ns * 0.34), bx = W / 2 + nw / 2 + br + 18, by = 952 - ns * 0.35;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = "#0a1230"; ctx.fill();
        ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.stroke();
        ctx.font = `700 ${Math.round(br * 1.15)}px Oswald`; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
        ctx.fillText("©", bx, by + br * 0.42); ctx.textAlign = "left";
      }
      center(`#${player.jersey_no} · ${String(player.position || "").toUpperCase()}`, 1018, "600 40px Oswald", PAPER);

      // ── stat tiles ──
      const isGk = String(player.position_code || "").toUpperCase() === "GK";
      const tiles: [string, number][] = isGk
        ? [["MATCHES", player.matches_played ?? 0], ["CLEAN SHEETS", player.clean_sheets ?? 0], ["SAVES", player.saves ?? 0]]
        : [["MATCHES", player.matches_played ?? 0], ["GOALS", player.goals ?? 0], ["ASSISTS", player.assists ?? 0]];
      const tw = 280, th = 168, gap = 20, tx0 = (W - (3 * tw + 2 * gap)) / 2, ty = 1084;
      tiles.forEach(([label, val], i) => {
        const x = tx0 + i * (tw + gap);
        ctx.fillStyle = "rgba(5,7,14,0.58)"; ctx.strokeStyle = "rgba(212,175,55,0.38)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); (ctx as any).roundRect(x, ty, tw, th, 20); ctx.fill(); ctx.stroke();
        ctx.font = "700 68px Oswald"; ctx.fillStyle = PAPER; ctx.textAlign = "center";
        ctx.fillText(String(val), x + tw / 2, ty + 84); ctx.textAlign = "left";
        ctx.font = "600 21px Oswald"; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
        ctx.fillText(label.split("").join(" "), x + tw / 2, ty + 128); ctx.textAlign = "left";
      });

      // ── chips: MOTM + preferred foot ──
      const chips: string[] = [];
      if ((player.motm ?? 0) > 0) chips.push(`🏆 MOTM ×${player.motm}`);
      if (player.preferred_foot) chips.push(`${String(player.preferred_foot).toUpperCase()} FOOT`);
      if (chips.length) {
        ctx.font = "600 27px Oswald";
        const widths = chips.map(c => ctx.measureText(c).width + 52);
        const total = widths.reduce((a, b) => a + b, 0) + (chips.length - 1) * 16;
        let cxp = (W - total) / 2;
        chips.forEach((c, i) => {
          ctx.fillStyle = "rgba(212,175,55,0.14)"; ctx.strokeStyle = "rgba(212,175,55,0.55)"; ctx.lineWidth = 1.4;
          ctx.beginPath(); (ctx as any).roundRect(cxp, 1296, widths[i], 52, 26); ctx.fill(); ctx.stroke();
          ctx.font = "600 27px Oswald"; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
          ctx.fillText(c, cxp + widths[i] / 2, 1296 + 37); ctx.textAlign = "left";
          cxp += widths[i] + 16;
        });
      }

      // ── rating bars ──
      const bars: [string, number][] = [["PASSING", player.passing ?? 0], ["PASSION", player.passion ?? 0], ["SPEED", player.speed ?? 0]];
      let by = 1446;
      for (const [label, val] of bars) {
        ctx.font = "600 27px Oswald"; ctx.fillStyle = MUTE; ctx.textAlign = "left";
        ctx.fillText(label.split("").join(" "), 100, by + 8);
        ctx.fillStyle = "rgba(255,255,255,0.13)";
        ctx.beginPath(); (ctx as any).roundRect(320, by - 14, 540, 20, 10); ctx.fill();
        if (val > 0) {
          ctx.fillStyle = foil(320, 860);
          ctx.beginPath(); (ctx as any).roundRect(320, by - 14, Math.max(20, (540 * val) / 100), 20, 10); ctx.fill();
        }
        ctx.font = "700 32px Oswald"; ctx.fillStyle = PAPER; ctx.textAlign = "right";
        ctx.fillText(String(val), 972, by + 8); ctx.textAlign = "left";
        by += 88;
      }

      // ── footer ──
      center("Forged in Brotherhood, Driven by Purpose", 1786, "italic 400 30px Inter", MUTE);
      const url = "BACHELORS-FC.VERCEL.APP";
      ctx.font = "700 38px Oswald";
      const uw = ctx.measureText(url).width + 88;
      ctx.fillStyle = foil((W - uw) / 2, (W + uw) / 2);
      ctx.beginPath(); (ctx as any).roundRect((W - uw) / 2, 1812, uw, 70, 35); ctx.fill();
      center(url, 1812 + 48, "700 38px Oswald", "#0a0a12");

      const a = document.createElement("a");
      a.download = `bfc-card-${String(player.name || "player").toLowerCase().replace(/\s+/g, "-")}.png`;
      a.href = cv.toDataURL("image/png"); a.click();
      setNote("Card downloaded ✓ — post it to your Facebook / WhatsApp status!");
    } catch { setNote("The card didn't render — try again."); }
    setBusy(false);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button className="btn ghost" style={{ width: "100%" }} onClick={build} disabled={busy}>{busy ? "Designing your card…" : "📸 Share Card — Story Image (PNG)"}</button>
      {note && <p style={{ color: "var(--note)", fontSize: 13.5, margin: "8px 0 0" }}>{note}</p>}
    </div>
  );
}
