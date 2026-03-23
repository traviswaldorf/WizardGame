# Magic: The Gathering — Research Reference

> **Relevance**: The primary mechanical inspiration for our type system, spell archetypes, and strategic pillars. MTG's 30-year color pie is the most battle-tested type interaction system in gaming.
> **Primary Informs**: [type system](../../framework/type-system-overview.md), [strategic pillars](../../philosophy/strategic-archetypes.md), [spell archetypes](../../philosophy/spell-archetype-system.md), [correspondence map](../mtg-correspondence-map.md)

## System Overview

### The Color Pie
MTG organizes all cards into 5 colors, each with a distinct strategic identity:

| Color | Identity | Strengths | Weaknesses |
|-------|----------|-----------|------------|
| White | Order, community, law | Life gain, board wipes, protection, tokens | Card draw, direct damage |
| Blue  | Knowledge, control, perfection | Card draw, counterspells, tempo, evasion | Creatures, direct damage |
| Black | Power, ambition, death | Removal, reanimation, life drain, discard | Enchantments, artifacts |
| Red   | Freedom, chaos, impulse | Direct damage, haste, land destruction, randomness | Defense, card advantage |
| Green | Nature, growth, instinct | Big creatures, mana ramp, life gain, trample | Evasion, direct removal |

### Color Pair Identities
Two-color combinations create 10 "guilds" with blended identities — similar to our secondary types:

| Pair | Name | Identity |
|------|------|----------|
| White/Blue | Azorius | Law, control, bureaucracy |
| Blue/Black | Dimir | Secrets, espionage, manipulation |
| Black/Red | Rakdos | Chaos, destruction, performance |
| Red/Green | Gruul | Primal force, territory, instinct |
| Green/White | Selesnya | Community, nature, unity |
| White/Black | Orzhov | Religion, wealth, power structures |
| Blue/Red | Izzet | Experimentation, invention, discovery |
| Black/Green | Golgari | Death/life cycle, decay, recycling |
| Red/White | Boros | Military, justice, aggression |
| Green/Blue | Simic | Evolution, adaptation, biology |

## Mechanics Catalog

<!-- To be expanded with deeper research per mechanic -->

### Resource System
- **Lands** produce **mana** (1 per turn per land, typically)
- 5 colors of mana + colorless
- Cards have **mana costs** that require specific color combinations
- **Mana curve**: balancing cheap early plays vs expensive late plays

### Card Types
| Type | Persistence | Our Equivalent |
|------|-------------|----------------|
| Instant | One-shot, can play on opponent's turn | Spell (reactive) |
| Sorcery | One-shot, your turn only | Spell (proactive) |
| Creature | Persistent, attacks/blocks | Tower? |
| Enchantment | Persistent global/local effect | Permanent Effect |
| Artifact | Persistent, colorless equipment | Equipment/Shield |
| Planeswalker | Persistent, activatable abilities | Super Power source? |
| Land | Resource generation | Element Source |

### Combat System
- **Attacking**: Declare attackers → opponent declares blockers → resolve damage
- **Evasion**: Flying, unblockable, trample bypass blockers
- **First Strike**: Deal damage before opponent in combat

## Type / Element Interactions

### Color Hosing
Each color has natural enemies:
| Color | Enemies | Mechanical Expression |
|-------|---------|----------------------|
| White | Black, Red | Protection from color, damage prevention |
| Blue | Red, Green | Counterspells, bounce |
| Black | White, Green | Removal, life drain |
| Red | White, Blue | Direct damage, land destruction |
| Green | Blue, Black | Big creatures, enchantment removal |

### Ally vs Enemy Colors
- **Ally pairs** (adjacent on color wheel): share mechanics, easier to play together
- **Enemy pairs** (opposite on color wheel): contrasting mechanics, tension when combined

## Competitive / Meta Insights

### Archetype Categories
| Archetype | Speed | Strategy | Our Parallel |
|-----------|-------|----------|-------------|
| Aggro | Fast | Win before opponent sets up | Aggressive/Fire pillar |
| Control | Slow | Answer every threat, win late | Control/Air pillar |
| Midrange | Medium | Flexible, value-oriented | Defensive/Earth pillar |
| Combo | Variable | Assemble specific card combinations | Combo/synergy system |
| Tempo | Fast-medium | Efficient threats + disruption | Flow/Water pillar |

### Balance Lessons
- **Color pie breaks** are the biggest balance problems — when a color gets mechanics outside its identity
- **Card advantage** is the most important resource in long games
- **Mana screw/flood** (too few/many lands) is the most criticized RNG element — our element system should consider this

## Relevance Map

| Finding | Informs | Notes |
|---------|---------|-------|
| Color pie philosophy | [strategic-archetypes.md](../../philosophy/strategic-archetypes.md) | Our 4 pillars map roughly to Aggro/Control/Midrange/Tempo |
| Color pair identities | [type-system-overview.md](../../framework/type-system-overview.md) | Our secondary types parallel MTG guilds |
| Instant vs Sorcery | [spell-archetype-system.md](../../philosophy/spell-archetype-system.md) | Reactive vs proactive spell design |
| Mana/land system | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Element scarcity and resource pacing |
| Enchantments/Artifacts | [status-effects.md](../../mechanics/status-effects.md) | Permanent effects design |
| Color hosing | [counters.md](../../mechanics/counters.md) | Natural type counter relationships |
| Archetype meta | [strategic-archetypes.md](../../philosophy/strategic-archetypes.md) | Aggro/Control/Midrange/Tempo mapping |

## Raw Notes

<!-- Staging area for future MTG research -->
- [ ] Deep dive on MTG "keyword abilities" (Flying, Trample, Haste, etc.) and how they map to our system
- [ ] Research MTG "tribal" mechanics (type-matters cards) for element synergy ideas
- [ ] Look at MTG "storm" mechanic (cast count matters) — name collision with our Storms
- [ ] Research MTG sideboard strategy for pregame planning inspiration
- [ ] Investigate MTG mulligan rules for starting hand balance
