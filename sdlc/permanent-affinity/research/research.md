# Permanent Affinity — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: Splendor (permanent gem discounts)
> **Related Slugs**: production-cascades, discovery-chains

## What This Mechanic Does

In Splendor, every purchased development card permanently provides +1 of its gem color for all future purchases. A card showing a green gem bonus means every card you buy from that point forward costs 1 fewer green gem. These discounts stack indefinitely — buy 3 green-bonus cards and you have a permanent 3-green discount. This is the core engine: early cheap cards (Tier 1) provide small bonuses that compound, eventually making expensive Tier 2 and Tier 3 cards free to purchase. The player never loses these bonuses; they accumulate for the rest of the game.

Key properties of the Splendor model:
- **Permanent and passive** — no activation cost, no triggers, no conditions. Once purchased, the bonus is always active.
- **Linear accumulation** — each card gives exactly +1 of one color. No exponential scaling built into individual bonuses.
- **Open information** — all purchased cards (and thus all bonuses) are visible to all players. Opponents can calculate exactly what you can afford.
- **Color-specific** — each bonus applies only to one gem color. There is no "buy a red card, get a blue discount." The engine is type-locked.
- **Threshold effects** — Noble tiles auto-trigger when your permanent bonuses reach specific thresholds (e.g., 4 green + 4 blue). This creates milestone racing on top of the discount engine.
- **Gold wildcards** — Gold tokens (earned by reserving cards) substitute for any gem color, providing flexibility without permanent discounts.

The strategic arc: spend tokens early to buy cheap cards for bonuses, build bonuses until expensive cards become free, race to 15 VP. The engine IS the game — there is no other scoring mechanism besides card VP and noble VP.

## Our Mapping

### Primary Types as Gem Colors

Our 4 primary type tokens (Fire, Earth, Water, Air) map directly to Splendor's 5 gem colors as the shared scarce resource pool. Light tokens map to Splendor's gold wildcards — strictly limited, universally flexible, earned through specific actions (reserving/researching spells). This mapping is explicitly called out in decision 006 as "our strongest mapping."

### Affinity Through the Type Hierarchy

Playing a spell grants permanent affinity in that spell's type(s), reducing future costs for spells of matching types.

**Primary spells (Tier 1 / Era 1):**
Single-type spells. Playing a Fire spell grants +1 permanent Fire affinity. Straightforward 1:1 mapping to Splendor. These are the cheap engine-starters — low VP, but the affinity compounds.

