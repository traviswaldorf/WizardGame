// --- State ---
let types = [];
let schools = [];   // all wizard_school_design rows
let schoolMap = {};  // key: typeId -> array of wizards
let selectedTypeId = null;

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

    buildTypeList();

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

  const schoolRows = db.exec(`
    SELECT w.id, w.type_id, w.school_name, w.role, w.scientist_name,
           w.birth_year, w.death_year, w.contribution, w.school_of_thought,
           t.name, t.color
    FROM wizard_school_design w
    JOIN types t ON w.type_id = t.id
    ORDER BY t.sort_order, w.role
  `);
  schools = schoolRows[0].values.map(r => ({
    id: r[0], typeId: r[1], schoolName: r[2], role: r[3], scientistName: r[4],
    birthYear: r[5], deathYear: r[6], contribution: r[7], schoolOfThought: r[8],
    typeName: r[9], typeColor: r[10]
  }));

  schools.forEach(w => {
    if (!schoolMap[w.typeId]) schoolMap[w.typeId] = [];
    schoolMap[w.typeId].push(w);
  });
}

// --- Type List ---
function buildTypeList() {
  const list = document.getElementById('type-list');
  const tiers = ['primary', 'secondary', 'tertiary'];
  const tierLabels = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

  tiers.forEach(tier => {
    const section = el('div', { className: 'tier-section' });
    section.appendChild(el('div', { className: 'tier-label', textContent: tierLabels[tier] }));

    const tierTypes = types.filter(t => t.tier === tier);
    tierTypes.forEach(type => {
      const wizards = schoolMap[type.id] || [];
      const head = wizards.find(w => w.role === 'head');
      const schoolName = head ? head.schoolName : '';

      const card = el('div', { className: 'type-card' });
      card.dataset.typeId = type.id;
      card.appendChild(el('span', { className: 'type-dot', style: `background:${type.color}` }));

      const info = el('div', { className: 'type-info' });
      info.appendChild(el('div', { className: 'type-name', textContent: type.name, style: `color:${type.color}` }));
      info.appendChild(el('div', { className: 'school-name', textContent: schoolName }));
      card.appendChild(info);

      card.addEventListener('click', () => showDetail(type));
      section.appendChild(card);
    });

    list.appendChild(section);
  });
}

// --- Detail Panel ---
function showDetail(type) {
  selectedTypeId = type.id;

  // Update active state on type cards
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.toggle('active', parseInt(card.dataset.typeId) === type.id);
  });

  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  const content = document.getElementById('detail-content');

  if (placeholder) placeholder.style.display = 'none';
  content.style.display = 'block';

  const wizards = schoolMap[type.id] || [];
  const head = wizards.find(w => w.role === 'head');
  const pupils = wizards.filter(w => w.role !== 'head');

  let html = '';

  // School header
  html += `<div class="school-header">`;
  html += `<h2><span class="type-dot" style="background:${type.color}"></span>`;
  html += `<span style="color:${type.color}">${type.name}</span></h2>`;
  if (head) {
    html += `<div class="school-subtitle">${head.schoolName}</div>`;
  }
  html += `</div>`;

  // Head wizard card
  if (head) {
    html += wizardCard(head, type.color);
  }

  // Pupils
  if (pupils.length > 0) {
    html += `<div class="pupils-label">Pupils</div>`;
    pupils.forEach(pupil => {
      html += wizardCard(pupil, type.color);
    });
  }

  content.innerHTML = html;
  panel.scrollTop = 0;
}

function wizardCard(wizard, typeColor) {
  const isHead = wizard.role === 'head';
  const roleLabel = isHead ? 'Head Wizard' : 'Pupil';
  const roleCls = isHead ? 'head' : 'pupil';

  const birthStr = wizard.birthYear < 0
    ? `${Math.abs(wizard.birthYear)} BC`
    : wizard.birthYear;
  const deathStr = wizard.deathYear < 0
    ? `${Math.abs(wizard.deathYear)} BC`
    : wizard.deathYear;

  let html = `<div class="wizard-card">`;
  html += `<div class="role-badge ${roleCls}">${roleLabel}</div>`;
  html += `<div class="scientist-name">${wizard.scientistName}</div>`;
  html += `<div class="years">${birthStr} &ndash; ${deathStr}</div>`;
  html += `<div class="contribution">${wizard.contribution}</div>`;

  if (wizard.schoolOfThought) {
    html += `<div class="school-of-thought" style="border-left-color:${typeColor}">`;
    html += `<div class="thought-label">School of Thought</div>`;
    html += `<div class="thought-name">${wizard.schoolOfThought}</div>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
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
