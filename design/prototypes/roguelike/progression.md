# Roguelike — Progression System

> **Status**: Exploring
> **Adapts**: [Decision 005: Incremental Progression Trees](../../decisions/005-incremental-progression-trees.md)

## Overview

Each run has a lightweight skill tree that the player invests in between combats. The tree starts with only the player's school type visible. Branches toward other types are unlocked through meta-progression (beating towers in previous runs). This system replaces generic "attunement" as the primary way to expand your type pool.

## Per-Run Skill Tree

### Structure

```
Your School Type (e.g., Fire)
    |
[Tier 1: Basics] ← Free at run start
    |
[Tier 2: Depth] ← Costs type XP earned from combat
   / \
  /   \
[Branch A]           [Branch B]
(toward Earth)       (toward Air)
Only visible if      Only visible if
unlocked via         unlocked via
meta-progression     meta-progression
      |                    |
[Cross-type gate]    [Cross-type gate]
(Fire+Earth spells)  (Fire+Air spells)
      |                    |
[Secondary gate]     [Secondary gate]
(Metal)              (Electric)
Requires depth       Requires depth
in BOTH branches     in BOTH branches
```

### What Nodes Unlock

| Node Type | Effect | Example |
|-----------|--------|---------|
| **Energy +1** | Gain +1 max energy of a type | "Earth Attunement" → +1 Earth energy/turn |
| **Spell Pool** | New spell types appear in rewards | "Cross-Type Insight" → Fire+Earth spells in reward pool |
| **Passive** | Ongoing combat bonus | "Combustion Efficiency" → Fire spells deal +1 damage |
| **Gate** | Requires multiple branches invested | "Metal Gate" → requires Fire depth 3 + Earth depth 3 |
| **Discovery** | Reveals new branch or mechanic | "Secondary Emergence" → Metal type discovered |

### Investing in the Tree

- **When**: Between combats, on the map screen (always accessible)
- **Currency**: Type XP, earned from combat based on spells cast
  - Cast a Fire spell → earn Fire XP
  - Cast a Fire+Earth spell → earn both Fire XP and Earth XP
- **Cost scaling**: Deeper nodes cost more XP
- **Pacing**: Expect ~1-2 nodes per combat in early run, slowing as costs increase

### First-Run Experience

On a brand new account with no meta-progression unlocks:
- The tree shows ONLY your school's type nodes (Fire Tier 1, 2, 3)
- No branches to other types are visible — the player doesn't know they exist
- The run is a pure mono-type experience
- Goal: learn the basics, beat the tower, unlock branches for next run

## Energy Economy

### Starting State

| School | Energy | Starter Relic | Feel |
|--------|--------|---------------|------|
| **Fire** | 3 Fire | Heal 3 HP after each combat | Aggressive |
| **Earth** | 3 Earth | 3 Block carries between turns | Defensive |
| **Water** | 3 Water | Draw 1 extra card on turn 1 | Flow |
| **Air** | 3 Air | +1 Air energy on turn 1 only | Control |

### Progression Curve

```
Start:      3 Type A (school only)
Floor 3-4:  3 Type A + 1 Type B (first branch investment)
Floor 6-8:  3 Type A + 2 Type B (deeper investment + instrument)
Floor 9+:   3-4 Type A + 2-3 Type B + maybe 1 Type C (secondary gate)
```

### Protection Against Spreading Too Thin

- **Tree structure limits options**: You can only branch to types unlocked via meta-progression
- **Tower-guided rewards**: Spells only come from your school type, tower type, and their compositions
- **XP is typed**: Casting Fire spells earns Fire XP, not generic XP — you naturally deepen your main type
- **Gate requirements**: Secondary types require depth in BOTH parent types, preventing shallow splashing

## Force-Casting (Component Energy Conversion)

Before a player has fully unlocked a secondary type's energy, they can still cast its spells by spending the component primary energies at an inefficient rate.

### How It Works

```
Electric spell costs: 1 Electric energy

Without Electric energy unlocked:
  Pay: 1 Fire + 1 Air → converts to 1 Electric (for this cast only)
  Inefficient: spending 2 energy for 1 spell

With Electric energy unlocked (via tree node or instrument):
  Pay: 1 Electric → direct
  Efficient: 1 for 1
```

### Design Rationale

- Mirrors real science: early scientists achieved results through brute force before understanding principles
- Lets players USE secondary spells before fully unlocking them — maintains Discovery as Magic
- Creates a satisfying efficiency curve: force-casting feels expensive, unlocking feels like a breakthrough
- Prevents "I found a cool spell but can never cast it" frustration

### Conversion Rules

| Target Type | Component Cost | Notes |
|-------------|---------------|-------|
| Metal | 1 Fire + 1 Earth | Secondary: two primary parents |
| Plant | 1 Earth + 1 Water | Secondary |
| Ice | 1 Water + 1 Air | Secondary |
| Electric | 1 Fire + 1 Air | Secondary |
| Radioactive | 2 Fire + 1 Metal | Tertiary: requires secondary parent |
| Cosmic | 2 Earth + 1 Metal | Tertiary |
| etc. | Higher cost | Tertiaries are expensive to force-cast |

## Meta-Progression Impact on Tree

See [Meta-Game](meta-game.md) for full details. Summary:

| Meta Achievement | Tree Unlock |
|-----------------|-------------|
| Beat Air Tower (any character) | Air branch appears in all school trees |
| Beat Earth Tower as Fire | Fire→Earth branch gets a synergy bonus node |
| Use Fire+Air in a winning run | Electric gate becomes visible in Fire tree |
| Tertiary mastery conditions | Tertiary branch nodes appear |

## Open Questions

- [ ] How many nodes per tier? (3-5 feels right for pacing)
- [ ] Should the tree reset between runs or carry over partially?
- [ ] Visual design of the tree — how does it render on the map screen?
- [ ] Should type XP be visible during combat, or only tallied after?
- [ ] Can you respec tree investments mid-run? (Probably not — commitment matters)
