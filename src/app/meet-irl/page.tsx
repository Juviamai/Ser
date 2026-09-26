"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Avatar, SectionTitle } from "@/components/ui";
import { shortName } from "@/lib/format";
import { useSer } from "@/lib/store";
import type { IrlLocation } from "@/lib/types";

/**
 * Meet IRL — "I want to study Calculus for 2 hours this Saturday."
 * Post a request, see nearby groups, pick a suggested place, book.
 * Not dating — find someone who studies like you.
 */

const LOC_KIND: Record<IrlLocation["kind"], { emoji: string; label: string }> = {
  library: { emoji: "📚", label: "Library" },
  cafe: { emoji: "☕", label: "Café" },
  campus: { emoji: "🏫", label: "University room" },
};

const DURATIONS = [60, 90, 120, 150, 180];

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export default function MeetIrlPage() {
  return (
    <AppShell>
      <MeetIrl />
    </AppShell>
  );
}

function MeetIrl() {
  const { state, actions } = useSer();
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(120);
  const [date, setDate] = useState(defaultDate());
  const [locPref, setLocPref] = useState<IrlLocation["kind"]>("library");
  const [justPosted, setJustPosted] = useState(false);

  const postRequest = () => {
    if (subject.trim().length < 2) return;
    actions.createIrlRequest(subject.trim(), duration, date, locPref);
    setJustPosted(true);
    actions.showToast("Request posted — finding people near you…");
  };

  const book = (groupId: string, loc: IrlLocation) => {
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return;
    actions.bookIrlSession(group, loc);
    actions.showToast(`Booked: ${loc.name} — you're in! 🎉`);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-7">
      <header className="fade-up">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Meet <span className="text-iridescent">IRL</span> 🏫
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          &ldquo;I want to study Calculus for 2 hours this Saturday.&rdquo; We find
          a few nearby people who want the same — and a good table.
          <span className="mt-1 block text-[13px] italic text-ink-faint">
            Not dating. Find someone who studies like you.
          </span>
        </p>
      </header>

      {/* create request */}
      <section className="glass pearl-edge fade-up p-5 sm:p-6" style={{ animationDelay: "50ms" }}>
        <SectionTitle title="Create a study request" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="field sm:col-span-2"
            placeholder="Subject — e.g. Calculus, thesis writing…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <input className="field" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          <select className="field" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ""}` : `${d}m`}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">Place</span>
          {(Object.keys(LOC_KIND) as IrlLocation["kind"][]).map((k) => (
            <button key={k} className={`chip ${locPref === k ? "chip-on" : ""}`} onClick={() => setLocPref(k)}>
              {LOC_KIND[k].emoji} {LOC_KIND[k].label}
            </button>
          ))}
          <button className="btn btn-primary ml-auto px-6 py-3 text-sm" onClick={postRequest} disabled={subject.trim().length < 2}>
            Post request
          </button>
        </div>
        {justPosted && (
          <p className="fade-up mt-3 rounded-2xl bg-aqua-soft/70 px-4 py-2.5 text-[13px] font-semibold text-aqua-deep">
            ✓ Request posted. Groups below match your subject and date — join one
            or wait for people to join yours.
          </p>
        )}
      </section>

      {/* my requests */}
      {state.requests.length > 0 && (
        <section className="fade-up">
          <SectionTitle title="Your requests" />
          <div className="flex flex-wrap gap-2">
            {state.requests.slice(0, 4).map((r) => (
              <span key={r.id} className="glass px-4 py-2.5 text-[13px] font-semibold">
                📌 {r.subject} · {r.date} · {LOC_KIND[r.locationPreference].emoji} {LOC_KIND[r.locationPreference].label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* nearby groups */}
      <section className="fade-up" style={{ animationDelay: "100ms" }}>
        <SectionTitle title="Nearby groups" />
        <div className="grid gap-4 lg:grid-cols-2">
          {state.groups.map((g) => {
            const memberNames = g.members.map(
              (m) => state.users.find((u) => u.id === m)?.name ?? "Student"
            );
            return (
              <article key={g.id} className="glass pearl-edge p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold leading-snug">{g.subject}</h3>
                    <p className="mt-1 text-[13px] font-semibold text-ink-soft">
                      📅 {new Date(`${g.date}T12:00:00`).toLocaleDateString([], {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })} · {g.time} · {g.duration >= 60 ? `${g.duration / 60}h` : `${g.duration}m`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-black ${
                      g.joined ? "bg-emerald-100 text-emerald-700" : "iridescent text-[#0e3a38]"
                    }`}
                  >
                    {g.joined ? "✓ Joined" : `${g.members.length}/${g.capacity} joining`}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center gap-2">
                  <div className="flex -space-x-2.5">
                    {memberNames.map((n) => (
                      <Avatar key={n} name={n} seed={n.toLowerCase()} size={34} />
                    ))}
                  </div>
                  <span className="text-[12.5px] text-ink-faint">
                    {memberNames.map(shortName).join(", ")} are going
                  </span>
                </div>

                <p className="mt-4 text-[12px] font-black uppercase tracking-[0.14em] text-ink-faint">
                  Suggested places
                </p>
                <div className="mt-2 space-y-2">
                  {g.suggestedLocations.map((loc) => (
                    <div
                      key={loc.name}
                      className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/55 px-3.5 py-2.5"
                    >
                      <span className="text-xl">{LOC_KIND[loc.kind].emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold">{loc.name}</p>
                        <p className="text-[11.5px] text-ink-faint">
                          {loc.address} · {loc.distanceKm} km away
                        </p>
                      </div>
                      <button
                        className="btn btn-soft px-4 py-2 text-[12.5px]"
                        onClick={() => book(g.id, loc)}
                        disabled={g.joined}
                      >
                        {g.joined ? "Booked" : "Book"}
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
