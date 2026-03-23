---
name: plan-build
description: Plan the sandbox implementation for a mechanic slug — files to change, state shape, moves, UI. Successive runs refine existing plans.
argument-hint: <slug> (e.g. permanent-affinity, production-cascades, lab-rows)
---

Plan the sandbox implementation for **$ARGUMENTS**. If no slug is specified, list available slugs from `sdlc/` and ask which to plan.

## Behavior

**First run** (no docs in `sdlc/<slug>/plan/`): Create initial implementation plan.
**Successive runs** (docs already exist): Read existing plan, refine based on new research, resolved questions, or implementation learnings. Never overwrite — evolve what's there.

## Prerequisites

Research should exist in `sdlc/<slug>/research/`. If not, warn the user and suggest running `/research-build <slug>` first. You can still proceed if they want, but flag the gap.

## Steps

1. **Validate the slug**: Confirm `sdlc/<slug>/` exists.

2. **Read existing plan**: Check `sdlc/<slug>/plan/` for any `.md` files. Read them all.

3. **Read research**: Read all docs in `sdlc/<slug>/research/` to understand the mechanic.

4. **Read current implementation** — understand what exists:
   - `frontend/src/sandbox/game.js` — game state, moves, phases
   - `frontend/src/sandbox/main.js` — client wiring, presets, toolbar
   - `frontend/src/sandbox/renderer.js` — Konva rendering, overlays
   - `frontend/src/sandbox/scoring.js` — score calculations
   - `frontend/src/shared/` — card.js, token.js, zones.js, overlays.js, data.js
   - `database/schema.sql` — DB schema (if data changes needed)

5. **Plan the implementation**:
   - What state changes in `G`? (new fields, modified fields)
   - What new moves are needed? What existing moves change?
   - What DB queries or schema changes are needed?
   - What UI/renderer changes are needed?
   - What preset parameter changes are needed?
   - What scoring changes are needed?
   - What's the smallest testable increment?
   - What are the risks and unknowns?

6. **Write or refine** plan docs in `sdlc/<slug>/plan/`:
   - If creating: Write `plan.md` with the full plan
   - If refining: Edit existing files — update based on resolved questions, implementation discoveries, or changed requirements

7. **Update the slug's status** in `sdlc/README.md` if it exists (Plan column → In Progress or Done).

## Output Format for New Plan Docs

```markdown
# <Slug Name> — Implementation Plan

> **Status**: In Progress
> **Last Updated**: <date>
> **Depends On**: <other slugs that must be built first, or "none">
> **Estimated Scope**: <S/M/L — relative to other slugs>

## Summary

<One paragraph: what we're building and why>

## State Changes

### New Fields on G
<What gets added to the boardgame.io game state>

### Modified Fields
<What existing state changes shape or behavior>

## Moves

### New Moves
<New boardgame.io moves to add>

### Modified Moves
<Existing moves that need changes>

## Database Changes

<New queries, schema changes, or seed data needed>

## Files to Change

| File | Change | Description |
|------|--------|-------------|
| `frontend/src/sandbox/game.js` | Modify | <what changes> |
| ... | | |

## UI/Renderer Changes

<What the player sees differently — new overlays, indicators, zone changes>

## Preset Impact

<How each preset (Sandbox, Splendor, 7 Wonders, Everdell) should configure this mechanic>

## Smallest Testable Increment

<The absolute minimum to get something testable — what can we skip for v1?>

## Risks and Unknowns

<What could go wrong, what we're uncertain about>

## Open Questions from Research

<Carry forward unresolved questions from research that affect the plan>
```
