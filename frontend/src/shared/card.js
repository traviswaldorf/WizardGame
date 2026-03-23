import Konva from 'konva';
import { getFont, isPixel } from './card-style.js';

export const CARD_W = 120;
export const CARD_H = 170;

/**
 * Create a draggable Konva card node.
 * Handles spell, instrument, and wizard card types.
 * card: { id, data } where data varies by card type.
 */
export function createCardNode(card, x, y) {
  const { id, data } = card;
  const cardType = detectCardType(data);
  const typeColor = getCardColor(data, cardType);

  const group = new Konva.Group({
    x, y,
    draggable: true,
    id,
  });

  // Store card metadata on the node for event handling
  group.setAttr('cardId', id);

  const pixel = isPixel();

  // Card background
  group.add(new Konva.Rect({
    width: CARD_W,
    height: CARD_H,
    fill: '#1a1a2e',
    stroke: typeColor,
    strokeWidth: pixel ? 3 : 2,
    cornerRadius: pixel ? 0 : 6,
    shadowColor: '#000',
    shadowBlur: pixel ? 0 : 8,
    shadowOpacity: pixel ? 0 : 0.4,
    shadowOffsetY: pixel ? 0 : 3,
  }));

  // Header bar
  group.add(new Konva.Rect({
    width: CARD_W,
    height: 28,
    fill: typeColor,
    cornerRadius: pixel ? 0 : [6, 6, 0, 0],
  }));

  // Card name
  group.add(new Konva.Text({
    x: 6, y: 6,
    text: getCardName(data, cardType),
    fontSize: 11,
    fontFamily: getFont(),
    fontStyle: 'bold',
    fill: '#fff',
    width: CARD_W - 12,
    ellipsis: true,
    wrap: 'none',
  }));

  // Subheader (cost line or role)
  group.add(new Konva.Text({
    x: 6, y: 34,
    text: getCardSubheader(data, cardType),
    fontSize: 9,
    fontFamily: getFont(),
    fill: '#aaa',
    width: CARD_W - 12,
  }));

  // Description
  group.add(new Konva.Text({
    x: 6, y: 50,
    text: getCardDescription(data, cardType),
    fontSize: 9,
    fontFamily: getFont(),
    fill: '#ccc',
    width: CARD_W - 12,
    height: CARD_H - 70,
    ellipsis: true,
  }));

  // Category label (bottom)
  group.add(new Konva.Text({
    x: 6, y: CARD_H - 18,
    text: cardType.toUpperCase(),
    fontSize: 8,
    fontFamily: getFont(),
    fill: '#888',
  }));

  // ─── Hover effect: scale from center with subtle grow ───
  group.offsetX(CARD_W / 2);
  group.offsetY(CARD_H / 2);
  group.x(x + CARD_W / 2);
  group.y(y + CARD_H / 2);

  group.on('mouseenter', () => {
    group.moveToTop();
    group.to({
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 0.12,
    });
    document.body.style.cursor = 'grab';
  });

  group.on('mouseleave', () => {
    group.to({
      scaleX: 1,
      scaleY: 1,
      duration: 0.12,
    });
    document.body.style.cursor = 'default';
  });

  group.on('mousedown', () => {
    document.body.style.cursor = 'grabbing';
  });

  group.on('mouseup', () => {
    document.body.style.cursor = 'grab';
  });

  return group;
}

function detectCardType(data) {
  if (data.type_a_id !== undefined) return 'spell';
  if (data.thematic_role !== undefined) return 'instrument';
  if (data.scientist_name !== undefined) return 'wizard';
  return 'card';
}

function getCardColor(data, type) {
  switch (type) {
    case 'spell': return data.type_a_color || '#555';
    case 'instrument': return data.type_color || '#555';
    case 'wizard': return data.type_color || '#555';
    default: return '#555';
  }
}

function getCardName(data, type) {
  switch (type) {
    case 'spell': return data.name || 'Unknown Spell';
    case 'instrument': return data.name || 'Unknown Instrument';
    case 'wizard': return data.scientist_name || 'Unknown Wizard';
    default: return data.name || 'Unknown';
  }
}

function getCardSubheader(data, type) {
  switch (type) {
    case 'spell': {
      const parts = [];
      if (data.type_a_name) parts.push(`${data.type_a_amount || 1} ${data.type_a_name}`);
      if (data.type_b_name) parts.push(`${data.type_b_amount || 1} ${data.type_b_name}`);
      return parts.join(' + ') || '?';
    }
    case 'instrument':
      return data.associated_scientist || data.type_name || '';
    case 'wizard': {
      const years = data.birth_year && data.death_year
        ? `(${data.birth_year}–${data.death_year})`
        : '';
      return `${data.role || ''} ${years}`.trim();
    }
    default:
      return '';
  }
}

function getCardDescription(data, type) {
  switch (type) {
    case 'spell': return data.description || '';
    case 'instrument': return data.description || '';
    case 'wizard': return data.contribution || '';
    default: return '';
  }
}
