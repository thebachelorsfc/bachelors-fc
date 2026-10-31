"use client";
import { useEffect, useRef } from "react";

// Footer goal scene (owner, 2026-10-31; v2 same day at his ask for more
// realism): a looping canvas vignette above the footer's social bar. A BFC
// player in the white home kit dribbles at three defenders — each jockeys,
// commits to a slide tackle and misses as the ball is knocked past him —
// then finishes into the top corner past a diving goalkeeper, and lands
// Cristiano Ronaldo's trademark "Siu" celebration (sprint, high jump with
// a mid-air turn, wide-stance landing). Flat figures with real kits and
// skin tones on the stays-dark navy band; pauses off-screen and honours
// prefers-reduced-motion with a still Siu frame.
const W = 1200, H = 300, GY = 252, LOOP = 10.4;
const GOLD = "#e8c766", GOLD_D = "#c9a227", PAPER = "#f7f5ef";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => p * p * (3 - 2 * p);

type Pt = { x: number; y: number };
type Kit = { jersey: string; shorts: string; skin: string; stripe?: boolean };
const HERO_KIT: Kit = { jersey: PAPER, shorts: "#182a4a", skin: "#c98d5e", stripe: true };
const GK_KIT: Kit = { jersey: "#2fa84f", shorts: "#14161c", skin: "#8a5a33" };
const DEF_KITS: Kit[] = [
  { jersey: "#a34a3a", shorts: "#23232c", skin: "#b57a4a" },
  { jersey: "#a34a3a", shorts: "#23232c", skin: "#8a5a33" },
  { jersey: "#a34a3a", shorts: "#23232c", skin: "#d9a066" },
];

