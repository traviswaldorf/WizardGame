# Infinite Craft — Type-System Recipe Comparison

<!-- Curated from web searches and https://github.com/kalinuska/infinite-craft-all-recipes -->
<!-- See all-recipes.tsv for the full 92K+ recipe database -->
<!-- See relevant-recipes.md for the filtered 8K recipes involving our element set -->

This document maps Infinite Craft recipes to our type system for design consideration.
"IC" = Infinite Craft naming. "Ours" = our type system equivalent.

---

## Starting Elements (IC base 4 → Our Primaries)

IC starts with **Fire, Water, Earth, Wind** (we use Air instead of Wind).

### All 10 base-pair combinations (Tier 1)

| Ingredient A | Ingredient B | IC Result | Our Parallel | Notes |
|---|---|---|---|---|
| Earth | Water | **Plant** | **Plant** (secondary) | Direct match — our Plant = Earth + Water |
| Earth | Fire | **Lava** | — | IC has no Metal from this; we make Metal = Fire + Earth |
| Fire | Water | **Steam** | — | Key intermediate in both systems |
| Water | Wind | **Wave** | — | We don't produce from Water + Air directly |
| Fire | Wind | **Smoke** | — | We make Electric = Fire + Air instead |
| Earth | Wind | **Dust** | — | No equivalent; we have no Earth + Air secondary |
| Earth | Earth | **Mountain** | — | Self-combination |
| Water | Water | **Lake** | — | Self-combination |
| Fire | Fire | **Volcano** | — | Self-combination |
| Wind | Wind | **Tornado** | — | Self-combination |

**Key insight**: IC only produces 1 of our 4 secondaries directly from base pairs.
Our composition system (Fire+Earth=Metal, Earth+Water=Plant, Water+Air=Ice, Fire+Air=Electric) is a deliberate design choice, not mirrored in IC.

---

## How IC Makes Our Secondary Types

### Metal
- **IC path**: Fire → Steam → Engine → ... → Iron → Steel → Steel+Steel = **Metal**
- **IC shortcut**: Fire + Pickaxe = Metal, or Earth + Fire Sword = Metal
- **Tier**: 6+ (deep chain)
- **Our system**: Fire + Earth = Metal (direct composition)
- **Takeaway**: IC treats Metal as a refined/manufactured substance. Ours treats it as a fundamental state. Both valid framings.

### Plant
- **IC path**: Earth + Water = **Plant** (Tier 1, direct)
- **IC combinations using Plant**:
  - Plant + Fire = Smoke
  - Plant + Wind = Dandelion
  - Plant + Earth = Tree
  - Plant + Water = Swamp
  - Plant + Fog = Mushroom
  - Plant + Plant = Tree
  - Plant + Stone = Fossil
  - Plant + Ocean = Coral
  - Plant + Steam = Tea
- **Our system**: Earth + Water = Plant (matches exactly)
- **Takeaway**: IC's Plant outputs are mostly biological/organic. Our Plant type should lean into growth, life, organic transformation.

### Ice
- **IC path**: Water + Fog = **Ice**, or Water + Avalanche = Ice (Tier 3)
- **IC chain**: Fire+Wind=Smoke → Water+Smoke=Fog → Water+Fog=Ice
- **Alternative**: Snow + Snow = Ice
- **IC combinations using Ice**:
  - Ghost + Water = Ice (interesting!)
  - Fire + Ice = Water (melting)
- **Our system**: Water + Air = Ice (direct composition)
- **Takeaway**: IC's Ice comes from cold/fog interactions, not directly from Water+Air. Our direct composition is cleaner but we could explore fog/mist as an intermediate flavor.

### Electric / Lightning / Electricity
- **IC Lightning path**: Fire+Water=Steam → Steam+Steam=Cloud → Fire+Cloud=**Lightning** (Tier 3)
- **IC Electricity**: Water + Lightning = **Electricity** (Tier 4)
- **IC combinations using Lightning**:
  - Lightning + Tree = Fire (lightning strike)
  - Lightning + Sand = Glass (fulgurite!)
  - Lightning + Water = Electricity
- **Our system**: Fire + Air = Electric (direct composition)
- **Takeaway**: IC's Lightning comes from Fire+Cloud (storm physics). Our Fire+Air is more abstract but captures the energy. The fulgurite reference (Lightning+Sand=Glass) is a great real-science interaction to consider.

---

## How IC Makes Our Tertiary Types

