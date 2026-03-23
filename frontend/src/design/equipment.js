// --- State ---
let types = [];
let units = [];      // all unit_design rows
let instruments = []; // all instrument_design rows
let unitMap = {};     // typeId -> array of units
let instrumentMap = {}; // typeId -> array of instruments
let currentView = 'both'; // 'both' | 'units' | 'instruments'

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

    render();

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
  const typeRows = db.exec(`
    SELECT id, name, old_name, tier, color, sort_order, energy_domain
    FROM types ORDER BY sort_order
  `);
  types = typeRows[0].values.map(r => ({
    id: r[0], name: r[1], oldName: r[2], tier: r[3], color: r[4],
    sortOrder: r[5], energyDomain: r[6]
  }));

  const unitRows = db.exec(`
    SELECT u.id, u.type_id, u.name, u.symbol, u.quantity_measured,
           u.named_after, u.description, u.is_selected
    FROM unit_design u
    JOIN types t ON u.type_id = t.id
    ORDER BY t.sort_order, u.is_selected DESC, u.name
  `);
  units = unitRows[0].values.map(r => ({
    id: r[0], typeId: r[1], name: r[2], symbol: r[3], quantityMeasured: r[4],
    namedAfter: r[5], description: r[6], isSelected: r[7]
  }));

  const instrRows = db.exec(`
    SELECT i.id, i.type_id, i.name, i.associated_scientist,
           i.description, i.thematic_role, i.is_selected
    FROM instrument_design i
    JOIN types t ON i.type_id = t.id
    ORDER BY t.sort_order, i.is_selected DESC, i.name
  `);
  instruments = instrRows[0].values.map(r => ({
    id: r[0], typeId: r[1], name: r[2], associatedScientist: r[3],
    description: r[4], thematicRole: r[5], isSelected: r[6]
  }));

  // Build lookup maps
  units.forEach(u => {
    if (!unitMap[u.typeId]) unitMap[u.typeId] = [];
    unitMap[u.typeId].push(u);
  });
  instruments.forEach(i => {
    if (!instrumentMap[i.typeId]) instrumentMap[i.typeId] = [];
    instrumentMap[i.typeId].push(i);
  });
}

// --- View Toggle ---
function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.id === `btn-${view}`);
  });
  render();
}

// --- Render ---
function render() {
  const container = document.getElementById('grid-container');
  container.innerHTML = '';

  const tiers = ['primary', 'secondary', 'tertiary'];
  const tierLabels = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

  tiers.forEach(tier => {
    const tierTypes = types.filter(t => t.tier === tier);
    if (tierTypes.length === 0) return;

    const section = el('div', { className: 'tier-section' });
    section.appendChild(el('div', { className: 'tier-label', textContent: tierLabels[tier] }));

    const grid = el('div', { className: 'type-grid' });

    tierTypes.forEach(type => {
      grid.appendChild(buildTypeCard(type));
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function buildTypeCard(type) {
  const card = el('div', { className: 'type-card' });

  // Header
  const header = el('div', { className: 'type-card-header' });
  header.appendChild(el('span', { className: 'type-dot', style: `background:${type.color}` }));
  header.appendChild(el('span', { className: 'type-name', textContent: type.name, style: `color:${type.color}` }));
  if (type.energyDomain) {
    header.appendChild(el('span', { className: 'type-meta', textContent: type.energyDomain }));
  }
  card.appendChild(header);

  const showUnits = currentView === 'both' || currentView === 'units';
  const showInstruments = currentView === 'both' || currentView === 'instruments';

  // Units
  if (showUnits) {
    card.appendChild(el('div', { className: 'item-section-label', textContent: 'Units of Measurement' }));
    const typeUnits = unitMap[type.id] || [];
    if (typeUnits.length === 0) {
      card.appendChild(el('div', { className: 'no-items', textContent: 'No units defined yet' }));
    } else {
      typeUnits.forEach(u => card.appendChild(buildUnitRow(u, type.color)));
    }
  }

  // Instruments
  if (showInstruments) {
    card.appendChild(el('div', { className: 'item-section-label', textContent: 'Instruments / Equipment' }));
    const typeInstruments = instrumentMap[type.id] || [];
    if (typeInstruments.length === 0) {
      card.appendChild(el('div', { className: 'no-items', textContent: 'No instruments defined yet' }));
    } else {
      typeInstruments.forEach(i => card.appendChild(buildInstrumentRow(i, type.color)));
    }
  }

  return card;
}

function buildUnitRow(unit, typeColor) {
  const row = el('div', {
    className: `item-row ${unit.isSelected ? 'selected' : 'candidate'}`,
    style: unit.isSelected ? `border-left-color:${typeColor}` : ''
  });

  const left = el('div', { style: 'flex:1;min-width:0' });

  // Name + symbol line
  const nameLine = el('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' });
  nameLine.appendChild(el('span', { className: 'item-name', textContent: unit.name }));
  if (unit.symbol) {
    nameLine.appendChild(el('span', { className: 'item-symbol', textContent: unit.symbol }));
  }
  nameLine.appendChild(el('span', {
    className: 'item-detail',
    textContent: `\u2014 ${unit.quantityMeasured}`,
    style: 'white-space:nowrap'
  }));
  left.appendChild(nameLine);

  // Description
  if (unit.description) {
    left.appendChild(el('div', { className: 'item-meta', textContent: unit.description }));
  }

  // Named after
  if (unit.namedAfter) {
    left.appendChild(el('div', { className: 'named-after', textContent: `Named after ${unit.namedAfter}` }));
  }

  row.appendChild(left);
  return row;
}

function buildInstrumentRow(instr, typeColor) {
  const row = el('div', {
    className: `item-row ${instr.isSelected ? 'selected' : 'candidate'}`,
    style: instr.isSelected ? `border-left-color:${typeColor}` : ''
  });

  const left = el('div', { style: 'flex:1;min-width:0' });

  // Name line
  const nameLine = el('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' });
  nameLine.appendChild(el('span', { className: 'item-name', textContent: instr.name }));
  if (instr.associatedScientist) {
    nameLine.appendChild(el('span', { className: 'named-after', textContent: instr.associatedScientist }));
  }
  left.appendChild(nameLine);

  // Description
  if (instr.description) {
    left.appendChild(el('div', { className: 'item-meta', textContent: instr.description }));
  }

  // Thematic role
  if (instr.thematicRole) {
    left.appendChild(el('div', { className: 'item-role', textContent: `"${instr.thematicRole}"` }));
  }

  row.appendChild(left);
  return row;
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
