# CLAUDE.md

## Project Overview

This is a card/board game design project (working title: "Wizard Game"). The game reimagines real scientists as elemental wizards and grounds its type system in real physics, chemistry, and biology.

## Design Documents

All game design lives in `design/`. Start with `design/philosophy/design-vision.md` for the creative vision, then follow the reading order in `design/README.md`.

### Key directories
- `design/philosophy/` — Vision, strategic archetypes, balance rules, spell archetypes
- `design/framework/` — Type system overview, templates, glossary
- `design/types/` — Individual type identity docs (primary/, secondary/, tertiary/)
- `design/mechanics/` — Cross-cutting mechanics (storms, status effects, combos, counters)
- `design/decisions/` — Open design decisions under exploration
- `design/reference/` — Research material (MTG mapping, influences, interaction matrix, wizard schools)
- `design/lore/` — World building, naming, game name ideas

## Three Design Principles

1. **Discovery as Magic** — Science IS magic. The player experience should feel like discovering how the universe works for the first time.
2. **A World of Interaction** — Everything connects. The type interaction matrix and multi-type spell combinations are the heart of strategic depth.
3. **Progression and Advancement** — Games mirror scientific progress. Start with basic elements, build toward mastery. Engine-building through compounding discovery.

## Type System

- 4 Primary types (Fire, Earth, Water, Air) — states of matter
- 4 Secondary types (Metal, Plant, Ice, Electric) — compositions of two primaries
- 8 Tertiary types — "dark side" / energy counterpart of each primary and secondary
- 2 Augmenter pairs outside the hierarchy: Time/Space, Light/Dark

## Conventions

- Design docs use markdown with `<!-- TBD -->` for unresolved placeholders
- Open questions tracked as `- [ ]` checkboxes at the bottom of each doc
- Status key: Done, Seeded, Draft, Stub, Exploration
- Type docs follow the template in `design/framework/type-attribute-template.md`
- Scientists/figures are mapped as "wizard school" founders in `design/reference/scientists/wizard-schools.md`

## Database

Game design data (types, spells, counters, status effects, wizard schools, etc.) is stored in a SQLite database at `database/wizard_game.db`. The schema is defined in `database/schema.sql` and the database is built/seeded by `database/build.py` (`python database/build.py`).

Design tables use a `*_design` suffix convention to indicate exploratory/candidate data (e.g. `spell_combination_design`, `counter_design`). To query or update design rules, spells, and other game data, use Python's built-in `sqlite3` module to connect to the database file — no extra dependencies needed.

## Frontend

All frontend code lives in `frontend/`, built with **Vite** (vanilla JS, no React). Three spaces:

- `frontend/src/sandbox/` — Multiplayer draft/economy prototype (boardgame.io + Konva.js)
- `frontend/src/roguelike/` — Single-player roguelike runs (boardgame.io + Phaser 3)
- `frontend/src/design/` — Design data explorers (plain HTML/JS + sql.js, no framework)
- `frontend/src/shared/` — Shared utilities (data loading, card rendering, styles)

Run `npm run dev` from `frontend/` to start the dev server. The launcher at `/` links to all three spaces.

- boardgame.io docs & source: `docs/boardgame-io/` (see `docs/documentation/` within)
- Konva.js docs & source: `docs/konva/`

## Working With This Project

- When reviewing or editing design docs, read the relevant type identity docs first to ensure consistency
- The interaction matrix (`design/reference/type-interaction-matrix.md`) is exploration — nothing there is committed to the mechanics docs yet
- Prefer editing existing docs over creating new ones unless a genuinely new design space is being opened
- Use the decisions folder and template for structured design choices between options
- To read or modify game design data (spells, types, counters, etc.), connect to `database/wizard_game.db` using Python's `sqlite3` module
