import type {
  AppState,
  Conversation,
  IrlGroup,
  PublicUser,
  Session,
} from "./types";

/**
 * Mock community pool — these are *public* projections of users:
 * no email / phone / university. That data is intentionally never created here.
 */

const rep = (
  score: number,
  ratingsCount: number,
  onTimeRate: number,
  sessionsCompleted: number
) => ({
  score,
  ratingsCount,
  onTimeRate,
  sessionsCompleted,
  highlyFocused: score >= 4.5,
  friendly: sessionsCompleted >= 3 && score >= 4.0,
});

export const MOCK_USERS: PublicUser[] = [
  {
    id: "u-mira",
    name: "Mira Chen",
    avatarSeed: "mira",
    verifiedStudent: true,
    reputation: rep(4.9, 46, 98, 41),
    studyGoal: "Calculus — midterm in 3 weeks",
    level: "intermediate",
    timezone: "GMT+8",
    personality: "focused-quiet",
    studyTime: "19:00–21:00",
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    onlineOffline: "online",
    bio: "Med student. I love silent deep-work sessions with a quick check-in at the end.",
    universityHidden: true,
  },
  {
    id: "u-jonas",
    name: "Jonas Park",
    avatarSeed: "jonas",
    verifiedStudent: true,
    reputation: rep(4.7, 31, 94, 28),
    studyGoal: "German B2 grammar",
    level: "intermediate",
    timezone: "GMT+2",
    personality: "structured",
    studyTime: "18:30–20:30",
    studyDays: ["Mon", "Wed", "Fri", "Sun"],
    onlineOffline: "both",
    bio: "Checklists keep me sane. I plan the session before we start.",
    universityHidden: true,
  },
  {
    id: "u-aya",
    name: "Aya Tanaka",
    avatarSeed: "aya",
    verifiedStudent: true,
    reputation: rep(5.0, 22, 100, 19),
    studyGoal: "Data structures & algorithms",
    level: "advanced",
    timezone: "GMT+9",
    personality: "warm-cheerful",
    studyTime: "20:00–22:00",
    studyDays: ["Tue", "Thu", "Sat"],
    onlineOffline: "online",
    bio: "CS senior. I celebrate small wins — expect a cheer at every break 🎉",
    universityHidden: true,
  },
  {
    id: "u-lucia",
    name: "Lucía Gómez",
    avatarSeed: "lucia",
    verifiedStudent: true,
    reputation: rep(4.5, 18, 88, 16),
    studyGoal: "Organic chemistry — finals",
    level: "advanced",
    timezone: "GMT-3",
    personality: "flexible",
    studyTime: "09:00–11:00",
    studyDays: ["Mon", "Tue", "Thu", "Sat"],
    onlineOffline: "both",
    bio: "Morning person. Coffee first, mechanisms later.",
    universityHidden: true,
  },
  {
    id: "u-sam",
    name: "Sam Okafor",
    avatarSeed: "sam",
    verifiedStudent: true,
    reputation: rep(4.8, 52, 96, 47),
    studyGoal: "SAT math — 750+",
    level: "beginner",
    timezone: "GMT+1",
    personality: "warm-cheerful",
    studyTime: "16:00–18:00",
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    onlineOffline: "online",
    bio: "Gap-year self-learner. Looking for a calm accountability partner.",
    universityHidden: true,
  },
  {
    id: "u-elif",
    name: "Elif Yılmaz",
    avatarSeed: "elif",
    verifiedStudent: true,
    reputation: rep(4.9, 38, 97, 34),
    studyGoal: "Architecture history thesis",
    level: "advanced",
    timezone: "GMT+3",
    personality: "focused-quiet",
    studyTime: "21:00–23:00",
    studyDays: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    onlineOffline: "online",
    bio: "Night owl. Silence + lo-fi + long stretches.",
    universityHidden: true,
  },
  {
    id: "u-noah",
    name: "Noah Fischer",
    avatarSeed: "noah",
    verifiedStudent: true,
    reputation: rep(4.3, 15, 82, 13),
    studyGoal: "Intro to psychology",
    level: "beginner",
    timezone: "GMT+2",
    personality: "flexible",
    studyTime: "19:00–21:00",
    studyDays: ["Tue", "Wed", "Thu"],
    onlineOffline: "both",
    bio: "First-year. Just trying to build the habit, one session at a time.",
    universityHidden: true,
  },
  {
    id: "u-priya",
    name: "Priya Nair",
    avatarSeed: "priya",
    verifiedStudent: true,
    reputation: rep(4.8, 29, 95, 26),
    studyGoal: "IELTS 8.0 writing",
    level: "intermediate",
    timezone: "GMT+5:30",
    personality: "structured",
    studyTime: "06:30–08:00",
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    onlineOffline: "online",
    bio: "Dawn studier. Two essays before breakfast.",
    universityHidden: true,
  },
  {
    id: "u-theo",
    name: "Théo Laurent",
    avatarSeed: "theo",
    verifiedStudent: true,
    reputation: rep(4.6, 24, 90, 21),
    studyGoal: "Linear algebra",
    level: "intermediate",
    timezone: "GMT+1",
    personality: "focused-quiet",
    studyTime: "17:00–19:00",
    studyDays: ["Mon", "Thu", "Fri", "Sun"],
    onlineOffline: "offline",
    bio: "I prefer libraries over calls — let's meet IRL if you're in Lyon.",
    universityHidden: true,
  },
  {
    id: "u-hana",
    name: "Hana Kim",
    avatarSeed: "hana",
    verifiedStudent: true,
    reputation: rep(4.9, 41, 99, 38),
    studyGoal: "Pharmacology — board exam",
    level: "advanced",
    timezone: "GMT+9",
    personality: "structured",
    studyTime: "20:00–22:00",
    studyDays: ["Mon", "Tue", "Thu", "Sat"],
    onlineOffline: "both",
    bio: "Board prep is a marathon. Steady, calm, consistent.",
    universityHidden: true,
  },
];

