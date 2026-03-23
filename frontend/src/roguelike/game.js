/**
 * boardgame.io game definition — Roguelike Mode.
 * Single-player run: mapNavigation → combat → reward → mapNavigation ...
 * Phases: mapNavigation, combat, reward, rest, shop, runEnd.
 */

import { generateMap } from './map.js';

/** Debug moves available in every phase */
const DEBUG_MOVES = {
  debugGold: ({ G }, amount) => { G.run.gold = Math.max(0, G.run.gold + amount); },
  debugHp: ({ G }, amount) => {
    G.player.hp = Math.max(1, Math.min(G.player.maxHp, G.player.hp + amount));
  },
  debugMaxHp: ({ G }, amount) => {
    G.player.maxHp = Math.max(1, G.player.maxHp + amount);
    G.player.hp = Math.min(G.player.hp, G.player.maxHp);
  },
  debugEnergy: ({ G }, amount) => {
    // Add/remove energy for all primary types
    for (const type of Object.keys(G.player.typeEnergy)) {
      if (G.player.maxTypeEnergy[type] > 0 || amount > 0) {
        G.player.maxTypeEnergy[type] = Math.max(0, G.player.maxTypeEnergy[type] + amount);
        G.player.typeEnergy[type] = G.player.maxTypeEnergy[type];
      }
    }
  },
};

/**
 * Build type ID → lowercase name map from catalog.
 * Called once during game creation.
 */
let TYPE_NAMES = {};

function buildTypeNames(catalog) {
  TYPE_NAMES = {};
  for (const t of catalog.types) {
    TYPE_NAMES[t.id] = t.name.toLowerCase();
  }
}

/**
 * Convert a spell from the DB catalog into a playable card.
 * Damage/block are derived from type amounts since the DB doesn't store combat stats.
 */
function spellToCard(spell, idSuffix = '') {
  const totalCost = spell.type_a_amount + (spell.type_b_amount || 0);

  // Derive combat stats from type amounts
  // Higher total cost = stronger effect
  const isDefensive = spell.nature === 'material' || (spell.name && spell.name.match(/wall|shield|barrier|armor|stone|fort|ward|veil/i));
  const damage = isDefensive ? 0 : Math.max(1, totalCost * 3);
  const block = isDefensive ? Math.max(1, totalCost * 3) : (spell.nature === 'phenomenon' ? Math.floor(totalCost * 1.5) : 0);

  // Build type cost object — handle single-type spells (type_b_id is null)
  const typeCost = {};
  const typeAKey = TYPE_NAMES[spell.type_a_id];
  if (typeAKey && spell.type_a_amount > 0) {
    typeCost[typeAKey] = (typeCost[typeAKey] || 0) + spell.type_a_amount;
  }
  if (spell.type_b_id != null) {
    const typeBKey = TYPE_NAMES[spell.type_b_id];
    if (typeBKey && spell.type_b_amount > 0) {
      typeCost[typeBKey] = (typeCost[typeBKey] || 0) + spell.type_b_amount;
    }
  }

  return {
    id: `spell-${spell.id}${idSuffix}`,
    data: {
      name: spell.name,
      description: spell.description,
      typeCost,           // e.g. { fire: 1 } or { fire: 1, earth: 1 }
      damage,
      block,
      nature: spell.nature,
      mechanic: spell.mechanic,
      type_a_name: spell.type_a_name,
      type_a_color: spell.type_a_color,
      type_b_name: spell.type_b_name || null,
      type_b_color: spell.type_b_color || null,
      spellId: spell.id,
    },
  };
}

/**
 * Build a starter deck from the catalog.
 * Uses single-type 1-cost primary spells (Spark, Stone, Splash, Gust)
 * plus some cross-type 1+1 primary spells.
 */
