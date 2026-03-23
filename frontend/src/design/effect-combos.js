// --- State ---
let types = [];
let typeMap = {};
let combos = [];
let effectLinks = [];       // combo-level links from effect_type_link_design
let assignedComboIds = {};   // set of combo ids that have at least one effect link
let mechanicFilter = 'all';
let statusFilter = 'all';
let coverageView = true;     // true = coverage (green/red), false = count (blue)

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
    initToggle();
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

  const comboRows = db.exec(`
    SELECT sc.id, sc.type_a_id, sc.type_b_id, sc.type_a_amount, sc.type_b_amount,
           sc.name, sc.description, sc.nature, sc.mechanic, sc.process, sc.is_selected,
           a.name, a.color, b.name, b.color
    FROM type_combination_design sc
    JOIN types a ON sc.type_a_id = a.id
    LEFT JOIN types b ON sc.type_b_id = b.id
  `);
  if (comboRows.length > 0) {
    combos = comboRows[0].values.map(r => ({
      id: r[0], typeAId: r[1], typeBId: r[2], typeAAmount: r[3], typeBAmount: r[4],
      name: r[5], description: r[6], nature: r[7], mechanic: r[8], process: r[9],
      isSelected: r[10],
      typeAName: r[11], typeAColor: r[12], typeBName: r[13], typeBColor: r[14]
    }));
  }

  // Load combo-level effect links
  const linkRows = db.exec(`
    SELECT etl.id, etl.effect_id, etl.type_combination_id, etl.role,
           e.name as effect_name, e.archetype, e.category
    FROM effect_type_link_design etl
    JOIN effect_design e ON etl.effect_id = e.id
    WHERE etl.type_combination_id IS NOT NULL
  `);
  if (linkRows.length > 0) {
    effectLinks = linkRows[0].values.map(r => ({
      id: r[0], effectId: r[1], typeCombinationId: r[2], role: r[3],
      effectName: r[4], archetype: r[5], category: r[6]
    }));
  }

  // Build assigned set
  assignedComboIds = {};
  effectLinks.forEach(l => { assignedComboIds[l.typeCombinationId] = true; });
}

function pairKey(idA, idB) {
  const b = idB != null ? idB : idA;
  return `${Math.min(idA, b)}-${Math.max(idA, b)}`;
}

// --- Filtering ---
function initFilters() {
  setupFilterBar('filter-mechanic', f => { mechanicFilter = f; });
  setupFilterBar('filter-status', f => { statusFilter = f; });
  updateFilterCounts();
}

function setupFilterBar(barId, setter) {
  const bar = document.getElementById(barId);
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    setter(btn.dataset.filter);
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateFilterCounts();
    rebuildView();
  });
}

function initToggle() {
  const btn = document.getElementById('view-toggle');
  btn.addEventListener('click', () => {
    coverageView = !coverageView;
    btn.textContent = coverageView ? 'Coverage View' : 'Count View';
    btn.classList.toggle('active', coverageView);
    document.getElementById('legend-coverage').style.display = coverageView ? '' : 'none';
    document.getElementById('legend-count').style.display = coverageView ? 'none' : '';
    rebuildView();
  });
}

function updateFilterCounts() {
  // Mechanic counts (respecting status filter)
  const statusFiltered = applyStatusFilter(combos);
  const mechCounts = { all: statusFiltered.length, spell: 0, storm: 0, super_power: 0 };
  statusFiltered.forEach(c => { if (c.mechanic && mechCounts[c.mechanic] !== undefined) mechCounts[c.mechanic]++; });
  document.querySelectorAll('#filter-mechanic .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = mechCounts[f] ?? 0;
  });

  // Status counts (respecting mechanic filter)
  const mechFiltered = mechanicFilter === 'all' ? combos : combos.filter(c => c.mechanic === mechanicFilter);
  const assigned = mechFiltered.filter(c => assignedComboIds[c.id]);
  const statCounts = { all: mechFiltered.length, assigned: assigned.length, unassigned: mechFiltered.length - assigned.length };
  document.querySelectorAll('#filter-status .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = statCounts[f] ?? 0;
  });
}

