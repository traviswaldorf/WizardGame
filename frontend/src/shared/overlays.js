import Konva from 'konva';
import { getFont, isPixel } from './card-style.js';

/**
 * Phase overlays — school selection and draft UI.
 * 3-card carousel: center card is full-size and interactive,
 * left/right neighbors shown smaller and dimmed for context.
 */

// ─── Shared carousel state ───

let schoolIndex = 0;
let draftIndex = 0;

// ─── School Selection ───

export function renderSchoolSelection(layer, schools, stageW, stageH, onSelect) {
  layer.destroyChildren();
  if (!schools || schools.length === 0) return;
  schoolIndex = Math.max(0, Math.min(schoolIndex, schools.length - 1));

  // Backdrop
  layer.add(new Konva.Rect({ width: stageW, height: stageH, fill: 'rgba(15, 15, 26, 0.90)' }));

  // Title
  addText(layer, 0, 30, stageW, 'Choose Your School', 26, '#F4D03F', 'bold', 'center');
  addText(layer, 0, 64, stageW, 'Browse with arrows · Click "Select" on the center card', 13, '#8899aa', 'normal', 'center');

  // Card dimensions
  const cardW = 220;
  const cardH = 320;
  const sideScale = 0.75;
  const sideW = cardW * sideScale;
  const sideH = cardH * sideScale;
  const gap = 20;
  const centerX = (stageW - cardW) / 2;
  const cardY = 95;
  const sideY = cardY + (cardH - sideH) / 2;

  const rerender = () => renderSchoolSelection(layer, schools, stageW, stageH, onSelect);

  // ─── Left neighbor ───
  if (schoolIndex > 0) {
    const leftX = centerX - sideW - gap;
    renderSchoolCard(layer, schools[schoolIndex - 1], leftX, sideY, sideW, sideH, 0.5, false, null);
    // Click left card to shift
    const hitRect = new Konva.Rect({ x: leftX, y: sideY, width: sideW, height: sideH, opacity: 0 });
    hitRect.on('click', () => { schoolIndex--; rerender(); });
    hitRect.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    hitRect.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    layer.add(hitRect);
  }

  // ─── Right neighbor ───
  if (schoolIndex < schools.length - 1) {
    const rightX = centerX + cardW + gap;
    renderSchoolCard(layer, schools[schoolIndex + 1], rightX, sideY, sideW, sideH, 0.5, false, null);
    const hitRect = new Konva.Rect({ x: rightX, y: sideY, width: sideW, height: sideH, opacity: 0 });
    hitRect.on('click', () => { schoolIndex++; rerender(); });
    hitRect.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    hitRect.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    layer.add(hitRect);
  }

  // ─── Center card (interactive) ───
  renderSchoolCard(layer, schools[schoolIndex], centerX, cardY, cardW, cardH, 1, true, () => {
    document.body.style.cursor = 'default';
    onSelect(schools[schoolIndex].type_id);
  });

  // ─── Arrows ───
  const arrowY = cardY + cardH / 2;
  if (schoolIndex > 0) {
    layer.add(createArrow(centerX - sideW - gap - 50, arrowY, '◀', () => { schoolIndex--; rerender(); }));
  }
  if (schoolIndex < schools.length - 1) {
    layer.add(createArrow(centerX + cardW + gap + sideW + 10, arrowY, '▶', () => { schoolIndex++; rerender(); }));
  }

  // ─── Dots ───
  renderDots(layer, schools.length, schoolIndex, stageW, cardY + cardH + 16, (i) => { schoolIndex = i; rerender(); });

  layer.batchDraw();
}

function renderSchoolCard(layer, school, x, y, w, h, alpha, interactive, onSelect) {
  const color = school.type_color || '#555';
  const group = new Konva.Group({ x, y, opacity: alpha });
  const pixel = isPixel();

  // Background
  group.add(new Konva.Rect({
    width: w, height: h,
    fill: '#1a1a2e',
    stroke: color,
    strokeWidth: interactive ? 3 : 2,
    cornerRadius: pixel ? 0 : 8,
    shadowColor: interactive ? color : '#000',
    shadowBlur: pixel ? 0 : (interactive ? 16 : 6),
    shadowOpacity: pixel ? 0 : (interactive ? 0.4 : 0.3),
  }));

  const headerH = 44;
  const pad = 12;

  // Header
  group.add(new Konva.Rect({ width: w, height: headerH, fill: color, cornerRadius: pixel ? 0 : [8, 8, 0, 0] }));

  // School name
  addText(group, pad, 12, w - pad * 2, school.school_name, 16, '#fff', 'bold');

  // Wizard name
  addText(group, pad, headerH + 8, w - pad * 2, school.scientist_name, 14, color, 'bold');

  // Years
  if (school.birth_year && school.death_year) {
    addText(group, pad, headerH + 28, w - pad * 2, `${school.birth_year}–${school.death_year}`, 11, '#888');
  }

  // Divider
  group.add(new Konva.Line({ points: [pad, headerH + 46, w - pad, headerH + 46], stroke: '#3a3a5a', strokeWidth: 1 }));

  // Contribution (multi-line, height-constrained)
  const contribTop = headerH + 54;
  const contribMaxH = h - contribTop - 80;
  group.add(new Konva.Text({
    x: pad, y: contribTop,
    text: school.contribution || '',
    fontSize: 12, fontFamily: getFont(), fill: '#ccc',
    width: w - pad * 2, height: contribMaxH,
    lineHeight: 1.4, ellipsis: true,
  }));

  // Starting bonus
  addText(group, pad, h - 65, w - pad * 2, 'Starting bonus:', 11, '#888');
  addText(group, pad, h - 48, w - pad * 2, `+1 ${school.type_name} token`, 16, color, 'bold');

  // Select button (center card only)
  if (interactive && onSelect) {
    const btn = createButton(pad, h - 30, w - pad * 2, 26, 'Select This School', color);
    btn.on('click', onSelect);
    group.add(btn);
  }

  layer.add(group);
}

