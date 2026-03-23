/**
 * Roguelike Progression Design Explorer
 * Visualizes the per-run skill tree, meta-unlocks, research desk, and mastery levels.
 */

// === Data ===
let types = {};
let nodes = {};
let costs = {};
let prerequisites = {};
let effects = {};
let gateRequirements = {};
let metaUnlocks = [];
let metaConditions = {};
let research = [];
let masteryLevels = [];

// Meta-unlock id -> object for quick lookup
let metaUnlockMap = {};

// === Filters ===
let viewMode = 'all'; // 'all' | 'always' | 'meta'
let typeFilters = new Set(); // empty = all types shown
let searchQuery = '';

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
  // Types
  queryAll(db, `SELECT id, name, color, tier, sort_order FROM types`)
    .forEach(t => types[t.id] = t);

  // Nodes
  queryAll(db, `SELECT n.id, n.name, n.description, n.flavor_text, n.type_id,
    n.category, n.tier, n.branch, n.visibility, n.meta_unlock_id, n.sort_order,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node n
    LEFT JOIN types t ON n.type_id = t.id
    ORDER BY n.sort_order`)
    .forEach(n => nodes[n.id] = n);

  // Costs
  queryAll(db, `SELECT nc.node_id, nc.type_id, nc.amount, t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node_cost nc
    JOIN types t ON nc.type_id = t.id`)
    .forEach(c => { (costs[c.node_id] ??= []).push(c); });

  // Prerequisites
  queryAll(db, `SELECT node_id, required_node_id, prerequisite_group
    FROM prototype_roguelike_node_prerequisite ORDER BY prerequisite_group`)
    .forEach(p => {
      prerequisites[p.node_id] ??= {};
      (prerequisites[p.node_id][p.prerequisite_group] ??= []).push(p.required_node_id);
    });

  // Effects
  queryAll(db, `SELECT ne.node_id, ne.effect_type, ne.target_type_id, ne.value,
    ne.description, t.name AS target_type_name, t.color AS target_type_color
    FROM prototype_roguelike_node_effect ne
    LEFT JOIN types t ON ne.target_type_id = t.id`)
    .forEach(e => { (effects[e.node_id] ??= []).push(e); });

  // Gate requirements
  queryAll(db, `SELECT gr.gate_node_id, gr.required_type_id, gr.required_depth,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_gate_requirement gr
    JOIN types t ON gr.required_type_id = t.id`)
    .forEach(g => { (gateRequirements[g.gate_node_id] ??= []).push(g); });

  // Meta-unlocks
  metaUnlocks = queryAll(db, `SELECT mu.id, mu.name, mu.description, mu.layer, mu.category,
    mu.target_type_id, t.name AS target_type_name, t.color AS target_type_color
    FROM prototype_roguelike_meta_unlock mu
    LEFT JOIN types t ON mu.target_type_id = t.id
    ORDER BY mu.layer, mu.id`);
  metaUnlocks.forEach(mu => metaUnlockMap[mu.id] = mu);

  // Meta-conditions
  queryAll(db, `SELECT mc.meta_unlock_id, mc.condition_type, mc.condition_type_id,
    mc.condition_value, mc.condition_type_b_id, mc.description,
    t1.name AS type_name, t2.name AS type_b_name
    FROM prototype_roguelike_meta_condition mc
    LEFT JOIN types t1 ON mc.condition_type_id = t1.id
    LEFT JOIN types t2 ON mc.condition_type_b_id = t2.id`)
    .forEach(mc => { (metaConditions[mc.meta_unlock_id] ??= []).push(mc); });

  // Research
  research = queryAll(db, `SELECT r.id, r.name, r.description, r.meta_unlock_id,
    r.insight_cost, r.material_cost, r.max_purchases, r.sort_order,
    mu.name AS meta_unlock_name
    FROM prototype_roguelike_research r
    LEFT JOIN prototype_roguelike_meta_unlock mu ON r.meta_unlock_id = mu.id
    ORDER BY r.sort_order`);

  // Mastery levels
  masteryLevels = queryAll(db, `SELECT level, name, description, modifier_type, modifier_value
    FROM prototype_roguelike_mastery_level ORDER BY level`);
}

