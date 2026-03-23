import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { createWizardGame, DEFAULT_CONFIG } from './game.js';
import { loadGameData } from '../shared/data.js';
import { TableRenderer } from './renderer.js';
import { calcAllScores, SCORE_PATHS } from './scoring.js';
import { initBackground, cycleBackground, getBackgroundMode } from '../shared/background.js';
import '../shared/styles.css';

// ─── Scenario Presets ───

const PRESETS = {
  sandbox: {
    name: 'Sandbox',
    config: { ...DEFAULT_CONFIG, presetName: 'sandbox' },
  },
  splendor: {
    name: 'Splendor Lens',
    config: {
      ...DEFAULT_CONFIG,
      presetName: 'splendor',
      tokensPerPrimary: 4,
      lightTokens: 3,
      cardsPerDraftHand: 7,
      marketSize: 4,
      labMaxSize: 0,
      tokenTakeLimit: 3,
      draftDirection: 'clockwise',
      discardReward: 0,
    },
  },
  'seven-wonders': {
    name: '7 Wonders Lens',
    config: {
      ...DEFAULT_CONFIG,
      presetName: 'seven-wonders',
      tokensPerPrimary: 7,
      lightTokens: 5,
      cardsPerDraftHand: 7,
      marketSize: 0,
      labMaxSize: 0,
      tokenTakeLimit: 0,
      draftDirection: 'alternating',
      discardReward: 2,
    },
  },
  everdell: {
    name: 'Everdell Lens',
    config: {
      ...DEFAULT_CONFIG,
      presetName: 'everdell',
      tokensPerPrimary: 7,
      lightTokens: 5,
      cardsPerDraftHand: 7,
      marketSize: 8,
      labMaxSize: 15,
      tokenTakeLimit: 3,
      draftDirection: 'clockwise',
      discardReward: 1,
    },
  },
};

let catalog = null;
let renderer = null;
let clients = [];
let activeClientIdx = 0;
let currentConfig = { ...DEFAULT_CONFIG };

const STORAGE_KEY = 'wizard-sandbox-config';

function loadSavedConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      currentConfig = { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch { /* ignore corrupt storage */ }
}

function saveConfig(config) {
  currentConfig = { ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
}

async function init() {
  try {
    // 1. Load database
    catalog = await loadGameData();
    console.log(`Loaded ${catalog.types.length} types, ${catalog.spells.length} spells, ${catalog.instruments.length} instruments, ${catalog.wizards.length} wizards`);

    // 2. Load saved config from localStorage
    loadSavedConfig();

    // 3. Init background effect (restores saved pref)
    initBackground();

    // 4. Hide loading, show start screen
    document.getElementById('loading').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';

    // 4. Wire start button
    document.getElementById('start-btn').addEventListener('click', startGame);

  } catch (err) {
    document.getElementById('loading').textContent =
      `Failed to load: ${err.message}`;
    console.error(err);
  }
}

function startGame() {
  const playerCount = parseInt(document.getElementById('player-count').value);

  // Hide start screen, show toolbar and canvas
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('toolbar').style.display = 'flex';
  document.getElementById('app').style.display = 'block';

  // Create renderer (only once)
  if (!renderer) {
    renderer = new TableRenderer('app');
  }

  createClients(playerCount);

  // Sync preset selector with current config
  document.getElementById('preset-select').value = currentConfig.presetName || 'sandbox';
  syncSettingsPanel(currentConfig);

  // Build player tabs
  buildPlayerTabs(playerCount);

  // Subscribe active client
  switchToPlayer(0);

  // Wire renderer events
  renderer.on('schoolSelected', (schoolTypeId) => {
    getActiveClient().moves.chooseSchool(schoolTypeId);
    // Auto-advance to next player who hasn't chosen
    autoAdvancePlayer();
  });

  renderer.on('cardDrafted', (cardId) => {
    getActiveClient().moves.draftCardById(cardId);
    autoAdvancePlayer();
  });

  renderer.on('cardSold', (cardId) => {
    getActiveClient().moves.sellCard(cardId);
    autoAdvancePlayer();
  });

  renderer.on('cardMoved', (cardId, fromZone, toZone) => {
    getActiveClient().moves.moveCard(cardId, fromZone, toZone);
  });

  renderer.on('tokenTaken', (type, count) => {
    getActiveClient().moves.takeToken(type, count);
  });

  renderer.on('cardPlayedToLab', (cardId) => {
    getActiveClient().moves.playCardToLab(cardId);
  });

  // Wire toolbar
  setupToolbar();

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); getActiveClient().undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); getActiveClient().redo(); }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); exportState(); }

    // Number keys 1-3 to advance to that era
    if (!e.ctrlKey && !e.altKey && ['1', '2', '3'].includes(e.key)) {
      const state = getActiveClient().getState();
      if (state?.ctx.phase === 'play') {
        const targetEra = parseInt(e.key);
        if (targetEra > state.G.era) {
          getActiveClient().moves.advanceEra();
        }
      }
    }
  });
}

