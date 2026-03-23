/**
 * boardgame.io game definition — Phase 4.
 * Phased game: schoolSelection → draft → play (→ draft for next era).
 * Multiplayer with pass-and-play support.
 * Configurable economy via G.config for design iteration.
 */
import { INVALID_MOVE, ActivePlayers } from 'boardgame.io/core';

// ─── Default configuration (tunable via parameter controls / presets) ───

export const DEFAULT_CONFIG = {
  tokensPerPrimary: 7,
  lightTokens: 5,
  cardsPerDraftHand: 7,
  marketSize: 5,
  labMaxSize: 0,          // 0 = unlimited
  tokenTakeLimit: 3,
  draftDirection: 'alternating', // 'clockwise' | 'counterclockwise' | 'alternating'
  discardReward: 2,
  presetName: 'sandbox',
};

function buildTokenPool(config) {
  return {
    fire: config.tokensPerPrimary,
    earth: config.tokensPerPrimary,
    water: config.tokensPerPrimary,
    air: config.tokensPerPrimary,
    light: config.lightTokens,
  };
}

// Type ID ranges by tier (from DB sort order)
const PRIMARY_IDS = new Set([1, 2, 3, 4]);
const SECONDARY_IDS = new Set([5, 6, 7, 8]);

function isPrimarySpell(card) {
  return PRIMARY_IDS.has(card.type_a_id) && PRIMARY_IDS.has(card.type_b_id);
}

function isSecondarySpell(card) {
  return SECONDARY_IDS.has(card.type_a_id) || SECONDARY_IDS.has(card.type_b_id);
}

function isTertiarySpell(card) {
  return !isPrimarySpell(card) && !isSecondarySpell(card);
}

/** Wrap a spell card with a unique instance ID */
function wrapCard(cardData) {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    data: cardData,
  };
}

// ─── Zone capacity checks ───

/** Returns true if adding a card to this zone would exceed the configured limit */
function zoneAtCapacity(G, playerID, zone) {
  if (zone === 'lab') {
    const max = G.config.labMaxSize;
    if (max > 0 && G.players[playerID].lab.length >= max) return true;
  }
  if (zone === 'market') {
    const max = G.config.marketSize;
    if (max > 0 && G.cardMarket.length >= max) return true;
  }
  return false;
}

// ─── Shared sandbox moves (available in play phase + as global fallbacks) ───

const sandboxMoves = {
  spawnCard: ({ G, playerID }, cardData, zone) => {
    const pid = playerID || '0';
    if (zoneAtCapacity(G, pid, zone)) return INVALID_MOVE;
    const card = wrapCard(cardData);
    const target = resolveZone(G, pid, zone);
    if (target) target.push(card);
  },

  moveCard: ({ G, playerID }, cardId, fromZone, toZone) => {
    const pid = playerID || '0';
    if (zoneAtCapacity(G, pid, toZone)) return INVALID_MOVE;
    const from = resolveZone(G, pid, fromZone);
    const to = resolveZone(G, pid, toZone);
    if (!from || !to) return;
    const idx = from.findIndex(c => c.id === cardId);
    if (idx === -1) return;
    const [card] = from.splice(idx, 1);
    to.push(card);
  },

  removeCard: ({ G, playerID }, cardId, zone) => {
    const pid = playerID || '0';
    const arr = resolveZone(G, pid, zone);
    if (!arr) return;
    const idx = arr.findIndex(c => c.id === cardId);
    if (idx !== -1) arr.splice(idx, 1);
  },

  takeToken: ({ G, playerID }, type, count) => {
    const pid = playerID || '0';
    const key = type.toLowerCase();
    const limit = G.config.tokenTakeLimit;
    const available = G.tokenPool[key] || 0;
    // Enforce token take limit (0 = disabled, no tokens from pool)
    const maxTake = limit > 0 ? Math.min(count, limit) : (limit === 0 ? 0 : count);
    if (maxTake <= 0) return INVALID_MOVE;
    const taken = Math.min(maxTake, available);
    G.tokenPool[key] = available - taken;
    G.players[pid].resources[key] = (G.players[pid].resources[key] || 0) + taken;
  },

  returnToken: ({ G, playerID }, type, count) => {
    const pid = playerID || '0';
    const key = type.toLowerCase();
    const has = G.players[pid].resources[key] || 0;
    const returned = Math.min(count, has);
    G.players[pid].resources[key] = has - returned;
    G.tokenPool[key] = (G.tokenPool[key] || 0) + returned;
  },

  spawnToken: ({ G }, type, count) => {
    const key = type.toLowerCase();
    G.tokenPool[key] = (G.tokenPool[key] || 0) + count;
  },
};

