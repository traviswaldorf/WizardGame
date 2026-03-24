/**
 * Interactive Visual Skill Tree — Cytoscape.js powered.
 * Diamond compass layout: Fire(N), Earth(E), Water(S), Air(W).
 * Core branches radiate outward, cross-type at 45° between neighbors.
 */

// === Data ===
let types = {};
let nodes = {};
let costs = {};
let prerequisites = {};
let effects = {};
let gateRequirements = {};
let metaUnlocks = [];
let metaUnlockMap = {};

// === Layout angles ===
// Fire=North(-Y), Earth=East(+X), Water=South(+Y), Air=West(-X)
const TYPE_ANGLE = {
  1: -Math.PI / 2,        // Fire → N
  2: 0,                   // Earth → E
  3: Math.PI / 2,         // Water → S
  4: Math.PI,             // Air → W
  5: -Math.PI / 4,        // Metal → NE (Fire+Earth)
  6: Math.PI / 4,         // Plant → SE (Earth+Water)
  7: 3 * Math.PI / 4,     // Ice → SW (Water+Air)
  8: -3 * Math.PI / 4,    // Electric → NW (Fire+Air)
  // Tertiaries share their parent's direction
  9: -Math.PI / 2,        // Radioactive (dark Fire) → N
  10: 0,                  // Cosmic (dark Earth) → E
  11: Math.PI / 2,        // Poison (dark Water) → S
  12: Math.PI,            // Sound (dark Air) → W
  13: -Math.PI / 4,       // Crystal (dark Metal) → NE
  14: Math.PI / 4,        // Ghost (dark Plant) → SE
  15: 3 * Math.PI / 4,    // Heat (dark Ice) → SW
  16: -3 * Math.PI / 4,   // Magnetic (dark Electric) → NW
};

const BRANCH_ANGLE = {
  'fire_earth': -Math.PI / 4,       // NE
  'fire_air':   -3 * Math.PI / 4,   // NW
  'earth_fire': -Math.PI / 4,       // NE (same as fire_earth)
  'earth_water': Math.PI / 4,       // SE
  'water_earth': Math.PI / 4,       // SE (same as earth_water)
  'water_air':  3 * Math.PI / 4,    // SW
  'air_fire':   -3 * Math.PI / 4,   // NW (same as fire_air)
  'air_water':  3 * Math.PI / 4,    // SW (same as water_air)
};

// Paired branches share the same diagonal. Only the "primary" (lower source ID)
// shows its label to avoid double text on overlapping nodes.
const SECONDARY_BRANCH = new Set(['earth_fire', 'water_earth', 'air_fire', 'air_water']);

const BRANCH_SOURCE_TYPE = {
  'core': null,
  'fire_earth': 1, 'fire_air': 1,
  'earth_fire': 2, 'earth_water': 2,
  'water_earth': 3, 'water_air': 3,
  'air_fire': 4, 'air_water': 4,
};

const STARTER_DIST = 200;
const TIER_STEP = 110;

const CATEGORY_COLORS = {
  'starter': '#5ddede', 'energy': '#5dde5d', 'spell_pool': '#5d5dde',
  'passive': '#dede5d', 'gate': '#dea05d', 'discovery': '#de5dde',
};

// === State ===
let cy = null;
let investedNodes = new Set();
let xpBudget = {};
let xpBudgetMax = {};
let showMeta = true;
let tooltip;

// =============================================
// SQL helpers
// =============================================

function queryAll(db, sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
}

// =============================================
// Data loading
// =============================================

