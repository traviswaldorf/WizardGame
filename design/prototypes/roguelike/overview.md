# Roguelike Prototype — Overview

> **Status**: Exploring
> **Prototype Location**: `frontend/src/roguelike/`
> **Shared Systems Used**: Type system, wizard schools, spells, instruments, counters

## Concept

A single-player roguelike deckbuilder inspired by Slay the Spire, built on the Wizard Game's type system. Players choose a wizard school (their elemental identity), climb a tower (themed by another type), and build a deck of spells through combat, rewards, and a per-run progression tree.

The key differentiator from StS: **energy is typed, not generic**. Starting with one type and expanding into others through the run IS the progression arc. The type hierarchy (primary → secondary → tertiary) creates a natural discovery curve that StS can't offer.

## Core Loop

```
Choose School (type identity)
    ↓
Choose Tower (determines loot pool + boss)
    ↓
Navigate branching map
    ↓
Combat → earn type XP + gold + spell/instrument rewards
    ↓
Invest XP in progression tree → unlock new type branches
    ↓
Repeat until boss
    ↓
Defeat head wizard → unlock character for future runs
```

## How It Translates StS

| StS Mechanic | Our Translation | Our Unique Twist |
|-------------|-----------------|------------------|
| Character select | School selection (Fire/Earth/Water/Air) | Each school has a different energy economy and starter relic |
| Generic energy (3/turn) | Typed energy (3 of school type, 0 others) | Energy scarcity is per-type, creating "which TYPES can I play?" |
| Card reward (choose 1 of 3) | Tower-guided spell rewards | Loot pool filtered by school + tower + unlocked branches — never junk |
| Relics | Instruments | +1 energy of instrument's type; biased toward tower/school types |
| Boss as build check | Head wizard as type check | Boss uses counter-type attacks; tests if you diversified |
| Ascension (difficulty levels) | School mastery (per-school) | Each school has independent difficulty ladder |
| Minimal meta-progression | Deep cross-run unlock system | Beating towers unlocks branches in progression tree for future runs |

## Three Design Principles in Action

1. **Discovery as Magic**: Cross-type spells and secondary types are DISCOVERED through the progression tree, not selected from a menu. "I invested in Fire and Earth, and Metal emerged."

2. **A World of Interaction**: Enemy groups mix types, creating tactical targeting decisions. Tower themes influence but don't restrict encounters. Type effectiveness makes every matchup feel different.

3. **Progression and Advancement**: Per-run skill tree mirrors scientific progress. Meta-progression across runs mirrors generational knowledge compounding. Force-casting lets you use types inefficiently before mastering them.

## Related Design Docs

- [Progression System](progression.md) — Per-run skill tree, energy economy, force-casting
- [Tower Design](tower-design.md) — Tower structure, enemy composition, boss fights
- [Combat System](combat.md) — Multiple enemies, targeting, type effectiveness
- [Meta-Game](meta-game.md) — Character unlocks, cross-run progression, school mastery
- [Between-Run Progression](between-runs.md) — Laboratory hub, Insight/Materials currencies, persistent instruments, spell journal

## Shared System References

- [Type System Overview](../../framework/type-system-overview.md)
- [Wizard Schools](../../reference/scientists/wizard-schools.md)
- [Counter Relationships](../../mechanics/counters.md)
- [Strategic Archetypes](../../philosophy/strategic-archetypes.md)
- [Slay the Spire Reference](../../reference/games/slay-the-spire/relevance.md)
- [Decision 008: Roguelike School Runs](../../decisions/008-roguelike-school-runs.md)