// ─── Game factory ───

/**
 * Create a WizardGame definition with catalog data and config baked in.
 * Call this after loading from the database.
 * @param {object} catalog — card/type data from DB
 * @param {object} [configOverrides] — partial config to merge over DEFAULT_CONFIG
 */
export function createWizardGame(catalog, configOverrides) {
  const eraPools = {
    1: catalog.spells.filter(isPrimarySpell),
    2: catalog.spells.filter(isSecondarySpell),
    3: catalog.spells.filter(isTertiarySpell),
  };
  const schools = catalog.wizards.filter(w => w.role === 'head');

  return {
    name: 'wizard-game',

    setup: ({ ctx }) => {
      const config = { ...DEFAULT_CONFIG, ...configOverrides };

      const players = {};
      for (let i = 0; i < ctx.numPlayers; i++) {
        players[String(i)] = {
          hand: [],
          lab: [],
          school: null,
          resources: {},
          score: 0,
        };
      }

      return {
        config,
        tokenPool: buildTokenPool(config),
        cardMarket: [],
        drawPile: [],
        discardPile: [],
        era: 1,
        eraPools: { 1: [...eraPools[1]], 2: [...eraPools[2]], 3: [...eraPools[3]] },
        draftHands: {},
        draftRound: 0,
        players,
        types: catalog.types,
        cardCatalog: catalog,
        schools,
      };
    },

    phases: {
    // ─── Phase 1: School Selection ───
    schoolSelection: {
      start: true,
      turn: {
        minMoves: 1,
        maxMoves: 1,
      },
      moves: {
        chooseSchool: ({ G, playerID }, schoolTypeId) => {
          const school = G.schools.find(s => s.type_id === schoolTypeId);
          if (!school) return INVALID_MOVE;

          // Already chosen
          if (G.players[playerID].school) return INVALID_MOVE;

          G.players[playerID].school = school;

          // Starting bonus: +1 token of school's element
          const typeKey = school.type_name.toLowerCase();
          G.players[playerID].resources[typeKey] =
            (G.players[playerID].resources[typeKey] || 0) + 1;
        },
      },
      endIf: ({ G }) => {
        return Object.values(G.players).every(p => p.school !== null);
      },
      next: 'draft',
    },

    // ─── Phase 2: Draft ───
    draft: {
      onBegin: ({ G, ctx, random }) => {
        // Deal cards from current era pool
        const pool = random.Shuffle([...G.eraPools[G.era]]);
        const handSize = Math.min(G.config.cardsPerDraftHand, Math.floor(pool.length / ctx.numPlayers));

        for (let i = 0; i < ctx.numPlayers; i++) {
          G.draftHands[String(i)] = pool
            .splice(0, handSize)
            .map(wrapCard);
        }
        G.draftRound = 0;
      },

      turn: {
        minMoves: 1,
        maxMoves: 1,
      },

      moves: {
        draftCardById: ({ G, playerID }, cardId) => {
          const hand = G.draftHands[playerID];
          if (!hand) return INVALID_MOVE;

          const idx = hand.findIndex(c => c.id === cardId);
          if (idx === -1) return INVALID_MOVE;

          const [card] = hand.splice(idx, 1);
          G.players[playerID].hand.push(card);

          // Check if round is complete (all hands same size)
          maybeRotateHands(G);
        },

        sellCard: ({ G, playerID }, cardId) => {
          const hand = G.draftHands[playerID];
          if (!hand) return INVALID_MOVE;

          const idx = hand.findIndex(c => c.id === cardId);
          if (idx === -1) return INVALID_MOVE;

          const [card] = hand.splice(idx, 1);
          G.discardPile.push(card);

          // Gain tokens of the card's primary type (configurable reward)
          const typeKey = (card.data.type_a_name || 'fire').toLowerCase();
          G.players[playerID].resources[typeKey] =
            (G.players[playerID].resources[typeKey] || 0) + G.config.discardReward;

          maybeRotateHands(G);
        },
      },

      endIf: ({ G }) => {
        const hands = Object.values(G.draftHands);
        if (hands.length === 0) return false;
        return hands.every(h => h.length <= 1);
      },

      onEnd: ({ G }) => {
        // Discard remaining cards
        for (const hand of Object.values(G.draftHands)) {
          G.discardPile.push(...hand);
        }
        G.draftHands = {};
        G.draftRound = 0;
      },

      next: 'play',
    },

    // ─── Phase 3: Play ───
    play: {
      moves: {
        ...sandboxMoves,

        /** Play a card from hand to lab */
        playCardToLab: ({ G, playerID }, cardId) => {
          const pid = playerID || '0';
          if (zoneAtCapacity(G, pid, 'lab')) return INVALID_MOVE;

          const hand = G.players[pid].hand;
          const idx = hand.findIndex(c => c.id === cardId);
          if (idx === -1) return;
          const [card] = hand.splice(idx, 1);
          G.players[pid].lab.push(card);
        },

        /** Advance era and go back to draft */
        advanceEra: ({ G, events }) => {
          if (G.era < 3) {
            G.era++;
            events.setPhase('draft');
          }
        },

        /** Import a saved game state (replaces G wholesale) */
        importState: ({ G }, newState) => {
          // Preserve catalog data (not serialized in exports)
          const preserve = ['cardCatalog', 'types', 'schools', 'eraPools'];
          const saved = {};
          for (const key of preserve) saved[key] = G[key];

          // Clear G and apply imported state
          for (const key of Object.keys(G)) delete G[key];
          Object.assign(G, newState);

          // Restore catalog references
          for (const key of preserve) {
            if (!G[key]) G[key] = saved[key];
          }

          // Ensure config exists
          if (!G.config) G.config = { ...DEFAULT_CONFIG };
        },
      },

      turn: {
        // Sandbox: all players can make unlimited moves
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
  };
}

/** After a draft pick, check if all hands are the same size. If so, rotate. */
function maybeRotateHands(G) {
  const hands = Object.values(G.draftHands);
  if (hands.length < 2) return;

  const sizes = hands.map(h => h.length);
  const allSame = sizes.every(s => s === sizes[0]);

  if (allSame) {
    // Rotate hands: clockwise for odd eras, counter-clockwise for even
    const playerIds = Object.keys(G.draftHands).sort();
    const handArrays = playerIds.map(id => G.draftHands[id]);

    const dir = G.config.draftDirection;
    const clockwise = dir === 'clockwise' ||
      (dir === 'alternating' && G.era % 2 === 1);

    if (clockwise) {
      // Clockwise: last hand goes to first position
      const last = handArrays.pop();
      handArrays.unshift(last);
    } else {
      // Counter-clockwise: first hand goes to last position
      const first = handArrays.shift();
      handArrays.push(first);
    }

    for (let i = 0; i < playerIds.length; i++) {
      G.draftHands[playerIds[i]] = handArrays[i];
    }

    G.draftRound++;
  }
}

/** Resolve a zone name to the actual array in G */
function resolveZone(G, playerID, zone) {
  switch (zone) {
    case 'market': return G.cardMarket;
    case 'draw': return G.drawPile;
    case 'discard': return G.discardPile;
    case 'hand': return G.players[playerID]?.hand;
    case 'lab': return G.players[playerID]?.lab;
    default: return null;
  }
}
