import Konva from 'konva';

/**
 * Type name → display color mapping.
 * Built dynamically from catalog in setTypeColors().
 * Falls back to defaults if not set.
 */
let TYPE_COLORS = {};

/**
 * RoguelikeRenderer — renders the roguelike game.
 * Two modes: map view (node map) and combat view.
 */
export class RoguelikeRenderer {
  constructor(containerId) {
    const container = document.getElementById(containerId);
    const w = window.innerWidth;
    const h = window.innerHeight - (container.offsetTop || 0);

    this.stage = new Konva.Stage({
      container: containerId,
      width: w,
      height: h,
    });

    // Layers
    this.bgLayer = new Konva.Layer();
    this.mapLayer = new Konva.Layer();
    this.combatLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();

    this.stage.add(this.bgLayer);
    this.stage.add(this.mapLayer);
    this.stage.add(this.combatLayer);
    this.stage.add(this.uiLayer);

    // Event listeners
    this._listeners = {};

    // Current view state
    this._currentPhase = null;

    // Background
    this.bgLayer.add(new Konva.Rect({
      x: 0, y: 0,
      width: w, height: h,
      fill: '#1a1a2e',
    }));
    this.bgLayer.draw();

    // Handle resize
    window.addEventListener('resize', () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight - (container.offsetTop || 0);
      this.stage.width(newW);
      this.stage.height(newH);
      // Update background
      this.bgLayer.destroyChildren();
      this.bgLayer.add(new Konva.Rect({
        x: 0, y: 0,
        width: newW, height: newH,
        fill: '#1a1a2e',
      }));
      // Re-render current state
      if (this._lastState) {
        this.update(this._lastState.G, this._lastState.ctx);
      }
    });

