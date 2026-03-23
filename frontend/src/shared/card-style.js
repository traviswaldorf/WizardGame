/**
 * Card visual style manager.
 * Toggles between 'default' and 'pixel' rendering styles.
 * Persists choice to localStorage.
 */

const STORAGE_KEY = 'wizardgame_card_style';
let currentStyle = 'default';

const FONTS = {
  default: 'Segoe UI, system-ui, sans-serif',
  pixel: '"Press Start 2P", cursive',
};

export function initCardStyle() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'pixel') currentStyle = 'pixel';
  applyBodyClass();
}

export function cycleCardStyle() {
  currentStyle = currentStyle === 'default' ? 'pixel' : 'default';
  localStorage.setItem(STORAGE_KEY, currentStyle);
  applyBodyClass();
  return currentStyle;
}

export function getCardStyle() {
  return currentStyle;
}

export function getFont() {
  return FONTS[currentStyle];
}

export function isPixel() {
  return currentStyle === 'pixel';
}

function applyBodyClass() {
  document.body.classList.toggle('pixel-mode', currentStyle === 'pixel');
}
