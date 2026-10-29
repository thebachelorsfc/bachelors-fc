// PWA install helpers: Chrome fires `beforeinstallprompt` exactly once per
// page load, so the root layout captures it here and the site's own
// "Install App" buttons (homepage card, drawer item) can trigger the dialog.
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
let captured = false;

export function initInstallCapture() {
  if (typeof window === "undefined" || captured) return;
  captured = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as unknown as BIPEvent;
    window.dispatchEvent(new Event("bfc:installable"));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    window.dispatchEvent(new Event("bfc:installed"));
  });
}

export function canPromptInstall() { return !!deferred; }

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const choice = await deferred.userChoice;
  if (choice && choice.outcome === "accepted") { deferred = null; return true; }
  return false;
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function isIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}
