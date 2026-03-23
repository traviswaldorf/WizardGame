# Type Interaction Matrix — Exploration

> **Status**: Exploration (nothing here is committed design)
> **Purpose**: Brainstorm the full grid of type-pair interactions before committing anything to the mechanics docs (combos-and-synergies.md, counters.md, status-effects.md)
> **Scope**: Tier 1 — the 8 core types (4 primary + 4 secondary), producing 28 unique pairs

## How to Read This

Each pair gets an entry with:
- **Physics/Thematic Basis** — real-world phenomena that ground this combination
- **Relationship** — our best guess: Composition, Synergy, Counter, Tension, Neutral
- **Spell Concepts** — brainstormed multi-type spells (cost = both element types)
- **Status/Effect Ideas** — any unique status effects this combination might produce
- **Notes** — open questions, gut reactions, design tensions

"Composition" pairs are already defined (Fire+Earth=Metal, etc.). Everything else is open.

---

## Pair Index

### Compositions (Already Defined)
- [Fire + Earth = Metal](#fire--earth)
- [Earth + Water = Plant](#earth--water)
- [Air + Water = Ice](#air--water)
- [Fire + Air = Electric](#fire--air)

### Non-Composition Pairs
- [Fire + Water](#fire--water)
- [Fire + Plant](#fire--plant)
- [Fire + Ice](#fire--ice)
- [Fire + Metal](#fire--metal)
- [Fire + Electric](#fire--electric)
- [Earth + Air](#earth--air)
- [Earth + Ice](#earth--ice)
- [Earth + Electric](#earth--electric)
- [Earth + Metal](#earth--metal)
- [Earth + Plant](#earth--plant)
- [Water + Metal](#water--metal)
- [Water + Plant](#water--plant)
- [Water + Ice](#water--ice)
- [Water + Electric](#water--electric)
- [Air + Metal](#air--metal)
- [Air + Plant](#air--plant)
- [Air + Ice](#air--ice)
- [Air + Electric](#air--electric)
- [Metal + Plant](#metal--plant)
- [Metal + Ice](#metal--ice)
- [Metal + Electric](#metal--electric)
- [Plant + Ice](#plant--ice)
- [Plant + Electric](#plant--electric)
- [Ice + Electric](#ice--electric)

---

## Composition Pairs

These 4 pairs are already defined as secondary type compositions. Included here for completeness — the question is whether they ALSO have multi-type spells beyond creating the secondary type.

### Fire + Earth

> **Relationship**: Composition (= Metal)
> **Physics**: Heat + pressure transforms raw earth into forged metal. Volcanic forges, magma cooling into mineral deposits.

**Spell Concepts**:
<!-- Multi-type spells that cost Fire + Earth elements but aren't just "make Metal" -->
- Lava Flow? Volcanic Eruption? (damage + terrain change)
- Magma Pool? (persistent board hazard — DoT zone)

**Notes**:
- Does casting Fire + Earth spells always produce Metal effects, or is there design space for non-Metal Fire+Earth spells?

---

### Earth + Water

> **Relationship**: Composition (= Plant)
> **Physics**: Soil + water = conditions for life. Erosion, mud, sediment, fertile ground.

**Spell Concepts**:
<!-- Multi-type spells that cost Earth + Water but aren't just "make Plant" -->
- Mudslide? (damage + slow/repositioning)
- Erosion? (gradual tower weakening — defense reduction over time)
- Fertile Ground? (resource generation boost)

**Notes**:
- Earth + Water has a non-Plant thematic lane: mud, erosion, sediment. Could these be Earth+Water spells distinct from Plant?

---

### Air + Water

> **Relationship**: Composition (= Ice)
> **Physics**: Cold air + moisture = frost, snow, hail. Evaporation, clouds, precipitation cycle.

**Spell Concepts**:
<!-- Multi-type spells that cost Air + Water but aren't just "make Ice" -->
- Storm Cloud? (setup spell — creates a pending weather effect)
- Fog/Mist? (concealment — hide tower identities or hand)
- Monsoon? (massive card draw + board disruption)

**Notes**:
- Air + Water without the "freezing" = weather phenomena. Rain, fog, clouds, humidity. Different flavor from Ice.

---

### Fire + Air

> **Relationship**: Composition (= Electric)
> **Physics**: Heat + gas movement = convection, lightning, plasma discharge. Wildfire spread via wind.

**Spell Concepts**:
<!-- Multi-type spells that cost Fire + Air but aren't just "make Electric" -->
- Wildfire Spread? (Fire damage that jumps between targets via wind)
- Smoke Screen? (concealment — Air's evasion + Fire's chaos)
- Convection? (accelerate all effects on the board)

**Notes**:
- Fire + Air without the "electrical" = wind-driven fire, smoke, convection currents. Distinct design space from Electric.

---

## Counter Pairs

Pairs where one type naturally opposes or suppresses the other.

### Fire + Water

> **Relationship**: Counter (Water > Fire)
> **Physics**: Water extinguishes fire. Steam as byproduct. Thermal shock. Evaporation under extreme heat.
> **Counter direction**: Water suppresses Fire. Fire evaporates Water under extreme conditions?

**Spell Concepts**:
- Steam Blast? (Fire + Water = pressurized steam explosion — damage + push)
- Quench? (Water cost: remove Burn status + deal damage to Fire-type sources)
- Thermal Shock? (rapid temperature change — bonus damage to Frozen or Burning targets)
- Geyser? (Water powered by underground Fire — delayed burst)

**Ratio-Dependent Spells** (element ratio changes the outcome):
- **2 Fire + 1 Water = Steam** — offensive. Pressurized steam as a weapon (scalding, pressure burst). Fire dominant = the water is being superheated into a destructive force.
- **2 Water + 1 Fire = Extinguish / Quench** — defensive/counter. Water dominant = suppression, putting things out, smothering. Maybe removes Burn and deals damage to Fire-type sources.
- This ratio concept could be a broader design pattern — the dominant element determines the spell's character.

**Status/Effect Ideas**:
- Scald? (steam burns — a hybrid DoT that's neither pure Burn nor pure Water)

**Unit of Energy Connection**:
- The **Calorie** is literally defined as "the energy required to raise 1 gram of water by 1 degree Celsius." It is a Fire+Water unit by definition — heat energy measured through its effect on water. Could this be the "unit" for Fire+Water combo spells?

**Notes**:
- This is the most iconic counter in the system. But the COMBINATION is also rich — steam, geysers, thermal vents. Counter doesn't mean "can't combine."
- Is the counter symmetric? Fire can evaporate water too.
- The ratio-dependent spell concept (2:1 vs 1:2 producing different spells) is potentially a core mechanic worth exploring across all pairs.

---

### Fire + Plant

> **Relationship**: Counter (Fire > Plant)
> **Physics**: Fire burns vegetation. Slash-and-burn agriculture. Forest fires. But also: fire releases nutrients, some seeds require fire to germinate.

**Spell Concepts**:
- Controlled Burn? (destroy a Plant permanent but gain resources from it)
- Slash and Burn? (destroy towers but generate elements)
- Phoenix Bloom? (tower is destroyed then rebuilt next turn with bonus HP — death and rebirth)
- Wildfire? (damage all Plant-type permanents on the board)

**Status/Effect Ideas**:
- Ash Fertilizer? (destroyed Plant tower enriches the space — next tower built there is stronger)

**Notes**:
- The counter relationship has a beautiful flip side: fire ecology. Some plants NEED fire. This creates design space for "beneficial destruction" spells.
- Fire+Plant could be the "sacrifice for rebirth" archetype.

---

### Fire + Ice

> **Relationship**: Counter (Fire > Ice)
> **Physics**: Heat melts ice. Thermal energy breaks molecular bonds. Sublimation (ice to gas). But also: rapid heating of ice = steam explosion.

**Spell Concepts**:
- Meltdown? (remove Freeze effects from all targets + deal splash damage)
- Flash Thaw? (unfreeze a target but it takes damage from thermal shock)
- Steam Explosion? (frozen target hit by Fire takes bonus damage)

**Status/Effect Ideas**:
- Thaw? (removes Freeze but leaves target weakened for 1 turn)

**Notes**:
- Fire is the natural answer to Freeze. Should Fire spells automatically clear Freeze status, or should it require a dedicated Fire+Ice combo spell?
- The interesting tension: Fire COUNTERS Ice, but Fire + Air COMPOSES Electric. So Fire's relationship with Air's children (Ice = Air+Water) is adversarial.

---

### Earth + Electric

> **Relationship**: Counter (Earth > Electric)
> **Physics**: Grounding. Earth literally grounds electrical current — redirects it safely into the ground. Faraday cage effect. Insulation.

**Spell Concepts**:
- Ground? (negate an Electric spell or Paralyze status)
- Faraday Cage? (Earth + Electric cost: tower becomes immune to Electric damage/Paralyze)
- Lightning Rod? (redirect an opponent's Electric spell to a target of your choice)
- Seismic Charge? (Earth spell that detonates with Electric damage after a delay)

**Status/Effect Ideas**:
- Grounded? (target cannot be Paralyzed but also cannot benefit from Electric buffs)

**Notes**:
- "Grounding" is one of the most intuitive counter relationships in the game. Earth players should feel safe from Electric.
- Lightning Rod is interesting — it's defensive but REDIRECTS rather than negates. Fits Earth's "gravitational pull" theme.

---

### Metal + Plant

> **Relationship**: Counter (Metal > Plant)
> **Physics**: Metal tools cut vegetation. Deforestation. Mining destroys ecosystems. But also: trellises support growth, metal nutrients (iron, zinc) are essential for plants.

**Spell Concepts**:
- Harvest? (destroy a Plant permanent, gain resources)
- Deforest? (clear all Plant effects from the board)
- Iron Trellis? (Metal supports Plant — tower gains both healing AND shield)
- Root Through Metal? (Plant breaks through Metal defenses over time)

**Status/Effect Ideas**:
- <!-- TBD -->

**Notes**:
- The counter relationship (Metal cuts Plant) is clear, but the synergy side (metal supports growth) is also strong. This pair might be a "tension" rather than pure counter.
- The cutting/clearing relationship is noted in counters.md already.

---

## Cross-Pillar Pairs

Pairs that span different strategic pillars, creating interesting strategic tension.

### Earth + Air

> **Relationship**: Tension? Neutral?
> **Physics**: Wind erosion. Dust storms. Sandstorms. Atmospheric pressure meets solid ground. Caves and air pockets. Wind shaping rock over time.
> **Pillars**: Defensive + Control

**Spell Concepts**:
- Sandstorm? (damage + concealment — can't see the board clearly)
- Dust Devil? (small repositioning effect — move towers around)
- Erosion Wind? (slow, inevitable damage to a structure)
- Vacuum Seal? (Earth + Air = airtight protection — tower can't be affected by gas/Sound effects)
- Canyon? (Earth + Air = carved terrain that redirects effects)

**Status/Effect Ideas**:
- Dust Cloud? (obscures — reduced accuracy or random targeting for opponents)

**Notes**:
- Earth and Air don't compose a secondary type, making this the most "open" primary pair. Sandstorm/dust is the obvious thematic space.
- Earth is Defensive, Air is Control — together they could be the ultimate "denial" combination. Nothing gets in, nothing gets out.
- No natural counter relationship, so this leans toward utility/neutral.

---

### Water + Metal

> **Relationship**: Tension (Rust/Corrosion vs. Hydraulics)
> **Physics**: Water corrodes metal (rust, oxidation). But also: hydraulic power, water wheels, plumbing, aqueducts. Water can be channeled by metal structures.

**Spell Concepts**:
- Rust? (reduce a Metal tower's shield durability)
- Corrode? (slowly destroy a Metal permanent effect)
- Hydraulic Press? (Water + Metal = massive single-target damage, crushing force)
- Aqueduct? (Metal + Water = permanent that channels extra element draws)
- Plumbing? (redirect Water-type effects through Metal structures)

**Status/Effect Ideas**:
- Corrode/Rust? (Metal permanents lose effectiveness over time when exposed to Water)

**Notes**:
- This is a rich tension pair. Water is BOTH the enemy of metal (rust) AND empowered by metal (hydraulics). Direction matters here.
- Could be asymmetric: Water cast AGAINST Metal = corrosion. Water cast WITH Metal = hydraulic power.
- Corrosion is thematically close to Poison (chemical decay), which makes sense — Poison is Water's dark side.

---

### Water + Ice

> **Relationship**: Parent-child / Synergy
> **Physics**: Water freezes into ice. Water is Ice's liquid state. Glaciers, icebergs, the water cycle. Ice melting back into water. Supercooling.
> **Pillars**: Flow + Control (tempo)

**Spell Concepts**:
- Flash Freeze? (instantly convert a Water effect into a Freeze — e.g., Flood becomes mass Freeze)
- Glacial Flow? (slow but unstoppable advance — a permanent that creeps across the board)
- Iceberg? (hidden threat — tower that appears weak but has massive hidden HP)
- Supercool? (Water spell that doesn't freeze until triggered — delayed Freeze)

**Status/Effect Ideas**:
- Supercooled? (target appears unfrozen but freezes the moment it's interacted with)

**Notes**:
- Water is one of Ice's parent types (Air + Water = Ice). So this is a "deepening" combination — more of what Ice already does, but with Water's resource flow added.
- The Glacial/slow-advance concept fits both identities — Water's flow + Ice's inevitability.

---

### Water + Electric

> **Relationship**: Synergy (Conductivity)
> **Physics**: Water conducts electricity. Electrolysis. Hydroelectric power. Lightning striking water. Electric eels. Dangerous but powerful combination.

**Spell Concepts**:
- Conductivity? (if target has Soak/Wet status, Electric spells deal double damage)
- Hydroelectric? (Water + Electric = generate extra elements/resources)
- Electrolysis? (split a compound effect into its component parts — remove a secondary-type effect)
- Chain Lightning? (Electric damage that jumps between all "wet" targets)
- Live Wire? (a trap — tower that shocks anyone who attacks it, enhanced by Water)

**Status/Effect Ideas**:
- Wet/Conductive? (target takes amplified damage from Electric sources)

**Notes**:
- This is perhaps the most exciting synergy pair. Conductivity is universally understood and creates a natural 2-step combo: apply Water (Soak/Drench) THEN strike with Electric for bonus damage.
- This is exactly the kind of "interesting reactivity" the game should reward — player A applies Water, player A (or even player B!) follows up with Electric.
- Hydroelectric as a resource engine is also compelling — Water's flow + Electric's energy.

---

### Water + Plant

> **Relationship**: Parent-child / Synergy
> **Physics**: Water nourishes plants. Rain, irrigation, root absorption. Water cycle through transpiration. Aquatic plants. Wetlands.
> **Pillars**: Flow + Defensive (growth)

**Spell Concepts**:
- Irrigate? (boost a Plant tower's healing rate)
- Overgrow? (rapid tower growth — build a tower AND heal it in one action)
- Wetlands? (create a permanent zone that generates both Water and Plant elements)
- Algae Bloom? (flooding + growth = all water sources also produce Plant elements, but clogs them)

**Status/Effect Ideas**:
- <!-- TBD -->

**Notes**:
- Water is one of Plant's parents (Earth + Water = Plant). This is a natural amplification — more Water = more growth.
- Algae Bloom is interesting as a "too much of a good thing" effect — synergy that can backfire.

---

### Air + Metal

> **Relationship**: Neutral / Utility
> **Physics**: Oxidation (air corrodes metal over time). Aerodynamics (metal shaped for flight). Wind turbines. Bellows for forging. Wind against a metal shield.

**Spell Concepts**:
- Wind Turbine? (Air + Metal = ongoing element generation engine)
- Bellows? (Air amplifies Fire or Metal forging effects)
- Aerodynamic? (Metal projectile spell with Air = increased range or accuracy — bypasses some defenses)
- Oxidize? (air slowly degrades metal — similar to Water's rust but slower)
- Metal Storm? (shrapnel carried by wind — AoE damage)

**Status/Effect Ideas**:
- <!-- TBD -->

**Notes**:
- Less intuitive than some pairs, but Wind Turbine (energy generation) and Metal Storm (weaponized combo) both have clear mechanical hooks.
- Bellows is an interesting "catalyst" concept — Air amplifies forging processes.

---

### Air + Plant

> **Relationship**: Synergy (subtle)
> **Physics**: Wind disperses seeds (pollination). CO2/O2 gas exchange (photosynthesis). Wind shapes tree growth. Spores carried on air currents. Pollen clouds.

**Spell Concepts**:
- Pollinate? (spread a Plant effect to adjacent towers/spaces)
- Spore Cloud? (Air + Plant = AoE status effect — Entangle or Poison via airborne spores)
- Windbreak? (Plant barrier that also blocks Air-type spells)
- Dandelion? (Plant spell that gets "carried" to a random additional target by Air)
- Photosynthesis? (Air + Plant = enhanced element generation, converting "waste" elements)

**Status/Effect Ideas**:
- Spore? (airborne — infects all players, not just one target. Ticking effect.)

**Notes**:
- "Poison + Air = Toxic Cloud" was the user's example. Air + Plant's Spore Cloud hits a similar space from the non-dark side.
- The "spreading/dispersal" theme is strong — Air carries Plant effects farther.
- This is the natural pair for AoE versions of Plant effects.

---

### Air + Ice

> **Relationship**: Parent-child / Amplification
> **Physics**: Cold wind. Blizzard. Wind chill factor. Arctic gales. Ice carried by wind. Hailstorms.
> **Pillars**: Control + Control (tempo)

**Spell Concepts**:
- Blizzard? (mass Freeze + damage — the ultimate control spell)
- Wind Chill? (makes Freeze effects last longer or harder to remove)
- Hailstorm? (random Ice damage to multiple targets)
- Arctic Gale? (push targets away AND freeze them)

**Status/Effect Ideas**:
- Wind Chill? (amplified cold — Freeze lasts +1 turn)

**Notes**:
- Air is Ice's parent (Air + Water = Ice). This combination doubles down on control — the most denial-heavy pair in the game.
- Blizzard as a high-cost Air+Ice spell could be one of the most powerful control tools, justifying a very high element cost.

---

### Air + Electric

> **Relationship**: Parent-child / Amplification
> **Physics**: Lightning in the atmosphere. Static charge buildup. Ionized air. Aurora borealis. Electromagnetic pulse through air.
> **Pillars**: Control + Aggressive/Control

**Spell Concepts**:
- Lightning Storm? (random Paralyze + damage to multiple targets)
- Ion Field? (area denial — zone where spells cost more to cast)
- Static Buildup? (each Air spell cast increases the next Electric spell's damage)
- EMP? (disable all permanent effects on the board temporarily)

**Status/Effect Ideas**:
- Ionized? (charged air — next Electric spell against this target costs 0)

**Notes**:
- Air is Electric's parent (Fire + Air = Electric). The combination emphasizes the "storm" fantasy — atmospheric electrical events.
- EMP is a strong concept — Air's denial + Electric's disruption = total shutdown of permanents.

---

### Earth + Ice

> **Relationship**: Neutral / Utility
> **Physics**: Permafrost. Glacial geology — ice shaping landscapes over millennia. Frozen ground. Tundra. Ice wedging (frost breaking rock).

**Spell Concepts**:
- Permafrost? (permanently reduce an element source's output — frozen earth)
- Glacial Carve? (slow, inevitable terrain reshaping — move tower positions)
- Avalanche? (Earth + Ice = massive delayed damage triggered by disturbance)
- Frozen Foundation? (build a tower that's immune to Freeze — cold-adapted structure)

**Status/Effect Ideas**:
- Permafrost? (element source permanently produces 1 less — a lasting debuff)

**Notes**:
- Slow, geological-scale effects fit both types. Earth is patient, Ice is inexorable.
- Avalanche is a great fit — it's stored potential energy (Earth) released suddenly (Ice breaking free).

---

### Earth + Metal

> **Relationship**: Parent-child / Amplification
> **Physics**: Metal is refined from earth/ore. Mining, smelting, mineral deposits. Metal reinforcing stone structures. Bedrock.
> **Pillars**: Defensive + Defensive/Aggressive

**Spell Concepts**:
- Reinforce? (add Metal shielding to an Earth tower — stacking defenses)
- Deep Mine? (Earth + Metal = draw extra Metal elements from deep reserves)
- Bedrock Armor? (ultimate defensive permanent — tower becomes nearly indestructible for X turns)
- Ore Vein? (discover additional Metal element sources)

**Status/Effect Ideas**:
- <!-- TBD -->

**Notes**:
- Earth is Metal's parent (Fire + Earth = Metal). This combination deepens the defensive identity — more structure, more protection.
- Risk of being boring if it's just "even more defense." Need offensive applications too.

---

### Earth + Plant

> **Relationship**: Parent-child / Amplification
> **Physics**: Soil nourishes roots. Mineral absorption. Mycorrhizal networks. Geological layering supports ecosystems. Composting returns organic matter to earth.
> **Pillars**: Defensive + Defensive (growth)

**Spell Concepts**:
- Deep Roots? (Plant tower becomes much harder to destroy — anchored to earth)
- Mycorrhizal Network? (all your towers share healing — damage to one is distributed across all)
- Composting? (sacrifice a destroyed tower to generate resources)
- Living Wall? (tower that heals itself AND blocks damage — Earth+Plant ultimate defense)

**Status/Effect Ideas**:
- Rooted? (tower can't be repositioned but gains bonus HP)

**Notes**:
- Earth is Plant's parent (Earth + Water = Plant). The deepest defensive combination in the game.
- Mycorrhizal Network is a standout concept — a biological version of Metal's structural interconnection.

---

### Metal + Ice

> **Relationship**: Tension
> **Physics**: Cold makes metal brittle. Cryogenic tempering. Frozen machinery. But also: ice on metal surfaces (slippery, dangerous). Cold-forging.

**Spell Concepts**:
- Brittle? (reduce Metal shield durability — cold makes metal fragile)
- Cryo-forge? (Metal + Ice = create a structure that freezes attackers)
- Frozen Arsenal? (all your Metal permanents also apply Freeze to attackers)
- Shatter? (hit a Frozen Metal target for massive bonus damage)

**Status/Effect Ideas**:
- Brittle? (Metal target takes bonus damage from the next attack)

**Notes**:
- Interesting tension: cold both WEAKENS metal (brittleness) and can be WEAPONIZED with metal (cryo-weapons).
- Shatter (attacking something that's both Metal and Frozen) is an intuitive combo payoff.

---

### Metal + Electric

> **Relationship**: Synergy (Conductivity)
> **Physics**: Metal conducts electricity. Circuits, wiring, electromagnets. Power generation and distribution. Anodizing (electro-chemical metal coating).

**Spell Concepts**:
- Circuit? (Metal + Electric = chain effect that bounces between Metal towers)
- Anodize? (Electric + Metal = tower gains protection AND retaliates with Electric damage)
- Power Grid? (permanent that generates Electric elements from Metal towers)
- Electromagnet? (pull/steal a resource or card using Metal + Electric)
- Short Circuit? (overload a Metal permanent — destroy it but deal AoE damage)

**Status/Effect Ideas**:
- Anodized? (tower coated — immune to corrosion/Poison AND shocks attackers)
- Overloaded? (Metal permanent that's been given too much Electric — about to explode)

**Notes**:
- Conductivity is the core theme, shared with Water+Electric. But Metal's version is about STRUCTURE (circuits, grids) while Water's is about FLOW (chain lightning through liquid).
- Anodize was already identified in our status effects conversation as a perfect Metal+Electric combo.

---

### Plant + Ice

> **Relationship**: Counter (Ice > Plant)
> **Physics**: Frost kills plants. Frozen sap bursts cells. Winter dormancy. But also: permafrost preserves, frost hardening strengthens some plants, evergreens.

**Spell Concepts**:
- Frost Blight? (damage all Plant permanents on the board)
- Winter Dormancy? (put a Plant tower into "hibernation" — can't act but can't be destroyed)
- Frost Hardening? (Plant + Ice = tower becomes resistant to future Freeze effects)
- Evergreen? (Plant permanent that's immune to Ice — thematic exception)

**Status/Effect Ideas**:
- Dormant? (tower is inactive but protected — can't heal or produce, but can't be damaged)

**Notes**:
- Frost killing plants is intuitive. But Winter Dormancy as a DEFENSIVE combo is interesting — freezing your own Plant to protect it.

---

### Plant + Electric

> **Relationship**: Neutral / Exotic
> **Physics**: Bioelectricity. Neural signals in plants (slow, but real). Lightning strikes fertilizing soil (nitrogen fixation). Electric fences around crops.

**Spell Concepts**:
- Bioelectric? (Plant + Electric = tower that stuns attackers when damaged)
- Nitrogen Fix? (Electric + Plant = generate extra Plant elements — lightning enriches soil)
- Electric Fence? (permanent that prevents opponents from targeting your Plant towers)
- Venus Trap? (Plant permanent that Paralyzes the next thing that attacks it)

**Status/Effect Ideas**:
- <!-- TBD -->

**Notes**:
- The most exotic primary/secondary pair. Less intuitive than others, but Venus Trap and Electric Fence provide clear mechanical hooks.
- Bioelectricity could be a unique design lane — living things that harness electrical power.

---

### Ice + Electric

> **Relationship**: Tension (Rival control types)
> **Physics**: Lightning in ice storms. Static discharge in cold air. Superconductivity at extreme cold. Frozen circuits. Hail + lightning as a devastating storm.
> **Pillars**: Control (tempo) + Aggressive/Control — both try to deny opponents

**Spell Concepts**:
- Superconductor? (Ice + Electric = spells cost 0 this turn but you lose elements next turn)
- Ion Storm? (mass Freeze + mass Paralyze — the ultimate lockdown, very expensive)
- Flash Freeze Discharge? (Paralyze a target, and when it unfreezes, it takes Electric damage)
- Cryo-Electric? (alternating Freeze and Paralyze over multiple turns)

**Status/Effect Ideas**:
- Superconducting? (spells channeled through this target cost 0 but it's vulnerable)

**Notes**:
- Both Ice and Electric deny opponents (Freeze and Paralyze). Together they should be the most oppressive control combination in the game — but at a very high cost.
- Superconductivity (real physics: some materials become superconducting at extremely low temperatures) is a perfect flavor bridge.

---

### Fire + Metal

> **Relationship**: Parent-child / Amplification
> **Physics**: Fire forges metal. Smelting, casting, tempering. Molten metal. The forge as a place of creation. Thermite (metal + intense heat = unstoppable burning).
> **Pillars**: Aggressive + Defensive/Aggressive

**Spell Concepts**:
- Forge? (Fire + Metal = build a tower with built-in offensive capability)
- Thermite? (unstoppable burn — Burn status that can't be removed by normal means)
- Molten Metal? (AoE damage that also leaves a persistent hazard zone)
- Temper? (Fire + Metal on own tower = permanently increase its attack/defense)

**Status/Effect Ideas**:
- Tempered? (tower has been hardened by fire — increased durability permanently)
- Molten? (Burn + Metal = more intense, harder to remove)

**Notes**:
- Fire is Metal's parent (Fire + Earth = Metal). The combination leans offensive — the FORGE is about creation through destruction.
- Thermite (a Burn that can't be extinguished by Water) would be a terrifying spell.

---

### Fire + Electric

> **Relationship**: Parent-child / Amplification
> **Physics**: Fire + Air movement = Electric (composition). But Fire + Electric directly = plasma, arc welding, lightning fires, electromagnetic radiation.
> **Pillars**: Aggressive + Aggressive/Control

**Spell Concepts**:
- Plasma Arc? (extreme damage to a single target — focused fire + electricity)
- Lightning Fire? (Electric damage that also applies Burn)
- Arc Weld? (fuse two of your towers together — combined HP and effects)
- Overcharge? (boost a Fire spell's damage but it also Paralyzes a random friendly target)

**Status/Effect Ideas**:
- Plasma? (combined Burn + Paralyze — the most aggressive status in the game)

**Notes**:
- Fire is Electric's parent (Fire + Air = Electric). Pure aggression — this combination should have the highest single-target damage potential.
- Plasma as a combined Burn+Paralyze status is elegant but potentially overpowered.

---

## Summary Grid

A bird's eye view of how each pair relates. Read as: Row type's relationship TO Column type.

```
            Fire      Earth     Water     Air       Metal     Plant     Ice       Electric
Fire        ---       COMP(M)   COUNTER   COMP(E)   parent    COUNTER   COUNTER   parent
Earth       COMP(M)   ---       COMP(P)   TENSION   parent    parent    NEUTRAL   COUNTER
Water       COUNTER   COMP(P)   ---       COMP(I)   TENSION   parent    parent    SYNERGY
Air         COMP(E)   TENSION   COMP(I)   ---       NEUTRAL   SYNERGY   parent    parent
Metal       child     child     TENSION   NEUTRAL   ---       COUNTER   TENSION   SYNERGY
Plant       COUNTER   child     child     SYNERGY   COUNTER   ---       COUNTER   NEUTRAL
Ice         COUNTER   NEUTRAL   child     child     TENSION   COUNTER   ---       TENSION
Electric    child     COUNTER   SYNERGY   child     SYNERGY   NEUTRAL   TENSION   ---
```

Key: COMP(X) = Composition, creates type X. Parent/child = one composes the other.

---

## Tier 2 — Parent/Dark Pairs (Future)

These 8 pairs explore each type's relationship with its tertiary "dark side."

| Parent | Tertiary | Tension Theme |
|--------|----------|---------------|
| Fire | Radioactive | Controlled burn vs. uncontrolled nuclear |
| Earth | Cosmic | Local gravity vs. cosmic gravity |
| Water | Poison | Giving flow vs. taking flow |
| Air | Sound | Silent control vs. loud destruction |
| Metal | Crystal | Forged structure vs. natural structure |
| Plant | Ghost | Life vs. death |
| Ice | Heat | Cold vs. hot (thermodynamic spectrum) |
| Electric | Magnetic | Current vs. field |

<!-- To be explored after Tier 1 is more developed -->

---

## Tier 3 — Cross-Tertiary Pairs (Future)

The exotic combinations. 28 unique tertiary-to-tertiary pairs, plus 64 tertiary-to-primary/secondary pairs. Only explore after Tiers 1 and 2.

<!-- To be explored much later -->

---

## Design Questions

- [ ] Should every pair have at least one multi-type spell, or are some pairs intentionally barren?
- [ ] How many elements of each type does a multi-type spell cost? (1+1? 2+1? Variable?)
- [ ] Can multi-type spells be countered by either component type's counter?
- [ ] Do parent-child pairs (Fire+Metal) get discounted multi-type spells since they share elements?
- [ ] Should some pairs have ONLY synergy spells (cooperative) while others have ONLY counter spells (adversarial)?
- [ ] How do multi-type spell costs interact with the element exclusivity reward?
- [ ] Is there a "discovery" mechanic — players find combos during play rather than knowing them all upfront?
