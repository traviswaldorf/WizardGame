# Instrument-Wizard Pairings — Research

> **Status**: Done
> **Last Updated**: 2026-03-22
> **Reference Games**: Everdell (Construction-Critter free play)
> **Related Slugs**: production-cascades, school-board-stages

## What This Mechanic Does

In Everdell, every Construction card (building) is paired with a specific Critter card. If you have the Construction in your city (tableau), you can play the matching Critter for **free** — bypassing its normal berry cost entirely. This creates a two-step combo pattern: (1) invest resources to build the Construction, (2) later reap the reward by playing the paired Critter at zero cost.

The mechanic produces several key feelings:
- **Satisfying combo discovery** — the first time a player realizes "wait, I already have the Dungeon... that means the Ranger is FREE?" is a genuine delight moment
- **Forward planning** — experienced players draft Constructions partly because they know the paired Critter is coming, creating a layered draft strategy
- **Tempo swing** — a free play is essentially an extra action's worth of value, creating meaningful power spikes
- **Thematic resonance** — the pairings make narrative sense (the Dungeon attracts the Ranger; the University attracts the Doctor), reinforcing the world-building

In Everdell, each Construction has exactly one paired Critter and vice versa. The pairing is printed on the card. There are 15 Construction-Critter pairs in the base game, covering most (but not all) cards in the deck.

## Our Mapping

Scientists have instruments. This is historically true and thematically perfect. Lavoisier built the Calorimeter. Torricelli invented the Barometer. Volta created the Voltaic Pile. If the instrument is already in your lab, the scientist who created it recognizes their own tool and joins you for free.

The thematic sentence: **"The founder recognizes their own instrument."**

This works because our game already has two card categories that map cleanly:
- **Instruments** = Constructions (persistent engine pieces you build in your lab)
- **Wizards** = Critters (scientists depicted as wizards who join your lab)

The `instrument_design` table has an `associated_scientist` field that links directly to scientists in `wizard_school_design`. This is the pairing key.

## Current Data Landscape

### Complete Instrument-Wizard Pairings from the Database

The DB contains **31 instruments** across all 14 types (12 standard + Ghost, Heat, Magnetic) and **42 wizards** (3 per school: head + pupil_a + pupil_b, across 14 schools). Of those, **21 instruments** have a named `associated_scientist`, creating direct pairing candidates.

| Type | Instrument | Associated Scientist | Wizard Role | School | Pairing Strength |
|------|-----------|---------------------|-------------|--------|-----------------|
| **Fire** | Calorimeter | Antoine-Laurent Lavoisier | Head | School of Combustion | **Strong** — Lavoisier literally invented modern calorimetry |
| **Fire** | Spectroscope | Joseph von Fraunhofer | Pupil B | School of Combustion | **Strong** — Fraunhofer discovered spectral lines with this instrument |
| **Earth** | Balance Scale | Isaac Newton | Head | School of Mass | **Moderate** — Newton used balance/pendulum concepts; less directly "his" instrument |
| **Water** | Eureka Can | Archimedes | Head | School of Fluids | **Strong** — Archimedes literally discovered displacement with this vessel |
| **Water** | Hydraulic Press | Blaise Pascal | Pupil B | School of Fluids | **Strong** — Pascal's Law is the direct principle behind hydraulic presses |
| **Air** | Barometer | Evangelista Torricelli | Head | School of Pressure | **Strong** — Torricelli invented the barometer |
| **Metal** | Mohs Hardness Scale | Friedrich Mohs | Head | School of Hardness | **Strong** — Mohs created this scale |
| **Metal** | X-ray Diffractometer | William Lawrence Bragg | Pupil B | School of Hardness | **Strong** — Bragg's Law governs X-ray diffraction |
| **Ice** | Thermometer | Lord Kelvin | Head | School of Cold | **Strong** — Kelvin established the absolute temperature scale |
| **Electric** | Voltaic Pile | Alessandro Volta | Pupil A | School of Current | **Strong** — Volta invented this, the first battery |
| **Electric** | Galvanometer | Andre-Marie Ampere | Pupil B | School of Current | **Strong** — Ampere's work on current measurement is foundational |
| **Radioactive** | Geiger Counter | Hans Geiger | *Not in wizard schools* | N/A | **Orphan** — Geiger is not a wizard school member |
| **Radioactive** | Cloud Chamber | C.T.R. Wilson | *Not in wizard schools* | N/A | **Orphan** — Wilson is not a wizard school member |
| **Cosmic** | Telescope | Edwin Hubble | Head | School of the Vast | **Strong** — Hubble used telescopes to prove galaxies exist |
| **Cosmic** | Cepheid Variable | Henrietta Swan Leavitt | Pupil A | School of the Vast | **Strong** — Leavitt discovered the period-luminosity relationship |
| **Poison** | Marsh Test Apparatus | James Marsh | *Not in wizard schools* | N/A | **Orphan** — Marsh is not a wizard school member |
| **Sound** | Chladni Plate | Ernst Chladni | Pupil A | School of Acoustics | **Strong** — Chladni invented this |
| **Crystal** | Piezoelectric Crystal | Pierre Curie | Pupil A | School of Frequency | **Strong** — Pierre Curie discovered piezoelectricity |
| **Heat** | Thermometer | Daniel Fahrenheit | *Not in wizard schools* | N/A | **Orphan** — Fahrenheit is not a wizard school member |
| **Heat** | Calorimeter | Count Rumford | Pupil A | School of Thermodynamics | **Moderate** — Rumford used calorimetry to disprove caloric theory |
| **Magnetic** | Compass | William Gilbert | Pupil B | School of Fields | **Strong** — Gilbert wrote De Magnete and studied compass behavior |
| **Magnetic** | Tesla Coil | Nikola Tesla | Pupil A | School of Fields | **Strong** — Tesla invented this |