function buildStarterDeck(catalog) {
  const deck = [];
  const spells = catalog.spells;

  // Single-type primary spells (type_b_id is null, cost = 1)
  // These are the basic "Strike" and "Block" equivalents
  const singleTypeSpells = spells.filter(s =>
    s.type_b_id == null &&
    s.type_a_id >= 1 && s.type_a_id <= 4 &&
    s.mechanic === 'spell'
  );

  // 2 copies of each single-type starter
  for (const spell of singleTypeSpells) {
    deck.push(spellToCard(spell, '-a'));
    deck.push(spellToCard(spell, '-b'));
  }

  // If we have too many, trim to 8 single-type cards
  while (deck.length > 8) deck.pop();

  // Add 2 cross-type primary 1+1 spells for variety
  const crossSpells = spells.filter(s =>
    s.type_b_id != null &&
    s.type_a_id >= 1 && s.type_a_id <= 4 &&
    s.type_b_id >= 1 && s.type_b_id <= 4 &&
    s.type_a_amount === 1 && s.type_b_amount === 1 &&
    s.mechanic === 'spell'
  );

  for (const spell of crossSpells.slice(0, 2)) {
    deck.push(spellToCard(spell));
  }

  return deck;
}

/**
 * Check if the player can afford a card's type cost.
 */
function canPlayCard(typeEnergy, card) {
  const cost = card.data.typeCost;
  if (!cost) return false;
  for (const [type, amount] of Object.entries(cost)) {
    if ((typeEnergy[type] || 0) < amount) return false;
  }
  return true;
}

/**
 * Spend type energy for a card.
 */
function spendCardCost(typeEnergy, card) {
  const cost = card.data.typeCost;
  if (!cost) return;
  for (const [type, amount] of Object.entries(cost)) {
    typeEnergy[type] = Math.max(0, typeEnergy[type] - amount);
  }
}

/**
 * Generate reward card choices after combat victory.
 * Picks 3 random spells from the catalog.
 */
function generateRewardCards(G, catalogSpells, catalogInstruments, catalogTypes) {
  const allSpells = catalogSpells.filter(s => s.mechanic === 'spell');
  const shuffled = [...allSpells].sort(() => Math.random() - 0.5);
  G.reward.cards = [];
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    G.reward.cards.push(spellToCard(shuffled[i], `-reward-${Date.now()}-${i}`));
  }

  // Offer an instrument (50% chance, or always for elites/bosses)
  G.reward.instrument = null;
  if (catalogInstruments && catalogInstruments.length > 0 && Math.random() > 0.5) {
    const shuffledInst = [...catalogInstruments].sort(() => Math.random() - 0.5);
    const inst = shuffledInst[0];
    const typeName = catalogTypes?.find(t => t.id === inst.type_id)?.name?.toLowerCase() || 'unknown';
    G.reward.instrument = {
      id: `inst-${inst.id}-${Date.now()}`,
      data: {
        name: inst.name,
        description: inst.description,
        type_id: inst.type_id,
        typeName,
        color: inst.type_color,
        scientist: inst.associated_scientist,
        energyBonus: { [typeName]: 1 },
      },
    };
  }
}

/**
 * Create the roguelike game definition.
 * @param {object} catalog — { types, spells, instruments, wizards } from DB
 * @param {object} config — { floorCount } run configuration
 */
