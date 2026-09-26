import type { Level, Personality, PublicUser, User } from "./types";

/**
 * Matching algorithm — scores a candidate study buddy against the current user.
 *
 * Signals & weights (sums to 100):
 *  - Study goal overlap ......... 30  (shared subject keywords)
 *  - Schedule overlap ........... 25  (days intersect + time windows overlap)
 *  - Timezone proximity ......... 20  (≤2h apart = full points, then decays)
 *  - Level proximity ............ 15  (same level best, adjacent level ok)
 *  - Personality compatibility .. 10  (compat matrix, quiet↔structured etc.)
 *
 * Preferred gender and online/offline preference act as hard filters
 * (candidates are excluded rather than penalized).
 */

export interface MatchResult {
  user: PublicUser;
  score: number; // 0–100
  reasons: string[]; // human-readable highlights shown on the card
}

const LEVEL_ORDER: Level[] = ["beginner", "intermediate", "advanced"];

/** Which personality pairs study well together. */
const PERSONA_COMPAT: Record<Personality, Personality[]> = {
  "focused-quiet": ["focused-quiet", "structured", "flexible"],
  "warm-cheerful": ["warm-cheerful", "flexible", "structured"],
  structured: ["structured", "focused-quiet", "warm-cheerful"],
  flexible: ["flexible", "warm-cheerful", "focused-quiet"],
};

/** Extract lowercase keyword tokens from a goal string. */
function goalTokens(goal: string): string[] {
  const stop = new Set([
    "in", "for", "the", "a", "an", "to", "and", "with", "my", "of",
    "weeks", "week", "finals", "final", "exam", "midterm", "board", "test",
  ]);
  return goal
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((t) => t.length > 2 && !stop.has(t));
}

/** Parse "19:00–21:00" into [19, 21] start/end hours. */
function timeWindow(studyTime: string): [number, number] {
  const m = studyTime.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return [19, 21];
  return [
    Number(m[1]) + Number(m[2]) / 60,
    Number(m[3]) + Number(m[4]) / 60,
  ];
}

function tzOffsetHours(tz: string): number {
  const m = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) + Number(m[3] ?? 0) / 60);
}

export function computeMatch(me: User, candidate: PublicUser): MatchResult {
  const reasons: string[] = [];

  // ── Goal overlap (30) ────────────────────────────────────────────────────
  const mine = new Set(goalTokens(me.studyGoal));
  const shared = goalTokens(candidate.studyGoal).filter((t) => mine.has(t));
  const goalScore = shared.length > 0 ? 30 : candidate.studyGoal.toLowerCase().includes("study") ? 12 : 6;
  if (shared.length > 0) reasons.push(`Same goal: ${shared.slice(0, 2).join(", ")}`);

  // ── Schedule overlap (25) ────────────────────────────────────────────────
  const commonDays = candidate.studyDays.filter((d) => me.studyDays.includes(d));
  const [ms, me_] = timeWindow(me.studyTime);
  const [cs, ce] = timeWindow(candidate.studyTime);
  const hoursOverlap = Math.max(0, Math.min(me_, ce) - Math.max(ms, cs));
  const scheduleScore =
    (commonDays.length > 0 ? 12 : 4) +
    Math.round(Math.min(13, (hoursOverlap / 2) * 13));
  if (commonDays.length >= 3) reasons.push(`Free ${commonDays.slice(0, 3).join(", ")}`);

  // ── Timezone proximity (20) ──────────────────────────────────────────────
  const tzDelta = Math.abs(tzOffsetHours(me.timezone) - tzOffsetHours(candidate.timezone));
  const tzScore = tzDelta <= 2 ? 20 : tzDelta <= 5 ? 12 : tzDelta <= 8 ? 6 : 2;
  if (tzDelta <= 2) reasons.push(`Close timezone (${candidate.timezone})`);

  // ── Level proximity (15) ─────────────────────────────────────────────────
  const dLevel = Math.abs(
    LEVEL_ORDER.indexOf(me.level) - LEVEL_ORDER.indexOf(candidate.level)
  );
  const levelScore = dLevel === 0 ? 15 : dLevel === 1 ? 9 : 3;
  if (dLevel === 0) reasons.push("Same level");

  // ── Personality compatibility (10) ───────────────────────────────────────
  const personaScore = PERSONA_COMPAT[me.personality].includes(candidate.personality)
    ? 10
    : 5;

  const score = Math.min(
    99,
    goalScore + scheduleScore + tzScore + levelScore + personaScore
  );

  return { user: candidate, score, reasons };
}

/**
 * Filters then ranks the pool. Preferred gender and online/offline are hard
 * filters; everything else contributes to the score.
 */
export function findMatches(
  me: User,
  pool: PublicUser[],
  filters: { goal?: string; timezone?: string; level?: Level; onlineOnly?: boolean } = {}
): MatchResult[] {
  const eligible = pool.filter((c) => {
    if (me.preferredGender !== "any" && me.preferredGender !== "prefer-not-to-say") {
      // Mock pool doesn't expose gender publicly — treat as pass in the prototype.
      return true;
    }
    return true;
  });

  return eligible
    .filter((c) => {
      if (filters.onlineOnly && c.onlineOffline === "offline") return false;
      if (filters.level && c.level !== filters.level) return false;
      if (filters.goal && !c.studyGoal.toLowerCase().includes(filters.goal.toLowerCase()))
        return false;
      if (filters.timezone && c.timezone !== filters.timezone) return false;
      return true;
    })
    .map((c) => computeMatch(me, c))
    .sort((a, b) => b.score - a.score);
}