// ─── Draft Overlay ───

export function renderDraftOverlay(layer, draftHand, playerID, round, stageW, stageH, onDraft, onSell) {
  layer.destroyChildren();
  if (!draftHand || draftHand.length === 0) return;
  draftIndex = Math.max(0, Math.min(draftIndex, draftHand.length - 1));

  // Backdrop
  layer.add(new Konva.Rect({ width: stageW, height: stageH, fill: 'rgba(15, 15, 26, 0.88)' }));

  // Title
  addText(layer, 0, 24, stageW, `Draft — Pick 1 of ${draftHand.length}`, 24, '#F4D03F', 'bold', 'center');
  addText(layer, 0, 56, stageW, `Round ${round + 1} · Player ${parseInt(playerID) + 1}`, 13, '#8899aa', 'normal', 'center');

  const cardW = 200;
  const cardH = 290;
  const sideScale = 0.75;
  const sideW = cardW * sideScale;
  const sideH = cardH * sideScale;
  const gap = 16;
  const centerX = (stageW - cardW) / 2;
  const cardY = 80;
  const sideY = cardY + (cardH - sideH) / 2;

  const rerender = () => renderDraftOverlay(layer, draftHand, playerID, round, stageW, stageH, onDraft, onSell);

  // ─── Left neighbor ───
  if (draftIndex > 0) {
    const leftX = centerX - sideW - gap;
    renderDraftCard(layer, draftHand[draftIndex - 1], leftX, sideY, sideW, sideH, 0.45, false);
    const hit = new Konva.Rect({ x: leftX, y: sideY, width: sideW, height: sideH, opacity: 0 });
    hit.on('click', () => { draftIndex--; rerender(); });
    hit.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    hit.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    layer.add(hit);
  }

  // ─── Right neighbor ───
  if (draftIndex < draftHand.length - 1) {
    const rightX = centerX + cardW + gap;
    renderDraftCard(layer, draftHand[draftIndex + 1], rightX, sideY, sideW, sideH, 0.45, false);
    const hit = new Konva.Rect({ x: rightX, y: sideY, width: sideW, height: sideH, opacity: 0 });
    hit.on('click', () => { draftIndex++; rerender(); });
    hit.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    hit.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    layer.add(hit);
  }

  // ─── Center card (interactive) ───
  const card = draftHand[draftIndex];
  renderDraftCard(layer, card, centerX, cardY, cardW, cardH, 1, true);

  // Action buttons below center card
  const btnW = (cardW - 16) / 2;
  const btnY = cardY + cardH + 8;

  const draftBtn = createButton(centerX, btnY, btnW, 30, 'Draft', '#27AE60');
  draftBtn.on('click', () => { draftIndex = 0; onDraft(card.id); });
  layer.add(draftBtn);

  const sellLabel = `Sell (+2 ${card.data.type_a_name || ''})`;
  const sellBtn = createButton(centerX + btnW + 16, btnY, btnW, 30, sellLabel, '#E74C3C');
  sellBtn.on('click', () => { draftIndex = 0; onSell(card.id); });
  layer.add(sellBtn);

  // ─── Arrows ───
  const arrowY = cardY + cardH / 2;
  if (draftIndex > 0) {
    layer.add(createArrow(centerX - sideW - gap - 50, arrowY, '◀', () => { draftIndex--; rerender(); }));
  }
  if (draftIndex < draftHand.length - 1) {
    layer.add(createArrow(centerX + cardW + gap + sideW + 10, arrowY, '▶', () => { draftIndex++; rerender(); }));
  }

  // ─── Dots ───
  renderDots(layer, draftHand.length, draftIndex, stageW, btnY + 44, (i) => { draftIndex = i; rerender(); });

  layer.batchDraw();
}