### Instruments Without a Named Scientist (10 total)

These have no `associated_scientist` in the DB — potential for future pairing or they remain "generic" instruments:

| Type | Instrument |
|------|-----------|
| Earth | Seismograph |
| Air | Anemometer |
| Plant | Microscope |
| Plant | Herbarium Press |
| Ice | Cryostat |
| Poison | Litmus Paper |
| Sound | Tuning Fork |
| Crystal | Goniometer |
| Ghost | Electroscope |

### Wizards Without a Paired Instrument (by exclusion)

These wizard school members have no instrument with their name in `associated_scientist`:

| Type | Wizard | Role | Notes |
|------|--------|------|-------|
| Fire | James Prescott Joule | Pupil A | Could pair with a "Joule Apparatus" (mechanical equivalent of heat device) |
| Earth | James Hutton | Pupil A | Could pair with a geological hammer or rock sample kit |
| Earth | Alfred Wegener | Pupil B | Could pair with the Seismograph (currently unpaired) |
| Water | Daniel Bernoulli | Pupil A | Could pair with a Venturi tube or pitot tube |
| Air | Robert Boyle | Pupil A | Could pair with Boyle's air pump |
| Air | Gaspard-Gustave de Coriolis | Pupil B | Could pair with the Anemometer (currently unpaired) |
| Metal | Henry Bessemer | Pupil A | Could pair with a Bessemer converter |
| Plant | Charles Darwin | Head | Could pair with the Microscope (currently unpaired) |
| Plant | Gregor Mendel | Pupil A | Could pair with the Herbarium Press (currently unpaired) |
| Plant | Thomas Robert Malthus | Pupil B | Harder — Malthus was a theorist, not an experimentalist |
| Ice | Heike Kamerlingh Onnes | Pupil A | Could pair with the Cryostat (currently unpaired) |
| Ice | Josiah Willard Gibbs | Pupil B | Harder — Gibbs was a theorist |
| Electric | Michael Faraday | Head | Could pair with a Faraday cage or induction coil |
| Radioactive | Marie Curie | Head | Could pair with the Geiger Counter or a pitchblende sample |
| Radioactive | Lise Meitner | Pupil A | Could pair with a nuclear reactor model |
| Radioactive | Hans Bethe | Pupil B | Could pair with a stellar model/spectroscope |
| Cosmic | Fritz Zwicky | Pupil B | Could pair with a galaxy survey plate |
| Poison | Paracelsus | Head | Could pair with Litmus Paper (currently unpaired) |
| Poison | Mathieu Orfila | Pupil A | Could pair with the Marsh Test Apparatus (scientist listed but Marsh is not a wizard) |
| Poison | Carl Wilhelm Scheele | Pupil B | Could pair with a distillation apparatus |
| Sound | Alexander Graham Bell | Head | Could pair with the Tuning Fork (currently unpaired) |
| Sound | Christian Doppler | Pupil B | Could pair with a Doppler whistle or frequency meter |
| Crystal | Heinrich Hertz | Head | Could pair with a spark gap transmitter |
| Crystal | Auguste Bravais | Pupil B | Could pair with the Goniometer (currently unpaired) |
| Ghost | Ludwig Boltzmann | Head | Could pair with the Electroscope (currently unpaired) |
| Ghost | Ernest Rutherford | Pupil A | Could pair with a gold foil apparatus |
| Ghost | Rudolf Clausius | Pupil B | Harder — Clausius was a theorist |
| Heat | Sadi Carnot | Head | Could pair with a steam engine model |
| Heat | Joseph Fourier | Pupil B | Could pair with a heat conduction bar |
| Magnetic | James Clerk Maxwell | Head | Could pair with a Maxwell's demon thought experiment device or field line visualizer |

