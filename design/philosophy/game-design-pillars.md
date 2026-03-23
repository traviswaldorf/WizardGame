# Game Design Pillars

> Principles that govern how the game creates engaging, meaningful experiences. These are the structural foundations beneath every mechanic, type, and spell.

**Status**: Draft

---

## Pillar 1: Meaningful Player Choice

The most fundamental design principle. Every turn should present the player with a decision that matters — not a rote action or an obvious best move. Meaningful choice requires real consequences, no obviously superior option, and enough information to reason but not enough to solve.

Meaningful choices are expressed through **dilemmas**:

### Scarcity Dilemma

Players have more things they want to do than resources to do them. The tension comes from **allocation under constraint** — you cannot do everything, so what do you prioritize?

- The game provides N desirable options but only enough resources for N-minus-something
- Every choice to do X is simultaneously a choice NOT to do Y
- The pain of opportunity cost is the engine of engagement

**Design test**: "Does the player want to do more than they can? Does that constraint feel like a puzzle, not a punishment?"

**In this game**: Element sources, tower slots, hand size, action economy. The player always has more viable plays than actions available.

### Trade-off Dilemma

Every option carries both benefits AND costs. There is no "free lunch" — gaining one advantage requires accepting a corresponding disadvantage. Distinct from scarcity because the cost is intrinsic to the choice, not merely opportunity cost.

- The designer ensures each path forward has a genuine drawback
- Creates the "I want both of these" feeling
- Trade-offs are strongest when the "best" option changes based on game state

**Design test**: "Does every option have a real downside? Would a player reasonably choose any of the options depending on context?"

**In this game**: Multi-type spells cost more but do more. Investing deep in one element locks you out of others. Storms buff your type but also buff opponents who share it. Aggressive plays expose your towers.

### Prediction Dilemma

The optimal play depends on what your opponent will do, which you must predict without certainty. This is the domain of *yomi* (reading your opponent), bluffing, and simultaneous action selection.

- Players must model their opponent's intentions on incomplete information
- Success comes from outthinking a person, not solving a puzzle
- Creates an irreducible social/psychological element

**Design test**: "Does the player need to think about what their opponent is thinking? Can they gain advantage by predicting correctly?"

**In this game**: Counter element selection, storm timing, tower placement, the robber. Reading whether an opponent is building toward a combo or bluffing investment.

---

## Pillar 2: Feedback Loops

Systems where a player's current position affects their rate of future progress.

### Positive Feedback (Snowballing)

Success breeds more success. Creates exciting momentum but risks the "runaway leader" problem.

### Negative Feedback (Catch-up)

Being behind provides compensating advantages. Keeps games competitive but risks making skillful play feel unrewarded.

### Design Resolution

The ideal is **oscillating feedback** — the leader changes multiple times, creating narrative tension. Mitigation tools:

- **Diminishing returns** — costs scale with empire size
- **Multiple victory paths** — prevents single-axis dominance
- **Element exclusivity reward** — fewer players on an element = stronger bonus
- **Staged progression with natural resets** — rounds, storms, board changes

**Design test**: "If one player gets ahead early, does the game still feel competitive? If a trailing player plays well, can they close the gap?"

---

## Pillar 3: Emergent Complexity

Complex, unpredictable game states that arise from the interaction of relatively simple rules. Strategic depth far exceeds what the rulebook would suggest.

- Emergence comes from *interactions between systems*, not from the systems themselves
- A small number of interacting systems produces a large discovery space
- 16 types × pairwise interactions = 120 unique pairs from a tight set of building blocks

**Design test**: "Can I explain this rule in one sentence? Does combining it with other rules create strategies I didn't explicitly design?"

**In this game**: The type system is the primary emergence engine. Simple composition rules (Fire + Earth = Metal) create cascading strategic implications when combined with storms, counters, towers, and spell archetypes.

---

## Pillar 4: Theme-Mechanic Integration

Alignment between what the game is "about" and what it mechanically asks players to do. When theme and mechanics reinforce each other, immersion deepens and rules become intuitive.

- Leveraging what players already know makes mechanics intuitive ("piggybacking")
- The game should capture the *decision-making process* of the theme
- Anti-pattern: ludonarrative dissonance, where mechanics contradict the story

**Design test**: "Does this mechanic make sense *because of* the theme? Would changing the theme break the mechanic's intuitive logic?"

**In this game**: Science IS magic — this is the core fusion. Water extinguishes Fire because *that's how water and fire work*. Combining elements follows real chemistry. Progression mirrors the history of scientific discovery. The theme isn't decorative; it's load-bearing.

---

## Pillar 5: Escalation and Pacing

The shape of the game experience over time — how tension, power, options, and stakes change from opening to endgame.

### Decision Space Shape

