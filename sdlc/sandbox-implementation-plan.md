# Sandbox Implementation Plan

> **Status**: Exploring
> **Date Opened**: 2026-03-22
> **Related Docs**: [006-multiplayer-economy-design.md](../design/decisions/006-multiplayer-economy-design.md), [design-vision.md](../design/philosophy/design-vision.md), [wizard-schools.md](../design/reference/wizard-schools.md)

## Context

We need a browser-based sandbox to prototype the multiplayer card/board game economy from decision 006. This is a virtual tabletop — a physical-feeling space where cards, tokens, and zones can be spawned from our database and dragged around freely. Card effects are **text on the card**, not coded logic — the user manually resolves effects by moving pieces.

### Tech Stack

| Library | Role | Why |
|---------|------|-----|
| **boardgame.io** | Game state engine | Manages state (`G`), phases, turns, moves, undo/redo, debug panel with time-travel. View-layer agnostic — pairs with any renderer. |
| **Konva.js** | Canvas renderer | 2D canvas with built-in drag-and-drop (`draggable: true`), groups, layers. Cards = `Konva.Group` objects. |
| **Vite** | Bundler | Required by boardgame.io (npm-only). Vanilla JS template, hot reload. |
| **sql.js** | Database access | Loads `wizard_game.db` client-side via WebAssembly. Same pattern as `frontend-design/` pages. |

### Integration Architecture

```
User drags card on Konva canvas
  → Konva dragend event fires
  → Calls client.moves.playCard(cardId, zoneId)
  → boardgame.io updates G (game state)
  → client.subscribe() callback fires
  → Re-render Konva stage from new G
```

### Sandbox Philosophy

Moves are intentionally **rules-loose** — they update state but don't enforce costs, turn limits, or legal plays. The sandbox lets you "cheat" because we're prototyping economy **feel**, not enforcing rules. You can drag anything anywhere, spawn cards freely, and manually resolve effects.

---

## Implementation Phases

### Phase 1: Vite + npm Project Scaffold

**Goal**: Empty app that builds and serves with hot reload.

**Files to create**:

```
frontend/
├── index.html          ← Entry point
├── package.json        ← Dependencies
├── vite.config.js      ← Vite config (path aliases, dev server)
└── src/
    ├── main.js         ← App entry, wires boardgame.io client to Konva renderer
    └── styles.css      ← Base styles (dark theme)
```

**Dependencies**: `boardgame.io`, `konva`, `sql.js`

**`vite.config.js`** needs:
- Configure `sql.js` WASM file handling (copy to public, set `locateFile`)
- Dev server config for local development

**Verification**: `npm run dev` opens browser, shows "Sandbox loading..." text.

---

### Phase 2: Database Integration

**Goal**: Load card/token data from `wizard_game.db` and expose as plain JS objects.

**File**: `frontend/src/data.js`

**Functions**:

```js
// Initialize sql.js and load the database
async function loadDatabase()

// Returns: [{ id, name, tier, color, secondaryColor, accentColor, ... }]
function loadTypes(db)

// Returns: [{ id, name, typeA, typeB, amountA, amountB, description, nature, mechanic }]
function loadSpellCards(db)

// Returns: [{ id, schoolName, role, scientistName, contribution, typeId, typeName, typeColor }]
function loadWizardCards(db)

// Returns: [{ id, name, typeId, typeName, typeColor, associatedScientist, description }]
function loadInstrumentCards(db)

// Returns: [{ id, typeName, color, count }] — initial token pool setup
function loadTokenPool(db)
```

**Key tables**: `types`, `type_combination_design`, `wizard_school_design`, `scientist_design`, `instrument_design`

**Pattern to reuse**: Same `initSqlJs` + `fetch` pattern from `frontend-design/schools.js`.

**All data returned as plain JSON arrays** (boardgame.io requires `G` to be JSON-serializable).

**Verification**: Console logs show arrays of card/token objects loaded from DB.

---

### Phase 3: boardgame.io Game Definition

**Goal**: Define the game state shape, phases, and moves.

**File**: `frontend/src/game.js`