// ─── Client Management ───

function createClients(playerCount) {
  // Stop existing clients
  clients.forEach(c => c.stop());

  const game = createWizardGame(catalog, currentConfig);

  clients = [];
  for (let i = 0; i < playerCount; i++) {
    const client = Client({
      game,
      numPlayers: playerCount,
      multiplayer: Local(),
      playerID: String(i),
      debug: false,
    });
    clients.push(client);
  }
  clients.forEach(c => c.start());
}

function restartGame(config) {
  saveConfig(config);
  const playerCount = clients.length || 2;
  createClients(playerCount);
  buildPlayerTabs(playerCount);
  switchToPlayer(0);
}

// ─── Settings Panel ───

function syncSettingsPanel(config) {
  const fields = [
    'tokensPerPrimary', 'lightTokens', 'cardsPerDraftHand', 'marketSize',
    'labMaxSize', 'tokenTakeLimit', 'discardReward',
  ];
  for (const field of fields) {
    const el = document.getElementById(`cfg-${field}`);
    if (el) el.value = config[field];
  }
  const dirEl = document.getElementById('cfg-draftDirection');
  if (dirEl) dirEl.value = config.draftDirection;
}

function readSettingsPanel() {
  return {
    tokensPerPrimary: parseInt(document.getElementById('cfg-tokensPerPrimary').value),
    lightTokens: parseInt(document.getElementById('cfg-lightTokens').value),
    cardsPerDraftHand: parseInt(document.getElementById('cfg-cardsPerDraftHand').value),
    marketSize: parseInt(document.getElementById('cfg-marketSize').value),
    labMaxSize: parseInt(document.getElementById('cfg-labMaxSize').value),
    tokenTakeLimit: parseInt(document.getElementById('cfg-tokenTakeLimit').value),
    draftDirection: document.getElementById('cfg-draftDirection').value,
    discardReward: parseInt(document.getElementById('cfg-discardReward').value),
    presetName: document.getElementById('preset-select').value,
  };
}

// ─── Score Panel ───

function updateScorePanel(G) {
  const body = document.getElementById('score-body');
  if (!body || !document.getElementById('score-panel').classList.contains('open')) return;

  const playerIds = Object.keys(G.players).sort();
  const maxScore = 30; // scale bar against this

  let html = '';
  for (const pid of playerIds) {
    const player = G.players[pid];
    const scores = calcAllScores(player);
    const schoolName = player.school?.school_name || `Player ${parseInt(pid) + 1}`;

    html += `<div class="score-player">`;
    html += `<div class="score-player-name">${schoolName}</div>`;

    for (const path of SCORE_PATHS) {
      const val = scores[path.key];
      const pct = Math.min(100, (val / maxScore) * 100);
      html += `<div class="score-row">`;
      html += `<span class="score-bar-label">${path.label}</span>`;
      html += `<div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%;background:${path.color}"></div></div>`;
      html += `<span class="score-bar-value">${val}</span>`;
      html += `</div>`;
    }

    html += `<div class="score-total"><span>Total</span><span>${scores.total}</span></div>`;
    html += `</div>`;
  }

  body.innerHTML = html;
}

// ─── State Export/Import ───

