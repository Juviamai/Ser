"use client";

/**
 * Ser global store.
 *
 * A single React context holds the whole AppState and persists it to
 * localStorage on every change. In production this would be replaced by a
 * backend API + server state — the action surface below is deliberately shaped
 * like that API so the swap is mechanical.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultState, seedSessions } from "./mock-data";
import { breakLengthFor, rewardJustUnlocked, type Reward } from "./guardian";
import { todayISO } from "./format";
import type {
  AppState,
  GuardianState,
  IrlGroup,
  IrlLocation,
  Rating,
  Session,
  Settings,
  User,
} from "./types";

const STORAGE_KEY = "ser:state:v1";

/* --------------------------------- helpers -------------------------------- */

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    // Merge with defaults so new fields survive version bumps of the prototype.
    return { ...defaultState(), ...parsed, guardian: { ...defaultState().guardian, ...parsed.guardian }, settings: { ...defaultState().settings, ...parsed.settings } };
  } catch {
    return defaultState();
  }
}

function saveState(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — prototype keeps working in memory */
  }
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Running-average reputation update after a partner rating. Works on any user shape. */
function applyRating<T extends { reputation: AppState["currentUser"] extends null ? never : NonNullable<AppState["currentUser"]>["reputation"] }>(user: T, stars: number): T {
  const r = user.reputation;
  const ratingsCount = r.ratingsCount + 1;
  const score = (r.score * r.ratingsCount + stars) / ratingsCount;
  const onTimeRate = Math.round(
    Math.min(100, Math.max(0, r.onTimeRate + (stars >= 4 ? 0.5 : -3)))
  );
  const sessionsCompleted = r.sessionsCompleted + 1;
  return {
    ...user,
    reputation: {
      score: Math.round(score * 10) / 10,
      ratingsCount,
      onTimeRate,
      sessionsCompleted,
      highlyFocused: score >= 4.5,
      friendly: sessionsCompleted >= 3 && score >= 4.0,
    },
  };
}

/** Streak bumps once per calendar day when any session completes. */
function bumpStreak(user: User): User {
  const today = todayISO();
  if (user.lastStudyDate === today) return user;
  return { ...user, streak: user.streak + 1, lastStudyDate: today };
}

/* ---------------------------------- store --------------------------------- */

export interface OnboardingData {
  name: string;
  email: string;
  phone: string;
  university: string;
  studyGoal: string;
  personality: User["personality"];
  level: User["level"];
  preferredGender: User["preferredGender"];
  timezone: string;
  studyTime: string;
  studyDays: string[];
  onlineOffline: User["onlineOffline"];
}

export interface SerActions {
  completeOnboarding: (data: OnboardingData) => void;

  createBuddySession: (partnerId: string, subject: string, minutes?: number) => string;
  endAndRateSession: (sessionId: string, stars: 1 | 2 | 3 | 4 | 5, note?: string) => void;
  cancelSession: (sessionId: string) => void;

  createIrlRequest: (subject: string, duration: number, date: string, pref: IrlLocation["kind"]) => void;
  bookIrlSession: (group: IrlGroup, location: IrlLocation) => void;

  guardianStart: () => void;
  guardianReachPrompt: () => void;
  guardianTakeBreak: () => number; // returns awarded break seconds
  guardianFinishBreak: () => void;
  guardianKeepStudying: () => Reward | null; // returns reward just unlocked, if any
  guardianEnd: (finalFocusedSeconds?: number) => void;
  guardianToggleDemo: () => void;

