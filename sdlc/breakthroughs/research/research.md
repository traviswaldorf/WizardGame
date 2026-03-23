# Breakthroughs — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: Everdell (basic + special events), Splendor (noble tiles)
> **Related Slugs**: storm-comparison, school-board-stages, permanent-affinity

## What This Mechanic Does

### Everdell Events

Everdell has two categories of events, both publicly visible and first-to-qualify:

**Basic Events (4 per game):** Generic conditions any player can race toward. Examples: "Have 3 Production (green) cards and 3 Governance (blue) cards in your city," or "Have 4 Prosperity cards." Each is worth 3 VP. They sit on the board, visible to all players. On your turn, instead of placing a worker or playing a card, you can claim one if you meet its condition. Once claimed, it is gone — first come, first served.

**Special Events (4 per game, tied to specific cards):** Require you to have specific named cards in your city. Example: "Have the Clock Tower and the Historian in your city — gain 3 VP." These are more like combo rewards — you need two specific cards to unlock them. They reward players who discover (or draft toward) synergistic card pairings.

The racing tension is real but soft: you can see opponents' cities building toward an event's requirements, and you may rush to claim it before them — or pivot away if you are behind. Events create 24-32 VP worth of contestable points across a game where winning scores are typically 60-80 VP, making them significant but not dominant.

### Splendor Noble Tiles

Nobles are simpler and more automatic. At game start, (player count + 1) noble tiles are laid out, each requiring a specific combination of permanent gem bonuses (e.g., "4 Blue + 4 White"). At the *end* of your turn, if you meet a noble's requirements, it is automatically awarded to you — no action cost. Each noble is worth 3 VP. First player to qualify gets it; no one can claim a noble another player already earned.

Because nobles are auto-awarded, the racing is implicit — you cannot "rush" to claim one; you just build your engine and the noble comes to you when the threshold is met. The tension is in reading the board: "Two players are both building toward this noble — who will hit 4 Blue first?"

### Core Design Pattern

Both mechanics share a structure: **publicly visible conditions** that create **asymmetric racing incentives**. Players can see what is available, assess their own proximity, and decide whether to invest toward a milestone or concede it. The first-to-qualify exclusivity creates urgency without direct confrontation — you never steal from an opponent, you just get there first.

## Our Mapping

Scientific breakthroughs as milestones. In our game's fiction, breakthroughs represent landmark scientific achievements — the moments where accumulated knowledge crystallizes into a recognized discovery. "First to demonstrate mastery of all four primary elements" or "First to combine Fire and Water into a stable compound."

### Structural Decisions

**How many breakthroughs per game?** Based on reference games and our scoring balance:
- Everdell: 8 events (4 basic + 4 special) in a ~70 VP game = ~35-45% of max contestable points
- Splendor: (N+1) nobles in a 15 VP race = ~20% of target score
- Our game: 6 scoring paths, breakthroughs are one of six. Target 15-25% of a typical winning score. With 6-8 breakthroughs worth 3-4 VP each, that is 18-32 VP available, of which a strong player might claim 2-3 (6-12 VP).

**Recommendation:** Start with **6 breakthroughs** per game. 4 "basic" (type-system conditions) + 2 "special" (specific card combo conditions). At 3-4 VP each, this creates ~20-24 VP of contestable points.

**VP values:** 3 VP for basic breakthroughs, 4 VP for special (combo) breakthroughs. This keeps them meaningful without dominating. (For reference, `calcLabVP` scores 1 VP per card, `calcSchoolStages` currently gives a flat 2 VP, and `calcKnowledge` divides tokens by 3.)

**Claiming mechanism:** Automatic check at end of turn (Splendor-style) rather than requiring a dedicated action (Everdell-style). Rationale: our game already has a lot going on per turn (draft picks, token takes, card plays). Adding "claim a breakthrough" as a separate action would add cognitive load. Auto-awarding keeps the excitement ("Wait, I just triggered a breakthrough!") without the action-economy cost.

**Visibility:** All breakthrough conditions are public and visible from the start of the game. Players can assess their proximity at any time. Progress toward each breakthrough should be calculable from open board state (lab cards, resources, school choice) — no hidden-information gating.