function loadData(db) {
  queryAll(db, `SELECT id, name, color, tier, sort_order FROM types`)
    .forEach(t => types[t.id] = t);

  queryAll(db, `SELECT n.id, n.name, n.description, n.flavor_text, n.type_id,
    n.category, n.tier, n.branch, n.visibility, n.meta_unlock_id, n.sort_order,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node n
    LEFT JOIN types t ON n.type_id = t.id
    ORDER BY n.sort_order`)
    .forEach(n => nodes[n.id] = n);

  queryAll(db, `SELECT nc.node_id, nc.type_id, nc.amount, t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node_cost nc
    JOIN types t ON nc.type_id = t.id`)
    .forEach(c => { (costs[c.node_id] ??= []).push(c); });

  queryAll(db, `SELECT node_id, required_node_id, prerequisite_group
    FROM prototype_roguelike_node_prerequisite ORDER BY prerequisite_group`)
    .forEach(p => {
      prerequisites[p.node_id] ??= {};
      (prerequisites[p.node_id][p.prerequisite_group] ??= []).push(p.required_node_id);
    });

  queryAll(db, `SELECT ne.node_id, ne.effect_type, ne.target_type_id, ne.value,
    ne.description, t.name AS target_type_name
    FROM prototype_roguelike_node_effect ne
    LEFT JOIN types t ON ne.target_type_id = t.id`)
    .forEach(e => { (effects[e.node_id] ??= []).push(e); });

  queryAll(db, `SELECT gr.gate_node_id, gr.required_type_id, gr.required_depth,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_gate_requirement gr
    JOIN types t ON gr.required_type_id = t.id`)
    .forEach(g => { (gateRequirements[g.gate_node_id] ??= []).push(g); });

  metaUnlocks = queryAll(db, `SELECT mu.id, mu.name, mu.description, mu.layer, mu.category,
    mu.target_type_id, t.name AS target_type_name
    FROM prototype_roguelike_meta_unlock mu
    LEFT JOIN types t ON mu.target_type_id = t.id
    ORDER BY mu.layer, mu.id`);
  metaUnlocks.forEach(mu => metaUnlockMap[mu.id] = mu);
}

// =============================================
// Layout — compute positions for each node
// =============================================

