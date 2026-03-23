# Decision: Roguelike School Runs

> **ID**: 008
> **Status**: Exploring
> **Date Opened**: 2026-03-22
> **Date Decided**: —
> **Related Docs**: [wizard-schools.md](../reference/scientists/wizard-schools.md), [counters.md](../mechanics/counters.md), [balance-philosophy.md](../philosophy/balance-philosophy.md), [005-incremental-progression-trees](005-incremental-progression-trees.md), [slay-the-spire reference](../reference/games/slay-the-spire/relevance.md)

## Context

The wizard school system maps 16 types to real scientists, each with a head wizard and two pupil sub-branches. The type system has detailed weakness/resistance relationships grounded in real physics. We have strategic archetypes (aggressive, defensive, flow, control) and cluster memberships. But we don't yet have a game mode that makes players *live inside* a single type's identity and feel the weight of its strengths and weaknesses.

Slay the Spire demonstrates that a roguelike run structure — where each playable character has a fundamentally different resource and playstyle — creates deep replayability and forces players to learn the system from multiple angles. Our wizard school structure is a natural fit: 16 types × 3 wizards each (head + 2 pupils) = up to 48 distinct playable identities.

This decision explores how a roguelike run mode would work, how players unlock wizard characters, how type weaknesses/resistances create meaningful difficulty, and how equipment/instruments fit in.

## The Core Loop

```
Choose a wizard school → Progress through elemental encounters →
Fight pupils along the way → Face the head wizard as final boss →
Defeating them unlocks that wizard as a playable character →
Play a run AS that wizard (with their type's pros/cons) →
Unlock equipment that persists across runs
```

## Options

### Option A: Linear School Gauntlet

**Description**: Each run is a single school's gauntlet. The player picks (or is assigned) a target school and faces increasingly difficult encounters themed around that type. The two pupils serve as mid-bosses, and the head wizard is the final boss. Encounters along the way use types that interact with the school's type — some favorable, some hostile.

**Run structure**:
- **Act 1 — Fundamentals**: Face types your school is strong against. Learn your type's offensive identity. Mid-boss: the school's first pupil (e.g., for Fire school, face Joule — School of Mechanical Energy).
- **Act 2 — Adversity**: Face types your school is weak against. Learn to play around your weaknesses. Mid-boss: the school's second pupil (e.g., Fraunhofer — School of Solar Fire).
- **Act 3 — Mastery**: Mixed encounters that test both strengths and weaknesses. Final boss: the head wizard (e.g., Lavoisier — School of Combustion).

**Pros**:
- Clean narrative arc: learn your strengths → confront your weaknesses → prove mastery
- Pupils as mid-bosses gives them mechanical identity beyond lore
- Naturally teaches the counter system through play
- 16 schools = 16 distinct runs with different encounter compositions

**Cons**:
- Linear structure limits replayability within a single school
- Doesn't leverage branching/route-choice (a core Slay the Spire strength)
- May feel repetitive if encounter types are predictable

**Interactions**: Connects directly to counter relationships in `counters.md`. Each school's run is shaped by what counters it and what it counters.

**Inspiration**: Slay the Spire's 3-act structure, but with encounters themed by type rather than randomized.

---

### Option B: Branching Elemental Map

**Description**: Each run presents a branching map where nodes are typed encounters. The player starts with a basic spell set and builds toward a school by choosing which branches to follow. The map branches along the type hierarchy — primary → secondary → tertiary — and the player's path determines which school's boss they ultimately face.

