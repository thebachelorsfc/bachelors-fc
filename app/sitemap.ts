import type { MetadataRoute } from "next"; import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { return ["","/about","/history","/news","/squad","/your-xi","/people","/gallery","/store","/contact","/grounds","/rules","/join","/login"].map(p=>({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p===""?1:.8 })); }
