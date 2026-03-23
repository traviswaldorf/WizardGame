// --- State ---
let types = [];
let tierFilter = 'all';

// --- Color math ---
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hexToHsl(hex) {
  return rgbToHsl(...hexToRgb(hex));
}

// Perceived luminance for text contrast
function textColor(hex) {
  const [r, g, b] = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#1a1a2e' : '#ffffff';
}

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
      throw new Error(`Database fetch failed (${response.status}). Run build.py first.`);
    }

    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));

    loadData(db);
    db.close();

    initFilters();
    rebuildAll();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } catch (err) {
    const el = document.getElementById('error');
    el.textContent = err.message;
    el.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
  }
}

function loadData(db) {
  const rows = db.exec(`
    SELECT id, name, old_name, tier, color, secondary_color, accent_color,
           visual_motifs, card_border, icon_symbol, state_of_matter,
           energy_domain, sort_order, dark_pair_type_id, parent_type_id
    FROM types ORDER BY sort_order
  `);
  if (!rows.length) return;
  const cols = rows[0].columns;
  types = rows[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = row[i]);
    const [h, s, l] = hexToHsl(obj.color);
    obj.hue = h; obj.sat = s; obj.light = l;
    return obj;
  });
}

// --- Filters ---
function initFilters() {
  document.getElementById('filter-tier').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#filter-tier .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tierFilter = btn.dataset.filter;
    rebuildAll();
  });
}

function filtered() {
  if (tierFilter === 'all') return types;
  return types.filter(t => t.tier === tierFilter);
}

// --- Rebuild everything ---
function rebuildAll() {
  const vis = filtered();
  drawWheel(vis);
  drawHueBar(vis);
  buildCards(vis);
  buildTable(vis);
}

// ========================================
// Color Wheel (Canvas)
// ========================================
function drawWheel(vis) {
  const canvas = document.getElementById('wheel-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const outerR = 240, innerR = 150;

  ctx.clearRect(0, 0, W, H);

  // Draw hue ring — use conic gradient approach to avoid seam lines
  // Draw slightly overlapping 2° wedges to eliminate sub-pixel gaps
  for (let deg = 0; deg < 360; deg += 2) {
    const rad1 = (deg - 90 - 0.5) * Math.PI / 180;
    const rad2 = (deg + 2 - 90 + 0.5) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 0.5, rad1, rad2);
    ctx.arc(cx, cy, innerR - 0.5, rad2, rad1, true);
    ctx.closePath();
    ctx.fillStyle = `hsl(${deg + 1}, 80%, 50%)`;
    ctx.fill();
  }

  // Clean inner circle edge
  ctx.beginPath();
  ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
  ctx.fillStyle = '#151528';
  ctx.fill();

  // Clean outer circle edge
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 1, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#151528';
  ctx.stroke();

  // Center label
  ctx.fillStyle = '#555';
  ctx.font = '13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HUE WHEEL', cx, cy - 10);
  ctx.fillText(`${vis.length} types`, cx, cy + 10);

  // Plot types as dots on the ring
  const midR = (outerR + innerR) / 2;
  const dotR = 18;

  // Sort by hue
  const sorted = [...vis].sort((a, b) => a.hue - b.hue);

  // --- Label collision avoidance ---
  // Just nudge labels enough so they don't sit directly on top of each other.
  // Use a small minimum gap — keeps labels close to their actual hue position.
  const MIN_LABEL_ANGLE_GAP = 7;
  const labelAngles = sorted.map(t => t.hue);

  for (let pass = 0; pass < 30; pass++) {
    let moved = false;
    for (let i = 0; i < labelAngles.length - 1; i++) {
      let diff = labelAngles[i + 1] - labelAngles[i];
      if (diff < 0) diff += 360;
      if (diff < MIN_LABEL_ANGLE_GAP) {
        const push = (MIN_LABEL_ANGLE_GAP - diff) / 2 + 0.3;
        labelAngles[i] = (labelAngles[i] - push + 360) % 360;
        labelAngles[i + 1] = (labelAngles[i + 1] + push) % 360;
        moved = true;
      }
    }
    if (!moved) break;
  }

  // Draw dots at actual hue positions, labels at nudged positions
  sorted.forEach((t, i) => {
    const dotAngleDeg = t.hue - 90;
    const dotAngleRad = dotAngleDeg * Math.PI / 180;

    // Dot position on mid-ring
    const x = cx + midR * Math.cos(dotAngleRad);
    const y = cy + midR * Math.sin(dotAngleRad);

    // Dot
    ctx.beginPath();
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = t.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Icon in dot
    ctx.fillStyle = textColor(t.color);
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.icon_symbol || '', x, y);

    // Label at nudged angle, close to the ring
    const labelAngleDeg = labelAngles[i] - 90;
    const labelAngleRad = labelAngleDeg * Math.PI / 180;
    const labelR = outerR + 14;
    const lx = cx + labelR * Math.cos(labelAngleRad);
    const ly = cy + labelR * Math.sin(labelAngleRad);

    // Short tick mark
    const tickStartR = outerR + 2;
    const tickEndR = outerR + 10;
    ctx.beginPath();
    ctx.moveTo(cx + tickStartR * Math.cos(labelAngleRad), cy + tickStartR * Math.sin(labelAngleRad));
    ctx.lineTo(cx + tickEndR * Math.cos(labelAngleRad), cy + tickEndR * Math.sin(labelAngleRad));
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = t.color;
    ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';

    // Align text based on which side of the wheel
    const cosA = Math.cos(labelAngleRad);
    if (cosA > 0.15) ctx.textAlign = 'left';
    else if (cosA < -0.15) ctx.textAlign = 'right';
    else ctx.textAlign = 'center';

    ctx.textBaseline = Math.sin(labelAngleRad) > 0.15 ? 'top' :
                       Math.sin(labelAngleRad) < -0.15 ? 'bottom' : 'middle';

    ctx.fillText(`${t.name} (${t.hue}°)`, lx, ly);
  });
}

