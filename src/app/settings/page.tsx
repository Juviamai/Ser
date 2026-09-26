"use client";

import AppShell from "@/components/AppShell";
import { SectionTitle, Toggle } from "@/components/ui";
import { useSer } from "@/lib/store";

const LANGUAGES = ["English", "中文", "한국어", "日本語", "Español", "Français", "Deutsch"];
const REGIONS = ["Auto-detected", "North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa"];
const TIMEZONES = ["GMT-8", "GMT-5", "GMT-3", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+5:30", "GMT+8", "GMT+9"];

export default function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const { state, actions } = useSer();
  const s = state.settings;

  return (
    <div className="max-w-2xl space-y-6">
      <header className="fade-up">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Settings <span className="text-iridescent">⚙️</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">Tune Ser to feel like yours.</p>
      </header>

      <section className="glass pearl-edge fade-up p-5 sm:p-6" style={{ animationDelay: "40ms" }}>
        <SectionTitle title="Language & region" />
        <div className="grid gap-3 sm:grid-cols-3">
          <LabeledSelect label="Language" value={s.language} options={LANGUAGES} onChange={(v) => actions.updateSettings({ language: v })} />
          <LabeledSelect label="Region" value={s.region} options={REGIONS} onChange={(v) => actions.updateSettings({ region: v })} />
          <LabeledSelect label="Time zone" value={s.timezone} options={TIMEZONES} onChange={(v) => actions.updateSettings({ timezone: v })} />
        </div>
      </section>

      <section className="glass pearl-edge fade-up p-5 sm:p-6" style={{ animationDelay: "80ms" }}>
        <SectionTitle title="Notifications" />
        <div className="divide-y divide-white/60">
          <Toggle
            checked={s.notifyReminders}
            onChange={(v) => actions.updateSettings({ notifyReminders: v })}
            label="Session reminders"
            hint="A gentle nudge 30 minutes before each session"
          />
          <Toggle
            checked={s.notifyMessages}
            onChange={(v) => actions.updateSettings({ notifyMessages: v })}
            label="Partner messages"
            hint="When a study partner writes to you"
          />
          <Toggle
            checked={s.notifyRewards}
            onChange={(v) => actions.updateSettings({ notifyRewards: v })}
            label="Rewards & milestones"
            hint="Break offers, Study Stars, unlocked rewards"
          />
        </div>
      </section>

      <section className="glass pearl-edge fade-up p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
        <SectionTitle title="Privacy" />
        <div className="divide-y divide-white/60">
          <Toggle
            checked={s.cameraDefaultOn}
            onChange={(v) => actions.updateSettings({ cameraDefaultOn: v })}
            label="Camera on by default"
            hint="In study rooms — avatar mode is always one tap away"
          />
          <Toggle
            checked={s.showRealName}
            onChange={(v) => actions.updateSettings({ showRealName: v })}
            label="Show my full name"
            hint="Off = first name + initial. Email, phone & university are never shown."
          />
        </div>
        <p className="mt-3 rounded-2xl bg-white/55 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
          🔒 Ser never publicizes your real info. Other students only see{" "}
          <b>🎓 Verified Student</b> and your <b>Study Reputation</b>.
        </p>
      </section>

      <section className="glass pearl-edge fade-up p-5 sm:p-6" style={{ animationDelay: "160ms" }}>
        <SectionTitle title="Prototype data" />
        <p className="text-[13px] text-ink-soft">
          Everything lives in your browser&apos;s localStorage. Reset to walk
          through onboarding again with fresh data.
        </p>
        <button
          className="btn btn-soft mt-4 border-rose-200 bg-rose-50/80 px-6 py-3 text-sm !text-rose-500 hover:bg-rose-100/80"
          onClick={() => actions.resetDemo()}
        >
          ↺ Reset demo data
        </button>
      </section>

      <p className="pb-2 text-center text-xs italic text-ink-faint">Ser — study with real people, not just a timer.</p>
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
