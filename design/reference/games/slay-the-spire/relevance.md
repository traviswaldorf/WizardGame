# Slay the Spire — Relevance to Wizard Game

> **Primary Influence**: Roguelike run structure, character unlock loop, boss-as-archetype-check, deck-building within runs, meta-progression through ascension
> **Primary Informs**: [008-roguelike-school-runs](../../../decisions/008-roguelike-school-runs.md), [005-incremental-progression-trees](../../../decisions/005-incremental-progression-trees.md), type weaknesses/resistances

## Core Loop

Run → Build deck → Fight act bosses → Win or die → Unlock new character → Run again with new playstyle.

The game is a single-player roguelike deckbuilder. Each run starts fresh (no mechanical carry-over). You build a deck on the fly from randomized card rewards after combat, shop purchases, and event choices. Runs have 3 acts (plus a hidden Act 4), each ending in a boss fight.

## Character System

Four playable characters, each with a fundamentally different *resource* they manipulate:

| Character | HP | Unique Resource | Starter Relic | Playstyle |
|-----------|-----|-----------------|---------------|-----------|
| **Ironclad** | 80 | Sustain (heal after combat) | Burning Blood | Aggressive, strength-scaling, exhaust |
| **Silent** | 70 | Card draw / poison | Ring of the Snake | Patient, scaling, combo-oriented |
| **Defect** | 75 | Orbs (passive effects) | Cracked Core | Engine-building, setup-heavy |
| **Watcher** | 72 | Stances (damage/energy modes) | Pure Water | High risk/reward, stance dancing |

**Unlock method**: Complete a run (win or lose) with the previous character. Low barrier — encourages trying everything.

**Key insight**: Characters aren't just card pools. They have different HP, a different starter relic that shapes early strategy, and a unique mechanic that ALL their archetypes reference. The starter relic defines identity from turn 1.

## Run Progression Structure

**3 acts, 17 floors each.** Branching node map with player-chosen routes.

**Node types**: Normal combat (53%), mystery rooms (22%), rest sites (12%), elites (8%), shops (5%).

**Guaranteed floors create rhythm**:
- Floor 1: Easy combat (warm-up)
- Floor 9: Treasure room (guaranteed relic)
- Floor 15: Rest site (heal or upgrade before boss)
- Floor 16: Act boss
- Floor 17: Boss chest reward

**Branching paths** are a core strategic decision — path through elites for stronger rewards (risk death), or take safer routes through events and shops.

**Design takeaway**: Guaranteed checkpoints within randomized content. Players can plan risk-taking because they know what's coming at key floors. The *route* is a decision layer on top of the *combat* decision layer.

## Boss Design Philosophy

Each boss tests (and punishes) a specific degenerate strategy:

| Boss | Tests Against |
|------|---------------|
| **The Guardian** | Pure-attack decks (Sharp Hide punishes attacks) |
| **Slime Boss** | Lack of burst damage (splits at 50% HP) |
| **The Champ** | Slow strategies (cleanses debuffs at 50%) |
| **Awakened One** | Power-heavy decks (gains Strength per Power played) |
| **Time Eater** | Card-spam/infinite loops (ends turn after 12 cards) |
| **Donu & Deca** | Single-target focus (two targets that buff each other) |

**Design takeaway**: Bosses are archetype checks. No single strategy beats all bosses. Knowing which boss you'll face (visible on the map from the start) rewards planning and adaptation. This is directly applicable to wizard school bosses that test type mastery.

## Relic System (Equipment)

~170 relics. Permanent passive items acquired during a run. Key categories:

- **Starter relics**: Define character identity
- **Boss relics**: Most powerful, but come with significant downsides (e.g., Snecko Eye: draw 7 cards but costs randomized; Runic Dome: +1 energy but enemy intents hidden)
- **Common/Uncommon/Rare**: Standard power curve
- **Shop/Event-exclusive**: Reward exploration and resource management

**Design takeaway**: The boss relic tradeoff system creates the most impactful decisions in a run. Power always comes at a cost. Equipment should warp strategy, not just buff numbers.

## Meta-Progression

**What carries over between runs**: Almost nothing mechanically. Each run is fresh.

**Persistent unlocks**:
- Character unlocks (play a run → unlock next character)
- Card/relic pool expansion (score thresholds unlock new cards and relics into the pool)
- Ascension levels (per-character difficulty ladder, 20 levels)

**Ascension system** — difficulty as subtraction:

| Levels | Theme |
|--------|-------|
| 1–4 | More enemies, more damage |
| 5–6 | Reduced healing |
| 7–9 | Enemies are tankier |
| 10 | Start with a curse card |
| 11–13 | Fewer resources offered |
| 14–16 | Further restrictions |
| 17–19 | Harder enemy movesets |
| 20 | Fight two bosses at end of Act 3 |

**Design takeaway**: Ascension doesn't add content — it removes safety nets. Cheap to design, deeply effective at extending replayability. Per-character tracking means mastering one character doesn't trivialize others.

## Card Archetypes (Emergent, Not Prescribed)

Characters don't pick an archetype. Archetypes *emerge* from card combinations offered during the run:

- **Ironclad**: Strength scaling, exhaust engine, barricade/block, or goodstuff
- **Silent**: Poison, shivs (many small attacks), discard/draw engine, or wraith form
- **Defect**: Frost defense, lightning aggro, dark orb scaling, or power spam
- **Watcher**: Stance dancing, wrath burst, divinity (mantra accumulation), or scry/retain

**Key principle**: Archetypes are *discovered* within each run based on what the game offers. You respond to randomness, not execute a pre-planned strategy. "Choose 1 of 3 cards or skip" after each combat means deck identity emerges organically.

## Direct Application to Our Game

| Slay the Spire Mechanic | Our Translation |
|--------------------------|-----------------|
| Character unlock via boss defeat | Defeat a wizard school's head wizard → unlock that wizard as a playable character |
| Unique resource per character | Each type has a fundamentally different strategic identity (aggressive/defensive/flow/control) |
| Boss as archetype check | School bosses test mastery of their type's weaknesses — you must understand the counter system |
| Branching run map | Elemental progression tree — choose which type branch to pursue |
| Boss relics with tradeoffs | Equipment/instruments with type-aligned bonuses and type-specific costs |
| Ascension (difficulty as subtraction) | Type mastery levels that increase type resistance/weakness severity |
| Emergent archetypes | Spell combinations discovered during runs, not pre-selected |
| Starter relic defines identity | Starting wizard school determines opening spells and type affinity |
| "Skip is strategy" (deck thinning) | Element exclusivity reward — sometimes NOT adding a type is optimal |
