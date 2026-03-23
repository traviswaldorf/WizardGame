# Roguelike — Between-Run Progression & Hub

> **Status**: Exploration
> **Related**: [Meta-Game](meta-game.md), [Progression](progression.md)
> **Research**: Hades, Balatro, Dead Cells, Rogue Legacy, Meowgenics, Ball X Pit

## Design Philosophy

Between-run progression should follow the **Hades model**: every run contributes to growth, progression expands OPTIONS not just power, and the hub is a place with personality, not just a menu.

### Our Guiding Principles

1. **The game is winnable on run 1** — progression is a gift, never a gate
2. **Horizontal over vertical** — new type branches, spells, instruments > bigger damage numbers
3. **Failed runs earn something meaningful** — but not so much that failing feels "correct"
4. **The hub is a laboratory** — themed as a wizard's research space, not a generic menu
5. **Discovery IS progression** — cataloging spells, types, and interactions is its own reward

## The Laboratory (Between-Run Hub)

### Concept

Between runs, the player returns to their **laboratory** — a wizard's research space that grows and changes as they progress. This is where meta-progression happens, where collected knowledge is organized, and where the next run is prepared.

The laboratory mirrors the House of Hades: a narrative-rich space where progression feels like building something, not filling a progress bar.

### Laboratory Stations

| Station | Function | Currency | Inspired By |
|---------|----------|----------|-------------|
| **Research Desk** | Spend Insight to unlock progression tree branches | Insight (earned from runs) | Hades Mirror of Night |
| **Instrument Shelf** | Equip persistent instruments for next run start | Instruments (found in runs, kept permanently) | Hades Keepsakes |
| **Spell Journal** | View discovered spells, type combinations, recipes | Auto-populated from gameplay | Pokemon Pokedex / Infinite Craft |
| **School Board** | Choose school, view pupil allegiance, see unlocked wizards | N/A (selection screen) | Hades Weapon Selection |
| **Tower Map** | Select tower, view mastery levels, see available towers | N/A (selection screen) | Hades Pact of Punishment |
| **Experiment Bench** | Combine materials from runs to create new instruments | Materials (dropped from elites/bosses) | Meowgenics breeding (lighter version) |

### Currencies Earned During Runs

| Currency | Source | Persists? | Spent On |
|----------|--------|-----------|----------|
| **Insight** | Earned from combat (based on spells cast, types used, discoveries made) | Yes | Research Desk: unlock tree branches, deepen type knowledge |
| **Gold** | Earned from combat, shops | No (per-run only) | Within-run purchases only |
| **Materials** | Dropped by elites and bosses (type-themed) | Yes | Experiment Bench: craft instruments |
| **Type XP** | Earned from casting spells | No (per-run, spent on in-run tree) | Within-run progression tree |

### What Persists Between Runs

| Category | What Carries Over | Type |
|----------|-------------------|------|
| **Progression tree branches** | Which cross-type branches are visible | Pool expansion (horizontal) |
| **Discovered spells** | Journal entries for spells you've cast | Collection / knowledge |
| **Instruments collected** | Instruments found in runs, kept forever | Build enablers |
| **School mastery levels** | Per-school difficulty progression | Challenge tracking |
| **Unlocked wizards** | Characters available to play as | Pool expansion |
| **Insight** (currency) | Accumulated from all runs | Upgrade currency |
| **Materials** (currency) | Accumulated from elite/boss drops | Crafting currency |
| **Pupil allegiances** | Chosen pupil per school | Build enabler |

### What Does NOT Persist

| Category | Resets Each Run |
|----------|----------------|
| **Deck/hand/discard** | Fresh starter deck every run |
| **Type energy levels** | Reset to school base (3 of school type) |
| **In-run progression tree investments** | Tree resets, but available branches persist |
| **Gold** | Earned and spent within runs only |
| **HP** | Fresh each run |
| **Equipped run-instruments** | Instruments found mid-run are temporary unless they're persistent ones |

## Research Desk (Insight Spending)

The primary between-run upgrade system. Spend Insight to permanently expand capabilities.

### What You Can Unlock

| Unlock Category | Cost Range | Effect | Design Intent |
|-----------------|------------|--------|---------------|
| **Type branch** | 50-200 Insight | Reveal a new branch in the per-run progression tree | Horizontal: new options |
| **Starter deck slot** | 100 Insight | +1 card in starter deck | Slight vertical, bounded |
| **Starting energy +1** | 200 Insight | +1 max energy of your school type (4 instead of 3) | Vertical, expensive, bounded |
| **Discovery bonus** | 75 Insight | Increase chance of finding specific spell types in rewards | Horizontal: targeted loot |
| **Instrument slot** | 150 Insight | Carry 1 more persistent instrument into runs | Build enabler |

### Insight Earning

- **Combat**: Base amount per fight, bonus for using multiple type energies
- **Discovery**: First time casting a new spell = bonus Insight
- **Boss defeat**: Large Insight reward
- **Run completion**: Bonus for winning, smaller amount for losing (consolation)
- **Failed runs**: Always earn SOME Insight, so no run feels wasted

## Instrument Shelf (Persistent Equipment)

Unlike in-run instruments (found during a run, lost when the run ends), **persistent instruments** are kept forever once found. Before each run, you choose which persistent instruments to bring.

### How It Works

1. During a run, certain elite/boss rewards offer **persistent instruments** (visually distinct — golden border)
2. Once found, they're added to your shelf permanently
3. Before a run, you equip up to N instruments from your shelf (N starts at 1, expandable via Research Desk)
4. Equipped instruments provide their bonus from the start of the run

