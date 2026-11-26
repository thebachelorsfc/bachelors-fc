import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// Per-page metadata (added 2026-11-26): every public page gets its own
// title + description for search results, plus matching Open Graph and
// Twitter cards so shares show the page's own text instead of falling
// back to the generic club description from the root layout. The root
// layout's preserved homepage metadata is NOT touched by this helper.
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: `${SITE.url}${path}`,
      title,
      description,
      siteName: SITE.name,
      images: [{ url: SITE.ogImage }],
    },
    twitter: { card: "summary", title, description, images: [SITE.ogImage] },
  };
}
