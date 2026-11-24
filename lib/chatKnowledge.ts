import { SITE, KIT, PAYMENTS } from "./site";
import { getPlayers, getAllSessions, getGrounds } from "./data";

// Knowledge + fallback brain for the Bot Assistant chat widget.
// Facts come ONLY from the site's own data (lib/site.ts + live Supabase
// reads) — the assistant must never invent club facts. When a Gemini API
// key is configured the model answers from this same knowledge text;
// without a key, a keyword FAQ matcher below answers from it instead.

export type ChatPlayer = {
  name: string; jersey_no: number; position: string; position_code: string;
  matches: number; goals: number; assists: number; motm: number;
  cleanSheets: number; saves: number;
};

export type ChatFacts = {
  players: ChatPlayer[];
  nextSession: { date: string; time: string; title: string; opponent: string; ground: string } | null;
  grounds: string[];
};

// Club records, computed from the same live player stats the site's
// Record Book uses. Zero-value records are omitted; ties list everyone.
export function computeRecords(players: ChatPlayer[]) {
  const top = (get: (p: ChatPlayer) => number) => {
    const best = Math.max(0, ...players.map(get));
    if (best <= 0) return null;
    return { value: best, names: players.filter((p) => get(p) === best).map((p) => p.name) };
  };
  return {
    scorer: top((p) => p.goals),
    playmaker: top((p) => p.assists),
    appearances: top((p) => p.matches),
    motm: top((p) => p.motm),
    wall: top((p) => p.cleanSheets),
    saves: top((p) => p.saves),
  };
}

export function recordsText(players: ChatPlayer[]): string {
  const r = computeRecords(players);
  const parts: string[] = [];
  if (r.scorer) parts.push(`Top Scorer: ${r.scorer.names.join(" & ")} (${r.scorer.value} goals)`);
  if (r.playmaker) parts.push(`Top Playmaker: ${r.playmaker.names.join(" & ")} (${r.playmaker.value} assists)`);
  if (r.appearances) parts.push(`Most Appearances: ${r.appearances.names.join(" & ")} (${r.appearances.value} matches)`);
  if (r.motm) parts.push(`Most Man of the Match awards: ${r.motm.names.join(" & ")} (${r.motm.value})`);
  if (r.wall) parts.push(`The Wall (most clean sheets, goalkeeper): ${r.wall.names.join(" & ")} (${r.wall.value})`);
  if (r.saves) parts.push(`Most saves (goalkeeper): ${r.saves.names.join(" & ")} (${r.saves.value})`);
  return parts.join("; ");
}

const sessMs = (x: any) => {
  const [Y, M, D] = String(x.session_date).split("-").map(Number);
  const [h, mi] = String(x.session_time || "12:00").slice(0, 5).split(":").map(Number);
  return Date.UTC(Y, (M || 1) - 1, D || 1, (h || 0) - 6, mi || 0); // Dhaka = UTC+6
};

export async function getChatFacts(): Promise<ChatFacts> {
  const [players, sessions, grounds] = await Promise.all([
    getPlayers().catch(() => []),
    getAllSessions().catch(() => []),
    getGrounds().catch(() => []),
  ]);
  const now = Date.now();
  const next = (sessions as any[])
    .filter((s) => s.session_date && sessMs(s) > now)
    .sort((a, b) => sessMs(a) - sessMs(b))[0];
  return {
    players: (players as any[])
      .filter((p) => p.status !== "inactive")
      .map((p) => ({
        name: p.name, jersey_no: p.jersey_no, position: p.position, position_code: p.position_code || "",
        matches: p.matches_played || 0, goals: p.goals || 0, assists: p.assists || 0, motm: p.motm || 0,
        cleanSheets: p.clean_sheets || 0, saves: p.saves || 0,
      })),
    nextSession: next
      ? {
          date: next.session_date,
          time: String(next.session_time || "").slice(0, 5),
          title: next.title || "",
          opponent: next.opponent || "",
          ground: next.ground || "",
        }
      : null,
    grounds: (grounds as any[]).map((g) => g.name).filter(Boolean),
  };
}

