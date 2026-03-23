# Storm Comparison — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: 7 Wonders (military shields comparison each age)
> **Related Slugs**: school-board-stages, breakthroughs, production-cascades

## What This Mechanic Does

In 7 Wonders, **red military cards** give shields (1-3 per card). At the end of each Age, every player compares their total shield count with each immediate neighbor (left and right). For each comparison:

- **Winner** receives a Victory token worth escalating VP: **+1 VP** (Age I), **+3 VP** (Age II), **+5 VP** (Age III).
- **Loser** receives a **-1 Defeat token** (flat, all ages).
- **Tie** — no tokens awarded either direction.

This creates an **arms race dynamic**: you can see your neighbors' red cards accumulating (all played cards are public), so you know whether you're ahead or behind. The escalating rewards mean ignoring military in Age III is very costly if your neighbor invested. But over-investing is also a trap — every red card you draft is one fewer science/civilian/commercial card. The -1 penalty is deliberately light so that a player can choose to concede military entirely and win through other paths, accepting the small penalty.

Key behavioral effects:
- **Tension at draft time**: "My left neighbor just played a second shield — do I need to respond?"
- **Positional dependence**: Your military score only matters relative to immediate neighbors, not the whole table. You can lose both comparisons and still win the game.
- **Sunk cost awareness**: Once you're clearly behind a neighbor in shields, additional military investment against them is wasted unless you can overtake. Better to invest elsewhere.
- **Escalating stakes**: The +1/+3/+5 curve means Age I military matters least; Age III matters most. Late military investments have the highest payoff per card.

## Our Mapping

The 7 Wonders military mechanic maps onto our game as **Storm Power** — offensive capability compared with adjacent players at era boundaries.

### What Contributes to Storm Power

The current `calcStormPower()` in `scoring.js` counts lab cards with `nature === 'material' || nature === 'force'`. However, there is a **schema mismatch**: the `type_combination_design` table's nature column only allows values `('spell', 'element', 'phenomenon', 'material', 'effect')` — there is no `'force'` nature in the database. This means `calcStormPower` currently only counts `material`-nature cards, and the `force` check matches nothing.

**Decision needed**: Which card natures should contribute to storm power?

| Candidate Nature | Count (build.py + insert_gaps.py) | Flavor Fit | Notes |
|---|---|---|---|
| `material` | ~18 total | Medium — materials are "stuff," not inherently offensive | Pebble Wall, Glass, Obsidian, Clay, Charcoal, Ore Vein, Coral, Conductor, etc. Many are defensive/utility |
| `spell` (subset) | ~116 total | High — many spells are offensive (Forge Strike, Napalm, Plasma Arc) | Too broad to use the whole category; would need a sub-classification |
| `phenomenon` (storm mechanic) | ~83 total | High — these are storms by design | Already mapped to the `storm` mechanic; using them for storm *power* creates a naming collision |
| `element` | ~12 total | Low — elements are raw substances | Steam, Molten Slag, Mud, Ash — raw materials, not weapons |
| `effect` | ~10 total | Medium — effects modify state | Only in insert_gaps.py; niche |

**The core tension**: The current nature taxonomy (`spell/element/phenomenon/material/effect`) classifies what a combination *is*, not what it *does strategically*. Storm power needs an offensive/defensive axis that doesn't currently exist in the data model. Options:

1. **Add a new column** (e.g., `strategic_role` with values like `offensive`, `defensive`, `utility`, `production`) to `type_combination_design`.
2. **Add a `force` nature** to the schema CHECK constraint and re-tag appropriate cards.
3. **Use the `mechanic` column** — cards with `mechanic = 'storm'` could contribute to storm power (currently ~83 phenomenon/storm cards). But these are storms themselves, not cards that *give* storm power.
4. **Tag offensive cards by convention** — e.g., all `spell`-nature cards with certain type combinations (Fire-heavy, Metal-heavy) count toward storm power. Derive it from type composition rather than explicit tagging.

### VP Values

Following 7 Wonders' escalating model mapped to our 3-era structure:

| Era | Win VP | Lose VP | 7W Equivalent |
|---|---|---|---|
| Era 1 (Primary/Classical) | +1 | -1 | Age I |
| Era 2 (Secondary/Enlightenment) | +3 | -1 | Age II |
| Era 3 (Tertiary/Modern) | +5 | -1 | Age III |

Each player compares with left neighbor and right neighbor separately = up to 2 comparisons per era = maximum of +10 VP from storm in Era 3 alone, or +18 total across all eras. Minimum is -6 (losing all 6 comparisons).

### Era Advance Trigger

The current `advanceEra` move in `game.js` simply increments `G.era` and transitions to the draft phase. Storm comparison would happen here — after all players finish the play phase, before dealing new draft hands:

```
play phase ends → STORM COMPARISON (new) → era increments → draft phase begins
```

This is analogous to 7 Wonders' end-of-age military resolution happening between ages.

## Current Card Data

