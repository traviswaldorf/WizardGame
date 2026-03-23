// ============================================
// Wizard Game Prototype
// ============================================

// --- Constants ---
const CANVAS_W = window.innerWidth;
const CANVAS_H = window.innerHeight;

// Layout computed from window size
const SPELL_PANEL_W = Math.round(Math.min(420, CANVAS_W * 0.28));
const BOTTOM_BAR_H = Math.round(Math.min(250, CANVAS_H * 0.28));
const BOARD_W = CANVAS_W - SPELL_PANEL_W - 10;
const BOARD_H = CANVAS_H - BOTTOM_BAR_H;

const BOARD_CX = Math.round(BOARD_W / 2);
const BOARD_CY = Math.round(BOARD_H / 2);
const BOARD_SCALE = Math.min(BOARD_W, BOARD_H);
const INNER_R = Math.round(BOARD_SCALE * 0.25);
const OUTER_R = Math.round(BOARD_SCALE * 0.40);
const NODE_R = Math.round(BOARD_SCALE * 0.05);
const ENERGY_INTERVAL = 5000;
const TOWER_COST = 5;
const TERTIARY_THRESHOLD = 3;
const SNAP_DIST = Math.round(NODE_R * 1.5);

const BOARD_AREA = { x: 0, y: 0, w: BOARD_W, h: BOARD_H };
const SPELL_PANEL = { x: BOARD_W + 10, y: 0, w: SPELL_PANEL_W, h: CANVAS_H };
const BOTTOM_BAR = { x: 0, y: BOARD_H, w: BOARD_W + 5, h: BOTTOM_BAR_H };

const FONT = 'Segoe UI, system-ui, sans-serif';

// Octagon angles (clockwise from top, in radians)
// Order: Electric(0°), Air(45°), Ice(90°), Water(135°), Plant(180°), Earth(225°), Metal(270°), Fire(315°)
const TYPE_ANGLES = {
  8: 0,                    // Electric (top)
  4: Math.PI / 4,          // Air (top-right)
  7: Math.PI / 2,          // Ice (right)
  3: (3 * Math.PI) / 4,    // Water (bottom-right)
  6: Math.PI,              // Plant (bottom)
  2: (5 * Math.PI) / 4,    // Earth (bottom-left)
  5: (3 * Math.PI) / 2,    // Metal (left)
  1: (7 * Math.PI) / 4,    // Fire (top-left)
};

// Dark pair mapping: tertiary ID -> parent ID
const DARK_PAIRS = {
  9: 1,   // Radioactive -> Fire
  10: 2,  // Cosmic -> Earth
  11: 3,  // Poison -> Water
  12: 4,  // Sound -> Air
  13: 5,  // Crystal -> Metal
  14: 6,  // Ghost -> Plant
  15: 7,  // Heat -> Ice
  16: 8,  // Magnetic -> Electric
};

// Composition mapping: secondary ID -> [parentA, parentB]
const COMPOSITIONS = {
  5: [1, 2],  // Metal = Fire + Earth
  6: [2, 3],  // Plant = Earth + Water
  7: [4, 3],  // Ice = Air + Water
  8: [1, 4],  // Electric = Fire + Air
};


// ============================================
// Database Bootstrap
// ============================================

