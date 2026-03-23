import Konva from 'konva';
import { getFont } from './card-style.js';

export const TOKEN_RADIUS = 20;

/** Token type colors — matches the primary types from the DB */
const TOKEN_COLORS = {
  fire: '#E74C3C',
  earth: '#A0522D',
  water: '#2E86C1',
  air: '#AED6F1',
  light: '#F4D03F',
};

const TOKEN_ABBREV = {
  fire: 'Fi',
  earth: 'Ea',
  water: 'Wa',
  air: 'Ai',
  light: 'Lt',
};

/**
 * Create a token stack node for the pool display.
 * Shows a colored circle with type abbreviation and count.
 */
export function createTokenNode(type, count, x, y) {
  const color = TOKEN_COLORS[type] || '#888';
  const abbrev = TOKEN_ABBREV[type] || type.slice(0, 2).toUpperCase();

  const group = new Konva.Group({ x, y });

  // Main circle
  group.add(new Konva.Circle({
    radius: TOKEN_RADIUS,
    fill: color,
    stroke: '#fff',
    strokeWidth: 1.5,
    shadowColor: '#000',
    shadowBlur: 4,
    shadowOpacity: 0.3,
  }));

  // Type abbreviation
  group.add(new Konva.Text({
    text: abbrev,
    fontSize: 13,
    fontStyle: 'bold',
    fontFamily: getFont(),
    fill: '#fff',
    width: TOKEN_RADIUS * 2,
    height: TOKEN_RADIUS * 2,
    offsetX: TOKEN_RADIUS,
    offsetY: TOKEN_RADIUS,
    align: 'center',
    verticalAlign: 'middle',
  }));

  // Count badge
  group.add(new Konva.Text({
    text: String(count),
    fontSize: 11,
    fontStyle: 'bold',
    fontFamily: getFont(),
    fill: '#fff',
    y: TOKEN_RADIUS + 4,
    width: TOKEN_RADIUS * 2,
    offsetX: TOKEN_RADIUS,
    align: 'center',
  }));

  // Store type for click handling
  group.setAttr('tokenType', type);

  return group;
}

export { TOKEN_COLORS, TOKEN_ABBREV };
