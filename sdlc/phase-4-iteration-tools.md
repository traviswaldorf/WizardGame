# Phase 4: Iteration Tools

> **Status**: Done (annotations deferred)
> **Depends on**: Phase 3 (Game Flow)
> **Produces**: Power tools for rapid design iteration — save/load states, tweak economy parameters, compare game configurations

## Goal

The sandbox becomes a durable prototyping tool, not a one-off demo. You can set up a specific game state, save it, try a different economy configuration, and compare how the same card pool feels under different rules.

**Done when**: You can load a "7-Wonders lens" preset, play through it, save the state, switch to a "Splendor lens" preset, and compare how the same card pool feels under different economy rules.

---

## Steps

### 1. State Export/Import

**Export**: Download the current `G` as a JSON file. Captures everything — token pool, all player hands/labs/schools/resources, era, card positions.

```js
function exportState(client) {
  const state = client.getState();
  const json = JSON.stringify(state.G, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Trigger download with timestamped filename
  // e.g., "wizard-sandbox-2026-03-22-14-30.json"
}
```

**Import**: Upload a JSON file to restore a saved state. Uses a boardgame.io move that replaces `G` wholesale:

```js
moves: {
  importState: ({ G }, newState) => {
    Object.assign(G, newState);
  },
}
```

**UI**: Export/Import buttons in the toolbar. Import opens a file picker.

**Use case**: You set up a tricky mid-game board state where Fire is dominating. Save it. Try rebalancing by adjusting token counts. Load the original. Compare.

### 2. Game Parameter Controls

A settings panel (collapsible sidebar or modal) for tuning economy parameters without touching code:

| Parameter | Default | What it changes |
|-----------|---------|----------------|
| Tokens per primary type | 7 | Scarcity of elemental tokens in shared pool |
| Light tokens | 5 | Wildcard availability |
| Cards per draft hand | 7 | How many cards each player sees per draft round |
| Market size | 5 | Face-up cards in the Arcanum |
| Era 1/2/3 card counts | auto | How many cards in each era's pool |
| Player count | 2 | Number of players (rebuilds game) |
| Lab max size | unlimited | Whether to cap the lab/tableau (Everdell = 15) |
| Token take limit | 3 | Max tokens taken per turn (Splendor = 3 different or 2 same) |
| Draft direction | alternating | Clockwise/counter-clockwise/alternating per era |
| Discard reward | 2 tokens | What you get for discarding a card instead of drafting |

Changing a parameter calls a `setParameter` move that updates `G.config` and optionally re-deals or adjusts the pool.

### 3. Scenario Presets

Pre-configured starting states that set up the table for testing each lens from decision 006:

#### Preset: "Splendor Lens"
- **Token economy**: Tight — 4 tokens per primary type, 3 Light
- **No draft**: Cards acquired by spending tokens from the shared pool
- **Market**: 4 cards per tier visible (4 primary, 4 secondary, 4 tertiary)
- **Lab gives permanent discount**: Each card in your lab gives +1 permanent production of its type (Splendor's permanent gem bonus)
- **Win condition**: First to 15 VP

#### Preset: "7 Wonders Lens"
- **Draft-heavy**: 7 cards per hand, 3 eras of drafting
- **Resources from cards**: No token pool — resources are produced by cards you've played
- **Neighbor trading**: Can "buy" resources from adjacent players for 2 insight each
- **Multiple scoring paths**: Storm (military), Discovery sets (science), Lab VP (civilian)
- **School boards**: Full 3-stage wonder progression

#### Preset: "Everdell Lens"
- **Worker placement**: Limited action tokens (2 start, gain more each era)
- **Tableau focus**: 15-card lab limit
- **Instrument-wizard pairings**: If you have the matching instrument, the wizard is free
- **Production triggers**: Green/production cards activate each era change
- **Asymmetric era timing**: Players can advance eras independently

#### Preset: "Sandbox" (default)
- All rules loose
- Unlimited tokens/cards
- No phases — pure free-form manipulation

Each preset is a JSON configuration loaded via the import mechanism. Presets stored in `frontend/src/presets/`.

### 4. Score Tracker

A scoring panel showing multiple victory paths (from decision 006):

```
┌─────────────────────────────────┐
│ SCORING                         │
│                                 │
│ Storm Power:      ██████░░ 6    │
│ Discovery Sets:   ████░░░░ 4    │
│ Lab VP:           ████████ 8    │
│ School Stages:    ██░░░░░░ 2    │
│ Breakthroughs:    ██████░░ 6    │
│ Knowledge:        ██░░░░░░ 1    │
│ ─────────────────────────────── │
│ TOTAL:                     27   │
│                                 │
│ Storm Power:      ████░░░░ 4    │ ← other player
│ ...                             │
└─────────────────────────────────┘
```

Each scoring path is a function that calculates from `G`:
- **Storm power**: Count of offensive/red cards
- **Discovery sets**: (identical tertiary symbols)² + 7 per complete set of 3
- **Lab VP**: Sum of VP values on played cards
- **School stages**: VP from built school stages
- **Breakthroughs**: VP from claimed breakthrough events
- **Knowledge**: Leftover tokens ÷ 3

Scoring functions are configurable — different presets can weight paths differently.

### 5. Table Annotations

Drop text notes directly on the Konva canvas:

- Double-click empty space → text input appears → type a note → it becomes a draggable sticky note
- Color-coded: yellow (observation), red (problem), green (good)
- Notes persist in `G.annotations` array
- Useful for recording playtest observations: "this combo felt too strong", "need more Fire cards in era 2"

```js
moves: {
  addAnnotation: ({ G }, text, x, y, color) => {
    G.annotations.push({ id: `note-${Date.now()}`, text, x, y, color });
  },
  moveAnnotation: ({ G }, noteId, x, y) => { ... },
  removeAnnotation: ({ G }, noteId) => { ... },
},
```

### 6. Visual Polish

- **Card hover**: Hovering a card scales it up 1.5x with a drop shadow, showing full text
- **Zone drop feedback**: Zone highlights when a card is dragged over it (valid drop target)
- **Smooth animations**: Card movement tweens instead of instant position changes
- **Token animations**: Tokens slide from pool to player area on take
- **Era transition**: Brief visual flourish when advancing eras (screen flash, new cards slide in)
- **Keyboard shortcuts**: `Ctrl+Z` undo, `Ctrl+S` export, number keys for era

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/game.js` | Modify | Add importState, setParameter, addAnnotation moves |
| `frontend/src/toolbar.js` | Create | Expanded toolbar with parameter controls, preset selector |
| `frontend/src/scoring.js` | Create | Score calculation functions for each victory path |
| `frontend/src/presets/` | Create | Preset JSON files (splendor.json, seven-wonders.json, everdell.json, sandbox.json) |
| `frontend/src/renderer.js` | Modify | Annotations layer, hover effects, animations |
| `frontend/src/main.js` | Modify | Export/import wiring, keyboard shortcuts |

## Open Questions

- [ ] Should presets be hot-switchable mid-game, or only at game start?
- [ ] Do annotations sync across player views, or are they per-player?
- [ ] Should the score tracker auto-calculate, or allow manual score entry for flexibility?
- [ ] Do we want a "replay" feature that plays back a game from the move log?
- [ ] Should parameter changes trigger a game reset, or apply to the current state?
- [ ] Is there value in a "compare" view showing two presets side by side?
