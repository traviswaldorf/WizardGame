# Production Cascades — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: Wingspan (habitat row activation), Everdell (season Production triggers)
> **Related Slugs**: permanent-affinity, lab-rows, instrument-wizard-pairings

## What This Mechanic Does

### Wingspan: Habitat Row Activation

In Wingspan, a player's board has 3 habitat rows (Forest, Grassland, Wetland), each with 5 slots. When a player takes an action corresponding to a habitat — e.g., "Gain Food" in the Forest — they place their action cube on the leftmost open slot, gain the base action bonus, then activate all bird powers in that row **right-to-left**. A Forest with 4 birds means 4 separate power triggers cascade in sequence after the base action.

Bird powers come in three timing types:
- **Brown ("when activated")** — fire every time the row is activated. These are the cascade engine.
- **Pink ("between turns")** — fire reactively when another player does something specific.
- **White ("once, when played")** — fire only on placement.

The cascade feeling comes from Brown powers stacking: you spend 3 turns placing birds in a row, and on turn 4 you take one action and get 4+ effects chaining off each other. The engine *compounds* — each new bird added to the row makes every future activation of that row more powerful. This is the "watch my engine go" payoff moment.

Key constraint: action cubes are strictly limited (8 total, decreasing by 1 per round: 8, 7, 6, 5 = 26 total actions). So every action spent building the engine is one not spent exploiting it. The tension between building and running the engine is the core strategic decision.

### Everdell: Season Production Triggers

In Everdell, cards in your city (tableau of up to 15) are tagged with one of five trigger types:
- **Tan (Discovery)** — once, when played
- **Green (Production)** — fires when played AND again each time you advance to a new season
- **Red (Station)** — creates a worker-placement spot in your city
- **Blue (Theory/Governance)** — ongoing bonus triggered by playing certain card types
- **Purple (Mastery/Prosperity)** — end-game conditional VP scoring

When a player chooses to "Prepare for Season" (advance to the next era), they recall all workers and gain new ones, then **all Green Production cards in their city fire simultaneously**. With 5 Production cards in your city, a single season advance generates 5 separate effects — resources, card draws, VP, or other bonuses cascading from one decision.

The asymmetric season advancement adds a timing dimension: you choose *when* to advance. Lingering in a season lets you use workers more, but advancing sooner gets you more workers and triggers your Production engine earlier. Players can be in different seasons simultaneously, creating tempo imbalance as a strategic tool.

### The Cascade Feeling

Both games deliver the same emotional payoff: the player invests multiple turns building an engine of cards, then takes a single action that fires the entire chain. The satisfaction is proportional to the number of triggers — more cards in the row/city = more dramatic the cascade = more rewarding the investment. This is the compounding engine-building crescendo that directly maps to our Progression and Advancement principle.

## Our Mapping

### Card Trigger Types in the Lab

Drawing from the Everdell lens in decision 006, lab cards would carry one of five trigger types:

| Trigger Type | When It Fires | Example |
|---|---|---|
| **Discovery** (Tan) | Once, when played to lab | Lavoisier (wizard): "When played, choose 1 primary type, gain 2 of it" |
| **Production** (Green) | When played + on each era advance | Crucible (instrument): "Each era advance: gain 1 Metal energy" |
| **Station** (Red) | Provides a personal worker/action spot | Tesla Coil: "Place an apprentice here to gain 1 Electric" |
| **Theory** (Blue) | Ongoing, triggers when a condition is met | Unified Field Theory: "Whenever you produce Electric, also gain 1 Magnetic" |
| **Mastery** (Purple) | End-game scoring | "3 VP per tertiary spell in your lab" |

### The Era Advance as Cascade Trigger

Currently in `game.js`, the `advanceEra` move is minimal:

```js
advanceEra: ({ G, events }) => {
  if (G.era < 3) {
    G.era++;
    events.setPhase('draft');
  }
}
```

This would become the cascade trigger point. On era advance:
1. Increment era counter
2. **Resolve all Production cards in the player's lab, in order** (left-to-right or right-to-left — order matters)
3. Resolve any Theory card triggers that chain off Production outputs
4. Then transition to draft phase for next era

