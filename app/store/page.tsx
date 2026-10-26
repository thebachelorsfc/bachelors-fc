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
            <figure style={{ margin: "20px 0 0", position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 22px 50px #0000004d", lineHeight: 0 }}>
              <Image src="/assets/kit-worn.jpg" alt="The Bachelors FC 2026 home kit worn on the pitch" width={1200} height={1200} sizes="(max-width:900px) 100vw, 900px" style={{ width: "100%", height: "auto" }} />
              <figcaption style={{ position: "absolute", left: 0, right: 0, bottom: 0, lineHeight: 1.5, padding: "52px 22px 18px", background: "linear-gradient(180deg,transparent,#06060acc)", color: "#f7f5ef" }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>See it worn</span>
                <span style={{ fontSize: 15.5 }}>The 2026 home kit under the lights — white pinstripes, navy shoulders and trim, the gold crest on the chest. This is how it looks on the pitch, before you make it yours.</span>
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
