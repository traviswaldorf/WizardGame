-- =============================================
-- Wizard Game Database Schema
-- =============================================

-- Core type table
CREATE TABLE IF NOT EXISTS types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    old_name TEXT,
    tier TEXT NOT NULL CHECK(tier IN ('primary', 'secondary', 'tertiary')),
    color TEXT NOT NULL,
    secondary_color TEXT,
    accent_color TEXT,
    visual_motifs TEXT,
    card_border TEXT,
    icon_symbol TEXT,
    state_of_matter TEXT CHECK(state_of_matter IN ('plasma', 'solid', 'liquid', 'gas') OR state_of_matter IS NULL),
    energy_domain TEXT,
    primary_archetype TEXT CHECK(primary_archetype IN ('aggressive', 'defensive', 'flow', 'control') OR primary_archetype IS NULL),
    cluster_memberships TEXT,
    dark_pair_type_id INTEGER REFERENCES types(id),
    parent_type_id INTEGER REFERENCES types(id),
    sort_order INTEGER NOT NULL,
    selected_old_name_id INTEGER REFERENCES old_name_design(id),
    selected_status_effect_id INTEGER REFERENCES status_effect_design(id)
);

-- =============================================
-- Design tables: store all candidates/possibilities
-- Convention: *_design suffix for exploratory data
-- =============================================

-- Counter relationships between types
CREATE TABLE IF NOT EXISTS counter_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type_id INTEGER NOT NULL REFERENCES types(id),
    target_type_id INTEGER NOT NULL REFERENCES types(id),
    grounding INTEGER NOT NULL CHECK(grounding BETWEEN 1 AND 3),
    mechanism TEXT NOT NULL,
    is_mutual INTEGER NOT NULL DEFAULT 0,
    is_confirmed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(source_type_id, target_type_id)
);

-- Old name candidates per type
CREATE TABLE IF NOT EXISTS old_name_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL REFERENCES types(id),
    name TEXT NOT NULL,
    etymology TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0
);

-- Type composition and relationships
CREATE TABLE IF NOT EXISTS combination_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_type_id INTEGER NOT NULL REFERENCES types(id),
    component_a_type_id INTEGER REFERENCES types(id),
    component_b_type_id INTEGER REFERENCES types(id),
    relationship TEXT NOT NULL CHECK(relationship IN ('composition', 'dark_pair', 'equation')),
    notes TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0
);

-- Status effect candidates per type
CREATE TABLE IF NOT EXISTS status_effect_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL REFERENCES types(id),
    name TEXT NOT NULL,
    duration TEXT,
    is_stackable INTEGER,
    description TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0
);

-- Wizard school and scientist mappings
CREATE TABLE IF NOT EXISTS wizard_school_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL REFERENCES types(id),
    school_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('head', 'pupil_a', 'pupil_b')),
    scientist_name TEXT NOT NULL,
    birth_year INTEGER,
    death_year INTEGER,
    contribution TEXT,
    school_of_thought TEXT
);

-- Type combination ideas — spells, storms, and super powers
-- Pairs of types with varying amounts produce unique results
-- type_a_id <= type_b_id enforces canonical ordering; matrix is symmetric
-- nature = intuitive classification (what it IS); mechanic = game system it maps to
CREATE TABLE IF NOT EXISTS type_combination_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_a_id INTEGER NOT NULL REFERENCES types(id),
    type_b_id INTEGER REFERENCES types(id),
    type_a_amount INTEGER NOT NULL DEFAULT 1,
    type_b_amount INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    description TEXT,
    nature TEXT CHECK(nature IN ('spell', 'element', 'phenomenon', 'material', 'effect')),
    mechanic TEXT CHECK(mechanic IN ('spell', 'storm', 'super_power')),
    process TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0,
    CHECK(type_b_id IS NULL OR type_a_id <= type_b_id)
);

-- Effect taxonomy — categories, archetypes, and individual expressions
-- category = strategic group; archetype = mechanical role; name = specific expression
CREATE TABLE IF NOT EXISTS effect_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN (
        'aggro', 'control', 'search', 'growth', 'defensive', 'unassigned'
    )),
    archetype TEXT NOT NULL CHECK(archetype IN (
        'damage', 'destroy', 'counter', 'steal',
        'draw', 'revive', 'discount',
        'prevent', 'block', 'discard'
    )),
    name TEXT NOT NULL,
    description TEXT,
    effect_class TEXT CHECK(effect_class IN (
        'instant', 'status', 'dot', 'permanent', 'aura'
    )),
    is_selected INTEGER NOT NULL DEFAULT 0,
    notes TEXT
);