function computePosition(node) {
  const branch = node.branch || 'core';
  const srcType = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;

  // Gate nodes: midpoint between their two parent types
  if (node.category === 'gate') {
    const gateReqs = gateRequirements[node.id];
    if (gateReqs && gateReqs.length >= 2) {
      const a1 = TYPE_ANGLE[gateReqs[0].required_type_id] ?? 0;
      const a2 = TYPE_ANGLE[gateReqs[1].required_type_id] ?? 0;
      const angle = averageAngle(a1, a2);
      const dist = STARTER_DIST + TIER_STEP * (node.tier - 0.5);
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
    }
  }

  // Determine angle
  let angle;
  if (branch === 'core' || !BRANCH_ANGLE[branch]) {
    angle = TYPE_ANGLE[srcType] ?? 0;
  } else {
    angle = BRANCH_ANGLE[branch] ?? TYPE_ANGLE[srcType] ?? 0;
  }

  const dist = STARTER_DIST + TIER_STEP * (node.tier - 1);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

function averageAngle(a1, a2) {
  return Math.atan2(Math.sin(a1) + Math.sin(a2), Math.cos(a1) + Math.cos(a2));
}

// =============================================
// Build Cytoscape elements
// =============================================

function buildElements() {
  const elements = [];

  // Group nodes for sub-spacing
  const groups = {};
  for (const node of Object.values(nodes)) {
    const branch = node.branch || 'core';
    const src = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;
    const key = `${src}_${node.tier}_${branch}`;
    (groups[key] ??= []).push(node);
  }

  // Nodes
  for (const node of Object.values(nodes)) {
    const pos = computePosition(node);
    const branch = node.branch || 'core';
    const src = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;
    const key = `${src}_${node.tier}_${branch}`;
    const group = groups[key] || [node];

    // Sub-spacing perpendicular to the radial direction
    if (group.length > 1) {
      const angle = Math.atan2(pos.y, pos.x);
      const perpAngle = angle + Math.PI / 2;
      const idx = group.indexOf(node);
      const offset = (idx - (group.length - 1) / 2) * 50;
      pos.x += Math.cos(perpAngle) * offset;
      pos.y += Math.sin(perpAngle) * offset;
    }

    elements.push({
      group: 'nodes',
      data: {
        id: `n${node.id}`,
        nodeId: node.id,
        label: SECONDARY_BRANCH.has(branch) ? '' : node.name,
        typeColor: node.type_color || '#888',
        category: node.category,
        catColor: CATEGORY_COLORS[node.category] || '#888',
        visibility: node.visibility,
        state: 'locked',
      },
      position: { x: pos.x, y: pos.y },
    });
  }

  // Type label nodes (non-interactive, positioned inside the diamond)
  for (const [typeIdStr, angle] of Object.entries(TYPE_ANGLE)) {
    const typeId = parseInt(typeIdStr);
    const type = types[typeId];
    if (!type) continue;
    const dist = STARTER_DIST - 80;
    elements.push({
      group: 'nodes',
      data: {
        id: `label_${typeId}`,
        label: type.name.toUpperCase(),
        typeColor: type.color,
        isLabel: true,
      },
      position: { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist },
      selectable: false,
      grabbable: false,
    });
  }

  // Edges from prerequisites
  for (const [nodeId, prereqGroups] of Object.entries(prerequisites)) {
    for (const group of Object.values(prereqGroups)) {
      for (const reqId of group) {
        elements.push({
          group: 'edges',
          data: {
            id: `e_${reqId}_${nodeId}`,
            source: `n${reqId}`,
            target: `n${nodeId}`,
            fromId: reqId,
            toId: parseInt(nodeId),
          },
        });
      }
    }
  }

  return elements;
}

// =============================================
// Cytoscape style
// =============================================

function buildStyle() {
  return [
    // --- Type labels ---
    {
      selector: 'node[?isLabel]',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 14,
        'font-weight': 'bold',
        'color': 'data(typeColor)',
        'text-opacity': 0.7,
        'width': 1,
        'height': 1,
        'background-opacity': 0,
        'border-width': 0,
        'events': 'no',
      },
    },

    // --- Default node (locked) ---
    {
      selector: 'node[!isLabel]',
      style: {
        'width': 56,
        'height': 56,
        'background-color': '#1a1a2e',
        'border-width': 2,
        'border-color': '#2a2a3a',
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': 9,
        'color': '#555',
        'text-margin-y': 8,
        'text-max-width': 90,
        'text-wrap': 'wrap',
        'opacity': 0.4,
        'overlay-opacity': 0,
        'transition-property': 'opacity, border-color, border-width, background-color',
        'transition-duration': '0.25s',
      },
    },

    // --- Gate nodes: diamond shape ---
    {
      selector: 'node[category="gate"]',
      style: {
        'shape': 'diamond',
        'width': 52,
        'height': 52,
      },
    },

    // --- Expensive (prereqs met, can't afford) ---
    {
      selector: 'node[state="expensive"]',
      style: {
        'opacity': 0.7,
        'border-color': 'data(typeColor)',
        'border-width': 2,
        'color': '#888',
      },
    },

    // --- Available (can invest) ---
    {
      selector: 'node[state="available"]',
      style: {
        'opacity': 1,
        'border-color': 'data(typeColor)',
        'border-width': 3,
        'color': '#ccc',
        'cursor': 'pointer',
        'shadow-blur': 12,
        'shadow-color': 'data(typeColor)',
        'shadow-opacity': 0.4,
      },
    },

    // --- Invested ---
    {
      selector: 'node[state="invested"]',
      style: {
        'opacity': 1,
        'background-color': 'data(typeColor)',
        'border-color': '#ffffff',
        'border-width': 2,
        'color': '#e0e0e0',
      },
    },

    // --- Meta-hidden ---
    {
      selector: 'node[visibility="meta"].meta-hidden',
      style: { 'display': 'none' },
    },

    // --- Edges ---
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#1a1a2e',
        'opacity': 0.3,
        'curve-style': 'bezier',
        'target-arrow-shape': 'none',
        'transition-property': 'line-color, opacity, width',
        'transition-duration': '0.25s',
      },
    },
    {
      selector: 'edge.partial',
      style: {
        'line-color': '#3a3a5a',
        'opacity': 0.6,
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
      },
    },
    {
      selector: 'edge.invested',
      style: {
        'opacity': 1,
        'width': 3,
      },
    },
    {
      selector: 'edge.meta-hidden',
      style: { 'display': 'none' },
    },
  ];
}

// =============================================
// State management
// =============================================

function getNodeState(nodeId) {
  if (investedNodes.has(nodeId)) return 'invested';

  const node = nodes[nodeId];
  if (!node) return 'locked';
  if (node.visibility === 'meta' && !showMeta) return 'locked';

  // Check prerequisites
  const prereqGroups = prerequisites[nodeId];
  if (prereqGroups) {
    const satisfied = Object.values(prereqGroups).some(group =>
      group.every(reqId => investedNodes.has(reqId))
    );
    if (!satisfied) return 'locked';
  }

  // Check gate requirements
  const gateReqs = gateRequirements[nodeId];
  if (gateReqs) {
    for (const req of gateReqs) {
      const depth = countInvestedDepth(req.required_type_id);
      if (depth < req.required_depth) return 'locked';
    }
  }

  // Check affordability
  const nodeCosts = costs[nodeId] || [];
  const canAfford = nodeCosts.every(c => (xpBudget[c.type_id] || 0) >= c.amount);
  return canAfford ? 'available' : 'expensive';
}

