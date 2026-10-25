import { SITE } from "@/lib/site"; import { getSocialPosts } from "@/lib/data"; import SocialCarousel from "@/components/SocialCarousel";

// Club's public page URL — username matches the m.me/TheBachelorsFC link on the original site.
const PAGE_URL = "https://www.facebook.com/TheBachelorsFC";
const PLUGIN_SRC =
  "https://www.facebook.com/plugins/page.php?href=" +
  encodeURIComponent(PAGE_URL) +
  "&tabs=timeline&width=500&height=560&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false";

export default async function FacebookFeed() {
  const posts = await getSocialPosts();
  return (
    <section className="wrap" id="facebook">
      <p className="eyebrow">On Social</p>
      <h2>Latest from the club</h2>
      <p style={{ color: "var(--muted)", maxWidth: 620, marginTop: 6 }}>
        Matchday moments, results and announcements — straight from our Facebook page.
      </p>
      <p style={{ marginTop: 18 }}>
        <a className="btn" href={SITE.contacts.facebook} target="_blank" rel="noreferrer">
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(0,0,0,.28)",
              fontWeight: 800,
              fontSize: 15,
              marginRight: 9,
              lineHeight: 1,
            }}
          >
            f
          </span>
          Follow on Facebook
        </a>
      </p>

      {posts.length > 0 ? (
        <div style={{ marginTop: 30 }}><SocialCarousel posts={posts} /></div>
      ) : (
      <div
        className="card"
        style={{ marginTop: 30, padding: 0, overflow: "hidden", maxWidth: 580, marginLeft: "auto", marginRight: "auto" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--gold)",
              color: "#0a0f1e",
              fontWeight: 800,
              fontSize: 19,
              lineHeight: 1,
            }}
          >
            f
          </span>
          <strong style={{ fontSize: 17 }}>Facebook</strong>
          <a
            href={PAGE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: "auto", color: "var(--gold2)", fontWeight: 600 }}
          >
            Open ↗
          </a>
        </div>
        <div style={{ background: "#fff", height: 560, overflow: "hidden", lineHeight: 0 }}>
          <iframe
            title="The Bachelors FC on Facebook"
            src={PLUGIN_SRC}
            width="500"
            height="560"
            style={{ border: "none", overflow: "hidden", width: "100%", maxWidth: 500, display: "block", margin: "0 auto" }}
            loading="lazy"
            allow="encrypted-media"
          />
        </div>
      </div>
      )}
    </section>
  );
}