// =============================================
// Filters
// =============================================

function initFilters() {
  // View mode toggles
  document.querySelectorAll('#view-toggles .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#view-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewMode = btn.dataset.view;
      applyFilters();
    });
  });

  // Type filter buttons (built from primary types in data)
  const typeFilterContainer = document.getElementById('type-filters');
  const primaryTypes = Object.values(types).filter(t => t.tier === 'primary').sort((a, b) => a.sort_order - b.sort_order);
  primaryTypes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn active';
    btn.dataset.typeId = t.id;
    btn.textContent = t.name;
    btn.style.color = t.color;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        typeFilters.delete(t.id);
      } else {
        typeFilters.add(t.id);
      }
      applyFilters();
    });
    typeFilterContainer.appendChild(btn);
  });

  // Search
  const searchInput = document.getElementById('search');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = searchInput.value.toLowerCase().trim();
      applyFilters();
    }, 150);
  });
}

function applyFilters() {
  const allNodes = document.querySelectorAll('#tree .node');
  let visible = 0;

  allNodes.forEach(el => {
    const nodeId = parseInt(el.dataset.nodeId);
    const node = nodes[nodeId];
    if (!node) return;

    let show = true;

    // View mode filter
    if (viewMode === 'always' && node.visibility === 'meta') show = false;
    if (viewMode === 'meta' && node.visibility === 'always') show = false;

    // Type filter (hide if the node's primary parent type is deselected)
    if (typeFilters.size > 0 && typeFilters.has(node.type_id)) show = false;

    // Search filter
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery) &&
        !(node.description || '').toLowerCase().includes(searchQuery)) {
      show = false;
    }

    el.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Also hide type columns where all nodes are hidden
  document.querySelectorAll('#tree .type-column').forEach(col => {
    const visibleNodes = col.querySelectorAll('.node:not([style*="display: none"])');
    col.style.display = visibleNodes.length > 0 ? '' : 'none';
  });

  document.getElementById('stats').textContent = `${visible} / ${Object.keys(nodes).length} nodes`;
}

// =============================================
// Tree rendering
// =============================================

function rebuildAll() {
  rebuildTree();
  rebuildMetaPanel();
  rebuildResearchTable();
  rebuildMasteryTable();
  applyFilters();
}

function rebuildTree() {
  const container = document.getElementById('tree');
  container.innerHTML = '';

  // Group nodes by the primary type they belong to.
  // Cross-type branch nodes (e.g., Fire→Earth Attunement) have type_id of the target type,
  // so we group by branch prefix for display. For simplicity, group by type_id.
  const typeGroups = {};
  Object.values(nodes).forEach(n => {
    const tid = n.type_id || 0;
    (typeGroups[tid] ??= []).push(n);
  });

  // Sort type groups by the type's sort_order
  const sortedTypeIds = Object.keys(typeGroups)
    .map(Number)
    .sort((a, b) => (types[a]?.sort_order || 999) - (types[b]?.sort_order || 999));

  for (const typeId of sortedTypeIds) {
    const type = types[typeId];
    if (!type) continue;
    const typeNodes = typeGroups[typeId].sort((a, b) => a.sort_order - b.sort_order);
    buildTypeColumn(type, typeNodes, container);
  }
}

function buildTypeColumn(type, typeNodes, container) {
  const col = document.createElement('div');
  col.className = 'type-column';
  col.dataset.typeId = type.id;

  // Header
  const header = document.createElement('div');
  header.className = 'type-header';
  header.style.background = hexToRgba(type.color, 0.15);
  header.style.color = type.color;
  header.style.border = `1px solid ${hexToRgba(type.color, 0.3)}`;
  header.innerHTML = `${type.name}<div class="subtitle">${typeNodes.length} nodes</div>`;
  col.appendChild(header);

  const nodeList = document.createElement('div');
  nodeList.className = 'node-list';

  // Group by branch within the type
  let lastBranch = null;
  for (const node of typeNodes) {
    // Branch label
    if (node.branch !== lastBranch && node.branch !== 'core') {
      const branchLabel = document.createElement('div');
      branchLabel.className = 'branch-label';
      branchLabel.textContent = formatBranch(node.branch);
      nodeList.appendChild(branchLabel);
    }
    lastBranch = node.branch;

    nodeList.appendChild(buildNode(node, type));
  }

  col.appendChild(nodeList);
  container.appendChild(col);
}