**Secondary spells (Tier 2 / Era 2):**
Dual-type spells composed of two primaries. Metal = Fire + Earth. Plant = Earth + Water. Ice = Air + Water. Electric = Fire + Air. This is where the mapping gets interesting and a core design tension emerges (see Design Tensions below). A Metal spell could grant:
- Option A: +1 Metal affinity (a new secondary affinity track, only usable for other Metal-cost spells)
- Option B: +1 Fire affinity AND +1 Earth affinity (the spell's component primaries, making primary tokens cheaper too)
- Option C: +1 Metal affinity that counts as either Fire or Earth when paying costs (a flexible discount)

**Tertiary spells (Tier 3 / Era 3):**
Each tertiary type is the "dark pair" of a primary or secondary. Radioactive is Fire's dark side. Crystal is Metal's dark side. Tertiary spells are the most expensive and highest-VP cards. Affinity from tertiaries could:
- Feed back into the parent type (Radioactive affinity counts as Fire)
- Create a separate tertiary affinity track (only useful for other tertiary spells or for meeting wizard school thresholds)
- Provide a "wild" half-affinity (1 tertiary affinity = 0.5 of any primary)

### Type Composition Reference (from database)

| Secondary | Components | Composition |
|-----------|------------|-------------|
| Metal | Fire + Earth | Forging |
| Plant | Earth + Water | Growth |
| Ice | Air + Water | Freezing |
| Electric | Fire + Air | Lightning |

| Tertiary | Dark Pair Of | Parent |
|----------|-------------|--------|
| Radioactive | Fire | Fire |
| Cosmic | Earth | Earth |
| Poison | Water | Water |
| Sound | Air | Air |
| Crystal | Metal | Metal |
| Ghost | Plant | Plant |
| Heat | Ice | Ice |
| Magnetic | Electric | Electric |

### Wizard Schools as Noble Tiles

When a player's permanent affinities reach specific thresholds, wizard school heads "recognize" and recruit them — worth VP and claimed exclusively (first to qualify). For example, the School of Combustion (Fire, headed by Lavoisier) might require Fire 4 + Earth 3 (a deep Fire specialist who has dabbled in metallurgy). This creates a racing dynamic on top of the affinity engine.

### Light as Wildcard Affinity

Light tokens function as gold wildcards — they can substitute for any primary type when paying spell costs. The question is whether Light should also exist as a *permanent* affinity. Decision 006 proposes Light tokens as shared, strictly limited (5 total), earned by reserving/researching spells. If permanent Light affinity exists, it would be the most powerful discount in the game (applies to everything), and would need to be extremely rare or expensive to earn.

## Design Tensions

### 1. Linear vs. Exponential Scaling

Splendor's discounts are strictly linear (+1 per card), but the *effect* is exponential because each discount makes the next purchase easier, which gives another discount, which makes the next purchase even easier. This is a soft exponential — the growth rate accelerates but each individual step is linear.

**Risk**: In our game, if secondary spells grant affinity in both component primaries (Option B above), a single Metal spell gives +1 Fire AND +1 Earth — effectively double the affinity of a primary spell. This could create a steeper exponential curve than Splendor, where late-game players snowball much harder.

**Mitigation options**: Secondary spells could cost more than primaries (already the case via tier escalation), grant only +1 of one component (player chooses), or grant +1 in the secondary type itself (which only applies to other secondary-cost spells, not primaries).

### 2. Runaway Leader Risk

The defining risk of any permanent-discount engine. The player who gets ahead in affinity can buy more cards, which gives more affinity, which lets them buy even more cards. Splendor mitigates this through:
- Token scarcity (taking tokens to buy early cards denies them to opponents)
- Noble racing (the leader might miss a noble because they over-specialized)
- Game length (Splendor ends fast — 15 VP triggers before runaway becomes extreme)

**Our mitigations to consider**:
- Draft denial (7 Wonders style) — you might not get the cards you want
- Era gating — you cannot buy secondary spells until Era 2 regardless of affinity
- Storm comparison — the runaway engine-builder might be weak in storms (military equivalent)
- School thresholds as catch-up — schools that reward type *diversity* rather than depth

### 3. Interaction with Light Wildcards

If Light tokens can substitute for any type, and permanent affinity reduces costs, how do they interact? Splendor's rule: gold tokens are spent first, then permanent discounts reduce remaining costs, then you spend regular gem tokens for the rest. Light should probably work the same way — Light tokens fill gaps that your affinity doesn't cover.

But if Light *affinity* exists as a permanent wildcard discount, it could trivialize the type system entirely. A player with 3 permanent Light affinity effectively has 3 of every color — the type-specific strategy collapses. This argues strongly against permanent Light affinity, or for making it extremely rare (e.g., only from Tier 3 capstone cards or wizard school stages).

### 4. Secondary Type Affinity: Dual or Singular?

This is the single most important design question for this mechanic. When you play a Metal spell, what affinity do you get?

| Option | Pros | Cons |
|--------|------|------|
| **+1 Metal only** | Clean, simple, creates distinct secondary economy | Secondary affinity only useful for other secondary spells — narrow |
| **+1 Fire + 1 Earth** | Feeds back into primary engine, feels like "learning the components" | Double value per card, accelerates exponentially, blurs type identity |
| **+1 Metal (counts as Fire OR Earth)** | Flexible but not overpowered, rewards Metal investment | Complex to track, UI challenge |
| **+1 Fire OR +1 Earth (player chooses)** | Strategic choice, same value as primary spell | Loses the "Metal identity" — just a primary in disguise |

**Thematic lens**: The "Discovery as Magic" principle suggests that mastering Metal should feel like understanding *both* Fire and Earth at a deeper level — which argues for some form of dual affinity. But "A World of Interaction" suggests Metal should feel distinct from Fire+Earth — which argues for Metal as its own track.

### 5. Does Affinity Feed Upward or Downward?

In Splendor, gem bonuses only go one direction — they reduce costs. In our hierarchical type system, we need to decide:
- Does Fire affinity help pay for Metal spells (upward — primary helps secondary)?
- Does Metal affinity help pay for Fire spells (downward — secondary helps primary)?
- Does Radioactive affinity help pay for Fire or Metal spells (tertiary helps parent)?

Splendor has no hierarchy, so this is new territory. The Progression principle suggests affinity should primarily feed *upward* — mastering basics enables advanced discoveries. Primary affinity reduces secondary costs (Fire affinity helps buy Metal spells). But secondary affinity should NOT reduce primary costs (knowing Metal doesn't make basic Fire cheaper — that's backwards scientifically).

## Interaction with Other Mechanics

### Production Cascades

If production cascades (Wingspan-style row activations) exist alongside permanent affinity, there's a risk of double-counting. Affinity is a *passive* cost reduction; production is an *active* resource generation. They serve different roles:
- **Affinity** = "I know this type well, so it's cheaper for me" (Splendor engine)
- **Production** = "My lab generates this type each era/turn" (Wingspan engine)

Both existing simultaneously could be too strong. Options:
- Affinity replaces production (Splendor-pure model — no active generation, just cheaper costs)
- Affinity and production are separate tracks, but affinity is capped (e.g., max +3 per type)
- Affinity is the "Splendor lens" mechanic; production cascades are the "Wingspan lens" mechanic; the game picks one or blends them

### Discovery Chains

Discovery chains (7 Wonders-style free builds from prerequisites) interact naturally with affinity. In 7 Wonders, free build chains bypass costs entirely if you have the prerequisite card. Affinity reduces costs incrementally. These could coexist:
- Discovery chains provide *free* upgrades along specific paths (Thermometer -> Calorimeter -> Thermal Reactor)
- Affinity provides *general* cost reduction across a type

This actually creates a nice strategic fork: do you invest in a narrow chain (guaranteed free upgrades) or broad affinity (general cost reduction)?

### School Board Stages

Decision 006 proposes that schools provide starting affinity bonuses (e.g., Fire school starts with +1 permanent Fire). School stages could grant additional affinity as rewards. This maps to 7 Wonders' wonder stages — each stage built gives a specific bonus.

School affinity bonuses could serve as:
- A head start in one type direction (nudge, not lock-in)
- Catch-up mechanism (later stages grant larger affinity jumps)
- Diversification incentive (stages require types outside your school's primary)

### Instrument-Wizard Pairings

Instruments in the Everdell model are persistent engine pieces. If instruments also provide affinity, they overlap with spells. Better to differentiate:
- **Spells** provide permanent type affinity (Splendor discount engine)
- **Instruments** provide production or trigger effects (Wingspan/Everdell engine)
- Playing the matching wizard is free if you have the instrument (Everdell Construction-Critter pairing) — this is a *different* kind of discount, not affinity-based

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Building affinity feels like "the more you study Fire, the more intuitive it becomes." Discovering that your accumulated affinity suddenly makes an expensive spell free is a genuine eureka moment. The threshold effects (wizard school recognition at specific affinity levels) reward deep investment with dramatic payoffs. However, the mechanic is fundamentally mathematical (counting +1s), which risks feeling like bookkeeping rather than discovery if not presented well. |
| A World of Interaction | Moderate | Affinity itself is a solo engine — your discounts don't interact with opponents' discounts. Interaction comes indirectly through token scarcity (taking tokens denies them) and wizard school racing (first to threshold claims the school). The type hierarchy adds interaction depth that Splendor lacks — Fire affinity enabling Metal spells creates cross-type connections. But the core discount mechanic is inherently low-interaction. |
| Progression and Advancement | Very Strong | This is the mechanic's headline strength. The arc from "spending 5 tokens on a basic spell" to "casting a tertiary spell for free because your affinity covers the entire cost" directly mirrors the Progression principle. Primary affinity enables secondary spells which enable tertiary spells — the tiered advancement is baked into the type hierarchy. Each card played makes you permanently stronger. |

## Open Questions

- [ ] Does a Metal spell grant +1 Metal affinity, +1 Fire + 1 Earth, or +1 of a component (player's choice)? This is the single most impactful design decision for the mechanic.
- [ ] Does affinity flow upward only (primary helps pay for secondary/tertiary) or bidirectionally?
- [ ] Should permanent Light affinity exist at all, or should Light only function as spendable wildcard tokens?
- [ ] Is there a cap on affinity per type (e.g., max +5 Fire affinity), or does it grow without bound like Splendor?
- [ ] How does affinity interact with production cascades — do both systems coexist, or does the game choose one per "lens"?
- [ ] What affinity thresholds trigger wizard school recognition? How many schools compete for first-to-qualify?
- [ ] Should tertiary affinity feed back into its parent type, or remain a separate track?
- [ ] In the sandbox prototype, how is affinity tracked in the UI? Per-card icons? A running total panel? Both?
- [ ] Does discarding/selling a spell remove its affinity contribution, or is affinity truly permanent and irrevocable?
- [ ] How does era gating interact with affinity — can you "over-invest" in primary affinity during Era 1 and trivialize Era 2?

## Sources and References

**Decision 006 — Multiplayer Economy & Engine-Building Framework** (`design/decisions/006-multiplayer-economy-design.md`):
- **Splendor analysis (lines 78-98)**: Core loop, permanent gem bonuses as per-player unlimited accumulation, key design insight that "early cheap cards provide permanent discounts that make expensive cards free."
- **Type-as-resource parallel (line 96)**: "Splendor's 5 gem colors map directly to our elemental types as resources. The permanent discount mechanic maps to building up elemental affinity."
- **Lens A: Splendor Clone (lines 182-218)**: Full mapping — 4 primary tokens as gem colors, Light as gold wildcards, primary/secondary/tertiary as Tier 1/2/3, "elemental affinity" as the permanent discount engine, wizard school recognition as noble tiles.
- **Specific mapping (line 191)**: "Each played spell gives you a permanent +1 production in its type. More Fire spells = cheaper future Fire costs. This IS the engine."
- **Synthesis (line 370)**: Splendor's permanent affinity/discount engine selected as a key element to pull into the hybrid model: "permanent discounts = 'the more you know, the easier it gets.'"
- **Scorecard (lines 216-218)**: Discovery as Magic 3/5, World of Interaction 2/5, Progression & Advancement 3/5 — affinity alone is not enough, needs to combine with other mechanics.

**Phase 4: Iteration Tools** (`sdlc/phase-4-iteration-tools.md`):
- **Splendor Lens preset (line 73)**: "Lab gives permanent discount: Each card in your lab gives +1 permanent production of its type (Splendor's permanent gem bonus)."

**Splendor Reference** (`design/reference/games/splendor/README.md`):
- Engine building described as "Purchased cards give permanent gem discounts for future purchases."
- Competitive insight: "Engine efficiency is everything — the best players build discount engines that make expensive cards free."

**Design Vision** (`design/philosophy/design-vision.md`):
- Three principles used for alignment evaluation above.
- Progression principle (line 50): "start with basic elements, combine them into more complex materials, unlock deeper understanding."
- Anti-solitaire statement (line 94): "Not a solitaire engine-builder — your engine collides with other players' engines."

**Current Sandbox State** (`frontend/src/sandbox/game.js`):
- Player state shape: `{ hand: [], lab: [], school: null, resources: {}, score: 0 }` — no affinity tracking yet.
- Token pool: 4 primary types + Light. Moves: `takeToken`, `returnToken`, `playCardToLab`, `moveCard`.
- No cost-checking or affinity logic currently implemented — `playCardToLab` moves cards without checking resources or applying discounts.

**Current Scoring** (`frontend/src/sandbox/scoring.js`):
- Six scoring paths: Storm Power, Discovery Sets, Lab VP, School Stages, Breakthroughs, Knowledge (leftover tokens / 3).
- No affinity-based scoring path currently exists. Affinity thresholds for wizard school recognition would be a new scoring vector.

**Database Schema** (`database/schema.sql`):
- `types` table: 16 types (4 primary, 4 secondary, 8 tertiary) with tier, parent_type_id, dark_pair_type_id.
- `combination_design` table: Secondary compositions (Metal = Fire + Earth, etc.) and dark pair relationships.
- `type_combination_design` table: Spell candidates with type_a_id, type_b_id, amounts — these would be the cards that grant affinity when played.
