"use client";
import { useEffect, useRef } from "react";

// A realistic 3D football for the hero — a true truncated-icosahedron
// texture (generated from the real panel geometry) on a Three.js sphere
// with studio lighting, a slow spin and a gentle bounce with a synced
// floor shadow. Three.js loads lazily (dynamic import) so no other page
// pays for it; a rendered still stands in until the scene is ready and
// remains as the fallback if WebGL is unavailable.
export default function RealBall() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dead = false;
    let raf = 0;
    let renderer: any = null;
    let visible = true;
    let io: IntersectionObserver | null = null;

    (async () => {
      try {
        const THREE = await import("three");
        if (dead || !wrapRef.current) return;
        const wrap = wrapRef.current;
        const size = wrap.clientWidth || 196;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size);
        wrap.insertBefore(renderer.domElement, wrap.firstChild);

        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
        cam.position.set(0, 0.3, 4.4);
        cam.lookAt(0, 0, 0);

        const loader = new THREE.TextureLoader();
        const map = loader.load("/assets/ball-texture.jpg");
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 4;
        const bump = loader.load("/assets/ball-bump.jpg");
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(1.08, 64, 48),
          new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 0.7, roughness: 0.52, metalness: 0 })
        );
        ball.rotation.set(0.18, 0.6, 0.42);
        scene.add(ball);
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(2.5, 3.5, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xe8c766, 0.9);
        rim.position.set(-3.5, 0.5, -2.5);
        scene.add(rim);

        const still = wrap.querySelector("img");
        let revealed = false;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let t = 2.2;
        const tick = () => {
          t += 0.016;
          ball.rotation.y = 0.6 + t * 0.45;
          const b = Math.abs(Math.sin(t * 1.35));
          ball.position.y = b * 0.12;
          if (shadowRef.current) {
            shadowRef.current.style.transform = `translateX(-50%) scaleX(${1 - b * 0.22})`;
            shadowRef.current.style.opacity = String(0.95 - b * 0.35);
          }
          if (visible) renderer.render(scene, cam);
          if (!revealed) { revealed = true; if (still) (still as HTMLElement).style.opacity = "0"; }
          if (!reduced && !dead) raf = requestAnimationFrame(tick);
        };
        io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.04 });
        io.observe(wrap);
        tick();
      } catch { /* still image remains as the fallback */ }
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
      if (renderer) { renderer.dispose(); if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    };
  }, []);

  return (
    <div className="real-ball" ref={wrapRef} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/ball-still.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transition: "opacity .5s ease" }} />
      <div className="real-ball-shadow" ref={shadowRef} />
    </div>
  );
}