-- Links effects to pure types and/or type combinations
CREATE TABLE IF NOT EXISTS effect_type_link_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    effect_id INTEGER NOT NULL REFERENCES effect_design(id),
    type_id INTEGER REFERENCES types(id),
    type_combination_id INTEGER REFERENCES type_combination_design(id),
    role TEXT NOT NULL DEFAULT 'primary' CHECK(role IN ('primary', 'secondary', 'situational')),
    is_selected INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    CHECK(type_id IS NOT NULL OR type_combination_id IS NOT NULL)
);

-- Canonical scientist pool — broader reference beyond wizard schools
CREATE TABLE IF NOT EXISTS scientist_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    birth_year INTEGER,
    death_year INTEGER,
    field TEXT NOT NULL,
    sub_field TEXT NOT NULL,
    contribution TEXT NOT NULL,
    significance INTEGER NOT NULL CHECK(significance BETWEEN 1 AND 5),
    era TEXT NOT NULL CHECK(era IN (
        'ancient', 'medieval', 'renaissance', 'enlightenment',
        'industrial', 'modern', 'contemporary'
    )),
    nationality TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0,
    notes TEXT
);

-- Maps scientists to game types with affinity strength
CREATE TABLE IF NOT EXISTS scientist_type_affinity_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scientist_id INTEGER NOT NULL REFERENCES scientist_design(id),
    type_id INTEGER NOT NULL REFERENCES types(id),
    affinity TEXT NOT NULL CHECK(affinity IN ('strong', 'moderate', 'weak')),
    rationale TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0,
    UNIQUE(scientist_id, type_id)
);

-- Unit of measurement candidates per type
CREATE TABLE IF NOT EXISTS unit_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL REFERENCES types(id),
    name TEXT NOT NULL,
    symbol TEXT,
    quantity_measured TEXT NOT NULL,
    named_after TEXT,
    description TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0
);

-- Instrument / scale candidates per type
-- Thematically, instruments serve as "equipment" in the game world
CREATE TABLE IF NOT EXISTS instrument_design (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL REFERENCES types(id),
    name TEXT NOT NULL,
    associated_scientist TEXT,
    description TEXT,
    thematic_role TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- Prototype Incremental: skill trees (Decision 005)
-- =============================================

-- Each node in a type's progression tree
CREATE TABLE IF NOT EXISTS prototype_incremental_node (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    flavor_text TEXT,
    type_id INTEGER REFERENCES types(id),          -- which type tree (NULL for cross-type)
    category TEXT NOT NULL CHECK(category IN (
        'generator',       -- produces passive energy/sec
        'multiplier',      -- scales energy production
        'discovery',       -- unlocks new branches or knowledge
        'instrument',      -- tool that enables deeper progress
        'gate',            -- enables access to other types or trees
        'landmark',        -- major paradigm-defining discovery
        'active'           -- click/cast for burst effect
    )),
    tier INTEGER NOT NULL,                          -- depth in tree (1 = starting)
    era TEXT CHECK(era IN (
        'prehistoric', 'ancient', 'classical', 'medieval',
        'early_modern', 'industrial', 'modern', 'contemporary'
    )),
    superseded_by_id INTEGER REFERENCES prototype_incremental_node(id),
    historical_date TEXT,                           -- approximate date string
    scientist TEXT,                                 -- associated historical figure
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- What a node costs to unlock.
-- Multiple rows per node for multi-type costs (e.g. 500 Fire + 500 Earth).
CREATE TABLE IF NOT EXISTS prototype_incremental_cost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_incremental_node(id),
    type_id INTEGER NOT NULL REFERENCES types(id),
    amount INTEGER NOT NULL,
    UNIQUE(node_id, type_id)
);

-- Prerequisites: which other nodes must be unlocked first.
-- All prereqs in the same group are AND'd together.
-- Multiple groups for the same node are OR'd (any satisfied group = available).
CREATE TABLE IF NOT EXISTS prototype_incremental_prerequisite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_incremental_node(id),
    required_node_id INTEGER NOT NULL REFERENCES prototype_incremental_node(id),
    prerequisite_group INTEGER NOT NULL DEFAULT 1,
    UNIQUE(node_id, required_node_id, prerequisite_group)
);