function buildNode(node, type) {
  const el = document.createElement('div');
  el.className = 'node';
  el.dataset.nodeId = node.id;

  if (node.visibility === 'meta') el.classList.add('meta-gated');
  if (node.category === 'gate') el.classList.add('gate-node');

  // Visibility badge
  const visBadge = `<span class="node-visibility ${node.visibility === 'meta' ? 'vis-meta' : 'vis-always'}">${node.visibility}</span>`;

  // Top row: category + name
  const catClass = `cat-${node.category}`;
  let html = `<div class="node-top">
    <span class="node-category ${catClass}">${node.category}</span>
    <span class="node-name">${node.name}</span>
  </div>${visBadge}`;

  // Description
  if (node.description) {
    html += `<div class="node-desc">${node.description}</div>`;
  }

  // Flavor text
  if (node.flavor_text) {
    html += `<div class="node-flavor">"${node.flavor_text}"</div>`;
  }

  // Costs
  const nodeCosts = costs[node.id];
  if (nodeCosts && nodeCosts.length > 0) {
    html += '<div class="node-meta">';
    for (const c of nodeCosts) {
      html += `<span class="node-cost" style="color:${c.type_color};border-color:${hexToRgba(c.type_color, 0.3)}">${c.amount} ${c.type_name}</span>`;
    }
    html += '</div>';
  }

  // Prerequisites
  const nodePrereqs = prerequisites[node.id];
  if (nodePrereqs) {
    const groups = Object.values(nodePrereqs);
    const prereqNames = groups.map(group =>
      group.map(rid => nodes[rid]?.name || '?').join(' + ')
    ).join(' OR ');
    html += `<div class="node-prereq">Requires: ${prereqNames}</div>`;
  }

  // Effects
  const nodeEffects = effects[node.id];
  if (nodeEffects && nodeEffects.length > 0) {
    html += '<div class="node-effects">';
    for (const e of nodeEffects) {
      let cls = 'node-effect';
      if (e.effect_type === 'unlock_secondary') cls += ' unlock-effect';
      if (e.effect_type === 'spell_pool') cls += ' spell-effect';
      html += `<div class="${cls}">${e.description}</div>`;
    }
    html += '</div>';
  }

  // Gate requirements
  const gateReqs = gateRequirements[node.id];
  if (gateReqs && gateReqs.length > 0) {
    const reqStr = gateReqs.map(g =>
      `<strong style="color:${g.type_color}">${g.type_name}</strong> depth ${g.required_depth}`
    ).join(' + ');
    html += `<div class="gate-reqs">Gate requires: ${reqStr}</div>`;
  }

  // Meta-unlock badge (which unlock reveals this node)
  if (node.meta_unlock_id && metaUnlockMap[node.meta_unlock_id]) {
    const mu = metaUnlockMap[node.meta_unlock_id];
    html += `<div class="meta-unlock-badge">Revealed by: ${mu.name}</div>`;
  }

  el.innerHTML = html;
  return el;
}

