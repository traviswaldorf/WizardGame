# MTG Mana / Color Symbol Sources

Automated download was not possible. Use the URLs below to download manually.
Save each file into this directory with the indicated filename.

## Scryfall SVG Symbols (Recommended - High Quality Vector)

Scryfall hosts official-quality SVG mana symbols. Right-click and "Save As" or use curl:

| Color     | Filename         | URL                                                  |
|-----------|------------------|------------------------------------------------------|
| White (W) | `white.svg`      | https://svgs.scryfall.io/card-symbols/W.svg          |
| Blue (U)  | `blue.svg`       | https://svgs.scryfall.io/card-symbols/U.svg          |
| Black (B) | `black.svg`      | https://svgs.scryfall.io/card-symbols/B.svg          |
| Red (R)   | `red.svg`        | https://svgs.scryfall.io/card-symbols/R.svg          |
| Green (G) | `green.svg`      | https://svgs.scryfall.io/card-symbols/G.svg          |
| Colorless (C) | `colorless.svg` | https://svgs.scryfall.io/card-symbols/C.svg      |

### Quick Download (paste into terminal)

```bash
cd "C:\Users\travi\source\repos\WizardGame\design\reference\games\mtg\color-icons"
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/W.svg && mv W.svg white.svg
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/U.svg && mv U.svg blue.svg
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/B.svg && mv B.svg black.svg
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/R.svg && mv R.svg red.svg
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/G.svg && mv G.svg green.svg
curl -LO --output-dir . https://svgs.scryfall.io/card-symbols/C.svg && mv C.svg colorless.svg
```

Or as a one-liner (Git Bash / WSL):

```bash
cd /c/Users/travi/source/repos/WizardGame/design/reference/games/mtg/color-icons && for pair in "W white" "U blue" "B black" "R red" "G green" "C colorless"; do set -- $pair; curl -sL "https://svgs.scryfall.io/card-symbols/${1}.svg" -o "${2}.svg"; done
```

## Scryfall Symbology API

The full list of symbols and their SVG URLs is available from:

    https://api.scryfall.com/symbology

Each entry in the JSON response contains an `svg_uri` field.

## Alternative Sources

- **MTG Wiki**: https://mtg.fandom.com/wiki/Mana - has symbol images in article content
- **Mana.life**: https://mana.life/ - community resource with mana symbol assets
- **Keyrune (CSS icon font)**: https://github.com/andrewgioia/keyrune - MTG set symbol icon font
- **Mana (CSS icon font)**: https://github.com/andrewgioia/mana - MTG mana symbol icon font (includes all mana symbols as SVG/CSS web font; great for web projects)

## Notes

- Scryfall symbols are SVGs (vector). If you need PNG, open the SVGs in a browser or image editor and export/convert.
- The Scryfall symbols are provided under fair use for fan projects. See Scryfall's terms at https://scryfall.com/docs/api
- MTG mana symbols are trademarks of Wizards of the Coast. Use for reference only.
