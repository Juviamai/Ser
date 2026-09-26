"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Avatar, DotBadge, RepPill, VerifiedBadge } from "@/components/ui";
import { findMatches, type MatchResult } from "@/lib/matching";
import { shortName } from "@/lib/format";
import { useSer } from "@/lib/store";
import type { Level } from "@/lib/types";

const PERSONA_LABEL: Record<string, string> = {
  "focused-quiet": "🤫 Quiet focuser",
  "warm-cheerful": "🌞 Warm cheerleader",
  structured: "📋 Structured planner",
  flexible: "🍃 Easy-going",
};

export default function FindBuddyPage() {
  return (
    <AppShell>
      <FindBuddy />
    </AppShell>
  );
}

function FindBuddy() {
  const { state, actions } = useSer();
  const router = useRouter();
  const me = state.currentUser!;

  const [goalFilter, setGoalFilter] = useState("");
  const [tzFilter, setTzFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<"" | Level>("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bestMatch, setBestMatch] = useState<MatchResult | null>(null);

  const matches = useMemo(
    () =>
      findMatches(me, state.users, {
        goal: goalFilter || undefined,
        timezone: tzFilter || undefined,
        level: levelFilter || undefined,
        onlineOnly,
      }),
    [me, state.users, goalFilter, tzFilter, levelFilter, onlineOnly]
  );

  /** "Find a Match" — a short, calm "searching" beat before the reveal. */
  const findMatch = () => {
    setSearching(true);
    setBestMatch(null);
    setTimeout(() => {
      setSearching(false);
      setBestMatch(matches[0] ?? null);
    }, 1600);
  };

  const enterRoom = (m: MatchResult) => {
    const id = actions.createBuddySession(m.user.id, m.user.studyGoal.split("—")[0].trim());
    actions.showToast(`${shortName(m.user.name)} accepted! Entering your study room…`);
    router.push(`/study-room?s=${id}`);
  };

  return (
    <div className="space-y-6">
      <header className="fade-up">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Find a <span className="text-iridescent">study buddy</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Find someone who studies like you. Matched by goal, schedule, timezone,
          level and personality.
        </p>
      </header>

      {/* filters */}
      <div className="glass pearl-edge fade-up grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "50ms" }}>
        <input className="field" placeholder="🎯 Filter by goal, e.g. calculus" value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)} />
        <select className="field" value={tzFilter} onChange={(e) => setTzFilter(e.target.value)}>
          <option value="">🌐 Any timezone</option>
          {[...new Set(state.users.map((u) => u.timezone))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="field" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as Level | "")}>
          <option value="">📶 Any level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className={`chip h-[46px] justify-center text-[13px] ${onlineOnly ? "chip-on" : ""}`} onClick={() => setOnlineOnly(!onlineOnly)}>
          💻 Online study rooms only
        </button>
      </div>

      {/* find a match */}
      <div className="fade-up" style={{ animationDelay: "100ms" }}>
        <button
          className="btn btn-primary sheen w-full px-6 py-4 text-[15.5px]"
          onClick={findMatch}
          disabled={searching}
        >
          {searching ? (
            <span className="flex items-center gap-2.5">
              <span className="size-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
              Looking for someone who studies like you…
            </span>
          ) : (
            "✨ Find a Match"
          )}
        </button>
      </div>

      {/* best match reveal */}
      {bestMatch && (
        <div className="glass-strong pearl-edge fade-up relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-blush/50 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-6 size-44 rounded-full bg-aqua-soft/70 blur-2xl" />
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-aqua-deep">Your best match</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Avatar name={bestMatch.user.name} seed={bestMatch.user.avatarSeed} size={72} />
            <div className="min-w-0">
              <p className="text-xl font-extrabold">{shortName(bestMatch.user.name)}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <VerifiedBadge />
                <RepPill score={bestMatch.user.reputation.score} />
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11.5px] font-bold text-ink-soft">
                  {bestMatch.score}% match
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[14px] font-medium text-ink-soft">🎯 {bestMatch.user.studyGoal} · {PERSONA_LABEL[bestMatch.user.personality]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary px-6 py-3 text-sm" onClick={() => enterRoom(bestMatch)}>
              Enter study room together →
            </button>
            <Link href="/messages" className="btn btn-soft px-5 py-3 text-sm">Message first</Link>
          </div>
        </div>
      )}

      {/* match list */}
      <section>
        <h2 className="mb-3 text-[15px] font-extrabold uppercase tracking-[0.14em] text-ink-faint">
          {matches.length} students nearby in spirit
        </h2>
        <div className="grid gap-3.5 lg:grid-cols-2">
          {matches.map((m, i) => (
            <article
              key={m.user.id}
              className="glass pearl-edge fade-up p-4.5 transition-transform hover:-translate-y-0.5"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={m.user.name} seed={m.user.avatarSeed} size={54} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-extrabold">{shortName(m.user.name)}</p>
                    <span className="shrink-0 rounded-full bg-aqua-soft px-2.5 py-1 text-[11.5px] font-black text-aqua-deep">
                      {m.score}%
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <VerifiedBadge compact />
                    <RepPill score={m.user.reputation.score} />
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-ink">🎯 {m.user.studyGoal}</p>
                  <p className="mt-1 text-[12.5px] text-ink-soft">
                    {PERSONA_LABEL[m.user.personality]} · {m.user.studyTime} · {m.user.studyDays.slice(0, 3).join(", ")} · {m.user.timezone}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.reasons.map((r) => (
                      <span key={r} className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                  {m.user.bio && <DotBadge>{m.user.bio}</DotBadge>}
                </div>
              </div>
              <div className="mt-3.5 flex justify-end gap-2">
                <Link href="/messages" className="btn btn-ghost px-4 py-2 text-[12.5px]">💬 Say hi</Link>
                <button className="btn btn-primary px-4 py-2 text-[12.5px]" onClick={() => enterRoom(m)}>
                  Invite to study
                </button>
              </div>
            </article>
          ))}
        </div>
        {matches.length === 0 && (
          <div className="glass p-8 text-center text-sm text-ink-soft">
            No one matches those filters yet — try widening them. ✨
          </div>
        )}
      </section>
    </div>
  );
}