async function loadDatabase() {
  const sqlPromise = initSqlJs({
    locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1/dist/${file}`
  });
  const dataPromise = fetch('/wizard_game.db');
  const [SQL, response] = await Promise.all([sqlPromise, dataPromise]);

  if (!response.ok) throw new Error(`Database fetch failed (${response.status}). Run build.py first and serve via HTTP.`);

  const buf = await response.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buf));

  const types = db.exec('SELECT id, name, tier, color, sort_order FROM types ORDER BY sort_order')[0]
    .values.map(r => ({ id: r[0], name: r[1], tier: r[2], color: r[3], sortOrder: r[4] }));

  const combinations = db.exec(`
    SELECT id, type_a_id, type_b_id, type_a_amount, type_b_amount,
           name, description, nature, mechanic, process
    FROM type_combination_design
  `)[0].values.map(r => ({
    id: r[0], typeAId: r[1], typeBId: r[2], typeAAmount: r[3], typeBAmount: r[4],
    name: r[5], description: r[6], nature: r[7], mechanic: r[8], process: r[9]
  }));

  db.close();

  const typeMap = {};
  types.forEach(t => { typeMap[t.id] = t; });

  return { types, typeMap, combinations };
}


// ============================================
// Main Scene
// ============================================

class WizardGameScene extends Phaser.Scene {
  constructor() { super('WizardGameScene'); }

  init() {
    const data = window.GAME_DATA;
    this.db = data;

    // Game state
    this.energy = {};
    this.db.types.forEach(t => { this.energy[t.id] = 0; });
    this.towerInventory = 1;
    this.theoryPool = {};
    this.discoveredSpells = [];
    this.boardNodes = {};

    // UI object groups (for refresh/destroy cycles)
    this.energyObjects = [];
    this.theoryObjects = [];
    this.inventoryObjects = [];
    this.spellObjects = [];
    this.towerDragObjects = [];
  }

  create() {
    this.cameras.main.setBackgroundColor('#16213e');

    this.buildBoard();
    this.buildBottomBar();
    this.buildSpellPanel();
    this.setupDragAndDrop();
    this.startEnergyTimer();

    this.refreshAll();
  }

  // --- Board ---

  buildBoard() {
    // Edge graphics layer first (so it renders behind nodes)
    this.boardEdgeGraphics = this.add.graphics();

    // Central origin node
    const originGlow = this.add.graphics();
    originGlow.fillStyle(0xffffff, 0.2);
    originGlow.fillCircle(0, 0, NODE_R + 8);
    originGlow.setAlpha(0);

    const originCircle = this.add.graphics();
    originCircle.fillStyle(0xffffff, 0.12);
    originCircle.fillCircle(0, 0, NODE_R * 0.7);
    originCircle.lineStyle(2, 0xffffff, 0.3);
    originCircle.strokeCircle(0, 0, NODE_R * 0.7);

    const originLabel = this.add.text(0, 0, 'Origin', {
      fontSize: '9px', color: '#8b949e', fontFamily: FONT
    }).setOrigin(0.5);

    this.add.container(BOARD_CX, BOARD_CY, [originGlow, originCircle, originLabel]);

    // Create nodes for all 16 types
    for (const t of this.db.types) {
      const pos = this.getNodePosition(t.id);
      const unlocked = t.tier === 'primary';
      const colorInt = parseInt(t.color.slice(1), 16);

      // Glow circle (for pulse animation)
      const glow = this.add.graphics();
      glow.fillStyle(colorInt, 0.3);
      glow.fillCircle(0, 0, NODE_R + 12);
      glow.setAlpha(0);

      // Main circle
      const circle = this.add.graphics();
      this.drawNodeCircle(circle, colorInt, unlocked, false);

      // Label (inside circle)
      const label = this.add.text(0, 0, t.name, {
        fontSize: '10px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold'
      }).setOrigin(0.5);

      // Tower count badge (below the name)
      const badge = this.add.text(0, 11, '', {
        fontSize: '10px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold'
      }).setOrigin(0.5);
      badge.setVisible(false);

      // Container
      const container = this.add.container(pos.x, pos.y, [glow, circle, label, badge]);
      container.setVisible(unlocked);

      if (unlocked) {
        circle.setInteractive(new Phaser.Geom.Circle(0, 0, NODE_R + 5), Phaser.Geom.Circle.Contains);
        circle.on('pointerdown', () => {
          this.energy[t.id] = (this.energy[t.id] || 0) + 1;
          this.refreshEnergy();
          this.refreshTheory();
        });
      }

      this.boardNodes[t.id] = {
        x: pos.x, y: pos.y,
        unlocked, towerCount: 0,
        container, circle, glow, label, badge,
        colorInt
      };
    }

    // Draw edges now that nodes exist
    this.drawEdges();
  }

  drawNodeCircle(graphics, colorInt, unlocked, hasTowers) {
    graphics.clear();
    if (!unlocked) {
      // Locked: dark, barely visible
      graphics.fillStyle(0x333333, 0.5);
      graphics.fillCircle(0, 0, NODE_R);
      graphics.lineStyle(1, 0x555555, 0.5);
      graphics.strokeCircle(0, 0, NODE_R);
    } else if (hasTowers) {
      // Invested: solid bright fill
      graphics.fillStyle(colorInt, 0.85);
      graphics.fillCircle(0, 0, NODE_R);
      graphics.lineStyle(3, 0xffffff, 0.6);
      graphics.strokeCircle(0, 0, NODE_R);
    } else {
      // Unlocked but empty: outline only, dim fill
      graphics.fillStyle(colorInt, 0.15);
      graphics.fillCircle(0, 0, NODE_R);
      graphics.lineStyle(2, colorInt, 0.8);
      graphics.strokeCircle(0, 0, NODE_R);
    }
  }

  drawEdges() {
    const g = this.boardEdgeGraphics;
    g.clear();

    // Origin -> primary edges
    const primaryIds = [1, 2, 3, 4]; // Fire, Earth, Water, Air
    for (const pid of primaryIds) {
      const node = this.boardNodes[pid];
      if (!node) continue;
      g.lineStyle(2, 0xffffff, 0.12);
      g.lineBetween(BOARD_CX, BOARD_CY, node.x, node.y);
    }

    // Composition edges (only show when secondary is unlocked)
    for (const [secId, parents] of Object.entries(COMPOSITIONS)) {
      const sec = this.boardNodes[secId];
      const pA = this.boardNodes[parents[0]];
      const pB = this.boardNodes[parents[1]];
      if (!sec || !pA || !pB || !sec.unlocked) continue;

      g.lineStyle(2, 0x888888, 0.5);
      g.lineBetween(pA.x, pA.y, sec.x, sec.y);
      g.lineBetween(pB.x, pB.y, sec.x, sec.y);
    }

    // Dark pair edges (only show when tertiary is unlocked)
    for (const [tertId, parentId] of Object.entries(DARK_PAIRS)) {
      const tert = this.boardNodes[tertId];
      const par = this.boardNodes[parentId];
      if (!tert || !par || !tert.unlocked) continue;

      g.lineStyle(1, 0x666666, 0.5);
      g.lineBetween(par.x, par.y, tert.x, tert.y);
    }
  }

  getNodePosition(typeId) {
    // Primary and secondary types: inner ring
    if (TYPE_ANGLES[typeId] !== undefined) {
      const angle = TYPE_ANGLES[typeId] - Math.PI / 2; // rotate so 0 = top
      return {
        x: BOARD_CX + INNER_R * Math.cos(angle),
        y: BOARD_CY + INNER_R * Math.sin(angle)
      };
    }
    // Tertiary types: outer ring, same angle as parent
    const parentId = DARK_PAIRS[typeId];
    if (parentId && TYPE_ANGLES[parentId] !== undefined) {
      const angle = TYPE_ANGLES[parentId] - Math.PI / 2;
      return {
        x: BOARD_CX + OUTER_R * Math.cos(angle),
        y: BOARD_CY + OUTER_R * Math.sin(angle)
      };
    }
    return { x: BOARD_CX, y: BOARD_CY };
  }

  // --- Bottom Bar ---

  buildBottomBar() {
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d1117, 0.95);
    bg.fillRoundedRect(BOTTOM_BAR.x, BOTTOM_BAR.y, BOTTOM_BAR.w, BOTTOM_BAR.h, 8);
    bg.lineStyle(1, 0x30363d, 1);
    bg.strokeRoundedRect(BOTTOM_BAR.x, BOTTOM_BAR.y, BOTTOM_BAR.w, BOTTOM_BAR.h, 8);

    // Dynamic column positions (3 sections)
    const sec1X = 15;
    const div1X = Math.round(BOTTOM_BAR.w * 0.40);
    const sec2X = div1X + 15;
    const div2X = Math.round(BOTTOM_BAR.w * 0.75);
    const sec3X = div2X + 15;
    this._barLayout = { sec1X, sec2X, sec3X, div1X, div2X };

    // Section labels
    this.add.text(sec1X, BOTTOM_BAR.y + 8, 'Energy', {
      fontSize: '14px', color: '#8b949e', fontFamily: FONT, fontStyle: 'bold'
    });

    this.add.text(sec2X, BOTTOM_BAR.y + 8, 'Theory', {
      fontSize: '14px', color: '#8b949e', fontFamily: FONT, fontStyle: 'bold'
    });

    this.add.text(sec3X, BOTTOM_BAR.y + 8, 'Towers', {
      fontSize: '14px', color: '#8b949e', fontFamily: FONT, fontStyle: 'bold'
    });

    // Divider lines
    const dividers = this.add.graphics();
    dividers.lineStyle(1, 0x30363d, 0.6);
    dividers.lineBetween(div1X, BOTTOM_BAR.y + 5, div1X, BOTTOM_BAR.y + BOTTOM_BAR.h - 5);
    dividers.lineBetween(div2X, BOTTOM_BAR.y + 5, div2X, BOTTOM_BAR.y + BOTTOM_BAR.h - 5);

    // Buttons (persistent)
    const btnY = BOTTOM_BAR.y + BOTTOM_BAR.h - 45;
    this.experimentBtn = this.createButton(sec2X, btnY, 'Experiment', () => this.runExperiment(), 0x238636, 120);
    this.clearBtn = this.createButton(sec2X + 130, btnY, 'Clear', () => this.clearTheory(), 0x6e7681, 70);
    this.buyTowerBtn = this.createButton(sec3X, btnY, 'Buy Tower (5)', () => this.buyTower(), 0x1f6feb, 140);
  }

  // --- Spell Panel ---

  buildSpellPanel() {
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d1117, 0.95);
    bg.fillRoundedRect(SPELL_PANEL.x, SPELL_PANEL.y, SPELL_PANEL.w, SPELL_PANEL.h, 8);
    bg.lineStyle(1, 0x30363d, 1);
    bg.strokeRoundedRect(SPELL_PANEL.x, SPELL_PANEL.y, SPELL_PANEL.w, SPELL_PANEL.h, 8);

    this.add.text(SPELL_PANEL.x + 15, 12, 'Discovered Spells', {
      fontSize: '16px', color: '#8b949e', fontFamily: FONT, fontStyle: 'bold'
    });

    this.spellListY = 45;

    // Scroll mask
    const mask = this.add.graphics();
    mask.fillStyle(0xffffff);
    mask.fillRect(SPELL_PANEL.x, this.spellListY, SPELL_PANEL.w, SPELL_PANEL.h - this.spellListY);
    this.spellMask = mask.createGeometryMask();

    // Scroll container
    this.spellContainer = this.add.container(0, 0);
    this.spellContainer.setMask(this.spellMask);

    // Mouse wheel scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (pointer.x >= SPELL_PANEL.x) {
        this.spellScrollOffset = (this.spellScrollOffset || 0) + deltaY * 0.5;
        const maxScroll = Math.max(0, this.discoveredSpells.length * 98 - (SPELL_PANEL.h - this.spellListY));
        this.spellScrollOffset = Phaser.Math.Clamp(this.spellScrollOffset, 0, maxScroll);
        this.spellContainer.y = -this.spellScrollOffset;
      }
    });
  }

  // --- Drag & Drop ---

  setupDragAndDrop() {
    this.input.on('dragstart', (pointer, obj) => {
      if (!obj.getData('isTower')) return;
      obj.setDepth(100); // bring to front while dragging
    });

    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      if (!obj.getData('isTower')) return;
      // Move the zone
      const dx = dragX - obj.x;
      const dy = dragY - obj.y;
      obj.x = dragX;
      obj.y = dragY;
      // Move the visual graphic to follow
      const visual = obj.getData('visual');
      if (visual) {
        visual.x += dx;
        visual.y += dy;
      }
    });

    this.input.on('dragend', (pointer, obj) => {
      if (!obj.getData('isTower')) return;

      // Find nearest unlocked node
      let closest = null;
      let closestDist = Infinity;
      for (const [typeId, node] of Object.entries(this.boardNodes)) {
        if (!node.unlocked) continue;
        const dist = Phaser.Math.Distance.Between(obj.x, obj.y, node.x, node.y);
        if (dist < SNAP_DIST && dist < closestDist) {
          closest = parseInt(typeId);
          closestDist = dist;
        }
      }

      if (closest !== null) {
        this.placeTower(closest);
        const visual = obj.getData('visual');
        if (visual) visual.destroy();
        obj.destroy();
        this.towerInventory--;
        this.refreshInventory();
      } else {
        // Snap back
        const ox = obj.getData('originX');
        const oy = obj.getData('originY');
        const visual = obj.getData('visual');
        this.tweens.add({
          targets: obj, x: ox, y: oy, duration: 200, ease: 'Back.easeOut',
          onUpdate: () => {
            if (visual) {
              visual.x = obj.x - ox;
              visual.y = obj.y - oy;
            }
          },
          onComplete: () => {
            if (visual) { visual.x = 0; visual.y = 0; }
          }
        });
      }
    });
  }

  placeTower(typeId) {
    const node = this.boardNodes[typeId];
    node.towerCount++;

    // Redraw node as invested (solid bright)
    this.drawNodeCircle(node.circle, node.colorInt, true, true);

    // Update badge
    node.badge.setText(node.towerCount.toString());
    node.badge.setVisible(true);

    // Tower icon rendered at scene level (above all nodes)
    const towerIcon = this.add.graphics();
    towerIcon.setDepth(50);
    const offsetX = (node.towerCount - 1) * 10 - ((node.towerCount - 1) * 5);
    const tx = node.x + offsetX;
    const ty = node.y - NODE_R - 8;
    towerIcon.fillStyle(0xffffff, 0.9);
    towerIcon.fillRect(tx - 8, ty, 16, 16);
    towerIcon.fillTriangle(tx - 10, ty, tx + 10, ty, tx, ty - 16);
    towerIcon.lineStyle(1, 0x000000, 0.3);
    towerIcon.strokeRect(tx - 8, ty, 16, 16);

    // Pulse animation
    this.tweens.add({
      targets: node.glow,
      alpha: { from: 0.5, to: 0 },
      duration: 600,
      ease: 'Cubic.easeOut'
    });

    this.checkUnlocks();
  }

  // --- Energy Timer ---

  startEnergyTimer() {
    this.time.addEvent({
      delay: ENERGY_INTERVAL,
      loop: true,
      callback: () => {
        let generated = false;
        for (const [typeId, node] of Object.entries(this.boardNodes)) {
          if (node.towerCount > 0) {
            this.energy[typeId] += node.towerCount;
            generated = true;

            // Pulse animation on node
            this.tweens.add({
              targets: node.glow,
              alpha: { from: 0.4, to: 0 },
              duration: 800,
              ease: 'Cubic.easeOut'
            });
          }
        }
        if (generated) {
          this.refreshEnergy();
        }
      }
    });
  }

  // --- Theory & Experiment ---

  addToTheory(typeId) {
    if ((this.energy[typeId] || 0) <= 0) return;
    this.energy[typeId]--;
    this.theoryPool[typeId] = (this.theoryPool[typeId] || 0) + 1;
    this.refreshEnergy();
    this.refreshTheory();
  }

  clearTheory() {
    for (const [typeId, amount] of Object.entries(this.theoryPool)) {
      this.energy[typeId] = (this.energy[typeId] || 0) + amount;
    }
    this.theoryPool = {};
    this.refreshEnergy();
    this.refreshTheory();
  }

  runExperiment() {
    const entries = Object.entries(this.theoryPool)
      .filter(([_, amt]) => amt > 0)
      .map(([id, amt]) => ({ typeId: parseInt(id), amount: amt }));

    if (entries.length === 0) {
      this.showFeedback('Add energy to the theory pool first');
      return;
    }

    let match = null;

    if (entries.length === 1) {
      // Pure-type combination: type_b_id is null, all cost in type_a
      const e = entries[0];
      match = this.db.combinations.find(c =>
        c.typeAId === e.typeId && c.typeBId == null &&
        c.typeAAmount === e.amount &&
        !this.discoveredSpells.some(s => s.id === c.id)
      );
    } else if (entries.length === 2) {
      // Two-type combination (canonical ordering: lower ID first)
      const sorted = entries.sort((a, b) => a.typeId - b.typeId);
      match = this.db.combinations.find(c =>
        c.typeAId === sorted[0].typeId && c.typeBId === sorted[1].typeId &&
        c.typeAAmount === sorted[0].amount && c.typeBAmount === sorted[1].amount &&
        !this.discoveredSpells.some(s => s.id === c.id)
      );
    } else {
      this.showFeedback('Theories use 1 or 2 element types');
      return;
    }

    if (match) {
      // Discovery!
      this.theoryPool = {};
      this.discoveredSpells.push({ ...match, castCount: 0 });

      // Check if this experiment unlocks a secondary type
      if (match.typeBId != null) {
        const typeIds = [match.typeAId, match.typeBId].sort((a, b) => a - b);
        for (const [secId, parents] of Object.entries(COMPOSITIONS)) {
          const id = parseInt(secId);
          const node = this.boardNodes[id];
          if (node.unlocked) continue;
          const sorted = [...parents].sort((a, b) => a - b);
          if (sorted[0] === typeIds[0] && sorted[1] === typeIds[1]) {
            this.unlockNode(id);
          }
        }
      }

      this.refreshTheory();
      this.refreshSpells();
      this.showFeedback(`Discovered: ${match.name}!`, '#58a6ff');
    } else {
      // No match — return energy
      this.showFeedback('No discovery... energy returned');
      this.clearTheory();
    }
  }

  buyTower() {
    const total = Object.values(this.theoryPool).reduce((s, v) => s + v, 0);
    if (total < TOWER_COST) {
      this.showFeedback(`Need ${TOWER_COST} energy in theory pool (have ${total})`);
      return;
    }
    this.theoryPool = {};
    this.towerInventory++;
    this.refreshTheory();
    this.refreshInventory();
    this.showFeedback('Tower acquired!', '#58a6ff');
  }

  // --- Unlock System ---

  checkUnlocks() {
    // Tertiary: parent has >= 3 towers
    for (const [tertId, parentId] of Object.entries(DARK_PAIRS)) {
      const id = parseInt(tertId);
      const node = this.boardNodes[id];
      if (node.unlocked) continue;

      const parent = this.boardNodes[parentId];
      if (parent.towerCount >= TERTIARY_THRESHOLD) {
        this.unlockNode(id);
      }
    }
  }

  unlockNode(typeId) {
    const node = this.boardNodes[typeId];
    node.unlocked = true;

    // Redraw circle with type color (unlocked, no towers yet)
    this.drawNodeCircle(node.circle, node.colorInt, true, false);

    // Make interactive
    node.circle.setInteractive(new Phaser.Geom.Circle(0, 0, NODE_R + 5), Phaser.Geom.Circle.Contains);
    node.circle.on('pointerdown', () => {
      this.energy[typeId] = (this.energy[typeId] || 0) + 1;
      this.refreshEnergy();
      this.refreshTheory();
    });

    // Reveal and scale-in animation
    node.container.setVisible(true);
    node.container.setScale(0.3);
    node.container.setAlpha(1);
    this.tweens.add({
      targets: node.container,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Glow burst
    this.tweens.add({
      targets: node.glow,
      alpha: { from: 0.8, to: 0 },
      duration: 1000,
      ease: 'Cubic.easeOut'
    });

    // Redraw edges
    this.drawEdges();

    // Refresh energy to show new type
    this.refreshEnergy();

    const typeName = this.db.typeMap[typeId].name;
    this.showFeedback(`${typeName} unlocked!`, '#58a6ff');
  }

  // --- Spell Casting ---

  castSpell(index) {
    const spell = this.discoveredSpells[index];
    if (!spell) return;

    if (spell.typeBId == null) {
      // Pure-type spell: all cost from type A
      if ((this.energy[spell.typeAId] || 0) < spell.typeAAmount) {
        this.showFeedback('Not enough energy to cast');
        return;
      }
      this.energy[spell.typeAId] -= spell.typeAAmount;
    } else {
      if ((this.energy[spell.typeAId] || 0) < spell.typeAAmount ||
          (this.energy[spell.typeBId] || 0) < spell.typeBAmount) {
        this.showFeedback('Not enough energy to cast');
        return;
      }
      this.energy[spell.typeAId] -= spell.typeAAmount;
      this.energy[spell.typeBId] -= spell.typeBAmount;
    }

    spell.castCount++;
    this.refreshEnergy();
    this.refreshSpells();
    this.showFeedback(`Cast ${spell.name}!`, '#d2a8ff');
  }

  // --- UI Refresh Methods ---

  refreshAll() {
    this.refreshEnergy();
    this.refreshTheory();
    this.refreshInventory();
    this.refreshSpells();
  }

  refreshEnergy() {
    this.energyObjects.forEach(o => o.destroy());
    this.energyObjects = [];

    let col = 0;
    let row = 0;
    const startX = this._barLayout.sec1X;
    const startY = BOTTOM_BAR.y + 30;
    const colW = 80;
    const rowH = 32;
    const maxCols = Math.max(2, Math.floor((this._barLayout.div1X - startX) / colW));

    for (const t of this.db.types) {
      const node = this.boardNodes[t.id];
      if (!node.unlocked) continue;

      const x = startX + col * colW;
      const y = startY + row * rowH;
      const colorInt = parseInt(t.color.slice(1), 16);
      const amount = this.energy[t.id] || 0;

      // Colored circle
      const dot = this.add.graphics();
      dot.fillStyle(colorInt, amount > 0 ? 0.9 : 0.3);
      dot.fillCircle(x + 10, y + 10, 9);
      dot.lineStyle(1, colorInt, 0.8);
      dot.strokeCircle(x + 10, y + 10, 9);

      // Click to add to theory pool
      dot.setInteractive(new Phaser.Geom.Circle(x + 10, y + 10, 14), Phaser.Geom.Circle.Contains);
      dot.on('pointerdown', () => this.addToTheory(t.id));
      dot.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
      });
      dot.on('pointerout', () => {
        this.input.setDefaultCursor('default');
      });

      // Count text
      const countText = this.add.text(x + 24, y + 2, `${amount}`, {
        fontSize: '14px', color: amount > 0 ? '#e6edf3' : '#484f58', fontFamily: FONT
      });

      // Type initial
      const initial = this.add.text(x + 10, y + 10, t.name[0], {
        fontSize: '9px', color: '#000000', fontFamily: FONT, fontStyle: 'bold'
      }).setOrigin(0.5);

      this.energyObjects.push(dot, countText, initial);

      col++;
      if (col >= maxCols) { col = 0; row++; }
    }
  }

  refreshTheory() {
    this.theoryObjects.forEach(o => o.destroy());
    this.theoryObjects = [];

    const startX = this._barLayout.sec2X;
    const startY = BOTTOM_BAR.y + 30;

    const entries = Object.entries(this.theoryPool).filter(([_, amt]) => amt > 0);

    if (entries.length === 0) {
      const hint = this.add.text(startX, startY + 10, 'Click energy to add\nto theory pool', {
        fontSize: '12px', color: '#484f58', fontFamily: FONT, lineSpacing: 4
      });
      this.theoryObjects.push(hint);
      return;
    }

    let x = startX;
    for (const [typeId, amount] of entries) {
      const t = this.db.typeMap[parseInt(typeId)];
      const colorInt = parseInt(t.color.slice(1), 16);

      const dot = this.add.graphics();
      dot.fillStyle(colorInt, 0.9);
      dot.fillCircle(x + 10, startY + 15, 10);

      const txt = this.add.text(x + 24, startY + 7, `${amount}x ${t.name}`, {
        fontSize: '13px', color: '#e6edf3', fontFamily: FONT
      });

      this.theoryObjects.push(dot, txt);
      x += 90;
    }

    const totalText = this.add.text(startX, startY + 45, `Total: ${entries.reduce((s, [_, a]) => s + a, 0)}`, {
      fontSize: '12px', color: '#8b949e', fontFamily: FONT
    });
    this.theoryObjects.push(totalText);
  }

  refreshInventory() {
    this.inventoryObjects.forEach(o => o.destroy());
    this.inventoryObjects = [];

    // Remove old drag objects and their visuals
    this.towerDragObjects.forEach(o => {
      if (o && o.scene) {
        const visual = o.getData('visual');
        if (visual && visual.scene) visual.destroy();
        o.destroy();
      }
    });
    this.towerDragObjects = [];

    const startX = this._barLayout.sec3X;
    const startY = BOTTOM_BAR.y + 30;

    const countLabel = this.add.text(startX, startY, `Available: ${this.towerInventory}`, {
      fontSize: '14px', color: '#e6edf3', fontFamily: FONT
    });
    this.inventoryObjects.push(countLabel);

    // Create draggable tower icons
    for (let i = 0; i < this.towerInventory; i++) {
      const x = startX + 10 + i * 30;
      const y = startY + 35;
      const tower = this.createTowerIcon(x, y);
      this.towerDragObjects.push(tower);
    }
  }

  createTowerIcon(x, y) {
    // Use a Zone for the hit area (invisible, reliable dragging)
    const zone = this.add.zone(x, y, 44, 44).setRectangleDropZone(44, 44);
    zone.setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(zone);
    zone.setData('isTower', true);
    zone.setData('originX', x);
    zone.setData('originY', y);

    // Visual tower drawn as a separate graphics that follows the zone
    const g = this.add.graphics();
    g.fillStyle(0xcccccc, 1);
    g.fillRect(x - 8, y - 2, 16, 16);
    g.fillTriangle(x - 10, y - 2, x + 10, y - 2, x, y - 16);
    g.lineStyle(1, 0xffffff, 0.8);
    g.strokeRect(x - 8, y - 2, 16, 16);
    zone.setData('visual', g);

    return zone;
  }

  refreshSpells() {
    this.spellObjects.forEach(o => o.destroy());
    this.spellObjects = [];

    if (this.discoveredSpells.length === 0) {
      const hint = this.add.text(SPELL_PANEL.x + 20, 50, 'No spells discovered yet.\n\nPlace towers to generate energy,\nthen experiment with combinations!', {
        fontSize: '13px', color: '#484f58', fontFamily: FONT, lineSpacing: 6,
        wordWrap: { width: SPELL_PANEL.w - 40 }
      });
      this.spellContainer.add(hint);
      this.spellObjects.push(hint);
      return;
    }

    for (let i = 0; i < this.discoveredSpells.length; i++) {
      const spell = this.discoveredSpells[i];
      const y = this.spellListY + i * 98;
      const x = SPELL_PANEL.x + 10;

      // Card background
      const card = this.add.graphics();
      card.fillStyle(0x161b22, 0.95);
      card.fillRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);
      card.lineStyle(1, 0x30363d, 1);
      card.strokeRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);

      // Make clickable
      card.setInteractive(
        new Phaser.Geom.Rectangle(x, y, SPELL_PANEL.w - 20, 90),
        Phaser.Geom.Rectangle.Contains
      );
      const idx = i;
      card.on('pointerdown', () => this.castSpell(idx));
      card.on('pointerover', () => {
        card.clear();
        card.fillStyle(0x1c2333, 0.95);
        card.fillRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);
        card.lineStyle(1, 0x58a6ff, 0.6);
        card.strokeRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);
        this.input.setDefaultCursor('pointer');
      });
      card.on('pointerout', () => {
        card.clear();
        card.fillStyle(0x161b22, 0.95);
        card.fillRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);
        card.lineStyle(1, 0x30363d, 1);
        card.strokeRoundedRect(x, y, SPELL_PANEL.w - 20, 90, 6);
        this.input.setDefaultCursor('default');
      });

      // Name
      const name = this.add.text(x + 10, y + 8, spell.name, {
        fontSize: '14px', color: '#e6edf3', fontFamily: FONT, fontStyle: 'bold'
      });

      // Description
      const desc = this.add.text(x + 10, y + 28, spell.description || '', {
        fontSize: '11px', color: '#8b949e', fontFamily: FONT,
        wordWrap: { width: SPELL_PANEL.w - 50 }
      });

      // Cost line
      const typeA = this.db.typeMap[spell.typeAId];
      const typeB = spell.typeBId != null ? this.db.typeMap[spell.typeBId] : null;
      let costStr;
      if (typeB == null) {
        costStr = `Cost: ${spell.typeAAmount} ${typeA.name}`;
      } else {
        costStr = `Cost: ${spell.typeAAmount} ${typeA.name} + ${spell.typeBAmount} ${typeB.name}`;
      }
      const cost = this.add.text(x + 10, y + 52, costStr, {
        fontSize: '11px', color: '#7ee787', fontFamily: FONT
      });

      // Cast count
      const mechLabel = spell.mechanic ? ` [${spell.mechanic}]` : '';
      const castInfo = this.add.text(x + 10, y + 70, `${spell.nature || ''}${mechLabel}  |  Cast: ${spell.castCount}x`, {
        fontSize: '10px', color: '#6e7681', fontFamily: FONT
      });

      this.spellContainer.add(card);
      this.spellContainer.add(name);
      this.spellContainer.add(desc);
      this.spellContainer.add(cost);
      this.spellContainer.add(castInfo);
      this.spellObjects.push(card, name, desc, cost, castInfo);
    }
  }

  // --- UI Helpers ---

  createButton(x, y, label, callback, color, width) {
    const h = 30;
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.9);
    bg.fillRoundedRect(x, y, width, h, 4);

    const txt = this.add.text(x + width / 2, y + h / 2, label, {
      fontSize: '13px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5);

    bg.setInteractive(new Phaser.Geom.Rectangle(x, y, width, h), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', callback);
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x, y, width, h, 4);
      bg.lineStyle(1, 0xffffff, 0.3);
      bg.strokeRoundedRect(x, y, width, h, 4);
      this.input.setDefaultCursor('pointer');
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 0.9);
      bg.fillRoundedRect(x, y, width, h, 4);
      this.input.setDefaultCursor('default');
    });

    return { bg, txt };
  }

  showFeedback(message, color = '#f0883e') {
    if (this.feedbackText) this.feedbackText.destroy();

    this.feedbackText = this.add.text(BOARD_CX, BOARD_AREA.h - 20, message, {
      fontSize: '16px', color, fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.feedbackText,
      y: BOARD_AREA.h - 50,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (this.feedbackText) this.feedbackText.destroy();
        this.feedbackText = null;
      }
    });
  }
}


// ============================================
// Bootstrap
// ============================================

(async () => {
  try {
    const data = await loadDatabase();
    window.GAME_DATA = data;

    const config = {
      type: Phaser.AUTO,
      width: CANVAS_W,
      height: CANVAS_H,
      scene: WizardGameScene,
      parent: document.body,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.NONE
      }
    };

    new Phaser.Game(config);
  } catch (err) {
    document.body.innerHTML = `<div style="color:#f55;padding:40px;font-family:sans-serif;">
      <h2>Failed to load</h2><p>${err.message}</p>
      <p>Make sure to run <code>python database/build.py</code> and serve from the project root via HTTP.</p>
    </div>`;
  }
})();