### Radioactive (our: Fire's tertiary)
- **IC path**: Plant + Radio = **Radioactive** (Tier 5-6)
- **Chain**: Water+Wind=Wave → Wave+Satellite=Radio → Plant+Radio=Radioactive
- **IC Nuclear**: Fire + Radioactive = Nuclear
- **Our system**: Radioactive is Fire's dark/energy counterpart (nuclear/solar energy)
- **Takeaway**: IC ties Radioactive to radio waves (wordplay). Our grounding in nuclear physics is more coherent. Fire→Radioactive through nuclear energy is stronger.

### Cosmic (our: Earth's tertiary)
- **IC path**: Cosmo + Cosmo = **Cosmic**, or Flying Lotus + Space Flower = Cosmic (very deep tier)
- **IC Black Hole**: Fire + Vacuum = Black Hole (Tier 4)
- **IC related**: Galaxy + Black Hole = Universe
- **Our system**: Cosmic is Earth's dark/energy counterpart (gravitational force)
- **Takeaway**: IC's cosmic elements emerge from space exploration chains. Our Earth→Cosmic through gravity is a more grounded physics link.

### Poison (our: Water's tertiary)
- **IC path**: Wine + Perfume = **Poison** (Tier 5-6)
- **Chain**: Earth+Water=Plant → Wind+Plant=Dandelion → Water+Dandelion=Wine → Earth+Dandelion=Flower → Wine+Flower=Perfume → Wine+Perfume=Poison
- **IC combinations using Poison**:
  - Poison + Plant = Piranha Plant
  - Poison + Fish = Koi
  - Ivy + Wine = Poison (alternative)
- **Our system**: Poison is Water's dark/energy counterpart (chemical reactions)
- **Takeaway**: IC derives Poison from fermentation/chemistry chains. Fits our Water→Poison (chemistry) framing well. The organic/botanical origin is interesting.

### Sound (our: Air's tertiary)
- **IC path**: Wave + Album = **Sound** (Tier 5+)
- **Chain**: Water+Wind=Wave → (camera chain) → Photograph+Photograph=Album → Wave+Album=Sound
- **Alternative**: Alps + Yodel = Sound, or Noise + Wave = Sound
- **IC using Sound**: Sound + Human = Musician
- **Our system**: Sound is Air's dark/energy counterpart (acoustic waves)
- **Takeaway**: IC ties Sound to recording/media. Our Air→Sound through acoustic physics is cleaner. The Wave→Sound connection is worth noting.

### Crystal (our: Metal's tertiary)
- **IC path**: Mountain + Glass = **Crystal** (Tier 3)
- **Chain**: Earth+Earth=Mountain, Fire+Sand=Glass → Mountain+Glass=Crystal
- **IC using Crystal**: Crystal + Smoke = Crystal Ball
- **Our system**: Crystal is Metal's dark/energy counterpart (lattice/resonance)
- **Takeaway**: IC's Mountain+Glass→Crystal has a nice geological resonance. Earth pressure + molten material = crystals. Maps well to our Metal→Crystal (lattice structures).

### Ghost (our: Plant's tertiary)
- **IC path**: Fog + Swamp = **Ghost** (Tier 3)
- **Alternative paths**: Human + Smoke = Ghost, Mirror + Smoke = Ghost, Fog + Island = Ghost, Fog + Tree = Ghost
- **IC using Ghost**:
  - Ghost + Water = Ice
  - Ghost + Fire = Fireball
  - Ghost + Earth = Zombie
  - Ghost + Human = Zombie
  - Ghost + Stone = Statue
  - Ghost + Planet = Pluto
  - Ghost + Clay = Golem
  - Ghost + Lotus = Buddha
- **Our system**: Ghost is Plant's dark/energy counterpart (life/decay)
- **Takeaway**: IC's Fog+Swamp→Ghost is excellent — swamp (decay) + mist (liminal) = ghost. Directly maps to our Plant→Ghost (life→death/decay) concept. The variety of Ghost outputs (Zombie, Golem, Statue) suggests Ghost as a transformer/modifier.

### Heat (our: Ice's tertiary)
- **IC path**: Warmth + Warmth = **Heat** (Tier 7)
- **Chain**: Fire→Mud→Brick→House→Fireplace→Warmth → Warmth+Warmth=Heat
- **IC using Heat**: Opens to Hydroelectric, Infection, and other energy-themed items
- **Our system**: Heat is Ice's dark/energy counterpart (thermodynamics)
- **Takeaway**: IC treats Heat as concentrated/amplified Warmth. Our Ice↔Heat opposition (thermodynamic counterparts) is cleaner than IC's approach.