function applyStatusFilter(list) {
  if (statusFilter === 'assigned') return list.filter(c => assignedComboIds[c.id]);
  if (statusFilter === 'unassigned') return list.filter(c => !assignedComboIds[c.id]);
  return list;
}

function getFilteredCombos() {
  let result = combos;
  if (mechanicFilter !== 'all') result = result.filter(c => c.mechanic === mechanicFilter);
  result = applyStatusFilter(result);
  return result;
}

// --- Rebuild ---
function rebuildView() {
  buildSummary();
  buildMatrix();
}

function buildSummary() {
  const filtered = getFilteredCombos();
  const total = filtered.length;
  const assigned = filtered.filter(c => assignedComboIds[c.id]).length;
  const unassigned = total - assigned;
  const pct = total > 0 ? Math.round((assigned / total) * 100) : 0;

  document.getElementById('summary-bar').innerHTML = `
    <div class="summary-stat">
      <div class="value">${total}</div>
      <div class="label">Total Combos</div>
    </div>
    <div class="summary-stat">
      <div class="value good">${assigned}</div>
      <div class="label">Assigned</div>
    </div>
    <div class="summary-stat">
      <div class="value ${unassigned > 0 ? 'warn' : ''}">${unassigned}</div>
      <div class="label">Unassigned</div>
    </div>
    <div class="summary-stat">
      <div class="value">${pct}%</div>
      <div class="label">Coverage</div>
    </div>
  `;
}

