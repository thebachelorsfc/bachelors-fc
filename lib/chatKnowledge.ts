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
  joinedYear: number; foot: string; yellow: number; red: number; pensSaved: number;
  passing: number; passion: number; speed: number; isCaptain: boolean;
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
        joinedYear: p.joined_year || 2026, foot: p.preferred_foot || "", yellow: p.yellow_cards || 0,
        red: p.red_cards || 0, pensSaved: p.penalties_saved || 0,
        passing: p.passing || 0, passion: p.passion || 0, speed: p.speed || 0, isCaptain: !!p.is_captain,
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
  const statLines = f.players.map((p) => {
    const base = `#${p.jersey_no} ${p.name} (${p.position}${p.isCaptain ? ", club captain" : ""}, member since ${p.joinedYear}${p.foot ? `, preferred foot: ${p.foot}` : ""})`;
    const stats = p.position_code === "GK"
      ? `${p.matches} matches, ${p.cleanSheets} clean sheets, ${p.saves} saves, ${p.pensSaved} penalties saved, ${p.motm} MOTM, ${p.yellow} yellow cards`
      : `${p.matches} matches, ${p.goals} goals, ${p.assists} assists, ${p.motm} MOTM, ${p.yellow} yellow cards, ${p.red} red cards`;
    const ratings = p.passing || p.passion || p.speed ? ` Coach ratings: Passing ${p.passing}, Passion ${p.passion}, Speed ${p.speed}.` : "";
    return `${base}: ${stats}.${ratings}`;
  }).join("\n");
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
    `Total members: 16 (as shown on the homepage). The club was built for bachelor youth who chose purpose over loneliness — brotherhood, discipline and leadership.`,
    `The club has an anthem — visitors can play it in the "Our Anthem" section of the homepage.`,
    `For fans: "Build Your XI" (${SITE.url}/your-xi) lets supporters pick their own lineup from the real squad and download it as a picture; the "Words on the Wall" Fan Wall on the homepage lets supporters leave a message (shown after club approval); the club album is on the Gallery page (${SITE.url}/gallery).`,
    `Player login: ${SITE.url}/login — players RSVP IN / OUT / MAYBE for sessions from their dashboard.`,
    `The club never publishes match scorelines; results are celebrated without scores, out of respect for opponents.`,
  ].join("\n");
}

// ---- Fallback FAQ (used when Gemini is unavailable) ----
// Trilingual: understands Bengali script, English and Banglish (Roman
// Bangla), and answers in the same style the visitor used.