### What Do Production Cards Produce?

Based on the existing type system and economy from decision 006:

| Output Category | Examples | Design Notes |
|---|---|---|
| **Type tokens** | "Gain 1 Metal energy" / "Gain 1 Fire" | Most common. Maps to the Splendor-style permanent affinity engine. Instruments tied to their type naturally produce that type's energy. |
| **Card draws** | "Draw 1 spell card" / "Draw from the Arcanum" | Information advantage. Feeds hand for next era's play phase. |
| **VP** | "Gain 1 VP" / "Gain VP equal to your Fire affinity" | Direct scoring. Scales with engine investment over eras. |
| **Knowledge** | "Gain 2 Knowledge" (meta-currency, 3 = 1 VP) | Flexible resource that converts to VP at end. |
| **Secondary effects** | "All opponents discard 1 token" / "Peek at top 3 cards of draw pile" | Interaction layer. Keeps cascades from being pure solitaire. |

### Order and Sequencing

Two viable models:

1. **Positional order (Wingspan-style)**: Cards fire based on their physical position in the lab — left-to-right or right-to-left. This means *where* you place a card matters, not just *what* it does. Players must think about placement order when building their lab. This maps naturally to the lab-rows mechanic if labs have spatial structure.

2. **Simultaneous (Everdell-style)**: All Production cards fire at once, with no ordering dependency. Simpler to resolve but loses the combo-chaining feeling where one card's output feeds the next card's condition.

The Wingspan-style positional order is more interesting for our game because it creates another axis of decision-making (placement strategy) and enables Theory cards to chain off Production outputs within the same cascade.

### Cascade Example

A player's lab in Era 2 contains (left to right):
1. **Crucible** (Production): Gain 1 Metal
2. **Bellows** (Production): Gain 1 Fire if you have any Air instrument in lab
3. **Unified Field Theory** (Theory): Whenever you gain Metal, also gain 1 Electric
4. **Voltaic Pile** (Production): If you gained Electric this turn, gain 1 Light

On era advance to Era 3:
- Crucible fires -> gain 1 Metal
- Unified Field Theory triggers off the Metal gain -> gain 1 Electric
- Bellows fires -> player has no Air instrument, no Fire gained
- Voltaic Pile fires -> player gained Electric this turn, gain 1 Light
- Net output from one era advance: 1 Metal + 1 Electric + 1 Light

This is exactly the "watch my engine go" moment from Wingspan — three Production cards and one Theory card chain together to produce a cascade of diverse resources from a single action.

## Design Tensions

### Complexity of Resolution

Each cascade requires tracking: which cards have fired, what was produced, which Theory cards triggered, and whether any secondary effects resolve. With 5+ Production cards and Theory cards chaining, this can become mentally taxing. Digital implementation handles this automatically, but tabletop-first design needs to keep resolution tractable.

*Mitigation*: Cap Production effects at simple, atomic outputs (gain 1 of X, draw 1 card, gain 1 VP). Avoid conditional chains deeper than 2 levels. Theory cards should trigger off Production outputs but not off other Theory triggers.

### State Tracking Mid-Cascade

