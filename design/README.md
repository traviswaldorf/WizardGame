# Wizard Game Design Documents

## Reading Order
1. `philosophy/design-vision.md` — **Start here.** The creative vision and three design principles
2. `framework/type-system-overview.md` — Understand the type hierarchy
3. `framework/type-attribute-template.md` — See the template each type doc follows
4. `framework/glossary.md` — Key terminology
5. `philosophy/strategic-archetypes.md` — The 4 strategic archetypes and clusters
6. `philosophy/spell-archetype-system.md` — The 10 spell archetypes
7. `philosophy/balance-philosophy.md` — Balance rules and design constraints
8. `philosophy/game-design-pillars.md` — 13 game design pillars (choice, feedback, emergence, etc.)
9. Individual type docs (any order)
9. `mechanics/*` — Cross-cutting mechanics as needed
10. `decisions/*` — Open design decisions under exploration
11. `reference/*` — MTG mapping, influences, wizard schools, interaction matrix

## Completion Status

### Framework
| Document                  | Status  |
|---------------------------|---------|
| Type Attribute Template   | Done    |
| Type System Overview      | Done    |
| Glossary                  | Done    |

### Philosophy
| Document                | Status  |
|-------------------------|---------|
| [Design Vision](philosophy/design-vision.md) | Done |
| [Discovery Experience](philosophy/discovery-experience.md) | Done |
| [Strategic Archetypes](philosophy/strategic-archetypes.md) | Done |
| Spell Archetype System  | Done    |
| Balance Philosophy      | Draft   |
| [Game Design Pillars](philosophy/game-design-pillars.md) | Draft |
| [Tone & Humor](philosophy/tone-and-humor.md) | Exploration |

### Primary Types
| Document              | Status      |
|-----------------------|-------------|
| [Fire](types/primary/fire.md)   | Seeded |
| [Earth](types/primary/earth.md) | Seeded |
| [Water](types/primary/water.md) | Seeded |
| [Air](types/primary/air.md)     | Seeded |

### Secondary Types
| Document                | Status      |
|-------------------------|-------------|
| [Metal](types/secondary/metal.md)       | Seeded |
| [Plant](types/secondary/plant.md)       | Seeded |
| [Ice](types/secondary/ice.md)           | Seeded |
| [Electric](types/secondary/electric.md) | Seeded |

### Tertiary Types
| Document                      | Status      |
|-------------------------------|-------------|
| [Radioactive](types/tertiary/radioactive.md) | Seeded |
| [Cosmic](types/tertiary/cosmic.md)           | Seeded |
| [Poison](types/tertiary/poison.md)           | Seeded |
| [Sound](types/tertiary/sound.md)             | Seeded |
| [Crystal](types/tertiary/crystal.md)         | Seeded |
| [Ghost](types/tertiary/ghost.md)             | Seeded |
| [Heat](types/tertiary/heat.md)               | Seeded |
| [Magnetic](types/tertiary/magnetic.md)       | Seeded |

### Design Decisions
| Document                    | Status     |
|-----------------------------|------------|
| [001: Storm Triggers](decisions/001-storm-triggers.md) | Exploring |
| [002: Towers vs Pillars](decisions/002-towers-vs-pillars.md) | Exploring |
| [003: Spell Terminology](decisions/003-spell-terminology.md) | Exploring |
| [004: Board Center Identity](decisions/004-board-center-identity.md) | Exploring |
| [005: Incremental Progression Trees](decisions/005-incremental-progression-trees.md) | Exploring |
| [006: Multiplayer Economy Design](decisions/006-multiplayer-economy-design.md) | Exploring |
| [007: Light, Dark & Time as Capstone Types](decisions/007-light-dark-time-capstone-types.md) | Exploring |
| [008: Roguelike School Runs](decisions/008-roguelike-school-runs.md) | Exploring |


### Mechanics
| Document                | Status  |
|-------------------------|---------|
| Storms                  | Done    |
| Status Effects          | Draft   |
| Combos and Synergies    | Draft   |
| Counters                | Draft   |
| Augmenters              | Draft   |
| Win Conditions          | Draft   |

### Lore
| Document                | Status  |
|-------------------------|---------|
| World Overview          | Stub    |
| Old Names and Origins   | Done    |
| [Game Name Ideas](lore/game-name-ideas.md) | Exploration |

### Reference
| Document                  | Status  |
|---------------------------|---------|
| MTG Correspondence Map    | Done    |
| Influences (Index)        | Done    |
| [Type Interaction Matrix](reference/type-interaction-matrix.md) | Exploration |
| [Wizard Schools](reference/scientists/wizard-schools.md) | Exploration |

### Game Research (`reference/games/`)
| Game | Folder | Status |
|------|--------|--------|
| Magic: The Gathering | [games/mtg/](reference/games/mtg/) | Seeded |
| Pokemon | [games/pokemon/](reference/games/pokemon/) | Seeded |
| Catan | [games/catan/](reference/games/catan/) | Seeded |
| Splendor | [games/splendor/](reference/games/splendor/) | Seeded |
| Temtem | [games/temtem/](reference/games/temtem/) | Seeded |
| Breath of the Wild | [games/botw/](reference/games/botw/) | Seeded |
| Elden Ring / Dark Souls | [games/fromsoft/](reference/games/fromsoft/) | Seeded |
| Infinite Craft / Little Alchemy | [games/infinite-craft/](reference/games/infinite-craft/) | Seeded |
| Slay the Spire | [games/slay-the-spire/](reference/games/slay-the-spire/) | Seeded |
| Balatro | [games/balatro/](reference/games/balatro/) | Seeded |

### Prototype-Specific Design (`prototypes/`)

Design docs specific to individual game prototypes. Shared systems (types, mechanics, philosophy) stay in the main `design/` folders.

| Prototype | Document | Status |
|-----------|----------|--------|
| Roguelike | [Overview](prototypes/roguelike/overview.md) | Exploration |
| Roguelike | [Progression System](prototypes/roguelike/progression.md) | Exploration |
| Roguelike | [Tower Design](prototypes/roguelike/tower-design.md) | Exploration |
| Roguelike | [Combat System](prototypes/roguelike/combat.md) | Exploration |
| Roguelike | [Meta-Game](prototypes/roguelike/meta-game.md) | Exploration |
| Roguelike | [Between-Run Progression](prototypes/roguelike/between-runs.md) | Exploration |

## Status Key
- **Done** — Complete with existing data, ready for review
- **Seeded** — Template populated with CSV data, has `<!-- TBD -->` placeholders and Open Questions to fill
- **Draft** — Structure in place, partially filled, needs more design work
- **Stub** — Minimal content, needs significant expansion
- **Exploration** — Open brainstorming space, nothing committed