**Run structure**:
- **Tier 1 — Primary Crossroads**: Choose between Fire, Earth, Water, Air paths. Early encounters are straightforward. Choosing Fire puts you on a path toward Fire, Metal (Fire+Earth), Electric (Fire+Air), or Radioactive (Fire's tertiary).
- **Tier 2 — Secondary Branching**: Paths fork into secondary/tertiary types. Choosing Fire → then Earth-adjacent encounters leads toward Metal school. Choosing Fire → then Air-adjacent leads toward Electric school.
- **Tier 3 — School Convergence**: Path converges on a specific school. Face the two pupils, then the head wizard.

**Map nodes**:
- **Type Encounters**: Combat against a specific element. Rewards are spells/cards of that type.
- **Discovery Nodes**: Combine two types you've collected to unlock a secondary/tertiary spell. Mirrors the "Discovery as Magic" pillar.
- **Instrument Forges**: Acquire or upgrade equipment (see Equipment section below).
- **Rest/Study Sites**: Heal or upgrade a spell.
- **Mystery Nodes**: Random events — could be beneficial, harmful, or offer a choice.

**Pros**:
- Branching paths create route-choice strategy (a proven Slay the Spire strength)
- Path naturally teaches the type hierarchy (primary → secondary → tertiary)
- Discovery nodes embody the "Discovery as Magic" pillar
- Multiple routes to the same school boss = high replayability per school
- Player agency in which school they're heading toward

**Cons**:
- More complex to design and balance
- Risk of "optimal path" emerging that undermines exploration
- May dilute type identity if the player collects too many types along the way

**Interactions**: Deeply connected to the type system hierarchy. The map IS the type system made spatial. Also connects to [005-incremental-progression-trees](005-incremental-progression-trees.md) — the branching map could be a gameplay version of the skill tree.

**Inspiration**: Slay the Spire's branching map + Infinite Craft's combination discovery + our type hierarchy.

---

### Option C: Hybrid — School Challenge with Branching Interior

**Description**: The player selects a target school (or unlocks them in sequence). Within that school's run, the map branches, offering different routes through typed encounters. The school determines the boss and overall theme, but the path through it is player-chosen.

**Run structure**:
- Player selects a school (e.g., Electric — Faraday's School of Current)
- Map generates with encounters biased toward types that interact with Electric: Fire and Air (its parent primaries), Water (conductor synergy), Earth (insulator counter), Metal (circuit synergy), Magnetic (tertiary pair)
- Branching paths let the player choose: lean into synergies (Fire+Air encounters to strengthen Electric spells) or face counters (Earth encounters for harder fights but better rewards)
- Pupil mid-bosses at act breaks: Volta (School of Stored Lightning) and Ampere (School of the Living Current)
- Final boss: Faraday

**The "risk vs reward" route choice**:
- **Synergy routes** (types your school is strong against or combines with): Easier fights, spell rewards that complement your type. Lower risk, steady build.
- **Counter routes** (types your school is weak against): Harder fights, but reward equipment/spells that patch your weaknesses. High risk, but covers vulnerabilities for the boss fight.
- **Neutral routes**: Moderate difficulty, general-purpose rewards.

**Pros**:
- Best of both: school-themed identity + route-choice agency
- Counter routes create a meaningful risk/reward decision grounded in the type system
- Naturally creates varied runs even within the same school
- "Do I shore up weaknesses or double down on strengths?" is a compelling strategic question

**Cons**:
- Most complex to design
- Requires careful tuning of encounter difficulty by type matchup
- Risk of counter routes being strictly necessary (removing real choice)

**Interactions**: Uses the counter system as the primary difficulty lever. Connects to balance philosophy's "element exclusivity reward" — doubling down on your type is powerful but leaves you vulnerable.

**Inspiration**: Slay the Spire's branching map with encounter difficulty informed by type matchups rather than randomized tiers.

---

## Character Unlock System

Regardless of which option above, the character unlock loop works as follows:

### Defeating a School → Unlocking the Wizard

When you defeat a school's head wizard (e.g., Lavoisier for Fire), you unlock that wizard as a **playable character** for future runs. Playing as a wizard means:

**Pros of the unlocked wizard**:
- **Type mastery**: Spells of their type are stronger (bonus damage, reduced cost, enhanced effects)
- **Starter spells**: Begin each run with signature spells from their school
- **School passive**: A unique passive ability reflecting their scientific contribution (e.g., Lavoisier: "Conservation of Mass" — when a spell is destroyed/exhausted, gain a basic spell of the same type back)
- **Pupil allegiance**: After defeating both pupils, choose one to align with. This determines your sub-archetype within the school.

**Cons of the unlocked wizard**:
- **Type weakness amplified**: Types that counter yours deal increased damage or have enhanced effects against you
- **Type resistance reduced**: Your resistances against types you normally resist are weaker than a generic character's
- **Spell restrictions**: Reduced effectiveness when using spells outside your type family (primaries can use their secondaries at reduced power; tertiaries are locked without specific instruments)
- **Counter vulnerability**: Enemies of your counter type appear more frequently and are more dangerous

**Example — Playing as Marie Curie (Radioactive)**:
- **Pro**: Radioactive spells have enhanced half-life mechanics (damage-over-time persists longer, decay chains trigger more reliably)
- **Pro**: Starts with Radioactive starter spells (e.g., "Alpha Decay," "Chain Reaction")
- **Pro**: Passive — "Radioactive Decay": Damaged enemies continue taking small damage each turn (half-life mechanic)
- **Con**: Water and Cosmic types deal 25% more damage to you (Radioactive's counters)
- **Con**: Non-Nuclear spells (outside Fire/Radioactive family) cost 1 extra energy
- **Con**: Cosmic encounters appear more frequently in your runs

This creates a **meaningful identity**: playing as Marie Curie *feels* different from playing as Faraday. Your strengths push you toward certain strategies, your weaknesses force you to adapt.

### Pupil Sub-Branches

Each school has two pupils representing contrasting philosophies. After defeating both, the player chooses one, which modifies their playstyle:

**Example — Electric School (Faraday)**:
- **Volta (Stored Lightning)**: Favors potential energy — spells that charge up over turns and release in bursts. Defensive/patient Electric playstyle.
- **Ampere (Living Current)**: Favors flow — spells that deal continuous damage and chain between targets. Aggressive/tempo Electric playstyle.

This mirrors Slay the Spire's emergent archetypes but makes them a deliberate choice rooted in scientific philosophy. The tension between pupils (potential vs flow, structure vs chaos, etc.) IS the strategic diversity within each type.

## Equipment / Instruments

Equipment draws from the existing instruments concept in [005-incremental-progression-trees](005-incremental-progression-trees.md) and maps to Slay the Spire's relic system.

### Acquisition
- **Run rewards**: Found during runs at Instrument Forge nodes, elite encounters, and boss chests
- **Crafting**: Combine type-specific materials found during runs
- **Persistent unlock**: Once discovered, an instrument enters the pool for future runs (Slay the Spire's card/relic unlock model)

### Instrument Design Philosophy

Instruments are real scientific tools reimagined as magical equipment. They should:
1. **Have type affinity**: Each instrument has a primary type alignment
2. **Create tradeoffs**: Powerful instruments come with type-specific costs (boss relic model)
3. **Enable cross-type play**: Some instruments let wizards access spells outside their type family, at a cost
4. **Reflect real science**: The instrument's effect should connect to what it actually does

### Example Instruments

| Instrument | Type | Effect | Tradeoff | Science Basis |
|-----------|------|--------|----------|---------------|
| **Voltaic Pile** | Electric | +1 energy per turn when playing Electric spells | Non-Electric spells cost +1 | Volta's first battery |
| **Crucible** | Metal/Fire | Metal spells gain "Forged" (persist 1 extra turn) | Take 1 damage when casting non-Metal spells | Alchemical vessel for extreme heat |
| **Leyden Jar** | Electric | Store unused energy between turns (up to 3) | Lose all stored energy if hit by Water spell | Early capacitor |
| **Geiger Counter** | Radioactive | Reveal hidden enemy weaknesses | Radioactive damage you deal is reduced by 10% | Radiation detection |
| **Fresnel Lens** | Light | Amplify next spell's effect by 50% | 2-turn cooldown, vulnerable during cooldown | Light-focusing optics |
| **Barometer** | Air | Predict next 3 encounters on the map | Air spells deal 15% less damage | Atmospheric pressure measurement |
| **Calorimeter** | Heat | Convert blocked damage into Heat energy (1:1) | Max HP reduced by 10% | Heat measurement device |
| **Spectroscope** | Light/Fire | Identify the type composition of any enemy spell before it resolves | Costs 1 energy to activate | Elemental analysis tool |

### Equipment Slots

<!-- TBD: How many instruments can a wizard carry? Options: -->
- [ ] Fixed slots (e.g., 3 slots, like Slay the Spire's unlimited relics but with a cap)
- [ ] Slot-per-type (1 instrument per type family you've invested in)
- [ ] Unlimited but with diminishing returns (each additional instrument of the same type is weaker)

## Type Weakness / Resistance Integration

This mode is where the type counter system *comes alive*. In the base card/board game, type matchups are one factor among many. In roguelike runs, they become the primary difficulty lever.

### How Weaknesses Shape Runs

**When playing as a specific type wizard**:
- Encounters against your counter types are mechanically harder (enemies deal more damage, have more HP, or gain bonus effects)
- Encounters against types you counter are easier (your spells deal bonus damage, cost less, or have enhanced effects)
- Neutral encounters play at standard difficulty

**This creates the core strategic tension**: Do you path through easy (favorable matchup) encounters to build strength, or hard (counter matchup) encounters to earn better rewards and prepare for the boss?

### Boss Weakness Testing

School bosses should test whether the player understands their *own type's weaknesses*:

| School Boss | Tests |
|-------------|-------|
| **Lavoisier (Fire)** | Can you handle Water-based attacks? Do you have answers to being extinguished? |
| **Newton (Earth)** | Can you deal with erosion (Water) and root-breaking (Plant)? |
| **Archimedes (Water)** | Can you survive freezing (Ice) and electrolysis (Electric)? |
| **Torricelli (Air)** | Can you function in a vacuum (Cosmic) and survive lightning (Electric)? |
| **Faraday (Electric)** | Can you ground yourself (Earth) and resist field disruption (Magnetic)? |
| **Darwin (Plant)** | Can you survive burning (Fire) and decay (Ghost/Poison)? |
| **Mohs (Metal)** | Can you withstand resonance shattering (Crystal/Sound)? |
| **Kelvin (Ice)** | Can you survive thermodynamic reversal (Heat) and sustained fire? |

**Key design insight from Slay the Spire**: The boss is visible from the start of the run. The player can prepare. This transforms the boss from a surprise into a *strategic target* — every decision during the run is informed by "what do I need to beat the boss?"

### Resistance as Character Identity

Playing as a type wizard means your resistances define your comfort zone:

- **Fire wizard**: Resistant to Plant, Ice → these encounters feel easy, almost relaxing
- **Fire wizard**: Weak to Water, Cosmic → these encounters are tense, resource-draining
- **Fire wizard**: Neutral to Earth, Air, Electric → standard difficulty

This asymmetry means the same map feels completely different depending on which wizard you're playing. A Water encounter that was trivial as a Fire wizard becomes terrifying as an Electric wizard. **The type system creates 16 different games from the same content.**

## Meta-Progression Across Runs

### School Mastery Track (Per-School)

Each school has a mastery track that increases across runs (similar to Slay the Spire's ascension, but per-school rather than per-character):

| Level | Unlock |
|-------|--------|
| 1 | Complete first run against this school's boss |
| 2 | Unlock the head wizard as playable character |
| 3 | Unlock pupil sub-branch selection |
| 4–5 | New instruments enter the run pool |
| 6–7 | New spells enter the run pool |
| 8–10 | Ascension-style difficulty modifiers (counter types deal more damage, fewer favorable encounters, boss gains additional phases) |

### Cross-School Unlocks

Mastering multiple schools unlocks cross-type content:

- **Fire mastery + Earth mastery** → Metal school unlocked (secondary type requires both parent primaries)
- **Metal mastery + reaching tertiary understanding** → Crystal school unlocked
- **All 4 primary schools mastered** → Augmenter types (Time/Space, Light/Dark) become available as encounter modifiers

This mirrors the type hierarchy itself: you must understand the fundamentals before accessing advanced types.

## Relationship to Other Game Modes

This roguelike mode can coexist with other modes:

- **Core card/board game** (multiplayer competitive): The primary game. Roguelike mode is a single-player companion.
- **Incremental progression** ([Decision 005](005-incremental-progression-trees.md)): Could share the type energy / skill tree system. Roguelike runs could *generate* type energy for the incremental mode, or incremental progress could unlock starting bonuses for runs (like Neow's blessing).
- **Discovery experience**: Roguelike runs are a vehicle for first-time type discovery. Players learn counters, synergies, and type identities through play rather than reading docs.

## Recommendation

Leaning toward **Option C (Hybrid)** — school-themed runs with branching interior maps. It captures the best of Slay the Spire's proven route-choice mechanic while grounding every decision in our type system. The "synergy route vs counter route" risk/reward choice is a natural translation of type matchups into map navigation.

The character unlock loop (defeat boss → play as that wizard → feel the pros/cons of that type) is the strongest connective tissue between our type system, wizard school lore, and actual gameplay. It makes the counter system matter in a way that a flat multiplayer game can't — when you ARE a Fire wizard, Water isn't just a bad matchup, it's your nemesis.

## Playtest Notes

| Date | Option Tested | Observation | Verdict |
|------|---------------|-------------|---------|
|      |               |             |         |

## Decision

**Chosen**: —
**Rationale**: —
