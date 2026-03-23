# School Board Stages — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: 7 Wonders (wonder boards with stages, Side A/B)
> **Related Slugs**: permanent-affinity, storm-comparison, breakthroughs

## What This Mechanic Does

In 7 Wonders, each player receives a unique **wonder board** at the start of the game. The wonder board provides:

1. **A starting resource** — one of the seven raw/manufactured resource types, produced for free every turn. This is the player's guaranteed economic foundation.
2. **2-4 wonder stages** — printed on the board, each with a **cost** (a set of resources) and a **reward** (VP, special abilities, free builds, or resource production). Stages are built in order by tucking a drafted card face-down underneath the board during the Build phase, meaning you sacrifice a card from the draft to advance your wonder instead of playing it normally.
3. **Side A vs Side B** — every wonder has two sides. Side A is simple and balanced: typically 3 stages with straightforward VP rewards (3/5/7 VP) and generic resource costs ("any 2 resources"). Side B is complex and asymmetric: stages may have 2-4 steps, with powerful abilities (play from discard, copy a neighbor's science symbol, double a resource, gain free builds) but more specific or expensive costs. Side A teaches the game; Side B rewards mastery.

The wonder board creates **asymmetric starting conditions** that nudge players toward certain strategies without locking them in. A player with the Lighthouse of Alexandria (which provides cheap resource flexibility) is nudged toward commerce strategies, but can still pursue military or science. The wonder is a gentle gravitational pull, not a cage.

Key design properties:
- **Stages are irreversible investments** — once you tuck a card, it's gone. The timing of when to build a stage vs. when to play a card is a core decision.
- **Stages are public** — all players can see how far along your wonder is, creating readable board state.
- **Stage costs escalate** — early stages are cheap, late stages expensive, creating a natural progression arc.
- **The tucked card doesn't matter** — any card works. This means you can use hate-drafted or unwanted cards productively.

## Our Mapping

The 4 primary types map directly to 4 base wizard school boards:

| School | Element | Head Wizard | Starting Bonus | Encouraged Strategy |
|--------|---------|-------------|----------------|---------------------|
| **School of Combustion** | Fire | Antoine-Laurent Lavoisier | +1 Fire production | Aggressive tempo — burn hot early, escalate to big plays |
| **School of Mass** | Earth | Isaac Newton | +1 Earth production | Infrastructure — persistent production bonuses, outlast opponents |
| **School of Fluids** | Water | Archimedes of Syracuse | +1 Water production | Flexibility — card advantage, wildcards, pivot-ready |
| **School of Pressure** | Air | Evangelista Torricelli | +1 Air production | Control — peek at hands, force discards, deny resources |

Each school board would provide:
- A **starting element token** of its type (already implemented in `chooseSchool` — gives +1 of the school's element)
- **2-4 stages** built by tucking cards from hand face-down underneath
- **Side A** (straightforward VP) and **Side B** (powerful abilities)
- A **scoring incentive** that nudges toward certain types or strategies without locking

### What About the 8 Secondary/Tertiary Schools?

The database contains 12 total schools (4 primary, 4 secondary, 4 tertiary — see full list below). The 8 non-primary schools could be:
- **Expansion content** — unlocked after players master the base 4
- **Advanced Side B boards** — the secondary school boards could BE the Side B of their parent primaries (e.g., School of Hardness as Side B of School of Mass, since Metal = Fire + Earth)
- **Draft pool expansion** — deal 2 school boards to each player, choose 1 (like Wingspan bonus cards), where the pool includes secondary schools for experienced groups
- **Side C** — a third, expert-level side for players who want maximum asymmetry

The decision of 4 vs. 8 vs. 12 base schools is an open question flagged in the economy design doc (decision 006).

## School Data from DB

All 12 schools with their head wizards, type mappings, and full rosters:

### Primary Schools (Tier 1 — Base Game)

**School of Combustion** (Fire)
- Head: Antoine-Laurent Lavoisier (1743-1794) — Founded modern chemistry; identified oxygen's role in combustion
- Pupil A: James Prescott Joule (1818-1889) — Mechanical equivalent of heat; School of Mechanical Energy
- Pupil B: Joseph von Fraunhofer (1787-1826) — Solar spectroscopy; School of Solar Fire

**School of Mass** (Earth)
- Head: Isaac Newton (1643-1727) — Universal gravitation; laws of motion
- Pupil A: James Hutton (1726-1797) — Uniformitarianism; School of Deep Time
- Pupil B: Alfred Wegener (1880-1930) — Continental drift; School of Shifting Ground

**School of Fluids** (Water)
- Head: Archimedes of Syracuse (287-212 BCE) — Buoyancy principle; pioneered hydrostatics
- Pupil A: Daniel Bernoulli (1700-1782) — Bernoulli's Principle; School of the Current
- Pupil B: Blaise Pascal (1623-1662) — Pascal's Law; School of the Deep

**School of Pressure** (Air)
- Head: Evangelista Torricelli (1608-1647) — Invented barometer; proved atmosphere has weight
- Pupil A: Robert Boyle (1627-1691) — Boyle's Law; School of Compression
- Pupil B: Gaspard-Gustave de Coriolis (1792-1843) — Coriolis effect; School of the Wind

### Secondary Schools (Tier 2)

**School of Hardness** (Metal)
- Head: Friedrich Mohs (1773-1839) — Created Mohs hardness scale

**School of Growth** (Plant)
- Head: Charles Darwin (1809-1882) — Evolution by natural selection

**School of Cold** (Ice)
- Head: William Thomson, Lord Kelvin (1824-1907) — Absolute temperature scale

**School of Current** (Electric)
- Head: Michael Faraday (1791-1867) — Electromagnetic induction

### Tertiary Schools (Tier 3)

**School of the Atom** (Radioactive) — Head: Marie Curie
**School of the Vast** (Cosmic) — Head: Edwin Hubble
**School of Toxicology** (Poison) — Head: Paracelsus
**School of Acoustics** (Sound) — Head: Alexander Graham Bell
**School of Frequency** (Crystal) — Head: Heinrich Hertz
**School of Entropy** (Ghost) — Head: Ludwig Boltzmann
**School of Thermodynamics** (Heat) — Head: Sadi Carnot
**School of Fields** (Magnetic) — Head: James Clerk Maxwell

### Primary Types (Resource Base)

| ID | Name | Tier | Color | State | Archetype |
|----|------|------|-------|-------|-----------|
| 1 | Fire | primary | #E74C3C | plasma | aggressive |
| 2 | Earth | primary | #A0522D | solid | defensive |
| 3 | Water | primary | #2E86C1 | liquid | flow |
| 4 | Air | primary | #AED6F1 | gas | control |

## Stage Design Space

### What Could Stages Reward?

Drawing from 7 Wonders stage rewards and our game's scoring paths:

| Reward Category | Examples | Design Fit |
|----------------|----------|------------|
| **Flat VP** | 3 / 5 / 7 VP per stage | Safe, readable, Side A material |
| **Permanent affinity** | +1 permanent production of school's element, or +1 of a secondary element | Connects to permanent-affinity mechanic; "your school teaches you deeper mastery" |
| **Free card plays** | Play 1 card from discard pile, or play a card for free this era | Tempo advantage; "your school's knowledge lets you skip a step" |
| **Light tokens** | Gain 1-2 Light (wildcard) tokens | Flexibility reward; Light = E=mc^2, universal energy |
| **Extra draft picks** | Look at 2 extra cards during draft, or draft 2 cards in one round | Information/selection advantage |
| **Scoring multipliers** | "2 VP per secondary spell in your lab" / "1 VP per unique type in your lab" | End-game conditional scoring; creates a strategic goal |
| **Storm power bonus** | +2 storm power for military comparison | Connects to storm-comparison mechanic |
| **Discovery set bonus** | Copy one tertiary type symbol you already have (doubles a set piece) | Connects to discovery-sets scoring path |
| **Production triggers** | Trigger all Production instruments in lab (mini-cascade) | Connects to production-cascades mechanic |
| **Resource burst** | Gain 3 tokens of your school's element | Immediate economic boost |

### What Should Stages Cost?

Following 7 Wonders' model where the card itself is always sacrificed (tucked), the *additional* cost printed on the stage could be:

| Cost Model | Description | Tension Created |
|------------|-------------|-----------------|
| **Generic resources** (Side A) | "Pay 2 of any type" / "Pay 3 of any type" | Low barrier, accessible, teaches the mechanic |
| **School-typed resources** (Side B) | "Pay 2 Fire" / "Pay 1 Fire + 1 Earth" | Rewards staying on-type; reinforces school identity |
| **Cross-type requirements** | "Pay 1 of each primary" / "Pay 2 secondary-type tokens" | Rewards breadth and trading; punishes tunnel vision |
| **Lab composition** | "Requires 3+ spells in lab" / "Requires a secondary spell" | Non-resource cost; ties to engine state |
| **Card tucking only** (simplest) | No token cost — just tuck a card | Maximum simplicity; cost is purely opportunity (the lost card) |

## Side A vs Side B

### Side A — The Teaching Board

Straightforward, balanced, predictable. Every school's Side A follows the same template so new players learn the mechanic without worrying about asymmetry.

**Template**: 3 stages, generic costs, flat VP rewards.

| Stage | Cost | Reward |
|-------|------|--------|
| Stage 1 | Tuck a card + pay 2 any tokens | 3 VP |
| Stage 2 | Tuck a card + pay 3 any tokens | 5 VP |
| Stage 3 | Tuck a card + pay 4 any tokens | 7 VP |

Total potential: 15 VP from school stages (significant but not dominant — one scoring path among six).

All four base schools use this exact template on Side A. The only asymmetry is the starting element bonus (+1 Fire / Earth / Water / Air).

### Side B — The Mastery Board

Unique per school. Stages have specific costs, powerful abilities, and create real strategic differentiation. Each school's Side B should reflect the head wizard's scientific contribution and the school's encouraged playstyle.

**School of Combustion (Fire) — Side B** (4 stages, aggressive tempo):
| Stage | Cost | Reward | Flavor |
|-------|------|--------|--------|
| 1 | 2 Fire | Gain 1 Light token | "Lavoisier identifies oxygen — energy is universal" |
| 2 | 1 Fire + 1 Earth | +2 Storm power permanently | "Combustion unleashed — fire as weapon" |
| 3 | 2 secondary tokens | Play 1 card from discard for free | "Chemistry builds on lost knowledge" |
| 4 | 7 any tokens | 7 VP + gain 1 free tertiary spell from draw | "The grand synthesis — fire transforms everything" |

**School of Mass (Earth) — Side B** (3 stages, defensive buildup):
| Stage | Cost | Reward | Flavor |
|-------|------|--------|--------|
| 1 | 2 Earth | +1 permanent Earth production each era | "Newton's foundation — gravity compounds" |
| 2 | 1 of each primary | 2 VP per instrument in your lab at game end | "Universal laws apply to everything you build" |
| 3 | 3 Earth + 2 any | 10 VP | "The immovable object — mass endures" |

**School of Fluids (Water) — Side B** (4 stages, flexible advantage):
| Stage | Cost | Reward | Flavor |
|-------|------|--------|--------|
| 1 | 2 Water | Draw 2 extra cards at start of next draft | "Eureka — Archimedes sees what others miss" |
| 2 | 1 Water + 1 Air | Gain 2 Light tokens | "Fluid dynamics — water takes any shape" |
| 3 | 1 of each primary | Copy 1 discovery set symbol you already have | "Buoyancy — your discoveries float upward" |
| 4 | 5 any tokens | 5 VP + peek at and rearrange top 5 cards of draw | "The master of fluids controls the flow" |

**School of Pressure (Air) — Side B** (3 stages, control/disruption):
| Stage | Cost | Reward | Flavor |
|-------|------|--------|--------|
| 1 | 2 Air | Peek at all neighbors' current draft hands | "Torricelli reads the atmospheric pressure" |
| 2 | 1 Air + 1 Fire | Each opponent discards 1 token of their choice | "Pressure differential — the vacuum pulls" |
| 3 | 2 secondary + 1 tertiary | 3 VP per opponent who has fewer lab cards than you | "Atmospheric dominance — pressure controls everything" |

## Design Tensions

### 1. Balance Across Schools
Side A is trivially balanced (identical template). Side B is where balance gets hard. Each school's Side B rewards need to be roughly equivalent in total value but expressed through different strategic lenses (VP, tempo, flexibility, disruption). This requires playtesting to calibrate.

### 2. Lock-in vs. Freedom
The whole point of the school board is to **nudge without locking**. If Side B stages require only school-typed resources (e.g., Combustion requires all Fire), players feel locked. If costs are too generic, the school identity dissolves. The sweet spot: early stages use school-typed costs (reinforce identity), later stages require cross-type costs (reward breadth, force engagement with the broader economy).

### 3. Stage Timing vs. Card Value
Tucking a card to build a stage means you lose that card's potential. In 7 Wonders, the tension is "do I play this strong card or sacrifice it to build my wonder stage?" This is strongest when the cards being tucked have real value — weak cards make stage-building a no-brainer, which removes the interesting decision. The draft needs to consistently produce hands where there's genuine tension between playing and tucking.

### 4. Cost vs. Reward Timing
Early stages should be cheap and immediately useful (resources, small VP, Light tokens). Late stages should be expensive and pay off at end-game (conditional VP multipliers, powerful abilities). If late stages are too cheap, everyone races to complete them. If early stages are too expensive, no one builds them and the mechanic is dead weight.

### 5. Number of Stages
7 Wonders uses 2-4 stages depending on the wonder. More stages = more decisions but more diluted per-stage impact. Fewer stages = each stage feels momentous but less progression arc. Recommendation: Side A = 3 stages (consistent, teachable), Side B = 3-4 stages (varies by school for asymmetry).

### 6. Interaction with Era Advancement
Should stages be era-gated? (e.g., Stage 2 only buildable in Era II+). 7 Wonders doesn't gate stages by age — you can build all 3 in Age I if you have the resources. But our era advancement is more significant (primary -> secondary -> tertiary cards). Gating could reinforce the progression arc but limit player agency.

## Interaction with Other Mechanics

### Permanent Affinity (permanent-affinity)
Stages could **grant** permanent affinity as a reward. "Build Stage 2 of School of Combustion: gain permanent +1 Fire affinity." This creates a reinforcing loop — your school gives you affinity in your element, which makes your element cheaper, which lets you cast more of your element's spells. The danger is that this loop becomes too self-reinforcing and locks players deeper into their starting type. Balance lever: later stages grant affinity in non-school types to encourage branching out.

### Production Cascades (production-cascades)
A stage reward could trigger all Production instruments in your lab — a mini-cascade outside the normal era-advancement trigger. This connects stage-building to your engine state: the more Production instruments you have, the more valuable this stage reward becomes. It rewards players who have already invested in engine infrastructure.

### Storm Comparison (storm-comparison)
Stages could grant flat storm power bonuses (+2, +3) that persist for the rest of the game. This gives schools like Combustion (aggressive) a natural path to storm dominance while schools like Fluids (flow) might gain storm power through other means. It also creates a readable signal — "they built Stage 2, so they have +2 storm power now, I need to account for that."

### Breakthroughs (breakthroughs)
Stage completion could count toward breakthrough requirements. For example, a breakthrough might require "complete 2 school stages AND have 3 secondary spells in lab." This means stage-building isn't just its own scoring path — it's a prerequisite for claiming other scoring opportunities. Alternatively, a stage reward could directly grant a breakthrough claim.

### Discovery Sets
A stage reward could grant a virtual discovery set symbol (copy one you already have, or gain a specific tertiary symbol). This connects the school progression to the science-style scoring path and creates interesting decisions about which symbol to copy.

### Discovery Chains
In 7 Wonders, free build chains (prerequisite -> advanced card for free) exist alongside wonder stages. Our discovery chains could interact with stages: perhaps a stage reward makes the next discovery chain card in your sequence free, or building a stage counts as having played a prerequisite for chain purposes.

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Each school is led by a real scientist whose contributions are reflected in stage rewards. Building stages feels like progressing through a scientist's body of work — Lavoisier identifies oxygen (Stage 1), unleashes combustion (Stage 2), synthesizes chemistry (Stage 3). The Side B abilities are "eureka moments" that players discover by engaging deeply with a school. |
| A World of Interaction | Moderate | School boards create readable asymmetry — you can see what school your opponents chose and how many stages they've built, which informs your draft decisions (do you deny them resources for their next stage?). Stages themselves don't directly interact with opponents (unlike 7 Wonders military), but they interact with all other scoring paths (storm, discovery, breakthroughs). Cross-type stage costs force engagement with the broader resource economy and neighbor trading. |
| Progression and Advancement | Very Strong | This is the mechanic's greatest strength. Stages are literally a progression track built into the game board. The arc from cheap Stage 1 to expensive Stage 3-4 mirrors primary -> secondary -> tertiary type advancement. Building stages feels like advancing through eras of scientific understanding. Side B stages with escalating power rewards create the compounding investment payoff the principle demands. |

## Open Questions

- [ ] How many base schools should ship? 4 (primaries only) or 8 (primary + secondary)? The secondary schools have rich thematic identity (Darwin, Faraday, Kelvin, Mohs) and could serve as Side B or as separate boards.
- [ ] Should Side B be unique per school (7 Wonders model) or should there be a shared "advanced" template with school-specific cost flavoring?
- [ ] What is the VP budget for school stages relative to other scoring paths? In 7 Wonders, wonder stages are worth roughly 10-20% of a winning score. Is 15 VP (Side A total) the right number for our game?
- [ ] Should stages require tucking a card (7 Wonders style) or just paying resources? Tucking creates draft tension but adds a rule. Resource-only costs are simpler but lose the "sacrifice a card" decision.
- [ ] Can you build stages during the draft phase (like 7 Wonders) or only during the play phase? Draft-phase building creates the core "play vs. tuck" tension.
- [ ] Should stages be era-gated? (Stage 2 requires Era II, Stage 3 requires Era III.) This reinforces progression but limits agency.
- [ ] How do tertiary schools (Radioactive, Cosmic, etc.) fit? Are they unlockable mid-game by completing your primary school? Are they separate boards dealt to experienced players?
- [ ] Should the school board display the head wizard's portrait and flavor text, or just mechanical information? (Connects to the open question in design-vision about how front-and-center the lore should be.)
- [ ] Is there a "build all stages" bonus (like 7 Wonders expansions add)? Or is completing all stages its own reward?
- [ ] How does `calcSchoolStages` in scoring.js need to change? Currently returns flat 2 VP. Needs to read stage data (cost, reward, built status) from the player's school board state.

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Part 3 Lens C (7 Wonders clone), Part 4 synthesis, school choice section, scoring paths definition, open questions on school count and Side A/B
- `design/philosophy/design-vision.md` — Three design principles: Discovery as Magic, A World of Interaction, Progression and Advancement
- `frontend/src/sandbox/game.js` — Current `chooseSchool` move (lines 190-208): assigns school from head wizards, grants +1 starting token of school's element. Player state has `school: null` until chosen. School data comes from `catalog.wizards.filter(w => w.role === 'head')`.
- `frontend/src/sandbox/scoring.js` — `calcSchoolStages` (lines 61-63): placeholder returning flat 2 VP if player has a school, 0 otherwise. Registered as "School Stages" scoring path with color `#F4D03F`.
- `database/wizard_game.db` (via `database/build.py`) — `wizard_school_design` table: 12 schools (4 primary, 4 secondary, 4 tertiary), each with head wizard + 2 pupils. `types` table: 4 primary types (Fire/Earth/Water/Air) with state-of-matter and archetype mappings.
