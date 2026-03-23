# Breath of the Wild — Relevance to Wizard Game

> **Primary Influence**: Reactive world, physics-based interactions, discovery without tutorials

## Core Design Insight

BotW's interaction system works on ~6-8 physical **properties** (flammability, conductivity, temperature, mass) and a handful of rules. It is NOT a lookup table of "fire + grass = burn." Every object has attributes, and the interactions derive from those attributes. The designers built a simulation layer and let it run.

**Critical takeaway for our game**: Type interactions should emerge from element *properties*, not a scripted table of "Fire beats Ice." If we define that Water conducts, Fire spreads, Metal attracts lightning — the interactions become discoverable through experimentation because they follow consistent rules.

## What Makes It Reactive

- **Consistent rules with no exceptions**: Metal conducts electricity *everywhere*, not just in puzzle rooms. This builds trust that experimentation is always valid.
- **Enemies respond to physics**: They notice fire, flee from it, slip on ice, conduct electricity. The world is not divided into "interactive zones" and "background."
- **Player agency over environment**: The player *causes* changes — starts fires, freezes lakes, creates wind. Reactivity is bidirectional.
- **Delayed consequences**: Lighting grass at a cliff base can clear a camp above before the player arrives. The world runs even without the player watching.

## Teaching Without Tutorials

BotW's Great Plateau is a masterclass in environmental tutorial design:

- **Line of sight to destination**: Hyrule Castle visible from the start — macro goal communicated without a cutscene
- **Controlled scarcity**: Each ability introduced in a context where it's the obvious solution
- **Safe failure**: The Plateau is isolated — failed experiments respawn with no lasting penalty
- **Environmental demonstration**: Burning torches near flammable grass near the fire shrine. The environment shows the system before the puzzle demands it.
- **The game never says "press X to do Y" for most systems**: Cooking, climbing penalties, weapon durability — all discovered through play

## Map / Biome Discovery

- **Towers reveal geography, not content**: You see land shape, not enemy locations or secrets
- **Biomes visually legible from distance**: Plan routes by looking at the horizon, not reading icons
- **No quest markers for most content**: The reward for exploration is intrinsic
- **Climate as natural gating**: Can't enter snow without cold resistance gear — pacing through preparation, not invisible walls

## Direct Application to Our Game

| BotW Mechanic | Our Translation |
|--------------|-----------------|
| Properties-based interactions | Define element properties (conductivity, flammability, etc.) and derive interactions from them |
| Environmental teaching | Introduce interactions in low-stakes early turns before players need to exploit them |
| No exception rules | Every type interaction follows the same logic everywhere — no special cases |
| Bidirectional reactivity | Players cause changes, not just respond to them |
| Geography reveals, not content | Show players the *shape* of the type system without revealing what each interaction does |
