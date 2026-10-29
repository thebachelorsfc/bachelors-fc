"use client";
import { useEffect } from "react";
import { initInstallCapture } from "@/lib/install";

// Registers the PWA service worker (production only) and captures the
// browser's install prompt so the site's own Install buttons can use it.
export default function SwRegister() {
  useEffect(() => {
    initInstallCapture();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