### Persistent vs. Temporary Instruments

| Type | Found Where | Lasts | Power Level |
|------|-------------|-------|-------------|
| **Temporary** | Normal combat rewards, shops | Current run only | +1 energy of type |
| **Persistent** | Elite/boss rewards | Forever | +1 energy of type + minor unique bonus |

Persistent instruments are rarer and slightly stronger — they're the "keepsakes" of our system.

## Spell Journal (Discovery Catalog)

A collection screen showing all spells the player has ever cast or discovered. Organized by type combination.

### Design

```
        Fire    Earth   Water   Air     Metal   Plant   ...
Fire    [4/4]   [3/8]   [1/8]   [0/8]   [0/5]   ...
Earth           [4/4]   [2/8]   [0/8]   ...
Water                   [4/4]   [1/8]   ...
Air                             [4/4]   ...
```

Each cell shows X/Y (discovered / total) for that type combination. Clicking a cell shows the specific spells discovered. Undiscovered spells show as "???" entries.

### Why This Matters

- Creates a completionist drive without power gating
- Teaches the type system — players SEE the combination matrix
- Rewards exploration — trying new type combinations fills in the journal
- Mirrors the "Discovery as Magic" principle — the journal IS the discovery record
- Connects to the real-science grounding — each spell entry could show the real-world process it's based on

## Experiment Bench (Instrument Crafting)

A lighter version of Meowgenics' breeding system. Players combine materials from runs to create new instruments.

### How It Works

1. Elites and bosses drop **type-themed materials** (e.g., "Fire Essence," "Crystal Shard")
2. At the Experiment Bench, combine 2-3 materials to craft an instrument
3. Recipes are partially discovered — some are revealed by the Spell Journal, others are experimented upon
4. Created instruments are persistent (added to the Instrument Shelf)

### Why This Approach

- Lighter than breeding (no multi-generational planning needed)
- Still creates "between-run activity" beyond just spending currency
- The crafting IS discovery — you're experimenting, just like a real scientist
- Materials are earned from challenging content (elites/bosses), creating a push-pull between risk and crafting resources

### Design Caution

This is the highest-risk feature — crafting systems can feel like a chore. Start minimal:
- 3-4 simple recipes
- Clear material requirements
- No randomness in crafting outcomes (deterministic recipes)
- Expand only if players find it engaging

## Balatro-Inspired Shop Improvements (Within Runs)

Balatro's shop is satisfying because of overlapping decision axes. Our within-run shop should learn from this:

### Current Shop (basic)
Buy spells, remove spells, leave.

### Enhanced Shop (Balatro-influenced)
| Feature | What It Does | Decision It Creates |
|---------|-------------|---------------------|
| **Reroll** | Pay gold to refresh shop inventory | "Is what I see good enough, or do I gamble on better?" |
| **Interest** | Earn +1 gold per 10 held, cap at 5 | "Spend now or bank for interest?" |
| **Instrument slot** | Shop sometimes offers instruments | "Instrument or spell this visit?" |
| **Voucher equivalent** | Shop offers a permanent run-long upgrade (e.g., +1 draw, +1 energy) | "Big investment now for compound returns later?" |
| **Sell spells from deck** | Sell unwanted spells for gold | "Thin my deck AND earn gold?" |

## Comparative Analysis

### Where We Fall on the Spectrum

```
NOTHING                                                    EVERYTHING
CARRIES OVER                                             CARRIES OVER
|                                                                   |
|  StS/Balatro    Dead Cells    [US]    Hades    Rogue Legacy      |
|                                 ↑                                 |
|                           Target zone                             |
|                                                                   |
|  Pure skill      Pool         Build     Narrative   Stat          |
|  growth          expansion    enablers  + enablers  grinding      |
```

We target slightly left of Hades:
- **More pool expansion** than Hades (type branches, spell journal)
- **Less stat growth** than Hades (bounded, expensive energy upgrades)
- **Similar build enablers** (persistent instruments ≈ keepsakes)
- **Unique: discovery catalog** (no direct Hades equivalent — closer to Pokemon/Infinite Craft)

### Pros of Our Approach

1. Failed runs earn Insight + Materials → never feels wasted
2. Progression tree branches are HORIZONTAL — you see more of the game, not bigger numbers
3. The lab as a place creates narrative potential (mentor NPCs, school lore)
4. Spell Journal leverages our unique type combination system
5. Crafting is optional depth, not mandatory grind

### Risks

1. Insight economy needs careful tuning — too generous = no scarcity, too stingy = feels grindy
2. Persistent instruments could create "optimal loadout" convergence
3. Lab needs to be FAST — 30 seconds to prep a run, not 5 minutes
4. Spell Journal is pure collection, no gameplay impact — might feel hollow without rewards tied to completion

## Open Questions

- [ ] How much Insight should a winning run earn vs. a losing run? (3:1 ratio? 5:1?)
- [ ] Should there be NPC mentors in the lab who offer quests/challenges?
- [ ] Should the lab visually change as you progress? (Empty lab → filled shelves → overflowing research)
- [ ] How many persistent instrument slots to start? (1 feels right)
- [ ] Should Spell Journal completion unlock anything? (Cosmetics? Special spells? Lore entries?)
- [ ] Should there be a "daily challenge" or "weekly tower" for competitive play?
- [ ] Is the Experiment Bench worth building for the prototype, or defer?
