// --- State ---
let types = [];
let typeMap = {};
let scientists = [];
let affinities = [];
let schoolAssignments = {}; // scientist name -> { typeId, schoolName, role }
let fieldFilter = 'all';
let statusFilter = 'all';
let ratingFilter = 'all';

const FIELD_COLORS = {
  physics: '#5dade2', chemistry: '#f5b041', biology: '#58d68d',
  mathematics: '#af7ac5', astronomy: '#85c1e9', earth_sciences: '#a0522d',
  engineering: '#808b96', medicine: '#e74c3c'
};

const FIELD_ORDER = ['physics', 'chemistry', 'biology', 'mathematics',
  'astronomy', 'earth_sciences', 'engineering', 'medicine'];

// --- Init ---
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
  const typeRows = db.exec('SELECT id, name, old_name, tier, color, sort_order FROM types ORDER BY sort_order');
  types = typeRows[0].values.map(r => ({
    id: r[0], name: r[1], oldName: r[2], tier: r[3], color: r[4], sortOrder: r[5]
  }));
  types.forEach(t => { typeMap[t.id] = t; });

  const sciRows = db.exec(`
    SELECT id, name, birth_year, death_year, field, sub_field, contribution,
           significance, era, nationality, is_selected, notes
    FROM scientist_design ORDER BY field, sub_field, name
  `);
  if (sciRows.length > 0) {
    scientists = sciRows[0].values.map(r => ({
      id: r[0], name: r[1], birthYear: r[2], deathYear: r[3], field: r[4],
      subField: r[5], contribution: r[6], significance: r[7], era: r[8],
      nationality: r[9], isSelected: r[10], notes: r[11]
    }));
  }

  const affRows = db.exec(`
    SELECT a.scientist_id, a.type_id, a.affinity, a.rationale, t.name, t.color
    FROM scientist_type_affinity_design a
    JOIN types t ON a.type_id = t.id
  `);
  if (affRows.length > 0) {
    affinities = affRows[0].values.map(r => ({
      scientistId: r[0], typeId: r[1], affinity: r[2], rationale: r[3],
      typeName: r[4], typeColor: r[5]
    }));
  }

  // Load school assignments
  const wsRows = db.exec(`
    SELECT ws.scientist_name, ws.type_id, ws.school_name, ws.role, t.name, t.color
    FROM wizard_school_design ws
    JOIN types t ON ws.type_id = t.id
  `);
  if (wsRows.length > 0) {
    wsRows[0].values.forEach(r => {
      schoolAssignments[r[0]] = {
        typeId: r[1], schoolName: r[2], role: r[3], typeName: r[4], typeColor: r[5]
      };
    });
  }
}

function isAssigned(sci) { return !!schoolAssignments[sci.name]; }

// --- Filtering ---
function initFilters() {
  setupFilterBar('filter-field', f => { fieldFilter = f; });
  setupFilterBar('filter-status', f => { statusFilter = f; });
  setupFilterBar('filter-rating', f => { ratingFilter = f; });
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

function updateFilterCounts() {
  // Field counts (respecting status + rating)
  const statusAndRatingFiltered = applyRating(applyStatus(scientists));
  const fieldCounts = { all: statusAndRatingFiltered.length };
  FIELD_ORDER.forEach(f => { fieldCounts[f] = statusAndRatingFiltered.filter(s => s.field === f).length; });
  document.querySelectorAll('#filter-field .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = fieldCounts[f] ?? 0;
  });

  // Status counts (respecting field + rating)
  const fieldAndRatingFiltered = applyRating(fieldFilter === 'all' ? scientists : scientists.filter(s => s.field === fieldFilter));
  const assigned = fieldAndRatingFiltered.filter(s => isAssigned(s)).length;
  const statCounts = { all: fieldAndRatingFiltered.length, assigned, unassigned: fieldAndRatingFiltered.length - assigned };
  document.querySelectorAll('#filter-status .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = statCounts[f] ?? 0;
  });

  // Rating counts (respecting field + status)
  const fieldAndStatusFiltered = applyStatus(fieldFilter === 'all' ? scientists : scientists.filter(s => s.field === fieldFilter));
  const ratingCounts = { all: fieldAndStatusFiltered.length };
  for (let r = 1; r <= 5; r++) { ratingCounts[r] = fieldAndStatusFiltered.filter(s => s.significance === r).length; }
  document.querySelectorAll('#filter-rating .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = ratingCounts[f] ?? 0;
  });
}

function applyStatus(list) {
  if (statusFilter === 'assigned') return list.filter(s => isAssigned(s));
  if (statusFilter === 'unassigned') return list.filter(s => !isAssigned(s));
  return list;
}

