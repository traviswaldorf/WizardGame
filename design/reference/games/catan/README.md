# Catan — Research Reference

> **Relevance**: Primary inspiration for resource gathering, board randomization, and the robber/blocking mechanic. Catan's emergent player interaction through resource scarcity drives our element system design.
> **Primary Informs**: [balance-philosophy.md](../../philosophy/balance-philosophy.md), [win-conditions.md](../../mechanics/win-conditions.md)

## System Overview

### Resource System
5 resources produced by hex tiles, triggered by dice rolls:
| Resource | Hex | Used For |
|----------|-----|----------|
| Brick | Hills | Roads, Settlements |
| Lumber | Forest | Roads, Settlements |
| Wool | Pasture | Settlements, Development Cards |
| Grain | Fields | Settlements, Cities, Development Cards |
| Ore | Mountains | Cities, Development Cards |

### Core Loop
Roll dice → produce resources on matching hexes → trade → build → score points

## Mechanics Catalog

| Mechanic | Description | Our Equivalent |
|----------|-------------|----------------|
| Dice-driven resource production | Each hex has a number; when rolled, adjacent players get resources | Element source generation |
| Robber | Activated on 7; blocks a hex from producing, steals 1 card | Blocking mechanic (TBD) |
| Trading | Players can trade resources with each other or at ports | <!-- TBD --> |
| Longest Road / Largest Army | Bonus points for achieving milestones | Win condition variety |
| Development Cards | Hidden cards with varied effects (knights, monopoly, etc.) | Spell variety |
| Settlement → City upgrade | Invest resources to upgrade production | Tower upgrades? |

## Type / Element Interactions

Catan doesn't have a type system, but resource **scarcity** creates emergent interactions:
- Rare resources (based on board setup) become trading leverage
- Players compete for hex placement during setup
- The robber creates targeted denial of specific resources

## Competitive / Meta Insights

- **Board setup is king** — initial placement determines 70%+ of outcomes
- **Trading is the social game** — resource interaction is primarily through negotiation
- **Robber creates kingmaking** — targeted blocking can decide who wins
- **Snowball problem** — early leaders get more resources, making comebacks hard

## Relevance Map

| Finding | Informs | Notes |
|---------|---------|-------|
| Random board setup | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Pregame randomization for replayability |
| Robber blocking | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Blocking mechanic design — what moves it, what does it deny? |
| Resource scarcity as interaction | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Element exclusivity reward parallels rare resource leverage |
| Dice-driven production | [decision 001](../../decisions/001-storm-triggers.md) | Random event triggers (Option C) |
| Snowball problem | [balance-philosophy.md](../../philosophy/balance-philosophy.md) | Avoid runaway leader — element exclusivity reward helps |

## Raw Notes

- [ ] Research Catan expansions (Seafarers, Cities & Knights) for mechanic additions
- [ ] Look at Cities & Knights' commodity system (paper, cloth, coin) for dual-resource ideas
- [ ] Investigate the "barbarian attack" mechanic from Cities & Knights — shared threat model
- [ ] Research Catan tournament meta for balance insights
