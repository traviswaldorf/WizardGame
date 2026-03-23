// =============================================
// Data (loaded from DB)
// =============================================
let types = {};       // id -> { id, name, color, tier, sort_order }
let nodes = {};       // id -> { id, name, description, flavor_text, type_id, category, tier, era, historical_date, scientist, sort_order }
let costs = {};       // node_id -> [{ type_id, amount }]
let prerequisites = {};  // node_id -> { group_num: [required_node_ids] }
let effects = {};     // node_id -> [{ effect_type, target_type_id, target_node_id, value, description }]

// =============================================
// Game State
// =============================================
const gameState = {
  energy: {},          // typeId -> current amount (float)
  unlocked: new Set(), // unlocked node ids
  lastTick: Date.now(),
};

let viewMode = 'all';
let detailMode = 'full';
let clickMultiplier = 1;  // adjustable via slider
let dirty = { tree: true, sidebar: true }; // track what needs rebuild

const SAVE_KEY = 'wizardGame_progression';
const TICK_MS = 100;
const ERA_LABELS = {
  prehistoric: 'Prehistoric', ancient: 'Ancient', classical: 'Classical',
  medieval: 'Medieval', early_modern: 'Early Modern', industrial: 'Industrial',
  modern: 'Modern', contemporary: 'Contemporary'
};
const TYPE_ORDER = ['Earth', 'Water', 'Air', 'Fire', 'Metal', 'Plant', 'Ice', 'Electric'];

