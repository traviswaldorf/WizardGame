import Konva from 'konva';
import { createCardNode, CARD_W, CARD_H } from '../shared/card.js';
import { createTokenNode, TOKEN_RADIUS } from '../shared/token.js';
import { calculateZoneBounds, drawZones, hitTestZone, zoneToStateKey, ZONE_PADDING, ZONE_LABEL_H } from '../shared/zones.js';
import { renderSchoolSelection, renderDraftOverlay, clearOverlay, resetOverlayState } from '../shared/overlays.js';
import { getFont } from '../shared/card-style.js';

/**
 * TableRenderer — renders the game table from boardgame.io state.
 * Phase-aware: shows overlays for school selection and draft,
 * full table for play phase.
 */
export class TableRenderer {
  constructor(containerId) {
    this.stage = new Konva.Stage({
      container: containerId,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Layers (order matters — overlay on top)
    this.bgLayer = new Konva.Layer();
    this.cardLayer = new Konva.Layer();
    this.tokenLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();
    this.overlayLayer = new Konva.Layer();
    this.stage.add(this.bgLayer, this.cardLayer, this.tokenLayer, this.uiLayer, this.overlayLayer);

    // State
    this.zoneBounds = {};
    this.callbacks = {};
    this.currentPhase = null;
    this.activePlayerID = '0';
    this.dropHighlight = null;

    // Initial layout
    this.recalcLayout();
    this.setupPanZoom();
    this.setupResize();
    this.setupDragHighlight();
  }

  on(event, callback) { this.callbacks[event] = callback; }
  emit(event, ...args) { if (this.callbacks[event]) this.callbacks[event](...args); }

  setActivePlayer(playerID) { this.activePlayerID = playerID; }

  recalcLayout() {
    this.zoneBounds = calculateZoneBounds(this.stage.width(), this.stage.height());
    drawZones(this.bgLayer, this.zoneBounds);
  }

  setupPanZoom() {
    let isPanning = false;
    let lastPos = { x: 0, y: 0 };

    this.stage.on('mousedown', (e) => {
      if (e.evt.button === 2) {
        isPanning = true;
        lastPos = this.stage.getPointerPosition();
        e.evt.preventDefault();
      }
    });

    this.stage.on('mousemove', () => {
      if (!isPanning) return;
      const pos = this.stage.getPointerPosition();
      const dx = pos.x - lastPos.x;
      const dy = pos.y - lastPos.y;
      lastPos = pos;
      for (const layer of [this.bgLayer, this.cardLayer, this.tokenLayer, this.uiLayer]) {
        layer.x(layer.x() + dx);
        layer.y(layer.y() + dy);
      }
      this.stage.batchDraw();
    });

    this.stage.on('mouseup', () => { isPanning = false; });
    this.stage.container().addEventListener('contextmenu', (e) => e.preventDefault());

    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const scaleBy = 1.08;
      const oldScale = this.bgLayer.scaleX();
      const pointer = this.stage.getPointerPosition();
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.3, Math.min(3, newScale));

      for (const layer of [this.bgLayer, this.cardLayer, this.tokenLayer, this.uiLayer]) {
        const mousePointTo = {
          x: (pointer.x - layer.x()) / oldScale,
          y: (pointer.y - layer.y()) / oldScale,
        };
        layer.scale({ x: clampedScale, y: clampedScale });
        layer.x(pointer.x - mousePointTo.x * clampedScale);
        layer.y(pointer.y - mousePointTo.y * clampedScale);
      }
      this.stage.batchDraw();
    });
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.stage.width(window.innerWidth);
      this.stage.height(window.innerHeight);
      this.recalcLayout();
    });
  }

  setupDragHighlight() {
    // A transparent rect that highlights the zone being dragged over
    this.dropHighlight = new Konva.Rect({
      visible: false,
      fill: 'rgba(244, 208, 63, 0.12)',
      stroke: '#F4D03F',
      strokeWidth: 2,
      cornerRadius: 6,
      dash: [8, 4],
      listening: false,
    });
    this.uiLayer.add(this.dropHighlight);

    // Track dragging globally on the stage
    this.stage.on('dragmove', () => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;
      const scale = this.cardLayer.scaleX() || 1;
      const adjustedX = (pos.x - this.cardLayer.x()) / scale;
      const adjustedY = (pos.y - this.cardLayer.y()) / scale;
      const zone = hitTestZone(adjustedX, adjustedY, this.zoneBounds);

      if (zone && this.zoneBounds[zone]) {
        const b = this.zoneBounds[zone];
        this.dropHighlight.setAttrs({
          x: b.x, y: b.y, width: b.w, height: b.h, visible: true,
        });
      } else {
        this.dropHighlight.visible(false);
      }
      this.uiLayer.batchDraw();
    });

    this.stage.on('dragend', () => {
      this.dropHighlight.visible(false);
      this.uiLayer.batchDraw();
    });
  }

  /**
   * Main update — called on every state change.
   * Routes to phase-specific rendering.
   */
  update(G, ctx) {
    const phase = ctx.phase;
    const pid = this.activePlayerID;

    // Reset carousel state on phase transitions
    if (phase !== this.currentPhase) {
      // Era transition flash effect when moving to draft (new era)
      if (this.currentPhase === 'play' && phase === 'draft') {
        this.flashEraTransition();
      }
      this.currentPhase = phase;
      resetOverlayState();
    }

    if (phase === 'schoolSelection') {
      this.showTableLayers(false);
      renderSchoolSelection(
        this.overlayLayer,
        G.schools,
        this.stage.width(),
        this.stage.height(),
        (schoolTypeId) => this.emit('schoolSelected', schoolTypeId)
      );
    } else if (phase === 'draft') {
      this.showTableLayers(false);
      const draftHand = G.draftHands[pid] || [];
      renderDraftOverlay(
        this.overlayLayer,
        draftHand,
        pid,
        G.draftRound,
        this.stage.width(),
        this.stage.height(),
        (cardId) => this.emit('cardDrafted', cardId),
        (cardId) => this.emit('cardSold', cardId)
      );
    } else {
      // Play phase — show the full table
      clearOverlay(this.overlayLayer);
      this.showTableLayers(true);
      this.renderTokenPool(G.tokenPool);
      this.renderCardZone('cardMarket', G.cardMarket);
      this.renderCardZone('hand', G.players[pid]?.hand || []);
      this.renderCardZone('lab', G.players[pid]?.lab || []);
      this.renderCardZone('discard', G.discardPile);
      this.renderSchoolBoard(G.players[pid]?.school);
      this.renderResourceCounters(G.players[pid]?.resources || {}, G.era);
    }
  }

  showTableLayers(visible) {
    this.bgLayer.visible(visible);
    this.cardLayer.visible(visible);
    this.tokenLayer.visible(visible);
    this.uiLayer.visible(visible);
  }

  renderTokenPool(pool) {
    this.tokenLayer.destroyChildren();
    const zone = this.zoneBounds.tokenPool;
    if (!zone) return;

    const types = Object.keys(pool);
    const spacing = 60;
    const startX = zone.x + ZONE_PADDING + TOKEN_RADIUS + 20;
    const centerY = zone.y + zone.h / 2;

    types.forEach((type, i) => {
      const node = createTokenNode(type, pool[type], startX + i * spacing, centerY);
      node.on('click', () => this.emit('tokenTaken', type, 1));
      node.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
      node.on('mouseleave', () => { document.body.style.cursor = 'default'; });
      this.tokenLayer.add(node);
    });
    this.tokenLayer.batchDraw();
  }

  renderCardZone(zoneName, cards) {
    const existing = this.cardLayer.find(`.zone-${zoneName}`);
    existing.forEach(n => n.destroy());

    const zone = this.zoneBounds[zoneName];
    if (!zone || !cards) return;

    const cardGap = 8;
    const startX = zone.x + ZONE_PADDING;
    const startY = zone.y + ZONE_LABEL_H + 6;
    const isStacked = zoneName === 'discard';
    const maxPerRow = Math.max(1, Math.floor((zone.w - ZONE_PADDING * 2) / (CARD_W + cardGap)));

    cards.forEach((card, i) => {
      let x, y;
      if (isStacked) {
        // Stack cards on top of each other with a slight offset
        x = startX + i * 2;
        y = startY + i * 2;
      } else {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        x = startX + col * (CARD_W + cardGap);
        y = startY + row * (CARD_H + cardGap);
      }

      const node = createCardNode(card, x, y);
      node.name(`zone-${zoneName}`);
      node.setAttr('fromZone', zoneToStateKey(zoneName));

      node.on('dragend', () => {
        const pos = node.getAbsolutePosition();
        const scale = this.cardLayer.scaleX() || 1;
        const adjustedX = (pos.x - this.cardLayer.x()) / scale;
        const adjustedY = (pos.y - this.cardLayer.y()) / scale;
        const targetZone = hitTestZone(adjustedX, adjustedY, this.zoneBounds);
        const fromKey = node.getAttr('fromZone');
        const toKey = targetZone ? zoneToStateKey(targetZone) : null;

        if (toKey && fromKey !== toKey) {
          this.emit('cardMoved', card.id, fromKey, toKey);
        }
      });

      // Double-click card in hand → play to lab
      if (zoneName === 'hand') {
        node.on('dblclick', () => {
          this.emit('cardPlayedToLab', card.id);
        });
      }

      this.cardLayer.add(node);
    });
    this.cardLayer.batchDraw();
  }

  renderSchoolBoard(school) {
    const existing = this.cardLayer.find('.school-card');
    existing.forEach(n => n.destroy());

    if (!school) return;

    const zone = this.zoneBounds.schoolBoard;
    if (!zone) return;

    const card = { id: 'school-display', data: school };
    const node = createCardNode(card, zone.x + ZONE_PADDING, zone.y + ZONE_LABEL_H + 6);
    node.name('school-card');
    node.draggable(false);
    this.cardLayer.add(node);
    this.cardLayer.batchDraw();
  }

  flashEraTransition() {
    const flash = new Konva.Rect({
      x: 0, y: 0,
      width: this.stage.width(),
      height: this.stage.height(),
      fill: '#F4D03F',
      opacity: 0.3,
      listening: false,
    });
    this.overlayLayer.add(flash);
    flash.to({
      opacity: 0,
      duration: 0.6,
      onFinish: () => flash.destroy(),
    });
  }

  renderResourceCounters(resources, era) {
    // Clear only resource-related nodes (preserve drop highlight)
    const existing = this.uiLayer.find('.resource-display');
    existing.forEach(n => n.destroy());

    const zone = this.zoneBounds.resources;
    if (!zone) return;

    const group = new Konva.Group({ name: 'resource-display' });

    const centerY = zone.y + zone.h / 2;
    let x = zone.x + ZONE_PADDING + 10;

    // Era indicator
    group.add(new Konva.Text({
      x, y: centerY - 8,
      text: `Era ${era}`,
      fontSize: 14,
      fontStyle: 'bold',
      fontFamily: getFont(),
      fill: '#F4D03F',
    }));
    x += 70;

    const TOKEN_COLORS = {
      fire: '#E74C3C', earth: '#A0522D', water: '#2E86C1',
      air: '#AED6F1', light: '#F4D03F',
    };

    for (const [type, color] of Object.entries(TOKEN_COLORS)) {
      const count = resources[type] || 0;
      group.add(new Konva.Circle({ x: x + 8, y: centerY, radius: 9, fill: color }));
      group.add(new Konva.Text({
        x: x + 22, y: centerY - 8,
        text: String(count),
        fontSize: 15,
        fontStyle: 'bold',
        fontFamily: getFont(),
        fill: '#e0e0e0',
      }));
      x += 56;
    }

    this.uiLayer.add(group);
    this.uiLayer.batchDraw();
  }
}