```js
import { INVALID_MOVE } from 'boardgame.io/core';

export const WizardGame = {
  name: 'wizard-game',

  setup: ({ ctx }, setupData) => {
    // setupData contains pre-loaded card/token data from Phase 2
    const { types, spells, wizards, instruments } = setupData;

    return {
      // === SHARED STATE ===
      tokenPool: {}, // { fire: 7, earth: 7, water: 7, air: 7, light: 5 }
      cardMarket: [], // face-up cards (Arcanum) — subset of spells+instruments
      drawPile: [],   // remaining cards
      discardPile: [],
      era: 1,         // 1=primary, 2=secondary, 3=tertiary

      // === PER-PLAYER STATE ===
      players: {
        // '0': { hand: [], lab: [], school: null, resources: {}, score: 0 },
        // '1': { ... }
      },

      // === DRAFT STATE (when in draft phase) ===
      draftHands: {}, // { '0': [...cards], '1': [...cards] }

      // === REFERENCE DATA (read-only, for card rendering) ===
      types,
      schools: wizards,
    };
  },

  phases: {
    // Phase 1: Each player picks a school
    schoolSelection: {
      start: true,
      moves: {
        chooseSchool: ({ G, playerID }, schoolId) => { ... },
      },
      next: 'draft',
      endIf: ({ G }) => /* all players have chosen */,
    },

    // Phase 2: 7-Wonders-style simultaneous draft
    draft: {
      moves: {
        draftCard: ({ G, playerID }, cardId) => { ... },
        discardForTokens: ({ G, playerID }, cardId) => { ... },
      },
      next: 'play',
      endIf: ({ G }) => /* all draft hands empty */,
    },

    // Phase 3: Free-form sandbox play
    play: {
      moves: {
        // Card moves
        playCard: ({ G, playerID }, cardId, zone) => { ... },
        moveCard: ({ G, playerID }, cardId, fromZone, toZone) => { ... },
        returnCard: ({ G, playerID }, cardId) => { ... },

        // Token moves
        takeToken: ({ G, playerID }, type, count) => { ... },
        returnToken: ({ G, playerID }, type, count) => { ... },
        transferToken: ({ G, playerID }, type, count, toPlayer) => { ... },

        // Game progression
        advanceEra: ({ G }) => { G.era = Math.min(G.era + 1, 3); },

        // Sandbox utility
        spawnCard: ({ G }, cardType, cardId) => { ... },
        spawnToken: ({ G }, type, count) => { ... },
        drawFromPile: ({ G, playerID }, count) => { ... },
      },
    },
  },

  // No endIf — sandbox runs until manually reset
};
```

**Key design decisions**:
- `setup` receives pre-loaded data via `setupData` (loaded in Phase 2, passed to Client)
- Moves in `play` phase are **loose** — no cost validation, no turn enforcement
- `spawnCard` and `spawnToken` are sandbox-only moves for testing ideas
- Reference data (types, schools) stored in `G` for rendering access

**Verification**: boardgame.io debug panel shows state tree, moves are clickable and update state.

---

### Phase 4: Konva.js Table Layout & Zones

**Goal**: Render the table surface with zones, empty at first.

**Files**:
- `frontend/src/renderer.js` — Main renderer class
- `frontend/src/zones.js` — Zone definitions and layout

**Table layout** (16:9 aspect ratio, dark background):

```
┌──────────────────────────────────────────────────────┐
│  ERA: [1]  [2]  [3]           [Undo] [Reset] [Spawn]│
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │                TOKEN POOL                       │ │
│  │  (●Fire)(●Earth)(●Water)(●Air)    (◆Light)     │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              CARD MARKET / ARCANUM              │ │
│  │  [Card] [Card] [Card] [Card] [Card]            │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │   SCHOOL     │  │         LAB / TABLEAU        │ │
│  │   BOARD      │  │  [Card] [Card] [Card] ...    │ │
│  │              │  │                              │ │
│  └──────────────┘  └──────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │                    HAND                         │ │
│  │  [Card] [Card] [Card] [Card]                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  Resources: ●2 ●1 ●3 ●0 ◆1      Score: 0          │
└──────────────────────────────────────────────────────┘
```

**Konva structure**:
```
Stage
├── Layer: background (static — zone outlines, labels, grid)
├── Layer: cards (draggable card groups)
├── Layer: tokens (draggable token circles)
└── Layer: ui (buttons, counters, era indicator)
```

**Zones** are `Konva.Rect` objects with labels. Cards dropped within a zone's bounds snap to a grid position inside it and trigger the corresponding boardgame.io move.

**Free drag**: Any card/token can be dragged outside zones too — they just float on the table. Zones are suggestions, not constraints.

**Stage interaction**:
- Right-click drag or middle-click drag: pan the entire table
- Scroll wheel: zoom in/out
- Left-click drag on cards/tokens: move them

**Verification**: Browser shows the table layout with labeled zones. No cards yet — just the structure.

---

### Phase 5: Card & Token Rendering

**Goal**: Render cards and tokens from database data as interactive Konva objects.

**Files**:
- `frontend/src/card.js` — Card rendering factory
- `frontend/src/token.js` — Token rendering factory

**Card structure** (`Konva.Group`):
```
Group (draggable: true)
├── Rect (background — colored by primary type)
├── Rect (header bar — darker shade)
├── Text (card name — bold, white)
├── Circle + Text (type badge — colored circle with type abbreviation)
├── Text (cost line — "2 Fire + 1 Earth")
├── Text (description/effect — smaller font, wraps)
├── Text (category — spell / instrument / wizard)
└── Rect (border — colored by type)
```

**Card dimensions**: ~120x170px (standard card ratio ~5:7)

