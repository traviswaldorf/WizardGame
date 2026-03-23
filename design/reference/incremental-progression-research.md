# Incremental Progression Research: Historical Science as Game Tree

> **Status**: Exploration
> **Purpose**: Comprehensive mapping of real scientific history onto the incremental game's type progression trees. Synthesized from per-type research into Earth, Water, Air, Fire, and cross-type interactions.
> **Related Docs**: [Decision 005: Incremental Progression Trees](../decisions/005-incremental-progression-trees.md), [Type System Overview](../framework/type-system-overview.md)

---

## Meta-Progression: The Civilizational Arc

The game starts with **Earth** and progressively unlocks the other primary types. This mirrors how early humans actually related to the elements — solids first (you can touch, shape, stand on them), then liquids (visible, essential, but controlling water requires Earth knowledge), then gases (invisible, requires settlement and observation time), then energy (fire exists in nature, but *controlling* it is the transformative leap).

```
EARTH (starting type)
  |
  |-- basic survival: stone tools, shelter, clay
  |-- discover WATER (Earth vessels/channels enable water control)
  |     |
  |     |-- irrigation, wells, sailing
  |     |-- discover AIR (sailing/weather observation)
  |           |
  |           |-- wind awareness, atmosphere
  |           |-- discover FIRE (Air feeds combustion)
  |                 |
  |                 |-- THE GREAT ACCELERATOR
  |                 |-- Fire + Earth = METAL (smelting)
  |                 |-- Fire + Water = Steam (engines)
  |                 |-- Fire + Air = ELECTRIC (generators)
  |                 |-- Fire + Earth = Glass → INSTRUMENT CASCADE
  |
  +--> Secondary types emerge from cross-investments
  +--> Tertiary types emerge from deep secondary + instruments
```

### Why This Order Works

| Phase | Type | Why It's Next | What Unlocks It |
|-------|------|---------------|-----------------|
| 1 | **Earth** | You can touch it. Stone tools require zero prerequisites. | Free start |
| 2 | **Water** | Visible, essential for survival, but *controlling* water requires Earth (vessels, channels, dams) | Earth depth ~5 (pottery, channels) |
| 3 | **Air** | Invisible. Understanding atmosphere requires observation time that settlement (Water/agriculture) provides. Sailors study wind. | Water depth ~5 (sailing, evaporation) |
| 4 | **Fire** | Fire exists in nature, but understanding it requires Air (oxygen). Fire is the great *transformer* that acts on all other types. | Air depth ~3 (bellows, draft, oxygen awareness) |

### The Key Design Insight

Each domain's *control* (not just awareness) requires the previous domain. You can see fire from day one, but you can't smelt metal until you understand Earth (ore, crucibles), Air (bellows, draft), and Fire itself. The progression is about **control depth**, not discovery order.

---

## Phase 1: Earth (Starting Type)

### Narrative Arc
Survival → Settlement → Construction → Geology → Deep Earth → Gravity → Cosmos

### Progression Nodes (30 candidates, select ~20)

**Tier 1: Survival (Depth 1-5) — manual clicking era**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 1 | **Stone Knapping** | Free | Starting | +1 Earth per click. "You shape the first stone." | — |
| 2 | **Grinding & Polishing** | 10 Earth | Generator | +0.1 Earth/sec. Ground stone tools. | — |
| 3 | **Shelter** | 25 Earth | Generator | +0.3 Earth/sec. Protection, first "tower." | — |
| 4 | **Clay Working** | 50 Earth | Discovery | Unlocks ceramic branch. Unfired clay vessels. | Pre-Water (storage) |
| 5 | **Fired Pottery** | 100 Earth | Gate | Requires Fire depth 1. First kiln. **Unlocks Water storage.** | Fire, Water |

**Tier 2: Settlement (Depth 6-10) — first passive generation**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 6 | **Agriculture** | 200 Earth | Gate | Requires Water depth 3. Earth+Water → **Plant gate visible.** | Water, Plant |
| 7 | **Quarrying** | 300 Earth | Generator | +2 Earth/sec. Extracting stone blocks. | — |
| 8 | **Masonry** | 500 Earth | Multiplier | Earth gen x1.5. Fitted stone construction. | — |
| 9 | **Mining** | 800 Earth | Discovery | Underground extraction. Reveals mineral nodes. | Metal (foreshadow) |
| 10 | **Mudbrick Construction** | 400 Earth | Generator | +3 Earth/sec. Permanent structures. | Water (mixing) |

