---
name: research-build
description: Research a mechanic slug — analyze reference games, break down the mechanic, identify design questions. Successive runs refine existing research docs.
argument-hint: <slug> (e.g. permanent-affinity, production-cascades, lab-rows)
---

Research the **$ARGUMENTS** mechanic for the Wizard Game sandbox. If no slug is specified, list available slugs from `sdlc/` and ask which to research.

## Behavior

**First run** (no docs in `sdlc/<slug>/research/`): Create initial research document(s).
**Successive runs** (docs already exist): Read existing research, identify gaps or open questions, and refine. Add new sections, deepen analysis, or update based on new context. Never overwrite — always build on what's there.

## Steps

1. **Validate the slug**: Confirm `sdlc/<slug>/` exists. If not, list available slug folders in `sdlc/` and ask the user to pick one.

2. **Read existing research**: Check `sdlc/<slug>/research/` for any `.md` files. Read them all. Note what's already covered and what's missing.

3. **Gather context** — read these for relevant information:
   - `design/decisions/006-multiplayer-economy-design.md` — the full reference game analysis
   - `design/philosophy/design-vision.md` — the three design principles
   - `design/philosophy/game-design-pillars.md` — the 13 design pillars (if relevant)
   - Any mechanic-specific docs in `design/mechanics/`, `design/types/`, or `design/decisions/`
   - The current sandbox game definition: `frontend/src/sandbox/game.js`
   - The current scoring system: `frontend/src/sandbox/scoring.js`
   - Query `database/wizard_game.db` if game data is relevant (types, spells, instruments, wizard schools)

4. **Research the mechanic**:
   - What does this mechanic do in the reference game(s)?
   - How does it map to our type system, spells, instruments, wizard schools?
   - What are the design tensions and trade-offs?
   - What are the open questions we need playtesting to answer?
   - How does it interact with mechanics from other slugs?
   - How well does it serve the three design principles (Discovery as Magic, A World of Interaction, Progression and Advancement)?

5. **Write or refine** research docs in `sdlc/<slug>/research/`:
   - If creating: Write `research.md` with the full analysis
   - If refining: Edit existing files — add new sections, deepen analysis, resolve questions that now have answers, add cross-references to other slugs

6. **Update the slug's status** in `sdlc/README.md` if it exists (Research column → In Progress or Done).

## Output Format for New Research Docs

```markdown
# <Slug Name> — Research

> **Status**: In Progress
> **Last Updated**: <date>
> **Reference Games**: <which games this mechanic comes from>
> **Related Slugs**: <other slugs this interacts with>

## What This Mechanic Does

<Clear description of the mechanic in the reference game(s)>

## Our Mapping

<How this maps to Wizard Game concepts — types, spells, instruments, schools, etc.>

## Design Tensions

<Trade-offs, competing goals, things that could go wrong>

## Interaction with Other Mechanics

<How this mechanic connects to other slugs — dependencies, synergies, conflicts>

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | | |
| A World of Interaction | | |
| Progression and Advancement | | |

## Open Questions

- [ ] <questions that need playtesting or further design work>

## Sources and References

<Specific sections from 006, design docs, or external references>
```