function buildMatrix() {
  const table = document.getElementById('matrix');
  table.innerHTML = '';
  const tierLabels = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

  // Build pair data
  const filtered = getFilteredCombos();
  const pairData = {};
  filtered.forEach(c => {
    const key = pairKey(c.typeAId, c.typeBId);
    if (!pairData[key]) pairData[key] = { total: 0, assigned: 0, combos: [] };
    pairData[key].total++;
    if (assignedComboIds[c.id]) pairData[key].assigned++;
    pairData[key].combos.push(c);
  });

  // Header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(el('th', { className: 'corner', colSpan: 2 }));
  types.forEach(t => {
    headerRow.appendChild(el('th', {
      className: 'col-header',
      textContent: t.name,
      style: `color: ${t.color}`,
      title: `${t.name} (${t.oldName})`
    }));
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  let currentTier = null;

  types.forEach(rowType => {
    const tr = document.createElement('tr');

    if (rowType.tier !== currentTier) {
      currentTier = rowType.tier;
      const tierTypes = types.filter(t => t.tier === currentTier);
      tr.appendChild(el('th', {
        className: 'tier-label',
        textContent: tierLabels[currentTier],
        rowSpan: tierTypes.length
      }));
    }

    tr.appendChild(el('th', {
      className: 'row-header',
      textContent: rowType.name,
      style: `color: ${rowType.color}`
    }));

    types.forEach(colType => {
      const td = document.createElement('td');
      const key = pairKey(rowType.id, colType.id);
      const data = pairData[key];

      if (!data || data.total === 0) {
        td.className = coverageView ? 'no-combos' : 'cnt-c0';
        if (rowType.id === colType.id) td.classList.add('self');
      } else if (coverageView) {
        // Coverage mode
        if (data.assigned === data.total) td.className = 'cov-full';
        else if (data.assigned > 0) td.className = 'cov-partial';
        else td.className = 'cov-none';
        td.textContent = data.total;
      } else {
        // Count mode
        const intensity = Math.min(data.total, 4);
        td.className = `cnt-c${intensity}`;
        td.textContent = data.total;
      }

      if (data && data.total > 0) {
        td.addEventListener('mouseenter', e => showTooltip(e, rowType, colType, data));
        td.addEventListener('mousemove', moveTooltip);
        td.addEventListener('mouseleave', hideTooltip);
      }
      td.addEventListener('click', () => showDetail(rowType, colType, data));

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

// --- Tooltip ---
function showTooltip(e, typeA, typeB, data) {
  const tip = document.getElementById('tooltip');
  const header = `<span style="color:${typeA.color}">${typeA.name}</span>` +
    ` <span style="color:#555">+</span> ` +
    `<span style="color:${typeB.color}">${typeB.name}</span>`;

  const assignedCount = data ? data.assigned : 0;
  const totalCount = data ? data.total : 0;

  tip.innerHTML = `
    <div class="tt-header">${header}</div>
    <div style="font-size:12px;color:#aaa">${totalCount} combo${totalCount !== 1 ? 's' : ''} &mdash; ${assignedCount} assigned, ${totalCount - assignedCount} unassigned</div>
  `;
  tip.style.display = 'block';
  moveTooltip(e);
}

function moveTooltip(e) {
  const tip = document.getElementById('tooltip');
  const pad = 16;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  const rect = tip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth - pad) x = e.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight - pad) y = e.clientY - rect.height - pad;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}

function hideTooltip() {
  document.getElementById('tooltip').style.display = 'none';
}

// --- Detail Panel ---
function showDetail(typeA, typeB, data) {
  hideTooltip();
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  const cellCombos = data ? data.combos : [];
  const isSelf = typeA.id === typeB.id;

  let html = `<h2>
    <span style="color:${typeA.color}">${typeA.name}</span>
    ${isSelf ? ' <span style="color:#555">concentrated</span>' :
      ` <span style="color:#555">+</span> <span style="color:${typeB.color}">${typeB.name}</span>`}
    <span style="color:#444;font-size:14px;font-weight:400">&mdash; ${cellCombos.length} combo${cellCombos.length !== 1 ? 's' : ''}</span>
  </h2>`;

  if (cellCombos.length === 0) {
    html += `<div class="no-combos-msg">No combinations for this pair${mechanicFilter !== 'all' ? ' (with current filter)' : ''}.</div>`;
  } else {
    // Sort: assigned first, then by mechanic, then by name
    const mechOrder = { super_power: 0, storm: 1, spell: 2 };
    const sorted = [...cellCombos].sort((a, b) => {
      const aAssigned = assignedComboIds[a.id] ? 1 : 0;
      const bAssigned = assignedComboIds[b.id] ? 1 : 0;
      if (aAssigned !== bAssigned) return bAssigned - aAssigned;
      const ma = mechOrder[a.mechanic] ?? 3;
      const mb = mechOrder[b.mechanic] ?? 3;
      if (ma !== mb) return ma - mb;
      return a.name.localeCompare(b.name);
    });

    html += sorted.map(c => {
      const isAssigned = assignedComboIds[c.id];
      const comboEffectLinks = effectLinks.filter(l => l.typeCombinationId === c.id);
      const mechClass = `mech-${c.mechanic || 'spell'}`;
      const tA = typeMap[c.typeAId];
      const tB = c.typeBId != null ? typeMap[c.typeBId] : null;
      const recipeParts = [`<span class="amount">${c.typeAAmount}&times;</span>
            <span style="color:${tA.color}">${tA.name}</span>`];
      if (tB) {
        recipeParts.push(`<span class="plus">+</span>
            <span class="amount">${c.typeBAmount}&times;</span>
            <span style="color:${tB.color}">${tB.name}</span>`);
      }
      recipeParts.push(`<span class="arrow">&rarr;</span>
            <strong>${c.name}</strong>`);

      return `
        <div class="combo-card ${isAssigned ? 'assigned' : 'unassigned'}">
          <div class="combo-title">
            <span class="name">${c.name}</span>
            <span class="cat-badge ${mechClass}">${c.mechanic || '?'}</span>
            ${isAssigned
              ? `<span class="effect-badge effect-assigned">&#10003; assigned</span>`
              : `<span class="effect-badge effect-unassigned">unassigned</span>`}
            ${c.isSelected ? '<span style="color:#5ddb8a;font-size:12px">&#10003; selected</span>' : ''}
          </div>
          <div class="recipe">
            ${recipeParts.join('\n            ')}
          </div>
          <div class="desc">${c.description || ''}</div>
          ${comboEffectLinks.length > 0 ? `
            <div style="margin-top:6px;font-size:11px;color:#888">
              Effects: ${comboEffectLinks.map(l => `<span style="color:#5ddb8a">${l.effectName}</span> (${l.archetype})`).join(', ')}
            </div>
          ` : ''}
        </div>`;
    }).join('');
  }

  panel.innerHTML = html;
  panel.scrollTop = 0;
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
