# Phase 2: The Table

> **Status**: Not Started
> **Depends on**: Phase 1 (First Card on the Table)
> **Produces**: A complete tabletop surface where you can spawn, drag, and organize cards and tokens across zones

## Goal

A complete table surface with zones, multiple card types, and tokens that you can freely move between zones. You can set up a game state by hand — dealing cards to areas, placing tokens, arranging a player's tableau.

**Done when**: You can spawn spell cards, instrument cards, wizard cards, and tokens, drag them between market → hand → lab zones, see resource counters update, and undo any action. The table feels like a physical surface with designated areas.

---

## Steps

### 1. Expand the boardgame.io Game State

Evolve the minimal Phase 1 game to include zones, tokens, and per-player state:

```js
setup: ({ ctx }) => ({
  // Shared state
  tokenPool: { fire: 7, earth: 7, water: 7, air: 7, light: 5 },
  cardMarket: [],     // face-up cards (Arcanum), max ~5
  drawPile: [],       // remaining cards
  discardPile: [],
  era: 1,

  // Per-player state
  players: Object.fromEntries(
    Array.from({ length: ctx.numPlayers }, (_, i) => [
      String(i),
      { hand: [], lab: [], school: null, resources: {}, score: 0 }
    ])
  ),

  // Reference data (loaded from DB, read-only)
  types: [],
  cardCatalog: { spells: [], instruments: [], wizards: [] },
}),
```

**New moves** (all rules-loose — no cost enforcement):

| Move | What it does |
|------|-------------|
| `playCard(cardId, zone)` | Move card to a zone ('hand', 'lab', 'market', 'discard') |
| `moveCard(cardId, fromZone, toZone)` | Transfer card between zones |
| `takeToken(type, count)` | Take from shared pool → player resources |
| `returnToken(type, count)` | Return from player resources → shared pool |
| `spawnCard(cardType, cardData)` | Add any card to the market from catalog |
| `spawnToken(type, count)` | Add tokens to the pool |
| `removeCard(cardId)` | Remove from table entirely |
| `advanceEra()` | Increment era (1→2→3) |
| `dealToMarket(count)` | Draw cards from pile to market |

### 2. Card & Token Factories

**Expand `card.js`** to handle all card types:

| Card Type | Data Source | Visual Differences |
|-----------|-----------|-------------------|
| **Spell** | `type_combination_design` | Two-type cost line, nature/mechanic label, two-tone type badge |
| **Instrument** | `instrument_design` | Single type color, associated scientist, thematic role |
| **Wizard** | `wizard_school_design` | Scientist name, birth-death, contribution, school role badge (Head/Pupil A/Pupil B) |

All card types share the same base structure (Konva.Group with rect + header + name + body text) but vary in content layout.

**Create `token.js`**:

```js
export function createTokenNode(type, color, count) {
  const group = new Konva.Group({ draggable: true });

  group.add(new Konva.Circle({
    radius: 20,
    fill: color,
    stroke: '#fff',
    strokeWidth: 1,
  }));

  group.add(new Konva.Text({
    text: type.substring(0, 2).toUpperCase(),
    fontSize: 12, fontStyle: 'bold',
    fill: '#fff',
    // centered in circle
  }));

  if (count > 1) {
    // count badge
  }

  return group;
}
```

**Expand `data.js`** — add loaders for instruments and wizards:
- `loadInstrumentCards(db)` — query `instrument_design` joined with `types`
- `loadWizardCards(db)` — query `wizard_school_design` joined with `types`

### 3. Table Layout & Zones

**File**: `frontend/src/zones.js`

Define zones as named rectangles with layout logic:

```js
export const ZONES = {
  tokenPool:  { label: 'Token Pool',           row: 0 },
  cardMarket: { label: 'Card Market / Arcanum', row: 1 },
  schoolBoard:{ label: 'School Board',          row: 2, col: 'left' },
  lab:        { label: 'Lab / Tableau',         row: 2, col: 'right' },
  hand:       { label: 'Hand',                  row: 3 },
  discard:    { label: 'Discard',               row: 2, col: 'far-right' },
};
```

Each zone calculates its bounds from the stage dimensions. Zone rendering:
- `Konva.Rect` with dashed border and semi-transparent fill
- `Konva.Text` label in the top-left corner
- Drop detection: on card `dragend`, check which zone's bounds contain the card's position

**Layout** (responsive to window size):

```
┌──────────────────────────────────────────────────┐
│ [Toolbar: Era | Spawn | Undo | Reset]            │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ TOKEN POOL: (●Fi)(●Ea)(●Wa)(●Ai) (◆Lt)     │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ CARD MARKET: [Card] [Card] [Card] [Card]    │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────┐ ┌────────────────────┐ ┌────────┐ │
│ │ SCHOOL   │ │ LAB / TABLEAU      │ │DISCARD │ │
│ │ BOARD    │ │ [Card] [Card] ...  │ │  pile  │ │
│ └──────────┘ └────────────────────┘ └────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ HAND: [Card] [Card] [Card]                  │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Resources: ●2 ●1 ●3 ●0 ◆1     Score: 0         │
└──────────────────────────────────────────────────┘
```