function exportState() {
  const state = getActiveClient().getState();
  if (!state) return;

  // Strip catalog data (large, not needed for save files)
  const exportG = { ...state.G };
  delete exportG.cardCatalog;
  delete exportG.types;
  delete exportG.schools;
  delete exportG.eraPools;

  const json = JSON.stringify(exportG, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const ts = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  const filename = `wizard-sandbox-${ts}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const newState = JSON.parse(e.target.result);
      getActiveClient().moves.importState(newState);
    } catch (err) {
      console.error('Failed to import state:', err);
      alert('Invalid save file.');
    }
  };
  reader.readAsText(file);
}

function getActiveClient() {
  return clients[activeClientIdx];
}

function switchToPlayer(idx) {
  activeClientIdx = idx;
  renderer.setActivePlayer(String(idx));

  // Unsubscribe all, subscribe active
  clients.forEach((c, i) => {
    c.subscribe(i === idx ? onStateChange : () => {});
  });

  // Trigger an immediate render
  const state = clients[idx].getState();
  if (state) onStateChange(state);

  // Update tab UI
  document.querySelectorAll('.player-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === idx);
  });
}

function onStateChange(state) {
  if (!state) return;
  renderer.update(state.G, state.ctx);
  updateEraButtons(state.G.era);
  updateScorePanel(state.G);
}

/** After a school pick or draft pick, advance to the next player who needs to act */
function autoAdvancePlayer() {
  const state = getActiveClient().getState();
  if (!state) return;

  const phase = state.ctx.phase;

  if (phase === 'schoolSelection') {
    // Find next player without a school
    for (let i = 0; i < clients.length; i++) {
      const nextIdx = (activeClientIdx + 1 + i) % clients.length;
      const s = clients[nextIdx].getState();
      if (s && !s.G.players[String(nextIdx)].school) {
        switchToPlayer(nextIdx);
        return;
      }
    }
    // All chosen — state will auto-transition to draft
    // Re-render with current player to show draft
    setTimeout(() => {
      switchToPlayer(0);
    }, 100);
  } else if (phase === 'draft') {
    // Move to next player in turn order
    const nextIdx = (activeClientIdx + 1) % clients.length;
    setTimeout(() => {
      switchToPlayer(nextIdx);
    }, 100);
  }
}

function buildPlayerTabs(count) {
  const container = document.getElementById('player-tabs');
  container.innerHTML = '';

  const schoolColors = ['#E74C3C', '#A0522D', '#2E86C1', '#AED6F1'];
  for (let i = 0; i < count; i++) {
    const tab = document.createElement('button');
    tab.className = 'player-tab' + (i === 0 ? ' active' : '');
    tab.textContent = `Player ${i + 1}`;
    tab.style.borderBottomColor = schoolColors[i % schoolColors.length];
    tab.addEventListener('click', () => switchToPlayer(i));
    container.appendChild(tab);
  }
}

function updateEraButtons(era) {
  document.querySelectorAll('.era-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.era) === era);
  });
}

function setupToolbar() {
  // Era buttons (advance era in play phase)
  document.querySelectorAll('.era-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const state = getActiveClient().getState();
      if (state?.ctx.phase === 'play') {
        getActiveClient().moves.advanceEra();
      }
    });
  });

  // Preset selector
  document.getElementById('preset-select').addEventListener('change', (e) => {
    const preset = PRESETS[e.target.value];
    if (!preset) return;
    syncSettingsPanel(preset.config);
    restartGame(preset.config);
  });

  // Settings panel toggle
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('open');
  });
  document.getElementById('settings-close').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.remove('open');
  });

  // Settings apply button
  document.getElementById('settings-apply').addEventListener('click', () => {
    const config = readSettingsPanel();
    restartGame(config);
    document.getElementById('settings-panel').classList.remove('open');
  });

  // Score panel toggle
  document.getElementById('score-btn').addEventListener('click', () => {
    const panel = document.getElementById('score-panel');
    panel.classList.toggle('open');
    // Immediately populate if opening
    if (panel.classList.contains('open')) {
      const state = getActiveClient().getState();
      if (state) updateScorePanel(state.G);
    }
  });
  document.getElementById('score-close').addEventListener('click', () => {
    document.getElementById('score-panel').classList.remove('open');
  });

  // Spawn button
  document.getElementById('spawn-btn').addEventListener('click', () => {
    const state = getActiveClient().getState();
    if (state?.ctx.phase !== 'play') return; // Only spawn in play phase

    const spawnType = document.getElementById('spawn-type').value;
    const zone = document.getElementById('spawn-zone').value;

    if (spawnType.startsWith('token-')) {
      const tokenType = spawnType.replace('token-', '');
      getActiveClient().moves.spawnToken(tokenType, 1);
    } else {
      const pool = catalog[spawnType + 's'] || [];
      if (pool.length === 0) return;
      const card = pool[Math.floor(Math.random() * pool.length)];
      getActiveClient().moves.spawnCard(card, zone);
    }
  });

  // Export / Import
  document.getElementById('export-btn').addEventListener('click', exportState);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      importState(e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-imported
    }
  });

  // Undo / Redo / Reset
  document.getElementById('undo-btn').addEventListener('click', () => getActiveClient().undo());
  document.getElementById('redo-btn').addEventListener('click', () => getActiveClient().redo());
  document.getElementById('reset-btn').addEventListener('click', () => {
    restartGame(currentConfig);
  });

  // Background effect toggle (cycles: off → swirl → forge → off)
  const bgBtn = document.getElementById('bg-toggle-btn');
  const bgLabels = { off: 'BG', swirl: 'BG: Swirl', forge: 'BG: Forge' };
  function syncBg() {
    const mode = getBackgroundMode();
    bgBtn.textContent = bgLabels[mode];
    bgBtn.style.borderColor = mode !== 'off' ? '#F4D03F' : '';
    bgBtn.style.color = mode !== 'off' ? '#F4D03F' : '';
  }
  syncBg();
  bgBtn.addEventListener('click', () => { cycleBackground(); syncBg(); });
}

init();
