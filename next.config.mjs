/** @type {import('next').NextConfig} */
// Supabase Storage hosts player/gallery/application photos — next/image refuses
// remote hosts that are not listed here (that is why storage photos broke on cards).
const supabaseHost = (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return "gpjkjrvxacgojwmfukdy.supabase.co"; } })();
const nextConfig = { images: { remotePatterns: [{ protocol: "https", hostname: "thebachelorsfc.netlify.app" }, { protocol: "https", hostname: supabaseHost }] } };
export default nextConfig;