-- What happens when a node is unlocked.
-- Multiple effects per node are common (a discovery might generate AND reveal).
CREATE TABLE IF NOT EXISTS prototype_incremental_effect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_incremental_node(id),
    effect_type TEXT NOT NULL CHECK(effect_type IN (
        'generate',        -- passive energy/sec: value = amount, target_type_id = which type
        'multiply',        -- multiply generation: value = factor, target_type_id = which type
        'unlock_type',     -- makes a new type available: target_type_id = which type
        'reveal_node',     -- shows a hidden node: target_node_id = which node
        'boost',           -- cross-type bonus: value = amount, target_type_id = boosted type
        'supersede'        -- replaces another node's effects: target_node_id = replaced node
    )),
    target_type_id INTEGER REFERENCES types(id),
    target_node_id INTEGER REFERENCES prototype_incremental_node(id),
    value REAL,
    description TEXT
);

-- =============================================
-- Prototype Roguelike: per-run skill tree & meta-progression
-- =============================================

-- Meta-unlock definitions: what persistent cross-run unlocks exist.
-- These determine which per-run tree branches become visible.
-- Must be defined before prototype_roguelike_node (referenced by meta_unlock_id).
CREATE TABLE IF NOT EXISTS prototype_roguelike_meta_unlock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    -- Which layer of meta-progression (maps to design doc layers 1-5)
    layer INTEGER NOT NULL CHECK(layer BETWEEN 1 AND 5),
    -- What category of unlock this is
    category TEXT NOT NULL CHECK(category IN (
        'type_branch',     -- unlocks a cross-type branch in the per-run tree
        'secondary',       -- unlocks a secondary type gate
        'tertiary',        -- unlocks a tertiary type branch
        'augmenter',       -- unlocks augmenter access
        'character',       -- unlocks a playable character (wizard)
        'upgrade'          -- research desk upgrade (starter slot, energy, etc.)
    )),
    -- For type_branch/secondary/tertiary: which type this unlocks
    target_type_id INTEGER REFERENCES types(id),
    -- For character: which wizard school entry
    target_wizard_school_id INTEGER REFERENCES wizard_school_design(id)
);

-- How meta-unlocks are earned: conditions that trigger them.
CREATE TABLE IF NOT EXISTS prototype_roguelike_meta_condition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meta_unlock_id INTEGER NOT NULL REFERENCES prototype_roguelike_meta_unlock(id),
    -- Type of condition
    condition_type TEXT NOT NULL CHECK(condition_type IN (
        'tower_victory',       -- beat a specific tower
        'tower_mastery',       -- reach mastery level N on a tower
        'cross_type_usage',    -- use both primaries of a secondary in one run
        'spell_cast_count',    -- cast N spells of a type combination
        'character_victory',   -- win with a specific character
        'instrument_found',    -- find a specific instrument
        'insight_spent'        -- spend N total Insight
    )),
    -- For tower conditions: which tower type
    condition_type_id INTEGER REFERENCES types(id),
    -- For mastery: minimum level; for spell count: minimum count
    condition_value INTEGER,
    -- Optional: second type (for cross_type_usage: both parents)
    condition_type_b_id INTEGER REFERENCES types(id),
    description TEXT
);