function countInvestedDepth(typeId) {
  let count = 0;
  for (const id of investedNodes) {
    const n = nodes[id];
    if (n && n.type_id === typeId) count++;
  }
  return count;
}

function investNode(nodeId) {
  if (getNodeState(nodeId) !== 'available') return;

  const nodeCosts = costs[nodeId] || [];
  for (const c of nodeCosts) {
    xpBudget[c.type_id] = (xpBudget[c.type_id] || 0) - c.amount;
  }

  investedNodes.add(nodeId);
  refreshAllStates();
  updateXpDisplay();
}

function refreshAllStates() {
  // Batch updates for performance
  cy.startBatch();

  // Update nodes
  for (const node of Object.values(nodes)) {
    const state = getNodeState(node.id);
    const cyNode = cy.getElementById(`n${node.id}`);
    if (!cyNode.length) continue;
    cyNode.data('state', state);

    if (node.visibility === 'meta') {
      if (!showMeta) {
        cyNode.addClass('meta-hidden');
      } else {
        cyNode.removeClass('meta-hidden');
      }
    }
  }

  // Update edges
  cy.edges().forEach(edge => {
    const fromId = edge.data('fromId');
    const toId = edge.data('toId');
    const fromNode = nodes[fromId];
    const toNode = nodes[toId];

    // Meta-hidden edges
    if ((!showMeta && fromNode?.visibility === 'meta') ||
        (!showMeta && toNode?.visibility === 'meta')) {
      edge.addClass('meta-hidden');
    } else {
      edge.removeClass('meta-hidden');
    }

    const fromInvested = investedNodes.has(fromId);
    const toInvested = investedNodes.has(toId);

    edge.removeClass('partial invested');
    if (fromInvested && toInvested) {
      edge.addClass('invested');
      edge.style('line-color', fromNode?.type_color || '#888');
    } else if (fromInvested) {
      edge.addClass('partial');
      edge.style('line-color', fromNode?.type_color || '#555');
    } else {
      edge.style('line-color', '#1a1a2e');
    }
  });

  cy.endBatch();

  const invested = investedNodes.size;
  const total = Object.keys(nodes).length;
  document.getElementById('stats').textContent = `${invested}/${total} invested`;
}

function resetInvestments() {
  investedNodes.clear();
  for (const typeId of Object.keys(xpBudgetMax)) {
    xpBudget[typeId] = xpBudgetMax[typeId];
  }
  refreshAllStates();
  updateXpDisplay();
}

// =============================================
// Controls
// =============================================

function initControls() {
  const container = document.getElementById('xp-sliders');
  container.innerHTML = '';

  const primaryTypes = Object.values(types)
    .filter(t => t.tier === 'primary')
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const type of primaryTypes) {
    const defaultXP = 200;
    xpBudget[type.id] = defaultXP;
    xpBudgetMax[type.id] = defaultXP;

    const group = document.createElement('div');
    group.className = 'xp-group';
    group.innerHTML = `
      <span class="xp-label" style="color:${type.color}">${type.name}</span>
      <input type="range" class="xp-slider" min="0" max="500" value="${defaultXP}"
             data-type-id="${type.id}" style="accent-color:${type.color}">
      <span class="xp-value" id="xp-val-${type.id}" style="color:${type.color}">${defaultXP}</span>
    `;
    container.appendChild(group);

    const slider = group.querySelector('.xp-slider');
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value);
      xpBudgetMax[type.id] = val;
      const spent = calculateSpent(type.id);
      xpBudget[type.id] = Math.max(0, val - spent);
      updateXpDisplay();
      refreshAllStates();
    });
  }

  document.getElementById('btn-meta').classList.add('active');
  document.getElementById('btn-meta').addEventListener('click', () => {
    showMeta = !showMeta;
    document.getElementById('btn-meta').classList.toggle('active', showMeta);
    refreshAllStates();
  });

  document.getElementById('btn-reset').addEventListener('click', resetInvestments);
  document.getElementById('btn-fit').addEventListener('click', () => cy.fit(undefined, 40));
}

function calculateSpent(typeId) {
  let spent = 0;
  for (const nodeId of investedNodes) {
    for (const c of (costs[nodeId] || [])) {
      if (c.type_id === typeId) spent += c.amount;
    }
  }
  return spent;
}

function updateXpDisplay() {
  for (const [typeId, remaining] of Object.entries(xpBudget)) {
    const el = document.getElementById(`xp-val-${typeId}`);
    if (el) el.textContent = remaining;
  }
}

// =============================================
// Tooltip
// =============================================

