// Single source of truth — values copied EXACTLY from the live site head on 2026-10-24.
// Do NOT change title/description/canonical/verification without owner approval: SEO + Search Console depend on them.
export const SITE = {
  name: "The Bachelors FC",
  url: "https://thebachelorsfc.netlify.app",
  title: "The Bachelors FC | Football Club in Khulshi, Chittagong",
  description:
    "The Bachelors FC is an apolitical, non-profit football club in Khulshi, Chittagong, built around brotherhood, discipline, leadership, and purpose.",
  ogDescription:
    "An apolitical, non-profit football club in Khulshi, Chittagong — forged in brotherhood and driven by purpose.",
  ogImage: "https://thebachelorsfc.netlify.app/assets/logo.jpeg",
  // Both Search Console properties must stay verified: token 1 = Netlify property, token 2 = Vercel property (added 2026-10-25). Do not remove either.
  googleVerification: ["1reD33YYQMrbRRaTtMv-YZRiSowRPgZX9n1Vwu8q-xs", "Hj5PCmlLSlq7k6kHIZOJJuNlt6MvjqhNcByL2nD_rqI"] as string[],
  motto: "Forged in Brotherhood, Driven by Purpose",
  mottoAlt: "United, Not Alone",
  location: "Khulshi, Chittagong",
  founded: 2026,
  founder: "Mostafa",
  contacts: {
    facebook: "https://www.facebook.com/share/1BpXvUbupE/",
    messenger: "https://m.me/TheBachelorsFC",
    whatsappGroup: "https://chat.whatsapp.com/HtVCs6GprUc1RSeuJH7xSI",
    maps: "https://www.google.com/maps/place/The+Bachelors+FC/data=!4m2!3m1!1s0x30acd92dd11a567f:0xc6040e1a5c4a9968!18m1!1e1",
  },
} as const;

export const PILLARS = [
  { no: "01", title: "Brotherhood", sub: "Over isolation", text: "A team you show up for on the days you don't feel like showing up for yourself. No one trains alone here." },
  { no: "02", title: "Discipline", sub: "On the pitch", text: "Structured training, real matches, real consequences — the kind of routine that quietly rebuilds a life." },
  { no: "03", title: "Legacy", sub: "Documented, not forgotten", text: "Every match, every milestone lives on our page — so what we build here can inspire the next club, too." },
] as const;

export const TOUR = [
  { stop: "01", name: "Suptodhara Falls", note: "Near Sitakunda Eco Park" },
  { stop: "02", name: "Sohosrodhara Falls", note: "Deeper into the jungle trail" },
  { stop: "03", name: "Guliakhali Beach", note: "Sunset at the shore" },
] as const;

export const KIT = { base: "White, navy pinstripes", trim: "Navy sleeves & collar", crest: "Gold & black hexagon, lion emblem", image: "/assets/jersey.jpg" } as const;

// Manual mobile-payment numbers buyers send money to (owner-provided; empty = that method is hidden on the order form)
export const PAYMENTS: { bkash: string; nagad: string } = { bkash: "", nagad: "" };

// JSON-LD preserved from the live site (SportsTeam + WebSite graph)
export const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SportsTeam", "@id": `${SITE.url}/#team`, name: SITE.name, url: `${SITE.url}/`, logo: SITE.ogImage, image: SITE.ogImage, description: SITE.description, sport: "Football", location: { "@type": "Place", name: "Khulshi, Chittagong", address: { "@type": "PostalAddress", addressLocality: "Chittagong", addressCountry: "BD" } } },
    { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, description: "Official website of The Bachelors FC, a football club in Khulshi, Chittagong.", publisher: { "@id": `${SITE.url}/#team` } },
  ],
};
