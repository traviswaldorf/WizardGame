# Discovery Experience

> How players encounter, learn, and re-experience the game across all skill levels.
> This document expands on the "Discovery as Magic" pillar from the [Design Vision](design-vision.md).

---

## Core Philosophy

The game begins in a state of nothing. No charts, no guides, no full spell lists. A new player should feel like they've arrived in a barren universe with no understanding — the same way early humans faced the natural world before science existed. The only instructions are the lightest possible:

> *"You're in a universe. You receive energy. You combine and explore interactions by casting."*

Focus the rules on what a turn is and how to act. Encourage exploration. Do not explain what will happen. **Discovery is not a feature of the game — it IS the game.**

### The "Fight Club" Principle

Players who have experienced the game should instinctively want to protect that experience for others. Spoiling the type interactions, spell combinations, or progression should feel like robbing someone of the magic. The culture around this game should be: *"You have to experience it for the first time yourself."*

This is not enforced by rules — it emerges naturally when the first-time experience is good enough that veterans remember it and want others to have it too.

---

## Three Tiers of Discovery

### Tier 1 — First Discovery (New Players)

**What it is**: A player's first 1-3 games. They don't know what types exist, how they combine, what counters what, or what spells are possible.

**The experience**: Every turn is genuine exploration. "What happens if I combine these two energies?" The answer isn't in a rulebook — it's revealed through play. The board starts barren. Knowledge is earned, not given.

**Design implications**:
- No type chart in the box/manual
- No combination guide
- No full spell list
- Minimal starting rules — focus on the turn structure and how to cast
- The game teaches itself through play, not through reading
- Early discoveries should feel rewarding and intuitive ("Oh, these two made something new!")
- The progression from primary elements to secondary to tertiary should unfold over multiple games, not one session

**Key question**: How much does a player retain between games? Do they remember their discoveries, or does each game start fresh?

---

### Tier 2 — Meta Understanding (Experienced Players)

**What it is**: After several games, a player has uncovered most or all type combinations and interactions. They understand the system. They can plan strategies before the game begins.

**The experience**: The game shifts from "what does this do?" to "how do I use what I know?" Strategic depth replaces discovery surprise. Building engines, reading opponents, timing combos, and exploiting counter-relationships become the focus.

**Design implications**:
- The game must have enough strategic depth that full knowledge doesn't make it boring
- Meta-game strategies should be diverse — multiple viable paths to victory
- Player interaction and opponent-reading replace discovery as the primary source of engagement
- Advanced strategies (multi-type spells, ratio-dependent effects, chain reactions) provide skill expression
- This is the tier where the engine-building pillar fully activates — experienced players build more sophisticated engines

**Key question**: Is the meta-game deep enough to sustain repeated play once everything is known? This is where the "World of Interaction" and "Progression" pillars carry the weight.

---

### Tier 3 — Randomized Rediscovery (Advanced/Expert Players)

**What it is**: For players who know everything — every type, every combo, every counter — the game offers a mode where all names and identities are randomized. "Fire" is no longer called Fire. "Water" isn't Water. Every type gets a procedurally generated name that is unrecognizable.

**The experience**: Expert players are forced to rediscover the system from scratch. They can't identify "Fire" by name — they have to test interactions and observe behaviors. "Does this energy counter that one? Then maybe this is the 'Water' equivalent..." The underlying physics-based interactions remain the same, but the labels are stripped away.

This is genuine re-discovery. The expert player's knowledge of the system becomes a tool for faster pattern-matching, but they can't shortcut to answers — they have to test and deduce.

**Design implications**:
- Requires a digital system — physical cards can't change their names once printed
- The randomization must be consistent within a single game (the thing called "Xarvo" is always "Xarvo" for the duration of that game)
- Visual theming may also need to shift — if Fire always looks red, experts will identify it instantly regardless of the name
- The underlying interaction rules stay identical — only the presentation layer changes
- This mode could have difficulty levels:
  - **Simple Advanced**: Names randomized, but visual themes/colors remain (easier pattern matching)
  - **Full Advanced**: Names AND visual themes randomized (pure deduction from interactions only)

**Key question**: Can this be made fun for most people, or is it inherently niche? The "simple advanced" version (names only) might be accessible. The "full advanced" version (everything randomized) may only appeal to very logical/strategic thinkers.

**Accessibility approaches**:
- Frame it as a "New Universe" mode — you've traveled to a different universe where the elements are the same but everything looks and sounds different
- Allow partial randomization — maybe only tertiary types are randomized, while primaries keep their names
- Cooperative deduction — in multiplayer, players can share discoveries, making it a social deduction layer
- Gradual reveal — as players discover what a type "really is," the familiar name/theme fades in

