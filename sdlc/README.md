# SDLC — Sandbox Development Lifecycle

## Mechanic Slugs

Each slug is a discrete mechanic to prototype in the sandbox. Use `/research-build`, `/plan-build`, and `/implement-build` to drive each phase.

| # | Slug | Mechanic | Source Games | Priority |
|---|------|----------|-------------|----------|
| 1 | [permanent-affinity](permanent-affinity/) | Played cards reduce future costs permanently | Splendor | P1 |
| 2 | [production-cascades](production-cascades/) | Era advance triggers chain of Production card effects | Wingspan, Everdell | P2 |
| 3 | [instrument-wizard-pairings](instrument-wizard-pairings/) | Paired wizard is free if matching instrument is in lab | Everdell | P3 |
| 4 | [school-board-stages](school-board-stages/) | Multi-stage school progression with Side A/B | 7 Wonders | P4 |
| 5 | [storm-comparison](storm-comparison/) | Compare offensive power with neighbors at era boundaries | 7 Wonders | P5 |
| 6 | [breakthroughs](breakthroughs/) | First-to-qualify milestone scoring | Everdell, Splendor | P6 |
| 7 | [discovery-chains](discovery-chains/) | Prerequisite cards unlock free builds in later eras | 7 Wonders | P7 |
| 8 | [lab-rows](lab-rows/) | Spatial lab layout with row-based activation chains | Wingspan | P8 |

## Status

| Slug | Research | Plan | Implementation |
|------|----------|------|----------------|
| permanent-affinity | Done | Not Started | Not Started |
| production-cascades | Done | Not Started | Not Started |
| instrument-wizard-pairings | Done | Not Started | Not Started |
| school-board-stages | Done | Not Started | Not Started |
| storm-comparison | Done | Not Started | Not Started |
| breakthroughs | Done | Not Started | Not Started |
| discovery-chains | Done | Not Started | Not Started |
| lab-rows | Done | Not Started | Not Started |

## Sandbox Phases (Complete)

| Phase | Document | Status |
|-------|----------|--------|
| 1 | [First Card](phase-1-first-card.md) | Done |
| 2 | [The Table](phase-2-the-table.md) | Done |
| 3 | [Game Flow](phase-3-game-flow.md) | Done |
| 4 | [Iteration Tools](phase-4-iteration-tools.md) | Done |

## Key References

- [006-multiplayer-economy-design.md](../design/decisions/006-multiplayer-economy-design.md) — Full reference game analysis
- [sandbox-implementation-plan.md](sandbox-implementation-plan.md) — Original sandbox tech plan
- `frontend/src/sandbox/game.js` — boardgame.io game definition
- `frontend/src/sandbox/scoring.js` — Scoring system
