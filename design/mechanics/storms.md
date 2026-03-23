# Storms

## What Is a Storm?

A Storm is a **persistent, board-wide environmental effect** tied to a type. Unlike Super Powers (personal, targeted, instant), Storms change the conditions of the game for ALL players — but asymmetrically, so the type that triggers the storm benefits most.

### Storms vs Super Powers

| Aspect     | Super Power              | Storm                                    |
|------------|--------------------------|------------------------------------------|
| Scope      | Targeted (specific player/tower) | Board-wide (affects everyone)    |
| Duration   | Instant or 1 turn        | Persists for 2-3 turns                   |
| Trigger    | Player chooses when to use | See [Decision 001](../decisions/001-storm-triggers.md) |
| Feel       | "I made a big play"      | "The weather changed — adapt or suffer"  |

### Positive vs Negative Storms

- **Positive Storm**: Changes game conditions to favor your type's playstyle. Benefits all players but your type leverages it best.
- **Negative Storm**: Creates adverse conditions that hurt opponents or the general board state.

### Trigger Mechanism

How storms are triggered is an open design decision. See [Decision 001: Storm Triggers](../decisions/001-storm-triggers.md) for options under consideration.

### Duration

Default: 2-3 turns. Exact duration TBD per storm.

### Stacking

<!-- TBD: Can multiple storms be active? Do they interact? -->

---

## Storm Catalog

### Primary Types

| Type  | Positive Storm   | Effect                                              | Negative Storm | Effect                                                  |
|-------|------------------|------------------------------------------------------|----------------|---------------------------------------------------------|
| Fire  | Wildfire         | All damage spells deal +1 bonus damage               | Firestorm      | All towers take 1 damage at end of each turn            |
| Earth | Fertile Ground   | All tower-building costs reduced by 1                 | Earthquake     | All towers shift positions; pieces drawn together       |
| Water | Flood            | All players draw 1 extra card per turn                | Whirlpool      | All players must discard 1 element at end of each turn  |
| Air   | Trade Winds      | All counter spells cost 1 less                        | Tornado        | Clear all status effects from the board                 |

### Secondary Types

| Type     | Positive Storm | Effect                                              | Negative Storm | Effect                                                      |
|----------|----------------|------------------------------------------------------|----------------|-------------------------------------------------------------|
| Metal    | Armory         | All towers gain +1 defense while active              | Wasteland      | All permanent effects lose 1 durability per turn            |
| Plant    | Growing Season | All towers heal 1 HP at start of owner's turn        | Overgrowth     | Element sources over-produce Plant elements only            |
| Ice      | Cold Snap      | All opponents' spells cost 1 more                    | Deep Freeze    | A random element source freezes each turn                   |
| Electric | Static Field   | Each spell cast deals 1 damage to a random opponent tower | Thunderstorm | Random lightning strikes deal damage to random towers each turn |

### Tertiary Types

| Type        | Positive Storm   | Effect                                                   | Negative Storm  | Effect                                                     |
|-------------|------------------|-----------------------------------------------------------|-----------------|-------------------------------------------------------------|
| Radioactive | Fallout          | Destroyed towers leave radiation dealing 1 dmg/turn to adjacent | Nuclear Winter | All resource generation halved                        |
| Crystal     | Refraction Field | All spells can optionally be cast twice at double cost    | Time Dilation   | All durations (buffs, debuffs, countdowns) extended by 1 turn |
| Cosmic      | Gravity Well     | Caster draws 1 extra element from any source per turn     | Solar Eclipse   | All players lose visibility of opponents' hands             |
| Ghost       | Haunting         | When any tower is destroyed, its owner discards 1 extra card | The Withering | All healing effects are reversed (heals become damage)      |
| Poison      | Toxic Cloud      | All opponent towers gain 1 Poison stack at end of each turn | Acid Rain      | All shields/permanent protections lose 1 effectiveness/turn |
| Heat        | Heatwave         | All players get 1 extra action per turn                   | Pressure Cooker | All timers and countdowns resolve twice as fast             |
| Sound       | Resonance        | Each consecutive same-type spell costs 1 less             | Cacophony       | Players cannot communicate; spell descriptions hidden       |
| Magnetic    | Magnetic Field   | All steal and draw effects pull 1 extra resource          | Interference    | All permanent effects randomly swap targets each turn       |

---

## Research Considerations

See [Pokemon Research](../reference/games/pokemon/) for detailed findings on terrain and weather systems that inform storm design. Key open questions raised by that research:

1. **Two-layer system?** Should Positive and Negative Storms be separate coexisting layers (like Pokemon's Weather + Terrain), rather than two variants of the same system?
2. **Dual push/pull effects** — Should storms both boost the triggering type AND nerf an opposing type? (e.g., Wildfire: Fire +1 AND Water -1)
3. **Replacement as counterplay** — Should triggering your storm automatically dismiss the current storm? ("Storm wars" as a strategic axis)
4. **Synergy bonuses** — Should types get passive one-time bonuses when "their" storm activates? (like Pokemon's Seed items)
5. **Fixed duration** — Commit to a specific turn count (e.g., 5 turns) rather than "2-3 turns"?
6. **Defensive storms** — Some storms could have NO offensive benefit and be purely protective/disruptive (Tornado already fits this pattern)

---

## Design Notes

- Earthquake "draws all pieces together" — opposite of Cosmic's "spread out" theme
- Tornado "clears all status effects" — Air as a purifying/reset force
- Overgrowth floods resources with Plant-only elements — disrupts multi-type strategies
- The Withering (Ghost) reverses healing — devastating against Plant-heavy strategies
- Cacophony (Sound) hides spell descriptions — creates uncertainty and bluffing
- Pressure Cooker (Heat) accelerates countdowns — can turn Poison DoTs from slow death to instant kill

## Open Questions
- [ ] Resolve storm trigger mechanism (see [Decision 001](../decisions/001-storm-triggers.md))
- [ ] Can multiple storms be active simultaneously? Do they interact?
- [ ] Do positive and negative storms of the same type cancel each other?
- [ ] Should storm duration vary by type (aggro storms shorter, control storms longer)?
- [ ] Can storms be countered or dismissed early by specific spell types?
