#!/usr/bin/env python3
"""
Parse the Infinite Craft all-recipes markdown file into structured data.

Outputs:
  1. A full TSV database of all recipes (design/reference/games/infinite-craft/all-recipes.tsv)
  2. A curated markdown table of recipes relevant to our type system
     (design/reference/games/infinite-craft/relevant-recipes.md)
"""

import re
import csv
import os
from pathlib import Path

# Our type system elements mapped to Infinite Craft equivalents
RELEVANT_ELEMENTS = {
    # Primary types (states of matter)
    "Fire", "Earth", "Water", "Wind",
    # Secondary types (compositions)
    "Metal", "Plant", "Ice", "Lightning", "Electricity", "Electric",
    # Tertiary types (energy counterparts)
    "Radioactive", "Radiation", "Nuclear",
    "Cosmic", "Cosmos", "Gravity", "Black Hole",
    "Poison", "Toxic", "Acid", "Venom",
    "Sound", "Music", "Echo",
    "Crystal", "Gem", "Diamond",
    "Ghost", "Spirit", "Undead",
    "Heat", "Warmth", "Hot", "Thermal",
    "Magnet", "Magnetic", "Magnetic Field", "Magnetism",
    # Augmenter types
    "Time", "Space", "Light", "Dark", "Darkness", "Shadow",
    # Key intermediates that map to our type compositions
    "Lava", "Steam", "Dust", "Smoke", "Fog", "Cloud",
    "Stone", "Sand", "Glass", "Iron", "Steel",
    "Storm", "Tornado", "Hurricane", "Tsunami", "Avalanche",
    "Swamp", "Tree", "Forest", "Mushroom",
    "Snow", "Glacier", "Blizzard", "Frost",
    "Ash", "Phoenix", "Volcano", "Eruption",
    "Sun", "Moon", "Star", "Planet", "Eclipse",
    "Ocean", "Wave", "Mist",
    "Dragon", "Energy", "Life",
}

# Elements that directly map to our type names
TYPE_DIRECT_MAP = {
    # Primaries
    "Fire": "Fire",
    "Earth": "Earth",
    "Water": "Water",
    "Wind": "Air",
    # Secondaries
    "Metal": "Metal",
    "Plant": "Plant",
    "Ice": "Ice",
    "Lightning": "Electric",
    "Electricity": "Electric",
    # Tertiaries
    "Radioactive": "Radioactive",
    "Radiation": "Radioactive",
    "Nuclear": "Radioactive",
    "Poison": "Poison",
    "Toxic": "Poison",
    "Venom": "Poison",
    "Acid": "Poison",
    "Sound": "Sound",
    "Music": "Sound",
    "Crystal": "Crystal",
    "Gem": "Crystal",
    "Ghost": "Ghost",
    "Spirit": "Ghost",
    "Heat": "Heat",
    "Warmth": "Heat",
    "Hot": "Heat",
    "Magnet": "Magnetic",
    "Magnetic": "Magnetic",
    "Magnetic Field": "Magnetic",
    "Magnetism": "Magnetic",
    "Black Hole": "Cosmic",
    "Gravity": "Cosmic",
    "Cosmic": "Cosmic",
    "Cosmos": "Cosmic",
    # Augmenters
    "Time": "Time",
    "Space": "Space",
    "Light": "Light",
    "Dark": "Dark",
    "Darkness": "Dark",
    "Shadow": "Dark",
}


def parse_recipes(filepath):
    """Parse the markdown recipe file into structured recipe data."""
    recipes = []
    current_tier = 0

    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()

            # Match tier headers
            tier_match = re.match(r'^## Tier (\d+):', line)
            if tier_match:
                current_tier = int(tier_match.group(1))
                continue

            # Match recipe lines: "  1. **Result** <- `A + B`, `C + D`"
            recipe_match = re.match(
                r'^\d+\.\s+\*\*(.+?)\*\*\s+<-\s+(.+)$', line
            )
            if recipe_match:
                result = recipe_match.group(1).strip()
                combos_str = recipe_match.group(2).strip()

                # Parse each combination
                for combo in combos_str.split('`,'):
                    combo = combo.strip().strip('`').strip()
                    if ' + ' in combo:
                        parts = combo.split(' + ', 1)
                        if len(parts) == 2:
                            a = parts[0].strip()
                            b = parts[1].strip()
                            recipes.append({
                                'tier': current_tier,
                                'result': result,
                                'ingredient_a': a,
                                'ingredient_b': b,
                            })

    return recipes


