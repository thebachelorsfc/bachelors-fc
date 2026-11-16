"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import CapBadge from "@/components/CapBadge";

/* Build Your XI — fan toy on the real squad: pick a formation, tap a
   slot, choose from the actual players (one keeper in the club, so the
   GK slot only ever offers him), then download a navy-gold XI card in
   the same canvas language as the Share Card / matchday poster.
   Pure front-end: no accounts, no storage, nothing leaves the phone. */

type P = {
  id: string; name: string; jersey_no: number; position?: string;
  position_code?: string; photo_url?: string | null; is_captain?: boolean;
  goals?: number; assists?: number; motm?: number; matches_played?: number;
};
type Slot = { line: "GK" | "DEF" | "MID" | "FWD"; x: number; y: number };

const row = (line: Slot["line"], y: number, xs: number[]): Slot[] => xs.map(x => ({ line, x, y }));
const FORMATIONS: Record<string, Slot[]> = {
  "4-4-2": [...row("DEF", 71, [16, 38, 62, 84]), ...row("MID", 46, [14, 38, 62, 86]), ...row("FWD", 19, [36, 64]), ...row("GK", 89, [50])],
  "4-3-3": [...row("DEF", 71, [16, 38, 62, 84]), ...row("MID", 47, [26, 50, 74]), ...row("FWD", 19, [18, 50, 82]), ...row("GK", 89, [50])],
  "3-5-2": [...row("DEF", 71, [26, 50, 74]), ...row("MID", 46, [10, 30, 50, 70, 90]), ...row("FWD", 19, [36, 64]), ...row("GK", 89, [50])],
  "5-3-2": [...row("DEF", 71, [10, 30, 50, 70, 90]), ...row("MID", 47, [26, 50, 74]), ...row("FWD", 19, [36, 64]), ...row("GK", 89, [50])],
  "4-5-1": [...row("DEF", 71, [16, 38, 62, 84]), ...row("MID", 46, [10, 30, 50, 70, 90]), ...row("FWD", 19, [50]), ...row("GK", 89, [50])],
};
const GOLD = "#d4af37", GOLD2 = "#f0cb6e", PAPER = "#f7f5ef", MUTE = "#a8afc4";

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  try {
    const r = await fetch(src);
    if (!r.ok) return null;
    const url = URL.createObjectURL(await r.blob());
    const img = new window.Image();
    img.src = url;
    await img.decode();
    return img;
  } catch { return null; }
}

