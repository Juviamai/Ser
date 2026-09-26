/**
 * Smoke test for the pure logic modules (no browser needed).
 * Run: node scripts/logic-check.ts   (Node ≥ 22 with type stripping)
 */
import { computeMatch, findMatches } from "../src/lib/matching.ts";
import {
  breakLengthFor,
  cycleProgress,
  effectiveBreakRemaining,
  effectiveFocusedSeconds,
  nextReward,
  rewardJustUnlocked,
  FOCUS_CYCLE_SECONDS,
} from "../src/lib/guardian.ts";
import type { PublicUser, User } from "../src/lib/types.ts";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (!cond) {
    failures++;
    console.error(`✗ ${name} ${detail}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

/* ── matching ─────────────────────────────────────────────────────────── */

const me: User = {
  id: "me",
  name: "Mai Le",
  email: "x@y.zz",
  phone: "123",
  university: "T",
  verifiedStudent: true,
  reputation: { score: 5, ratingsCount: 1, onTimeRate: 100, sessionsCompleted: 1, highlyFocused: true, friendly: false },
  avatarSeed: "mai",
  studyGoal: "Calculus — midterm soon",
  level: "intermediate",
  personality: "focused-quiet",
  preferredGender: "any",
  timezone: "GMT+8",
  studyTime: "19:00–21:00",
  studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  onlineOffline: "online",
  studyStars: 0,
  streak: 1,
  lastStudyDate: null,
  onboarded: true,
  createdAt: new Date().toISOString(),
};

const twin: PublicUser = {
  id: "twin",
  name: "Twin Chen",
  avatarSeed: "twin",
  verifiedStudent: true,
  reputation: { score: 4.9, ratingsCount: 10, onTimeRate: 98, sessionsCompleted: 9, highlyFocused: true, friendly: true },
  studyGoal: "Calculus — finals",
  level: "intermediate",
  timezone: "GMT+8",
  personality: "focused-quiet",
  studyTime: "19:00–21:00",
  studyDays: ["Mon", "Tue", "Wed"],
  onlineOffline: "online",
  universityHidden: true,
};

const farAway: PublicUser = {
  ...twin,
  id: "far",
  name: "Far Person",
  studyGoal: "Ceramics history",
  level: "advanced",
  timezone: "GMT-5",
  personality: "flexible",
  studyTime: "05:00–06:00",
  studyDays: ["Sun"],
};

const m1 = computeMatch(me, twin);
const m2 = computeMatch(me, farAway);
check("twin scores high (≥80)", m1.score >= 80, `got ${m1.score}`);
check("twin beats far match by >25 pts", m1.score - m2.score > 25, `${m1.score} vs ${m2.score}`);
check("score ≤ 99", m1.score <= 99 && m2.score <= 99);
check("shared-goal reason present", m1.reasons.some((r) => r.toLowerCase().includes("goal")));
check("timezone reason for twin", m1.reasons.some((r) => r.includes("timezone")));

const ranked = findMatches(me, [twin, farAway]);
check("findMatches ranks twin first", ranked[0].user.id === "twin");
const filtered = findMatches(me, [twin, farAway], { level: "advanced" });
check("level filter works", filtered.length === 1 && filtered[0].user.id === "far");

/* ── guardian ─────────────────────────────────────────────────────────── */

check("base break is 15 min", breakLengthFor(0) === 15 * 60);
check("2 stars → 30 min break", breakLengthFor(2) === 30 * 60);
check("10 stars → 60 min break", breakLengthFor(10) === 60 * 60);
check("focus cycle is 45 min", FOCUS_CYCLE_SECONDS === 45 * 60);

check("unlock at 2 = Double Break", rewardJustUnlocked(1, 2)?.title === "Double Break");
check("unlock at 5 = Unlock Game", rewardJustUnlocked(4, 5)?.title === "Unlock Game");
check("unlock at 10 = Long Break", rewardJustUnlocked(9, 10)?.title === "Long Break");
check("no unlock 5→6", rewardJustUnlocked(5, 6) === null);
check("nextReward(0) is 2 stars", nextReward(0)?.stars === 2);
check("nextReward(9) is 10 stars", nextReward(9)?.stars === 10);
check("nextReward(10) is null", nextReward(10) === null);

const g = {
  phase: "focusing" as const,
  startedAt: Date.now() - 10_000,
  focusedSeconds: 0,
  breakSecondsTotal: 0,
  breakStartedAt: null,
  completedCycles: 0,
  demoSpeed: true,
};
const eff = effectiveFocusedSeconds(g, Date.now());
check("demo speed 1s → ~10 study min", Math.abs(eff - 600) < 30, `got ${eff}s`);
check("cycle progress in [0,1)", cycleProgress(2700) >= 0 && cycleProgress(2700) < 1);
check("cycle progress at milestone ~0", cycleProgress(2700) < 0.02 || Math.abs(cycleProgress(2700) - 1) < 0.02);

const gb = {
  ...g,
  phase: "break" as const,
  breakSecondsTotal: 900,
  breakStartedAt: Date.now() - 5_000,
  startedAt: null,
};
const remain = effectiveBreakRemaining(gb, Date.now());
check("break remaining ~15min − 5min(demo)", Math.abs(remain - 600) < 30, `got ${remain}s`);

console.log(failures === 0 ? "\nALL CHECKS PASSED ✅" : `\n${failures} CHECK(S) FAILED ❌`);
process.exit(failures === 0 ? 0 : 1);
