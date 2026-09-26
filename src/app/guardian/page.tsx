"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Modal } from "@/components/ui";
import {
  FOCUS_CYCLE_SECONDS,
  REWARDS,
  breakLengthFor,
  cycleProgress,
  effectiveBreakRemaining,
  effectiveFocusedSeconds,
  nextReward,
  type Reward,
} from "@/lib/guardian";
import { fmtClock } from "@/lib/format";
import { useSer } from "@/lib/store";

/**
 * AI Study Guardian — solo, but never alone.
 * The AI observes study behavior (it never teaches): after 45 minutes of
 * sustained focus it offers an earned break. Choosing "Keep studying"
 * earns a Study Star, which unlocks rewards at 2 / 5 / 10 stars.
 *
 * Demo speed (default ON): one real second counts as one study minute, so the
 * 45-minute milestone arrives in 45 seconds — flip it off for the real thing.
 */

export default function GuardianPage() {
  return (
    <AppShell>
      <Guardian />
    </AppShell>
  );
}

function Guardian() {
  const { state, actions } = useSer();
  const me = state.currentUser!;
  const g = state.guardian;

  const [now, setNow] = useState(() => Date.now());
  const [rewardModal, setRewardModal] = useState<Reward | null>(null);
  const [breakLenLabel, setBreakLenLabel] = useState(15);
  const [gameOpen, setGameOpen] = useState(false);

  // heartbeat — drives all guardian time math
  useEffect(() => {
    if (g.phase === "idle") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [g.phase]);

  const focused = effectiveFocusedSeconds(g, now);
  const target = FOCUS_CYCLE_SECONDS * (g.completedCycles + 1);
  const progress = g.phase === "idle" ? 0 : cycleProgress(focused);
  const breakRemaining = effectiveBreakRemaining(g, now);

  // Detect the sustained-focus milestone → show the break prompt.
  useEffect(() => {
    if (g.phase === "focusing" && focused >= target) {
      actions.guardianReachPrompt();
    }
  }, [focused, target, g.phase, actions]);

  // Break over → gently return to focus.
  useEffect(() => {
    if (g.phase === "break" && breakRemaining <= 0) {
      actions.guardianFinishBreak();
      actions.showToast("Break's over — welcome back. No pressure, just begin. 🌷");
    }
  }, [g.phase, breakRemaining, actions]);

  const takeBreak = () => {
    const secs = actions.guardianTakeBreak();
    setBreakLenLabel(Math.round(secs / 60));
  };

  const keepStudying = () => {
    const unlocked = actions.guardianKeepStudying();
    if (unlocked) {
      setRewardModal(unlocked);
    } else {
      actions.showToast("⭐ +1 Study Star — beautiful choice.");
    }
  };

  const endSession = () => {
    actions.guardianEnd(focused);
    actions.showToast(
      focused >= 300
        ? `Session saved — ${Math.round(focused / 60)} focused minutes. Streak alive 🔥`
        : "Session ended."
    );
  };

  const awardedBreakMin = breakLengthFor(me.studyStars) / 60;
  const upcoming = nextReward(me.studyStars);

  return (
    <div className="space-y-6">
      <header className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            AI Study <span className="text-iridescent">Guardian</span> 🤖
          </h1>
          <p className="mt-2 max-w-lg text-[15px] text-ink-soft">
            It watches your focus. It never teaches. When you&apos;ve earned a
            rest, it tells you — kindly.
          </p>
        </div>
        <button
          className={`chip ${g.demoSpeed ? "chip-on" : ""}`}
          onClick={actions.guardianToggleDemo}
          title="Resets the current guardian session"
        >
          ⏩ Demo speed {g.demoSpeed ? "on · 1s = 1min" : "off · real time"}
        </button>
      </header>

      {/* ── the orb ─────────────────────────────────────────────────────── */}
      <section className="glass-strong pearl-edge fade-up relative overflow-hidden p-7 sm:p-10">
        <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-aqua-soft/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-56 rounded-full bg-blush/50 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          {/* orb doubles as progress ring while focusing */}
          <div className="relative">
            <div
              className="iridescent-animated pulse-glow flex size-44 items-center justify-center rounded-full text-6xl sm:size-52"
              style={{ opacity: g.phase === "idle" ? 0.85 : 1 }}
            >
              <span className={g.phase === "focusing" ? "breathe" : ""}>
                {g.phase === "break" ? "🌙" : g.phase === "prompt" ? "🎉" : g.phase === "idle" ? "🌱" : "🌊"}
              </span>
            </div>
            {g.phase !== "idle" && (
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="47" fill="none"
                  stroke="white" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${progress * 295} 295`}
                  className="transition-all duration-500"
                />
              </svg>
            )}
          </div>

          {/* phase body */}
          {g.phase === "idle" && (
            <>
              <h2 className="mt-6 font-display text-2xl font-semibold">Ready when you are.</h2>
              <p className="mt-2 max-w-md text-[14.5px] text-ink-soft">
                Start studying and I&apos;ll simply observe. At 45 minutes of
                focus, I&apos;ll offer you a break — <em>you&apos;ll</em> have earned it.
              </p>
              <button className="btn btn-primary sheen mt-6 px-8 py-3.5 text-[15px]" onClick={actions.guardianStart}>
                🌊 Start studying
              </button>
              <p className="mt-3 text-[12px] text-ink-faint">
                Next reward: {upcoming ? `${upcoming.emoji} ${upcoming.title} at ⭐${upcoming.stars}` : "all unlocked"}
              </p>
            </>
          )}

          {g.phase === "focusing" && (
            <>
              <p className="mt-6 text-[12px] font-black uppercase tracking-[0.2em] text-ink-faint">Focused for</p>
              <p className="font-mono text-5xl font-bold tabular-nums tracking-tight">{fmtClock(focused)}</p>
              <p className="mt-3 max-w-md text-[14.5px] text-ink-soft">
                {Math.max(0, Math.ceil((target - focused) / 60))} min to your earned break. I&apos;m here, quietly.
              </p>
              <button className="btn btn-soft mt-6 px-6 py-3 text-sm" onClick={endSession}>
                End session
              </button>
            </>
          )}

          {g.phase === "prompt" && (
            <div className="fade-up mt-6 w-full max-w-lg">
              <div className="rounded-3xl border border-white/80 bg-white/65 p-5 backdrop-blur">
                <p className="font-display text-xl font-semibold leading-snug">
                  🎉 You&apos;ve been working hard for 45 minutes.
                </p>
                <p className="mt-1.5 text-[14px] text-ink-soft">
                  You earned a {awardedBreakMin}-minute break. Your call — rest,
                  or ride the wave.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-3xl border border-white/90 bg-white/70 px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={takeBreak}
                  >
                    <p className="text-2xl">🌙</p>
                    <p className="mt-1.5 text-[15px] font-extrabold">Take a break</p>
                    <p className="text-[12.5px] text-ink-soft">+{awardedBreakMin} min · you earned this</p>
                  </button>
                  <button
                    className="iridescent rounded-3xl px-5 py-5 text-left text-[#0e3a38] shadow-[0_8px_28px_rgba(58,208,188,.4)] transition hover:-translate-y-0.5"
                    onClick={keepStudying}
                  >
                    <p className="text-2xl">⭐</p>
                    <p className="mt-1.5 text-[15px] font-extrabold">Keep studying</p>
                    <p className="text-[12.5px] opacity-80">+1 Study Star</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {g.phase === "break" && (
            <>
              <p className="mt-6 text-[12px] font-black uppercase tracking-[0.2em] text-ink-faint">Break — you earned this</p>
              <p className="font-mono text-5xl font-bold tabular-nums">{fmtClock(breakRemaining)}</p>
              <p className="mt-3 max-w-md text-[14.5px] text-ink-soft">
                Stretch, water, look out a window. I&apos;ll be right here when
                it&apos;s time.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button className="btn btn-soft px-5 py-2.5 text-sm" onClick={actions.guardianFinishBreak}>
                  I&apos;m ready now
                </button>
                {me.studyStars >= 5 && (
                  <button className="btn btn-primary px-5 py-2.5 text-sm" onClick={() => setGameOpen(true)}>
                    🎮 Ser Blooms
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* stars + rewards */}
      <section className="fade-up grid gap-4 sm:grid-cols-[auto_1fr]" style={{ animationDelay: "80ms" }}>
        <div className="glass pearl-edge flex items-center gap-5 p-6">
          <div className="relative">
            <span className="iridescent-animated flex size-20 items-center justify-center rounded-full text-3xl shadow-[0_8px_28px_rgba(58,208,188,.4)]">⭐</span>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold">{me.studyStars}</p>
            <p className="text-[13px] font-bold text-ink-soft">Study Stars</p>
            {upcoming && (
              <p className="mt-1 text-[12px] text-ink-faint">
                {upcoming.stars - me.studyStars} to {upcoming.emoji} {upcoming.title}
              </p>
            )}
          </div>
        </div>

        <div className="glass pearl-edge p-5">
          <p className="mb-3 text-[12px] font-black uppercase tracking-[0.16em] text-ink-faint">Rewards</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {REWARDS.map((r) => {
              const unlocked = me.studyStars >= r.stars;
              const isGame = r.stars === 5;
              return (
                <div
                  key={r.stars}
                  className={`rounded-2xl border p-3.5 text-center transition ${
                    unlocked ? "border-transparent iridescent text-[#0e3a38] shadow-[0_6px_22px_rgba(58,208,188,.35)]" : "border-white/80 bg-white/50"
                  }`}
                >
                  <p className={`text-2xl ${unlocked ? "" : "opacity-40 grayscale"}`}>{r.emoji}</p>
                  <p className="mt-1 text-[13px] font-extrabold">{r.title}</p>
                  <p className="text-[11px] leading-snug text-ink-soft">⭐ {r.stars} — {r.description}</p>
                  {unlocked && isGame && (
                    <button className="btn btn-soft mt-2 w-full px-3 py-1.5 text-[12px]" onClick={() => setGameOpen(true)}>
                      Play Ser Blooms
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p className="pb-2 text-center text-xs italic text-ink-faint">
        &ldquo;You earned this break.&rdquo; — your guardian, at 45:00
      </p>

      {/* reward unlock modal */}
      <Modal open={!!rewardModal} onClose={() => setRewardModal(null)}>
        {rewardModal && (
          <div className="fade-up text-center">
            <div className="iridescent-animated breathe mx-auto flex size-20 items-center justify-center rounded-[1.8rem] text-4xl shadow-[0_10px_40px_rgba(58,208,188,.45)]">
              {rewardModal.emoji}
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold">Unlocked: {rewardModal.title}</h3>
            <p className="mt-2 text-[14px] text-ink-soft">{rewardModal.description}</p>
            <div className="mt-5 flex justify-center gap-2.5">
              {rewardModal.stars === 5 && (
                <button
                  className="btn btn-primary px-6 py-3 text-sm"
                  onClick={() => {
                    setRewardModal(null);
                    setGameOpen(true);
                  }}
                >
                  Play now 🎮
                </button>
              )}
              <button className="btn btn-soft px-6 py-3 text-sm" onClick={() => { setRewardModal(null); actions.guardianFinishBreak(); }}>
                {rewardModal.stars === 5 ? "Later" : "Keep studying"} →
              </button>
            </div>
          </div>
        )}
      </Modal>

      <SerBlooms open={gameOpen} onClose={() => setGameOpen(false)} />
    </div>
  );
}

/* ────────────────────────── Ser Blooms mini-game ─────────────────────────── */

const BLOOMS = ["🌷", "🌸", "🌺", "🪷", "🌼", "🌻"]; // 6 pairs
const GAME_CARDS = [...BLOOMS, ...BLOOMS].map((e, i) => ({
  id: i,
  emoji: e,
}));

function SerBlooms({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [deck, setDeck] = useState<typeof GAME_CARDS>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const won = deck.length > 0 && matched.length === deck.length;

  const restart = () => {
    setDeck([...GAME_CARDS].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    if (open && deck.length === 0) restart();
  }, [open, deck.length]);

  const flip = (i: number) => {
    if (flipped.includes(i) || matched.includes(i) || flipped.length === 2) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].emoji === deck[b].emoji) {
        setTimeout(() => {
          setMatched((m) => [...m, a, b]);
          setFlipped([]);
        }, 450);
      } else {
        setTimeout(() => setFlipped([]), 750);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={won ? "🌼 All blooms open!" : "Ser Blooms"}>
      <p className="text-[13px] text-ink-soft">
        A calm little memory game for your breaks. {won ? `Solved in ${moves} moves.` : `Moves: ${moves}`}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {deck.map((card, i) => {
          const shown = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              onClick={() => flip(i)}
              className={`flex aspect-square items-center justify-center rounded-2xl text-2xl transition-all duration-200 ${
                matched.includes(i)
                  ? "iridescent shadow-[0_4px_16px_rgba(58,208,188,.4)]"
                  : shown
                    ? "bg-white/90 shadow"
                    : "bg-white/45 hover:bg-white/70"
              }`}
              aria-label={shown ? card.emoji : "hidden card"}
            >
              {shown ? card.emoji : "🫧"}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex gap-2.5">
        {won && (
          <button className="btn btn-primary flex-1 py-3 text-sm" onClick={restart}>
            Bloom again 🌸
          </button>
        )}
        <button className="btn btn-soft flex-1 py-3 text-sm" onClick={onClose}>
          {won ? "Back to studying" : "Close"}
        </button>
      </div>
      {won && (
        <p className="mt-3 text-center text-xs italic text-ink-faint">
          Lovely. Whenever you&apos;re ready — <Link href="/dashboard" className="underline">back to it</Link>.
        </p>
      )}
    </Modal>
  );
}