## Candidate Breakthrough Conditions

### Basic Breakthroughs (type-system conditions)

These are general enough that any player can pursue them, but specific enough to create racing tension.

**1. Elemental Mastery — "Have at least 1 card of each primary type (Fire, Earth, Water, Air) in your lab."**
- VP: 3
- Design intent: Rewards type diversity over type depth. Encourages exploring across the type system rather than tunneling into one element. Easy to understand, hard to be first if everyone is racing for it.
- Condition check: Lab contains cards where `type_a_id` or `type_b_id` covers all 4 primary type IDs (1-4).

**2. Deep Specialization — "Have 3+ cards sharing the same primary type in your lab."**
- VP: 3
- Design intent: The opposite of Elemental Mastery — rewards going deep into one element. Creates a real tension: do you diversify for Mastery or specialize for Depth? Both cannot be rushed simultaneously.
- Condition check: Any primary type ID appears as `type_a_id` or `type_b_id` in 3+ lab cards.

**3. Secondary Synthesis — "Have 2+ secondary-type cards (Metal, Plant, Ice, or Electric) in your lab."**
- VP: 3
- Design intent: Rewards players who invest in the more expensive secondary tier. Secondary cards require two primary type inputs, so this breakthrough is naturally gated by progression — you need era 2 cards. Maps to the "Progression and Advancement" principle.
- Condition check: 2+ lab cards where `type_a_id` or `type_b_id` is in the secondary ID range (5-8).

**4. Storm Chaser — "Have 3+ cards with 'material' or 'force' nature in your lab."**
- VP: 3
- Design intent: Rewards offensive/storm-oriented builds. Cross-references with the storm-comparison scoring path — a player investing in Storm Power is likely to also qualify for this breakthrough, creating a stacking incentive. But it is achievable by anyone who drafts enough offensive cards.
- Condition check: 3+ lab cards where `card.data.nature === 'material' || card.data.nature === 'force'`.

### Special Breakthroughs (specific combo conditions)

These reward discovering specific card synergies — closer to Everdell's special events. They should be harder to achieve but worth more VP.

**5. Alchemist's Dream — "Have both a Fire-type card and an Earth-type card in your lab that share the same secondary type (Metal)."**
- VP: 4
- Design intent: Rewards understanding the composition system — Metal is Fire + Earth. Having cards from both parent types that produce the same secondary demonstrates mastery of the type relationships. This is a "eureka moment" breakthrough.
- Condition check: Lab contains at least one card with Fire as a type component AND at least one card with Earth as a type component, AND at least one card with Metal (type ID 5) as a type component.

**6. Unified Field — "Have cards representing 3+ distinct type *pairs* (unique type_a + type_b combinations) in your lab."**
- VP: 4
- Design intent: Rewards breadth of experimentation. Each card in the game represents a specific combination of two types (or a single type). Having 3+ distinct combinations means you have explored multiple branches of the type interaction web. This maps directly to "A World of Interaction" — everything connects.
- Condition check: Count distinct `(min(type_a_id, type_b_id), max(type_a_id, type_b_id))` pairs across lab cards. 3+ distinct pairs qualifies.

### Scaling Notes

For different player counts:
- **2 players:** Use 4 breakthroughs (3 basic + 1 special). Fewer players = fewer should be available, so each is more contested.
- **3 players:** Use 5 breakthroughs (3 basic + 2 special).
- **4 players:** Use all 6 breakthroughs (4 basic + 2 special).

This follows Splendor's (N+1) scaling philosophy — slightly more breakthroughs than players ensures at least one is unclaimed, reducing kingmaker effects.

## Design Tensions

### First-Mover Advantage vs. Comeback Potential

The biggest risk of first-to-qualify mechanics is runaway leader syndrome. If the player who claims the first breakthrough uses that VP lead to claim more, the gap compounds.