**Tier 3: Classical Knowledge (Depth 11-15)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 11 | **Fortification** | 2K Earth | Generator | +5 Earth/sec. Walls, towers, keeps. | — |
| 12 | **Concrete** | 3K Earth | Discovery | Requires Water depth 5. Roman-era hydraulic cement. | Water |
| 13 | **Mineral Classification** | 1.5K Earth | Discovery | Reveals deeper tree nodes (Theophrastus, Pliny). | — |
| 14 | **Aristotle's Natural Place** | 2K Earth | Discovery (superseded) | Earth gen x2. Proto-gravity. "Heavy things fall." Later replaced by Galileo. | Cosmic (seed) |
| 15 | **Stratigraphy** | 5K Earth | Discovery | Earth has readable history in layers (Steno). Unlocks fossil/geology branch. | Time |

**Tier 4: Scientific Revolution (Depth 16-22)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 16 | **Falling Bodies** | 10K Earth | Discovery | Supersedes Aristotle. All objects fall equally (Galileo). Earth gen x3. | Cosmic |
| 17 | **Deep Time** | 15K Earth | Discovery | "No vestige of a beginning" (Hutton). Geological time unlocked. | Time |
| 18 | **Universal Gravitation** | 25K Earth | LANDMARK | Newton. F=Gm1m2/r^2. **Cosmic branch visible.** Head Wizard discovery. | Cosmic |
| 19 | **Weighing the Earth** | 20K Earth | Instrument | Cavendish torsion balance. Measures G. | Cosmic |
| 20 | **Geological Mapping** | 12K Earth | Instrument | William Smith. Reveals hidden nodes globally. | — |

**Tier 5: Modern Geology (Depth 23-28)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 21 | **Seismograph** | 50K Earth | Instrument | Milne. Detects earthquakes. Reveals deep Earth nodes. | Sound |
| 22 | **Earth's Core** | 80K Earth | Discovery | Oldham/Lehmann. Earth has layers. | — |
| 23 | **Continental Drift** | 100K Earth | Discovery (superseded) | Wegener. Continents move. Later replaced by Plate Tectonics. | — |
| 24 | **Plate Tectonics** | 200K Earth | LANDMARK | Supersedes Continental Drift. Earth is alive and moving. Earth gen x10. | Radioactive (heat drives it) |
| 25 | **Radioactive Dating** | 150K Earth | Gate | Requires Radioactive depth 2. Absolute geological time. | Radioactive |

**Tier 6: Materials & Cosmic Bridge (Depth 29-35)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 26 | **Semiconductor** | 500K Earth | Discovery | Silicon. Earth enables computing. | Electric, Crystal |
| 27 | **Graphene** | 1M Earth | Discovery | Ultimate 2D material. Earth mastery at nanoscale. | — |
| 28 | **General Relativity** | 2M Earth | LANDMARK | Einstein. Mass curves spacetime. **Cosmic tree opens.** | Cosmic |
| 29 | **Gravitational Waves** | 5M Earth | Discovery | LIGO. Ripples in spacetime from mass. Cosmic endgame. | Cosmic |
| 30 | **Planetary Formation** | 10M Earth | Discovery | Stardust becomes solid ground. Cosmic → Earth loop closes. | Cosmic |

### Earth's Tertiary Thread: Gravity → Cosmic

```
Aristotle (proto-gravity, superseded)
  → Galileo (all things fall equally)
    → Newton (universal gravitation) ← HEAD WIZARD
      → Cavendish (measures G)
        → Einstein (mass curves spacetime) ← COSMIC GATE
          → Hubble (expanding universe) ← COSMIC HEAD WIZARD
            → Dark Matter (invisible mass)
              → LIGO (gravitational waves)
                → Black Hole Imaging (singularity)
```

---

## Phase 2: Water (Unlocked from Earth)

### Unlock Condition
Earth depth 5 (Fired Pottery — clay vessels enable water storage/control)

### Narrative Arc
Sources → Storage → Irrigation → Navigation → Chemistry → Biochemistry

### Progression Nodes (30 candidates, select ~20)

**Tier 1: Survival (Depth 1-5)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 1 | **Finding Water** | Free | Starting | +1 Water per click. Springs, rivers. | Earth (terrain) |
| 2 | **Water Storage** | 10 Water | Generator | +0.1 Water/sec. Clay vessels (requires Earth pottery). | Earth |
| 3 | **Well-Digging** | 30 Water | Generator | +0.3 Water/sec. Groundwater access. | Earth |
| 4 | **Fermentation** | 50 Water | Discovery | Accidental chemistry. **Poison branch seed.** | Plant, Poison |
| 5 | **Basic Irrigation** | 100 Water | Gate | Channels redirect water. Requires Earth depth 3. | Earth, Plant |

