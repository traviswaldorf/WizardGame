# Pokemon — Research Reference

> **Relevance**: Pokemon's terrain and weather systems are the strongest existing model for layered environmental game effects. Its 18-type interaction chart is the most complex type advantage system in gaming.
> **Primary Informs**: [storms.md](../../mechanics/storms.md), [decision 001](../../decisions/001-storm-triggers.md), [counters.md](../../mechanics/counters.md), [status-effects.md](../../mechanics/status-effects.md)

## System Overview

### Type System
Pokemon uses 18 types with a full interaction matrix:

| Type | Strong Against | Weak Against | Immune To |
|------|---------------|-------------|-----------|
| Fire | Grass, Bug, Ice, Steel | Water, Ground, Rock | — |
| Water | Fire, Ground, Rock | Grass, Electric | — |
| Grass | Water, Ground, Rock | Fire, Ice, Poison, Flying, Bug | — |
| Electric | Water, Flying | Ground | — |
| Ice | Grass, Ground, Flying, Dragon | Fire, Fighting, Rock, Steel | — |
| Ground | Fire, Electric, Poison, Rock, Steel | Water, Grass, Ice | Electric |
| Rock | Fire, Ice, Flying, Bug | Water, Grass, Fighting, Ground, Steel | — |
| Flying | Grass, Fighting, Bug | Electric, Ice, Rock | Ground |
| Poison | Grass, Fairy | Ground, Psychic | — |
| Psychic | Fighting, Poison | Bug, Ghost, Dark | — |
| Ghost | Psychic, Ghost | Ghost, Dark | Normal, Fighting |
| Dark | Psychic, Ghost | Fighting, Bug, Fairy | Psychic |
| Fighting | Normal, Ice, Rock, Dark, Steel | Flying, Psychic, Fairy | — |
| Steel | Ice, Rock, Fairy | Fire, Fighting, Ground | Poison |
| Dragon | Dragon | Ice, Dragon, Fairy | — |
| Fairy | Fighting, Dragon, Dark | Poison, Steel | Dragon |
| Normal | — | Fighting | Ghost |
| Bug | Grass, Psychic, Dark | Fire, Flying, Rock | — |

### Dual Typing
Pokemon can have 2 types simultaneously, creating compound strengths/weaknesses. Our secondary types (Metal = Fire + Earth) parallel this concept but through composition rather than stacking.

## Mechanics Catalog

### Weather System

| Weather | Move Trigger | Ability Trigger | Duration | Effects |
|---------|-------------|-----------------|----------|---------|
| Harsh Sunlight | Sunny Day | Drought | 5 turns (8 w/ Heat Rock) | Fire +50%, Water -50%, Solar Beam instant, sleep immunity |
| Rain | Rain Dance | Drizzle | 5 turns (8 w/ Damp Rock) | Water +50%, Fire -50%, Thunder/Hurricane perfect accuracy |
| Sandstorm | Sandstorm | Sand Stream | 5 turns (8 w/ Smooth Rock) | 1/16 HP damage to non-Rock/Ground/Steel, Rock SpDef +50% |
| Hail/Snow | Hail/Snowscape | Snow Warning | 5 turns (8 w/ Icy Rock) | 1/16 HP damage to non-Ice, Blizzard perfect accuracy, Aurora Veil enabled |

### Terrain System

| Terrain | Move Trigger | Ability Trigger | Duration | Effects |
|---------|-------------|-----------------|----------|---------|
| Electric | Electric Terrain | Electric Surge | 5 turns (8 w/ Terrain Extender) | Electric +30% (grounded), prevents sleep, Surge Surfer 2x Speed |
| Grassy | Grassy Terrain | Grassy Surge | 5 turns (8 w/ Terrain Extender) | Grass +30% (grounded), heal 1/16 HP/turn, Earthquake -50% |
| Misty | Misty Terrain | Misty Surge | 5 turns (8 w/ Terrain Extender) | Prevents status (grounded), Dragon -50%, NO offensive boost |
| Psychic | Psychic Terrain | Psychic Surge | 5 turns (8 w/ Terrain Extender) | Psychic +30% (grounded), blocks priority moves |

### Key Design Patterns

**Weather and Terrain coexist.** They are independent systems — you can have Rain + Psychic Terrain active simultaneously. Each has its own replacement rules (only 1 weather, only 1 terrain at a time).

**Replacement is counterplay.** The counter to Rain is casting Sun. No explicit "cancel" mechanic needed.

