# Roguelike — Meta-Game & Cross-Run Progression

> **Status**: Exploring

## Overview

The meta-progression system is where our game diverges most from Slay the Spire. StS has minimal carry-over between runs (character unlocks, card pool expansion, ascension levels). Our system uses **deep runs to permanently expand the progression tree for future runs**, mirroring how scientific knowledge compounds across generations.

## Meta-Progression Layers

### Layer 1: Mono-Type Mastery (First Runs)

**State**: Brand new player, no unlocks.

- Start with 1 primary school (Fire, Earth, Water, or Air)
- Progression tree shows ONLY that school's type nodes
- No cross-type branches visible — the player doesn't know they exist
- Pure mono-type deckbuilding experience
- Goal: learn combat, beat a tower, unlock the next layer

**Why mono-type first**: Prevents overwhelm. Player learns one energy type thoroughly before discovering the system has more depth. The moment they beat their first tower and see a new branch appear in the tree is a genuine Discovery as Magic moment.

### Layer 2: Cross-Type Discovery (After Beating Towers)

**Trigger**: Defeat a tower's head wizard.

**Effect**: The defeated tower's type becomes available as a BRANCH in the progression tree for future runs.

**Example**:
- Player beats Air Tower as Fire school
- On next Fire run: **Fire→Air branch** appears in the progression tree
- Player can now invest XP toward Air energy, unlocking Fire+Air cross-type spells
- This branch wasn't visible before — it was literally hidden

**Scope of unlock**:
- Option A: Tower victory unlocks the branch for ALL schools (global unlock)
- Option B: Tower victory unlocks the branch only for the school you played (per-school)
- **Recommended**: Option A (global). Beating Air Tower with any character unlocks Air branches for everyone. This rewards exploration and prevents tedious per-character grinding.

**What the player sees**:
```
Before beating Air Tower:
  Fire tree: [Tier 1] → [Tier 2] → [Tier 3]
  (no branches visible)

After beating Air Tower:
  Fire tree: [Tier 1] → [Tier 2] → [Tier 3]
                              |
                         [Fire→Air] ← NEW! "You discovered the connection
                              |        between fire and wind."
                         [Air +1 energy]
                              |
                         [Fire+Air spells in rewards]
```

### Layer 3: Secondary Type Emergence (Combining Two Primaries)

**Trigger**: Play a run where you USE both primary types of a secondary combination.

**Example**:
- Player has Fire→Air branch unlocked
- In a run, they invest in both Fire and Air, casting spells of both types
- At some threshold (e.g., cast 5+ cross-type Fire+Air spells): **Electric** emerges
- In-game moment: visual/audio flourish — "You've discovered Electric!"
- On future runs: Electric gate appears in the progression tree

**Force-Casting** (before full unlock):
```
Electric spell costs 1 Electric energy
→ Without Electric energy: pay 1 Fire + 1 Air instead (2 for 1, inefficient)
→ With Electric energy (via tree node or instrument): pay 1 Electric (efficient)
```

This lets players taste secondary types before fully unlocking them. The inefficiency creates desire: "I want to unlock Electric energy directly so this costs less."

### Layer 4: Tertiary Depths

**Trigger**: Deep mastery conditions — secondary type mastery + specific achievements.

