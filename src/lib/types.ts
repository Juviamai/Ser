/**
 * Ser — core data model.
 * Everything here is serializable so the whole app state can live in
 * localStorage during the prototype phase and be swapped for a backend later.
 */

export type StudyMode = "buddy" | "irl" | "ai";

export type Personality =
  | "focused-quiet" // quiet, deep-work lover
  | "warm-cheerful" // encouraging, chatty at breaks
  | "structured" // planner, checklist driven
  | "flexible"; // easy-going, adapts to partner

export type Level = "beginner" | "intermediate" | "advanced";

export type Gender = "female" | "male" | "other" | "prefer-not-to-say";

export type PreferredGender = Gender | "any";

export type OnlineOffline = "online" | "offline" | "both";

/** What other users are allowed to see — real info (email/phone/university) never leaves the profile. */
export interface PublicUser {
  id: string;
  name: string; // first name + initial only in UI
  avatarSeed: string; // deterministic gradient/avatar seed
  verifiedStudent: boolean;
  reputation: Reputation;
  studyGoal: string;
  level: Level;
  timezone: string;
  personality: Personality;
  studyTime: string; // e.g. "19:00–21:00"
  studyDays: string[]; // e.g. ["Mon","Tue"]
  onlineOffline: OnlineOffline;
  bio?: string;
  universityHidden: true; // never rendered, just documents the contract
}

/** Full user — only the current user's own record is ever populated in the UI. */
export interface User extends Omit<PublicUser, "universityHidden"> {
  email: string;
  phone: string;
  university: string;
  preferredGender: PreferredGender;
  studyStars: number;
  streak: number;
  lastStudyDate: string | null; // ISO date (yyyy-mm-dd)
  onboarded: boolean;
  createdAt: string;
}

export interface Reputation {
  score: number; // 1.0–5.0, running average of partner ratings
  ratingsCount: number;
  onTimeRate: number; // 0–100
  sessionsCompleted: number;
  /** Badge signals — derived + stored after each session. */
  highlyFocused: boolean; // avg rating >= 4.5
  friendly: boolean; // >= 3 sessions completed & avg >= 4.0
}

export type SessionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Rating {
  from: string; // user id
  to: string; // user id
  stars: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface Session {
  id: string;
  mode: StudyMode;
  participants: string[]; // user ids (["ai"] for guardian sessions)
  subject: string;
  startTime: string; // ISO
  endTime?: string; // ISO
  plannedMinutes: number;
  status: SessionStatus;
  location?: IrlLocation;
  ratings?: Rating[];
}

export interface StudyRequest {
  id: string;
  userId: string;
  subject: string;
  duration: number; // minutes
  date: string; // yyyy-mm-dd
  locationPreference: IrlLocation["kind"];
  createdAt: string;
}

export interface IrlLocation {
  kind: "library" | "cafe" | "campus";
  name: string;
  address: string;
  distanceKm: number;
}

export interface IrlGroup {
  id: string;
  subject: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  duration: number;
  members: string[]; // user ids
  capacity: number;
  suggestedLocations: IrlLocation[];
  joined: boolean;
}

export interface ChatMessage {
  id: string;
  from: string; // user id
  text: string;
  at: string; // ISO
}

export interface Conversation {
  id: string; // partner user id
  messages: ChatMessage[];
  unread: number;
  /** Canned reply pool used to simulate a real partner answering. */
  partnerReplies: string[];
}

export type GuardianPhase =
  | "idle" // before starting
  | "focusing" // studying, timer running
  | "prompt" // 45 min reached — break or keep studying?
  | "break" // on a earned break
  | "reward"; // just crossed a reward threshold

export interface GuardianState {
  phase: GuardianPhase;
  startedAt: number | null; // epoch ms
  focusedSeconds: number; // accumulated focus seconds (excluding breaks)
  breakSecondsTotal: number; // break length awarded (900 or 1800)
  breakStartedAt: number | null;
  completedCycles: number; // how many 45-min milestones were reached
  demoSpeed: boolean; // 1s tick = 1min of study, so the flow can be demoed fast
}

export interface Settings {
  language: string;
  region: string;
  timezone: string;
  notifyReminders: boolean;
  notifyMessages: boolean;
  notifyRewards: boolean;
  cameraDefaultOn: boolean;
  showRealName: boolean; // privacy: show full name vs first name + initial
}

export interface AppState {
  currentUser: User | null;
  users: PublicUser[]; // the community pool (public projection only)
  sessions: Session[];
  requests: StudyRequest[];
  groups: IrlGroup[];
  conversations: Conversation[];
  guardian: GuardianState;
  settings: Settings;
}
