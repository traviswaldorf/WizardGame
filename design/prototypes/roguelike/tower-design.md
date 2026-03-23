# Roguelike — Tower Design

> **Status**: Exploring

## Overview

Each run takes place in a **tower** themed by an elemental type. The tower determines the encounter composition, reward pool, and final boss. Towers are NOT gyms — they don't restrict enemies to one type. The tower's type INFLUENCES encounters, creating a thematic through-line while maintaining variety.

## Tower Selection

After choosing a school, the player selects which tower to climb. Initially only primary towers are available (Fire, Earth, Water, Air). Secondary and tertiary towers unlock through meta-progression.

**Tower choice creates the run's identity**:
- School = your type (what you bring)
- Tower = the challenge type (what you face)
- Together they define the loot pool, strategic tension, and eventual secondary type discovery

## Tower Structure

### Floor Layout (configurable, default 12 floors + boss)

| Floors | Content | Enemy Composition |
|--------|---------|-------------------|
| 1-3 | Standard encounters | Mostly tower-type + some neutral. Learning the tower's element |
| 4 | **Mid-boss: Pupil A** | Tower school's first pupil. Tests one aspect of the type |
| 5-7 | Harder encounters | Tower-type + counter-type enemies appear. Mixed groups |
| 8 | **Mid-boss: Pupil B** | Tower school's second pupil. Tests the contrasting aspect |
| 9-11 | Elite-heavy | Diverse multi-type groups. Composition-type enemies. Full build test |
| 12 | **Final boss: Head Wizard** | Multi-phase fight. Uses tower type + counter abilities |

### Enemy Composition by Floor Tier

**Early (floors 1-3)**: Teaching encounters
- 60% tower-type enemies, 20% neutral, 20% random primary
- Groups of 1-2 enemies
- Purpose: learn the tower's element, fight easy battles while building deck

**Mid (floors 5-7)**: Adaptation encounters
- 40% tower-type, 30% player's counter-type, 30% mixed
- Groups of 2-3 enemies
- Purpose: force the player to handle unfavorable matchups

**Late (floors 9-11)**: Mastery encounters
- Mixed composition — any primary or secondary type
- Groups of 2-4 enemies, including elites
- Composition-type enemies appear (Metal, Plant, Ice, Electric)
- Purpose: test the full build — targeting, AoE, type effectiveness all matter

### Example: Fire Tower, Water School Player

| Floor | Enemies | Strategic Tension |
|-------|---------|-------------------|
| 1 | 2 Fire elementals | Easy — Water counters Fire. Learn the basics |
| 2 | 1 Fire + 1 Earth | Earth is neutral. Targeting decision |
| 3 | 3 Fire (one stronger) | Priority targeting — kill the strong one first? |
| 4 | **Joule (Fire Pupil A)** | Mid-boss. Sustained damage. Need enough block/healing |
| 5 | 1 Electric + 1 Fire | Electric counters Water! Dangerous. Kill Electric first |
| 6 | 2 Earth + 1 Air | Neither type is your strength. Tests adaptability |
| 7 | 1 Metal elite | Composition type. Tough. Rewards are valuable |
| 8 | **Fraunhofer (Fire Pupil B)** | Burst AoE. Need to survive big hits |
| 9 | 1 Fire + 1 Water + 1 healer | Complex tactical puzzle |
| 10 | 2 Metal + 1 Electric | Late-game composition enemies |
| 11 | 3 mixed elites | Everything you've built is tested |
| 12 | **Lavoisier (Fire Head Wizard)** | Multi-phase. Phase 1: Fire. Phase 2: adds counter-type |

## Boss Design

### Pupils as Mid-Bosses

Each school has two pupils representing contrasting philosophies. Their boss fights test different strategic dimensions.

| Tower | Pupil A | Fight Style | Pupil B | Fight Style |
|-------|---------|-------------|---------|-------------|
| **Fire** | Joule (Mechanical Energy) | Sustained: consistent damage each turn, rewards patience and block | Fraunhofer (Solar Fire) | Burst: big AoE every 3 turns, rewards timing and burst healing |
| **Earth** | Hutton (Deep Time) | Scaling: gains strength each turn, rewards fast kills | Wegener (Shifting Ground) | Adaptive: changes resistances, rewards type diversity |
| **Water** | Bernoulli (Current) | Tempo: fast attacks, debuffs your speed, rewards card draw | Pascal (Deep Pressure) | Pressure: escalating damage, rewards sustain and defense |
| **Air** | Boyle (Compression) | Control: reduces your hand size, rewards efficient high-cost cards | Coriolis (Wind) | Evasion: dodges attacks, rewards AoE and multi-hit |

### Head Wizard as Final Boss

Multi-phase fight. Each phase tests a different aspect:

**Phase 1**: The wizard uses their type's signature abilities. Straightforward but strong. Tests raw combat ability.

**Phase 2**: The wizard adds counter-type attacks against the PLAYER'S school type. Tests whether the player diversified beyond mono-type. A pure Fire deck fighting Lavoisier's Phase 2 (which adds Water attacks) will struggle — you need defensive answers to your weakness.

**Phase 3** (higher mastery levels only): The wizard uses composition-type abilities (secondary types formed from the tower type). Tests deep understanding of the type system.

### "Who's the Boss If I AM the Head Wizard?"

When replaying your own school's tower after unlocking the head wizard:
- Pupils and structure remain the same
- Final boss option 1: Fight yourself (proving ultimate mastery)
- Final boss option 2: Fight the scientist who disproved/superseded your theory (narrative of scientific progress)
- This is a future design exploration — for now, same tower structure applies

## Reward Pool by Tower

The tower determines what types of spells appear in combat rewards:

| Reward Tier | Types Offered | When |
|-------------|---------------|------|
| **Always** | Player's school type | From floor 1 |
| **Always** | Tower's type (single-type spells) | From floor 1 |
| **After branching** | Cross-type (school + tower) | After investing in tower's branch on tree |
| **After gate** | Composition type (school + tower → secondary) | After unlocking secondary gate |
| **Never** | Unrelated types | Random off-type spells never appear |

## Tower Variety (Future)

### Primary Towers (available at start)
Fire, Earth, Water, Air — standard structure with head wizard + 2 pupils

### Secondary Towers (unlock via meta-progression)
Metal, Plant, Ice, Electric — harder, with composition-type enemies from the start. Boss is the secondary type's head wizard.

### Tertiary Towers (deep unlock)
Radioactive, Cosmic, etc. — endgame content. Requires significant meta-progression to access.

### Special Towers (future exploration)
- **Mixed Tower**: Random type each floor. No guided loot pool. Pure adaptation test.
- **Counter Tower**: Every floor uses the player's counter type. Extreme difficulty.
- **Discovery Tower**: Unknown types until encountered. Maximum surprise.

## Open Questions

- [ ] Should tower selection be random (like StS boss visibility) or player-chosen?
- [ ] How many floors for "quick test" vs "full" runs? (Current config: 3-15)
- [ ] Should pupils drop unique rewards (instruments, special spells)?
- [ ] How does the tower theme visually manifest on the map? (Color-coded backgrounds? Type symbols?)
- [ ] Should the tower have a narrative/lore reason for existing? (Wizard schools as literal towers?)
