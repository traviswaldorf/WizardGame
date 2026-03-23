---
name: design-review
description: Comprehensive 7-section design review of a mechanic — combines player choice analysis, pillar evaluation, cross-system interactions, failure modes, and comparable game references
argument-hint: [mechanic or system name]
effort: high
---

Perform a comprehensive design review of **$ARGUMENTS**. If no mechanic is specified, ask what to review.

## Steps

1. Read the relevant design docs thoroughly before analyzing:
   - `design/philosophy/design-vision.md` — Core vision and three design principles
   - `design/philosophy/game-design-pillars.md` — 13 pillar framework
   - `design/philosophy/strategic-archetypes.md` — Strategic clusters
   - `design/philosophy/spell-archetype-system.md` — 10 spell archetypes
   - Relevant docs in `design/mechanics/`, `design/types/`, `design/decisions/`
   - Query `database/wizard_game.db` for relevant game data

2. Complete all 7 review sections:

### Section 1: Core Identity
- What is this mechanic's purpose in the game?
- What player experience does it create?
- Which design principle does it primarily serve?

### Section 2: Meaningful Choice Assessment
Rate each dilemma type (Strong / Present / Weak / Absent):
- **Scarcity** — Resource constraints creating prioritization
- **Trade-off** — Genuine upside/downside on every option
- **Prediction** — Reading opponents, yomi depth

### Section 3: Key Pillar Check
Pick the 5-7 most relevant pillars and rate each (Excels / Solid / Needs Work / Missing):
Feedback Loops, Emergent Complexity, Theme-Mechanic Integration, Escalation & Pacing, Risk & Reward, Information Architecture, Player Interaction, Randomness vs. Skill, Engine Building, Accessibility/Depth, Downtime, Decision Density

### Section 4: Cross-System Interactions
How does this interact with other game systems?
- **Type System** — How do the 16 types affect or get affected?
- **Storms** — Interaction with persistent environmental effects?
- **Towers** — Interaction with player structures?
- **Spell Archetypes** — Which of the 10 archetypes does this touch?
- **Counters** — Counter system dynamics?
- **Progression** — How does this change early → mid → late game?

Flag **missing interactions** where this mechanic should connect but doesn't.

### Section 5: Failure Modes
- **False choices** — Always correct/incorrect options
- **Non-decisions** — Automatic choices
- **Runaway leader** — Amplifies advantages without dampening?
- **Feel-bad moments** — Frustrating with no counterplay?
- **Complexity without depth** — Learning cost without strategic payoff?
- **Ludonarrative dissonance** — Contradicts the science-as-magic theme?

### Section 6: Comparable Designs
- Reference specific board/card games that handle similar mechanics
- What can we learn from their successes and failures?
- How does the science-as-magic theme create unique opportunities?

### Section 7: Recommendations
Prioritized improvements:
1. **Critical** — Would make the mechanic unfun or broken
2. **Important** — Missed opportunities or weak pillar areas
3. **Nice-to-have** — Polish and refinement

## Output Format

Use the 7 section headers above. Lead with the most important findings. Every observation should connect to a concrete recommendation or affirmation.