export default function YourXi({ players }: { players: P[] }) {
  const [formation, setFormation] = useState("4-3-3");
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [active, setActive] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const slots = FORMATIONS[formation];
  const byId = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const used = useMemo(() => new Set(Object.values(picks)), [picks]);
  const pickedCount = Object.keys(picks).length;
  const complete = pickedCount === 11;

  const eligible = (slotIdx: number): P[] => {
    const line = slots[slotIdx].line;
    return players.filter(p => {
      if (picks[slotIdx] === p.id) return true;
      if (used.has(p.id)) return false;
      return line === "GK" ? p.position_code === "GK" : p.position_code !== "GK";
    });
  };

  const chooseFormation = (f: string) => { setFormation(f); setPicks({}); setActive(null); setNote(""); };
  const pick = (slotIdx: number, id: string) => { setPicks(prev => ({ ...prev, [slotIdx]: id })); setActive(null); setNote(""); };
  const removePick = (slotIdx: number) => {
    setPicks(prev => { const n = { ...prev }; delete n[slotIdx]; return n; });
    setActive(null);
  };
  const clearAll = () => { setPicks({}); setActive(null); setNote(""); };

  const score = (p: P) => (p.goals ?? 0) * 3 + (p.assists ?? 0) * 2 + (p.motm ?? 0) * 4 + (p.matches_played ?? 0);
  const autoFill = () => {
    const next: Record<number, string> = {};
    let pool = players.filter(p => p.position_code !== "GK");
    slots.forEach((s, i) => { if (s.line === "GK") { const gk = players.find(p => p.position_code === "GK"); if (gk) next[i] = gk.id; } });
    (["DEF", "MID", "FWD"] as const).forEach(line => {
      const idxs = slots.map((s, i) => (s.line === line ? i : -1)).filter(i => i >= 0);
      const naturals = pool.filter(p => p.position_code === line).sort((a, b) => score(b) - score(a));
      const others = pool.filter(p => p.position_code !== line).sort((a, b) => score(b) - score(a));
      const ordered = [...naturals, ...others];
      idxs.forEach((slotIdx, k) => { const p = ordered[k]; if (p) { next[slotIdx] = p.id; pool = pool.filter(q => q.id !== p.id); } });
    });
    setPicks(next); setActive(null); setNote("Auto-picked by form — goals, assists, MOTM and matches. Swap anyone you like!");
  };

  const xiName = () => (teamName.trim() || "MY BACHELORS XI").toUpperCase().slice(0, 28);
  const lineNames = (line: string) =>
    slots.map((s, i) => (s.line === line && picks[i] ? byId.get(picks[i]) : undefined))
      .filter(Boolean)
      .map(p => `${(p as P).name}${(p as P).is_captain ? " ©" : ""}`)
      .join(", ");

  const copyList = async () => {
    const text = `⚽ ${xiName()} (${formation})\nGK: ${lineNames("GK")}\nDEF: ${lineNames("DEF")}\nMID: ${lineNames("MID")}\nFWD: ${lineNames("FWD")}\n\nBuild yours: bachelors-fc.vercel.app/your-xi`;
    try { await navigator.clipboard.writeText(text); setNote("Team list copied ✓ — paste it anywhere!"); }
    catch { setNote("Copy didn't work on this browser — the download card has everything on it."); }
  };

  async function downloadCard() {
    if (!complete) return;
    setBusy(true); setNote("");
    try {
      const W = 1080, H = 1350;
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      try {
        await (document as any).fonts.load('400 90px Anton'); await (document as any).fonts.load('700 40px Oswald');
        await (document as any).fonts.load('600 30px Oswald'); await (document as any).fonts.load('italic 400 28px Inter');
      } catch {}
      const foil = (x0: number, x1: number) => {
        const fg = ctx.createLinearGradient(x0, 0, x1, 0);
        fg.addColorStop(0, "#8f6f14"); fg.addColorStop(0.35, GOLD2); fg.addColorStop(0.55, "#fff2b0"); fg.addColorStop(0.8, GOLD); fg.addColorStop(1, "#8f6f14");
        return fg;
      };
      const center = (text: string, y: number, font: string, fill: string | CanvasGradient) => {
        ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = "center"; ctx.fillText(text, W / 2, y); ctx.textAlign = "left";
      };
      const crest = await loadImg("/assets/logo-transparent.png");
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d173f"); g.addColorStop(0.55, "#0a1230"); g.addColorStop(1, "#05060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (crest) { ctx.globalAlpha = 0.06; const cw = 760; ctx.drawImage(crest, (W - cw) / 2, 560, cw, cw); ctx.globalAlpha = 1; }
      const glow = ctx.createRadialGradient(W / 2, 200, 40, W / 2, 200, 520);
      glow.addColorStop(0, "rgba(212,175,55,0.15)"); glow.addColorStop(1, "rgba(212,175,55,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 760);
      ctx.strokeStyle = GOLD; ctx.globalAlpha = 0.85; ctx.lineWidth = 3;
      ctx.beginPath(); (ctx as any).roundRect(7, 7, W - 14, H - 14, 36); ctx.stroke();
      ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
      ctx.beginPath(); (ctx as any).roundRect(20, 20, W - 40, H - 40, 28); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = GOLD;
      [[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]].forEach(([cx, cy]) => {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4); ctx.globalAlpha = 0.55; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
      });
      ctx.globalAlpha = 1;

      if (crest) { const cw = 116; ctx.drawImage(crest, (W - cw) / 2, 46, cw, cw); }
      center("THE BACHELORS FC".split("").join(" "), 208, "600 29px Oswald", GOLD2);
      let ts = 86; const tn = xiName();
      ctx.font = `400 ${ts}px Anton`;
      while (ctx.measureText(tn).width > 920 && ts > 40) { ts -= 4; ctx.font = `400 ${ts}px Anton`; }
      const tw = ctx.measureText(tn).width;
      ctx.fillStyle = foil(W / 2 - tw / 2, W / 2 + tw / 2); ctx.textAlign = "center";
      ctx.fillText(tn, W / 2, 300); ctx.textAlign = "left";
      center(`FORMATION ${formation}`, 348, "600 25px Oswald", MUTE);

      // ── the pitch ──
      const px = 70, py = 392, pw = W - 140, ph = 692;
      const pg = ctx.createLinearGradient(0, py, 0, py + ph);
      pg.addColorStop(0, "#216840"); pg.addColorStop(1, "#17492b");
      ctx.fillStyle = pg;
      ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 26); ctx.fill();
      ctx.save();
      ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 26); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      for (let i = 0; i < 6; i += 2) ctx.fillRect(px, py + (ph / 6) * i, pw, ph / 6);
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + pw, py + ph / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(px + pw / 2, py + ph / 2, 74, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(px + pw * 0.27, py, pw * 0.46, 74);
      ctx.strokeRect(px + pw * 0.27, py + ph - 74, pw * 0.46, 74);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 3;
      ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 26); ctx.stroke();

      const photos = new Map<string, HTMLImageElement | null>();
      await Promise.all(players.map(async p => { if (p.photo_url) photos.set(p.id, await loadImg(p.photo_url)); }));
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i]; const p = byId.get(picks[i]); if (!p) continue;
        const cx = px + (s.x / 100) * pw, cy = py + (s.y / 100) * ph, r = 45;
        const photo = photos.get(p.id);
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        if (photo) {
          const sc = Math.max((2 * r) / photo.width, (2 * r) / photo.height);
          ctx.drawImage(photo, cx - (photo.width * sc) / 2, cy - (photo.height * sc) / 2, photo.width * sc, photo.height * sc);
        } else {
          ctx.fillStyle = "#0a1230"; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
          ctx.font = "700 32px Oswald"; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
          ctx.fillText(`#${p.jersey_no}`, cx, cy + 12); ctx.textAlign = "left";
        }
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = p.is_captain ? foil(cx - r, cx + r) : GOLD2; ctx.lineWidth = p.is_captain ? 6 : 3.5; ctx.stroke();
        if (p.is_captain) {
          ctx.beginPath(); ctx.arc(cx + r - 4, cy - r + 4, 15, 0, Math.PI * 2);
          ctx.fillStyle = "#0a1230"; ctx.fill();
          ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.font = "700 19px Oswald"; ctx.fillStyle = GOLD2; ctx.textAlign = "center";
          ctx.fillText("©", cx + r - 4, cy - r + 11); ctx.textAlign = "left";
        }
        ctx.font = "600 24px Oswald"; ctx.fillStyle = PAPER; ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 5;
        ctx.fillText(`${String(p.name).split(" ")[0]} #${p.jersey_no}`, cx, cy + r + 30);
        ctx.shadowBlur = 0; ctx.textAlign = "left";
      }

      center("Forged in Brotherhood, Driven by Purpose", 1168, "italic 400 28px Inter", MUTE);
      const url = "BACHELORS-FC.VERCEL.APP/YOUR-XI";
      ctx.font = "700 34px Oswald";
      const uw = ctx.measureText(url).width + 84;
      ctx.fillStyle = foil((W - uw) / 2, (W + uw) / 2);
      ctx.beginPath(); (ctx as any).roundRect((W - uw) / 2, 1196, uw, 64, 32); ctx.fill();
      center(url, 1196 + 44, "700 34px Oswald", "#0a0a12");

      const a = document.createElement("a");
      a.download = `bfc-your-xi-${formation}.png`;
      a.href = cv.toDataURL("image/png"); a.click();
      setNote("XI card downloaded ✓ — post it and tag the page!");
    } catch { setNote("The card didn't render — try again."); }
    setBusy(false);
  }

  return (
    <div>
      <div className="xi-formations" role="group" aria-label="Choose a formation">
        {Object.keys(FORMATIONS).map(f => (
          <button key={f} className={`xi-fbtn${f === formation ? " on" : ""}`} onClick={() => chooseFormation(f)}>{f}</button>
        ))}
      </div>

      <div className="xi-pitch">
        <span className="pitch-line pitch-half" />
        <span className="pitch-circle" />
        <span className="pitch-box pitch-box-t" />
        <span className="pitch-box pitch-box-b" />
        {slots.map((s, i) => {
          const p = picks[i] ? byId.get(picks[i]) : undefined;
          return (
            <button key={i} className={`xi-slot${active === i ? " active" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={() => setActive(active === i ? null : i)} aria-label={p ? `Change ${s.line} player ${p.name}` : `Pick a ${s.line} player`}>
              <span className={`xi-disc${p ? " filled" : ""}${p?.is_captain ? " cap" : ""}`}>
                {p ? (p.photo_url
                  ? <Image src={p.photo_url} alt={p.name} width={54} height={54} />
                  : <span className="num">#{p.jersey_no}</span>)
                  : "+"}
              </span>
              <span className="xi-sname">{p ? `${String(p.name).split(" ")[0]} #${p.jersey_no}` : ""}</span>
              <span className="xi-sline">{p ? (p.is_captain ? "CAPTAIN" : s.line) : s.line}</span>
            </button>
          );
        })}
      </div>

      <div className="xi-progress" aria-hidden="true"><i style={{ width: `${(pickedCount / 11) * 100}%` }} /></div>
      <p style={{ textAlign: "center", color: "var(--muted)", margin: "10px 0 0", fontWeight: 600 }}>
        {complete ? "That's a full XI — download your card! 🏆" : `${pickedCount} / 11 picked — tap a spot on the pitch`}
      </p>

      {active !== null && (
        <div className="card xi-picker">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>Pick your {slots[active].line === "GK" ? "goalkeeper" : slots[active].line === "DEF" ? "defender" : slots[active].line === "MID" ? "midfielder" : "forward"}</h3>
            <span style={{ display: "flex", gap: 8 }}>
              {picks[active] && <button className="btn ghost xi-small" onClick={() => removePick(active)}>Remove</button>}
              <button className="btn ghost xi-small" onClick={() => setActive(null)}>Close</button>
            </span>
          </div>
          {slots[active].line === "GK" && <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>One keeper in this club — the net is his. 🧤</p>}
          <div className="xi-pgrid">
            {eligible(active).map(p => (
              <button key={p.id} className="xi-pick" onClick={() => pick(active, p.id)}>
                {p.photo_url
                  ? <Image src={p.photo_url} alt={p.name} width={38} height={38} />
                  : <span className="xi-pfb">#{p.jersey_no}</span>}
                <span>
                  <b>{p.name}{p.is_captain ? <CapBadge /> : null}</b>
                  <small>#{p.jersey_no} · {p.position}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <label htmlFor="xi-name" style={{ color: "var(--label)", fontWeight: 600, fontSize: 14 }}>Name your XI (optional)</label>
        <input id="xi-name" className="xi-namein" style={{ marginTop: 8 }} maxLength={28} placeholder="e.g. The Unmarried XI"
          value={teamName} onChange={e => setTeamName(e.target.value)} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button className="btn ghost" onClick={autoFill}>✨ Auto-pick by form</button>
          <button className="btn ghost" onClick={clearAll}>Clear</button>
          <button className="btn" onClick={downloadCard} disabled={!complete || busy}>{busy ? "Designing…" : "📸 Download XI Card"}</button>
          {complete && <button className="btn ghost" onClick={copyList}>Copy team list</button>}
        </div>
        {note && <p style={{ color: "var(--note)", fontSize: 13.5, margin: "10px 0 0" }}>{note}</p>}
      </div>
    </div>
  );
}