    // Pan & zoom on map
    this.setupPanZoom();
  }

  destroy() {
    this.stage.destroy();
    this._listeners = {};
    this._lastState = null;
  }

  /**
   * Set type colors from the catalog's types array.
   * Call once after loading the DB.
   */
  setTypeColors(types) {
    TYPE_COLORS = {};
    for (const t of types) {
      TYPE_COLORS[t.name.toLowerCase()] = t.color;
    }
  }

  /**
   * Store roguelike progression data for rendering Laboratory.
   */
  setRoguelikeData(data) {
    this._roguelikeData = data;
  }

  /**
   * Check if the player can afford a card's type cost.
   */
  canAffordCard(typeEnergy, card) {
    const cost = card.data.typeCost;
    if (!cost) return false;
    for (const [type, amount] of Object.entries(cost)) {
      if ((typeEnergy[type] || 0) < amount) return false;
    }
    return true;
  }

  on(event, callback) {
    this._listeners[event] = callback;
  }

  emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event](...args);
    }
  }

  /**
   * Main update — called on every state change.
   */
  update(G, ctx) {
    this._lastState = { G, ctx };
    const phase = ctx.phase;

    // Update toolbar stats
    this.updateToolbar(G, ctx);

    if (phase === 'schoolSelection') {
      this.combatLayer.hide();
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderSchoolSelection(G);
    } else if (phase === 'mapNavigation') {
      this.combatLayer.hide();
      this.mapLayer.show();
      this.renderMap(G);
    } else if (phase === 'combat') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderCombat(G);
    } else if (phase === 'reward') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderReward(G);
    } else if (phase === 'rest') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderRest(G);
    } else if (phase === 'shop') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderShop(G);
    } else if (phase === 'runEnd') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderRunEnd(G);
    } else if (phase === 'laboratory') {
      this.mapLayer.hide();
      this.combatLayer.show();
      this.renderLaboratory(G);
    }

    this._currentPhase = phase;
  }

  /**
   * Update the HTML toolbar stats.
   */
  updateToolbar(G, ctx) {
    const hpEl = document.getElementById('stat-hp');
    const energyEl = document.getElementById('stat-energy');
    const goldEl = document.getElementById('stat-gold');
    const actEl = document.getElementById('stat-act');
    const phaseEl = document.getElementById('phase-badge');

    if (hpEl) hpEl.textContent = `${G.player.hp}/${G.player.maxHp}`;
    if (energyEl) {
      // Show active type energy as colored badges
      const active = Object.entries(G.player.maxTypeEnergy || {}).filter(([, max]) => max > 0);
      energyEl.innerHTML = active.map(([type, max]) => {
        const current = G.player.typeEnergy?.[type] || 0;
        const color = TYPE_COLORS[type] || '#888';
        return `<span style="color:${color};margin-right:4px;" title="${type}">${type.slice(0,3)}:${current}</span>`;
      }).join('');
    }
    if (goldEl) goldEl.textContent = G.run.gold;
    if (actEl) actEl.textContent = G.run.act;
    if (phaseEl) phaseEl.textContent = ctx.phase || 'map';

    // Meta stats (Insight / Materials)
    const metaGroup = document.getElementById('meta-stats-group');
    if (metaGroup && G.meta) {
      metaGroup.style.display = '';
      const insightEl = document.getElementById('stat-insight');
      const materialsEl = document.getElementById('stat-materials');
      if (insightEl) insightEl.textContent = G.meta.insight;
      if (materialsEl) materialsEl.textContent = G.meta.materials;
    }
  }

  /**
   * Render school selection (run start).
   */
  renderSchoolSelection(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();
    const types = G.catalog?.types || [];

    // Filter to primary types only
    const primaryTypes = types.filter(t => t.tier === 'primary');

    this.combatLayer.add(new Konva.Text({
      text: 'Choose Your School',
      fontSize: 28, fill: '#F4D03F',
      x: 0, y: 30,
      width: w, align: 'center',
    }));

    this.combatLayer.add(new Konva.Text({
      text: 'Your school grants +1 energy of that type and a signature spell',
      fontSize: 12, fill: '#888',
      x: 0, y: 65,
      width: w, align: 'center',
    }));

    const cardW = 160;
    const cardH = 180;
    const gap = 20;
    const totalW = primaryTypes.length * (cardW + gap) - gap;
    const startX = (w - totalW) / 2;
    const cardsY = 100;

    primaryTypes.forEach((type, i) => {
      const cx = startX + i * (cardW + gap);
      const color = type.color || '#888';
      const currentEnergy = G.player.maxTypeEnergy?.[type.name.toLowerCase()] || 0;

      const group = new Konva.Group({ x: cx, y: cardsY });

      // Card background
      group.add(new Konva.Rect({
        width: cardW, height: cardH,
        fill: '#16213e',
        stroke: color,
        strokeWidth: 2,
        cornerRadius: 8,
      }));

      // Colored header
      group.add(new Konva.Rect({
        width: cardW, height: 40,
        fill: color,
        cornerRadius: [8, 8, 0, 0],
        opacity: 0.9,
      }));

      // Type name
      group.add(new Konva.Text({
        text: type.name,
        fontSize: 18, fill: '#fff',
        fontStyle: 'bold',
        x: 0, y: 8,
        width: cardW,
        align: 'center',
      }));

      // Icon
      group.add(new Konva.Text({
        text: type.icon_symbol || '',
        fontSize: 24,
        x: 0, y: 50,
        width: cardW,
        align: 'center',
      }));

      // Bonus description
      group.add(new Konva.Text({
        text: `+1 ${type.name} energy\n(${currentEnergy} → ${currentEnergy + 1} per turn)`,
        fontSize: 11, fill: '#aaa',
        x: 10, y: 85,
        width: cardW - 20,
        align: 'center',
        lineHeight: 1.4,
      }));

      // Archetype
      if (type.primary_archetype) {
        group.add(new Konva.Text({
          text: type.primary_archetype,
          fontSize: 10, fill: '#666',
          x: 0, y: 120,
          width: cardW,
          align: 'center',
        }));
      }

      // Select button
      const btn = new Konva.Group({ x: 15, y: cardH - 42 });
      btn.add(new Konva.Rect({
        width: cardW - 30, height: 32,
        fill: color, cornerRadius: 4,
      }));
      btn.add(new Konva.Text({
        text: 'Choose',
        fontSize: 13, fill: '#fff',
        fontStyle: 'bold',
        width: cardW - 30, height: 32,
        align: 'center', verticalAlign: 'middle',
      }));
      btn.on('click tap', () => { this.emit('schoolSelected', type.id); });
      btn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
      btn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
      group.add(btn);

      this.combatLayer.add(group);
    });

    this.combatLayer.draw();
  }

  /**
   * Render the branching node map.
   */
  renderMap(G) {
    this.mapLayer.destroyChildren();

    const map = G.run.map;
    const w = this.stage.width();
    const h = this.stage.height();
    const padding = 60;
    const mapH = h - padding * 2;
    const mapW = w - padding * 2;

    // Find max floor
    const maxFloor = Math.max(...map.nodes.map(n => n.floor));

    // Draw edges first (behind nodes)
    for (const edge of map.edges) {
      const fromNode = map.nodes.find(n => n.id === edge.from);
      const toNode = map.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) continue;

      const fromY = padding + (maxFloor - fromNode.floor) / maxFloor * mapH;
      const toY = padding + (maxFloor - toNode.floor) / maxFloor * mapH;
      const fromX = padding + fromNode.x * mapW;
      const toX = padding + toNode.x * mapW;

      this.mapLayer.add(new Konva.Line({
        points: [fromX, fromY, toX, toY],
        stroke: '#333',
        strokeWidth: 2,
      }));
    }

    // Draw nodes
    const nodeColors = {
      combat: '#E74C3C',
      elite: '#F39C12',
      rest: '#27AE60',
      shop: '#8E44AD',
      boss: '#C0392B',
    };

    const nodeIcons = {
      combat: '\u2694',    // crossed swords
      elite: '\u2620',     // skull
      rest: '\u2665',      // heart
      shop: '\u2606',      // star
      boss: '\u265B',      // chess queen
    };

    for (const node of map.nodes) {
      const y = padding + (maxFloor - node.floor) / maxFloor * mapH;
      const x = padding + node.x * mapW;
      const radius = node.type === 'boss' ? 24 : 18;

      const isReachable = this.isNodeReachable(map, G.run.position, node.id);
      const isCurrent = G.run.position === node.id;
      const isVisited = false; // TODO: track visited nodes

      const group = new Konva.Group({ x, y });

      // Node circle
      group.add(new Konva.Circle({
        radius,
        fill: isCurrent ? '#F4D03F' : (isReachable ? nodeColors[node.type] : '#2a2a3e'),
        stroke: isReachable ? '#fff' : '#444',
        strokeWidth: isReachable ? 2 : 1,
        opacity: isReachable || isCurrent ? 1 : 0.4,
      }));

      // Node icon
      group.add(new Konva.Text({
        text: nodeIcons[node.type] || '?',
        fontSize: node.type === 'boss' ? 18 : 14,
        fill: isCurrent ? '#1a1a2e' : '#fff',
        align: 'center',
        verticalAlign: 'middle',
        width: radius * 2,
        height: radius * 2,
        offsetX: radius,
        offsetY: radius,
      }));

      // Click handler for reachable nodes
      if (isReachable) {
        group.on('click tap', () => {
          this.emit('nodeSelected', node.id);
        });
        group.on('mouseenter', () => {
          document.body.style.cursor = 'pointer';
        });
        group.on('mouseleave', () => {
          document.body.style.cursor = 'default';
        });
      }

      this.mapLayer.add(group);
    }

    // Floor labels on the left
    for (let floor = 0; floor <= maxFloor; floor++) {
      const y = padding + (maxFloor - floor) / maxFloor * mapH;
      this.mapLayer.add(new Konva.Text({
        x: 10,
        y: y - 6,
        text: floor === maxFloor ? 'BOSS' : `${floor + 1}`,
        fontSize: 11,
        fill: '#666',
      }));
    }

    this.mapLayer.draw();
  }

  /**
   * Check if a node is reachable from current position.
   */
  isNodeReachable(map, currentPosition, targetNodeId) {
    if (currentPosition === null) {
      const target = map.nodes.find(n => n.id === targetNodeId);
      return target && target.floor === 0;
    }
    return map.edges.some(e => e.from === currentPosition && e.to === targetNodeId);
  }

  /**
   * Render the combat scene.
   */
  renderCombat(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();
    const enemy = G.combat.enemy;

    // Enemy display
    const enemyGroup = new Konva.Group({ x: w / 2, y: h * 0.25 });

    enemyGroup.add(new Konva.Circle({
      radius: 40,
      fill: enemy.isBoss ? '#C0392B' : '#E74C3C',
      stroke: '#fff',
      strokeWidth: 2,
    }));

    enemyGroup.add(new Konva.Text({
      text: enemy.name,
      fontSize: 14,
      fill: '#fff',
      align: 'center',
      width: 200,
      offsetX: 100,
      y: 50,
    }));

    // Enemy HP bar
    const hpBarWidth = 120;
    const hpPct = G.combat.enemyHp / G.combat.enemyMaxHp;
    enemyGroup.add(new Konva.Rect({
      x: -hpBarWidth / 2, y: 70,
      width: hpBarWidth, height: 10,
      fill: '#333', cornerRadius: 3,
    }));
    enemyGroup.add(new Konva.Rect({
      x: -hpBarWidth / 2, y: 70,
      width: hpBarWidth * Math.max(0, hpPct), height: 10,
      fill: '#E74C3C', cornerRadius: 3,
    }));
    enemyGroup.add(new Konva.Text({
      text: `${G.combat.enemyHp}/${G.combat.enemyMaxHp}`,
      fontSize: 10, fill: '#fff',
      align: 'center', width: hpBarWidth,
      x: -hpBarWidth / 2, y: 72,
    }));

    // Enemy intent (attack value)
    enemyGroup.add(new Konva.Text({
      text: `ATK: ${enemy.attack}`,
      fontSize: 12, fill: '#F39C12',
      align: 'center', width: 100,
      offsetX: 50, y: 88,
    }));

    this.combatLayer.add(enemyGroup);

    // Player HP bar at bottom
    const playerY = h * 0.75;
    const playerHpPct = G.player.hp / G.player.maxHp;
    this.combatLayer.add(new Konva.Rect({
      x: w / 2 - 80, y: playerY,
      width: 160, height: 14,
      fill: '#333', cornerRadius: 3,
    }));
    this.combatLayer.add(new Konva.Rect({
      x: w / 2 - 80, y: playerY,
      width: 160 * Math.max(0, playerHpPct), height: 14,
      fill: '#27AE60', cornerRadius: 3,
    }));
    this.combatLayer.add(new Konva.Text({
      text: `HP: ${G.player.hp}/${G.player.maxHp}`,
      fontSize: 11, fill: '#fff',
      align: 'center', width: 160,
      x: w / 2 - 80, y: playerY + 1,
    }));

    // Player block
    if (G.combat.playerBlock > 0) {
      this.combatLayer.add(new Konva.Text({
        text: `Block: ${G.combat.playerBlock}`,
        fontSize: 12, fill: '#2E86C1',
        x: w / 2 + 90, y: playerY,
      }));
    }

    // Type energy display — show only types with max > 0
    const activeEnergy = Object.entries(G.player.maxTypeEnergy).filter(([, max]) => max > 0);
    const energyY = playerY + 20;
    const energyStartX = w / 2 - (activeEnergy.length * 50) / 2;

    activeEnergy.forEach(([type, max], i) => {
      const current = G.player.typeEnergy[type] || 0;
      const color = TYPE_COLORS[type] || '#888';
      const ex = energyStartX + i * 50;

      this.combatLayer.add(new Konva.Circle({
        x: ex + 12, y: energyY + 8,
        radius: 8,
        fill: current > 0 ? color : '#333',
        stroke: color,
        strokeWidth: 1,
      }));
      this.combatLayer.add(new Konva.Text({
        text: `${current}`,
        fontSize: 11, fill: '#fff',
        x: ex + 6, y: energyY + 2,
        width: 12, align: 'center',
      }));
      this.combatLayer.add(new Konva.Text({
        text: type.slice(0, 3),
        fontSize: 8, fill: '#888',
        x: ex, y: energyY + 20,
        width: 24, align: 'center',
      }));
    });

    // Hand cards
    const handY = playerY + 50;
    const cardW = 120;
    const cardH = 160;
    const gap = 10;
    const totalHandW = G.player.hand.length * (cardW + gap) - gap;
    const startX = (w - totalHandW) / 2;

    G.player.hand.forEach((card, i) => {
      const cx = startX + i * (cardW + gap);
      const cardGroup = new Konva.Group({ x: cx, y: handY });

      const affordable = this.canAffordCard(G.player.typeEnergy, card);

      // Card background with type-colored header
      const headerColor = card.data.type_a_color || '#444';
      cardGroup.add(new Konva.Rect({
        width: cardW, height: cardH,
        fill: '#16213e',
        stroke: affordable ? headerColor : '#333',
        strokeWidth: affordable ? 2 : 1,
        cornerRadius: 6,
      }));

      // Colored header bar
      cardGroup.add(new Konva.Rect({
        width: cardW, height: 26,
        fill: headerColor,
        cornerRadius: [6, 6, 0, 0],
        opacity: affordable ? 0.9 : 0.3,
      }));

      // Card name
      cardGroup.add(new Konva.Text({
        text: card.data.name || 'Card',
        fontSize: 10, fill: '#fff',
        fontStyle: 'bold',
        x: 4, y: 5,
        width: cardW - 8,
        align: 'center',
      }));

      // Type cost pips (colored circles)
      const typeCost = card.data.typeCost || {};
      let pipX = 6;
      for (const [type, amount] of Object.entries(typeCost)) {
        const pipColor = TYPE_COLORS[type] || '#888';
        const hasEnough = (G.player.typeEnergy[type] || 0) >= amount;
        for (let p = 0; p < amount; p++) {
          cardGroup.add(new Konva.Circle({
            x: pipX + 6, y: 36,
            radius: 5,
            fill: hasEnough ? pipColor : '#333',
            stroke: pipColor,
            strokeWidth: 1,
          }));
          pipX += 13;
        }
        // Type label
        cardGroup.add(new Konva.Text({
          text: type.slice(0, 3),
          fontSize: 7, fill: '#888',
          x: pipX - amount * 13, y: 43,
          width: amount * 13,
          align: 'center',
        }));
      }

      // Damage/block text
      let effectText = '';
      if (card.data.damage) effectText += `DMG ${card.data.damage}`;
      if (card.data.block) effectText += (effectText ? '  |  ' : '') + `BLK ${card.data.block}`;

      cardGroup.add(new Konva.Text({
        text: effectText,
        fontSize: 11, fill: affordable ? '#fff' : '#666',
        fontStyle: 'bold',
        x: 6, y: 55,
        width: cardW - 12,
      }));

      // Description
      if (card.data.description) {
        cardGroup.add(new Konva.Text({
          text: card.data.description,
          fontSize: 8, fill: '#777',
          x: 6, y: 72,
          width: cardW - 12,
          lineHeight: 1.3,
        }));
      }

      // Nature/mechanic badge
      if (card.data.nature) {
        cardGroup.add(new Konva.Text({
          text: card.data.nature,
          fontSize: 8, fill: '#555',
          x: 6, y: cardH - 14,
          width: cardW - 12,
          align: 'center',
        }));
      }

      // Click to play
      if (affordable) {
        cardGroup.on('click tap', () => {
          this.emit('cardPlayed', card.id);
        });
        cardGroup.on('mouseenter', () => {
          document.body.style.cursor = 'pointer';
        });
        cardGroup.on('mouseleave', () => {
          document.body.style.cursor = 'default';
        });
      }

      this.combatLayer.add(cardGroup);
    });

    // End Turn button
    const endTurnBtn = new Konva.Group({ x: w - 120, y: playerY - 30 });
    endTurnBtn.add(new Konva.Rect({
      width: 100, height: 36,
      fill: '#E74C3C', cornerRadius: 6,
    }));
    endTurnBtn.add(new Konva.Text({
      text: 'End Turn',
      fontSize: 13, fill: '#fff',
      width: 100, height: 36,
      align: 'center', verticalAlign: 'middle',
    }));
    endTurnBtn.on('click tap', () => {
      this.emit('endTurn');
    });
    endTurnBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    endTurnBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(endTurnBtn);

    this.combatLayer.draw();
  }

  /**
   * Render reward selection screen.
   */
  renderReward(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();

    this.combatLayer.add(new Konva.Text({
      text: 'Victory!',
      fontSize: 28, fill: '#F4D03F',
      x: 0, y: 20,
      width: w, align: 'center',
    }));

    this.combatLayer.add(new Konva.Text({
      text: `+${G.reward.gold} Gold`,
      fontSize: 16, fill: '#F39C12',
      x: 0, y: 55,
      width: w, align: 'center',
    }));

    // Card choices
    const cards = G.reward.cards || [];
    if (cards.length > 0) {
      this.combatLayer.add(new Konva.Text({
        text: 'Choose a card to add to your deck:',
        fontSize: 13, fill: '#aaa',
        x: 0, y: 85,
        width: w, align: 'center',
      }));

      const cardW = 140;
      const cardH = 190;
      const gap = 20;
      const totalW = cards.length * (cardW + gap) - gap;
      const startX = (w - totalW) / 2;
      const cardsY = 110;

      cards.forEach((card, i) => {
        const cx = startX + i * (cardW + gap);
        const cardGroup = new Konva.Group({ x: cx, y: cardsY });

        const headerColor = card.data.type_a_color || '#444';

        // Card background
        cardGroup.add(new Konva.Rect({
          width: cardW, height: cardH,
          fill: '#16213e',
          stroke: headerColor,
          strokeWidth: 2,
          cornerRadius: 6,
        }));

        // Header bar
        cardGroup.add(new Konva.Rect({
          width: cardW, height: 28,
          fill: headerColor,
          cornerRadius: [6, 6, 0, 0],
          opacity: 0.9,
        }));

        // Name
        cardGroup.add(new Konva.Text({
          text: card.data.name,
          fontSize: 12, fill: '#fff',
          fontStyle: 'bold',
          x: 4, y: 6,
          width: cardW - 8,
          align: 'center',
        }));

        // Type cost pips
        const typeCost = card.data.typeCost || {};
        let pipX = 8;
        for (const [type, amount] of Object.entries(typeCost)) {
          const pipColor = TYPE_COLORS[type] || '#888';
          for (let p = 0; p < amount; p++) {
            cardGroup.add(new Konva.Circle({
              x: pipX + 6, y: 40,
              radius: 6,
              fill: pipColor,
              stroke: '#fff',
              strokeWidth: 1,
            }));
            pipX += 15;
          }
        }

        // Stats
        let statsText = '';
        if (card.data.damage) statsText += `DMG ${card.data.damage}`;
        if (card.data.block) statsText += (statsText ? '  |  ' : '') + `BLK ${card.data.block}`;

        cardGroup.add(new Konva.Text({
          text: statsText,
          fontSize: 13, fill: '#fff',
          fontStyle: 'bold',
          x: 8, y: 56,
          width: cardW - 16,
        }));

        // Description
        if (card.data.description) {
          cardGroup.add(new Konva.Text({
            text: card.data.description,
            fontSize: 9, fill: '#888',
            x: 8, y: 76,
            width: cardW - 16,
            lineHeight: 1.3,
          }));
        }

        // Pick button
        const btnY = cardH - 36;
        const btn = new Konva.Group({ x: 15, y: btnY });
        btn.add(new Konva.Rect({
          width: cardW - 30, height: 28,
          fill: '#27AE60', cornerRadius: 4,
        }));
        btn.add(new Konva.Text({
          text: 'Add to Deck',
          fontSize: 11, fill: '#fff',
          width: cardW - 30, height: 28,
          align: 'center', verticalAlign: 'middle',
        }));
        btn.on('click tap', () => { this.emit('selectReward', card.id); });
        btn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
        btn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
        cardGroup.add(btn);

        this.combatLayer.add(cardGroup);
      });
    }

    // Instrument offer
    const inst = G.reward.instrument;
    if (inst) {
      const instY = cards.length > 0 ? 320 : 110;
      const instColor = inst.data.color || '#888';

      this.combatLayer.add(new Konva.Text({
        text: 'Instrument found:',
        fontSize: 12, fill: '#aaa',
        x: 0, y: instY - 18,
        width: w, align: 'center',
      }));

      const instGroup = new Konva.Group({ x: w / 2 - 100, y: instY });

      instGroup.add(new Konva.Rect({
        width: 200, height: 70,
        fill: '#16213e',
        stroke: instColor,
        strokeWidth: 2,
        cornerRadius: 6,
      }));

      // Colored left bar
      instGroup.add(new Konva.Rect({
        width: 6, height: 70,
        fill: instColor,
        cornerRadius: [6, 0, 0, 6],
      }));

      instGroup.add(new Konva.Text({
        text: inst.data.name,
        fontSize: 13, fill: '#fff',
        fontStyle: 'bold',
        x: 14, y: 6,
        width: 180,
      }));

      instGroup.add(new Konva.Text({
        text: `+1 ${inst.data.typeName} energy per turn`,
        fontSize: 11, fill: instColor,
        x: 14, y: 24,
        width: 180,
      }));

      // Equip button
      const equipBtn = new Konva.Group({ x: 14, y: 42 });
      equipBtn.add(new Konva.Rect({
        width: 80, height: 22,
        fill: instColor, cornerRadius: 3,
      }));
      equipBtn.add(new Konva.Text({
        text: 'Equip',
        fontSize: 11, fill: '#fff',
        width: 80, height: 22,
        align: 'center', verticalAlign: 'middle',
      }));
      equipBtn.on('click tap', () => { this.emit('selectInstrument'); });
      equipBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
      equipBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
      instGroup.add(equipBtn);

      this.combatLayer.add(instGroup);
    }

    // Skip button
    const skipBtn = new Konva.Group({ x: w / 2 - 60, y: h - 60 });
    skipBtn.add(new Konva.Rect({
      width: 120, height: 40,
      fill: '#555', cornerRadius: 6,
    }));
    skipBtn.add(new Konva.Text({
      text: 'Skip',
      fontSize: 14, fill: '#fff',
      width: 120, height: 40,
      align: 'center', verticalAlign: 'middle',
    }));
    skipBtn.on('click tap', () => { this.emit('skipReward'); });
    skipBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    skipBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(skipBtn);

    this.combatLayer.draw();
  }

  /**
   * Render rest site.
   */
  renderRest(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();
    const healAmount = Math.floor(G.player.maxHp * 0.3);

    this.combatLayer.add(new Konva.Text({
      text: 'Rest Site',
      fontSize: 24, fill: '#27AE60',
      x: 0, y: 25,
      width: w, align: 'center',
    }));

    this.combatLayer.add(new Konva.Text({
      text: 'Choose one:',
      fontSize: 13, fill: '#888',
      x: 0, y: 60,
      width: w, align: 'center',
    }));

    // Option 1: Heal
    const healBtn = new Konva.Group({ x: w / 2 - 200, y: 90 });
    healBtn.add(new Konva.Rect({
      width: 180, height: 60,
      fill: '#27AE60', cornerRadius: 6,
    }));
    healBtn.add(new Konva.Text({
      text: `Heal\n+${healAmount} HP`,
      fontSize: 14, fill: '#fff',
      width: 180, height: 60,
      align: 'center', verticalAlign: 'middle',
      lineHeight: 1.4,
    }));
    healBtn.on('click tap', () => { this.emit('heal'); });
    healBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    healBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(healBtn);

    // Option 2: Attune
    const attuneBtn = new Konva.Group({ x: w / 2 + 20, y: 90 });
    attuneBtn.add(new Konva.Rect({
      width: 180, height: 60,
      fill: '#8E44AD', cornerRadius: 6,
    }));
    attuneBtn.add(new Konva.Text({
      text: 'Attune\n+1 type energy',
      fontSize: 14, fill: '#fff',
      width: 180, height: 60,
      align: 'center', verticalAlign: 'middle',
      lineHeight: 1.4,
    }));
    attuneBtn.on('click tap', () => {
      this._showAttunePanel = !this._showAttunePanel;
      this.renderRest(G);
    });
    attuneBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    attuneBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(attuneBtn);

    // Attunement type grid (shown when Attune is clicked)
    if (this._showAttunePanel) {
      const allTypes = Object.keys(G.player.maxTypeEnergy);
      const cols = 4;
      const cellW = 90;
      const cellH = 40;
      const gridW = cols * (cellW + 8);
      const gridStartX = (w - gridW) / 2;
      const gridY = 170;

      this.combatLayer.add(new Konva.Text({
        text: 'Choose a type to attune (+1 max energy):',
        fontSize: 12, fill: '#aaa',
        x: 0, y: gridY - 20,
        width: w, align: 'center',
      }));

      allTypes.forEach((type, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = gridStartX + col * (cellW + 8);
        const cy = gridY + row * (cellH + 8);
        const color = TYPE_COLORS[type] || '#888';
        const currentMax = G.player.maxTypeEnergy[type] || 0;
        const attunements = G.player.attunements?.[type] || 0;

        const typeBtn = new Konva.Group({ x: cx, y: cy });

        typeBtn.add(new Konva.Rect({
          width: cellW, height: cellH,
          fill: '#1a1a2e',
          stroke: color,
          strokeWidth: 2,
          cornerRadius: 4,
        }));

        // Type name + current energy
        typeBtn.add(new Konva.Text({
          text: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
          fontSize: 11, fill: '#fff',
          x: 4, y: 4,
          width: cellW - 8,
        }));

        typeBtn.add(new Konva.Text({
          text: `${currentMax} energy${attunements > 0 ? ` (+${attunements})` : ''}`,
          fontSize: 9, fill: '#888',
          x: 4, y: 20,
          width: cellW - 8,
        }));

        // Color pip
        typeBtn.add(new Konva.Circle({
          x: cellW - 12, y: cellH / 2,
          radius: 6,
          fill: color,
        }));

        typeBtn.on('click tap', () => {
          this._showAttunePanel = false;
          this.emit('attune', type);
        });
        typeBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
        typeBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });

        this.combatLayer.add(typeBtn);
      });
    }

    this.combatLayer.draw();
  }

  /**
   * Render shop (placeholder).
   */
  renderShop(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();

    // Title
    this.combatLayer.add(new Konva.Text({
      text: 'Shop',
      fontSize: 28, fill: '#8E44AD',
      x: 0, y: 30,
      width: w, align: 'center',
    }));

    // Gold display
    this.combatLayer.add(new Konva.Text({
      text: `Gold: ${G.run.gold}`,
      fontSize: 18, fill: '#F39C12',
      x: 0, y: 65,
      width: w, align: 'center',
    }));

    // Cards for sale
    const shopCards = G.shop?.cards || [];
    const cardW = 130;
    const cardH = 180;
    const gap = 20;
    const totalW = shopCards.length * (cardW + gap) - gap;
    const startX = (w - totalW) / 2;
    const cardsY = 110;

    shopCards.forEach((card, i) => {
      const cx = startX + i * (cardW + gap);
      const canAfford = G.run.gold >= card.data.price;
      const cardGroup = new Konva.Group({ x: cx, y: cardsY });

      // Card background
      cardGroup.add(new Konva.Rect({
        width: cardW, height: cardH,
        fill: '#16213e',
        stroke: canAfford ? '#F39C12' : '#444',
        strokeWidth: canAfford ? 2 : 1,
        cornerRadius: 6,
      }));

      // Card name
      cardGroup.add(new Konva.Text({
        text: card.data.name,
        fontSize: 13, fill: '#fff',
        fontStyle: 'bold',
        padding: 8, width: cardW,
        align: 'center',
      }));

      // Type cost pips
      const typeCost = card.data.typeCost || {};
      let pipX = 8;
      const pipY = 35;
      for (const [type, amount] of Object.entries(typeCost)) {
        const pipColor = TYPE_COLORS[type] || '#888';
        for (let p = 0; p < amount; p++) {
          cardGroup.add(new Konva.Circle({
            x: pipX + 5, y: pipY + 5,
            radius: 5,
            fill: pipColor,
            stroke: pipColor,
            strokeWidth: 1,
          }));
          pipX += 12;
        }
      }

      // Card stats
      let statsText = '';
      if (card.data.damage) statsText += `DMG: ${card.data.damage}  `;
      if (card.data.block) statsText += `BLK: ${card.data.block}`;

      cardGroup.add(new Konva.Text({
        text: statsText,
        fontSize: 11, fill: '#aaa',
        x: 8, y: 52,
        width: cardW - 16,
        lineHeight: 1.4,
      }));

      // Price tag
      const priceColor = canAfford ? '#F39C12' : '#666';
      cardGroup.add(new Konva.Rect({
        x: cardW / 2 - 30, y: cardH - 45,
        width: 60, height: 24,
        fill: canAfford ? '#2c1810' : '#1a1a1a',
        stroke: priceColor,
        strokeWidth: 1,
        cornerRadius: 4,
      }));
      cardGroup.add(new Konva.Text({
        text: `${card.data.price}g`,
        fontSize: 13, fill: priceColor,
        fontStyle: 'bold',
        x: cardW / 2 - 30, y: cardH - 42,
        width: 60,
        align: 'center',
      }));

      // Buy button
      if (canAfford) {
        const buyBtn = new Konva.Group({ x: 15, y: cardH - 15 });
        buyBtn.add(new Konva.Rect({
          width: cardW - 30, height: 28,
          fill: '#27AE60', cornerRadius: 4,
        }));
        buyBtn.add(new Konva.Text({
          text: 'Buy',
          fontSize: 12, fill: '#fff',
          width: cardW - 30, height: 28,
          align: 'center', verticalAlign: 'middle',
        }));
        buyBtn.on('click tap', () => { this.emit('buyCard', card.id); });
        buyBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
        buyBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
        cardGroup.add(buyBtn);
      }

      this.combatLayer.add(cardGroup);
    });

    // Remove card section — show all cards (deck + hand + discard)
    const removeY = cardsY + cardH + 30;
    const removePrice = G.shop?.removeCardPrice || 50;
    const allCards = [...(G.player.deck || []), ...(G.player.hand || []), ...(G.player.discard || [])];
    const canRemove = G.run.gold >= removePrice && allCards.length > 0;

    this.combatLayer.add(new Konva.Text({
      text: `Remove a card (${removePrice}g)`,
      fontSize: 14, fill: canRemove ? '#E74C3C' : '#666',
      x: 0, y: removeY,
      width: w, align: 'center',
    }));

    // Show all cards for removal (wrapped into rows)
    if (canRemove) {
      const deckCards = allCards;
      const smallW = 80;
      const smallH = 45;
      const smallGap = 6;
      const cols = Math.min(deckCards.length, Math.floor((w - 40) / (smallW + smallGap)));
      const gridW = cols * (smallW + smallGap) - smallGap;
      const deckStartX = (w - gridW) / 2;
      const deckY = removeY + 25;

      deckCards.forEach((card, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const dx = deckStartX + col * (smallW + smallGap);
        const dy = deckY + row * (smallH + smallGap);
        const removeGroup = new Konva.Group({ x: dx, y: dy });

        removeGroup.add(new Konva.Rect({
          width: smallW, height: smallH,
          fill: '#2a1520',
          stroke: '#E74C3C',
          strokeWidth: 1,
          cornerRadius: 4,
        }));
        removeGroup.add(new Konva.Text({
          text: card.data.name,
          fontSize: 10, fill: '#fff',
          padding: 4, width: smallW,
          align: 'center',
        }));
        removeGroup.add(new Konva.Text({
          text: 'Remove',
          fontSize: 9, fill: '#E74C3C',
          x: 0, y: smallH - 16,
          width: smallW, align: 'center',
        }));

        removeGroup.on('click tap', () => { this.emit('removeCard', card.id); });
        removeGroup.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
        removeGroup.on('mouseleave', () => { document.body.style.cursor = 'default'; });
        this.combatLayer.add(removeGroup);
      });
    }

    // Leave button
    const leaveBtn = new Konva.Group({ x: w / 2 - 60, y: h - 60 });
    leaveBtn.add(new Konva.Rect({
      width: 120, height: 40,
      fill: '#8E44AD', cornerRadius: 6,
    }));
    leaveBtn.add(new Konva.Text({
      text: 'Leave Shop',
      fontSize: 14, fill: '#fff',
      width: 120, height: 40,
      align: 'center', verticalAlign: 'middle',
    }));
    leaveBtn.on('click tap', () => { this.emit('leaveShop'); });
    leaveBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    leaveBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(leaveBtn);

    this.combatLayer.draw();
  }

  /**
   * Render run end (death) screen.
   */
  renderRunEnd(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();

    const isVictory = G.run.result === 'victory';

    this.combatLayer.add(new Konva.Text({
      text: isVictory ? 'Run Complete!' : 'Defeated',
      fontSize: 28, fill: isVictory ? '#F4D03F' : '#E74C3C',
      x: 0, y: h * 0.2,
      width: w, align: 'center',
    }));

    this.combatLayer.add(new Konva.Text({
      text: `Gold: ${G.run.gold}  |  Act: ${G.run.act}`,
      fontSize: 16, fill: '#888',
      x: 0, y: h * 0.28,
      width: w, align: 'center',
    }));

    // Insight / Materials earned
    this.combatLayer.add(new Konva.Text({
      text: `+${G.run.insightEarned} Insight    +${G.run.materialsEarned} Materials`,
      fontSize: 18, fill: '#F4D03F',
      x: 0, y: h * 0.36,
      width: w, align: 'center',
    }));

    this.combatLayer.add(new Konva.Text({
      text: `Total: ${G.meta.insight} Insight  |  ${G.meta.materials} Materials  |  Runs: ${G.meta.totalRuns}`,
      fontSize: 13, fill: '#666',
      x: 0, y: h * 0.42,
      width: w, align: 'center',
    }));

    // Continue to Laboratory button
    const labBtn = new Konva.Group({ x: w / 2 - 110, y: h * 0.52 });
    labBtn.add(new Konva.Rect({
      width: 220, height: 44,
      fill: '#27AE60', cornerRadius: 6,
    }));
    labBtn.add(new Konva.Text({
      text: 'Continue to Laboratory',
      fontSize: 15, fill: '#fff',
      width: 220, height: 44,
      align: 'center', verticalAlign: 'middle',
    }));
    labBtn.on('click tap', () => { this.emit('continueToLab'); });
    labBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    labBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(labBtn);

    // Restart button (skip lab)
    const restartBtn = new Konva.Group({ x: w / 2 - 60, y: h * 0.62 });
    restartBtn.add(new Konva.Rect({
      width: 120, height: 32,
      fill: 'transparent', stroke: '#555', strokeWidth: 1, cornerRadius: 4,
    }));
    restartBtn.add(new Konva.Text({
      text: 'Restart',
      fontSize: 12, fill: '#888',
      width: 120, height: 32,
      align: 'center', verticalAlign: 'middle',
    }));
    restartBtn.on('click tap', () => { this.emit('restart'); });
    restartBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    restartBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(restartBtn);

    this.combatLayer.draw();
  }

  /**
   * Render the Laboratory between-run hub.
   */
  renderLaboratory(G) {
    this.combatLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();
    const rl = this._roguelikeData || {};

    // Title
    this.combatLayer.add(new Konva.Text({
      text: 'THE LABORATORY',
      fontSize: 24, fill: '#F4D03F', fontStyle: 'bold',
      x: 0, y: 20, width: w, align: 'center',
      letterSpacing: 3,
    }));

    // Currency display
    this.combatLayer.add(new Konva.Text({
      text: `Insight: ${G.meta.insight}    Materials: ${G.meta.materials}`,
      fontSize: 16, fill: '#ccc',
      x: 0, y: 52, width: w, align: 'center',
    }));

    const panelY = 90;
    const panelH = h - 170;

    // --- LEFT PANEL: Run Stats ---
    const statsX = 30;
    const statsW = 200;

    this.combatLayer.add(new Konva.Rect({
      x: statsX, y: panelY, width: statsW, height: panelH,
      fill: '#12121f', stroke: '#2a2a3a', strokeWidth: 1, cornerRadius: 8,
    }));

    this.combatLayer.add(new Konva.Text({
      text: 'RUN STATS', fontSize: 11, fill: '#555', fontStyle: 'bold',
      x: statsX + 12, y: panelY + 10, letterSpacing: 2,
    }));

    const statLines = [
      `Total Runs: ${G.meta.totalRuns}`,
      `Victories: ${G.meta.totalVictories}`,
      '',
      'Last Run:',
      `  +${G.run.insightEarned} Insight`,
      `  +${G.run.materialsEarned} Materials`,
      '',
      'School Mastery:',
    ];

    // Add school mastery entries
    for (const [typeId, mastery] of Object.entries(G.meta.schoolMastery)) {
      const type = G.catalog.types.find(t => t.id === parseInt(typeId));
      const name = type ? type.name : `Type ${typeId}`;
      statLines.push(`  ${name}: ${mastery.victories}W / ${mastery.runs}R`);
    }

    this.combatLayer.add(new Konva.Text({
      text: statLines.join('\n'),
      fontSize: 12, fill: '#aaa', lineHeight: 1.5,
      x: statsX + 12, y: panelY + 30, width: statsW - 24,
    }));

    // --- CENTER PANEL: Research Desk ---
    const researchX = statsX + statsW + 20;
    const researchW = Math.min(400, w - researchX - 280);

    this.combatLayer.add(new Konva.Rect({
      x: researchX, y: panelY, width: researchW, height: panelH,
      fill: '#12121f', stroke: '#2a2a3a', strokeWidth: 1, cornerRadius: 8,
    }));

    this.combatLayer.add(new Konva.Text({
      text: 'RESEARCH DESK', fontSize: 11, fill: '#555', fontStyle: 'bold',
      x: researchX + 12, y: panelY + 10, letterSpacing: 2,
    }));

    const researchItems = rl.research || [];
    let itemY = panelY + 35;
    const itemH = 65;

    for (const item of researchItems) {
      if (itemY + itemH > panelY + panelH - 10) break; // overflow guard

      const purchaseCount = G.meta.unlockedResearch.filter(id => id === item.id).length;
      const maxed = purchaseCount >= item.max_purchases;
      const canAfford = G.meta.insight >= item.insight_cost &&
                        G.meta.materials >= (item.material_cost || 0);

      const itemGroup = new Konva.Group({ x: researchX + 10, y: itemY });

      // Background
      itemGroup.add(new Konva.Rect({
        width: researchW - 20, height: itemH - 5,
        fill: maxed ? '#0f1a0f' : (canAfford ? '#1a2a14' : '#1a1a2e'),
        stroke: maxed ? '#2a3a2a' : (canAfford ? '#3a6a3a' : '#2a2a3a'),
        strokeWidth: 1, cornerRadius: 6,
      }));

      // Name + description
      itemGroup.add(new Konva.Text({
        text: `${maxed ? '✓ ' : ''}${item.name}`,
        fontSize: 13, fill: maxed ? '#5a8a5a' : '#e0e0e0', fontStyle: 'bold',
        x: 10, y: 6, width: researchW - 110,
      }));
      itemGroup.add(new Konva.Text({
        text: item.description,
        fontSize: 10, fill: '#888',
        x: 10, y: 22, width: researchW - 110,
      }));

      // Cost
      const costText = `${item.insight_cost} Insight${item.material_cost ? ` + ${item.material_cost} Mat` : ''}`;
      itemGroup.add(new Konva.Text({
        text: costText,
        fontSize: 10, fill: canAfford ? '#F4D03F' : '#884444',
        x: 10, y: 40,
      }));

      // Purchases count
      itemGroup.add(new Konva.Text({
        text: `${purchaseCount}/${item.max_purchases}`,
        fontSize: 10, fill: '#666',
        x: researchW - 60, y: 6,
      }));

      // Buy button
      if (!maxed && canAfford) {
        const btn = new Konva.Group({ x: researchW - 75, y: 30 });
        btn.add(new Konva.Rect({
          width: 55, height: 22,
          fill: '#27AE60', cornerRadius: 4,
        }));
        btn.add(new Konva.Text({
          text: 'Buy', fontSize: 11, fill: '#fff',
          width: 55, height: 22,
          align: 'center', verticalAlign: 'middle',
        }));
        const researchId = item.id;
        btn.on('click tap', () => { this.emit('purchaseResearch', researchId); });
        btn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
        btn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
        itemGroup.add(btn);
      }

      this.combatLayer.add(itemGroup);
      itemY += itemH;
    }

    // --- RIGHT PANEL: Unlocked Branches ---
    const unlockX = researchX + researchW + 20;
    const unlockW = Math.max(200, w - unlockX - 30);

    this.combatLayer.add(new Konva.Rect({
      x: unlockX, y: panelY, width: unlockW, height: panelH,
      fill: '#12121f', stroke: '#2a2a3a', strokeWidth: 1, cornerRadius: 8,
    }));

    this.combatLayer.add(new Konva.Text({
      text: 'UNLOCKED BRANCHES', fontSize: 11, fill: '#555', fontStyle: 'bold',
      x: unlockX + 12, y: panelY + 10, letterSpacing: 2,
    }));

    const metaUnlocks = rl.metaUnlocks || [];
    let unlockY = panelY + 35;
    for (const mu of metaUnlocks) {
      const isUnlocked = G.meta.unlockedMeta.includes(mu.id);
      this.combatLayer.add(new Konva.Text({
        text: `${isUnlocked ? '✓' : '○'} ${mu.name}`,
        fontSize: 12,
        fill: isUnlocked ? '#5dde5d' : '#444',
        x: unlockX + 12, y: unlockY,
        width: unlockW - 24,
      }));
      unlockY += 20;
    }

    // --- START NEXT RUN button ---
    const btnW = 200;
    const startBtn = new Konva.Group({ x: w / 2 - btnW / 2, y: h - 65 });
    startBtn.add(new Konva.Rect({
      width: btnW, height: 44,
      fill: '#27AE60', cornerRadius: 6,
    }));
    startBtn.add(new Konva.Text({
      text: 'Start Next Run',
      fontSize: 16, fill: '#fff',
      width: btnW, height: 44,
      align: 'center', verticalAlign: 'middle',
    }));
    startBtn.on('click tap', () => { this.emit('startNextRun'); });
    startBtn.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    startBtn.on('mouseleave', () => { document.body.style.cursor = 'default'; });
    this.combatLayer.add(startBtn);

    this.combatLayer.draw();
  }

  /**
   * Set up pan & zoom for the map layer.
   */
  setupPanZoom() {
    let isPanning = false;
    let lastPos = { x: 0, y: 0 };

    this.stage.on('contextmenu', (e) => { e.evt.preventDefault(); });

    this.stage.on('mousedown', (e) => {
      if (e.evt.button === 2) {
        isPanning = true;
        lastPos = this.stage.getPointerPosition();
      }
    });

    this.stage.on('mousemove', () => {
      if (!isPanning) return;
      const pos = this.stage.getPointerPosition();
      const dx = pos.x - lastPos.x;
      const dy = pos.y - lastPos.y;
      lastPos = pos;

      this.mapLayer.x(this.mapLayer.x() + dx);
      this.mapLayer.y(this.mapLayer.y() + dy);
      this.mapLayer.draw();
    });

    this.stage.on('mouseup', () => { isPanning = false; });

    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const scaleBy = 1.08;
      const oldScale = this.mapLayer.scaleX();
      const pointer = this.stage.getPointerPosition();
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.3, Math.min(3, newScale));

      const mousePointTo = {
        x: (pointer.x - this.mapLayer.x()) / oldScale,
        y: (pointer.y - this.mapLayer.y()) / oldScale,
      };

      this.mapLayer.scale({ x: clampedScale, y: clampedScale });
      this.mapLayer.position({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
      this.mapLayer.draw();
    });
  }
}
