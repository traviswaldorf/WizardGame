# Exploration: Multiplayer Economy & Engine-Building Framework

> **ID**: 006
> **Status**: Exploring
> **Date Opened**: 2026-03-22
> **Date Decided**: —
> **Related Docs**: [design-vision.md](../philosophy/design-vision.md), [type-system-overview.md](../framework/type-system-overview.md), [wizard-schools.md](../reference/scientists/wizard-schools.md), [005-incremental-progression-trees.md](005-incremental-progression-trees.md), [004-board-center-identity.md](004-board-center-identity.md), [002-towers-vs-pillars.md](002-towers-vs-pillars.md)

## Context

We need to define the multiplayer economy of the game — what's shared, what's scarce, what's visible. These are the structural decisions that determine whether this game *feels* like 7 Wonders, Wingspan, Splendor, or Everdell. All four are proven engine-building formulas, and all four make fundamentally different choices about resource accessibility, scarcity, and information.

This exploration:
1. Analyzes 3 core design dimensions across 4 reference games
2. Maps our game concepts (types, spells, wizards, instruments, schools) onto each game's framework
3. Identifies which structural choices best serve our three design principles

### The Three Core Dimensions

Every multiplayer engine-building game must answer three questions for each resource/component:

| Dimension | Question | Spectrum |
|-----------|----------|----------|
| **Accessibility** | Can all players draw from this, or does each player have their own? | Shared pool ↔ Per-player supply |
| **Scarcity** | Is there a finite amount, or is it always available? | Strictly limited ↔ Unlimited |
| **Visibility** | Can opponents see this, or is it hidden? | Open/public ↔ Hidden/private |

---

## Part 1: Reference Game Analysis

### 7 Wonders — Simultaneous Drafting with Neighbor Economy

**Core loop**: Draft 1 card from a rotating hand → build structure, build wonder stage, or sell for coins → pass remaining cards. 3 Ages of escalating power.

| Component | Accessibility | Scarcity | Visibility |
|-----------|--------------|----------|------------|
| **Card hands** | Shared (rotating draft) | Strictly limited (fixed deck per age, 7 cards dealt per player) | Hidden during draft, public once played |
| **Raw materials** (clay, ore, stone, wood) | Per-player production, but purchasable from neighbors at 2 coins each (cannot refuse) | Unlimited — production-based, no token pool | Open (played cards show what you produce) |
| **Manufactured goods** (glass, loom, papyrus) | Same as raw materials | Same — unlimited production | Open |
| **Coins** | Shared bank | Effectively unlimited | Open (coin counts visible) |
| **Wonder boards** | Per-player (assigned at start) | Unique — one per player | Open (everyone sees your wonder and progress) |
| **Military shields** | Per-player accumulation | Unlimited (cards provide fixed counts) | Open (red cards visible) |
| **Science symbols** | Per-player accumulation | Limited by card availability in draft | Open |
| **VP categories** | Per-player, scored independently | N/A | Partially hidden (exact totals hard to calculate mid-game) |

**Key design insight**: Resources are *unlimited in production* but *scarce in access*. You can't run out of stone — but you can only produce what your cards allow, and buying from neighbors costs coins. The scarcity is in the **draft** — the cards themselves are the finite resource. Every card you take is one your neighbor doesn't get.

