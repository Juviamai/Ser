"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SerLogo } from "@/components/AppShell";
import { useSer, type OnboardingData } from "@/lib/store";

/**
 * Welcome — the only setup screen after sign-in.
 * Everything is prefilled with sensible defaults, so "Start studying" is one
 * click. In the demo you're marked 🎓 Verified Student automatically; your
 * email/name details are never shown to other students.
 */

const TIMEZONES = ["GMT-8", "GMT-5", "GMT-3", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+5:30", "GMT+8", "GMT+9"];
const GOAL_PRESETS = [
  "Calculus — midterm soon",
  "Algorithms & data structures",
  "Organic chemistry",
  "IELTS / TOEFL",
  "Thesis writing",
  "Exam season — everything",
];
const PERSONALITIES: { id: OnboardingData["personality"]; label: string; desc: string; emoji: string }[] = [
  { id: "focused-quiet", label: "Quiet focuser", desc: "Silent deep work, mic off", emoji: "🤫" },
  { id: "warm-cheerful", label: "Warm cheerleader", desc: "Encouraging check-ins", emoji: "🌞" },
  { id: "structured", label: "Structured planner", desc: "Agenda, timed blocks", emoji: "📋" },
  { id: "flexible", label: "Easy-going", desc: "Adapts to the session", emoji: "🍃" },
];
const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 18 }, (_, i) => i + 5);
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><span className="iridescent-animated size-10 rounded-full pulse-glow" /></div>}>
      <Welcome />
    </Suspense>
  );
}

function Welcome() {
  const { actions } = useSer();
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState<OnboardingData>({
    name: params.get("name") || "Demo Student",
    email: params.get("email") || "demo@ser.app",
    phone: "",
    university: "Demo University",
    studyGoal: "Calculus — midterm soon",
    personality: "focused-quiet",
    level: "intermediate",
    preferredGender: "any",
    timezone: "GMT+8",
    studyTime: "19:00–21:00",
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    onlineOffline: "online",
  });

  const set = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (d: string) =>
    setForm((f) => ({
      ...f,
      studyDays: f.studyDays.includes(d)
        ? f.studyDays.filter((x) => x !== d)
        : [...f.studyDays, d],
    }));

  const finish = (skipDefaults = false) => {
    const data = skipDefaults ? { ...form, studyGoal: form.studyGoal || "Exam season — everything" } : form;
    actions.completeOnboarding(data);
    actions.showToast(`Welcome to Ser, ${data.name.split(" ")[0]} ✨`);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <SerLogo />
        <p className="script text-[17px]">Real people. Real focus. Better you.</p>
      </div>

      <div className="glass pearl-edge fade-up mt-6 p-6 sm:p-7">
        <h1 className="font-display text-[1.8rem] font-semibold leading-tight">
          How do you <span className="text-iridescent">study best</span>?
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-soft">
          Prefilled for the demo — tweak if you like, or just start. This shapes
          who you&apos;re matched with.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label>Study goal</Label>
            <input className="field" value={form.studyGoal} onChange={(e) => set("studyGoal", e.target.value)} placeholder="e.g. Calculus — midterm in 3 weeks" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GOAL_PRESETS.map((g) => (
                <button key={g} type="button" className={`chip ${form.studyGoal === g ? "chip-on" : ""}`} onClick={() => set("studyGoal", g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Study personality</Label>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("personality", p.id)}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    form.personality === p.id
                      ? "border-transparent iridescent shadow-[0_6px_20px_rgba(63,158,186,.35)]"
                      : "border-white/80 bg-white/55 hover:bg-white/85"
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <p className="mt-1 text-[13px] font-bold">{p.label}</p>
                  <p className="text-[11px] leading-snug text-ink-soft">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Weekly study time</Label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="field !w-auto"
                value={form.studyTime.split("–")[0]}
                onChange={(e) => set("studyTime", `${e.target.value}–${form.studyTime.split("–")[1]}`)}
              >
                {hours.filter((h) => h <= 21).map((h) => <option key={h}>{hh(h)}</option>)}
              </select>
              <span className="text-ink-faint">to</span>
              <select
                className="field !w-auto"
                value={form.studyTime.split("–")[1]}
                onChange={(e) => set("studyTime", `${form.studyTime.split("–")[0]}–${e.target.value}`)}
              >
                {hours.filter((h) => h >= 7).map((h) => <option key={h}>{hh(h)}</option>)}
              </select>
              {DAY_OPTIONS.map((d) => (
                <button key={d} type="button" className={`chip ${form.studyDays.includes(d) ? "chip-on" : ""}`} onClick={() => toggleDay(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <Label>Level</Label>
              <select className="field !px-2.5" value={form.level} onChange={(e) => set("level", e.target.value as OnboardingData["level"])}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <Label>Timezone</Label>
              <select className="field !px-2.5" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Meet</Label>
              <select className="field !px-2.5" value={form.onlineOffline} onChange={(e) => set("onlineOffline", e.target.value as OnboardingData["onlineOffline"])}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>

        <button className="btn btn-primary sheen mt-6 w-full px-6 py-3.5 text-[15px]" onClick={() => finish()}>
          Start studying →
        </button>
        <button className="btn btn-ghost mt-2 w-full px-6 py-2.5 text-[13px]" onClick={() => finish(true)}>
          Skip — use these defaults
        </button>

        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-faint">
          🔒 Demo: you&apos;re marked <b>🎓 Verified Student</b> automatically.
          Others only ever see your first name + reputation — never your email or details.
        </p>
      </div>

      <p className="script mt-5 text-center text-[15px]">Small steps, big dreams. ✦</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">{children}</p>;
}
