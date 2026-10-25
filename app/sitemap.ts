import type { MetadataRoute } from "next"; import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { return ["","/about","/history","/squad","/gallery","/store","/contact","/grounds","/rules","/join","/login"].map(p=>({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p===""?1:.8 })); }
