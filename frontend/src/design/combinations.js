// --- State ---
let types = [];
let combos = [];       // all combos
let comboMap = {};     // key: "minId-maxId" -> array of combo objects (filtered)
let typeMap = {};      // key: id -> type object
let mechanicFilter = 'all';  // 'all' | 'spell' | 'storm' | 'super_power'
let natureFilter = 'all';   // 'all' | 'spell' | 'element' | 'phenomenon' | 'material' | 'effect'

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
}

function pairKey(idA, idB) {
  const b = idB != null ? idB : idA;
  return `${Math.min(idA, b)}-${Math.max(idA, b)}`;
}

// --- Filtering ---
function initFilters() {
  const mechBar = document.getElementById('filter-mechanic');
  mechBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    mechanicFilter = btn.dataset.filter;
    mechBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateFilterCounts();
    rebuildView();
  });

  const natBar = document.getElementById('filter-nature');
  natBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    natureFilter = btn.dataset.filter;
    natBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateFilterCounts();
    rebuildView();
  });

  updateFilterCounts();
}

function updateFilterCounts() {
  // Mechanic counts (respecting current nature filter)
  const natFiltered = natureFilter === 'all' ? combos : combos.filter(c => c.nature === natureFilter);
  const mechCounts = { all: natFiltered.length, spell: 0, storm: 0, super_power: 0 };
  natFiltered.forEach(c => { if (c.mechanic && mechCounts[c.mechanic] !== undefined) mechCounts[c.mechanic]++; });
  document.querySelectorAll('#filter-mechanic .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = mechCounts[f];
  });

  // Nature counts (respecting current mechanic filter)
  const mechFiltered = mechanicFilter === 'all' ? combos : combos.filter(c => c.mechanic === mechanicFilter);
  const natCounts = { all: mechFiltered.length, spell: 0, element: 0, phenomenon: 0, material: 0, effect: 0 };
  mechFiltered.forEach(c => { if (c.nature && natCounts[c.nature] !== undefined) natCounts[c.nature]++; });
  document.querySelectorAll('#filter-nature .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = natCounts[f];
  });
}

function getFilteredCombos() {
  return combos.filter(c => {
    if (mechanicFilter !== 'all' && c.mechanic !== mechanicFilter) return false;
    if (natureFilter !== 'all' && c.nature !== natureFilter) return false;
    return true;
  });
}

function rebuildComboMap() {
  comboMap = {};
  getFilteredCombos().forEach(c => {
    const key = pairKey(c.typeAId, c.typeBId);
    if (!comboMap[key]) comboMap[key] = [];
    comboMap[key].push(c);
  });
}

function rebuildView() {
  rebuildComboMap();

  // Clear and rebuild matrix
  const table = document.getElementById('matrix');
  table.innerHTML = '';
  buildMatrix();
  buildStats();

  // Reset detail panel
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  const title = document.getElementById('detail-title');
  const container = document.getElementById('detail-combos');
  if (placeholder) placeholder.style.display = '';
  title.style.display = 'none';
  container.innerHTML = '';
}

