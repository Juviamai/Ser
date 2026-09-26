"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Avatar,
  ScriptNote,
  SectionTitle,
  StatusPill,
  StarsDisplay,
} from "@/components/ui";
import { findMatches } from "@/lib/matching";
import { fmtSessionWhen, firstName, greetingFor, shortName } from "@/lib/format";
import { nextReward } from "@/lib/guardian";
import { sortedSessions, useSer } from "@/lib/store";

/* Mode cards — thumbnail "photos" are soft gradient scenes (no stock images). */
const MODES = [
  {
    href: "/find-buddy",
    emoji: "👥",
    title: "Human Study Buddy",
    desc: "A real partner, matched to your goal and rhythm. You watch each other's focus.",
    cta: "Find a Match",
    scene: "from-aqua-soft via-white/40 to-blush/60",
    sceneEmoji: "📚",
  },
  {
    href: "/meet-irl",
    emoji: "🏫",
    title: "Meet IRL",
    desc: "Study Calculus for 2 hours this Saturday? Find nearby people and a good table.",
    cta: "Find Nearby",
    scene: "from-blush/70 via-white/40 to-lilac/70",
    sceneEmoji: "☕",
  },
  {
    href: "/guardian",
    emoji: "🤖",
    title: "AI Study Guardian",
    desc: "Solo, but never alone. It notices your focus — and tells you when you've earned a break.",
    cta: "Start Now",
    scene: "from-lilac/70 via-white/40 to-aqua-soft/70",
    sceneEmoji: "🌙",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { state, actions } = useSer();
  const router = useRouter();
  const me = state.currentUser!;
  const [search, setSearch] = useState("");

  const upcoming = useMemo(
    () => sortedSessions(state.sessions).filter((s) => s.status === "upcoming" || s.status === "ongoing"),
    [state.sessions]
  );
  const nextSession = upcoming.find((s) => s.status === "upcoming" || s.status === "ongoing");
  const recommended = useMemo(() => findMatches(me, state.users).slice(0, 4), [me, state.users]);
  const reward = nextReward(me.studyStars);

  const invite = (partnerId: string, subject: string) => {
    const id = actions.createBuddySession(partnerId, subject.split("—")[0].trim());
    actions.showToast("Study room created — your partner is joining…");
    router.push(`/study-room?s=${id}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(search.trim() ? `/find-buddy` : "/find-buddy");
  };

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-6">
      {/* ══════════════════════════ main column ══════════════════════════ */}
      <div className="space-y-6">
        {/* greeting banner */}
        <section className="glass pearl-edge fade-up relative overflow-hidden p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-4 -top-8 select-none text-[88px] leading-none opacity-90 sm:text-[110px]">
            🌷
          </div>
          <p className="script text-[18px]">{todayQuote()}</p>
          <h1 className="mt-1 font-display text-[2.1rem] font-semibold leading-tight sm:text-[2.6rem]">
            {greetingFor()}, <span className="text-iridescent">{firstName(me.name)}</span> ✦
          </h1>
          <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            New day, new focus. Someone is waiting to study with you.
          </p>
          <form onSubmit={submitSearch} className="mt-4 flex max-w-md items-center gap-2">
            <input
              className="field !rounded-full !py-2.5 text-[13.5px]"
              placeholder="Search partners, subjects, places…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary px-5 py-2.5 text-[13px]" type="submit">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatChip emoji="🔥" label={`${me.streak}-day streak`} />
            <StatChip emoji="⭐" label={`${me.studyStars} study stars`} />
            <StatChip emoji="🌟" label={`${me.reputation.score.toFixed(1)} reputation`} />
          </div>
        </section>

        {/* study modes */}
        <section className="fade-up" style={{ animationDelay: "60ms" }}>
          <SectionTitle title="Choose your study mode" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MODES.map((m, i) => (
              <Link
                key={m.href}
                href={m.href}
                className="glass pearl-edge group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(66,90,160,.16)]"
              >
                {/* thumbnail scene */}
                <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${m.scene}`}>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-4xl opacity-80 transition-transform duration-300 group-hover:scale-110">
                    {m.sceneEmoji}
                  </span>
                  <span className="absolute -left-3 -top-3 size-14 rounded-full bg-white/50" />
                  <span className="absolute -bottom-5 right-8 size-12 rounded-full bg-white/40" />
                  <span className="absolute right-12 top-2 select-none text-[10px] text-periwinkle">✦</span>
                  {/* icon badge in corner */}
                  <span
                    className={`iridescent-animated absolute bottom-2.5 right-3 flex size-10 items-center justify-center rounded-2xl text-lg shadow-[0_6px_18px_rgba(63,158,186,.4)] ${i === 1 ? "float-soft" : ""}`}
                  >
                    {m.emoji}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4.5">
                  <h3 className="text-[16px] font-extrabold">{m.title}</h3>
                  <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">{m.desc}</p>
                  <span className="btn btn-primary mt-3.5 w-fit px-4 py-2 text-[12.5px]">
                    {m.cta} <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* upcoming sessions */}
        <section className="fade-up" style={{ animationDelay: "120ms" }}>
          <SectionTitle
            title="Upcoming sessions"
            action={<Link href="/profile#history" className="text-[13px] font-bold text-aqua-deep hover:underline">Session history →</Link>}
          />
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <div className="glass p-6 text-center text-sm text-ink-soft">
                Nothing planned yet — pick a mode above and someone will be waiting. ✨
              </div>
            )}
            {upcoming.map((s) => {
              const partnerIds = s.participants.filter((p) => p !== "me" && p !== "ai");
              const partnerNames = partnerIds.map(
                (p) => state.users.find((u) => u.id === p)?.name ?? "Study partner"
              );
              return (
                <div key={s.id} className="glass flex flex-wrap items-center gap-3 p-4">
                  <div className="flex -space-x-2">
                    {s.mode === "ai" ? (
                      <span className="flex size-10 items-center justify-center rounded-full bg-lilac/60 text-lg ring-2 ring-white/70">🤖</span>
                    ) : (
                      partnerNames.slice(0, 2).map((n) => (
                        <Avatar key={n} name={n} seed={n.toLowerCase()} size={40} verified />
                      ))
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-bold">{s.subject}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-soft">
                      <span className="font-semibold">{fmtSessionWhen(s.startTime)}</span>
                      {partnerNames.length > 0 && ` · with ${partnerNames.map(shortName).join(", ")}`}
                      {s.location && <span className="block text-[12px] text-ink-faint">📍 {s.location.name}</span>}
                    </p>
                  </div>
                  {s.status === "ongoing" ? (
                    <StatusPill tone="green">● Live now</StatusPill>
                  ) : (
                    <StatusPill tone="blue">Confirmed · {s.plannedMinutes}m</StatusPill>
                  )}
                  {s.status === "ongoing" ? (
                    <Link href={`/study-room?s=${s.id}`} className="btn btn-primary px-4 py-2 text-[12.5px]">
                      Rejoin →
                    </Link>
                  ) : (
                    s.mode === "buddy" && (
                      <button
                        className="btn btn-soft px-3.5 py-2 text-[12px]"
                        onClick={() => {
                          actions.cancelSession(s.id);
                          actions.showToast("Session cancelled — your partner was notified.");
                        }}
                      >
                        Cancel
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* quiet script strip */}
        <div className="fade-up flex items-center justify-between gap-4 px-2 pt-1" style={{ animationDelay: "160ms" }}>
          <ScriptNote className="text-[19px]">Real people. Real focus. Better you.</ScriptNote>
          <span className="text-periwinkle">✦</span>
        </div>
      </div>

      {/* ══════════════════════════ right column ═════════════════════════ */}
      <aside className="mt-6 space-y-5 xl:mt-0">
        {/* today's focus */}
        <section className="glass pearl-edge fade-up p-5">
          <SectionTitle title="Today's focus" icon="🎯" />
          {nextSession ? (
            <>
              <p className="text-[14.5px] font-bold leading-snug">{nextSession.subject}</p>
              <p className="mt-1 text-[12.5px] text-ink-soft">{fmtSessionWhen(nextSession.startTime)}</p>
              <div className="mt-3 flex gap-2">
                {nextSession.status === "ongoing" ? (
                  <Link href={`/study-room?s=${nextSession.id}`} className="btn btn-primary px-4 py-2 text-[12.5px]">
                    Rejoin room →
                  </Link>
                ) : (
                  <Link href="/messages" className="btn btn-soft px-4 py-2 text-[12.5px]">
                    Message partner
                  </Link>
                )}
                <Link href="/guardian" className="btn btn-soft px-4 py-2 text-[12.5px]">
                  Warm up solo
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13.5px] text-ink-soft">Nothing scheduled today — a solo session keeps the streak alive.</p>
              <Link href="/guardian" className="btn btn-primary mt-3 px-4 py-2 text-[12.5px]">
                Start AI Guardian →
              </Link>
            </>
          )}
        </section>

        {/* study streak */}
        <section className="glass pearl-edge fade-up p-5" style={{ animationDelay: "50ms" }}>
          <SectionTitle title="Study streak" icon="🔥" />
          <div className="flex items-end gap-2.5">
            <span className="font-display text-[2.6rem] font-semibold leading-none text-iridescent">{me.streak}</span>
            <span className="pb-1 text-[13px] font-semibold text-ink-soft">{me.streak === 1 ? "day" : "days"}</span>
          </div>
          <div className="mt-2">
            <StarsDisplay value={Math.min(5, me.streak)} size={15} />
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/60">
            <div
              className="iridescent-animated h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (me.streak % 7 || 7) / 7 * 100)}%` }}
            />
          </div>
          <p className="mt-2.5 text-[12.5px] text-ink-faint">
            Complete a session today to keep it alive — {7 - (me.streak % 7 || 7)} more days for a weekly bloom 🌸
          </p>
        </section>

        {/* study stars mini */}
        <section className="glass pearl-edge fade-up p-5" style={{ animationDelay: "80ms" }}>
          <SectionTitle title="Study stars" icon="⭐" />
          <div className="flex items-center gap-3">
            <span className="font-display text-[2.2rem] font-semibold leading-none">{me.studyStars}</span>
            <p className="text-[12.5px] leading-snug text-ink-soft">
              {reward
                ? `${reward.stars - me.studyStars} more to unlock ${reward.emoji} ${reward.title}`
                : "All rewards unlocked — you legend."}
            </p>
          </div>
        </section>

        {/* recommended people */}
        <section className="glass pearl-edge fade-up p-5" style={{ animationDelay: "110ms" }}>
          <SectionTitle
            title="Recommended"
            icon="✨"
            action={<Link href="/find-buddy" className="text-[12px] font-bold text-aqua-deep hover:underline">See all</Link>}
          />
          <p className="script mb-2 -mt-1 text-[15px]">Find someone who studies like you.</p>
          <div className="space-y-2.5">
            {recommended.map((m) => (
              <div key={m.user.id} className="flex items-center gap-2.5 rounded-2xl bg-white/55 p-2.5">
                <Avatar name={m.user.name} seed={m.user.avatarSeed} size={38} verified online={m.user.onlineOffline !== "offline"} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold">{shortName(m.user.name)}</p>
                  <p className="truncate text-[11px] text-ink-faint">
                    ⭐ {m.user.reputation.score.toFixed(1)} · {m.user.studyGoal.split("—")[0].trim()} · {m.user.onlineOffline === "offline" ? "Offline" : "Online"} · {m.user.timezone}
                  </p>
                </div>
                <Link href="/messages" className="btn btn-soft shrink-0 px-3 py-1.5 text-[11.5px]">
                  Chat
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* language & region */}
        <section className="glass pearl-edge fade-up p-5" style={{ animationDelay: "140ms" }}>
          <SectionTitle title="Language & region" icon="🌐" />
          <p className="text-[13px] font-semibold text-ink-soft">
            {state.settings.language} · {state.settings.timezone}
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-faint">Region: {state.settings.region}</p>
          <Link href="/settings" className="btn btn-soft mt-3 px-4 py-2 text-[12.5px]">
            Change →
          </Link>
        </section>
      </aside>
    </div>
  );
}

function StatChip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/60 px-3.5 py-1.5 text-[12.5px] font-bold text-ink-soft backdrop-blur">
      <span>{emoji}</span> {label}
    </span>
  );
}

function todayQuote(): string {
  const quotes = [
    "Real people. Real focus. Better you.",
    "Small steps, big dreams.",
    "Someone is waiting to study with you.",
    "Begin gently — stay long.",
  ];
  return quotes[new Date().getDate() % quotes.length];
}
