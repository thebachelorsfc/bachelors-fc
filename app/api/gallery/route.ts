import { NextResponse } from "next/server"; import { promises as fs } from "fs"; import path from "path";
import { store, newId, type GalleryItem } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getGalleryItems } from "@/lib/data";
export const dynamic = "force-dynamic";
const CATS = ["match","training","tour","team"];
export async function GET() { return NextResponse.json(await getGalleryItems()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const fd = await req.formData();
  const file = fd.get("photo"); const caption = String(fd.get("caption")||"").trim();
  const category = String(fd.get("category")||"team"); const taken_on = String(fd.get("taken_on")||"");
  if (!CATS.includes(category)) return NextResponse.json({ error:"Pick a category" }, { status:400 });
  if (!file || typeof file==="string" || file.size===0) return NextResponse.json({ error:"Choose a photo" }, { status:400 });
  if (file.size > 10*1024*1024) return NextResponse.json({ error:"Photo must be under 10MB" }, { status:400 });
  const ext = (file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
  const name = `g-${newId()}.${ext}`; const buf = Buffer.from(await file.arrayBuffer());
  const item: GalleryItem = { id:newId(), photo_url:"", caption: caption||undefined, category: category as GalleryItem["category"], taken_on: taken_on||undefined, created_at:new Date().toISOString() };
  const sb = supabaseWrite();
  if (sb) {
    const up = await sb.storage.from("gallery").upload(name, buf, { contentType: file.type || "image/jpeg" });
    if (up.error) return NextResponse.json({ error:"Photo upload failed — has the Phase 3 SQL been run in Supabase? (storage bucket 'gallery')" }, { status:500 });
    item.photo_url = sb.storage.from("gallery").getPublicUrl(name).data.publicUrl;
    const { error } = await sb.from("gallery_items").insert({ photo_url:item.photo_url, caption:item.caption||null, category:item.category, taken_on:item.taken_on||null });
    if (error) return NextResponse.json({ error:"Could not save photo — has the Phase 3 SQL been run in Supabase?" }, { status:500 });
  } else {
    await fs.mkdir(path.join(process.cwd(),"public","uploads","gallery"),{recursive:true});
    await fs.writeFile(path.join(process.cwd(),"public","uploads","gallery",name), buf);
    item.photo_url = `/uploads/gallery/${name}`;
    await store.addGalleryItem(item);
  }
  return NextResponse.json(item); }
