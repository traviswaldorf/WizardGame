---
name: design-pillars
description: Evaluate a game mechanic against the 13 game design pillars — feedback loops, emergence, pacing, risk/reward, information, interaction, and more
argument-hint: [mechanic or system name]
---

Evaluate **$ARGUMENTS** against the 13 game design pillars. If no mechanic is specified, ask what to evaluate.

## Steps

1. Read the relevant design docs before evaluating:
   - `design/philosophy/game-design-pillars.md` for the full pillar framework
   - `design/philosophy/design-vision.md` for the three design principles
   - Any mechanic-specific docs in `design/mechanics/`, `design/types/`, or `design/decisions/`
   - Query `database/wizard_game.db` if game data is relevant

2. Evaluate against each applicable pillar. Not every pillar applies — focus on the most relevant ones and mark others N/A. Rate each: **Excels / Solid / Needs Work / Missing / N/A**

   For the full definition and design test for each pillar, reference `design/philosophy/game-design-pillars.md`. The 13 pillars are:

   1. **Meaningful Player Choice** — Scarcity, trade-off, prediction dilemmas
   2. **Feedback Loops** — Positive (snowball) vs negative (catch-up), runaway leader risk
   3. **Emergent Complexity** — Simple rules producing complex outcomes via system interaction
   4. **Theme-Mechanic Integration** — Science-as-magic theme reinforcing mechanics
   5. **Escalation & Pacing** — Game arc shape, decision space waxing/waning
   6. **Risk & Reward** — Voluntary variance, press-your-luck
   7. **Information Architecture** — Public, hidden, asymmetric information design
   8. **Player Interaction** — Parallel → indirect → negotiation → reactive → direct conflict
   9. **Randomness vs. Skill** — Input vs output randomness, skill expression
   10. **Engine Building** — Compound growth, conversion chains, sustained investment
   11. **Accessibility / Depth** — Easy to learn, hard to master ratio
   12. **Downtime Management** — Non-active player engagement
   13. **Decision Density** — Meaningful decisions per unit time

3. Identify the top 2-3 pillars where this mechanic **excels** and the top 2-3 where it **needs the most work**.

4. Provide specific, actionable recommendations prioritized by impact.

5. Connect findings to the three design principles (Discovery as Magic, A World of Interaction, Progression and Advancement).

## Output Format

```
## [Mechanic Name] — Design Pillars Evaluation

### Pillar Scorecard
| Pillar | Rating | Notes |
|--------|--------|-------|
| Player Choice | [rating] | [one-line note] |
| Feedback Loops | [rating] | ... |
| ... | ... | ... |

### Strengths (Top Pillars)
[Where this mechanic excels and why]

### Growth Areas
[Where this mechanic needs the most work and why]

### Recommendations
[Specific, actionable improvements prioritized by impact]

### Design Principle Alignment
[How well does this serve Discovery as Magic, A World of Interaction, and Progression?]
```