function formatBranch(branch) {
  if (!branch) return '';
  return branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================
// Sidebar: Meta-Unlocks
// =============================================

function rebuildMetaPanel() {
  const container = document.getElementById('meta-panel');
  container.innerHTML = '';

  // Group by layer
  const layers = {};
  metaUnlocks.forEach(mu => {
    (layers[mu.layer] ??= []).push(mu);
  });

  const layerNames = {
    1: 'Layer 1: Mono-Type Mastery',
    2: 'Layer 2: Cross-Type Discovery',
    3: 'Layer 3: Secondary Emergence',
    4: 'Layer 4: Tertiary Depths',
    5: 'Layer 5: Augmenters',
  };

  for (const [layer, unlocks] of Object.entries(layers)) {
    const section = document.createElement('div');
    section.className = 'layer-section';

    const header = document.createElement('div');
    header.className = 'layer-header';
    header.innerHTML = `<span class="arrow">&#9660;</span> ${layerNames[layer] || `Layer ${layer}`} (${unlocks.length})`;
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      contents.classList.toggle('collapsed');
    });
    section.appendChild(header);

    const contents = document.createElement('div');
    contents.className = 'layer-contents';

    for (const mu of unlocks) {
      const card = document.createElement('div');
      card.className = 'meta-card';
      if (mu.target_type_color) {
        card.style.borderLeftColor = mu.target_type_color;
      }

      let html = `<div class="meta-card-name">
        <span class="meta-card-badge badge-${mu.category}">${mu.category.replace('_', ' ')}</span>
        ${mu.name}
      </div>`;
      html += `<div class="meta-card-desc">${mu.description}</div>`;

      // Conditions
      const conds = metaConditions[mu.id];
      if (conds && conds.length > 0) {
        html += '<div class="meta-card-conditions">';
        for (const c of conds) {
          html += `<div>${c.description}</div>`;
        }
        html += '</div>';
      }

      // Nodes revealed by this unlock
      const revealedNodes = Object.values(nodes).filter(n => n.meta_unlock_id === mu.id);
      if (revealedNodes.length > 0) {
        html += `<div class="meta-card-reveals">Reveals ${revealedNodes.length} node(s): ${revealedNodes.map(n => n.name).join(', ')}</div>`;
      }

      card.innerHTML = html;
      contents.appendChild(card);
    }

    section.appendChild(contents);
    container.appendChild(section);
  }
}

// =============================================
// Sidebar: Research Desk
// =============================================

function rebuildResearchTable() {
  const container = document.getElementById('research-section');
  if (research.length === 0) {
    container.innerHTML = '<div style="color:#555;font-size:12px;font-style:italic">No research items</div>';
    return;
  }

  let html = `<table class="data-table">
    <tr>
      <th>Name</th>
      <th>Insight</th>
      <th>Materials</th>
      <th>Max</th>
      <th>Unlocks</th>
    </tr>`;

  for (const r of research) {
    html += `<tr>
      <td>${r.name}<br><span style="color:#666;font-size:10px">${r.description}</span></td>
      <td class="cost-insight">${r.insight_cost}</td>
      <td class="cost-material">${r.material_cost || '-'}</td>
      <td>${r.max_purchases}</td>
      <td style="color:#F39C12;font-size:10px">${r.meta_unlock_name || '-'}</td>
    </tr>`;
  }

  html += '</table>';
  container.innerHTML = html;
}

// =============================================
// Sidebar: Mastery Levels
// =============================================

function rebuildMasteryTable() {
  const container = document.getElementById('mastery-section');
  if (masteryLevels.length === 0) {
    container.innerHTML = '<div style="color:#555;font-size:12px;font-style:italic">No mastery levels</div>';
    return;
  }

  let html = `<table class="data-table">
    <tr><th>Lv</th><th>Name</th><th>Modifier</th></tr>`;

  for (const m of masteryLevels) {
    const modDisplay = formatModifier(m.modifier_type, m.modifier_value);
    html += `<tr>
      <td class="mastery-level-num">${m.level}</td>
      <td>${m.name}<br><span style="color:#666;font-size:10px">${m.description}</span></td>
      <td style="font-size:10px;color:#dea05d">${modDisplay}</td>
    </tr>`;
  }

  html += '</table>';
  container.innerHTML = html;
}

function formatModifier(type, value) {
  const labels = {
    enemy_damage_bonus: `+${Math.round(value * 100)}% counter damage`,
    starting_energy_penalty: `-${value} starting energy`,
    elite_restriction: 'counter-type elites',
    xp_cost_multiplier: `${Math.round(value * 100)}% XP costs`,
    boss_phase: `${value} boss phases`,
    enemy_count_bonus: `+${value} enemy per group`,
    shop_cost_multiplier: `${Math.round(value * 100)}% shop prices`,
    map_restriction: 'fewer rest nodes',
    enemy_moveset_enhance: 'enhanced movesets',
    double_boss: 'double boss fight',
  };
  return labels[type] || `${type}: ${value}`;
}

// =============================================
// Utility
// =============================================

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
    document.getElementById('app').style.flexDirection = 'column';

    initFilters();
    rebuildAll();
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    errEl.style.display = 'block';
    errEl.textContent = err.message;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', init);
