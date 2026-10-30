/* The Bachelors FC — service worker v4 (PWA installability + offline
   browsing + Web Push session notifications).
   What changed in v4 ("works offline" pass):
   - The main public pages are PRECACHED on install, so they open offline
     even if never visited before.
   - Cache names are STABLE across deploys — a new version no longer wipes
     everything you had saved for offline.
   - The public JSON behind the Leaderboard / MOTM banner (players, streaks,
     motm) is cached network-first, so those sections show their last-seen
     data offline instead of going blank.
   - In-app page transitions (Next router data) are cached too, so tapping
     around the app offline keeps working.
   - Google Fonts are cached, so the type looks right offline.
   Still online-only BY DESIGN: /admin, /dashboard, /login, /reset-password
   and anything under /api/player or /api/admin (accounts, RSVP, orders —
   those must talk to the server to be true). Facebook embeds need internet. */
const PAGE_CACHE = "bfc-pages-v1";
const ASSET_CACHE = "bfc-assets-v1";
const DATA_CACHE = "bfc-data-v1";
const KEEP = [PAGE_CACHE, ASSET_CACHE, DATA_CACHE];
const OFFLINE_URL = "/offline.html";
const NEVER_CACHE = ["/admin", "/dashboard", "/login", "/reset-password"];
const PRECACHE = [
  "/", "/squad", "/about", "/history", "/grounds", "/gallery", "/people",
  "/store", "/rules", "/contact", "/join",
  OFFLINE_URL, "/icons/icon-192.png",
  "/assets/logo-transparent.png", "/assets/team-photo-band.jpg",
];
const PUBLIC_API = ["/api/players", "/api/streaks", "/api/motm"];

const isNever = (path) => NEVER_CACHE.some((p) => path === p || path.startsWith(p + "/"));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: cache-first (immutable font files + long-lived CSS).
  if (url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(ASSET_CACHE).then((cache) => cache.put(req, copy));
        return res;
      }))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Public club-data JSON: network-first, last-seen copy offline.
  if (url.pathname.startsWith("/api/")) {
    if (!PUBLIC_API.includes(url.pathname)) return;
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(async () => (await caches.match(req, { cacheName: DATA_CACHE })) ||
        new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } }))
    );
    return;
  }

  // Documents: network-first, cached copy offline, offline page as last resort.
  if (req.mode === "navigate") {
    if (isNever(url.pathname)) {
      event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
      return;
    }
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(async () => (await caches.match(req, { cacheName: PAGE_CACHE })) || caches.match(OFFLINE_URL, { cacheName: PAGE_CACHE }))
    );
    return;
  }

  // In-app transitions (Next router fetches): network-first, cached offline.
  if (url.searchParams.has("_rsc") || req.headers.get("RSC") === "1" || (req.headers.get("Accept") || "").includes("text/x-component")) {
    if (isNever(url.pathname)) return;
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(async () => (await caches.match(req, { cacheName: DATA_CACHE })) ||
        new Response("", { status: 503 }))
    );
    return;
  }

  // Static assets, optimized images, site assets, icons, manifest: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image") ||
      url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(ASSET_CACHE).then((cache) => cache.put(req, copy));
        return res;
      }))
    );
  }
});

/* Web Push — session notifications */
self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { /* keep defaults */ }
  const title = d.title || "The Bachelors FC";
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: d.url || "/dashboard" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { if ("navigate" in c) c.navigate(target); return c.focus(); }
      }
      return clients.openWindow(target);
    })
  );
});