**Card data → Konva mapping**:
```js
function createCard(cardData, typeColors) {
  // cardData from Phase 2 loaders
  // Returns a Konva.Group with all visual elements
  // Sets cardData as a custom property for state tracking
}
```

**Token structure** (`Konva.Group`):
```
Group (draggable: true)
├── Circle (filled with type color, radius ~20)
├── Text (type abbreviation — "Fi", "Ea", "Wa", "Ai", "Lt")
└── Text (count badge — small number if stacked)
```

**Token pool rendering**: Tokens in the pool are arranged in columns by type. Each column shows the available count. Clicking/dragging a token calls `client.moves.takeToken(type, 1)`.

**Card market rendering**: 5 face-up cards from the draw pile, arranged horizontally. Clicking a card calls `client.moves.playCard(cardId, 'hand')` (take to hand).

**Verification**: Cards from database render with correct type colors, names, costs, descriptions. Tokens render with correct colors. All are draggable.

---

### Phase 6: State ↔ Renderer Sync

**Goal**: Wire boardgame.io state changes to Konva re-renders.

**File**: `frontend/src/main.js` (update the wiring)

**Pattern**:
```js
const client = Client({ game: WizardGame, debug: true });
client.start();

const renderer = new TableRenderer(stageElement);

client.subscribe(state => {
  if (state) {
    renderer.update(state.G, state.ctx);
  }
});

// Konva events → boardgame.io moves
renderer.on('cardDropped', (cardId, zoneId) => {
  client.moves.playCard(cardId, zoneId);
});
renderer.on('tokenTaken', (type, count) => {
  client.moves.takeToken(type, count);
});
// etc.
```

**Renderer.update()** does:
1. Clear dynamic layers
2. Re-render token pool from `G.tokenPool`
3. Re-render card market from `G.cardMarket`
4. Re-render player hand from `G.players[playerID].hand`
5. Re-render player lab from `G.players[playerID].lab`
6. Re-render school board from `G.players[playerID].school`
7. Update resource counters and score
8. Update era indicator

**Optimization**: Only re-render zones whose data changed (compare previous state).

**Verification**: Dragging a card from market to hand updates both the Konva display and the boardgame.io debug panel state. Undo reverses the action visually.

---

### Phase 7: Draft Mode UI

**Goal**: Implement the 7-Wonders-style simultaneous draft overlay.

**When active**: During the `draft` phase, an overlay appears showing the current draft hand.

**UI**:
- Full-width card fan across the top third of the screen
- Click a card to draft it (calls `client.moves.draftCard(cardId)`)
- "Discard for tokens" button on each card (calls `client.moves.discardForTokens(cardId)`)
- After all players pick, hands rotate and new cards appear
- Overlay closes when draft phase ends

**boardgame.io stage integration**: Use `stages` with `ActivePlayers.ALL` so all players pick simultaneously.

**Verification**: Draft overlay shows cards. Picking a card removes it, rotates hands, and the card appears in the player's hand zone.

---

### Phase 8: School Selection UI

**Goal**: Game start screen where each player picks a wizard school.

**UI**:
- 4 school cards displayed prominently (Fire/Earth/Water/Air)
- Each shows: school name, head wizard, starting element, stage bonuses
- Click to select; confirmation before locking in
- After all players choose, transitions to draft phase

**School card data** from `wizard_school_design` table (head wizards only, role='head').

**Verification**: Selecting a school updates `G.players[id].school` and transitions to draft.

---

### Phase 9: Sandbox Tools & Polish

**Goal**: Prototyping utilities for testing game economy ideas.

**Toolbar** (top of screen):
- **Era selector**: Click 1/2/3 to set current era
- **Spawn menu**: Dropdown to spawn any card type (spell/instrument/wizard) or token type
- **Player count**: Switch between 2-4 players
- **Reset**: New game
- **Undo/Redo**: Buttons wired to boardgame.io undo
- **Export state**: Download current `G` as JSON
- **Import state**: Upload JSON to restore a saved state

**boardgame.io debug panel**: Enabled by default (`debug: true`). Shows full state tree, clickable moves, time-travel slider. Can be toggled with a keyboard shortcut.

**Verification**: Can spawn arbitrary cards/tokens, export state, import it back, undo moves, and time-travel through game log.

---

## Open Questions

- [ ] Should the sandbox support multiple player views (switching between player perspectives)?
- [ ] Do we want card hover tooltips with expanded details, or keep it minimal?
- [ ] Should zone snapping be toggle-able (strict snap vs free float)?
- [ ] Do we want sound effects for card placement / token taking?
- [ ] Should the card market refresh mechanism be automatic or manual in sandbox mode?
- [ ] How do we handle the database path in Vite's dev server (relative path to `../database/wizard_game.db`)?
- [ ] Should we add a "rules toggle" that can optionally enforce costs/turns for more realistic testing?

## Playtest Notes

| Date | Phase Tested | Observation | Verdict |
|------|-------------|-------------|---------|
|      |             |             |         |

## Decision

**Chosen**: —
**Rationale**: —
