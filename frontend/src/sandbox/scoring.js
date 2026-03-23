/**
 * Score calculation functions for multiple victory paths.
 * Each function takes a player object from G and returns a score.
 */

/**
 * Storm Power — count of offensive/damage-dealing cards in lab.
 * Cards with 'material' or 'force' nature are offensive.
 */
export function calcStormPower(player) {
  return player.lab.filter(c => {
    const nature = c.data?.nature || '';
    return nature === 'material' || nature === 'force';
  }).length;
}

/**
 * Discovery Sets — science-style scoring from tertiary type symbols.
 * Groups cards by their tertiary type combo. Score = sum of (count²) + 7 per complete set of 3.
 * For now, groups by type_a_id + type_b_id combination.
 */
export function calcDiscoverySets(player) {
  const groups = {};
  for (const card of player.lab) {
    const a = card.data?.type_a_id;
    const b = card.data?.type_b_id;
    if (a == null || b == null) continue;
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    groups[key] = (groups[key] || 0) + 1;
  }

  let score = 0;
  const counts = Object.values(groups);
  for (const count of counts) {
    score += count * count; // n² per group
  }

  // Bonus for complete sets (having 3+ different groups)
  const distinctGroups = counts.filter(c => c > 0).length;
  score += Math.floor(distinctGroups / 3) * 7;

  return score;
}

/**
 * Lab VP — simple count of cards in the lab.
 * Each card is worth 1 VP base. Cards could have a vp field for future use.
 */
export function calcLabVP(player) {
  let total = 0;
  for (const card of player.lab) {
    total += card.data?.vp || 1;
  }
  return total;
}

/**
 * School Stages — VP from built school stages.
 * For now, returns flat 2 VP if the player has a school selected.
 */
export function calcSchoolStages(player) {
  return player.school ? 2 : 0;
}

/**
 * Breakthroughs — placeholder for claimed breakthrough events.
 * Not yet implemented in game state; returns 0.
 */
export function calcBreakthroughs(_player) {
  return 0;
}

/**
 * Knowledge — leftover tokens ÷ 3.
 */
export function calcKnowledge(player) {
  const total = Object.values(player.resources || {}).reduce((sum, n) => sum + n, 0);
  return Math.floor(total / 3);
}

/**
 * Calculate all scores for a player.
 * Returns an object with each path's score and the total.
 */
export function calcAllScores(player) {
  const storm = calcStormPower(player);
  const discovery = calcDiscoverySets(player);
  const labVP = calcLabVP(player);
  const school = calcSchoolStages(player);
  const breakthroughs = calcBreakthroughs(player);
  const knowledge = calcKnowledge(player);
  const total = storm + discovery + labVP + school + breakthroughs + knowledge;

  return { storm, discovery, labVP, school, breakthroughs, knowledge, total };
}

/**
 * Score path definitions for UI rendering.
 */
export const SCORE_PATHS = [
  { key: 'storm', label: 'Storm Power', color: '#E74C3C' },
  { key: 'discovery', label: 'Discovery Sets', color: '#9B59B6' },
  { key: 'labVP', label: 'Lab VP', color: '#2ECC71' },
  { key: 'school', label: 'School Stages', color: '#F4D03F' },
  { key: 'breakthroughs', label: 'Breakthroughs', color: '#E67E22' },
  { key: 'knowledge', label: 'Knowledge', color: '#2E86C1' },
];