**Mitigations:**
- Breakthroughs are one of six scoring paths. A player who ignores breakthroughs entirely can still win through Storm Power, Discovery Sets, Lab VP, School Stages, or Knowledge.
- Basic breakthroughs (3 VP) are meaningful but not game-deciding in a game where winning totals are estimated around 25-40 VP based on the scoring mockup in `phase-4-iteration-tools.md` (example total: 27 VP).
- Special breakthroughs (4 VP) require specific combos that may conflict with other scoring paths — investing in Alchemist's Dream means drafting Fire + Earth + Metal cards, which may not maximize your Discovery Sets or Storm Power.
- No breakthrough requires resource spending — they are free to claim once conditions are met. This means a behind player does not need to "waste" actions claiming; it just happens.

### How Many Breakthroughs Is Right?

- **Too few (2-3):** Creates a kingmaker effect. If there are only 2 breakthroughs and one player claims both, they gain 6-8 VP that no one else can access. The "breakthroughs" scoring path becomes binary — either you got some or you got zero.
- **Too many (10+):** Dilutes the racing tension. If everyone can claim 2-3 breakthroughs, the mechanic becomes "participation points" rather than a race. The exclusivity loses its bite.
- **Sweet spot (5-7):** Enough that multiple players will claim at least one, but not so many that they are guaranteed. The total VP in breakthroughs (15-28) is significant but not dominant. Players who invest in breakthrough-friendly strategies are rewarded, but ignoring breakthroughs entirely is viable.

### Visibility of Progress

All breakthrough conditions must be derivable from public information. This means:
- Lab cards are open (already the case — labs are visible)
- Resource counts are visible (already tracked in `player.resources`)
- School choice is visible (already public)

The question is how *explicitly* to show progress. Options:
1. **Just show the conditions** — let players calculate their own proximity (more "Discovery as Magic")
2. **Show progress bars** — "You are 2/4 toward Elemental Mastery" (more accessible, less discovery)
3. **Show proximity for your own breakthroughs only** — opponents must read your board to assess your progress

Recommendation: Start with option 1 (conditions only) for the sandbox prototype. This aligns with the "No type charts, no combo guides" principle from the design vision. Discovering that you are close to a breakthrough should feel like a eureka moment, not a progress-bar fill.

### Interaction with Player Count

- **2 players:** High direct competition for each breakthrough. Both players are likely pursuing similar breakthroughs, creating intense racing tension. Risk: if one player gets an early lead, the other may feel shut out.
- **3-4 players:** More strategic differentiation. Players naturally diverge toward different breakthroughs based on their school choice and draft picks. Lower chance of direct head-to-head racing for the same breakthrough, but still possible.

## Interaction with Other Mechanics

### Permanent Affinity (permanent-affinity slug)

If permanent affinity is implemented (Splendor-style permanent type discounts from played cards), affinity thresholds become natural breakthrough triggers. Example: "First to reach permanent affinity 3 in any single type." This creates a tight feedback loop — playing cards for engine-building (affinity) also progresses you toward a breakthrough. Risk: makes breakthroughs feel less like separate achievements and more like automatic byproducts of normal play.

**Recommendation:** Keep breakthrough conditions based on *lab composition* (which cards you have) rather than *affinity levels* (which are a derivative of cards). This ensures breakthroughs feel like distinct achievements even when permanent affinity is active.

### School Board Stages (school-board-stages slug)

School stage completion could itself be a breakthrough condition: "First to complete all stages of your school board." This would be a high-difficulty special breakthrough worth 4-5 VP, only achievable late in the game. It creates an interesting tension with the school-board-stages scoring path itself — completing your school already gives VP through `calcSchoolStages`, and adding a breakthrough bonus on top could make school completion too dominant.

**Recommendation:** Do not make school completion a breakthrough condition. Keep breakthroughs focused on the *type system and card composition* so they cross-cut multiple strategies rather than stacking with a single scoring path.

### Storm Comparison (storm-comparison slug)

Storm milestones could be breakthrough conditions: "First to have Storm Power 5+" creates a racing incentive within the military/offensive scoring path. This stacks with `calcStormPower` scoring but creates an interesting "arms race" dynamic similar to 7 Wonders military — you want to be just strong enough to win comparisons, but investing in Storm Power for a breakthrough pushes you to over-invest.

