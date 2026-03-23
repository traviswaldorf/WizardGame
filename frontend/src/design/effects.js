// --- State ---
let types = [];
let typeMap = {};
let effects = [];
let links = [];
let categoryFilter = 'all';
let classFilter = 'all';

const CAT_COLORS = {
  aggro: '#E74C3C', control: '#2E86C1', search: '#7D3C98',
  growth: '#27AE60', defensive: '#F4D03F', unassigned: '#888'
};

const CATEGORIES = ['aggro', 'control', 'search', 'growth', 'defensive', 'unassigned'];
const ARCHETYPES = {
  aggro: ['damage', 'destroy'],
  control: ['counter', 'steal'],
  search: ['draw'],
  growth: ['revive', 'discount'],
  defensive: ['prevent', 'block'],
  unassigned: ['discard']
};

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
    FROM effect_design
    ORDER BY category, archetype, name
  `);
  if (effectRows.length > 0) {
    effects = effectRows[0].values.map(r => ({
      id: r[0], category: r[1], archetype: r[2], name: r[3], description: r[4],
      effectClass: r[5], isSelected: r[6], notes: r[7]
    }));
  }

  const linkRows = db.exec(`
    SELECT etl.id, etl.effect_id, etl.type_id, etl.type_combination_id, etl.role,
           etl.is_selected, etl.notes,
           t.name as type_name, t.color as type_color
    FROM effect_type_link_design etl
    LEFT JOIN types t ON etl.type_id = t.id
  `);
  if (linkRows.length > 0) {
    links = linkRows[0].values.map(r => ({
      id: r[0], effectId: r[1], typeId: r[2], typeCombinationId: r[3], role: r[4],
      isSelected: r[5], notes: r[6], typeName: r[7], typeColor: r[8]
    }));
  }
}

// --- Filtering ---
function initFilters() {
  setupFilterBar('filter-category', f => { categoryFilter = f; });
  setupFilterBar('filter-class', f => { classFilter = f; });
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
  // Category counts (respecting class filter)
  const classFiltered = classFilter === 'all' ? effects : effects.filter(e => e.effectClass === classFilter);
  const catCounts = { all: classFiltered.length };
  CATEGORIES.forEach(c => { catCounts[c] = classFiltered.filter(e => e.category === c).length; });
  document.querySelectorAll('#filter-category .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = catCounts[f] ?? 0;
  });

  // Class counts (respecting category filter)
  const catFiltered = categoryFilter === 'all' ? effects : effects.filter(e => e.category === categoryFilter);
  const clsCounts = { all: catFiltered.length, instant: 0, status: 0, dot: 0, permanent: 0, aura: 0 };
  catFiltered.forEach(e => { if (e.effectClass && clsCounts[e.effectClass] !== undefined) clsCounts[e.effectClass]++; });
  document.querySelectorAll('#filter-class .filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    let badge = btn.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; btn.appendChild(badge); }
    badge.textContent = clsCounts[f] ?? 0;
  });
}

function getFilteredEffects() {
  return effects.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (classFilter !== 'all' && e.effectClass !== classFilter) return false;
    return true;
  });
}

// --- Rebuild ---
function rebuildView() {
  buildSummary();
  buildTree();
}

function buildSummary() {
  const filtered = getFilteredEffects();
  const archetypeSet = new Set(filtered.map(e => e.archetype));
  const linkedTypes = new Set(links.filter(l => l.typeId).map(l => l.typeId));
  const linkedCombos = new Set(links.filter(l => l.typeCombinationId).map(l => l.typeCombinationId));

  document.getElementById('summary-bar').innerHTML = `
    <div class="summary-stat">
      <div class="value">${archetypeSet.size}</div>
      <div class="label">Archetypes</div>
    </div>
    <div class="summary-stat">
      <div class="value">${filtered.length}</div>
      <div class="label">Expressions</div>
    </div>
    <div class="summary-stat">
      <div class="value">${linkedTypes.size}</div>
      <div class="label">Linked Types</div>
    </div>
    <div class="summary-stat">
      <div class="value">${linkedCombos.size}</div>
      <div class="label">Linked Combos</div>
    </div>
  `;
}

function buildTree() {
  const container = document.getElementById('tree-view');
  container.innerHTML = '';
  const filtered = getFilteredEffects();

  const categoriesToShow = categoryFilter === 'all' ? CATEGORIES : [categoryFilter];

  categoriesToShow.forEach(cat => {
    const catEffects = filtered.filter(e => e.category === cat);
    if (catEffects.length === 0 && categoryFilter !== 'all') return;

    const group = document.createElement('div');
    group.className = `category-group cat-border-${cat}`;

    // Category header
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span class="caret">&#9660;</span>
      <span class="cat-name cat-color-${cat}">${cat}</span>
      <span class="cat-count">${catEffects.length} expression${catEffects.length !== 1 ? 's' : ''}</span>
    `;

    const body = document.createElement('div');
    body.className = 'category-body';

    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      body.classList.toggle('hidden');
    });

    // Archetype sections within this category
    const archList = ARCHETYPES[cat] || [];
    archList.forEach(arch => {
      const archEffects = catEffects.filter(e => e.archetype === arch);
      if (archEffects.length === 0 && classFilter !== 'all') return;

      const section = document.createElement('div');
      section.className = 'archetype-section';

      // Archetype links for this archetype
      const archEffectIds = new Set(effects.filter(e => e.archetype === arch).map(e => e.id));
      const archLinks = links.filter(l => archEffectIds.has(l.effectId) && l.typeId);
      const typeCount = new Set(archLinks.map(l => l.typeId)).size;

      const archHeader = document.createElement('div');
      archHeader.className = 'archetype-header';
      archHeader.innerHTML = `
        <span class="arch-name">${arch}</span>
        <span class="link-count">${typeCount} type${typeCount !== 1 ? 's' : ''}</span>
      `;
      archHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        showArchetypeDetail(arch, cat);
        document.querySelectorAll('.archetype-header').forEach(h => h.classList.remove('selected'));
        document.querySelectorAll('.expression-card').forEach(c => c.classList.remove('selected'));
        archHeader.classList.add('selected');
      });

      section.appendChild(archHeader);

      // Expression cards
      const list = document.createElement('div');
      list.className = 'expression-list';

      archEffects.forEach(eff => {
        const card = document.createElement('div');
        card.className = 'expression-card';
        card.innerHTML = `
          <span class="expr-name">${eff.name}</span>
          ${eff.isSelected ? '<span class="selected-marker">&#10003;</span>' : ''}
          ${eff.effectClass ? `<span class="class-badge class-${eff.effectClass}">${eff.effectClass}</span>` : ''}
          <span class="expr-desc">${eff.description || ''}</span>
        `;
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          showExpressionDetail(eff);
          document.querySelectorAll('.archetype-header').forEach(h => h.classList.remove('selected'));
          document.querySelectorAll('.expression-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
        list.appendChild(card);
      });

      section.appendChild(list);
      body.appendChild(section);
    });

    group.appendChild(header);
    group.appendChild(body);
    container.appendChild(group);
  });
}