/** Mock offline study groups near the current user. */
export const MOCK_GROUPS: IrlGroup[] = [
  {
    id: "g-calc",
    subject: "Calculus II — series & integrals",
    date: nextDateISO(3),
    time: "14:00",
    duration: 120,
    members: ["u-mira", "u-theo", "u-noah"],
    capacity: 5,
    suggestedLocations: [
      { kind: "library", name: "Central City Library · 3F Quiet Wing", address: "12 Linden Ave", distanceKm: 1.2 },
      { kind: "campus", name: "University Study Room B-204", address: "Science Building, North Campus", distanceKm: 2.0 },
      { kind: "cafe", name: "Mellow Café · back room", address: "88 Rose Street", distanceKm: 0.8 },
    ],
    joined: false,
  },
  {
    id: "g-algo",
    subject: "Algorithms — weekly problem set",
    date: nextDateISO(1),
    time: "10:00",
    duration: 150,
    members: ["u-aya", "u-sam"],
    capacity: 4,
    suggestedLocations: [
      { kind: "campus", name: "CS Building Group Room 118", address: "Engineering Campus", distanceKm: 3.1 },
      { kind: "library", name: "Central City Library · Group Pods", address: "12 Linden Ave", distanceKm: 1.2 },
    ],
    joined: false,
  },
  {
    id: "g-chem",
    subject: "Organic chemistry — reaction mechanisms",
    date: nextDateISO(5),
    time: "16:00",
    duration: 120,
    members: ["u-lucia", "u-hana"],
    capacity: 4,
    suggestedLocations: [
      { kind: "cafe", name: "Pearl Coffee · long table", address: "5 Aqua Lane", distanceKm: 1.6 },
      { kind: "library", name: "Eastside Library · Study Lounge", address: "240 Mist Road", distanceKm: 2.4 },
    ],
    joined: false,
  },
  {
    id: "g-thesis",
    subject: "Thesis writing — quiet co-working",
    date: nextDateISO(2),
    time: "19:00",
    duration: 180,
    members: ["u-elif", "u-priya", "u-jonas"],
    capacity: 6,
    suggestedLocations: [
      { kind: "library", name: "Central City Library · 4F Carrels", address: "12 Linden Ave", distanceKm: 1.2 },
      { kind: "campus", name: "Graduate Commons Room 7", address: "North Campus", distanceKm: 2.2 },
    ],
    joined: false,
  },
];