### Nature Distribution (all cards in DB, from build.py + insert_gaps.py seed data)

| Nature | Mechanic | Approx Count | Role |
|---|---|---|---|
| `spell` | `spell` | ~116 | Direct-cast abilities — the bulk of the card pool |
| `phenomenon` | `storm` | ~83 | Board-wide environmental effects |
| `phenomenon` | `spell` | ~22 | Environmental effects cast as spells |
| `material` | `spell` | ~18 | Physical substances — defensive/utility |
| `element` | `spell` | ~12 | Raw elemental substances |
| `effect` | `spell` | ~10 | State-modifying effects |

### Material-Nature Cards (what `calcStormPower` currently counts)

Primary tier (single-type):
- Pebble Wall (Earth), Mist Veil (Water), Breeze Ward (Air) — all defensive shields

Primary cross-type:
- Glass (Fire+Earth), Charcoal (Fire+Plant), Obsidian (Fire+Ice), Clay (Earth+Water), Sand (Earth+Water), Ore Vein (Earth+Metal), Fertile Soil (Earth+Plant), Fossil (Earth+Plant), Fulgurite (Earth+Electric), Coral (Water+Plant), Conductor (Metal+Electric)

From insert_gaps.py:
- Resin Torch (Fire+Plant), Slag Coat (Earth+Metal), Glacial Erratic (Earth+Ice), Permafrost Anvil (Metal+Ice)

**Observation**: Most material cards are defensive or utility (walls, shields, raw substances). They do not intuitively represent "offensive storm power." This suggests the current `calcStormPower` implementation is a placeholder and the card classification needs design work before the storm comparison mechanic can function meaningfully.

### No `force` Nature Exists

The `force` check in `calcStormPower` matches zero cards. If we want a distinct offensive nature, it would need to be added to both the schema and the card data.

## Design Tensions

### 1. Arms Race vs. Engine Building

Storm comparison creates an arms race that competes with engine-building investment. Every card drafted for storm power is one fewer card for discovery sets, lab VP, or production cascades. In 7 Wonders this tension is healthy because military cards are simple (no combos, just shield numbers), making them a straightforward but expensive "insurance policy."

**Question for our game**: Are storm/offensive cards similarly simple, or do they also participate in the engine (type combos, cascade triggers)? If offensive cards *also* contribute to your engine, the tension dissolves — everyone wants them anyway. If they're pure storm-power cards with no engine value, the tension is sharp but may feel like a "tax."

### 2. Sunk Cost and Wasted Investment

If you're already winning the storm comparison with a neighbor, additional storm cards against that neighbor have zero marginal value. In 7 Wonders this is mitigated because you can't know exactly what your neighbor will draft next — they might catch up. In our game, if lab cards are public, the information may be too perfect, reducing the bluffing/uncertainty that makes the arms race interesting.

### 3. Catch-Up Mechanisms

The -1 VP penalty in 7 Wonders is deliberately mild. A player who completely ignores military takes at most -6 VP (3 ages x 2 neighbors x -1), which is recoverable through strong science or civilian scoring. This is essential — without a viable "opt out" path, military becomes mandatory rather than a strategic choice.

**Our equivalent**: If the penalty is too harsh, storm power stops being one of many victory paths and becomes a prerequisite. If too mild, nobody invests and the mechanic is dead. The 7 Wonders formula (-1 per loss, escalating wins) is well-tested and worth preserving.

### 4. Player Count and Neighbor Comparison

Neighbor comparison only creates meaningful interaction with 3+ players. At 2 players, you have one neighbor — storm comparison becomes a zero-sum duel. At 3+ players, the positional game emerges: you might be strong against your left neighbor but weak against your right, creating asymmetric incentives.

**Our sandbox currently supports configurable player counts.** The mechanic should degrade gracefully at 2 players (perhaps a single comparison with doubled stakes?) and shine at 3-5 players.

### 5. Information Asymmetry

7 Wonders' military information is fully public (red cards are played face-up), but your *future* drafts are hidden. This creates the right amount of uncertainty — you can see the current state but must guess the trajectory.

