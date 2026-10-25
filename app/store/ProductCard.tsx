"use client";
import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/lib/site";

export type ProductLike = { id: string; name: string; description?: string | null; photo_url?: string | null; sizes?: string[] | null; price_bdt?: number | null; stock?: number | null; is_available?: boolean };

export default function ProductCard({ p, featured }: { p: ProductLike; featured?: boolean }) {
  const sizes = p.sizes?.length ? p.sizes : ["S", "M", "L", "XL"];
  const [size, setSize] = useState(sizes[Math.min(1, sizes.length - 1)]);
  const priced = typeof p.price_bdt === "number" && p.price_bdt > 0;
  const soldOut = priced && typeof p.stock === "number" && p.stock <= 0;
  return (
    <article className="card" style={{ padding: featured ? 22 : 16 }}>
      {p.photo_url && (
        <div style={{ position: "relative", width: "100%", aspectRatio: featured ? "4/3" : "1/1", borderRadius: 12, overflow: "hidden", background: "#0a1633", marginBottom: 14 }}>
          <Image src={p.photo_url} alt={p.name} fill sizes={featured ? "(max-width:800px) 90vw, 560px" : "(max-width:640px) 90vw, 360px"} style={{ objectFit: "cover" }} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: featured ? 26 : 20 }}>{p.name}</h3>
        {!priced && <span className="eyebrow" style={{ fontSize: ".62rem" }}>Showcase</span>}
        {soldOut && <span className="eyebrow" style={{ fontSize: ".62rem", color: "#ff9d9d" }}>Sold out</span>}
      </div>
      {p.description && <p style={{ color: "var(--muted)", margin: "8px 0 12px" }}>{p.description}</p>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {sizes.map((s) => (
          <button key={s} onClick={() => setSize(s)} style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (size === s ? "var(--gold)" : "#ffffff2e"), background: size === s ? "#c9a22722" : "transparent", color: "var(--paper)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{s}</button>
        ))}
      </div>
      {priced ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <strong style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>৳{p.price_bdt}</strong>
          {!soldOut && <>
            <a className="btn" style={{ padding: ".6rem 1.2rem" }} href={SITE.contacts.messenger} target="_blank" rel="noreferrer">Order — size {size}</a>
            <a className="btn ghost" style={{ padding: ".6rem 1.2rem" }} href={SITE.contacts.whatsappGroup} target="_blank" rel="noreferrer">WhatsApp</a>
          </>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Not on sale yet — the club will announce when orders open.</span>
          <a className="btn ghost" style={{ padding: ".6rem 1.2rem" }} href={SITE.contacts.messenger} target="_blank" rel="noreferrer">Ask the club</a>
        </div>
      )}
    </article>
  );
}
