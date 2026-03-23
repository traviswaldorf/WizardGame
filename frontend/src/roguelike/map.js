/**
 * Procedural map generation for roguelike runs.
 * Generates a branching node map similar to Slay the Spire.
 *
 * Map structure:
 * - 15 floors per act
 * - Each floor has 2-4 nodes
 * - Edges connect nodes on adjacent floors
 * - Node types: combat, elite, rest, shop, boss
 * - Guaranteed: rest on floor 12, boss on floor 14
 */

const NODE_TYPES = ['combat', 'elite', 'rest', 'shop'];

/** Type weights by floor range (early, mid, late) */
const FLOOR_WEIGHTS = {
  early:  { combat: 60, elite: 5,  rest: 10, shop: 25 },  // floors 0-4
  mid:    { combat: 45, elite: 20, rest: 15, shop: 20 },  // floors 5-9
  late:   { combat: 35, elite: 25, rest: 20, shop: 20 },  // floors 10-13
};

/**
 * Generate a map for one act.
 * @param {object} random — boardgame.io random API (or { D6, Shuffle })
 * @param {number} act — act number (1, 2, 3)
 * @returns {{ nodes: Array, edges: Array }}
 */
export function generateMap(random, act, floorCount = 15) {
  const FLOORS = floorCount;
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  // Generate nodes per floor
  for (let floor = 0; floor < FLOORS; floor++) {
    let floorNodes;

    if (floor === FLOORS - 1) {
      // Boss floor: single boss node
      floorNodes = [{
        id: `node-${nodeId++}`,
        floor,
        type: 'boss',
        enemy: makeBossEnemy(act),
        x: 0.5, // normalized position (0-1)
      }];
    } else if (FLOORS >= 5 && floor === FLOORS - 3) {
      // Guaranteed rest before boss
      const count = 2;
      floorNodes = [];
      for (let i = 0; i < count; i++) {
        floorNodes.push({
          id: `node-${nodeId++}`,
          floor,
          type: 'rest',
          x: (i + 1) / (count + 1),
        });
      }
    } else {
      // Regular floor: 2-4 nodes
      const count = 2 + (random ? weightedRandom(random, { 2: 40, 3: 40, 4: 20 }) : 2);
      const actualCount = Math.min(count, 4);
      floorNodes = [];
      for (let i = 0; i < actualCount; i++) {
        const type = pickNodeType(random, floor, FLOORS);
        floorNodes.push({
          id: `node-${nodeId++}`,
          floor,
          type,
          enemy: (type === 'combat' || type === 'elite') ? makeEnemy(type, floor, act) : null,
          x: (i + 1) / (actualCount + 1),
        });
      }
    }

    nodes.push(...floorNodes);
  }

  // Generate edges between adjacent floors
  for (let floor = 0; floor < FLOORS - 1; floor++) {
    const currentFloor = nodes.filter(n => n.floor === floor);
    const nextFloor = nodes.filter(n => n.floor === floor + 1);

    if (currentFloor.length === 0 || nextFloor.length === 0) continue;

    // Each node connects to 1-2 nodes on the next floor
    // Ensure every node has at least one outgoing edge
    // and every next-floor node has at least one incoming edge
    const incomingCount = {};
    nextFloor.forEach(n => { incomingCount[n.id] = 0; });

    for (const node of currentFloor) {
      // Connect to closest node(s) on next floor
      const sorted = [...nextFloor].sort((a, b) =>
        Math.abs(a.x - node.x) - Math.abs(b.x - node.x)
      );

      // Always connect to closest
      edges.push({ from: node.id, to: sorted[0].id });
      incomingCount[sorted[0].id]++;

      // Sometimes connect to second closest (50% chance)
      if (sorted.length > 1 && (!random || simpleRandom(random) > 0.5)) {
        edges.push({ from: node.id, to: sorted[1].id });
        incomingCount[sorted[1].id]++;
      }
    }

    // Ensure every next-floor node has at least one incoming edge
    for (const node of nextFloor) {
      if (incomingCount[node.id] === 0) {
        // Connect from closest current-floor node
        const closest = [...currentFloor].sort((a, b) =>
          Math.abs(a.x - node.x) - Math.abs(b.x - node.x)
        )[0];
        edges.push({ from: closest.id, to: node.id });
      }
    }
  }

  return { nodes, edges, act };
}

/**
 * Pick a node type based on floor position.
 */
function pickNodeType(random, floor, totalFloors) {
  let weights;
  if (floor < totalFloors * 0.33) weights = FLOOR_WEIGHTS.early;
  else if (floor < totalFloors * 0.66) weights = FLOOR_WEIGHTS.mid;
  else weights = FLOOR_WEIGHTS.late;

  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = random ? simpleRandom(random) * total : Math.random() * total;

  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'combat';
}

/**
 * Create a combat enemy based on node type and floor.
 */
function makeEnemy(type, floor, act) {
  const baseHp = type === 'elite' ? 30 : 15;
  const hpScaling = 1 + floor * 0.15 + (act - 1) * 0.5;
  const baseAttack = type === 'elite' ? 8 : 5;

  return {
    name: type === 'elite' ? 'Elite Elemental' : 'Elemental',
    hp: Math.floor(baseHp * hpScaling),
    attack: Math.floor(baseAttack * (1 + floor * 0.1)),
    type: null, // will be assigned from type system later
  };
}

/**
 * Create a boss enemy for the act.
 */
function makeBossEnemy(act) {
  const bossHp = [80, 120, 180][act - 1] || 80;
  const bossAttack = [10, 15, 20][act - 1] || 10;

  return {
    name: `Act ${act} Boss`,
    hp: bossHp,
    attack: bossAttack,
    type: null,
    isBoss: true,
  };
}

/**
 * Simple random 0-1 using boardgame.io's D6.
 */
function simpleRandom(random) {
  if (random && random.D6) {
    return (random.D6() - 1) / 5;
  }
  return Math.random();
}

/**
 * Weighted random selection returning the chosen key (as number).
 */
function weightedRandom(random, weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = simpleRandom(random) * total;

  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return parseInt(key);
  }
  return parseInt(entries[0][0]);
}