/** A couple of seed conversations so Messages feels alive on first run. */
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "u-mira",
    unread: 1,
    messages: [
      { id: "m1", from: "me", text: "Hi Mira! Same calculus goal — want to pair up this week?", at: hoursAgoISO(26) },
      { id: "m2", from: "u-mira", text: "Yes! I'm free 19:00–21:00 Mon–Fri. Tonight?", at: hoursAgoISO(25) },
      { id: "m3", from: "me", text: "Tonight works. I'll book a room at 19:00 📚", at: hoursAgoISO(24) },
      { id: "m4", from: "u-mira", text: "Perfect. Reminder set — see you then! ✨", at: hoursAgoISO(1) },
    ],
    partnerReplies: [
      "Sounds good — see you at the room 😊",
      "I'm in the middle of a problem set, but yes!",
      "Can we push it 30 minutes? I'll be on time, promise.",
      "That was a good session. You stayed really focused today!",
    ],
  },
  {
    id: "u-aya",
    unread: 0,
    messages: [
      { id: "m5", from: "u-aya", text: "Your study streak is on fire 🔥 want to try a 90-min deep session this weekend?", at: hoursAgoISO(50) },
    ],
    partnerReplies: [
      "Yesss, weekend deep session 🚀",
      "I'll bring my hardest problem set.",
      "You're getting so consistent — proud of you!",
    ],
  },
];

/** Seed upcoming sessions for the dashboard. */
export function seedSessions(now = Date.now()): Session[] {
  return [
    {
      id: "s-seed-1",
      mode: "buddy",
      participants: ["me", "u-mira"],
      subject: "Calculus II — series",
      startTime: new Date(now + 1000 * 60 * 60 * 5).toISOString(),
      plannedMinutes: 120,
      status: "upcoming",
    },
    {
      id: "s-seed-2",
      mode: "irl",
      participants: ["me", "u-aya", "u-sam"],
      subject: "Algorithms — problem set",
      startTime: new Date(now + 1000 * 60 * 60 * 26).toISOString(),
      plannedMinutes: 150,
      status: "upcoming",
      location: { kind: "campus", name: "CS Building Group Room 118", address: "Engineering Campus", distanceKm: 3.1 },
    },
    {
      id: "s-seed-3",
      mode: "buddy",
      participants: ["me", "u-aya"],
      subject: "Algorithms — graphs",
      startTime: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      endTime: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      plannedMinutes: 120,
      status: "completed",
      ratings: [{ from: "u-aya", to: "me", stars: 5 }],
    },
  ];
}

export function defaultState(now = Date.now()): AppState {
  return {
    currentUser: null,
    users: MOCK_USERS,
    sessions: [],
    requests: [],
    groups: MOCK_GROUPS,
    conversations: MOCK_CONVERSATIONS,
    guardian: {
      phase: "idle",
      startedAt: null,
      focusedSeconds: 0,
      breakSecondsTotal: 0,
      breakStartedAt: null,
      completedCycles: 0,
      demoSpeed: true,
    },
    settings: {
      language: "English",
      region: "Auto-detected",
      timezone: "GMT+8",
      notifyReminders: true,
      notifyMessages: true,
      notifyRewards: true,
      cameraDefaultOn: false,
      showRealName: false,
    },
  };
}

/* ---------------------------------- utils --------------------------------- */

function nextDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function hoursAgoISO(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}