// --- Detail Panel ---
function showArchetypeDetail(archetype, category) {
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  // All effects for this archetype (unfiltered)
  const archEffects = effects.filter(e => e.archetype === archetype);
  const archEffectIds = new Set(archEffects.map(e => e.id));

  // Linked types
  const typeLinks = links.filter(l => archEffectIds.has(l.effectId) && l.typeId);
  const linkedTypeIds = new Set(typeLinks.map(l => l.typeId));

  // Missing types
  const missingTypes = types.filter(t => !linkedTypeIds.has(t.id));

  // Group links by role
  const primaryLinks = typeLinks.filter(l => l.role === 'primary');
  const secondaryLinks = typeLinks.filter(l => l.role === 'secondary');
  const situationalLinks = typeLinks.filter(l => l.role === 'situational');

  // Combo links
  const comboLinks = links.filter(l => archEffectIds.has(l.effectId) && l.typeCombinationId);

  panel.innerHTML = `
    <h2>
      <span class="cat-color-${category}">${capitalize(archetype)}</span>
      <span style="color:#555;font-size:14px;font-weight:400">${capitalize(category)}</span>
    </h2>

    <div class="detail-section">
      <h3>Primary Types (${primaryLinks.length})</h3>
      ${primaryLinks.length > 0 ? `<div class="type-dot-list">
        ${primaryLinks.map(l => typeDot(l, 'primary')).join('')}
      </div>` : '<div class="empty-state">None assigned</div>'}
    </div>

    <div class="detail-section">
      <h3>Secondary Types (${secondaryLinks.length})</h3>
      ${secondaryLinks.length > 0 ? `<div class="type-dot-list">
        ${secondaryLinks.map(l => typeDot(l, 'secondary')).join('')}
      </div>` : '<div class="empty-state">None assigned</div>'}
    </div>

    ${situationalLinks.length > 0 ? `<div class="detail-section">
      <h3>Situational Types (${situationalLinks.length})</h3>
      <div class="type-dot-list">
        ${situationalLinks.map(l => typeDot(l, 'situational')).join('')}
      </div>
    </div>` : ''}

    <div class="detail-section">
      <h3>Missing Types (${missingTypes.length})</h3>
      ${missingTypes.length > 0 ? `<div class="type-dot-list">
        ${missingTypes.map(t => `<span class="type-dot missing">
          <span class="dot" style="background:${t.color}"></span>
          ${t.name}
        </span>`).join('')}
      </div>` : '<div class="empty-state">All types covered!</div>'}
    </div>

    <div class="detail-section">
      <h3>Expressions (${archEffects.length})</h3>
      ${archEffects.map(e => `
        <div class="combo-link-card">
          <span class="combo-name">${e.name}</span>
          ${e.effectClass ? `<span class="class-badge class-${e.effectClass}">${e.effectClass}</span>` : ''}
          ${e.isSelected ? '<span style="color:#5ddb8a;font-size:11px;margin-left:4px">&#10003;</span>' : ''}
          <div style="font-size:11px;color:#888;margin-top:2px">${e.description || ''}</div>
        </div>
      `).join('')}
    </div>

    ${comboLinks.length > 0 ? `<div class="detail-section">
      <h3>Linked Combinations (${comboLinks.length})</h3>
      ${comboLinks.map(l => `<div class="combo-link-card">Combo #${l.typeCombinationId}</div>`).join('')}
    </div>` : ''}
  `;
}