  sendMessage: (partnerId: string, text: string) => void;
  markConversationRead: (partnerId: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;

  toast: string | null;
  showToast: (msg: string) => void;
}

const SerContext = createContext<{ state: AppState; actions: SerActions } | null>(null);

export function SerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => defaultState());
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted state after mount (client-only) and persist every change.
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const actions = useMemo<Omit<SerActions, "toast" | "showToast">>(() => ({
    showToast,

    completeOnboarding: (data) =>
      setState((s) => ({
        ...s,
        currentUser: {
          id: "me",
          name: data.name,
          email: data.email,
          phone: data.phone,
          university: data.university,
          verifiedStudent: true, // mock verification completed in the flow
          reputation: {
            score: 5.0,
            ratingsCount: 1,
            onTimeRate: 100,
            sessionsCompleted: 1,
            highlyFocused: true,
            friendly: false,
          },
          avatarSeed: data.name.toLowerCase().replace(/\s+/g, "-"),
          studyGoal: data.studyGoal,
          level: data.level,
          personality: data.personality,
          preferredGender: data.preferredGender,
          timezone: data.timezone,
          studyTime: data.studyTime,
          studyDays: data.studyDays,
          onlineOffline: data.onlineOffline,
          bio: "New on Ser — looking for a calm, consistent study partner.",
          studyStars: 0,
          streak: 1,
          lastStudyDate: null,
          onboarded: true,
          createdAt: new Date().toISOString(),
        },
        sessions: seedSessions(),
      })),

    createBuddySession: (partnerId, subject, minutes = 50) => {
      const id = uid("s");
      setState((s) => ({
        ...s,
        sessions: [
          {
            id,
            mode: "buddy",
            participants: ["me", partnerId],
            subject,
            startTime: new Date().toISOString(),
            plannedMinutes: minutes,
            status: "ongoing",
          },
          ...s.sessions,
        ],
      }));
      return id;
    },

    endAndRateSession: (sessionId, stars, note) =>
      setState((s) => {
        const session = s.sessions.find((x) => x.id === sessionId);
        if (!session) return s;

        const rating: Rating = { from: "me", to: session.participants.find((p) => p !== "me") ?? "unknown", stars, note };

        // Partner rates you back — mostly generous, occasionally honest 🙂
        const myStars: 1 | 2 | 3 | 4 | 5 = Math.random() < 0.85 ? 5 : 4;

        const updatedSessions = s.sessions.map((x) =>
          x.id === sessionId
            ? {
                ...x,
                status: "completed" as const,
                endTime: new Date().toISOString(),
                ratings: [...(x.ratings ?? []), rating, { from: rating.to, to: "me", stars: myStars }],
              }
            : x
        );

        // Update partner reputation in the community pool.
        const users = s.users.map((u) => (u.id === rating.to ? applyRating(u, stars) : u));

        const me = s.currentUser ? applyRating(bumpStreak(s.currentUser), myStars) : null;

        return { ...s, sessions: updatedSessions, users, currentUser: me };
      }),

    cancelSession: (sessionId) =>
      setState((s) => ({
        ...s,
        sessions: s.sessions.map((x) =>
          x.id === sessionId ? { ...x, status: "cancelled" as const } : x
        ),
      })),

    createIrlRequest: (subject, duration, date, pref) =>
      setState((s) => ({
        ...s,
        requests: [
          { id: uid("r"), userId: "me", subject, duration, date, locationPreference: pref, createdAt: new Date().toISOString() },
          ...s.requests,
        ],
      })),

    bookIrlSession: (group, location) =>
      setState((s) => ({
        ...s,
        groups: s.groups.map((g) => (g.id === group.id ? { ...g, joined: true, members: [...g.members, "me"] } : g)),
        sessions: [
          {
            id: uid("s"),
            mode: "irl",
            participants: ["me", ...group.members],
            subject: group.subject,
            startTime: new Date(`${group.date}T${group.time}:00`).toISOString(),
            plannedMinutes: group.duration,
            status: "upcoming",
            location,
          },
          ...s.sessions,
        ],
      })),

    /* ------------------------------ AI Guardian ----------------------------- */

    guardianStart: () =>
      setState((s) => ({
        ...s,
        guardian: {
          ...s.guardian,
          phase: "focusing",
          startedAt: Date.now(),
          breakStartedAt: null,
        },
      })),

    guardianReachPrompt: () =>
      setState((s) => ({
        ...s,
        guardian: {
          ...s.guardian,
          phase: "prompt",
          // freeze the accumulated focus at the 45-min milestone
          focusedSeconds: 45 * 60 * (s.guardian.completedCycles + 1),
        },
      })),

    guardianTakeBreak: () => {
      const seconds = breakLengthFor(state.currentUser?.studyStars ?? 0);
      setState((s) => ({
        ...s,
        guardian: {
          ...s.guardian,
          phase: "break",
          breakSecondsTotal: seconds,
          breakStartedAt: Date.now(),
        },
      }));
      return seconds;
    },

    guardianFinishBreak: () =>
      setState((s) => ({
        ...s,
        guardian: {
          ...s.guardian,
          phase: "focusing",
          startedAt: Date.now(),
          breakStartedAt: null,
        },
      })),

    guardianKeepStudying: () => {
      let unlocked: Reward | null = null;
      setState((s) => {
        if (!s.currentUser) return s;
        const before = s.currentUser.studyStars;
        const after = before + 1;
        unlocked = rewardJustUnlocked(before, after);
        return {
          ...s,
          currentUser: { ...s.currentUser, studyStars: after },
          guardian: {
            ...s.guardian,
            phase: unlocked ? "reward" : "focusing",
            startedAt: Date.now(), // fresh base so time math stays honest after the modal
            completedCycles: s.guardian.completedCycles + 1,
          },
        };
      });
      return unlocked;
    },

    guardianEnd: (finalFocusedSeconds) =>
      setState((s) => {
        const g = s.guardian;
        const focused = finalFocusedSeconds ?? g.focusedSeconds;
        const studiedMin = Math.round(focused / 60);
        const wasIdle = g.phase === "idle";
        const newSessions: Session[] =
          wasIdle || studiedMin < 1
            ? s.sessions
            : [
                {
                  id: uid("s"),
                  mode: "ai",
                  participants: ["me", "ai"],
                  subject: "Solo focus session",
                  startTime: new Date(Date.now() - focused * 1000).toISOString(),
                  endTime: new Date().toISOString(),
                  plannedMinutes: Math.max(45, studiedMin),
                  status: "completed",
                },
                ...s.sessions,
              ];
        return {
          ...s,
          sessions: newSessions,
          currentUser: s.currentUser && !wasIdle && studiedMin >= 1 ? bumpStreak(s.currentUser) : s.currentUser,
          guardian: { ...defaultState().guardian, demoSpeed: g.demoSpeed },
        };
      }),

    guardianToggleDemo: () =>
      setState((s) => ({
        ...s,
        guardian: { ...s.guardian, demoSpeed: !s.guardian.demoSpeed, focusedSeconds: 0, startedAt: s.guardian.phase === "focusing" ? Date.now() : s.guardian.startedAt, completedCycles: 0, phase: "idle", breakStartedAt: null },
      })),

    /* -------------------------------- Messages ------------------------------ */

    sendMessage: (partnerId, text) => {
      setState((s) => {
        const existing = s.conversations.find((c) => c.id === partnerId);
        const msg = { id: uid("m"), from: "me", text, at: new Date().toISOString() };
        if (!existing) {
          return {
            ...s,
            conversations: [
              { id: partnerId, unread: 0, messages: [msg], partnerReplies: ["Sounds good!", "See you at the session ✨", "Same time tomorrow?"] },
              ...s.conversations,
            ],
          };
        }
        return {
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === partnerId ? { ...c, messages: [...c.messages, msg] } : c
          ),
        };
      });

      // Simulate the partner replying after a short, human-ish delay.
      const conv = state.conversations.find((c) => c.id === partnerId);
      const pool = conv?.partnerReplies ?? ["👍"];
      const reply = pool[Math.floor(Math.random() * pool.length)];
      setTimeout(() => {
        setState((s) => ({
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === partnerId
              ? { ...c, messages: [...c.messages, { id: uid("m"), from: partnerId, text: reply, at: new Date().toISOString() }] }
              : c
          ),
        }));
      }, 1400 + Math.random() * 1200);
    },

    markConversationRead: (partnerId) =>
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === partnerId ? { ...c, unread: 0 } : c
        ),
      })),

    updateSettings: (patch) =>
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),

    resetDemo: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setState(defaultState());
    },
  }), [showToast, state.conversations, state.currentUser?.studyStars]);

  const value = useMemo(
    () => ({ state, actions: { ...actions, toast, showToast } }),
    [state, actions, toast, showToast]
  );

  return <SerContext.Provider value={value}>{children}</SerContext.Provider>;
}

export function useSer() {
  const ctx = useContext(SerContext);
  if (!ctx) throw new Error("useSer must be used inside <SerProvider>");
  return ctx;
}

/** Convenience selector: session list sorted with live/ongoing first. */
export function sortedSessions(sessions: Session[]): Session[] {
  const rank = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 } as const;
  return [...sessions].sort(
    (a, b) => rank[a.status] - rank[b.status] || +new Date(b.startTime) - +new Date(a.startTime)
  );
}