The current `game.js` state shape tracks `player.resources` as a simple object and `player.lab` as an array of cards. Mid-cascade, the game needs to track "resources gained this cascade" separately from "total resources" so that conditional triggers (like Voltaic Pile's "if you gained Electric this turn") can evaluate correctly.

This requires adding temporary cascade state — something like `G.cascadeContext = { gained: {}, triggered: [] }` — that gets created at cascade start and cleared at cascade end.

### Player Agency During Cascades

Two models:
- **Automatic resolution**: All Production cards fire in fixed order with no player input. Faster, cleaner, but players are passive spectators of their own engine.
- **Guided resolution**: Players choose the order or make micro-decisions during the cascade (e.g., "Crucible produced Metal — do you send it to your reserve or your affinity track?"). More engaging but slower and more complex.

*Recommendation*: Start with automatic resolution for the sandbox prototype. The agency should come from *building* the engine (card placement decisions), not from *running* it. Wingspan uses fully automatic activation and it works.

### Balance of Cascade Power Across Eras

Cascades fire on era advance (end of Era 1 -> start of Era 2, end of Era 2 -> start of Era 3). This means:
- Era 1 -> 2 advance: Player might have 1-2 Production cards. Weak cascade.
- Era 2 -> 3 advance: Player might have 3-5 Production cards. Strong cascade.
- End of Era 3: No advance, no final cascade (unless we add an end-game cascade trigger).

This naturally creates the progression curve — early cascades are modest, late cascades are dramatic. But it raises a question: should there be a final cascade at game end? Everdell triggers Production on the last season advance. Without a final trigger, Production cards played in Era 3 never cascade, making them weaker than Era 1-2 Production cards.

*Options*: (a) Add a "final experiment" phase at game end where all Production cards fire one last time. (b) Era 3 Production cards have higher base VP to compensate. (c) Accept that late Production cards are weaker — this is a strategic consideration (don't draft Production cards late).

### Interaction Between Cascade Outputs and Other Mechanics

Cascade outputs (type tokens, cards, VP) feed into the rest of the economy. If cascades produce too many tokens, they could undermine the token scarcity that drives the Splendor-style competition. If they produce too many cards, hand management becomes a problem between eras.

*Mitigation*: Production card outputs should be modest individually (1 token, 1 card, 1 VP) but meaningful in aggregate. The power comes from having many fire at once, not from any single card being overpowered.

## Interaction with Other Mechanics

### Permanent Affinity

Cascades and permanent affinity interact in two directions:
- **Cascades feed affinity**: If playing a spell card to the lab grants a permanent discount in that type (Splendor-style), then Production cards that generate tokens help you *cast more spells*, which builds more affinity. The cascade is the engine that accelerates affinity accumulation.
- **Affinity gates cascades**: Theory cards could trigger based on affinity thresholds ("if your Fire affinity is 3+, this Production card produces 2 instead of 1"). Higher affinity makes cascades more powerful, creating a flywheel.

### Lab Rows

If the lab has spatial structure (rows or columns like Wingspan habitats), then cascade ordering becomes positional. Cards in the same row fire in sequence. Different rows could fire on different triggers:
- **Forge row** cascades when you take a "Harvest Energy" action (Wingspan-style per-action activation)
- **All rows** cascade on era advance (Everdell-style season trigger)

This hybrid would give players both per-action mini-cascades and per-era mega-cascades, with lab row placement as the strategic lever.

### Instrument-Wizard Pairings

In the Everdell mapping from decision 006, instruments are Construction-type cards and wizards are Critter-type cards. Each wizard is paired with an instrument — owning the Crucible lets you recruit Lavoisier for free.

For cascades: instruments would primarily be Production cards (persistent engine pieces that fire each era), while wizards would primarily be Discovery cards (powerful one-time effects when played). This creates a natural rhythm: instruments build the cascade engine, wizards provide burst effects.

A wizard played alongside their paired instrument could grant a cascade bonus: "Lavoisier + Crucible: Crucible now produces 2 Metal instead of 1 during cascades." This makes the pairing mechanically meaningful beyond the free-play discount.

### School Board Stages

School boards (7 Wonders wonder-board equivalent) provide asymmetric starting bonuses and progression stages. Cascade interactions:
- **School passive**: "School of Combustion: Your Fire-type Production cards produce 1 extra Fire during cascades." This makes school choice affect cascade strategy.
- **School stage unlock**: Building school stages could add Production effects to your cascade. Stage 2 of a school might say "On era advance: gain 1 of your school's element" — effectively a free Production card without using a lab slot.
- **School as cascade amplifier**: A completed school board could double the output of the final cascade, creating a late-game incentive to finish stages.

### Scoring Paths

Looking at the current scoring system in `scoring.js`:
- **Storm Power**: Counts cards with 'material' or 'force' nature. Production cascades could include "gain 1 Storm Power" effects on aggressive instruments.
- **Discovery Sets**: Groups cards by type combo, scores n-squared per group. Production cascades that draw cards could help complete sets.
- **Lab VP**: Each card in lab scores 1 VP (or card's vp field). Production cards earn their slot by producing ongoing value, not just static VP.
- **Knowledge**: Leftover tokens / 3. Cascades producing tokens directly feed this scoring path.

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Discovering that Crucible + Unified Field Theory + Voltaic Pile chain together to produce Metal -> Electric -> Light from one era advance IS a eureka moment. The cascade reveals hidden connections between cards — the player discovers their engine's full power only when they run it. The feeling of "I didn't realize those three would combo like that" maps directly to the "first time you learn mixing chemicals creates a reaction" core fantasy. |
| A World of Interaction | Moderate | Cascades are inherently per-player engine effects, which risks solitaire. But interaction surfaces include: (1) Production cards with "opponent" effects firing during cascades, (2) cascade outputs feeding into shared-resource competition (tokens produced go to player, reducing relative scarcity), (3) visible lab state letting opponents read your cascade potential and respond. Theory cards that trigger off opponent state ("when any player gains Metal") would strengthen this. The cascade itself is personal, but its outputs collide with the shared economy. |
| Progression and Advancement | Very Strong | This is the headline alignment. Era 1 cascades are weak (1-2 triggers). Era 2 cascades are satisfying (3-4 triggers). The investment arc mirrors scientific progress — early turns lay groundwork, later turns reap compounding rewards. "Each turn, you know more, have more, and can do more. Your position compounds." Cascades ARE the compounding. They are the mechanical expression of "building up from nothing toward mastery." |

## Open Questions

- [ ] Should cascades resolve left-to-right (build order) or right-to-left (Wingspan-style, most recent first)?
- [ ] Should Theory cards be allowed to chain off each other during a cascade, or only off Production outputs? (depth limit for complexity)
- [ ] Is there a final cascade at game end, or do only era-advance cascades exist?
- [ ] Should cascade order be fixed (positional) or player-chosen each time? Fixed is simpler; chosen adds agency.
- [ ] How do we track "gained this cascade" state cleanly in boardgame.io? Temporary field on G, or a separate cascade resolution phase?
- [ ] Should Production cards have a "charges" limit (fire N times total) or fire every era advance indefinitely?
- [ ] Can opponents interact with your cascade (e.g., a counter-spell that cancels one Production trigger)?
- [ ] How do per-action mini-cascades (Wingspan row activation) coexist with per-era mega-cascades (Everdell season trigger) if we adopt lab rows?
- [ ] What is the right ratio of Production cards to other trigger types in the card pool to ensure cascades feel meaningful but not mandatory?
- [ ] Should the sandbox prototype implement cascades as a move (manual trigger) or as an automatic phase between eras?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Lens B (Wingspan), Lens D (Everdell), Part 4 synthesis. Contains the triggering chain examples (Forge wing cascade, Everdell Production cascade), the 5 card trigger types mapping, and the hybrid economy model.
- `frontend/src/sandbox/game.js` — Current state shape (`G.players[id].lab`, `G.era`, `G.tokenPool`, `G.players[id].resources`), the `advanceEra` move, and phase transitions (schoolSelection -> draft -> play -> draft cycle).
- `frontend/src/sandbox/scoring.js` — Six scoring paths (Storm Power, Discovery Sets, Lab VP, School Stages, Breakthroughs, Knowledge). Production cascades interact with Lab VP (cards earning their slot through ongoing value) and Knowledge (token outputs converting to VP).
- `design/philosophy/design-vision.md` — The three design principles and their design tests. "Progression and Advancement" is the primary fit; the "not a solitaire engine-builder" constraint is the primary risk.
- `database/schema.sql` — `type_combination_design` table: nature column (spell, element, phenomenon, material, effect) and mechanic column (spell, storm, super_power) classify the ~215 spell/combination entries. The "material" and "phenomenon" natures map well to Production-type cards (persistent materials that produce ongoing effects, phenomena that recur each era). The "spell" nature maps to Discovery-type one-shots.
