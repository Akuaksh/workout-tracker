# Workout Tracker — CLAUDE.md

## Project Overview
Personal workout logging PWA for Akshika. Replaces WhatsApp self-messaging + Excel sheet workflow.
Single-user, mobile-first, no backend, no auth required.

## Tech Stack
- **Frontend**: Vue 3 via CDN (no build step, no npm)
- **Storage**: localStorage (4 keys)
- **Charts**: Chart.js via CDN
- **Design**: Apple Health-inspired dark theme, pure CSS, single `index.html`
- **Deployment**: Vercel (static), GitHub repo: akuaksh/workout-tracker
- **Branch**: `claude/workout-app-setup-1VSZK`
- **Live**: https://workout-tracker-cyan-six.vercel.app/

## File Structure
```
/index.html     — entire app (CSS + Vue HTML templates + JS, single file ~1530 lines)
/CLAUDE.md      — this file
```

## User Profile
- **Akshika**, age 30, beginner, no trainer access
- IT job (sedentary), 64kg, 5'4"
- **Goal**: Lose 3kg in 3 months, build glutes, build general strength
- **Frequency**: 5 sessions/week, ~70 min each

## Training Plan (Phase 1 — Months 1 to 1.5)

### Weekly Structure: U/L/Rest/P/P/L/Rest
- Day 1 Upper Strength · Day 2 Lower Strength · Day 3 Complete Rest · Day 4 Push + Finisher · Day 5 Pull + Finisher · Day 6 Legs/Glutes · Day 7 Rest
- **Session-anchored** (NOT calendar-anchored): plan progresses by session completion, not by weekday
- **2-week gap** → plan resets to Upper (Week A) with soft "Welcome back" banner

### A/B Week Alternation
- 5 sessions = one cycle (Upper → Lower → Push → Pull → Legs)
- Full cycle completion flips entire plan to opposite week variant
- Some exercises rotate per A/B variant (e.g., Machine Row Week A → 1 Hand Row Week B)

### Anchor Exercises (strict tracking, progression chart)
Lat Pulldown, DB Chest Press, DB Shoulder Press, Leg Press, Hip Thrust, Back Extension, Plank, Calf Raise (Day 6)

### Finishers (Day 4 + Day 5, alternate per A/B)
- Heavy Cardio: 25 min treadmill incline walk or cycle
- Heavy Core Circuit: 5 exercises × 2 rounds (~12 min)

### Pre-Workout Stretching
- Daily: World's Greatest Stretch, Cat-Cow, Hip Flexor Lunge
- Upper days add-on: PVC Shoulder Rotation, Band Pull-Aparts
- Lower days add-on: Bodyweight Squat, Glute Bridge Activation

### Phase 2 Unlocks (Month 1.5+, MANUAL trigger only)
Romanian Deadlift, Bulgarian Split Squats, Bent Over Barbell Row, Barbell Squat — added after form review.

## Data Model

### Plan (hardcoded in app)
```
PLAN.cycle = ['upper','lower','push','pull','legs']
PLAN.days[dayKey].blocks = [
  { type:'stretching' },
  { type:'cardio_warmup', minutes:10 },
  { type:'exercise', exercise_key, sets, targetReps|targetSeconds, anchor?, week? },
  { type:'finisher_cardio', minutes, week? },
  { type:'finisher_core', rounds, exercises:[...], week? }
]
```

### Exercise
- `id`, `key`, `name`, `group`, `bodyweight?`, `timeBased?`, `type?` (cardio)

### Session
- `id`, `date`, `created_at`, `completed_at`, `isPartial`, `inProgress`, `dayKey`, `weekVariant`, `retro`, `blocks[]`
- Each block carries its logged state (sets with weight/reps/done, cardio actualMinutes/speed, etc.)
- Partial sessions auto-saved as `inProgress:true`; can be resumed from Home

### Plan State
- `pointer` (0–4 index into cycle)
- `weekVariant` ('A' or 'B')
- `lastSessionDate` (for 2-week reset detection)
- `lastCompletedDayKey`

## localStorage Keys
| Key | Description |
|---|---|
| `wt2_exercises` | Exercise library (seeded on first launch, ~33 exercises) |
| `wt2_sessions` | All sessions (in-progress, partial, completed) |
| `wt2_plan_state` | Current pointer + week variant |
| `wt2_reset_banner` | Whether the welcome-back banner is currently shown |

## Screens
| Screen | Purpose |
|---|---|
| `home` | Hero (streak + PR callout) → Reports. Today's session card. Last session. Resume partial. Log past. |
| `session` | Block-based active session (stretching → exercises → finisher). Sectioned scroll, next block reveals when prior is marked done. |
| `history` | Reverse-chronological list of all sessions |
| `session-detail` | Read-only view of a past session. Delete option. |
| `reports` | Stats grid, GitHub-style heatmap (53 weeks), anchor progression cards (tap → chart), muscle group coverage 7d |
| `exercise-detail` | Per-exercise top-set chart + recent sessions |
| `library` | Filterable exercise list (chips by muscle group) |
| `retro` | Log a past session (does not advance plan pointer) |

## Key UX Decisions (Locked)
1. **Session view**: sectioned scroll. Each block is a card. Active block fully visible, future blocks dimmed.
2. **Set logging**: pre-filled weight from last session, tap "Save" to confirm. Auto-fills target reps if blank.
3. **Skip exercise**: allowed, no reason required.
4. **Finisher**: just the last block in the session (cardio or core circuit).
5. **Rest timer**: none.
6. **Stretching**: list of moves, single "Done" button for the whole block. Ignorable.
7. **Streak break**: 3+ days without a session.
8. **Strength chart**: weight at first set of anchor exercise. Permissive — flags points where reps < target.
9. **2-week gap**: auto-reset to Upper (Week A) with welcome-back banner.
10. **A/B switch**: every 5 sessions (full cycle), the whole plan flips week variant.
11. **Retro logging**: allowed via Home → "+ Log Past Session". Doesn't advance plan pointer.
12. **Phase 2 unlock**: manual — no auto-unlock.

## Completion Definition
- **Full** (🏆 + confetti): every exercise has ≥1 logged set AND every block is marked done
- **Partial** (👏 + summary): otherwise
- Both still count as a session toward streak/heatmap

## Formulas
- **Streak**: consecutive days with sessions, allows up to 2-day gaps backwards from today/yesterday
- **Progression**: latest first-set weight of an anchor exercise vs first-ever first-set weight
- **Muscle group target volume** (sets/week): chest 9, back 12, shoulders 12, biceps 6, triceps 3, legs 14, glutes 17, core 9

## Known Limitations / Backlog
### V1.1 backlog
- Edit a saved session's sets retroactively (currently delete-only)
- Body weight + progress photos (M8)
- Weekly/monthly export/share for trainer (M7)
- Day-specific stretching phase rotation (currently fixed)

### V2 backlog
- Push reminders
- Unit toggle (lbs)
- Nutrition tracking
- Deload week scheduling
- Workout templates beyond current plan