---

## Medium Implications

The three tiers have significant implications for whether the game is physical, digital, or hybrid.

### What Each Tier Requires

| Requirement | Physical (Board/Cards) | Digital (Screen) | Hybrid |
|-------------|----------------------|-------------------|--------|
| Hidden information per player | Face-down cards, screens | Easy — separate views | Best of both |
| Individual discoveries | Possible but awkward | Native — show only to discoverer | Natural |
| Barren starting state | Empty board, sealed card packs? | Blank screen, procedural reveal | Interesting |
| No type chart in manual | Easy — just don't print one | Easy — don't display one | Easy |
| Tier 3 name randomization | **Impossible** with static printed cards | **Native** — procedural generation | Requires digital component |
| Tier 3 visual randomization | **Impossible** | Possible — regenerate art/colors | Requires digital component |
| Complex combo resolution | Slow, needs lookup or memorization | Instant, computed | Faster with digital assist |
| Meta-game strategic depth | Works — chess is physical | Works | Works |

### Leaning Hybrid: Board + Digital

The strongest model may be a physical board (for the tactile, social, table-presence experience) combined with a digital screen system:

**Shared screen** (center of table):
- Board state, storms, public effects
- Timer/turn tracking
- Resolved spell effects and announcements

**Individual screens** (per player, phone/tablet):
- Personal discoveries — what you've learned that others haven't
- Your hand, your energy, your options
- Spell casting interface
- In Tier 3: your randomized type names and your deduction notes

**Physical components**:
- The board itself (element sources, tower positions, spatial layout)
- Tokens/pieces for towers and energy
- Possibly face-down discovery cards that the digital system reveals when conditions are met

### Pure Digital Version

A standalone digital version could go further:
- Fully procedural board generation
- Animated spell effects that make discovery more dramatic
- Persistent player profiles that track which types/combos you've discovered across games
- Online multiplayer with matchmaking by discovery tier
- A "Campaign" mode that walks you through discovery as a structured single-player experience

### Pure Physical Version

A physical-only version would sacrifice Tier 3 entirely but could still deliver Tiers 1 and 2:
- Sealed discovery packs (like legacy game mechanics) — once opened, you learn what a combo does
- Face-down interaction cards revealed when you try a combination
- A "discovery journal" that players fill in across games
- The trade-off: once you've opened everything, re-discovery isn't possible without buying new packs

---

## Discovery and the Turn Structure

The turn structure should support discovery naturally:

1. **Gain energy** — you receive elements (potentially unknown types on first play)
2. **Explore/Cast** — you combine elements, discovering what they produce
3. **Observe** — the result is revealed. You learn something new about the universe.
4. **Build** — you invest in what you've learned, building toward an engine

The first few turns of a first-time game should be almost entirely steps 1-3. As knowledge accumulates, step 4 becomes dominant. This mirrors the real scientific process: observe, hypothesize, test, build.

---

## Type Progression — Natural but Not Strict

The type system has a natural 3-phase progression that mirrors how science itself unfolded:

1. **4 Primaries** — Fire, Earth, Water, Air. The raw elements. Simple, intuitive, immediately graspable.
2. **8 Primary + Secondary** — Metal, Plant, Ice, Electric emerge from combining primaries. "What happens when I combine Fire and Earth?" → Metal.
3. **16 Total** — Tertiary types (Radioactive, Cosmic, Poison, Sound, Crystal, Ghost, Heat, Magnetic) emerge as the dark/energy counterparts. The full system.

This creates a natural discovery arc: you start with 4 things and end up with 16. But this progression is **not locked into rigid phases**:

- Players don't all operate on the same phase. One player might discover Metal on turn 3 while another is still working with primaries.
- Types don't need to be revealed in complete tiers. A player might discover Poison (tertiary) before they've found all four secondaries.
- The game doesn't gate access — if the elements and conditions are right, any discovery is possible at any time. The phases describe a likely *tendency*, not a rule.
- Some types may be harder to reach than others. Tertiary types requiring more investment or specific conditions creates natural depth without artificial gating.

This mirrors real scientific history: electricity was understood before nuclear physics, but not because there was a rule — the prerequisites were just harder to assemble.

---

## Inspirations

Three games specifically model what we want the discovery experience to feel like:

### Breath of the Wild — Reactive World Discovery
The world is built on physics-based interactions — fire spreads to grass, metal attracts lightning, wind carries objects. The game never tells you this. You discover it by experimenting. The element system is simpler than ours, but the *reactivity* is the model. The open map with biomes also mirrors our "barren board that fills with discoveries" concept — you start knowing nothing about the world and fill in your understanding through exploration.

**What to capture**: The feeling that the world *responds* to your experiments. Every combination attempt should produce an observable, meaningful result — even if it's "nothing happened," that's data.

### Elden Ring / Dark Souls — Progressive Scale and Earned Mastery
The game deliberately withholds information. There is no quest log, no objective marker, no hand-holding. You discover by doing, failing, and overcoming. The map expands as you explore — and the scale reveals itself in moments of wonder. You find a building, step on an elevator, and descend into an *entire underground world* you didn't know existed. That feeling of "the game is so much bigger than I thought" is what our Tier 1 → Tier 2 transition should feel like.

The community culture is also a model: wikis exist, guides exist, but the game itself never points you to them. Players who discover things the hard way feel genuine accomplishment. The culture around FromSoftware games naturally produces the "don't spoil it" instinct we want.

New Game Plus (NG+) adds enemy resistances and requires deeper understanding — paralleling our Tier 2 meta-game and Tier 3 re-discovery.

**What to capture**: Progressive revelation of scale. Earned mastery through difficulty. A community that protects the discovery experience. The satisfaction of overcoming something you didn't think you could.

### Infinite Craft / Little Alchemy — The Pure Discovery Loop
Start with just 4 base elements (Water, Fire, Wind, Earth). Drag and combine them. Discover new things. Combine those new things with each other or with the originals. The entire game IS the discovery loop — there is no other mechanic.

Their combination graph goes from simple elements to complex concepts (elements → materials → objects → abstract ideas). This directly parallels our primary → secondary → tertiary progression. The excitement of finding a new combination — especially an unexpected one — is the core emotion we want to capture in our game.

**What to capture**: The simplicity of the core loop (combine things, see what happens). The exponential expansion of possibilities as you discover more. The "one more try" compulsion of wondering what two things make together.

**References**: [Infinite Craft](https://neal.fun/infinite-craft/), [Infinite Craft Recipes](https://infinitecraftrecipe.com/)

See also: [Influences](../reference/influences.md) for full game research index. Detailed research for each: [BotW](../reference/games/botw/relevance.md), [FromSoft](../reference/games/fromsoft/relevance.md), [Infinite Craft](../reference/games/infinite-craft/relevance.md).

### Cross-Game Synthesis — Actionable Mechanics

| Mechanic | Source | Application to Our Game |
|----------|--------|------------------------|
| Rules derive from properties, not scripts | BotW | Type interactions should emerge from element properties (conductivity, flammability), not a lookup table |
| Environmental teaching | BotW | Introduce interactions in low-stakes early turns before players need to exploit them |
| Blank map with visible outline | Elden Ring | Show the *shape* of the type system (there are elements, they interact in pairs) without revealing what each does |
| Buildup/proc status system | Elden Ring | Status effects that build over multiple hits before firing — dramatic threshold moments |
| Deliberate opacity | Elden Ring | Don't list type advantages anywhere. Let players discover through play |
| First Discovery banner | Infinite Craft | A mechanic for celebrating when a player discovers a new interaction for the first time |
| No failed combinations | Infinite Craft | Every element combination produces *something*, even if minor — preserves experimentation incentive |
| Semantic coherence | Little Alchemy | Interactions should feel intuitively right once revealed, even if not predicted |
| Asymmetric knowledge | All | Players at the same table have discovered different things — this asymmetry IS a strategic layer |
| Explore vs. Exploit tension | Unique to us | Unlike pure discovery games, our players must balance "discover new combos" against "exploit known ones" — this is the core strategic decision |

---

## Open Questions

- [ ] How does discovery persist between games? Journal? Memory? Digital profile?
- [ ] Should some discoveries be shared publicly (visible to all when found) and others private?
- [ ] How do you prevent an experienced player from spoiling discovery for new players at the same table?
- [ ] Is there a "teaching mode" where an experienced player can guide without spoiling?
- [ ] How many games does it take to discover everything in Tier 1? Is that number right?
- [ ] For Tier 3, what algorithm generates convincing but unrecognizable type names?
- [ ] For Tier 3, can interactions themselves be subtly remixed (not just names)?
- [ ] Should the game have different SKUs/versions (physical, digital, hybrid)?
- [ ] How does the "Fight Club" culture get seeded? Packaging? First-play messaging?
- [ ] Is there a competitive scene implication — do tournament players all play at Tier 2 or Tier 3?