function applyRating(list) {
  if (ratingFilter === 'all') return list;
  return list.filter(s => s.significance === Number(ratingFilter));
}

function getFiltered() {
  let result = scientists;
  if (fieldFilter !== 'all') result = result.filter(s => s.field === fieldFilter);
  result = applyStatus(result);
  result = applyRating(result);
  return result;
}

// --- Rebuild ---
function rebuildView() {
  buildSummary();
  buildTree();
  buildMatrix();
  buildGapAnalysis();
}

function buildSummary() {
  const filtered = getFiltered();
  const assigned = filtered.filter(s => isAssigned(s)).length;
  const fields = new Set(filtered.map(s => s.field));

  document.getElementById('summary-bar').innerHTML = `
    <div class="summary-stat"><div class="value">${filtered.length}</div><div class="label">Scientists</div></div>
    <div class="summary-stat"><div class="value">${assigned}</div><div class="label">In Schools</div></div>
    <div class="summary-stat"><div class="value">${filtered.length - assigned}</div><div class="label">Unassigned</div></div>
    <div class="summary-stat"><div class="value">${fields.size}</div><div class="label">Fields</div></div>
  `;
}

// --- Tree ---
function buildTree() {
  const container = document.getElementById('tree-view');
  container.innerHTML = '';
  const filtered = getFiltered();

  const fieldsToShow = fieldFilter === 'all' ? FIELD_ORDER : [fieldFilter];

  fieldsToShow.forEach(field => {
    const fieldScientists = filtered.filter(s => s.field === field);
    if (fieldScientists.length === 0) return;

    const group = document.createElement('div');
    group.className = `field-group field-border-${field}`;

    const header = document.createElement('div');
    header.className = 'field-header';
    const displayField = field.replace('_', ' ');
    header.innerHTML = `
      <span class="caret">&#9660;</span>
      <span class="field-name field-${field}">${displayField}</span>
      <span class="field-count">${fieldScientists.length}</span>
    `;

    const body = document.createElement('div');
    body.className = 'field-body';

    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      body.classList.toggle('hidden');
    });

    // Group by sub_field
    const subFields = [...new Set(fieldScientists.map(s => s.subField))].sort();
    subFields.forEach(sf => {
      const sfScientists = fieldScientists.filter(s => s.subField === sf);
      const section = document.createElement('div');
      section.className = 'subfield-section';

      const sfLabel = document.createElement('div');
      sfLabel.className = 'subfield-label';
      sfLabel.textContent = `${sf.replace(/_/g, ' ')} (${sfScientists.length})`;
      section.appendChild(sfLabel);

      sfScientists.forEach(sci => {
        const card = document.createElement('div');
        card.className = 'scientist-card';

        const sciAffinities = affinities.filter(a => a.scientistId === sci.id);
        const ws = schoolAssignments[sci.name];

        const years = formatYears(sci.birthYear, sci.deathYear);
        const stars = sigStars(sci.significance);

        card.innerHTML = `
          <span class="sci-name">${sci.name}</span>
          <span class="sci-years">${years}</span>
          ${ws ? '<span class="ws-badge">WS</span>' : ''}
          <span class="sig-stars">${stars}</span>
          <span class="affinity-dots">
            ${sciAffinities.slice(0, 5).map(a =>
              `<span class="affinity-dot ${a.affinity}" style="background:${a.typeColor}" title="${a.typeName} (${a.affinity})"></span>`
            ).join('')}
          </span>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('.scientist-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          showDetail(sci);
        });

        section.appendChild(card);
      });

      body.appendChild(section);
    });

    group.appendChild(header);
    group.appendChild(body);
    container.appendChild(group);
  });
}

// --- Detail Panel ---
function showDetail(sci) {
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  const sciAffinities = affinities.filter(a => a.scientistId === sci.id);
  const strong = sciAffinities.filter(a => a.affinity === 'strong');
  const moderate = sciAffinities.filter(a => a.affinity === 'moderate');
  const weak = sciAffinities.filter(a => a.affinity === 'weak');
  const ws = schoolAssignments[sci.name];
  const years = formatYears(sci.birthYear, sci.deathYear);

  panel.innerHTML = `
    <h2>${sci.name}</h2>

    <div class="detail-meta">
      <span class="meta-badge">${years}</span>
      ${sci.nationality ? `<span class="meta-badge">${sci.nationality}</span>` : ''}
      <span class="meta-badge" style="text-transform:capitalize">${sci.era}</span>
      <span class="meta-badge field-${sci.field}" style="text-transform:capitalize">${sci.field.replace('_', ' ')}</span>
      <span class="meta-badge" style="text-transform:capitalize">${sci.subField.replace(/_/g, ' ')}</span>
      <span class="sig-stars" style="font-size:14px">${sigStars(sci.significance)}</span>
    </div>

    <div class="detail-section">
      <h3>Contribution</h3>
      <div style="font-size:13px;color:#ccc;line-height:1.5">${sci.contribution}</div>
    </div>

    ${ws ? `<div class="detail-section">
      <h3>Wizard School Assignment</h3>
      <div class="school-card">
        <span class="school-name" style="color:${ws.typeColor}">${ws.schoolName}</span>
        <span class="school-role">${ws.role.replace('_', ' ')}</span>
        <div style="margin-top:4px">
          <span class="type-dot">
            <span class="dot" style="background:${ws.typeColor}"></span>
            ${ws.typeName}
          </span>
        </div>
      </div>
    </div>` : `<div class="detail-section">
      <h3>School Status</h3>
      <div class="empty-state">Not assigned to any wizard school</div>
    </div>`}

    <div class="detail-section">
      <h3>Strong Affinities (${strong.length})</h3>
      ${strong.length > 0 ? `<div class="type-dot-list">
        ${strong.map(a => affinityDot(a, 'strong')).join('')}
      </div>` : '<div class="empty-state">None</div>'}
    </div>

    <div class="detail-section">
      <h3>Moderate Affinities (${moderate.length})</h3>
      ${moderate.length > 0 ? `<div class="type-dot-list">
        ${moderate.map(a => affinityDot(a, 'moderate')).join('')}
      </div>` : '<div class="empty-state">None</div>'}
    </div>

    ${weak.length > 0 ? `<div class="detail-section">
      <h3>Weak Affinities (${weak.length})</h3>
      <div class="type-dot-list">${weak.map(a => affinityDot(a, 'weak')).join('')}</div>
    </div>` : ''}

    ${sci.notes ? `<div class="detail-section">
      <h3>Notes</h3>
      <div style="font-size:12px;color:#888;font-style:italic">${sci.notes}</div>
    </div>` : ''}
  `;
}

function affinityDot(a, level) {
  return `<span class="type-dot">
    <span class="dot" style="background:${a.typeColor}"></span>
    ${a.typeName}
    <span class="affinity-label aff-${level}">${level}</span>
    ${a.rationale ? `<span style="font-size:10px;color:#666" title="${a.rationale}">?</span>` : ''}
  </span>`;
}

// --- Type Affinity Matrix ---
function buildMatrix() {
  const table = document.getElementById('affinity-matrix');
  table.innerHTML = '';
  const filtered = getFiltered();

  // Get all sub_fields in the filtered set, grouped by field
  const subFieldsByField = {};
  FIELD_ORDER.forEach(f => { subFieldsByField[f] = []; });
  filtered.forEach(s => {
    if (!subFieldsByField[s.field]) subFieldsByField[s.field] = [];
    if (!subFieldsByField[s.field].includes(s.subField)) subFieldsByField[s.field].push(s.subField);
  });
  FIELD_ORDER.forEach(f => { subFieldsByField[f].sort(); });

  // Header row
  const headerRow = document.createElement('tr');
  headerRow.appendChild(el('th', { className: 'corner', colSpan: 2 }));
  types.forEach(t => {
    headerRow.appendChild(el('th', {
      className: 'col-header',
      textContent: t.name,
      style: `color:${t.color}`
    }));
  });
  table.appendChild(headerRow);

  // Build scientist id sets by sub_field
  const sciBySubField = {};
  filtered.forEach(s => {
    const key = `${s.field}|${s.subField}`;
    if (!sciBySubField[key]) sciBySubField[key] = new Set();
    sciBySubField[key].add(s.id);
  });

  // Body rows
  FIELD_ORDER.forEach(field => {
    const sfs = subFieldsByField[field];
    if (sfs.length === 0) return;

    sfs.forEach((sf, i) => {
      const tr = document.createElement('tr');

      // Field label (first sub_field only)
      if (i === 0) {
        tr.appendChild(el('th', {
          className: 'field-row-header',
          textContent: field.replace('_', ' '),
          rowSpan: sfs.length,
          style: `color:${FIELD_COLORS[field]}`
        }));
      }

      // Sub-field label
      tr.appendChild(el('th', {
        className: 'row-header',
        textContent: sf.replace(/_/g, ' ')
      }));

      // Cells
      const key = `${field}|${sf}`;
      const sciIds = sciBySubField[key] || new Set();

      types.forEach(t => {
        const td = document.createElement('td');
        // Count scientists in this sub-field with affinity to this type
        const count = affinities.filter(a =>
          sciIds.has(a.scientistId) && a.typeId === t.id
        ).length;

        if (count === 0) {
          td.className = 'm0';
        } else {
          const intensity = count >= 8 ? 4 : count >= 5 ? 3 : count >= 2 ? 2 : 1;
          td.className = `m${intensity}`;
          td.textContent = count;
        }

        td.addEventListener('click', () => showMatrixCell(field, sf, t, sciIds));
        tr.appendChild(td);
      });

      table.appendChild(tr);
    });
  });
}

function showMatrixCell(field, subField, type, sciIds) {
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  const matching = affinities
    .filter(a => sciIds.has(a.scientistId) && a.typeId === type.id)
    .map(a => {
      const sci = scientists.find(s => s.id === a.scientistId);
      return { ...a, sci };
    })
    .sort((a, b) => {
      const ord = { strong: 0, moderate: 1, weak: 2 };
      return (ord[a.affinity] || 3) - (ord[b.affinity] || 3);
    });

  panel.innerHTML = `
    <h2>
      <span style="color:${FIELD_COLORS[field]}">${subField.replace(/_/g, ' ')}</span>
      <span style="color:#555;font-weight:400"> + </span>
      <span style="color:${type.color}">${type.name}</span>
    </h2>
    <div class="detail-section">
      <h3>${matching.length} Scientist${matching.length !== 1 ? 's' : ''}</h3>
      ${matching.length > 0 ? matching.map(m => `
        <div class="school-card" style="margin-bottom:4px;background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06);cursor:pointer"
             onclick="showDetail(scientists.find(s=>s.id===${m.sci.id}))">
          <span class="school-name" style="color:#ddd">${m.sci.name}</span>
          <span class="affinity-label aff-${m.affinity}">${m.affinity}</span>
          ${isAssigned(m.sci) ? '<span class="ws-badge" style="margin-left:4px">WS</span>' : ''}
          <div style="font-size:11px;color:#888;margin-top:2px">${m.sci.contribution}</div>
          ${m.rationale ? `<div style="font-size:11px;color:#666;font-style:italic;margin-top:2px">${m.rationale}</div>` : ''}
        </div>
      `).join('') : '<div class="empty-state">No scientists in this cell</div>'}
    </div>
  `;
}

// --- Gap Analysis ---
function buildGapAnalysis() {
  const grid = document.getElementById('gap-grid');
  grid.innerHTML = '';
  const maxBar = 20;

  types.forEach(type => {
    const typeAffinities = affinities.filter(a => a.typeId === type.id);
    const sciIdsWithAffinity = new Set(typeAffinities.map(a => a.scientistId));

    let assignedCount = 0;
    let strongCount = 0;
    let moderateCount = 0;

    sciIdsWithAffinity.forEach(sciId => {
      const sci = scientists.find(s => s.id === sciId);
      if (!sci) return;
      const aff = typeAffinities.find(a => a.scientistId === sciId);
      if (isAssigned(sci) && schoolAssignments[sci.name]?.typeId === type.id) {
        assignedCount++;
      } else if (aff.affinity === 'strong') {
        strongCount++;
      } else {
        moderateCount++;
      }
    });

    const total = assignedCount + strongCount + moderateCount;
    let warning = '';
    if (strongCount + assignedCount < 5) warning = '<span class="balance-warning warn-low">thin</span>';

    grid.innerHTML += `
      <div class="type-label" style="color:${type.color}">${type.name}${warning}</div>
      <div class="bar-container">
        ${assignedCount > 0 ? `<div class="gap-bar assigned" style="width:${(assignedCount/maxBar)*100}%">${assignedCount}</div>` : ''}
        ${strongCount > 0 ? `<div class="gap-bar strong" style="width:${(strongCount/maxBar)*100}%">${strongCount}</div>` : ''}
        ${moderateCount > 0 ? `<div class="gap-bar moderate" style="width:${(moderateCount/maxBar)*100}%">${moderateCount}</div>` : ''}
        <span style="font-size:11px;color:#666;margin-left:4px">${total}</span>
      </div>
    `;
  });
}

// --- Helpers ---
function formatYears(birth, death) {
  const b = birth < 0 ? `${Math.abs(birth)} BC` : birth;
  const d = death === null || death === undefined ? 'present' : (death < 0 ? `${Math.abs(death)} BC` : death);
  return `${b}–${d}`;
}

function sigStars(n) {
  return '<span style="color:#f5b041">' + '\u2605'.repeat(n) + '</span>' +
         '<span style="color:#333">' + '\u2606'.repeat(5 - n) + '</span>';
}

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
