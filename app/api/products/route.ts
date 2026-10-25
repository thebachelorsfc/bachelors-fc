import { NextResponse } from "next/server"; import { store, newId, type Product } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getProducts } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getProducts()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error:"Admin login required" }, { status:401 });
  const b = await req.json(); const name = String(b.name||"").trim(); if (!name) return NextResponse.json({ error:"Product name required" }, { status:400 });
  const p: Product = { id:newId(), name, description: b.description||undefined, photo_url: b.photo_url||undefined,
    sizes: Array.isArray(b.sizes) && b.sizes.length ? b.sizes.map(String) : ["S","M","L","XL"],
    price_bdt: b.price_bdt===""||b.price_bdt==null ? null : Number(b.price_bdt),
    stock: b.stock===""||b.stock==null ? null : Number(b.stock),
    is_available: b.is_available!==false, sort: Number(b.sort)||0, created_at:new Date().toISOString() };
  const sb = supabaseWrite(); if (sb) { const { error } = await sb.from("products").insert({ name:p.name, description:p.description||null, photo_url:p.photo_url||null, sizes:p.sizes, price_bdt:p.price_bdt, stock:p.stock, is_available:p.is_available, sort:p.sort }); if (error) return NextResponse.json({ error:"Could not save product — has the Step 3 SQL been run in Supabase?" }, { status:500 }); }
  else await store.addProduct(p);
  return NextResponse.json(p); }
