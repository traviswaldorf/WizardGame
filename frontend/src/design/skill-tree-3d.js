/**
 * 3D Interactive Skill Tree — Three.js powered.
 * Diamond compass layout with elevation: outward = upward.
 * Tertiaries curl below the plane (dark side).
 * Camera: starts flat (top-down), "Reveal Dark Side" tilts to show depth.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === Data ===
let types = {};
let nodes = {};
let costs = {};
let prerequisites = {};
let effects = {};
let gateRequirements = {};
let metaUnlocks = [];
let metaUnlockMap = {};

// === Layout ===
const TYPE_ANGLE = {
  1: -Math.PI / 2, 2: 0, 3: Math.PI / 2, 4: Math.PI,        // primaries
  5: -Math.PI / 4, 6: Math.PI / 4, 7: 3*Math.PI/4, 8: -3*Math.PI/4, // secondaries
  9: -Math.PI/2, 10: 0, 11: Math.PI/2, 12: Math.PI,          // tertiary (dark primary)
  13: -Math.PI/4, 14: Math.PI/4, 15: 3*Math.PI/4, 16: -3*Math.PI/4, // tertiary (dark secondary)
};

const BRANCH_ANGLE = {
  'fire_earth': -Math.PI/4, 'fire_air': -3*Math.PI/4,
  'earth_fire': -Math.PI/4, 'earth_water': Math.PI/4,
  'water_earth': Math.PI/4, 'water_air': 3*Math.PI/4,
  'air_fire': -3*Math.PI/4, 'air_water': 3*Math.PI/4,
};

const BRANCH_SOURCE_TYPE = {
  'core': null,
  'fire_earth': 1, 'fire_air': 1, 'earth_fire': 2, 'earth_water': 2,
  'water_earth': 3, 'water_air': 3, 'air_fire': 4, 'air_water': 4,
};

const SECONDARY_BRANCH = new Set(['earth_fire', 'water_earth', 'air_fire', 'air_water']);

// Torus geometry parameters
// R = major radius (center of donut to center of tube)
// r = minor radius (radius of the tube itself)
const TORUS_R = 50;  // major radius
const TORUS_r = 20;  // minor radius

// Minor angle (phi) — position around the tube cross-section.
// 0 = top of tube (outermost from donut hole), PI = bottom (innermost).
// Light side tiers wrap from top, dark side continues underneath.
const TIER_PHI = {
  1: -Math.PI / 3,      // starter: top-front of tube
  2: -Math.PI / 6,      // shallow
  3: 0,                 // equator (outermost point)
  4: Math.PI / 6,       // gates: starting to curve down
  5: Math.PI / 3,       // secondary
  6: Math.PI / 2.2,     // deeper secondary
  7: Math.PI - Math.PI / 3,    // tertiary: wrapping underneath
  8: Math.PI - Math.PI / 6,    // deep tertiary: near bottom
};

const CATEGORY_COLORS = {
  'starter': 0x5ddede, 'energy': 0x5dde5d, 'spell_pool': 0x5d5dde,
  'passive': 0xdede5d, 'gate': 0xdea05d, 'discovery': 0xde5dde,
};

// === State ===
let investedNodes = new Set();
let xpBudget = {};
let xpBudgetMax = {};
let showMeta = true;

// === Three.js ===
let scene, camera, renderer3d, raycaster, mouse;
let container, tooltip;
let nodeMeshes = {};     // nodeId -> THREE.Mesh
let edgeLines = {};      // "fromId_toId" -> THREE.Line
let labelSprites = {};   // nodeId -> THREE.Sprite
let hoveredNode = null;

// Camera animation
let controls;
let camState = 'flat';
let camLerp = 0;
let camAnimating = false;
let camFromPos, camFromTarget, camToPos, camToTarget;

// =============================================
// SQL helpers
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

// =============================================
// Data loading
// =============================================

function loadData(db) {
  queryAll(db, `SELECT id, name, color, tier, sort_order FROM types`)
    .forEach(t => types[t.id] = t);

  queryAll(db, `SELECT n.id, n.name, n.description, n.flavor_text, n.type_id,
    n.category, n.tier, n.branch, n.visibility, n.meta_unlock_id, n.sort_order,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node n
    LEFT JOIN types t ON n.type_id = t.id
    ORDER BY n.sort_order`)
    .forEach(n => nodes[n.id] = n);

  queryAll(db, `SELECT nc.node_id, nc.type_id, nc.amount, t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_node_cost nc
    JOIN types t ON nc.type_id = t.id`)
    .forEach(c => { (costs[c.node_id] ??= []).push(c); });

  queryAll(db, `SELECT node_id, required_node_id, prerequisite_group
    FROM prototype_roguelike_node_prerequisite ORDER BY prerequisite_group`)
    .forEach(p => {
      prerequisites[p.node_id] ??= {};
      (prerequisites[p.node_id][p.prerequisite_group] ??= []).push(p.required_node_id);
    });

  queryAll(db, `SELECT ne.node_id, ne.effect_type, ne.target_type_id, ne.value,
    ne.description, t.name AS target_type_name
    FROM prototype_roguelike_node_effect ne
    LEFT JOIN types t ON ne.target_type_id = t.id`)
    .forEach(e => { (effects[e.node_id] ??= []).push(e); });

  queryAll(db, `SELECT gr.gate_node_id, gr.required_type_id, gr.required_depth,
    t.name AS type_name, t.color AS type_color
    FROM prototype_roguelike_gate_requirement gr
    JOIN types t ON gr.required_type_id = t.id`)
    .forEach(g => { (gateRequirements[g.gate_node_id] ??= []).push(g); });

  metaUnlocks = queryAll(db, `SELECT mu.id, mu.name, mu.description, mu.layer, mu.category,
    mu.target_type_id, t.name AS target_type_name
    FROM prototype_roguelike_meta_unlock mu
    LEFT JOIN types t ON mu.target_type_id = t.id
    ORDER BY mu.layer, mu.id`);
  metaUnlocks.forEach(mu => metaUnlockMap[mu.id] = mu);
}

// =============================================
// 3D Layout
// =============================================

/**
 * Position a node on the torus surface.
 * theta = major angle (compass direction around the ring)
 * phi = minor angle (progression depth around the tube cross-section)
 *
 * Torus parametric: x = (R + r*cos(phi)) * cos(theta)
 *                   y = r * sin(phi)
 *                   z = (R + r*cos(phi)) * sin(theta)
 */
