# Temtem — Research Reference

> **Relevance**: Temtem iterates on the Pokemon formula with a stamina-based resource system, mandatory doubles, and a unique synergy mechanic where partner types amplify techniques. Its 12-type system overlaps significantly with our type categories.
> **Primary Informs**: [combos-and-synergies.md](../../mechanics/combos-and-synergies.md), [storms.md](../../mechanics/storms.md), [balance-philosophy.md](../../philosophy/balance-philosophy.md), [spell-archetype-system.md](../../philosophy/spell-archetype-system.md)

## System Overview

### Type System (12 Types)

| Type | Color | Description | Our Closest Equivalent |
|------|-------|-------------|----------------------|
| Neutral | White | No elemental affinity | — |
| Wind | Cyan | Air-associated | Air |
| Earth | Brown | Land/rocky | Earth |
| Water | Blue | Aquatic | Water |
| Fire | Red | Fire; immune to Burned | Fire |
| Nature | Green | Plant-like | Plant |
| Electric | Yellow | Electricity/magnetism | Electric |
| Mental | Purple | Psychic; immune to Asleep | Crystal? (focus/timing) |
| Digital | Gray | Biomechanical constructs | Magnetic? (technology) |
| Melee | Orange | Physical/aggressive | — (no direct equivalent) |
| Crystal | Magenta | Crystal/mineral-based | Crystal |
| Toxic | Black | Hazardous; immune to Poisoned | Poison |

Notable: Temtem has **Crystal** and **Toxic** as distinct types — both of which exist in our tertiary tier. Their **Digital** type (technology, biomechanical) maps loosely to our Magnetic (Intel/Technology).

### Key Differences from Pokemon
- **All battles are 2v2 doubles** — no singles option. This makes partner composition central.
- **Stamina replaces PP** — shared resource pool instead of per-move limits.
- **Synergy mechanic** — techniques gain bonus effects based on partner's type.
- **No immunities** — types can be weak or resistant but never fully immune.
- **Type-based status immunities** — Fire immune to Burn, Toxic immune to Poison, Mental immune to Sleep.

## Mechanics Catalog

### Stamina System

| Aspect | Detail | Our Parallel |
|--------|--------|-------------|
| Resource | Shared stamina pool (like mana) for all techniques | Element pool for spells |
| Cost | Each technique has a stamina cost deducted from pool | Spell costs |
| Overexertion | If move costs more than remaining STA: self-damage + forced Rest next turn | Risk/reward for expensive spells |
| Recovery | 5% + 1 of max STA recovers per turn; 15% bonus if you Rest | Passive element regeneration? |
| Design Intent | Forces strategic move selection; can't spam strongest moves | Prevents degenerate strategies |

**Design Insight**: The overexertion mechanic is elegant — you CAN use a move you can't afford, but you pay HP and lose your next turn. This creates dramatic risk/reward moments. Our spell system could adopt this: let players cast spells they can't fully afford by paying the difference in tower HP or skipping their next turn.

### Synergy Mechanic (Unique to Temtem)

Techniques gain **boosted or additional effects** based on the partner Temtem's type in doubles:

| Technique (Type) | Partner Type | Synergy Effect |
|-------------------|-------------|----------------|
| Aqua Stone (Water) | Earth partner | Increased power |
| High-pressure Water (Water) | Fire partner | Adds Burned condition to target |
| Various Nature moves | Water partner | Healing effects amplified |

**Design Insight**: This is the most relevant mechanic for our combo system. Instead of combos requiring you to HAVE both types, Temtem's synergy rewards you for PAIRING with another type. In a multiplayer game, this could mean:
- Spells get bonus effects if another player at the table is using the synergy type
- Or if you have elements of both types in your pool
- This directly maps to our Interactions & Combos section in each type doc

### Hold Mechanic (Cooldowns)

| Aspect | Detail | Our Parallel |
|--------|--------|-------------|
| Hold turns | Some techniques can't be used until X turns after entering battle | Super Power cooldowns |
| Visibility | Darkened bars show hold status | Player can see when power becomes available |
| Reset | Hold resets after technique is used (for re-use cooldowns) | Cooldown after activation |

**Design Insight**: Hold creates anticipation — you know a powerful move is coming but can't use it immediately. This could apply to our Super Powers: they "charge up" over X turns before becoming available, visible to all players.

### Priority System

| Priority Level | Speed Multiplier | Example |
|----------------|-----------------|---------|
| Very High | 1.75x | Emergency moves |
| High | 1.5x | Quick attacks |
| Normal | 1.0x | Standard moves |
| Low | 0.5x | Setup moves |
| Very Low | Always last | Powerful delayed effects |

