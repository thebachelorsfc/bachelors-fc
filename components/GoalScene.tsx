"use client";
import { useEffect, useRef } from "react";

// Footer goal scene (owner, 2026-10-31): a looping canvas vignette in the
// spirit of unseenbangladesh.com's bottom strip — one BFC player in gold
// dribbles past three opponents, scores, and celebrates. It sits in the
// footer ABOVE the social medallion bar (the bar below stays fully
// clickable — this is a plain block, never an overlay). Flat chalk-style
// figures on the stays-dark navy band; pauses off-screen and honours
// prefers-reduced-motion with a still celebration frame.
const W = 1200, H = 300, GY = 252, LOOP = 9.6;
const GOLD = "#e8c766", GOLD_D = "#c9a227", PAPER = "#f7f5ef", OPP = "#7e8db0", OPP_D = "#5b6a8c";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => p * p * (3 - 2 * p);

type Pt = { x: number; y: number };
function limb(ctx: CanvasRenderingContext2D, from: Pt, angle: number, l1: number, bend: number, l2: number) {
  const knee = { x: from.x + Math.sin(angle) * l1, y: from.y + Math.cos(angle) * l1 };
  const a2 = angle + bend;
  const foot = { x: knee.x + Math.sin(a2) * l2, y: knee.y + Math.cos(a2) * l2 };
  ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); ctx.stroke();
  return foot;
}