**Example path to Radioactive** (Fire's tertiary):
1. Master Fire school (beat Fire tower at mastery level 3+)
2. Unlock Metal (Fire+Earth secondary) and reach Metal depth 3 in progression tree
3. Find the Geiger Counter instrument in a run
4. Radioactive branch appears in Fire's progression tree

Tertiary types are endgame content. They should feel like a significant achievement, not something every player reaches casually.

### Layer 5: Augmenters (Endgame)

**Types**: Light/Dark, Time/Space — outside the normal type hierarchy.

**Unlock conditions**: Require mastery across multiple tertiary types. These represent the pinnacle of scientific understanding.

**Design TBD** — augmenters are the "what comes after endgame?" answer. They modify how other types work rather than being types themselves.

## Character Unlocks

### Defeating a Head Wizard → Playable Character

When you defeat a tower's head wizard, that wizard becomes available as a playable character for future runs.

**What changes when playing as an unlocked wizard**:

| Aspect | Generic Character | Unlocked Wizard |
|--------|------------------|-----------------|
| **Starting energy** | 3 of school type | 3 of wizard's type + potential bonuses |
| **Starter relic** | Generic school relic | Wizard-specific relic based on their scientific contribution |
| **Type mastery** | Standard damage | +10% damage with wizard's type |
| **Type weakness** | Standard vulnerability | +15% damage taken from counter types |
| **Starter deck** | Generic school spells | Signature spells themed to the wizard's specific philosophy |

**Example — Playing as Lavoisier (Fire Head Wizard)**:
- Starter relic: "Conservation of Mass" — when a spell is exhausted, gain 1 energy of its type
- Bonus: Fire spells deal +10% damage
- Weakness: Water spells deal +15% more damage to you
- Starter spells: Fire spells focused on combustion mechanics

### Pupil Sub-Branches

After defeating both pupils in a tower, the player can choose one to align with. This modifies their sub-archetype within the school.

**Example — Fire School**:
- **Align with Joule (Mechanical Energy)**: Sustained damage bonuses, energy efficiency
- **Align with Fraunhofer (Solar Fire)**: Burst damage bonuses, AoE enhancements

Pupil alignment persists across future runs with that school. Can be changed by re-defeating the tower.

## School Mastery (Ascending Difficulty)

Per-school difficulty levels, similar to StS's Ascension but tracked independently per school.

### How It Unlocks

Beat a tower → unlock Mastery Level 1 for that tower's school. Beat it again at Level 1 → unlock Level 2. Etc.

### Mastery Levels

| Level | Modifier | Design Intent |
|-------|----------|---------------|
| 1 | Counter-type enemies deal +10% damage | Punishes ignoring weaknesses |
| 2 | Start with 1 less energy of your school type (2 instead of 3) | Tighter resource management |
| 3 | Elites always include a counter-type enemy | Forces build diversity |
| 4 | Progression tree nodes cost 25% more XP | Slower type expansion |
| 5 | Boss gains a third phase (composition-type attacks) | Deep type knowledge test |
| 6 | Enemy groups always have 1 extra enemy | Sustained combat pressure |
| 7 | Shops cost 20% more | Resource scarcity |
| 8 | Fewer rest nodes on the map | Less recovery opportunity |
| 9 | Enemies have enhanced movesets | Pattern recognition |
| 10 | Fight two bosses at the tower's summit | Ultimate test |

### Per-School Independence

Mastering Fire Tower (Level 10) does NOT affect Earth Tower difficulty. Each school is a separate challenge track. This creates 4 (eventually 16) independent mastery goals.

## Persistence Storage

Meta-progression data stored in `localStorage`:

```javascript
{
  unlockedWizards: ['lavoisier', 'newton'],
  towerVictories: {
    fire: { bestMastery: 3, timesBeaten: 5 },
    earth: { bestMastery: 1, timesBeaten: 2 },
  },
  treeBranches: {
    // Global: which cross-type branches are unlocked for all schools
    air: true,    // Air branch available in all school trees
    earth: true,  // Earth branch available
  },
  secondaryDiscoveries: {
    electric: true,  // Electric (Fire+Air) has been discovered
  },
  pupilAllegiances: {
    fire: 'joule',  // Aligned with Joule in Fire school
  },
  totalRuns: 15,
  totalVictories: 7,
}
```

## Open Questions

- [ ] Should tower victories unlock branches globally (for all schools) or per-school?
- [ ] How many runs should it take to unlock a secondary type? (Feels like 3-5 runs)
- [ ] Should force-casting be available from the start, or unlocked via meta-progression?
- [ ] Can you reset meta-progression? (New game+? Prestige system across the whole meta?)
- [ ] Should there be achievements/milestones with specific rewards?
- [ ] How does pupil allegiance mechanically differ from the generic school? (Needs design)
- [ ] What's the "final" meta-goal? Beat all towers at max mastery? Unlock all tertiaries?