// Two-segment limb: first segment in c1 (sleeve/thigh), second in c2 (skin).
function limb2(ctx: CanvasRenderingContext2D, from: Pt, angle: number, bend: number, c1: string, c2: string, w1 = 6) {
  const l1 = 14, l2 = 14;
  const mid = { x: from.x + Math.sin(angle) * l1, y: from.y + Math.cos(angle) * l1 };
  const a2 = angle + bend;
  const end = { x: mid.x + Math.sin(a2) * l2, y: mid.y + Math.cos(a2) * l2 };
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = c1; ctx.lineWidth = w1;
  ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(mid.x, mid.y); ctx.stroke();
  ctx.strokeStyle = c2; ctx.lineWidth = w1 - 1.4;
  ctx.beginPath(); ctx.moveTo(mid.x, mid.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  return end;
}

type Pose = {
  kit: Kit; legA: [number, number]; legB: [number, number];
  armA: [number, number]; armB: [number, number];
  lean: number; crouch: number; jump: number; rot: number; gloves?: boolean;
};
// Draws one figure in LOCAL space: root (feet centre) at (0, gy), facing +x.
// Callers translate/scale (flip) the context for position and facing.
function person(ctx: CanvasRenderingContext2D, gy: number, P: Pose) {
  const rootY = gy - P.jump;
  ctx.save();
  ctx.translate(0, rootY); ctx.rotate(P.rot); ctx.translate(0, -rootY);
  const hip = { x: P.lean * 5, y: rootY - 30 + P.crouch };
  const neck = { x: hip.x + P.lean * 5, y: hip.y - 22 };
  const shoulder = { x: neck.x, y: neck.y + 3 };
  // far-side limbs first (slightly transparent for depth)
  ctx.globalAlpha = 0.82;
  limb2(ctx, hip, P.legB[0], P.legB[1], P.kit.shorts, P.kit.skin);
  const handB = limb2(ctx, shoulder, P.armB[0], P.armB[1], P.kit.jersey, P.kit.skin, 5.4);
  ctx.globalAlpha = 1;
  // shorts block
  ctx.strokeStyle = P.kit.shorts; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(hip.x - 3, hip.y - 2); ctx.lineTo(hip.x + 3, hip.y - 2); ctx.stroke();
  // torso (jersey) + optional gold chest stripe
  ctx.strokeStyle = P.kit.jersey; ctx.lineWidth = 8.5;
  ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(neck.x, neck.y); ctx.stroke();
  if (P.kit.stripe) {
    const mx = (hip.x + neck.x) / 2, my = (hip.y + neck.y) / 2;
    ctx.strokeStyle = GOLD_D; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(mx - 4.5, my); ctx.lineTo(mx + 4.5, my); ctx.stroke();
  }
  // near-side limbs
  const footA = limb2(ctx, hip, P.legA[0], P.legA[1], P.kit.shorts, P.kit.skin);
  const handA = limb2(ctx, shoulder, P.armA[0], P.armA[1], P.kit.jersey, P.kit.skin, 5.4);
  // boots
  ctx.strokeStyle = "#10131c"; ctx.lineWidth = 3.4;
  for (const f of [footA]) { ctx.beginPath(); ctx.moveTo(f.x - 1, f.y); ctx.lineTo(f.x + 5, f.y); ctx.stroke(); }
  // gloves for the keeper
  if (P.gloves) {
    ctx.fillStyle = PAPER;
    for (const h of [handA, handB]) { ctx.beginPath(); ctx.arc(h.x, h.y, 3.4, 0, Math.PI * 2); ctx.fill(); }
  }
  // head: skin + hair cap
  const hx = neck.x + P.lean * 2, hy = neck.y - 9;
  ctx.fillStyle = P.kit.skin;
  ctx.beginPath(); ctx.arc(hx, hy, 7.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#20242e";
  ctx.beginPath(); ctx.arc(hx, hy - 1.6, 7.4, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.restore();
}

function shadow(ctx: CanvasRenderingContext2D, x: number, jump: number, wdt = 17) {
  const p = clamp(1 - jump / 90, 0.35, 1);
  ctx.fillStyle = `rgba(0,0,0,${0.30 * p})`;
  ctx.beginPath(); ctx.ellipse(x, GY + 3, wdt * p, 2.6 * p, 0, 0, Math.PI * 2); ctx.fill();
}
function dust(ctx: CanvasRenderingContext2D, x: number, p: number, n = 4) {
  ctx.fillStyle = `rgba(247,245,239,${0.22 * (1 - p)})`;
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x - 14 + i * 10, GY - 2 - p * 7, 3 + p * 8, 0, Math.PI * 2); ctx.fill(); }
}

const RUN_LEGS = (p: number): { a: [number, number]; b: [number, number] } => ({
  a: [Math.sin(p) * 0.88, -0.45 - Math.max(0, -Math.cos(p)) * 0.75],
  b: [Math.sin(p + Math.PI) * 0.88, -0.45 - Math.max(0, Math.cos(p)) * 0.75],
});
const RUN_ARMS = (p: number): { a: [number, number]; b: [number, number] } => ({
  a: [Math.sin(p + Math.PI) * 0.72 + 0.12, -0.85],
  b: [Math.sin(p) * 0.72 + 0.12, -0.85],
});

function drawScene(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, W, H);
  // pitch stripes + chalk lines
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "rgba(232,199,102,0.025)" : "rgba(247,245,239,0.02)"; ctx.fillRect(i * 200, 208, 200, 62); }
  ctx.strokeStyle = "rgba(247,245,239,0.35)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
  ctx.strokeStyle = "rgba(247,245,239,0.14)";
  ctx.beginPath(); ctx.moveTo(1010, GY - 108); ctx.lineTo(1010, GY); ctx.stroke();

  // goal net (behind the keeper), posts in front of net
  const netBulge = t > 4.98 && t < 5.95 ? Math.sin((t - 4.98) / 0.97 * Math.PI) * 13 : 0;
  ctx.strokeStyle = "rgba(247,245,239,0.30)"; ctx.lineWidth = 1.4;
  for (let i = 0; i <= 4; i++) { const y = GY - 96 + i * 24; ctx.beginPath(); ctx.moveTo(1052, y); ctx.lineTo(1176, y + 8); ctx.stroke(); }
  for (let i = 0; i <= 5; i++) { const x = 1052 + i * 25; ctx.beginPath(); ctx.moveTo(x, GY - 96 + (x - 1052) * 0.065 + netBulge * (i / 5)); ctx.lineTo(x, GY); ctx.stroke(); }

  // ---- timeline anchors -------------------------------------------------
  const opps = [395, 615, 835];
  const crossT = opps.map((ox) => { for (let p = 0; p <= 1.0001; p += 0.002) { if (ease(p) >= (ox - 76) / 822) return p * 4.2; } return 4.2; });

  // hero x + ball during the run
  let heroX = 902;
  if (t < 4.2) heroX = lerp(80, 902, ease((t / 4.2) * 0.999));
  // ball
  let ball: Pt = { x: 928, y: GY - 8 }, ballRoll = t * 7;
  if (t < 4.2) {
    ball = { x: heroX + 27 + Math.sin(t * 9.5) * 4, y: GY - 8 - Math.abs(Math.sin(t * 9.5)) * 3.5 };
    // knocked past each sliding defender: a little hop over the tackle
    crossT.forEach((ct) => {
      const hp = (t - (ct - 0.16)) / 0.32;
      if (hp > 0 && hp < 1) { ball.y -= Math.sin(hp * Math.PI) * 11; ball.x += Math.sin(hp * Math.PI) * 9; }
    });
  } else if (t < 4.5) { ball = { x: 928, y: GY - 8 }; }
  else if (t < 4.98) { const p = (t - 4.5) / 0.48; ball = { x: lerp(928, 1086, p), y: lerp(GY - 8, GY - 74, p) - Math.sin(p * Math.PI) * 14 }; ballRoll = t * 22; }
  else if (t < 5.35) { const p = (t - 4.98) / 0.37; ball = { x: lerp(1086, 1096, p), y: lerp(GY - 74, GY - 8, p * p) }; }
  else ball = { x: 1096, y: GY - 8 };

  // ---- defenders --------------------------------------------------------
  opps.forEach((ox, i) => {
    const ct = crossT[i], kit = DEF_KITS[i];
    let dx = ox, pose: Pose;
    const ready: Pose = { kit, legA: [0.32, -0.42], legB: [-0.32, -0.42], armA: [0.78, -0.35], armB: [-0.78, -0.35], lean: 0.06, crouch: 5, jump: 0, rot: 0 };
    if (t < ct - 0.85) {
      dx = ox + Math.sin(t * 1.7 + i * 2) * 2.5; pose = ready;
    } else if (t < ct - 0.30) { // jockey: shuffle toward the ball, crouch, track
      const p = ease((t - (ct - 0.85)) / 0.55);
      dx = ox - 9 * p;
      pose = { ...ready, crouch: 8, lean: 0.24, legA: [0.42, -0.55], legB: [-0.38, -0.6], armA: [0.95, -0.3], armB: [-0.95, -0.3] };
    } else if (t < ct + 0.25) { // slide tackle — committed, and beaten
      const p = ease((t - (ct - 0.30)) / 0.55);
      dx = ox - 9 - 19 * p;
      pose = { kit, legA: [lerp(0.42, 1.32, p), lerp(-0.55, -0.06, p)], legB: [lerp(-0.38, -0.35, p), lerp(-0.6, -1.95, p)], armA: [lerp(0.95, -1.15, p), -0.3], armB: [lerp(-0.95, 2.4, p), -0.3], lean: lerp(0.24, -0.55, p), crouch: lerp(8, 25, p), jump: 0, rot: 0 };
      if (p > 0.15 && p < 0.95) dust(ctx, dx - 6, p);
    } else { // down — later props himself up to watch the celebration
      const prop = t > 7.4 ? ease(clamp((t - 7.4) / 1.2, 0, 1)) : 0;
      dx = ox - 28;
      pose = { kit, legA: [1.32, -0.06], legB: [-0.35, -1.95], armA: [-1.15, -0.3], armB: [2.4, -0.3], lean: lerp(-0.55, -0.3, prop), crouch: lerp(25, 21, prop), jump: 0, rot: 0 };
    }
    shadow(ctx, dx, 0);
    ctx.save(); ctx.translate(dx, 0); ctx.scale(-1, 1); person(ctx, GY, pose); ctx.restore();
  });

  // ---- goalkeeper -------------------------------------------------------
  {
    let gx = 1012, pose: Pose;
    const ready: Pose = { kit: GK_KIT, legA: [0.38, -0.5], legB: [-0.38, -0.5], armA: [0.72, -0.45], armB: [-0.72, -0.45], lean: 0.06, crouch: 8, jump: 0, rot: 0, gloves: true };
    if (t < 4.55) { // tracks the ball with little shuffles
      gx = 1012 + clamp((ball.x - 1012) * 0.02, -6, 6) + Math.sin(t * 2.3) * 1.5;
      pose = { ...ready, crouch: 8 + Math.sin(t * 3) * 1.2 };
    } else if (t < 4.75) { // sets himself as the shot comes
      const p = ease((t - 4.55) / 0.2);
      pose = { ...ready, crouch: lerp(8, 12.5, p), armA: [lerp(0.72, 0.92, p), -0.3], armB: [lerp(-0.72, -0.92, p), -0.3] };
    } else if (t < 5.17) { // the dive — full stretch, just not enough
      const p = ease((t - 4.75) / 0.42);
      gx = lerp(1012, 1034, p);
      pose = { kit: GK_KIT, legA: [-0.25, -0.5], legB: [0.4, -1.0], armA: [Math.PI - 0.18, -0.05], armB: [Math.PI + 0.18, -0.05], lean: 0, crouch: 0, jump: Math.sin(p * Math.PI * 0.85) * 26 + p * 4, rot: p * 1.15, gloves: true };
    } else if (t < 5.55) { // crashes down inside the goal
      const p = ease((t - 5.17) / 0.38);
      gx = lerp(1034, 1042, p);
      pose = { kit: GK_KIT, legA: [-0.2, -0.4], legB: [0.35, -0.9], armA: [Math.PI - 0.3, -0.2], armB: [Math.PI + 0.3, -0.2], lean: 0, crouch: 0, jump: lerp(15.8, 0, p), rot: lerp(1.15, 1.45, p), gloves: true };
    } else { // stays down, beaten
      const prop = t > 7.4 ? ease(clamp((t - 7.4) / 1.2, 0, 1)) : 0;
      gx = 1042;
      pose = { kit: GK_KIT, legA: [-0.2, -0.4], legB: [0.35, -0.9], armA: [Math.PI - 0.3, -0.2], armB: [Math.PI + 0.3, -0.2], lean: 0, crouch: 0, jump: 0, rot: lerp(1.45, 1.32, prop), gloves: true };
    }
    shadow(ctx, gx, pose.jump);
    ctx.save(); ctx.translate(gx, 0); person(ctx, GY, pose); ctx.restore();
  }

  // goal posts (front of the net, keeper dives across them)
  ctx.strokeStyle = PAPER; ctx.lineWidth = 4.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(1052, GY); ctx.lineTo(1052, GY - 96); ctx.lineTo(1176, GY - 88); ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(1176, GY - 88); ctx.lineTo(1176, GY); ctx.stroke();

  // ---- hero -------------------------------------------------------------
  {
    let flip = 1, pose: Pose | null = null, hx = heroX;
    const phase = t * 9.5;
    if (t < 4.2) {
      const L = RUN_LEGS(phase), A = RUN_ARMS(phase);
      pose = { kit: HERO_KIT, legA: L.a, legB: L.b, armA: A.a, armB: A.b, lean: 0.32, crouch: 2, jump: Math.abs(Math.sin(phase)) * 2.5, rot: 0 };
    } else if (t < 4.5) { // the strike
      const p = (t - 4.2) / 0.3;
      const swing = p < 0.4 ? lerp(0.3, -0.7, p / 0.4) : lerp(-0.7, 1.3, ease((p - 0.4) / 0.6));
      const bend = p < 0.4 ? lerp(-0.2, -1.15, p / 0.4) : lerp(-1.15, 0.3, (p - 0.4) / 0.6);
      pose = { kit: HERO_KIT, legA: [swing, bend], legB: [-0.22, -0.12], armA: [0.85, -0.4], armB: [-0.85, -0.4], lean: lerp(0.15, 0.35, p), crouch: 3, jump: 0, rot: 0 };
    } else if (t < 5.35) { // watches it in
      pose = { kit: HERO_KIT, legA: [0.18, -0.15], legB: [-0.18, -0.15], armA: [0.4, -0.3], armB: [-0.4, -0.3], lean: 0.1, crouch: 3, jump: 0, rot: 0 };
    } else if (t < 6.15) { // sprint away, CR7-style, toward centre
      const p = ease((t - 5.35) / 0.8);
      hx = lerp(902, 706, p); flip = -1;
      const L = RUN_LEGS(t * 11.5), A = RUN_ARMS(t * 11.5);
      pose = { kit: HERO_KIT, legA: L.a, legB: L.b, armA: A.a, armB: A.b, lean: 0.42, crouch: 2, jump: Math.abs(Math.sin(t * 11.5)) * 3, rot: 0 };
    } else if (t < 6.45) { // loads the jump
      const p = ease((t - 6.15) / 0.3);
      hx = 706; flip = -1;
      pose = { kit: HERO_KIT, legA: [lerp(0.2, 0.3, p), lerp(-0.3, -1.05, p)], legB: [lerp(-0.2, -0.3, p), lerp(-0.3, -1.05, p)], armA: [lerp(0.3, -0.78, p), -0.3], armB: [lerp(-0.3, -0.78, p), -0.3], lean: lerp(0.1, 0.28, p), crouch: lerp(3, 11, p), jump: 0, rot: 0 };
    } else if (t < 7.2) { // THE jump — 180° turn at the top
      const jp = (t - 6.45) / 0.75;
      hx = 706; flip = Math.cos(jp * Math.PI) * -1; // -1 (facing left) → +1
      if (Math.abs(flip) < 0.12) flip = 0.12 * Math.sign(flip || 1);
      const armUp = Math.sin(Math.min(jp * 1.15, 1) * Math.PI * 0.5);
      pose = { kit: HERO_KIT, legA: [lerp(0.35, 0.48, jp), lerp(-1.25, -0.2, jp)], legB: [lerp(-0.35, -0.48, jp), lerp(-1.25, -0.2, jp)], armA: [lerp(-0.78, 2.55, armUp), -0.15], armB: [lerp(-0.78, -2.55, armUp), -0.15], lean: 0.05, crouch: 0, jump: Math.sin(jp * Math.PI) * 54, rot: 0 };
    } else { // landing + the hold: feet wide, arms swept down, chest out
      const st = t - 7.2;
      hx = 706; flip = 1;
      const settle = ease(clamp(st / 0.3, 0, 1));
      pose = { kit: HERO_KIT, legA: [0.52, -0.12], legB: [-0.52, -0.12], armA: [0.98, -0.08], armB: [-0.98, -0.08], lean: -0.10, crouch: lerp(6, 1, settle), jump: Math.sin(t * 2.2) * 1.1, rot: 0 };
      if (st < 0.55) { // landing ring + dust
        const p = st / 0.55;
        ctx.strokeStyle = `rgba(232,199,102,${0.8 * (1 - p)})`; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(hx, GY + 2, 12 + p * 42, (12 + p * 42) * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
        dust(ctx, hx - 16, p, 3); dust(ctx, hx + 16, p, 3);
      }
    }
    shadow(ctx, hx, pose.jump);
    ctx.save(); ctx.translate(hx, 0); ctx.scale(flip, 1); person(ctx, GY, pose); ctx.restore();
  }

  // ball + shadow
  shadow(ctx, ball.x, GY - ball.y > 0 ? (GY - ball.y) * 0.4 : 0, 10);
  ctx.fillStyle = PAPER;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#12203a";
  for (let i = 0; i < 3; i++) { const a = ballRoll + i * 2.1; ctx.beginPath(); ctx.arc(ball.x + Math.cos(a) * 4.4, ball.y + Math.sin(a) * 4.4, 1.9, 0, Math.PI * 2); ctx.fill(); }

  // goal burst + GOAL! + confetti
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
    if (t > 5.5 && t < 7.3) {
      for (let i = 0; i < 16; i++) {
        const fx = 1000 + ((i * 67) % 170), fy = ((t - 5.5) * 46 + i * 29) % 130;
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
    if (reduced) { drawScene(ctx, 7.8); return; }
    let raf = 0, running = false, start = performance.now();
    const frame = (now: number) => {
      drawScene(ctx, ((now - start) / 1000) % LOOP);
      if (running) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((es) => {
      const vis = es[0]?.isIntersecting;
      if (vis && !running) { running = true; start = performance.now(); raf = requestAnimationFrame(frame); }
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
