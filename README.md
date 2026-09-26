# Ser — Study with real people, not just a timer 🌷

A working web-app prototype: match with real study partners, join offline study
groups, or focus solo with an AI guardian that knows when you've earned a break.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
localStorage persistence (no backend needed).

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000
```

Production build: `npm run build && npm start`

> This repo was set up on a machine without a global Node install — a portable
> Node lives in `.tools/node`. If you have your own Node/npm, the commands
> above just work; otherwise on Windows use:
> `set "PATH=%cd%\.tools\node;%PATH%" && npm run dev`

## What's inside

| Screen | Route | Notes |
|---|---|---|
| Sign in | `/onboarding` | Elsevier-style demo card — email + password prefilled, Google mock, register toggle; any credentials work |
| Welcome | `/welcome` | One-screen study style, prefilled + skippable; demo auto-verifies 🎓 |
| Home Dashboard | `/dashboard` | Greeting, 3 study modes, upcoming sessions, streak & stars, recommended people |
| Find a Study Buddy | `/find-buddy` | Filterable match list + "Find a Match" (scoring: goal 30 / schedule 25 / timezone 20 / level 15 / personality 10) |
| Study Room | `/study-room?s=<id>` | Real camera (graceful avatar fallback), shared timer, focus status, 5-star partner rating |
| Meet IRL | `/meet-irl` | Post a study request, nearby groups, suggested Library/Café/Campus rooms, booking |
| AI Study Guardian | `/guardian` | 45-min focus detection → earned break or +1 ⭐; rewards at 2/5/10 stars incl. "Ser Blooms" mini-game |
| Profile | `/profile` | Study Reputation, badges, verified status, session history |
| Messages | `/messages` | Partner chats (simulated replies) + session reminders |
| Settings | `/settings` | Language/region/timezone, notifications, privacy, reset demo data |

## Prototype conventions

- **Persistence:** the entire app state persists to `localStorage`
  (`ser:state:v1`) — swap `src/lib/store.tsx` for an API client to go backend.
- **Privacy model:** `User` (private) vs `PublicUser` (what others see).
  Email/phone/university are never rendered outside your own profile.
- **Reputation:** a running average of partner ratings; badges derive from
  score, on-time rate, and completed sessions.
- **Guardian demo speed:** ON by default — 1 real second = 1 study minute, so
  the 45-minute milestone arrives in 45s. Toggle it off for real time.
- **Mock data:** 10 verified students, 4 IRL groups, seed conversations and
  sessions in `src/lib/mock-data.ts`.

*Small steps, big dreams.* ✨