**Tier 2: Ancient Engineering (Depth 6-10)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 6 | **Canal Systems** | 200 Water | Generator | +2 Water/sec. Mesopotamian irrigation. | Earth |
| 7 | **Sailing** | 300 Water | Gate | Reed boats + sails. **Air becomes visible.** | Air |
| 8 | **Water Clock** | 250 Water | Instrument | Clepsydra. Time measurement. | Time |
| 9 | **Nilometer** | 400 Water | Instrument | Flood measurement. First hydrological data. | Earth |
| 10 | **Aqueduct** | 800 Water | Generator | +5 Water/sec. Gravity-fed transport. | Earth |

**Tier 3: Classical Mechanics (Depth 11-15)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 11 | **Buoyancy** | 1.5K Water | Discovery | Archimedes. "Eureka!" Water gen x1.5. | — |
| 12 | **Archimedes' Screw** | 2K Water | Instrument | Lifts water. +3 Water/sec. | Metal |
| 13 | **Distillation** | 3K Water | Discovery | Alembic. Chemical separation. **Poison branch deepens.** | Fire, Poison |
| 14 | **Acid Discovery** | 5K Water | Discovery | Jabir ibn Hayyan. HCl, HNO3. Poison gate. | Poison, Metal |
| 15 | **Water Mill** | 2.5K Water | Generator | +8 Water/sec. Mechanical power from water. | Earth, Metal |

**Tier 4: Scientific Understanding (Depth 16-22)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 16 | **Hydrostatics** | 10K Water | Discovery | Pascal's Law. Pressure transmits equally. | — |
| 17 | **Hydrodynamics** | 15K Water | Discovery | Bernoulli's principle. Fast fluid = low pressure. | Air |
| 18 | **Water Cycle** | 12K Water | Discovery | Halley. Evaporation, rain, rivers. | Air, Fire |
| 19 | **Composition of Water** | 20K Water | LANDMARK | Lavoisier: H2O. Water is hydrogen + oxygen. | Fire, Air |
| 20 | **Lavoisier's Chemistry** | 25K Water | LANDMARK | Modern chemistry founded. Systematic naming. **Poison gate fully opens.** | Fire, Air, Poison |

**Tier 5: Modern Science (Depth 23-28)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 21 | **Navier-Stokes** | 50K Water | Discovery | Equations of viscous flow. Water gen x5. | Air |
| 22 | **Electrolysis** | 40K Water | Gate | Davy/Faraday. Electric current decomposes water. | Electric |
| 23 | **Periodic Table** | 80K Water | LANDMARK | Mendeleev. Framework for all chemistry. | All types |
| 24 | **Water Purification** | 60K Water | Discovery | Chlorination, filtration. | Poison |
| 25 | **Oceanography** | 100K Water | Discovery | HMS Challenger. Map the oceans. | Earth |

**Tier 6: Contemporary (Depth 29-35)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 26 | **Deep Sea Exploration** | 200K Water | Instrument | Trieste. Mariana Trench. | Metal, Earth |
| 27 | **Hydrothermal Vents** | 300K Water | Discovery | Life without sunlight. | Fire, Plant, Poison |
| 28 | **Desalination** | 500K Water | Instrument | Reverse osmosis. Water generation at scale. | Metal |
| 29 | **DNA in Solution** | 1M Water | LANDMARK | All biochemistry occurs in water. | Plant, Poison |
| 30 | **Microfluidics** | 2M Water | Instrument | Lab-on-a-chip. Water mastery at microscale. | Electric |

### Water's Tertiary Thread: Chemistry → Poison

```
Fermentation (accidental chemistry)
  → Herbal Infusions (dissolving active compounds)
    → Distillation (separating substances)
      → Acid Discovery (Jabir: HCl, aqua regia)
        → "The dose makes the poison" (Paracelsus) ← POISON HEAD WIZARD
          → Lavoisier's Chemistry (systematic framework)
            → Periodic Table (Mendeleev)
              → Organic Chemistry (Wohler's urea synthesis)
                → Biochemistry / DNA → Pharmacology (Poison endgame)
```

---

## Phase 3: Air (Unlocked from Water)

### Unlock Condition
Water depth 7 (Sailing — you study what moves your ship)

