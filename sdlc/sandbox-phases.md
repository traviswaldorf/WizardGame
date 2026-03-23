# Sandbox Implementation — Phase Overview

> **Date**: 2026-03-22
> **Related**: [sandbox-implementation-plan.md](sandbox-implementation-plan.md), [006-multiplayer-economy-design.md](../design/decisions/006-multiplayer-economy-design.md)

## Guiding Principle

Get a draggable card on screen as fast as possible. Every phase should produce something you can see and interact with. The sandbox is a tool for testing game economy ideas — it needs to feel like a physical table, not a software application.

---

## Phase 1: First Card on the Table

**Goal**: A single card rendered from database data that you can drag around a canvas.

**What this proves**: The entire stack works end-to-end — Vite bundles, sql.js loads the DB, Konva renders, drag-and-drop functions, boardgame.io tracks state.

**Scope**:
- Vite project scaffold (`frontend/`) with dependencies
- sql.js loads `wizard_game.db`, queries one table
- Minimal boardgame.io game — no phases, no turns, just a flat `G` with a cards array and basic moves (`moveCard`, `spawnCard`)
- Konva stage with a dark background
- One card rendered as a `Konva.Group` from DB data (name, type color, description)
- Card is draggable
- boardgame.io debug panel visible and functional
- Undo works on card movement

**Done when**: You can `npm run dev`, see a card, drag it around, see state change in the debug panel, and undo the drag.

**Critical risk**: sql.js WASM loading through Vite's dev server. Solve this first — it's the only non-trivial integration point.

---

## Phase 2: The Table

**Goal**: A complete table surface with zones, cards, and tokens that you can freely move between zones.

**What this proves**: The spatial layout works for prototyping. You can set up a game state by hand — dealing cards to zones, placing tokens, arranging a player's tableau.

**Scope**:
- Table layout with labeled zones (token pool, card market, player hand, lab/tableau, school board, discard pile)
- Card factory renders all card types from DB (spells, instruments, wizards)
- Token factory renders colored type tokens (Fire, Earth, Water, Air, Light)
- Zone snapping — cards/tokens dropped near a zone snap into grid positions inside it
- Free drag — anything can also float outside zones
- Pan (right-click drag) and zoom (scroll wheel) on the stage
- boardgame.io moves wired to zone drops — dropping a card in a zone calls the appropriate move
- State → renderer sync via `client.subscribe()` — moving state updates the canvas
- Spawn toolbar — buttons to add any card or token to the table
- Resource counters per player (type energy totals)

**Done when**: You can spawn spell cards, instrument cards, and tokens, drag them between market → hand → lab zones, see resource counters update, and undo any action. The table feels like a physical surface with designated areas.

**Critical risk**: Performance with many Konva objects. Keep card rendering lean — minimize text reflows and nested groups.

---

## Phase 3: Game Flow

**Goal**: Play through a prototype game loop — pick a school, draft cards, play them to your lab, manage tokens across eras.

**What this proves**: The economy concepts from decision 006 can be tested. You can simulate a 7-Wonders-style draft, a Splendor-style token economy, or an Everdell-style tableau build — and see how they feel with our elemental type system.

**Scope**:
- boardgame.io phases: `schoolSelection` → `draft` → `play` (→ loop back to draft for next era)
- **School selection screen**: 4 school cards (Fire/Earth/Water/Air), click to choose, each gives a starting bonus
- **Draft overlay**: 7-Wonders simultaneous pick — see a hand, pick one card, hands rotate. Uses boardgame.io stages with `ActivePlayers.ALL`
- **Era progression**: Era 1 (primary cards), Era 2 (secondary cards), Era 3 (tertiary cards). Manual advance button, or automatic after draft round
- **Play phase**: Free-form sandbox — play cards from hand to lab, take tokens, resolve effects manually
- Player count support (2-4) — each player has their own hand/lab/school/resources
- Player view switching — click to view a different player's perspective (for solo testing of multiplayer dynamics)

**Done when**: You can start a game, choose a school, draft 6 cards across an era, play them to your lab, take tokens from the pool, advance to era 2 with new cards, and feel the progression from primary → secondary elements. Two players can take turns in a pass-and-play flow.

**Critical risk**: The draft mechanism is the most complex boardgame.io feature (simultaneous turns, hand rotation). Get the state management right before building the overlay UI.

---

## Phase 4: Iteration Tools

**Goal**: Power tools for rapid prototyping — save/load game states, tweak parameters, compare configurations.

**What this proves**: The sandbox is a durable prototyping tool, not a one-off demo. You can set up a specific game state, save it, try a different economy configuration, and compare.

**Scope**:
- **Export/import state**: Download `G` as JSON, upload to restore — share board states between sessions
- **Game parameter controls**: Token counts per type, cards per draft hand, market size, era thresholds — tweak without code changes
- **Scenario presets**: "Splendor-style" (tight token economy), "7-Wonders-style" (draft-heavy), "Everdell-style" (worker placement + tableau) — pre-configured starting states that set up the table for testing each lens from decision 006
- **Score tracker**: Multiple scoring paths visible (storm power, discovery sets, lab VP, school stages, breakthrough bonuses)
- **Notes/annotations**: Ability to drop text notes on the table — "this combo felt too strong", "need more Fire cards in era 2"
- **Visual polish**: Card hover expansion, smooth animations, better zone feedback

**Done when**: You can load a "7-Wonders lens" preset, play through it, save the state, switch to a "Splendor lens" preset, and compare how the same card pool feels under different economy rules.

---

## Phase Documents

Each phase has its own detailed implementation doc:

| Phase | Document | Status |
|-------|----------|--------|
| 1 | [First Card on the Table](phase-1-first-card.md) | Not Started |
| 2 | [The Table](phase-2-the-table.md) | Not Started |
| 3 | [Game Flow](phase-3-game-flow.md) | Not Started |
| 4 | [Iteration Tools](phase-4-iteration-tools.md) | Not Started |

## Phase Dependencies

```
Phase 1: First Card on the Table
    │
    ▼
Phase 2: The Table
    │
    ▼
Phase 3: Game Flow
    │
    ▼
Phase 4: Iteration Tools
```

Each phase is **playable and useful** on its own:
- After Phase 1: you can visually inspect cards from the database
- After Phase 2: you can manually set up and explore board states
- After Phase 3: you can play through prototype game loops
- After Phase 4: you can systematically compare design configurations

## What Phase Comes First?

Phase 1 is the only answer. It de-risks the entire stack in the smallest possible scope. If sql.js + Vite + boardgame.io + Konva all work together with one card, they'll work together with a hundred.