### Magnetic (our: Electric's tertiary)
- **IC path**: Black Hole + Iron = **Magnet** (Tier 5)
- **Chain**: Dust+Engine=Vacuum → Fire+Vacuum=Black Hole → Steam+Clean=Iron → Black Hole+Iron=Magnet
- **IC Magnetic Field**: Magnet + Magnet = Magnetic Field
- **IC Magnetic**: Sponge + Magnet = Magnetic
- **Our system**: Magnetic is Electric's dark/energy counterpart (EM fields)
- **Takeaway**: IC derives Magnet from Black Hole + Iron (extreme gravity + metal). Our Electric→Magnetic through EM fields is more physically accurate. The Iron connection is relevant.

---

## How IC Makes Our Augmenter Types

### Time
- **IC path**: Fire + Hourglass = **Time** (Tier 4)
- **Chain**: Water+Wind=Wave → Earth+Wave=Sand → Fire+Sand=Glass → Sand+Glass=Hourglass → Fire+Hourglass=Time
- **IC using Time**: Time + Wave = Tsunami, Time + Earth = Fossil, Time + Lava = Rock, Time + Rain = Rainbow, Plant + Time = Tree
- **Takeaway**: Time as modifier/accelerator in IC — adds aging, transformation. Our Time augmenter concept aligns: Time modifies other types rather than being a type itself.

### Space
- **IC path**: Lake + Rocket = **Space** (Tier 4)
- **Chain**: Water+Water=Lake → Fire+Steam=Engine → Engine+Engine=Rocket → Lake+Rocket=Space
- **IC using Space**: Opens cosmic exploration chains
- **Takeaway**: IC's Space is a location/environment. Our Space augmenter is more abstract (spatial manipulation). Different framing but both serve as expansion mechanics.

### Light
- **IC path**: Lighthouse + Beacon = **Light** (Tier 5-6)
- **Chain**: Lake+Stone=Lighthouse → Fire+Lighthouse=Beacon → Lighthouse+Beacon=Light
- **Alternative**: Candle + Fire = Light, Electricity + House = Light
- **Takeaway**: IC derives Light from navigation/signal sources. Our Light augmenter represents the "standard expression" of types vs Dark's "tertiary expression." Different conceptual space.

### Dark / Darkness
- **IC Dark path**: House + Blind = **Dark** (Tier 5)
- **IC Darkness path**: Black + Fire = **Darkness** (Tier 4), or Eclipse + Black Hole = Darkness
- **Chain to Darkness**: Earth+Dust=Planet → Earth+Planet=Moon → Fire+Moon=Eclipse → Eclipse+Eclipse=Black Hole → Eclipse+Black Hole=Darkness
- **IC using Darkness**: Produces Cobra, Kermit, Mosaic (thematic darkness associations)
- **Takeaway**: IC has multiple dark-themed progressions (eclipse, black hole, blindness). Our Dark augmenter as the "tertiary expression" toggle is more systematic.

---

## Notable IC Interaction Patterns for Design Consideration

### Elemental Counters / Transformations
| Recipe | Physics Concept | Design Relevance |
|---|---|---|
| Fire + Ice = Water | Melting | Type counter: Fire melts Ice |
| Lightning + Sand = Glass | Fulgurite formation | Electric interacts with Earth-derivatives |
| Lightning + Tree = Fire | Lightning strike | Electric ignites Plant |
| Ghost + Water = Ice | Supernatural cold | Ghost (decay) freezes Water |
| Time + Earth = Fossil | Geological aging | Time augments Earth |
| Time + Lava = Rock | Cooling over time | Time transforms Fire-derivatives |
| Plant + Time = Tree | Growth | Time augments Plant |
| Fire + Radioactive = Nuclear | Nuclear reaction | Fire intensifies Radioactive |
| Poison + Plant = Piranha Plant | Toxic mutation | Poison modifies Plant |

### Composition Patterns
| IC Composition | Our Parallel |
|---|---|
| Earth + Water = Plant | Earth + Water = Plant (exact match) |
| Fire + Cloud = Lightning | Fire + Air(cloud) ≈ Electric |
| Mountain + Glass = Crystal | Earth-pressure + Fire-glass ≈ Metal→Crystal |
| Fog + Swamp = Ghost | Mist + Decay ≈ Plant→Ghost |
| Black Hole + Iron = Magnet | Cosmic-force + Metal ≈ Electric→Magnetic |

---

## Database Files

- **`all-recipes.tsv`** — Full database of 92,531 recipes across 28 tiers, with type-system tags
- **`relevant-recipes.md`** — Filtered to 8,070 recipes involving elements in our type system
- **`raw-source.md`** — Original source data from the GitHub repository
