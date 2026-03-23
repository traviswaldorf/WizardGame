# Phase 1: First Card on the Table

> **Status**: Not Started
> **Depends on**: Nothing — this is the starting point
> **Produces**: A running app with one draggable card, wired end-to-end

## Goal

A single card rendered from database data that you can drag around a canvas. The entire stack works: Vite bundles, sql.js loads the DB, Konva renders, drag-and-drop functions, boardgame.io tracks state.

**Done when**: `npm run dev` → see a card → drag it → see state change in debug panel → undo the drag.

---

## Steps

### 1. Vite Project Scaffold

Create the project structure in `frontend/`:

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    └── styles.css
```

**`package.json`** dependencies:
- `boardgame.io`
- `konva`
- `sql.js`

**`vite.config.js`**:
- sql.js WASM file handling — copy `sql-wasm.wasm` to public dir, configure `locateFile`
- Dev server serves `../database/wizard_game.db` as a static asset (or configure proxy)

**`index.html`**: Minimal — a `<div id="app">` and a script tag for `src/main.js`.

**`styles.css`**: Dark background (`#16213e` — matches existing design pages), full-viewport canvas.

**Checkpoint**: `npm run dev` opens browser, shows empty dark page.

### 2. Database Loading

**File**: `frontend/src/data.js`

Load the database using the same pattern as `frontend-design/schools.js`:

```js
import initSqlJs from 'sql.js';

export async function loadDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `/sql-wasm.wasm`  // served from public/
  });
  const response = await fetch('/database/wizard_game.db');
  const buffer = await response.arrayBuffer();
  return new SQL.Database(new Uint8Array(buffer));
}

export function loadTypes(db) {
  const results = db.exec(`
    SELECT id, name, old_name, tier, color, secondary_color, accent_color,
           state_of_matter, energy_domain, primary_archetype
    FROM types ORDER BY sort_order
  `);
  // Transform to plain objects array
}

export function loadSpellCards(db) {
  const results = db.exec(`
    SELECT tc.rowid as id, tc.name, tc.description,
           tc.type_a_id, tc.type_b_id, tc.type_a_amount, tc.type_b_amount,
           tc.nature, tc.mechanic, tc.process,
           ta.name as type_a_name, ta.color as type_a_color,
           tb.name as type_b_name, tb.color as type_b_color
    FROM type_combination_design tc
    JOIN types ta ON tc.type_a_id = ta.id
    JOIN types tb ON tc.type_b_id = tb.id
    WHERE tc.is_selected = 1
  `);
  // Transform to plain objects array
}
```

All functions return **plain JSON-serializable arrays** (no classes, no functions — boardgame.io requirement).

**Checkpoint**: Console logs show type and spell card data loaded from DB.

### 3. Minimal boardgame.io Game

**File**: `frontend/src/game.js`

The simplest possible game definition — no phases, no turns, just a flat state with free-form moves:

```js
export const WizardGame = {
  name: 'wizard-game',

  setup: () => ({
    cards: [],        // cards currently on the table: [{ id, x, y, data }]
    cardCatalog: [],  // all available cards from DB (read-only reference)
    types: [],        // type data from DB (read-only reference)
  }),

  moves: {
    // Place a card on the table from the catalog
    spawnCard: ({ G }, cardData, x, y) => {
      G.cards.push({
        id: `card-${Date.now()}`,
        x, y,
        data: cardData,
      });
    },

    // Update a card's position (after drag)
    moveCard: ({ G }, cardId, x, y) => {
      const card = G.cards.find(c => c.id === cardId);
      if (card) {
        card.x = x;
        card.y = y;
      }
    },

    // Remove a card from the table
    removeCard: ({ G }, cardId) => {
      const idx = G.cards.findIndex(c => c.id === cardId);
      if (idx !== -1) G.cards.splice(idx, 1);
    },
  },
};
```

**Key**: No `phases`, no `turn` config. One player, free-form. We add structure in Phase 3.

**Checkpoint**: boardgame.io debug panel shows `G` with `cards: []`. Clicking `spawnCard` in the debug panel adds a card to the state.

### 4. Konva Card Rendering

**File**: `frontend/src/card.js`

Render a card as a `Konva.Group`:

```js
import Konva from 'konva';

const CARD_W = 120;
const CARD_H = 170;

export function createCardNode(cardState) {
  const { id, x, y, data } = cardState;
  const typeColor = data.type_a_color || '#555';

  const group = new Konva.Group({
    x, y,
    draggable: true,
    id: id,
  });

  // Background
  group.add(new Konva.Rect({
    width: CARD_W, height: CARD_H,
    fill: '#1a1a2e',
    stroke: typeColor,
    strokeWidth: 2,
    cornerRadius: 6,
  }));

  // Header bar
  group.add(new Konva.Rect({
    width: CARD_W, height: 28,
    fill: typeColor,
    cornerRadius: [6, 6, 0, 0],
  }));

  // Card name
  group.add(new Konva.Text({
    x: 6, y: 6,
    text: data.name || 'Unknown',
    fontSize: 11,
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontStyle: 'bold',
    fill: '#fff',
    width: CARD_W - 12,
  }));

  // Cost line
  const costText = `${data.type_a_amount || 1} ${data.type_a_name || '?'} + ${data.type_b_amount || 1} ${data.type_b_name || '?'}`;
  group.add(new Konva.Text({
    x: 6, y: 34,
    text: costText,
    fontSize: 9,
    fill: '#aaa',
    width: CARD_W - 12,
  }));

  // Description
  group.add(new Konva.Text({
    x: 6, y: 50,
    text: data.description || '',
    fontSize: 9,
    fill: '#ccc',
    width: CARD_W - 12,
    height: CARD_H - 70,
  }));

  // Category label
  group.add(new Konva.Text({
    x: 6, y: CARD_H - 18,
    text: (data.mechanic || data.nature || 'card').toUpperCase(),
    fontSize: 8,
    fill: '#888',
  }));

  return group;
}
```

### 5. Wiring — main.js

**File**: `frontend/src/main.js`

Connect all layers:

```js
import { Client } from 'boardgame.io/client';
import { WizardGame } from './game.js';
import { loadDatabase, loadTypes, loadSpellCards } from './data.js';
import { createCardNode } from './card.js';
import Konva from 'konva';

async function init() {
  // 1. Load database
  const db = await loadDatabase();
  const types = loadTypes(db);
  const spells = loadSpellCards(db);
  db.close();

  // 2. Create boardgame.io client
  const client = Client({
    game: WizardGame,
    debug: true,
  });
  client.start();

  // 3. Initialize state with DB data
  client.moves.spawnCard(spells[0], 200, 200);

  // 4. Create Konva stage
  const stage = new Konva.Stage({
    container: 'app',
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  // 5. Render from state
  function render(state) {
    layer.destroyChildren();
    for (const cardState of state.G.cards) {
      const node = createCardNode(cardState);

      // On drag end, update boardgame.io state
      node.on('dragend', () => {
        client.moves.moveCard(cardState.id, node.x(), node.y());
      });

      layer.add(node);
    }
    layer.draw();
  }

  // 6. Subscribe to state changes
  client.subscribe(state => {
    if (state) render(state);
  });
}

init();
```

**Checkpoint**: Browser shows a card from the database. Dragging it updates `G.cards[0].x/y` in the debug panel. Pressing undo in the debug panel snaps the card back.

---

## Critical Risk: sql.js WASM in Vite

sql.js needs to load a `.wasm` file at runtime. Vite doesn't serve arbitrary binary files from outside the project by default. Options:

1. **Copy WASM to `public/`**: `vite-plugin-static-copy` or a manual copy script. `locateFile` points to `/sql-wasm.wasm`.
2. **Serve database via Vite proxy**: Configure `server.proxy` or `server.fs.allow` to serve `../database/wizard_game.db`.
3. **CDN fallback**: Load sql.js WASM from CDN (like the frontend-design pages do) as a backup.

**Solve this first** — it's the only non-trivial integration point. If WASM + DB loading works, everything else is straightforward.

---

## Files Created

| File | Purpose |
|------|---------|
| `frontend/package.json` | npm project, dependencies |
| `frontend/vite.config.js` | Vite config, WASM/DB serving |
| `frontend/index.html` | Entry point |
| `frontend/src/main.js` | App entry, wires boardgame.io ↔ Konva |
| `frontend/src/game.js` | Minimal boardgame.io game definition |
| `frontend/src/data.js` | Database loading and card data queries |
| `frontend/src/card.js` | Card rendering factory (Konva.Group) |
| `frontend/src/styles.css` | Dark theme base styles |

## Existing Code to Reference

| What | Where |
|------|-------|
| sql.js loading pattern | `frontend-design/schools.js` (lines 1-15) |
| Type colors | `types` table, `color` column |
| Spell card queries | `frontend-design/combinations.js` |
| DB schema | `database/schema.sql` |