def is_relevant(recipe):
    """Check if a recipe involves any of our relevant elements."""
    return (
        recipe['result'] in RELEVANT_ELEMENTS
        or recipe['ingredient_a'] in RELEVANT_ELEMENTS
        or recipe['ingredient_b'] in RELEVANT_ELEMENTS
    )


def get_type_tag(element):
    """Get our type system tag for an element, if it maps."""
    return TYPE_DIRECT_MAP.get(element, "")


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_dir = project_root / "design" / "reference" / "games" / "infinite-craft"
    input_file = output_dir / "raw-source.md"

    print(f"Parsing {input_file}...")
    recipes = parse_recipes(input_file)
    print(f"Parsed {len(recipes)} total recipe combinations.")

    # --- Write full TSV database ---
    tsv_path = output_dir / "all-recipes.tsv"
    with open(tsv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow([
            'tier', 'ingredient_a', 'ingredient_b', 'result',
            'type_tag_a', 'type_tag_b', 'type_tag_result'
        ])
        for r in recipes:
            writer.writerow([
                r['tier'],
                r['ingredient_a'],
                r['ingredient_b'],
                r['result'],
                get_type_tag(r['ingredient_a']),
                get_type_tag(r['ingredient_b']),
                get_type_tag(r['result']),
            ])
    print(f"Wrote {len(recipes)} recipes to {tsv_path}")

    # --- Write curated relevant recipes markdown ---
    relevant = [r for r in recipes if is_relevant(r)]
    print(f"Found {len(relevant)} relevant recipes.")

    md_path = output_dir / "relevant-recipes.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("# Infinite Craft — Recipes Relevant to Our Type System\n\n")
        f.write("<!-- Generated by scripts/parse-infinite-craft.py -->\n")
        f.write("<!-- Source: https://github.com/kalinuska/infinite-craft-all-recipes -->\n\n")
        f.write("This table contains all Infinite Craft recipes where at least one element\n")
        f.write("maps to our type system (primaries, secondaries, tertiaries, augmenters,\n")
        f.write("or key intermediates like Lava, Steam, Storm, etc.).\n\n")
        f.write("**Our Type Mapping Key:**\n")
        f.write("- Primary: Fire, Earth, Water, Wind→Air\n")
        f.write("- Secondary: Metal (Fire+Earth), Plant (Earth+Water), Ice (Air+Water), Electric (Fire+Air)\n")
        f.write("- Tertiary: Radioactive, Cosmic, Poison, Sound, Crystal, Ghost, Heat, Magnetic\n")
        f.write("- Augmenters: Time, Space, Light, Dark\n\n")

        # Group by tier
        by_tier = {}
        for r in relevant:
            by_tier.setdefault(r['tier'], []).append(r)

        for tier in sorted(by_tier.keys()):
            tier_recipes = by_tier[tier]
            f.write(f"## Tier {tier}\n\n")
            f.write("| Ingredient A | Ingredient B | Result | Type Tag A | Type Tag B | Type Tag Result |\n")
            f.write("|---|---|---|---|---|---|\n")
            for r in tier_recipes:
                ta = get_type_tag(r['ingredient_a'])
                tb = get_type_tag(r['ingredient_b'])
                tr = get_type_tag(r['result'])
                f.write(f"| {r['ingredient_a']} | {r['ingredient_b']} | {r['result']} | {ta} | {tb} | {tr} |\n")
            f.write("\n")

    print(f"Wrote {len(relevant)} relevant recipes to {md_path}")

    # --- Print summary stats ---
    type_tagged = [r for r in recipes
                   if get_type_tag(r['result'])
                   or get_type_tag(r['ingredient_a'])
                   or get_type_tag(r['ingredient_b'])]
    print(f"\nRecipes with at least one direct type-system mapping: {len(type_tagged)}")

    # Count by type tag
    tag_counts = {}
    for r in type_tagged:
        for tag in [get_type_tag(r['result']),
                    get_type_tag(r['ingredient_a']),
                    get_type_tag(r['ingredient_b'])]:
            if tag:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    print("\nRecipes per type tag:")
    for tag, count in sorted(tag_counts.items(), key=lambda x: -x[1]):
        print(f"  {tag}: {count}")


if __name__ == "__main__":
    main()
