"use client";
import { useEffect, useRef, useState } from "react";

// Bot Assistant — floating visitor chat (design approved by the owner
// 2026-11-24: navy/gold, gold bubble bottom-right, quick-question chips).
// The panel stays dark in both site themes, like the social cards.
// Brain lives server-side in /api/chat (club facts only, no invention).

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "আসসালামু আলাইকুম! আমি Bot Assistant। ক্লাব, ম্যাচ, জয়েন করা বা জার্সি নিয়ে যেকোনো প্রশ্ন করুন। 🖤💛",
};
const CHIPS = ["পরের ম্যাচ কবে?", "কীভাবে জয়েন করব?", "জার্সির দাম কত?", "ক্লাবের নিয়ম"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open, busy]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open ]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs([...next, { role: "assistant", content: data.reply || "দুঃখিত, একটু সমস্যা হয়েছে — আবার চেষ্টা করুন, অথবা ইমেইল করুন: thebachelorsfc@gmail.com" }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "দুঃখিত, সংযোগে সমস্যা হয়েছে — আবার চেষ্টা করুন, অথবা ইমেইল করুন: thebachelorsfc@gmail.com" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <div className="chatw-launch">
          <span className="chatw-hint">কিছু জানতে চান?</span>
          <button type="button" className="chatw-bubble" aria-label="Chat with Bot Assistant" onClick={() => setOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9.4L5 19.6V5a1 1 0 0 1 1-1z" fill="#14100a"/></svg>
          </button>
        </div>
      )}
      {open && (
        <div className="chatw-panel" role="dialog" aria-label="Bot Assistant chat">
          <div className="chatw-head">
            <img className="chatw-ava-img" src="/bot-avatar.svg" alt="Bot Assistant" width={34} height={34} />
            <span className="chatw-htext">
              <b>Bot Assistant</b>
              <small><i /> Online — সাধারণত সাথে সাথে উত্তর দেয়</small>
            </span>
            <button type="button" className="chatw-x" aria-label="Close chat" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chatw-list" ref={listRef}>
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "chatw-m user" : "chatw-m bot"}>{m.content}</div>
            ))}
            {busy && <div className="chatw-m bot chatw-typing"><span /><span /><span /></div>}
          </div>
          <div className="chatw-chips">
            {CHIPS.map((c) => (
              <button key={c} type="button" onClick={() => send(c)} disabled={busy}>{c}</button>
            ))}
          </div>
          <form
            className="chatw-form"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন…"
              maxLength={500}
              aria-label="Your question"
            />
            <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 11.2 21 3l-8.2 18-2.4-7.4L3 11.2z" fill="#14100a"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