**Asymmetric dual effects.** Weather boosts one type AND nerfs another simultaneously (Rain: Water +50%, Fire -50%).

**Not all effects are offensive.** Misty Terrain has NO power boost — purely defensive (status prevention, Dragon resistance).

**Seed items reward specialization.** Each terrain has a matching Seed that grants a one-time stat boost when activated:
| Item | Terrain | Bonus |
|------|---------|-------|
| Electric Seed | Electric Terrain | +1 Defense |
| Grassy Seed | Grassy Terrain | +1 Defense |
| Misty Seed | Misty Terrain | +1 Special Defense |
| Psychic Seed | Psychic Terrain | +1 Special Defense |

**Abilities nullify weather.** Air Lock and Cloud Nine abilities negate all weather effects while the Pokemon is on the field — a form of weather counterplay without replacing it.

## Type / Element Interactions

### Interaction Depth
Pokemon's 18x18 type chart creates:
- **Super effective** (2x damage)
- **Not very effective** (0.5x damage)
- **Immune** (0x damage)
- **Neutral** (1x damage)

With dual typing, these multiply (4x, 0.25x possible). This is deeper than our current counter system but potentially too complex — our 16-type system should aim for the sweet spot.

### STAB (Same-Type Attack Bonus)
Using a move that matches your type gives +50% damage. This incentivizes type commitment — similar to our element exclusivity reward.

## Competitive / Meta Insights

### Weather Wars
In competitive Pokemon, controlling weather is a central strategic axis. Teams are often built around a specific weather:
- **Rain teams**: Swift Swim users that double speed in rain
- **Sand teams**: Sand Rush users + Rock/Ground/Steel damage immunity
- **Sun teams**: Chlorophyll users + boosted Fire sweepers
- **Hail teams**: Least competitive historically; Ice has too many weaknesses

The "weather war" — who controls the active weather — is often the deciding factor in matches.

### Terrain Control
Post-Gen 7, terrain became equally important. The Tapu legendaries each set a terrain on entry, making team preview and lead selection critical for terrain control.

### Balance Lessons
- **Ice type** is widely considered the worst defensive type — strong offensively but fragile. Our Ice should learn from this.
- **Steel type** is considered the best defensive type — resists 10 types. Metal/Crystal should be carefully balanced.
- **Fairy** was added in Gen 6 specifically to counter Dragon dominance. Shows willingness to add types for balance.
- **Weather became less dominant** when Gen 6 changed duration from infinite to 5 turns. Duration tuning is a powerful balance lever.

## Relevance Map

| Finding | Informs | Notes |
|---------|---------|-------|
| Two-layer environmental system | [storms.md](../../mechanics/storms.md) | Consider separating positive/negative storms into coexisting layers |
| Asymmetric dual effects | [storms.md](../../mechanics/storms.md) | Storms should boost AND nerf simultaneously |
| Hybrid triggers (move + ability) | [decision 001](../../decisions/001-storm-triggers.md) | Validates hybrid trigger approach |
| Replacement as counterplay | [decision 001](../../decisions/001-storm-triggers.md) | Triggering your storm overwrites opponent's |
| Seed items | [storms.md](../../mechanics/storms.md) | Passive bonuses when your storm activates |
| 18-type interaction chart | [counters.md](../../mechanics/counters.md) | Model for counter matrix design |
| STAB bonus | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Parallels element exclusivity reward |
| Weather duration nerf (Gen 6) | [storms.md](../../mechanics/storms.md) | Duration tuning as balance lever |
| Ice type weakness problem | [ice.md](../../types/secondary/ice.md) | Ensure Ice isn't glass cannon |
| Steel type strength | [metal.md](../../types/secondary/metal.md) | Watch for Metal/Crystal being too defensive |

## Raw Notes

<!-- Staging area for future Pokemon research -->
- [ ] Deep dive on Pokemon abilities that interact with types (Levitate, Thick Fat, etc.)
- [ ] Research Pokemon status conditions (Burn, Poison, Paralysis, Sleep, Freeze) for status effect design
- [ ] Investigate Pokemon's "priority" system (move priority brackets) for turn order ideas
- [ ] Look at Pokemon held items for equipment/permanent effect inspiration
- [ ] Research Pokemon's EV/IV system for hidden stat depth (probably too complex for us)
- [ ] Investigate Tera types (Gen 9) — changing a Pokemon's type mid-battle
