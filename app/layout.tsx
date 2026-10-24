import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
const display = Oswald({ subsets:["latin"], weight:["500","600","700"], variable:"--font-display" });
const body = Inter({ subsets:["latin"], variable:"--font-body" });
import "./globals.css";
import { SITE, JSON_LD } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <Header />{children}<Footer />
      </body>
    </html>
  );
}