// ========================================
// Hue Bar (linear strip)
// ========================================
function drawHueBar(vis) {
  const container = document.getElementById('hue-bar');
  container.innerHTML = '';

  // Background gradient
  const bg = document.createElement('div');
  bg.className = 'hue-bar-bg';
  let stops = [];
  for (let i = 0; i <= 12; i++) {
    stops.push(`hsl(${i * 30}, 80%, 50%) ${(i / 12 * 100).toFixed(1)}%`);
  }
  bg.style.background = `linear-gradient(to right, ${stops.join(', ')})`;
  container.appendChild(bg);

  // Sort by hue
  const sorted = [...vis].sort((a, b) => a.hue - b.hue);

  // Assign stagger levels: within a cluster, cycle through multiple heights
  // to avoid overlap when many types share similar hues
  const levels = []; // per-item: 0 = above close, 1 = below close, 2 = above far, 3 = below far
  let clusterStart = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i].hue - sorted[i - 1].hue > 20) {
      clusterStart = i;
    }
    const indexInCluster = i - clusterStart;
    levels.push(indexInCluster % 4); // cycle 0,1,2,3
  }

  sorted.forEach((t, i) => {
    const pct = (t.hue / 360) * 100;
    const marker = document.createElement('div');
    marker.className = 'hue-marker';
    marker.style.left = `${pct}%`;

    const dot = document.createElement('div');
    dot.className = 'marker-dot';
    dot.style.background = t.color;
    marker.appendChild(dot);

    const label = document.createElement('div');
    const level = levels[i];
    const isAbove = level % 2 === 0;
    const isFar = level >= 2;

    label.className = `marker-label ${isAbove ? 'above' : 'below'}`;
    if (isFar) label.classList.add('far');
    label.textContent = `${t.name} (${t.hue}°)`;
    label.style.color = t.color;
    marker.appendChild(label);

    container.appendChild(marker);
  });

  // Analyze crowding and gaps
  analyzeHueDistribution(vis);
}

function analyzeHueDistribution(vis) {
  const alertsEl = document.getElementById('hue-alerts');
  alertsEl.innerHTML = '';

  const sorted = [...vis].sort((a, b) => a.hue - b.hue);

  // Find clusters (types within 15° of each other)
  const clusters = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].hue - current[current.length - 1].hue <= 15) {
      current.push(sorted[i]);
    } else {
      if (current.length >= 2) clusters.push([...current]);
      current = [sorted[i]];
    }
  }
  if (current.length >= 2) clusters.push([...current]);

  // Check wrap-around
  if (sorted.length >= 2) {
    const wrapDist = (sorted[0].hue + 360) - sorted[sorted.length - 1].hue;
    if (wrapDist <= 15) {
      const last = clusters.length > 0 && clusters[clusters.length - 1].includes(sorted[sorted.length - 1])
        ? clusters.pop() : [sorted[sorted.length - 1]];
      last.push(sorted[0]);
      clusters.push(last);
    }
  }

  clusters.forEach(cluster => {
    if (cluster.length < 3) return;
    const names = cluster.map(t => t.name).join(', ');
    const minH = Math.min(...cluster.map(t => t.hue));
    const maxH = Math.max(...cluster.map(t => t.hue));
    const div = document.createElement('div');
    div.className = 'crowding-alert';
    div.innerHTML = `<strong>Crowded zone (${minH}°–${maxH}°):</strong> ${cluster.length} types overlap — ${names}. Consider spreading these across more hue space for better visual distinction.`;
    alertsEl.appendChild(div);
  });

  // Find largest gaps
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push({ from: sorted[i - 1], to: sorted[i], gap: sorted[i].hue - sorted[i - 1].hue });
  }
  // Wrap gap
  if (sorted.length >= 2) {
    gaps.push({
      from: sorted[sorted.length - 1],
      to: sorted[0],
      gap: (sorted[0].hue + 360) - sorted[sorted.length - 1].hue
    });
  }

  gaps.sort((a, b) => b.gap - a.gap);
  const bigGaps = gaps.filter(g => g.gap >= 40).slice(0, 3);

  bigGaps.forEach(g => {
    const midHue = (g.from.hue + g.gap / 2) % 360;
    const div = document.createElement('div');
    div.className = 'gap-note';
    div.innerHTML = `<strong>Open space (${g.from.hue}°–${g.to.hue}°):</strong> ${g.gap}° gap between ${g.from.name} and ${g.to.name}. Mid-point ~${Math.round(midHue)}° is available.`;
    alertsEl.appendChild(div);
  });
}

