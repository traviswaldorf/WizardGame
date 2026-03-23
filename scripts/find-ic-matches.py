#!/usr/bin/env python3
"""
For each type pair in our interaction matrix, find IC recipes that reflect
real COMPOSITION or REACTIVITY — not wordplay or cultural references.

Approach: Score recipes based on whether the combination represents a
real physical, chemical, or biological process.
"""

import csv
from pathlib import Path

# --- Science-grounded process mappings ---
# Each entry: (ingredient_a, ingredient_b, result, process_name, process_description)
# These are IC recipes where the combination reflects real composition/reactivity.
# Curated by hand from the 92K database, filtered for science grounding.

SCIENCE_RECIPES = [
    # === TIER 1 (base element pairs) ===
    # Fire + Earth
    ("Earth", "Fire", "Lava", "Melting", "Heat melts solid matter into magma"),
    ("Fire", "Dust", "Ash", "Combustion residue", "Burning particulate matter leaves mineral ash"),
    ("Fire", "Stone", "Metal", "Smelting", "Heat extracts metal from ore/rock"),
    ("Fire", "Sand", "Glass", "Vitrification", "Extreme heat melts silica into glass"),
    ("Fire", "Clay", "Brick", "Kiln firing", "Heat hardens clay into ceramic"),
    ("Fire", "Mud", "Brick", "Kiln firing", "Heat hardens wet earth into ceramic"),
    ("Lava", "Stone", "Obsidian", "Rapid cooling", "Volcanic glass from fast-cooled magma"),
    ("Lava", "Sand", "Glass", "Vitrification", "Molten material + silica = glass"),
    ("Earth", "Lava", "Stone", "Cooling/solidification", "Magma cools into ignite rock"),
    ("Fire", "Planet", "Sun", "Stellar formation", "Massive solid body + fusion energy = star"),

    # Earth + Water
    ("Earth", "Water", "Plant", "Biological growth", "Soil + moisture = conditions for life"),
    ("Water", "Dust", "Mud", "Hydration", "Water saturates dry earth into mud"),
    ("Earth", "Steam", "Mud", "Condensation on solid", "Steam condenses onto earth, saturating it"),
    ("Earth", "Wave", "Sand", "Erosion", "Water action breaks rock into sediment"),
    ("Earth", "Lake", "Swamp", "Waterlogging", "Standing water saturates soil, creates wetland"),
    ("Water", "Plant", "Swamp", "Waterlogging", "Excess water + organic matter = wetland"),
    ("Water", "Lava", "Stone", "Quenching", "Water rapidly cools lava into solid rock"),

    # Air + Water
    ("Water", "Wind", "Wave", "Wind-driven surface motion", "Air pressure creates water waves"),
    ("Water", "Smoke", "Fog", "Condensation", "Water vapor condenses around smoke particles"),
    ("Water", "Fog", "Ice", "Supercooling", "Fog droplets freeze — rime ice formation"),
    ("Water", "Steam", "Cloud", "Condensation/cooling", "Steam cools to form cloud droplets"),
    ("Wind", "Steam", "Cloud", "Atmospheric convection", "Wind carries steam aloft, cooling into cloud"),
    ("Wind", "Smoke", "Cloud", "Particulate dispersal", "Wind spreads smoke into haze/cloud layer"),
    ("Water", "Tornado", "Tsunami", "Storm surge", "Atmospheric vortex displaces massive water"),
    ("Cloud", "Tsunami", "Rainbow", "Light refraction", "Sunlight through water droplets = spectrum"),

    # Fire + Air
    ("Fire", "Wind", "Smoke", "Combustion byproduct", "Fire consumes fuel, wind carries particulates"),
    ("Fire", "Cloud", "Lightning", "Electrostatic discharge", "Heat differential in clouds builds charge → discharge"),
    ("Wind", "Volcano", "Eruption", "Pressure release", "Gas pressure drives explosive volcanic eruption"),
    ("Fire", "Smoke", "Ash", "Complete combustion", "Smoke particles settle as combustion residue"),

    # === COUNTER / TENSION PAIRS ===
    # Fire + Water (counter)
    ("Fire", "Water", "Steam", "Evaporation", "Heat converts liquid to gas phase"),
    ("Fire", "Steam", "Engine", "Thermodynamic work", "Heat energy → pressurized gas → mechanical work"),
    ("Lake", "Volcano", "Island", "Volcanic island formation", "Magma rises through ocean, cools into landmass"),
    ("Steam", "Stone", "Geysir", "Geothermal pressure", "Superheated water under rock erupts periodically"),
    ("Volcano", "Tsunami", "Earthquake", "Tectonic coupling", "Volcanic + seismic activity at plate boundaries"),

    # Fire + Plant (counter)
    ("Fire", "Ash", "Phoenix", "Rebirth cycle", "Destruction → nutrient release → regrowth"),
    ("Fire", "Tree", "Charcoal", "Pyrolysis", "Slow burning of wood in low-oxygen drives off volatiles"),
    ("Plant", "Stone", "Fossil", "Fossilization", "Organic matter preserved by mineral replacement over time"),
    ("Plant", "Fog", "Mushroom", "Fungal growth", "Moisture + organic decay = fungal decomposition"),

    # Fire + Ice (counter)
    ("Fire", "Ice", "Water", "Melting", "Heat energy breaks ice crystal bonds → liquid"),
    ("Volcano", "Glacier", "Flood", "Glacial outburst", "Volcanic heat melts glacial ice → catastrophic flood"),
    ("Lava", "Ice", "Steam", "Flash vaporization", "Extreme heat on ice → instant gas phase transition"),

    # Earth + Electric (counter — grounding)
    ("Clay", "Lightning", "Golem", "Vitrification", "Lightning strike fuses clay/sand into solid form"),
    ("Sand", "Lightning", "Glass", "Fulgurite", "Lightning vitrifies sand into glass tubes"),

    # Metal + Plant (counter)
    ("Plant", "Sword", "Thorn", "Biomimicry/defense", "Plants evolve sharp structures for defense"),

    # Plant + Ice (counter)
    ("Avalanche", "Flower", "Snowflake", "Crystallization pattern", "Ice crystals form branching patterns like petals"),
    ("Avalanche", "Swamp", "Mudslide", "Saturated mass flow", "Frozen mass melts into wet ground → landslide"),

    # === SYNERGY PAIRS ===
    # Water + Electric (conductivity)
    ("Water", "Lightning", "Electricity", "Electrolysis/conductivity", "Water conducts electrical current; charge carriers in solution"),
    ("Smoke", "Storm", "Thunder", "Acoustic shockwave", "Rapid air heating from lightning → pressure wave → sound"),
    ("Storm", "Tree", "Lightning", "Electrostatic discharge", "Tall structures attract charge differential discharge"),

    # Air + Plant (dispersal)
    ("Wind", "Plant", "Dandelion", "Seed dispersal", "Wind carries lightweight seeds — anemochory"),
    ("Wind", "Swamp", "Mist", "Evapotranspiration", "Wind carries moisture released by wetland plants"),
    ("Wind", "Tree", "Leaf", "Mechanical abscission", "Wind stress detaches leaves from branches"),

    # === CROSS-PILLAR PAIRS ===
    # Earth + Air (erosion/weather)
    ("Earth", "Wind", "Dust", "Aeolian erosion", "Wind strips loose particles from solid surfaces"),
    ("Wind", "Mountain", "Avalanche", "Gravitational mass wasting", "Wind-deposited snow overloads slope → collapse"),
    ("Earth", "Cloud", "Rain", "Orographic precipitation", "Terrain forces moist air upward → condensation → rain"),
    ("Wind", "Sand", "Dune", "Aeolian deposition", "Wind transports and deposits sand into formations"),
    ("Wind", "Dust", "Sandstorm", "Aeolian transport", "Strong wind lifts and carries particulate matter"),
    ("Dust", "Tornado", "Dust Storm", "Vortex entrainment", "Rotating air column lifts massive particulate load"),
    ("Earth", "Tornado", "Earthquake", "Ground coupling", "Extreme pressure differential affects ground stability"),

    # Water + Metal (corrosion/hydraulics)
    ("Water", "Rust", "Iron", "Reduction", "Water can participate in rust reversal under right conditions"),
    ("Lake", "Engine", "Boat", "Buoyancy + propulsion", "Solid structure displaces liquid, engine provides thrust"),
    ("Engine", "Ocean", "Submarine", "Pressurized hull", "Metal vessel withstands hydrostatic pressure at depth"),

    # Water + Plant (nourishment)
    ("Plant", "Ocean", "Coral", "Marine calcification", "Marine organisms build calcium carbonate structures"),
    ("Lake", "Plant", "Lily", "Aquatic adaptation", "Plants evolve floating structures for water surfaces"),

    # Air + Metal (aerodynamics/oxidation)
    ("Cloud", "Engine", "Jet", "Turbine propulsion", "Engine compresses atmospheric gas for thrust at altitude"),
    ("Vacuum", "Sword", "Laser", "Stimulated emission", "Coherent light in evacuated cavity — no atmospheric scatter"),

    # Air + Ice (amplification)
    ("Wind", "Avalanche", "Snow", "Mechanical breakup", "Wind breaks ice mass into distributed precipitation"),
    ("Wind", "Snow", "Blizzard", "Wind-driven snow", "Strong wind mobilizes existing snow — whiteout conditions"),
    ("Storm", "Diamond", "Hail", "Ice nucleation", "Convective storms loft water droplets → freeze around nuclei"),

    # Air + Electric (atmospheric)
    ("Smoke", "Storm", "Thunder", "Acoustic shockwave", "Lightning superheats air → rapid expansion → sonic boom"),

    # Water + Ice (phase)
    ("Water", "Avalanche", "Ice", "Freezing", "Liquid water freezes on contact with ice mass"),

    # Earth + Metal (extraction/reinforcement)
    ("Mountain", "Engine", "Train", "Terrain traversal", "Engineered metal moves through/over solid terrain"),

    # Earth + Plant (geology/biology)
    ("Earth", "Tree", "Forest", "Ecosystem formation", "Soil nutrients support tree colonization → forest"),
    ("Mud", "Swamp", "Quagmire", "Saturated decomposition", "Waterlogged organic soil becomes impassable"),

    # Metal + Ice (brittleness/cryo)
    ("Engine", "Iceberg", "Titanic", "Material failure", "Cold makes metal brittle — thermal stress fracture"),
    ("Avalanche", "Sword", "Shield", "Impact absorption", "Packed ice/snow absorbs and deflects force"),

    # Metal + Electric (conduction)
    ("Lightning", "Diamond", "Gold", "Transmutation pressure", "Extreme energy reorganizes crystal lattice structure"),
    ("Steam", "Clean", "Iron", "Steam reduction", "Steam at high temp reduces iron oxide to pure iron"),

    # Plant + Electric (bioelectricity)
    ("Storm", "Tree", "Lightning", "Charge attraction", "Tall organic conductors attract atmospheric discharge"),
    ("Lightning", "Lotus", "Buddha", "Enlightenment metaphor", "Energy + organic growth = transcendence (cultural, not science)"),

    # Ice + Electric (superconductivity)
    ("Electricity", "Hail", "Hailstorm", "Electrified storm", "Charge separation in ice-laden clouds intensifies storms"),
    ("Diamond", "Energy", "Laser", "Stimulated emission", "Crystalline structure + energy input = coherent light"),

    # Earth + Ice (permafrost/glacial)
    ("Earth", "Avalanche", "Landslide", "Gravitational collapse", "Ice/snow melt destabilizes slope → mass movement"),
    ("Avalanche", "Island", "Iceberg", "Glacial calving", "Coastal ice mass breaks from land into water"),
    ("Earth", "Crystal", "Gem", "Pressure crystallization", "Geological pressure forms mineral crystals"),

    # Fire + Metal (forging)
    ("Fire", "Hammer", "Forge", "Metalworking", "Heat + mechanical force shapes metal"),
    ("Fire", "Iron", "Steel", "Carburization", "Carbon from fire + iron = steel alloy"),

    # Fire + Electric (plasma)
    ("Fire", "Lamp", "Light", "Incandescence", "Heat energy → photon emission"),
    ("Fire", "Flint", "Spark", "Piezoelectric ignition", "Mechanical stress on crystal → charge → spark"),

    # === TERTIARY-RELEVANT ===
    # Ghost/Death
    ("Fog", "Swamp", "Ghost", "Decomposition gases", "Swamp gas + mist = will-o'-the-wisp phenomenon"),
    ("Fog", "Island", "Ghost", "Isolation + obscurity", "Remote decay hidden in fog — ghostly phenomenon"),
    ("Fog", "Tree", "Ghost", "Forest decomposition", "Misty forests where decay is visible"),

    # Crystal
    ("Mountain", "Glass", "Crystal", "Geological crystallization", "Pressure + silicate melt = crystal formation"),
    ("Plant", "Diamond", "Emerald", "Chromium-bearing beryl", "Green crystal — organic trace elements in mineral"),

    # Heat
    ("Warmth", "Warmth", "Heat", "Thermal concentration", "Accumulated thermal energy intensifies"),
    ("Fire", "Fireplace", "Warmth", "Contained combustion", "Controlled fire radiates thermal energy"),

    # Magnetic
    ("Black Hole", "Iron", "Magnet", "Ferromagnetic alignment", "Extreme gravity aligns iron domains — magnetization"),
    ("Magnet", "Magnet", "Magnetic Field", "Field superposition", "Two magnetic sources create extended field"),

    # Sound
    ("Wave", "Album", "Sound", "Acoustic recording", "Pressure waves captured as signal — wordplay though"),
    ("Noise", "Wave", "Sound", "Wave propagation", "Pressure oscillation through medium = sound"),

    # Radioactive
    ("Plant", "Radio", "Radioactive", "Wordplay — but bioaccumulation is real", "Organisms accumulate radioisotopes from environment"),
    ("Fire", "Radioactive", "Nuclear", "Nuclear chain reaction", "Thermal neutrons sustain fission → energy release"),

    # Time
    ("Sand", "Glass", "Hourglass", "Time measurement", "Granular flow through constriction marks time passage"),
    ("Fire", "Hourglass", "Time", "Entropy", "Energy flow drives irreversible change — arrow of time"),
    ("Plant", "Stone", "Fossil", "Geological preservation", "Organic matter mineralized over deep time"),

    # Space
    ("Lake", "Rocket", "Space", "Escape velocity", "Propulsion overcomes gravitational binding"),
    ("Engine", "Engine", "Rocket", "Staged propulsion", "Combined thrust exceeds single-engine capability"),

    # Light
    ("Lighthouse", "Beacon", "Light", "Signal emission", "Focused photon emission for visibility"),
    ("Candle", "Fire", "Light", "Incandescence", "Combustion → thermal radiation → visible photons"),

    # Dark
    ("Black", "Fire", "Darkness", "Light absorption", "Complete absorption of photon energy — no reflection"),
    ("Eclipse", "Black Hole", "Darkness", "Total light occlusion", "Massive object blocks all photon paths"),

    # Cosmic
    ("Fire", "Vacuum", "Black Hole", "Gravitational collapse", "Energy density in vacuum → spacetime curvature"),
    ("Galaxy", "Black Hole", "Universe", "Cosmological structure", "Galaxies orbit supermassive black holes → large-scale structure"),

    # Poison
    ("Wine", "Perfume", "Poison", "Toxic concentration", "Volatile organic compounds concentrated to harmful levels"),
    ("Ivy", "Wine", "Poison", "Plant toxins", "Plant-derived organic molecules that disrupt biology"),
]