export function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function knowledgeText(f: ChatFacts): string {
  const squad = f.players.map((p) => `#${p.jersey_no} ${p.name} (${p.position})`).join(", ");
  const next = f.nextSession
    ? `Next session: ${fmtDate(f.nextSession.date)}${f.nextSession.time ? ` at ${f.nextSession.time}` : ""}${f.nextSession.opponent ? ` — The Bachelors FC vs ${f.nextSession.opponent}` : f.nextSession.title ? ` — ${f.nextSession.title}` : " — Club Session"}${f.nextSession.ground ? ` at ${f.nextSession.ground}` : ""}.`
    : "There is no upcoming session scheduled right now.";
  const statLines = f.players.map((p) =>
    p.position_code === "GK"
      ? `#${p.jersey_no} ${p.name}: ${p.matches} matches, ${p.cleanSheets} clean sheets, ${p.saves} saves, ${p.motm} MOTM`
      : `#${p.jersey_no} ${p.name}: ${p.matches} matches, ${p.goals} goals, ${p.assists} assists, ${p.motm} MOTM`
  ).join("; ");
  const records = recordsText(f.players);
  return [
    `Club: ${SITE.name} (BFC) — an apolitical, non-profit football club in ${SITE.location}, founded in ${SITE.founded}. Motto: "${SITE.motto}" / "${SITE.mottoAlt}".`,
    `Player stats (live, from the club's own records): ${statLines}.`,
    ...(records ? [`Club records: ${records}. These come from the Record Book on the website.`] : []),
    `Founder: Mostafa (Saidul Mostafa Chowdhury). His official club title is "Founder & Managing Dictator" — the club's playful title for him, as shown on the People page. He is also the club captain and goalkeeper, shirt #99. So if anyone asks who the club's Dictator is, the answer is Mostafa.`,
    `Squad (${f.players.length} players): ${squad}.`,
    `Club folklore: Noman (#7, Forward) is the club's very own "Ashraful" — the beloved bot player famous for missing open-goal sitters. It is the club's long-running joke, always said with affection.`,
    next,
    `Grounds the club uses: ${f.grounds.join(", ") || "grounds in Khulshi, Chittagong"}.`,
    `How to join: Fill the application form on the Join page (${SITE.url}/join). It has 3 steps and also creates the player's login account. The club reviews the application; approved and linked players can log in and RSVP for sessions from their dashboard.`,
    `Club rules: Membership, attendance & RSVP, fees & funds, discipline, rewards, photos/media & privacy — full text on the Rules page (${SITE.url}/rules).`,
    `Home kit: ${KIT.base}, ${KIT.trim}, crest: ${KIT.crest}. The club jersey costs a fixed 500 BDT, ordered on the Store page (${SITE.url}/store); payment is manual bKash Send Money to ${PAYMENTS.bkash} with the transaction ID given in the order form.`,
    `Contact: email ${SITE.contacts.email}, Facebook page, Messenger ${SITE.contacts.messenger}, WhatsApp group (link in the site footer), Google Maps listing for directions.`,
    `Player login: ${SITE.url}/login — players RSVP IN / OUT / MAYBE for sessions from their dashboard.`,
    `The club never publishes match scorelines; results are celebrated without scores, out of respect for opponents.`,
  ].join("\n");
}

// ---- Fallback FAQ (used until GEMINI_API_KEY is set) ----

