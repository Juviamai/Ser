import type { GuardianState } from "./types";

/**
 * AI Study Guardian logic.
 *
 * The guardian observes — it never teaches. One "focus cycle" is 45 minutes:
 *
 *   00:00 start → 45:00 sustained focus detected → choice:
 *       • Take a break  → +15 min break (or +30 if "Double Break" unlocked)
 *       • Keep studying → +1 Study Star, next cycle starts
 *
 * Star reward thresholds (checked after every "keep studying"):
 *   ⭐ 2  → Double Break   (breaks become 30 min)
 *   ⭐ 5  → Mini-game unlock (Ser Blooms)
 *   ⭐ 10 → Long Break + special reward frame
 */

export const FOCUS_CYCLE_SECONDS = 45 * 60;

export interface Reward {
  stars: number;
  title: string;
  description: string;
  emoji: string;
}

export const REWARDS: Reward[] = [
  { stars: 2, title: "Double Break", description: "Your earned breaks become 30 minutes.", emoji: "🌙" },
  { stars: 5, title: "Unlock Game", description: "Ser Blooms — a calm mini-game for your breaks.", emoji: "🎮" },
  { stars: 10, title: "Long Break", description: "60-minute long break + special reward frame.", emoji: "🌸" },
];

/** Break length the user has earned, given their star total. */
export function breakLengthFor(studyStars: number): number {
  if (studyStars >= 10) return 60 * 60;
  if (studyStars >= 2) return 30 * 60;
  return 15 * 60;
}

/** First reward locked behind the next star count. */
export function nextReward(studyStars: number): Reward | null {
  return REWARDS.find((r) => r.stars > studyStars) ?? null;
}

export function rewardJustUnlocked(before: number, after: number): Reward | null {
  return REWARDS.find((r) => r.stars > before && r.stars <= after) ?? null;
}

/** Elapsed "study seconds" given real elapsed time and the demo speed flag. */
export function effectiveFocusedSeconds(g: GuardianState, nowMs: number): number {
  if (g.phase === "idle") return g.focusedSeconds;
  if (g.phase === "break" || g.phase === "prompt") return g.focusedSeconds;
  const base = g.focusedSeconds;
  const startedAt = g.breakStartedAt ?? g.startedAt;
  if (!startedAt) return base;
  const realSeconds = (nowMs - startedAt) / 1000;
  const seconds = g.demoSpeed ? realSeconds * 60 : realSeconds; // 1s real = 1min study in demo
  return Math.floor(base + seconds);
}

/** Seconds into the current earned break (break phase only). */
export function effectiveBreakRemaining(g: GuardianState, nowMs: number): number {
  if (g.phase !== "break" || !g.breakStartedAt) return 0;
  const realSeconds = (nowMs - g.breakStartedAt) / 1000;
  const elapsed = g.demoSpeed ? realSeconds * 60 : realSeconds;
  return Math.max(0, Math.ceil(g.breakSecondsTotal - elapsed));
}

/** Progress 0–1 through the current 45-min focus cycle. */
export function cycleProgress(focusedSeconds: number): number {
  return Math.min(1, (focusedSeconds % FOCUS_CYCLE_SECONDS) / FOCUS_CYCLE_SECONDS);
}