**Interaction model**: Moderate-high. Drafting creates hate-drafting (denying cards). Neighbor trading creates economic dependency. Military creates direct comparison. But you never directly attack or steal — interaction is structural (who's next to whom) rather than targeted.

**Wonder board as school parallel**: Each wonder provides a starting resource and unique progression bonuses. You don't *choose* your strategy — your wonder nudges you, but the draft determines your actual path. The wonder is an asymmetric starting condition, not a locked-in strategy.

---

### Wingspan — Low-Interaction Engine Building with Habitat Rows

**Core loop**: Place action cube → choose 1 of 4 actions (play bird, gain food, lay eggs, draw cards) → activate all bird powers in that habitat row right-to-left. Engine compounds as rows fill up.

| Component | Accessibility | Scarcity | Visibility |
|-----------|--------------|----------|------------|
| **Bird cards** (hand) | Shared deck + shared 3-card face-up tray | Strictly limited (170 cards, most unseen per game) | Hidden in hand; face-up tray is open |
| **Food tokens** (5 types) | Shared supply tokens | Functionally unlimited (103 tokens, rarely runs out) | Hidden in hand after taking; birdfeeder dice are open |
| **Birdfeeder dice** (5 dice) | Shared mechanism — all draw from same tray | Artificially scarce within each action (depletes, rerolls when all same face) | Open (everyone sees dice in tray) |
| **Eggs** | Shared supply | Functionally unlimited (75 eggs) | Open (placed on birds on your board) |
| **Action cubes** | Per-player (8 total) | Strictly limited and decreasing — lose 1/round to goals | Open |
| **Player boards** | Per-player — 3 habitat rows | Fixed — 5 slots per habitat | Fully open |
| **Bonus cards** | Per-player (dealt at start) | 1 per player, chosen from 2 | Hidden |
| **Round-end goals** | Shared — all players compete for same goals | Fixed per game (4 goals) | Open |

**Key design insight**: Resources are *abundant* — the scarcity is in **actions** (cubes) and **tempo**. You only get 26 total actions across the game (8+7+6+5), decreasing each round. The engine-building tension is: do you spend early turns building your engine (fewer immediate rewards) or take resources now (weaker late game)? The engine *is* the reward — more birds in a row = stronger base action + more power activations.

**Interaction model**: Low. The birdfeeder is the main competitive point — taking a die denies it to others. Round-end goals create indirect competition. Pink "between turns" powers trigger off opponents' actions. But you never disrupt, block, or attack another player's board.

**Triggering chains**: This is Wingspan's strongest parallel to our game. When you take the "gain food" action in a forest with 4 birds, you get the base food bonus PLUS activate all 4 birds' powers in sequence. Some powers generate resources, some tuck cards, some lay eggs — creating cascading chains. The feeling of "I built this engine over 3 turns, now watch it go" is exactly the engine-building payoff we want.

---

### Splendor — Tight Token Economy with Permanent Discounts

**Core loop**: Take gem tokens from shared pool OR reserve a card (gain gold wildcard) OR buy a card using tokens (minus permanent discounts from owned cards). Engine builds as purchased cards reduce future costs.

| Component | Accessibility | Scarcity | Visibility |
|-----------|--------------|----------|------------|
| **Gem tokens** (5 colors) | Shared central pool | Strictly limited — 4-7 per color depending on player count | Open (pool counts visible, each player's tokens visible) |
| **Gold tokens** (wildcards) | Shared pool | Strictly limited (5 total) | Open |
| **Development cards** (3 tiers) | Shared display — 4 face-up per tier | Limited — deck is finite, display refreshes | Open (face-up display); deck is hidden |
| **Reserved cards** | Per-player (max 3 reserved) | Max 3 per player | Hidden if reserved from deck; open if reserved from display |
| **Permanent gem bonuses** | Per-player — from purchased cards | Unlimited (accumulate with each purchase) | Open (all purchased cards visible) |
| **Noble tiles** | Shared — auto-awarded to first qualifier | Strictly limited — (players+1) tiles | Open (visible requirements) |
| **Prestige points** | Per-player | N/A — first to 15 triggers endgame | Open (all cards/nobles are public) |

**Key design insight**: The scarcity IS the game. With only 4-7 tokens per color, every token you take is one opponents can't. The engine-building is elegant: early cheap cards provide permanent discounts that make expensive cards free. The "gold as wildcard" mechanic is brilliant — it's the most flexible and the most scarce, forcing tough decisions about when to reserve vs. when to buy.

**Interaction model**: High but indirect. No attacks or blocking — but the token pool is a zero-sum battlefield. Taking 2 blue gems directly starves a blue-heavy opponent. Noble racing adds another competitive dimension. Almost perfect information — you can calculate exactly what opponents need and deny it.

**Type-as-resource parallel**: This is our strongest mapping. Splendor's 5 gem colors map directly to our elemental types as resources. The permanent discount mechanic maps to building up elemental affinity — the more Fire cards you play, the cheaper future Fire costs become. And gold wildcards map perfectly to Light (or Light/Dark) as universal energy — E=mc², energy can become anything.

---

### Everdell — Worker Placement + Tableau City Building

**Core loop**: Place a worker to gain resources/effects OR play a card to your city (tableau of up to 15 cards) OR prepare for next season (recall workers, gain new ones, activate production). Asymmetric season advancement — each player decides when to move on.

| Component | Accessibility | Scarcity | Visibility |
|-----------|--------------|----------|------------|
| **Resources** (twigs, resin, pebbles, berries) | Shared supply | Technically limited but rarely exhausted; pebbles scarcest | Open (supply visible) |
| **Worker spots** (board) | Shared board — mix of exclusive and shared locations | Exclusive spots are strictly limited (first-come blocking); shared spots unlimited | Open |
| **Workers** | Per-player | Strictly limited — 2→3→4→6 across seasons | Open (placed workers visible) |
| **Meadow** (card display) | Shared — 8 face-up cards any player can take | Refreshes from deck; deck is finite | Open |
| **Hand cards** | Per-player | Max 8 in hand | Hidden |
| **City** (played tableau) | Per-player — up to 15 cards | Strictly limited — 15 card maximum per city | Open (all played cards visible) |
| **Events** (basic + special) | Shared — first to qualify claims exclusively | Strictly limited (4+4 = 8 total) | Open (requirements visible) |
| **Seasons** | Per-player — each player advances independently | 4 seasons, strict order | Open (everyone sees which season each player is in) |

**Key design insight**: The primary scarcity is **workers** (actions) and **city slots** (15 max). Resources are available but require spending workers to gather, and exclusive spots create blocking tension. The asymmetric season mechanic is fascinating — rushing to the next season gives you more workers sooner, but you might miss opportunities available only in the current season. The **city card interactions** create the engine: Construction-Critter pairings (play the matching Critter for free), Production cards that activate each Spring/Autumn, Governance cards that give ongoing bonuses for certain card types, and Destination cards that create worker-placement spots in your own city.

**Interaction model**: Medium. Worker blocking on exclusive spots, racing for events, taking Meadow cards opponents want. Open Destination cards in your city can be visited by opponents (they get the benefit, you get 1 VP). But you never destroy or directly attack another player's city.

**Triggering chain parallel**: Everdell's Production card activations during season changes create the kind of cascading engine effect we want. When you prepare for Autumn and your 5 Green production cards all fire — generating resources, drawing cards, gaining VP — that's the compound engine payoff. Combined with Governance cards that trigger bonus effects when you play certain card types, you get satisfying combo chains.

---

## Part 2: Comparative Matrix

### Resource Pool Design

| Dimension | 7 Wonders | Wingspan | Splendor | Everdell |
|-----------|-----------|----------|----------|----------|
| **Primary resource model** | Per-player production (tradeable to neighbors) | Shared supply (food tokens) | Shared pool (gem tokens) | Shared supply (resource tokens) |
| **Primary scarcity driver** | Cards in the draft | Actions (cubes) and tempo | Gem tokens | Workers + city slots |
| **Engine-building mechanism** | Free build chains (prerequisite cards) | Habitat rows (more birds = stronger actions + more triggers) | Permanent gem discounts from purchased cards | Card pairings (free Critters), Production activations, Governance bonuses |
| **Wildcard/flexible resource** | Coins (buy anything from neighbors) | Any 2 food = 1 of any type | Gold tokens (substitute for any gem) | Berries (dual-use: currency + Critter cost) |
| **Resource denial possible?** | Yes — hate-drafting cards | Minimal — take birdfeeder dice | Yes — take tokens opponents need | Yes — block exclusive worker spots, take Meadow cards |

### Information Design

| Dimension | 7 Wonders | Wingspan | Splendor | Everdell |
|-----------|-----------|----------|----------|----------|
| **Board state** | Open (played cards visible) | Open (player boards, birds, eggs visible) | Open (purchased cards, bonuses visible) | Open (cities, workers visible) |
| **Hand/private info** | Hidden (draft hand) | Hidden (bird cards in hand; bonus cards) | Minimal (reserved cards from deck) | Hidden (up to 8 cards in hand) |
| **Strategy readability** | High — can see military, science, etc. building up | High — can see board composition | Very high — near-perfect information | High — can see city composition |
| **Score transparency** | Low — exact VP hard to calculate mid-game | Medium — board VP visible, bonus hidden | High — prestige points on open cards/nobles | Medium — city VP visible, some bonuses hidden |

### Interaction Design

| Dimension | 7 Wonders | Wingspan | Splendor | Everdell |
|-----------|-----------|----------|----------|----------|
| **Direct conflict** | Military comparison each age | None | None | None |
| **Indirect competition** | Draft denial, resource buying | Birdfeeder, round-end goals | Token competition, noble racing | Worker blocking, event racing |
| **Can you disrupt opponents?** | Hate-draft; military defeats give -1 VP | Only by taking what they want from shared pools | Only by taking tokens/cards they need | Only by blocking spots or claiming events first |
| **Player interaction feel** | "I see what you're building and might deny it" | "We're doing our own thing, occasionally crossing paths" | "Every token I take is one you can't have" | "I need that spot — do I go now or risk losing it?" |

### Progression/Phases Design

| Dimension | 7 Wonders | Wingspan | Splendor | Everdell |
|-----------|-----------|----------|----------|----------|
| **Game phases** | 3 Ages (synchronized, all players advance together) | 4 Rounds (synchronized, decreasing turns) | None — continuous until 15 VP trigger | 4 Seasons (asynchronous — each player advances independently) |
| **Tier escalation** | Age I → II → III cards escalate in power and cost | Habitat columns cost more eggs as you go deeper | Card tiers 1 → 2 → 3 escalate in cost and VP | Seasons unlock more workers; card power varies |
| **Early vs late game feel** | Age I: gather resources. Age III: score big | Round 1: build engine. Round 4: exploit it | Early: accumulate tokens. Late: buy expensive cards for free | Spring: establish. Autumn: execute engine combos |

---

## Part 3: Our Game Through Each Lens

### What We're Working With

| Our Concept | Description | Potential Role |
|-------------|-------------|----------------|
| **Elemental types** (4 primary, 4 secondary, 8 tertiary) | Hierarchical type system grounded in physics | Core resource/currency system |
| **Spells** | Discoveries — cast by spending type energy | Cards/abilities you play |
| **Wizard schools** (12 schools, each with head wizard + 2 pupils) | Historical scientists as faction identities | Starting asymmetry / bonus track |
| **Instruments** | Scientific tools (telescope, crucible, voltaic pile...) | Persistent engine pieces (like buildings) |
| **Towers/Pillars** | Structures built at element sources | Resource production infrastructure |
| **Light/Dark** | Augmenter pair outside main hierarchy | Wildcard/meta-resource |
| **Time/Space** | Augmenter pair outside main hierarchy | Phase/tempo mechanics |
| **Strategic archetypes** (Aggressive, Defensive, Flow, Control) | Playstyle orientations | Point-scoring tracks or victory paths |
| **Progression** (primary → secondary → tertiary) | Building toward mastery | Age/tier escalation |
| **Storms** | Cross-type events | Shared environmental effects |

---

### Lens A: The Splendor Clone — "Elemental Tokens"

**Map our game onto Splendor's framework: tight shared token economy with permanent discounts.**

| Splendor Concept | Our Mapping | Notes |
|-----------------|-------------|-------|
| **5 gem colors** | **4 primary type tokens** (Fire, Earth, Water, Air) | Tokens in a shared central pool. Taking Fire tokens denies them to opponents. |
| **Gold wildcards** | **Light tokens** | E=mc² — Light can become any element. Strictly limited (4-5 total). Earned by reserving a spell. |
| **Level 1-2-3 cards** | **Primary → Secondary → Tertiary spell cards** | Tier 1: primary-type spells (cheap, small bonuses). Tier 2: secondary-type spells (require 2 primary types, moderate VP). Tier 3: tertiary-type spells (expensive, powerful, high VP). |
| **Permanent gem bonuses** | **Elemental affinity** | Each played spell gives you a permanent +1 production in its type. More Fire spells = cheaper future Fire costs. This IS the engine. |
| **Noble tiles** | **Wizard school recognition** | When your permanent affinities match a school's requirements (e.g., Fire 4 + Earth 3 = Metal school), a wizard school head recruits you — worth VP. First to qualify claims it. |
| **Reserved cards** | **Research** | "Research" a spell: take it from the display into your hand (hidden), gain 1 Light token. Max 3 researched spells. |
| **Player actions** | Take 3 different type tokens / Take 2 of same type (if 4+ available) / Research a spell / Cast a spell (play a card) | Clean, minimal action set. |

**Wizard school as starting bonus**: Each player starts with 1 school card (chosen from 2 dealt, like Wingspan bonus cards). The school gives a small starting affinity bonus (e.g., Fire school starts with +1 permanent Fire) and a secret end-game scoring condition (e.g., "3 VP per tertiary spell you've cast"). This nudges your strategy without locking it.

**Light/Dark twist**: Dark tokens could be introduced as the *opposite* of Light — instead of wildcards, Dark tokens are "anti-tokens" that let you *remove* tokens from the pool or from opponents' reserves. This creates the tension between Light (creative, flexible, constructive) and Dark (disruptive, denying, deconstructive) that mirrors the augmenter pair's thematic identity.

**What this captures well**:
- Tight resource competition — elemental tokens as shared scarce resource
- Engine-building through permanent affinity (permanent gem discounts)
- Clean type hierarchy mapping (primary/secondary/tertiary → Level 1/2/3)
- Light as wildcard = E=mc² flavor (energy can become anything)
- Wizard schools as noble tiles = first-to-qualify racing
- Near-perfect information — science is open knowledge

**What this misses**:
- No triggering chains / combo cascades (Splendor is pure tableau, no activation)
- Minimal interaction beyond token denial
- No progression phases or ages — continuous play
- Doesn't capture the "World of Interaction" principle well
- No board/spatial element

**Design principle scorecard**:
- Discovery as Magic: ★★★☆☆ — discovering affinity combos is satisfying, but limited depth
- World of Interaction: ★★☆☆☆ — type interactions don't mechanically *do* anything beyond cost reduction
- Progression & Advancement: ★★★☆☆ — permanent discounts compound, but no dramatic power curve

---

### Lens B: The Wingspan Clone — "Laboratory Rows"

**Map our game onto Wingspan's framework: low-interaction engine building with habitat action rows.**

| Wingspan Concept | Our Mapping | Notes |
|-----------------|-------------|-------|
| **3 habitats** (Forest, Grassland, Wetland) | **3 laboratory wings**: Forge (gain type energy), Garden (grow instruments), Library (draw spell cards) | Each wing corresponds to a core action. |
| **Birds** (played into habitats) | **Instruments** (placed into laboratory wings) | Instruments are the engine pieces. Each one placed in a wing adds an activation power to that wing's action chain. |
| **4 actions** (play bird, gain food, lay eggs, draw cards) | **4 actions**: Install instrument, Harvest energy, Cultivate instruments, Research spells | Installing an instrument costs energy + eggs-equivalent. Other 3 actions activate the corresponding wing. |
| **Food types** (5 types + birdfeeder) | **Type energies** (4 primary + Light wildcard) | Birdfeeder → "Element Source" dice tower: roll 5 dice with elemental faces. Take dice = gain that energy. Light faces are rare. |
| **Eggs** | **Knowledge tokens** | Needed to install instruments into deeper wing slots. Also worth VP at end. |
| **Bird cards** (hand) | **Spell cards** (hand) | Drawn from shared deck + 3-card face-up tray. |
| **Bird powers** (brown/pink/white) | **Instrument powers**: **Brown** = "when this wing is activated" (chain triggers). **Pink** = "when another player does X" (reactive). **White** = "when installed" (one-time). | Brown powers in the Forge wing cascade during Harvest Energy — each instrument fires in sequence. |
| **Bonus cards** | **School cards** | Secret end-game scoring. "3 VP per Fire instrument" or "2 VP per instrument that produces 2+ types." |
| **Round-end goals** | **Discovery milestones** | Shared goals each round: "most instruments in Forge," "most type diversity," "most tertiary energy." |
| **Action cubes** (8, decreasing) | **Research hours** (8, decreasing by 1 each round) | Same constraint — fewer actions each round, forcing efficiency. |

**Wing engine example**: Your Forge wing has: Crucible (when activated: gain 1 Metal energy), Bellows (when activated: gain 1 Fire if you have any Air instrument), Voltaic Pile (when activated: if you gained Metal this turn, also gain 1 Electric). When you take the "Harvest Energy" action, you get the base energy from the Element Source dice, THEN activate Crucible → Bellows → Voltaic Pile in sequence. Three instruments = three triggers = a cascade that generates Fire + Metal + Electric from one action. THIS is the triggering synergy feel.

**School as starting asymmetry**: Each player chooses a school card at game start. The school provides a small passive bonus to one wing (e.g., "Forge wing instruments cost 1 less energy to install") and a secret scoring condition. The school doesn't lock you in — it just makes certain paths slightly more efficient.

**Element Source (birdfeeder equivalent)**: 5 dice in a tower. Each die has: Fire, Earth, Water, Air, Light (wildcard), and one split face (Fire/Earth — player chooses). Light faces are wild but rare (1 per die vs 2 for common elements). All players draw from the same dice tray — reroll when all showing same face.

**What this captures well**:
- **Triggering chains** — this is the headline feature. Brown instrument powers cascading in sequence IS the engine-building payoff
- Progression through wing depth (deeper slots = more powerful but costlier)
- Low-conflict feel with some shared resource tension (dice tower, card tray)
- Action economy as primary scarcity — forces meaningful choices each turn
- Scientific instruments as the "creatures" you build your engine from

**What this misses**:
- Very low player interaction — may conflict with "World of Interaction" principle
- No type *interactions* — instruments trigger based on position, not elemental relationships
- The type system is mostly just different resource colors, not a web of relationships
- No spatial board element
- Light/Dark and Time/Space augmenters don't have natural roles

**Design principle scorecard**:
- Discovery as Magic: ★★★★☆ — discovering instrument combos in wings is satisfying and discoverable
- World of Interaction: ★★☆☆☆ — player interaction is low; type interaction is cosmetic
- Progression & Advancement: ★★★★☆ — strong engine-building arc, compounding power

---

### Lens C: The 7 Wonders Clone — "Ages of Discovery"

**Map our game onto 7 Wonders' framework: simultaneous drafting with neighbor economy across escalating ages.**

| 7 Wonders Concept | Our Mapping | Notes |
|-------------------|-------------|-------|
| **3 Ages** | **3 Eras**: Classical (primary elements), Enlightenment (secondary), Modern (tertiary) | Card pool escalates. Era I: primary-type cards. Era II: secondary-type cards requiring primary infrastructure. Era III: tertiary cards and big-point scorers. |
| **Wonder boards** (7, unique) | **Wizard school boards** (4 base schools, or up to 12) | Each player gets a school board with a starting element production and 2-4 stages to build. School of Combustion (Fire) starts producing Fire; stages might grant: Stage 1: +1 Fire production, Stage 2: free secondary spell per era, Stage 3: 7 VP. Side A (simple) vs Side B (complex). |
| **Brown cards** (raw materials) | **Primary element producers** | Cards that produce Fire, Earth, Water, Air — your basic resource infrastructure. |
| **Gray cards** (manufactured goods) | **Secondary element producers** | Cards that produce Metal, Plant, Ice, Electric — unlocked in Era II. |
| **Red cards** (military) | **Storm cards** / **Offensive spells** | Each era, compare storm/offensive power with neighbors. Win = VP tokens, Lose = -1 VP. Creates an arms-race dynamic: "I see they're investing in storms, I need to match or pivot away." |
| **Green cards** (science) | **Tertiary discovery cards** | Score via set collection: identical symbols = (count)², complete sets of 3 different = 7 VP. Maps to: investing deeply in one tertiary type (depth squared) OR collecting diverse tertiaries (set bonus). This creates the "specialist vs. generalist" tension. |
| **Blue cards** (civilian, pure VP) | **Instrument cards** (direct VP) | Instruments that simply score points — the safe, steady path. |
| **Yellow cards** (commercial) | **Research network cards** | Reduce neighbor trading costs, produce money/resources, or score VP based on your tableau composition. |
| **Purple cards** (guilds, Era III only) | **Wizard council cards** (Era III only) | Score VP based on your neighbors' tableau. "2 VP per Fire card in adjacent players' labs." Rewards paying attention to opponents' strategies. |
| **Coins** | **Insight** | Currency for buying resources from neighbors, and leftover insight converts to VP (3 insight = 1 VP). |
| **Neighbor trading** (buy resources at 2 coins) | **Peer review** (buy element access from neighbors at 2 insight) | Can't refuse. Selling doesn't consume your production. Some Research Network cards reduce peer review cost to 1 insight. |
| **Free build chains** | **Discovery chains** | Era II+ cards that are free if you played a prerequisite in a previous era. "Thermometer" in Era I → "Calorimeter" in Era II for free → "Thermal Reactor" in Era III for free. Discovering foundational knowledge makes advanced discoveries free — science building on science. |

**School board example — School of Combustion (Fire)**:
- **Starting production**: 1 Fire
- **Side A stages**: Stage 1 (cost: 2 any resource) = 3 VP. Stage 2 (cost: 3 resources) = 5 VP. Stage 3 (cost: 4 resources) = 7 VP.
- **Side B stages**: Stage 1 (cost: 2 Fire) = gain 1 Light token (wildcard). Stage 2 (cost: 1 of each primary) = play a card from discard. Stage 3 (cost: 2 secondary + 1 tertiary) = copy any neighbor's science set. Stage 4 (cost: any 7 resources) = 7 VP + 1 free tertiary card.

**Light/Dark in this model**: Light tokens function like coins/gold — universal currency that can substitute for any element when building cards or school stages. They could be earned by: discarding cards (instead of playing/building), certain yellow/commercial equivalents, or school stage bonuses. Dark cards could be a special category (like guilds) that score based on opponent state — your "dark knowledge" of what others have built.

**What this captures well**:
- **Progression through ages** — directly maps to primary → secondary → tertiary, mirroring scientific history
- **School boards as asymmetric starting conditions** — like wonders, they nudge strategy without locking it
- **Draft-based resource competition** — every card you take is one your neighbor doesn't get (major social dynamics)
- **Multiple scoring paths** — military/storms, science/tertiaries, civilian/instruments, commercial, guilds/council — mirrors the "multiple ways to invest" aspect of 7 Wonders
- **Discovery chains** — free builds from prerequisites IS "science building on science"
- **Neighbor economy** — peer review creates structural interdependence
- **The "I see they're investing in storms and I'm way behind" pivot** — drafting reveals strategies and forces adaptation
- **Hate-drafting** — denying opponents cards they need, even if you don't need them (discard for insight)

**What this misses**:
- No triggering chains or cascading engine effects (simultaneous play, no activation sequences)
- Board state is entirely tableau-based — no spatial element
- Engine "building" is more about accumulation than compounding triggers
- The type *interaction* web (synergies, counters, reactions) doesn't have a natural mechanical role

**Design principle scorecard**:
- Discovery as Magic: ★★★★☆ — discovery chains and science scoring feel right; ages mirror history
- World of Interaction: ★★★★☆ — drafting, neighbor trading, military, guilds — strong player interaction
- Progression & Advancement: ★★★★★ — ages directly embody primary → secondary → tertiary advancement

---

### Lens D: The Everdell Clone — "Wizard's City"

**Map our game onto Everdell's framework: worker placement + city tableau with asymmetric season progression.**

| Everdell Concept | Our Mapping | Notes |
|-----------------|-------------|-------|
| **4 resource types** (twigs, resin, pebbles, berries) | **4 primary type energies** (Fire, Earth, Water, Air) | Gathered by placing workers on board locations. |
| **Workers** | **Apprentices** | Start with 2. Gain more each season. Place on board to gather resources or activate locations. |
| **Meadow** (8 face-up cards) | **Arcanum** (8 face-up spell/instrument cards) | Shared display anyone can play from. Refreshes from deck. |
| **City** (15-card tableau) | **Laboratory** (15-card tableau) | Your personal lab of instruments, spells, and constructions. The engine. |
| **Constructions + Critters** | **Instruments + Wizards** | Instruments are "buildings." Wizards are "critters." Each wizard is paired with an instrument — if you have the Crucible (instrument) in your lab, you can recruit the Alchemist (wizard) for free. |
| **Card types** (Tan/Green/Red/Blue/Purple) | Same 5 trigger types for lab cards: **Tan (Discovery)** = once when played. **Green (Production)** = when played + each Spring/Autumn. **Red (Station)** = worker placement spot in your own lab. **Blue (Theory)** = ongoing bonus when playing certain types. **Purple (Mastery)** = end-game conditional VP. | |
| **4 Seasons** (Winter → Autumn) | **4 Scientific Eras** (Antiquity → Renaissance → Industrial → Modern) | Asymmetric advancement — each player chooses when to advance. Advancing = recall apprentices + gain new ones + trigger Production cards. |
| **Exclusive vs shared worker spots** | **Element sources**: exclusive spots (one apprentice blocks it) for concentrated resources. Shared spots for basic gathering. | Pebbles-equivalent = rarest type (the one needed for expensive cards). |
| **Events** (basic + special) | **Breakthroughs** (scientific milestones) | First player to meet criteria (e.g., "have 3 Fire instruments in your lab") claims the breakthrough. VP + bragging rights. |
| **Season advancement** (asymmetric timing) | **Era advancement** (asymmetric timing) | A player can rush to Industrial era for more apprentices, but risks missing Antiquity-era-exclusive opportunities. Another player might linger in Renaissance to maximize Production card triggers before advancing. Timing is everything. |

**Instrument + Wizard pairing example**:
- **Crucible** (Construction/Instrument): Cost 2 Fire + 1 Earth. Green Production card — each Spring/Autumn: gain 1 Metal energy. Has a paired wizard: **Lavoisier**.
- **Lavoisier** (Critter/Wizard): Cost 3 berries-equivalent. Tan Discovery card — when played: choose 1 primary type, gain 2 of it. If you have the Crucible, Lavoisier is **free** — "The founder of chemistry recognizes his own instrument."

**Triggering chain example**: You advance to the Industrial era. All Green Production cards in your lab activate. Your Crucible produces Metal. Your Greenhouse produces Plant. Your Tesla Coil produces Electric. Your Blue Theory card "Unified Field Theory" triggers: "whenever you produce Electric, also gain 1 Magnetic." So you produced Metal + Plant + Electric + Magnetic from a single season advance. Four cascading triggers from one action. Then you place your new apprentices on spots that need those exact resources.

**School as era bonus**: When you advance to each new era, your school provides a unique bonus. Fire school might give extra Fire each era advance. Water school might let you draw extra cards from the Arcanum. This creates the "school nudge" without locking strategy.

**Light/Dark in this model**: Light and Dark could be special resource types generated only by certain cards or breakthroughs. Light functions as a wildcard resource (usable as any type). Dark functions as a "disruption" resource — spend Dark to force an opponent to discard, or to claim a breakthrough that's already been claimed (steal it). This makes pursuing tertiary "dark side" types mechanically meaningful — they generate Dark resources that give you disruptive capabilities.

**What this captures well**:
- **Triggering chains** — Production card cascades during era advancement are exactly the engine payoff we want
- **Wizard-instrument pairings** — the Construction-Critter mechanic is perfect for our scientist-instrument theme
- **Worker placement competition** — shared board with blocking creates meaningful interaction
- **Asymmetric timing** — era advancement decisions add deep strategic texture
- **City/lab building** — the 15-card tableau as a "laboratory" you construct is thematically perfect
- **Blue Theory cards** — ongoing bonuses that reward certain type combinations, making type *interactions* mechanically relevant
- **Card type diversity** — 5 trigger types (Discovery, Production, Station, Theory, Mastery) create varied engine components

**What this misses**:
- Complex — most rules-heavy of the four models
- Worker placement doesn't map to any existing concept in our design (we'd need to introduce "apprentices")
- The board spatial element is functional but not tied to the elemental type geography
- Secondary/tertiary type progression isn't as naturally staged as in 7 Wonders' ages

**Design principle scorecard**:
- Discovery as Magic: ★★★★☆ — wizard-instrument pairings, breakthroughs, Theory card combos
- World of Interaction: ★★★★☆ — worker blocking, Arcanum competition, breakthrough racing, open lab state
- Progression & Advancement: ★★★★★ — era advancement, production cascades, compounding lab engine

---

## Part 4: Synthesis — What Our Game Could Be

### Elements to Pull From Each

| Source | Take This | Because |
|--------|-----------|---------|
| **Splendor** | Elemental types as shared token resources with permanent affinity/discount engine | Tight resource competition; permanent discounts = "the more you know, the easier it gets" |
| **Splendor** | Light tokens as wildcards (E=mc²) | Elegant way to make Light/Dark mechanically meaningful |
| **Wingspan** | Cascading trigger chains from filled action rows | The engine-building payoff — "watch my lab go off" moments |
| **Wingspan** | Shared dice mechanism for resource gathering | The Element Source as a birdfeeder equivalent — shared, visible, tactile |
| **7 Wonders** | Ages/Eras that escalate from primary → secondary → tertiary | Directly embodies Progression principle; mirrors scientific history |
| **7 Wonders** | School boards as asymmetric starting conditions (like wonders) | Nudge strategy without locking it; unique bonuses and progression stages |
| **7 Wonders** | Multiple scoring paths (military/science/civilian) | Creates the "I see they're investing in X, should I compete or pivot?" dynamic |
| **7 Wonders** | Drafting as the primary card acquisition mechanism | Social dynamics, hate-drafting, information from the draft flow |
| **Everdell** | Wizard-instrument pairings with free recruitment | Perfect thematic fit; creates satisfying combo discoveries |
| **Everdell** | 5 card trigger types (when played / production / worker spot / ongoing / end-game) | Engine components with different timing = strategic depth |
| **Everdell** | Asymmetric era advancement | "Do I rush ahead for more actions, or linger to maximize current triggers?" |

### The School Choice — 7 Wonders Wonder Boards

The user's original prompt emphasizes choosing a school at game start (like choosing a wonder). Here's how the 4 base schools could work:

| School | Starting Element | Bonus Track | Encouraged Strategy | Light vs Dark Nudge |
|--------|-----------------|-------------|---------------------|---------------------|
| **School of Combustion** (Fire — Lavoisier) | +1 Fire production | Stages reward aggressive tempo: cheap early VP, escalating to big late plays | Fast engine that burns hot early | Dark side — Radioactive (nuclear power) is the deep payoff |
| **School of Mass** (Earth — Newton) | +1 Earth production | Stages reward infrastructure: each stage gives a persistent production bonus or cost reduction | Slow buildup, fortified position, outlast opponents | Light side — Cosmic (gravity, structure) rewards patient building |
| **School of Fluids** (Water — Archimedes) | +1 Water production | Stages reward flexibility: draw extra cards, peek at draft, gain wildcards | Adaptable, pivot-ready, card advantage | Either — Poison (chemical reactions) for disruption, or healing/flow |
| **School of Pressure** (Air — Torricelli) | +1 Air production | Stages reward control: peek at opponents' hands, force discards, deny resources | Disruptive, deny opponents, tempo control | Dark side — Sound (pressure waves) enables interference |

Each school:
- Gives a **small starting advantage** in its element (like a wonder's starting resource)
- Has **2-4 stages** you build by tucking cards face-down underneath (same as 7 Wonders wonder stages)
- Has **Side A** (straightforward VP) and **Side B** (complex/powerful abilities)
- Creates a **scoring incentive** that nudges you toward certain types or strategies
- Does **NOT lock you into that element** — you can draft anything, but your school makes certain paths slightly more efficient

### The Economy Model — A Hybrid

Based on the analysis, here's a candidate hybrid economy:

**Resource types**:
- **4 Primary type tokens** (Fire, Earth, Water, Air) — shared limited pool, like Splendor gems
- **Light tokens** — shared, strictly limited wildcards (5 total), like Splendor gold
- **Knowledge** (meta-currency) — like coins in 7 Wonders; earned from certain actions, leftover converts to VP

**Card acquisition**: Drafting in ages (like 7 Wonders), but with a shared Arcanum display (like Everdell's Meadow) for non-draft turns

**Card types** (played to your lab tableau):
- **Instruments** — persistent engine pieces with trigger powers (like Wingspan bird powers / Everdell constructions)
- **Spells** — one-time powerful effects (like Everdell Tan cards)
- **Wizards** — paired with instruments; free to play if you have the matching instrument
- **Theories** — ongoing bonuses that reward type combinations (like Everdell Blue cards)

**Engine trigger moments**: When you advance to a new era, all Production instruments in your lab fire (like Everdell season changes + Wingspan row activations)

**Scoring paths** (multiple, like 7 Wonders):
1. **Storm power** — compare offensive capability with neighbors each era (like military)
2. **Discovery sets** — collect tertiary type diversity for set-based scoring (like science)
3. **Lab VP** — instruments and wizards with printed VP values (like civilian structures)
4. **School stages** — VP from building your school's stages (like wonder stages)
5. **Breakthrough bonuses** — first to achieve certain conditions (like Everdell events / Splendor nobles)
6. **Knowledge conversion** — leftover knowledge = VP (like coins)

---

## Part 5: The Three Big Open Questions

### Question 1: Drafting vs. Open Market vs. Hybrid?

| Model | Pros for Our Game | Cons |
|-------|-------------------|------|
| **Pure draft** (7 Wonders) | Strong social dynamics; every pick matters; information flows through the draft | Less control over what you get; harder to plan combos |
| **Open market** (Splendor) | Full information; deep calculation; engine planning is transparent | Can feel cold/calculated; less surprise and discovery |
| **Hybrid** (draft + Arcanum display) | Best of both — draft for core cards, open market for tactical gaps | More complex; two acquisition systems to learn |
| **Deck building** (not in references) | Could discover combos through cycling; shuffle = surprise | Randomness can frustrate; may not fit engine-building feel |

### Question 2: How Much Player Interaction?

Our design vision says "Not a solitaire engine-builder — your engine collides with other players' engines." This rules out pure Wingspan-style isolation. But the interaction needs to serve Discovery and Progression too.

| Interaction Level | Model | Fit |
|-------------------|-------|-----|
| Low (Wingspan) | Shared resource pools, round-end goals, reactive triggers | Safe but may feel isolated |
| Medium (Everdell) | Worker blocking, shared card display, event racing | Good balance of engine-building + competition |
| Medium-High (7 Wonders) | Drafting, neighbor trading, military, guilds | Strong social dynamics, may overshadow engine triggers |
| High (Splendor) | Zero-sum token competition, near-perfect info | Too tight/confrontational? May stifle engine-building |

**Recommendation**: Medium interaction — closer to Everdell/7 Wonders hybrid. Draft for card acquisition (7 Wonders-style social dynamics), shared element source for resources (Wingspan-style dice tower), breakthrough racing (Everdell events), and storm comparison (7 Wonders military). But your lab engine is yours — nobody can destroy your instruments.

### Question 3: What is the Primary Scarcity?

Every engine-builder needs a choke point — the thing that's never enough.

| Candidate | Model | Tension Created |
|-----------|-------|-----------------|
| **Actions/turns** (Wingspan cubes) | Fixed action count per era, decreasing | "I have too many things to do and not enough time" |
| **Type tokens** (Splendor gems) | Shared pool, taking denies opponents | "I need Fire but there's only 2 left and they need it too" |
| **Cards in the draft** (7 Wonders) | Every card you take, your neighbor loses | "Do I take what I need or deny what they need?" |
| **Lab slots** (Everdell city limit) | Fixed maximum instruments/wizards in your lab | "I can only fit 15 things — which engine pieces are most valuable?" |

**Recommendation**: **Cards in the draft** as primary scarcity (drives social dynamics), with **type tokens** as secondary scarcity (drives resource competition). Actions should be sufficient but not abundant — you should feel productive, not starved.

---

## Open Questions

- [ ] How many base schools at launch? 4 (one per primary) or 8 (including secondary)? Or 12 (all)?
- [ ] Should the draft rotate direction each era (like 7 Wonders) or use a different mechanism?
- [ ] How many eras? 3 (like 7 Wonders) or 4 (like Everdell seasons)?
- [ ] Should type tokens exist physically, or is elemental production purely card-based (like 7 Wonders)?
- [ ] How does the Light/Dark pair mechanically manifest? Wildcards vs. disruption?
- [ ] How does Time/Space pair fit? Phase mechanics? Undo/redo? Board positioning?
- [ ] What's the player count target? 2-4? 3-7 (like 7 Wonders)?
- [ ] Should the lab (city) have a slot limit, or can you build infinitely?
- [ ] Can opponents interact with your lab, or is it inviolable?
- [ ] How do storms interact with the era structure?
- [ ] Should school boards have Side A/B variants like wonder boards?
- [ ] How does the "dark side" tertiary mechanic work in a competitive multiplayer context?
- [ ] Should there be a "research" mechanism (like Splendor reserve) where you can hide cards?
- [ ] Is the element source (dice tower) the right resource generation mechanism, or should resources be card-based?
- [ ] How do combo spells and reaction equations (Fire + Poison = Radioactive) work in this framework?

## Playtest Notes

| Date | Concept Tested | Observation | Verdict |
|------|---------------|-------------|---------|
|      |               |             |         |

## Decision

**Chosen**: —
**Rationale**: —