export function createRoguelikeGame(catalog, config = {}) {
  const floorCount = config.floorCount || 15;
  buildTypeNames(catalog);

  return {
    name: 'wizard-game-roguelike',

    setup: ({ ctx }) => {
      const map = generateMap(null, 1, floorCount); // Act 1 (no random in setup)

      // Build starter deck from real spells in the catalog
      // Use primary self-combinations (Fire+Fire, Earth+Earth, etc.) as starter spells
      const starterDeck = buildStarterDeck(catalog);

      // Simple shuffle (random not available in setup; combat onBegin will re-shuffle with seeded random)
      const shuffled = starterDeck.sort(() => Math.random() - 0.5);

      // Draw opening hand of 5
      const hand = shuffled.splice(0, 5);

      // Starting type energy: 2 of each primary type, 0 for all others
      const typeEnergy = {};
      for (const t of catalog.types) {
        const key = t.name.toLowerCase();
        typeEnergy[key] = t.tier === 'primary' ? 2 : 0;
      }

      return {
        // Run state
        run: {
          act: 1,
          map,
          position: null,         // current node id (null = not started)
          gold: 0,
          score: 0,
        },

        // Player state
        player: {
          hp: 50,
          maxHp: 50,
          typeEnergy: { ...typeEnergy },
          maxTypeEnergy: { ...typeEnergy },
          attunements: {},        // permanent energy bonuses from rest sites
          deck: shuffled,
          hand,
          discard: [],
          equipment: [],
          wizard: null,           // unlocked wizard identity (null = generic)
          school: null,
        },

        // Combat state (populated when entering combat phase)
        combat: {
          enemy: null,
          enemyHp: 0,
          enemyMaxHp: 0,
          enemyBlock: 0,
          playerBlock: 0,
          turnNumber: 0,
          statusEffects: { player: [], enemy: [] },
        },

        // Reward state (populated after combat)
        reward: {
          cards: [],              // card choices offered
          instrument: null,       // instrument offered (or null)
          gold: 0,
        },

        // Shop state (populated when entering shop phase)
        shop: {
          cards: [],
          removeCardPrice: 50,
        },

        // Catalog reference
        catalog: {
          types: catalog.types,
        },
      };
    },

    phases: {
      /**
       * SCHOOL SELECTION — Choose a wizard school at run start.
       */
      schoolSelection: {
        start: true,
        moves: {
          ...DEBUG_MOVES,
          chooseSchool: ({ G, events }, typeId) => {
            // Find the head wizard for this type
            const school = catalog.wizards.find(w =>
              w.type_id === typeId && w.role === 'head'
            );
            const type = catalog.types.find(t => t.id === typeId);
            if (!type) return;

            const typeName = type.name.toLowerCase();
            G.player.school = {
              typeId,
              typeName,
              schoolName: school?.school_name || type.name,
              wizardName: school?.scientist_name || 'Unknown',
              color: type.color,
            };

            // Bonus: +1 max energy of school's type
            G.player.maxTypeEnergy[typeName] = (G.player.maxTypeEnergy[typeName] || 0) + 1;
            G.player.typeEnergy[typeName] = G.player.maxTypeEnergy[typeName];

            // Add a signature single-type spell for this type to deck
            const signatureSpell = catalog.spells.find(s =>
              s.type_b_id == null &&
              s.type_a_id === typeId &&
              s.mechanic === 'spell' &&
              s.nature === 'spell'
            );
            if (signatureSpell) {
              G.player.deck.push(spellToCard(signatureSpell, '-school'));
            }

            events.setPhase('mapNavigation');
          },
        },
      },

      /**
       * MAP NAVIGATION — Player chooses next node on the branching map.
       */
      mapNavigation: {
        turn: {
          minMoves: 0,
          maxMoves: undefined,
        },
        moves: {
          ...DEBUG_MOVES,

          chooseNode: ({ G, events }, nodeId) => {
            console.log('chooseNode move called:', nodeId, 'current position:', G.run.position);
            const node = G.run.map.nodes.find(n => n.id === nodeId);
            if (!node) { console.log('node not found'); return; }

            // Validate: node must be reachable from current position
            if (!isReachable(G.run.map, G.run.position, nodeId)) { console.log('node not reachable'); return; }

            G.run.position = nodeId;

            // Transition to appropriate phase based on node type
            switch (node.type) {
              case 'combat':
              case 'elite':
                G.combat.enemy = node.enemy;
                G.combat.enemyHp = node.enemy.hp;
                G.combat.enemyMaxHp = node.enemy.hp;
                G.combat.enemyBlock = 0;
                G.combat.playerBlock = 0;
                G.combat.turnNumber = 0;
                G.combat.statusEffects = { player: [], enemy: [] };
                events.setPhase('combat');
                break;
              case 'rest':
                events.setPhase('rest');
                break;
              case 'shop':
                events.setPhase('shop');
                break;
              case 'boss':
                G.combat.enemy = node.enemy;
                G.combat.enemyHp = node.enemy.hp;
                G.combat.enemyMaxHp = node.enemy.hp;
                G.combat.enemyBlock = 0;
                G.combat.playerBlock = 0;
                G.combat.turnNumber = 0;
                G.combat.statusEffects = { player: [], enemy: [] };
                events.setPhase('combat');
                break;
              default:
                break;
            }
          },
        },
      },

      /**
       * COMBAT — Turn-based: player plays cards, then enemy attacks.
       */
      combat: {
        onBegin: ({ G, random }) => {
          // Shuffle all cards into deck at combat start
          G.player.deck = random.Shuffle([
            ...G.player.deck,
            ...G.player.hand,
            ...G.player.discard,
          ]);
          G.player.hand = [];
          G.player.discard = [];

          // Refill type energy
          for (const type of Object.keys(G.player.typeEnergy)) {
            G.player.typeEnergy[type] = G.player.maxTypeEnergy[type];
          }

          // Draw opening hand of 5
          const drawCount = Math.min(5, G.player.deck.length);
          for (let i = 0; i < drawCount; i++) {
            G.player.hand.push(G.player.deck.pop());
          }
        },
        moves: {
          ...DEBUG_MOVES,
          debugKillEnemy: ({ G, events }) => {
            G.combat.enemyHp = 0;
            G.reward.gold = 10 + Math.floor(Math.random() * 10);
            G.run.gold += G.reward.gold;
            generateRewardCards(G, catalog.spells, catalog.instruments, catalog.types);
            events.setPhase('reward');
          },

          playCard: ({ G, events }, cardId) => {
            const idx = G.player.hand.findIndex(c => c.id === cardId);
            if (idx === -1) return;

            const card = G.player.hand[idx];
            if (!canPlayCard(G.player.typeEnergy, card)) return;

            // Spend type energy
            spendCardCost(G.player.typeEnergy, card);

            // Apply card effect
            const damage = card.data.damage || 0;
            const actualDamage = Math.max(0, damage - G.combat.enemyBlock);
            G.combat.enemyBlock = Math.max(0, G.combat.enemyBlock - damage);
            G.combat.enemyHp -= actualDamage;

            // Apply block if card has it
            if (card.data.block) {
              G.combat.playerBlock += card.data.block;
            }

            // Move card to discard
            G.player.hand.splice(idx, 1);
            G.player.discard.push(card);

            // Check if enemy defeated
            if (G.combat.enemyHp <= 0) {
              G.reward.gold = 10 + Math.floor(Math.random() * 10);
              G.run.gold += G.reward.gold;
              generateRewardCards(G, catalog.spells, catalog.instruments, catalog.types);
              events.setPhase('reward');
            }
          },

          endPlayerTurn: ({ G, events, random }) => {
            // If enemy already dead (killed by playCard), skip
            if (G.combat.enemyHp <= 0) {
              return;
            }

            // Enemy turn: simple scripted attack
            if (G.combat.enemy) {
              const enemyDamage = G.combat.enemy.attack || 5;
              const actualDamage = Math.max(0, enemyDamage - G.combat.playerBlock);
              G.combat.playerBlock = Math.max(0, G.combat.playerBlock - enemyDamage);
              G.player.hp -= actualDamage;
            }

            // Reset player block at start of next turn
            G.combat.playerBlock = 0;

            // Check if player died
            if (G.player.hp <= 0) {
              events.setPhase('runEnd');
              return;
            }

            // Next turn: refill type energy, draw cards
            G.combat.turnNumber++;
            for (const type of Object.keys(G.player.typeEnergy)) {
              G.player.typeEnergy[type] = G.player.maxTypeEnergy[type];
            }

            // Draw up to 5 cards
            while (G.player.hand.length < 5 && (G.player.deck.length > 0 || G.player.discard.length > 0)) {
              if (G.player.deck.length === 0) {
                // Shuffle discard into deck
                G.player.deck = random.Shuffle([...G.player.discard]);
                G.player.discard = [];
              }
              G.player.hand.push(G.player.deck.pop());
            }
          },
        },
      },

      /**
       * REWARD — Pick a card, collect gold, then return to map.
       */
      reward: {
        moves: {
          ...DEBUG_MOVES,
          selectReward: ({ G, events }, cardId) => {
            const card = G.reward.cards.find(c => c.id === cardId);
            if (card) {
              G.player.deck.push(card);
            }
            G.reward.cards = [];
            G.reward.instrument = null;
            events.setPhase('mapNavigation');
          },
          selectInstrument: ({ G, events }) => {
            const inst = G.reward.instrument;
            if (!inst) return;

            // Equip instrument and apply energy bonus
            G.player.equipment.push(inst);
            const bonus = inst.data.energyBonus || {};
            for (const [type, amount] of Object.entries(bonus)) {
              G.player.maxTypeEnergy[type] = (G.player.maxTypeEnergy[type] || 0) + amount;
              G.player.typeEnergy[type] = G.player.maxTypeEnergy[type];
            }

            G.reward.cards = [];
            G.reward.instrument = null;
            events.setPhase('mapNavigation');
          },
          skipReward: ({ G, events }) => {
            G.reward.cards = [];
            G.reward.instrument = null;
            events.setPhase('mapNavigation');
          },
        },
      },

      /**
       * REST — Heal or upgrade a card.
       */
      rest: {
        moves: {
          ...DEBUG_MOVES,
          heal: ({ G, events }) => {
            G.player.hp = Math.min(G.player.maxHp, G.player.hp + Math.floor(G.player.maxHp * 0.3));
            events.setPhase('mapNavigation');
          },
          upgradeCard: ({ G, events }, cardId) => {
            const card = G.player.deck.find(c => c.id === cardId);
            if (card) {
              card.upgraded = true;
            }
            events.setPhase('mapNavigation');
          },
          attune: ({ G, events }, typeName) => {
            // Permanently gain +1 max energy of chosen type
            if (G.player.maxTypeEnergy[typeName] === undefined) return;
            G.player.attunements[typeName] = (G.player.attunements[typeName] || 0) + 1;
            G.player.maxTypeEnergy[typeName] += 1;
            G.player.typeEnergy[typeName] = G.player.maxTypeEnergy[typeName];
            events.setPhase('mapNavigation');
          },
        },
      },

      /**
       * SHOP — Buy cards or instruments with gold.
       */
      shop: {
        onBegin: ({ G, random }) => {
          // Generate shop inventory from real spells in the catalog
          const allSpells = catalog.spells.filter(s => s.mechanic === 'spell');
          const shuffled = random.Shuffle([...allSpells]);

          // Pick 4 random spells, convert to cards with prices
          const shopCards = [];
          for (let i = 0; i < Math.min(4, shuffled.length); i++) {
            const card = spellToCard(shuffled[i], `-shop-${Date.now()}-${i}`);
            // Price based on total type cost
            const totalCost = Object.values(card.data.typeCost).reduce((s, v) => s + v, 0);
            card.data.price = 25 + totalCost * 15;
            shopCards.push(card);
          }

          G.shop = {
            cards: shopCards,
            removeCardPrice: 50,
          };
        },
        moves: {
          ...DEBUG_MOVES,
          buyCard: ({ G, events }, cardId) => {
            const idx = G.shop.cards.findIndex(c => c.id === cardId);
            if (idx === -1) return;
            const card = G.shop.cards[idx];
            if (G.run.gold < card.data.price) return;

            G.run.gold -= card.data.price;
            // Add to deck without the price field
            const { price, ...cardData } = card.data;
            G.player.deck.push({ id: card.id, data: cardData });
            G.shop.cards.splice(idx, 1);
          },
          removeCard: ({ G, events }, cardId) => {
            if (G.run.gold < G.shop.removeCardPrice) return;

            // Search all card pools (deck, hand, discard)
            let found = false;
            for (const pool of [G.player.deck, G.player.hand, G.player.discard]) {
              const idx = pool.findIndex(c => c.id === cardId);
              if (idx !== -1) {
                pool.splice(idx, 1);
                found = true;
                break;
              }
            }
            if (!found) return;

            G.run.gold -= G.shop.removeCardPrice;
            G.shop.removeCardPrice += 25; // gets more expensive each time
          },
          leaveShop: ({ events }) => {
            events.setPhase('mapNavigation');
          },
        },
      },

      /**
       * RUN END — Game over (win or lose).
       */
      runEnd: {
        moves: {},
      },
    },
  };
}

/**
 * Check if a node is reachable from the current position.
 */
function isReachable(map, currentPosition, targetNodeId) {
  // If no current position, only floor-0 nodes are reachable
  if (currentPosition === null) {
    const target = map.nodes.find(n => n.id === targetNodeId);
    return target && target.floor === 0;
  }

  // Check if there's an edge from current to target
  return map.edges.some(
    e => e.from === currentPosition && e.to === targetNodeId
  );
}
