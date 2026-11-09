import type { Metadata, Viewport } from "next";
import { Oswald, Inter, Anton } from "next/font/google";
const display = Oswald({ subsets:["latin"], weight:["500","600","700"], variable:"--font-display" });
const anton = Anton({ subsets:["latin"], weight:"400", variable:"--font-anton" });
const body = Inter({ subsets:["latin"], variable:"--font-body" });
import "./globals.css";
import { SITE, JSON_LD } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecoveryRedirect from "@/components/RecoveryRedirect";
import AnthemProvider from "@/components/AnthemProvider";
import { resolveAnthemSrc } from "@/lib/anthem";
import { getTickerItems } from "@/lib/ticker";
import TopButton from "@/components/TopButton";
import { Analytics } from "@vercel/analytics/next";
import SwRegister from "@/components/SwRegister";
import RevealInit from "@/components/RevealInit";

// === PRESERVED METADATA (verified from live site 2026-10-24) — do not alter values ===
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE.url, title: SITE.title, description: SITE.ogDescription, siteName: SITE.name, images: [{ url: SITE.ogImage }] },
  twitter: { card: "summary", title: SITE.title, description: SITE.ogDescription, images: [SITE.ogImage] },
  verification: { google: SITE.googleVerification },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }, { url: "/assets/logo.jpeg" }], apple: "/icons/icon-180.png" },
  appleWebApp: { capable: true, title: "Bachelors FC", statusBarStyle: "black-translucent" },
  // Samsung Internet / Chrome forced-dark fix (2026-11-09): the site ships
  // its own dark AND light themes, so tell the browser NOT to re-darken
  // pages itself. Without this meta, Samsung Internet's "web page dark
  // mode" re-processes the colours and wrecks every gold gradient —
  // gradient text (stat numbers, captain name, hero line 2) turned dark
  // brown and unreadable on the owner's phone. The CSS color-scheme in
  // globals.css alone was not enough for Samsung; the meta is what it
  // honours. Do not remove.
  other: { "color-scheme": "dark light" },
};

export const viewport: Viewport = { themeColor: "#06060a" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const anthemSrc = await resolveAnthemSrc();
  const tickerText = (await getTickerItems()).join(" ✦ ") + " ✦ ";
  // Scroll speed stays constant no matter how much text the owner saves:
  // the CSS animation moves half the track in a fixed time, so a longer
  // line would run faster — scale the duration with the text length
  // (~0.25s per character of one pass, a touch slower than the old fixed
  // 30s loop so it is comfortable to read).
  const tickerDur = Math.max(24, Math.round(tickerText.length * 2 * 0.25));
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${anton.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('bfc-theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <div className="ticker" aria-hidden="true"><div className="ticker-track" style={{ animationDuration: `${tickerDur}s` }}>{[0,1].map(k=><span key={k}>{tickerText.repeat(2)}</span>)}</div></div>
        <AnthemProvider src={anthemSrc}><Header />{children}<Footer /><TopButton /></AnthemProvider><RecoveryRedirect /><Analytics /><SwRegister /><RevealInit />
      </body>
    </html>
  );
}
