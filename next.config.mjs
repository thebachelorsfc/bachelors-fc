/** @type {import('next').NextConfig} */
// Supabase Storage hosts player/gallery/application photos — next/image refuses
// remote hosts that are not listed here (that is why storage photos broke on cards).
const supabaseHost = (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return "gpjkjrvxacgojwmfukdy.supabase.co"; } })();
const nextConfig = { images: { minimumCacheTTL: 604800, remotePatterns: [{ protocol: "https", hostname: "bachelors-fc.vercel.app" }, { protocol: "https", hostname: "thebachelorsfc.netlify.app" }, { protocol: "https", hostname: supabaseHost }] },
  // The Privacy Policy lives on the Rules & Policy page (owner's call, 2026-11-03);
  // /privacy stays as a true HTTP 308 so shared links (e.g. the Facebook Page
  // privacy-policy field) land on the policy.
  async redirects() { return [{ source: "/privacy", destination: "/rules", permanent: true }]; } };
export default nextConfig;