function figure(ctx: CanvasRenderingContext2D, x: number, baseY: number, o: {
  kit: string; dark: string; phase?: number; mode: "run" | "idle" | "celebrate" | "kick";
  fall?: number; lean?: number; bounce?: number;
}) {
  const fall = o.fall ?? 0, bounce = o.bounce ?? 0;
  ctx.save();
  ctx.translate(x, baseY);
  if (fall > 0) ctx.rotate(-fall * 1.9);
  ctx.translate(-x, -baseY);
  const by = baseY - bounce;
  const hip = { x: x + (o.lean ?? 0) * 6, y: by - 30 };
  const neck = { x: hip.x + (o.lean ?? 0) * 4, y: by - 52 };
  const shoulder = { x: neck.x, y: neck.y + 4 };
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // legs
  ctx.strokeStyle = o.dark; ctx.lineWidth = 6;
  if (o.mode === "run") {
    const p = o.phase ?? 0;
    limb(ctx, hip, Math.sin(p) * 0.85, 15, -0.5 - Math.max(0, -Math.cos(p)) * 0.7, 15);
    limb(ctx, hip, Math.sin(p + Math.PI) * 0.85, 15, -0.5 - Math.max(0, Math.cos(p)) * 0.7, 15);
  } else if (o.mode === "kick") {
    limb(ctx, hip, -0.25, 15, -0.15, 15);
    ctx.strokeStyle = o.dark;
    limb(ctx, hip, 1.25, 15, 0.35, 16);
  } else if (o.mode === "celebrate") {
    limb(ctx, hip, 0.16, 15, -0.1, 15);
    limb(ctx, hip, -0.16, 15, -0.1, 15);
  } else { // idle — ready stance
    limb(ctx, hip, 0.3, 15, -0.35, 15);
    limb(ctx, hip, -0.3, 15, -0.35, 15);
  }
  // torso
  ctx.strokeStyle = o.kit; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(neck.x, neck.y); ctx.stroke();
  // arms
  ctx.strokeStyle = o.kit; ctx.lineWidth = 5.5;
  if (o.mode === "run") {
    const p = o.phase ?? 0;
    limb(ctx, shoulder, Math.sin(p + Math.PI) * 0.7 + 0.15, 12, -0.7, 11);
    limb(ctx, shoulder, Math.sin(p) * 0.7 + 0.15, 12, -0.7, 11);
  } else {
    limb(ctx, shoulder, 0.55, 12, -0.5, 11);
    limb(ctx, shoulder, -0.55, 12, -0.5, 11);
  }
  // head
  ctx.fillStyle = o.kit;
  ctx.beginPath(); ctx.arc(neck.x + (o.lean ?? 0) * 2, neck.y - 9, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function celebrateArms(ctx: CanvasRenderingContext2D, x: number, by: number, kit: string) {
  // Both arms raised in a V — drawn explicitly for the celebration pose.
  const shoulder = { x, y: by - 48 };
  ctx.strokeStyle = kit; ctx.lineWidth = 5.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(shoulder.x, shoulder.y); ctx.lineTo(shoulder.x - 11, shoulder.y - 12); ctx.lineTo(shoulder.x - 15, shoulder.y - 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(shoulder.x, shoulder.y); ctx.lineTo(shoulder.x + 11, shoulder.y - 12); ctx.lineTo(shoulder.x + 15, shoulder.y - 24); ctx.stroke();
}

function drawScene(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, W, H);
  // pitch: faint mowing stripes + chalk touchline
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "rgba(232,199,102,0.025)" : "rgba(247,245,239,0.02)"; ctx.fillRect(i * 200, 208, 200, 62); }
  ctx.strokeStyle = "rgba(247,245,239,0.35)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
  ctx.strokeStyle = "rgba(247,245,239,0.14)";
  ctx.beginPath(); ctx.moveTo(1010, GY - 108); ctx.lineTo(1010, GY); ctx.stroke(); // box line edge

  // goal (side view): front post x=1052, back post x=1176
  const netBulge = t > 4.95 && t < 5.9 ? Math.sin((t - 4.95) / 0.95 * Math.PI) * 13 : 0;
  ctx.strokeStyle = "rgba(247,245,239,0.30)"; ctx.lineWidth = 1.4;
  for (let i = 0; i <= 4; i++) { const y = GY - 96 + i * 24; ctx.beginPath(); ctx.moveTo(1052, y); ctx.lineTo(1176, y + 8); ctx.stroke(); }
  for (let i = 0; i <= 5; i++) { const x = 1052 + i * 25; ctx.beginPath(); ctx.moveTo(x, GY - 96 + (x - 1052) * 0.065 + netBulge * (i / 5)); ctx.lineTo(x, GY); ctx.stroke(); }
  ctx.strokeStyle = PAPER; ctx.lineWidth = 4.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(1052, GY); ctx.lineTo(1052, GY - 96); ctx.lineTo(1176, GY - 88); ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(1176, GY - 88); ctx.lineTo(1176, GY); ctx.stroke();

  // hero path — run, shoot, celebrate
  const opps = [395, 615, 835];
  let heroX: number, heroMode: "run" | "celebrate" | "kick" | "idle" = "run", phase = t * 9.5, bounce = 0, ball: Pt, ballRoll = t * 7;
  if (t < 4.2) {
    const p = ease(t / 4.2 * 0.999);
    heroX = lerp(80, 902, p);
    ball = { x: heroX + 27 + Math.sin(t * 9.5) * 4, y: GY - 8 - Math.abs(Math.sin(t * 9.5)) * 3.5 };
  } else if (t < 4.5) {
    heroX = 902; heroMode = "kick"; phase = 0;
    ball = { x: 928, y: GY - 8 };
  } else if (t < 4.98) {
    heroX = 902; heroMode = "idle"; phase = 0;
    const p = (t - 4.5) / 0.48;
    ball = { x: lerp(928, 1086, p), y: lerp(GY - 8, GY - 74, p) - Math.sin(p * Math.PI) * 14 };
    ballRoll = t * 22;
  } else if (t < 5.35) {
    heroX = 902; heroMode = "idle";
    const p = (t - 4.98) / 0.37;
    ball = { x: lerp(1086, 1096, p), y: lerp(GY - 74, GY - 8, p * p) };
  } else {
    ball = { x: 1096, y: GY - 8 };
    const ct = t - 5.35;
    heroX = ct < 0.8 ? lerp(902, 958, ease(ct / 0.8)) : 958;
    heroMode = "celebrate";
    bounce = ct < 0.8 ? Math.abs(Math.sin(ct * 10)) * 4 : Math.abs(Math.sin((ct - 0.8) * 4.6)) * 15;
    phase = ct * 9.5;
  }

  // opponents — lunge as he nears, fall as he passes, dust on landing.
  // Crossing times come from inverting the hero's eased run so a fall, once
  // started, runs to completion and stays down through the celebration.
  for (const ox of opps) {
    const d = heroX - ox;
    let crossT = 4.2;
    for (let p = 0; p <= 1.0001; p += 0.002) { if (ease(p) >= (ox - 76) / 822) { crossT = p * 4.2; break; } }
    const fallLive = t > crossT ? clamp((t - crossT) / 0.5, 0, 1) : 0;
    const lean = d < 0 && d > -130 ? clamp(-d / 130, 0, 1) * 0.8 : 0;
    figure(ctx, ox, GY, { kit: OPP, dark: OPP_D, mode: "idle", fall: fallLive, lean: -lean });
    if (fallLive > 0.75 && fallLive < 1) { // dust puff while landing
      ctx.fillStyle = "rgba(247,245,239,0.20)";
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(ox - 16 + i * 11, GY - 3 - (1 - fallLive) * 8, 3.5 + (fallLive - 0.75) * 14, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  // hero
  if (heroMode === "celebrate") {
    // Drawn directly (not via figure()) so no runner limbs show through:
    // stance legs, torso, head, both arms up in a V, whole body bouncing.
    const by = GY - bounce;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = GOLD_D; ctx.lineWidth = 6;
    limb(ctx, { x: heroX, y: by - 30 }, 0.16, 15, -0.1, 15);
    limb(ctx, { x: heroX, y: by - 30 }, -0.16, 15, -0.1, 15);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(heroX, by - 30); ctx.lineTo(heroX, by - 52); ctx.stroke();
    celebrateArms(ctx, heroX, by, GOLD);
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(heroX, by - 61, 7.5, 0, Math.PI * 2); ctx.fill();
  } else if (heroMode === "kick") {
    figure(ctx, heroX, GY, { kit: GOLD, dark: GOLD_D, mode: "kick", fall: 0 });
  } else if (t >= 4.5) {
    figure(ctx, heroX, GY, { kit: GOLD, dark: GOLD_D, mode: "idle" });
  } else {
    const lean = 0.35;
    figure(ctx, heroX, GY, { kit: GOLD, dark: GOLD_D, mode: "run", phase, lean });
  }

  // ball + shadow
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(ball.x, GY + 3, 10, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#12203a";
  for (let i = 0; i < 3; i++) { const a = ballRoll + i * 2.1; ctx.beginPath(); ctx.arc(ball.x + Math.cos(a) * 4.4, ball.y + Math.sin(a) * 4.4, 1.9, 0, Math.PI * 2); ctx.fill(); }

  // goal burst + GOAL! text
  if (t > 4.98) {
    const bp = clamp((t - 4.98) / 0.5, 0, 1);
    ctx.strokeStyle = `rgba(232,199,102,${0.85 * (1 - bp)})`; ctx.lineWidth = 2.4;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.4; ctx.beginPath(); ctx.moveTo(1080 + Math.cos(a) * 12 * bp, GY - 66 + Math.sin(a) * 12 * bp); ctx.lineTo(1080 + Math.cos(a) * 30 * bp, GY - 66 + Math.sin(a) * 30 * bp); ctx.stroke(); }
    const pop = t < 5.45 ? 0.6 + ease((t - 4.98) / 0.47) * 0.52 : 1.12 - Math.sin(clamp((t - 5.45) / 0.4, 0, 1) * Math.PI * 0.5) * 0.12;
    ctx.save();
    ctx.translate(1108, 62); ctx.scale(pop, pop);
    ctx.font = "52px Anton, 'Arial Narrow', sans-serif"; ctx.textAlign = "center";
    ctx.fillStyle = GOLD; ctx.fillText("GOAL!", 0, 0);
    ctx.strokeStyle = GOLD_D; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-62, 12); ctx.quadraticCurveTo(0, 20, 62, 10); ctx.stroke();
    ctx.restore();
    // confetti over the celebration
    if (t > 5.5) {
      for (let i = 0; i < 16; i++) {
        const fx = 880 + ((i * 67) % 170), fy = ((t - 5.5) * 46 + i * 29) % 130;
        ctx.fillStyle = i % 3 ? "rgba(232,199,102,0.75)" : "rgba(247,245,239,0.65)";
        ctx.save(); ctx.translate(fx, 24 + fy); ctx.rotate(t * 2 + i); ctx.fillRect(-2.6, -1.4, 5.2, 2.8); ctx.restore();
      }
    }
  }

  // loop fade
  const fade = Math.min(clamp(t / 0.45, 0, 1), clamp((LOOP - t) / 0.55, 0, 1));
  if (fade < 1) { ctx.fillStyle = `rgba(6,8,17,${1 - fade})`; ctx.fillRect(0, 0, W, H); }
}

export default function GoalScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const fit = () => {
      const wpx = cv.clientWidth, hpx = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(wpx * dpr); cv.height = Math.round(hpx * dpr);
      ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    };
    fit();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { drawScene(ctx, 6.4); return; }
    let raf = 0, running = false, start = performance.now();
    const frame = (now: number) => {
      drawScene(ctx, ((now - start) / 1000) % LOOP);
      if (running) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((es) => {
      const vis = es[0]?.isIntersecting;
      if (vis && !running) { running = true; start = performance.now() - 0; raf = requestAnimationFrame(frame); }
      if (!vis && running) { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.12 });
    io.observe(cv);
    const onResize = () => { fit(); if (!running) drawScene(ctx, 1.2); };
    window.addEventListener("resize", onResize);
    drawScene(ctx, 0.2);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <div aria-hidden="true" style={{ marginTop: 30, background: "linear-gradient(180deg,#0a0f1f,#060811)", borderTop: "1px solid #c9a22726" }}>
      <canvas ref={ref} style={{ display: "block", width: "100%", height: "clamp(128px,24vw,188px)" }} />
    </div>
  );
}
