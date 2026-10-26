import Image from "next/image";
import { getProducts } from "@/lib/data";
import { KIT } from "@/lib/site";
import ProductCard from "./ProductCard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Store | The Bachelors FC" };
export default async function StorePage() {
  const products: any[] = (await getProducts()).filter((p: any) => p.is_available !== false);
  const [first, ...rest] = products;
  const anyPriced = products.some((p: any) => typeof p.price_bdt === "number" && p.price_bdt > 0);
  return (
    <main className="wrap">
      <section style={{ paddingBottom: 30 }}>
        <p className="eyebrow">Club Store</p>
        <h1>Wear the badge</h1>
        <p style={{ color: "var(--muted)", maxWidth: 680 }}>The BFC home kit — white and navy pinstripes, gold crest on the chest. Not just fabric: what eleven men chose to belong to.</p>
        {!anyPriced && products.length > 0 && (
          <div className="card" style={{ marginTop: 18, borderColor: "var(--line-gold)" }}>
            <strong>Showcase mode:</strong> <span style={{ color: "var(--muted)" }}>The kit is on display, not on sale — yet. When the club opens orders, prices and ordering will appear right here.</span>
          </div>
        )}
        {products.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "44px 22px", marginTop: 20 }}>
            <h3 style={{ margin: "0 0 6px" }}>The store is being stocked</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>Club gear will appear here soon.</p>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 22 }}><ProductCard p={first} featured /></div>
            <div className="card" style={{ marginTop: 18 }}>
              <p className="eyebrow">Kit specification</p>
              <ul style={{ color: "var(--muted)", margin: "6px 0 0", lineHeight: 1.9 }}>
                <li>Base: {KIT.base}</li><li>Trim: {KIT.trim}</li><li>Crest: {KIT.crest}</li>
              </ul>
            </div>
            <figure style={{ margin: "20px 0 0", position: "relative", borderRadius: 22, overflow: "hidden", border: "1px solid #c9a22733", boxShadow: "0 26px 60px #00000059, inset 0 0 0 1px #ffffff0d", lineHeight: 0 }}>
              <Image src="/assets/kit-worn.jpg" alt="The Bachelors FC 2026 home kit worn on the pitch" width={1200} height={1200} sizes="(max-width:900px) 100vw, 900px" style={{ width: "100%", height: "auto" }} />
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#06060a30 0%,transparent 26%,transparent 78%,#06060a38 100%)", pointerEvents: "none" }} />
              <figcaption style={{ position: "absolute", top: 16, left: 16, lineHeight: 1 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "#06060ab8", backdropFilter: "blur(6px)", border: "1px solid #c9a22766", color: "var(--gold2)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase" }}>See it worn</span>
              </figcaption>
            </figure>
            {rest.length > 0 && (
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 18 }}>
                {rest.map((p: any) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