-- Each node in the roguelike per-run skill tree.
-- Visible nodes may be filtered at runtime by meta-progression state.
CREATE TABLE IF NOT EXISTS prototype_roguelike_node (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    flavor_text TEXT,
    -- Which type tree this node belongs to (NULL for cross-type gate nodes)
    type_id INTEGER REFERENCES types(id),
    -- Node category determines its mechanical role
    category TEXT NOT NULL CHECK(category IN (
        'starter',         -- free at run start (tier-1 root)
        'energy',          -- +1 max energy of a type
        'spell_pool',      -- expand which spells appear in rewards
        'passive',         -- ongoing combat bonus
        'gate',            -- requires depth in multiple branches to unlock
        'discovery'        -- reveals new branches or mechanics
    )),
    -- Depth within this type's branch (1 = starting tier, higher = deeper)
    tier INTEGER NOT NULL,
    -- Which branch path within a type (allows multiple paths at same tier)
    branch TEXT,
    -- Visibility: is this node visible without any meta-progression?
    -- 'always' = visible from first run, 'meta' = requires meta unlock
    visibility TEXT NOT NULL DEFAULT 'always' CHECK(visibility IN ('always', 'meta')),
    -- For 'meta' visibility: which meta_unlock_id reveals this node
    meta_unlock_id INTEGER REFERENCES prototype_roguelike_meta_unlock(id),
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- What a per-run node costs to invest in (multi-type XP costs).
-- Most nodes cost XP of a single type, but gates may require multiple.
CREATE TABLE IF NOT EXISTS prototype_roguelike_node_cost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_roguelike_node(id),
    type_id INTEGER NOT NULL REFERENCES types(id),
    amount INTEGER NOT NULL,
    UNIQUE(node_id, type_id)
);

-- Prerequisites: which other per-run nodes must be invested first.
-- Same AND/OR group logic as incremental tables.
CREATE TABLE IF NOT EXISTS prototype_roguelike_node_prerequisite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_roguelike_node(id),
    required_node_id INTEGER NOT NULL REFERENCES prototype_roguelike_node(id),
    prerequisite_group INTEGER NOT NULL DEFAULT 1,
    UNIQUE(node_id, required_node_id, prerequisite_group)
);

-- What happens when a per-run node is invested in.
CREATE TABLE IF NOT EXISTS prototype_roguelike_node_effect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES prototype_roguelike_node(id),
    effect_type TEXT NOT NULL CHECK(effect_type IN (
        'energy_max',      -- +N max energy: value = amount, target_type_id = which type
        'spell_pool',      -- adds spells to reward pool: target_type_id = which type combo
        'passive_damage',  -- +N damage with a type: value = amount, target_type_id
        'passive_block',   -- +N block with a type: value = amount, target_type_id
        'passive_draw',    -- +N card draw: value = amount
        'reveal_branch',   -- reveals hidden branch nodes: target_type_id = branch type
        'unlock_secondary' -- discovers a secondary type: target_type_id = secondary
    )),
    target_type_id INTEGER REFERENCES types(id),
    value REAL,
    description TEXT
);

-- Gate requirements: gates require a minimum tier depth in one or more
-- type branches. Separate from prerequisites because it checks
-- depth (how many nodes invested in a branch) not specific node IDs.
CREATE TABLE IF NOT EXISTS prototype_roguelike_gate_requirement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gate_node_id INTEGER NOT NULL REFERENCES prototype_roguelike_node(id),
    -- The type whose branch requires depth
    required_type_id INTEGER NOT NULL REFERENCES types(id),
    -- Minimum tier depth in that type's branch
    required_depth INTEGER NOT NULL,
    UNIQUE(gate_node_id, required_type_id)
);

