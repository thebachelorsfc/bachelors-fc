"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
// Scroll reveal (2026-10-31, owner's ask): the old Netlify site's motion,
// but BIDIRECTIONAL — blocks fade/rise in EVERY time they enter the screen,
// scrolling down or back up (the observer toggles the class, never
// unobserves). Blocks are auto-tagged: section titles, whole carousels,
// standalone cards, squad-grid player cards, the photo band, the captain
// card. Carousel internals are never tagged (their wrapper is). Admin,
// dashboard and auth pages are excluded. Content is only ever hidden once
// this effect has tagged it, so no-JS / reduced-motion always see the page.
const SEL = "main h2, main .cc-wrap, main .grd-wrap, main .sqd-wrap, main .soc-wrap, main .card, main .flip-in, main .photo-band, main .ev-cap";
const TRACK = ".cc-track,.grd-track,.sqd-track,.soc-track";
const SKIP = ["/admin", "/dashboard", "/login", "/reset-password"];
export default function RevealInit() {
  const path = usePathname();
  useEffect(() => {
    if (!path || SKIP.some((p) => path.startsWith(p))) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js");
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-visible", e.isIntersecting)), { rootMargin: "0px 0px -4% 0px", threshold: 0.05 });
    const seen = new Set<Element>();
    const scan = () => {
      document.querySelectorAll(SEL).forEach((el) => {
        if (seen.has(el) || el.hasAttribute("data-reveal")) return;
        if (el.closest(TRACK)) return;
        let anc = el.parentElement, nested = false;
        while (anc && anc !== document.body) { if (anc.hasAttribute("data-reveal")) { nested = true; break; } anc = anc.parentElement; }
        if (nested) return;
        const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal")).length : 0;
        (el as HTMLElement).style.setProperty("--d", String(Math.min(sibs, 6)));
        el.setAttribute("data-reveal", "");
        seen.add(el); io.observe(el);
      });
    };
    scan();
    const main = document.querySelector("main");
    const mo = new MutationObserver(() => scan());
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