function renderDraftCard(layer, card, x, y, w, h, alpha, interactive) {
  const typeColor = card.data.type_a_color || '#555';
  const group = new Konva.Group({ x, y, opacity: alpha });
  const pad = 10;
  const headerH = 36;

  const pixel = isPixel();

  // Background
  group.add(new Konva.Rect({
    width: w, height: h,
    fill: '#1a1a2e',
    stroke: typeColor,
    strokeWidth: interactive ? 2 : 1,
    cornerRadius: pixel ? 0 : 6,
    shadowColor: '#000',
    shadowBlur: pixel ? 0 : (interactive ? 10 : 4),
    shadowOpacity: pixel ? 0 : (interactive ? 0.5 : 0.3),
  }));

  // Header
  group.add(new Konva.Rect({ width: w, height: headerH, fill: typeColor, cornerRadius: pixel ? 0 : [6, 6, 0, 0] }));

  // Name
  addText(group, pad, 10, w - pad * 2, card.data.name || 'Unknown', 14, '#fff', 'bold');

  // Cost
  const costParts = [];
  if (card.data.type_a_name) costParts.push(`${card.data.type_a_amount || 1} ${card.data.type_a_name}`);
  if (card.data.type_b_name) costParts.push(`${card.data.type_b_amount || 1} ${card.data.type_b_name}`);
  addText(group, pad, headerH + 6, w - pad * 2, costParts.join(' + '), 11, '#aaa');

  // Mechanic badge
  if (card.data.mechanic || card.data.nature) {
    addText(group, pad, headerH + 22, w - pad * 2, (card.data.mechanic || card.data.nature).toUpperCase(), 9, typeColor);
  }

  // Divider
  group.add(new Konva.Line({ points: [pad, headerH + 38, w - pad, headerH + 38], stroke: '#3a3a5a', strokeWidth: 1 }));

  // Description
  group.add(new Konva.Text({
    x: pad, y: headerH + 44,
    text: card.data.description || '',
    fontSize: 11, fontFamily: getFont(), fill: '#ccc',
    width: w - pad * 2, height: h - headerH - 56, lineHeight: 1.3,
    ellipsis: true,
  }));

  layer.add(group);
}

// ─── Shared helpers ───

export function clearOverlay(layer) {
  layer.destroyChildren();
  layer.batchDraw();
}

export function resetOverlayState() {
  schoolIndex = 0;
  draftIndex = 0;
}

function renderDots(layer, count, activeIdx, stageW, y, onClick) {
  const dotGap = 18;
  const startX = (stageW - (count - 1) * dotGap) / 2;
  for (let i = 0; i < count; i++) {
    const dot = new Konva.Circle({
      x: startX + i * dotGap, y,
      radius: 5,
      fill: i === activeIdx ? '#F4D03F' : '#3a3a5a',
    });
    dot.on('click', () => onClick(i));
    dot.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    dot.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    layer.add(dot);
  }
}

function addText(parent, x, y, width, text, fontSize, fill, fontStyle, align) {
  parent.add(new Konva.Text({
    x, y, width, text,
    fontSize, fontStyle: fontStyle || 'normal',
    fontFamily: getFont(), fill,
    align: align || 'left',
    ellipsis: true,
    wrap: 'none',
  }));
}

function createArrow(x, y, text, onClick) {
  const group = new Konva.Group({ x, y: y - 20 });
  group.add(new Konva.Rect({ width: 40, height: 40, fill: '#2a2a4e', stroke: '#5a5a8a', strokeWidth: 1, cornerRadius: 20 }));
  group.add(new Konva.Text({ width: 40, height: 40, text, fontSize: 18, fontFamily: getFont(), fill: '#e0e0e0', align: 'center', verticalAlign: 'middle' }));
  group.on('mouseenter', () => { group.findOne('Rect').fill('#3a3a6e'); document.body.style.cursor = 'pointer'; group.getLayer()?.batchDraw(); });
  group.on('mouseleave', () => { group.findOne('Rect').fill('#2a2a4e'); document.body.style.cursor = 'default'; group.getLayer()?.batchDraw(); });
  group.on('click', onClick);
  return group;
}

function createButton(x, y, w, h, text, color) {
  const group = new Konva.Group({ x, y });
  group.add(new Konva.Rect({ width: w, height: h, fill: color, cornerRadius: 4, opacity: 0.9 }));
  group.add(new Konva.Text({ width: w, height: h, text, fontSize: 12, fontStyle: 'bold', fontFamily: getFont(), fill: '#fff', align: 'center', verticalAlign: 'middle' }));
  group.on('mouseenter', () => { group.findOne('Rect').opacity(1); document.body.style.cursor = 'pointer'; group.getLayer()?.batchDraw(); });
  group.on('mouseleave', () => { group.findOne('Rect').opacity(0.9); document.body.style.cursor = 'default'; group.getLayer()?.batchDraw(); });
  return group;
}