### Narrative Arc
Breath → Wind → Atmosphere → Gas Laws → Aerodynamics → Flight → Climate

### Progression Nodes (30 candidates, select ~20)

**Tier 1: Awareness (Depth 1-5)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 1 | **Breath** | Free | Starting | +1 Air per click. "You breathe." | — |
| 2 | **Wind Awareness** | 10 Air | Generator | +0.1 Air/sec. "The invisible moves." | — |
| 3 | **Shelter from Wind** | 25 Air | Generator | +0.2 Air/sec. Understanding prevailing winds. | Earth |
| 4 | **Wind Instruments** | 40 Air | Discovery | Bone flutes. Controlled air vibration. **Sound branch seed.** | Sound |
| 5 | **Winnowing** | 60 Air | Discovery | Air as separator. Cross-type with Plant. | Plant |

**Tier 2: Harnessing (Depth 6-10)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 6 | **Sails** | 200 Air | Instrument | +2 Air/sec. First wind-powered technology. | Water |
| 7 | **Bellows** | 300 Air | Gate | Forced air. **Enables higher Fire temperatures.** | Fire, Metal |
| 8 | **Kites** | 150 Air | Instrument | Heavier-than-air sustained by wind. Lift discovered. | — |
| 9 | **Windmill** | 500 Air | Generator | +5 Air/sec. Wind does work without humans. Automation step. | Earth, Water |
| 10 | **Weather Observation** | 400 Air | Discovery | Aristotle's Meteorologica. Systematic weather. | Water, Fire |

**Tier 3: Air as Substance (Depth 11-17)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 11 | **Air Has Weight** | 2K Air | Discovery | Galileo proves air has mass. "The invisible weighs." | Earth |
| 12 | **Barometer** | 5K Air | LANDMARK | Torricelli. "We live at the bottom of an ocean of air." **Head Wizard.** Massive multiplier. | Metal, Water |
| 13 | **Air Pump** | 3K Air | Instrument | Von Guericke. Magdeburg hemispheres. "You subtract air." | Metal |
| 14 | **Boyle's Law** | 8K Air | LANDMARK | PV = constant. First gas law. **Pupil A.** | Sound (needs medium) |
| 15 | **Bell Jar Experiment** | 6K Air | GATE | Sound fades in vacuum. **Sound tertiary gate.** | Sound |

**Tier 4: Gas Chemistry (Depth 18-24)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 16 | **Multiple Gases** | 15K Air | Discovery | Van Helmont coins "gas." Air is many things. | Poison |
| 17 | **Carbon Dioxide** | 12K Air | Discovery | Black's "fixed air." | Plant, Fire |
| 18 | **Hydrogen** | 18K Air | Discovery | Cavendish. Lightest gas. Burns to make water. | Fire, Water |
| 19 | **Oxygen** | 25K Air | LANDMARK | Priestley/Scheele. The gas that enables combustion. **Unlocks Fire synergy.** | Fire |
| 20 | **Ideal Gas Law** | 40K Air | LANDMARK | PV=nRT. Master equation. Requires Boyle + Charles + Avogadro. | All |

**Tier 5: Flight & Beyond (Depth 25-32)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 21 | **Bernoulli's Principle** | 50K Air | Discovery | Fast air pushes less. Prerequisite for flight. | Water |
| 22 | **Hot Air Balloon** | 60K Air | Instrument | Montgolfier. "You leave the earth." | Fire |
| 23 | **Aerodynamics** | 80K Air | Discovery | Cayley: lift, drag, weight, thrust. | — |
| 24 | **Wind Tunnel** | 100K Air | Instrument | "You bottle the wind for study." | Metal |
| 25 | **Powered Flight** | 200K Air | LANDMARK | Wright Brothers. "Humanity flies." Massive multiplier. | Fire, Metal |

**Tier 6: Atmosphere & Climate (Depth 33-40)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 26 | **Atmospheric Layers** | 300K Air | Discovery | Troposphere through exosphere. "The sky has floors." | Heat, Cosmic |
| 27 | **Jet Engine** | 500K Air | Instrument | Whittle/von Ohain. Compress, burn, expel. | Fire, Metal, Sound |
| 28 | **Breaking Sound Barrier** | 800K Air | Discovery | Yeager. Mach 1. "You outrun your own thunder." | Sound |
| 29 | **Rocketry** | 1M Air | LANDMARK | Goddard to Apollo. "You leave the air behind." | Fire, Cosmic |
| 30 | **Climate Science** | 2M Air | Discovery | Atmosphere as complete system. Connects Air to all types. | All |