// =============================================
// Init
// =============================================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const sqlPromise = initSqlJs({
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`
    });
    const dataPromise = fetch('/wizard_game.db');
    const [SQL, response] = await Promise.all([sqlPromise, dataPromise]);
    if (!response.ok) throw new Error(`Database fetch failed (${response.status}). Run build.py first and serve via HTTP.`);

    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));
    loadData(db);
    db.close();

    if (!loadGame()) {
      initStartingState();
    }

    initToggles();
    rebuildAll();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('app').style.flexDirection = 'column';

    // Game loops
    setInterval(gameTick, TICK_MS);
    requestAnimationFrame(displayLoop);

    // Auto-save
    setInterval(saveGame, 15000);
    window.addEventListener('beforeunload', saveGame);

  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    console.error(err);
  }
}

// =============================================
// Data Loading
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

function loadData(db) {
  queryAll(db, `SELECT id, name, color, tier, sort_order FROM types`)
    .forEach(t => types[t.id] = t);

  queryAll(db, `SELECT id, name, description, flavor_text, type_id, category, tier, era,
    historical_date, scientist, superseded_by_id, sort_order FROM prototype_incremental_node ORDER BY sort_order`)
    .forEach(n => nodes[n.id] = n);

  queryAll(db, `SELECT node_id, type_id, amount FROM prototype_incremental_cost`)
    .forEach(c => { (costs[c.node_id] ??= []).push(c); });

  queryAll(db, `SELECT node_id, required_node_id, prerequisite_group FROM prototype_incremental_prerequisite ORDER BY prerequisite_group`)
    .forEach(p => {
      prerequisites[p.node_id] ??= {};
      (prerequisites[p.node_id][p.prerequisite_group] ??= []).push(p.required_node_id);
    });

  queryAll(db, `SELECT node_id, effect_type, target_type_id, target_node_id, value, description FROM prototype_incremental_effect`)
    .forEach(e => { (effects[e.node_id] ??= []).push(e); });
}

// =============================================
// Game Logic
// =============================================
function initStartingState() {
  const earthType = Object.values(types).find(t => t.name === 'Earth');
  if (!earthType) return;
  // Initialize energy for Earth
  gameState.energy[earthType.id] = 0;
  // Auto-unlock free Earth nodes
  Object.values(nodes).forEach(n => {
    const totalCost = (costs[n.id] || []).reduce((s, c) => s + c.amount, 0);
    if (totalCost === 0 && n.type_id === earthType.id) {
      gameState.unlocked.add(n.id);
    }
  });
}

function initTypeStartingNodes(typeId) {
  gameState.energy[typeId] = gameState.energy[typeId] || 0;
  Object.values(nodes).forEach(n => {
    const totalCost = (costs[n.id] || []).reduce((s, c) => s + c.amount, 0);
    if (totalCost === 0 && n.type_id === typeId) {
      gameState.unlocked.add(n.id);
    }
  });
}

function isTypeUnlocked(typeId) {
  const type = types[typeId];
  if (!type) return false;
  if (type.name === 'Earth') return true;
  for (const nodeId of gameState.unlocked) {
    for (const e of (effects[nodeId] || [])) {
      if (e.effect_type === 'unlock_type' && e.target_type_id === typeId) return true;
    }
  }
  return false;
}

function getUnlockedTypeIds() {
  return Object.keys(types).map(Number).filter(id => isTypeUnlocked(id));
}

function arePrereqsMet(nodeId) {
  const groups = prerequisites[nodeId];
  if (!groups) return true;
  return Object.values(groups).some(g => g.every(r => gameState.unlocked.has(r)));
}

function isNodeAvailable(nodeId) {
  if (gameState.unlocked.has(nodeId)) return false;
  const node = nodes[nodeId];
  if (!node) return false;
  // Cross-type gates (type_id=null) are available whenever prereqs are met
  if (node.type_id && !isTypeUnlocked(node.type_id)) return false;
  return arePrereqsMet(nodeId);
}

function canAfford(nodeId) {
  const nodeCosts = costs[nodeId] || [];
  return nodeCosts.every(c => (gameState.energy[c.type_id] || 0) >= c.amount);
}

function getAffordProgress(nodeId) {
  const nodeCosts = costs[nodeId] || [];
  if (nodeCosts.length === 0) return 1;
  let minProgress = 1;
  for (const c of nodeCosts) {
    if (c.amount <= 0) continue;
    const progress = Math.min(1, (gameState.energy[c.type_id] || 0) / c.amount);
    if (progress < minProgress) minProgress = progress;
  }
  return minProgress;
}

function calculateGenerationRate(typeId) {
  let baseGen = 0;
  let multiplierProduct = 1;
  let boostTotal = 0;

  for (const nodeId of gameState.unlocked) {
    const node = nodes[nodeId];
    for (const e of (effects[nodeId] || [])) {
      if (e.target_type_id !== typeId) continue;
      if (e.effect_type === 'generate' && node.category !== 'active') {
        baseGen += e.value;
      } else if (e.effect_type === 'multiply') {
        multiplierProduct *= e.value;
      } else if (e.effect_type === 'boost') {
        boostTotal += e.value;
      }
    }
  }

  return baseGen * multiplierProduct + boostTotal;
}

function purchaseNode(nodeId) {
  if (!isNodeAvailable(nodeId) || !canAfford(nodeId)) return;

  // Deduct costs
  for (const c of (costs[nodeId] || [])) {
    gameState.energy[c.type_id] -= c.amount;
  }

  gameState.unlocked.add(nodeId);

  // Handle unlock_type effects
  for (const e of (effects[nodeId] || [])) {
    if (e.effect_type === 'unlock_type') {
      initTypeStartingNodes(e.target_type_id);
    }
  }

  dirty.tree = true;
  dirty.sidebar = true;
  rebuildAll();
  saveGame();
}

function handleActiveClick(nodeId, event) {
  for (const e of (effects[nodeId] || [])) {
    if (e.effect_type === 'generate') {
      const amount = e.value * clickMultiplier;
      gameState.energy[e.target_type_id] = (gameState.energy[e.target_type_id] || 0) + amount;
      const type = types[e.target_type_id];
      spawnFloat(event, `+${formatNumber(amount)}`, type?.color || '#fff');
    }
  }
}

function resetGame() {
  if (!confirm('Reset all progress?')) return;
  localStorage.removeItem(SAVE_KEY);
  gameState.energy = {};
  gameState.unlocked = new Set();
  gameState.lastTick = Date.now();
  initStartingState();
  dirty.tree = true;
  dirty.sidebar = true;
  rebuildAll();
}

// =============================================
// Game Loop
// =============================================
function gameTick() {
  const now = Date.now();
  const dt = (now - gameState.lastTick) / 1000;
  gameState.lastTick = now;

  for (const typeId of getUnlockedTypeIds()) {
    const rate = calculateGenerationRate(typeId);
    if (rate > 0) {
      gameState.energy[typeId] = (gameState.energy[typeId] || 0) + rate * dt;
    }
  }
}

// =============================================
// Display Loop (RAF)
// =============================================
function displayLoop() {
  updateResourceBar();
  updateAffordability();
  requestAnimationFrame(displayLoop);
}

function updateResourceBar() {
  const bar = document.getElementById('resource-bar');
  const typeIds = getUnlockedTypeIds().sort((a, b) => types[a].sort_order - types[b].sort_order);

  // Create cards if count changed
  if (bar.children.length !== typeIds.length) {
    bar.innerHTML = '';
    for (const typeId of typeIds) {
      const type = types[typeId];
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.style.borderLeftColor = type.color;
      card.dataset.typeId = typeId;
      card.innerHTML = `
        <div class="resource-name" style="color:${type.color}">${type.name}</div>
        <div class="resource-amount" style="color:${type.color}">0</div>
        <div class="resource-rate">+0/s</div>
      `;
      bar.appendChild(card);
    }
  }

  // Update values
  for (const card of bar.children) {
    const typeId = parseInt(card.dataset.typeId);
    const amount = gameState.energy[typeId] || 0;
    const rate = calculateGenerationRate(typeId);
    card.querySelector('.resource-amount').textContent = formatNumber(amount);
    card.querySelector('.resource-rate').textContent = formatRate(rate);
  }
}

function updateAffordability() {
  // Update cost colors and progress bars on available nodes
  document.querySelectorAll('.node.available').forEach(el => {
    const nodeId = parseInt(el.dataset.nodeId);
    if (!nodeId) return;

    const affordable = canAfford(nodeId);
    el.classList.toggle('affordable', affordable);

    // Update cost badges
    el.querySelectorAll('.node-cost').forEach(costEl => {
      const typeId = parseInt(costEl.dataset.typeId);
      const amount = parseInt(costEl.dataset.amount);
      const have = gameState.energy[typeId] || 0;
      costEl.classList.toggle('can-afford', have >= amount);
      costEl.classList.toggle('cant-afford', have < amount);
    });

    // Update progress bar
    const progressEl = el.querySelector('.cost-progress');
    if (progressEl) {
      const progress = getAffordProgress(nodeId);
      progressEl.style.width = (progress * 100) + '%';
    }
  });
}

// =============================================
// View Building
// =============================================
function initToggles() {
  document.querySelectorAll('.toggle-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn[data-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewMode = btn.dataset.mode;
      dirty.tree = true;
      rebuildTree();
    });
  });

  document.querySelectorAll('.toggle-btn[data-detail]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn[data-detail]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      detailMode = btn.dataset.detail;
      dirty.tree = true;
      rebuildTree();
    });
  });

  document.getElementById('reset-btn').addEventListener('click', resetGame);

  // Click multiplier slider (powers of 10: 0=x1, 1=x10, 2=x100, etc.)
  const slider = document.getElementById('click-mult');
  const sliderVal = document.getElementById('click-mult-val');
  slider.addEventListener('input', () => {
    const power = parseInt(slider.value);
    clickMultiplier = Math.pow(10, power);
    sliderVal.textContent = power === 0 ? 'x1' : 'x' + formatNumber(clickMultiplier);
    rebuildSidebar(); // update click button labels
  });
}

function rebuildAll() {
  rebuildSidebar();
  rebuildTree();
  updateStats();
}

// --- Sidebar ---
function rebuildSidebar() {
  buildActiveButtons();
  buildProductionList('generator-list', 'generate', 'active');
  buildMultiplierList();
  buildBoostList();
}

function buildActiveButtons() {
  const container = document.getElementById('active-buttons');
  container.innerHTML = '';

  const activeNodes = [...gameState.unlocked]
    .map(id => nodes[id])
    .filter(n => n && n.category === 'active');

  if (activeNodes.length === 0) {
    container.innerHTML = '<div class="sidebar-empty">None yet</div>';
    return;
  }

  for (const node of activeNodes) {
    const type = types[node.type_id];
    const genEffect = (effects[node.id] || []).find(e => e.effect_type === 'generate');
    if (!genEffect) continue;

    const targetType = types[genEffect.target_type_id];
    const btn = document.createElement('button');
    btn.className = 'active-btn';
    btn.style.color = targetType?.color || '#fff';
    btn.style.borderColor = hexToRgba(targetType?.color || '#fff', 0.4);
    btn.style.background = hexToRgba(targetType?.color || '#fff', 0.08);
    const clickAmount = genEffect.value * clickMultiplier;
    btn.innerHTML = `
      <span>${node.name}</span>
      <span class="click-value">+${formatNumber(clickAmount)} ${targetType?.name || ''}</span>
    `;
    btn.addEventListener('click', (e) => handleActiveClick(node.id, e));
    container.appendChild(btn);
  }
}

function buildProductionList(containerId, effectType, excludeCategory) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  // Group by target type
  const byType = {};
  for (const nodeId of gameState.unlocked) {
    const node = nodes[nodeId];
    if (excludeCategory && node.category === excludeCategory) continue;
    for (const e of (effects[nodeId] || [])) {
      if (e.effect_type !== effectType) continue;
      const typeId = e.target_type_id;
      (byType[typeId] ??= []).push({ node, effect: e });
    }
  }

  if (Object.keys(byType).length === 0) {
    container.innerHTML = '<div class="sidebar-empty">None yet</div>';
    return;
  }

  for (const typeId of Object.keys(byType).sort((a, b) => types[a]?.sort_order - types[b]?.sort_order)) {
    const type = types[typeId];
    const items = byType[typeId];
    let total = 0;

    for (const { node, effect } of items) {
      total += effect.value;
      const item = document.createElement('div');
      item.className = 'prod-item';
      item.innerHTML = `
        <span class="prod-name">${node.name}</span>
        <span class="prod-value" style="color:${type?.color || '#888'}">+${effect.value}/s</span>
      `;
      container.appendChild(item);
    }

    const totalEl = document.createElement('div');
    totalEl.className = 'prod-total';
    totalEl.innerHTML = `
      <span style="color:${type?.color || '#888'}">${type?.name || '?'} total</span>
      <span style="color:${type?.color || '#888'}">+${formatNumber(total)}/s</span>
    `;
    container.appendChild(totalEl);
  }
}

function buildMultiplierList() {
  const container = document.getElementById('multiplier-list');
  container.innerHTML = '';

  const items = [];
  for (const nodeId of gameState.unlocked) {
    const node = nodes[nodeId];
    for (const e of (effects[nodeId] || [])) {
      if (e.effect_type === 'multiply') {
        items.push({ node, effect: e });
      }
    }
  }

  if (items.length === 0) {
    container.innerHTML = '<div class="sidebar-empty">None yet</div>';
    return;
  }

  for (const { node, effect } of items) {
    const type = types[effect.target_type_id];
    const item = document.createElement('div');
    item.className = 'prod-item';
    item.innerHTML = `
      <span class="prod-name">${node.name}</span>
      <span class="prod-value" style="color:${type?.color || '#888'}">&times;${effect.value} ${type?.name || ''}</span>
    `;
    container.appendChild(item);
  }
}

function buildBoostList() {
  const container = document.getElementById('boost-list');
  container.innerHTML = '';

  const items = [];
  for (const nodeId of gameState.unlocked) {
    const node = nodes[nodeId];
    for (const e of (effects[nodeId] || [])) {
      if (e.effect_type === 'boost') {
        items.push({ node, effect: e });
      }
    }
  }

  if (items.length === 0) {
    container.innerHTML = '<div class="sidebar-empty">None yet</div>';
    return;
  }

  for (const { node, effect } of items) {
    const type = types[effect.target_type_id];
    const item = document.createElement('div');
    item.className = 'prod-item';
    item.innerHTML = `
      <span class="prod-name">${node.name}</span>
      <span class="prod-value" style="color:${type?.color || '#888'}">+${effect.value}/s ${type?.name || ''}</span>
    `;
    container.appendChild(item);
  }
}

// --- Tree ---
function rebuildTree() {
  const container = document.getElementById('tree');
  container.innerHTML = '';

  const nodesByType = {};
  Object.values(nodes).forEach(n => {
    if (n.type_id) {
      (nodesByType[n.type_id] ??= []).push(n);
    } else {
      // Cross-type gate: place in the column of the type it unlocks
      const unlockEffect = (effects[n.id] || []).find(e => e.effect_type === 'unlock_type');
      if (unlockEffect) {
        (nodesByType[unlockEffect.target_type_id] ??= []).push(n);
      }
    }
  });

  const visibleTypes = TYPE_ORDER
    .map(name => Object.values(types).find(t => t.name === name))
    .filter(t => t && (viewMode === 'all' || isTypeUnlocked(t.id)));

  for (const type of visibleTypes) {
    container.appendChild(buildTypeColumn(type, nodesByType[type.id] || []));
  }

  updateStats();
}

// Track collapsed state per type so it persists across rebuilds
const collapsedTypes = {};

function buildTypeColumn(type, typeNodes) {
  const col = document.createElement('div');
  col.className = 'type-column';

  const header = document.createElement('div');
  header.className = 'type-header';
  header.style.background = hexToRgba(type.color, 0.12);
  header.style.borderLeft = `3px solid ${type.color}`;
  header.style.color = type.color;
  header.innerHTML = `${type.name}<div class="subtitle">${type.tier}</div>`;
  col.appendChild(header);

  const list = document.createElement('div');
  list.className = 'node-list';

  // Separate unlocked from non-unlocked
  const unlockedNodes = typeNodes
    .filter(n => gameState.unlocked.has(n.id))
    .sort((a, b) => a.sort_order - b.sort_order);
  const otherNodes = typeNodes
    .filter(n => !gameState.unlocked.has(n.id));

  // Collapsible unlocked group
  if (unlockedNodes.length > 0) {
    const isCollapsed = !(collapsedTypes[type.id] === true); // default collapsed, expanded only if explicitly true
    const group = document.createElement('div');
    group.className = 'unlocked-group';

    const toggle = document.createElement('button');
    toggle.className = 'unlocked-toggle' + (isCollapsed ? ' collapsed' : '');
    toggle.innerHTML = `
      <span>Unlocked (${unlockedNodes.length})</span>
      <span class="arrow">\u25BC</span>
    `;
    toggle.addEventListener('click', () => {
      const isNowCollapsed = contents.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed', isNowCollapsed);
      collapsedTypes[type.id] = !isNowCollapsed; // store as "is expanded"
    });
    group.appendChild(toggle);

    const contents = document.createElement('div');
    contents.className = 'unlocked-contents' + (isCollapsed ? ' collapsed' : '');
    for (const n of unlockedNodes) {
      contents.appendChild(buildNode(n, type));
    }
    group.appendChild(contents);

    list.appendChild(group);
  }

  // Non-unlocked nodes grouped by tier
  const byTier = {};
  otherNodes.forEach(n => { (byTier[n.tier] ??= []).push(n); });

  for (const tier of Object.keys(byTier).map(Number).sort((a, b) => a - b)) {
    const tierNodes = byTier[tier].sort((a, b) => a.sort_order - b.sort_order);

    // Skip tiers where all nodes are hidden in available mode
    if (viewMode === 'available' && tierNodes.every(n => !isNodeAvailable(n.id))) continue;

    const era = tierNodes[0]?.era;
    const label = document.createElement('div');
    label.className = 'tier-label';
    label.textContent = `Tier ${tier}${era ? ' \u2014 ' + (ERA_LABELS[era] || era) : ''}`;
    list.appendChild(label);

    for (const n of tierNodes) {
      list.appendChild(buildNode(n, type));
    }
  }

  col.appendChild(list);
  return col;
}

function buildNode(node, type) {
  const el = document.createElement('div');
  el.className = 'node';
  el.dataset.nodeId = node.id;

  const isUnlocked = gameState.unlocked.has(node.id);
  const isAvail = isNodeAvailable(node.id);
  const isLocked = !isUnlocked && !isAvail;

  if (isUnlocked) el.classList.add('unlocked');
  else if (isAvail) el.classList.add('available');
  else el.classList.add('locked');

  if (viewMode === 'available' && isLocked) el.classList.add('hidden');

  if (isAvail) {
    el.addEventListener('click', () => purchaseNode(node.id));
    if (canAfford(node.id)) el.classList.add('affordable');
  }

  // Era
  if (node.historical_date) {
    const era = document.createElement('div');
    era.className = 'node-era';
    era.textContent = node.historical_date;
    el.appendChild(era);
  }

  // Top row
  const top = document.createElement('div');
  top.className = 'node-top';

  const catBadge = document.createElement('span');
  catBadge.className = `node-category cat-${node.category}`;
  catBadge.textContent = node.category;
  top.appendChild(catBadge);

  const name = document.createElement('span');
  name.className = 'node-name';
  name.textContent = node.name;
  top.appendChild(name);

  if (isUnlocked) {
    const check = document.createElement('span');
    check.className = 'node-check';
    check.textContent = '\u2713';
    top.appendChild(check);
  }
  el.appendChild(top);

  // Description
  if (detailMode === 'full' && node.description) {
    const desc = document.createElement('div');
    desc.className = 'node-desc';
    desc.textContent = node.description;
    el.appendChild(desc);
  }

  // Flavor
  if (detailMode === 'full' && node.flavor_text) {
    const flavor = document.createElement('div');
    flavor.className = 'node-flavor';
    flavor.textContent = `\u201C${node.flavor_text}\u201D`;
    el.appendChild(flavor);
  }

  // Costs
  const nodeCosts = costs[node.id] || [];
  if (nodeCosts.some(c => c.amount > 0)) {
    const meta = document.createElement('div');
    meta.className = 'node-meta';
    for (const c of nodeCosts.filter(c => c.amount > 0)) {
      const costEl = document.createElement('span');
      costEl.className = 'node-cost';
      costEl.dataset.typeId = c.type_id;
      costEl.dataset.amount = c.amount;
      const costType = types[c.type_id];
      costEl.style.color = costType?.color || '#888';
      costEl.style.borderColor = hexToRgba(costType?.color || '#888', 0.3);
      costEl.textContent = `${formatNumber(c.amount)} ${costType?.name || '?'}`;
      meta.appendChild(costEl);
    }
    el.appendChild(meta);
  }

  // Prerequisites
  const prereqGroups = prerequisites[node.id];
  if (detailMode === 'full' && prereqGroups) {
    const prereqEl = document.createElement('div');
    prereqEl.className = 'node-prereq';
    const groups = Object.values(prereqGroups);
    const parts = groups.map(group =>
      group.map(reqId => {
        const rn = nodes[reqId];
        if (!rn) return '?';
        const cross = rn.type_id !== node.type_id;
        const met = gameState.unlocked.has(reqId);
        const rt = types[rn.type_id];
        if (cross) return `<span class="cross-type" style="color:${rt?.color || '#dea05d'}">${rn.name}</span>`;
        return `<span style="color:${met ? '#5a5' : '#555'}">${rn.name}</span>`;
      }).join(' + ')
    );
    prereqEl.innerHTML = 'Requires: ' + parts.join(' OR ');
    el.appendChild(prereqEl);
  }

  // Effects
  const nodeEffects = effects[node.id] || [];
  if (detailMode === 'full' && nodeEffects.length > 0) {
    const effectsEl = document.createElement('div');
    effectsEl.className = 'node-effects';
    for (const e of nodeEffects) {
      const eff = document.createElement('div');
      eff.className = 'node-effect';
      if (e.effect_type === 'unlock_type') {
        eff.className += ' unlock-effect';
        const tt = types[e.target_type_id];
        eff.innerHTML = `\u2605 Unlocks <span style="color:${tt?.color || '#da5'}">${tt?.name || '?'}</span>`;
      } else if (e.effect_type === 'boost') {
        eff.className += ' boost-effect';
        eff.textContent = e.description || `+${e.value} boost`;
      } else {
        eff.textContent = e.description || `${e.effect_type}: ${e.value}`;
      }
      effectsEl.appendChild(eff);
    }
    el.appendChild(effectsEl);
  }

  // Progress bar for available nodes
  if (isAvail) {
    const progress = document.createElement('div');
    progress.className = 'cost-progress';
    const p = getAffordProgress(node.id);
    progress.style.width = (p * 100) + '%';
    progress.style.background = hexToRgba(type.color, 0.5);
    el.appendChild(progress);
  }

  return el;
}

function updateStats() {
  const statsEl = document.getElementById('stats');
  const total = Object.keys(nodes).length;
  const unlocked = gameState.unlocked.size;
  const available = Object.keys(nodes).filter(id => isNodeAvailable(parseInt(id))).length;
  statsEl.textContent = `${unlocked}/${total} unlocked \u00B7 ${available} available`;
}

// =============================================
// Save / Load
// =============================================
function saveGame() {
  const save = {
    energy: gameState.energy,
    unlocked: [...gameState.unlocked],
    timestamp: Date.now(),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const save = JSON.parse(raw);
    gameState.energy = save.energy || {};
    gameState.unlocked = new Set(save.unlocked || []);
    gameState.lastTick = Date.now();

    // Award offline progress
    if (save.timestamp) {
      const elapsed = Math.min((Date.now() - save.timestamp) / 1000, 3600); // cap at 1hr
      for (const typeId of getUnlockedTypeIds()) {
        const rate = calculateGenerationRate(typeId);
        if (rate > 0) {
          gameState.energy[typeId] = (gameState.energy[typeId] || 0) + rate * elapsed;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

// =============================================
// Visual Feedback
// =============================================
function spawnFloat(event, text, color) {
  const el = document.createElement('div');
  el.className = 'click-float';
  el.style.color = color;
  el.textContent = text;
  el.style.left = event.clientX + 'px';
  el.style.top = (event.clientY - 10) + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// =============================================
// Formatting
// =============================================
function formatNumber(n) {
  if (n === 0) return '0';
  if (n < 100) return n.toFixed(1);
  if (n < 10000) return Math.floor(n).toLocaleString();
  if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  return (n / 1e12).toFixed(2) + 'T';
}

function formatRate(n) {
  if (n === 0) return '+0/s';
  if (n < 0.1) return '+' + n.toFixed(2) + '/s';
  if (n < 100) return '+' + n.toFixed(1) + '/s';
  return '+' + formatNumber(n) + '/s';
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(128,128,128,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