function showExpressionDetail(eff) {
  const panel = document.getElementById('detail');
  const placeholder = panel.querySelector('.placeholder');
  if (placeholder) placeholder.style.display = 'none';

  // Links for this specific effect
  const effLinks = links.filter(l => l.effectId === eff.id);
  const typeLinks = effLinks.filter(l => l.typeId);
  const comboLinks = effLinks.filter(l => l.typeCombinationId);

  panel.innerHTML = `
    <h2>${eff.name}</h2>

    <div class="detail-section">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <span class="cat-color-${eff.category}" style="font-weight:600;text-transform:capitalize">${eff.category}</span>
        <span style="color:#555">/</span>
        <span style="font-weight:600;text-transform:capitalize">${eff.archetype}</span>
        ${eff.effectClass ? `<span class="class-badge class-${eff.effectClass}">${eff.effectClass}</span>` : ''}
        ${eff.isSelected ? '<span style="color:#5ddb8a;font-size:12px">&#10003; selected</span>' : ''}
      </div>
      ${eff.description ? `<div style="font-size:13px;color:#bbb;margin-bottom:8px">${eff.description}</div>` : ''}
      ${eff.notes ? `<div style="font-size:12px;color:#888;font-style:italic">${eff.notes}</div>` : ''}
    </div>

    <div class="detail-section">
      <h3>Linked Types (${typeLinks.length})</h3>
      ${typeLinks.length > 0 ? `<div class="type-dot-list">
        ${typeLinks.map(l => typeDot(l, l.role)).join('')}
      </div>` : '<div class="empty-state">No type links</div>'}
    </div>

    ${comboLinks.length > 0 ? `<div class="detail-section">
      <h3>Linked Combinations (${comboLinks.length})</h3>
      ${comboLinks.map(l => `<div class="combo-link-card">Combo #${l.typeCombinationId}</div>`).join('')}
    </div>` : ''}
  `;
}

// --- Helpers ---
function typeDot(link, role) {
  return `<span class="type-dot">
    <span class="dot" style="background:${link.typeColor}"></span>
    ${link.typeName}
    <span class="role-badge role-${role}">${role}</span>
    ${link.notes ? `<span style="font-size:10px;color:#666" title="${link.notes}">*</span>` : ''}
  </span>`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