- **Waxing**: starts constrained, opens up as players gain abilities (this game's primary arc)
- **Waning**: starts with many options, narrows over time
- **Dynamic**: oscillates between expansion and contraction

### Critical Failure Mode

The engine-building anticlimax: players spend 80% of the game building and only 20% using it. Games should push toward completion (Rosewater's "inertia" principle).

**Design test**: "Does the player feel more powerful at turn 10 than turn 1? Does the game end at a satisfying peak, not a slow decline?"

**In this game**: Primary elements are accessible immediately. Secondary types require investment. Tertiary types are late-game power spikes. The progression curve IS the game arc.

---

## Pillar 6: Risk and Reward

Systems where players voluntarily accept higher variance or danger in exchange for potentially greater payoff.

- Most interesting when players have *some* information to evaluate the risk
- Risk tolerance should be a meaningful expression of strategy and personality
- Press-your-luck, auction/bidding, exploration depth

**Design test**: "Can a player choose to play it safe OR go big? Are both viable depending on context?"

**In this game**: Multi-type spells are high investment / high reward. Overcommitting to one element is risky if countered. Storm timing — do you trigger now for a smaller bonus or wait for a bigger payoff?

---

## Pillar 7: Information Architecture

How information is distributed, revealed, and hidden across players.

### Types of Information

- **Perfect**: all players see everything (chess-like board state)
- **Hidden**: some elements concealed (hand of cards)
- **Asymmetric**: different players know different secrets

### Design Principle

Hidden information creates prediction dilemmas and social interaction. The key balance: enough information to make informed decisions, enough hidden to create tension and surprise.

**Design test**: "What does each player know that others don't? Does that asymmetry create interesting decisions?"

**In this game**: Hand contents, planned combos, tower investment strategy. The board state (element sources, towers) is public, but intentions are private.

---

## Pillar 8: Player Interaction Spectrum

The degree and nature of how players affect each other.

### The Spectrum

1. **Parallel** — independent goals, separate play areas
2. **Indirect/Blocking** — competing for shared resources or spaces
3. **Negotiation** — trading, allying, deal-making
4. **Reactive** — responding to and interrupting opponents
5. **Direct Conflict** — actively harming opponents

### Design Principle

More interaction is not inherently better. The key choice is *what kind* of interaction serves the core emotion. At minimum, opponents should feel relevant.

**In this game**: Primarily indirect (element source competition) + reactive (counters, storms) + some direct conflict (tower attacks, the robber). Negotiation is possible but not required. The game explicitly rejects solitaire engine-building.

---

## Pillar 9: Randomness vs. Skill

The ratio between outcomes determined by chance versus player decisions.

### Input vs. Output Randomness

- **Input randomness**: random setup BEFORE decisions (shuffled market, random board). Creates novel problems to solve.
- **Output randomness**: random resolution AFTER decisions (dice rolls). Can negate good play.

### Design Principle

Input randomness is generally better for strategic games because it creates varied decision contexts without invalidating player agency. The best designs ensure better decisions win more often over time.

**In this game**: Random starting conditions, random board setup, random win conditions, card draw with preview (Splendor-style). Input-heavy by design.

---

## Pillar 10: Engine Building

Players invest present actions to improve future effectiveness, creating systems that compound over time.

- Progression from weak beginnings to powerful endgames
- Permanence — what you build persists and compounds
- Conversion chains — transforming resources through multiple steps

**Design test**: "Does early investment pay off later? Can a player build a 'machine' that gets more efficient over time?"

**In this game**: Tower-building, element source accumulation, type mastery unlocking tertiary types. The progression principle IS engine building — start with basic elements, build toward mastery.

---

## Pillar 11: Accessibility / Depth Ratio

The relationship between barrier to entry and strategic ceiling. Easy to learn, hard to master.

- Use what players already know to reduce learning burden (piggybacking)
- Depth comes from emergent interactions between simple systems
- Anti-pattern: complexity for complexity's sake — rules that add cost without proportional depth

**Design test**: "Can I teach this in 5 minutes? Will they still be discovering new strategies after 20 plays?"

**In this game**: 4 primary types are immediately graspable (fire, earth, water, air = states of matter). Depth emerges from combining them. The science grounding makes interactions intuitive even to newcomers.

---

## Pillar 12: Downtime Management

Minimizing time players spend waiting with nothing meaningful to do.

### Design Strategies

- **Simultaneous action selection** — all players act at once
- **Short turns with one key action** — keep individual turns brief
- **Parallel planning** — visible game state enables planning during others' turns
- **Reactions and interrupts** — give non-active players something to respond to

**Design test**: "During another player's turn, does the active player's action affect my plans? Can I meaningfully think about my next move?"

---

## Pillar 13: Decision Density

The ratio of meaningful decisions to elapsed time. High decision density keeps players engaged.

- Too few decisions: boredom, routine execution
- Too many decisions: analysis paralysis, exhaustion
- The paradox of choice: too many options reduce satisfaction

**Design test**: "Does every turn have at least one real decision? Are there turns where the 'right' play is so obvious it's automatic?"

---

## Expert Frameworks Referenced

### Mark Rosewater's Ten Things Every Game Needs
A Goal, Rules, Interaction, A Catch-Up Feature, Inertia, Surprise, Strategy, Fun, Flavor, A Hook

### Sid Meier's Decision Types
Trade-off, Situational, Style expression, Risk-versus-reward, Short-term versus long-term

### Reiner Knizia's Philosophy
Mathematical elegance through simplification. Games should capture the decision-making process of a theme, not simulate the theme literally.

---

## Open Questions

- [ ] Which dilemma type is the primary driver of each game phase? (e.g., scarcity early, prediction late?)
- [ ] How does the element exclusivity reward interact with feedback loop design?
- [ ] What is the target decision density per turn?
- [ ] Where does this game sit on the player interaction spectrum?
- [ ] What is the target accessibility/depth ratio? (Catan-level? Terraforming Mars-level?)
- [ ] How much output randomness (if any) is acceptable?
