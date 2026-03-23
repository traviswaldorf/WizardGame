# Decision: What Does the Board Center Represent?

> **ID**: 004
> **Status**: Exploring
> **Date Opened**: 2026-03-21
> **Date Decided**: —
> **Related Docs**: [type-system-overview.md](../framework/type-system-overview.md), [design-vision.md](../philosophy/design-vision.md), [frontend-design/game.js](../../frontend-design/game.js)

## Context

The board uses a concentric octagonal layout: 4 primary + 4 secondary types on an inner ring, 8 tertiary types on an outer ring, and a central "Origin" node connected to all four primaries. The center is the only position equidistant from all states of matter (Plasma/Fire, Solid/Earth, Liquid/Water, Gas/Air), making it the most structurally significant position on the board.

Currently it's a neutral "Origin" placeholder. This decision explores what the center *means* — thematically, scientifically, and mechanically — and whether it can serve as a gateway to the tertiary (dark side) types.

## Options

### Option A: Phase Transition Hub (Critical Point / Triple Point / Supercritical)

**Description**: The center represents the thermodynamic conditions where phase distinctions break down. Real physics gives us three rich concepts to draw from:

- **Triple point** — the exact temperature and pressure where solid, liquid, and gas coexist simultaneously. A position where three or more types are "active" at once.
- **Critical point** — where the distinction between liquid and gas ceases to exist. Type identities blur; spells cast from here might count as multiple types, or resistances/weaknesses stop applying.
- **Supercritical state** — beyond the critical point, matter has properties of multiple phases simultaneously. A player "goes supercritical" as a power spike — temporarily transcending normal type rules.

These could be named zone effects or triggered states rather than a single fixed identity.

**Pros**:
- Deeply grounded in real thermodynamics — teaches players real science
- "Going supercritical" is evocative and intuitive even without physics background
- Flexible: can be a zone effect, a triggered state, or a progression milestone
- Triple point naturally supports 3-type combos, which rewards pushing toward center

**Cons**:
- Phase transition language is specific to states of matter (the 4 primaries) — doesn't obviously extend to secondary or tertiary types
- May feel more like a *mechanic* than an *identity* — what IS the center, not just what does it DO?
- Risk of being too technical for some players without careful flavor writing

**Interactions**: Connects directly to the primary types as states of matter. Supports the multi-type combo system. Could synergize with storm mechanics (storms as extreme phase transitions?).

**Inspiration**: Phase diagrams in thermodynamics. The critical point of water (374 C, 218 atm) where liquid and steam become indistinguishable.

---

### Option B: Unification / Theory of Everything

**Description**: The center represents the point where all forces and types converge into a single undifferentiated whole — the Grand Unified Theory, or the conditions of the Big Bang before the four fundamental forces separated.

In physics, at the highest energies, gravity, electromagnetism, and the strong and weak nuclear forces are thought to merge into one force. The type system mirrors this: all 4 primary types (and by extension their secondaries and tertiaries) are expressions of a single underlying reality. The center IS that reality.

Players don't just occupy the center — they approach a deeper truth. Reaching it is a statement: *everything is one thing, expressed differently.*

**Pros**:
- Gives the center genuine narrative and philosophical weight — it's the thesis of the game
- Directly embodies "Discovery as Magic": the deepest discovery is that everything connects
- Scales naturally to all types, not just primaries — all 16 types are differentiations of the one
- Supports the progression principle: start differentiated, work toward unification
- The "Theory of Everything" is a real unsolved problem in physics — players are chasing what real scientists are chasing

**Cons**:
- Abstract — harder to translate into a concrete mechanic without additional flavor
- Could feel passive or philosophical rather than exciting in the moment
- Needs a strong mechanical payoff to justify its thematic ambition

**Interactions**: Frames the entire board as a diagram of differentiation from a single source. Could interact with the progression/engine-building arc — unification as a late-game state. Relates to the augmenter pairs (Time/Space, Light/Dark) as the most fundamental differentiations.

**Inspiration**: Grand Unified Theory (GUT), the Big Bang's electroweak epoch, string theory's claim that all particles are vibrations of one thing.

---

### Option C: Light/Dark Portal (Two-Sided Board)

**Description**: The center is the **threshold between Light and Dark** — two sides of the same board. Light/Dark are already augmenter pairs that sit outside the type hierarchy, making them natural candidates for a meta-structural role.

The board becomes two-sided:
- **Light side** — the 4 primary + 4 secondary types (inner ring). Normal play, standard type rules.
- **Dark side** — the 8 tertiary types. Currently on the outer ring, but reconceived as a **mirror plane** with different rules, accessed through the center.
- **The center** — the portal/transition point between them.

A player reaching the center doesn't just occupy a strong position — they **pass through** to the other side, where the physics gets strange (Radioactive, Ghost, Cosmic, Poison, etc.). The tertiary types aren't just "farther away" on the same board; they're *on the other side of reality*.

