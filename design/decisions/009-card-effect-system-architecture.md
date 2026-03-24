# Decision: Card Effect System Architecture

> **ID**: 009
> **Status**: Exploring
> **Date Opened**: 2026-03-23
> **Date Decided**: ---
> **Related Docs**: `design/mechanics/`, `design/philosophy/spell-archetype-system.md`, `frontend/src/sandbox/game.js`, `frontend/src/roguelike/game.js`

## Context

The Wizard Game needs a system for defining and resolving card mechanics---triggers, actions, effects, targets, statuses, and combos---in a data-driven way. The game has MTG-like complexity (type interactions, combo chains, status effects, storms) combined with Slay the Spire-like single-player roguelike progression. The system must:

- Define card effects as **data** (JSON/config), not hard-coded per-card logic
- Handle **trigger chains** (e.g., "when a Fire spell is cast, all Kindling tokens ignite")
- Support **effect resolution ordering** (stack-based like MTG, or queue-based like Hearthstone)
- Integrate with **boardgame.io** (already in use for both sandbox and roguelike modes)
- Scale to 16+ types with complex cross-type interactions and combo mechanics

This document surveys JavaScript libraries and architectural patterns for building this system.

---

## Reference: How Existing Games Handle This

### Hearthstone --- Event Queue / Trigger System

Hearthstone uses a **depth-first event resolution** model. When an event fires (e.g., "minion takes damage"), the system immediately resolves all consequences of that event before moving to the next pending event. Key concepts:

- **Triggers** are organized by **order of play** (the sequence entities entered the game)
- When a Phase begins, a **Queue** is created and filled with all responding triggers in play order
- The Queue becomes **immutable** once resolution begins (no new entries mid-resolution)
- Resolution is **depth-first**: one event and all its consequences fully resolve before the next begins
- Board state updates **immediately** when an event occurs (no deferred state)
- Deaths are only processed at specific **Death Creation Steps** between phases

This is well-suited to games where effects cascade predictably and you want players to learn consistent ordering rules.

### MTG --- Priority Stack

MTG uses a **LIFO stack** with a **priority** system:

- Spells and abilities go on the stack when cast/activated
- All players must pass priority before the top item resolves
- Players can respond by adding more items to the stack ("in response to...")
- Resolution is **last-in, first-out**
- The stack enables interactive, interrupt-heavy gameplay

This is the gold standard for games with instant-speed interaction between players, but adds complexity to both implementation and player experience.

### Slay the Spire --- Enum-Based Effect System

The original Slay the Spire (Java/LibGDX) used **enum-based effect types** with hard-coded resolution per enum value. Slay the Spire 2 (Godot 4) shifted to a **fully data-driven architecture**:

- Card effects defined via **JSON payloads** and Godot's scene system
- Actions resolve through "organic cause-and-effect chains instead of massive blocks of rigid logic"
- State-based effects update dynamically
- Built-in data-driven modding tools from the ground up

This evolution---from enum-based to data-driven---is directly relevant to our design choices.

---

## Options

### Option A: XState (State Machine / Actor Model)

**Description**: Use XState v5 to model the game's effect resolution as hierarchical state machines. Each card effect, combat encounter, or combo chain could be an **actor** (spawned state machine) that communicates via events. The game turn structure (phases, priority windows, resolution steps) maps naturally to statechart states and transitions.

**How it would work**:
- Top-level machine: game flow (setup -> draft -> combat -> cleanup)
- Nested machines: combat phases (player turn -> effect resolution -> enemy turn)
- Spawned actors: individual effect chains, each with their own state (pending -> resolving -> resolved)
- Guards: conditional logic (e.g., "only if target has Kindling status")
- Actions: side effects (deal damage, apply status, draw card)
- Parallel states: simultaneous triggers that need independent resolution