**Design Insight**: Priority as a speed multiplier (not a fixed bracket like Pokemon) creates more nuance. Faster players can use low-priority moves and still act before slow players using normal-priority moves.

### Traits (Passive Abilities)

Each Temtem has one of two possible traits (passive abilities):

| Trait | Effect | Our Parallel |
|-------|--------|-------------|
| Botanist | +15% Nature damage | Type specialization bonus |
| Last Rush | +50% stats when last Temtem alive | Comeback mechanic |
| Various | Prevent status conditions, boost types, modify stats | Permanent effects |

## Type / Element Interactions

### Effectiveness Chart

Temtem uses **2x (effective)** and **0.5x (ineffective)** with dual typing creating **4x** and **0.25x** extremes. Key matchups relevant to our system:

| Attacker | Strong Against | Weak Against |
|----------|---------------|-------------|
| Fire | Nature, Crystal | Water, Earth |
| Water | Fire, Earth, Digital | Nature, Electric, Toxic |
| Nature | Water, Earth | Fire, Toxic |
| Electric | Water, Wind, Mental, Digital | Earth, Crystal |
| Crystal | Electric, Mental | Fire, Earth |
| Toxic | Water, Nature | Wind, Earth, Crystal |
| Wind | Toxic | Electric |
| Earth | Fire, Electric, Crystal | Water, Nature, Wind |

**Notable**: Crystal is strong against Electric and Mental — representing focused structure disrupting chaotic energy. This supports our Crystal↔Electric synergy concept.

### Type-Based Status Immunities

| Type | Immune To |
|------|-----------|
| Fire | Burned |
| Toxic | Poisoned |
| Mental | Asleep |

**Design Insight**: Thematic status immunities are intuitive and add strategic depth. Our system could adopt this: Fire immune to Burn, Ice immune to Freeze, etc.

## Competitive / Meta Insights

### Stamina Economy
- The meta revolves around stamina management — teams that overextend get punished
- Resting is a valid strategic choice, not just "wasting a turn"
- Creates natural pacing where aggression has a resource cost

### Synergy-Driven Team Building
- Top teams are built around synergy pairs, not just individual power
- Partner type awareness changes move selection every turn
- Creates more dynamic decision-making than Pokemon's "pick the super-effective move"

### Balance Lessons
- **Mandatory doubles** creates inherently more strategic play than optional singles
- **Stamina prevents spam** — even the best move can't be used indefinitely
- **Synergy rewards composition** over individual power — relevant to our element exclusivity reward
- **No immunities** prevents feel-bad moments where an attack does literally nothing

## Relevance Map

| Finding | Informs | Notes |
|---------|---------|-------|
| Synergy mechanic (partner type bonuses) | [combos-and-synergies.md](../../mechanics/combos-and-synergies.md) | Strongest parallel — partner's type amplifies your techniques |
| Stamina/overexertion system | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Risk/reward for exceeding resource limits |
| Hold mechanic (cooldowns) | Type docs, Section 6 (Super Powers) | Super Powers could charge up over turns |
| Type-based status immunities | [status-effects.md](../../mechanics/status-effects.md) | Fire immune to Burn, Ice immune to Freeze, etc. |
| Crystal type (focus, structure) | [crystal.md](../../types/tertiary/crystal.md) | Validates Crystal as precision/structure type |
| Toxic type (poison, hazard) | [poison.md](../../types/tertiary/poison.md) | Validates Poison as status-dealing attrition type |
| Digital type (technology) | [magnetic.md](../../types/tertiary/magnetic.md) | Supports Magnetic as technology/intel type |
| No immunities design | [counters.md](../../mechanics/counters.md) | Consider soft counters (reduce) vs hard counters (immune) |
| Mandatory doubles | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Multiplayer synergy as core design, not afterthought |
| Priority as speed multiplier | [spell-archetype-system.md](../../philosophy/spell-archetype-system.md) | Nuanced turn order system |

## Raw Notes

- [ ] Deep dive on specific synergy pairs for combo inspiration
- [ ] Research Temtem's competitive tier list for balance insights
- [ ] Investigate Temtem's "gear" system for equipment/permanent effect ideas
- [ ] Look at Temtem's breeding/trait inheritance for any deck-building parallels
- [ ] Research Temtem's "Luma" system (shinies) for cosmetic reward ideas
- [ ] Compare Temtem's type chart balance against Pokemon's — which matchups feel better?