function showTooltip(nodeId, event) {
  const node = nodes[nodeId];
  if (!node) return;

  const catColor = CATEGORY_COLORS[node.category] || '#888';
  let html = `<span class="tt-cat" style="background:${hexToRgba(catColor, 0.2)};color:${catColor}">${node.category}</span>`;
  html += `<div class="tt-name" style="color:${node.type_color || '#e0e0e0'}">${node.name}</div>`;
  if (node.description) html += `<div class="tt-desc">${node.description}</div>`;
  if (node.flavor_text) html += `<div class="tt-flavor">"${node.flavor_text}"</div>`;

  const nodeCosts = costs[nodeId];
  if (nodeCosts && nodeCosts.length > 0) {
    html += '<div class="tt-section">';
    for (const c of nodeCosts) {
      html += `<div><span class="tt-cost-badge" style="color:${c.type_color};border-color:${hexToRgba(c.type_color, 0.4)}">${c.amount} ${c.type_name}</span></div>`;
    }
    html += '</div>';
  }

  const prereqs = prerequisites[nodeId];
  if (prereqs) {
    const prereqStr = Object.values(prereqs).map(g =>
      g.map(id => nodes[id]?.name || '?').join(' + ')
    ).join(' OR ');
    html += `<div class="tt-section" style="color:#888;font-size:11px">Requires: ${prereqStr}</div>`;
  }

  const nodeEffects = effects[nodeId];
  if (nodeEffects && nodeEffects.length > 0) {
    html += '<div class="tt-section">';
    for (const e of nodeEffects) {
      const cls = e.effect_type === 'unlock_secondary' ? 'tt-effect unlock' : 'tt-effect';
      html += `<div class="${cls}">${e.description}</div>`;
    }
    html += '</div>';
  }

  const gateReqs = gateRequirements[nodeId];
  if (gateReqs && gateReqs.length > 0) {
    const reqStr = gateReqs.map(g =>
      `<strong style="color:${g.type_color}">${g.type_name}</strong> depth ${g.required_depth}`
    ).join(' + ');
    html += `<div class="tt-gate">Gate: ${reqStr}</div>`;
  }

  if (node.meta_unlock_id && metaUnlockMap[node.meta_unlock_id]) {
    html += `<div class="tt-meta">Revealed by: ${metaUnlockMap[node.meta_unlock_id].name}</div>`;
  }

  const state = getNodeState(nodeId);
  if (state === 'invested') html += `<div style="color:#5dde5d;font-size:10px;margin-top:4px">Invested</div>`;
  else if (state === 'available') html += `<div style="color:#F4D03F;font-size:10px;margin-top:4px">Click to invest</div>`;

  tooltip.innerHTML = html;
  tooltip.style.display = 'block';

  const pad = 16;
  let tx = event.originalEvent.clientX + pad;
  let ty = event.originalEvent.clientY + pad;
  tooltip.style.left = tx + 'px';
  tooltip.style.top = ty + 'px';

  // Clamp after rendering
  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    if (tx + rect.width > window.innerWidth - pad) tx = event.originalEvent.clientX - rect.width - pad;
    if (ty + rect.height > window.innerHeight - pad) ty = event.originalEvent.clientY - rect.height - pad;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  });
}

function hideTooltip() {
  tooltip.style.display = 'none';
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(128,128,128,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =============================================
// Init
// =============================================

async function init() {
  tooltip = document.getElementById('tooltip');

  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`,
    });

    const response = await fetch('/wizard_game.db');
    if (!response.ok) throw new Error(`DB fetch failed (${response.status}). Run database/build.py first.`);
    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));

    loadData(db);
    db.close();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    initControls();

    // Build Cytoscape
    cy = cytoscape({
      container: document.getElementById('cy'),
      elements: buildElements(),
      style: buildStyle(),
      layout: { name: 'preset' }, // positions set per-node
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: true, // prevent dragging nodes
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Events
    cy.on('tap', 'node[!isLabel]', (evt) => {
      const nodeId = evt.target.data('nodeId');
      investNode(nodeId);
    });

    cy.on('mouseover', 'node[!isLabel]', (evt) => {
      const nodeId = evt.target.data('nodeId');
      showTooltip(nodeId, evt);
    });

    cy.on('mouseout', 'node[!isLabel]', () => hideTooltip());

    refreshAllStates();
    cy.fit(undefined, 40);
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    errEl.style.display = 'block';
    errEl.textContent = err.message;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', init);
