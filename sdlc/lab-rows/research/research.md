# Lab Rows — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: Wingspan (3 habitat rows with cascading activation)
> **Related Slugs**: production-cascades, permanent-affinity, instrument-wizard-pairings

## What This Mechanic Does

Wingspan's habitat rows are the spatial backbone of its engine-building. The player board has three rows — Forest (top), Grassland (middle), Wetland (bottom) — each tied to a core action:

- **Forest** — "Gain Food": take food dice from the shared birdfeeder
- **Grassland** — "Lay Eggs": place eggs on birds (eggs are a meta-currency for playing more birds and scoring VP)
- **Wetland** — "Draw Cards": draw bird cards from shared deck or face-up tray

Each row has 5 slots. Placing a bird into a row fills the next open slot. When you take a row's action, you get the base action bonus (which increases as you fill slots — the base reward column shifts right) and then activate every bird power in that row **right-to-left**. A bird in slot 3 fires before a bird in slot 2, which fires before slot 1. More birds in a row means:

1. A stronger base action (the printed reward escalates)
2. More trigger activations (each bird with a brown "when activated" power fires)
3. A longer cascade chain (later birds can depend on earlier birds' outputs)

Deeper slots cost eggs to place birds into — slots 1-2 are free, slot 3 costs 1 egg, slot 4 costs 2 eggs, slot 5 costs 2 eggs. This creates a natural investment curve: filling the last slot of a row is expensive but makes that row's action dramatically stronger.

The spatial positioning IS the engine. Where you place a bird matters as much as which bird you play. A bird that says "gain 1 food from the supply" is weak in slot 1 but powerful in slot 5 (it fires after 4 other birds have already triggered). A bird that says "if you gained a worm this turn, tuck a card" only works if a worm-producing bird is to its right.

This is the mechanic the game has been exploring under **Lens B** ("Laboratory Rows") in Decision 006.

## Our Mapping

From Decision 006, Lens B maps Wingspan's three habitats to **three Laboratory Wings**:

| Wingspan Habitat | Our Wing | Base Action | Thematic Grounding |
|------------------|----------|-------------|-------------------|
| Forest (gain food) | **Forge** | Gain type energy from the Element Source | Smelting, extraction, elemental harvesting |
| Grassland (lay eggs) | **Garden** | Grow/cultivate instruments (lay Knowledge tokens) | Botanical gardens, growth, nurturing discoveries |
| Wetland (draw cards) | **Library** | Draw/research spell cards from deck or Arcanum | Archives, research, accumulating knowledge |

Each wing has slots (likely 5, matching Wingspan). **Instruments** are placed into wings, analogous to birds in habitats. Each instrument placed in a wing adds a trigger power to that wing's activation chain.

**Four player actions** (mapped from Wingspan's four):
1. **Install Instrument** — play an instrument card from hand into a wing slot (costs type energy + Knowledge for deeper slots)
2. **Harvest Energy** (Forge action) — gain base energy from Element Source dice, then activate all instruments in the Forge wing right-to-left
3. **Cultivate** (Garden action) — gain base Knowledge tokens, then activate all instruments in the Garden wing right-to-left
4. **Research** (Library action) — draw base spell cards, then activate all instruments in the Library wing right-to-left

**Instrument power types** (mapped from Wingspan brown/pink/white):
- **Brown (chain trigger)**: "When this wing is activated" — fires during the cascade. This is the primary engine-building power.
- **Pink (reactive)**: "When another player does X" — fires on opponents' turns. Cross-player interaction.
- **White (one-time)**: "When installed" — immediate effect when placed, no ongoing trigger.

**Wing engine example** from Decision 006: Your Forge wing contains Crucible (gain 1 Metal), Bellows (gain 1 Fire if you have any Air instrument), Voltaic Pile (if you gained Metal this turn, gain 1 Electric). Taking "Harvest Energy" gives you base energy from the dice, THEN cascades: Crucible fires, Bellows fires, Voltaic Pile fires. One action produces Fire + Metal + Electric from three chained triggers.

## Wing Design Space

### Base Action Scaling

Like Wingspan, the base reward for each wing action should increase as you fill slots:

| Slots Filled | Forge (Energy) | Garden (Knowledge) | Library (Cards) |
|--------------|---------------|-------------------|----------------|
| 0 | Gain 1 energy die | Gain 1 Knowledge on any instrument | Draw 1 card |
| 1-2 | Gain 1 energy die + choice | Gain 2 Knowledge | Draw 1 + peek at 1 |
| 3-4 | Gain 2 energy dice | Gain 2 Knowledge + 1 anywhere | Draw 2 |
| 5 | Gain 2 energy dice + cache 1 | Gain 3 Knowledge | Draw 2 + tuck 1 from discard |

(These are illustrative — exact values need playtesting.)

### Slot Costs

Deeper slots should cost more, creating an investment curve:

| Slot | Cost |
|------|------|
| 1 | Free |
| 2 | Free |
| 3 | 1 Knowledge token |
| 4 | 2 Knowledge tokens |
| 5 | 2 Knowledge tokens |

Knowledge tokens serve as the "eggs" equivalent — a meta-currency needed both for deeper wing placement and for end-game VP.

### Instrument-Wing Affinity

A key design question: **should instruments care which wing they're placed in?**

**Option A — Wing-agnostic**: Any instrument can go in any wing. The brown power always fires when that wing activates. Strategy is purely about chain-building.

**Option B — Wing-typed**: Each instrument has a preferred wing (Forge/Garden/Library icon). Placing in the correct wing gives a bonus (double power, reduced slot cost, etc.). Placing in the wrong wing is allowed but suboptimal.

**Option C — Wing-locked**: Instruments can only be placed in their designated wing. Simpler but less flexible.

Option B feels right — it creates interesting tension between "this instrument is best in the Forge, but my Forge is full and my Library needs bodies" without completely locking choices.

### What Powers Do Instruments Add in Each Wing?

Instruments in different wings emphasize different aspects of the engine:

- **Forge instruments**: Generate energy, convert between types, interact with the Element Source
- **Garden instruments**: Produce Knowledge, interact with other instruments' egg/Knowledge counts, duplicate/copy effects
- **Library instruments**: Draw/filter cards, tuck cards for VP, interact with hand/discard/Arcanum

## Current Lab Structure

The sandbox currently implements the lab as a **flat array** — no spatial structure, no rows, no positional significance.

### Game State (`frontend/src/sandbox/game.js`)

```javascript
players[String(i)] = {
  hand: [],
  lab: [],       // <-- flat array, no wings
  school: null,
  resources: {},
  score: 0,
};
```

- `playCardToLab` pushes a card onto `lab[]` with no positional metadata
- `zoneAtCapacity` checks `lab.length` against `labMaxSize` (a single number)
- `resolveZone` maps `'lab'` to the single flat array
- No concept of sub-zones, rows, or slot positions

### Zone Layout (`frontend/src/shared/zones.js`)

```javascript
lab: { label: 'Lab / Tableau', color: '#2E86C1' }
```

- The lab is one rectangular zone, positioned between schoolBoard (left) and discard (right)
- `calculateZoneBounds` gives it: `x = margin + schoolW + gap`, `w = contentW - schoolW - discardW - gaps`, `h = rowH`
- `hitTestZone` does a simple rectangular bounds check — no sub-zones

### Rendering (`frontend/src/sandbox/renderer.js`)

- `renderCardZone('lab', G.players[pid]?.lab || [])` renders all lab cards in a flat grid
- Cards are laid out left-to-right with `maxPerRow` wrapping, no row/wing distinction
- No visual separation between different types of cards in the lab

### What Would Need to Change

To support spatial lab rows, the following changes are needed:

**Game state** — `game.js`:
- Replace `lab: []` with `lab: { forge: [], garden: [], library: [] }` (or an array of 3 arrays)
- Add slot metadata: each card placement needs a wing and slot index
- `playCardToLab` needs a `wing` parameter
- `zoneAtCapacity` needs per-wing capacity checks (5 slots each = 15 total)
- `resolveZone` needs to handle `'lab-forge'`, `'lab-garden'`, `'lab-library'` sub-zones
- New move: `activateWing(wingName)` — triggers the cascade and returns results

**Zone layout** — `zones.js`:
- Split the single `lab` zone into 3 sub-zones stacked vertically (Forge/Garden/Library)
- Each sub-zone needs 5 clearly marked slot positions
- Sub-zone labels should show the wing name and base action
- `hitTestZone` needs to resolve to specific wings

**Rendering** — `renderer.js`:
- Render 3 distinct rows within the lab area
- Each row shows slot markers (empty slots as dashed outlines)
- Cards placed in slots should snap to fixed positions within the row
- Right-to-left visual ordering to reinforce the activation direction
- Activation animation: when a wing is activated, cards should light up in sequence right-to-left

## Design Tensions

### Complexity: Flat Tableau to Spatial Grid

The single biggest risk. Moving from "play cards to your lab" (one zone, no positioning) to "choose which of 3 wings to place this instrument in, considering slot costs, chain order, and wing-specific bonuses" is a significant cognitive leap. Wingspan manages this complexity because:
- Only 3 rows (not more)
- The actions are clearly distinct (food vs eggs vs cards)
- The board physically shows the rows with printed base rewards
- Players learn one row at a time

We should follow the same approach: 3 wings maximum, each with a visually distinct identity and a clear base action.

### Cognitive Load of Tracking 3 Rows

Each row is its own mini-engine. A player with 4 instruments in the Forge, 3 in the Garden, and 2 in the Library has 9 instrument powers to remember, spread across 3 independent chains. Wingspan mitigates this with bird card powers printed directly on the cards — you read the chain as you activate it. We need the same: instrument powers must be visible at a glance in their slot positions.

### Balance Between Rows

If one wing is clearly stronger than the others, players will stack it and ignore the rest. Wingspan balances this through interdependence: you need food (Forest) to play birds, eggs (Grassland) to fill deeper slots, and cards (Wetland) to have birds to play. Our three wings need the same circular dependency:
- You need **energy** (Forge) to install instruments
- You need **Knowledge** (Garden) to fill deeper slots
- You need **cards** (Library) to have instruments to install

Neglecting any one wing should create a bottleneck.

### Placement Restrictions

Should all instruments go in all wings, or should placement be restricted? Options:
- **Open placement** — maximum flexibility, harder to balance, more decision points
- **Wing-typed instruments** — each instrument has a preferred wing, bonus for correct placement
- **Wing-locked instruments** — each instrument can only go in one wing, simplest but least flexible

### Lab Size: Per-Wing Cap vs Total Cap

Wingspan uses 5 slots per row = 15 total across 3 rows. Everdell caps at 15 cards in a flat city. Our current `labMaxSize` config defaults to 0 (unlimited).

| Approach | Pros | Cons |
|----------|------|------|
| 5 per wing (15 total) | Matches Wingspan, clean grid, balanced rows | Rigid — what if you want 7 in Forge and 2 in Library? |
| 15 total, any distribution | Flexible, allows specialization | One wing could dominate, harder to balance cascades |
| Uncapped | No artificial constraint, pure engine-building | Sprawling boards, balance nightmare, long cascade turns |

The 5-per-wing cap (Wingspan model) is likely correct — it constrains cascade length (max 5 triggers per activation), ensures row balance matters, and creates meaningful "which slot do I fill?" decisions.

### Interaction with Other Lab Cards

Currently the lab is just instruments + spells in a flat pile. With wings, we need to decide: **do spells go into wings?** Or are wings exclusively for instruments (persistent engine pieces), while spells are one-time effects played from hand?

Decision 006's Lens B mapping suggests wings are for **instruments only** (birds = instruments). Spells would be separate — cast from hand, not installed. This keeps wings focused on engine-building while spells provide tactical flexibility.

## Interaction with Other Mechanics

### Production Cascades

Lab rows ARE the production cascade mechanism. The cascade is not a separate system — it emerges from the wing activation chain. When you take a wing's action, every brown-powered instrument in that wing fires in right-to-left order. The cascade IS the row. This is the tightest coupling: lab-rows enables production-cascades. Without rows, cascades would need a different trigger structure.

### Permanent Affinity

Row depth could directly contribute to affinity. Ideas:
- Each instrument in a wing contributes to your permanent affinity for that wing's associated types
- Deeper slots could grant stronger affinity bonuses
- A full wing (5/5 slots) could unlock a wing mastery bonus

This connects Splendor's permanent discount engine to Wingspan's row depth.

### Instrument-Wizard Pairings

From Decision 006's Lens D (Everdell mapping): each wizard is paired with an instrument. If you have the Crucible in your Forge wing, you can recruit Lavoisier for free. Where the instrument is placed (which wing) might matter for the pairing — does Lavoisier need the Crucible specifically in the Forge, or in any wing?

Wizard placement itself is a question: do wizards go into wing slots (consuming a slot), or do they sit alongside/on top of their paired instrument? If wizards consume slots, the 5-slot cap becomes even tighter and pairing decisions become more strategic.

### School Board Stages

Schools could boost specific wings. From Decision 006: "School as starting asymmetry — each player chooses a school card at game start. The school provides a small passive bonus to one wing (e.g., 'Forge wing instruments cost 1 less energy to install')."

This creates meaningful school-wing synergy: the School of Combustion (Fire) might boost the Forge, the School of Fluids (Water) might boost the Library. School choice nudges your wing-building strategy without locking it.

### Storms

Storms are "phenomenon" type combinations — shared environmental effects. In the wing model, storms could:
- Disable a specific wing for a round ("Blizzard freezes the Garden")
- Activate all players' wings simultaneously ("Lightning Storm triggers all Forge instruments")
- Add temporary instruments to all players' wings
- Create a global modifier that changes what a wing's base action produces

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Building a wing chain and watching it cascade for the first time IS a eureka moment. "I put the Crucible before the Voltaic Pile and now I generate Metal AND Electric from one action!" The sequential ordering creates discoverable combos — placement order matters, and finding the right sequence feels like discovering a chemical reaction chain. The science-instrument theme reinforces this: your laboratory literally runs experiments. |
| A World of Interaction | Mixed | Wings create deep CARD interaction (instruments affect each other within chains) but may reduce PLAYER interaction (Wingspan is famously low-interaction). The pink "reactive" powers help, and shared resources (Element Source, card tray) create friction points. But the risk is that players build their labs in parallel with minimal collision. Mitigations: shared Element Source dice, breakthrough racing, storm effects that interact with specific wings. |
| Progression and Advancement | Strong | This is the headline alignment. Early game: sparse wings with 1-2 instruments each. Mid game: wings fill up, cascades grow longer, base actions get stronger. Late game: full wings with 4-5 instrument chains producing massive resource swings from a single action. The progression curve is visible on the board — you can SEE your engine growing as slots fill. Knowledge token costs for deeper slots mirror the "investment leads to compound returns" arc. Matches Wingspan's decreasing action cubes (Research Hours) — fewer actions but each one is more powerful. |

## Database Context

The `type_combination_design` table contains all candidate spell/storm/super_power cards. Currently no entries have `is_selected = 1`, so the full pool represents the design space:

**By mechanic** (all entries):
| Mechanic | Count | Wing Mapping |
|----------|-------|-------------|
| spell | ~108 | Cast from hand (not wing-placed); some may become instrument powers |
| storm | ~48 | Shared environmental effects; could interact with wings |
| super_power | 16 | One per type; ultimate abilities, likely not wing-placed |

**By nature** (all entries):
| Nature | Count | Notes |
|--------|-------|-------|
| spell | ~108 | Direct effects — the "cast from hand" pool |
| phenomenon | ~47 | Natural events — strong storm candidates |
| material | ~14 | Persistent substances — potential instrument-like cards |
| element | ~13 | Elemental byproducts — could be energy/resource outputs |

The "material" nature cards (Glass, Clay, Obsidian, Charcoal, etc.) are the most natural candidates for instrument-like persistent cards that would be placed into wings. The distinction between spell-mechanic cards (cast and discard) and instrument cards (placed in wings permanently) will be a key design decision when building the card pool for playtesting.

## Open Questions

- [ ] Should wing slots be fixed at 5 per wing (Wingspan model), or configurable for sandbox testing?
- [ ] Do instruments go in any wing, or are they wing-typed/wing-locked?
- [ ] Where do wizards physically go — in wing slots, adjacent to paired instruments, or on a separate track?
- [ ] Should spells ever be installable in wings, or are wings instrument-only?
- [ ] What is the activation animation/UX for cascading triggers right-to-left?
- [ ] How do wing base rewards scale — printed on the board (Wingspan) or configurable?
- [ ] Should storms interact with specific wings (e.g., "disable the Garden for 1 round")?
- [ ] How does the Element Source (birdfeeder dice) integrate with the Forge wing activation?
- [ ] Is Knowledge (eggs equivalent) a single generic token, or typed per wing?
- [ ] Should the sandbox allow toggling between flat-lab and wing-lab modes for A/B comparison?
- [ ] How do we render 3 wing rows within the current lab zone without making the table feel cramped?
- [ ] Should wing activation order be configurable (right-to-left, left-to-right, player choice)?
- [ ] Does filling all 5 slots in a wing grant a "mastery" bonus (like Wingspan's end-of-row egg bonus)?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Lens B ("Laboratory Rows") is the primary source for the wing mapping; Lens D (Everdell) provides instrument-wizard pairings and trigger type taxonomy
- `design/philosophy/design-vision.md` — Three Design Principles (Discovery as Magic, A World of Interaction, Progression and Advancement)
- `frontend/src/sandbox/game.js` — Current flat lab state structure (`players[pid].lab = []`)
- `frontend/src/sandbox/renderer.js` — Current flat grid rendering of lab cards
- `frontend/src/shared/zones.js` — Current single-zone lab layout and bounds calculation
- `database/wizard_game.db` (schema: `database/schema.sql`, seed: `database/build.py`) — `type_combination_design` table with mechanic/nature distribution
- Wingspan rulebook — habitat row mechanics, action cube economy, bird power types, slot egg costs