### 4. Renderer — State ↔ Canvas Sync

**File**: `frontend/src/renderer.js`

Evolve Phase 1's simple render function into a proper renderer class:

```js
export class TableRenderer {
  constructor(containerId) {
    this.stage = new Konva.Stage({ container: containerId, ... });
    this.bgLayer = new Konva.Layer();     // zones, labels (static)
    this.cardLayer = new Konva.Layer();   // cards (dynamic)
    this.tokenLayer = new Konva.Layer();  // tokens (dynamic)
    this.uiLayer = new Konva.Layer();     // toolbar, counters (dynamic)
    this.stage.add(this.bgLayer, this.cardLayer, this.tokenLayer, this.uiLayer);

    this.zones = {};       // zone name → { rect, bounds }
    this.callbacks = {};   // event callbacks
    this.prevState = null; // for diff-based re-rendering

    this.drawZones();
    this.setupPanZoom();
  }

  drawZones() { /* render zone rects + labels to bgLayer */ }

  setupPanZoom() {
    // Right-click drag: pan stage
    // Scroll wheel: scale stage
  }

  update(G, ctx) {
    this.renderTokenPool(G.tokenPool);
    this.renderCardZone('cardMarket', G.cardMarket);
    this.renderCardZone('hand', G.players[ctx.currentPlayer]?.hand || []);
    this.renderCardZone('lab', G.players[ctx.currentPlayer]?.lab || []);
    this.renderResourceCounters(G.players[ctx.currentPlayer]?.resources || {});
    this.renderEraIndicator(G.era);
    this.prevState = G;
  }

  renderCardZone(zoneName, cards) {
    // Clear existing cards in this zone
    // For each card, create a Konva node at grid position within zone bounds
    // Attach dragend handler: determine target zone, call callback
  }

  renderTokenPool(pool) {
    // Render token columns, each with count badge
    // Attach click/drag handlers
  }

  on(event, callback) { this.callbacks[event] = callback; }
}
```

**Drag → Move flow**:
1. User drags card from Hand zone
2. On `dragend`, renderer checks which zone the card landed in
3. Renderer calls `this.callbacks.cardMoved(cardId, fromZone, toZone)`
4. `main.js` receives callback → calls `client.moves.moveCard(...)`
5. boardgame.io updates `G`
6. `client.subscribe` fires → `renderer.update(G)` re-renders

### 5. Spawn Toolbar

**HTML toolbar** above the canvas (not in Konva — simpler as DOM):

```html
<div id="toolbar">
  <span>Era: <button>1</button> <button>2</button> <button>3</button></span>
  <select id="spawn-type">
    <option>Spell</option>
    <option>Instrument</option>
    <option>Wizard</option>
    <option>Token: Fire</option>
    <option>Token: Earth</option>
    ...
  </select>
  <button id="spawn-btn">Spawn</button>
  <button id="undo-btn">Undo</button>
  <button id="reset-btn">Reset</button>
</div>
```

Spawn picks a random card of the selected type from the catalog and calls `client.moves.spawnCard(...)`. Undo calls `client.undo()`. Reset calls `client.reset()`.

### 6. Resource Counters

Bottom bar showing the current player's resource totals:

```
●7 Fire  ●5 Earth  ●3 Water  ●2 Air  ◆1 Light    Score: 12
```

Rendered as Konva objects on `uiLayer`. Updated each `render()` from `G.players[currentPlayer].resources`.

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/game.js` | Modify | Expand state shape, add zone-based moves |
| `frontend/src/data.js` | Modify | Add instrument and wizard loaders |
| `frontend/src/card.js` | Modify | Handle spell, instrument, wizard card types |
| `frontend/src/token.js` | Create | Token rendering factory |
| `frontend/src/zones.js` | Create | Zone definitions and layout calculations |
| `frontend/src/renderer.js` | Create | Table renderer class (replaces Phase 1 inline render) |
| `frontend/src/main.js` | Modify | Wire renderer callbacks to boardgame.io moves |
| `frontend/index.html` | Modify | Add toolbar HTML |

## Critical Risk

**Performance with many Konva objects.** A table with 20+ cards and 25+ tokens means 45+ draggable groups, each with 5-8 child shapes. Mitigation:
- Keep card structure lean (minimize nested groups)
- Use `Konva.FastLayer` for static zone backgrounds
- Only re-render zones whose data changed (diff `prevState`)
- Batch layer draws with `layer.batchDraw()`
