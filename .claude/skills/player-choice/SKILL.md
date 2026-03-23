---
name: player-choice
description: Analyze a game mechanic through the three dilemma types (Scarcity, Trade-off, Prediction) to evaluate meaningful player choice
argument-hint: [mechanic or system name]
---

Analyze **$ARGUMENTS** through the lens of meaningful player choice. If no mechanic is specified, ask what to analyze.

## Steps

1. Read the relevant design docs before analyzing:
   - `design/philosophy/design-vision.md` for the three design principles
   - `design/philosophy/game-design-pillars.md` for the dilemma framework
   - Any mechanic-specific docs in `design/mechanics/`, `design/types/`, or `design/decisions/`
   - Query `database/wizard_game.db` if game data is relevant

2. Evaluate against all three dilemma types. For each, rate as **Strong / Present / Weak / Absent** and explain why:

   **Scarcity Dilemma** — Does it force prioritization under resource constraint? Is the constraint tight enough to hurt but loose enough for multiple strategies?

   **Trade-off Dilemma** — Does every option have a real upside AND downside? Does the "best" option change with game state? Any false choices where one option always wins?

   **Prediction Dilemma** — Must the player model their opponent's thinking? Is there yomi depth? Enough info to reason from but not enough for certainty?

3. Identify the **primary dilemma driver** — which type is the core engagement hook for this mechanic.

4. Flag **false choices** (always-correct options) and **non-decisions** (automatic choices).

5. Recommend specific improvements to strengthen weak dilemma types.

6. Connect findings to the game's three design principles (Discovery as Magic, A World of Interaction, Progression and Advancement).

## Output Format

```
## [Mechanic Name] — Player Choice Analysis

### Scarcity: [Strong/Present/Weak/Absent]
[Analysis]

### Trade-off: [Strong/Present/Weak/Absent]
[Analysis]

### Prediction: [Strong/Present/Weak/Absent]
[Analysis]

### Primary Dilemma Driver: [type]
[Why this is the core engagement hook]

### Issues Found
- [False choices, non-decisions, missing tension]

### Recommendations
- [Specific, actionable improvements]
```