### Air's Tertiary Thread: Pressure → Sound

```
Wind Instruments (air can sing, ~43,000 BCE)
  → Pythagoras' Harmonics (sound obeys number)
    → Organ Pipes (shaped air becomes music)
      → Bell Jar (silence = absence of air) ← SOUND GATE
        → Speed of Sound (Mersenne: sound has speed)
          → Chladni Figures (sound made visible) ← PUPIL A
            → Doppler Effect (pitch shifts with motion) ← PUPIL B
              → Bell Telephone (sound through wire) ← HEAD WIZARD
                → Sonar (sound sees underwater)
                  → Ultrasound (sound beyond hearing becomes sight)
                    → Noise Cancellation (anti-sound creates silence)
                      → Acoustic Levitation / Metamaterials (endgame)
```

---

## Phase 4: Fire (First Major Civilization Unlock)

### Unlock Condition
Air depth 3 (Bellows — forced air feeds fire, enables higher temperatures)

### Narrative Arc
Spark → Combustion → Energy → Radiation → Nuclear → Stellar

### Progression Nodes (35 candidates, select ~22)

**Tier 1: Primal Fire (Depth 1-6) — "rubbing sticks together"**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 1 | **Spark** | Free | Starting | +1 Fire per click. Captured ember. | — |
| 2 | **Campfire** | 15 Fire | Generator | +0.2 Fire/sec. Hearth. | Earth |
| 3 | **Cooking** | 40 Fire | Multiplier | Fire gen x1.5. Transforms food. First transformation. | Plant |
| 4 | **Fire-Starting** | 80 Fire | Discovery | Create fire on demand. Automation: auto-generate. | Earth |
| 5 | **Oil Lamp** | 120 Fire | Generator | +1 Fire/sec. Portable fire. Reveals info. | Earth, Water |
| 6 | **Charcoal** | 200 Fire | Multiplier | Fire gen x2. Processed fuel burns hotter/cleaner. | Earth |

**Tier 2: Fire as Transformer (Depth 7-12)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 7 | **Kiln** | 400 Fire | Instrument | +3 Fire/sec. Controlled high-temp enclosure. | Earth |
| 8 | **Copper Smelting** | 600 Fire | GATE | Requires Earth depth 5. **Metal gate visible.** | Earth, Metal |
| 9 | **Glassmaking** | 800 Fire | LANDMARK | Fire + Earth = transparency. **THE CASCADE INSTRUMENT.** | Earth, ALL |
| 10 | **Bronze Age** | 1.5K Fire | Gate | Requires Earth depth 5 + Fire depth 8. **Metal tree opens.** | Metal |
| 11 | **Iron Smelting** | 3K Fire | Discovery | Higher temps. Metal tree upgrade. | Metal, Air |
| 12 | **Gunpowder** | 5K Fire | Discovery | Explosive branch. Requires Earth minerals. | Earth, Air |

**Tier 3: Fire Understood (Depth 13-20)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 13 | **Phlogiston Theory** | 8K Fire | Discovery (superseded) | Fire gen x2. "Fire is a substance released." Later replaced. | — |
| 14 | **Thermometer** | 10K Fire | Instrument | Reveals temperature mechanics. Ice/Heat gate. | Metal, Ice, Heat |
| 15 | **Steam Engine** | 15K Fire | LANDMARK | Fire + Water → mechanical work. Industrial Revolution. | Water, Metal |
| 16 | **Combustion** | 25K Fire | LANDMARK | Lavoisier. Supersedes Phlogiston. Fire gen x4. **Head Wizard.** | Air (oxygen) |
| 17 | **Calorimeter** | 12K Fire | Instrument | Measures heat. Optimization bonus. | — |
| 18 | **Latent Heat** | 20K Fire | Discovery | Phase transitions. Fire + Ice/Water connection. | Ice, Water |

**Tier 4: Fire Harnessed (Depth 21-28)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 19 | **Carnot Cycle** | 50K Fire | LANDMARK | Thermodynamics. Efficiency ceiling. Heat Head Wizard. | Heat |
| 20 | **Spectroscopy** | 40K Fire | Instrument | Fire reveals composition. Fire + Light. | Light |
| 21 | **Bessemer Process** | 60K Fire | Discovery | Mass steel. Metal tree upgrade. | Metal, Air |
| 22 | **Internal Combustion** | 80K Fire | Instrument | Portable fire-to-work. Fire gen x5. | Air |
| 23 | **Electric Generator** | 100K Fire | GATE | Faraday. **Electric tree opens.** | Air, Electric |
| 24 | **Conservation of Energy** | 70K Fire | LANDMARK | Joule. Heat/work/energy interchangeable. | All |

