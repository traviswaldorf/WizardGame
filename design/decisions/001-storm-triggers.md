# Decision: How Are Storms Triggered?

> **ID**: 001
> **Status**: Exploring
> **Date Opened**: 2026-03-20
> **Date Decided**: —
> **Related Docs**: [storms.md](../mechanics/storms.md), [balance-philosophy.md](../philosophy/balance-philosophy.md)

## Context

Storms are persistent, board-wide environmental effects tied to each type. Every type has a Positive Storm (benefits that type's playstyle) and a Negative Storm (creates adverse conditions). The core question: how do storms enter play?

This decision affects game pacing, player agency, strategic depth, and how "weather-like" storms feel. It also interacts with the element exclusivity reward (fewer players on an element = stronger benefits), tower mechanics, and the balance between proactive and reactive play.

## Options

### Option A: Element Threshold (Emergent)

**Description**: Storms trigger automatically when a player accumulates X elements of a single type, or when a global element threshold is crossed (e.g., total Fire elements in play across all players). The storm manifests as a natural consequence of the game state.

**Pros**:
- Most "weather-like" — storms feel like emergent phenomena, not intentional attacks
- Creates a natural feedback loop: investing heavily in one element changes the environment
- Ties directly into the element exclusivity reward mechanic — a solo Fire player could trigger Firestorm more easily
- No additional card/spell slots needed — storms are systemic, not inventory

**Cons**:
- Less player agency — you might trigger an unwanted storm
- Can be unpredictable in multiplayer when multiple players invest in the same element
- Hard to balance thresholds — too low = constant storms, too high = never see them
- Opponent can't directly counter a storm (only indirectly by denying elements)

**Interactions**:
- **Element Exclusivity Reward**: Strong synergy — solo element players hit thresholds faster, getting both exclusivity bonus AND storms
- **Towers**: Storms could trigger based on tower count of a type instead of/in addition to element count
- **Control (Air) pillar**: Air players have fewer tools to interact with thresholds, which weakens their reactive identity

**Inspiration**:
- **Catan** — Resource accumulation creates emergent events (robber at 7+ cards)
- **Terraforming Mars** — Global parameters trigger game phase changes when thresholds are hit
- **Risk** — Territory accumulation triggers escalating card trade-in values

---

### Option B: Summoned via Spell (Intentional)

**Description**: Storms are high-cost spells that players cast intentionally. They have element costs, conditions, and can be countered. Once cast, they persist for X turns.

**Pros**:
- Maximum player agency — you choose when and which storm
- Can be countered by Air/Control types (fits the control pillar identity)
- Cost can be balanced through the spell economy
- Creates interesting deck-building decisions: do you include a storm spell?
- Storms become a strategic card you play at the right moment

**Cons**:
- Feels less like "weather" and more like "big spell" — blurs the Storm/Super Power distinction
- Requires spell slots in hand — competes with regular spells for card draw
- If storms are too expensive, they never get played; too cheap, they dominate
- Less thematic — weather shouldn't feel like something you "cast"

**Interactions**:
- **Spell Archetype System**: Storms would need their own archetype or fit into existing ones (Damage storms = Aggro, etc.)
- **Air/Counter pillar**: Strong interaction — Air can counter storms, giving control players a clear role
- **Card Draw (Water)**: Water benefits from having storm spells as another option to draw into
- **Cost System**: Needs a separate "storm cost" tier above regular spells

**Inspiration**:
- **MTG** — Board wipes and enchantments are just expensive spells you choose to cast
- **Hearthstone** — Hero powers and legendary spells are intentional, high-impact plays
- **Dominion** — Event cards that change the rules when purchased/played

---

### Option C: Game Events / Random (Weather-Like)

**Description**: Storms trigger from game events (tower destroyed, round milestone, element source depleted) or randomly at the start of each round. A "weather deck" or "storm track" could determine which storm is coming.

**Pros**:
- Most thematic — storms feel genuinely like weather that everyone must adapt to
- Creates shared moments that all players respond to (like Catan's robber)
- Adds variety and replayability — each game has different storm patterns
- Doesn't require player resources or action economy
- Can create dramatic turning points mid-game

**Cons**:
- Least player agency — random storms can feel unfair ("I was winning until Nuclear Winter")
- Harder to build a strategy around storms if you can't predict or control them
- May need a separate physical component (storm deck, track, dice)
- Can swing games on luck rather than skill
- Players who get "their" storm randomly feel lucky, not strategic

**Interactions**:
- **Win Conditions**: Random storms could invalidate strategies mid-game, which conflicts with strategic planning
- **Pregame Planning**: If storms are random, pregame choices need to account for storm variance
- **Robber Mechanic**: Could share the same trigger system (game events / milestones)
- **Round Structure**: Natural fit for "new weather each round" in a multi-round game

**Inspiration**:
- **Catan** — Robber triggered by dice roll (event-based)
- **Scythe** — Encounter cards create unpredictable environmental events
- **Pandemic** — Epidemic cards shuffle into the deck, creating escalating random events
- **Arkham Horror** — Mythos phase brings random environmental changes each round
- **Wingspan** — End-of-round effects change the scoring conditions

---

### Option D: Hybrid (Layered System)

**Description**: Multiple trigger mechanisms coexist:
- **Ambient storms**: Rotate on a global track (visible to all, changes each round or at milestones). These are mild environmental effects everyone knows are coming.
- **Summoned storms**: Players can cast storm spells to override or amplify the ambient weather. These are stronger but cost resources and can be countered.
- **Threshold escalation**: Element accumulation doesn't trigger storms directly but makes your summoned storms cheaper or stronger.

**Pros**:
- Richest gameplay — storms feel like weather AND strategic tools
- Ambient storms add variety, summoned storms add agency
- Threshold connection rewards element investment without being binary
- Different player types engage with storms differently (control players counter, aggro players summon)
- Creates a "weather forecast" metagame — players see what's coming and plan around it

**Cons**:
- Most complex to implement and teach
- Multiple systems interacting can create balance nightmares
- Risk of analysis paralysis with too many storm-related decisions per turn
- May need significant playtesting to find the right balance between ambient and summoned

**Interactions**:
- **All pillars**: Each pillar has a natural relationship — Aggressive players summon offensive storms, Defensive players build around ambient storms, Control players counter summoned storms, Flow players adapt to whatever weather is active
- **Element Exclusivity**: Threshold connection means solo-element players are better storm summoners
- **Pregame Planning**: Ambient storm track could be set up during pregame (like Catan board), adding strategic depth to initial choices

**Inspiration**:
- **Gloomhaven** — Multiple systems (battle goals, road events, city events) layer on top of core combat
- **Spirit Island** — Escalating threat (Invader deck) plus player-driven effects create layered tension
- **7 Wonders** — Age cards change the available options each era (ambient), while players choose what to build (intentional)

## Research Notes

### Pokemon Terrain & Weather (2026-03-20)

Pokemon's competitive system is the strongest existing model for environmental game effects. Key findings that inform this decision:

**Hybrid triggers are proven.** Pokemon uses BOTH intentional triggers (moves that cost your turn) AND automatic triggers (abilities that fire on entry). Both coexist in the same system. This validates Option D.

**Replacement IS counterplay.** In Pokemon, the counter to Rain is casting Sun. No explicit "cancel storm" mechanic is needed — overwriting is the counter. This is elegant and could simplify our design. If we adopt this, Air/Control types don't need special storm-countering abilities — they just need to be good at triggering their own storms.

**Two separate layers coexist.** Pokemon runs Weather (affects all) and Terrain (affects grounded only) as independent systems. Both can be active simultaneously. This raises a new design question: should our Positive and Negative storms be separate coexisting layers rather than two variants of the same system?

**Fixed duration with extension trade-off.** Pokemon uses 5 turns base, extendable to 8 by sacrificing an item slot. The trade-off (duration vs other benefits) is elegant. Our "2-3 turns" is vague by comparison.

**Asymmetric dual effects.** Rain doesn't just boost Water — it boosts Water +50% AND nerfs Fire -50% simultaneously. This dual push/pull creates richer strategy than single-direction effects. Our storms currently only do one thing each.

See [storms.md — Pokemon Research section](../mechanics/storms.md) for full details.

## Recommendation

Leaning toward **Option D (Hybrid)** for its depth, but recognizing it needs simplification for first playtest. A good starting point might be Option A (threshold) as the base mechanic, with Option B (summoned) layered on later once the core loop is solid. Pokemon's competitive success with hybrid triggers strongly supports this direction.

## Playtest Notes

| Date | Option Tested | Observation | Verdict |
|------|---------------|-------------|---------|
|      |               |             |         |

## Decision

**Chosen**: —
**Rationale**: —
