import type { Metadata } from "next";
import JoinForm from "./JoinForm";
import CardCarousel from "@/components/CardCarousel";

import { pageMeta } from "@/lib/meta";
export const metadata: Metadata = pageMeta("Join | The Bachelors FC", "Join The Bachelors FC — the football club for bachelor youth in Khulshi, Chittagong. One application form, a trial session, then your jersey number.", "/join");

const STEPS = [
  ["1 · Apply", "One single form: your details, your position — and your account password."],
  ["2 · Trial", "Join a session and show us what you've got."],
  ["3 · Play", "Get your jersey number and RSVP to sessions."],
];

const FAQS: [string, string][] = [
  [
    "What is The Bachelors FC?",
    "The Bachelors FC is an apolitical, non-profit football club in Khulshi, Chittagong, founded in 2026 for bachelor youth. The club is built on brotherhood, discipline and purpose — its motto is “Forged in Brotherhood, Driven by Purpose.”",
  ],
  [
    "Who can join The Bachelors FC?",
    "The club is open to bachelor youth in Chittagong who want brotherhood, discipline, and a reason to show up. If you are a bachelor and ready to commit to regular sessions, you can apply.",
  ],
  [
    "How do I join The Bachelors FC?",
    "Fill in the single application form on this page — the same form creates your player account, so there is no second sign-up later. Our team reviews every application. Approved players receive a jersey number and can RSVP to sessions from their player dashboard.",
  ],
  [
    "Where does The Bachelors FC play?",
    "The club plays at grounds in and around Khulshi, Chittagong, including Stadium X, Diesel Colony Play Ground, Jhautala Playground and Shahid Sahjahan Field.",
  ],
  [
    "How can another club arrange a friendly match with BFC?",
    "Email the club at thebachelorsfc@gmail.com — that is the official channel for club-to-club contact. You can also message the club through its Facebook page.",
  ],
  [
    "How can I buy the official BFC jersey?",
    "The Bachelors FC home jersey is available in the club store on this website for ৳500. Orders are paid by bKash Send Money, quoting the transaction ID with the order.",
  ],
  [
    "Is The Bachelors FC on Facebook?",
    "Yes. Follow The Bachelors FC on Facebook for match posters, photos, videos and club news.",
  ],
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Join() {
  return (
    <main className="wrap">
      <section>
        <p className="eyebrow">How to Join</p>
        <h1>Ready to belong to something real?</h1>
        <p className="copy" style={{ maxWidth: 720 }}>
          The Bachelors FC is open to bachelor youth in Chittagong who want brotherhood, discipline, and a reason to
          show up. One single form does everything — your application and your player account are created together, so
          there is no second sign-up later. Our team reviews every application before adding you to the club.
        </p>
        <div style={{ marginBottom: 20 }}>
          <CardCarousel slide="min(320px,84%)">
            {STEPS.map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p style={{ color: "var(--muted)" }}>{d}</p>
              </div>
            ))}
          </CardCarousel>
        </div>
        <JoinForm />
      </section>
      <section style={{ marginTop: 56 }}>
        <p className="eyebrow">Good to Know</p>
        <h2>Frequently asked questions</h2>
        <div style={{ marginTop: 10, maxWidth: 820 }}>
          {FAQS.map(([q, a]) => (
            <div key={q} style={{ borderTop: "1px solid #c9a22744", padding: "18px 2px 20px" }}>
              <h3 style={{ marginTop: 0 }}>{q}</h3>
              <p className="copy" style={{ marginBottom: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
    </main>
  );
}