**Library**: [XState v5](https://stately.ai/docs/xstate) --- MIT license, zero dependencies, ~45KB, actively maintained by Stately.ai

**Pros**:
- Excellent for modeling complex **game flow** (turns, phases, priority)
- Visual editor at stately.ai for designing and debugging state machines
- Built-in support for parallel states, guards, delayed transitions
- Actor model naturally handles spawning child effect-resolution machines
- Strong TypeScript support
- Well-tested, production-grade library
- Deterministic---great for replay and debugging

**Cons**:
- State machines excel at **game flow** but are awkward for **individual card effect definitions** (you don't want a state machine per card)
- Defining 200+ card effects as XState configs would be extremely verbose
- The abstraction doesn't map well to "deal 3 damage and draw 1 card"---that's an action, not a state transition
- Learning curve for statecharts is steep
- Overkill if your effect resolution is simple (linear, no interrupts)
- Not data-driven for card definitions---effects would still need a separate representation

**Interactions**: Could work alongside boardgame.io for managing game phases, but would need a bridge layer. XState would manage resolution flow; card effects would still need a separate data format.

**Inspiration**: Board Game Arena uses state machines for game flow. Many turn-based games use FSMs for phase management.

**Verdict**: Best suited as the **game flow orchestrator** (turn phases, resolution steps), not as the card effect definition system. Could be combined with another approach for the actual effect data.

---

### Option B: boardgame.io Plugin + bgio-effects

**Description**: Build the effect system as a custom **boardgame.io plugin** using the existing plugin API, augmented by the [bgio-effects](https://github.com/delucis/bgio-effects) library for client-side effect signaling.

**How it would work**:
- **Custom plugin** exposes an effect API on `ctx` (e.g., `ctx.effects.dealDamage({ target, amount })`)
- Plugin lifecycle hooks:
  - `setup()`: initializes effect queue, trigger registry, status tracker
  - `api()`: provides the effect-calling interface to moves
  - `flush()`: persists resolved effects and updated statuses back to game state
  - `fnWrap()`: wraps moves to automatically check triggers before/after execution
  - `isInvalid()`: validates effect targeting and cost requirements
- **bgio-effects** bridges to the client: emits named events ("explosion", "statusApplied") so the renderer can animate them
- Card definitions stored in the database (already have `spell_combination_design`, `counter_design` tables)

**Library**: [boardgame.io plugins](https://boardgame.io/documentation/#/plugins) (built-in) + [bgio-effects](https://www.npmjs.com/package/bgio-effects) (MIT, small)

**Pros**:
- **Native integration** with the framework already in use
- Plugin system is specifically designed for this kind of extension
- bgio-effects solves the "how does the client know what happened" problem cleanly
- All state changes go through boardgame.io's deterministic state management
- Multiplayer sync comes free
- Can be built incrementally---start simple, add complexity
- `fnWrap` is powerful: can automatically fire triggers around any move

**Cons**:
- boardgame.io hasn't had a major release since 0.50.2 (3+ years ago); community is smaller
- bgio-effects is a small community library (low bus factor)
- The plugin API is flexible but you must design the effect resolution engine yourself
- No built-in support for effect stacks, priority, or trigger ordering
- Plugin data is opaque to moves (stored in plugin space, not `G`)

**Interactions**: Direct integration with existing `frontend/src/sandbox/game.js` and `frontend/src/roguelike/game.js`. Card data already lives in SQLite and can feed effect definitions.

**Inspiration**: boardgame.io's own PluginPlayer manages per-player state through this pattern.

**Verdict**: The right **integration layer** since boardgame.io is already the foundation. But the core effect resolution logic still needs to be designed---the plugin is a container, not an engine.

---

### Option C: JSON Rules Engine (json-rules-engine)

**Description**: Use [json-rules-engine](https://github.com/CacheControl/json-rules-engine) to define card effects as declarative JSON rules with conditions and actions.

**How it would work**:
```json
{
  "conditions": {
    "all": [
      { "fact": "spellType", "operator": "equal", "value": "Fire" },
      { "fact": "targetHasStatus", "operator": "equal", "value": "Kindling",
        "params": { "statusName": "Kindling" } }
    ]
  },
  "event": {
    "type": "bonusDamage",
    "params": { "multiplier": 2, "reason": "Kindling ignition" }
  }
}
```
- Card effects defined as rules in JSON (storable in database)
- The engine evaluates conditions against "facts" (game state)
- When conditions match, events fire (which trigger game actions)
- Supports nested boolean logic (`all`, `any`, `not`)
- Dynamic fact resolution and parameterized conditions

**Library**: [json-rules-engine](https://www.npmjs.com/package/json-rules-engine) --- MIT, ~800 weekly downloads, maintained

**Pros**:
- Fully **data-driven**: rules are pure JSON, storable in SQLite
- Nested boolean conditions handle complex trigger requirements
- Decouples "when does this fire" from "what does it do"
- Non-programmers can author rules (with tooling)
- Supports prioritized rule evaluation
- Can model type interactions as rules ("if attacker is Water and defender is Fire, bonus damage")

**Cons**:
- Designed for **business rules**, not game effect chains
- No built-in concept of **sequencing** (stack/queue) or **interrupts**
- Each rule evaluation is independent---doesn't naturally handle cascading triggers
- "Actions" are just event emissions; you still need to write the handlers
- Performance could be a concern with 200+ rules evaluated per game action
- The rule format is verbose for simple effects ("deal 3 damage" requires a full rule object)
- No concept of targets, zones, or game-specific abstractions

**Interactions**: Could feed into the boardgame.io plugin (Option B) as the condition-checking layer. The plugin handles sequencing; the rules engine handles "should this trigger?"

**Inspiration**: Business process automation, insurance/lending rule systems. Not commonly used in games.

**Verdict**: Useful for the **conditional logic** layer (determining WHEN effects trigger), but insufficient as a complete effect system. Too verbose for simple effects, too flat for cascading resolution.

---

### Option D: Entity Component System (bitECS / Miniplex)

**Description**: Model the game using ECS architecture where entities (cards, players, zones, status effects) are composed of data components, and systems process entities matching specific component queries.

**How it would work**:
- **Entities**: each card in play, each status effect, each player, each zone
- **Components**: `DamageEffect { amount }`, `StatusEffect { type, duration }`, `Trigger { event, condition }`, `Target { zone, filter }`, `TypeTag { primary, secondary }`
- **Systems**: `DamageResolutionSystem`, `TriggerCheckSystem`, `StatusTickSystem`, `ComboDetectionSystem`
- Systems query for entities with matching components and process them each frame/turn

**Libraries**:
- [bitECS](https://github.com/NateTheGreatt/bitECS) --- MIT, high performance (SoA architecture), used in Phaser 4 development, TypeScript
- [Miniplex](https://github.com/hmans/miniplex) --- MIT, developer-friendly, no built-in systems (you write your own loops), object-based entities
- [Becsy](https://github.com/LastOliveGames/becsy) --- MIT, multithreaded, TypeScript, inspired by bitECS

**Pros**:
- Extremely **composable**: card effects are combinations of components
- Scales well---adding new effect types means adding new components + systems
- Natural fit for **status effects** (entities with duration components, tick systems)
- bitECS is very performant (SoA memory layout)
- Clean separation of data (components) and behavior (systems)
- Well-suited for the roguelike mode where many entities interact

**Cons**:
- **Paradigm mismatch** with boardgame.io: bgio manages state as a plain JS object (`G`), while ECS wants to own the world state
- ECS is designed for **continuous simulation** (60fps game loops), not turn-based resolution
- Ordering and priority of system execution must be managed manually
- No inherent support for trigger chains or effect stacks
- bitECS uses numeric IDs and typed arrays---awkward for rich card data (names, descriptions, lore)
- Miniplex is more ergonomic but less performant
- Would require significant bridging code to sync ECS world state with boardgame.io `G`

**Interactions**: Significant friction with boardgame.io's state model. Would essentially require running a parallel state system.

**Inspiration**: Real-time games, simulation games. Rarely used in turn-based card games.

**Verdict**: ECS is a powerful architecture but a **poor fit** for this project given the boardgame.io foundation and turn-based nature. The component model is inspiring for data design, but the system execution model doesn't align.

---

### Option E: Custom Event/Trigger System (Observer + Command Pattern)

**Description**: Build a bespoke effect system using well-established game programming patterns: **Observer** (for triggers), **Command** (for effects as reified actions), and **Interpreter** (for reading effect definitions from data).

**How it would work**:

**1. Effect definitions as data (JSON in SQLite):**
```json
{
  "id": "fire_bolt",
  "name": "Fire Bolt",
  "cost": { "energy": 2 },
  "effects": [
    { "type": "damage", "amount": 3, "target": "selected_enemy" },
    { "type": "apply_status", "status": "Burning", "duration": 2, "target": "selected_enemy" }
  ],
  "triggers": [
    { "event": "on_cast", "condition": { "target_has_status": "Kindling" }, "bonus_effects": [
      { "type": "damage", "amount": 3, "target": "same" }
    ]}
  ]
}
```

**2. Effect interpreter** reads JSON and produces Command objects:
```javascript
// Pseudocode
class DamageCommand {
  constructor(amount, target) { ... }
  execute(gameState) { /* reduce target HP, emit 'damage_dealt' event */ }
  undo(gameState) { /* for replay/rewind */ }
}
```

**3. Event bus** (typed EventEmitter) dispatches game events:
```javascript
eventBus.emit('spell_cast', { spell, caster, targets });
eventBus.emit('damage_dealt', { source, target, amount });
eventBus.emit('status_applied', { status, target, source });
```

**4. Trigger registry** listens for events and checks conditions:
```javascript
triggerRegistry.register({
  event: 'damage_dealt',
  condition: (ctx) => ctx.target.hasStatus('Kindling'),
  effect: { type: 'bonus_damage', amount: 3 }
});
```

**5. Resolution queue** orders and executes effects:
- Choose stack (LIFO, MTG-style) or queue (FIFO, Hearthstone-style) based on design preference
- Depth-first or breadth-first resolution as a configuration choice

**Libraries needed** (all lightweight):
- [mitt](https://github.com/developit/mitt) (~200 bytes) or [typed-emitter](https://github.com/andywer/typed-emitter) for the event bus
- Standard JSON + sqlite3 for effect data storage
- Everything else is custom code, ~500-1000 lines for the core engine

**Pros**:
- **Maximum control** over resolution semantics (stack vs. queue, depth-first vs. breadth-first)
- Effect definitions are **pure data** (JSON), storable in the existing SQLite database
- Maps directly to game design vocabulary (triggers, effects, targets, conditions)
- **Minimal dependencies**---just a tiny event emitter
- Can model ALL the game's mechanics: type interactions, combos, storms, status effects, counters
- Command pattern enables **undo/redo** and **replay** for free
- Integrates cleanly with boardgame.io (effect resolution runs inside moves)
- Can start simple and grow incrementally
- The effect interpreter can be tested independently of the UI

**Cons**:
- **You build everything yourself**---no library handles resolution ordering, targeting, etc.
- Risk of reinventing wheels and introducing subtle bugs in resolution logic
- Requires disciplined architecture to avoid spaghetti event chains
- No visual editor (unlike XState's Stately editor)
- Must manually ensure determinism for multiplayer sync
- Testing trigger cascades and edge cases requires comprehensive test suites

**Interactions**: Integrates naturally with boardgame.io plugin system (Option B) and SQLite database. The plugin wraps the effect engine; the engine reads card data from the database.

**Inspiration**: This is essentially how Hearthstone, Slay the Spire 2, and most custom card game engines work internally. The [Forge MTG engine](https://github.com/Card-Forge/forge) (Java) uses a similar command/event architecture. The [Game Architecture for Card Game Model](https://bennycheung.github.io/game-architecture-card-ai-1) article describes this pattern with enum-based powers, composition over inheritance, and a library pattern for card data.

**Verdict**: The most **flexible and appropriate** approach for a custom card game. Requires the most upfront design work, but produces a system perfectly tailored to the game's specific needs.

---

### Option F: Hybrid --- XState for Flow + Custom Engine for Effects + boardgame.io Plugin for Integration

**Description**: Combine the strengths of multiple approaches:

1. **boardgame.io plugin** (Option B) as the integration container
2. **Custom event/trigger/command system** (Option E) as the effect resolution engine
3. **XState** (Option A) optionally for complex resolution flows (e.g., Storm sequences, multi-step combos that require player choices mid-resolution)
4. **JSON effect definitions** stored in SQLite (already in the database)

**Layer diagram**:
```
+--------------------------------------------------+
|  boardgame.io  (state sync, multiplayer, turns)   |
|  +--------------------------------------------+  |
|  |  Effect Plugin  (wraps moves, manages       |  |
|  |                  triggers, routes to engine) |  |
|  |  +--------------------------------------+  |  |
|  |  |  Effect Engine                       |  |  |
|  |  |  - Event Bus (mitt)                  |  |  |
|  |  |  - Trigger Registry                  |  |  |
|  |  |  - Command Interpreter               |  |  |
|  |  |  - Resolution Queue (FIFO or LIFO)   |  |  |
|  |  +--------------------------------------+  |  |
|  |  +--------------------------------------+  |  |
|  |  |  Card Data (SQLite / JSON)           |  |  |
|  |  |  - Effect definitions                |  |  |
|  |  |  - Trigger conditions                |  |  |
|  |  |  - Type interaction rules            |  |  |
|  |  +--------------------------------------+  |  |
|  +--------------------------------------------+  |
|  +--------------------------------------------+  |
|  |  bgio-effects  (client-side animations)    |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

**Pros**:
- Each layer does what it's best at
- boardgame.io handles what it already handles (sync, turns, multiplayer)
- Effect engine is custom-fit to the game's resolution model
- Card data stays in the database where it already lives
- XState is optional---only introduced if resolution flows become complex enough to warrant it
- bgio-effects bridges to the renderer without coupling game logic to UI
- Can be built incrementally: start with simple effects, add trigger chains, add combos

**Cons**:
- Multiple abstractions to understand and maintain
- Need to carefully define the boundaries between layers
- Slightly more architecture to set up initially

**Interactions**: Directly extends the existing codebase. The roguelike mode and sandbox mode both use boardgame.io; this adds a shared effect engine beneath both.

---

## Library Summary Table

| Library | Purpose | Size | Maintained | Best For |
|---------|---------|------|------------|----------|
| [XState v5](https://stately.ai/docs/xstate) | State machines, actors | ~45KB | Yes (Stately.ai) | Game flow / phase management |
| [boardgame.io](https://boardgame.io/) | Turn-based game framework | ~50KB | Slow (last release 3yr ago) | Already in use; state sync + multiplayer |
| [bgio-effects](https://github.com/delucis/bgio-effects) | Client-side effect signaling | Small | Community | Bridging game logic to animations |
| [json-rules-engine](https://github.com/CacheControl/json-rules-engine) | Declarative JSON rule evaluation | ~20KB | Yes | Conditional trigger checking |
| [bitECS](https://github.com/NateTheGreatt/bitECS) | High-perf ECS | ~10KB | Yes | Real-time games, not turn-based |
| [Miniplex](https://github.com/hmans/miniplex) | Developer-friendly ECS | ~5KB | Yes | Simulations, entity management |
| [Becsy](https://github.com/LastOliveGames/becsy) | Multithreaded ECS | Medium | Yes | Complex simulations |
| [mitt](https://github.com/developit/mitt) | Tiny event emitter | 200B | Yes | Event bus for trigger system |
| [typed-emitter](https://github.com/andywer/typed-emitter) | Type-safe EventEmitter | Small | Yes | TypeScript event bus |
| [Forge](https://github.com/Card-Forge/forge) | MTG rules engine (Java) | Large | Yes | Reference architecture only |

## Recommendation

**Option F (Hybrid)** is the strongest path forward, built incrementally:

**Phase 1 --- Foundation** (minimal, start here):
- Define a JSON schema for card effects in SQLite (extend existing `spell_combination_design` tables)
- Build a simple effect interpreter that reads JSON and executes commands against `G`
- Wire it into boardgame.io moves directly (no plugin yet)
- Use mitt for a basic event bus to support trigger chains

**Phase 2 --- Plugin + Triggers**:
- Extract the effect engine into a boardgame.io plugin
- Add the trigger registry (events -> conditions -> bonus effects)
- Add bgio-effects for client-side animation hooks
- Build a resolution queue with configurable ordering (FIFO vs LIFO)

**Phase 3 --- Advanced Resolution**:
- Add type interaction rules as triggers (Water vs Fire bonus, combo detection)
- Add status effect system (apply, tick, expire, interact)
- Consider XState if multi-step resolution flows need complex state management
- Consider json-rules-engine if conditional logic becomes very complex

This approach starts simple, stays data-driven, integrates with what already exists, and leaves room to grow toward the full complexity the type system demands.

## Open Questions

- [ ] Stack-based (MTG-style LIFO) or queue-based (Hearthstone-style FIFO) resolution?
- [ ] Does the game need instant-speed interaction (players responding during opponent's turn)?
- [ ] How should the effect system handle the "discovery" principle---should new interactions be emergent from simple rules, or explicitly authored?
- [ ] What is the JSON schema for effect definitions? (Needs a concrete draft)
- [ ] Should the trigger system support "replacement effects" (modify an effect before it happens) in addition to "triggered effects" (react after something happens)?
- [ ] How do Storm mechanics integrate with the effect queue?

## Playtest Notes

| Date | Option Tested | Observation | Verdict |
|------|---------------|-------------|---------|
|      |               |             |         |

## Decision

**Chosen**: ---
**Rationale**: ---

---

## Sources

- [XState v5 Documentation](https://stately.ai/docs/xstate)
- [XState Actors](https://stately.ai/docs/actors)
- [boardgame.io Plugin Docs](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/plugins.md)
- [bgio-effects](https://delucis.github.io/bgio-effects/)
- [json-rules-engine](https://github.com/CacheControl/json-rules-engine)
- [json-rules-engine Rules Documentation](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md)
- [bitECS](https://github.com/NateTheGreatt/bitECS)
- [Miniplex](https://github.com/hmans/miniplex)
- [Becsy ECS](https://github.com/LastOliveGames/becsy)
- [mitt - Tiny Event Emitter](https://github.com/developit/mitt)
- [typed-emitter](https://github.com/andywer/typed-emitter)
- [Forge MTG Rules Engine](https://github.com/Card-Forge/forge)
- [Hearthstone Advanced Rulebook](https://hearthstone.wiki.gg/wiki/Advanced_rulebook)
- [MTG Stack Mechanics](https://mtg.fandom.com/wiki/Stack)
- [MTG Priority System](https://mtg.fandom.com/wiki/Timing_and_priority)
- [Observer Pattern - Game Programming Patterns](https://gameprogrammingpatterns.com/observer.html)
- [Event Queue - Game Programming Patterns](https://gameprogrammingpatterns.com/event-queue.html)
- [Command Pattern - Game Programming Patterns](https://gameprogrammingpatterns.com/command.html)
- [Game Architecture for Card Game Model](https://bennycheung.github.io/game-architecture-card-ai-1)
- [ECS Overview - Web Game Dev](https://www.webgamedev.com/code-architecture/ecs)
- [Slay the Spire 2 Godot Engine Shift](https://rivalsector.com/slay-the-spire-2-godot-engine-shift-frame-data-and-deck-synergy-overhaul/)
- [Data-Driven Design in Games](https://dev.to/methodox/data-driven-design-leveraging-lessons-from-game-development-in-everyday-software-5512)
- [Card Games e Data-Driven](https://dev.to/feliperes/card-games-e-data-driven-48mb)
