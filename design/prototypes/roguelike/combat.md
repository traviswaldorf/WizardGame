# Roguelike — Combat System

> **Status**: Exploring

## Overview

Combat is turn-based: player plays spell cards by spending type energy, then enemies attack. The system supports multiple enemies with individual targeting, AoE spells that hit all enemies, and type effectiveness that modifies damage based on matchups.

## Multiple Enemies

### Combat State

```javascript
combat: {
  enemies: [
    { id, name, hp, maxHp, attack, block, type, statusEffects: [], intent: 'attack' },
    { id, name, hp, maxHp, attack, block, type, statusEffects: [], intent: 'block' },
  ],
  targetedEnemyId: null,   // currently selected target
  playerBlock: 0,
  turnNumber: 0,
}
```

### Encounter Sizes

| Encounter Type | Enemy Count | Examples |
|---------------|-------------|---------|
| Normal (early) | 1-2 | 2 Fire elementals |
| Normal (mid) | 2-3 | 1 Fire + 1 Water + 1 Earth |
| Normal (late) | 2-4 | Mixed group with healer or buffer |
| Elite | 1-2 | 1 strong elite or 1 elite + 1 minion |
| Pupil (mid-boss) | 1 | Single pupil with multi-phase abilities |
| Head Wizard (boss) | 1-2 | Boss alone or boss + summoned minions |

### Enemy Types

Each enemy has a type that determines:
- What type of attacks they use
- What they're weak/resistant to
- Visual color-coding (border, HP bar color)

## Targeting System

### Single-Target Spells (mechanic = 'spell')

Two interaction patterns (player chooses preferred):

**Pattern A — Target then Play**:
1. Player clicks an enemy to select it (highlighted border)
2. Player clicks a card to play it
3. Damage applies to the selected enemy

**Pattern B — Play then Target**:
1. Player clicks a card to select it (card lifts/highlights)
2. If the card deals damage, enemies become clickable targets
3. Player clicks an enemy to apply the spell

For the prototype, Pattern A is simpler to implement.

### AoE Spells (mechanic = 'storm')

- Storms automatically hit ALL enemies
- No targeting needed — player just clicks the card
- Visual: damage numbers appear on all enemies simultaneously
- Storms are generally higher cost than single-target spells

### Block Spells (nature = 'material')

- No target needed — block always applies to the player
- Player just clicks the card

### Card Type Indicators

Cards should visually indicate their targeting mode:
- Single-target: crosshair or arrow icon
- AoE: explosion or wave icon
- Block: shield icon

## Type Effectiveness

### Damage Modification

When a spell's type interacts with an enemy's type, damage is modified:

| Matchup | Damage Modifier | Example |
|---------|----------------|---------|
| **Super effective** (spell counters enemy) | ×1.5 | Water spell vs Fire enemy |
| **Neutral** | ×1.0 | Fire spell vs Air enemy |
| **Resisted** (enemy resists spell type) | ×0.5 | Fire spell vs Water enemy |

### Source of Counter Data

Use the existing `counter_design` table in the database. The `source_type_id → target_type_id` relationships define what counters what.

```sql
SELECT source_type_id, target_type_id, mechanism
FROM counter_design
WHERE is_confirmed = 1
```

### Visual Feedback

- **Super effective**: Damage number appears in green, larger font, with "!"
- **Neutral**: Normal white damage number
- **Resisted**: Damage number appears in grey, smaller, with shield icon

### Enemy Intent Display

Each enemy shows what they plan to do next turn:

| Intent | Display | Meaning |
|--------|---------|---------|
| Attack | Sword icon + damage number | Will deal X damage to player |
| Block | Shield icon + block number | Will gain X block |
| Buff | Up arrow icon | Will buff self (strength, etc.) |
| Debuff | Down arrow icon | Will debuff player |
| Summon | + icon | Will spawn a new enemy |

## Enemy AI

### Basic Enemy Behavior

Enemies follow simple scripted patterns based on their type:

| Enemy Type | Pattern | Flavor |
|-----------|---------|--------|
| **Fire** | Attack, Attack, Big Attack | Aggressive — lots of damage, no blocking |
| **Earth** | Block, Block, Attack | Defensive — builds up then hits |
| **Water** | Attack, Heal, Attack | Flow — sustains itself |
| **Air** | Debuff, Attack, Attack | Control — weakens then strikes |

### Elite Behavior

Elites have more complex patterns:
- Multi-hit attacks (hit 2-3 times for smaller damage)
- Buff then attack combos
- Heal when low HP
- Summon minions at HP thresholds

### Boss Behavior

Bosses have phase-based AI:
- Phase transitions at HP thresholds (50%, 25%)
- New attack patterns per phase
- Counter-type attacks in later phases
- Possible minion summoning

## Combat Flow

```
Turn Start
    ↓
Refill type energy to max
Draw up to 5 cards
    ↓
Player Phase (play cards in any order)
  - Click enemy to target (for damage spells)
  - Click card to play
  - Spend type energy
  - Apply damage/block
  - Check if any enemy defeated
    ↓
Click "End Turn"
    ↓
Enemy Phase (each enemy acts in order)
  - Each enemy executes their intent
  - Damage reduced by player block
  - Player block resets to 0
  - Enemies choose next intent
    ↓
Check combat end:
  - All enemies defeated → reward phase
  - Player HP ≤ 0 → run end
  - Otherwise → next turn
```

## Damage Calculation

```
Base damage = card.data.damage
Type modifier = getTypeEffectiveness(spellType, enemyType)
  1.5 if spell counters enemy
  1.0 if neutral
  0.5 if enemy resists spell

Final damage = floor(baseDamage * typeModifier)
Actual damage = max(0, finalDamage - enemyBlock)
Enemy block reduced by finalDamage first
Enemy HP reduced by actual damage
```

## Open Questions

- [ ] Should block carry between turns? (StS: no, except Barricade relic. Ours: Earth starter relic does this)
- [ ] Should enemies have type energy too, or just use fixed attack values?
- [ ] How many multi-hit attacks should exist? (These interact strongly with block mechanics)
- [ ] Should there be a "weakness" debuff (like StS's Vulnerable) that increases damage taken?
- [ ] How does the "healer" enemy type work? Heal a flat amount per turn? Percentage?
- [ ] Should enemy groups have synergies? (Fire + Earth enemy = they buff each other?)
