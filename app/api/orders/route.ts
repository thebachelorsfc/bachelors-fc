import { NextResponse } from "next/server"; import { store, newId, type Order } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { getProducts } from "@/lib/data"; import { PAYMENTS } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (String(b.website || "")) return NextResponse.json({ ok: true }); // honeypot
  const products: any[] = await getProducts();
  const product = products.find((p) => String(p.id) === String(b.product_id)) || products.find((p) => p.name === b.product_name);
  if (!product || typeof product.price_bdt !== "number" || product.price_bdt <= 0)
    return NextResponse.json({ error: "This product is not on sale right now" }, { status: 400 });
  const customer_name = String(b.customer_name || "").trim(), phone = String(b.phone || "").trim(), address = String(b.address || "").trim();
  if (!customer_name || !address) return NextResponse.json({ error: "Name and delivery address required" }, { status: 400 });
  if (!/^01\d{9}$/.test(phone.replace(/[\s-]/g, ""))) return NextResponse.json({ error: "Valid mobile number required (01XXXXXXXXX)" }, { status: 400 });
  let method = String(b.payment_method || "") as Order["payment_method"];
  const sender_number = String(b.sender_number || "").trim(), trx_id = String(b.trx_id || "").trim().toUpperCase();
  if (method === "bkash" || method === "nagad") {
    if (!PAYMENTS[method]) return NextResponse.json({ error: "That payment method is not available yet" }, { status: 400 });
    if (!sender_number || !trx_id) return NextResponse.json({ error: "Your payment number and Transaction ID are required" }, { status: 400 });
  } else method = "messenger";
  const order: Order = { id: newId(), product_id: String(product.id), product_name: product.name, size: String(b.size || ""), amount_bdt: product.price_bdt, customer_name, phone, address, payment_method: method, sender_number: sender_number || undefined, trx_id: trx_id || undefined, status: "pending", created_at: new Date().toISOString() };
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("orders").insert({ product_id: order.product_id, product_name: order.product_name, size: order.size || null, amount_bdt: order.amount_bdt, customer_name, phone, address, payment_method: method, sender_number: order.sender_number || null, trx_id: order.trx_id || null }); if (error) return NextResponse.json({ error: "Could not place the order — has the orders SQL been run in Supabase?" }, { status: 500 }); }
  else await store.addOrder(order);
  return NextResponse.json({ ok: true, id: order.id });
}
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sb = supabaseWrite(); if (sb) { const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }); return NextResponse.json(data ?? []); }
  return NextResponse.json(await store.orders()); }