In our game, cards in the lab are visible but the hand is private. During the draft, you see what your neighbor passes to you (revealing what they *didn't* pick). This matches 7 Wonders' information model well.

## Interaction with Other Mechanics

### School Board Stages (`school-board-stages`)

Wizard school boards could provide storm-related bonuses:

- **School of Combustion (Fire)**: Stage bonus grants +1 storm power per Fire card in lab. Nudges Fire players toward the aggressive archetype.
- **School of the Forge (Metal)**: Stage bonus grants +1 storm power per material-nature card. Turns defensive materials into offensive assets.
- Side B school variants could offer storm-specific stages: "Pay 3 resources: gain 3 storm power for this era."

This creates asymmetric storm investment — some schools make storm power cheaper to accumulate, giving those players a natural inclination toward the military path without locking them in.

### Production Cascades (`production-cascades`)

Storm comparison happens at era boundaries, which is the same moment production cascades trigger (era advance fires all production instruments). This creates a natural sequence:

1. Era advance triggered
2. Storm comparison resolved (VP tokens awarded)
3. Production cascades fire
4. New draft hands dealt

The cascade firing *after* storm comparison means production instruments don't help your storm score — they help your *next* era's engine. This is clean separation.

Alternatively, some production instruments could generate "storm tokens" as part of their cascade — a way to build storm power through your engine rather than through pure card accumulation.

### Permanent Affinity (`permanent-affinity`)

If played cards grant permanent type affinity (reducing future costs), storm cards should also grant affinity. This prevents storm investment from being "dead" for your engine — even if a card's primary purpose is storm power, its type affinity feeds your discount engine.

Example: Playing a Fire+Metal offensive spell gives storm power AND permanent Fire+Metal affinity, making future Fire and Metal cards cheaper. The storm card thus has dual value.

### Breakthroughs (`breakthroughs`)

Storm-related breakthrough milestones create racing incentives:

- "First player to reach 5 storm power" — claim a breakthrough worth 3 VP
- "Win storm comparison in all 3 eras" — end-game breakthrough worth 5 VP
- "Win a storm comparison by 3+ margin" — dominance breakthrough worth 2 VP

These reward not just investing in storm power but *excelling* at it, creating a secondary incentive layer beyond the base comparison VP.

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Medium | Storm comparison itself is straightforward (count and compare), not discovery-rich. But *which cards contribute* to storm power could be discoverable — e.g., learning that certain type combinations are more offensively potent than others mirrors learning which elements are dangerous in nature. Fire+Metal = forge weapons. Water+Electric = lethal conductivity. |
| A World of Interaction | High | This is the mechanic's strongest fit. It creates direct, visible, positional player interaction every era. You see your neighbor building storm power and must decide: match them, exceed them, or concede and invest elsewhere. The neighbor comparison structure means your position at the table matters — exactly the "your engine collides with other players' engines" vision from the design doc. |
| Progression and Advancement | High | Escalating VP per era (+1/+3/+5) directly embodies progression. Early storm investment is low-stakes; late storm dominance is game-changing. The era structure means storm power "resets" the comparison context — you could lose Era 1 and win Era 3 for a net positive. This mirrors scientific history: early discoveries are modest; modern breakthroughs reshape everything. |

## Open Questions

- [ ] What card attribute should determine storm power contribution? Options: (a) add a `strategic_role` column, (b) add `force` to the nature enum, (c) derive from type composition, (d) use the existing `mechanic = 'storm'` column.
- [ ] Should storm power be a simple card count (like 7W shields = 1-3 per card), or should it be a calculated value based on card properties (type amounts, tier, etc.)?
- [ ] Should some cards contribute fractional or bonus storm power (e.g., a Fire+Metal card gives 2 storm power while a Water+Plant card gives 1)?
- [ ] How does the -1 VP penalty interact with the scoring display? Is it tracked as a separate negative, or subtracted from the storm score path?
- [ ] At 2 players, should storm comparison be modified (doubled stakes, single comparison) or kept identical to 3+ player rules?
- [ ] Should storm power persist across eras (cumulative, like 7W) or reset each era (only cards played *this era* count)?
- [ ] Should there be a "storm track" on the school board that accumulates storm tokens, or is it purely derived from lab state?
- [ ] Can production cascades generate storm power, or is storm power strictly from played cards?
- [ ] How visible should storm power be? Always shown (like 7W public shields), or only revealed at comparison time?
- [ ] Should the `calcStormPower` function in scoring.js be the authoritative scoring or should storm comparison VP be tracked separately as tokens (matching 7W's physical token model)?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Lens C (7 Wonders Clone) section, lines 266-312. Defines red cards as "Storm cards / Offensive spells," describes comparison mechanic, -1 VP loss, arms-race dynamic. Lists storm power as scoring path #1 in the hybrid economy model (line 420).
- `design/mechanics/storms.md` — Storm catalog (board-wide environmental effects). Note: these storms are *environmental effects*, distinct from storm *power* for comparison. The naming overlap needs resolution — "storm" means both "weather event" and "offensive capability."
- `design/philosophy/design-vision.md` — Three design principles. "Not a solitaire engine-builder" (line 94) directly supports adding a comparison mechanic.
- `frontend/src/sandbox/game.js` — Current era advance logic (`advanceEra` move, line 301). Simply increments era and changes phase; no storm comparison hook exists yet.
- `frontend/src/sandbox/scoring.js` — `calcStormPower()` (lines 10-15). Counts material/force nature cards. Has the `force` nature mismatch with the DB schema.
- `frontend/src/shared/data.js` — `loadSpellCards()` loads ALL `type_combination_design` rows (no `is_selected` filter), meaning every card in the DB is available in the sandbox.
- `database/schema.sql` — `type_combination_design` table (line 94). Nature enum: `spell, element, phenomenon, material, effect`. No `force` value. Mechanic enum: `spell, storm, super_power`.
