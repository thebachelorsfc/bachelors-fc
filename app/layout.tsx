import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
const display = Oswald({ subsets:["latin"], weight:["500","600","700"], variable:"--font-display" });
const body = Inter({ subsets:["latin"], variable:"--font-body" });
import "./globals.css";
import { SITE, JSON_LD } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopButton from "@/components/TopButton";

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
  icons: { icon: "/assets/logo.jpeg", apple: "/assets/logo.jpeg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('bfc-theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <div className="ticker" aria-hidden="true"><div className="ticker-track">{[0,1].map(k=><span key={k}>Forged in Brotherhood ✦ Driven by Purpose ✦ United, Not Alone ✦ Khulshi · Chittagong ✦ Est. 2026 ✦ No Sponsors · No Stadium · Just Us ✦ Forged in Brotherhood ✦ Driven by Purpose ✦ United, Not Alone ✦ Khulshi · Chittagong ✦ Est. 2026 ✦ </span>)}</div></div>
        <Header />{children}<Footer /><TopButton />
      </body>
    </html>
  );
}