export function faqAnswer(qRaw: string, f: ChatFacts): string {
  const q = qRaw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const squadList = f.players.map((p) => `#${p.jersey_no} ${p.name} (${p.position})`).join(", ");

  // Banglish detection: no Bengali script, but unmistakable Roman-Bangla
  // words are present (whole-word match, so English stays English).
  const ROMAN_MARKERS = ["koto", "kobe", "kothay", "kivabe", "keno", "chai", "ache", "achen", "amar", "tomar", "apnar", "khela", "khelte", "dam", "jog", "hobe", "kore", "theke", "jonno", "ekta", "konta", "jitlo", "harlo", "dhonnobad", "niom", "niyom", "sodosso", "kara", "kotha", "bolte", "paro", "parbo", "lagbe", "mane", "karon", "ekhon", "kivabe"];
  const words = q.split(/[^a-z]+/).filter(Boolean);
  const roman = !/[\u0980-\u09FE]/.test(q) && ROMAN_MARKERS.some((w) => words.includes(w));

  // Greeting must match at the START of the message — a bare substring
  // check for "hi" also fires inside words like "this" or "which" and
  // swallowed real questions (owner's phone test, 2026-11-24).
  const qt = q.trim();
  const greet = /^(hi|hello|hey)\b/.test(qt) || qt.startsWith("আসসালাম") || qt.startsWith("হ্যালো") || qt.startsWith("হাই") || qt.startsWith("salam") || qt.includes("assalamu");
  if (greet)
    return roman
      ? "Assalamu Alaikum! Ami Bot Assistant. Club, match, join kora ba jersey niye jekono proshno korun. 🖤💛"
      : "আসসালামু আলাইকুম! আমি Bot Assistant। ক্লাব, ম্যাচ, জয়েন করা, স্কোয়াড বা জার্সি নিয়ে যেকোনো প্রশ্ন করুন। 🖤💛";
  if (has("next match", "next session", "পরের ম্যাচ", "ম্যাচ কবে", "খেলা কবে", "session কবে", "কবে খেলা", "porer match", "match kobe", "khela kobe", "kobe khela")) {
    if (!f.nextSession)
      return roman
        ? "Ei muhurte kono asonno session nirdharito nei. Notun session elei website er Next Match card e dekha jabe — chokh rakhun!"
        : "এই মুহূর্তে কোনো আসন্ন সেশন নির্ধারিত নেই। নতুন সেশন এলেই ওয়েবসাইটের Next Match কার্ডে দেখা যাবে — চোখ রাখুন!";
    const n = f.nextSession;
    return roman
      ? `Porer session: ${fmtDate(n.date)}${n.time ? `, somoy ${n.time}` : ""}${n.opponent ? ` — The Bachelors FC vs ${n.opponent}` : n.title ? ` — ${n.title}` : ""}${n.ground ? `, math: ${n.ground}` : ""}. RSVP korte Player Login korun: ${SITE.url}/login`
      : `পরের সেশন: ${fmtDate(n.date)}${n.time ? `, সময় ${n.time}` : ""}${n.opponent ? ` — The Bachelors FC vs ${n.opponent}` : n.title ? ` — ${n.title}` : ""}${n.ground ? `, মাঠ: ${n.ground}` : ""}। RSVP করতে Player Login করুন: ${SITE.url}/login`;
  }
  if (has("how many member", "total member", "কতজন সদস্য", "মোট সদস্য", "সদস্য সংখ্যা", "সদস্য কত", "member koto", "kotojon member", "member koyjon"))
    return roman
      ? "Club er mot sodosso 16 jon — website er homepage er hisab onujayi."
      : "ক্লাবের মোট সদস্য ১৬ জন — ওয়েবসাইটের হোমপেজের হিসাব অনুযায়ী।";
  if (has("join", "জয়েন", "যোগ দ", "সদস্য হ", "member", "খেলতে চাই", "ভর্তি", "jog dite", "jog debo", "member hote", "khelte chai"))
    return roman
      ? `BFC te join korte website er Join form ti puron korun: ${SITE.url}/join — 3 ti dhape abedon somponno hoy ebong ekoi songe apnar player login account toiri hoy. Club abedon jachai kore onumodon dile apni login kore session e RSVP korte parben.`
      : `BFC-তে জয়েন করতে ওয়েবসাইটের Join ফর্মটি পূরণ করুন: ${SITE.url}/join — ৩টি ধাপে আবেদন সম্পন্ন হয় এবং একই সঙ্গে আপনার প্লেয়ার লগইন অ্যাকাউন্ট তৈরি হয়। ক্লাব আবেদনটি যাচাই করে অনুমোদন দিলে আপনি লগইন করে সেশনে RSVP করতে পারবেন।`;
  if (has("jersey", "জার্সি", "kit", "price", "দাম", "কত টাকা", "order", "কিনতে", "store", "buy", "dam koto", "koto taka", "kinte"))
    return roman
      ? `Club jersey er dam nirdharito 500 taka. Order korte Store page e jan: ${SITE.url}/store — payment manual bKash Send Money (${PAYMENTS.bkash}) number e pathiye TrxID ti order form e dite hoy. Kit: ${KIT.base}, ${KIT.trim}.`
      : `ক্লাব জার্সির দাম নির্ধারিত ৫০০ টাকা। অর্ডার করতে Store পেজে যান: ${SITE.url}/store — পেমেন্ট ম্যানুয়াল bKash Send Money (${PAYMENTS.bkash}) নম্বরে পাঠিয়ে TrxID টি অর্ডার ফর্মে দিতে হয়। কিট: ${KIT.base}, ${KIT.trim}।`;
  if (has("rule", "নিয়ম", "privacy", "নীতিমালা", "niom", "niyom"))
    return roman
      ? `Club er purno niyomaboli (sodosso pod, uposthiti o RSVP, fee, srinkhola, puroskar, chobi o goponiyota) Rules page e ache: ${SITE.url}/rules`
      : `ক্লাবের পূর্ণ নিয়মাবলি (সদস্যপদ, উপস্থিতি ও RSVP, ফি, শৃঙ্খলা, পুরস্কার, ছবি ও গোপনীয়তা) Rules পেজে আছে: ${SITE.url}/rules`;
  if (has("record", "রেকর্ড", "top scorer", "সর্বোচ্চ গোল", "বেশি গোল", "most goal", "top playmaker", "most appearance", "most motm", "সেরা গোলদাতা", "কে সেরা", "beshi gol", "koto gol")) {
    const rec = recordsText(f.players);
    if (!rec)
      return roman
        ? "Ekhono kono record toiri hoyni — porisongkhyan website er Record Book e dekha jabe."
        : "এখনো কোনো রেকর্ড তৈরি হয়নি — পরিসংখ্যান ওয়েবসাইটের Record Book-এ দেখা যাবে।";
    return roman
      ? `Club er recordshomuho — ${rec}. Bistarito website er Record Book e ache.`
      : `ক্লাবের রেকর্ডসমূহ — ${rec}। বিস্তারিত ওয়েবসাইটের Record Book-এ আছে।`;
  }
  // Individual player lookup — "Arafat ke?" / "Who is Kazi Iqbal?" etc.
  const named = f.players.find((p) => {
    const full = p.name.toLowerCase();
    const first = full.split(" ")[0];
    return q.includes(full) || (first.length >= 4 && q.includes(first));
  });
  if (named) {
    const p = named;
    if (roman) {
      const head = `${p.name} — #${p.jersey_no}, ${p.position}${p.isCaptain ? ", club captain" : ""}. Sodosso ${p.joinedYear} sal theke${p.foot ? `, pochonder pa: ${p.foot}` : ""}.`;
      const stats = p.position_code === "GK"
        ? `Porisongkhyan: ${p.matches} match, ${p.cleanSheets} clean sheet, ${p.saves} saves, ${p.pensSaved} penalty saved, ${p.motm} bar Man of the Match.`
        : `Porisongkhyan: ${p.matches} match, ${p.goals} gol, ${p.assists} assist, ${p.motm} bar Man of the Match.`;
      const extra = p.name.startsWith("Noman")
        ? " Tini e club er nijossho 'Ashraful' — sobar priyo bot player!"
        : p.name.startsWith("Chowdhury")
          ? " Tini e club er protisthata o 'Founder & Managing Dictator'."
          : "";
      return head + " " + stats + extra + ` Bistarito: ${SITE.url}/squad`;
    }
    const head = `${p.name} — #${p.jersey_no}, ${p.position}${p.isCaptain ? ", ক্লাব ক্যাপ্টেন" : ""}। সদস্য ${p.joinedYear} সাল থেকে${p.foot ? `, পছন্দের পা: ${p.foot}` : ""}।`;
    const stats = p.position_code === "GK"
      ? `পরিসংখ্যান: ${p.matches} ম্যাচ, ${p.cleanSheets} clean sheet, ${p.saves} saves, ${p.pensSaved} penalty saved, ${p.motm} বার Man of the Match।`
      : `পরিসংখ্যান: ${p.matches} ম্যাচ, ${p.goals} গোল, ${p.assists} assist, ${p.motm} বার Man of the Match।`;
    const extra = p.name.startsWith("Noman")
      ? " তিনিই ক্লাবের নিজস্ব 'Ashraful' — সবার প্রিয় বট প্লেয়ার!"
      : p.name.startsWith("Chowdhury")
        ? " তিনিই ক্লাবের প্রতিষ্ঠাতা ও 'Founder & Managing Dictator'।"
        : "";
    return head + " " + stats + extra + ` বিস্তারিত: ${SITE.url}/squad`;
  }
  if (has("ashraful", "আশরাফুল", "bot player", "বট প্লেয়ার", "sitter"))
    return roman
      ? "Amader club er nijossho 'Ashraful' holen Noman (#7, Forward) — sobar priyo bot player, shohoj open-goal er sujog miss korar jonno club er chirchen rosikota! 😄"
      : "আমাদের ক্লাবের নিজস্ব 'Ashraful' হলেন Noman (#7, Forward) — সবার প্রিয় বট প্লেয়ার, সহজ ওপেন-গোলের সুযোগ মিস করার জন্য ক্লাবের চিরচেনা রসিকতা! 😄";
  if (has("squad", "player", "স্কোয়াড", "খেলোয়াড়", "team", "দল", "kara ache"))
    return roman
      ? `Bortoman squad (${f.players.length} jon): ${squadList}. Bistarito profile o porisongkhyan: ${SITE.url}/squad`
      : `বর্তমান স্কোয়াড (${f.players.length} জন): ${squadList}। বিস্তারিত প্রোফাইল ও পরিসংখ্যান: ${SITE.url}/squad`;
  if (has("captain", "ক্যাপ্টেন", "founder", "founded", "প্রতিষ্ঠাতা", "কে চালায়", "dictator"))
    return roman
      ? "Club er protisthata o 'Founder & Managing Dictator' holen Mostafa (Saidul Mostafa Chowdhury) — tini e club er captain o goalkeeper (#99)."
      : "ক্লাবের প্রতিষ্ঠাতা ও 'Founder & Managing Dictator' হলেন Mostafa (Saidul Mostafa Chowdhury) — তিনিই ক্লাবের ক্যাপ্টেন ও গোলকিপার (#99)।";
  if (has("contact", "যোগাযোগ", "email", "ইমেইল", "phone", "whatsapp", "facebook", "messenger", "jogajog"))
    return roman
      ? `Jogajog: email ${SITE.contacts.email} · Messenger ${SITE.contacts.messenger} · Facebook page o WhatsApp group er link website er footer e ache.`
      : `যোগাযোগ: ইমেইল ${SITE.contacts.email} · Messenger ${SITE.contacts.messenger} · Facebook পেজ ও WhatsApp গ্রুপের লিংক ওয়েবসাইটের ফুটারে আছে।`;
  if (has("where", "কোথায়", "location", "ঠিকানা", "ground", "মাঠ", "khulshi", "kothay"))
    return roman
      ? `Club ti Khulshi, Chittagong e. Amader mathgulo: ${f.grounds.join(", ") || "Khulshi elakar mathshomuho"}. Bistarito: ${SITE.url}/grounds`
      : `ক্লাবটি Khulshi, Chittagong-এ। আমাদের মাঠগুলো: ${f.grounds.join(", ") || "Khulshi এলাকার মাঠসমূহ"}। বিস্তারিত: ${SITE.url}/grounds`;
  if (has("login", "লগইন", "rsvp", "dashboard"))
    return roman
      ? `Player login: ${SITE.url}/login — onumodito player ra login kore dashboard theke session e IN / OUT / MAYBE RSVP dite paren. Notun hole age Join form ti puron korun.`
      : `প্লেয়ার লগইন: ${SITE.url}/login — অনুমোদিত প্লেয়াররা লগইন করে ড্যাশবোর্ড থেকে সেশনে IN / OUT / MAYBE RSVP দিতে পারেন। নতুন হলে আগে Join ফর্মটি পূরণ করুন।`;
  if (has("score", "স্কোর", "result", "ফলাফল", "কে জিতল", "হারল", "ke jitlo", "harlo"))
    return roman
      ? "Sommanito protipokkher proti shroddha rekhe BFC kono match er scoreline prokash kore na. Match report (score chara) website er Fixtures & Results ongse pawa jay."
      : "সম্মানিত প্রতিপক্ষের প্রতি শ্রদ্ধা রেখে BFC কোনো ম্যাচের স্কোরলাইন প্রকাশ করে না। ম্যাচ রিপোর্ট (স্কোর ছাড়া) ওয়েবসাইটের Fixtures & Results অংশে পাওয়া যায়।";
  if (has("ধন্যবাদ", "thank", "শুকরিয়া", "dhonnobad"))
    return roman
      ? "Apnakeo dhonnobad! Ar kichu jante chaile jigges korun. United, Not Alone. 🖤💛"
      : "আপনাকেও ধন্যবাদ! আর কিছু জানতে চাইলে জিজ্ঞেস করুন। United, Not Alone. 🖤💛";
  return roman
    ? "Dukkhito, ei proshnotar uttor amar kache nei. Club, match, join kora, squad, niyom ba jersey niye jigges kore dekhun — othoba shorashori jogajog korun: " + SITE.contacts.email
    : "দুঃখিত, এই প্রশ্নটার উত্তর আমার কাছে নেই। ক্লাব, ম্যাচ, জয়েন করা, স্কোয়াড, নিয়ম বা জার্সি নিয়ে জিজ্ঞেস করে দেখুন — অথবা সরাসরি যোগাযোগ করুন: " + SITE.contacts.email;
}