**Tier 5: Invisible Fire (Depth 29-38)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 25 | **X-Rays** | 200K Fire | Discovery | Invisible radiation. | Electric, Crystal |
| 26 | **Radioactivity** | 300K Fire | GATE | Becquerel. Matter contains hidden fire. **Radioactive visible.** | Radioactive |
| 27 | **E=mc^2** | 500K Fire | PARADIGM SHIFT | Mass IS energy. Everything is fire. | All |
| 28 | **Planck's Quanta** | 400K Fire | Discovery | Energy comes in packets. Fire is granular. | Electric |
| 29 | **Nuclear Fission** | 1M Fire | LANDMARK | Splitting atoms releases fire. Meitner. | Radioactive |
| 30 | **Nuclear Reactor** | 2M Fire | Instrument | Chicago Pile-1. Controlled atomic fire. | Radioactive |

**Tier 6: Stellar Fire (Depth 39-45)**

| # | Node | Cost | Type | Effect | Cross-type |
|---|------|------|------|--------|------------|
| 31 | **Tokamak** | 5M Fire | Instrument | Plasma confinement. Requires Magnetic depth 3. | Magnetic |
| 32 | **Solar Panel** | 3M Fire | Generator | Harvest stellar fire. Massive passive Fire. | Electric, Light |
| 33 | **Fusion Ignition** | 10M Fire | LANDMARK | NIF 2022. Net-positive fusion. | Radioactive |
| 34 | **Fusion Power** | 50M Fire | ENDGAME | "You bottle a star." | Radioactive |
| 35 | **Stellar Forge** | 100M Fire | Final | "You ARE the star." Everything is fire's product. | Cosmic |

### Fire's Deep Thread: Heat → Energy → Nuclear → Stellar

```
Campfire (heat)
  → Cooking (transformation)
    → Charcoal / Kiln (controlled heat)
      → Smelting (heat changes matter)
        → Phlogiston (wrong theory, superseded)
          → Combustion (Lavoisier: oxygen + fuel) ← HEAD WIZARD
            → Thermodynamics (Carnot: efficiency)
              → Energy Conservation (heat = work)
                → E=mc^2 (mass = energy)
                  → Radioactivity (Curie) ← RADIOACTIVE HEAD WIZARD
                    → Nuclear Fission (Meitner)
                      → Fusion (stellar fire on Earth)
                        → Stellar Forge (you are the star)
```

---

## The Glass Cascade: Most Important Meta-Instrument

**Glass** (Fire + Earth, unlocked ~depth 9-10 of Fire tree) is the single most impactful instrument in history. One discovery cascades into unlocking half the game:

```
GLASS (Earth + Fire)
  |
  +-- Lenses
  |     +-- Spectacles (Knowledge multiplier)
  |     +-- Telescope (1608) → COSMIC tree gate
  |     +-- Microscope (1620s) → GHOST tree gate, Plant deep
  |     +-- Magnifying glass
  |
  +-- Barometer (1643) → AIR deep gate
  +-- Thermometer (1714) → ICE/HEAT gate
  +-- Prism (1666) → Light spectrum, Crystal
  +-- Chemical Glassware → POISON tree (distillation, retorts)
  +-- Vacuum Tube (1904) → ELECTRIC deep, Radioactive
```

### Design Recommendation

Glass should be one of the first major "eureka bursts" — relatively cheap (Earth depth 5 + Fire depth 5) but cascading into 5+ gates. This creates a moment where the game suddenly opens up in every direction, which is the most addictive feeling in incrementals.

---

## Secondary Type Unlock Conditions

| Secondary | Gate Condition | Historical Moment | Bootstrap Instrument |
|-----------|---------------|-------------------|---------------------|
| **Metal** | Fire depth 8 + Earth depth 5 | Copper smelting (~5000 BCE) | Crucible (trickle of Metal energy) |
| **Plant** | Earth depth 6 + Water depth 5 | Agriculture (~10,000 BCE) | Farm (trickle of Plant energy) |
| **Ice** | Air depth 12 + Water depth 10 | Temperature measurement (1714) | Thermometer reveals Ice/Heat spectrum |
| **Electric** | Fire depth 23 + Air depth 14 | Faraday's induction (1831) | Generator (trickle of Electric energy) |

