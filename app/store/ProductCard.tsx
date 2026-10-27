"use client";
import { useState } from "react";
import Image from "next/image";
import { SITE, PAYMENTS } from "@/lib/site";
import Jersey3D from "@/components/Jersey3D";

export type ProductLike = { id: string; name: string; description?: string | null; photo_url?: string | null; sizes?: string[] | null; price_bdt?: number | null; stock?: number | null; is_available?: boolean };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--field-br)", background: "var(--field-bg)", color: "var(--field-tx)", marginTop: 8 };

export default function ProductCard({ p, featured }: { p: ProductLike; featured?: boolean }) {
  const sizes = p.sizes?.length ? p.sizes : ["S", "M", "L", "XL"];
  const [size, setSize] = useState(sizes[Math.min(1, sizes.length - 1)]);
  const priced = typeof p.price_bdt === "number" && p.price_bdt > 0;
  const soldOut = priced && typeof p.stock === "number" && p.stock <= 0;
  const methods = ([["bkash", "bKash"], ["nagad", "Nagad"]] as const).filter(([k]) => PAYMENTS[k]);
  const [openForm, setOpenForm] = useState(false);
  const [f, setF] = useState({ customer_name: "", phone: "", address: "", payment_method: (methods[0]?.[0] || "messenger") as string, sender_number: "", trx_id: "" });
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [err, setErr] = useState("");
  async function placeOrder() {
    setBusy(true); setErr("");
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, product_id: p.id, size }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) setDone(true); else setErr(j.error || "Order failed — try again or message the club.");
  }
  return (
    <article className="card" style={{ padding: featured ? 22 : 16 }}>
      {p.photo_url && (featured
        ? <Jersey3D src={p.photo_url} alt={p.name} />
        : <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: 12, overflow: "hidden", background: "#0a1633", marginBottom: 14 }}>
            <Image src={p.photo_url} alt={p.name} fill sizes="(max-width:640px) 90vw, 360px" style={{ objectFit: "cover" }} />
          </div>)}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: featured ? 14 : 0 }}>
        <h3 style={{ margin: 0, fontSize: featured ? 26 : 20 }}>{p.name}</h3>
        {!priced && <span className="eyebrow" style={{ fontSize: ".62rem" }}>Showcase</span>}
        {soldOut && <span className="eyebrow" style={{ fontSize: ".62rem", color: "var(--bad)" }}>Sold out</span>}
      </div>
      {p.description && <p style={{ color: "var(--muted)", margin: "8px 0 12px" }}>{p.description}</p>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {sizes.map((s) => (
          <button key={s} onClick={() => setSize(s)} style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (size === s ? "var(--gold)" : "var(--chip-br)"), background: size === s ? "#c9a22722" : "transparent", color: "var(--paper)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{s}</button>
        ))}
      </div>
      {priced ? (
        soldOut ? <p style={{ color: "var(--muted)" }}>This size run is sold out — message the club for the next batch.</p> : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>৳{p.price_bdt}</strong>
              {!openForm && !done && <button className="btn" style={{ padding: ".65rem 1.3rem" }} onClick={() => setOpenForm(true)}>Order now — size {size}</button>}
              <a className="btn ghost" style={{ padding: ".65rem 1.2rem" }} href={SITE.contacts.whatsappGroup} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            {done ? (
              <div style={{ marginTop: 14, border: "1px solid var(--line-gold)", borderRadius: 12, padding: "14px 16px" }}>
                <strong>✅ Order received!</strong>
                <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>The club will call/WhatsApp you at <strong style={{ color: "var(--paper)" }}>{f.phone}</strong> to confirm{f.payment_method !== "messenger" ? " after checking your Transaction ID" : ""}. Delivery charge, if any, will be confirmed then. Keep your TrxID handy.</p>
              </div>
            ) : openForm && (
              <div style={{ marginTop: 14 }}>
                <input style={inp} placeholder="Your full name" value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} />
                <input style={inp} placeholder="Mobile number (01XXXXXXXXX)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <textarea style={{ ...inp, minHeight: 64 }} placeholder="Delivery address (house, road, area, city)" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
                {methods.length > 0 ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      {methods.map(([k, l]) => (
                        <button key={k} onClick={() => setF({ ...f, payment_method: k })} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid " + (f.payment_method === k ? "var(--gold)" : "var(--chip-br)"), background: f.payment_method === k ? "#c9a22722" : "transparent", color: "var(--paper)", fontWeight: 700, cursor: "pointer" }}>{l}</button>
                      ))}
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>
                      Send <strong style={{ color: "var(--paper)" }}>৳{p.price_bdt}</strong> ({f.payment_method === "bkash" ? "bKash" : "Nagad"} Send Money) to <strong style={{ color: "var(--gold-text)", fontSize: 16 }}>{PAYMENTS[f.payment_method as "bkash" | "nagad"]}</strong>, then enter:
                    </p>
                    <input style={inp} placeholder="Number you sent from (01XXXXXXXXX)" value={f.sender_number} onChange={(e) => setF({ ...f, sender_number: e.target.value })} />
                    <input style={inp} placeholder="Transaction ID (TrxID)" value={f.trx_id} onChange={(e) => setF({ ...f, trx_id: e.target.value })} />
                  </>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>Place the order now — the club will contact you to arrange bKash/Nagad payment and delivery.</p>
                )}
                {err && <p style={{ color: "var(--bad)", marginTop: 10 }}>{err}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="btn" disabled={busy} onClick={placeOrder}>{busy ? "Placing…" : `Confirm order — ৳${p.price_bdt}`}</button>
                  <button className="btn ghost" onClick={() => setOpenForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Not on sale yet — the club will announce when orders open.</span>
          <a className="btn ghost" style={{ padding: ".6rem 1.2rem" }} href={SITE.contacts.messenger} target="_blank" rel="noreferrer">Ask the club</a>
        </div>
      )}
    </article>
  );
}
