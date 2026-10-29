import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// PWA manifest — makes the site installable ("Install app" / Add to Home Screen)
// and is the groundwork for a future Play Store (TWA) listing.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Bachelors FC",
    short_name: "Bachelors FC",
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#06060a",
    theme_color: "#06060a",
    categories: ["sports"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
