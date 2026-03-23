# Influences and Inspiration

## Game Inspirations

Each game has a detailed research folder under `games/` with mechanics catalogs, type interactions, competitive insights, and relevance maps back to our design docs.

| Game | Primary Influence | Deep Dive |
|------|-------------------|-----------|
| **Magic: The Gathering** | Color pie, spell archetypes, strategic pillars, type counters | [games/mtg/](games/mtg/) |
| **Pokemon** | Terrain/weather systems, type interaction matrix, status effects | [games/pokemon/](games/pokemon/) |
| **Catan** | Resource gathering, board randomization, robber/blocking | [games/catan/](games/catan/) |
| **Splendor** | Card preview, engine building, tiered cost curves | [games/splendor/](games/splendor/) |
| **Temtem** | Synergy mechanic (partner type bonuses), stamina/overexertion, hold cooldowns | [games/temtem/](games/temtem/) |
| **Slay the Spire** | Roguelike run structure, character unlock loop, boss-as-archetype-check, equipment tradeoffs, meta-progression | [games/slay-the-spire/](games/slay-the-spire/) |
| **Balatro** | Shop design between combats, Joker/relic system, scoring engine philosophy, deck manipulation, unlock-only meta-progression | [games/balatro/](games/balatro/) |

### Discovery-Focused Inspirations

These games specifically inform the [Discovery Experience](../philosophy/discovery-experience.md) — how players encounter, learn, and re-experience the game.

| Game | Primary Influence | Relevance |
|------|-------------------|-----------|
| **Breath of the Wild** | Reactive world, physics-based interactions, discovery of an open map with biomes | The world itself is interactive — fire spreads, metal conducts lightning, wind carries things. A simpler element system than ours, but the REACTIVITY of the world is the model. Players learn by experimenting, not reading tutorials. Discovery of the map mirrors our Tier 1 discovery of the type system. |
| **Elden Ring / Dark Souls** | Progressive map expansion, minimal hand-holding, community discovery culture, New Game+ | The game deliberately withholds information. You discover by doing, failing, and overcoming. The moment you find an elevator that takes you to an entire underground world you didn't know existed — that scale-expansion wonder is what our Tier 1 should feel like. The community culture (wikis exist, but the game doesn't tell you) mirrors our "Fight Club" principle. NG+ with increased enemy resistances parallels our Tier 2 meta-game and Tier 3 re-discovery. |
| **Infinite Craft / Little Alchemy** | Combination graph discovery, starting from 4 base elements, progressive unlocking | Start with Water, Fire, Wind, Earth. Drag to combine. Discover new things. The entire game IS the discovery loop. Their combination graph (simple elements → complex concepts) directly parallels our primary → secondary → tertiary progression. The excitement of finding a new combination is the core emotion we want to capture. [Infinite Craft](https://neal.fun/infinite-craft/), [Recipe reference](https://infinitecraftrecipe.com/) | [games/infinite-craft/](games/infinite-craft/) |

### Future Research Candidates
- [ ] **Dominion** — Deck building, action economy, kingdom card market
- [ ] **Hearthstone** — Hero powers, keyword abilities, digital card game pacing
- [ ] **Yu-Gi-Oh** — Chain/stack resolution, field spells, archetype-driven deckbuilding
- [ ] **Spirit Island** — Asymmetric powers, escalating threat, element thresholds for innate powers
- [ ] **Gloomhaven** — Card-driven combat, persistent effects, multi-layered event systems
- [ ] **Terraforming Mars** — Global parameter thresholds, engine building, tag synergies

## Physics Inspirations

The type system is grounded in real-world physics, with each tier mapping to scientific concepts:

### States of Matter (Primary Types)
| Type  | State  | Physical Basis                     |
|-------|--------|-------------------------------------|
| Fire  | Plasma | Ionized gas, extreme heat           |
| Earth | Solid  | Rigid structure, mass, density      |
| Water | Liquid | Fluid dynamics, flow, adaptability  |
| Air   | Gas    | Pressure, expansion, invisible force |

### Energy Domains (Tertiary Pairs)
| Pair             | Physics Domain      | Key Concepts                        |
|------------------|---------------------|-------------------------------------|
| Fire/Radioactive | Nuclear physics     | Fission, fusion, decay, half-life   |
| Metal/Crystal    | Solid-state physics | Lattice, covalent bonds, resonance  |
| Earth/Cosmic     | Gravitation         | Gravity wells, orbital mechanics    |
| Plant/Ghost      | Biology             | Life cycles, decomposition, entropy |
| Water/Poison     | Chemistry           | Chemical reactions, corrosion       |
| Ice/Heat         | Thermodynamics      | Temperature, entropy, heat engines  |
| Air/Sound        | Acoustics           | Pressure waves, resonance, frequency |
| Electric/Magnetic| Electromagnetism    | Fields, induction, circuits         |

## Open Questions
- [ ] Should the physics grounding be explicit in-game or just inform design?
- [ ] Cultural/mythological influences for each type (not yet explored)
