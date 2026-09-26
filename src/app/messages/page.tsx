"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { Avatar, RepPill, SectionTitle, VerifiedBadge } from "@/components/ui";
import { fmtRelative, fmtSessionWhen, shortName } from "@/lib/format";
import { useSer } from "@/lib/store";

/**
 * Messages — chat with study partners (with simulated replies) and session
 * reminders. On mobile the thread opens full-screen style.
 */

export default function MessagesPage() {
  return (
    <AppShell>
      <Messages />
    </AppShell>
  );
}

function Messages() {
  const { state, actions } = useSer();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.conversations.filter((c) => {
      const partner = state.users.find((u) => u.id === c.id);
      return !q || partner?.name.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q));
    });
  }, [state.conversations, state.users, search]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const activePartner = state.users.find((u) => u.id === activeId) ?? null;

  const reminders = state.sessions.filter((s) => s.status === "upcoming").slice(0, 3);

  useEffect(() => {
    if (activeId) actions.markConversationRead(activeId);
  }, [activeId, actions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  const send = () => {
    if (!draft.trim() || !activeId) return;
    actions.sendMessage(activeId, draft.trim());
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <header className="fade-up">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Messages <span className="text-iridescent">💬</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          A kind word before a session goes a long way.
        </p>
      </header>

      {/* reminders */}
      {reminders.length > 0 && (
        <section className="fade-up" style={{ animationDelay: "40ms" }}>
          <SectionTitle title="Session reminders" icon="🔔" />
          <div className="grid gap-2.5 sm:grid-cols-3">
            {reminders.map((s) => (
              <div key={s.id} className="glass flex items-center gap-3 p-3.5">
                <span className="iridescent flex size-10 shrink-0 items-center justify-center rounded-2xl text-lg">
                  {s.mode === "buddy" ? "👥" : s.mode === "irl" ? "🏫" : "🤖"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold">{s.subject}</p>
                  <p className="text-[12px] text-ink-soft">{fmtSessionWhen(s.startTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* chat */}
      <section className="fade-up glass pearl-edge overflow-hidden" style={{ animationDelay: "80ms" }}>
        <div className="grid md:grid-cols-[280px_1fr]">
          {/* conversation list */}
          <div className={`border-white/60 md:border-r ${active ? "hidden md:block" : ""}`}>
            <div className="p-3.5">
              <input className="field !py-2.5 text-[13.5px]" placeholder="Search people & messages" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="max-h-[420px] overflow-y-auto px-2.5 pb-3">
              {conversations.map((c) => {
                const partner = state.users.find((u) => u.id === c.id);
                const last = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                      activeId === c.id ? "iridescent shadow-[0_4px_16px_rgba(58,208,188,.3)]" : "hover:bg-white/70"
                    }`}
                  >
                    <Avatar name={partner?.name ?? "?"} seed={partner?.avatarSeed} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-extrabold">
                        {partner ? shortName(partner.name) : "Study partner"}
                      </p>
                      <p className="truncate text-[12px] text-ink-soft">{last?.text}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10.5px] text-ink-faint">{last ? fmtRelative(last.at) : ""}</span>
                      {c.unread > 0 && (
                        <span className="flex size-4.5 items-center justify-center rounded-full bg-rose text-[10px] font-black text-white">{c.unread}</span>
                      )}
                    </div>
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <p className="px-3 py-6 text-center text-[13px] text-ink-faint">
                  No conversations yet — say hi from the matches page 👋
                </p>
              )}
            </div>
          </div>

          {/* thread */}
          <div className="flex min-h-[460px] flex-col">
            {!active || !activePartner ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <span className="iridescent mb-2 flex size-14 items-center justify-center rounded-3xl text-2xl">💬</span>
                <p className="text-[14.5px] font-bold">Pick a conversation</p>
                <p className="max-w-56 text-[12.5px] text-ink-faint">
                  Your study partners are one kind message away.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-white/60 px-4 py-3">
                  <button className="btn btn-ghost -ml-2 px-2 py-1 text-lg md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                    ←
                  </button>
                  <Avatar name={activePartner.name} seed={activePartner.avatarSeed} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-extrabold">{shortName(activePartner.name)}</p>
                    <div className="flex items-center gap-1.5">
                      <VerifiedBadge compact />
                      <RepPill score={activePartner.reputation.score} />
                    </div>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4">
                  {active.messages.map((m) => {
                    const mine = m.from === "me";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                            mine
                              ? "iridescent rounded-br-lg text-[#0e3a38] font-semibold"
                              : "rounded-bl-lg border border-white/80 bg-white/75"
                          }`}
                        >
                          {m.text}
                          <span className={`mt-1 block text-right text-[10px] ${mine ? "text-[#0e3a38]/60" : "text-ink-faint"}`}>
                            {fmtRelative(m.at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 border-t border-white/60 p-3">
                  <input
                    className="field flex-1 !rounded-full !py-3"
                    placeholder="Write something kind…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                  />
                  <button className="btn btn-primary size-11 !rounded-full p-0 text-lg" onClick={send} aria-label="Send">
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
