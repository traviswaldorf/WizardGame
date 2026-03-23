/**
 * Database loading and card/token data queries.
 * Uses sql.js from CDN (loaded via script tag in index.html).
 */

/** Initialize sql.js and load the wizard_game database */
export async function loadDatabase() {
  const sqlPromise = initSqlJs({
    locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`,
  });

  const dataPromise = fetch('/wizard_game.db');
  const [SQL, response] = await Promise.all([sqlPromise, dataPromise]);

  if (!response.ok) {
    throw new Error(
      `Database fetch failed (${response.status}). Run database/build.py first.`
    );
  }

  const buffer = await response.arrayBuffer();
  return new SQL.Database(new Uint8Array(buffer));
}

/** Helper: convert sql.js exec result to array of plain objects */
function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/** Load all types ordered by sort_order */
export function loadTypes(db) {
  return toObjects(db.exec(`
    SELECT id, name, old_name, tier, color, secondary_color, accent_color,
           icon_symbol, state_of_matter, energy_domain, primary_archetype,
           sort_order
    FROM types
    ORDER BY sort_order
  `));
}

/** Load spell cards from type_combination_design */
export function loadSpellCards(db) {
  return toObjects(db.exec(`
    SELECT tc.id, tc.name, tc.description,
           tc.type_a_id, tc.type_b_id,
           tc.type_a_amount, tc.type_b_amount,
           tc.nature, tc.mechanic, tc.process,
           ta.name AS type_a_name, ta.color AS type_a_color,
           tb.name AS type_b_name, tb.color AS type_b_color
    FROM type_combination_design tc
    JOIN types ta ON tc.type_a_id = ta.id
    LEFT JOIN types tb ON tc.type_b_id = tb.id
    ORDER BY tc.id
  `));
}

/** Load instrument cards from instrument_design */
export function loadInstrumentCards(db) {
  return toObjects(db.exec(`
    SELECT i.id, i.name, i.description,
           i.associated_scientist, i.thematic_role,
           i.type_id, t.name AS type_name, t.color AS type_color
    FROM instrument_design i
    JOIN types t ON i.type_id = t.id
    ORDER BY i.id
  `));
}

/** Load wizard cards from wizard_school_design */
export function loadWizardCards(db) {
  return toObjects(db.exec(`
    SELECT ws.id, ws.school_name, ws.role, ws.scientist_name,
           ws.birth_year, ws.death_year, ws.contribution,
           ws.type_id, t.name AS type_name, t.color AS type_color
    FROM wizard_school_design ws
    JOIN types t ON ws.type_id = t.id
    ORDER BY ws.type_id, ws.role
  `));
}

/** Load roguelike progression tree and meta-progression data */
export function loadRoguelikeProgression(db) {
  const nodes = toObjects(db.exec(`
    SELECT n.id, n.name, n.description, n.flavor_text, n.type_id,
           n.category, n.tier, n.branch, n.visibility, n.meta_unlock_id,
           n.sort_order, t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node n
    LEFT JOIN types t ON n.type_id = t.id
    ORDER BY n.sort_order
  `));

  const costs = {};
  for (const c of toObjects(db.exec(`
    SELECT nc.node_id, nc.type_id, nc.amount, t.name AS type_name
    FROM prototype_roguelike_node_cost nc
    JOIN types t ON nc.type_id = t.id
  `))) {
    (costs[c.node_id] ??= []).push(c);
  }

  const prerequisites = {};
  for (const p of toObjects(db.exec(`
    SELECT node_id, required_node_id, prerequisite_group
    FROM prototype_roguelike_node_prerequisite
    ORDER BY prerequisite_group
  `))) {
    prerequisites[p.node_id] ??= {};
    (prerequisites[p.node_id][p.prerequisite_group] ??= []).push(p.required_node_id);
  }

  const effects = {};
  for (const e of toObjects(db.exec(`
    SELECT ne.node_id, ne.effect_type, ne.target_type_id, ne.value,
           ne.description, t.name AS target_type_name
    FROM prototype_roguelike_node_effect ne
    LEFT JOIN types t ON ne.target_type_id = t.id
  `))) {
    (effects[e.node_id] ??= []).push(e);
  }

  const gateRequirements = {};
  for (const g of toObjects(db.exec(`
    SELECT gr.gate_node_id, gr.required_type_id, gr.required_depth,
           t.name AS type_name
    FROM prototype_roguelike_gate_requirement gr
    JOIN types t ON gr.required_type_id = t.id
  `))) {
    (gateRequirements[g.gate_node_id] ??= []).push(g);
  }

  const metaUnlocks = toObjects(db.exec(`
    SELECT id, name, description, layer, category, target_type_id
    FROM prototype_roguelike_meta_unlock
    ORDER BY layer, id
  `));

  const metaConditions = {};
  for (const mc of toObjects(db.exec(`
    SELECT meta_unlock_id, condition_type, condition_type_id,
           condition_value, condition_type_b_id, description
    FROM prototype_roguelike_meta_condition
  `))) {
    (metaConditions[mc.meta_unlock_id] ??= []).push(mc);
  }

  const research = toObjects(db.exec(`
    SELECT id, name, description, meta_unlock_id, insight_cost,
           material_cost, max_purchases, sort_order
    FROM prototype_roguelike_research
    ORDER BY sort_order
  `));

  const masteryLevels = toObjects(db.exec(`
    SELECT level, name, description, modifier_type, modifier_value
    FROM prototype_roguelike_mastery_level
    ORDER BY level
  `));

  return {
    nodes, costs, prerequisites, effects, gateRequirements,
    metaUnlocks, metaConditions, research, masteryLevels,
  };
}

/** Load all data needed for the sandbox */
export async function loadGameData() {
  const db = await loadDatabase();
  const types = loadTypes(db);
  const spells = loadSpellCards(db);
  const instruments = loadInstrumentCards(db);
  const wizards = loadWizardCards(db);
  db.close();
  return { types, spells, instruments, wizards };
}