### Why This Order

1. **Plant** opens first (~early game) — agriculture is humanity's first secondary-type achievement
2. **Metal** opens second (~early-mid game) — smelting follows shortly after controlled fire
3. **Ice** opens third (~mid game) — understanding temperature requires instruments (thermometer = glass)
4. **Electric** opens last (~mid-late game) — electricity has the broadest prerequisite web historically

### Hidden Dependency: Metal Requires Air

Metal's composition is Fire + Earth, but historically smelting also required Air (bellows for higher temperatures). In-game: Metal gate requires Fire depth 8 + Earth depth 5, but the bellows instrument (Air depth 7) provides a significant Metal generation multiplier. You *can* smelt without bellows, but it's much slower.

---

## Tertiary Type Unlock Conditions

| Tertiary | Parent | Gate Condition | Historical Moment | Gate Instrument |
|----------|--------|---------------|-------------------|-----------------|
| **Poison** | Water | Water depth 14 + Fire depth 10 | Lavoisier's chemistry (1780s) | Chemical glassware (from Glass cascade) |
| **Sound** | Air | Air depth 15 (Bell Jar experiment) | Boyle proves sound needs air (1660) | Bell jar + air pump |
| **Cosmic** | Earth | Earth depth 18 + Water depth 10 | Newton's gravitation (1687) | Telescope (from Glass cascade) |
| **Heat** | Ice | Ice depth 8 + Fire depth 19 | Carnot cycle (1824) | Calorimeter |
| **Radioactive** | Fire | Fire depth 26 + Electric depth 5 | Becquerel/Curie (1896-98) | Geiger counter |
| **Crystal** | Metal | Metal depth 10 + Electric depth 8 | X-ray diffraction (1912) | X-ray diffractometer |
| **Ghost** | Plant | Plant depth 10 + Fire depth 9 | Microscope → germ theory | Microscope (from Glass cascade) |
| **Magnetic** | Electric | Electric depth 8 + Metal depth 5 | Faraday's induction (1831) | Compass → electromagnet |

---

## Superseded Discoveries (Paradigm Shifts)

A mechanic unique to this game: early discoveries provide bonuses but are later **replaced** by better understanding, mirroring real science.

| Superseded Discovery | Depth | Bonus | Replaced By | New Bonus | Type |
|---------------------|-------|-------|-------------|-----------|------|
| **Aristotle's Natural Place** | Earth 14 | Earth gen x2 | Galileo's Falling Bodies (Earth 16) | Earth gen x3 | Earth |
| **Phlogiston Theory** | Fire 13 | Fire gen x2 | Lavoisier's Combustion (Fire 16) | Fire gen x4 | Fire |
| **Four Classical Elements** | — | Minor all-type bonus | Lavoisier's Elements / Periodic Table | Major all-type bonus | Meta |
| **Continental Drift** | Earth 23 | Earth gen x3 | Plate Tectonics (Earth 24) | Earth gen x10 | Earth |
| **Ptolemaic Geocentrism** | Cosmic 2 | Cosmic gen x1.5 | Copernican Heliocentrism (Cosmic 5) | Cosmic gen x3 | Cosmic |
| **Caloric Theory** | Heat 3 | Heat gen x1.5 | Kinetic Theory (Heat 6) | Heat gen x3 | Heat |
| **Miasma Theory** | Ghost 3 | Ghost gen x1.5 | Germ Theory (Ghost 6) | Ghost gen x3 | Ghost |

### Design Note
When a discovery is superseded, the old node dims but doesn't disappear — you still took that step. The replacement provides a strictly better bonus. This creates a satisfying "I was wrong but now I'm more right" moment. Consider a small permanent bonus for having taken the superseded path (you learned from being wrong).

---

## Scientific Revolutions (Prestige Layers)

Reset progress for permanent multipliers, themed as civilizational paradigm shifts.

| Revolution | Trigger | Theme | Permanent Bonus |
|------------|---------|-------|-----------------|
| **Neolithic** | Earth depth 10 + Water depth 5 | Agriculture / Settlement | Base generation x2 for all types |
| **Classical** | Any 3 primaries at depth 10 | Greek natural philosophy | Insight generation begins |
| **Scientific Revolution** | Glass instrument built + 2 tertiary types visible | Empirical method | Instruments build 50% faster |
| **Industrial** | Steam Engine + Metal depth 8 | Mechanization | Automation mechanics unlock (passive generation x5) |
| **Modern** | 3+ secondary types at depth 5 | 20th century science | Tertiary trees accessible at reduced cost |
| **Quantum** | Any tertiary at depth 10 | Quantum mechanics / relativity | Endgame prestige — all multipliers compound |

