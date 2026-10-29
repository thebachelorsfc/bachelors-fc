/* The Bachelors FC — service worker (PWA installability + offline browsing
   of already-visited pages + Web Push session notifications).
   Pages are NETWORK-FIRST: online you always get fresh content, and every
   public page you open is remembered — with no connection, the last-seen
   copy opens instead of the offline screen. Auth/personal pages (admin,
   dashboard, login) are never cached. /api is never touched. */
const CACHE = "bfc-pwa-v3";
const OFFLINE_URL = "/offline.html";
const NEVER_CACHE = ["/admin", "/dashboard", "/login", "/reset-password"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    if (NEVER_CACHE.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"))) {
      event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
      return;
    }
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(async () => (await caches.match(req)) || caches.match(OFFLINE_URL))
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
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
