"""Insert brainstormed type combination ideas for missing gaps."""
import sqlite3

conn = sqlite3.connect('database/wizard_game.db')
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) FROM type_combination_design')
before = cursor.fetchone()[0]

# Type IDs: 1=Fire, 2=Earth, 3=Water, 4=Air, 5=Metal, 6=Plant, 7=Ice, 8=Electric
# (type_a_id, type_b_id, type_a_amount, type_b_amount, name, description, nature, mechanic, process)

entries = [
    # === Fire + Plant (1:2) ===
    (1, 6, 1, 2, 'Spontaneous Combustion',
     'Organic matter ignites from within as microbial decomposition generates heat faster than it dissipates, reaching ignition without an external spark.',
     'phenomenon', 'spell',
     'Microbial decomposition in tightly packed organic material generates heat; insulation prevents dissipation, reaching ignition point spontaneously.'),
    (1, 6, 1, 2, 'Resin Torch',
     'Living wood weeps flammable sap that catches a controlled, persistent flame that refuses to go out — resistant to water, can only be smothered.',
     'material', 'spell',
     'Conifer resins (pitch, turpentine) are highly flammable hydrocarbons produced by trees as wound-sealing defenses; they sustain flame far longer than wood alone.'),
    (1, 6, 1, 2, 'Capsaicin Bloom',
     'A burst of botanical heat that burns without flame — searing pain and lost focus, but no actual fire damage.',
     'effect', 'spell',
     'Capsaicin activates TRPV1 pain receptors, the same receptors triggered by actual burning heat. The plant evolved this molecule to simulate fire as a defense mechanism.'),

    # === Fire + Plant (2:2) ===
    (1, 6, 2, 2, 'Wildfire Cycle',
     'An unstoppable conflagration that feeds on everything alive, spreading to adjacent units. Plant-types fuel it; removing them starves it. Leaves fertile ash behind.',
     'phenomenon', 'storm',
     'Wildfires are self-sustaining feedback loops — fire consumes biomass, releasing heat and combustible gases that ignite more biomass. Many ecosystems require fire to germinate.'),
    (1, 6, 2, 2, 'Peat Conflagration',
     'The ground itself burns — a subterranean storm smoldering beneath the battlefield, dealing unavoidable damage to all ground-based units. Extremely difficult to extinguish.',
     'phenomenon', 'storm',
     'Peat fires burn underground through millennia of accumulated organic matter; they can persist for months or years, smoldering below where water cannot reach.'),
    (1, 6, 2, 2, 'Slash and Burn',
     'Controlled destruction that transforms the board. Destroys all terrain effects and plant summons, then converts cleared zones into enriched soil tiles granting resource generation.',
     'phenomenon', 'storm',
     'Swidden agriculture: burning vegetation returns nitrogen, phosphorus, potassium, and calcium to soil as ash, creating a massive short-term fertility spike.'),

    # === Fire + Ice (1:2) ===
    (1, 7, 1, 2, 'Cryovolcano',
     'An eruption of super-cold slurry — ice and ammonia blasting outward under pressure. Deals ice damage in a wide area and leaves frozen slush terrain.',
     'phenomenon', 'spell',
     'Cryovolcanism on icy moons like Enceladus and Triton erupts water, ammonia, and methane driven by tidal heating. The eruptive mechanism is fire-like; the substance is pure ice.'),
    (1, 7, 1, 2, 'Frostbite',
     'A creeping cold that burns — tissue destruction typed as ice that mimics fire damage, reducing healing received as damaged tissue cannot regenerate.',
     'effect', 'spell',
     'Frostbite destroys tissue through ice crystal formation; clinically similar to thermal burns and classified by the same degree system.'),
    (1, 7, 1, 2, 'Frost Quench',
     'Superheats a target then flash-freezes it, creating a brittle armor shell. Grants temporary defense, but shatters into ice damage when broken.',
     'effect', 'spell',
     'Quenching rapidly cools heated material to alter crystal structure, creating martensite — extremely hard but brittle.'),

    # === Fire + Electric (1:2) ===
    (1, 8, 1, 2, "St. Elmo's Fire",
     'Eerie electrical flame dances across weapon tips and armor, dealing minor electric damage and temporarily disabling equipped artifact effects.',
     'phenomenon', 'spell',
     "St. Elmo's Fire is a corona discharge where atmospheric electricity ionizes air around pointed objects, creating visible blue-violet plasma flames."),
    (1, 8, 1, 2, 'Electrostatic Ignition',
     'A single devastating spark that finds the most vulnerable target. If it kills, the target detonates with fire splash to adjacent units.',
     'effect', 'spell',
     'Electrostatic discharge is the leading cause of industrial explosions in fuel handling. A tiny spark can ignite flammable vapors — electricity provides ignition, fire is the chain reaction.'),

    # === Fire + Electric (2:2) ===
    (1, 8, 2, 2, 'Volcanic Lightning',
     'An eruption column crackling with self-generated lightning. Massive mixed fire+electric damage to all enemies, then a persistent ash cloud reducing ranged accuracy.',
     'phenomenon', 'storm',
     'Volcanic lightning (dirty thunderstorm) occurs when ash particles in an eruption column collide and generate static charge, producing lightning within the plume itself.'),
    (1, 8, 2, 2, 'Coronal Mass Ejection',
     "A wave of solar plasma washes over the battlefield, dealing fire damage to all and disabling all artifact effects — the sun's hard reset on technology.",
     'phenomenon', 'storm',
     'CMEs are billion-ton clouds of magnetized solar plasma carrying enormous electric currents. The 1859 Carrington Event induced currents so powerful telegraph equipment caught fire while disconnected.'),
    (1, 8, 2, 2, 'Thunderstorm Firestorm',
     'Continuous lightning as superheated air ignites everything below. Every unit takes electric damage each turn with a chance to catch fire; metal-types attract extra strikes.',
     'phenomenon', 'storm',
     'Dry thunderstorms — electrical storms with no rain — are the largest natural cause of wildfires. In 2008, one California dry lightning event sparked over 2,000 simultaneous wildfires.'),

    # === Earth + Metal (1:2) ===
    (2, 5, 1, 2, 'Magnetite Surge',
     'Draw veins of magnetic iron ore to the surface, pulling all Metal-type units and equipment toward a target zone. Repositions enemies and strips metal items.',
     'phenomenon', 'spell',
     "Magnetite (Fe3O4) is naturally occurring magnetic mineral. Lodestone was humanity's first encounter with magnetism: rocks that pull metal toward them."),
    (2, 5, 1, 2, 'Slag Coat',
     'Encase a target in molten mineral skin that cools into a brittle absorptive shell. Grants temporary armor, then shatters into shrapnel damaging adjacent units.',
     'material', 'spell',
     'Slag is the glassy byproduct of smelting — impurities separate into a molten silicate layer that hardens into a rough, insulating crust.'),
    (2, 5, 1, 2, 'Alluvial Sifting',
     'Wash away the weak, leave the strong. Strip all temporary buffs and debuffs from a zone, then grant stacking power to Metal-type units that remain.',
     'effect', 'spell',
     'Alluvial deposits form when flowing water sorts sediments by density — heavy metals sink and concentrate while lighter material washes away. The principle behind placer mining.'),

    # === Earth + Metal (2:2) ===
    (2, 5, 2, 2, 'Tectonic Forge',
     'The battlefield buckles as deep-mantle pressures erupt. All units take crushing damage; Metal-types are reforged with upgraded stats. Creates persistent high-pressure forge zones.',
     'phenomenon', 'storm',
     "Earth's core is a dynamo of iron and nickel under million-atmosphere pressures. Tectonic processes bring deep metal deposits to the surface through orogenesis and volcanism."),
    (2, 5, 2, 2, 'Iron Banding Event',
     'Alternating rows of iron-rich and silicate-rich bands sweep the board, boosting Metal or Earth types respectively. The pattern shifts each turn.',
     'phenomenon', 'storm',
     'Banded iron formations (2-3 billion years old) record the Great Oxygenation Event: dissolved iron periodically precipitated into alternating layers as photosynthetic organisms pulsed oxygen.'),
    (2, 5, 2, 2, 'Subsidence Crush',
     'The ground collapses inward as underground voids give way. All units pulled toward center; structures destroyed. Leaves a sinkhole rich in exposed ore.',
     'phenomenon', 'storm',
     'Mine subsidence occurs when excavated underground voids catastrophically collapse. Real sinkholes above abandoned mines have consumed entire town blocks.'),

    # === Earth + Plant (2:2) ===
    (2, 6, 2, 2, 'Carboniferous Overgrowth',
     'The board erupts into an ancient swamp-forest. Empty spaces sprout obstacles; non-Plant units lose movement. When the storm ends, plant terrain converts into coal seam resource nodes.',
     'phenomenon', 'storm',
     'The Carboniferous period: 35% oxygen, continent-spanning forests, fungi could not decompose wood. Dead trees piled up for millions of years, compressed into coal deposits.'),
    (2, 6, 2, 2, 'Mycelial Uprising',
     'A vast underground fungal network erupts across the board. Allied Plant units share healing through the network; enemies are drained. Earth units gain stealth in churned soil.',
     'phenomenon', 'storm',
     'Mycorrhizal networks ("Wood Wide Web") connect up to 90% of land plants through fungal hyphae. A single honey fungus in Oregon covers 2,385 acres — the largest living organism.'),
    (2, 6, 2, 2, 'Peat Bog Awakening',
     'The battlefield saturates into deep acidic peat bog. Non-Plant/Earth units lose movement; units caught in it are preserved (removed but recoverable). Plant units gain regeneration.',
     'phenomenon', 'storm',
     'Peat bogs: waterlogged, acidic, oxygen-poor conditions mean plant matter accumulates faster than it decays. Bog bodies thousands of years old found intact.'),

    # === Earth + Ice (1:2) ===
    (2, 7, 1, 2, 'Pingo',
     'A mound of ice-cored earth erupts beneath a target, launching them upward. Remains as elevated terrain granting height advantage, but collapses after set turns.',
     'phenomenon', 'spell',
     'Pingos are mounds of earth-covered ice in Arctic regions, formed when hydrostatic pressure forces groundwater through permafrost where it freezes and expands, heaving soil up to 70m.'),
    (2, 7, 1, 2, 'Cryoturbation',
     'Freeze-thaw cycles violently churn the ground. All units in the area are randomly repositioned; structures and traps are destroyed. Leaves patterned ground slowing movement.',
     'phenomenon', 'spell',
     'Cryoturbation: repeated freezing and thawing heaves rocks and sediment, producing eerily geometric patterned ground — sorted stone circles and polygons from pure ice physics.'),
    (2, 7, 1, 2, 'Glacial Erratic',
     'Drop an enormous glacier-carried boulder on a target zone. Heavy single-target damage plus impassable terrain. Can be shattered by Fire, but otherwise permanently blocks the path.',
     'material', 'spell',
     'Glacial erratics are boulders transported by glaciers and deposited far from their origin. The Okotoks Erratic weighs 16,500 tonnes, carried hundreds of kilometers by ice sheets.'),

    # === Earth + Ice (2:2) ===
    (2, 7, 2, 2, 'Ice Age',
     'Ice sheets advance from board edges over multiple turns, grinding everything in their path. Permanently reshapes the board — carved valleys, deposited moraines, scattered erratics.',
     'phenomenon', 'storm',
     'Continental ice sheets kilometers thick carve fjords, gouge the Great Lakes, deposit Long Island, flatten mountains, and reroute rivers.'),
    (2, 7, 2, 2, 'Jökulhlaup',
     'A catastrophic glacial outburst flood — a wave of ice, rock, and debris surges across the battlefield, dealing massive damage and sweeping units backward.',
     'phenomenon', 'storm',
     'Jökulhlaup ("glacier run"): sudden release of water trapped beneath a glacier, often triggered by subglacial volcanism. Can discharge 50,000 cubic meters per second.'),
    (2, 7, 2, 2, 'Snowball Earth',
     'The board freezes from outside in, each turn another ring of tiles. Non-Ice/Earth units take attrition on frozen tiles. Only ends when enough Fire/Electric damage is dealt.',
     'phenomenon', 'storm',
     'Snowball Earth: the planet froze over entirely at least twice (~717 and 635 Mya), ice reaching the equator. Ended only when volcanic CO2 buildup triggered runaway greenhouse.'),

    # === Earth + Electric (2:2) ===
    (2, 8, 2, 2, 'Telluric Storm',
     'Massive electric currents surge through the ground. Every grounded unit takes periodic shock damage; only flying units are safe. Metal-types take double.',
     'phenomenon', 'storm',
     "Telluric currents flow through Earth's crust, induced by geomagnetic variations. The 1989 geomagnetic storm induced currents that blacked out Quebec for 9 hours."),
    (2, 8, 2, 2, 'Magnetic Pole Reversal',
     "Earth's magnetic field destabilizes and flips. Positional effects are reversed — buffs become debuffs. Movement commands have a chance to go in unintended directions.",
     'phenomenon', 'storm',
     'Geomagnetic reversals happen every ~200,000-300,000 years. During reversal, the field weakens to ~10% and becomes chaotic with multiple wandering temporary poles.'),
    (2, 8, 2, 2, 'Volcanic Lightning Tempest',
     'A massive eruption column generates its own lightning. Board divides into shifting ash zones (Earth damage) and lightning zones (Electric strikes). Overlap zones deal both.',
     'phenomenon', 'storm',
     'Volcanic lightning occurs when ash particles collide and generate static charge. Documented during 2010 Eyjafjallajokull and 2022 Hunga Tonga eruptions.'),

    # === Water + Metal (2:2) ===
    (3, 5, 2, 2, 'Deep Sea Vent',
     'Superheated mineral-laden water erupts, spewing dissolved metals and toxic compounds. Damages all creatures but spawns resource nodes — survival yields mineral buffs.',
     'phenomenon', 'storm',
     "Hydrothermal vents at mid-ocean ridges blast 300-400C water saturated with dissolved iron, copper, zinc, and sulfides. These black smokers created Earth's first chemosynthetic ecosystems."),
    (3, 5, 2, 2, 'Mercury Deluge',
     'A torrent of liquid metal and water floods the field, coating everything in heavy toxic amalgam. Slows all units and poisons organic types; metal-aligned units absorb and gain armor.',
     'phenomenon', 'storm',
     'Mercury is the only metal liquid at room temperature and readily forms amalgams. Mercury contamination in waterways bioaccumulates catastrophically.'),
    (3, 5, 2, 2, 'Electroplating Surge',
     'A massive electrochemical wave deposits a thin metal shell onto every unit. Grants temporary armor but freezes current state — cannot be buffed or healed while plated.',
     'phenomenon', 'storm',
     'Electroplating uses metal salts dissolved in water and electric current to deposit uniform metal coatings — protection that also locks things in place.'),

    # === Water + Plant (2:2) ===
    (3, 6, 2, 2, 'Mangrove Tide',
     'Rising waters and explosive root growth transform the battlefield into a tangled swamp. Difficult terrain everywhere; concealment for small units; heals plant-aligned units.',
     'phenomenon', 'storm',
     'Mangrove forests exist at the exact interface of water and plant life. Their prop root systems stabilize coastlines, filter water, and create entire ecosystems.'),
    (3, 6, 2, 2, 'Red Tide',
     'An explosive toxic algal bloom overtakes the field. Poisons all non-plant units each turn; creates a spreading dead zone of depleted oxygen. Plant units thrive.',
     'phenomenon', 'storm',
     'Harmful algal blooms occur when excess nutrients fuel explosive dinoflagellate growth, producing neurotoxins and creating hypoxic dead zones.'),
    (3, 6, 2, 2, 'Deluge Garden',
     'A monsoon-fed explosion of aquatic vegetation carpets the board. Water terrain becomes plant terrain; movement restricted but healing available everywhere.',
     'phenomenon', 'storm',
     'Water hyacinth doubles biomass in 12 days. Flood-pulse ecosystems in the Amazon and Mekong see explosive aquatic plant growth during monsoon seasons.'),

    # === Air + Metal (2:2) ===
    (4, 5, 2, 2, 'Shrapnel Gale',
     'A howling cyclone of wind and torn metal fragments. Deals escalating damage each turn as wind accelerates shrapnel. Light/unarmored units take extra damage.',
     'phenomenon', 'storm',
     'Wind-driven debris is the primary killer in tornadoes. At sufficient wind speeds, small metal fragments carry enormous kinetic energy.'),
    (4, 5, 2, 2, 'Magnetic Storm',
     'A geomagnetic disturbance disrupts all equipment and artifacts. Metal-type abilities are scrambled or reversed. Electric-types gain bonus power from induced currents.',
     'phenomenon', 'storm',
     "Geomagnetic storms from solar wind interacting with Earth's metallic core. The 1989 Quebec blackout: air meeting metal at planetary scale."),
    (4, 5, 2, 2, 'Wind Chime Cacophony',
     'Every metal surface resonates and sings as amplified winds find harmonic frequencies. All units lose accuracy; metal/air units ride the harmonics for enhanced movement.',
     'phenomenon', 'storm',
     'Aeolian vibration: wind causes metal structures to oscillate at natural frequencies. Tacoma Narrows Bridge — sustained wind at the right frequency drove steel into resonant destruction.'),

    # === Air + Ice (2:1) ===
    (4, 7, 2, 1, 'Wind Chill',
     'A biting relentless wind strips heat from everything. Progressively debuffs enemies — reducing attack and speed as core temperature drops. Stacks until nearly frozen.',
     'effect', 'spell',
     'Wind chill: moving air accelerates convective heat loss. At -20C with 60 km/h winds, exposed skin gets frostbite in under 5 minutes.'),
    (4, 7, 2, 1, 'Freezing Fog',
     'Dense icy fog deposits rime ice on all surfaces. Reduces visibility and spell range; makes terrain treacherous. Stationary units accumulate ice and become encumbered.',
     'phenomenon', 'spell',
     'Freezing fog (pogonip): supercooled water droplets freeze on contact, creating rime ice. One of the most dangerous weather phenomena for aviation.'),
    (4, 7, 2, 1, 'Sublimation Veil',
     'A rush of dry wind transforms ice directly into concealing vapor, skipping liquid. Removes ice barriers but creates thick obscuring mist — converts defenses into cover.',
     'phenomenon', 'spell',
     'Sublimation: phase transition from solid to gas. Chinook winds can sublimate a foot of snow in hours, even below freezing.'),

    # === Air + Electric (1:2) ===
    (4, 8, 1, 2, 'Static Buildup',
     'Electric charge saturates the air, clinging to every unit. The next contact between any units discharges in a painful arc — turns every interaction into a risk.',
     'effect', 'spell',
     'Triboelectric charging: materials exchange electrons through contact in dry air. Charge accumulates invisibly until a ground path appears.'),
    (4, 8, 1, 2, 'Aurora',
     'A shimmering curtain of light descends, beautiful and disorienting. Scrambles targeting for ranged attacks but energizes all units, granting bonus action points.',
     'phenomenon', 'spell',
     "Auroras occur when charged solar particles are guided by Earth's magnetic field into the upper atmosphere, exciting nitrogen and oxygen into emitting photons."),
    (4, 8, 1, 2, 'Corona Discharge',
     'Crackling blue-white plasma dances across raised objects. Enhances the next electric spell cast (bonus damage/range) and reveals all hidden or stealthed units.',
     'phenomenon', 'spell',
     'Corona discharge: ionization of air in a strong electric field, seen on ship masts and aircraft wings during storms.'),

    # === Metal + Plant (2:2) ===
    (5, 6, 2, 2, 'Biomineralization',
     'Living things calcify and harden; organic structures become encrusted with mineral deposits. All units gain defense but lose speed.',
     'phenomenon', 'storm',
     'Biomineralization: organisms produce minerals — shells, bones, teeth, coral reefs. Biology becoming geology.'),
    (5, 6, 2, 2, 'Phytomining Bloom',
     'Hyperaccumulator vegetation rips metal from the earth into living tissue. Metal units are weakened; Plant units become metallic and armored.',
     'phenomenon', 'storm',
     'Phytomining uses hyperaccumulator plants that absorb extraordinary metal concentrations — nickel, gold, zinc — at thousands of times normal. Literal alchemy through biology.'),
    (5, 6, 2, 2, 'Iron Forest',
     'An ancient forest surges up with ironwood trunks and ore-veined roots. Creates heavily armored, slowly regenerating cover that blocks movement and projectiles.',
     'phenomenon', 'storm',
     'Ironwood trees produce wood denser than water. Petrified forests show mineral replacement preserving wood in stone. The Great Oxygenation Event rusted dissolved iron from oceans.'),

    # === Metal + Ice (2:1) ===
    (5, 7, 2, 1, 'Tempered Edge',
     'Flash-freeze a superheated metal surface, locking crystal structure into maximum hardness. Dramatically increases next attack damage or grants armor-piercing.',
     'effect', 'spell',
     'Quenching/tempering: plunging hot steel into cold locks carbon atoms in martensite — extreme hardness.'),
    (5, 7, 2, 1, 'Shatter Point',
     'Cool a metallic target past its ductile-to-brittle transition, then strike. Armor and defensive buffs are destroyed — what was flexible becomes rigid and fragile.',
     'effect', 'spell',
     "Ductile-to-brittle transition: below a critical temperature, metals that normally bend instead shatter. Caused catastrophic Liberty Ship failures in WWII and Titanic's hull rivet failure."),
    (5, 7, 2, 1, 'Permafrost Anvil',
     'Conjure a zone of deep-frozen metal ground — an unyielding surface reflecting kinetic energy. Units take reduced physical damage but cannot move or manipulate terrain.',
     'material', 'spell',
     'Frozen ground behaves like concrete. Pykrete (ice-sawdust composite) is stronger than pure ice. Soviet WWII defenses used frozen earth as fortification.'),

    # === Metal + Electric (2:2) ===
    (5, 8, 2, 2, 'Electromagnetic Pulse',
     'A massive discharge magnetizes and overloads every metallic object. Equipment buffs stripped, Metal units stunned, lingering field disrupts future equipment plays.',
     'phenomenon', 'storm',
     'EMPs induce current in conductors, overloading circuits. Starfish Prime (1962) and the Carrington Event demonstrated civilization-scale destructive potential.'),
    (5, 8, 2, 2, 'Galvanic Corrosion Storm',
     'Electrified rain on mixed metals — everything dissolves. Damage-over-time to all, devastating to Metal-types and equipped units. Leaves corroded hazardous terrain.',
     'phenomenon', 'storm',
     'Galvanic corrosion: dissimilar metals in electrolyte form a spontaneous electrochemical cell. One metal sacrificially corrodes.'),
    (5, 8, 2, 2, 'Tesla Storm',
     'Towering metal structures appear and attract massive electrical discharges. Lightning arcs between them in deadly chains. Metal units near structures take dramatically more hits.',
     'phenomenon', 'storm',
     "Named for Tesla's Colorado Springs experiments generating artificial lightning. Grounded in lightning preference for tall conductive structures."),

    # === Plant + Electric (2:2) ===
    (6, 8, 2, 2, 'Nerve Garden',
     'Bioelectric vegetation erupts across the board, forming a living neural network. All units become connected — damage and buffs partially propagate to adjacent units.',
     'phenomenon', 'storm',
     'Plants have real electrical signaling: Venus flytraps use action potentials, trees communicate stress through mycorrhizal networks, Mimosa pudica folds via electrical propagation.'),
    (6, 8, 2, 2, 'Bioluminescent Canopy',
     'A glowing forest-storm surges upward, every surface alive with crackling light. Concealment for ground units; electrical discharge punishes aerial bypass.',
     'phenomenon', 'storm',
     'Bioluminescence via luciferin-luciferase reaction in fireflies, dinoflagellates, and fungi. Often triggered by electrical stimulation.'),
    (6, 8, 2, 2, 'Sporestorm',
     'Electrified spore clouds billow across the battlefield. Spores attach to all units; each electrical pulse triggers rapid growth that entangles and slows.',
     'phenomenon', 'storm',
     'Mushroom spores carry electrical charges aiding dispersal. Lightning strikes trigger massive fungal fruiting — confirmed by modern research showing up to 100% yield increase.'),

    # === Ice + Electric (2:1) ===
    (7, 8, 2, 1, 'Frost Lock',
     'Encases target in ice threaded with sustained electrical charge — paralyzes and silences. The current prevents muscle contractions that might allow breaking free.',
     'effect', 'spell',
     'Impure ice conducts electricity. Cold plus electrical disruption is a complete shutdown of biological signaling.'),
    (7, 8, 2, 1, 'Static Freeze',
     'Drain all kinetic energy and electrical potential from a zone. Units inside cannot act but also cannot be targeted — everything pauses in absolute stillness.',
     'phenomenon', 'spell',
     'Approaching absolute zero, molecular motion stops and electrical resistance drops to zero. Superconductivity emerges at cryogenic temperatures.'),
    (7, 8, 2, 1, 'Glacial Piezo',
     'Compress ice until it generates electrical discharge, then use that energy to flash-freeze a wider area. Two-phase: electric damage to target, then area freeze.',
     'phenomenon', 'spell',
     'Ice exhibits piezoelectric-like properties — mechanical stress generates charge separation. One proposed mechanism for how thunderstorm lightning forms.'),

    # === Metal + Metal (2:2) ===
    (5, 5, 2, 2, 'Crucible',
     'The battlefield becomes a smelter. All metal liquefies then re-solidifies in new configuration. Equipment redistributed; Metal units reforged with shuffled stats.',
     'spell', 'spell',
     'The crucible is the foundational tool of metallurgy — where ore becomes metal, impurities burn away, and alloys are born.'),
    (5, 5, 2, 2, 'Resonance Cascade',
     'Every metallic object vibrates at its resonant frequency — a rising harmonic shriek that shatters and reforms. Destroys constructs and equipment, generates Metal tokens.',
     'spell', 'spell',
     'Every solid has a natural resonant frequency. Apply vibration at that frequency and amplitude builds catastrophically (Tacoma Narrows).'),

    # === Plant + Plant (2:2) ===
    (6, 6, 2, 2, 'Overgrowth',
     'Unchecked biological growth consumes the battlefield. Every empty space fills with vegetation. Movement costs double for non-Plant units.',
     'spell', 'spell',
     'Ecological succession at hyperspeed. Tropical rainforests consume abandoned structures within years. The Carboniferous saw plants take over the planet.'),
    (6, 6, 2, 2, 'Bloom Tide',
     'Massive algal/fungal/pollen bloom thickens the air and coats all surfaces. Non-Plant units suffer reduced accuracy and poison. Plant units gain regeneration.',
     'spell', 'spell',
     'Algal blooms produce toxins and deplete oxygen. Pollen storms blanket regions. Photosynthetic life without predators buries everything else.'),

    # === Ice + Ice (2:2) ===
    (7, 7, 2, 2, 'Absolute Zero',
     'A sphere of impossible cold expands — the cessation of all molecular motion. ALL units frozen for one turn, then the storm shatters, dealing damage based on buff complexity.',
     'spell', 'spell',
     'Absolute zero (0K): all thermal motion ceases. Near-absolute-zero matter enters exotic states — Bose-Einstein condensates, superfluids.'),
    (7, 7, 2, 2, 'Glaciation',
     'Temperature plummets across the board. Each turn the effect deepens: movement slows, then attack drops, then abilities cost more, then units take damage. Only fire ends it.',
     'spell', 'spell',
     'Ice ages driven by Milankovitch cycles, volcanic winter, and ice-albedo feedback. Snowball Earth froze the entire planet to the equator.'),

    # === Electric + Electric (2:2) ===
    (8, 8, 2, 2, 'Chain Lightning',
     'A massive bolt splits and forks, striking every unit. More units on board means more devastating. Damage increases with each jump as cascade builds.',
     'spell', 'spell',
     'Lightning forks through stepped leaders. Cascade failure in power grids: 2003 Northeast Blackout cascaded from one Ohio line to 55 million people.'),
    (8, 8, 2, 2, 'Thunderclap',
     'The full force of electrical discharge at maximum amplitude. A shockwave deals damage in rings from center. All units silenced for one turn.',
     'spell', 'spell',
     'Thunder: sonic boom from lightning superheating air to 30,000K in microseconds. Close-range thunder exceeds 120 decibels.'),
]

for e in entries:
    cursor.execute('''
        INSERT INTO type_combination_design
        (type_a_id, type_b_id, type_a_amount, type_b_amount, name, description, nature, mechanic, process, is_selected)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ''', e)

conn.commit()

cursor.execute('SELECT COUNT(*) FROM type_combination_design')
after = cursor.fetchone()[0]
print(f'Rows before: {before}')
print(f'Rows after:  {after}')
print(f'Inserted:    {after - before} new entries')

conn.close()
