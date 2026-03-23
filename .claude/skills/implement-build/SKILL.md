---
name: implement-build
description: Implement a mechanic slug in the sandbox — write code, update game state, wire UI. Successive runs iterate on the implementation.
argument-hint: <slug> (e.g. permanent-affinity, production-cascades, lab-rows)
---

Implement **$ARGUMENTS** in the Wizard Game sandbox. If no slug is specified, list available slugs from `sdlc/` and ask which to implement.

## Behavior

**First run** (no docs in `sdlc/<slug>/implementation/`): Build the mechanic following the plan, write implementation log.
**Successive runs** (docs already exist): Read existing implementation log, identify what needs iteration — bugs, refinements, playtest feedback — and improve. Update the log with what changed and why.

## Prerequisites

A plan should exist in `sdlc/<slug>/plan/`. If not, warn the user and suggest running `/plan-build <slug>` first. You can still proceed if they insist, but flag the gap.

## Steps

1. **Validate the slug**: Confirm `sdlc/<slug>/` exists.

2. **Read the plan**: Read all docs in `sdlc/<slug>/plan/`. This is your build spec.

3. **Read existing implementation log**: Check `sdlc/<slug>/implementation/` for any `.md` files. If they exist, read them to understand what's already been built and what needs iteration.

4. **Read current code** — understand the starting point:
   - `frontend/src/sandbox/game.js` — game state, moves, phases
   - `frontend/src/sandbox/main.js` — client wiring, presets, toolbar
   - `frontend/src/sandbox/renderer.js` — Konva rendering
   - `frontend/src/sandbox/scoring.js` — score calculations
   - `frontend/src/shared/` — shared utilities (card.js, token.js, zones.js, overlays.js, data.js)
   - `database/schema.sql` and `database/build.py` — if DB changes needed

5. **Implement**:
   - Follow the plan's file change list
   - Start with the "Smallest Testable Increment" from the plan
   - Write clean code that fits the existing patterns (boardgame.io moves, Konva rendering, sql.js queries)
   - Keep moves rules-loose (sandbox philosophy — no strict enforcement unless the preset demands it)
   - Test by verifying the dev server starts: `cd frontend && npm run dev`

6. **Write or update implementation log** in `sdlc/<slug>/implementation/`:
   - If creating: Write `log.md` documenting what was built
   - If iterating: Append to the log with what changed and why

7. **Update the slug's status** in `sdlc/README.md` if it exists (Implementation column → In Progress or Done).

## Implementation Log Format

```markdown
# <Slug Name> — Implementation Log

> **Status**: In Progress
> **Last Updated**: <date>

## Build 1 — <date>

### What Was Built
<Summary of changes made>

### Files Changed
| File | What Changed |
|------|-------------|
| ... | ... |

### How to Test
<Steps to verify this works in the sandbox>

### What's Working
<What went well>

### What Needs Iteration
<What's rough, broken, or incomplete>

### Playtest Notes
<Observations from testing — how does this feel?>

---

## Build 2 — <date>
<Successive iterations append here>
```

## Code Guidelines

- **boardgame.io moves** must be pure functions that mutate `G` via Immer. No side effects.
- **Konva rendering** goes in `renderer.js` or `shared/` files. Cards/tokens are `Konva.Group` objects.
- **Database queries** use sql.js synchronously. Return plain JSON arrays.
- **Presets** in `main.js` PRESETS object — each preset should configure the new mechanic appropriately.
- **Scoring** changes go in `scoring.js` — export individual calc functions + update `calcAllScores` and `SCORE_PATHS`.
- All game state must be **JSON-serializable** (no classes, no functions, no DOM references in G).