// ========================================
// Type Cards
// ========================================
function buildCards(vis) {
  const container = document.getElementById('type-cards');
  container.innerHTML = '';

  vis.forEach(t => {
    const card = document.createElement('div');
    card.className = 'type-card';

    const secColor = t.secondary_color || '#333';
    const accColor = t.accent_color || '#555';
    const [sh, ss, sl] = t.secondary_color ? hexToHsl(t.secondary_color) : [0, 0, 0];
    const [ah, as, al] = t.accent_color ? hexToHsl(t.accent_color) : [0, 0, 0];

    card.innerHTML = `
      <div class="type-card-header" style="background: ${t.color}; color: ${textColor(t.color)}">
        <span class="icon">${t.icon_symbol || '?'}</span>
        <span class="name">${t.name}</span>
        <span class="tier-badge">${t.tier}</span>
      </div>
      <div class="type-card-body">
        <div class="color-swatches">
          <div class="swatch" style="background: ${t.color}; color: ${textColor(t.color)}">
            <span class="swatch-label">Primary</span>
            <span class="swatch-hex">${t.color}</span>
          </div>
          <div class="swatch" style="background: ${secColor}; color: ${textColor(secColor)}">
            <span class="swatch-label">Secondary</span>
            <span class="swatch-hex">${secColor}</span>
          </div>
          <div class="swatch" style="background: ${accColor}; color: ${textColor(accColor)}">
            <span class="swatch-label">Accent</span>
            <span class="swatch-hex">${accColor}</span>
          </div>
        </div>
        <div class="attr-row">
          <span class="attr-label">Border</span>
          <span class="attr-value">${t.card_border || '—'}</span>
        </div>
        <div class="attr-row">
          <span class="attr-label">Motifs</span>
          <span class="attr-value">${t.visual_motifs || '—'}</span>
        </div>
        <div class="attr-row">
          <span class="attr-label">Energy</span>
          <span class="attr-value">${t.energy_domain || '—'}</span>
        </div>
        <div class="hsl-info">
          H:${t.hue}° S:${t.sat}% L:${t.light}%
          ${t.secondary_color ? ` | Sec H:${sh}° S:${ss}% L:${sl}%` : ''}
          ${t.accent_color ? ` | Acc H:${ah}° S:${as}% L:${al}%` : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ========================================
// Data Table
// ========================================
function buildTable(vis) {
  const tbody = document.getElementById('attr-tbody');
  tbody.innerHTML = '';

  vis.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="color-dot" style="background:${t.color}; display:inline-block;"></span></td>
      <td><strong>${t.name}</strong> <span style="color:#666; font-size:11px;">(${t.old_name})</span></td>
      <td style="text-transform:capitalize;">${t.tier}</td>
      <td><div class="color-cell"><span class="color-dot" style="background:${t.color}"></span><span class="hex-code">${t.color}</span></div></td>
      <td><div class="color-cell"><span class="color-dot" style="background:${t.secondary_color || '#333'}"></span><span class="hex-code">${t.secondary_color || '—'}</span></div></td>
      <td><div class="color-cell"><span class="color-dot" style="background:${t.accent_color || '#555'}"></span><span class="hex-code">${t.accent_color || '—'}</span></div></td>
      <td style="font-family:Consolas,monospace; text-align:right;">${t.hue}°</td>
      <td style="font-family:Consolas,monospace; text-align:right;">${t.sat}%</td>
      <td style="font-family:Consolas,monospace; text-align:right;">${t.light}%</td>
      <td style="font-size:18px; text-align:center;">${t.icon_symbol || '—'}</td>
      <td>${t.card_border || '—'}</td>
      <td style="font-size:11px; color:#999; max-width:200px;">${t.visual_motifs || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}
