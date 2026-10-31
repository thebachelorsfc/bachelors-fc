import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { newId } from "@/lib/store";
export const dynamic = "force-dynamic";
const EXTS = ["jpg", "jpeg", "png", "webp"];
const MAX = 5;
type Slide = { url: string; path: string };
async function readSlides(w: any): Promise<Slide[]> {
  const { data } = await w.storage.from("gallery").download("hero/slides.json");
  if (!data) return [];
  try { const j = JSON.parse(await data.text()); return Array.isArray(j?.slides) ? j.slides : []; } catch { return []; }
}
async function saveSlides(w: any, slides: Slide[]) {
  return w.storage.from("gallery").upload("hero/slides.json", new Blob([JSON.stringify({ slides })], { type: "application/json" }), { upsert: true, contentType: "application/json", cacheControl: "0" });
}
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ slides: [] });
  return NextResponse.json({ slides: await readSlides(w) }); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Storage is not set up yet" }, { status: 501 });
  const b = await req.json().catch(() => ({}));
  if (b.action === "url") {
    const ext = String(b.ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!EXTS.includes(ext)) return NextResponse.json({ error: "JPG, PNG or WebP photos work best." }, { status: 400 });
    const slides = await readSlides(w);
    if (slides.length >= MAX) return NextResponse.json({ error: `The hero holds at most ${MAX} photos — remove one first.` }, { status: 400 });
    const path = `hero/${newId()}.${ext}`;
    const { data, error } = await w.storage.from("gallery").createSignedUploadUrl(path);
    if (error || !data?.token) return NextResponse.json({ error: "Could not start the upload — please try again" }, { status: 500 });
    return NextResponse.json({ token: data.token, path, url: w.storage.from("gallery").getPublicUrl(path).data.publicUrl });
  }
  if (b.action === "add") {
    const slides = await readSlides(w);
    if (slides.length >= MAX) return NextResponse.json({ error: `The hero holds at most ${MAX} photos.` }, { status: 400 });
    if (!b.path || !b.url) return NextResponse.json({ error: "Missing photo" }, { status: 400 });
    slides.push({ url: String(b.url), path: String(b.path) });
    const { error } = await saveSlides(w, slides);
    if (error) return NextResponse.json({ error: "Could not save the slide list" }, { status: 500 });
    return NextResponse.json({ slides });
  }
  if (b.action === "remove") {
    const slides = (await readSlides(w)).filter((s) => s.path !== b.path);
    const { error } = await saveSlides(w, slides);
    if (error) return NextResponse.json({ error: "Could not save the slide list" }, { status: 500 });
    if (b.path) await w.storage.from("gallery").remove([String(b.path)]);
    return NextResponse.json({ slides });
  }
  if (b.action === "move") {
    const slides = await readSlides(w);
    const i = slides.findIndex((s) => s.path === b.path);
    const j = i + (b.dir === -1 ? -1 : 1);
    if (i < 0 || j < 0 || j >= slides.length) return NextResponse.json({ slides });
    [slides[i], slides[j]] = [slides[j], slides[i]];
    const { error } = await saveSlides(w, slides);
    if (error) return NextResponse.json({ error: "Could not save the slide list" }, { status: 500 });
    return NextResponse.json({ slides });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 }); }