**Recommendation:** Include one storm-adjacent breakthrough (Storm Chaser, candidate #4 above) that rewards having offensive cards but does not directly reference Storm Power score. This keeps the interaction indirect — you benefit from having storm-relevant cards, but the breakthrough is about card composition, not score threshold.

### Production Cascades (production-cascades slug)

If production cascades are implemented (Wingspan/Everdell-style chain triggers when advancing eras), cascade *output* could trigger breakthrough checks. Example: after resolving all production triggers at era advancement, check if any player now meets a breakthrough condition they did not before. This creates dramatic moments: "My cascade produced enough Metal that I now qualify for Alchemist's Dream!"

**Recommendation:** Yes — breakthrough checks should run after any state change that modifies lab composition or resources. This includes production cascade resolution. The implementation should be event-driven: any time a card enters a player's lab or resources change, re-evaluate all unclaimed breakthroughs.

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | Strong | Breakthroughs reward players for discovering type combinations and compositions. The "eureka" moment of realizing you are one card away from a breakthrough — and racing to get it — mirrors the thrill of scientific discovery. Special breakthroughs (Alchemist's Dream, Unified Field) directly reward understanding the type interaction web. Keeping conditions visible but not showing progress bars preserves the discovery feel. |
| A World of Interaction | Strong | First-to-qualify exclusivity creates player interaction without direct conflict. Reading opponents' labs to assess their proximity to breakthroughs encourages paying attention to the whole table. Breakthrough conditions that reference multiple types (Elemental Mastery, Alchemist's Dream) reward engaging with the type interaction web rather than isolated strategies. |
| Progression and Advancement | Moderate | Secondary Synthesis directly rewards progression through the type tiers. Breakthroughs become available as players build up their labs across eras — you cannot claim most breakthroughs in era 1 because you lack the card diversity. However, breakthroughs are not themselves a progression system (no breakthrough unlocks the next one). They are checkpoints along the progression arc, not the arc itself. |

## Open Questions

- [ ] Should breakthroughs be revealed all at once at game start, or revealed one per era (creating surprise and adaptation)?
- [ ] Should claiming a breakthrough grant a one-time bonus effect (draw a card, gain a token) in addition to VP, to make the moment more impactful?
- [ ] Can a single player claim multiple breakthroughs, or is there a cap (e.g., max 2 per player)?
- [ ] Should the breakthrough check happen at end of turn (Splendor-style auto-award) or require a conscious claim action (Everdell-style)?
- [ ] How do breakthroughs interact with the draft phase — should breakthrough checks only run during the play phase, or also when cards enter hand during draft?
- [ ] Should special breakthroughs reference specific named cards from the database, or stay at the type-system level?
- [ ] What is the right VP split between basic (3 VP) and special (4 VP) breakthroughs — should the gap be larger to incentivize pursuing specials?
- [ ] Should unclaimed breakthroughs at game end award reduced VP to the player closest to meeting the condition (consolation points)?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Everdell events mapped as "Breakthroughs (scientific milestones)" at line 329; Splendor nobles mapped as "Wizard school recognition" at line 192; breakthrough bonuses listed as scoring path #5 at line 424
- `frontend/src/sandbox/scoring.js` — `calcBreakthroughs()` is a placeholder returning 0 (line 69); integrated into `calcAllScores()` and `SCORE_PATHS` with color `#E67E22`
- `frontend/src/sandbox/game.js` — Current player state shape: `{ hand: [], lab: [], school: null, resources: {}, score: 0 }`. No `breakthroughs` field yet. Game state has `players`, `tokenPool`, `cardMarket`, `era`, `schools`
- `design/philosophy/design-vision.md` — Three design principles: Discovery as Magic, A World of Interaction, Progression and Advancement
- `database/build.py` — Type system: 4 primary (Fire, Earth, Water, Air), 4 secondary (Metal, Plant, Ice, Electric), 8 tertiary. Card categories from `type_combination_design`: ~108 spell/spell, ~14 material/spell, ~12 element/spell, ~10 phenomenon/spell, ~47 phenomenon/storm, ~16 spell/super_power
- `sdlc/phase-4-iteration-tools.md` — Scoring mockup shows breakthroughs at 6 VP in a 27 VP total example game
