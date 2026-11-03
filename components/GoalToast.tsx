"use client";
import { useEffect, useRef } from "react";
import { drawGoalSceneFrame } from "./GoalScene";

// RSVP celebration toast (realistic cut, owner 2026-11-03 — replaces the
// chalk GoalDoodle at his ask: "footer-er animation-er moto realistic").
// Plays a cropped (attacking third), time-compressed cut of the footer's
// GoalScene: the strike, the keeper's dive, the top-corner finish and the
// GOAL! burst — then a slow-drift hold on the celebration while the crowd
// is still loud. Shown by the dashboard for ~4.5s, IN taps only.
// View window: scene x 688..1188 (500 x 300 units).
const VX = 688, VW = 500, VH = 300;
// Toast time -> scene time: 0..1.9s plays scene 3.35..4.98 (run-up, strike,
// flight, GOAL), then 1.9..4.4s drifts 4.98..5.65 (burst, pop, confetti).
function sceneT(tau: number) {
  if (tau <= 1.9) return 3.35 + (tau / 1.9) * 1.63;
  return 4.98 + Math.min((tau - 1.9) * 0.27, 0.67);
}
export default function GoalToast() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const paint = (t: number) => {
      const s = cv.width / VW;
      ctx.setTransform(s, 0, 0, s, -VX * s, 0);
      drawGoalSceneFrame(ctx, t);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(5.45); return; }
    let raf = 0; const start = performance.now();
    const frame = (now: number) => {
      const tau = (now - start) / 1000;
      paint(sceneT(tau));
      if (tau < 4.45) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="goal-toast" role="status" aria-label="Goal! You're in.">
      <canvas ref={ref} width={1000} height={600} style={{ display: "block", width: "min(320px,82vw)", aspectRatio: "5 / 3", borderRadius: 10 }} />
      <p style={{ margin: "8px 0 4px", textAlign: "center", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, letterSpacing: ".32em", color: "#f7f5ef" }}>YOU&apos;RE IN</p>
    </div>
  );
}