This reframes the current outer ring as a conceptually separate space. The Dark side could have mirrored positions, altered type interactions, different strategic incentives, or inverted rules.

**Pros**:
- Mechanically ambitious and creates a dramatic pivot moment in gameplay
- Tertiary types gain real identity as a *separate realm*, not just "advanced versions"
- Light/Dark augmenters get a structural role instead of just modifying spells
- Creates a literal "through the looking glass" moment — high drama, high flavor
- The center becomes a *verb* (transitioning) not just a *noun* (a position)

**Cons**:
- Highest design complexity — two-sided board has major implications for board state, visibility, and player interaction
- Physical board implementation is harder (double-sided? overlay? separate zone?)
- Risk of splitting the game into two disconnected halves if the transition isn't fluid
- May need careful balancing so the Dark side isn't strictly better or worse
- Players on opposite sides of the portal may have reduced interaction

**Interactions**: Redefines the relationship between the 8 core types and the 8 tertiaries. Changes the meaning of the Light/Dark augmenter pair from spell modifier to board structure. Could interact with the Time/Space pair (Space = the two sides, Time = when you cross?). Storm mechanics could bridge both sides.

**Inspiration**: The Upside Down (Stranger Things), the Shadow Realm (Yu-Gi-Oh), Phyrexia vs. Dominaria (MTG), dark matter/dark energy as the "other side" of physics.

---

### Option D: Layered Synthesis (All Three Combined)

**Description**: The three options above aren't mutually exclusive. They operate at different levels — identity, experience, and structure — and can stack into a single coherent arc:

1. **Identity (Option B)**: The center IS Unification — the Theory of Everything, the point where all types converge. This is what it *means*.
2. **Experience (Option A)**: Reaching it triggers a phase transition — you "go supercritical." Type distinctions dissolve. This is what it *feels like*.
3. **Structure (Option C)**: The phase transition flips you to the Dark side, where the tertiary types live. This is what *happens*.

The narrative arc: a player pushes toward unification, achieves a supercritical state, and in doing so breaks through to the shadow physics on the other side. One coherent sequence that uses real science at every layer.

**The center could be named**: "The Singularity," "The Unification Point," "The Critical Threshold," or simply "Origin" with these layers built into its mechanics.

**Pros**:
- Each layer reinforces the others — identity gives meaning, experience gives drama, structure gives consequence
- Uses all three physics concepts authentically and in their proper roles
- Creates a memorable gameplay moment: approach → transformation → new world
- Supports all three design principles simultaneously (Discovery, Interaction, Progression)
- Doesn't waste any of the ideas — they coexist without conflict

**Cons**:
- Most complex to design and balance
- Risk of overloading a single board position with too many concepts
- Needs very clear communication to players — if the layers aren't intuitive, it's just confusing
- The combined version inherits the implementation challenges of Option C

**Interactions**: Touches every system — type interactions, board structure, progression, augmenters, storms. Would need careful sequencing in the rules to avoid overwhelming new players. Could be revealed in layers (early game: it's just Origin; mid game: phase transition mechanics unlock; late game: Dark side opens).

**Inspiration**: The Big Bang itself — a singularity that undergoes phase transitions and differentiates into the universe we know. Players reverse the process.

## Recommendation

Option D (Layered Synthesis) is the most exciting and the most true to "Discovery as Magic," but it carries the highest design cost. A practical path forward:

1. **Commit to Option B as the thematic foundation** — the center is Unification. This costs nothing mechanically and frames everything else.
2. **Prototype Option A as mechanics** — test "going supercritical" as a zone effect. Does dissolving type rules at the center create interesting decisions?
3. **Explore Option C as a stretch goal** — the two-sided board is the biggest structural commitment. Prototype it only after A and B feel solid.

This way the ideas build on each other incrementally and each layer can be tested independently.

## Open Questions

- [ ] If the center represents Unification, should it have its own visual identity (color, symbol) or remain neutral/white?
- [ ] Does "going supercritical" mean ALL type distinctions dissolve, or just specific ones (e.g., resistances off, weaknesses off, but type identity preserved)?
- [ ] For the two-sided board: can players on opposite sides still interact? Or does crossing isolate you?
- [ ] How do the Time/Space augmenters relate to the center? (Space = the two sides of the board? Time = the progression toward unification?)
- [ ] Could storms be the event that temporarily "cracks open" the portal, giving all players a glimpse of the Dark side?
- [ ] What happens to the outer ring in the current layout if tertiaries move to a separate plane?

## Playtest Notes

<!-- Record observations from testing each option. Date each entry. -->

| Date | Option Tested | Observation | Verdict |
|------|---------------|-------------|---------|
|      |               |             |         |

## Decision

**Chosen**: —
**Rationale**: —