function computePosition3D(node) {
  const branch = node.branch || 'core';
  const srcType = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;

  // Major angle (theta) — compass direction
  let theta;
  if (node.category === 'gate') {
    const gateReqs = gateRequirements[node.id];
    if (gateReqs && gateReqs.length >= 2) {
      const a1 = TYPE_ANGLE[gateReqs[0].required_type_id] ?? 0;
      const a2 = TYPE_ANGLE[gateReqs[1].required_type_id] ?? 0;
      theta = Math.atan2(Math.sin(a1)+Math.sin(a2), Math.cos(a1)+Math.cos(a2));
    } else {
      theta = TYPE_ANGLE[srcType] ?? 0;
    }
  } else if (branch === 'core' || !BRANCH_ANGLE[branch]) {
    theta = TYPE_ANGLE[srcType] ?? 0;
  } else {
    theta = BRANCH_ANGLE[branch] ?? TYPE_ANGLE[srcType] ?? 0;
  }

  // Minor angle (phi) — progression depth around the tube
  const phi = TIER_PHI[node.tier] ?? 0;

  return torusPoint(theta, phi);
}

function torusPoint(theta, phi) {
  const x = (TORUS_R + TORUS_r * Math.cos(phi)) * Math.cos(theta);
  const y = TORUS_r * Math.sin(phi);
  const z = (TORUS_R + TORUS_r * Math.cos(phi)) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// =============================================
// Build 3D scene
// =============================================

function buildScene() {
  // Group for sub-spacing
  const groups = {};
  for (const node of Object.values(nodes)) {
    const branch = node.branch || 'core';
    const src = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;
    const key = `${src}_${node.tier}_${branch}`;
    (groups[key] ??= []).push(node);
  }

  // Build nodes
  for (const node of Object.values(nodes)) {
    const pos = computePosition3D(node);
    const branch = node.branch || 'core';
    const src = BRANCH_SOURCE_TYPE[branch] ?? node.type_id;
    const key = `${src}_${node.tier}_${branch}`;
    const group = groups[key] || [node];

    // Sub-spacing perpendicular
    if (group.length > 1) {
      const angle = Math.atan2(pos.z, pos.x);
      const perpAngle = angle + Math.PI / 2;
      const idx = group.indexOf(node);
      const offset = (idx - (group.length - 1) / 2) * 8;
      pos.x += Math.cos(perpAngle) * offset;
      pos.z += Math.sin(perpAngle) * offset;
    }

    const color = new THREE.Color(node.type_color || '#888888');
    const isTertiary = node.tier >= 7;
    const isGate = node.category === 'gate';

    // Geometry
    let geom;
    if (isGate) {
      geom = new THREE.OctahedronGeometry(2.2);
    } else if (isTertiary) {
      geom = new THREE.IcosahedronGeometry(2.0);
    } else {
      geom = new THREE.SphereGeometry(2.0, 16, 12);
    }

    // Material
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      emissive: color,
      emissiveIntensity: 0.1,
      metalness: 0.3,
      roughness: 0.7,
      transparent: true,
      opacity: 0.4,
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);
    mesh.userData = { nodeId: node.id, typeColor: color, isTertiary };

    scene.add(mesh);
    nodeMeshes[node.id] = mesh;

    // Label sprite (hide on secondary branch duplicates)
    if (!SECONDARY_BRANCH.has(branch)) {
      const sprite = makeLabel(node.name, node.type_color || '#888888');
      sprite.position.copy(pos);
      sprite.position.y -= 3.5;
      scene.add(sprite);
      labelSprites[node.id] = sprite;
    }
  }

  // Type label sprites on the torus (at starter tier, slightly inside)
  for (const [typeIdStr, angle] of Object.entries(TYPE_ANGLE)) {
    const typeId = parseInt(typeIdStr);
    if (typeId > 4) continue; // only primary labels
    const type = types[typeId];
    if (!type) continue;
    const sprite = makeLabel(type.name.toUpperCase(), type.color, 18);
    const labelPos = torusPoint(angle, TIER_PHI[1]);
    sprite.position.copy(labelPos);
    sprite.position.y += 5; // float above the node
    scene.add(sprite);
  }

  // Build edges
  for (const [nodeId, prereqGroups] of Object.entries(prerequisites)) {
    const targetMesh = nodeMeshes[nodeId];
    if (!targetMesh) continue;
    for (const group of Object.values(prereqGroups)) {
      for (const reqId of group) {
        const sourceMesh = nodeMeshes[reqId];
        if (!sourceMesh) continue;
        buildEdge3D(reqId, parseInt(nodeId), sourceMesh.position, targetMesh.position);
      }
    }
  }

  refreshAllStates();
}