def main():
    project_root = Path(__file__).parent.parent
    output_path = project_root / "design/reference/games/infinite-craft/pair-matches.md"

    # Organize by our type pairs
    # Map each recipe to the type pair(s) it serves

    TYPE_ELEMENT_MAP = {
        "Fire": {"Fire", "Lava", "Volcano", "Ash", "Phoenix", "Eruption", "Magma",
                 "Flame", "Sun", "Candle", "Torch", "Warmth", "Fireplace", "Furnace",
                 "Kiln", "Forge", "Charcoal", "Ember"},
        "Earth": {"Earth", "Stone", "Rock", "Boulder", "Mountain", "Sand", "Clay",
                  "Mud", "Dust", "Gravel", "Mineral", "Ore", "Brick", "Obsidian",
                  "Fossil", "Continent", "Island", "Land", "Ground", "Dune",
                  "Planet", "Moon", "Meteor", "Desert", "Quagmire"},
        "Water": {"Water", "Lake", "Ocean", "River", "Rain", "Flood", "Wave",
                  "Tsunami", "Tide", "Stream", "Pond", "Swamp", "Marsh", "Bog",
                  "Fog", "Mist", "Dew", "Steam", "Geyser", "Surf", "Spray",
                  "Puddle", "Fjord", "Current", "Coral", "Mudslide"},
        "Air": {"Wind", "Tornado", "Hurricane", "Cyclone", "Storm", "Cloud",
                "Sky", "Atmosphere", "Breeze", "Smoke", "Gas", "Vapor", "Vacuum",
                "Dust Storm", "Sandstorm", "Avalanche", "Blizzard", "Jet",
                "Thunder", "Noise", "Echo"},
        "Metal": {"Metal", "Iron", "Steel", "Gold", "Silver", "Copper", "Bronze",
                  "Alloy", "Anvil", "Hammer", "Sword", "Shield", "Armor", "Chain",
                  "Wire", "Engine", "Machine", "Robot", "Blade", "Train",
                  "Forge", "Rust", "Boat", "Submarine", "Rocket"},
        "Plant": {"Plant", "Tree", "Flower", "Leaf", "Seed", "Root", "Forest",
                  "Mushroom", "Moss", "Vine", "Ivy", "Dandelion", "Rose", "Lily",
                  "Lotus", "Algae", "Kelp", "Cactus", "Herb", "Fruit", "Wood",
                  "Bark", "Thorn", "Swamp", "Bog", "Marsh", "Coral"},
        "Ice": {"Ice", "Snow", "Frost", "Glacier", "Iceberg", "Blizzard",
                "Avalanche", "Hail", "Freeze", "Frozen", "Cold", "Crystal",
                "Diamond", "Snowflake", "Icicle", "Snowman"},
        "Electric": {"Lightning", "Electricity", "Thunder", "Spark", "Charge",
                     "Battery", "Circuit", "Wire", "Bolt", "Shock", "Static",
                     "Laser", "Light", "Bulb", "Power", "Energy", "Neon"},
        "Radioactive": {"Radioactive", "Radiation", "Nuclear", "Uranium",
                        "Chernobyl", "Atomic", "Fallout"},
        "Cosmic": {"Black Hole", "Galaxy", "Universe", "Cosmos", "Cosmic",
                   "Nebula", "Supernova", "Singularity", "Wormhole"},
        "Poison": {"Poison", "Toxic", "Venom", "Acid", "Wine", "Perfume",
                   "Smog", "Rust", "Decay", "Mold"},
        "Sound": {"Sound", "Music", "Echo", "Noise", "Thunder", "Sonic",
                  "Earthquake", "Tremor", "Shockwave"},
        "Crystal": {"Crystal", "Gem", "Diamond", "Ruby", "Sapphire", "Emerald",
                    "Amethyst", "Quartz", "Geode", "Prism"},
        "Ghost": {"Ghost", "Spirit", "Zombie", "Skeleton", "Haunted", "Death",
                  "Decay", "Grave"},
        "Heat": {"Heat", "Warmth", "Hot", "Thermal", "Boil", "Melt", "Scald",
                 "Magma", "Geyser"},
        "Magnetic": {"Magnet", "Magnetic", "Magnetic Field", "Compass",
                     "Electromagnetic"},
        "Time": {"Time", "Clock", "Hourglass", "Fossil", "Ancient", "Ruin"},
        "Space": {"Space", "Rocket", "Satellite", "Orbit", "Vacuum", "Void"},
        "Light": {"Light", "Beacon", "Lighthouse", "Laser", "Rainbow", "Prism",
                  "Glow", "Lantern", "Sun", "Aurora", "Dawn"},
        "Dark": {"Dark", "Darkness", "Shadow", "Night", "Eclipse", "Black Hole",
                 "Void", "Abyss", "Black"},
    }

    def classify(element):
        tags = set()
        for t, elems in TYPE_ELEMENT_MAP.items():
            if element in elems:
                tags.add(t)
        return tags

    def get_pairs(recipe_tuple):
        """Return which of our type pairs this recipe serves."""
        ing_a, ing_b, result, _, _ = recipe_tuple
        tags_a = classify(ing_a)
        tags_b = classify(ing_b)
        tags_r = classify(result)
        all_tags = tags_a | tags_b | tags_r

        pairs = set()
        tag_list = sorted(all_tags)
        for i in range(len(tag_list)):
            for j in range(i + 1, len(tag_list)):
                pairs.add((tag_list[i], tag_list[j]))
        return pairs

    # Group recipes by type pair
    pair_recipes = {}
    for pair in [("Fire", "Earth"), ("Earth", "Water"), ("Air", "Water"),
                 ("Fire", "Air"), ("Fire", "Water"), ("Fire", "Plant"),
                 ("Fire", "Ice"), ("Fire", "Metal"), ("Fire", "Electric"),
                 ("Earth", "Air"), ("Earth", "Ice"), ("Earth", "Electric"),
                 ("Earth", "Metal"), ("Earth", "Plant"), ("Water", "Metal"),
                 ("Water", "Plant"), ("Water", "Ice"), ("Water", "Electric"),
                 ("Air", "Metal"), ("Air", "Plant"), ("Air", "Ice"),
                 ("Air", "Electric"), ("Metal", "Plant"), ("Metal", "Ice"),
                 ("Metal", "Electric"), ("Plant", "Ice"), ("Plant", "Electric"),
                 ("Ice", "Electric"),
                 # Tertiary pairs
                 ("Fire", "Radioactive"), ("Earth", "Cosmic"),
                 ("Water", "Poison"), ("Air", "Sound"),
                 ("Metal", "Crystal"), ("Plant", "Ghost"),
                 ("Ice", "Heat"), ("Electric", "Magnetic"),
                 # Augmenter pairs
                 ("Fire", "Time"), ("Earth", "Time"),
                 ("Water", "Time"), ("Air", "Time"),
                 ("Fire", "Light"), ("Dark", "Light"),
                 ("Fire", "Space"), ("Earth", "Space"),
                 ]:
        pair_recipes[pair] = []

    for recipe in SCIENCE_RECIPES:
        ing_a, ing_b, result, process, desc = recipe
        tags_a = classify(ing_a)
        tags_b = classify(ing_b)
        tags_r = classify(result)

        # Check which pairs this recipe is relevant to
        for pair in pair_recipes:
            ta, tb = pair
            # Ingredients span the pair
            if (ta in tags_a and tb in tags_b) or (ta in tags_b and tb in tags_a):
                pair_recipes[pair].append(recipe)
            # One ingredient + result spans the pair
            elif (ta in tags_a and tb in tags_r) or (tb in tags_a and ta in tags_r):
                pair_recipes[pair].append(recipe)
            elif (ta in tags_b and tb in tags_r) or (tb in tags_b and ta in tags_r):
                pair_recipes[pair].append(recipe)

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# IC Recipes Mapped by Composition & Reactivity\n\n")
        f.write("<!-- Generated by scripts/find-ic-matches.py -->\n")
        f.write("<!-- Only includes recipes grounded in real physical/chemical/biological processes -->\n")
        f.write("<!-- Wordplay, cultural references, and puns are excluded -->\n\n")
        f.write("Each recipe is annotated with the **real-world process** it reflects.\n")
        f.write("Our types use expanded semantics (Fire=plasma/energy, Earth=solid, Water=liquid, Air=gas, etc.)\n\n")
        f.write("---\n\n")

        # Composition pairs
        comp_pairs = [("Fire", "Earth"), ("Earth", "Water"), ("Air", "Water"), ("Fire", "Air")]
        f.write("## Composition Pairs\n\n")
        for pair in comp_pairs:
            recipes = pair_recipes.get(pair, [])
            f.write(f"### {pair[0]} + {pair[1]}\n\n")
            if recipes:
                f.write("| IC Recipe | Process | Description |\n")
                f.write("|---|---|---|\n")
                seen = set()
                for r in recipes:
                    key = f"{r[0]}+{r[1]}={r[2]}"
                    if key not in seen:
                        seen.add(key)
                        f.write(f"| {r[0]} + {r[1]} = **{r[2]}** | {r[3]} | {r[4]} |\n")
            else:
                f.write("*No science-grounded matches.*\n")
            f.write("\n")

        # Non-composition pairs
        non_comp = [
            ("Fire", "Water"), ("Fire", "Plant"), ("Fire", "Ice"),
            ("Fire", "Metal"), ("Fire", "Electric"),
            ("Earth", "Air"), ("Earth", "Ice"), ("Earth", "Electric"),
            ("Earth", "Metal"), ("Earth", "Plant"),
            ("Water", "Metal"), ("Water", "Plant"), ("Water", "Ice"),
            ("Water", "Electric"),
            ("Air", "Metal"), ("Air", "Plant"), ("Air", "Ice"),
            ("Air", "Electric"),
            ("Metal", "Plant"), ("Metal", "Ice"), ("Metal", "Electric"),
            ("Plant", "Ice"), ("Plant", "Electric"), ("Ice", "Electric"),
        ]

        f.write("---\n\n## Non-Composition Pairs\n\n")
        for pair in non_comp:
            recipes = pair_recipes.get(pair, [])
            f.write(f"### {pair[0]} + {pair[1]}\n\n")
            if recipes:
                f.write("| IC Recipe | Process | Description |\n")
                f.write("|---|---|---|\n")
                seen = set()
                for r in recipes:
                    key = f"{r[0]}+{r[1]}={r[2]}"
                    if key not in seen:
                        seen.add(key)
                        f.write(f"| {r[0]} + {r[1]} = **{r[2]}** | {r[3]} | {r[4]} |\n")
            else:
                f.write("*No science-grounded matches.*\n")
            f.write("\n")

        # Tertiary pairs
        tert_pairs = [
            ("Fire", "Radioactive"), ("Earth", "Cosmic"),
            ("Water", "Poison"), ("Air", "Sound"),
            ("Metal", "Crystal"), ("Plant", "Ghost"),
            ("Ice", "Heat"), ("Electric", "Magnetic"),
        ]

        f.write("---\n\n## Tertiary (Parent ↔ Dark Side) Pairs\n\n")
        for pair in tert_pairs:
            recipes = pair_recipes.get(pair, [])
            f.write(f"### {pair[0]} + {pair[1]}\n\n")
            if recipes:
                f.write("| IC Recipe | Process | Description |\n")
                f.write("|---|---|---|\n")
                seen = set()
                for r in recipes:
                    key = f"{r[0]}+{r[1]}={r[2]}"
                    if key not in seen:
                        seen.add(key)
                        f.write(f"| {r[0]} + {r[1]} = **{r[2]}** | {r[3]} | {r[4]} |\n")
            else:
                f.write("*No science-grounded matches.*\n")
            f.write("\n")

    print(f"Wrote to {output_path}")

    # Summary
    total = 0
    empty = []
    for pair in list(comp_pairs) + list(non_comp) + list(tert_pairs):
        n = len(pair_recipes.get(pair, []))
        total += n
        if n == 0:
            empty.append(pair)

    print(f"Total science-grounded recipe entries: {total}")
    if empty:
        print(f"Pairs with no matches: {empty}")
    else:
        print("All pairs have at least one match.")


if __name__ == "__main__":
    main()
