import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { promises as fs } from "fs"; import path from "path";
export const dynamic = "force-dynamic";
// Upload a NEW photo file for a ground (replaces the current photo).
export async function POST(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const fd = await req.formData(); const file = fd.get("photo");
  if (!file || typeof file === "string" || file.size === 0) return NextResponse.json({ error: "Choose a photo file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Photo must be under 10MB" }, { status: 400 });
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const name = `ground-${newId()}.${ext}`; const buf = Buffer.from(await file.arrayBuffer());
  const sb = supabaseWrite(); let photo_url = "";
  if (sb) {
    const up = await sb.storage.from("gallery").upload(`grounds/${name}`, buf, { contentType: file.type || "image/jpeg" });
    if (up.error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    photo_url = sb.storage.from("gallery").getPublicUrl(`grounds/${name}`).data.publicUrl;
    const { error } = await sb.from("grounds").update({ photo_url }).eq("id", params.id);
    if (error) return NextResponse.json({ error: "Could not save photo" }, { status: 500 });
  } else {
    await fs.mkdir(path.join(process.cwd(), "public", "uploads", "grounds"), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), "public", "uploads", "grounds", name), buf); photo_url = `/uploads/grounds/${name}`;
    const g = await store.updateGround(params.id, { photo_url }); if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, photo_url }); }
export async function PATCH(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of ["name", "area", "address", "maps_url", "photo_url"]) if (k in b) patch[k] = b[k] || null;
  if ("matches_played" in b) patch.matches_played = Number.isFinite(+b.matches_played) ? +b.matches_played : 0;
  if ("last_played" in b) patch.last_played = b.last_played || null;
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("grounds").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 }); return NextResponse.json({ ok: true }); }
  const g = await store.updateGround(params.id, patch); return g ? NextResponse.json(g) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sb = supabaseWrite(); if (sb) { await sb.from("grounds").delete().eq("id", params.id); } else await store.deleteGround(params.id);
  return NextResponse.json({ ok: true }); }
