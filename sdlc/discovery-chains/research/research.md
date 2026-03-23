# Discovery Chains — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: 7 Wonders (free build chains across ages)
> **Related Slugs**: permanent-affinity, production-cascades, school-board-stages

## What This Mechanic Does

In 7 Wonders, certain Age I cards bear a chain symbol — a small icon indicating that a more advanced card in Age II or III can be built for free if you own the prerequisite. The classic example is **Baths (Age I) -> Aqueduct (Age II)**: if you built Baths in Age I, you can play Aqueduct in Age II without paying its resource cost. Some chains extend across all three ages (e.g., **Altar -> Temple -> Pantheon**), creating three-step progressions.

Key properties of 7 Wonders chains:

- **Cross-age only**: Chain links always point forward in time — an Age I card unlocks an Age II card, which unlocks an Age III card. You never chain within the same age.
- **Binary prerequisite**: You either have the prerequisite or you don't. There are no partial discounts — it's free or full price.
- **Visible on the card**: The chain symbol is printed on both the prerequisite card (showing what it enables) and the target card (showing what it requires). Players can see the chain relationship during the draft.
- **Reward for long-term planning**: Chains reward drafting with an eye toward future ages. Taking Baths in Age I is an investment — it's not the strongest Age I card, but it pays off when Aqueduct arrives in Age II and costs you nothing.
- **Draft tension**: Because your draft hand rotates, the prerequisite card and its payoff card may not both be available to you. Chains add a gambling element — "I'll take this prerequisite hoping the payoff shows up in my hand next age."
- **Multiple independent chains**: 7 Wonders has roughly 10-12 chain lines. Not every card participates in a chain. Some chains are 2-step (Age I -> Age II), others are 3-step (Age I -> Age II -> Age III).
- **Thematic grouping**: Chains follow thematic lines — scientific buildings chain into other scientific buildings, military chains into military, etc.

## Our Mapping

Discovery chains map to our game's central conceit: **science building on science**. Foundational knowledge makes advanced discoveries free — you can't build a calorimeter without first inventing the thermometer.

The 006 economy design doc establishes the direct mapping:

> "Thermometer (Era I) -> Calorimeter (Era II, free) -> Thermal Reactor (Era III, free). Discovering foundational knowledge makes advanced discoveries free — science building on science."

### Type Hierarchy as Chain Backbone

Our type system has a natural three-tier hierarchy that maps directly to three eras:

| Era | Card Pool | Type Tier | Example |
|-----|-----------|-----------|---------|
| Era I (Classical) | Primary-type spells | Primary (Fire, Earth, Water, Air) | Spark, Stone, Splash, Gust |
| Era II (Enlightenment) | Secondary-type spells | Secondary (Metal, Plant, Ice, Electric) | Forge Strike, Conductivity, Blizzard |
| Era III (Modern) | Tertiary-type spells | Tertiary (Radioactive, Cosmic, Poison, Sound, Crystal, Ghost, Heat, Magnetic) | Nuclear Chain Reaction, Black Hole, Supernova |

The composition relationships create natural chain lines:

