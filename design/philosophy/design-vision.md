# Design Vision

> The high-level creative goals that drive every design decision. When in doubt about a mechanic, spell, type interaction, or feature — come back here.

---

## The Core Fantasy

This game captures the feeling of discovering science for the first time — that moment as a kid when you learn about forces, elements, and energy, and the universe suddenly becomes a world of exploration and understanding. Each new concept feels like unlocking a new *power*. Gravity isn't just a word — it's a force you can feel, predict, and use. Electricity isn't abstract — it's lightning you can harness.

Throughout history, the people who unlocked these discoveries were treated with awe and suspicion in equal measure. Any sufficiently advanced understanding looks like magic to those who don't have it yet. Scientists were the original wizards — people who could see the hidden rules of the universe and bend them to their will.

This game makes that metaphor literal. Science IS magic. The type system is physics. The spells are discoveries. The wizard schools are branches of human knowledge. And the player's journey through a game mirrors humanity's journey through scientific understanding — starting with basic elements and building toward mastery of the forces that shape reality.

---

## The Three Design Principles

### 1. Discovery as Magic

**The wonder of unlocking knowledge.**

The player experience should feel like the first time you learned that mixing two chemicals creates a reaction, or that moving a magnet near a wire creates electricity. Each new type, spell, and interaction is a discovery — not just a game mechanic. The game should make players feel clever for finding combinations, not because they memorized a chart, but because the interactions make *intuitive sense* grounded in how the real world works.

- Types, interactions, and spells are inspired by real physics, chemistry, and biology
- Discovering a combo should feel like a "eureka" moment, not a lookup
- The wizard school lore frames historical scientists as elemental masters — their real discoveries are the spells
- Knowledge IS power — literally. Understanding the type system gives you strategic advantage
- The game teaches real science through play, without ever feeling educational
- **No type charts, no combo guides, no full spell lists.** Discovery is not a feature — it IS the game. See [Discovery Experience](discovery-experience.md) for the three tiers of discovery and their design implications.

**Design test**: When adding a new mechanic or interaction, ask: "Would a curious kid find this cool to discover? Does it connect to something real about how the universe works?"

### 2. A World of Interaction

**Everything connects to everything.**

The type system is not a flat list of elements — it's a web of relationships. Every pair of types has a relationship: composition, synergy, counter, tension. The richness of the game comes from these interactions, not from any single type in isolation. No element exists alone. Fire means nothing without Water to counter it, Air to combine with it, and Earth to compose Metal with it.

- The type interaction matrix is the heart of the game's strategic depth
- Multi-type spell costs (e.g., Poison + Air = Toxic Cloud) reward players who explore combinations
- Counter relationships create natural checks and balances
- Reactions and compositions mirror real chemistry — Fire + Poison = Radioactive
- The game should feel like a living ecosystem, not a static menu of options

**Design test**: When adding a new type, spell, or effect, ask: "How does this interact with at least 3 other things? Does it create new strategic possibilities through combination?"

### 3. Progression and Advancement

**Building up from nothing toward mastery.**

The arc of a game should mirror the arc of scientific progress: start with basic elements, combine them into more complex materials, unlock deeper understanding, and eventually wield powerful forces. Early turns feel like discovering fire. Late turns feel like splitting the atom.

This naturally aligns with engine-building game design — gathering resources, investing in infrastructure, compounding returns, and racing toward a crescendo. But more broadly, it's about the feeling of *advancement*. Each turn, you know more, have more, and can do more. Your position compounds. Your discoveries enable further discoveries.

- Primary elements are simple and accessible; secondary and tertiary types require investment and combination
- Tower-building and resource gathering create compounding returns
- The element exclusivity reward encourages deep investment in a "branch" of knowledge
- Late-game spells and combos should feel dramatically more powerful than early-game options
- The progression curve should feel earned, not given — mastery comes from strategic investment

**Design test**: When designing the resource/turn economy, ask: "Does this reward sustained investment? Does the player feel more powerful at turn 10 than turn 1? Does it feel like building something, not just spending something?"

---

## How the Principles Connect

The three principles reinforce each other:

```
        Discovery as Magic
              /        \
             /          \
  A World of            Progression &
  Interaction           Advancement
             \          /
              \        /
          [The Game Experience]
```

- **Discovery + Interaction**: The more interactions exist, the more "eureka" moments players experience. Finding that Water + Electric = conductivity bonus feels like a real scientific insight.
- **Discovery + Progression**: Unlocking tertiary types and powerful combos later in the game mirrors the historical arc of scientific discovery — you can't split the atom until you understand the atom.
- **Interaction + Progression**: The engine you build determines which interactions you can access. Investing in Fire + Earth gives you Metal, which opens new combo lanes. Your progression path shapes your interaction possibilities.

---

## What This Game Is NOT

To keep the vision sharp, it helps to define what we're not building:

- **Not a trivia game** — Players don't need to know science to play. The science is the *inspiration*, not the requirement. The interactions should feel natural even to someone who has never heard of conductivity.
- **Not an educational product first** — Education is a byproduct of good design, not the goal. If the game is fun, players will absorb the science. If we optimize for teaching, the game will suffer.
- **Not a simple rock-paper-scissors** — The counter system exists, but it's not the whole game. Interactions are richer than "X beats Y." They include synergies, compositions, tensions, and ratio-dependent effects.
- **Not a solitaire engine-builder** — The engine-building serves the interaction. Your engine collides with other players' engines. Building in isolation should be suboptimal compared to engaging with the board and with opponents.

---

## The Elevator Pitch

*What if the greatest scientists in history were actually elemental wizards, and their discoveries were spells? Build your knowledge, combine elements, and master the forces of nature in a game where science is magic and the laws of physics are your spellbook.*

---

## Open Questions

- [ ] How explicitly "educational" should the science framing be? Subtle flavor or overt?
- [ ] Should the game have a solo/campaign mode where you literally "discover" types in sequence?
- [ ] How does the progression arc map to game length — 30 minutes? 60? 90?
- [ ] Is there a "tech tree" visible to players, or are combinations discovered through play?
- [ ] Should the wizard school lore be front-and-center (card art, flavor text) or background material?