// --- Matrix ---
function buildMatrix() {
  const table = document.getElementById('matrix');
  const tierLabels = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

  // Header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(el('th', { className: 'corner', colSpan: 2 }));
  types.forEach(t => {
    const th = el('th', {
      className: 'col-header',
      textContent: t.name,
      style: `color: ${t.color}`,
      title: `${t.name} (${t.oldName})`
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  let currentTier = null;

  types.forEach(rowType => {
    const tr = document.createElement('tr');

    // Tier label
    if (rowType.tier !== currentTier) {
      currentTier = rowType.tier;
      const tierTypes = types.filter(t => t.tier === currentTier);
      tr.appendChild(el('th', {
        className: 'tier-label',
        textContent: tierLabels[currentTier],
        rowSpan: tierTypes.length
      }));
    }

    // Row header
    tr.appendChild(el('th', {
      className: 'row-header',
      textContent: rowType.name,
      style: `color: ${rowType.color}`,
      title: `${rowType.name} (${rowType.oldName})`
    }));

    // Cells
    types.forEach(colType => {
      const td = document.createElement('td');
      const key = pairKey(rowType.id, colType.id);
      const cellCombos = comboMap[key] || [];
      const count = cellCombos.length;

      if (count === 0) {
        td.className = rowType.id === colType.id ? 'self' : 'empty';
        if (rowType.id !== colType.id) {
          td.addEventListener('click', () => showDetail(rowType, colType, []));
        }
      } else {
        const intensity = Math.min(count, 4);
        td.className = `c${intensity}`;
        if (rowType.id === colType.id) td.classList.add('self', 'has-combos');
        td.textContent = count;

        td.addEventListener('mouseenter', e => showTooltip(e, rowType, colType, cellCombos));
        td.addEventListener('mousemove', e => moveTooltip(e));
        td.addEventListener('mouseleave', hideTooltip);
        td.addEventListener('click', () => showDetail(rowType, colType, cellCombos));
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

// --- Tooltip ---
function showTooltip(e, typeA, typeB, cellCombos) {
  const tip = document.getElementById('tooltip');
  const header = `<span style="color:${typeA.color}">${typeA.name}</span>` +
    ` <span style="color:#555">+</span> ` +
    `<span style="color:${typeB.color}">${typeB.name}</span>`;

  const previews = cellCombos.slice(0, 5).map(c => {
    const mechClass = `mech-${c.mechanic || 'spell'}`;
    const natClass = `cat-${c.nature || 'spell'}`;
    return `<div class="combo-preview">
      <span class="combo-name">${c.name}</span>
      <span class="cat-badge ${mechClass}" style="font-size:10px;margin-left:6px">${c.mechanic || '?'}</span>
      <span class="cat-badge ${natClass}" style="font-size:10px;margin-left:3px">${c.nature || '?'}</span>
      ${c.process ? `<span class="process-tag" style="margin-left:4px">${c.process}</span>` : ''}
    </div>`;
  }).join('');

  const more = cellCombos.length > 5 ? `<div style="color:#555;font-size:11px;margin-top:4px">+${cellCombos.length - 5} more...</div>` : '';

  tip.innerHTML = `<div class="tt-header">${header} &mdash; ${cellCombos.length} idea${cellCombos.length > 1 ? 's' : ''}</div>${previews}${more}`;
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
function showDetail(typeA, typeB, cellCombos) {
  hideTooltip();
  const panel = document.getElementById('detail');
  const title = document.getElementById('detail-title');
  const container = document.getElementById('detail-combos');
  const placeholder = panel.querySelector('.placeholder');

  // Hide placeholder, show title
  if (placeholder) placeholder.style.display = 'none';
  title.style.display = 'flex';

  const isSelf = typeA.id === typeB.id;
  title.innerHTML =
    `<span style="color:${typeA.color}">${typeA.name}</span>` +
    (isSelf ? ' <span style="color:#555">concentrated</span>' :
      ` <span style="color:#555">+</span> <span style="color:${typeB.color}">${typeB.name}</span>`) +
    ` <span style="color:#444; font-size:14px; font-weight:400">&mdash; ${cellCombos.length} idea${cellCombos.length !== 1 ? 's' : ''}</span>`;

  if (cellCombos.length === 0) {
    container.innerHTML = `
      <div class="no-combos">
        No combination ideas yet for this pair.
        <div class="prompt">Add entries to TYPE_COMBOS in build.py to brainstorm!</div>
      </div>`;
  } else {
    // Sort: selected first, then by mechanic, then by name
    const mechOrder = { super_power: 0, storm: 1, spell: 2 };
    const sorted = [...cellCombos].sort((a, b) => {
      if (a.isSelected !== b.isSelected) return b.isSelected - a.isSelected;
      const ma = mechOrder[a.mechanic] ?? 3;
      const mb = mechOrder[b.mechanic] ?? 3;
      if (ma !== mb) return ma - mb;
      return a.name.localeCompare(b.name);
    });

    container.innerHTML = sorted.map(c => {
      const natClass = `cat-${c.nature || 'spell'}`;
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
        <div class="combo-card">
          <div class="combo-title">
            <span class="name">${c.name}</span>
            <span class="cat-badge ${mechClass}">${c.mechanic || '?'}</span>
            <span class="cat-badge ${natClass}">${c.nature || '?'}</span>
            ${c.isSelected ? '<span style="color:#5ddb8a; font-size:12px;">&#10003; selected</span>' : ''}
          </div>
          ${c.process ? `<div class="process-tag">Process: ${c.process}</div>` : ''}
          <div class="recipe">
            ${recipeParts.join('\n            ')}
          </div>
          <div class="desc">${c.description || ''}</div>
        </div>`;
    }).join('');
  }

  // Scroll the detail panel to top
  panel.scrollTop = 0;
}

// --- Stats ---
function buildStats() {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  const filtered = getFilteredCombos();
  const maxCombos = 30; // scale factor

  types.forEach(type => {
    const count = filtered.filter(c => c.typeAId === type.id || c.typeBId === type.id).length;

    grid.innerHTML += `
      <div class="type-label" style="color:${type.color}">${type.name}</div>
      <div class="count">${count}</div>
      <div class="bar-wrap">
        <div class="bar" style="width:${(count / maxCombos) * 100}%" title="${count} combinations"></div>
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
    else if (k === 'onclick') e.addEventListener('click', v);
    else if (k === 'colSpan') e.colSpan = v;
    else if (k === 'rowSpan') e.rowSpan = v;
    else if (k === 'title') e.title = v;
    else e[k] = v;
  });
  return e;
}