export function faqAnswer(qRaw: string, f: ChatFacts): string {
  const q = qRaw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const squadList = f.players.map((p) => `#${p.jersey_no} ${p.name} (${p.position})`).join(", ");

  // Greeting must match at the START of the message — a bare substring
  // check for "hi" also fires inside words like "this" or "which" and
  // swallowed real questions (owner's phone test, 2026-11-24).
  const qt = q.trim();
  const greet = /^(hi|hello|hey)\b/.test(qt) || qt.startsWith("আসসালাম") || qt.startsWith("হ্যালো") || qt.startsWith("হাই") || qt.includes("assalamu");
  if (greet)
    return "আসসালামু আলাইকুম! আমি Bot Assistant। ক্লাব, ম্যাচ, জয়েন করা, স্কোয়াড বা জার্সি নিয়ে যেকোনো প্রশ্ন করুন। 🖤💛";
  if (has("next match", "next session", "পরের ম্যাচ", "ম্যাচ কবে", "খেলা কবে", "session কবে", "কবে খেলা")) {
    if (!f.nextSession) return "এই মুহূর্তে কোনো আসন্ন সেশন নির্ধারিত নেই। নতুন সেশন এলেই ওয়েবসাইটের Next Match কার্ডে দেখা যাবে — চোখ রাখুন!";
    const n = f.nextSession;
    return `পরের সেশন: ${fmtDate(n.date)}${n.time ? `, সময় ${n.time}` : ""}${n.opponent ? ` — The Bachelors FC vs ${n.opponent}` : n.title ? ` — ${n.title}` : ""}${n.ground ? `, মাঠ: ${n.ground}` : ""}। RSVP করতে Player Login করুন: ${SITE.url}/login`;
  }
  if (has("join", "জয়েন", "যোগ দ", "সদস্য হ", "member", "খেলতে চাই", "ভর্তি"))
    return `BFC-তে জয়েন করতে ওয়েবসাইটের Join ফর্মটি পূরণ করুন: ${SITE.url}/join — ৩টি ধাপে আবেদন সম্পন্ন হয় এবং একই সঙ্গে আপনার প্লেয়ার লগইন অ্যাকাউন্ট তৈরি হয়। ক্লাব আবেদনটি যাচাই করে অনুমোদন দিলে আপনি লগইন করে সেশনে RSVP করতে পারবেন।`;
  if (has("jersey", "জার্সি", "kit", "price", "দাম", "কত টাকা", "order", "কিনতে", "store", "buy"))
    return `ক্লাব জার্সির দাম নির্ধারিত ৫০০ টাকা। অর্ডার করতে Store পেজে যান: ${SITE.url}/store — পেমেন্ট ম্যানুয়াল bKash Send Money (${PAYMENTS.bkash}) নম্বরে পাঠিয়ে TrxID টি অর্ডার ফর্মে দিতে হয়। কিট: ${KIT.base}, ${KIT.trim}।`;
  if (has("rule", "নিয়ম", "privacy", "নীতিমালা"))
    return `ক্লাবের পূর্ণ নিয়মাবলি (সদস্যপদ, উপস্থিতি ও RSVP, ফি, শৃঙ্খলা, পুরস্কার, ছবি ও গোপনীয়তা) Rules পেজে আছে: ${SITE.url}/rules`;
  if (has("record", "রেকর্ড", "top scorer", "সর্বোচ্চ গোল", "বেশি গোল", "most goal", "top playmaker", "most appearance", "most motm", "সেরা গোলদাতা", "কে সেরা")) {
    const rec = recordsText(f.players);
    if (!rec) return "এখনো কোনো রেকর্ড তৈরি হয়নি — পরিসংখ্যান ওয়েবসাইটের Record Book-এ দেখা যাবে।";
    return `ক্লাবের রেকর্ডসমূহ — ${rec}। বিস্তারিত ওয়েবসাইটের Record Book-এ আছে।`;
  }
  if (has("ashraful", "আশরাফুল", "bot player", "বট প্লেয়ার", "sitter"))
    return "আমাদের ক্লাবের নিজস্ব 'Ashraful' হলেন Noman (#7, Forward) — সবার প্রিয় বট প্লেয়ার, সহজ ওপেন-গোলের সুযোগ মিস করার জন্য ক্লাবের চিরচেনা রসিকতা! 😄";
  if (has("squad", "player", "স্কোয়াড", "খেলোয়াড়", "team", "দল"))
    return `বর্তমান স্কোয়াড (${f.players.length} জন): ${squadList}। বিস্তারিত প্রোফাইল ও পরিসংখ্যান: ${SITE.url}/squad`;
  if (has("captain", "ক্যাপ্টেন", "founder", "founded", "প্রতিষ্ঠাতা", "কে চালায়", "dictator"))
    return "ক্লাবের প্রতিষ্ঠাতা ও 'Founder & Managing Dictator' হলেন Mostafa (Saidul Mostafa Chowdhury) — তিনিই ক্লাবের ক্যাপ্টেন ও গোলকিপার (#99)।";
  if (has("contact", "যোগাযোগ", "email", "ইমেইল", "phone", "whatsapp", "facebook", "messenger"))
    return `যোগাযোগ: ইমেইল ${SITE.contacts.email} · Messenger ${SITE.contacts.messenger} · Facebook পেজ ও WhatsApp গ্রুপের লিংক ওয়েবসাইটের ফুটারে আছে।`;
  if (has("where", "কোথায়", "location", "ঠিকানা", "ground", "মাঠ", "khulshi"))
    return `ক্লাবটি Khulshi, Chittagong-এ। আমাদের মাঠগুলো: ${f.grounds.join(", ") || "Khulshi এলাকার মাঠসমূহ"}। বিস্তারিত: ${SITE.url}/grounds`;
  if (has("login", "লগইন", "rsvp", "dashboard"))
    return `প্লেয়ার লগইন: ${SITE.url}/login — অনুমোদিত প্লেয়াররা লগইন করে ড্যাশবোর্ড থেকে সেশনে IN / OUT / MAYBE RSVP দিতে পারেন। নতুন হলে আগে Join ফর্মটি পূরণ করুন।`;
  if (has("score", "স্কোর", "result", "ফলাফল", "কে জিতল", "হারল"))
    return "সম্মানিত প্রতিপক্ষের প্রতি শ্রদ্ধা রেখে BFC কোনো ম্যাচের স্কোরলাইন প্রকাশ করে না। ম্যাচ রিপোর্ট (স্কোর ছাড়া) ওয়েবসাইটের Fixtures & Results অংশে পাওয়া যায়।";
  if (has("ধন্যবাদ", "thank", "শুকরিয়া"))
    return "আপনাকেও ধন্যবাদ! আর কিছু জানতে চাইলে জিজ্ঞেস করুন। United, Not Alone. 🖤💛";
  return "দুঃখিত, এই প্রশ্নটার উত্তর আমার কাছে নেই। ক্লাব, ম্যাচ, জয়েন করা, স্কোয়াড, নিয়ম বা জার্সি নিয়ে জিজ্ঞেস করে দেখুন — অথবা সরাসরি যোগাযোগ করুন: " + SITE.contacts.email;
}