- **Fire -> Metal -> Crystal** (Fire composes into Metal via Fire+Earth; Metal's dark pair is Crystal)
- **Fire -> Electric -> Magnetic** (Fire composes into Electric via Fire+Air; Electric's dark pair is Magnetic)
- **Earth -> Metal -> Crystal** (Earth composes into Metal via Fire+Earth; Metal's dark pair is Crystal)
- **Earth -> Plant -> Ghost** (Earth composes into Plant via Earth+Water; Plant's dark pair is Ghost)
- **Water -> Plant -> Ghost** (Water composes into Plant via Earth+Water; Plant's dark pair is Ghost)
- **Water -> Ice -> Heat** (Water composes into Ice via Air+Water; Ice's dark pair is Heat)
- **Air -> Ice -> Heat** (Air composes into Ice via Air+Water; Ice's dark pair is Heat)
- **Air -> Electric -> Magnetic** (Air composes into Electric via Fire+Air; Electric's dark pair is Magnetic)

### Concrete Chain Example

A Fire-line discovery chain grounded in real science:

1. **Era I**: *Ember* (Fire, 1-cost) — "A lingering coal that burns slowly." The observation of sustained combustion.
2. **Era II**: *Forge* (Fire+Metal, 1+1 cost, **free with Ember**) — "Heat + force shapes metal." Understanding combustion leads to metallurgy.
3. **Era III**: *Thermite* (Fire+Metal, 2+1 cost, **free with Forge**) — "Metal + oxidizer -> unextinguishable burn." Mastering metallurgy leads to advanced chemical reactions.

A Water-line chain:

1. **Era I**: *Splash* (Water, 1-cost) — "A focused jet of water."
2. **Era II**: *Healing Spring* (Water+Plant, 2+1 cost, **free with Splash**) — "Restorative water infused with life energy."
3. **Era III**: *Bioaccumulation* (Water+Poison, 1+1 cost, **free with Healing Spring**) — "Organisms concentrate toxins over repeated exposure." Understanding water's life-giving properties reveals its capacity for concentration and toxicity.

## Chain Design Space

### How Many Chains?

7 Wonders has ~10-12 chain lines for 7 card categories across 3 ages. Our game has:
- 4 primary types (Era I cards)
- 4 secondary types (Era II cards)
- 8 tertiary types (Era III cards)

Each primary type feeds into exactly 2 secondary types via composition:
- Fire -> Metal, Electric
- Earth -> Metal, Plant
- Water -> Plant, Ice
- Air -> Ice, Electric

Each secondary type has exactly 1 tertiary dark pair:
- Metal -> Crystal, Plant -> Ghost, Ice -> Heat, Electric -> Magnetic

This creates a natural branching structure: 4 primary roots split into 4 secondary nodes, which lead to 4 tertiary endpoints. That gives us **8 natural 3-step chain lines** (one per primary-to-secondary path, continuing to tertiary), plus potential **2-step chains** for cross-type combinations.

### Should Chains Follow Type Relationships?

**Strong case for yes**: The type composition hierarchy (Fire + Earth = Metal) is the backbone of the game's scientific logic. Chains that follow these relationships reinforce the "discovery as magic" principle — you literally discover how combining elements creates new materials. A player who invested in Fire and Earth spells in Era I naturally unlocks Metal spells for free in Era II. This is the most thematically coherent option.

**Case for cross-type chains**: Some chains could cross unexpected type boundaries to create "eureka" moments. For example, an Ice spell in Era I could unlock a Plant spell in Era II — representing the discovery that dormancy (cold preservation) enables spring growth. Cross-type chains would reward players who diversify and discover non-obvious connections.

**Recommendation**: The majority of chains (6-8) should follow the type composition hierarchy. A smaller number (2-4) should cross type boundaries to create surprise discovery moments and reward diversified drafting.

### Chain Length: 2-Step vs 3-Step

- **2-step chains** (Era I -> Era II): More likely to complete; lower commitment. Good for common chains that many players might access.
- **3-step chains** (Era I -> Era II -> Era III): Higher payoff but riskier; require planning across two age transitions. Good for dedicated chain-chasers.

7 Wonders mixes both. We should too: ~4-6 chains that are 3-step (following the primary -> secondary -> tertiary line) and ~4-6 chains that are 2-step (one era jump, more accessible).

### Should Chain Links Be Visible on Cards?

7 Wonders prints chain symbols directly on cards. This serves discoverability — players can see exactly which cards chain into which. But our first design principle says:

> "No type charts, no combo guides, no full spell lists. Discovery is not a feature — it IS the game."

**Tension**: Showing chain links on cards makes the mechanic accessible but reduces the "eureka" of discovering the connection yourself. Hiding them makes discovery more magical but risks the mechanic going unnoticed.

**Possible middle ground**: Show the *forward* chain symbol (what this card enables) but not the *backward* one (what enables it). Players see that Ember "leads to something in Era II" but must discover through play that it's Forge. Alternatively, chain links could be revealed only after you first complete a chain — a literal "discovery" mechanic.

## Current Card Landscape

### Cards by Tier (from TYPE_COMBOS in build.py)

The database seeds define all type combination candidates. Using the game.js tier classification (based on type_a_id and type_b_id membership in primary/secondary sets):

**Era I — Primary-type cards** (both types are primary, or single-type primary):
- Pure single-type: 8 cards (2 per primary element — Spark/Ember, Stone/Pebble Wall, Splash/Mist Veil, Gust/Breeze Ward)
- Pure high-cost: 4 cards (Inferno, Monolith, Tidal Wave, Cyclone)
- Primary + Primary pairs: ~46 cards across Fire+Earth, Fire+Water, Fire+Air, Earth+Water, Earth+Air, Water+Air combinations (6-8 per pair)
- **Total Era I pool**: ~58 cards

**Era II — Secondary-type cards** (at least one type is secondary):
- Primary + Secondary pairs: ~60+ cards across Fire+Metal, Fire+Plant, Fire+Ice, Fire+Electric, Earth+Metal, Earth+Plant, Earth+Ice, Earth+Electric, Water+Metal, Water+Plant, Water+Ice, Water+Electric, Air+Metal, Air+Plant, Air+Ice, Air+Electric (3-7 per pair)
- Secondary + Secondary pairs: ~15 cards across Metal+Plant, Metal+Ice, Metal+Electric, Plant+Ice, Plant+Electric, Ice+Electric (3-4 per pair)
- **Total Era II pool**: ~75+ cards

**Era III — Tertiary-type cards** (at least one type is tertiary, no secondary types):
- Primary + Tertiary pairs: ~15 cards (Fire+Poison, Fire+Radioactive, Earth+Cosmic, Water+Poison, Air+Sound)
- Tertiary + Tertiary pairs: ~15 cards (Radioactive+Cosmic, Cosmic+Ghost, Sound+Crystal, Sound+Ghost, Crystal+Heat, Heat+Magnetic, Electric+Magnetic, Plant+Ghost, Ice+Heat, Metal+Crystal, Plant+Poison)
- **Total Era III pool**: ~30+ cards

### Chain Relationship Potential

The composition hierarchy creates natural chain pathways:

| Era I Prerequisite (Primary) | Era II Free Build (Secondary) | Era III Free Build (Tertiary) |
|------------------------------|-------------------------------|-------------------------------|
| Fire+Earth card (e.g., Forge Strike) | Metal card (e.g., Tempered Blade) | Crystal card (e.g., Lattice Shift) |
| Fire+Air card (e.g., Ember Storm) | Electric card (e.g., Conductor) | Magnetic card (e.g., EM Field) |
| Earth+Water card (e.g., Mud) | Plant card (e.g., Ancient Forest) | Ghost card (e.g., Haunted Grove) |
| Air+Water card (e.g., Mist) | Ice card (e.g., Frost Wind) | Heat card (e.g., Phase Shift) |

The card pool is large enough to support 8-12 chain lines with dedicated cards at each tier, plus plenty of unchained cards for players who don't pursue chains.

## Design Tensions

### 1. Discoverability: Hidden vs Shown on Card

- **Shown** (7 Wonders style): Players see chain symbols during draft and can plan around them. Reduces discovery moments but makes the mechanic accessible and strategically deep from game one.
- **Hidden**: Players must discover chain links through repeated play. Fits the "Discovery as Magic" principle beautifully but risks the mechanic being invisible to new players and creates a skill gap between experienced and new players.
- **Progressive reveal**: Chain symbols appear only after a player has completed that chain once (across any game, tracked via meta-progression). First completion is a genuine discovery; subsequent games allow strategic planning. Requires persistent player profiles.

### 2. Draft Strategy Impact

Chains create a specific draft tension: **do you draft for chains or opportunistically?**

- If chains are too rewarding, players must chase them to be competitive, reducing draft flexibility.
- If chains are too weak, they become incidental — you complete them by accident rather than by strategy.
- 7 Wonders balances this by making chains save 2-4 resources (the cost of the target card) but not providing any bonus beyond the free build. The savings are good but not game-winning.
- Our version should similarly make chains save the card's resource cost but not provide additional VP or effects. The reward is tempo — you get a free card that costs nothing, letting you spend your resources elsewhere.

### 3. Chain Length vs Probability of Completion

In a 7-card drafting system with hand rotation, the probability of seeing a specific card decreases with player count:
- 2 players: high chance of seeing both prerequisite and payoff
- 4+ players: much harder to complete 3-step chains

This suggests: 2-step chains should be common (most players complete 1-2 per game), 3-step chains should be rare achievements (maybe 1 per game for a chain-focused player).

### 4. Chains vs Affinity Discounts (Overlap?)

The permanent-affinity mechanic (Splendor's permanent gem discounts) also reduces card costs. If affinity reduces the cost of a Metal spell by 2 because you've played 2 Fire cards, and a chain link makes it free, do both mechanics step on each other?

**Options**:
- **Chains replace cost entirely** (7 Wonders model): Chain = free, affinity = discount. They operate on different cards — some cards are chain targets, others benefit from affinity discounts.
- **Chains as affinity acceleration**: Completing a chain also grants a permanent affinity bonus. Chain cards both come free AND make your engine stronger.
- **Chains instead of affinity**: Discovery chains are the ONLY way to get free builds. Affinity provides other benefits (scoring, triggers) but not cost reduction.

### 5. Chains Across Eras vs Within Eras

7 Wonders chains are strictly cross-age. Should ours be?

- **Cross-era only** (7 Wonders model): Reinforces progression. You invest in Era I knowing it pays off in Era II. Clean, simple.
- **Within-era chains**: An Era II card could chain into another Era II card. This feels less like "building on prior knowledge" and more like "knowing one thing helps you learn a related thing." Could work for secondary-to-secondary chains (Metal card -> Electric card within Era II, reflecting electromagnetic theory building on metallurgy).
- **Recommendation**: Primarily cross-era, with a few within-era chains at the secondary tier to create more discovery moments.

## Interaction with Other Mechanics

### Permanent Affinity

**Chains AS affinity or chains + affinity?**

Permanent affinity (Splendor model) gives a discount per played card of a matching type. Discovery chains give a binary free build for having a specific prerequisite. These are distinct mechanisms:
- Affinity is gradual and type-scoped (more Fire cards = cheaper Fire costs broadly)
- Chains are specific and card-scoped (this particular card unlocks that particular card)

They complement each other well. Affinity rewards type specialization; chains reward sequential investment. A player deep in Fire builds affinity AND completes Fire chains, creating a compound engine. The key is ensuring they don't stack to make cards trivially cheap — if affinity already reduces a card to cost 1, the chain's "free build" saves only 1 resource, which feels underwhelming.

**Design guideline**: Chain target cards should have costs that exceed what typical affinity could cover. If affinity saves 2-3 resources at most, chain targets should cost 4+ so the chain savings are meaningful.

### Production Cascades

**Chain completion triggering cascade?**

When a player completes a discovery chain (plays the payoff card for free), this could trigger a cascade: the free card's "when played" effect fires, which might generate resources, which enable playing another card in the same turn. This creates a "eureka moment" where one discovery snowballs into several.

**Risk**: If chain completion + cascade is too powerful, it creates a runaway leader problem. If you complete a chain, you get a free card, which triggers a cascade, which gives you resources to play another card — too much from one action.

**Guideline**: Chain completion should feel great but not game-breaking. The free card is the reward. If it has a "when played" trigger, that's a bonus. But chain completion itself shouldn't trigger additional cascade effects beyond the card's normal abilities.

### School Board Stages

**School unlocking chains?**

School board stages (7 Wonders wonder stages) could interact with chains in several ways:
- A school stage could **reveal** hidden chain links (if chains are hidden by default)
- A school stage could **extend** a chain — adding a 4th link that's school-specific
- A school stage could **grant** a chain prerequisite retroactively — "treat your school as if you had played [card X]"
- The School of Combustion (Fire) might have a stage that reads: "All Fire prerequisite chains are active for you" — meaning any card that chains from a Fire card is free, even if you don't have the specific prerequisite

**Recommendation**: Schools should nudge chain completion (e.g., the Fire school makes Fire-line chains easier to spot or slightly discounted) but not bypass the draft requirement. The draft is the tension engine; schools should complement it, not replace it.

### Instrument-Wizard Pairings

**Instruments as chain links?**

The Everdell model pairs instruments with wizards — if you have the Crucible (instrument), Lavoisier (wizard) is free to recruit. This is already a form of chain: prerequisite card -> free build.

Discovery chains and instrument-wizard pairings could be the same system or parallel systems:
- **Same system**: An instrument in Era I chains into a spell in Era II which chains into a wizard in Era III. The chain crosses card types.
- **Parallel systems**: Instrument-wizard pairings are separate from spell-to-spell chains. This keeps each system simpler but creates more mechanics to track.

**Recommendation**: Keep them as parallel free-build systems with distinct flavor. Spell chains = "knowledge building on knowledge." Instrument-wizard pairings = "a scientist recognizes their own tool." Both provide free builds but for different thematic reasons and through different card pools.

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Chains are literally "discovering one thing leads to discovering the next for free." The Thermometer -> Calorimeter -> Thermal Reactor line IS the scientific method. If chain links are hidden or progressively revealed, completing one feels like a genuine eureka moment. |
| A World of Interaction | Moderate | Chains primarily affect the player who completes them (engine-building), but they interact with the draft (hate-drafting chain prerequisites), with type composition (chains follow Fire -> Metal -> Crystal), and with other mechanics (affinity, cascades, schools). Chains create cross-era connections that make the type web feel richer. |
| Progression and Advancement | Very Strong | This is the mechanic's core alignment. "Science building on science" IS progression. Era I knowledge enabling Era II discoveries, which enable Era III mastery, directly mirrors the historical arc of scientific understanding. Chains make the primary -> secondary -> tertiary tier escalation mechanically meaningful, not just thematic. |

## Open Questions

- [ ] How many chain lines total? 8 (one per primary-to-secondary path) + 4 (cross-type surprises) = 12 seems right, but needs playtesting for completion rates
- [ ] Should chains be visible on cards from game one, or discovered through play?
- [ ] What is the average resource savings per chain? If Era II cards cost ~4 resources and Era III cards cost ~6, chains save significant tempo — is that too much?
- [ ] Do chains and permanent-affinity discounts stack, or does a chain override affinity?
- [ ] Should completing a 3-step chain grant a bonus beyond the free builds (e.g., VP, a "breakthrough" claim)?
- [ ] Can a single Era I card serve as a prerequisite for multiple Era II chains? (branching chains vs linear chains)
- [ ] How do chains interact with the "sell card for resources" action — if you sell a prerequisite card, do you lose the chain?
- [ ] Should there be "broken chains" — cards that would chain but you chose a different path — with a consolation mechanic?
- [ ] What happens when a prerequisite card is hate-drafted by an opponent — is the chain permanently blocked for you?
- [ ] Do within-era chains (secondary -> secondary) add enough value to justify the complexity?
- [ ] Should chain completion be public information (opponents see you got a free build) or hidden?
- [ ] How do chains interact with the Arcanum/market — can market cards participate in chains, or only drafted cards?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Lens C (7 Wonders clone) defines discovery chains as the free-build-chain mapping; Lens D (Everdell clone) defines instrument-wizard pairings as a parallel free-build system; Part 4 synthesis includes chains as a "take from 7 Wonders" element
- `design/philosophy/design-vision.md` — Three design principles, especially Principle 3 (Progression and Advancement): "Each new concept feels like unlocking a new power" and "Your discoveries enable further discoveries"
- `design/framework/type-system-overview.md` — Type composition rules (Fire+Earth=Metal, etc.) that form the backbone of chain relationships
- `frontend/src/sandbox/game.js` — Current era pool division (Era I = primary, Era II = secondary, Era III = tertiary) and draft mechanics (hand rotation, sell-for-resources)
- `database/build.py` — TYPE_COMBOS seed data (card landscape across tiers), COMBINATIONS composition rules, TYPES tier definitions
- `sdlc/phase-4-iteration-tools.md` — 7 Wonders lens preset includes "discovery chains" and "school boards" as testable mechanics
