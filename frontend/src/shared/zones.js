import Konva from 'konva';
import { getFont } from './card-style.js';

/**
 * Zone definitions and layout calculations.
 * Zones are named rectangular areas on the table.
 */

const ZONE_PADDING = 12;
const ZONE_LABEL_H = 20;

/** Zone configuration — layout is calculated from stage dimensions */
export const ZONE_DEFS = {
  tokenPool:   { label: 'Token Pool',            color: '#F4D03F' },
  cardMarket:  { label: 'Card Market / Arcanum',  color: '#8E44AD' },
  schoolBoard: { label: 'School Board',           color: '#27AE60' },
  lab:         { label: 'Lab / Tableau',          color: '#2E86C1' },
  discard:     { label: 'Discard',                color: '#7F8C8D' },
  resources:   { label: 'Resources',              color: '#E0A030' },
  hand:        { label: 'Hand',                   color: '#E67E22' },
};

/**
 * Calculate zone bounds from stage dimensions.
 * Returns { zoneName: { x, y, w, h, label, color } }
 */
export function calculateZoneBounds(stageW, stageH) {
  const toolbarH = 48;
  const margin = 12;
  const gap = 10;
  const usableH = stageH - toolbarH;

  // Fixed heights for compact rows
  const tokenPoolH = 60;
  const resourcesH = 50;

  // Remaining height split among cardMarket, middle row, hand
  const flexH = usableH - tokenPoolH - resourcesH - gap * 5;
  const rowH = Math.max(100, Math.floor(flexH / 3));
  const contentW = stageW - margin * 2;
  let y = toolbarH + gap;

  const bounds = {};

  // Row 0: Token Pool
  bounds.tokenPool = {
    x: margin, y, w: contentW, h: tokenPoolH,
    ...ZONE_DEFS.tokenPool,
  };
  y += tokenPoolH + gap;

  // Row 1: Card Market
  bounds.cardMarket = {
    x: margin, y, w: contentW, h: rowH,
    ...ZONE_DEFS.cardMarket,
  };
  y += rowH + gap;

  // Row 2: School Board (left), Lab (center), Discard (right)
  const schoolW = Math.floor(contentW * 0.2);
  const discardW = Math.floor(contentW * 0.12);
  const labW = contentW - schoolW - discardW - gap * 2;

  bounds.schoolBoard = {
    x: margin, y, w: schoolW, h: rowH,
    ...ZONE_DEFS.schoolBoard,
  };
  bounds.lab = {
    x: margin + schoolW + gap, y, w: labW, h: rowH,
    ...ZONE_DEFS.lab,
  };
  bounds.discard = {
    x: margin + schoolW + gap + labW + gap, y, w: discardW, h: rowH,
    ...ZONE_DEFS.discard,
  };
  y += rowH + gap;

  // Row 3: Resources
  bounds.resources = {
    x: margin, y, w: contentW, h: resourcesH,
    ...ZONE_DEFS.resources,
  };
  y += resourcesH + gap;

  // Row 4: Hand
  bounds.hand = {
    x: margin, y, w: contentW, h: rowH,
    ...ZONE_DEFS.hand,
  };

  return bounds;
}

/** Render zone backgrounds and labels onto a Konva layer */
export function drawZones(layer, bounds) {
  layer.destroyChildren();

  for (const [name, zone] of Object.entries(bounds)) {
    // Zone background rect
    layer.add(new Konva.Rect({
      x: zone.x,
      y: zone.y,
      width: zone.w,
      height: zone.h,
      fill: 'rgba(255,255,255,0.03)',
      stroke: zone.color,
      strokeWidth: 1,
      dash: [6, 4],
      cornerRadius: 4,
    }));

    // Zone label
    layer.add(new Konva.Text({
      x: zone.x + ZONE_PADDING,
      y: zone.y + 4,
      text: zone.label,
      fontSize: 11,
      fontFamily: getFont(),
      fill: zone.color,
      opacity: 0.7,
    }));
  }
}

/**
 * Determine which zone a point falls within.
 * Returns zone name or null if outside all zones.
 */
export function hitTestZone(x, y, bounds) {
  for (const [name, zone] of Object.entries(bounds)) {
    if (
      x >= zone.x && x <= zone.x + zone.w &&
      y >= zone.y && y <= zone.y + zone.h
    ) {
      return name;
    }
  }
  return null;
}

/** Map zone display names to game state zone keys */
export function zoneToStateKey(zoneName) {
  const map = {
    tokenPool: 'tokenPool',
    cardMarket: 'market',
    schoolBoard: 'school',
    lab: 'lab',
    discard: 'discard',
    hand: 'hand',
  };
  return map[zoneName] || null;
}

export { ZONE_PADDING, ZONE_LABEL_H };
