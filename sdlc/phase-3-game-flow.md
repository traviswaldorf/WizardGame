# Phase 3: Game Flow

> **Status**: Not Started
> **Depends on**: Phase 2 (The Table)
> **Produces**: A playable prototype game loop — school selection, card drafting, era progression, multiplayer

## Goal

Play through a prototype game loop: pick a school, draft cards, play them to your lab, manage tokens across eras. The economy concepts from decision 006 can be tested — simulate a 7-Wonders-style draft, a Splendor-style token economy, or an Everdell-style tableau build, and see how they feel with our elemental type system.

**Done when**: You can start a game, choose a school, draft 6 cards across an era, play them to your lab, take tokens from the pool, advance to era 2 with new cards, and feel the progression from primary → secondary elements. Two players can take turns in a pass-and-play flow.

---

## Steps

### 1. Add boardgame.io Phases

Transform the flat Phase 2 game into a phased game:

```js
export const WizardGame = {
  name: 'wizard-game',

  setup: ({ ctx }, { cardCatalog, types }) => {
    // Build era-specific card pools
    const era1Cards = cardCatalog.spells.filter(c => isPrimaryType(c));
    const era2Cards = cardCatalog.spells.filter(c => isSecondaryType(c));
    const era3Cards = cardCatalog.spells.filter(c => isTertiaryType(c));

    return {
      tokenPool: { fire: 7, earth: 7, water: 7, air: 7, light: 5 },
      cardMarket: [],
      drawPile: [],
      discardPile: [],
      era: 1,
      eraPools: { 1: era1Cards, 2: era2Cards, 3: era3Cards },

      players: { /* per-player state */ },
      draftHands: {},

      types,
      cardCatalog,
    };
  },

  phases: {
    schoolSelection: {
      start: true,
      next: 'draft',
      // details below
    },
    draft: {
      next: 'play',
      // details below
    },
    play: {
      // free-form sandbox + era advance
    },
  },
};
```

### 2. School Selection Phase

**When**: Game start. Each player picks one of the 4 base wizard schools.

**boardgame.io config**:
```js
schoolSelection: {
  start: true,
  turn: {
    // Each player takes one turn to choose
    minMoves: 1,
    maxMoves: 1,
  },
  moves: {
    chooseSchool: ({ G, playerID }, schoolId) => {
      const school = G.cardCatalog.wizards.find(
        w => w.typeId === schoolId && w.role === 'head'
      );
      G.players[playerID].school = school;
      // Apply starting bonus
      G.players[playerID].resources[school.typeName.toLowerCase()] =
        (G.players[playerID].resources[school.typeName.toLowerCase()] || 0) + 1;
    },
  },
  endIf: ({ G, ctx }) => {
    return Object.values(G.players).every(p => p.school !== null);
  },
  next: 'draft',
},
```

**UI** (Konva overlay):
- 4 large school cards centered on screen
- Each shows: school name, head wizard name, contribution, starting element, type color
- Click to select → card animates to your school board zone
- When all players have chosen, overlay fades and draft begins

**School data** from `wizard_school_design` where `role = 'head'`:

| School | Head Wizard | Starting Element |
|--------|------------|-----------------|
| School of Combustion | Lavoisier | +1 Fire |
| School of Mass | Newton | +1 Earth |
| School of Fluids | Archimedes | +1 Water |
| School of Pressure | Torricelli | +1 Air |

### 3. Draft Phase

**When**: After school selection (and after each era advance).

**Mechanic**: 7-Wonders simultaneous drafting.
1. Deal 7 cards from current era pool to each player
2. All players simultaneously pick 1 card from their hand
3. Remaining cards pass to the next player (clockwise era 1/3, counter-clockwise era 2)
4. Repeat until 1 card remains (discard the last)
5. Each player now has 6 drafted cards in their hand

**boardgame.io config**:
```js
draft: {
  onBegin: ({ G, ctx, random }) => {
    // Deal 7 cards to each player from current era pool
    const pool = random.Shuffle([...G.eraPools[G.era]]);
    const handSize = 7;
    for (let i = 0; i < ctx.numPlayers; i++) {
      G.draftHands[String(i)] = pool.splice(0, handSize);
    }
  },

  turn: {
    activePlayers: { all: 'drafting' },
    stages: {
      drafting: {
        moves: {
          draftCard: ({ G, playerID }, cardId) => {
            const hand = G.draftHands[playerID];
            const idx = hand.findIndex(c => c.id === cardId);
            if (idx === -1) return INVALID_MOVE;
            const card = hand.splice(idx, 1)[0];
            G.players[playerID].hand.push(card);
          },
          discardForTokens: ({ G, playerID }, cardId) => {
            const hand = G.draftHands[playerID];
            const idx = hand.findIndex(c => c.id === cardId);
            if (idx === -1) return INVALID_MOVE;
            hand.splice(idx, 1);
            // Gain 2 tokens of the card's primary type
            const type = card.type_a_name.toLowerCase();
            G.players[playerID].resources[type] =
              (G.players[playerID].resources[type] || 0) + 2;
          },
        },
      },
    },
  },

  endIf: ({ G }) => {
    // End when all draft hands have ≤ 1 card
    return Object.values(G.draftHands).every(h => h.length <= 1);
  },

  onEnd: ({ G }) => {
    // Rotate remaining hands (discard last cards)
    for (const hand of Object.values(G.draftHands)) {
      G.discardPile.push(...hand);
    }
    G.draftHands = {};
  },

  next: 'play',
},
```

