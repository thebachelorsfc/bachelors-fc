"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/* Digital Membership Card — shown on the player dashboard (approved + linked players only).
   Stays dark in both themes (like the stat cards). Download renders the same card to a
   1260×795 PNG on a canvas: photo is fetched as a blob so the canvas never taints. */

const SITE = "https://bachelors-fc.vercel.app";
const GOLD = "#d4af37";
const GOLD2 = "#f0cb6e";
const PAPER = "#f7f5ef";
const MUTE = "#a8afc4";
const NAVY = "#0a1230";

export function memberId(player: any): string {
  return `BFC-${player?.joined_year ?? 2026}-${String(player?.jersey_no ?? 0).padStart(2, "0")}`;
}

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function MemberCard({ player }: { player: any }) {
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const id = memberId(player);

  useEffect(() => {
    QRCode.toDataURL(`${SITE}/squad`, { width: 260, margin: 1, color: { dark: "#0a0a12", light: "#ffffff" } })
      .then(setQr).catch(() => setQr(""));
  }, []);

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

  async function download() {
    setBusy(true); setNote("");
    try {
      const W = 1260, H = 795;
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d"); if (!ctx) throw new Error("canvas");
      try { await (document as any).fonts.load('700 92px Oswald'); await (document as any).fonts.load('600 40px Oswald'); await (document as any).fonts.load('400 32px Inter'); } catch {}

      // background
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, NAVY); g.addColorStop(1, "#05060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // gold frame
      ctx.strokeStyle = GOLD; ctx.globalAlpha = 0.85; ctx.lineWidth = 3;
      ctx.beginPath(); (ctx as any).roundRect(7, 7, W - 14, H - 14, 36); ctx.stroke();
      ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
      ctx.beginPath(); (ctx as any).roundRect(20, 20, W - 40, H - 40, 28); ctx.stroke();
      ctx.globalAlpha = 1;

      const crest = await loadImg("/assets/logo-transparent.png");
      // faint watermark crest, right-centre
      if (crest) { ctx.globalAlpha = 0.07; ctx.drawImage(crest, 620, 130, 560, 560); ctx.globalAlpha = 1; }

      // photo panel (left, full height, cover-cropped), clipped to card radius
      ctx.save();
      ctx.beginPath(); (ctx as any).roundRect(0, 0, 416, H, [40, 0, 0, 40]); ctx.clip();
      const photo = player.photo_url ? await loadImg(player.photo_url) : null;
      if (photo) {
        const s = Math.max(416 / photo.width, H / photo.height);
        const w = photo.width * s, h = photo.height * s;
        ctx.drawImage(photo, (416 - w) / 2, (H - h) / 2, w, h);
      } else {
        ctx.fillStyle = "#101c48"; ctx.fillRect(0, 0, 416, H);
        ctx.fillStyle = GOLD2; ctx.font = "700 150px Oswald"; ctx.textAlign = "center";
        ctx.fillText(initials(player.name), 208, H / 2 + 40); ctx.textAlign = "left";
      }
      const sg = ctx.createLinearGradient(0, H - 300, 0, H);
      sg.addColorStop(0, "rgba(4,5,10,0)"); sg.addColorStop(1, "rgba(4,5,10,0.88)");
      ctx.fillStyle = sg; ctx.fillRect(0, 0, 416, H);
      ctx.fillStyle = GOLD2; ctx.font = "700 96px Oswald";
      ctx.fillText(`#${player.jersey_no}`, 36, H - 44);
      ctx.restore();

      // header: crest + club name
      if (crest) ctx.drawImage(crest, 452, 46, 92, 92);
      ctx.fillStyle = PAPER; ctx.font = "700 43px Oswald";
      ctx.fillText("THE BACHELORS FC", 562, 88);
      ctx.fillStyle = GOLD2; ctx.font = "600 25px Oswald";
      ctx.fillText("O F F I C I A L   M E M B E R   C A R D", 562, 124);

      // name (shrink to fit)
      let size = 88;
      ctx.font = `700 ${size}px Oswald`;
      while (ctx.measureText(player.name.toUpperCase()).width > 740 && size > 40) { size -= 6; ctx.font = `700 ${size}px Oswald`; }
      ctx.fillStyle = PAPER;
      ctx.fillText(player.name.toUpperCase(), 452, 268);
      ctx.fillStyle = GOLD; ctx.fillRect(452, 292, 120, 5);

      // detail rows
      const rows: [string, string][] = [
        ["POSITION", `${player.position} (${player.position_code})`],
        ["MEMBER SINCE", String(player.joined_year ?? 2026)],
        ["STATUS", "ACTIVE MEMBER"],
      ];
      rows.forEach(([k, v], i) => {
        const y = 372 + i * 78;
        ctx.fillStyle = GOLD2; ctx.font = "600 24px Oswald"; ctx.fillText(k, 452, y);
        ctx.fillStyle = PAPER; ctx.font = "600 37px Oswald"; ctx.fillText(v, 452, y + 40);
      });

      // motto + member id
      ctx.fillStyle = MUTE; ctx.font = "italic 400 27px Inter";
      ctx.fillText("Forged in Brotherhood, Driven by Purpose", 452, 668);
      ctx.fillStyle = GOLD2; ctx.font = "600 33px monospace";
      ctx.fillText(id, 452, 716);

      // QR bottom-right
      if (qr) {
        const qi = new Image(); qi.src = qr; await qi.decode();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); (ctx as any).roundRect(1052, 566, 168, 168, 14); ctx.fill();
        ctx.drawImage(qi, 1060, 574, 152, 152);
      }

      const a = document.createElement("a");
      a.download = `bfc-member-card-${player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.href = cv.toDataURL("image/png"); a.click();
      setNote("Card downloaded ✓ — check your downloads/photos.");
    } catch {
      setNote("Download didn't work on this browser — a screenshot of the card works just as well.");
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="mcard">
        <div className="mcard-photo">
          {player.photo_url
            ? <img src={player.photo_url} alt={player.name} />
            : <span className="mcard-initials">{initials(player.name)}</span>}
          <span className="mcard-no">#{player.jersey_no}</span>
        </div>
        <div className="mcard-body">
          <div className="mcard-head">
            <img src="/assets/logo-transparent.png" alt="BFC crest" />
            <div>
              <strong>THE BACHELORS FC</strong>
              <span>OFFICIAL MEMBER CARD</span>
            </div>
          </div>
          <h3 className="mcard-name">{player.name}</h3>
          <div className="mcard-rows">
            <p><span>Position</span><strong>{player.position} ({player.position_code})</strong></p>
            <p><span>Member since</span><strong>{player.joined_year ?? 2026}</strong></p>
            <p><span>Status</span><strong>Active Member</strong></p>
          </div>
          <div className="mcard-foot">
            <div>
              <em>Forged in Brotherhood, Driven by Purpose</em>
              <strong className="mcard-id">{id}</strong>
            </div>
            {qr && <img className="mcard-qr" src={qr} alt="QR to the club website" />}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
        <button className="btn" onClick={download} disabled={busy}>{busy ? "Preparing…" : "⬇ Download card (PNG)"}</button>
        {note && <span style={{ color: "var(--note)", fontSize: 14 }}>{note}</span>}
      </div>
    </div>
  );
}
