"use client";
import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/lib/site";

// Club's public page URL — username matches the m.me/TheBachelorsFC link on the original site.
const PAGE_URL = "https://www.facebook.com/TheBachelorsFC";
const PLUGIN_SRC =
  "https://www.facebook.com/plugins/page.php?href=" +
  encodeURIComponent(PAGE_URL) +
  "&tabs=timeline&width=500&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false";

export default function FacebookFeed() {
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="wrap" id="facebook">
      <p className="eyebrow">Stay Connected</p>
      <h2>From our Facebook</h2>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", alignItems: "start" }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <Image
            src="/assets/logo-transparent.png"
            alt="The Bachelors FC crest"
            width={92}
            height={109}
            style={{ objectFit: "contain", margin: "6px auto 10px" }}
          />
          <h3 style={{ margin: "4px 0" }}>The Bachelors FC</h3>
          <p style={{ color: "var(--muted)", maxWidth: 380, margin: "0 auto 14px" }}>
            Match updates, training moments and brotherhood — straight from the club&apos;s Facebook
            page. New posts appear here on their own.
          </p>
          <a className="btn" href={SITE.contacts.facebook} target="_blank" rel="noreferrer">
            Follow on Facebook
          </a>
          {!loaded && (
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 14 }}>
              Feed loading… if it stays blank on your phone, tap the button above to see the page
              directly.
            </p>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            maxWidth: 520,
            width: "100%",
            margin: "0 auto",
            lineHeight: 0,
          }}
        >
          <iframe
            title="The Bachelors FC on Facebook"
            src={PLUGIN_SRC}
            width="500"
            height="640"
            style={{ border: "none", overflow: "hidden", width: "100%", maxWidth: 500 }}
            loading="lazy"
            allow="encrypted-media"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </section>
  );
}
