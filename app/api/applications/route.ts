import { NextResponse } from "next/server"; import { promises as fs } from "fs"; import path from "path";
import { store, newId, type Application } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const REQUIRED = ["full_name","location","email","mobile","educational_background","age"] as const;
export async function POST(req: Request) {
  const fd = await req.formData();
  if (String(fd.get("website") || "")) return NextResponse.json({ ok:true }); // honeypot — silently accept bots
  const v: Record<string,string> = {}; fd.forEach((val,k)=>{ if (typeof val === "string") v[k]=val.trim(); });
  const missing = REQUIRED.filter(f=>!v[f]); if (missing.length) return NextResponse.json({ error:`Missing: ${missing.join(", ")}` }, { status:400 });
  if (!/^\S+@\S+\.\S+$/.test(v.email)) return NextResponse.json({ error:"Valid email required" }, { status:400 });
  const age = Number(v.age); if (!age || age<10 || age>80) return NextResponse.json({ error:"Valid age required" }, { status:400 });
  let photo_url: string|undefined;
  const sb = supabaseWrite();
  const file = fd.get("photo"); if (file && typeof file!=="string" && file.size>0) {
    if (file.size > 5*1024*1024) return NextResponse.json({ error:"Photo must be under 5MB" }, { status:400 });
    const ext = (file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
    const name = `app-${newId()}.${ext}`; const buf = Buffer.from(await file.arrayBuffer());
    // Photo goes to Supabase Storage (the live hosts have a read-only filesystem —
    // writing to disk there hangs/crashes the submission). A photo problem must
    // never block the application itself, so failures continue without a photo.
    try {
      if (sb) {
        const up = await sb.storage.from("gallery").upload(`applications/${name}`, buf, { contentType: file.type || "image/jpeg" });
        if (!up.error) photo_url = sb.storage.from("gallery").getPublicUrl(`applications/${name}`).data.publicUrl;
      } else {
        await fs.mkdir(path.join(process.cwd(),"public","uploads"),{recursive:true});
        await fs.writeFile(path.join(process.cwd(),"public","uploads",name), buf); photo_url = `/uploads/${name}`;
      }
    } catch { /* keep photo_url undefined and save the application anyway */ }
  }
  const app: Application = { id:newId(), full_name:v.full_name, location:v.location, email:v.email, mobile:v.mobile, whatsapp:v.whatsapp||undefined, educational_background:v.educational_background, marital_status:v.marital_status||undefined, age, occupation:v.occupation||undefined, why_join:v.why_join||undefined, preferred_position:v.preferred_position||undefined, blood_group:v.blood_group||undefined, photo_url, status:"pending", created_at:new Date().toISOString() };
  if (sb) { const { error } = await sb.from("applications").insert({ ...app, id:undefined }); if (error) return NextResponse.json({ error:"Could not save application" }, { status:500 }); }
  else await store.addApplication(app);
  return NextResponse.json({ ok:true, id:app.id });
}
export async function GET() { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const sb = supabaseWrite(); if (sb) { const { data } = await sb.from("applications").select("*").order("created_at",{ascending:false}); return NextResponse.json(data ?? []); }
  return NextResponse.json(await store.applications()); }
