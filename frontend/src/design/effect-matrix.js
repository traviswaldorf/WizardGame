// --- State ---
let types = [];
let typeMap = {};
let effects = [];
let links = [];
let roleFilter = 'all';

const CAT_COLORS = {
  aggro: '#E74C3C', control: '#2E86C1', search: '#7D3C98',
  growth: '#27AE60', defensive: '#F4D03F', unassigned: '#888'
};

const CATEGORIES = ['aggro', 'control', 'search', 'growth', 'defensive', 'unassigned'];
const ARCHETYPES_ORDERED = [
  { name: 'damage',  cat: 'aggro' },
  { name: 'destroy', cat: 'aggro' },
  { name: 'counter', cat: 'control' },
  { name: 'steal',   cat: 'control' },
  { name: 'draw',    cat: 'search' },
  { name: 'revive',  cat: 'growth' },
  { name: 'discount',cat: 'growth' },
  { name: 'prevent', cat: 'defensive' },
  { name: 'block',   cat: 'defensive' },
  { name: 'discard', cat: 'unassigned' }
];

// --- Init ---
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const sqlPromise = initSqlJs({
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`
    });
    const dataPromise = fetch('/wizard_game.db');
    const [SQL, response] = await Promise.all([sqlPromise, dataPromise]);

    if (!response.ok) {
      throw new Error(`Database fetch failed (${response.status}). Run build.py first and serve via HTTP.`);
    }

    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));
    loadData(db);
    db.close();

    initFilters();
    rebuildView();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

// --- Data Loading ---
function loadData(db) {
  const typeRows = db.exec(
    'SELECT id, name, old_name, tier, color, sort_order FROM types ORDER BY sort_order'
  );
  types = typeRows[0].values.map(r => ({
    id: r[0], name: r[1], oldName: r[2], tier: r[3], color: r[4], sortOrder: r[5]
  }));
  types.forEach(t => { typeMap[t.id] = t; });

  const effectRows = db.exec(`
    SELECT id, category, archetype, name, description, effect_class, is_selected, notes
    FROM effect_design ORDER BY category, archetype, name
  `);
  if (effectRows.length > 0) {
    effects = effectRows[0].values.map(r => ({
      id: r[0], category: r[1], archetype: r[2], name: r[3], description: r[4],
      effectClass: r[5], isSelected: r[6], notes: r[7]
    }));
  }

  const linkRows = db.exec(`
    SELECT etl.id, etl.effect_id, etl.type_id, etl.type_combination_id, etl.role,
           etl.is_selected, etl.notes
    FROM effect_type_link_design etl
    WHERE etl.type_id IS NOT NULL
  `);
  if (linkRows.length > 0) {
    links = linkRows[0].values.map(r => ({
      id: r[0], effectId: r[1], typeId: r[2], typeCombinationId: r[3], role: r[4],
      isSelected: r[5], notes: r[6]
    }));
  }
}

// Build a lookup: typeId -> archetype -> { role, links[] }
function buildMatrix() {
  const matrix = {};
  types.forEach(t => {
    matrix[t.id] = {};
    ARCHETYPES_ORDERED.forEach(a => {
      matrix[t.id][a.name] = { role: null, links: [] };
    });
  });

  // Map effect id -> archetype
  const effectArchetype = {};
  effects.forEach(e => { effectArchetype[e.id] = e.archetype; });

  links.forEach(l => {
    const arch = effectArchetype[l.effectId];
    if (!arch || !matrix[l.typeId] || !matrix[l.typeId][arch]) return;
    const cell = matrix[l.typeId][arch];
    cell.links.push(l);
    // Highest role wins: primary > secondary > situational
    const rolePriority = { primary: 3, secondary: 2, situational: 1 };
    const newPri = rolePriority[l.role] || 0;
    const curPri = rolePriority[cell.role] || 0;
    if (newPri > curPri) cell.role = l.role;
  });

  return matrix;
}

// --- Filtering ---
function initFilters() {
  const bar = document.getElementById('filter-role');
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    roleFilter = btn.dataset.filter;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    rebuildView();
  });
}

function rebuildView() {
  const matrixData = buildMatrix();
  renderMatrix(matrixData);
  renderStats(matrixData);
}

// --- Matrix Rendering ---
function renderMatrix(matrixData) {
  const table = document.getElementById('matrix');
  table.innerHTML = '';
  const tierLabels = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

  // Category header row
  const catRow = document.createElement('tr');
  catRow.appendChild(el('th', { className: 'corner', colSpan: 2 }));
  let prevCat = null;
  ARCHETYPES_ORDERED.forEach(a => {
    if (a.cat !== prevCat) {
      prevCat = a.cat;
      const span = ARCHETYPES_ORDERED.filter(x => x.cat === a.cat).length;
      const th = el('th', {
        className: 'col-cat-header',
        textContent: a.cat,
        colSpan: span,
        style: `color: ${CAT_COLORS[a.cat]}`
      });
      catRow.appendChild(th);
    }
  });
  table.appendChild(catRow);

  // Archetype header row
  const headerRow = document.createElement('tr');
  headerRow.appendChild(el('th', { className: 'corner', colSpan: 2 }));
  ARCHETYPES_ORDERED.forEach(a => {
    headerRow.appendChild(el('th', {
      className: 'col-header',
      textContent: a.name,
      style: `color: ${CAT_COLORS[a.cat]}`
    }));
  });
  table.appendChild(headerRow);

  // Body rows
  const tbody = document.createElement('tbody');
  let currentTier = null;

  types.forEach(type => {
    const tr = document.createElement('tr');

    if (type.tier !== currentTier) {
      currentTier = type.tier;
      const tierTypes = types.filter(t => t.tier === currentTier);
      tr.appendChild(el('th', {
        className: 'tier-label',
        textContent: tierLabels[currentTier],
        rowSpan: tierTypes.length
      }));
    }

    tr.appendChild(el('th', {
      className: 'row-header',
      textContent: type.name,
      style: `color: ${type.color}`
    }));

    ARCHETYPES_ORDERED.forEach(a => {
      const cell = matrixData[type.id][a.name];
      const td = document.createElement('td');

      // Apply role filter
      const show = roleFilter === 'all' || cell.role === roleFilter;

      if (cell.role && show) {
        td.className = `role-${cell.role}`;
        if (cell.role === 'primary') td.innerHTML = '<span style="color:rgba(99,110,255,0.9)">&#9679;</span>';
        else if (cell.role === 'secondary') td.innerHTML = '<span style="color:rgba(99,110,255,0.5)">&#9681;</span>';
        else td.innerHTML = '<span style="color:rgba(99,110,255,0.25)">&#9675;</span>';
      } else {
        td.innerHTML = '<span style="color:#333">&mdash;</span>';
      }

      td.addEventListener('click', () => showCellDetail(type, a, cell));
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

// --- Detail Panel ---
function showCellDetail(type, archInfo, cell) {
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  // Get effect expressions for this archetype
  const archEffects = effects.filter(e => e.archetype === archInfo.name);

  // Get the specific effect ids linked to this type for this archetype
  const effectArchMap = {};
  effects.forEach(e => { effectArchMap[e.id] = e.archetype; });
  const typeArchLinks = links.filter(l =>
    l.typeId === type.id && effectArchMap[l.effectId] === archInfo.name
  );
  const linkedEffectIds = new Set(typeArchLinks.map(l => l.effectId));

  panel.innerHTML = `
    <h2>
      <span style="color:${type.color}">${type.name}</span>
      <span style="color:#555;font-weight:400"> + </span>
      <span style="color:${CAT_COLORS[archInfo.cat]}">${capitalize(archInfo.name)}</span>
    </h2>

    <div class="detail-section">
      <h3>Role</h3>
      <div style="font-size:14px;font-weight:600;text-transform:capitalize;color:${cell.role ? '#ddd' : '#555'}">
        ${cell.role || 'Not assigned'}
      </div>
    </div>

    <div class="detail-section">
      <h3>Linked Expressions (${linkedEffectIds.size})</h3>
      ${typeArchLinks.length > 0 ? typeArchLinks.map(l => {
        const eff = effects.find(e => e.id === l.effectId);
        if (!eff) return '';
        return `<div class="detail-card">
          <span class="card-name">${eff.name}</span>
          ${eff.effectClass ? `<span class="class-badge class-${eff.effectClass}">${eff.effectClass}</span>` : ''}
          <span style="font-size:11px;color:#888;margin-left:4px">${l.role}</span>
          ${l.notes ? `<div style="font-size:11px;color:#777;margin-top:2px">${l.notes}</div>` : ''}
          <div style="font-size:11px;color:#888;margin-top:2px">${eff.description || ''}</div>
        </div>`;
      }).join('') : '<div class="empty-state">No links — this type does not use this archetype</div>'}
    </div>

    <div class="detail-section">
      <h3>All ${capitalize(archInfo.name)} Expressions (${archEffects.length})</h3>
      ${archEffects.map(e => `
        <div class="detail-card" style="${linkedEffectIds.has(e.id) ? 'border-left:2px solid rgba(99,110,255,0.5)' : 'opacity:0.5'}">
          <span class="card-name">${e.name}</span>
          ${e.effectClass ? `<span class="class-badge class-${e.effectClass}">${e.effectClass}</span>` : ''}
          ${e.isSelected ? '<span style="color:#5ddb8a;font-size:11px;margin-left:4px">&#10003;</span>' : ''}
          <div style="font-size:11px;color:#888;margin-top:2px">${e.description || ''}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// --- Stats ---
function renderStats(matrixData) {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  const maxTypes = types.length;

  ARCHETYPES_ORDERED.forEach(a => {
    let primaryCount = 0;
    let secondaryCount = 0;
    types.forEach(t => {
      const role = matrixData[t.id][a.name].role;
      if (role === 'primary') primaryCount++;
      else if (role === 'secondary') secondaryCount++;
    });

    const total = primaryCount + secondaryCount;
    let warning = '';
    if (total < 3) warning = '<span class="balance-warning warn-low">under-served</span>';
    else if (total > 8) warning = '<span class="balance-warning warn-high">over-served</span>';

    grid.innerHTML += `
      <div class="arch-label" style="color:${CAT_COLORS[a.cat]}">${a.name}${warning}</div>
      <div class="count" style="color:rgba(99,110,255,0.8)">${primaryCount}</div>
      <div class="bar-wrap">
        <div class="bar bar-primary" style="width:${(primaryCount / maxTypes) * 100}%"></div>
      </div>
      <div class="count" style="color:rgba(99,110,255,0.4)">${secondaryCount}</div>
      <div class="bar-wrap">
        <div class="bar bar-secondary" style="width:${(secondaryCount / maxTypes) * 100}%"></div>
      </div>
    `;
  });
}

// --- Helpers ---
function el(tag, props) {
  const e = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k === 'style') e.setAttribute('style', v);
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k === 'textContent') e.textContent = v;
    else if (k === 'className') e.className = v;
    else if (k === 'colSpan') e.colSpan = v;
    else if (k === 'rowSpan') e.rowSpan = v;
    else if (k === 'title') e.title = v;
    else e[k] = v;
  });
  return e;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
