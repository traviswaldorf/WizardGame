// --- State ---
let types = [];
let counters = [];
let counterMap = {};  // key: "sourceId-targetId" -> counter object
let selectedType = null;

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

    buildMatrix();
    buildStats();

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

  const counterRows = db.exec(`
    SELECT c.source_type_id, c.target_type_id, c.grounding, c.mechanism,
           c.is_mutual, c.is_confirmed, s.name, t.name, s.color, t.color
    FROM counter_design c
    JOIN types s ON c.source_type_id = s.id
    JOIN types t ON c.target_type_id = t.id
  `);
  counters = counterRows[0].values.map(r => ({
    sourceId: r[0], targetId: r[1], grounding: r[2], mechanism: r[3],
    isMutual: r[4], isConfirmed: r[5], sourceName: r[6], targetName: r[7],
    sourceColor: r[8], targetColor: r[9]
  }));

  counters.forEach(c => {
    counterMap[`${c.sourceId}-${c.targetId}`] = c;
  });
}

// --- Matrix ---
function buildMatrix() {
  const table = document.getElementById('matrix');
  const tiers = ['primary', 'secondary', 'tertiary'];
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
      onclick: () => showDetail(t),
      title: `${t.name} (${t.oldName})`
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows grouped by tier
  const tbody = document.createElement('tbody');
  let currentTier = null;

  types.forEach((sourceType, rowIdx) => {
    const tr = document.createElement('tr');
    tr.dataset.typeId = sourceType.id;

    // Tier label cell (spans the tier group)
    if (sourceType.tier !== currentTier) {
      currentTier = sourceType.tier;
      const tierTypes = types.filter(t => t.tier === currentTier);
      const tierTh = el('th', {
        className: 'tier-label',
        textContent: tierLabels[currentTier],
        rowSpan: tierTypes.length
      });
      tr.appendChild(tierTh);
    }

    // Row header
    const rowTh = el('th', {
      className: 'row-header',
      textContent: sourceType.name,
      style: `color: ${sourceType.color}`,
      onclick: () => showDetail(sourceType),
      title: `${sourceType.name} (${sourceType.oldName})`
    });
    tr.appendChild(rowTh);

    // Data cells
    types.forEach(targetType => {
      const td = document.createElement('td');
      td.dataset.source = sourceType.id;
      td.dataset.target = targetType.id;

      if (sourceType.id === targetType.id) {
        td.className = 'self';
      } else {
        const counter = counterMap[`${sourceType.id}-${targetType.id}`];
        if (counter) {
          td.className = `g${counter.grounding}`;
          td.textContent = counter.grounding;

          if (counter.isConfirmed) td.classList.add('confirmed');
          if (counter.isMutual) {
            const badge = el('span', { className: 'mutual-badge', innerHTML: '&#8644;' });
            td.appendChild(badge);
          }

          td.addEventListener('mouseenter', e => showTooltip(e, counter));
          td.addEventListener('mousemove', e => moveTooltip(e));
          td.addEventListener('mouseleave', hideTooltip);
        } else {
          td.className = 'empty';
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

// --- Tooltip ---
function showTooltip(e, counter) {
  const tip = document.getElementById('tooltip');
  const stars = starString(counter.grounding);
  const groundLabel = ['', 'Thematic', 'Soft Physics', 'Hard Physics'][counter.grounding];

  let badges = '';
  if (counter.isMutual) badges += '<span class="badge mutual">&#8644; Mutual</span>';
  if (counter.isConfirmed) badges += '<span class="badge confirmed">&#10003; Confirmed</span>';

  tip.innerHTML = `
    <div class="tt-header">
      <span style="color:${counter.sourceColor}">${counter.sourceName}</span>
      <span style="color:#666"> &#9654; </span>
      <span style="color:${counter.targetColor}">${counter.targetName}</span>
    </div>
    <div class="tt-stars">${stars} <span style="color:#888; font-size:11px">${groundLabel}</span></div>
    <div class="tt-mechanism">${counter.mechanism}</div>
    ${badges ? `<div class="tt-badges">${badges}</div>` : ''}
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
function showDetail(type) {
  selectedType = type;
  const panel = document.getElementById('detail');
  const title = document.getElementById('detail-title');
  const placeholder = panel.querySelector('.placeholder');
  const columns = panel.querySelector('.columns');

  // Hide placeholder, show content
  if (placeholder) placeholder.style.display = 'none';
  title.style.display = 'flex';
  columns.style.display = 'flex';

  title.innerHTML = `<span class="type-dot" style="background:${type.color}"></span>` +
    `${type.name} <span style="color:#666; font-size:14px">(${type.oldName})</span>` +
    `<span style="color:#555; font-size:12px; font-weight:400; margin-left:6px">${type.tier}</span>`;

  // Resistances: things this type counters (source = this type)
  const resistances = counters
    .filter(c => c.sourceId === type.id)
    .sort((a, b) => b.grounding - a.grounding);

  // Weaknesses: things that counter this type (target = this type)
  const weaknesses = counters
    .filter(c => c.targetId === type.id)
    .sort((a, b) => b.grounding - a.grounding);

  document.getElementById('detail-resistances').innerHTML =
    resistances.length ? resistances.map(c => counterRow(c, 'target')).join('') :
      '<div style="color:#555; padding:8px">No resistances recorded</div>';

  document.getElementById('detail-weaknesses').innerHTML =
    weaknesses.length ? weaknesses.map(c => counterRow(c, 'source')).join('') :
      '<div style="color:#555; padding:8px">No weaknesses recorded</div>';

  panel.scrollTop = 0;
}

function counterRow(counter, nameField) {
  const name = nameField === 'target' ? counter.targetName : counter.sourceName;
  const color = nameField === 'target' ? counter.targetColor : counter.sourceColor;
  const badges = [
    counter.isMutual ? '<span style="color:#7ab8f5; font-size:11px">&#8644;</span>' : '',
    counter.isConfirmed ? '<span style="color:#5ddb8a; font-size:11px">&#10003;</span>' : ''
  ].filter(Boolean).join(' ');

  return `
    <div class="counter-row">
      <span class="type-name" style="color:${color}">${name}</span>
      <span class="stars">${starString(counter.grounding)}</span>
      <span class="mechanism">${counter.mechanism}</span>
      ${badges}
    </div>
  `;
}

// --- Stats ---
function buildStats() {
  const grid = document.getElementById('stats-grid');
  const maxCount = 12; // scale factor for bar width

  types.forEach(type => {
    const weaknesses = counters.filter(c => c.targetId === type.id);
    const resistances = counters.filter(c => c.sourceId === type.id);
    const wCount = weaknesses.length;
    const rCount = resistances.length;

    // Weighted scores
    const wScore = weaknesses.reduce((s, c) => s + c.grounding, 0);
    const rScore = resistances.reduce((s, c) => s + c.grounding, 0);

    grid.innerHTML += `
      <div class="type-label" style="color:${type.color}">${type.name}</div>
      <div class="bar-left">
        <div class="bar weakness" style="width:${(wScore / (maxCount * 3)) * 100}%" title="${wCount} weaknesses (weighted: ${wScore})"></div>
      </div>
      <div class="count" style="color:rgba(231,76,60,0.9)">${wCount}</div>
      <div class="count" style="color:rgba(46,204,113,0.9)">${rCount}</div>
      <div class="bar-right">
        <div class="bar resistance" style="width:${(rScore / (maxCount * 3)) * 100}%" title="${rCount} resistances (weighted: ${rScore})"></div>
      </div>
    `;
  });
}

// --- Helpers ---
function starString(grounding) {
  const filled = '<span class="filled">&#9733;</span>';
  const empty = '<span class="empty-star">&#9734;</span>';
  return filled.repeat(grounding) + empty.repeat(3 - grounding);
}

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
