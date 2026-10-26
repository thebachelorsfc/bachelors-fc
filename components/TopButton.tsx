"use client";
import { useEffect, useState } from "react";
export default function TopButton() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(window.scrollY > 650);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (<button type="button" aria-label="Back to top" className={on ? "top-btn on" : "top-btn"} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>);
}
