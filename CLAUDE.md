# Workout Tracker — CLAUDE.md

## Project Overview
Personal workout logging PWA for Akshika. Replaces WhatsApp self-messaging + Excel sheet workflow.
Single-user, mobile-first, no backend, no auth required.

## Tech Stack
- **Frontend**: Vue 3 via CDN (no build step, no npm)
- **Storage**: localStorage (5 keys — see schema below)
- **Charts**: Chart.js via CDN
- **Design**: Apple Health-inspired dark theme, pure CSS, single `index.html`
- **Deployment**: Vercel (static), GitHub repo: akuaksh/workout-tracker
- **Branch**: `claude/workout-app-setup-1VSZK`

## File Structure
```
/index.html     — entire app (CSS + Vue HTML templates + JS, single file)
/CLAUDE.md      — this file
```

## Design System (Apple Health-inspired)
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#000000` | Page background |
| `--card` | `#1C1C1E` | Card background |
| `--card2` | `#2C2C2E` | Input background, secondary card |
| `--text` | `#FFFFFF` | Primary text |
| `--text2` | `#8E8E93` | Muted/secondary text |
| `--orange` | `#FF9500` | Primary CTA, streak, accent |
| `--blue` | `#0A84FF` | Links, back button, secondary actions |
| `--green` | `#30D158` | Success, workout days |
| `--red` | `#FF453A` | Danger, delete, missed |
| `--border` | `#38383A` | Separators |
| `--r` | `12px` | Border radius |

Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`

## Data Model
```
Exercise
  id            string (UUID)
  name          string (unique)
  muscle_group  enum: back | biceps | shoulders | chest | triceps | legs | core
  is_bodyweight boolean

Session
  id            string (UUID)
  date          string (YYYY-MM-DD)
  created_at    string (ISO timestamp)

SessionExercise
  id            string (UUID)
  session_id    FK → Session.id
  exercise_id   FK → Exercise.id
  order         int

Set
  id                  string (UUID)
  session_exercise_id FK → SessionExercise.id
  set_number          int (1-based)
  weight_kg           float | null (null = bodyweight)
  reps                int

MissedDay
  id      string (UUID)
  date    string (YYYY-MM-DD, unique)
  reason  enum: work | social | wellness | travel | rest | other
```

## localStorage Keys
| Key | Type | Description |
|---|---|---|
| `wt_exercises` | Exercise[] | Seeded on first launch (35 exercises) |
| `wt_sessions` | Session[] | One per workout day |
| `wt_session_exercises` | SessionExercise[] | Junction: session ↔ exercise |
| `wt_sets` | Set[] | Individual set records |
| `wt_missed_days` | MissedDay[] | Tagged missed days |

## Key Formulas
- **Estimated 1RM**: `weight_kg × (1 + reps / 30)` — top set = heaviest weight in a session
- **Streak**: count consecutive days with sessions going backwards from today (or yesterday if no session today)
- **Untagged missed days**: dates from first-ever session date to yesterday with no Session and no MissedDay record

## Screens
| `screen` value | Nav tab | Purpose |
|---|---|---|
| `home` | Home | Streak, last session, missed day banner, Start Session CTA |
| `session` | (modal-like, hides bottom nav) | Active session: search → reference strip → log sets → finish |
| `history` | History | All sessions, reverse chronological |
| `session-detail` | — | View + edit sets for a past session |
| `progress` | — | Exercise history strip + 1RM line chart |
| `missed-days` | — | Tag untagged missed dates with reason |
| `reports` | Reports | Monthly frequency, muscle group coverage, exercise progress |
| `library` | Library | Full exercise list, filter by muscle group, add custom |

## Navigation Pattern
- Bottom nav: Home | History | Reports | Library (hidden during active session)
- `navigate(screen, params)` pushes current screen to `screenHistory` stack
- `goBack()` pops from stack
- Session started via "Start Session" button — bypasses nav stack

## Session Logging Flow
1. Tap "Start Session" → `screen = 'session'`, `sessionStep = 'search'`
2. Type to search exercises (autocomplete via computed `filteredExercises`)
3. Select exercise → `sessionStep = 'log'`
4. Reference strip shows last 5 sessions for that exercise
5. Weights pre-filled from most recent session for that exercise
6. User fills reps, can add/remove sets (default 3)
7. "Add to Session" → back to search step (`sessionStep = 'search'`)
8. "Finish Session" → persists session + sessionExercises + sets to localStorage

## Missed Days Logic
- On mount: find all dates from first session → yesterday with no Session + no MissedDay
- If any exist: banner on Home screen
- Missed Days screen: user picks reason per date, saves to `wt_missed_days`

## Exercise Seed List (35 exercises, 7 muscle groups)
Back (8): Lat Pull Down, Bent Over Deadlift, Machine Deadlift, Bent Over Barbell Row, 1 Hand Row, T-Bar Row Machine, Machine Row, Wide Pull Ups (bodyweight)
Biceps (3): Preacher Curls, Dumbbell Curls, Rope Curls
Shoulders (6): Shoulder DB Press, Overhead Press, Lateral Raise, Upright Rod, Face Pulls, Z-Press
Chest (6): Bench Press, Dumbbell Press, Incline Bench Press, Decline Press, Butterfly, Incline Dumbbell Press
Triceps (1): Triceps Pushdown
Legs (9): Weighted Squats, Bulgarian Split Squats, Leg Press, Ham Curls, Calf Raise, Leg Extensions, Glute Bridges (bodyweight), Hip Thrust, Glute Press
Core (0): user-added only

## Current Status
### v1.0 — Built
- [x] All 8 screens implemented
- [x] Apple Health dark theme
- [x] Full session logging flow (search → reference strip → sets → finish)
- [x] Weight pre-fill from last session per exercise
- [x] Add/remove sets (default 3)
- [x] Session detail with inline set editing
- [x] 1RM trend chart (Chart.js line chart)
- [x] Missed days detection + tagging
- [x] Monthly reports (frequency, muscle coverage, exercise list)
- [x] Exercise library with muscle group filter + add custom
- [x] Exercise seeding on first launch (35 exercises)
- [x] PWA meta tags (add to home screen)

### Known Limitations / v2 Backlog
- No push notifications / reminders
- No unit toggle (lbs)
- No workout templates
- Reports exercise trend % vs prev month not computed (shows peak 1RM only)