**Hand rotation** — after each round of picks:
```js
// After all players have picked, rotate hands
onMove: ({ G, ctx }) => {
  if (Object.values(G.draftHands).every(h => /* player has picked */)) {
    const hands = Object.values(G.draftHands);
    if (G.era % 2 === 1) {
      // Clockwise: player 0's hand goes to player 1
      const last = hands.pop();
      hands.unshift(last);
    } else {
      // Counter-clockwise
      const first = hands.shift();
      hands.push(first);
    }
    // Reassign
    for (let i = 0; i < ctx.numPlayers; i++) {
      G.draftHands[String(i)] = hands[i];
    }
  }
},
```

**Draft UI** (Konva overlay):
- Cards fanned horizontally across screen center
- Click a card to draft it (slides to your hand zone)
- "Sell" button on each card to discard for tokens
- After picking, cards gray out until all players pick, then new hand slides in
- Card count indicator: "Pick 1 of 6" → "Pick 1 of 5" → etc.

### 4. Play Phase — Free-Form with Era Advance

**When**: After draft. Players play cards from hand to lab, take tokens, resolve effects.

All moves from Phase 2 are available. Additional moves:

```js
play: {
  moves: {
    // All Phase 2 moves (playCard, moveCard, takeToken, etc.)
    ...phase2Moves,

    // Era advancement — triggers new draft
    advanceEra: ({ G, events }) => {
      if (G.era < 3) {
        G.era++;
        events.setPhase('draft'); // Go back to draft with new era cards
      }
    },
  },

  turn: {
    // No restrictions — sandbox mode
  },
},
```

**Era progression feel**:
- Era 1: Only primary-type cards available (Fire, Earth, Water, Air spells)
- Era 2: Secondary-type cards unlock (Metal, Plant, Ice, Electric spells)
- Era 3: Tertiary-type cards available (Radioactive, Cosmic, Poison, etc.)

This mirrors the 7 Wonders Age I → II → III escalation and the game's Progression principle.

### 5. Multiplayer Support

**Player count**: 2-4 players, configured at game start.

**boardgame.io Client config**:
```js
const client = Client({
  game: WizardGame,
  numPlayers: playerCount,  // from UI selector
  multiplayer: Local(),     // in-memory, same browser
  playerID: '0',            // which player this client controls
  debug: true,
});
```

**Pass-and-play**: Using boardgame.io's `Local()` multiplayer, create one client per player. Switch active client via a player tab bar:

```
[Player 1 (Fire)] [Player 2 (Earth)] [Player 3 (Water)]
```

Clicking a tab switches which client is rendering to the canvas. Each client has its own `playerID`, so the hand/lab/resources shown are that player's.

**Player view switching** in `main.js`:
```js
const clients = [];
for (let i = 0; i < playerCount; i++) {
  clients.push(Client({
    game: WizardGame,
    numPlayers: playerCount,
    multiplayer: Local(),
    playerID: String(i),
  }));
}

let activeClient = clients[0];
activeClient.start();
activeClient.subscribe(state => renderer.update(state.G, state.ctx));

function switchPlayer(idx) {
  activeClient.stop();
  activeClient = clients[idx];
  activeClient.start();
  activeClient.subscribe(state => renderer.update(state.G, state.ctx));
}
```

### 6. Game Start Flow

Putting it all together — the full game start sequence:

```
1. Landing screen: Choose player count (2-4)
2. → schoolSelection phase
   - Each player picks a school (pass the screen between players)
3. → draft phase (era 1)
   - Deal 7 primary-type cards to each player
   - Simultaneous picking (in pass-and-play: each player picks in turn)
   - 6 rounds of pick-and-pass
4. → play phase
   - Free-form: play cards to lab, take tokens, etc.
   - "Advance Era" button available
5. → draft phase (era 2) — secondary-type cards
6. → play phase
7. → draft phase (era 3) — tertiary-type cards
8. → play phase (endgame)
```

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/game.js` | Modify | Add phases (schoolSelection, draft, play), era logic |
| `frontend/src/main.js` | Modify | Multi-client setup for pass-and-play, player switching |
| `frontend/src/renderer.js` | Modify | School selection overlay, draft overlay, era indicator |
| `frontend/src/overlays.js` | Create | School selection and draft UI overlays |

## Critical Risk

The draft mechanism is the most complex boardgame.io feature — simultaneous turns via `ActivePlayers.ALL`, hand rotation between rounds, tracking who has picked. Get the state management working through the debug panel first (clicking moves manually) before building the visual draft overlay.

## Open Questions

- [ ] Should pass-and-play show a "pass to Player 2" screen between turns (to hide hands)?
- [ ] During draft, should players be able to see what others have drafted so far?
- [ ] Is 7 cards per draft hand the right number? Should this be configurable?
- [ ] Should era advancement be automatic (after play phase timer/round count) or always manual?
- [ ] How do instrument cards and wizard cards enter the game — via draft, market, or both?
