"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Avatar, SectionTitle, StarsDisplay, VerifiedBadge } from "@/components/ui";
import { fmtSessionWhen, shortName } from "@/lib/format";
import { sortedSessions, useSer } from "@/lib/store";
import type { Session } from "@/lib/types";

export default function ProfilePage() {
  return (
    <AppShell>
      <Profile />
    </AppShell>
  );
}

function Profile() {
  const { state } = useSer();
  const me = state.currentUser!;
  const r = me.reputation;
  const displayName = state.settings.showRealName ? me.name : shortName(me.name);

  const history = sortedSessions(state.sessions).filter((s) => s.status !== "upcoming");
  const ratingsIGot = state.sessions.flatMap((s) => s.ratings?.filter((x) => x.to === "me") ?? []);

  return (
    <div className="space-y-6">
      {/* identity + reputation */}
      <section className="glass-strong pearl-edge fade-up relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full bg-blush/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-aqua-soft/70 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar name={me.name} seed={me.avatarSeed} size={88} />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold">{displayName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VerifiedBadge />
              <span className="rounded-full border border-white/90 bg-white/60 px-2.5 py-0.5 text-[11.5px] font-bold text-ink-soft backdrop-blur">
                {me.level} · {me.timezone}
              </span>
            </div>
          </div>
          <div className="ml-auto text-center">
            <p className="font-display text-5xl font-semibold text-iridescent">{r.score.toFixed(1)}</p>
            <StarsDisplay value={r.score} size={16} />
            <p className="mt-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-faint">
              Study Reputation
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={r.sessionsCompleted} label="sessions completed" />
          <Stat value={`${r.onTimeRate}%`} label="on time" />
          <Stat value={me.streak} label="day streak" />
          <Stat value={me.studyStars} label="study stars" />
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
          🔒 <b>What others see:</b> 🎓 Verified Student · ⭐ {r.score.toFixed(1)} Study
          Reputation. Your email, phone and university are never shown to anyone.
        </div>
      </section>

      {/* badges */}
      <section className="fade-up" style={{ animationDelay: "60ms" }}>
        <SectionTitle title="Reputation badges" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BadgeCard on={r.onTimeRate >= 85} emoji="🟢" title="Usually on time" sub={`${r.onTimeRate}% on-time rate`} />
          <BadgeCard on={r.sessionsCompleted >= 10} emoji="🟢" title="Sessions completed" sub={`${r.sessionsCompleted} done (10 for badge)`} />
          <BadgeCard on={r.highlyFocused} emoji="🟢" title="Highly focused" sub="avg partner rating ≥ 4.5" />
          <BadgeCard on={r.friendly} emoji="🟢" title="Friendly study partner" sub="3+ sessions & rating ≥ 4.0" />
        </div>
        <p className="mt-3 text-[12.5px] italic text-ink-faint">
          Ratings from partners after each session build this — cancellations and
          distraction lower it. Kindness compounds.
        </p>
      </section>

      {/* ratings received */}
      {ratingsIGot.length > 0 && (
        <section className="fade-up" style={{ animationDelay: "90ms" }}>
          <SectionTitle title="Recent partner ratings" />
          <div className="flex flex-wrap gap-2.5">
            {ratingsIGot.slice(-6).reverse().map((rt, i) => (
              <span key={i} className="glass px-4 py-2.5 text-[13px] font-semibold">
                {"⭐".repeat(rt.stars)} {rt.stars === 5 ? "Focused & on time" : rt.stars === 4 ? "Mostly focused" : "Okay"}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* session history */}
      <section id="history" className="fade-up scroll-mt-24" style={{ animationDelay: "120ms" }}>
        <SectionTitle title="Session history" />
        <div className="space-y-2.5">
          {history.length === 0 && (
            <div className="glass p-6 text-center text-sm text-ink-soft">
              No sessions yet — your first one is one tap away.
            </div>
          )}
          {history.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SessionRow({ session: s }: { session: Session }) {
  const { state } = useSer();
  const partners = s.participants
    .filter((p) => p !== "me" && p !== "ai")
    .flatMap((p) => {
      const u = state.users.find((x) => x.id === p);
      return u ? [u.name] : [];
    });
  const myRating = s.ratings?.find((x) => x.from === "me")?.stars;

  const statusChip =
    s.status === "completed"
      ? "bg-emerald-100/80 text-emerald-700"
      : s.status === "cancelled"
        ? "bg-rose-100/80 text-rose-500"
        : "bg-aqua-soft text-aqua-deep";

  return (
    <div className="glass flex flex-wrap items-center gap-3 p-4">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-white/70 text-lg">
        {s.mode === "buddy" ? "👥" : s.mode === "irl" ? "🏫" : "🤖"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-bold">{s.subject}</p>
        <p className="text-[12.5px] text-ink-soft">
          {fmtSessionWhen(s.startTime)} · {s.plannedMinutes} min
          {partners.length > 0 && ` · with ${partners.map(shortName).join(", ")}`}
          {s.location && <span className="block text-[12px] text-ink-faint">📍 {s.location.name}</span>}
        </p>
      </div>
      {myRating && <span className="text-sm">{"⭐".repeat(myRating)}</span>}
      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusChip}`}>
        {s.status}
      </span>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/55 px-4 py-3 text-center">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
    </div>
  );
}

function BadgeCard({ on, emoji, title, sub }: { on: boolean; emoji: string; title: string; sub: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`rounded-3xl border p-4 text-left transition-all ${on ? "border-transparent iridescent text-[#0e3a38] shadow-[0_8px_26px_rgba(58,208,188,.35)]" : "border-white/80 bg-white/50"}`}
    >
      <p className={`text-xl ${on ? "" : "opacity-30 grayscale"}`}>{emoji}</p>
      <p className="mt-1.5 text-[14px] font-extrabold">{title}</p>
      <p className={`text-[11.5px] ${on ? "opacity-80" : "text-ink-faint"}`}>{on ? "Earned ✓" : sub}</p>
      {open && !on && <p className="mt-1.5 text-[11.5px] font-semibold text-ink-soft">{sub}</p>}
    </button>
  );
}