function buildEdge3D(fromId, toId, fromPos, toPos) {
  const fromNode = nodes[fromId];
  const toNode = nodes[toId];

  // Create a curve — straight for same-plane, curved for cross-plane (tertiary transitions)
  const midY = (fromPos.y + toPos.y) / 2;
  const points = [
    fromPos.clone(),
    new THREE.Vector3((fromPos.x + toPos.x) / 2, midY, (fromPos.z + toPos.z) / 2),
    toPos.clone(),
  ];
  const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
  const curvePoints = curve.getPoints(20);
  const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);

  const mat = new THREE.LineBasicMaterial({
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.3,
  });

  const line = new THREE.Line(geom, mat);
  scene.add(line);
  edgeLines[`${fromId}_${toId}`] = { line, fromId, toId };
}

function makeLabel(text, color, fontSize = 11) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  ctx.font = `${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 32, 250);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(16, 4, 1);
  return sprite;
}

// =============================================
// State Management (same logic as Cytoscape version)
// =============================================

function getNodeState(nodeId) {
  if (investedNodes.has(nodeId)) return 'invested';
  const node = nodes[nodeId];
  if (!node) return 'locked';
  if (node.visibility === 'meta' && !showMeta) return 'locked';

  const prereqGroups = prerequisites[nodeId];
  if (prereqGroups) {
    const satisfied = Object.values(prereqGroups).some(group =>
      group.every(reqId => investedNodes.has(reqId))
    );
    if (!satisfied) return 'locked';
  }

  const gateReqs = gateRequirements[nodeId];
  if (gateReqs) {
    for (const req of gateReqs) {
      if (countInvestedDepth(req.required_type_id) < req.required_depth) return 'locked';
    }
  }

  const nodeCosts = costs[nodeId] || [];
  const canAfford = nodeCosts.every(c => (xpBudget[c.type_id] || 0) >= c.amount);
  return canAfford ? 'available' : 'expensive';
}

function countInvestedDepth(typeId) {
  let count = 0;
  for (const id of investedNodes) {
    if (nodes[id]?.type_id === typeId) count++;
  }
  return count;
}

function investNode(nodeId) {
  if (getNodeState(nodeId) !== 'available') return;
  for (const c of (costs[nodeId] || [])) {
    xpBudget[c.type_id] = (xpBudget[c.type_id] || 0) - c.amount;
  }
  investedNodes.add(nodeId);
  refreshAllStates();
  updateXpDisplay();
}

function refreshAllStates() {
  // Update node materials
  for (const node of Object.values(nodes)) {
    const mesh = nodeMeshes[node.id];
    if (!mesh) continue;
    const state = getNodeState(node.id);
    const color = mesh.userData.typeColor;

    // Visibility
    const hidden = node.visibility === 'meta' && !showMeta;
    mesh.visible = !hidden;
    if (labelSprites[node.id]) labelSprites[node.id].visible = !hidden;

    // Material updates
    const mat = mesh.material;
    switch (state) {
      case 'locked':
        mat.color.set(0x1a1a2e);
        mat.emissiveIntensity = 0.05;
        mat.opacity = 0.35;
        break;
      case 'expensive':
        mat.color.set(0x1a1a2e);
        mat.emissive = color;
        mat.emissiveIntensity = 0.2;
        mat.opacity = 0.6;
        break;
      case 'available':
        mat.color.set(0x1a1a2e);
        mat.emissive = color;
        mat.emissiveIntensity = 0.5;
        mat.opacity = 1.0;
        break;
      case 'invested':
        mat.color.copy(color);
        mat.emissive = color;
        mat.emissiveIntensity = 0.3;
        mat.opacity = 1.0;
        break;
    }
  }

  // Update edges
  for (const edge of Object.values(edgeLines)) {
    const fromNode = nodes[edge.fromId];
    const toNode = nodes[edge.toId];
    const hidden = (!showMeta && fromNode?.visibility === 'meta') ||
                   (!showMeta && toNode?.visibility === 'meta');
    edge.line.visible = !hidden;

    if (!hidden) {
      const fromInv = investedNodes.has(edge.fromId);
      const toInv = investedNodes.has(edge.toId);
      const mat = edge.line.material;
      if (fromInv && toInv) {
        mat.color.set(fromNode?.type_color || '#888');
        mat.opacity = 0.9;
      } else if (fromInv) {
        mat.color.set(fromNode?.type_color || '#555');
        mat.opacity = 0.5;
      } else {
        mat.color.set(0x1a1a2e);
        mat.opacity = 0.25;
      }
    }
  }

  const invested = investedNodes.size;
  const total = Object.keys(nodes).length;
  document.getElementById('stats').textContent = `${invested}/${total} invested`;
}

function resetInvestments() {
  investedNodes.clear();
  for (const typeId of Object.keys(xpBudgetMax)) {
    xpBudget[typeId] = xpBudgetMax[typeId];
  }
  refreshAllStates();
  updateXpDisplay();
}

// =============================================
// Controls
// =============================================

function initControls() {
  const sliderContainer = document.getElementById('xp-sliders');
  sliderContainer.innerHTML = '';
  const primaryTypes = Object.values(types)
    .filter(t => t.tier === 'primary')
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const type of primaryTypes) {
    const defaultXP = 200;
    xpBudget[type.id] = defaultXP;
    xpBudgetMax[type.id] = defaultXP;
    const group = document.createElement('div');
    group.className = 'xp-group';
    group.innerHTML = `
      <span class="xp-label" style="color:${type.color}">${type.name}</span>
      <input type="range" class="xp-slider" min="0" max="500" value="${defaultXP}"
             data-type-id="${type.id}" style="accent-color:${type.color}">
      <span class="xp-value" id="xp-val-${type.id}" style="color:${type.color}">${defaultXP}</span>`;
    sliderContainer.appendChild(group);

    group.querySelector('.xp-slider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      xpBudgetMax[type.id] = val;
      let spent = 0;
      for (const nid of investedNodes) {
        for (const c of (costs[nid] || [])) { if (c.type_id === type.id) spent += c.amount; }
      }
      xpBudget[type.id] = Math.max(0, val - spent);
      updateXpDisplay();
      refreshAllStates();
    });
  }

  // Reveal Dark Side
  const revealBtn = document.getElementById('btn-reveal');
  revealBtn.addEventListener('click', () => {
    if (camState === 'flat') {
      // Tilt to see the underside of the torus (dark side)
      animateCamera(
        new THREE.Vector3(0, -30, 100),
        new THREE.Vector3(0, -10, 0)
      );
      camState = 'tilted';
      revealBtn.textContent = 'Light Side';
      revealBtn.classList.add('active');
    } else {
      // Back to top-down view (light side)
      animateCamera(
        new THREE.Vector3(0, 60, 100),
        new THREE.Vector3(0, 0, 0)
      );
      camState = 'flat';
      revealBtn.textContent = 'Reveal Dark Side';
      revealBtn.classList.remove('active');
    }
  });

  // Meta toggle
  const metaBtn = document.getElementById('btn-meta');
  metaBtn.classList.add('active');
  metaBtn.addEventListener('click', () => {
    showMeta = !showMeta;
    metaBtn.classList.toggle('active', showMeta);
    refreshAllStates();
  });

  document.getElementById('btn-reset').addEventListener('click', resetInvestments);
}

function updateXpDisplay() {
  for (const [typeId, remaining] of Object.entries(xpBudget)) {
    const el = document.getElementById(`xp-val-${typeId}`);
    if (el) el.textContent = remaining;
  }
}

// =============================================
// Camera animation
// =============================================

function animateCamera(toPos, toTarget) {
  camFromPos = camera.position.clone();
  camFromTarget = controls.target.clone();
  camToPos = toPos.clone();
  camToTarget = toTarget.clone();
  camLerp = 0;
  camAnimating = true;
}

// =============================================
// Raycaster interaction
// =============================================

function setupInteraction() {
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  container.addEventListener('click', (e) => {
    raycaster.setFromCamera(mouse, camera);
    const meshes = Object.values(nodeMeshes).filter(m => m.visible);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length > 0) {
      const nodeId = hits[0].object.userData.nodeId;
      investNode(nodeId);
    }
  });

  // Tooltip follows mouse
  container.addEventListener('mousemove', (e) => {
    raycaster.setFromCamera(mouse, camera);
    const meshes = Object.values(nodeMeshes).filter(m => m.visible);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
      const nodeId = hits[0].object.userData.nodeId;
      if (hoveredNode !== nodeId) {
        hoveredNode = nodeId;
        showTooltip(nodeId, e);
      } else {
        positionTooltip(e);
      }
      container.style.cursor = getNodeState(nodeId) === 'available' ? 'pointer' : 'default';
    } else {
      if (hoveredNode !== null) {
        hoveredNode = null;
        hideTooltip();
        container.style.cursor = 'default';
      }
    }
  });
}

// =============================================
// Tooltip
// =============================================

function showTooltip(nodeId, event) {
  const node = nodes[nodeId];
  if (!node) return;
  const catColors = { starter:'#5ddede', energy:'#5dde5d', spell_pool:'#5d5dde',
    passive:'#dede5d', gate:'#dea05d', discovery:'#de5dde' };
  const catColor = catColors[node.category] || '#888';

  let html = `<span class="tt-cat" style="background:${hexToRgba(catColor,0.2)};color:${catColor}">${node.category}</span>`;
  html += `<div class="tt-name" style="color:${node.type_color||'#e0e0e0'}">${node.name}</div>`;
  if (node.description) html += `<div class="tt-desc">${node.description}</div>`;
  if (node.flavor_text) html += `<div class="tt-flavor">"${node.flavor_text}"</div>`;

  const nc = costs[nodeId];
  if (nc?.length) {
    html += '<div class="tt-section">';
    for (const c of nc) html += `<div><span class="tt-cost-badge" style="color:${c.type_color};border-color:${hexToRgba(c.type_color,0.4)}">${c.amount} ${c.type_name}</span></div>`;
    html += '</div>';
  }

  const pr = prerequisites[nodeId];
  if (pr) {
    const s = Object.values(pr).map(g => g.map(id => nodes[id]?.name||'?').join(' + ')).join(' OR ');
    html += `<div class="tt-section" style="color:#888;font-size:11px">Requires: ${s}</div>`;
  }

  const fx = effects[nodeId];
  if (fx?.length) {
    html += '<div class="tt-section">';
    for (const e of fx) html += `<div class="tt-effect${e.effect_type==='unlock_secondary'?' unlock':''}">${e.description}</div>`;
    html += '</div>';
  }

  const gr = gateRequirements[nodeId];
  if (gr?.length) {
    html += `<div class="tt-gate">Gate: ${gr.map(g=>`<strong style="color:${g.type_color}">${g.type_name}</strong> depth ${g.required_depth}`).join(' + ')}</div>`;
  }

  if (node.meta_unlock_id && metaUnlockMap[node.meta_unlock_id]) {
    html += `<div class="tt-meta">Revealed by: ${metaUnlockMap[node.meta_unlock_id].name}</div>`;
  }

  const state = getNodeState(nodeId);
  if (state === 'invested') html += `<div style="color:#5dde5d;font-size:10px;margin-top:4px">Invested</div>`;
  else if (state === 'available') html += `<div style="color:#F4D03F;font-size:10px;margin-top:4px">Click to invest</div>`;

  tooltip.innerHTML = html;
  tooltip.style.display = 'block';
  positionTooltip(event);
}

function positionTooltip(event) {
  const pad = 16;
  let x = event.clientX + pad, y = event.clientY + pad;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  requestAnimationFrame(() => {
    const r = tooltip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - pad) x = event.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - pad) y = event.clientY - r.height - pad;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });
}

function hideTooltip() { tooltip.style.display = 'none'; }

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(128,128,128,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =============================================
// Animation loop
// =============================================

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera animation (reveal / flat toggle)
  if (camAnimating) {
    camLerp += 0.02;
    if (camLerp >= 1) { camLerp = 1; camAnimating = false; }
    const t = easeInOutCubic(camLerp);
    camera.position.lerpVectors(camFromPos, camToPos, t);
    controls.target.lerpVectors(camFromTarget, camToTarget, t);
    controls.update();
  }

  controls.update();
  renderer3d.render(scene, camera);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

// =============================================
// Init
// =============================================

async function init() {
  container = document.getElementById('three-container');
  tooltip = document.getElementById('tooltip');

  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`,
    });
    const response = await fetch('/wizard_game.db');
    if (!response.ok) throw new Error(`DB fetch failed (${response.status}). Run database/build.py first.`);
    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));
    loadData(db);
    db.close();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Three.js setup
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || (window.innerHeight - 80);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1a);

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 60, 100);

    renderer3d = new THREE.WebGLRenderer({ antialias: true });
    renderer3d.setSize(w, h);
    renderer3d.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer3d.domElement);

    // Orbit controls — left-drag to rotate, right-drag to pan, scroll to zoom
    controls = new OrbitControls(camera, renderer3d.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 20;
    controls.maxDistance = 250;
    controls.update();

    // Lighting
    scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Subtle torus wireframe guide
    const torusGuide = new THREE.TorusGeometry(TORUS_R, TORUS_r, 24, 48);
    const torusWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(torusGuide),
      new THREE.LineBasicMaterial({ color: 0x111122, transparent: true, opacity: 0.12 })
    );
    scene.add(torusWire);

    initControls();
    buildScene();
    setupInteraction();
    animate();

    // Resize handling
    window.addEventListener('resize', () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer3d.setSize(nw, nh);
    });

  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    errEl.style.display = 'block';
    errEl.textContent = err.message;
    console.error(err);
  }
}

init();