### Summary Counts

| Category | Count |
|----------|-------|
| Total instruments | 31 |
| Total wizards | 42 |
| Instruments with named scientist match in wizard schools | **17** |
| Instruments with named scientist NOT in wizard schools (orphans) | **4** |
| Instruments with no associated scientist | **10** |
| Wizards with no paired instrument | **~30** |

**Key finding**: The current data supports **17 clean pairings** where an instrument's `associated_scientist` matches a wizard school member. There is significant room to grow — most pupils and several heads lack paired instruments. The 10 unnamed instruments could be assigned to unpaired wizards to increase coverage.

## Design Tensions

### 1. Coverage: Should Every Wizard Have a Paired Instrument?

In Everdell, not every card has a pair — but most Constructions do. If we want 42 wizards each paired 1:1, we need 42 instruments (currently 31, with 17 matched). Options:
- **Full coverage** (42 pairs): add ~11 new instruments and assign all. Maximum combo potential, but every wizard having a free-play path might be too generous.
- **Partial coverage** (20-25 pairs): only head wizards and select pupils get pairings. Creates a natural rarity — paired wizards are more valuable in draft. Unpaired wizards must always be paid for.
- **Head-only coverage** (14 pairs): only school heads pair with instruments. Clean, simple, memorable. Pupils are always "recruited the hard way."

### 2. Discoverability: Should Pairings Be Visible or Hidden?

- **Printed on card** (Everdell style): the instrument card shows the paired wizard's name/portrait. No memorization needed. Accessible but less discovery.
- **Hidden until discovered**: pairings are not printed. Players must know (or realize mid-game) that Lavoisier pairs with the Calorimeter. Rewards game knowledge. Aligns with "Discovery as Magic" — the pairing IS a discovery. But punishes new players.
- **Hybrid**: instrument cards show a subtle symbol or school crest hinting at the pairing. Experienced players read it instantly; new players have an "aha" moment when they figure it out.

### 3. Balance of Free Plays

A free wizard play is a significant tempo advantage. In a game with limited lab slots and scarce actions, getting a wizard for free is essentially worth one full turn of resource-gathering. Concerns:
- **Must-draft combos**: if Calorimeter + Lavoisier is always correct, it warps the draft. Players who get both halves have an unfair advantage.
- **Mitigation via draft separation**: if instruments and wizards appear in different eras or different draft pools, getting both halves requires planning across multiple rounds — rewarding foresight rather than luck.
- **Mitigation via opportunity cost**: the instrument itself must be worth playing even without the paired wizard. If the Calorimeter is a mediocre card on its own, players face a real choice: play it hoping Lavoisier comes, or play a better instrument now.

### 4. Interaction with Draft

The pairing mechanic interacts powerfully with drafting:
- **Hate-drafting**: if you see the Calorimeter in a draft hand and know your opponent has Lavoisier, taking it to deny the free play is a meaningful strategic choice.
- **Signal reading**: seeing instruments in the draft tells you which wizards might be free later — and which opponents might be targeting.
- **Draft-across-eras**: if instruments appear in Era 1 and wizards in Era 2-3, the pairing creates cross-era planning. You draft the instrument early, knowing the payoff comes later. This directly serves the Progression principle.

### 5. One-to-One vs. One-to-Many

- **Strict 1:1** (Everdell): each instrument pairs with exactly one wizard, and vice versa. Simple, clean.
- **One instrument, multiple wizards**: the Calorimeter could pair with any Fire wizard, not just Lavoisier. More flexible, less memorable.
- **School-based pairing**: any instrument of a type pairs with any wizard of that type. Simplest rule, but loses the specific scientist-instrument connection.

## Interaction with Other Mechanics

### Production Cascades (production-cascades)
Instruments are the engine pieces that trigger during era advancement. If a wizard is "paired" with an instrument, the wizard could **enhance the instrument's production trigger** when both are in the lab. Example: the Calorimeter produces 1 Metal each era. With Lavoisier present, it produces 2 Metal (or Metal + Fire). The wizard amplifies their own instrument — thematically, the inventor gets more out of their creation than anyone else.

