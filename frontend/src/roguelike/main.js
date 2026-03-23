import { Client } from 'boardgame.io/client';
import { createRoguelikeGame } from './game.js';
import { loadGameData } from '../shared/data.js';
import { RoguelikeRenderer } from './renderer.js';
import { initBackground } from '../shared/background.js';
import '../shared/styles.css';

let catalog = null;
let renderer = null;
let client = null;

async function init() {
  try {
    catalog = await loadGameData();
    console.log(`Roguelike loaded: ${catalog.types.length} types, ${catalog.spells.length} spells`);

    initBackground();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';

    document.getElementById('start-btn').addEventListener('click', startRun);
    setupDebugPanel();
  } catch (err) {
    document.getElementById('loading').textContent = `Failed to load: ${err.message}`;
    console.error(err);
  }
}

function startRun() {
  // Hide start screen, show toolbar and canvas
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('toolbar').style.display = 'flex';
  document.getElementById('app').style.display = 'block';

  // Read config
  const floorCount = parseInt(document.getElementById('floor-count').value) || 15;

  // Clean up previous run if restarting
  if (client) {
    client.stop();
    client = null;
  }
  if (renderer) {
    renderer.destroy();
    renderer = null;
  }

  // Create renderer
  renderer = new RoguelikeRenderer('app');
  renderer.setTypeColors(catalog.types);

  // Create game with config
  const game = createRoguelikeGame(catalog, { floorCount });

  // Single-player: no multiplayer transport needed
  client = Client({
    game,
    numPlayers: 1,
    playerID: '0',
    debug: false,
  });

  client.start();

  // Subscribe to state changes
  client.subscribe((state) => {
    if (!state) return;
    renderer.update(state.G, state.ctx);
  });

  // Wire renderer events → game moves
  renderer.on('schoolSelected', (typeId) => {
    client.moves.chooseSchool(typeId);
  });

  renderer.on('nodeSelected', (nodeId) => {
    console.log('nodeSelected event:', nodeId);
    const result = client.moves.chooseNode(nodeId);
    console.log('chooseNode result:', result);
    const state = client.getState();
    console.log('state after move:', state?.ctx?.phase, state?.G?.run?.position);
  });

  renderer.on('cardPlayed', (cardId) => {
    client.moves.playCard(cardId);
  });

  renderer.on('endTurn', () => {
    client.moves.endPlayerTurn();
  });

  renderer.on('selectReward', (cardId) => {
    client.moves.selectReward(cardId);
  });

  renderer.on('selectInstrument', () => {
    client.moves.selectInstrument();
  });

  renderer.on('skipReward', () => {
    client.moves.skipReward();
  });

  renderer.on('heal', () => {
    client.moves.heal();
  });

  renderer.on('attune', (typeName) => {
    client.moves.attune(typeName);
  });

  renderer.on('leaveShop', () => {
    client.moves.leaveShop();
  });

  renderer.on('buyCard', (cardId) => {
    client.moves.buyCard(cardId);
  });

  renderer.on('removeCard', (cardId) => {
    client.moves.removeCard(cardId);
  });

  renderer.on('restart', () => {
    restartRun();
  });
}

function setupDebugPanel() {
  const toggle = document.getElementById('debug-toggle');
  const panel = document.getElementById('debug-panel');

  toggle.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-debug]');
    if (!btn || !client) return;

    const action = btn.dataset.debug;
    const amount = parseInt(btn.dataset.amount) || 0;

    switch (action) {
      case 'gold':
        client.moves.debugGold(amount);
        break;
      case 'hp':
        client.moves.debugHp(amount);
        break;
      case 'maxhp':
        client.moves.debugMaxHp(amount);
        break;
      case 'energy':
        client.moves.debugEnergy(amount);
        break;
      case 'kill':
        client.moves.debugKillEnemy();
        break;
      case 'restart':
        restartRun();
        break;
    }
  });
}

function restartRun() {
  // Show start screen again
  document.getElementById('toolbar').style.display = 'none';
  document.getElementById('debug-panel').style.display = 'none';
  document.getElementById('app').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';

  if (client) {
    client.stop();
    client = null;
  }
  if (renderer) {
    renderer.destroy();
    renderer = null;
  }
}

init();