### What Persists Across Revolutions
- Paradigm Points and their multipliers
- Discovery **knowledge** (you've "learned" Combustion — rebuild infrastructure faster)
- Instrument **blueprints** (not instances — rebuild at reduced cost)
- Insight and Knowledge meta-currencies

### What Resets
- All type energies to zero
- Tree node progress (but faster due to paradigm bonuses)
- Active generators and multipliers
- Instrument instances

---

## Game Feel by Phase

| Phase | Era | What You're Doing | Incremental Feel |
|-------|-----|-------------------|-----------------|
| 1. Survival | Prehistoric | Clicking for Earth. Shaping stones. | Cookie Clicker early: click click click |
| 2. Settlement | Neolithic | First passive generators. Water unlocks. Plant grows. | First idle income. Things happen while you wait. |
| 3. Transformation | Bronze/Iron Age | Fire unlocks. Metal gate. Instruments appear. | Multiplicative scaling begins. Numbers get interesting. |
| 4. Instrument Cascade | Scientific Revolution | Glass built. 5 gates open simultaneously. | **The burst.** Everything opens. Most addictive moment. |
| 5. Industrial | 1800s | Automation. Steam engines. Electric generators. | Auto-generation. The game plays itself (slowly). |
| 6. Modern | 1900s | Tertiary types. Deep specialization. | Exponential scaling. New mechanics in each tertiary. |
| 7. Endgame | Contemporary | Fusion, gravitational waves, quantum | Prestige decisions. Two fusion paths. Completion? |

---

## The Navigation Loop (Water ↔ Cosmic ↔ Magnetic)

A historically real feedback cycle that could be mechanically satisfying:

```
Water (navigation need)
  → Cosmic (star observation for navigation)
    → Magnetic (compass for navigation)
      → Water (better navigation)
        → Cosmic (better astronomy)
          → Electric (compass → electromagnetism)
```

In-game: investing in Water makes Cosmic cheaper, Cosmic provides Magnetic bonuses, Magnetic loops back to Water advantages.

---

## Fire as Catalyst Pattern

Fire investment provides multiplier bonuses to every other type's processing:

- Fire + Earth → ceramics, smelting, **glass** (cascade!)
- Fire + Water → steam, distillation, sterilization
- Fire + Air → bellows, engines, balloons
- Fire + Plant → cooking, slash-and-burn, activation energy

**Fire investment is never wasted** — it always pays off cross-type. This makes Fire the most universally valuable type to invest in, which matches its role as "the great accelerator" of civilization.

---

## Open Design Questions

### Core Mechanics
- [ ] How many total nodes across all types? 200? 300? 500?
- [ ] Should nodes have diminishing returns within a type (diminishing cost curve vs. exponential)?
- [ ] How deep is "deep enough" before prestige becomes attractive?
- [ ] Can you respec tree choices, or permanent until prestige?

### Meta-Progression
- [ ] Single-type start or can you pick your starting type?
- [ ] Does Fire being an "unlock" rather than a starter feel right? You see fire in nature from the beginning.
- [ ] Should there be a "tutorial" progression for brand-new players?
- [ ] How fast should the first prestige be achievable? 30 minutes? 2 hours?

### Cross-Type
- [ ] Should the Glass cascade be a single "burst" or gated across several depths?
- [ ] How to prevent Fire from being too dominant (since it catalyzes everything)?
- [ ] Should secondary type gates have soft requirements (slower without Air) or hard ones?
- [ ] How do augmenters (Time/Space, Light/Dark) fit? Time = speed multiplier? Space = automation?

### Multiplayer & Social
- [ ] Is there multiplayer? Competitive progression? Cooperative research?
- [ ] Leaderboards per type depth? Per total Knowledge?
- [ ] Trading type energy between players?

### Endgame
- [ ] What's the completion state? Unified Theory of Everything?
- [ ] Infinite scaling or finite game?
- [ ] Two fusion paths (magnetic vs. laser) as meaningful endgame choice?
- [ ] Should there be an "ascension" beyond prestige — restart as a different starting type?

### Technical
- [ ] Platform: web-based? Mobile? Desktop?
- [ ] Does the Phaser prototype work for this, or different tech?
- [ ] Offline progression (idle gains while away)?
- [ ] Save system and progression persistence?
