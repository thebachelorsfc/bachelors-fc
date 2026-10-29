"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { canPromptInstall, isIOS, isStandalone, promptInstall } from "@/lib/install";

// "Get the BFC App" card — how visitors discover the PWA install:
// Android/Chrome gets the native install dialog from our own button;
// iPhone gets the Share → Add to Home Screen steps. Hidden once installed.
export default function InstallAppCard() {
  const [hidden, setHidden] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) { setHidden(true); return; }
    setIos(isIOS());
    const onInstalled = () => setHidden(true);
    window.addEventListener("bfc:installed", onInstalled);
    return () => window.removeEventListener("bfc:installed", onInstalled);
  }, []);

  if (hidden) return null;

  const onInstall = async () => {
    if (canPromptInstall()) { await promptInstall(); }
    else setShowSteps(true);
  };

  return (
    <section className="wrap" id="app">
      <div className="app-card">
        <Image src="/icons/icon-192.png" alt="The Bachelors FC app icon" width={76} height={76} className="app-ic" />
        <div className="app-tx">
          <p className="eyebrow">BFC App</p>
          <h3>Get the Bachelors FC app</h3>
          <p className="app-sub">One tap from your home screen — sessions, RSVP, the anthem and the store. Free, tiny, and always up to date. No Play Store needed.</p>
          {ios ? (
            <p className="app-steps">On iPhone: tap <strong>Share</strong> in Safari, then <strong>Add to Home Screen</strong>.</p>
          ) : showSteps ? (
            <p className="app-steps">Open your browser menu (<strong>⋮</strong>) and tap <strong>Install and create shortcut</strong> — or “Add to Home screen”.</p>
          ) : (
            <button type="button" className="btn" onClick={onInstall}>📲 Install the App</button>
          )}
        </div>
      </div>
    </section>
  );
}
