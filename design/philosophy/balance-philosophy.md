# Balance Philosophy

## Core Principle

> Reward players who are on an element by themselves. This encourages/balances less optimal strategies and encourages spreading out of strategies and investment into archetype.

## Balance Rules

### Element Exclusivity Reward
When fewer players invest in a particular element, those players receive amplified benefits. This creates a natural metagame pressure against clustering on "best" elements and rewards creative deckbuilding.

**Mechanism**: <!-- TBD: How exactly is this tracked and rewarded? -->

### Interaction Density

The type system is closed: **16 types** (4 primary, 4 secondary, 8 tertiary) are the complete set. There will be no additional fundamental types. Light/Dark and Space/Time operate as augmenter axes alongside the type system, not as new types within it. Depth comes from how the 16 types interact, combine, and react — not from adding more types.

Within that closed system, two principles that sound contradictory but aren't:

**Discoverable breadth should be large.** Every pair of types should produce *something* when combined. The 28 core pairs (primary + secondary) and the tertiary relationships create a rich discovery space. This serves the [Discovery Experience](discovery-experience.md) — players explore and find new interactions across multiple games. The interaction matrix is intentionally deep.

**Per-game frequency must be high.** Any interaction a player has discovered should fire often enough within a single game to feel strategic, not lucky. If a combo only triggers once every 5 games, it's trivia — not strategy. The game state (element availability, board layout, turn structure) should make it easy to *use* combos you know about.

The resolution: a **small number of types with deep pairwise relationships**, not a large number of types with shallow ones. 16 types means 120 unique pairs. That's a large discovery space built from a tight set of building blocks — each type appears in enough pairings that players encounter their interactions regularly.

### Power Budget Guidelines
<!-- TBD: How to prevent one type from dominating -->
- Each type should have clear strengths AND clear weaknesses
- No type should be self-sufficient — requiring combinations encourages interaction
- Tertiary types should feel powerful but require more setup/investment than their parent

### Pregame Planning and Randomness
Inspired by MTG (pre-deck planning), Catan (random board setup), and Splendor (card preview):
- Random starting conditions
- Random board setup
- Random win conditions
- Card draw preview (Splendor-like preview of cards with option to draw)

### The Robber
A Catan-style blocking mechanic exists in the design space.
- <!-- TBD: What moves it? -->
- <!-- TBD: What does it block? Element sources? Towers? -->

## Win Conditions

| Path          | Description              |
|---------------|--------------------------|
| Exterminate   | Destroy all opponent towers/assets |
| Total Points  | Highest point total wins |
| Round         | Best performance across rounds |

## Open Questions
- [ ] What is the exact mechanism for element exclusivity rewards?
- [ ] How does the robber mechanic work?
- [ ] How many rounds constitute a full game?
- [ ] Is there a "combo limit" to prevent infinite loops?
- [ ] How do augmenter pairs (Time/Space, Light/Dark) affect balance?