-- Research Desk items: what Insight can be spent on between runs.
CREATE TABLE IF NOT EXISTS prototype_roguelike_research (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    -- Which meta_unlock this research purchase grants (if any)
    meta_unlock_id INTEGER REFERENCES prototype_roguelike_meta_unlock(id),
    -- Cost in Insight currency
    insight_cost INTEGER NOT NULL,
    -- Cost in Materials currency (0 if none)
    material_cost INTEGER NOT NULL DEFAULT 0,
    -- Maximum times purchasable (1 = one-time, >1 = repeatable with scaling)
    max_purchases INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- School mastery levels: define modifiers per ascending difficulty level.
CREATE TABLE IF NOT EXISTS prototype_roguelike_mastery_level (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL UNIQUE CHECK(level BETWEEN 1 AND 10),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    modifier_type TEXT NOT NULL CHECK(modifier_type IN (
        'enemy_damage_bonus',      -- counter-type enemies deal more
        'starting_energy_penalty', -- start with less energy
        'elite_restriction',       -- elites always counter-typed
        'xp_cost_multiplier',      -- tree nodes cost more
        'boss_phase',              -- boss gains extra phase
        'enemy_count_bonus',       -- extra enemy per group
        'shop_cost_multiplier',    -- shops cost more
        'map_restriction',         -- fewer rest nodes
        'enemy_moveset_enhance',   -- enhanced patterns
        'double_boss'              -- fight two bosses
    )),
    modifier_value REAL
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_counter_source ON counter_design(source_type_id);
CREATE INDEX IF NOT EXISTS idx_counter_target ON counter_design(target_type_id);
CREATE INDEX IF NOT EXISTS idx_old_name_type ON old_name_design(type_id);
CREATE INDEX IF NOT EXISTS idx_combination_result ON combination_design(result_type_id);
CREATE INDEX IF NOT EXISTS idx_status_effect_type ON status_effect_design(type_id);
CREATE INDEX IF NOT EXISTS idx_wizard_school_type ON wizard_school_design(type_id);
CREATE INDEX IF NOT EXISTS idx_type_combo_a ON type_combination_design(type_a_id);
CREATE INDEX IF NOT EXISTS idx_type_combo_b ON type_combination_design(type_b_id);
CREATE INDEX IF NOT EXISTS idx_type_combo_mechanic ON type_combination_design(mechanic);
CREATE INDEX IF NOT EXISTS idx_effect_category ON effect_design(category);
CREATE INDEX IF NOT EXISTS idx_effect_archetype ON effect_design(archetype);
CREATE INDEX IF NOT EXISTS idx_effect_link_effect ON effect_type_link_design(effect_id);
CREATE INDEX IF NOT EXISTS idx_effect_link_type ON effect_type_link_design(type_id);
CREATE INDEX IF NOT EXISTS idx_effect_link_combo ON effect_type_link_design(type_combination_id);
CREATE INDEX IF NOT EXISTS idx_scientist_field ON scientist_design(field);
CREATE INDEX IF NOT EXISTS idx_scientist_sub_field ON scientist_design(sub_field);
CREATE INDEX IF NOT EXISTS idx_scientist_era ON scientist_design(era);
CREATE INDEX IF NOT EXISTS idx_scientist_affinity_scientist ON scientist_type_affinity_design(scientist_id);
CREATE INDEX IF NOT EXISTS idx_scientist_affinity_type ON scientist_type_affinity_design(type_id);
CREATE INDEX IF NOT EXISTS idx_unit_type ON unit_design(type_id);
CREATE INDEX IF NOT EXISTS idx_instrument_type ON instrument_design(type_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_node_type ON prototype_incremental_node(type_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_node_tier ON prototype_incremental_node(tier);
CREATE INDEX IF NOT EXISTS idx_proto_incr_node_category ON prototype_incremental_node(category);
CREATE INDEX IF NOT EXISTS idx_proto_incr_cost_node ON prototype_incremental_cost(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_prereq_node ON prototype_incremental_prerequisite(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_prereq_required ON prototype_incremental_prerequisite(required_node_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_effect_node ON prototype_incremental_effect(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_incr_effect_type ON prototype_incremental_effect(target_type_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_meta_category ON prototype_roguelike_meta_unlock(category);
CREATE INDEX IF NOT EXISTS idx_proto_rl_meta_layer ON prototype_roguelike_meta_unlock(layer);
CREATE INDEX IF NOT EXISTS idx_proto_rl_condition_unlock ON prototype_roguelike_meta_condition(meta_unlock_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_node_type ON prototype_roguelike_node(type_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_node_tier ON prototype_roguelike_node(tier);
CREATE INDEX IF NOT EXISTS idx_proto_rl_node_category ON prototype_roguelike_node(category);
CREATE INDEX IF NOT EXISTS idx_proto_rl_node_visibility ON prototype_roguelike_node(visibility);
CREATE INDEX IF NOT EXISTS idx_proto_rl_node_meta ON prototype_roguelike_node(meta_unlock_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_cost_node ON prototype_roguelike_node_cost(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_prereq_node ON prototype_roguelike_node_prerequisite(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_prereq_required ON prototype_roguelike_node_prerequisite(required_node_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_effect_node ON prototype_roguelike_node_effect(node_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_effect_type ON prototype_roguelike_node_effect(target_type_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_gate_node ON prototype_roguelike_gate_requirement(gate_node_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_gate_type ON prototype_roguelike_gate_requirement(required_type_id);
CREATE INDEX IF NOT EXISTS idx_proto_rl_research_unlock ON prototype_roguelike_research(meta_unlock_id);