### Permanent Affinity (permanent-affinity)
A paired wizard-instrument combo in your lab could grant a **permanent affinity bonus** in that type. Having Lavoisier + Calorimeter gives +1 permanent Fire affinity, making future Fire costs cheaper. The pairing becomes not just a free play, but a long-term engine discount.

### School Board Stages (school-board-stages)
The school head wizard could function as a **special pairing** with the school board itself. Choosing the School of Combustion and later recruiting Lavoisier (the head wizard) could unlock a school board stage for free — or the school board could act as Lavoisier's "instrument" for free-play purposes. This creates a three-layer combo: choose school -> build matching instrument -> recruit matching head wizard.

### Draft
Pairings add a hidden information layer to the draft. You know which instruments are in circulation (they are visible once played), but you do not know which wizards opponents have in hand. Deciding whether to invest in an instrument "hoping" the paired wizard comes around in a later draft is a meaningful risk/reward calculation.

### Lab Slot Economy
If the lab has a 15-card maximum (Everdell's city limit), a paired wizard taking zero resources but still consuming a lab slot creates an interesting tension: the slot itself is the cost, even when the play is "free."

## Design Principle Alignment

| Principle | Fit | Notes |
|-----------|-----|-------|
| Discovery as Magic | **Excellent** | The pairing IS a discovery — "Lavoisier invented the Calorimeter, so of course he comes for free." Players discovering these real historical connections feel like they are uncovering the actual history of science. The mechanic makes learning about real scientists rewarding gameplay. Hidden/semi-hidden pairings amplify this. |
| A World of Interaction | **Good** | Pairings create draft interaction (hate-drafting instruments to deny free wizards), information asymmetry (who has which half?), and cross-player tension. They also create instrument-wizard interaction within your own lab. However, the mechanic is primarily inward-facing (your own lab combos), not directly interactive with opponents. |
| Progression and Advancement | **Excellent** | Instruments in Era 1 set up wizard free-plays in Era 2-3. This is literally "building foundational knowledge that makes advanced discoveries easier/free." The mechanic embodies the idea that science builds on previous science. Early investment pays off later — classic engine-building progression. |

## Open Questions

- [ ] Should pairings be 1:1 (Lavoisier-Calorimeter only), type-based (any Fire instrument pairs with any Fire wizard), or school-based (School of Combustion instruments pair with School of Combustion wizards)?
- [ ] How many total pairings should exist? Full coverage (42), partial (20-25), or head-only (14)?
- [ ] Should pairings be printed on cards, hidden, or hinted with symbols?
- [ ] Should the free-play be truly free, or "discounted" (e.g., free but costs 1 Light token)?
- [ ] Do orphan instruments (Geiger Counter, Cloud Chamber, etc.) need new wizard school entries, or do they pair with existing wizards differently?
- [ ] Should paired wizard-instrument combos grant a bonus beyond the free play (enhanced production, affinity bonus)?
- [ ] What happens if you recruit the wizard first and THEN build the instrument? Everdell only works one direction (Construction first). Should we allow retroactive pairing?
- [ ] Should the instrument need to be "active" (installed in a specific lab wing) for the pairing to trigger, or just present in the lab?
- [ ] How does this interact with the 15-slot lab limit? Is a paired free wizard still worth a slot?
- [ ] In the draft, should instruments and wizards appear in the same pool or separate pools (to prevent getting both halves from one draft hand)?

## Sources and References

- `design/decisions/006-multiplayer-economy-design.md` — Lens D (Everdell Clone, "Wizard's City") defines the Construction-Critter mapping: instruments as Constructions, wizards as Critters, with free recruitment when paired (lines 315-360)
- `design/decisions/006-multiplayer-economy-design.md` — Part 4 Synthesis explicitly pulls "Wizard-instrument pairings with free recruitment" from Everdell as a key mechanic to adopt (line 378)
- `database/build.py` — INSTRUMENTS array (line 219) with `associated_scientist` field; WIZARD_SCHOOLS array (line 304) with scientist names
- `database/schema.sql` — `instrument_design.associated_scientist` is the FK-by-name link to `wizard_school_design.scientist_name`
- `frontend/src/shared/data.js` — `loadInstrumentCards()` and `loadWizardCards()` already load both datasets; `loadGameData()` returns `{ types, spells, instruments, wizards }`
- `frontend/src/sandbox/game.js` — current game state has no pairing logic; wizards are loaded as `catalog.wizards` but only head wizards are used for school selection
- `design/reference/scientists/wizard-schools.md` — full wizard school roster with 14 schools, 42 scientists
