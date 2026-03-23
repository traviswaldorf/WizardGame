"""
Build the Wizard Game SQLite database with all design data.
Run: python database/build.py
"""
import sqlite3
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, 'wizard_game.db')
SCHEMA_PATH = os.path.join(SCRIPT_DIR, 'schema.sql')


# =============================================
# Type Data
# =============================================

TYPES = [
    # (name, old_name, tier, color, sort_order, state_of_matter, energy_domain, primary_archetype, cluster_memberships)
    ('Fire',        'Pyro',    'primary',   '#E74C3C',  1, 'plasma', 'Solar/Plasma',                    'aggressive', 'Aggressive/Exterminate'),
    ('Earth',       'Kilo',    'primary',   '#A0522D',  2, 'solid',  'Gravity/Solid',                   'defensive',  'Protection/Explore'),
    ('Water',       'Hydro',   'primary',   '#2E86C1',  3, 'liquid', 'Hydro/Chemical',                  'flow',       'Generation/Expand'),
    ('Air',         'Aero',    'primary',   '#AED6F1',  4, 'gas',    'Pressure/Gas',                    'control',    'Control/Exploit'),
    ('Metal',       'Forgo',   'secondary', '#808B96',  5, None,     'Structure/Bonds',                 'defensive',  'Protection/Explore, Aggressive/Exterminate'),
    ('Plant',       'Gro',     'secondary', '#27AE60',  6, None,     'Life/Organic',                    'defensive',  'Generation/Expand, Protection/Explore'),
    ('Ice',         'Sno',     'secondary', '#85C1E9',  7, None,     'Thermodynamics (cold side)',       'control',    'Generation/Expand, Control/Exploit'),
    ('Electric',    'Electro', 'secondary', '#F4D03F',  8, None,     'Electromagnetism (electric side)', 'aggressive', 'Control/Exploit, Aggressive/Exterminate'),
    ('Radioactive', 'Radio',   'tertiary',  '#B7FF00',  9, 'plasma', 'Nuclear energy',                  'aggressive', 'Aggressive/Exterminate'),
    ('Cosmic',      'Cosmo',   'tertiary',  '#7D3C98', 10, 'solid',  'Gravity/Space',                   'defensive',  'Protection/Explore'),
    ('Poison',      'Toxo',    'tertiary',  '#884EA0', 11, 'liquid', 'Chemical reactions',               'flow',       None),
    ('Sound',       'Stereo',  'tertiary',  '#E91E63', 12, 'gas',    'Acoustic waves/Pressure',         'control',    'Control/Exploit'),
    ('Crystal',     'Crystal', 'tertiary',  '#1ABC9C', 13, None,     'Structure/Lattice/Resonance',     'control',    None),
    ('Ghost',       'Hollo',   'tertiary',  '#5D6D7E', 14, None,     'Decay/Death/Entropy',             'flow',       None),
    ('Heat',        'Thermo',  'tertiary',  '#E67E22', 15, None,     'Thermodynamics (hot side)',        None,         None),
    ('Magnetic',    'Magneto', 'tertiary',  '#2E4053', 16, None,     'Electromagnetism (magnetic side)', 'control',    None),
]

# Dark pair / parent relationships
# (type_name, dark_pair_name, parent_name)
# Primary/secondary types have a dark_pair; tertiary types have a parent
DARK_PAIR_PARENT = [
    # Primary → dark pair
    ('Fire',     'Radioactive', None),
    ('Earth',    'Cosmic',      None),
    ('Water',    'Poison',      None),
    ('Air',      'Sound',       None),
    # Secondary → dark pair
    ('Metal',    'Crystal',     None),
    ('Plant',    'Ghost',       None),
    ('Ice',      'Heat',        None),
    ('Electric', 'Magnetic',    None),
    # Tertiary → parent
    ('Radioactive', None, 'Fire'),
    ('Cosmic',      None, 'Earth'),
    ('Poison',      None, 'Water'),
    ('Sound',       None, 'Air'),
    ('Crystal',     None, 'Metal'),
    ('Ghost',       None, 'Plant'),
    ('Heat',        None, 'Ice'),
    ('Magnetic',    None, 'Electric'),
]


# =============================================
# Old Name Candidates
# (type_name, old_name, etymology, is_selected)
# =============================================

OLD_NAMES = [
    # Primary
    ('Fire',  'Pyro',  'Greek "pyr" (fire)', 1),
    ('Fire',  'Igno',  'Latin "ignis" (fire)', 0),
    ('Earth', 'Kilo',  'From kilogram (mass)', 1),
    ('Earth', 'Grano', 'Latin "granum" (grain)', 0),
    ('Water', 'Hydro', 'Greek "hydor" (water)', 1),
    ('Water', 'Flo',   'From "flow"', 0),
    ('Air',   'Aero',  'Greek "aer" (air)', 1),
    ('Air',   'Blo',   'From "blow"', 0),

    # Secondary
    ('Metal',    'Forgo',   'From "forge"', 1),
    ('Metal',    'Ferro',   'Latin "ferrum" (iron)', 0),
    ('Plant',    'Gro',     'From "grow"', 1),
    ('Plant',    'Vito',    'Latin "vita" (life)', 0),
    ('Plant',    'Bio',     'Greek "bios" (life)', 0),
    ('Ice',      'Sno',     'From "snow"', 1),
    ('Ice',      'Slo',     'From "slow" (tempo reduction)', 0),
    ('Electric', 'Electro', 'Greek "elektron" (amber)', 1),
    ('Electric', 'Volto',   'From "volt" (Alessandro Volta)', 0),
    ('Electric', 'Ohmo',    'From "ohm" (Georg Ohm)', 0),

    # Tertiary
    ('Radioactive', 'Radio',   'From "radioactive"', 1),
    ('Radioactive', 'Fissio',  'From "fission"', 0),
    ('Cosmic',      'Cosmo',   'Greek "kosmos" (universe)', 1),
    ('Cosmic',      'Astro',   'Greek "astron" (star)', 0),
    ('Cosmic',      'Nebulo',  'Latin "nebula" (cloud/mist)', 0),
    ('Poison',      'Toxo',    'Greek "toxikon" (poison)', 1),
    ('Poison',      'Sporo',   'Greek "spora" (spore)', 0),
    ('Sound',       'Stereo',  'From "stereophonic"', 1),
    ('Sound',       'Sono',    'Latin "sonus" (sound)', 0),
    ('Crystal',     'Crystal', 'From "crystal" (lattice)', 1),
    ('Crystal',     'Tempo',   'From "tempo" (time/pace)', 0),
    ('Ghost',       'Hollo',   'From "hollow"', 1),
    ('Ghost',       'Shado',   'From "shadow"', 0),
    ('Ghost',       'Necro',   'Greek "nekros" (dead)', 0),
    ('Ghost',       'Morto',   'Latin "mortis" (death)', 0),
    ('Ghost',       'Entro',   'From "entropy"', 0),
    ('Heat',        'Thermo',  'Greek "therme" (heat)', 1),
    ('Heat',        'Calo',    'Latin "calor" (heat)', 0),
    ('Magnetic',    'Magneto', 'From "magnet"', 1),
    ('Magnetic',    'Polo',    'From "polar/poles"', 0),
]


# =============================================
# Combination Design
# (result_type, component_a, component_b, relationship, notes, is_selected)
# =============================================

COMBINATIONS = [
    # Secondary compositions
    ('Metal',    'Fire',  'Earth', 'composition', 'Fire + Earth = Metal (forging)', 1),
    ('Plant',    'Earth', 'Water', 'composition', 'Earth + Water = Plant (growth)', 1),
    ('Ice',      'Air',   'Water', 'composition', 'Air + Water = Ice (freezing)', 1),
    ('Electric', 'Fire',  'Air',   'composition', 'Fire + Air = Electric (lightning)', 1),

    # Tertiary dark pairs (component_b is None for single-parent)
    ('Radioactive', 'Fire',     None, 'dark_pair', 'Nuclear energy — Fire\'s extreme', 1),
    ('Cosmic',      'Earth',    None, 'dark_pair', 'Gravity/Space — Earth\'s grand scale', 1),
    ('Poison',      'Water',    None, 'dark_pair', 'Chemical reactions — Water\'s dark corruption', 1),
    ('Sound',       'Air',      None, 'dark_pair', 'Acoustic waves — Air\'s pressure manifestation', 1),
    ('Crystal',     'Metal',    None, 'dark_pair', 'Structure/Lattice — Metal\'s ordered form', 1),
    ('Ghost',       'Plant',    None, 'dark_pair', 'Decay/Death — Plant\'s organic entropy', 1),
    ('Heat',        'Ice',      None, 'dark_pair', 'Thermodynamics (hot) — Ice\'s opposite', 1),
    ('Magnetic',    'Electric', None, 'dark_pair', 'Electromagnetism (magnetic) — Electric\'s other side', 1),

    # Reaction equations
    ('Radioactive', 'Fire',   'Poison', 'equation', 'Fire + Poison = Radioactive', 1),
    ('Poison',      'Water',  'Radioactive', 'equation', 'Water + Radioactive = Poison', 1),
]


# =============================================
# Unit of Measurement Candidates
# (type_name, name, symbol, quantity_measured, named_after, description, is_selected)
# =============================================

UNITS = [
    # Fire
    ('Fire', 'Joule',    'J',   'Energy',      'James Prescott Joule',  'SI unit of energy — heat, work, and electricity unified', 1),
    ('Fire', 'Calorie',  'cal', 'Heat energy',  None,                   'Energy to raise 1g of water by 1°C — a Fire+Water unit by definition', 0),

    # Earth
    ('Earth', 'Kilogram', 'kg', 'Mass',    None,             'SI base unit of mass — the measure of substance', 1),
    ('Earth', 'Newton',   'N',  'Force',   'Isaac Newton',   'Force required to accelerate 1 kg at 1 m/s² — gravity made measurable', 0),

    # Water
    ('Water', 'Litre',  'L',  'Volume',   None,            'Unit of liquid volume — the space water fills', 1),
    ('Water', 'Pascal', 'Pa', 'Pressure', 'Blaise Pascal', 'SI unit of pressure — force per unit area in fluids', 0),

    # Air
    ('Air', 'Atmosphere', 'atm',  'Pressure', None,                     'Standard atmospheric pressure at sea level', 1),
    ('Air', 'Torr',       'Torr', 'Pressure', 'Evangelista Torricelli', '1/760 of an atmosphere — the barometer\'s unit', 0),

    # Metal
    ('Metal', 'Mohs', None, 'Hardness', 'Friedrich Mohs', 'Relative hardness scale from 1 (talc) to 10 (diamond)', 1),

    # Plant
    ('Plant', 'Generation', None, 'Growth cycle', None, 'Time between parent and offspring — the rhythm of life', 0),
    ('Plant', 'Cell', None, 'Biological quantity', 'Robert Hooke', 'The fundamental unit of life — all living things are built from cells', 0),

    # Ice
    ('Ice', 'Kelvin', 'K', 'Temperature (absolute)', 'Lord Kelvin', 'Absolute temperature scale — 0 K is the coldest anything can be', 1),

    # Electric
    ('Electric', 'Volt',   'V', 'Voltage',    'Alessandro Volta',   'Electric potential difference — the push behind current', 1),
    ('Electric', 'Ampere', 'A', 'Current',    'André-Marie Ampère', 'Rate of electric charge flow', 0),
    ('Electric', 'Ohm',    'Ω', 'Resistance', 'Georg Ohm',          'Opposition to current flow', 0),

    # Radioactive
    ('Radioactive', 'Becquerel', 'Bq', 'Radioactivity',  'Henri Becquerel', 'One nuclear decay per second', 1),
    ('Radioactive', 'Curie',     'Ci', 'Radioactivity',  'Marie Curie',     'Historical unit — 3.7×10¹⁰ decays/sec (1g of radium-226)', 0),
    ('Radioactive', 'Sievert',   'Sv', 'Radiation dose', 'Rolf Sievert',    'Biological effect of ionizing radiation on the body', 0),

    # Cosmic
    ('Cosmic', 'Light-year', 'ly', 'Distance', None, 'Distance light travels in one year — the ruler of the cosmos', 1),
    ('Cosmic', 'Parsec',     'pc', 'Distance', None, 'Parallax arcsecond — 3.26 light-years, based on stellar triangulation', 0),

    # Poison
    ('Poison', 'Molar', 'M',  'Concentration', None, 'Moles of solute per litre — how potent a solution is', 1),
    ('Poison', 'LD50',  None, 'Toxicity',      None, 'Dose lethal to 50% of a test population — the line between medicine and poison', 0),

    # Sound
    ('Sound', 'Decibel', 'dB', 'Sound intensity', 'Alexander Graham Bell', 'Logarithmic scale of sound power — 0 dB is the threshold of hearing', 1),
    ('Sound', 'Hertz',   'Hz', 'Frequency',       'Heinrich Hertz',        'Cycles per second — pitch made numerical', 0),

    # Crystal
    ('Crystal', 'Ångström', 'Å', 'Atomic distance', 'Anders Jonas Ångström', '10⁻¹⁰ metres — the scale of atomic bonds and crystal lattices', 1),

    # Ghost
    ('Ghost', 'Half-life', 't½', 'Decay rate', None, 'Time for half a substance to decay — entropy on a schedule', 1),

    # Heat
    ('Heat', 'Degree Celsius', '°C', 'Temperature', 'Anders Celsius', 'Temperature relative to water\'s freezing/boiling — the human scale of heat', 1),
    ('Heat', 'BTU',            'BTU', 'Heat energy', None,             'British Thermal Unit — energy to heat 1 lb of water by 1°F', 0),

    # Magnetic
    ('Magnetic', 'Tesla', 'T', 'Magnetic flux density', 'Nikola Tesla', 'SI unit of magnetic field strength', 1),
    ('Magnetic', 'Gauss', 'G', 'Magnetic field',        'Carl Friedrich Gauss', 'CGS unit of magnetic flux density — 1 T = 10,000 G', 0),
]


# =============================================
# Instrument / Scale Candidates
# (type_name, name, associated_scientist, description, thematic_role, is_selected)
# Instruments serve as "equipment" thematically — a wizard's tools of mastery
# =============================================

INSTRUMENTS = [
    # Fire
    ('Fire', 'Calorimeter',         'Antoine-Laurent Lavoisier', 'Measures heat released or absorbed in reactions',     'Measures your destructive output',    1),
    ('Fire', 'Spectroscope',        'Joseph von Fraunhofer',     'Splits light into spectral lines to identify elements', 'Reveals hidden elemental composition', 0),

    # Earth
    ('Earth', 'Seismograph',        None,            'Detects and records ground vibrations and earthquakes',        'Senses disturbances in the foundation', 1),
    ('Earth', 'Balance Scale',      'Isaac Newton',  'Measures mass by comparing against known weights',             'Weighs the cost of action',             0),

    # Water
    ('Water', 'Eureka Can',         'Archimedes',    'Displacement vessel — measures volume by overflow',            'Reveals what lies beneath the surface',  1),
    ('Water', 'Hydraulic Press',    'Blaise Pascal', 'Multiplies force through confined fluid pressure',             'Amplifies pressure from a small source', 0),

    # Air
    ('Air', 'Barometer',            'Evangelista Torricelli', 'Measures atmospheric pressure using mercury column',   'Reads the weight of the invisible',     1),
    ('Air', 'Anemometer',           None,                     'Measures wind speed via rotating cups',                'Gauges the force of the unseen',        0),

    # Metal
    ('Metal', 'Mohs Hardness Scale', 'Friedrich Mohs',        'Ranks minerals 1-10 by scratch resistance',           'Tests the strength of defenses',        1),
    ('Metal', 'X-ray Diffractometer', 'William Lawrence Bragg', 'Reveals crystal structure of metals via X-ray scattering', 'Sees the hidden architecture within', 0),

    # Plant
    ('Plant', 'Microscope',          None,            'Magnifies tiny structures — cells, spores, organisms',        'Reveals the small engines of growth',   1),
    ('Plant', 'Herbarium Press',     None,            'Preserves plant specimens for study and classification',       'Catalogues and preserves life forms',   0),

    # Ice
    ('Ice', 'Cryostat',             None,            'Maintains extremely low temperatures for experiments',          'Sustains the stillness of absolute cold', 1),
    ('Ice', 'Thermometer',          'Lord Kelvin',   'Measures temperature — calibrated to absolute zero',            'Reads the boundary between motion and stillness', 0),

    # Electric
    ('Electric', 'Voltaic Pile',    'Alessandro Volta', 'First true battery — stacked zinc/copper discs generating steady current', 'Stores and releases electric power on demand', 1),
    ('Electric', 'Galvanometer',    'André-Marie Ampère', 'Detects and measures small electric currents',             'Senses the flow of invisible current',  0),

    # Radioactive
    ('Radioactive', 'Geiger Counter',  'Hans Geiger',    'Detects ionizing radiation via gas ionization clicks',     'Warns of invisible, lethal energy',     1),
    ('Radioactive', 'Cloud Chamber',   'C.T.R. Wilson',  'Makes radiation visible as vapor trails from charged particles', 'Reveals the invisible tracks of decay', 0),

    # Cosmic
    ('Cosmic', 'Telescope',           'Edwin Hubble',        'Gathers distant light to observe far-off objects',     'Extends vision across impossible distances', 1),
    ('Cosmic', 'Cepheid Variable',    'Henrietta Swan Leavitt', 'Pulsating star whose period reveals its true brightness — a cosmic ruler', 'Measures the immeasurable', 0),

    # Poison
    ('Poison', 'Litmus Paper',        None,            'Changes color to indicate acid or base — simplest chemical test', 'Detects hidden chemical nature',       1),
    ('Poison', 'Marsh Test Apparatus', 'James Marsh',  'Detects trace arsenic in substances via chemical reduction', 'Exposes what was meant to stay hidden', 0),

    # Sound
    ('Sound', 'Tuning Fork',         None,             'Produces a pure tone at a fixed frequency when struck',      'Sets the standard for resonance',       1),
    ('Sound', 'Chladni Plate',       'Ernst Chladni',  'Metal plate that reveals vibration patterns via scattered sand', 'Makes sound waves visible as geometry', 0),

    # Crystal
    ('Crystal', 'Piezoelectric Crystal', 'Pierre Curie', 'Generates voltage when mechanically stressed — and vice versa', 'Converts between physical and electrical energy', 1),
    ('Crystal', 'Goniometer',           None,            'Measures angles between crystal faces',                     'Maps the precise geometry of structure', 0),

    # Ghost
    ('Ghost', 'Electroscope',         None,            'Detects electric charge — historically used in radiation/spirit experiments', 'Senses the presence of the unseen', 1),

    # Heat
    ('Heat', 'Thermometer',           'Daniel Fahrenheit', 'Measures temperature via thermal expansion of mercury',  'Reads the intensity of thermal energy',  1),
    ('Heat', 'Calorimeter',           'Count Rumford',     'Measures heat energy transferred in reactions',           'Quantifies the hidden fire within',      0),

    # Magnetic
    ('Magnetic', 'Compass',           'William Gilbert', 'Magnetic needle aligns with Earth\'s field — reveals direction', 'Points toward hidden forces and truths', 1),
    ('Magnetic', 'Tesla Coil',        'Nikola Tesla',    'Resonant transformer producing high-voltage, low-current AC electricity', 'Broadcasts magnetic power across distance', 0),
]


# =============================================
# Status Effect Candidates
# (type_name, name, target, duration, is_stackable, description, is_selected)
# =============================================

STATUS_EFFECTS = [
    # (type_name, name, duration, stackable, description, is_selected)
    ('Fire',     'Burn',     'TBD',    None, 'Damage over time', 1),
    ('Ice',      'Freeze',   '1 turn', None, 'Target cannot act for duration', 1),
    ('Electric', 'Paralyze', '1 turn', None, 'Target cannot act (stronger than Freeze)', 1),
    ('Poison',   'Poison',   'X turns', None, 'Damage over time, stackable', 1),
    ('Sound',    'Silence',  'TBD',    None, 'Players cannot speak (physical game rule)', 1),
]


# =============================================
# Wizard School Data
# (type_name, school_name, role, scientist, birth, death, contribution, school_of_thought)
# =============================================

WIZARD_SCHOOLS = [
    # --- Fire: School of Combustion ---
    ('Fire', 'School of Combustion', 'head', 'Antoine-Laurent Lavoisier', 1743, 1794,
     'Founded modern chemistry; identified oxygen\'s role in combustion', None),
    ('Fire', 'School of Combustion', 'pupil_a', 'James Prescott Joule', 1818, 1889,
     'Mechanical equivalent of heat — work and heat interchangeable',
     'School of Mechanical Energy — fire as measurable, convertible energy'),
    ('Fire', 'School of Combustion', 'pupil_b', 'Joseph von Fraunhofer', 1787, 1826,
     'Dark absorption lines in solar spectrum; founded solar spectroscopy',
     'School of Solar Fire — fire as stellar/cosmic phenomenon'),

    # --- Earth: School of Mass ---
    ('Earth', 'School of Mass', 'head', 'Isaac Newton', 1643, 1727,
     'Universal gravitation; laws of motion', None),
    ('Earth', 'School of Mass', 'pupil_a', 'James Hutton', 1726, 1797,
     'Uniformitarianism — Earth shaped by slow, continuous processes',
     'School of Deep Time — Earth as ancient, patient, enduring'),
    ('Earth', 'School of Mass', 'pupil_b', 'Alfred Wegener', 1880, 1930,
     'Continental drift — continents once joined, moved apart',
     'School of Shifting Ground — Earth as dynamic, mobile'),

    # --- Water: School of Fluids ---
    ('Water', 'School of Fluids', 'head', 'Archimedes of Syracuse', -287, -212,
     'Buoyancy principle; pioneered hydrostatics', None),
    ('Water', 'School of Fluids', 'pupil_a', 'Daniel Bernoulli', 1700, 1782,
     'Bernoulli\'s Principle — fluid speed inversely relates to pressure',
     'School of the Current — water in motion, flow, dynamics'),
    ('Water', 'School of Fluids', 'pupil_b', 'Blaise Pascal', 1623, 1662,
     'Pascal\'s Law — pressure in confined fluid transmits equally',
     'School of the Deep — water under pressure, hydraulics'),

    # --- Air: School of Pressure ---
    ('Air', 'School of Pressure', 'head', 'Evangelista Torricelli', 1608, 1647,
     'Invented barometer; proved atmosphere has weight and pressure', None),
    ('Air', 'School of Pressure', 'pupil_a', 'Robert Boyle', 1627, 1691,
     'Boyle\'s Law — gas pressure and volume inversely proportional',
     'School of Compression — air as controllable, compressible'),
    ('Air', 'School of Pressure', 'pupil_b', 'Gaspard-Gustave de Coriolis', 1792, 1843,
     'Coriolis effect — deflection of air masses; governs weather patterns',
     'School of the Wind — air as free, planetary-scale'),

    # --- Metal: School of Hardness ---
    ('Metal', 'School of Hardness', 'head', 'Friedrich Mohs', 1773, 1839,
     'Created Mohs hardness scale — systematic classification of hardness', None),
    ('Metal', 'School of Hardness', 'pupil_a', 'Henry Bessemer', 1813, 1898,
     'Bessemer process — first inexpensive method for mass steel production',
     'School of the Forge — metal transformed by fire and force'),
    ('Metal', 'School of Hardness', 'pupil_b', 'William Lawrence Bragg', 1890, 1971,
     'X-ray crystallography; revealed atomic structure of metals',
     'School of Structure — metal understood through hidden atomic architecture'),

    # --- Plant: School of Growth ---
    ('Plant', 'School of Growth', 'head', 'Charles Darwin', 1809, 1882,
     'Evolution by natural selection — how living things grow, adapt, diversify', None),
    ('Plant', 'School of Growth', 'pupil_a', 'Gregor Mendel', 1822, 1884,
     'Laws of heredity through pea plant experiments; founded genetics',
     'School of the Seed — life as encoded information, blueprint inside the seed'),
    ('Plant', 'School of Growth', 'pupil_b', 'Thomas Robert Malthus', 1766, 1834,
     'Populations grow exponentially while resources grow linearly',
     'School of Overgrowth — life as unchecked growth and competition'),

    # --- Ice: School of Cold ---
    ('Ice', 'School of Cold', 'head', 'William Thomson, Lord Kelvin', 1824, 1907,
     'Established absolute temperature scale; concept of absolute zero', None),
    ('Ice', 'School of Cold', 'pupil_a', 'Heike Kamerlingh Onnes', 1853, 1926,
     'First to liquefy helium; discovered superconductivity at extreme cold',
     'School of Absolute Cold — pursuing absolute zero, cryogenics'),
    ('Ice', 'School of Cold', 'pupil_b', 'Josiah Willard Gibbs', 1839, 1903,
     'Founded chemical thermodynamics; theory of phase transitions',
     'School of Phase Change — boundaries between states of matter'),

    # --- Electric: School of Current ---
    ('Electric', 'School of Current', 'head', 'Michael Faraday', 1791, 1867,
     'Electromagnetic induction; invented electric motor and generator', None),
    ('Electric', 'School of Current', 'pupil_a', 'Alessandro Volta', 1745, 1827,
     'Voltaic pile (first battery) — electricity generated chemically, stored',
     'School of Stored Lightning — electricity as potential, contained power'),
    ('Electric', 'School of Current', 'pupil_b', 'Andre-Marie Ampere', 1775, 1836,
     'Founded electrodynamics; defined electric current nature',
     'School of the Living Current — electricity as flow, moving charges'),

    # --- Radioactive: School of the Atom ---
    ('Radioactive', 'School of the Atom', 'head', 'Marie Curie', 1867, 1934,
     'Discovered radium & polonium; coined "radioactivity"; died from exposure', None),
    ('Radioactive', 'School of the Atom', 'pupil_a', 'Lise Meitner', 1878, 1968,
     'First to theoretically explain nuclear fission — splitting heavy atomic nuclei',
     'School of Fission — power through division, chain reactions'),
    ('Radioactive', 'School of the Atom', 'pupil_b', 'Hans Bethe', 1906, 2005,
     'Explained nuclear reactions powering the Sun — hydrogen fusing to helium',
     'School of Fusion — power through union, stellar energy'),

    # --- Cosmic: School of the Vast ---
    ('Cosmic', 'School of the Vast', 'head', 'Edwin Hubble', 1889, 1953,
     'Proved galaxies beyond Milky Way; discovered universe expanding', None),
    ('Cosmic', 'School of the Vast', 'pupil_a', 'Henrietta Swan Leavitt', 1868, 1921,
     'Period-luminosity relationship of Cepheid stars — first reliable cosmic distance measurement',
     'School of the Light — visible, measurable cosmos, using starlight as ruler'),
    ('Cosmic', 'School of the Vast', 'pupil_b', 'Fritz Zwicky', 1898, 1974,
     'Proposed dark matter — galaxy clusters contain more mass than visible matter',
     'School of the Void — invisible, hidden cosmos, dark matter'),

    # --- Poison: School of Toxicology ---
    ('Poison', 'School of Toxicology', 'head', 'Paracelsus', 1493, 1541,
     'Established toxicology; "the dose makes the poison" — LD50 principle', None),
    ('Poison', 'School of Toxicology', 'pupil_a', 'Mathieu Orfila', 1787, 1853,
     'Founded forensic toxicology — systematic methods to detect poisons in body',
     'School of Detection — identifying and understanding poison, the detective'),
    ('Poison', 'School of Toxicology', 'pupil_b', 'Carl Wilhelm Scheele', 1742, 1786,
     'Discovered chlorine, hydrogen cyanide, fluoride; likely died from exposure',
     'School of Corrosion — creating and concentrating poison, the alchemist'),

    # --- Sound: School of Acoustics ---
    ('Sound', 'School of Acoustics', 'head', 'Alexander Graham Bell', 1847, 1922,
     'Invented telephone; pioneered acoustics and sound transmission', None),
    ('Sound', 'School of Acoustics', 'pupil_a', 'Ernst Chladni', 1756, 1827,
     'Visualized sound vibrations as geometric patterns on vibrating plates',
     'School of Resonance — sound as structure and geometry, standing waves'),
    ('Sound', 'School of Acoustics', 'pupil_b', 'Christian Doppler', 1803, 1853,
     'Doppler effect — frequency changes based on relative motion',
     'School of the Wave — sound as motion and change, dynamic shifting'),

    # --- Crystal: School of Frequency ---
    ('Crystal', 'School of Frequency', 'head', 'Heinrich Hertz', 1857, 1894,
     'First proved electromagnetic waves exist; measured frequency. Hz named after him', None),
    ('Crystal', 'School of Frequency', 'pupil_a', 'Pierre Curie', 1859, 1906,
     'Discovered piezoelectricity — crystals generate electric charge under stress',
     'School of the Living Crystal — crystals that vibrate, generate electricity, keep time'),
    ('Crystal', 'School of Frequency', 'pupil_b', 'Auguste Bravais', 1811, 1863,
     'Classified all possible crystal lattice structures into 14 arrangements',
     'School of the Eternal Lattice — perfect repeating geometry, unchanging, timeless'),

    # --- Ghost: School of Entropy ---
    ('Ghost', 'School of Entropy', 'head', 'Ludwig Boltzmann', 1844, 1906,
     'Founded statistical mechanics; gave entropy its mathematical definition (S = k log W)', None),
    ('Ghost', 'School of Entropy', 'pupil_a', 'Ernest Rutherford', 1871, 1937,
     'Discovered radioactive half-life; laws of radioactive decay',
     'School of Decay — specific things dying on measurable timescales'),
    ('Ghost', 'School of Entropy', 'pupil_b', 'Rudolf Clausius', 1822, 1888,
     'Formulated second law of thermodynamics; coined "entropy"',
     'School of Entropy — universal cosmic death, all energy dissipates'),

    # --- Heat: School of Thermodynamics ---
    ('Heat', 'School of Thermodynamics', 'head', 'Sadi Carnot', 1796, 1832,
     'Founded thermodynamics; established max efficiency of heat engines', None),
    ('Heat', 'School of Thermodynamics', 'pupil_a', 'Count Rumford (Benjamin Thompson)', 1753, 1814,
     'Proved heat generated by mechanical work (friction); overthrew caloric theory',
     'School of Friction — heat created by action, rubbing, drilling'),
    ('Heat', 'School of Thermodynamics', 'pupil_b', 'Joseph Fourier', 1768, 1830,
     'Fourier\'s Law of heat conduction; mathematically described how heat flows',
     'School of Conduction — heat transferred and spreading, flow from hot to cold'),

    # --- Magnetic: School of Fields ---
    ('Magnetic', 'School of Fields', 'head', 'James Clerk Maxwell', 1831, 1879,
     'Unified electricity, magnetism, light into Maxwell\'s equations', None),
    ('Magnetic', 'School of Fields', 'pupil_a', 'Nikola Tesla', 1856, 1943,
     'Invented AC motor, Tesla coil; pioneered rotating magnetic fields and wireless energy',
     'School of the Field — magnetism as active, radiant, far-reaching'),
    ('Magnetic', 'School of Fields', 'pupil_b', 'William Gilbert', 1544, 1603,
     'De Magnete (1600) — first systematic study of magnetism; Earth is giant magnet',
     'School of the Lodestone — magnetism as inherent, attracting, grounding'),
]


# =============================================
# Counter Design Data (unchanged from previous)
# (source, target, grounding, mechanism, is_mutual, is_confirmed)
# =============================================

COUNTERS = [
    # --- Water resistances ---
    ('Water', 'Fire',        3, 'Extinguishing — water removes heat and smothers flame', 0, 1),
    ('Water', 'Earth',       2, 'Erosion — water wears down and reshapes stone', 0, 0),
    ('Water', 'Sound',       2, 'Refraction — sound loses coherence at air/water boundaries', 0, 0),
    ('Water', 'Heat',        2, 'Cooling — water absorbs thermal energy (high specific heat capacity)', 0, 0),
    ('Water', 'Radioactive', 2, 'Cooling — water absorbs neutrons and moderates reactions', 0, 0),
    ('Water', 'Metal',       1, 'Corrosion — water rusts and degrades metal over time', 0, 0),

    # --- Fire resistances ---
    ('Fire', 'Ice',      3, 'Melting — heat destroys frozen state', 0, 0),
    ('Fire', 'Plant',    3, 'Burning — fire consumes organic matter', 0, 0),
    ('Fire', 'Crystal',  2, 'Thermal shock — intense heat causes expansion fractures in rigid crystal', 0, 0),
    ('Fire', 'Metal',    2, 'Forge heat — fire softens and weakens metal', 0, 0),
    ('Fire', 'Poison',   2, 'Incineration — flame burns off volatile toxins', 0, 0),
    ('Fire', 'Ghost',    1, 'Purification — fire burns away spectral forms (mythological tradition)', 0, 0),

    # --- Earth resistances ---
    ('Earth', 'Electric',  3, 'Grounding — earth dissipates electrical charge harmlessly', 0, 0),
    ('Earth', 'Air',       2, 'Too massive — earth cannot be displaced by air currents', 0, 0),
    ('Earth', 'Cosmic',    2, 'Grounded mass — too solid and massive for spatial manipulation', 0, 0),
    ('Earth', 'Fire',      2, 'Smothering — earth/sand starves fire of oxygen', 0, 0),
    ('Earth', 'Heat',      2, 'Thermal mass — dense earth absorbs and slowly dissipates heat', 0, 0),
    ('Earth', 'Magnetic',  2, 'Mass and shielding — earth absorbs and redirects magnetic flux', 0, 0),
    ('Earth', 'Sound',     2, 'Density blocks — thick stone walls muffle sound waves', 1, 0),
    ('Earth', 'Crystal',   1, 'Crushing force — sheer mass and pressure shatters crystal', 0, 0),
    ('Earth', 'Poison',    1, 'Containment — earth absorbs and traps toxins', 0, 0),

    # --- Air resistances ---
    ('Air', 'Poison', 3, 'Dispersal — wind dilutes toxic concentration below effective thresholds', 0, 0),
    ('Air', 'Ghost',  2, 'Dispersal — wind scatters spectral/intangible forms', 0, 0),
    ('Air', 'Sound',  2, 'Wind distortion — moving air disrupts sound wave propagation', 0, 0),
    ('Air', 'Fire',   1, 'Oxygen starvation — air can starve flame (but also fans it — ambiguous)', 0, 0),
    ('Air', 'Plant',  1, 'Desiccation — persistent wind dries out and uproots growth', 0, 0),

    # --- Metal resistances ---
    ('Metal', 'Plant',   3, 'Cutting and clearing — blades overcome organic matter', 0, 0),
    ('Metal', 'Ice',     3, 'Structural force — hard metal shatters brittle ice', 0, 0),
    ('Metal', 'Crystal', 2, 'Ductility vs brittleness — flexibility overcomes rigidity', 0, 0),
    ('Metal', 'Earth',   2, 'Harder than stone — metal tools carve and break rock', 0, 0),
    ('Metal', 'Ghost',   1, 'Iron warding — forged metal repels spirits (cultural tradition)', 0, 0),

    # --- Plant resistances ---
    ('Plant', 'Cosmic',   1, 'Life anchors — biological growth resists emptiness of space', 0, 0),
    ('Plant', 'Earth',    2, 'Roots break stone — organic growth splits solid rock', 0, 0),
    ('Plant', 'Electric', 2, 'Wood insulates — organic matter resists electrical conduction', 0, 0),
    ('Plant', 'Magnetic', 2, 'Diamagnetic immunity — organic matter invisible to magnetic fields', 0, 0),
    ('Plant', 'Poison',   2, 'Natural remedies — biological filtration neutralizes toxins', 1, 0),
    ('Plant', 'Sound',    2, 'Acoustic absorption — foliage naturally dampens sound waves', 0, 0),
    ('Plant', 'Water',    2, 'Absorption — plants consume and channel water', 0, 0),

    # --- Ice resistances ---
    ('Ice', 'Water',    3, 'Freezing — phase change locks liquid into solid', 0, 0),
    ('Ice', 'Plant',    3, 'Frost — cold kills growth and cellular structure', 0, 0),
    ('Ice', 'Air',      2, 'Cold stills gas — freezing reduces pressure and movement', 0, 0),
    ('Ice', 'Electric', 2, 'Frozen conductors — extreme cold slows electron movement', 0, 0),
    ('Ice', 'Heat',     2, 'Temperature opposition — extreme cold directly combats heat', 0, 0),
    ('Ice', 'Earth',    1, 'Frost heaving — ice expansion cracks and splits stone', 0, 0),

    # --- Electric resistances ---
    ('Electric', 'Water',    3, 'Electrolysis and shock — charge disrupts liquid', 0, 0),
    ('Electric', 'Air',      3, 'Lightning — electrical discharge ionizes gas', 0, 0),
    ('Electric', 'Magnetic', 2, 'Field disruption — changing electric fields disrupt magnetic alignment', 1, 0),
    ('Electric', 'Metal',    2, 'Conductivity overload — electric surge overwhelms metal', 0, 0),
    ('Electric', 'Ghost',    1, 'Disruption — electrical energy destabilizes spectral forms', 0, 0),

    # --- Radioactive resistances ---
    ('Radioactive', 'Plant',  3, 'Radiation kills life — nuclear energy destroys living tissue', 0, 0),
    ('Radioactive', 'Earth',  2, 'Contamination — radiation destabilizes solid ground', 0, 0),
    ('Radioactive', 'Ice',    2, 'Nuclear heat — thermal radiation melts frozen structures', 0, 0),
    ('Radioactive', 'Poison', 2, 'Overwhelming force — radiation overpowers chemical toxins', 0, 0),
    ('Radioactive', 'Ghost',  1, 'Nuclear energy — overwhelming force disrupts spectral forms', 0, 0),

    # --- Cosmic resistances ---
    ('Cosmic', 'Air',      3, 'Vacuum — no air in space, removes the medium entirely', 0, 0),
    ('Cosmic', 'Sound',    3, 'No medium — sound cannot travel through the void', 0, 0),
    ('Cosmic', 'Fire',     3, 'Vacuum — no oxygen in space starves combustion', 0, 0),
    ('Cosmic', 'Heat',     2, 'Cold of space — near-absolute-zero void drains thermal energy', 0, 0),
    ('Cosmic', 'Ice',      2, 'Absolute zero — cosmic cold freezes beyond what ice can withstand', 0, 0),
    ('Cosmic', 'Electric', 1, 'Cosmic dispersal — charge dissipates across vast distances', 0, 0),

    # --- Poison resistances ---
    ('Poison', 'Water', 2, 'Contamination — toxins corrupt water purity', 0, 0),
    ('Poison', 'Plant', 2, 'Toxins kill growth — chemical poisons kill plant life', 1, 0),
    ('Poison', 'Earth', 2, 'Toxic saturation — poison seeps into and corrupts soil', 0, 0),
    ('Poison', 'Metal', 2, 'Corrosion and acid — chemical agents eat through metal', 0, 0),
    ('Poison', 'Ice',   1, 'Toxic antifreeze — poison prevents clean freezing', 0, 0),

    # --- Sound resistances ---
    ('Sound', 'Crystal',  3, 'Resonance shattering — vibration at natural frequency tears lattice apart', 0, 0),
    ('Sound', 'Earth',    2, 'Seismic waves — sound through solid shatters stone', 1, 0),
    ('Sound', 'Ice',      2, 'Vibration cracking — sonic energy fractures brittle structures', 0, 0),
    ('Sound', 'Magnetic', 2, 'Domain disruption — vibration shakes magnetic domains out of alignment', 0, 0),
    ('Sound', 'Metal',    2, 'Vibration fatigue — sustained resonance causes stress fractures', 0, 0),
    ('Sound', 'Ghost',    1, 'Resonant exorcism — disruptive frequencies dissipate spectral forms', 0, 0),

    # --- Crystal resistances ---
    ('Crystal', 'Electric',    3, 'Piezoelectric absorption — lattice absorbs and redirects charge', 0, 0),
    ('Crystal', 'Cosmic',      2, 'Lattice stability — rigid bonds resist spatial warping', 0, 0),
    ('Crystal', 'Poison',      2, 'Chemical purity — ordered structure resists and filters toxins', 0, 0),
    ('Crystal', 'Ghost',       1, 'Ordered structure — rigid order opposes entropic spectral nature', 0, 0),
    ('Crystal', 'Heat',        1, 'Heat-resistant lattice — some structures withstand extreme temperature', 0, 0),
    ('Crystal', 'Ice',         1, 'Crystalline superiority — true lattice more ordered than frozen water', 0, 0),
    ('Crystal', 'Radioactive', 1, 'Radiation trapping — lattice structures absorb particles', 0, 0),
    ('Crystal', 'Sound',       1, 'Anti-resonance — at non-resonant frequencies, crystal absorbs vibration', 1, 0),

    # --- Ghost resistances ---
    ('Ghost', 'Plant',   2, 'Decay and parasitism — death consumes life, draining vitality', 0, 0),
    ('Ghost', 'Cosmic',  1, 'Dark matter — spectral forces occupy the spaces between', 0, 0),
    ('Ghost', 'Crystal', 1, 'Entropy — decay and disorder dissolve ordered structure', 0, 0),
    ('Ghost', 'Earth',   1, 'Phase through solid — intangible forms bypass physical barriers', 0, 0),
    ('Ghost', 'Ice',     1, 'Cold affinity — death and cold are thematically aligned', 0, 0),
    ('Ghost', 'Metal',   1, 'Intangibility — ghosts pass through metal, negating defenses', 0, 0),
    ('Ghost', 'Poison',  1, 'Undead immunity — spectral forms have no biology to poison', 0, 0),

    # --- Heat resistances ---
    ('Heat', 'Ice',      3, 'Thermodynamic opposite — heat dissolves all frozen states', 0, 0),
    ('Heat', 'Metal',    3, 'Melting — extreme heat weakens metallic bonds', 0, 0),
    ('Heat', 'Magnetic', 3, 'Curie point — heating past critical temperature destroys magnetism', 0, 0),
    ('Heat', 'Crystal',  2, 'Thermal stress — rapid heating cracks crystal along fault lines', 0, 0),
    ('Heat', 'Plant',    2, 'Desiccation — extreme heat dries out organic matter', 0, 0),
    ('Heat', 'Poison',   2, 'Thermal decomposition — extreme heat breaks down chemical compounds', 0, 0),
    ('Heat', 'Sound',    2, 'Thermal turbulence — heat-warped air distorts sound waves', 0, 0),

    # --- Magnetic resistances ---
    ('Magnetic', 'Metal',    3, 'Electromagnetic control — fields attract and manipulate metal', 0, 0),
    ('Magnetic', 'Cosmic',   2, 'Magnetosphere — magnetic fields deflect cosmic radiation', 0, 0),
    ('Magnetic', 'Electric', 2, 'Field containment — magnetic fields capture and redirect charge', 1, 0),
    ('Magnetic', 'Ice',      2, 'Eddy current heating — electromagnetic interaction melts ice', 0, 0),
    ('Magnetic', 'Ghost',    1, 'EMF interaction — electromagnetic fields detect spectral forms', 0, 0),
]


# =============================================
# Type Combination Ideas
# (type_a, type_b, amount_a, amount_b, name, description, nature, mechanic, process, is_selected)
# nature = what it IS (spell/element/phenomenon/material/effect)
# mechanic = which game system it maps to (spell/storm/super_power)
# process = the real-world science process grounding this combination
# Canonical ordering: type_a sort_order <= type_b sort_order
# =============================================

TYPE_COMBOS = [
    # === Pure-type (higher cost) ===
    ('Fire',  None, 4, 0, 'Inferno',    'Overwhelming fire damage to all nearby targets', 'spell', 'spell', None, 0),
    ('Earth', None, 4, 0, 'Monolith',   'Raise an impervious stone pillar', 'spell', 'spell', None, 0),
    ('Water', None, 4, 0, 'Tidal Wave', 'Massive wave crashing across the board', 'spell', 'spell', None, 0),
    ('Air',   None, 4, 0, 'Cyclone',    'Sustained vortex displacing everything in area', 'spell', 'spell', None, 0),

    # === Fire + Earth (Composition → Metal) ===
    ('Fire', 'Earth', 2, 1, 'Lava Flow',     'Molten rock that damages and reshapes terrain', 'element', 'storm', 'Melting', 0),
    ('Fire', 'Earth', 1, 2, 'Magma Chamber',  'Pressurized underground heat building toward eruption', 'phenomenon', 'storm', 'Geothermal Pressure', 0),
    ('Fire', 'Earth', 1, 1, 'Forge Strike',   'Strike with the combined force of fire and earth', 'spell', 'spell', 'Smelting', 0),
    ('Fire', 'Earth', 1, 3, 'Glass',          'Sand fused by intense heat into transparent solid', 'material', 'spell', 'Vitrification', 0),
    ('Fire', 'Earth', 1, 1, 'Kiln Firing',    'Heat hardens wet earth into ceramic — permanent defense boost', 'spell', 'spell', 'Kiln Firing', 0),
    ('Fire', 'Earth', 1, 1, 'Calcination',    'Heat drives off volatiles — strip to base properties', 'spell', 'spell', 'Calcination', 0),
    ('Fire', 'Earth', 2, 2, 'Volcanic Eruption', 'Magma breaks through crust — persistent damage + terrain disruption', 'phenomenon', 'storm', 'Volcanic Formation', 0),
    ('Fire', 'Earth', 1, 1, 'Geothermal Vents', 'Heat escapes through cracks — passive resource generation', 'phenomenon', 'storm', 'Geothermal Pressure', 0),

    # === Fire + Water (Counter: Water > Fire) ===
    ('Fire', 'Water', 1, 2, 'Steam',          'Pressurized vapor with scalding force', 'element', 'spell', 'Evaporation', 0),
    ('Fire', 'Water', 2, 1, 'Smoke',          'Thick obscuring cloud from incomplete combustion', 'element', 'spell', 'Combustion', 0),
    ('Fire', 'Water', 1, 1, 'Geyser',         'Eruption of superheated water from below', 'spell', 'spell', 'Geothermal Pressure', 0),
    ('Fire', 'Water', 2, 1, 'Quenching',      'Liquid rapidly cools hot solid — hard counter', 'spell', 'spell', 'Quenching', 0),
    ('Fire', 'Water', 1, 1, 'Distillation',   'Heat separates liquid components — purification', 'spell', 'spell', 'Distillation', 0),
    ('Fire', 'Water', 1, 1, 'Steam Vents',    'Superheated water erupts — area denial', 'phenomenon', 'storm', 'Flash Vaporization', 0),
    ('Fire', 'Water', 2, 2, 'Thermal Shock Front', 'Hot and cold air masses collide — linear AoE', 'phenomenon', 'storm', 'Thermal Equilibrium', 0),
    ('Fire', 'Water', 1, 2, 'Boiling Sea',    'Volcanic heat under liquid — water zones become damage zones', 'phenomenon', 'storm', 'Flash Vaporization', 0),

    # === Fire + Air (Composition → Electric) ===
    ('Fire', 'Air', 2, 1, 'Wildfire',         'Wind-driven uncontrollable blaze spreading fast', 'phenomenon', 'storm', 'Combustion', 0),
    ('Fire', 'Air', 1, 1, 'Ember Storm',      'Glowing sparks carried on hot wind', 'spell', 'spell', 'Convection', 0),
    ('Fire', 'Air', 1, 2, 'Smoke Screen',     'Controlled smoke for concealment and misdirection', 'spell', 'spell', 'Combustion', 0),
    ('Fire', 'Air', 1, 1, 'Ionization',       'Extreme heat strips electrons from gas — plasma', 'spell', 'spell', 'Ionization', 0),
    ('Fire', 'Air', 2, 1, 'Smoke Pall',       'Combustion fills atmosphere — vision reduction + DoT', 'phenomenon', 'storm', 'Combustion', 0),
    ('Fire', 'Air', 2, 2, 'Lightning Storm',  'Atmospheric charge repeats — random Electric strikes', 'phenomenon', 'storm', 'Electrostatic Discharge', 0),

    # === Fire + Metal (Parent → child) ===
    ('Fire', 'Metal', 2, 1, 'Molten Slag',    'Superheated liquid metal burning through defenses', 'element', 'spell', 'Molten Flow', 0),
    ('Fire', 'Metal', 1, 2, 'Tempered Blade',  'Fire-strengthened metal weapon', 'spell', 'spell', 'Tempering', 0),
    ('Fire', 'Metal', 1, 1, 'Forge',          'Heat + force shapes metal — create or upgrade', 'spell', 'spell', 'Forging', 0),
    ('Fire', 'Metal', 2, 1, 'Thermite',       'Metal + oxidizer → unextinguishable burn', 'spell', 'spell', 'Thermite Reaction', 0),
    ('Fire', 'Metal', 1, 2, 'Carburize',      'Carbon + iron → steel — tier upgrade', 'spell', 'spell', 'Carburization', 0),
    ('Fire', 'Metal', 2, 2, 'Forge Heat',     'Sustained heat for metalwork — Metal costs reduced', 'phenomenon', 'storm', 'Forging', 0),
    ('Fire', 'Metal', 2, 2, 'Molten Rain',    'Eruption scatters liquid metal — AoE + persistent hazards', 'phenomenon', 'storm', 'Molten Flow', 0),

    # === Fire + Plant (Counter: Fire > Plant) ===
    ('Fire', 'Plant', 2, 1, 'Ash',            'Remains of consumed organic matter', 'element', 'spell', 'Combustion', 0),
    ('Fire', 'Plant', 1, 1, 'Charcoal',       'Slow-burned organic fuel storing latent energy', 'material', 'spell', 'Pyrolysis', 0),
    ('Fire', 'Plant', 1, 1, 'Ash Fertilization', 'Burned matter enriches soil — destruction → growth resource', 'spell', 'spell', 'Ash Fertilization', 0),
    ('Fire', 'Plant', 1, 1, 'Cauterize',      'Heat seals living tissue — stop healing but prevent decay', 'spell', 'spell', 'Cauterization', 0),

    # === Fire + Ice (Counter: Fire > Ice) ===
    ('Fire', 'Ice', 2, 1, 'Flash Thaw',       'Sudden melting causing unexpected flood surge', 'spell', 'spell', 'Melting', 0),
    ('Fire', 'Ice', 1, 1, 'Obsidian',         'Volcanic glass formed from rapid lava cooling', 'material', 'spell', 'Rapid Quench', 0),
    ('Fire', 'Ice', 1, 1, 'Thermal Shock',    'Rapid temp change fractures — bonus damage to frozen', 'spell', 'spell', 'Thermal Shock', 0),
    ('Fire', 'Ice', 2, 2, 'Glacial Outburst', 'Volcanic heat melts glacier — catastrophic flood', 'phenomenon', 'storm', 'Flash Vaporization', 0),
    ('Fire', 'Ice', 2, 1, 'Steam Explosion',  'Lava contacts ice — violent AoE burst', 'phenomenon', 'storm', 'Flash Vaporization', 0),

    # === Fire + Electric (Parent → child) ===
    ('Fire', 'Electric', 1, 1, 'Plasma Arc',   'Ionized gas conducting devastating energy', 'spell', 'spell', 'Plasma Formation', 0),
    ('Fire', 'Electric', 2, 1, 'Solar Flare',  'Eruption of stellar electromagnetic energy', 'spell', 'spell', 'Incandescence', 0),
    ('Fire', 'Electric', 1, 1, 'Arc Welding',  'Electric arc fuses metal — permanent bonds', 'spell', 'spell', 'Arc Welding', 0),

    # === Fire + Poison ===
    ('Fire', 'Poison', 1, 1, 'Toxic Fumes',   'Burning poison releasing deadly gas cloud', 'element', 'spell', None, 0),
    ('Fire', 'Poison', 2, 1, 'Napalm',        'Clinging fire that poisons as it burns', 'spell', 'spell', None, 0),

    # === Fire + Radioactive (Parent ↔ Dark) ===
    ('Fire', 'Radioactive', 1, 1, 'Nuclear Chain Reaction', 'Thermal neutrons sustain fission — escalating damage', 'spell', 'spell', 'Nuclear Chain Reaction', 0),
    ('Fire', 'Radioactive', 2, 2, 'Nuclear Fallout', 'Radioactive particles rain down — destroyed towers leave radiation', 'phenomenon', 'storm', 'Nuclear Chain Reaction', 0),
    ('Fire', 'Radioactive', 2, 1, 'Solar Flare Storm', 'Star ejects radiation burst + lingering DoT', 'phenomenon', 'storm', 'Stellar Nucleosynthesis', 0),

    # === Earth + Water (Composition → Plant) ===
    ('Earth', 'Water', 1, 1, 'Mud',           'Slowing, trapping mixture reducing movement', 'element', 'spell', 'Hydration', 0),
    ('Earth', 'Water', 2, 1, 'Quicksand',     'Saturated ground that swallows and traps targets', 'spell', 'spell', 'Hydration', 0),
    ('Earth', 'Water', 1, 2, 'Clay',          'Moldable earth-water compound for building', 'material', 'spell', 'Hydration', 0),
    ('Earth', 'Water', 1, 1, 'Sand',          'Water breaks solid into sediment — gradual reduction', 'material', 'spell', 'Erosion', 0),
    ('Earth', 'Water', 1, 1, 'Sedimentation', 'Particles settle from liquid — terrain creation', 'spell', 'spell', 'Sedimentation', 0),
    ('Earth', 'Water', 2, 2, 'Flood',         'Water overwhelms terrain — board-wide resource disruption', 'phenomenon', 'storm', 'Erosion', 0),
    ('Earth', 'Water', 2, 1, 'Mudslide',      'Saturated earth flows downhill — repositioning + damage', 'phenomenon', 'storm', 'Erosion', 0),
    ('Earth', 'Water', 2, 2, 'Monsoon',       'Sustained heavy precipitation — Water flood + Earth softening', 'phenomenon', 'storm', 'Precipitation', 0),

    # === Earth + Air (No composition) ===
    ('Earth', 'Air', 1, 1, 'Dust Storm',      'Blinding particulate whirlwind', 'spell', 'storm', 'Aeolian Erosion', 0),
    ('Earth', 'Air', 2, 1, 'Sand Blast',      'Abrasive wind-driven earth particles', 'spell', 'spell', 'Aeolian Erosion', 0),
    ('Earth', 'Air', 1, 2, 'Erosion',         'Gradual wearing away of defenses over time', 'phenomenon', 'spell', 'Aeolian Erosion', 0),
    ('Earth', 'Air', 1, 1, 'Compression',     'Solid resists gas pressure — densification', 'spell', 'spell', 'Compression', 0),
    ('Earth', 'Air', 1, 2, 'Pneumatic Force',  'Compressed gas moves solid — repositioning', 'spell', 'spell', 'Pneumatic Force', 0),
    ('Earth', 'Air', 2, 2, 'Sandstorm',       'Wind lifts solid particulate — vision + abrasion', 'phenomenon', 'storm', 'Aeolian Erosion', 0),
    ('Earth', 'Air', 2, 2, 'Earthquake',      'Pressure wave through ground — board-wide repositioning', 'phenomenon', 'storm', 'Ground Coupling', 0),
    ('Earth', 'Air', 2, 1, 'Avalanche',       'Overloaded mass slides — delayed burst', 'phenomenon', 'storm', 'Gravitational Mass Wasting', 0),

    # === Earth + Metal (Parent → child) ===
    ('Earth', 'Metal', 1, 1, 'Ore Vein',      'Raw mineral deposit — draw resources', 'material', 'spell', 'Mining / Extraction', 0),
    ('Earth', 'Metal', 2, 1, 'Spike Trap',    'Metal shards erupting from ground', 'spell', 'spell', None, 0),
    ('Earth', 'Metal', 1, 1, 'Reinforce',     'Metal braces ground — stacking defenses', 'spell', 'spell', 'Reinforcement', 0),

    # === Earth + Plant (Parent → child) ===
    ('Earth', 'Plant', 1, 1, 'Ancient Forest', 'Deep-rooted old growth providing cover and resources', 'phenomenon', 'spell', 'Ecosystem Formation', 0),
    ('Earth', 'Plant', 1, 2, 'Entangle',       'Roots burst from earth to trap targets', 'spell', 'spell', 'Root Anchoring', 0),
    ('Earth', 'Plant', 2, 1, 'Fertile Soil',   'Enriched ground accelerating all growth', 'material', 'spell', 'Nutrient Cycling', 0),
    ('Earth', 'Plant', 1, 1, 'Petrification',  'Organic replaced by mineral — Plant → Earth conversion', 'spell', 'spell', 'Petrification', 0),
    ('Earth', 'Plant', 1, 1, 'Fossil',         'Organic mineralized over time — dormant value store', 'material', 'spell', 'Fossilization', 0),

    # === Earth + Ice (Neutral) ===
    ('Earth', 'Ice', 1, 1, 'Permafrost',       'Permanently frozen ground — immovable barrier', 'phenomenon', 'storm', 'Permafrost', 0),
    ('Earth', 'Ice', 2, 1, 'Frost Heave',      'Ice expansion cracking and upheaving foundations', 'spell', 'storm', 'Frost Wedging', 0),
    ('Earth', 'Ice', 1, 1, 'Frost Wedging',    'Ice expansion cracks solid rock over time', 'spell', 'spell', 'Frost Wedging', 0),
    ('Earth', 'Ice', 1, 1, 'Glacial Scouring', 'Ice grinds surface smooth — removes Earth features', 'spell', 'spell', 'Glacial Scouring', 0),

    # === Earth + Electric (Counter: Earth > Electric) ===
    ('Earth', 'Electric', 1, 1, 'Grounding',   'Solid redirects current — negate Electric effect', 'spell', 'spell', 'Grounding', 0),
    ('Earth', 'Electric', 1, 2, 'Fulgurite',   'Lightning vitrifies sand — Electric → Crystal', 'material', 'spell', 'Fulgurite Formation', 0),
    ('Earth', 'Electric', 2, 1, 'Piezo Shock',  'Pressure on crystal → charge — Earth produces Electric', 'spell', 'spell', 'Piezoelectric Generation', 0),

    # === Earth + Cosmic (Parent ↔ Dark) ===
    ('Earth', 'Cosmic', 1, 1, 'Gravity Bind',  'Solid mass generates gravity — attraction / pull', 'spell', 'spell', 'Gravitational Binding', 0),
    ('Earth', 'Cosmic', 1, 1, 'Accretion',     'Dust coalesces under gravity — builds larger structures', 'spell', 'spell', 'Planetary Accretion', 0),
    ('Earth', 'Cosmic', 2, 2, 'Gravity Well',  'Increased pull in area — draw effects toward center', 'phenomenon', 'storm', 'Gravitational Binding', 0),
    ('Earth', 'Cosmic', 2, 1, 'Meteor Shower', 'Space debris strikes ground — random AoE', 'phenomenon', 'storm', 'Planetary Accretion', 0),

    # === Water + Air (Composition → Ice) ===
    ('Water', 'Air', 1, 1, 'Mist',             'Obscuring fog reducing visibility for all', 'element', 'spell', 'Condensation', 0),
    ('Water', 'Air', 2, 1, 'Rain',             'Sustained downpour — draw extra resources', 'phenomenon', 'storm', 'Precipitation', 0),
    ('Water', 'Air', 1, 2, 'Cloud Cover',      'Concealing shroud hiding your board state', 'spell', 'storm', 'Condensation', 0),
    ('Water', 'Air', 1, 1, 'Evaporation',      'Liquid → gas phase change', 'spell', 'spell', 'Evaporation', 0),
    ('Water', 'Air', 1, 1, 'Aerosolization',   'Liquid breaks into fine droplets — spread through Air', 'spell', 'spell', 'Aerosolization', 0),
    ('Water', 'Air', 2, 2, 'Fog Bank',         'Vapor suspended in still air — concealment', 'phenomenon', 'storm', 'Condensation', 0),
    ('Water', 'Air', 2, 1, 'Waterspout',       'Vortex over liquid — targeted displacement', 'phenomenon', 'storm', 'Evaporation', 0),

    # === Water + Metal (Tension) ===
    ('Water', 'Metal', 1, 1, 'Rust',           'Corrosive oxide weakening metal structures', 'element', 'spell', 'Corrosion', 0),
    ('Water', 'Metal', 1, 2, 'Quench',         'Rapid cooling to harden or thermally shock', 'spell', 'spell', 'Quenching', 0),
    ('Water', 'Metal', 2, 1, 'Hydraulic Press', 'Liquid pressure through channels — crushing force', 'spell', 'spell', 'Hydraulic Force', 0),
    ('Water', 'Metal', 1, 1, 'Galvanic Cell',   'Metals in electrolyte → current — Water enables Electric', 'spell', 'spell', 'Galvanic Reaction', 0),

    # === Water + Plant (Parent → child) ===
    ('Water', 'Plant', 1, 1, 'Algae Bloom',    'Rapid water-based growth choking resources', 'phenomenon', 'storm', 'Irrigation', 0),
    ('Water', 'Plant', 2, 1, 'Healing Spring',  'Restorative water infused with life energy', 'spell', 'spell', 'Irrigation', 0),
    ('Water', 'Plant', 1, 1, 'Irrigation',      'Liquid nourishes growth — amplify Plant healing', 'spell', 'spell', 'Irrigation', 0),
    ('Water', 'Plant', 1, 1, 'Coral',           'Organisms build mineral structures in liquid', 'material', 'spell', 'Marine Calcification', 0),
    ('Water', 'Plant', 1, 2, 'Fermentation',    'Microbes convert sugars — Plant+Water → Poison precursor', 'spell', 'spell', 'Fermentation', 0),

    # === Water + Ice (Parent → child) ===
    ('Water', 'Ice', 1, 1, 'Slush',            'Semi-frozen mixture that slows movement', 'element', 'spell', 'Freezing', 0),
    ('Water', 'Ice', 1, 2, 'Glacier',          'Massive slow-moving ice formation', 'phenomenon', 'spell', 'Freezing', 0),
    ('Water', 'Ice', 2, 1, 'Hail',             'Frozen projectiles raining from above', 'spell', 'spell', 'Freezing', 0),
    ('Water', 'Ice', 1, 1, 'Supercooling',     'Liquid below freezing, not yet solid — trigger on disturbance', 'spell', 'spell', 'Supercooling', 0),
    ('Water', 'Ice', 2, 2, 'Flash Freeze',     'Rapid temp drop freezes liquid — board-wide Water → Ice', 'phenomenon', 'storm', 'Freezing', 0),
    ('Water', 'Ice', 2, 1, 'Thaw',             'Warming releases frozen liquid — board-wide Ice → Water', 'phenomenon', 'storm', 'Melting', 0),

    # === Water + Electric (Synergy) ===
    ('Water', 'Electric', 1, 1, 'Conductivity', 'Liquid carries current — Electric amplified through Water', 'spell', 'spell', 'Conductivity', 0),
    ('Water', 'Electric', 1, 2, 'Electrolysis',  'Current splits liquid into parts', 'spell', 'spell', 'Electrolysis', 0),
    ('Water', 'Electric', 2, 1, 'Hydroelectric',  'Flowing liquid drives generator — Water generates Electric', 'spell', 'spell', 'Hydroelectric Generation', 0),
    ('Water', 'Electric', 2, 2, 'Electrified Sea', 'Current through liquid body — Water zones become Electric hazards', 'phenomenon', 'storm', 'Conductivity', 0),

    # === Water + Poison (Parent ↔ Dark) ===
    ('Water', 'Poison', 1, 1, 'Toxic Pool',    'Contaminated water damaging over time', 'element', 'spell', 'Dissolution', 0),
    ('Water', 'Poison', 2, 1, 'Acid Rain',     'Corrosive precipitation melting defenses', 'spell', 'storm', 'Dissolution', 0),
    ('Water', 'Poison', 1, 1, 'Bioaccumulation', 'Organisms concentrate toxins over repeated exposure', 'spell', 'spell', 'Bioaccumulation', 0),
    ('Water', 'Poison', 2, 2, 'Red Tide',       'Toxic bloom in water — Water zones become Poison', 'phenomenon', 'storm', 'Dissolution', 0),

    # === Air + Metal (Neutral) ===
    ('Air', 'Metal', 1, 1, 'Oxidation',        'Gas slowly degrades metal surface — mild corrosion', 'spell', 'spell', 'Oxidation', 0),
    ('Air', 'Metal', 1, 2, 'Turbine',          'Engine compresses gas → speed/range boost', 'spell', 'spell', 'Turbine Propulsion', 0),
    ('Air', 'Metal', 2, 1, 'Bellows',          'Forced gas amplifies combustion — boosts Fire', 'spell', 'spell', 'Bellows Effect', 0),
    ('Air', 'Metal', 1, 1, 'Resonant Vibration', 'Gas flow vibrates structure — Air → Sound through Metal', 'spell', 'spell', 'Resonant Vibration', 0),

    # === Air + Plant (Synergy) ===
    ('Air', 'Plant', 1, 1, 'Dandelion',        'Wind carries seeds — spread Plant effects to new targets', 'spell', 'spell', 'Seed Dispersal', 0),
    ('Air', 'Plant', 1, 1, 'Photosynthesis',   'Gas exchange: CO2 → O2 — mutual resource generation', 'spell', 'spell', 'Photosynthesis', 0),
    ('Air', 'Plant', 1, 2, 'Spore Cloud',      'Gas carries particles — AoE Plant status application', 'spell', 'spell', 'Spore Dispersal', 0),
    ('Air', 'Plant', 2, 2, 'Pollen Storm',     'Mass release carried by wind — AoE Plant effects everywhere', 'phenomenon', 'storm', 'Seed Dispersal', 0),
    ('Air', 'Plant', 2, 1, 'Canopy Effect',    'Dense growth blocks sky — reduces Air/Electric in zone', 'phenomenon', 'storm', 'Photosynthesis', 0),

    # === Air + Ice (Parent → child) ===
    ('Air', 'Ice', 1, 1, 'Blizzard',           'Sustained wind-driven ice storm', 'spell', 'storm', 'Wind Chill', 0),
    ('Air', 'Ice', 1, 2, 'Frost Wind',         'Freezing gale that slows and chills targets', 'spell', 'spell', 'Wind Chill', 0),
    ('Air', 'Ice', 1, 1, 'Cryogenic Compression', 'Compressed gas drops temperature — Air → Ice under pressure', 'spell', 'spell', 'Cryogenic Compression', 0),
    ('Air', 'Ice', 2, 2, 'Hailstorm',          'Convective uplift → ice projectiles — random Ice damage', 'phenomenon', 'storm', 'Wind Chill', 0),

    # === Air + Electric (Parent → child) ===
    ('Air', 'Electric', 1, 1, 'Thunder',       'Sonic boom of electrical discharge', 'phenomenon', 'spell', 'Sonic Boom', 0),
    ('Air', 'Electric', 2, 1, 'Ball Lightning', 'Erratic floating electrical sphere', 'spell', 'spell', 'Atmospheric Discharge', 0),
    ('Air', 'Electric', 1, 1, 'Ionization',    'Electric strips electrons from gas — plasma conversion', 'spell', 'spell', 'Ionization', 0),
    ('Air', 'Electric', 2, 2, 'Thunderstorm',  'Repeated atmospheric discharge — random strikes', 'phenomenon', 'storm', 'Atmospheric Discharge', 0),

    # === Air + Sound (Parent ↔ Dark) ===
    ('Air', 'Sound', 1, 1, 'Wave Propagation',  'Pressure oscillates through gas — ranged effect', 'spell', 'spell', 'Wave Propagation', 0),
    ('Air', 'Sound', 1, 1, 'Resonance',         'Matching frequency amplifies — destructive amplitude', 'spell', 'spell', 'Resonance', 0),
    ('Air', 'Sound', 2, 2, 'Thunder Clap',      'Shockwave from rapid heating — burst Sound damage', 'phenomenon', 'storm', 'Sonic Boom', 0),
    ('Air', 'Sound', 2, 1, 'Infrasound',        'Sub-audible pressure waves — debuff accuracy', 'phenomenon', 'storm', 'Wave Propagation', 0),

    # === Metal + Plant (Counter: Metal > Plant) ===
    ('Metal', 'Plant', 1, 1, 'Harvest',         'Metal severs organic — destroy Plant + gain resources', 'spell', 'spell', 'Cutting / Harvesting', 0),
    ('Metal', 'Plant', 1, 2, 'Trellis',         'Metal supports growth — scaffolding', 'spell', 'spell', 'Trellising', 0),
    ('Metal', 'Plant', 2, 1, 'Nutrient Uptake',  'Organisms absorb metal ions — Plant absorbs Metal', 'spell', 'spell', 'Nutrient Uptake', 0),

    # === Metal + Ice (Tension) ===
    ('Metal', 'Ice', 1, 1, 'Brittle',           'Cold makes metal brittle — debuff', 'spell', 'spell', 'Thermal Stress Fracture', 0),
    ('Metal', 'Ice', 1, 2, 'Cryo-Forge',        'Extreme cold shapes metal — alternative creation', 'spell', 'spell', 'Cryo-Forging', 0),
    ('Metal', 'Ice', 1, 1, 'Chain Freeze',       'Metal transfers cold rapidly — chain freeze through Metal', 'spell', 'spell', 'Thermal Conductivity', 0),
    ('Metal', 'Ice', 2, 2, 'Frozen Machinery',   'Cold seizes mechanisms — Metal permanents disabled', 'phenomenon', 'storm', 'Thermal Stress Fracture', 0),

    # === Metal + Electric (Synergy) ===
    ('Metal', 'Electric', 1, 1, 'Conductor',    'Channeled electrical flow amplifying damage', 'material', 'spell', 'Circuit Conduction', 0),
    ('Metal', 'Electric', 1, 2, 'Arc Welder',   'Focused electrical-metal fusion beam', 'spell', 'spell', 'Arc Welding', 0),
    ('Metal', 'Electric', 1, 1, 'Anodize',      'Electric coats metal — shield + counter-shock', 'spell', 'spell', 'Anodizing', 0),
    ('Metal', 'Electric', 2, 1, 'Resistive Heat', 'Current through metal → heat crossover', 'spell', 'spell', 'Resistive Heating', 0),

    # === Metal + Crystal (Parent ↔ Dark) ===
    ('Metal', 'Crystal', 1, 1, 'Lattice Shift',  'Energy reorganizes structure — convert Metal ↔ Crystal', 'spell', 'spell', 'Lattice Transmutation', 0),
    ('Metal', 'Crystal', 1, 1, 'Piezo Strike',    'Stress on crystal → charge — force to Electric', 'spell', 'spell', 'Piezoelectric Effect', 0),
    ('Metal', 'Crystal', 2, 2, 'Crystalline Resonance', 'Lattice vibrates at frequency — amplify matching type', 'phenomenon', 'storm', 'Piezoelectric Effect', 0),

    # === Plant + Ice (Counter: Ice > Plant) ===
    ('Plant', 'Ice', 1, 1, 'Cell Lysis',        'Ice crystals burst cell walls — direct Plant damage', 'spell', 'spell', 'Cell Lysis', 0),
    ('Plant', 'Ice', 1, 2, 'Dormancy',          'Cold → suspended state — disable but preserve', 'spell', 'spell', 'Dormancy', 0),
    ('Plant', 'Ice', 2, 1, 'Cryopreservation',  'Extreme cold preserves organic — freeze to protect', 'spell', 'spell', 'Cryopreservation', 0),
    ('Plant', 'Ice', 2, 2, 'Frost Blight',      'Killing frost sweeps through — all Plant damage', 'phenomenon', 'storm', 'Cell Lysis', 0),

    # === Plant + Electric (Neutral) ===
    ('Plant', 'Electric', 1, 1, 'Bioelectric Sense', 'Cellular electrical signals — detection / sensing', 'spell', 'spell', 'Bioelectricity', 0),
    ('Plant', 'Electric', 1, 2, 'Nitrogen Fix',  'Lightning enriches soil — Electric boosts Plant growth', 'spell', 'spell', 'Nitrogen Fixation', 0),
    ('Plant', 'Electric', 2, 1, 'Lightning Rod',  'Tall organic attracts discharge — draws Electric', 'spell', 'spell', 'Charge Attraction', 0),

    # === Plant + Poison ===
    ('Plant', 'Poison', 1, 1, 'Toxic Spore',    'Poisonous organic particle cloud', 'element', 'spell', None, 0),
    ('Plant', 'Poison', 1, 2, 'Venomous Vine',  'Reaching tendrils delivering contact poison', 'spell', 'spell', None, 0),
    ('Plant', 'Poison', 2, 1, 'Antidote',       'Natural remedy neutralizing toxic effects', 'spell', 'spell', None, 0),

    # === Plant + Ghost (Parent ↔ Dark) ===
    ('Plant', 'Ghost', 1, 1, 'Haunted Grove',   'Decaying forest draining life from nearby', 'phenomenon', 'spell', 'Decomposition', 0),
    ('Plant', 'Ghost', 1, 2, 'Wither',          'Spectral rot consuming organic matter', 'spell', 'spell', 'Decomposition', 0),
    ('Plant', 'Ghost', 1, 1, 'Mycorrhizal Net',  'Fungal nets detect death — Ghost through Plant', 'spell', 'spell', 'Mycorrhizal Death Network', 0),
    ('Plant', 'Ghost', 2, 2, 'The Withering',    'Decay through living systems — all healing reversed', 'phenomenon', 'storm', 'Decomposition', 0),
    ('Plant', 'Ghost', 2, 1, 'Blight',           'Disease sweeps organic life — Plant DoT', 'phenomenon', 'storm', 'Decomposition', 0),

    # === Ice + Electric (Tension) ===
    ('Ice', 'Electric', 1, 1, 'Frost Spark',    'Freezing electrical discharge', 'spell', 'spell', 'Charge Separation', 0),
    ('Ice', 'Electric', 1, 2, 'Superconductor', 'Extreme cold → zero resistance — costs reduced', 'phenomenon', 'spell', 'Superconductivity', 0),
    ('Ice', 'Electric', 2, 2, 'Electric Hailstorm', 'Charged ice in clouds — amplified Ice+Electric storm', 'phenomenon', 'storm', 'Charge Separation', 0),

    # === Ice + Heat (Parent ↔ Dark) ===
    ('Ice', 'Heat', 1, 1, 'Phase Shift',        'Same substance, different energy — spectrum endpoints', 'spell', 'spell', 'Phase Transition', 0),
    ('Ice', 'Heat', 1, 1, 'Entropy Neutralize',  'Heat flows hot → cold — mutual annihilation', 'spell', 'spell', 'Entropy', 0),
    ('Ice', 'Heat', 2, 1, 'Sublimation',         'Solid → gas, skip liquid — Ice+Heat bypasses Water', 'spell', 'spell', 'Sublimation', 0),
    ('Ice', 'Heat', 2, 2, 'Heat Death',          'Thermal equilibrium — remove all buffs AND debuffs', 'phenomenon', 'storm', 'Entropy', 0),

    # === Radioactive + Cosmic ===
    ('Radioactive', 'Cosmic', 1, 1, 'Supernova',        'Nuclear explosion on cosmic scale', 'phenomenon', 'spell', None, 0),
    ('Radioactive', 'Cosmic', 1, 2, 'Cosmic Radiation',  'Deep space nuclear particles', 'element', 'spell', None, 0),

    # === Cosmic + Ghost ===
    ('Cosmic', 'Ghost', 1, 1, 'Dark Matter',    'Invisible mass draining energy from surroundings', 'phenomenon', 'spell', None, 0),
    ('Cosmic', 'Ghost', 1, 2, 'Black Hole',     'Gravitational singularity consuming all nearby', 'spell', 'spell', None, 0),

    # === Sound + Crystal ===
    ('Sound', 'Crystal', 2, 1, 'Shatter',        'Resonant frequency destroying crystalline target', 'spell', 'spell', None, 0),
    ('Sound', 'Crystal', 1, 2, 'Harmonic Prism',  'Sound refracted through crystal into focused beam', 'spell', 'spell', None, 0),

    # === Sound + Ghost ===
    ('Sound', 'Ghost', 1, 1, 'Wailing Spirits',  'Spectral screams that terrify and weaken', 'spell', 'spell', None, 0),
    ('Sound', 'Ghost', 2, 1, 'Death Knell',      'Bell toll announcing doom — unavoidable damage', 'spell', 'spell', None, 0),

    # === Crystal + Heat ===
    ('Crystal', 'Heat', 1, 2, 'Annealing',        'Heat-treated crystal gaining new properties', 'phenomenon', 'spell', None, 0),
    ('Crystal', 'Heat', 2, 1, 'Thermal Fracture',  'Heat-cracked crystal exploding into shards', 'spell', 'spell', None, 0),

    # === Heat + Magnetic ===
    ('Heat', 'Magnetic', 2, 1, 'Demagnetize',     'Curie point destruction of magnetic alignment', 'spell', 'spell', None, 0),
    ('Heat', 'Magnetic', 1, 1, 'EMP',             'Heat-driven electromagnetic pulse disruption', 'spell', 'spell', None, 0),

    # === Electric + Magnetic (Parent ↔ Dark) ===
    ('Electric', 'Magnetic', 1, 1, 'EM Field',     'Combined electromagnetic field disrupting area', 'phenomenon', 'spell', 'Electromagnetic Induction', 0),
    ('Electric', 'Magnetic', 2, 1, 'Lightning Rod', 'Magnetic field attracting and channeling electricity', 'spell', 'spell', 'Electromagnetic Induction', 0),
    ('Electric', 'Magnetic', 1, 1, "Lenz's Brake",  'Field opposes current change — stabilizer', 'spell', 'spell', "Lenz's Law", 0),
    ('Electric', 'Magnetic', 2, 2, 'EMP Burst',     'Intense EM burst — disable Electric + Metal abilities', 'phenomenon', 'storm', 'Electromagnetic Induction', 0),
    ('Electric', 'Magnetic', 2, 1, 'Polarity Reversal', 'Magnetic poles flip — targeting inverts', 'phenomenon', 'storm', 'Electromagnetic Induction', 0),

    # === Super Powers — one per type ===
    ('Fire',        None, 2, 0, 'TBD — Fire Super Power',        'Ultimate expression of plasma/energy', 'spell', 'super_power', None, 0),
    ('Earth',       None, 2, 0, 'TBD — Earth Super Power',       'Ultimate expression of solid/structure', 'spell', 'super_power', None, 0),
    ('Water',       None, 2, 0, 'TBD — Water Super Power',       'Ultimate expression of liquid/flow', 'spell', 'super_power', None, 0),
    ('Air',         None, 2, 0, 'TBD — Air Super Power',         'Ultimate expression of gas/pressure', 'spell', 'super_power', None, 0),
    ('Metal',       None, 2, 0, 'TBD — Metal Super Power',       'Ultimate harnessed forging/structure', 'spell', 'super_power', None, 0),
    ('Plant',       None, 2, 0, 'TBD — Plant Super Power',       'Ultimate harnessed life/growth', 'spell', 'super_power', None, 0),
    ('Ice',         None, 2, 0, 'TBD — Ice Super Power',         'Ultimate harnessed cold/crystallization', 'spell', 'super_power', None, 0),
    ('Electric',    None, 2, 0, 'TBD — Electric Super Power',    'Ultimate harnessed current/charge', 'spell', 'super_power', None, 0),
    ('Radioactive', None, 2, 0, 'TBD — Radioactive Super Power', 'Ultimate harnessed nuclear force', 'spell', 'super_power', None, 0),
    ('Cosmic',      None, 2, 0, 'TBD — Cosmic Super Power',     'Ultimate harnessed gravity', 'spell', 'super_power', None, 0),
    ('Poison',      None, 2, 0, 'TBD — Poison Super Power',     'Ultimate harnessed chemistry/toxicity', 'spell', 'super_power', None, 0),
    ('Sound',       None, 2, 0, 'TBD — Sound Super Power',      'Ultimate harnessed vibration/resonance', 'spell', 'super_power', None, 0),
    ('Crystal',     None, 2, 0, 'TBD — Crystal Super Power',    'Ultimate harnessed lattice/refraction', 'spell', 'super_power', None, 0),
    ('Ghost',       None, 2, 0, 'TBD — Ghost Super Power',      'Ultimate harnessed death/decay', 'spell', 'super_power', None, 0),
    ('Heat',        None, 2, 0, 'TBD — Heat Super Power',       'Ultimate harnessed thermodynamics', 'spell', 'super_power', None, 0),
    ('Magnetic',    None, 2, 0, 'TBD — Magnetic Super Power',   'Ultimate harnessed EM fields', 'spell', 'super_power', None, 0),
]


# =============================================
# Effect Design — archetypes and expressions
# (category, archetype, name, description, effect_class, is_selected, notes)
# =============================================

EFFECTS = [
    # --- Aggro: Damage ---
    ('aggro', 'damage', 'Direct Damage',          'Deal direct damage to a single target',                      'instant', 1, None),
    ('aggro', 'damage', 'AoE Damage',             'Deal damage to multiple targets simultaneously',             'instant', 0, None),
    ('aggro', 'damage', 'Damage over Time',       'Deal recurring damage each turn for a duration',             'dot',     0, None),
    ('aggro', 'damage', 'Bonus Damage',           'Deal extra damage under specific conditions',                'instant', 0, 'e.g. bonus to frozen targets, scaling with tower count'),
    ('aggro', 'damage', 'Burn',                   'Fire-based damage over time',                                'status',  1, 'Corresponds to Burn in status_effect_design'),
    ('aggro', 'damage', 'Poison DoT',             'Toxin-based damage over time',                               'status',  1, 'Corresponds to Poison in status_effect_design'),

    # --- Aggro: Destroy ---
    ('aggro', 'destroy', 'Destroy Tower',         'Remove a single structure permanently',                      'instant', 1, None),
    ('aggro', 'destroy', 'Destroy Element Source', 'Remove an element source permanently',                      'instant', 0, None),
    ('aggro', 'destroy', 'Destroy Permanent',     'Remove a permanent effect (shield, aura, etc.)',             'instant', 0, None),
    ('aggro', 'destroy', 'Mass Destroy',          'Remove all structures in a zone or of a type',               'instant', 0, 'e.g. Nuke: destroy all towers on an element'),

    # --- Control: Counter ---
    ('control', 'counter', 'Counter Spell',       'Negate a spell being cast',                                  'instant', 1, None),
    ('control', 'counter', 'Counter Action',      'Negate a non-spell action',                                  'instant', 0, None),
    ('control', 'counter', 'Freeze',              'Lock target out of acting for a duration',                   'status',  1, 'Corresponds to Freeze in status_effect_design'),
    ('control', 'counter', 'Paralyze',            'Stronger action lockout',                                    'status',  1, 'Corresponds to Paralyze in status_effect_design'),
    ('control', 'counter', 'Silence',             'Prevent communication (physical rule)',                       'status',  0, 'Corresponds to Silence in status_effect_design'),

    # --- Control: Steal ---
    ('control', 'steal', 'Steal Elements',        'Take elements from an opponent',                             'instant', 1, None),
    ('control', 'steal', 'Steal Tower',           'Take control of an opponent structure',                      'instant', 0, None),
    ('control', 'steal', 'Steal Spell',           'Copy or redirect an opponent spell',                         'instant', 0, None),

    # --- Search: Draw ---
    ('search', 'draw', 'Draw Elements',           'Gain additional elements from element sources',              'instant', 1, None),
    ('search', 'draw', 'Draw Cards',              'Gain additional cards from the spell deck',                  'instant', 0, None),
    ('search', 'draw', 'Reveal',                  'Look at hidden information (opponent hands, deck top)',      'instant', 0, 'Scrying/intel effect'),

    # --- Growth: Revive ---
    ('growth', 'revive', 'Replay Spell',          'Play a spell again from your discard',                       'instant', 1, None),
    ('growth', 'revive', 'Recover Resource',      'Return spent elements or cards to hand',                     'instant', 0, None),
    ('growth', 'revive', 'Resurrect Tower',       'Rebuild a previously destroyed structure',                   'instant', 0, None),

    # --- Growth: Discount ---
    ('growth', 'discount', 'Reduce Cost',         'Lower the cost of future spells or building',                'aura',    1, None),
    ('growth', 'discount', 'Free Cast',           'Play a spell at zero cost',                                  'instant', 0, None),
    ('growth', 'discount', 'Extra Action',        'Gain additional actions this turn',                          'instant', 0, None),

    # --- Defensive: Prevent ---
    ('defensive', 'prevent', 'Damage Prevention', 'Stop or reduce incoming damage for a turn',                  'instant', 1, None),
    ('defensive', 'prevent', 'Immunity',          'Make a target completely untargetable',                       'aura',    0, None),
    ('defensive', 'prevent', 'Redirect',          'Redirect incoming damage or spell to another target',        'instant', 0, None),

    # --- Defensive: Block ---
    ('defensive', 'block', 'Shield',              'Apply a persistent shield that absorbs damage',              'permanent', 1, None),
    ('defensive', 'block', 'Damage Reduction',    'Reduce all incoming damage by a flat amount',                'aura',      0, None),
    ('defensive', 'block', 'Armor',               'Increase durability / max HP',                               'permanent', 0, None),

    # --- Unassigned: Discard ---
    ('unassigned', 'discard', 'Force Discard',       'Force opponent to discard cards or elements',              'instant', 1, None),
    ('unassigned', 'discard', 'Hand Disruption',     'Randomly remove or rearrange opponent hand contents',      'instant', 0, None),
    ('unassigned', 'discard', 'Resource Destruction', 'Destroy opponent elements in play or storage',            'instant', 0, None),
]


# =============================================
# Effect-Type Links — which types use which archetypes
# From spell-archetype-system.md distribution table
# (type_name, effect_name, role, is_selected, notes)
# =============================================

EFFECT_TYPE_LINKS = [
    # Primary types
    ('Fire',    'Direct Damage',     'primary',   1, None),
    ('Fire',    'Destroy Tower',     'primary',   1, None),
    ('Fire',    'Draw Elements',     'secondary', 1, None),
    ('Earth',   'Damage Prevention', 'primary',   1, None),
    ('Earth',   'Shield',            'primary',   1, None),
    ('Earth',   'Direct Damage',     'secondary', 0, 'Weak damage'),
    ('Water',   'Draw Elements',     'primary',   1, None),
    ('Water',   'Direct Damage',     'secondary', 0, 'Weak damage'),
    ('Air',     'Counter Spell',     'primary',   1, None),
    ('Air',     'Force Discard',     'primary',   1, None),
    ('Air',     'Direct Damage',     'secondary', 0, 'Weak damage'),

    # Secondary types
    ('Metal',    'Shield',            'primary',   1, None),
    ('Metal',    'Damage Prevention', 'primary',   1, None),
    ('Metal',    'Reduce Cost',       'secondary', 1, None),
    ('Plant',    'Draw Elements',     'primary',   1, None),
    ('Plant',    'Replay Spell',      'primary',   1, None),
    ('Ice',      'Counter Spell',     'primary',   1, None),
    ('Electric', 'Direct Damage',     'primary',   1, None),
    ('Electric', 'Counter Spell',     'secondary', 1, None),

    # Tertiary types
    ('Radioactive', 'Destroy Tower',     'primary',   1, None),
    ('Radioactive', 'Force Discard',     'primary',   1, None),
    ('Crystal',     'Replay Spell',      'primary',   1, None),
    ('Crystal',     'Counter Spell',     'secondary', 1, None),
    ('Cosmic',      'Direct Damage',     'primary',   1, None),
    ('Cosmic',      'Draw Elements',     'secondary', 1, None),
    ('Ghost',       'Steal Elements',    'primary',   1, None),
    ('Ghost',       'Replay Spell',      'primary',   1, None),
    ('Poison',      'Direct Damage',     'primary',   1, 'Via DoT/Poison'),
    ('Poison',      'Force Discard',     'primary',   1, None),
    # Heat — TBD in design docs, no links yet
    ('Sound',       'Force Discard',     'primary',   1, None),
    ('Sound',       'Counter Spell',     'primary',   1, None),
    ('Magnetic',    'Steal Elements',    'primary',   1, None),
    ('Magnetic',    'Draw Elements',     'secondary', 1, None),
]


# =============================================
# Basic 1-Cost Spells — every type gets damage, signature effect, and block
# (type_name, name, description, nature, process, effect_name, link_role)
# All are: type_b=None, amount=1+0, mechanic='spell', is_selected=0
# =============================================

BASIC_SPELLS = [
    # === Primary ===

    # Fire
    ('Fire', 'Spark',       'A quick burst of flame',                                'spell',    None,                      'Direct Damage',     'primary'),
    ('Fire', 'Ember',       'A lingering coal that burns slowly',                    'spell',    None,                      'Burn',              'primary'),
    ('Fire', 'Cinder Veil', 'A curtain of hot ash that absorbs incoming force',      'material', 'Ash Shielding',           'Damage Prevention', 'primary'),

    # Earth
    ('Earth', 'Stone',       'Harden a chunk of earth into a projectile',            'spell',    None,                      'Direct Damage',     'primary'),
    ('Earth', 'Bedrock',     'Compress the ground into hardened layers of protection','material', 'Lithification',           'Shield',            'primary'),
    ('Earth', 'Pebble Wall', 'Raise a small barrier of stones',                      'material', None,                      'Damage Prevention', 'primary'),

    # Water
    ('Water', 'Splash',    'A focused jet of water',                                 'spell',    None,                      'Direct Damage',     'primary'),
    ('Water', 'Spring',    'Tap into a fresh source of elemental flow',              'spell',    'Upwelling',               'Draw Elements',     'primary'),
    ('Water', 'Mist Veil', 'Shroud yourself in protective mist',                     'material', None,                      'Damage Prevention', 'primary'),

    # Air
    ('Air', 'Gust',        'A sharp blast of wind',                                  'spell',    None,                      'Direct Damage',     'primary'),
    ('Air', 'Dispel',      'A sharp gust that disrupts a forming spell',             'spell',    'Pressure Disruption',     'Counter Spell',     'primary'),
    ('Air', 'Breeze Ward', 'A gentle wind that deflects incoming attacks',           'material', None,                      'Damage Prevention', 'primary'),

    # === Secondary ===

    # Metal (Fire + Earth)
    ('Metal', 'Nail',      'A small metal spike launched with force',                'spell',    'Projectile',              'Direct Damage',     'primary'),
    ('Metal', 'Plate',     'Form a protective metal plate that deflects harm',       'material', 'Plating',                 'Shield',            'primary'),
    ('Metal', 'Iron Skin', 'Coat a surface in a thin layer of hardened metal',       'material', 'Case Hardening',          'Damage Prevention', 'primary'),

    # Plant (Earth + Water)
    ('Plant', 'Thorn',  'A sharp barb launched from living growth',                  'spell',    'Thorn Ejection',          'Direct Damage',     'primary'),
    ('Plant', 'Sprout', 'Coax new growth that yields fresh resources',               'spell',    'Germination',             'Draw Elements',     'primary'),
    ('Plant', 'Bark',   'Grow a layer of tough outer bark for protection',           'material', 'Bark Formation',          'Damage Prevention', 'primary'),

    # Ice (Water + Air)
    ('Ice', 'Icicle',    'A sharp shard of frozen water hurled at speed',            'spell',    'Crystallization',         'Direct Damage',     'primary'),
    ('Ice', 'Frost',     'A chilling cold that locks a target in place',             'spell',    'Flash Freezing',          'Freeze',            'primary'),
    ('Ice', 'Ice Shell', 'Encase a surface in a protective layer of ice',            'material', 'Surface Freezing',        'Damage Prevention', 'primary'),

    # Electric (Air + Fire)
    ('Electric', 'Zap',          'A quick bolt of electric discharge',               'spell',    'Electrostatic Discharge', 'Direct Damage',     'primary'),
    ('Electric', 'Jolt',         'A sudden shock that interrupts an action',         'spell',    'Nerve Disruption',        'Paralyze',          'primary'),
    ('Electric', 'Static Field', 'A repulsive electric field that deflects contact', 'material', 'Electrostatic Repulsion', 'Damage Prevention', 'primary'),

    # === Tertiary ===

    # Radioactive (Fire dark)
    ('Radioactive', 'Decay',       'Release unstable energy that breaks down matter',     'spell',    'Radioactive Decay',      'Direct Damage',     'primary'),
    ('Radioactive', 'Contaminate', 'Spread persistent radiation that degrades over time', 'spell',    'Irradiation',            'Destroy Tower',     'primary'),
    ('Radioactive', 'Lead Lining', 'Dense shielding that absorbs harmful radiation',      'material', 'Radiation Shielding',    'Damage Prevention', 'primary'),

    # Cosmic (Earth dark)
    ('Cosmic', 'Meteorite', 'Pull a small fragment from above to strike a target',         'spell',    'Gravitational Attraction', 'Direct Damage',     'primary'),
    ('Cosmic', 'Orbit',     'Curve resources toward you with gravitational pull',           'spell',    'Orbital Capture',          'Draw Elements',     'primary'),
    ('Cosmic', 'Nebula',    'Surround yourself in diffuse cosmic dust that cushions impact','material', 'Dust Shielding',           'Damage Prevention', 'primary'),

    # Poison (Water dark)
    ('Poison', 'Sting',   'Deliver a small dose of fast-acting toxin',                'spell',    'Envenomation',        'Direct Damage',     'primary'),
    ('Poison', 'Corrode', 'Apply a slow-acting substance that eats through material', 'spell',    'Chemical Corrosion',  'Poison DoT',        'primary'),
    ('Poison', 'Miasma',  'Release a noxious cloud that deters approach',             'material', 'Toxic Deterrent',     'Damage Prevention', 'primary'),

    # Sound (Air dark)
    ('Sound', 'Ping',      'A sharp pulse of focused acoustic energy',                   'spell',    'Acoustic Pulse',      'Direct Damage',     'primary'),
    ('Sound', 'Hush',      'Dampen vibrations to disrupt an opponent\'s focus',          'spell',    'Sound Dampening',     'Force Discard',     'primary'),
    ('Sound', 'Echo Wall', 'Reflect incoming force with a wall of standing waves',       'material', 'Acoustic Reflection', 'Damage Prevention', 'primary'),

    # Crystal (Metal dark)
    ('Crystal', 'Shard',   'Launch a razor-sharp fragment of crystalline structure',      'spell',    'Fracture Ejection', 'Direct Damage',     'primary'),
    ('Crystal', 'Refract', 'Bend and redirect energy through a crystalline lens',        'spell',    'Refraction',        'Replay Spell',      'primary'),
    ('Crystal', 'Lattice', 'Grow a rigid crystal lattice that absorbs impact',           'material', 'Lattice Growth',    'Damage Prevention', 'primary'),

    # Ghost (Plant dark)
    ('Ghost', 'Wilt',   'Drain vitality from a target with spectral touch',              'spell',    'Energy Drain',          'Direct Damage',     'primary'),
    ('Ghost', 'Siphon', 'Draw resources away from another through decay',                'spell',    'Parasitic Absorption',  'Steal Elements',    'primary'),
    ('Ghost', 'Fade',   'Become partially incorporeal, letting attacks pass through',    'material', 'Phase Shift',           'Damage Prevention', 'primary'),

    # Heat (Ice dark)
    ('Heat', 'Scorch',  'Rapidly raise temperature to inflict thermal damage',           'spell',    'Thermal Transfer',      'Direct Damage',     'primary'),
    ('Heat', 'Quicken', 'Accelerate the pace by injecting thermal energy',               'spell',    'Thermal Acceleration',  'Extra Action',      'primary'),
    ('Heat', 'Shimmer', 'Create a heat haze that distorts incoming attacks',              'material', 'Thermal Distortion',    'Damage Prevention', 'primary'),

    # Magnetic (Electric dark)
    ('Magnetic', 'Repulse',     'Push a metallic object with sudden magnetic force',             'spell',    'Magnetic Repulsion',  'Direct Damage',     'primary'),
    ('Magnetic', 'Attract',     'Pull nearby resources toward you with magnetic pull',           'spell',    'Magnetic Attraction', 'Steal Elements',    'primary'),
    ('Magnetic', 'Flux Shield', 'Generate a magnetic field that deflects incoming projectiles',  'material', 'Magnetic Deflection', 'Damage Prevention', 'primary'),
]


# =============================================
# Scientist Design Data
# (name, birth_year, death_year, field, sub_field, contribution, significance, era, nationality, is_selected, notes)
# =============================================

SCIENTISTS = [
    # ===================================================
    # [WS] Wizard School scientists (is_selected=1)
    # ===================================================

    # --- Fire: School of Combustion ---
    ('Antoine-Laurent Lavoisier', 1743, 1794, 'chemistry', 'Inorganic Chemistry',
     'Founded modern chemistry; identified oxygen\'s role in combustion', 5, 'enlightenment', 'French', 1,
     'Head of School of Combustion'),
    ('James Prescott Joule', 1818, 1889, 'physics', 'Thermodynamics',
     'Mechanical equivalent of heat — work and heat interchangeable', 4, 'industrial', 'English', 1,
     'Pupil A of School of Combustion'),
    ('Joseph von Fraunhofer', 1787, 1826, 'physics', 'Optics',
     'Dark absorption lines in solar spectrum; founded solar spectroscopy', 4, 'industrial', 'German', 1,
     'Pupil B of School of Combustion'),

    # --- Earth: School of Mass ---
    ('Isaac Newton', 1643, 1727, 'physics', 'Mechanics',
     'Universal gravitation; laws of motion', 5, 'enlightenment', 'English', 1,
     'Head of School of Mass'),
    ('James Hutton', 1726, 1797, 'earth_sciences', 'Geology',
     'Uniformitarianism — Earth shaped by slow, continuous processes', 4, 'enlightenment', 'Scottish', 1,
     'Pupil A of School of Mass'),
    ('Alfred Wegener', 1880, 1930, 'earth_sciences', 'Geology',
     'Continental drift — continents once joined, moved apart', 4, 'industrial', 'German', 1,
     'Pupil B of School of Mass'),

    # --- Water: School of Fluids ---
    ('Archimedes of Syracuse', -287, -212, 'physics', 'Fluid Dynamics',
     'Buoyancy principle; pioneered hydrostatics', 5, 'ancient', 'Greek', 1,
     'Head of School of Fluids'),
    ('Daniel Bernoulli', 1700, 1782, 'physics', 'Fluid Dynamics',
     'Bernoulli\'s Principle — fluid speed inversely relates to pressure', 4, 'enlightenment', 'Swiss', 1,
     'Pupil A of School of Fluids'),
    ('Blaise Pascal', 1623, 1662, 'physics', 'Pressure/Waves',
     'Pascal\'s Law — pressure in confined fluid transmits equally', 5, 'enlightenment', 'French', 1,
     'Pupil B of School of Fluids'),

    # --- Air: School of Pressure ---
    ('Evangelista Torricelli', 1608, 1647, 'physics', 'Pressure/Waves',
     'Invented barometer; proved atmosphere has weight and pressure; created first sustained vacuum (Torricelli vacuum)', 4, 'enlightenment', 'Italian', 1,
     'Head of School of Pressure'),
    ('Robert Boyle', 1627, 1691, 'physics', 'Gas Laws',
     'Boyle\'s Law — gas pressure and volume inversely proportional', 5, 'enlightenment', 'Irish', 1,
     'Pupil A of School of Pressure'),
    ('Gaspard-Gustave de Coriolis', 1792, 1843, 'physics', 'Fluid Dynamics',
     'Coriolis effect — deflection of air masses; governs weather patterns', 3, 'industrial', 'French', 1,
     'Pupil B of School of Pressure'),
    ('Otto von Guericke', 1602, 1686, 'physics', 'Pressure/Waves',
     'Invented vacuum pump; Magdeburg hemispheres demonstrated atmospheric pressure and vacuum', 4, 'enlightenment', 'German', 0,
     None),

    # --- Metal: School of Hardness ---
    ('Friedrich Mohs', 1773, 1839, 'earth_sciences', 'Geology',
     'Created Mohs hardness scale — systematic classification of hardness', 3, 'industrial', 'German', 1,
     'Head of School of Hardness'),
    ('Henry Bessemer', 1813, 1898, 'engineering', 'Materials Engineering',
     'Bessemer process — first inexpensive method for mass steel production', 4, 'industrial', 'English', 1,
     'Pupil A of School of Hardness'),
    ('William Lawrence Bragg', 1890, 1971, 'physics', 'Crystallography',
     'X-ray crystallography; revealed atomic structure of metals', 5, 'modern', 'Australian-British', 1,
     'Pupil B of School of Hardness'),

    # --- Plant: School of Growth ---
    ('Charles Darwin', 1809, 1882, 'biology', 'Evolution',
     'Evolution by natural selection — how living things grow, adapt, diversify', 5, 'industrial', 'English', 1,
     'Head of School of Growth'),
    ('Gregor Mendel', 1822, 1884, 'biology', 'Genetics',
     'Laws of heredity through pea plant experiments; founded genetics', 5, 'industrial', 'Austrian', 1,
     'Pupil A of School of Growth'),
    ('Thomas Robert Malthus', 1766, 1834, 'biology', 'Ecology',
     'Populations grow exponentially while resources grow linearly', 3, 'enlightenment', 'English', 1,
     'Pupil B of School of Growth'),

    # --- Ice: School of Cold ---
    ('William Thomson, Lord Kelvin', 1824, 1907, 'physics', 'Thermodynamics',
     'Established absolute temperature scale; concept of absolute zero', 5, 'industrial', 'Irish-British', 1,
     'Head of School of Cold'),
    ('Heike Kamerlingh Onnes', 1853, 1926, 'physics', 'Superconductivity',
     'First to liquefy helium; discovered superconductivity at extreme cold', 4, 'industrial', 'Dutch', 1,
     'Pupil A of School of Cold'),
    ('Josiah Willard Gibbs', 1839, 1903, 'physics', 'Phase Transitions',
     'Founded chemical thermodynamics; theory of phase transitions', 5, 'industrial', 'American', 1,
     'Pupil B of School of Cold'),

    # --- Electric: School of Current ---
    ('Michael Faraday', 1791, 1867, 'physics', 'Electromagnetism',
     'Electromagnetic induction; invented electric motor and generator', 5, 'industrial', 'English', 1,
     'Head of School of Current'),
    ('Alessandro Volta', 1745, 1827, 'physics', 'Electrochemistry',
     'Voltaic pile (first battery) — electricity generated chemically, stored', 4, 'enlightenment', 'Italian', 1,
     'Pupil A of School of Current'),
    ('Andre-Marie Ampere', 1775, 1836, 'physics', 'Electromagnetism',
     'Founded electrodynamics; defined electric current nature', 4, 'industrial', 'French', 1,
     'Pupil B of School of Current'),

    # --- Radioactive: School of the Atom ---
    ('Marie Curie', 1867, 1934, 'physics', 'Nuclear',
     'Discovered radium & polonium; coined "radioactivity"; died from exposure', 5, 'modern', 'Polish-French', 1,
     'Head of School of the Atom'),
    ('Lise Meitner', 1878, 1968, 'physics', 'Nuclear',
     'First to theoretically explain nuclear fission — splitting heavy atomic nuclei', 4, 'modern', 'Austrian-Swedish', 1,
     'Pupil A of School of the Atom'),
    ('Hans Bethe', 1906, 2005, 'physics', 'Nuclear',
     'Explained nuclear reactions powering the Sun — hydrogen fusing to helium', 4, 'modern', 'German-American', 1,
     'Pupil B of School of the Atom'),

    # --- Cosmic: School of the Vast ---
    ('Edwin Hubble', 1889, 1953, 'astronomy', 'Observational Astronomy',
     'Proved galaxies beyond Milky Way; discovered universe expanding', 5, 'modern', 'American', 1,
     'Head of School of the Vast'),
    ('Henrietta Swan Leavitt', 1868, 1921, 'astronomy', 'Observational Astronomy',
     'Period-luminosity relationship of Cepheid stars — first reliable cosmic distance measurement', 4, 'industrial', 'American', 1,
     'Pupil A of School of the Vast'),
    ('Fritz Zwicky', 1898, 1974, 'astronomy', 'Cosmology',
     'Proposed dark matter — galaxy clusters contain more mass than visible matter', 4, 'modern', 'Swiss-American', 1,
     'Pupil B of School of the Vast'),

    # --- Poison: School of Toxicology ---
    ('Paracelsus', 1493, 1541, 'medicine', 'Pharmacology',
     'Established toxicology; "the dose makes the poison" — LD50 principle', 5, 'renaissance', 'Swiss-German', 1,
     'Head of School of Toxicology'),
    ('Mathieu Orfila', 1787, 1853, 'medicine', 'Toxicology',
     'Founded forensic toxicology — systematic methods to detect poisons in body', 4, 'industrial', 'Spanish-French', 1,
     'Pupil A of School of Toxicology'),
    ('Carl Wilhelm Scheele', 1742, 1786, 'chemistry', 'Inorganic Chemistry',
     'Discovered chlorine, hydrogen cyanide, fluoride; likely died from exposure', 4, 'enlightenment', 'Swedish', 1,
     'Pupil B of School of Toxicology'),

    # --- Sound: School of Acoustics ---
    ('Alexander Graham Bell', 1847, 1922, 'engineering', 'Acoustics',
     'Invented telephone; pioneered acoustics and sound transmission', 4, 'industrial', 'Scottish-American', 1,
     'Head of School of Acoustics'),
    ('Ernst Chladni', 1756, 1827, 'physics', 'Acoustics',
     'Visualized sound vibrations as geometric patterns on vibrating plates', 3, 'enlightenment', 'German', 1,
     'Pupil A of School of Acoustics'),
    ('Christian Doppler', 1803, 1853, 'physics', 'Acoustics',
     'Doppler effect — frequency changes based on relative motion', 4, 'industrial', 'Austrian', 1,
     'Pupil B of School of Acoustics'),

    # --- Crystal: School of Frequency ---
    ('Heinrich Hertz', 1857, 1894, 'physics', 'Electromagnetism',
     'First proved electromagnetic waves exist; measured frequency. Hz named after him', 5, 'industrial', 'German', 1,
     'Head of School of Frequency'),
    ('Pierre Curie', 1859, 1906, 'physics', 'Crystallography',
     'Discovered piezoelectricity — crystals generate electric charge under stress', 4, 'industrial', 'French', 1,
     'Pupil A of School of Frequency'),
    ('Auguste Bravais', 1811, 1863, 'physics', 'Crystallography',
     'Classified all possible crystal lattice structures into 14 arrangements', 3, 'industrial', 'French', 1,
     'Pupil B of School of Frequency'),

    # --- Ghost: School of Entropy ---
    ('Ludwig Boltzmann', 1844, 1906, 'physics', 'Thermodynamics',
     'Founded statistical mechanics; gave entropy its mathematical definition (S = k log W)', 5, 'industrial', 'Austrian', 1,
     'Head of School of Entropy'),
    ('Ernest Rutherford', 1871, 1937, 'physics', 'Nuclear',
     'Discovered radioactive half-life; laws of radioactive decay', 5, 'industrial', 'New Zealand-British', 1,
     'Pupil A of School of Entropy'),
    ('Rudolf Clausius', 1822, 1888, 'physics', 'Thermodynamics',
     'Formulated second law of thermodynamics; coined "entropy"', 5, 'industrial', 'German', 1,
     'Pupil B of School of Entropy'),

    # --- Heat: School of Thermodynamics ---
    ('Sadi Carnot', 1796, 1832, 'physics', 'Thermodynamics',
     'Founded thermodynamics; established max efficiency of heat engines', 5, 'industrial', 'French', 1,
     'Head of School of Thermodynamics'),
    ('Count Rumford (Benjamin Thompson)', 1753, 1814, 'physics', 'Thermodynamics',
     'Proved heat generated by mechanical work (friction); overthrew caloric theory', 4, 'enlightenment', 'American-British', 1,
     'Pupil A of School of Thermodynamics'),
    ('Joseph Fourier', 1768, 1830, 'physics', 'Thermodynamics',
     'Fourier\'s Law of heat conduction; mathematically described how heat flows', 4, 'industrial', 'French', 1,
     'Pupil B of School of Thermodynamics'),

    # --- Magnetic: School of Fields ---
    ('James Clerk Maxwell', 1831, 1879, 'physics', 'Electromagnetism',
     'Unified electricity, magnetism, light into Maxwell\'s equations', 5, 'industrial', 'Scottish', 1,
     'Head of School of Fields'),
    ('Nikola Tesla', 1856, 1943, 'engineering', 'Electrical Engineering',
     'Invented AC motor, Tesla coil; pioneered rotating magnetic fields and wireless energy', 5, 'industrial', 'Serbian-American', 1,
     'Pupil A of School of Fields'),
    ('William Gilbert', 1544, 1603, 'physics', 'Electromagnetism',
     'De Magnete (1600) — first systematic study of magnetism; Earth is giant magnet', 4, 'renaissance', 'English', 1,
     'Pupil B of School of Fields'),

    # ===================================================
    # Additional scientists (is_selected=0)
    # ===================================================

    # --- Physics - Mechanics ---
    ('Galileo Galilei', 1564, 1642, 'physics', 'Mechanics',
     'Laws of falling bodies; telescopic astronomy; championed heliocentrism', 5, 'renaissance', 'Italian', 0, None),
    ('Leonhard Euler', 1707, 1783, 'mathematics', 'Calculus',
     'Prolific mathematician; contributions to mechanics, fluid dynamics, optics', 5, 'enlightenment', 'Swiss', 0, None),
    ('Joseph-Louis Lagrange', 1736, 1813, 'mathematics', 'Calculus',
     'Analytical mechanics; Lagrangian formulation of classical mechanics', 5, 'enlightenment', 'Italian-French', 0, None),

    # --- Physics - Thermodynamics ---
    ('Max Planck', 1858, 1947, 'physics', 'Thermodynamics',
     'Originated quantum theory; Planck\'s constant and black-body radiation law', 5, 'modern', 'German', 0, None),

    # --- Physics - Electromagnetism ---
    ('Georg Ohm', 1789, 1854, 'physics', 'Electromagnetism',
     'Ohm\'s Law — relationship between voltage, current, and resistance', 4, 'industrial', 'German', 0, None),
    ('Charles-Augustin de Coulomb', 1736, 1806, 'physics', 'Electromagnetism',
     'Coulomb\'s Law — force between electric charges', 4, 'enlightenment', 'French', 0, None),
    ('Hans Christian Oersted', 1777, 1851, 'physics', 'Electromagnetism',
     'Discovered electromagnetism — electric current deflects compass needle', 4, 'industrial', 'Danish', 0, None),
    ('Joseph Henry', 1797, 1878, 'physics', 'Electromagnetism',
     'Discovered self-inductance; independently discovered electromagnetic induction', 4, 'industrial', 'American', 0, None),

    # --- Physics - Nuclear/Particle ---
    ('Niels Bohr', 1885, 1962, 'physics', 'Quantum',
     'Bohr model of the atom; contributions to quantum mechanics', 5, 'modern', 'Danish', 0, None),
    ('Enrico Fermi', 1901, 1954, 'physics', 'Nuclear',
     'First controlled nuclear chain reaction; pioneer of nuclear reactor design', 5, 'modern', 'Italian-American', 0, None),
    ('J. Robert Oppenheimer', 1904, 1967, 'physics', 'Nuclear',
     'Led Manhattan Project; theoretical contributions to quantum mechanics', 4, 'modern', 'American', 0, None),
    ('Werner Heisenberg', 1901, 1976, 'physics', 'Quantum',
     'Uncertainty principle; matrix mechanics formulation of quantum theory', 5, 'modern', 'German', 0, None),
    ('Paul Dirac', 1902, 1984, 'physics', 'Quantum',
     'Dirac equation; predicted antimatter; unified quantum mechanics and special relativity', 5, 'modern', 'English', 0, None),
    ('Richard Feynman', 1918, 1988, 'physics', 'Quantum',
     'Path integral formulation; quantum electrodynamics; Feynman diagrams', 5, 'contemporary', 'American', 0, None),
    ('Henri Becquerel', 1852, 1908, 'physics', 'Nuclear',
     'Discovered spontaneous radioactivity in uranium', 4, 'industrial', 'French', 0, None),
    ('Murray Gell-Mann', 1929, 2019, 'physics', 'Quantum',
     'Quark model; classified subatomic particles; strangeness quantum number', 5, 'contemporary', 'American', 0, None),

    # --- Physics - Optics ---
    ('Ibn al-Haytham', 965, 1040, 'physics', 'Optics',
     'Father of modern optics; Book of Optics; scientific method pioneer', 5, 'medieval', 'Iraqi-Egyptian', 0, None),
    ('Christiaan Huygens', 1629, 1695, 'physics', 'Optics',
     'Wave theory of light; discovered Titan; built improved telescopes', 5, 'enlightenment', 'Dutch', 0, None),

    # --- Physics - Acoustics ---
    ('Hermann von Helmholtz', 1821, 1894, 'physics', 'Acoustics',
     'Physiological acoustics; conservation of energy; Helmholtz resonance', 5, 'industrial', 'German', 0, None),

    # --- Physics - Fluid Dynamics ---
    ('Osborne Reynolds', 1842, 1912, 'physics', 'Fluid Dynamics',
     'Reynolds number — predicts transition from laminar to turbulent flow', 4, 'industrial', 'Irish-British', 0, None),

    # --- Physics - Crystallography ---
    ('Max von Laue', 1879, 1960, 'physics', 'Crystallography',
     'Discovered X-ray diffraction by crystals; proved X-rays are electromagnetic waves', 4, 'modern', 'German', 0, None),
    ('Dorothy Hodgkin', 1910, 1994, 'chemistry', 'Crystallography',
     'X-ray crystallography of biomolecules; determined structures of penicillin, insulin, vitamin B12', 5, 'modern', 'British', 0, None),

    # --- Physics - Cryogenics ---
    ('James Dewar', 1842, 1923, 'physics', 'Cryogenics',
     'First to liquefy hydrogen; invented vacuum flask (Dewar flask)', 4, 'industrial', 'Scottish', 0, None),
    ('Carl von Linde', 1842, 1934, 'engineering', 'Cryogenics',
     'Invented industrial-scale air liquefaction; pioneered refrigeration technology', 3, 'industrial', 'German', 0, None),

    # --- Physics - Superconductivity ---
    ('John Bardeen', 1908, 1991, 'physics', 'Superconductivity',
     'BCS theory of superconductivity; co-invented the transistor; only physicist with two Nobel Prizes in Physics', 5, 'contemporary', 'American', 0, None),

    # --- Physics - Modern/Quantum (cross-cutting) ---
    ('Albert Einstein', 1879, 1955, 'physics', 'Quantum',
     'Special and general relativity; photoelectric effect; mass-energy equivalence', 5, 'modern', 'German-Swiss-American', 0, None),
    ('Erwin Schrodinger', 1887, 1961, 'physics', 'Quantum',
     'Schrodinger equation; wave mechanics formulation of quantum theory', 5, 'modern', 'Austrian', 0, None),
    ('Louis de Broglie', 1892, 1987, 'physics', 'Quantum',
     'Wave-particle duality; matter waves — all particles have wave properties', 4, 'modern', 'French', 0, None),
    ('Wolfgang Pauli', 1900, 1958, 'physics', 'Quantum',
     'Exclusion principle; spin-statistics theorem; predicted neutrino', 5, 'modern', 'Austrian-American', 0, None),
    ('Max Born', 1882, 1970, 'physics', 'Quantum',
     'Statistical interpretation of quantum mechanics; Born rule', 4, 'modern', 'German-British', 0, None),

    # --- Chemistry - General ---
    ('Dmitri Mendeleev', 1834, 1907, 'chemistry', 'Inorganic Chemistry',
     'Created periodic table of elements; predicted undiscovered elements', 5, 'industrial', 'Russian', 0, None),
    ('John Dalton', 1766, 1844, 'chemistry', 'Physical Chemistry',
     'Atomic theory; law of multiple proportions; partial pressures', 5, 'industrial', 'English', 0, None),
    ('Linus Pauling', 1901, 1994, 'chemistry', 'Physical Chemistry',
     'Nature of the chemical bond; molecular biology; only person with two unshared Nobel Prizes', 5, 'modern', 'American', 0, None),
    ('Svante Arrhenius', 1859, 1927, 'chemistry', 'Physical Chemistry',
     'Ionic dissociation theory; Arrhenius equation for reaction rates', 4, 'industrial', 'Swedish', 0, None),
    ('Amedeo Avogadro', 1776, 1856, 'chemistry', 'Physical Chemistry',
     'Avogadro\'s law — equal volumes of gas contain equal numbers of molecules', 4, 'industrial', 'Italian', 0, None),
    ('Robert Bunsen', 1811, 1899, 'chemistry', 'Inorganic Chemistry',
     'Bunsen burner; emission spectroscopy; discovered cesium and rubidium', 4, 'industrial', 'German', 0, None),

    # --- Chemistry - Organic ---
    ('Friedrich Wohler', 1800, 1882, 'chemistry', 'Organic Chemistry',
     'First synthesis of organic compound (urea) from inorganic materials', 4, 'industrial', 'German', 0, None),
    ('August Kekule', 1829, 1896, 'chemistry', 'Organic Chemistry',
     'Structure of benzene ring; theory of chemical structure and carbon valence', 4, 'industrial', 'German', 0, None),

    # --- Chemistry - Biochemistry/Medicine ---
    ('Louis Pasteur', 1822, 1895, 'biology', 'Microbiology',
     'Germ theory of disease; pasteurization; vaccines for rabies and anthrax', 5, 'industrial', 'French', 0, None),

    # --- Biology - Evolution ---
    ('Alfred Russel Wallace', 1823, 1913, 'biology', 'Evolution',
     'Independent theory of natural selection; biogeography; Wallace Line', 4, 'industrial', 'Welsh', 0, None),

    # --- Biology - Genetics ---
    ('Rosalind Franklin', 1920, 1958, 'biology', 'Genetics',
     'X-ray diffraction images of DNA (Photo 51); key to determining DNA structure', 4, 'modern', 'English', 0, None),
    ('James Watson', 1928, None, 'biology', 'Genetics',
     'Co-discovered double helix structure of DNA', 4, 'contemporary', 'American', 0, None),
    ('Francis Crick', 1916, 2004, 'biology', 'Genetics',
     'Co-discovered double helix structure of DNA; central dogma of molecular biology', 5, 'contemporary', 'English', 0, None),
    ('Barbara McClintock', 1902, 1992, 'biology', 'Genetics',
     'Discovered genetic transposition (jumping genes); chromosomal crossover', 5, 'modern', 'American', 0, None),
    ('Nettie Stevens', 1861, 1912, 'biology', 'Genetics',
     'Discovered sex chromosomes (XY sex determination)', 4, 'modern', 'American', 0, None),

    # --- Biology - Ecology/Botany ---
    ('Carl Linnaeus', 1707, 1778, 'biology', 'Ecology',
     'Binomial nomenclature; modern taxonomy; Systema Naturae', 5, 'enlightenment', 'Swedish', 0, None),
    ('Alexander von Humboldt', 1769, 1859, 'biology', 'Ecology',
     'Founded biogeography; mapped plant distributions by climate and altitude', 5, 'industrial', 'German', 0, None),
    ('Rachel Carson', 1907, 1964, 'biology', 'Ecology',
     'Silent Spring — exposed environmental impact of pesticides; catalyzed environmental movement', 4, 'modern', 'American', 0, None),

    # --- Biology - Microbiology ---
    ('Robert Koch', 1843, 1910, 'biology', 'Microbiology',
     'Koch\'s postulates; identified causative agents of tuberculosis, cholera, anthrax', 5, 'industrial', 'German', 0, None),
    ('Anton van Leeuwenhoek', 1632, 1723, 'biology', 'Microbiology',
     'Father of microbiology; first to observe microorganisms with improved microscopes', 5, 'enlightenment', 'Dutch', 0, None),
    ('Alexander Fleming', 1881, 1955, 'biology', 'Microbiology',
     'Discovered penicillin — first antibiotic; revolutionized medicine', 5, 'modern', 'Scottish', 0, None),

    # --- Mathematics ---
    ('Euclid', -325, -265, 'mathematics', 'Geometry',
     'Elements — foundational treatise on geometry and number theory', 5, 'ancient', 'Greek', 0, None),
    ('Carl Friedrich Gauss', 1777, 1855, 'mathematics', 'Algebra',
     'Number theory; Gaussian distribution; contributions to magnetism and astronomy', 5, 'industrial', 'German', 0, None),
    ('Bernhard Riemann', 1826, 1866, 'mathematics', 'Geometry',
     'Riemannian geometry; Riemann hypothesis; foundations of general relativity', 5, 'industrial', 'German', 0, None),
    ('Ada Lovelace', 1815, 1852, 'mathematics', 'Algebra',
     'First computer algorithm; recognized potential of Babbage\'s Analytical Engine', 4, 'industrial', 'English', 0, None),
    ('Emmy Noether', 1882, 1935, 'mathematics', 'Algebra',
     'Noether\'s theorem linking symmetry and conservation laws; abstract algebra', 5, 'modern', 'German', 0, None),
    ('Srinivasa Ramanujan', 1887, 1920, 'mathematics', 'Algebra',
     'Extraordinary intuitive mathematical results; infinite series; number theory', 5, 'modern', 'Indian', 0, None),
    ('Alan Turing', 1912, 1954, 'mathematics', 'Algebra',
     'Turing machine; foundations of computer science; codebreaking at Bletchley Park', 5, 'modern', 'English', 0, None),
    ('Pierre-Simon Laplace', 1749, 1827, 'mathematics', 'Calculus',
     'Celestial mechanics; Laplace transform; Bayesian probability', 5, 'enlightenment', 'French', 0, None),

    # --- Astronomy ---
    ('Nicolaus Copernicus', 1473, 1543, 'astronomy', 'Observational Astronomy',
     'Heliocentric model — Sun at center of solar system', 5, 'renaissance', 'Polish', 0, None),
    ('Johannes Kepler', 1571, 1630, 'astronomy', 'Observational Astronomy',
     'Laws of planetary motion; elliptical orbits', 5, 'renaissance', 'German', 0, None),
    ('Tycho Brahe', 1546, 1601, 'astronomy', 'Observational Astronomy',
     'Most accurate pre-telescopic astronomical observations; Tychonic system', 4, 'renaissance', 'Danish', 0, None),
    ('Vera Rubin', 1928, 2016, 'astronomy', 'Cosmology',
     'Observational evidence for dark matter through galaxy rotation curves', 4, 'contemporary', 'American', 0, None),
    ('Cecilia Payne-Gaposchkin', 1900, 1979, 'astronomy', 'Astrophysics',
     'Determined stars are primarily hydrogen and helium; stellar composition', 4, 'modern', 'British-American', 0, None),
    ('Subrahmanyan Chandrasekhar', 1910, 1995, 'astronomy', 'Astrophysics',
     'Chandrasekhar limit for white dwarf mass; stellar evolution theory', 5, 'modern', 'Indian-American', 0, None),
    ('Stephen Hawking', 1942, 2018, 'astronomy', 'Cosmology',
     'Hawking radiation; black hole thermodynamics; singularity theorems', 5, 'contemporary', 'English', 0, None),

    # --- Earth Sciences ---
    ('Charles Lyell', 1797, 1875, 'earth_sciences', 'Geology',
     'Principles of Geology; popularized uniformitarianism', 4, 'industrial', 'Scottish', 0, None),
    ('Mary Anning', 1799, 1847, 'earth_sciences', 'Geology',
     'Discovered ichthyosaur, plesiosaur fossils; pioneered paleontology', 4, 'industrial', 'English', 0, None),
    ('Marie Tharp', 1920, 2006, 'earth_sciences', 'Geology',
     'Mapped the ocean floor; discovered Mid-Atlantic Ridge rift valley', 4, 'modern', 'American', 0, None),
    ('Georgius Agricola', 1494, 1555, 'earth_sciences', 'Geology',
     'Father of mineralogy; De Re Metallica — systematic study of mining and metallurgy', 4, 'renaissance', 'German', 0, None),

    # --- Engineering ---
    ('Thomas Edison', 1847, 1931, 'engineering', 'Electrical Engineering',
     'Practical incandescent light bulb; phonograph; electrical power distribution', 4, 'industrial', 'American', 0, None),
    ('Guglielmo Marconi', 1874, 1937, 'engineering', 'Electrical Engineering',
     'Pioneered long-distance radio transmission; wireless telegraphy', 4, 'modern', 'Italian', 0, None),
    ('James Watt', 1736, 1819, 'engineering', 'Mechanical Engineering',
     'Improved steam engine; concept of horsepower; watt unit of power', 4, 'enlightenment', 'Scottish', 0, None),
    ('Wernher von Braun', 1912, 1977, 'engineering', 'Mechanical Engineering',
     'Rocket engineering; V-2 rocket; Saturn V for Apollo program', 4, 'modern', 'German-American', 0, None),

    # --- Medicine ---
    ('Hippocrates', -460, -370, 'medicine', 'Medicine/Anatomy',
     'Father of Western medicine; Hippocratic oath; systematic clinical observation', 5, 'ancient', 'Greek', 0, None),
    ('Andreas Vesalius', 1514, 1564, 'medicine', 'Medicine/Anatomy',
     'De Humani Corporis Fabrica — founded modern human anatomy', 5, 'renaissance', 'Belgian', 0, None),
    ('Edward Jenner', 1749, 1823, 'medicine', 'Pharmacology',
     'Developed smallpox vaccine using cowpox; founded immunology', 5, 'enlightenment', 'English', 0, None),
    ('William Harvey', 1578, 1657, 'medicine', 'Medicine/Anatomy',
     'Discovered circulation of blood; De Motu Cordis', 5, 'renaissance', 'English', 0, None),
    ('Tu Youyou', 1930, None, 'medicine', 'Pharmacology',
     'Discovered artemisinin from traditional Chinese medicine; antimalarial treatment', 4, 'contemporary', 'Chinese', 0, None),

    # --- Additional (cross-cutting) ---
    ('Robert Hooke', 1635, 1703, 'physics', 'Mechanics',
     'Hooke\'s Law (elasticity); Micrographia; coined "cell" in biology', 4, 'enlightenment', 'English', 0, None),
    ('Benjamin Franklin', 1706, 1790, 'physics', 'Electromagnetism',
     'Lightning rod; proved lightning is electrical; bifocals', 4, 'enlightenment', 'American', 0, None),
    ('Luigi Galvani', 1737, 1798, 'physics', 'Electrochemistry',
     'Discovered bioelectricity; galvanism — electrical stimulation of nerves', 4, 'enlightenment', 'Italian', 0, None),
    ('Maria Goeppert Mayer', 1906, 1972, 'physics', 'Nuclear',
     'Nuclear shell model; explained magic numbers of nuclear stability', 4, 'modern', 'German-American', 0, None),
    ('Chien-Shiung Wu', 1912, 1997, 'physics', 'Nuclear',
     'Wu experiment — disproved conservation of parity in weak interactions', 4, 'modern', 'Chinese-American', 0, None),
]


# =============================================
# Scientist-Type Affinities
# (scientist_name, type_name, affinity, rationale, is_selected)
# =============================================

SCIENTIST_TYPE_AFFINITIES = [
    # ===================================================
    # [WS] Wizard School scientists — primary affinity matches their assigned type
    # ===================================================

    # --- Fire: School of Combustion ---
    # Lavoisier — head of Fire school; Inorganic Chemistry
    ('Antoine-Laurent Lavoisier', 'Fire', 'strong', 'Head of School of Combustion — identified oxygen\'s role in combustion', 1),
    ('Antoine-Laurent Lavoisier', 'Metal', 'strong', 'Inorganic chemistry — systematic study of elements and metals', 1),
    ('Antoine-Laurent Lavoisier', 'Earth', 'moderate', 'Inorganic chemistry — mineral and earth analysis', 0),

    # Joule — pupil of Fire; Thermodynamics
    ('James Prescott Joule', 'Fire', 'strong', 'Pupil of School of Combustion — mechanical equivalent of heat', 1),
    ('James Prescott Joule', 'Heat', 'strong', 'Thermodynamics — heat as energy, heat-work equivalence', 1),
    ('James Prescott Joule', 'Ice', 'moderate', 'Thermodynamics — studied temperature extremes', 0),

    # Fraunhofer — pupil of Fire; Optics
    ('Joseph von Fraunhofer', 'Fire', 'strong', 'Pupil of School of Combustion — solar spectroscopy', 1),
    ('Joseph von Fraunhofer', 'Crystal', 'moderate', 'Optics — prisms and lenses for spectral analysis', 0),
    ('Joseph von Fraunhofer', 'Cosmic', 'moderate', 'Optics — stellar/solar spectrum observation', 0),

    # --- Earth: School of Mass ---
    # Newton — head of Earth school; Mechanics
    ('Isaac Newton', 'Earth', 'strong', 'Head of School of Mass — universal gravitation, laws of motion', 1),
    ('Isaac Newton', 'Metal', 'moderate', 'Mechanics — statics and structural forces', 0),
    ('Isaac Newton', 'Cosmic', 'moderate', 'Celestial mechanics — orbital motion and gravity', 0),

    # Hutton — pupil of Earth; Geology
    ('James Hutton', 'Earth', 'strong', 'Pupil of School of Mass — uniformitarianism, deep geological time', 1),
    ('James Hutton', 'Metal', 'moderate', 'Geology — mineral and rock classification', 0),
    ('James Hutton', 'Crystal', 'moderate', 'Geology — crystalline rock formations', 0),

    # Wegener — pupil of Earth; Geology
    ('Alfred Wegener', 'Earth', 'strong', 'Pupil of School of Mass — continental drift', 1),
    ('Alfred Wegener', 'Metal', 'moderate', 'Geology — Earth\'s metallic core and tectonic forces', 0),

    # --- Water: School of Fluids ---
    # Archimedes — head of Water school; Fluid Dynamics
    ('Archimedes of Syracuse', 'Water', 'strong', 'Head of School of Fluids — buoyancy principle, hydrostatics', 1),
    ('Archimedes of Syracuse', 'Air', 'moderate', 'Fluid dynamics — principles apply to all fluids including gases', 0),

    # Bernoulli — pupil of Water; Fluid Dynamics
    ('Daniel Bernoulli', 'Water', 'strong', 'Pupil of School of Fluids — fluid speed and pressure relationship', 1),
    ('Daniel Bernoulli', 'Air', 'moderate', 'Fluid dynamics — Bernoulli\'s principle applies to airflow', 0),

    # Pascal — pupil of Water; Pressure/Waves
    ('Blaise Pascal', 'Water', 'strong', 'Pupil of School of Fluids — Pascal\'s Law, hydraulics', 1),
    ('Blaise Pascal', 'Sound', 'strong', 'Pressure/Waves — pressure transmission through media', 1),
    ('Blaise Pascal', 'Air', 'moderate', 'Pressure/Waves — atmospheric pressure studies', 0),
    ('Blaise Pascal', 'Earth', 'moderate', 'Pressure/Waves — pressure in solid and fluid media', 0),

    # --- Air: School of Pressure ---
    # Torricelli — head of Air school; Pressure/Waves
    ('Evangelista Torricelli', 'Air', 'strong', 'Head of School of Pressure — barometer, atmospheric pressure', 1),
    ('Evangelista Torricelli', 'Sound', 'strong', 'Pressure/Waves — created first vacuum; sound requires medium', 1),
    ('Evangelista Torricelli', 'Earth', 'moderate', 'Pressure/Waves — mercury in barometer', 0),

    # Guericke — vacuum pump inventor
    ('Otto von Guericke', 'Sound', 'strong', 'Vacuum pioneer — vacuum is the absence of pressure medium, no sound propagation', 0),
    ('Otto von Guericke', 'Air', 'strong', 'Demonstrated atmospheric pressure via Magdeburg hemispheres; gas behavior', 0),

    # Boyle — pupil of Air; Gas Laws
    ('Robert Boyle', 'Air', 'strong', 'Pupil of School of Pressure — gas pressure and volume', 1),
    ('Robert Boyle', 'Water', 'moderate', 'Gas Laws — behavior of compressible fluids', 0),

    # Coriolis — pupil of Air; Fluid Dynamics
    ('Gaspard-Gustave de Coriolis', 'Air', 'strong', 'Pupil of School of Pressure — Coriolis effect on air masses', 1),
    ('Gaspard-Gustave de Coriolis', 'Water', 'moderate', 'Fluid dynamics — Coriolis effect on ocean currents', 0),

    # --- Metal: School of Hardness ---
    # Mohs — head of Metal school; Geology
    ('Friedrich Mohs', 'Metal', 'strong', 'Head of School of Hardness — hardness scale for minerals', 1),
    ('Friedrich Mohs', 'Earth', 'strong', 'Geology — mineral classification, geological surveys', 1),
    ('Friedrich Mohs', 'Crystal', 'moderate', 'Geology — crystalline mineral structures', 0),

    # Bessemer — pupil of Metal; Materials Engineering
    ('Henry Bessemer', 'Metal', 'strong', 'Pupil of School of Hardness — Bessemer process for steel', 1),
    ('Henry Bessemer', 'Crystal', 'moderate', 'Materials Engineering — crystal structure of steel', 0),

    # Bragg — pupil of Metal; Crystallography
    ('William Lawrence Bragg', 'Metal', 'strong', 'Pupil of School of Hardness — X-ray crystallography of metals', 1),
    ('William Lawrence Bragg', 'Crystal', 'strong', 'Crystallography — X-ray diffraction reveals crystal lattice', 1),

    # --- Plant: School of Growth ---
    # Darwin — head of Plant school; Evolution
    ('Charles Darwin', 'Plant', 'strong', 'Head of School of Growth — evolution by natural selection', 1),
    ('Charles Darwin', 'Ghost', 'moderate', 'Evolution — extinction, death as selective pressure', 0),

    # Mendel — pupil of Plant; Genetics
    ('Gregor Mendel', 'Plant', 'strong', 'Pupil of School of Growth — heredity through pea plant experiments', 1),
    ('Gregor Mendel', 'Crystal', 'moderate', 'Genetics — discrete, ordered inheritance patterns', 0),

    # Malthus — pupil of Plant; Ecology
    ('Thomas Robert Malthus', 'Plant', 'strong', 'Pupil of School of Growth — population growth dynamics', 1),
    ('Thomas Robert Malthus', 'Water', 'moderate', 'Ecology — resource availability and carrying capacity', 0),
    ('Thomas Robert Malthus', 'Earth', 'moderate', 'Ecology — land-based resource limitations', 0),

    # --- Ice: School of Cold ---
    # Kelvin — head of Ice school; Thermodynamics
    ('William Thomson, Lord Kelvin', 'Ice', 'strong', 'Head of School of Cold — absolute temperature scale, absolute zero', 1),
    ('William Thomson, Lord Kelvin', 'Heat', 'strong', 'Thermodynamics — heat transfer, thermodynamic laws', 1),
    ('William Thomson, Lord Kelvin', 'Fire', 'moderate', 'Thermodynamics — energy and temperature', 0),

    # Kamerlingh Onnes — pupil of Ice; Superconductivity
    ('Heike Kamerlingh Onnes', 'Ice', 'strong', 'Pupil of School of Cold — liquefied helium, cryogenics', 1),
    ('Heike Kamerlingh Onnes', 'Magnetic', 'strong', 'Superconductivity — zero-resistance magnetic field effects', 1),
    ('Heike Kamerlingh Onnes', 'Crystal', 'moderate', 'Superconductivity — lattice structure of superconductors', 0),

    # Gibbs — pupil of Ice; Phase Transitions
    ('Josiah Willard Gibbs', 'Ice', 'strong', 'Pupil of School of Cold — phase transitions, chemical thermodynamics', 1),
    ('Josiah Willard Gibbs', 'Heat', 'moderate', 'Phase Transitions — temperature-dependent state changes', 0),
    ('Josiah Willard Gibbs', 'Water', 'moderate', 'Phase Transitions — liquid-solid-gas boundaries', 0),

    # --- Electric: School of Current ---
    # Faraday — head of Electric school; Electromagnetism
    ('Michael Faraday', 'Electric', 'strong', 'Head of School of Current — electromagnetic induction', 1),
    ('Michael Faraday', 'Magnetic', 'strong', 'Electromagnetism — discovered relationship between electricity and magnetism', 1),

    # Volta — pupil of Electric; Electrochemistry
    ('Alessandro Volta', 'Electric', 'strong', 'Pupil of School of Current — voltaic pile, first battery', 1),
    ('Alessandro Volta', 'Metal', 'moderate', 'Electrochemistry — metal electrodes in batteries', 0),
    ('Alessandro Volta', 'Water', 'moderate', 'Electrochemistry — electrolyte solutions', 0),

    # Ampere — pupil of Electric; Electromagnetism
    ('Andre-Marie Ampere', 'Electric', 'strong', 'Pupil of School of Current — electrodynamics, current flow', 1),
    ('Andre-Marie Ampere', 'Magnetic', 'strong', 'Electromagnetism — electric currents create magnetic fields', 1),

    # --- Radioactive: School of the Atom ---
    # Marie Curie — head of Radioactive school; Nuclear
    ('Marie Curie', 'Radioactive', 'strong', 'Head of School of the Atom — discovered radioactivity', 1),
    ('Marie Curie', 'Fire', 'moderate', 'Nuclear — radiation as energetic emission', 0),

    # Meitner — pupil of Radioactive; Nuclear
    ('Lise Meitner', 'Radioactive', 'strong', 'Pupil of School of the Atom — nuclear fission theory', 1),
    ('Lise Meitner', 'Fire', 'moderate', 'Nuclear — enormous energy release from fission', 0),

    # Bethe — pupil of Radioactive; Nuclear
    ('Hans Bethe', 'Radioactive', 'strong', 'Pupil of School of the Atom — stellar nuclear reactions', 1),
    ('Hans Bethe', 'Fire', 'moderate', 'Nuclear — stellar energy from fusion', 0),
    ('Hans Bethe', 'Cosmic', 'moderate', 'Nuclear — stellar nucleosynthesis, astrophysics', 0),

    # --- Cosmic: School of the Vast ---
    # Hubble — head of Cosmic school; Observational Astronomy
    ('Edwin Hubble', 'Cosmic', 'strong', 'Head of School of the Vast — expanding universe, extragalactic astronomy', 1),
    ('Edwin Hubble', 'Fire', 'moderate', 'Observational Astronomy — stellar luminosity and redshift', 0),

    # Leavitt — pupil of Cosmic; Observational Astronomy
    ('Henrietta Swan Leavitt', 'Cosmic', 'strong', 'Pupil of School of the Vast — Cepheid variable stars, cosmic distance', 1),
    ('Henrietta Swan Leavitt', 'Fire', 'moderate', 'Observational Astronomy — stellar brightness measurements', 0),

    # Zwicky — pupil of Cosmic; Cosmology
    ('Fritz Zwicky', 'Cosmic', 'strong', 'Pupil of School of the Vast — dark matter, galaxy clusters', 1),
    ('Fritz Zwicky', 'Ghost', 'moderate', 'Cosmology — dark matter, invisible mass', 0),
    ('Fritz Zwicky', 'Radioactive', 'moderate', 'Cosmology — supernovae and cosmic radiation', 0),

    # --- Poison: School of Toxicology ---
    # Paracelsus — head of Poison school; Pharmacology
    ('Paracelsus', 'Poison', 'strong', 'Head of School of Toxicology — "the dose makes the poison"', 1),
    ('Paracelsus', 'Plant', 'moderate', 'Pharmacology — herbal and botanical medicines', 0),

    # Orfila — pupil of Poison; Toxicology
    ('Mathieu Orfila', 'Poison', 'strong', 'Pupil of School of Toxicology — forensic toxicology', 1),
    ('Mathieu Orfila', 'Water', 'moderate', 'Toxicology — detecting poisons in body fluids', 0),
    ('Mathieu Orfila', 'Plant', 'moderate', 'Toxicology — plant-based poisons and antidotes', 0),

    # Scheele — pupil of Poison; Inorganic Chemistry
    ('Carl Wilhelm Scheele', 'Poison', 'strong', 'Pupil of School of Toxicology — discovered multiple toxic elements', 1),
    ('Carl Wilhelm Scheele', 'Metal', 'strong', 'Inorganic chemistry — discovered manganese, barium, tungsten, molybdenum', 1),
    ('Carl Wilhelm Scheele', 'Earth', 'moderate', 'Inorganic chemistry — mineral analysis', 0),

    # --- Sound: School of Acoustics ---
    # Bell — head of Sound school; Acoustics
    ('Alexander Graham Bell', 'Sound', 'strong', 'Head of School of Acoustics — telephone, sound transmission', 1),
    ('Alexander Graham Bell', 'Crystal', 'moderate', 'Acoustics — structured vibration patterns', 0),

    # Chladni — pupil of Sound; Acoustics
    ('Ernst Chladni', 'Sound', 'strong', 'Pupil of School of Acoustics — Chladni patterns, vibration visualization', 1),
    ('Ernst Chladni', 'Crystal', 'moderate', 'Acoustics — geometric patterns from resonance', 0),

    # Doppler — pupil of Sound; Acoustics
    ('Christian Doppler', 'Sound', 'strong', 'Pupil of School of Acoustics — Doppler effect', 1),
    ('Christian Doppler', 'Air', 'moderate', 'Acoustics — sound propagation through air', 0),

    # --- Crystal: School of Frequency ---
    # Hertz — head of Crystal school; Electromagnetism
    ('Heinrich Hertz', 'Crystal', 'strong', 'Head of School of Frequency — proved electromagnetic waves, measured frequency', 1),
    ('Heinrich Hertz', 'Electric', 'strong', 'Electromagnetism — electromagnetic wave generation', 1),
    ('Heinrich Hertz', 'Magnetic', 'strong', 'Electromagnetism — electromagnetic field oscillation', 1),

    # Pierre Curie — pupil of Crystal; Crystallography
    ('Pierre Curie', 'Crystal', 'strong', 'Pupil of School of Frequency — piezoelectricity in crystals', 1),
    ('Pierre Curie', 'Electric', 'moderate', 'Crystallography — crystals generating electric charge', 0),
    ('Pierre Curie', 'Magnetic', 'moderate', 'Crystallography — Curie point, magnetism in crystals', 0),

    # Bravais — pupil of Crystal; Crystallography
    ('Auguste Bravais', 'Crystal', 'strong', 'Pupil of School of Frequency — 14 Bravais lattice types', 1),
    ('Auguste Bravais', 'Earth', 'moderate', 'Crystallography — geometric structures in minerals', 0),

    # --- Ghost: School of Entropy ---
    # Boltzmann — head of Ghost school; Thermodynamics
    ('Ludwig Boltzmann', 'Ghost', 'strong', 'Head of School of Entropy — statistical mechanics, S = k log W', 1),
    ('Ludwig Boltzmann', 'Heat', 'strong', 'Thermodynamics — kinetic theory of gases, thermal energy', 1),
    ('Ludwig Boltzmann', 'Fire', 'moderate', 'Thermodynamics — energy distribution and heat', 0),

    # Rutherford — pupil of Ghost; Nuclear
    ('Ernest Rutherford', 'Ghost', 'strong', 'Pupil of School of Entropy — radioactive half-life, decay laws', 1),
    ('Ernest Rutherford', 'Radioactive', 'strong', 'Nuclear — discovered alpha/beta radiation, nuclear model', 1),
    ('Ernest Rutherford', 'Fire', 'moderate', 'Nuclear — transmutation of elements', 0),

    # Clausius — pupil of Ghost; Thermodynamics
    ('Rudolf Clausius', 'Ghost', 'strong', 'Pupil of School of Entropy — second law, coined entropy', 1),
    ('Rudolf Clausius', 'Heat', 'strong', 'Thermodynamics — heat flow direction, irreversibility', 1),

    # --- Heat: School of Thermodynamics ---
    # Carnot — head of Heat school; Thermodynamics
    ('Sadi Carnot', 'Heat', 'strong', 'Head of School of Thermodynamics — Carnot cycle, heat engine efficiency', 1),
    ('Sadi Carnot', 'Fire', 'moderate', 'Thermodynamics — heat as driving force of engines', 0),
    ('Sadi Carnot', 'Ice', 'moderate', 'Thermodynamics — temperature differentials, cold reservoir', 0),

    # Count Rumford — pupil of Heat; Thermodynamics
    ('Count Rumford (Benjamin Thompson)', 'Heat', 'strong', 'Pupil of School of Thermodynamics — heat from friction', 1),
    ('Count Rumford (Benjamin Thompson)', 'Fire', 'moderate', 'Thermodynamics — disproved caloric theory', 0),
    ('Count Rumford (Benjamin Thompson)', 'Ice', 'moderate', 'Thermodynamics — studied heat transfer and insulation', 0),

    # Fourier — pupil of Heat; Thermodynamics
    ('Joseph Fourier', 'Heat', 'strong', 'Pupil of School of Thermodynamics — heat conduction law', 1),
    ('Joseph Fourier', 'Fire', 'moderate', 'Thermodynamics — heat flow and temperature gradients', 0),
    ('Joseph Fourier', 'Ice', 'moderate', 'Thermodynamics — heat conduction from hot to cold', 0),

    # --- Magnetic: School of Fields ---
    # Maxwell — head of Magnetic school; Electromagnetism
    ('James Clerk Maxwell', 'Magnetic', 'strong', 'Head of School of Fields — unified electromagnetic theory', 1),
    ('James Clerk Maxwell', 'Electric', 'strong', 'Electromagnetism — electricity and magnetism are one force', 1),

    # Tesla — pupil of Magnetic; Electrical Engineering
    ('Nikola Tesla', 'Magnetic', 'strong', 'Pupil of School of Fields — rotating magnetic fields', 1),
    ('Nikola Tesla', 'Electric', 'strong', 'Electrical Engineering — AC motor, Tesla coil', 1),

    # Gilbert — pupil of Magnetic; Electromagnetism
    ('William Gilbert', 'Magnetic', 'strong', 'Pupil of School of Fields — De Magnete, Earth as magnet', 1),
    ('William Gilbert', 'Electric', 'strong', 'Electromagnetism — coined "electricus", studied static electricity', 1),

    # ===================================================
    # Additional scientists — affinities based on sub_field mappings
    # ===================================================

    # --- Physics - Mechanics ---
    # Galileo — Mechanics → Earth (strong), Metal (moderate)
    ('Galileo Galilei', 'Earth', 'strong', 'Mechanics — laws of falling bodies, gravity', 0),
    ('Galileo Galilei', 'Metal', 'moderate', 'Mechanics — statics, structural analysis', 0),
    ('Galileo Galilei', 'Cosmic', 'moderate', 'Telescopic astronomy — observed moons of Jupiter, phases of Venus', 0),

    # Euler — Calculus → Cosmic (strong), Heat (moderate)
    ('Leonhard Euler', 'Cosmic', 'strong', 'Calculus — mathematical analysis of celestial mechanics', 0),
    ('Leonhard Euler', 'Heat', 'moderate', 'Calculus — analytical methods in thermodynamics', 0),
    ('Leonhard Euler', 'Water', 'moderate', 'Fluid dynamics — Euler equations for inviscid flow', 0),

    # Lagrange — Calculus → Cosmic (strong), Heat (moderate)
    ('Joseph-Louis Lagrange', 'Cosmic', 'strong', 'Calculus — Lagrangian mechanics, celestial mechanics', 0),
    ('Joseph-Louis Lagrange', 'Heat', 'moderate', 'Calculus — analytical methods applied to energy systems', 0),

    # --- Physics - Thermodynamics ---
    # Planck — Thermodynamics → Heat (strong), Fire (moderate), Ice (moderate)
    ('Max Planck', 'Heat', 'strong', 'Thermodynamics — black-body radiation, energy quantization', 0),
    ('Max Planck', 'Fire', 'moderate', 'Thermodynamics — radiation and light emission', 0),
    ('Max Planck', 'Crystal', 'moderate', 'Quantum — quantized energy levels, discrete structure', 0),

    # --- Physics - Electromagnetism ---
    # Ohm — Electromagnetism → Electric (strong), Magnetic (strong)
    ('Georg Ohm', 'Electric', 'strong', 'Electromagnetism — Ohm\'s Law, electrical resistance', 0),
    ('Georg Ohm', 'Magnetic', 'strong', 'Electromagnetism — current flow and magnetic fields', 0),

    # Coulomb — Electromagnetism → Electric (strong), Magnetic (strong)
    ('Charles-Augustin de Coulomb', 'Electric', 'strong', 'Electromagnetism — Coulomb\'s Law, electrostatic force', 0),
    ('Charles-Augustin de Coulomb', 'Magnetic', 'strong', 'Electromagnetism — magnetic force measurements', 0),

    # Oersted — Electromagnetism → Electric (strong), Magnetic (strong)
    ('Hans Christian Oersted', 'Electric', 'strong', 'Electromagnetism — current deflects compass', 0),
    ('Hans Christian Oersted', 'Magnetic', 'strong', 'Electromagnetism — discovered electromagnetism link', 0),

    # Joseph Henry — Electromagnetism → Electric (strong), Magnetic (strong)
    ('Joseph Henry', 'Electric', 'strong', 'Electromagnetism — self-inductance, electromagnetic induction', 0),
    ('Joseph Henry', 'Magnetic', 'strong', 'Electromagnetism — powerful electromagnets', 0),

    # --- Physics - Nuclear/Particle ---
    # Bohr — Quantum → Crystal (strong), Cosmic (moderate), Ghost (moderate)
    ('Niels Bohr', 'Crystal', 'strong', 'Quantum — Bohr model, discrete energy levels like lattice order', 0),
    ('Niels Bohr', 'Cosmic', 'moderate', 'Quantum — fundamental structure of atoms and universe', 0),
    ('Niels Bohr', 'Radioactive', 'moderate', 'Nuclear — liquid drop model of atomic nucleus', 0),

    # Fermi — Nuclear → Radioactive (strong), Fire (moderate)
    ('Enrico Fermi', 'Radioactive', 'strong', 'Nuclear — first controlled nuclear chain reaction', 0),
    ('Enrico Fermi', 'Fire', 'moderate', 'Nuclear — enormous energy release from fission', 0),

    # Oppenheimer — Nuclear → Radioactive (strong), Fire (moderate)
    ('J. Robert Oppenheimer', 'Radioactive', 'strong', 'Nuclear — Manhattan Project, atomic bomb development', 0),
    ('J. Robert Oppenheimer', 'Fire', 'moderate', 'Nuclear — destructive energy release', 0),

    # Heisenberg — Quantum → Crystal (strong), Ghost (moderate)
    ('Werner Heisenberg', 'Crystal', 'strong', 'Quantum — matrix mechanics, structured mathematical formalism', 0),
    ('Werner Heisenberg', 'Ghost', 'moderate', 'Quantum — uncertainty principle, fundamental unknowability', 0),

    # Dirac — Quantum → Crystal (strong), Cosmic (moderate), Ghost (moderate)
    ('Paul Dirac', 'Crystal', 'strong', 'Quantum — elegant mathematical structures in physics', 0),
    ('Paul Dirac', 'Cosmic', 'moderate', 'Quantum — relativistic quantum mechanics', 0),
    ('Paul Dirac', 'Ghost', 'moderate', 'Quantum — predicted antimatter, mirror of matter', 0),

    # Feynman — Quantum → Crystal (strong), Cosmic (moderate)
    ('Richard Feynman', 'Crystal', 'strong', 'Quantum — path integrals, Feynman diagrams, structured QED', 0),
    ('Richard Feynman', 'Cosmic', 'moderate', 'Quantum — fundamental interactions at all scales', 0),

    # Becquerel — Nuclear → Radioactive (strong), Fire (moderate)
    ('Henri Becquerel', 'Radioactive', 'strong', 'Nuclear — discovered spontaneous radioactivity', 0),
    ('Henri Becquerel', 'Fire', 'moderate', 'Nuclear — energetic emissions from uranium', 0),

    # Gell-Mann — Quantum → Crystal (strong), Cosmic (moderate)
    ('Murray Gell-Mann', 'Crystal', 'strong', 'Quantum — quark model, ordered classification of particles', 0),
    ('Murray Gell-Mann', 'Cosmic', 'moderate', 'Quantum — fundamental building blocks of matter', 0),

    # --- Physics - Optics ---
    # Ibn al-Haytham — Optics → Fire (strong), Crystal (moderate), Cosmic (moderate)
    ('Ibn al-Haytham', 'Fire', 'strong', 'Optics — light, vision, and the nature of illumination', 0),
    ('Ibn al-Haytham', 'Crystal', 'moderate', 'Optics — refraction through lenses and prisms', 0),
    ('Ibn al-Haytham', 'Cosmic', 'moderate', 'Optics — astronomical observations and celestial light', 0),

    # Huygens — Optics → Fire (strong), Crystal (moderate), Cosmic (moderate)
    ('Christiaan Huygens', 'Fire', 'strong', 'Optics — wave theory of light', 0),
    ('Christiaan Huygens', 'Crystal', 'moderate', 'Optics — wavefront propagation, structured patterns', 0),
    ('Christiaan Huygens', 'Cosmic', 'moderate', 'Optics — discovered Titan, telescopic astronomy', 0),

    # --- Physics - Acoustics ---
    # Helmholtz — Acoustics → Sound (strong), Crystal (moderate); also Thermodynamics → Heat (moderate)
    ('Hermann von Helmholtz', 'Sound', 'strong', 'Acoustics — physiological acoustics, Helmholtz resonance', 0),
    ('Hermann von Helmholtz', 'Heat', 'moderate', 'Thermodynamics — conservation of energy', 0),
    ('Hermann von Helmholtz', 'Crystal', 'moderate', 'Acoustics — resonance and structured vibration', 0),

    # --- Physics - Fluid Dynamics ---
    # Reynolds — Fluid Dynamics → Water (strong), Air (moderate)
    ('Osborne Reynolds', 'Water', 'strong', 'Fluid dynamics — Reynolds number, turbulent vs laminar flow', 0),
    ('Osborne Reynolds', 'Air', 'moderate', 'Fluid dynamics — gas flow behavior', 0),

    # --- Physics - Crystallography ---
    # Max von Laue — Crystallography → Crystal (strong), Cosmic (moderate), Earth (moderate)
    ('Max von Laue', 'Crystal', 'strong', 'Crystallography — X-ray diffraction by crystals', 0),
    ('Max von Laue', 'Fire', 'moderate', 'Crystallography — proved X-rays are electromagnetic waves (light)', 0),

    # Dorothy Hodgkin — Crystallography → Crystal (strong), Plant (moderate)
    ('Dorothy Hodgkin', 'Crystal', 'strong', 'Crystallography — X-ray structures of penicillin, insulin, B12', 0),
    ('Dorothy Hodgkin', 'Plant', 'moderate', 'Crystallography — biomolecular structures, organic chemistry', 0),

    # --- Physics - Cryogenics ---
    # Dewar — Cryogenics → Ice (strong), Plant (moderate), Magnetic (moderate)
    ('James Dewar', 'Ice', 'strong', 'Cryogenics — first to liquefy hydrogen, vacuum flask', 0),
    ('James Dewar', 'Plant', 'moderate', 'Cryogenics — preservation at extreme cold', 0),

    # Carl von Linde — Cryogenics → Ice (strong), Magnetic (moderate)
    ('Carl von Linde', 'Ice', 'strong', 'Cryogenics — industrial air liquefaction, refrigeration', 0),
    ('Carl von Linde', 'Metal', 'moderate', 'Cryogenics — industrial machinery for gas separation', 0),

    # --- Physics - Superconductivity ---
    # Bardeen — Superconductivity → Ice (strong), Magnetic (strong), Crystal (moderate)
    ('John Bardeen', 'Ice', 'strong', 'Superconductivity — BCS theory at extreme cold', 0),
    ('John Bardeen', 'Magnetic', 'strong', 'Superconductivity — zero-resistance magnetic flux effects', 0),
    ('John Bardeen', 'Crystal', 'moderate', 'Superconductivity — lattice phonon interactions', 0),
    ('John Bardeen', 'Electric', 'moderate', 'Superconductivity — co-invented transistor, zero-resistance current', 0),

    # --- Physics - Modern/Quantum (cross-cutting) ---
    # Einstein — broad: Cosmic (strong, relativity), Fire (moderate, photoelectric), Crystal (moderate, quantum)
    ('Albert Einstein', 'Cosmic', 'strong', 'Relativity — spacetime curvature, cosmological implications', 0),
    ('Albert Einstein', 'Fire', 'moderate', 'Quantum — photoelectric effect, radiation physics', 0),
    ('Albert Einstein', 'Crystal', 'moderate', 'Quantum — quantized energy, Bose-Einstein statistics', 0),

    # Schrodinger — Quantum → Crystal (strong), Ghost (moderate)
    ('Erwin Schrodinger', 'Crystal', 'strong', 'Quantum — wave equation, structured mathematical formalism', 0),
    ('Erwin Schrodinger', 'Ghost', 'moderate', 'Quantum — superposition, probability, uncertainty', 0),

    # de Broglie — Quantum → Crystal (strong), Cosmic (moderate)
    ('Louis de Broglie', 'Crystal', 'strong', 'Quantum — wave-particle duality, structured wave mechanics', 0),
    ('Louis de Broglie', 'Cosmic', 'moderate', 'Quantum — universal applicability of wave-particle duality', 0),

    # Pauli — Quantum → Crystal (strong), Ghost (moderate)
    ('Wolfgang Pauli', 'Crystal', 'strong', 'Quantum — exclusion principle, ordered electron shells', 0),
    ('Wolfgang Pauli', 'Ghost', 'moderate', 'Quantum — predicted neutrino, elusive phantom particle', 0),

    # Born — Quantum → Crystal (strong), Ghost (moderate)
    ('Max Born', 'Crystal', 'strong', 'Quantum — Born rule, probability amplitudes in structured theory', 0),
    ('Max Born', 'Ghost', 'moderate', 'Quantum — statistical/probabilistic nature of reality', 0),

    # --- Chemistry - General ---
    # Mendeleev — Inorganic Chemistry → Metal (strong), Earth (moderate), Crystal (moderate)
    ('Dmitri Mendeleev', 'Metal', 'strong', 'Inorganic chemistry — periodic table organizing all elements', 0),
    ('Dmitri Mendeleev', 'Earth', 'moderate', 'Inorganic chemistry — elements from Earth\'s crust', 0),
    ('Dmitri Mendeleev', 'Crystal', 'moderate', 'Inorganic chemistry — periodic patterns, ordered classification', 0),

    # Dalton — Physical Chemistry → Heat (strong), Ice (moderate), Water (moderate)
    ('John Dalton', 'Heat', 'strong', 'Physical chemistry — atomic theory, gas behavior under heat', 0),
    ('John Dalton', 'Air', 'moderate', 'Physical chemistry — partial pressures of gases', 0),
    ('John Dalton', 'Water', 'moderate', 'Physical chemistry — studied water absorption in atmosphere', 0),

    # Pauling — Physical Chemistry → Heat (strong), Crystal (moderate)
    ('Linus Pauling', 'Heat', 'strong', 'Physical chemistry — nature of chemical bond, thermochemistry', 0),
    ('Linus Pauling', 'Crystal', 'moderate', 'Physical chemistry — molecular structure, X-ray crystallography', 0),
    ('Linus Pauling', 'Plant', 'moderate', 'Physical chemistry — molecular biology, vitamin C research', 0),

    # Arrhenius — Physical Chemistry → Heat (strong), Ice (moderate)
    ('Svante Arrhenius', 'Heat', 'strong', 'Physical chemistry — Arrhenius equation, temperature-dependent rates', 0),
    ('Svante Arrhenius', 'Water', 'moderate', 'Physical chemistry — ionic dissociation in solutions', 0),

    # Avogadro — Physical Chemistry → Heat (strong), Air (moderate)
    ('Amedeo Avogadro', 'Heat', 'strong', 'Physical chemistry — gas laws, molecular theory', 0),
    ('Amedeo Avogadro', 'Air', 'moderate', 'Physical chemistry — equal volumes of gas, gas behavior', 0),

    # Bunsen — Inorganic Chemistry → Metal (strong), Fire (moderate)
    ('Robert Bunsen', 'Metal', 'strong', 'Inorganic chemistry — discovered elements via spectroscopy', 0),
    ('Robert Bunsen', 'Fire', 'moderate', 'Inorganic chemistry — Bunsen burner, flame spectroscopy', 0),
    ('Robert Bunsen', 'Earth', 'moderate', 'Inorganic chemistry — mineral analysis', 0),

    # --- Chemistry - Organic ---
    # Wohler — Organic Chemistry → Poison (strong), Plant (moderate), Water (moderate)
    ('Friedrich Wohler', 'Poison', 'strong', 'Organic chemistry — first synthesis of organic from inorganic', 0),
    ('Friedrich Wohler', 'Plant', 'moderate', 'Organic chemistry — urea synthesis, bridge to biology', 0),

    # Kekule — Organic Chemistry → Poison (strong), Plant (moderate)
    ('August Kekule', 'Poison', 'strong', 'Organic chemistry — benzene structure, carbon chemistry', 0),
    ('August Kekule', 'Crystal', 'moderate', 'Organic chemistry — ring structure, molecular geometry', 0),

    # --- Biology - Microbiology/Biochemistry ---
    # Pasteur — Microbiology → Poison (strong), Plant (strong)
    ('Louis Pasteur', 'Poison', 'strong', 'Microbiology — germ theory, sterilization, fighting disease', 0),
    ('Louis Pasteur', 'Plant', 'strong', 'Microbiology — fermentation, microbial life processes', 0),
    ('Louis Pasteur', 'Ghost', 'moderate', 'Microbiology — defeating invisible causes of death', 0),

    # --- Biology - Evolution ---
    # Wallace — Evolution → Plant (strong), Ghost (moderate)
    ('Alfred Russel Wallace', 'Plant', 'strong', 'Evolution — natural selection, biogeography of living things', 0),
    ('Alfred Russel Wallace', 'Ghost', 'moderate', 'Evolution — extinction, death as driver of change', 0),

    # --- Biology - Genetics ---
    # Franklin — Genetics → Plant (strong), Crystal (moderate)
    ('Rosalind Franklin', 'Plant', 'strong', 'Genetics — DNA X-ray diffraction, molecular biology', 0),
    ('Rosalind Franklin', 'Crystal', 'strong', 'Genetics — X-ray crystallography of DNA', 0),

    # Watson — Genetics → Plant (strong), Crystal (moderate)
    ('James Watson', 'Plant', 'strong', 'Genetics — double helix structure of DNA', 0),
    ('James Watson', 'Crystal', 'moderate', 'Genetics — structural biology, molecular architecture', 0),

    # Crick — Genetics → Plant (strong), Crystal (moderate)
    ('Francis Crick', 'Plant', 'strong', 'Genetics — DNA structure, central dogma of molecular biology', 0),
    ('Francis Crick', 'Crystal', 'moderate', 'Genetics — molecular structure of genetic code', 0),

    # McClintock — Genetics → Plant (strong), Crystal (moderate)
    ('Barbara McClintock', 'Plant', 'strong', 'Genetics — transposable elements in corn', 0),
    ('Barbara McClintock', 'Crystal', 'moderate', 'Genetics — chromosomal structure and crossover', 0),

    # Stevens — Genetics → Plant (strong), Crystal (moderate)
    ('Nettie Stevens', 'Plant', 'strong', 'Genetics — sex chromosome discovery', 0),
    ('Nettie Stevens', 'Crystal', 'moderate', 'Genetics — chromosomal structure', 0),

    # --- Biology - Ecology/Botany ---
    # Linnaeus — Ecology → Plant (strong), Water (moderate), Earth (moderate)
    ('Carl Linnaeus', 'Plant', 'strong', 'Ecology — taxonomy, systematic classification of all life', 0),
    ('Carl Linnaeus', 'Water', 'moderate', 'Ecology — aquatic species classification', 0),
    ('Carl Linnaeus', 'Earth', 'moderate', 'Ecology — terrestrial habitat classification', 0),

    # Humboldt — Ecology → Plant (strong), Water (moderate), Earth (moderate)
    ('Alexander von Humboldt', 'Plant', 'strong', 'Ecology — biogeography, plant distribution by climate', 0),
    ('Alexander von Humboldt', 'Water', 'moderate', 'Ecology — oceanic currents, Humboldt Current', 0),
    ('Alexander von Humboldt', 'Earth', 'moderate', 'Ecology — geological surveys, mountain ecosystems', 0),

    # Carson — Ecology → Plant (strong), Poison (moderate)
    ('Rachel Carson', 'Plant', 'strong', 'Ecology — environmental biology, ecosystem health', 0),
    ('Rachel Carson', 'Poison', 'moderate', 'Ecology — exposed pesticide damage, toxic bioaccumulation', 0),
    ('Rachel Carson', 'Water', 'moderate', 'Ecology — marine biology, ocean ecosystem study', 0),

    # --- Biology - Microbiology ---
    # Koch — Microbiology → Poison (strong), Plant (moderate), Ghost (moderate)
    ('Robert Koch', 'Poison', 'strong', 'Microbiology — identified pathogens causing disease', 0),
    ('Robert Koch', 'Plant', 'moderate', 'Microbiology — microbial life, bacterial cultures', 0),
    ('Robert Koch', 'Ghost', 'moderate', 'Microbiology — deadly invisible agents of disease', 0),

    # Leeuwenhoek — Microbiology → Poison (strong), Plant (moderate), Ghost (moderate)
    ('Anton van Leeuwenhoek', 'Poison', 'strong', 'Microbiology — first to see microorganisms, invisible world', 0),
    ('Anton van Leeuwenhoek', 'Plant', 'moderate', 'Microbiology — observed living cells and organisms', 0),
    ('Anton van Leeuwenhoek', 'Crystal', 'moderate', 'Microbiology — lens-grinding, optical precision', 0),

    # Fleming — Microbiology → Poison (strong), Plant (moderate)
    ('Alexander Fleming', 'Poison', 'strong', 'Microbiology — penicillin, fighting bacterial infection', 0),
    ('Alexander Fleming', 'Plant', 'moderate', 'Microbiology — mold-derived antibiotic, biological agent', 0),

    # --- Mathematics ---
    # Euclid — Geometry → Crystal (strong), Earth (moderate)
    ('Euclid', 'Crystal', 'strong', 'Geometry — foundational geometry, structured proofs', 0),
    ('Euclid', 'Earth', 'moderate', 'Geometry — measurement of physical space and form', 0),

    # Gauss — Algebra → Crystal (strong), Magnetic (strong), Cosmic (moderate)
    ('Carl Friedrich Gauss', 'Magnetic', 'strong', 'Measured Earth\'s magnetic field; Gauss unit of magnetism', 0),
    ('Carl Friedrich Gauss', 'Crystal', 'strong', 'Algebra — number theory, structured mathematical patterns', 0),
    ('Carl Friedrich Gauss', 'Cosmic', 'moderate', 'Astronomy — calculated orbits of Ceres and asteroids', 0),

    # Riemann — Geometry → Crystal (strong), Earth (moderate), Cosmic (moderate)
    ('Bernhard Riemann', 'Crystal', 'strong', 'Geometry — Riemannian geometry, structured curved spaces', 0),
    ('Bernhard Riemann', 'Earth', 'moderate', 'Geometry — geometric measurement of physical space', 0),
    ('Bernhard Riemann', 'Cosmic', 'moderate', 'Geometry — mathematical foundation for general relativity', 0),

    # Lovelace — Algebra → Crystal (strong), Magnetic (moderate)
    ('Ada Lovelace', 'Crystal', 'strong', 'Algebra — first algorithm, structured computation', 0),
    ('Ada Lovelace', 'Magnetic', 'moderate', 'Algebra — logical structures, proto-computing machinery', 0),

    # Noether — Algebra → Crystal (strong), Cosmic (moderate)
    ('Emmy Noether', 'Crystal', 'strong', 'Algebra — abstract algebra, symmetry and conservation', 0),
    ('Emmy Noether', 'Cosmic', 'moderate', 'Algebra — Noether\'s theorem links symmetry to physics', 0),

    # Ramanujan — Algebra → Crystal (strong), Cosmic (moderate)
    ('Srinivasa Ramanujan', 'Crystal', 'strong', 'Algebra — number theory, infinite series, mathematical patterns', 0),
    ('Srinivasa Ramanujan', 'Cosmic', 'moderate', 'Algebra — deep, mysterious mathematical truths', 0),

    # Turing — Algebra → Crystal (strong), Magnetic (moderate)
    ('Alan Turing', 'Crystal', 'strong', 'Algebra — Turing machine, formal logic, computation', 0),
    ('Alan Turing', 'Magnetic', 'moderate', 'Algebra — codebreaking, electromechanical computing', 0),

    # Laplace — Calculus → Cosmic (strong), Heat (moderate)
    ('Pierre-Simon Laplace', 'Cosmic', 'strong', 'Calculus — celestial mechanics, nebular hypothesis', 0),
    ('Pierre-Simon Laplace', 'Heat', 'moderate', 'Calculus — Laplace equation in thermodynamics', 0),
    ('Pierre-Simon Laplace', 'Ghost', 'moderate', 'Statistics — probability theory, Bayesian inference', 0),

    # --- Astronomy ---
    # Copernicus — Observational Astronomy → Cosmic (strong), Fire (moderate)
    ('Nicolaus Copernicus', 'Cosmic', 'strong', 'Observational Astronomy — heliocentric model', 0),
    ('Nicolaus Copernicus', 'Fire', 'moderate', 'Observational Astronomy — Sun-centered theory', 0),

    # Kepler — Observational Astronomy → Cosmic (strong), Fire (moderate)
    ('Johannes Kepler', 'Cosmic', 'strong', 'Observational Astronomy — laws of planetary motion', 0),
    ('Johannes Kepler', 'Fire', 'moderate', 'Observational Astronomy — studied light and stellar phenomena', 0),
    ('Johannes Kepler', 'Crystal', 'moderate', 'Observational Astronomy — geometric harmonics in orbits', 0),

    # Brahe — Observational Astronomy → Cosmic (strong), Fire (moderate)
    ('Tycho Brahe', 'Cosmic', 'strong', 'Observational Astronomy — most precise pre-telescopic star catalog', 0),
    ('Tycho Brahe', 'Fire', 'moderate', 'Observational Astronomy — observed supernovae, stellar phenomena', 0),

    # Rubin — Cosmology → Cosmic (strong), Ghost (moderate)
    ('Vera Rubin', 'Cosmic', 'strong', 'Cosmology — galaxy rotation curves, dark matter evidence', 0),
    ('Vera Rubin', 'Ghost', 'moderate', 'Cosmology — dark matter, invisible mass', 0),

    # Payne-Gaposchkin — Astrophysics → Cosmic (strong), Fire (moderate)
    ('Cecilia Payne-Gaposchkin', 'Cosmic', 'strong', 'Astrophysics — stellar composition of hydrogen and helium', 0),
    ('Cecilia Payne-Gaposchkin', 'Fire', 'moderate', 'Astrophysics — stellar spectra and nuclear processes', 0),

    # Chandrasekhar — Astrophysics → Cosmic (strong), Fire (moderate), Radioactive (moderate)
    ('Subrahmanyan Chandrasekhar', 'Cosmic', 'strong', 'Astrophysics — Chandrasekhar limit, stellar evolution', 0),
    ('Subrahmanyan Chandrasekhar', 'Fire', 'moderate', 'Astrophysics — stellar energy and radiation', 0),
    ('Subrahmanyan Chandrasekhar', 'Radioactive', 'moderate', 'Astrophysics — nuclear processes in stellar cores', 0),

    # Hawking — Cosmology → Cosmic (strong), Ghost (moderate), Radioactive (moderate)
    ('Stephen Hawking', 'Cosmic', 'strong', 'Cosmology — black holes, singularity theorems', 0),
    ('Stephen Hawking', 'Ghost', 'moderate', 'Cosmology — Hawking radiation, information paradox', 0),
    ('Stephen Hawking', 'Radioactive', 'moderate', 'Cosmology — black hole thermodynamics, quantum effects', 0),

    # --- Earth Sciences ---
    # Lyell — Geology → Earth (strong), Metal (moderate), Crystal (moderate)
    ('Charles Lyell', 'Earth', 'strong', 'Geology — uniformitarianism, Principles of Geology', 0),
    ('Charles Lyell', 'Metal', 'moderate', 'Geology — mineral and rock classification', 0),

    # Anning — Geology → Earth (strong), Ghost (moderate)
    ('Mary Anning', 'Earth', 'strong', 'Geology — fossil discovery, paleontology', 0),
    ('Mary Anning', 'Ghost', 'moderate', 'Geology — fossils of extinct creatures, deep time death', 0),

    # Tharp — Geology → Earth (strong), Water (moderate)
    ('Marie Tharp', 'Earth', 'strong', 'Geology — ocean floor mapping, plate tectonics evidence', 0),
    ('Marie Tharp', 'Water', 'moderate', 'Geology — oceanic surveying and submarine topography', 0),

    # Agricola — Geology → Earth (strong), Metal (strong)
    ('Georgius Agricola', 'Earth', 'strong', 'Geology — father of mineralogy, systematic mining study', 0),
    ('Georgius Agricola', 'Metal', 'strong', 'Geology — De Re Metallica, metallurgy and mining', 0),

    # --- Engineering ---
    # Edison — Electrical Engineering → Electric (strong), Magnetic (moderate)
    ('Thomas Edison', 'Electric', 'strong', 'Electrical Engineering — light bulb, power distribution', 0),
    ('Thomas Edison', 'Magnetic', 'moderate', 'Electrical Engineering — electromagnetic devices', 0),
    ('Thomas Edison', 'Fire', 'moderate', 'Electrical Engineering — incandescence, light from heat', 0),

    # Marconi — Electrical Engineering → Electric (strong), Magnetic (moderate)
    ('Guglielmo Marconi', 'Electric', 'strong', 'Electrical Engineering — radio transmission', 0),
    ('Guglielmo Marconi', 'Magnetic', 'moderate', 'Electrical Engineering — electromagnetic wave propagation', 0),

    # Watt — Mechanical Engineering → Metal (strong), Heat (moderate), Earth (moderate)
    ('James Watt', 'Metal', 'strong', 'Mechanical Engineering — improved steam engine, industrial machinery', 0),
    ('James Watt', 'Heat', 'moderate', 'Mechanical Engineering — heat-to-work conversion', 0),
    ('James Watt', 'Fire', 'moderate', 'Mechanical Engineering — steam power from combustion', 0),

    # von Braun — Mechanical Engineering → Metal (strong), Fire (moderate)
    ('Wernher von Braun', 'Metal', 'strong', 'Mechanical Engineering — rocket engineering, structural design', 0),
    ('Wernher von Braun', 'Fire', 'moderate', 'Mechanical Engineering — rocket propulsion, combustion', 0),
    ('Wernher von Braun', 'Cosmic', 'moderate', 'Mechanical Engineering — space exploration, Saturn V', 0),

    # --- Medicine ---
    # Hippocrates — Medicine/Anatomy → Plant (strong), Ghost (moderate)
    ('Hippocrates', 'Plant', 'strong', 'Medicine/Anatomy — systematic study of the living body', 0),
    ('Hippocrates', 'Ghost', 'moderate', 'Medicine/Anatomy — understanding disease and death', 0),

    # Vesalius — Medicine/Anatomy → Plant (strong), Ghost (moderate)
    ('Andreas Vesalius', 'Plant', 'strong', 'Medicine/Anatomy — detailed human anatomy', 0),
    ('Andreas Vesalius', 'Ghost', 'moderate', 'Medicine/Anatomy — dissection, understanding death', 0),

    # Jenner — Pharmacology → Poison (strong), Plant (moderate)
    ('Edward Jenner', 'Poison', 'strong', 'Pharmacology — vaccination, using disease against disease', 0),
    ('Edward Jenner', 'Plant', 'moderate', 'Pharmacology — cowpox from living organisms, immunology', 0),

    # Harvey — Medicine/Anatomy → Plant (strong), Water (moderate)
    ('William Harvey', 'Plant', 'strong', 'Medicine/Anatomy — circulation of blood, living body systems', 0),
    ('William Harvey', 'Water', 'moderate', 'Medicine/Anatomy — blood as flowing fluid, circulation', 0),

    # Tu Youyou — Pharmacology → Poison (strong), Plant (moderate)
    ('Tu Youyou', 'Poison', 'strong', 'Pharmacology — artemisinin antimalarial, combating parasites', 0),
    ('Tu Youyou', 'Plant', 'moderate', 'Pharmacology — traditional herbal medicine source', 0),

    # --- Additional (cross-cutting) ---
    # Hooke — Mechanics → Earth (strong), Metal (moderate); also biology
    ('Robert Hooke', 'Earth', 'strong', 'Mechanics — Hooke\'s Law, elasticity of solids', 0),
    ('Robert Hooke', 'Metal', 'moderate', 'Mechanics — spring constants, structural forces', 0),
    ('Robert Hooke', 'Plant', 'moderate', 'Biology — coined "cell", Micrographia', 0),

    # Franklin — Electromagnetism → Electric (strong), Magnetic (strong)
    ('Benjamin Franklin', 'Electric', 'strong', 'Electromagnetism — proved lightning is electrical', 0),
    ('Benjamin Franklin', 'Magnetic', 'strong', 'Electromagnetism — lightning rod, electrical phenomena', 0),

    # Galvani — Electrochemistry → Electric (strong), Metal (moderate), Water (moderate)
    ('Luigi Galvani', 'Electric', 'strong', 'Electrochemistry — bioelectricity, galvanism', 0),
    ('Luigi Galvani', 'Plant', 'moderate', 'Electrochemistry — biological electrical stimulation', 0),
    ('Luigi Galvani', 'Metal', 'moderate', 'Electrochemistry — metal electrodes in experiments', 0),

    # Goeppert Mayer — Nuclear → Radioactive (strong), Crystal (moderate)
    ('Maria Goeppert Mayer', 'Radioactive', 'strong', 'Nuclear — nuclear shell model, magic numbers', 0),
    ('Maria Goeppert Mayer', 'Crystal', 'moderate', 'Nuclear — ordered shell structure of nucleus', 0),

    # Wu — Nuclear → Radioactive (strong), Ghost (moderate)
    ('Chien-Shiung Wu', 'Radioactive', 'strong', 'Nuclear — Wu experiment, parity violation in weak force', 0),
    ('Chien-Shiung Wu', 'Ghost', 'moderate', 'Nuclear — asymmetry, broken symmetry in physics', 0),
]


# =============================================
# Progression Tree Data (Rebalanced — Global Era Tiers)
# =============================================

# Tier 1: Survival (~2.6M-10K BCE, costs 0-50)
# Tier 2: Settlement (~10K-3K BCE, costs 50-300) — Plant gate
# Tier 3: Ancient (~3K-500 BCE, costs 300-1500) — Metal gate
# Tier 4: Classical/Medieval (~500 BCE-1500 CE, costs 1500-5000)
# Tier 5: Scientific Revolution (~1500-1800, costs 5000-25000) — Ice gate
# Tier 6: Industrial (~1800-1900, costs 25000-100000) — Electric gate

# (name, description, flavor_text, type_name, category, tier, era, historical_date, scientist, sort_order)
INCREMENTAL_NODES = [
    # === EARTH TREE (14 nodes) ===
    # Tier 1 - Survival
    ('Stone Knapping',
     'Shape stone by striking flint against flint. The first tool.',
     'You shape the first stone.',
     'Earth', 'active', 1, 'prehistoric', '~2.6M BCE', None, 1),

    ('Grinding & Polishing',
     'Smooth stone through abrasion. Ground stone tools last longer and cut cleaner.',
     'The rough becomes smooth.',
     'Earth', 'generator', 1, 'prehistoric', '~30,000 BCE', None, 2),
    ('Shelter Construction',
     'Build windbreaks, lean-tos, and simple huts from earth and stone materials.',
     'The first walls rise.',
     'Earth', 'generator', 1, 'prehistoric', '~400,000 BCE', None, 3),
    # Tier 2 - Settlement
    ('Clay Working',
     'Shape wet clay into vessels and figures. Unfired clay crumbles, but the form holds.',
     'Earth remembers the shape of your hands.',
     'Earth', 'discovery', 2, 'prehistoric', '~25,000 BCE', None, 4),
    ('Ochre Mining',
     'Dig red pigment from iron oxide deposits. The first deliberate extraction of earth materials.',
     'You reach into the earth and pull out color.',
     'Earth', 'generator', 2, 'prehistoric', '~100,000 BCE', None, 5),
    ('Fired Pottery',
     'Bake clay in a kiln. Heat transforms soft clay into hard, permanent ceramic.',
     'Fire and earth conspire. The soft becomes unbreakable.',
     'Earth', 'gate', 2, 'ancient', '~6,000 BCE', None, 6),
    # Tier 3 - Ancient Civilizations
    ('Quarrying',
     'Extract large stone blocks from bedrock. Cut, lever, and transport.',
     'You take what the mountain offers.',
     'Earth', 'generator', 3, 'ancient', '~2,600 BCE', None, 10),
    ('Masonry',
     'Fit shaped stones together without mortar. Precision construction.',
     'Stone answers to stone.',
     'Earth', 'multiplier', 3, 'ancient', '~2,500 BCE', None, 11),
    ('Mining',
     'Dig shafts underground to reach mineral deposits. Flint, copper ore, gems.',
     'You descend into the dark and return with treasure.',
     'Earth', 'discovery', 3, 'ancient', '~4,000 BCE', None, 12),
    # Tier 4 - Classical/Medieval
    ('Fortification',
     'Walls, towers, keeps. Stone shaped for defense. The earth protects.',
     'Behind these walls, knowledge grows.',
     'Earth', 'generator', 4, 'classical', '~3,000 BCE', None, 20),
    ('Mineral Classification',
     'Catalog stones by hardness, color, luster, and behavior when heated.',
     'You name the bones of the earth.',
     'Earth', 'discovery', 4, 'classical', '~315 BCE', 'Theophrastus', 21),
    # Tier 5 - Scientific Revolution
    ('Stratigraphy',
     'Lower layers are older. Earth records its own history in stone.',
     'The earth is a book. You learn to read it.',
     'Earth', 'discovery', 5, 'early_modern', '1669', 'Nicolaus Steno', 25),
    ('Falling Bodies',
     'All objects fall at the same rate, regardless of weight. Aristotle was wrong.',
     'The feather and the hammer strike together.',
     'Earth', 'landmark', 5, 'early_modern', '~1590', 'Galileo Galilei', 26),
    # Tier 6 - Industrial
    ('Universal Gravitation',
     'The apple and the moon obey the same law. F = Gm1m2/r^2.',
     'The force that holds you down holds the stars in place.',
     'Earth', 'landmark', 6, 'early_modern', '1687', 'Isaac Newton', 30),

    # === WATER TREE (12 nodes) ===
    # Tier 1 - Survival
    ('Finding Water',
     'Follow animal trails, read terrain, find springs and streams.',
     'Where green grows, water flows.',
     'Water', 'active', 1, 'prehistoric', '~200,000 BCE', None, 1),
    ('Water Storage',
     'Clay vessels hold water between trips to the river. Settlement becomes possible.',
     'You carry the river home.',
     'Water', 'generator', 1, 'prehistoric', '~7,000 BCE', None, 2),
    # Tier 2 - Settlement
    ('Well-Digging',
     'Dig down to the water table. A reliable source that does not move.',
     'You find the hidden river beneath the earth.',
     'Water', 'generator', 2, 'ancient', '~6,500 BCE', None, 3),
    ('Fermentation',
     'Grain and water left together transform. Something new bubbles up.',
     'The water changes. It bites back.',
     'Water', 'discovery', 2, 'prehistoric', '~7,000 BCE', None, 4),
    ('Basic Irrigation',
     'Simple channels redirect river water to fields. Water goes where you tell it.',
     'You teach the river a new path.',
     'Water', 'gate', 2, 'ancient', '~6,000 BCE', None, 5),
    # Tier 3 - Ancient Civilizations
    ('Canal Systems',
     'Elaborate networks of canals, levees, and reservoirs. Cities rise along the water.',
     'Where water flows, civilization follows.',
     'Water', 'generator', 3, 'ancient', '~3,500 BCE', None, 10),
    ('Sailing',
     'Reed boats catch the wind. The river becomes a road. The sea becomes a frontier.',
     'The water carries you to places stone cannot reach.',
     'Water', 'gate', 3, 'ancient', '~3,500 BCE', None, 11),
    ('Water Wheel',
     'Flowing water turns a wheel. Mechanical power from the river.',
     'The river works while you sleep.',
     'Water', 'generator', 3, 'ancient', '~300 BCE', None, 12),
    # Tier 4 - Classical/Medieval
    ('Aqueduct',
     'Gravity-fed channels carry water across valleys and into cities. Rome drinks.',
     'Water flows uphill for those who understand the earth.',
     'Water', 'generator', 4, 'classical', '~312 BCE', 'Roman engineers', 15),
    ('Distillation',
     'Heat liquid, capture vapor, cool it back. Separate the pure from the impure.',
     'You teach water to forget what it carried.',
     'Water', 'discovery', 4, 'medieval', '~800 CE', 'Jabir ibn Hayyan', 16),
    # Tier 5 - Scientific Revolution
    ('Hydrodynamics',
     'Fluids in motion obey mathematical laws. Pressure, flow, and force become predictable.',
     'The river reveals its secrets to those who measure.',
     'Water', 'discovery', 5, 'early_modern', '1738', 'Daniel Bernoulli', 20),
    ('Oceanography',
     'The sea is not chaos. Currents, salinity, and depth follow patterns.',
     'You map what was once unknowable.',
     'Water', 'landmark', 5, 'early_modern', '1770s', 'Benjamin Franklin', 21),

    # === AIR TREE (11 nodes) ===
    # Tier 1 - Survival
    ('Breath',
     'The most fundamental interaction with air. You breathe in, you breathe out.',
     'You breathe.',
     'Air', 'active', 1, 'prehistoric', None, None, 1),
    ('Wind Awareness',
     'The invisible moves. Wind carries scent, cools skin, bends trees.',
     'Something you cannot see pushes the world.',
     'Air', 'generator', 1, 'prehistoric', None, None, 2),
    # Tier 2 - Settlement
    ('Wind Instruments',
     'Blow through a hollow bone. A sound emerges that is not your voice.',
     'You teach air to sing.',
     'Air', 'discovery', 2, 'prehistoric', '~43,000 BCE', None, 3),
    ('Sails',
     'Fabric catches wind. The invisible becomes a force that carries you across water.',
     'You harness what you cannot hold.',
     'Air', 'instrument', 2, 'ancient', '~3,500 BCE', None, 5),
    # Tier 3 - Ancient Civilizations
    ('Bellows',
     'Force air into fire. The flame roars hotter. Temperatures once impossible become routine.',
     'You feed the fire with the wind.',
     'Air', 'gate', 3, 'ancient', '~3,000 BCE', None, 10),
    ('Windmill',
     'Wind turns stone. Grain becomes flour. The invisible grinds the solid.',
     'You put the wind to work.',
     'Air', 'generator', 3, 'medieval', '~600 CE', None, 11),
    # Tier 4 - Classical/Medieval
    ('Weather Observation',
     'Patterns in the sky predict what comes next. Clouds, wind, and pressure tell stories.',
     'You learn to read the sky.',
     'Air', 'discovery', 4, 'medieval', '~340 BCE', 'Aristotle', 15),
    ('Vacuum Discovery',
     'Remove the air from a space. Something remains: nothing. The void is real.',
     'You discover what is left when everything is taken away.',
     'Air', 'landmark', 4, 'early_modern', '1643', 'Evangelista Torricelli', 16),
    # Tier 5 - Scientific Revolution
    ('Barometer',
     'Mercury rises and falls with the weight of the sky. The atmosphere is measurable.',
     'You weigh the invisible ocean above.',
     'Air', 'instrument', 5, 'early_modern', '1643', 'Evangelista Torricelli', 20),
    ('Gas Laws',
     'Pressure times volume is constant. Temperature and volume are proportional. Air obeys mathematics.',
     'You write the laws of the invisible.',
     'Air', 'landmark', 5, 'early_modern', '1662', 'Robert Boyle', 21),
    ('Hot Air Balloon',
     'Heat air inside a bag. It rises. For the first time, humans leave the ground.',
     'You ride the warm breath of the earth into the sky.',
     'Air', 'instrument', 5, 'early_modern', '1783', 'Montgolfier Brothers', 22),

    # === FIRE TREE (13 nodes) ===
    # Tier 1 - Survival
    ('Spark',
     'Strike flint against pyrite. A tiny ember leaps. Capture it.',
     'You steal light from stone.',
     'Fire', 'active', 1, 'prehistoric', '~1M BCE', None, 1),
    ('Campfire',
     'A ring of stones. Fuel arranged with care. The first hearth.',
     'The dark retreats.',
     'Fire', 'generator', 1, 'prehistoric', '~400,000 BCE', None, 2),
    # Tier 2 - Settlement
    ('Cooking',
     'Raw becomes cooked. Proteins break down. More energy from the same food.',
     'Fire transforms what the earth provides.',
     'Fire', 'multiplier', 2, 'prehistoric', '~400,000 BCE', None, 3),
    ('Fire-Starting',
     'Bow drill, hand drill, flint and steel. You no longer wait for lightning.',
     'You create fire from nothing.',
     'Fire', 'discovery', 2, 'prehistoric', '~100,000 BCE', None, 4),
    # Tier 3 - Ancient Civilizations
    ('Charcoal',
     'Wood heated without air becomes charcoal. It burns hotter and cleaner.',
     'You refine the fuel.',
     'Fire', 'multiplier', 3, 'ancient', '~4,500 BCE', None, 5),
    ('Kiln',
     'A controlled enclosure of extreme heat. Clay transforms. Glass is born.',
     'You build a house for fire.',
     'Fire', 'instrument', 3, 'ancient', '~6,000 BCE', None, 10),
    ('Copper Smelting',
     'Green rock enters the crucible. Liquid metal pours out. The impossible made real.',
     'The stone bleeds bright.',
     'Fire', 'gate', 3, 'ancient', '~5,000 BCE', None, 11),
    # Tier 4 - Classical/Medieval
    ('Glassmaking',
     'Sand melted with soda ash. Liquid earth becomes transparent solid. Everything changes.',
     'You make the earth see-through.',
     'Fire', 'landmark', 4, 'ancient', '~3,500 BCE', None, 12),
    ('Gunpowder',
     'Saltpeter, sulfur, charcoal. Mixed and ignited, they explode. Fire becomes force.',
     'You bottle thunder.',
     'Fire', 'discovery', 4, 'medieval', '~850 CE', None, 15),
    ('Alchemy',
     'Glass vessels over flames. Substances dissolve, distill, transform. The search for understanding.',
     'You ask fire what things are made of.',
     'Fire', 'discovery', 4, 'medieval', '~800 CE', 'Jabir ibn Hayyan', 16),
    # Tier 5 - Scientific Revolution
    ('Thermometer',
     'Mercury in a glass tube rises and falls with heat. Temperature becomes a number.',
     'You give heat a name it cannot argue with.',
     'Fire', 'instrument', 5, 'early_modern', '1714', 'Daniel Fahrenheit', 20),
    ('Phlogiston & Combustion',
     'First a wrong theory, then the right one. Fire is not a substance released — it is oxygen consumed.',
     'You were wrong, and then you were right. Both mattered.',
     'Fire', 'landmark', 5, 'early_modern', '1777', 'Antoine Lavoisier', 21),
    ('Steam Engine',
     'Fire boils water. Steam drives a piston. Heat becomes motion. The world accelerates.',
     'You teach fire to pull.',
     'Fire', 'instrument', 5, 'early_modern', '1769', 'James Watt', 22),

    # === METAL TREE (10 nodes) ===
    # Tier 3 - Ancient Civilizations (unlocked by Copper Smelting)
    ('Copper Working',
     'Hammer raw copper into shape. Soft but workable. The first metal craft.',
     'The stone yields to a new material.',
     'Metal', 'active', 3, 'ancient', '~5,000 BCE', None, 1),
    ('Tin Discovery',
     'A rare soft metal found in river gravel. Alone it is weak. Combined it will change the world.',
     'You find a metal that wants a partner.',
     'Metal', 'discovery', 3, 'ancient', '~3,500 BCE', None, 2),
    ('Bronze Alloy',
     'Copper and tin melted together. The result is harder than either. The Bronze Age begins.',
     'Two weaknesses become one strength.',
     'Metal', 'landmark', 3, 'ancient', '~3,300 BCE', None, 3),
    # Tier 4 - Classical/Medieval
    ('Iron Smelting',
     'Higher heat, harder metal. Iron requires more but gives more. The world hardens.',
     'The age of bronze ends. The age of iron begins.',
     'Metal', 'discovery', 4, 'ancient', '~1,200 BCE', None, 10),
    ('Blacksmithing',
     'Heat, hammer, shape, quench. The smith bends metal to will. Tools, weapons, art.',
     'You learn the language iron speaks.',
     'Metal', 'generator', 4, 'classical', '~1,000 BCE', None, 11),
    ('Damascus Steel',
     'Layered, folded, forged. Steel with patterns like flowing water. The pinnacle of ancient craft.',
     'The metal remembers every fold.',
     'Metal', 'multiplier', 4, 'medieval', '~300 BCE', None, 12),
    # Tier 5 - Scientific Revolution
    ('Blast Furnace',
     'Towering stone and forced air. Iron melts to liquid. Production at scale.',
     'The furnace roars and iron flows like water.',
     'Metal', 'generator', 5, 'medieval', '~1300 CE', None, 20),
    ('Cast Iron',
     'Liquid iron poured into molds. Complex shapes in quantity. Industry takes form.',
     'Metal takes any shape you can imagine.',
     'Metal', 'generator', 5, 'early_modern', '~1500 CE', None, 21),
    # Tier 6 - Industrial
    ('Bessemer Process',
     'Air blown through molten iron. Carbon burns away. Cheap steel by the ton.',
     'Steel for everyone. The world rebuilds itself.',
     'Metal', 'landmark', 6, 'industrial', '1856', 'Henry Bessemer', 25),
    ('Periodic Table of Metals',
     'Elements arranged by weight and property. Patterns emerge. The metals make sense.',
     'You arrange the metals and the pattern reveals itself.',
     'Metal', 'discovery', 6, 'industrial', '1869', 'Dmitri Mendeleev', 26),

    # === PLANT TREE (10 nodes) ===
    # Gate (cross-type, unlocks Plant)
    ('Agriculture',
     'Seeds planted in watered earth grow into food. The first harvest.',
     'You plant a seed and the earth answers.',
     None, 'gate', 2, 'ancient', '~10,000 BCE', None, 100),
    # Tier 2 - Settlement (free starter when Plant unlocks)
    ('Seed Saving',
     'Keep the best seeds from each harvest. Next year will be better.',
     'You teach the earth to remember.',
     'Plant', 'active', 2, 'prehistoric', '~9,000 BCE', None, 1),
    # Tier 3 - Ancient Civilizations
    ('Crop Rotation',
     'Different plants in different years. The soil recovers. Yields increase.',
     'The earth needs rest, and you learn to give it.',
     'Plant', 'generator', 3, 'ancient', '~6,000 BCE', None, 5),
    ('Herbalism',
     'Plants that heal, plants that harm. Knowledge passed down through generations.',
     'The green world whispers its secrets to those who listen.',
     'Plant', 'generator', 3, 'ancient', '~3,000 BCE', None, 6),
    # Tier 4 - Classical/Medieval
    ('Grafting',
     'Cut a branch from one tree, bind it to another. They grow as one. Life is combinable.',
     'You teach one tree to bear the fruit of another.',
     'Plant', 'generator', 4, 'classical', '~1,000 BCE', None, 10),
    ('Botanical Classification',
     'Group plants by flower, seed, leaf. Order emerges from the green chaos.',
     'You give every green thing a name and a family.',
     'Plant', 'discovery', 4, 'classical', '~300 BCE', 'Theophrastus', 11),
    ('Crop Breeding',
     'Cross plants deliberately. Select for traits. Shape what grows.',
     'You become the hand that guides the green.',
     'Plant', 'multiplier', 4, 'medieval', '~1000 CE', None, 12),
    # Tier 5 - Scientific Revolution
    ('Photosynthesis',
     'Plants eat sunlight. Water and air become sugar. The green engine that powers all life.',
     'You discover that plants drink light.',
     'Plant', 'landmark', 5, 'early_modern', '1779', 'Jan Ingenhousz', 20),
    ('Cell Theory',
     'All living things are made of cells. The building blocks of life revealed under glass.',
     'You see the bricks that build the living world.',
     'Plant', 'discovery', 5, 'early_modern', '1665', 'Robert Hooke', 21),
    # Tier 6 - Industrial
    ('Mendelian Genetics',
     'Tall peas, short peas. Dominant, recessive. Inheritance follows rules.',
     'The garden reveals the mathematics of life.',
     'Plant', 'landmark', 6, 'industrial', '1866', 'Gregor Mendel', 25),
    ('Natural Selection',
     'Those better suited survive. Life is a slow engine of adaptation.',
     'The plants that survive are the plants that change.',
     'Plant', 'landmark', 6, 'industrial', '1859', 'Charles Darwin', 26),

    # === CROSS-TYPE GATES ===
    ('Freezing Point',
     'Water becomes solid at a precise, measurable temperature. The phase transition is a law.',
     'You discover the moment water stops flowing.',
     None, 'gate', 5, 'early_modern', '1714', 'Daniel Fahrenheit', 101),
    ('Static Electricity',
     'Rub amber and it attracts straw. A force with no name. Lightning in miniature.',
     'You rub two things together and the universe whispers a secret.',
     None, 'gate', 6, 'industrial', '1752', 'Benjamin Franklin', 102),
]

# (node_name, type_name, amount)
INCREMENTAL_COSTS = [
    # === EARTH ===
    ('Stone Knapping', 'Earth', 0),
    ('Grinding & Polishing', 'Earth', 10),
    ('Shelter Construction', 'Earth', 25),
    ('Clay Working', 'Earth', 50),
    ('Ochre Mining', 'Earth', 40),
    ('Fired Pottery', 'Earth', 100),
    ('Quarrying', 'Earth', 300),
    ('Masonry', 'Earth', 500),
    ('Mining', 'Earth', 600),
    ('Fortification', 'Earth', 2000),
    ('Mineral Classification', 'Earth', 1500),
    ('Stratigraphy', 'Earth', 5000),
    ('Falling Bodies', 'Earth', 10000),
    ('Universal Gravitation', 'Earth', 50000),

    # === WATER ===
    ('Finding Water', 'Water', 0),
    ('Water Storage', 'Water', 10),
    ('Well-Digging', 'Water', 50),
    ('Fermentation', 'Water', 60),
    ('Basic Irrigation', 'Water', 150),
    ('Basic Irrigation', 'Earth', 75),
    ('Canal Systems', 'Water', 400),
    ('Sailing', 'Water', 500),
    ('Water Wheel', 'Water', 800),
    ('Water Wheel', 'Earth', 300),
    ('Aqueduct', 'Water', 2000),
    ('Aqueduct', 'Earth', 1000),
    ('Distillation', 'Water', 3000),
    ('Distillation', 'Fire', 1500),
    ('Hydrodynamics', 'Water', 8000),
    ('Oceanography', 'Water', 15000),

    # === AIR ===
    ('Breath', 'Air', 0),
    ('Wind Awareness', 'Air', 10),
    ('Wind Instruments', 'Air', 50),
    ('Sails', 'Air', 200),
    ('Sails', 'Water', 100),
    ('Bellows', 'Air', 400),
    ('Windmill', 'Air', 800),
    ('Windmill', 'Earth', 300),
    ('Weather Observation', 'Air', 2000),
    ('Vacuum Discovery', 'Air', 4000),
    ('Barometer', 'Air', 8000),
    ('Barometer', 'Water', 2000),
    ('Gas Laws', 'Air', 12000),
    ('Hot Air Balloon', 'Air', 20000),
    ('Hot Air Balloon', 'Fire', 8000),

    # === FIRE ===
    ('Spark', 'Fire', 0),
    ('Campfire', 'Fire', 15),
    ('Cooking', 'Fire', 50),
    ('Fire-Starting', 'Fire', 80),
    ('Charcoal', 'Fire', 250),
    ('Kiln', 'Fire', 500),
    ('Kiln', 'Earth', 200),
    ('Copper Smelting', 'Fire', 800),
    ('Copper Smelting', 'Earth', 400),
    ('Glassmaking', 'Fire', 2000),
    ('Glassmaking', 'Earth', 800),
    ('Gunpowder', 'Fire', 3000),
    ('Alchemy', 'Fire', 3500),
    ('Alchemy', 'Water', 1500),
    ('Thermometer', 'Fire', 8000),
    ('Thermometer', 'Air', 3000),
    ('Phlogiston & Combustion', 'Fire', 10000),
    ('Steam Engine', 'Fire', 15000),
    ('Steam Engine', 'Water', 8000),
    ('Steam Engine', 'Metal', 5000),

    # === METAL ===
    ('Copper Working', 'Metal', 0),
    ('Tin Discovery', 'Metal', 300),
    ('Tin Discovery', 'Earth', 200),
    ('Bronze Alloy', 'Metal', 800),
    ('Bronze Alloy', 'Fire', 300),
    ('Iron Smelting', 'Metal', 2000),
    ('Iron Smelting', 'Fire', 1000),
    ('Blacksmithing', 'Metal', 3000),
    ('Blacksmithing', 'Fire', 1000),
    ('Damascus Steel', 'Metal', 5000),
    ('Blast Furnace', 'Metal', 10000),
    ('Blast Furnace', 'Fire', 5000),
    ('Blast Furnace', 'Air', 3000),
    ('Cast Iron', 'Metal', 15000),
    ('Bessemer Process', 'Metal', 40000),
    ('Bessemer Process', 'Fire', 15000),
    ('Bessemer Process', 'Air', 10000),
    ('Periodic Table of Metals', 'Metal', 50000),

    # === PLANT ===
    ('Agriculture', 'Earth', 100),
    ('Agriculture', 'Water', 100),
    ('Seed Saving', 'Plant', 0),
    ('Crop Rotation', 'Plant', 400),
    ('Crop Rotation', 'Earth', 150),
    ('Herbalism', 'Plant', 600),
    ('Herbalism', 'Water', 200),
    ('Grafting', 'Plant', 2000),
    ('Botanical Classification', 'Plant', 3000),
    ('Crop Breeding', 'Plant', 4000),
    ('Crop Breeding', 'Earth', 1500),
    ('Photosynthesis', 'Plant', 10000),
    ('Photosynthesis', 'Fire', 3000),
    ('Cell Theory', 'Plant', 12000),
    ('Mendelian Genetics', 'Plant', 40000),
    ('Natural Selection', 'Plant', 50000),
    ('Natural Selection', 'Earth', 15000),

    # === GATES ===
    ('Freezing Point', 'Air', 5000),
    ('Freezing Point', 'Water', 5000),
    ('Freezing Point', 'Fire', 2500),
    ('Static Electricity', 'Fire', 30000),
    ('Static Electricity', 'Air', 30000),
    ('Static Electricity', 'Metal', 10000),
]

# (node_name, required_node_name, prerequisite_group)
INCREMENTAL_PREREQUISITES = [
    # === EARTH ===
    ('Grinding & Polishing', 'Stone Knapping', 1),
    ('Shelter Construction', 'Stone Knapping', 1),
    ('Clay Working', 'Grinding & Polishing', 1),
    ('Ochre Mining', 'Stone Knapping', 1),
    ('Fired Pottery', 'Clay Working', 1),
    ('Quarrying', 'Ochre Mining', 1),
    ('Masonry', 'Quarrying', 1),
    ('Mining', 'Quarrying', 1),
    ('Fortification', 'Masonry', 1),
    ('Mineral Classification', 'Mining', 1),
    ('Stratigraphy', 'Mineral Classification', 1),
    ('Falling Bodies', 'Stratigraphy', 1),
    ('Universal Gravitation', 'Falling Bodies', 1),

    # === WATER ===
    ('Water Storage', 'Finding Water', 1),
    ('Water Storage', 'Clay Working', 1),
    ('Well-Digging', 'Water Storage', 1),
    ('Fermentation', 'Water Storage', 1),
    ('Basic Irrigation', 'Well-Digging', 1),
    ('Canal Systems', 'Basic Irrigation', 1),
    ('Sailing', 'Canal Systems', 1),
    ('Water Wheel', 'Canal Systems', 1),
    ('Aqueduct', 'Canal Systems', 1),
    ('Aqueduct', 'Masonry', 1),
    ('Distillation', 'Fermentation', 1),
    ('Distillation', 'Kiln', 1),
    ('Hydrodynamics', 'Distillation', 1),
    ('Hydrodynamics', 'Water Wheel', 1),
    ('Oceanography', 'Hydrodynamics', 1),
    ('Oceanography', 'Sailing', 1),

    # === AIR ===
    ('Wind Awareness', 'Breath', 1),
    ('Wind Instruments', 'Wind Awareness', 1),
    ('Sails', 'Wind Awareness', 1),
    ('Sails', 'Sailing', 1),
    ('Bellows', 'Wind Awareness', 1),
    ('Windmill', 'Bellows', 1),
    ('Weather Observation', 'Windmill', 1),
    ('Vacuum Discovery', 'Weather Observation', 1),
    ('Barometer', 'Vacuum Discovery', 1),
    ('Gas Laws', 'Barometer', 1),
    ('Hot Air Balloon', 'Gas Laws', 1),

    # === FIRE ===
    ('Campfire', 'Spark', 1),
    ('Cooking', 'Campfire', 1),
    ('Fire-Starting', 'Campfire', 1),
    ('Charcoal', 'Fire-Starting', 1),
    ('Kiln', 'Charcoal', 1),
    ('Kiln', 'Clay Working', 1),
    ('Copper Smelting', 'Kiln', 1),
    ('Copper Smelting', 'Mining', 1),
    ('Glassmaking', 'Kiln', 1),
    ('Glassmaking', 'Ochre Mining', 1),
    ('Gunpowder', 'Charcoal', 1),
    ('Gunpowder', 'Mining', 1),
    ('Alchemy', 'Glassmaking', 1),
    ('Alchemy', 'Distillation', 1),
    ('Thermometer', 'Glassmaking', 1),
    ('Thermometer', 'Alchemy', 1),
    ('Phlogiston & Combustion', 'Alchemy', 1),
    ('Steam Engine', 'Phlogiston & Combustion', 1),
    ('Steam Engine', 'Blast Furnace', 1),

    # === METAL ===
    ('Tin Discovery', 'Copper Working', 1),
    ('Bronze Alloy', 'Tin Discovery', 1),
    ('Bronze Alloy', 'Copper Working', 1),
    ('Iron Smelting', 'Bronze Alloy', 1),
    ('Iron Smelting', 'Charcoal', 1),
    ('Blacksmithing', 'Iron Smelting', 1),
    ('Damascus Steel', 'Blacksmithing', 1),
    ('Blast Furnace', 'Iron Smelting', 1),
    ('Blast Furnace', 'Bellows', 1),
    ('Cast Iron', 'Blast Furnace', 1),
    ('Bessemer Process', 'Cast Iron', 1),
    ('Bessemer Process', 'Steam Engine', 1),
    ('Periodic Table of Metals', 'Bessemer Process', 1),
    ('Periodic Table of Metals', 'Mineral Classification', 1),

    # === PLANT ===
    ('Agriculture', 'Clay Working', 1),
    ('Agriculture', 'Basic Irrigation', 1),
    ('Seed Saving', 'Agriculture', 1),
    ('Crop Rotation', 'Seed Saving', 1),
    ('Herbalism', 'Seed Saving', 1),
    ('Grafting', 'Crop Rotation', 1),
    ('Grafting', 'Herbalism', 1),
    ('Botanical Classification', 'Herbalism', 1),
    ('Crop Breeding', 'Crop Rotation', 1),
    ('Crop Breeding', 'Grafting', 1),
    ('Photosynthesis', 'Botanical Classification', 1),
    ('Cell Theory', 'Photosynthesis', 1),
    ('Mendelian Genetics', 'Crop Breeding', 1),
    ('Mendelian Genetics', 'Cell Theory', 1),
    ('Natural Selection', 'Cell Theory', 1),
    ('Natural Selection', 'Stratigraphy', 1),

    # === GATES ===
    ('Freezing Point', 'Thermometer', 1),
    ('Freezing Point', 'Barometer', 1),
    ('Freezing Point', 'Distillation', 1),
    ('Static Electricity', 'Gas Laws', 1),
    ('Static Electricity', 'Phlogiston & Combustion', 1),
    ('Static Electricity', 'Blast Furnace', 1),
]

# (node_name, effect_type, target_type_name, target_node_name, value, description)
INCREMENTAL_EFFECTS = [
    # === EARTH ===
    ('Stone Knapping',       'generate', 'Earth', None, 1.0,  '+1 Earth per click'),
    ('Grinding & Polishing', 'generate', 'Earth', None, 0.1,  '+0.1 Earth/sec'),
    ('Shelter Construction', 'generate', 'Earth', None, 0.3,  '+0.3 Earth/sec'),
    ('Clay Working',         'reveal_node', None, 'Fired Pottery', None, 'Reveals Fired Pottery'),
    ('Ochre Mining',         'generate', 'Earth', None, 0.5,  '+0.5 Earth/sec'),
    ('Fired Pottery',        'unlock_type', 'Water', None, None, 'Water type unlocked'),
    ('Fired Pottery',        'generate', 'Earth', None, 1.0,  '+1 Earth/sec'),
    ('Quarrying',            'generate', 'Earth', None, 2.0,  '+2 Earth/sec'),
    ('Masonry',              'multiply', 'Earth', None, 1.5,  'Earth generation x1.5'),
    ('Mining',               'generate', 'Earth', None, 1.5,  '+1.5 Earth/sec'),
    ('Mining',               'reveal_node', None, 'Mineral Classification', None, 'Reveals Mineral Classification'),
    ('Fortification',        'generate', 'Earth', None, 5.0,  '+5 Earth/sec'),
    ('Mineral Classification','generate', 'Earth', None, 2.0,  '+2 Earth/sec'),
    ('Mineral Classification','reveal_node', None, 'Stratigraphy', None, 'Reveals Stratigraphy'),
    ('Stratigraphy',         'multiply', 'Earth', None, 2.0,  'Earth generation x2'),
    ('Falling Bodies',       'multiply', 'Earth', None, 3.0,  'Earth generation x3'),
    ('Universal Gravitation','multiply', 'Earth', None, 5.0,  'Earth generation x5'),

    # === WATER ===
    ('Finding Water',  'generate', 'Water', None, 1.0, '+1 Water per click'),
    ('Water Storage',  'generate', 'Water', None, 0.1, '+0.1 Water/sec'),
    ('Well-Digging',   'generate', 'Water', None, 0.3, '+0.3 Water/sec'),
    ('Fermentation',   'generate', 'Water', None, 0.2, '+0.2 Water/sec'),
    ('Basic Irrigation','generate','Water', None, 1.0, '+1 Water/sec'),
    ('Canal Systems',  'generate', 'Water', None, 2.0, '+2 Water/sec'),
    ('Sailing',        'unlock_type', 'Air', None, None, 'Air type unlocked'),
    ('Sailing',        'generate', 'Water', None, 3.0, '+3 Water/sec'),
    ('Water Wheel',    'generate', 'Water', None, 4.0, '+4 Water/sec'),
    ('Water Wheel',    'boost', 'Earth', None, 1.0, '+1 Earth/sec from milling'),
    ('Aqueduct',       'generate', 'Water', None, 5.0, '+5 Water/sec'),
    ('Distillation',   'generate', 'Water', None, 4.0, '+4 Water/sec'),
    ('Distillation',   'boost', 'Fire', None, 1.0, '+1 Fire/sec from heat mastery'),
    ('Hydrodynamics',  'multiply', 'Water', None, 3.0, 'Water generation x3'),
    ('Oceanography',   'multiply', 'Water', None, 5.0, 'Water generation x5'),

    # === AIR ===
    ('Breath',              'generate', 'Air', None, 1.0, '+1 Air per click'),
    ('Wind Awareness',      'generate', 'Air', None, 0.1, '+0.1 Air/sec'),
    ('Wind Instruments',    'generate', 'Air', None, 0.3, '+0.3 Air/sec'),
    ('Sails',               'generate', 'Air', None, 2.0, '+2 Air/sec'),
    ('Bellows',             'unlock_type', 'Fire', None, None, 'Fire type unlocked'),
    ('Bellows',             'boost', 'Fire', None, 2.0, '+2 Fire/sec from forced air'),
    ('Bellows',             'generate', 'Air', None, 3.0, '+3 Air/sec'),
    ('Windmill',            'generate', 'Air', None, 4.0, '+4 Air/sec'),
    ('Windmill',            'boost', 'Earth', None, 2.0, '+2 Earth/sec from grinding'),
    ('Weather Observation', 'generate', 'Air', None, 2.0, '+2 Air/sec'),
    ('Vacuum Discovery',    'multiply', 'Air', None, 2.0, 'Air generation x2'),
    ('Barometer',           'generate', 'Air', None, 5.0, '+5 Air/sec'),
    ('Gas Laws',            'multiply', 'Air', None, 3.0, 'Air generation x3'),
    ('Hot Air Balloon',     'multiply', 'Air', None, 5.0, 'Air generation x5'),
    ('Hot Air Balloon',     'boost', 'Fire', None, 3.0, '+3 Fire/sec from heat lift'),

    # === FIRE ===
    ('Spark',                    'generate', 'Fire', None, 1.0,  '+1 Fire per click'),
    ('Campfire',                 'generate', 'Fire', None, 0.2,  '+0.2 Fire/sec'),
    ('Cooking',                  'multiply', 'Fire', None, 1.5,  'Fire generation x1.5'),
    ('Fire-Starting',            'generate', 'Fire', None, 0.5,  '+0.5 Fire/sec'),
    ('Charcoal',                 'multiply', 'Fire', None, 2.0,  'Fire generation x2'),
    ('Kiln',                     'generate', 'Fire', None, 3.0,  '+3 Fire/sec'),
    ('Copper Smelting',          'unlock_type', 'Metal', None, None, 'Metal type unlocked'),
    ('Copper Smelting',          'generate', 'Fire', None, 2.0,  '+2 Fire/sec'),
    ('Copper Smelting',          'generate', 'Metal', None, 0.1, '+0.1 Metal/sec trickle'),
    ('Glassmaking',              'generate', 'Fire', None, 3.0,  '+3 Fire/sec'),
    ('Glassmaking',              'boost', 'Earth', None, 2.0,  '+2 Earth/sec from glass tools'),
    ('Gunpowder',                'generate', 'Fire', None, 5.0,  '+5 Fire/sec'),
    ('Gunpowder',                'boost', 'Earth', None, 3.0,  '+3 Earth/sec (mining explosives)'),
    ('Alchemy',                  'generate', 'Fire', None, 3.0,  '+3 Fire/sec'),
    ('Alchemy',                  'boost', 'Water', None, 2.0,  '+2 Water/sec (chemical knowledge)'),
    ('Thermometer',              'generate', 'Fire', None, 5.0,  '+5 Fire/sec'),
    ('Phlogiston & Combustion',  'multiply', 'Fire', None, 3.0,  'Fire generation x3'),
    ('Steam Engine',             'generate', 'Fire', None, 10.0, '+10 Fire/sec'),
    ('Steam Engine',             'boost', 'Water', None, 5.0,  '+5 Water/sec (steam cycle)'),
    ('Steam Engine',             'boost', 'Metal', None, 5.0,  '+5 Metal/sec (industrial demand)'),

    # === METAL ===
    ('Copper Working',           'generate', 'Metal', None, 1.0,  '+1 Metal per click'),
    ('Tin Discovery',            'generate', 'Metal', None, 0.5,  '+0.5 Metal/sec'),
    ('Tin Discovery',            'reveal_node', None, 'Bronze Alloy', None, 'Reveals Bronze Alloy'),
    ('Bronze Alloy',             'generate', 'Metal', None, 2.0,  '+2 Metal/sec'),
    ('Bronze Alloy',             'multiply', 'Metal', None, 2.0,  'Metal generation x2'),
    ('Iron Smelting',            'generate', 'Metal', None, 5.0,  '+5 Metal/sec'),
    ('Blacksmithing',            'generate', 'Metal', None, 8.0,  '+8 Metal/sec'),
    ('Blacksmithing',            'boost', 'Earth', None, 3.0,  '+3 Earth/sec (tools)'),
    ('Damascus Steel',           'multiply', 'Metal', None, 3.0,  'Metal generation x3'),
    ('Blast Furnace',            'generate', 'Metal', None, 15.0, '+15 Metal/sec'),
    ('Blast Furnace',            'boost', 'Fire', None, 5.0,  '+5 Fire/sec (industrial heat)'),
    ('Cast Iron',                'generate', 'Metal', None, 10.0, '+10 Metal/sec'),
    ('Cast Iron',                'boost', 'Earth', None, 5.0,  '+5 Earth/sec (construction)'),
    ('Bessemer Process',         'multiply', 'Metal', None, 5.0,  'Metal generation x5'),
    ('Bessemer Process',         'boost', 'Fire', None, 10.0, '+10 Fire/sec (industrial furnaces)'),
    ('Periodic Table of Metals', 'multiply', 'Metal', None, 10.0, 'Metal generation x10'),

    # === PLANT ===
    ('Agriculture',              'unlock_type', 'Plant', None, None, 'Plant type unlocked'),
    ('Agriculture',              'generate', 'Earth', None, 0.5, '+0.5 Earth/sec'),
    ('Agriculture',              'generate', 'Water', None, 0.5, '+0.5 Water/sec'),
    ('Seed Saving',              'generate', 'Plant', None, 1.0,  '+1 Plant per click'),
    ('Crop Rotation',            'generate', 'Plant', None, 2.0,  '+2 Plant/sec'),
    ('Crop Rotation',            'multiply', 'Plant', None, 1.5,  'Plant generation x1.5'),
    ('Herbalism',                'generate', 'Plant', None, 1.5,  '+1.5 Plant/sec'),
    ('Herbalism',                'boost', 'Water', None, 1.0,  '+1 Water/sec (botanical solutions)'),
    ('Grafting',                 'generate', 'Plant', None, 3.0,  '+3 Plant/sec'),
    ('Botanical Classification', 'generate', 'Plant', None, 4.0,  '+4 Plant/sec'),
    ('Botanical Classification', 'multiply', 'Plant', None, 2.0,  'Plant generation x2'),
    ('Crop Breeding',            'multiply', 'Plant', None, 3.0,  'Plant generation x3'),
    ('Crop Breeding',            'boost', 'Earth', None, 2.0,  '+2 Earth/sec (improved agriculture)'),
    ('Photosynthesis',           'multiply', 'Plant', None, 5.0,  'Plant generation x5'),
    ('Photosynthesis',           'boost', 'Air', None, 3.0,  '+3 Air/sec (oxygen production)'),
    ('Cell Theory',              'generate', 'Plant', None, 8.0,  '+8 Plant/sec'),
    ('Mendelian Genetics',       'multiply', 'Plant', None, 10.0, 'Plant generation x10'),
    ('Natural Selection',        'multiply', 'Plant', None, 15.0, 'Plant generation x15'),
    ('Natural Selection',        'boost', 'Earth', None, 5.0,  '+5 Earth/sec (geological understanding)'),

    # === GATES ===
    ('Freezing Point',           'unlock_type', 'Ice', None, None, 'Ice type unlocked'),
    ('Freezing Point',           'boost', 'Air', None, 3.0, '+3 Air/sec'),
    ('Freezing Point',           'boost', 'Water', None, 3.0, '+3 Water/sec'),
    ('Static Electricity',       'unlock_type', 'Electric', None, None, 'Electric type unlocked'),
    ('Static Electricity',       'boost', 'Fire', None, 5.0, '+5 Fire/sec'),
    ('Static Electricity',       'boost', 'Air', None, 5.0, '+5 Air/sec'),
]


# =============================================
# Prototype Roguelike: per-run skill tree & meta-progression seed data
# =============================================

# (name, description, layer, category, target_type_name, target_wizard_school_scientist)
# target_wizard_school_scientist is used to look up wizard_school_design for character unlocks
ROGUELIKE_META_UNLOCKS = [
    # Layer 2: Cross-type branch unlocks (earned by beating a tower)
    ('Fire Branch',    'Beating Fire Tower reveals Fire branches in all school trees',     2, 'type_branch', 'Fire',     None),
    ('Earth Branch',   'Beating Earth Tower reveals Earth branches in all school trees',   2, 'type_branch', 'Earth',    None),
    ('Water Branch',   'Beating Water Tower reveals Water branches in all school trees',   2, 'type_branch', 'Water',    None),
    ('Air Branch',     'Beating Air Tower reveals Air branches in all school trees',       2, 'type_branch', 'Air',      None),

    # Layer 3: Secondary type discoveries (earned by using both primaries in a winning run)
    ('Metal Discovery',    'Discovered Metal by combining Fire and Earth',      3, 'secondary', 'Metal',    None),
    ('Plant Discovery',    'Discovered Plant by combining Earth and Water',     3, 'secondary', 'Plant',    None),
    ('Ice Discovery',      'Discovered Ice by combining Water and Air',         3, 'secondary', 'Ice',      None),
    ('Electric Discovery', 'Discovered Electric by combining Fire and Air',     3, 'secondary', 'Electric', None),

    # Layer 2: Character unlocks (earned by defeating head wizards)
    ('Lavoisier Unlock', 'Defeated Lavoisier, Fire Head Wizard — now playable', 2, 'character', 'Fire',  'Lavoisier'),
    ('Newton Unlock',    'Defeated Newton, Earth Head Wizard — now playable',   2, 'character', 'Earth', 'Newton'),
    ('Archimedes Unlock', 'Defeated Archimedes, Water Head Wizard — now playable', 2, 'character', 'Water', 'Archimedes'),
    ('Boyle Unlock',     'Defeated Boyle, Air Head Wizard — now playable',      2, 'character', 'Air',   'Boyle'),
]

# (meta_unlock_name, condition_type, condition_type_name, condition_value, condition_type_b_name, description)
ROGUELIKE_META_CONDITIONS = [
    # Tower victories unlock cross-type branches
    ('Fire Branch',    'tower_victory', 'Fire',  None, None, 'Beat Fire Tower with any character'),
    ('Earth Branch',   'tower_victory', 'Earth', None, None, 'Beat Earth Tower with any character'),
    ('Water Branch',   'tower_victory', 'Water', None, None, 'Beat Water Tower with any character'),
    ('Air Branch',     'tower_victory', 'Air',   None, None, 'Beat Air Tower with any character'),

    # Cross-type usage triggers secondary discoveries
    ('Metal Discovery',    'cross_type_usage', 'Fire',  5, 'Earth', 'Cast 5+ Fire+Earth spells in a winning run'),
    ('Plant Discovery',    'cross_type_usage', 'Earth', 5, 'Water', 'Cast 5+ Earth+Water spells in a winning run'),
    ('Ice Discovery',      'cross_type_usage', 'Water', 5, 'Air',   'Cast 5+ Water+Air spells in a winning run'),
    ('Electric Discovery', 'cross_type_usage', 'Fire',  5, 'Air',   'Cast 5+ Fire+Air spells in a winning run'),

    # Defeating head wizards unlocks characters
    ('Lavoisier Unlock',  'tower_victory', 'Fire',  None, None, 'Defeat Lavoisier in Fire Tower'),
    ('Newton Unlock',     'tower_victory', 'Earth', None, None, 'Defeat Newton in Earth Tower'),
    ('Archimedes Unlock', 'tower_victory', 'Water', None, None, 'Defeat Archimedes in Water Tower'),
    ('Boyle Unlock',      'tower_victory', 'Air',   None, None, 'Defeat Boyle in Air Tower'),
]

# (level, name, description, modifier_type, modifier_value)
ROGUELIKE_MASTERY_LEVELS = [
    (1,  'Novice Trial',       'Counter-type enemies deal +10% damage',             'enemy_damage_bonus',      0.10),
    (2,  'Scarce Resources',   'Start with 1 less energy of your school type',      'starting_energy_penalty', 1.0),
    (3,  'Counter Elites',     'Elites always include a counter-type enemy',        'elite_restriction',       1.0),
    (4,  'Slow Discovery',     'Progression tree nodes cost 25% more XP',           'xp_cost_multiplier',      1.25),
    (5,  'Final Form',         'Boss gains a third phase with composition attacks',  'boss_phase',              3.0),
    (6,  'Outnumbered',        'Enemy groups always have 1 extra enemy',            'enemy_count_bonus',       1.0),
    (7,  'Price Gouging',      'Shops cost 20% more',                               'shop_cost_multiplier',    1.20),
    (8,  'No Rest',            'Fewer rest nodes on the map',                        'map_restriction',         1.0),
    (9,  'Enhanced Foes',      'Enemies have enhanced movesets',                     'enemy_moveset_enhance',   1.0),
    (10, 'Twin Summit',        'Fight two bosses at the tower summit',              'double_boss',             2.0),
]

# (name, description, flavor_text, type_name, category, tier, branch, visibility, meta_unlock_name, sort_order)
ROGUELIKE_NODES = [
    # === FIRE TREE (always visible — mono-type path) ===
    ('Fire Basics',
     'Fundamental fire manipulation. Starter node for Fire school.',
     'The first flame answers your call.',
     'Fire', 'starter', 1, 'core', 'always', None, 1),

    ('Fire Intensity',
     '+1 Fire damage on all Fire spells.',
     'Your flames burn hotter.',
     'Fire', 'passive', 2, 'core', 'always', None, 2),

    ('Fire Efficiency',
     '+1 max Fire energy per turn.',
     'You channel fire with less effort.',
     'Fire', 'energy', 2, 'core', 'always', None, 3),

    ('Combustion Mastery',
     'Fire spells deal +2 damage. Deep Fire investment.',
     'You understand the nature of burning.',
     'Fire', 'passive', 3, 'core', 'always', None, 4),

    ('Fire Spell Expansion',
     'Stronger Fire spells appear in reward pool.',
     'New incantations reveal themselves.',
     'Fire', 'spell_pool', 3, 'core', 'always', None, 5),

    # === FIRE cross-type branches (meta-visible) ===
    ('Fire→Earth Attunement',
     '+1 max Earth energy per turn. Opens Earth spells.',
     'Stone responds to your touch.',
     'Earth', 'energy', 2, 'fire_earth', 'meta', 'Earth Branch', 10),

    ('Fire+Earth Insight',
     'Fire+Earth cross-type spells appear in rewards.',
     'Fire meets stone — something new emerges.',
     'Fire', 'spell_pool', 3, 'fire_earth', 'meta', 'Earth Branch', 11),

    ('Metal Gate',
     'Discover Metal type. Requires Fire depth 3 + Earth depth 3.',
     'In the crucible, a new substance forms.',
     'Metal', 'gate', 4, 'fire_earth', 'meta', 'Metal Discovery', 12),

    ('Fire→Air Attunement',
     '+1 max Air energy per turn. Opens Air spells.',
     'The wind fans your flames.',
     'Air', 'energy', 2, 'fire_air', 'meta', 'Air Branch', 15),

    ('Fire+Air Insight',
     'Fire+Air cross-type spells appear in rewards.',
     'Fire dances with wind — lightning crackles.',
     'Fire', 'spell_pool', 3, 'fire_air', 'meta', 'Air Branch', 16),

    ('Electric Gate',
     'Discover Electric type. Requires Fire depth 3 + Air depth 3.',
     'The spark leaps between worlds.',
     'Electric', 'gate', 4, 'fire_air', 'meta', 'Electric Discovery', 17),

    # === EARTH TREE (always visible — mono-type path) ===
    ('Earth Basics',
     'Fundamental earth manipulation. Starter node for Earth school.',
     'The ground steadies beneath you.',
     'Earth', 'starter', 1, 'core', 'always', None, 20),

    ('Earth Resilience',
     '+1 Block on all Earth spells.',
     'Stone shields form faster.',
     'Earth', 'passive', 2, 'core', 'always', None, 21),

    ('Earth Fortification',
     '+1 max Earth energy per turn.',
     'The earth yields its strength willingly.',
     'Earth', 'energy', 2, 'core', 'always', None, 22),

    ('Geological Mastery',
     'Earth spells grant +2 Block. Deep Earth investment.',
     'You command the bedrock itself.',
     'Earth', 'passive', 3, 'core', 'always', None, 23),

    ('Earth Spell Expansion',
     'Stronger Earth spells appear in reward pool.',
     'Ancient formations whisper their secrets.',
     'Earth', 'spell_pool', 3, 'core', 'always', None, 24),

    # === EARTH cross-type branches (meta-visible) ===
    ('Earth→Fire Attunement',
     '+1 max Fire energy per turn. Opens Fire spells.',
     'Magma stirs beneath your feet.',
     'Fire', 'energy', 2, 'earth_fire', 'meta', 'Fire Branch', 30),

    ('Earth+Fire Insight',
     'Earth+Fire cross-type spells appear in rewards.',
     'The forge within the mountain awakens.',
     'Earth', 'spell_pool', 3, 'earth_fire', 'meta', 'Fire Branch', 31),

    ('Earth→Water Attunement',
     '+1 max Water energy per turn. Opens Water spells.',
     'Underground rivers surface.',
     'Water', 'energy', 2, 'earth_water', 'meta', 'Water Branch', 35),

    ('Earth+Water Insight',
     'Earth+Water cross-type spells appear in rewards.',
     'Mud and clay take living form.',
     'Earth', 'spell_pool', 3, 'earth_water', 'meta', 'Water Branch', 36),

    ('Plant Gate',
     'Discover Plant type. Requires Earth depth 3 + Water depth 3.',
     'A seed cracks open. Life begins.',
     'Plant', 'gate', 4, 'earth_water', 'meta', 'Plant Discovery', 37),

    # === WATER TREE (always visible — mono-type path) ===
    ('Water Basics',
     'Fundamental water manipulation. Starter node for Water school.',
     'The current flows through you.',
     'Water', 'starter', 1, 'core', 'always', None, 40),

    ('Water Flow',
     'Draw 1 extra card on the first turn of each combat.',
     'Your mind moves like water.',
     'Water', 'passive', 2, 'core', 'always', None, 41),

    ('Water Depth',
     '+1 max Water energy per turn.',
     'You reach into deeper currents.',
     'Water', 'energy', 2, 'core', 'always', None, 42),

    ('Tidal Mastery',
     'Water spells deal +2 damage. Deep Water investment.',
     'The tide obeys your will.',
     'Water', 'passive', 3, 'core', 'always', None, 43),

    ('Water Spell Expansion',
     'Stronger Water spells appear in reward pool.',
     'Currents carry new knowledge.',
     'Water', 'spell_pool', 3, 'core', 'always', None, 44),

    # === WATER cross-type branches (meta-visible) ===
    ('Water→Earth Attunement',
     '+1 max Earth energy per turn. Opens Earth spells.',
     'The riverbed reveals its treasures.',
     'Earth', 'energy', 2, 'water_earth', 'meta', 'Earth Branch', 50),

    ('Water+Earth Insight',
     'Water+Earth cross-type spells appear in rewards.',
     'Erosion and growth intertwine.',
     'Water', 'spell_pool', 3, 'water_earth', 'meta', 'Earth Branch', 51),

    ('Water→Air Attunement',
     '+1 max Air energy per turn. Opens Air spells.',
     'Mist rises from the surface.',
     'Air', 'energy', 2, 'water_air', 'meta', 'Air Branch', 55),

    ('Water+Air Insight',
     'Water+Air cross-type spells appear in rewards.',
     'Frost forms where water meets wind.',
     'Water', 'spell_pool', 3, 'water_air', 'meta', 'Air Branch', 56),

    ('Ice Gate',
     'Discover Ice type. Requires Water depth 3 + Air depth 3.',
     'Temperature plummets. Crystals form.',
     'Ice', 'gate', 4, 'water_air', 'meta', 'Ice Discovery', 57),

    # === AIR TREE (always visible — mono-type path) ===
    ('Air Basics',
     'Fundamental air manipulation. Starter node for Air school.',
     'The wind answers before you speak.',
     'Air', 'starter', 1, 'core', 'always', None, 60),

    ('Air Control',
     'Air spells apply 1 Weakness to targets.',
     'You bend the air itself.',
     'Air', 'passive', 2, 'core', 'always', None, 61),

    ('Air Expansion',
     '+1 max Air energy per turn.',
     'Pressure builds at your command.',
     'Air', 'energy', 2, 'core', 'always', None, 62),

    ('Atmospheric Mastery',
     'Air spells deal +2 damage. Deep Air investment.',
     'Storms gather at your whisper.',
     'Air', 'passive', 3, 'core', 'always', None, 63),

    ('Air Spell Expansion',
     'Stronger Air spells appear in reward pool.',
     'Gales carry forgotten formulas.',
     'Air', 'spell_pool', 3, 'core', 'always', None, 64),

    # === AIR cross-type branches (meta-visible) ===
    ('Air→Fire Attunement',
     '+1 max Fire energy per turn. Opens Fire spells.',
     'Hot winds carry sparks.',
     'Fire', 'energy', 2, 'air_fire', 'meta', 'Fire Branch', 70),

    ('Air+Fire Insight',
     'Air+Fire cross-type spells appear in rewards.',
     'Lightning illuminates the sky.',
     'Air', 'spell_pool', 3, 'air_fire', 'meta', 'Fire Branch', 71),

    ('Air→Water Attunement',
     '+1 max Water energy per turn. Opens Water spells.',
     'Rain begins to fall.',
     'Water', 'energy', 2, 'air_water', 'meta', 'Water Branch', 75),

    ('Air+Water Insight',
     'Air+Water cross-type spells appear in rewards.',
     'Frost crystallizes in the breeze.',
     'Air', 'spell_pool', 3, 'air_water', 'meta', 'Water Branch', 76),
]

# (node_name, type_name, amount)
ROGUELIKE_NODE_COSTS = [
    # Fire core (starter is free)
    ('Fire Basics',          'Fire', 0),
    ('Fire Intensity',       'Fire', 15),
    ('Fire Efficiency',      'Fire', 20),
    ('Combustion Mastery',   'Fire', 40),
    ('Fire Spell Expansion', 'Fire', 35),

    # Fire cross-type branches
    ('Fire→Earth Attunement', 'Fire', 20),
    ('Fire+Earth Insight',    'Fire', 25),
    ('Fire+Earth Insight',    'Earth', 15),
    ('Metal Gate',            'Fire', 50),
    ('Metal Gate',            'Earth', 50),
    ('Fire→Air Attunement',   'Fire', 20),
    ('Fire+Air Insight',      'Fire', 25),
    ('Fire+Air Insight',      'Air', 15),
    ('Electric Gate',         'Fire', 50),
    ('Electric Gate',         'Air', 50),

    # Earth core
    ('Earth Basics',          'Earth', 0),
    ('Earth Resilience',      'Earth', 15),
    ('Earth Fortification',   'Earth', 20),
    ('Geological Mastery',    'Earth', 40),
    ('Earth Spell Expansion', 'Earth', 35),

    # Earth cross-type branches
    ('Earth→Fire Attunement', 'Earth', 20),
    ('Earth+Fire Insight',    'Earth', 25),
    ('Earth+Fire Insight',    'Fire', 15),
    ('Earth→Water Attunement', 'Earth', 20),
    ('Earth+Water Insight',    'Earth', 25),
    ('Earth+Water Insight',    'Water', 15),
    ('Plant Gate',             'Earth', 50),
    ('Plant Gate',             'Water', 50),

    # Water core
    ('Water Basics',          'Water', 0),
    ('Water Flow',            'Water', 15),
    ('Water Depth',           'Water', 20),
    ('Tidal Mastery',         'Water', 40),
    ('Water Spell Expansion', 'Water', 35),

    # Water cross-type branches
    ('Water→Earth Attunement', 'Water', 20),
    ('Water+Earth Insight',    'Water', 25),
    ('Water+Earth Insight',    'Earth', 15),
    ('Water→Air Attunement',   'Water', 20),
    ('Water+Air Insight',      'Water', 25),
    ('Water+Air Insight',      'Air', 15),
    ('Ice Gate',               'Water', 50),
    ('Ice Gate',               'Air', 50),

    # Air core
    ('Air Basics',          'Air', 0),
    ('Air Control',         'Air', 15),
    ('Air Expansion',       'Air', 20),
    ('Atmospheric Mastery', 'Air', 40),
    ('Air Spell Expansion', 'Air', 35),

    # Air cross-type branches
    ('Air→Fire Attunement', 'Air', 20),
    ('Air+Fire Insight',    'Air', 25),
    ('Air+Fire Insight',    'Fire', 15),
    ('Air→Water Attunement', 'Air', 20),
    ('Air+Water Insight',    'Air', 25),
    ('Air+Water Insight',    'Water', 15),
]

# (node_name, required_node_name, prerequisite_group)
ROGUELIKE_NODE_PREREQUISITES = [
    # Fire core chain
    ('Fire Intensity',       'Fire Basics', 1),
    ('Fire Efficiency',      'Fire Basics', 1),
    ('Combustion Mastery',   'Fire Intensity', 1),
    ('Fire Spell Expansion', 'Fire Intensity', 1),

    # Fire cross-type branches (branch off tier 1)
    ('Fire→Earth Attunement', 'Fire Basics', 1),
    ('Fire+Earth Insight',    'Fire→Earth Attunement', 1),
    ('Metal Gate',            'Fire+Earth Insight', 1),
    ('Fire→Air Attunement',   'Fire Basics', 1),
    ('Fire+Air Insight',      'Fire→Air Attunement', 1),
    ('Electric Gate',         'Fire+Air Insight', 1),

    # Earth core chain
    ('Earth Resilience',      'Earth Basics', 1),
    ('Earth Fortification',   'Earth Basics', 1),
    ('Geological Mastery',    'Earth Resilience', 1),
    ('Earth Spell Expansion', 'Earth Resilience', 1),

    # Earth cross-type branches
    ('Earth→Fire Attunement',  'Earth Basics', 1),
    ('Earth+Fire Insight',     'Earth→Fire Attunement', 1),
    ('Earth→Water Attunement', 'Earth Basics', 1),
    ('Earth+Water Insight',    'Earth→Water Attunement', 1),
    ('Plant Gate',             'Earth+Water Insight', 1),

    # Water core chain
    ('Water Flow',            'Water Basics', 1),
    ('Water Depth',           'Water Basics', 1),
    ('Tidal Mastery',         'Water Flow', 1),
    ('Water Spell Expansion', 'Water Flow', 1),

    # Water cross-type branches
    ('Water→Earth Attunement', 'Water Basics', 1),
    ('Water+Earth Insight',    'Water→Earth Attunement', 1),
    ('Water→Air Attunement',   'Water Basics', 1),
    ('Water+Air Insight',      'Water→Air Attunement', 1),
    ('Ice Gate',               'Water+Air Insight', 1),

    # Air core chain
    ('Air Control',         'Air Basics', 1),
    ('Air Expansion',       'Air Basics', 1),
    ('Atmospheric Mastery', 'Air Control', 1),
    ('Air Spell Expansion', 'Air Control', 1),

    # Air cross-type branches
    ('Air→Fire Attunement',  'Air Basics', 1),
    ('Air+Fire Insight',     'Air→Fire Attunement', 1),
    ('Air→Water Attunement', 'Air Basics', 1),
    ('Air+Water Insight',    'Air→Water Attunement', 1),
]

# (node_name, effect_type, target_type_name, value, description)
ROGUELIKE_NODE_EFFECTS = [
    # Fire core
    ('Fire Basics',          'energy_max',      'Fire', 0, 'Starter node — no additional effect'),
    ('Fire Intensity',       'passive_damage',  'Fire', 1.0, '+1 Fire spell damage'),
    ('Fire Efficiency',      'energy_max',      'Fire', 1.0, '+1 max Fire energy'),
    ('Combustion Mastery',   'passive_damage',  'Fire', 2.0, '+2 Fire spell damage'),
    ('Fire Spell Expansion', 'spell_pool',      'Fire', 1.0, 'Stronger Fire spells in rewards'),

    # Fire cross-type
    ('Fire→Earth Attunement', 'energy_max',      'Earth', 1.0, '+1 max Earth energy'),
    ('Fire+Earth Insight',    'spell_pool',      'Fire',  1.0, 'Fire+Earth spells in rewards'),
    ('Metal Gate',            'unlock_secondary', 'Metal', 1.0, 'Metal type discovered'),
    ('Fire→Air Attunement',   'energy_max',      'Air',   1.0, '+1 max Air energy'),
    ('Fire+Air Insight',      'spell_pool',      'Fire',  1.0, 'Fire+Air spells in rewards'),
    ('Electric Gate',         'unlock_secondary', 'Electric', 1.0, 'Electric type discovered'),

    # Earth core
    ('Earth Basics',          'energy_max',     'Earth', 0, 'Starter node — no additional effect'),
    ('Earth Resilience',      'passive_block',  'Earth', 1.0, '+1 Earth spell block'),
    ('Earth Fortification',   'energy_max',     'Earth', 1.0, '+1 max Earth energy'),
    ('Geological Mastery',    'passive_block',  'Earth', 2.0, '+2 Earth spell block'),
    ('Earth Spell Expansion', 'spell_pool',     'Earth', 1.0, 'Stronger Earth spells in rewards'),

    # Earth cross-type
    ('Earth→Fire Attunement',  'energy_max',      'Fire',  1.0, '+1 max Fire energy'),
    ('Earth+Fire Insight',     'spell_pool',      'Earth', 1.0, 'Earth+Fire spells in rewards'),
    ('Earth→Water Attunement', 'energy_max',      'Water', 1.0, '+1 max Water energy'),
    ('Earth+Water Insight',    'spell_pool',      'Earth', 1.0, 'Earth+Water spells in rewards'),
    ('Plant Gate',             'unlock_secondary', 'Plant', 1.0, 'Plant type discovered'),

    # Water core
    ('Water Basics',          'energy_max',     'Water', 0, 'Starter node — no additional effect'),
    ('Water Flow',            'passive_draw',   None,    1.0, '+1 card draw turn 1'),
    ('Water Depth',           'energy_max',     'Water', 1.0, '+1 max Water energy'),
    ('Tidal Mastery',         'passive_damage', 'Water', 2.0, '+2 Water spell damage'),
    ('Water Spell Expansion', 'spell_pool',     'Water', 1.0, 'Stronger Water spells in rewards'),

    # Water cross-type
    ('Water→Earth Attunement', 'energy_max',      'Earth', 1.0, '+1 max Earth energy'),
    ('Water+Earth Insight',    'spell_pool',      'Water', 1.0, 'Water+Earth spells in rewards'),
    ('Water→Air Attunement',   'energy_max',      'Air',   1.0, '+1 max Air energy'),
    ('Water+Air Insight',      'spell_pool',      'Water', 1.0, 'Water+Air spells in rewards'),
    ('Ice Gate',               'unlock_secondary', 'Ice',   1.0, 'Ice type discovered'),

    # Air core
    ('Air Basics',          'energy_max',     'Air', 0, 'Starter node — no additional effect'),
    ('Air Control',         'passive_damage', 'Air', 1.0, '+1 Air spell damage (via weakness)'),
    ('Air Expansion',       'energy_max',     'Air', 1.0, '+1 max Air energy'),
    ('Atmospheric Mastery', 'passive_damage', 'Air', 2.0, '+2 Air spell damage'),
    ('Air Spell Expansion', 'spell_pool',     'Air', 1.0, 'Stronger Air spells in rewards'),

    # Air cross-type
    ('Air→Fire Attunement',  'energy_max',   'Fire',  1.0, '+1 max Fire energy'),
    ('Air+Fire Insight',     'spell_pool',   'Air',   1.0, 'Air+Fire spells in rewards'),
    ('Air→Water Attunement', 'energy_max',   'Water', 1.0, '+1 max Water energy'),
    ('Air+Water Insight',    'spell_pool',   'Air',   1.0, 'Air+Water spells in rewards'),
]

# (gate_node_name, required_type_name, required_depth)
ROGUELIKE_GATE_REQUIREMENTS = [
    ('Metal Gate',    'Fire',  3),
    ('Metal Gate',    'Earth', 3),
    ('Plant Gate',    'Earth', 3),
    ('Plant Gate',    'Water', 3),
    ('Ice Gate',      'Water', 3),
    ('Ice Gate',      'Air',   3),
    ('Electric Gate', 'Fire',  3),
    ('Electric Gate', 'Air',   3),
]

# (name, description, meta_unlock_name, insight_cost, material_cost, max_purchases, sort_order)
ROGUELIKE_RESEARCH = [
    ('Unlock Fire Branch',    'Reveal Fire branches in all school trees',   'Fire Branch',    50,  0, 1, 1),
    ('Unlock Earth Branch',   'Reveal Earth branches in all school trees',  'Earth Branch',   50,  0, 1, 2),
    ('Unlock Water Branch',   'Reveal Water branches in all school trees',  'Water Branch',   50,  0, 1, 3),
    ('Unlock Air Branch',     'Reveal Air branches in all school trees',    'Air Branch',     50,  0, 1, 4),
    ('Starter Deck Slot',     '+1 card in starter deck',                    None,            100,  0, 3, 5),
    ('Starting Energy +1',    '+1 max energy of your school type',          None,            200,  0, 2, 6),
    ('Discovery Bonus',       'Increase chance of specific spell types',     None,             75,  0, 3, 7),
    ('Instrument Slot',       'Carry 1 more persistent instrument',         None,            150, 50, 2, 8),
]


# =============================================
# Build
# =============================================

def build():
    try:
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
    except PermissionError:
        # File locked — overwrite in place by dropping and recreating tables
        pass

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Drop existing tables if rebuilding in-place
    for table in ['prototype_roguelike_research', 'prototype_roguelike_gate_requirement',
                  'prototype_roguelike_node_effect', 'prototype_roguelike_node_prerequisite',
                  'prototype_roguelike_node_cost', 'prototype_roguelike_node',
                  'prototype_roguelike_meta_condition', 'prototype_roguelike_meta_unlock',
                  'prototype_roguelike_mastery_level',
                  'prototype_incremental_effect', 'prototype_incremental_prerequisite',
                  'prototype_incremental_cost', 'prototype_incremental_node',
                  'scientist_type_affinity_design', 'scientist_design',
                  'effect_type_link_design', 'effect_design',
                  'type_combination_design', 'wizard_school_design', 'status_effect_design',
                  'instrument_design', 'unit_design',
                  'combination_design', 'old_name_design', 'counter_design',
                  'counter_candidates', 'spell_combination_design', 'types']:
        c.execute(f'DROP TABLE IF EXISTS {table}')
    conn.commit()

    # Create schema
    with open(SCHEMA_PATH, 'r') as f:
        c.executescript(f.read())

    # --- 1. Insert types (selected FKs and dark_pair/parent null initially) ---
    c.executemany(
        '''INSERT INTO types (name, old_name, tier, color, sort_order,
           state_of_matter, energy_domain, primary_archetype, cluster_memberships)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        TYPES
    )

    # Build name -> id lookup
    c.execute('SELECT id, name FROM types')
    T = {name: tid for tid, name in c.fetchall()}

    # --- 2. Insert old name candidates ---
    for type_name, name, etymology, is_selected in OLD_NAMES:
        c.execute(
            'INSERT INTO old_name_design (type_id, name, etymology, is_selected) VALUES (?, ?, ?, ?)',
            (T[type_name], name, etymology, is_selected)
        )

    # --- 3. Insert combinations ---
    for result, comp_a, comp_b, rel, notes, is_sel in COMBINATIONS:
        c.execute(
            '''INSERT INTO combination_design
               (result_type_id, component_a_type_id, component_b_type_id, relationship, notes, is_selected)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (T[result], T.get(comp_a), T.get(comp_b), rel, notes, is_sel)
        )

    # --- 3b. Set dark pair / parent relationships on types ---
    for type_name, dark_pair_name, parent_name in DARK_PAIR_PARENT:
        if dark_pair_name:
            c.execute('UPDATE types SET dark_pair_type_id = ? WHERE id = ?',
                      (T[dark_pair_name], T[type_name]))
        if parent_name:
            c.execute('UPDATE types SET parent_type_id = ? WHERE id = ?',
                      (T[parent_name], T[type_name]))

    # --- 3c. Insert units of measurement ---
    for type_name, name, symbol, quantity, named_after, desc, is_sel in UNITS:
        c.execute(
            '''INSERT INTO unit_design
               (type_id, name, symbol, quantity_measured, named_after, description, is_selected)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (T[type_name], name, symbol, quantity, named_after, desc, is_sel)
        )

    # --- 3d. Insert instruments ---
    for type_name, name, scientist, desc, thematic_role, is_sel in INSTRUMENTS:
        c.execute(
            '''INSERT INTO instrument_design
               (type_id, name, associated_scientist, description, thematic_role, is_selected)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (T[type_name], name, scientist, desc, thematic_role, is_sel)
        )

    # --- 4. Insert status effects ---
    for type_name, name, duration, stackable, desc, is_sel in STATUS_EFFECTS:
        c.execute(
            '''INSERT INTO status_effect_design
               (type_id, name, duration, is_stackable, description, is_selected)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (T[type_name], name, duration, stackable, desc, is_sel)
        )

    # --- 5. Insert wizard schools ---
    for type_name, school, role, scientist, birth, death, contribution, thought in WIZARD_SCHOOLS:
        c.execute(
            '''INSERT INTO wizard_school_design
               (type_id, school_name, role, scientist_name, birth_year, death_year, contribution, school_of_thought)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (T[type_name], school, role, scientist, birth, death, contribution, thought)
        )

    # --- 6. Insert counter design ---
    for source, target, grounding, mechanism, is_mutual, is_confirmed in COUNTERS:
        c.execute(
            '''INSERT INTO counter_design
               (source_type_id, target_type_id, grounding, mechanism, is_mutual, is_confirmed)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (T[source], T[target], grounding, mechanism, is_mutual, is_confirmed)
        )

    # --- 7. Insert type combinations ---
    for a_name, b_name, a_amt, b_amt, name, desc, nature, mechanic, process, is_sel in TYPE_COMBOS:
        a_id = T[a_name]
        b_id = T[b_name] if b_name is not None else None
        # Ensure canonical ordering (type_a_id <= type_b_id) for two-type spells
        if b_id is not None and a_id > b_id:
            a_id, b_id = b_id, a_id
            a_amt, b_amt = b_amt, a_amt
        c.execute(
            '''INSERT INTO type_combination_design
               (type_a_id, type_b_id, type_a_amount, type_b_amount, name, description, nature, mechanic, process, is_selected)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (a_id, b_id, a_amt, b_amt, name, desc, nature, mechanic, process, is_sel)
        )

    # --- 8. Insert effect archetypes ---
    for category, archetype, name, desc, effect_class, is_sel, notes in EFFECTS:
        c.execute(
            '''INSERT INTO effect_design
               (category, archetype, name, description, effect_class, is_selected, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (category, archetype, name, desc, effect_class, is_sel, notes)
        )

    # Build effect name -> id lookup
    c.execute('SELECT id, name FROM effect_design')
    E = {name: eid for eid, name in c.fetchall()}

    # --- 9. Insert effect-type links ---
    for type_name, effect_name, role, is_sel, notes in EFFECT_TYPE_LINKS:
        c.execute(
            '''INSERT INTO effect_type_link_design
               (effect_id, type_id, role, is_selected, notes)
               VALUES (?, ?, ?, ?, ?)''',
            (E[effect_name], T[type_name], role, is_sel, notes)
        )

    # --- 9b. Insert basic 1-cost spells and link each to its effect ---
    for type_name, name, desc, nature, process, effect_name, link_role in BASIC_SPELLS:
        c.execute(
            '''INSERT INTO type_combination_design
               (type_a_id, type_b_id, type_a_amount, type_b_amount, name, description, nature, mechanic, process, is_selected)
               VALUES (?, NULL, 1, 0, ?, ?, ?, 'spell', ?, 0)''',
            (T[type_name], name, desc, nature, process)
        )
        combo_id = c.lastrowid
        c.execute(
            '''INSERT INTO effect_type_link_design
               (effect_id, type_id, type_combination_id, role, is_selected, notes)
               VALUES (?, NULL, ?, ?, 0, ?)''',
            (E[effect_name], combo_id, link_role, f'Basic 1-cost {type_name} spell')
        )

    # --- 10. Insert scientists ---
    for name, birth, death, field, sub_field, contribution, significance, era, nationality, is_sel, notes in SCIENTISTS:
        c.execute(
            '''INSERT INTO scientist_design
               (name, birth_year, death_year, field, sub_field, contribution, significance, era, nationality, is_selected, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (name, birth, death, field, sub_field, contribution, significance, era, nationality, is_sel, notes)
        )

    # Build scientist name -> id lookup
    c.execute('SELECT id, name FROM scientist_design')
    S = {name: sid for sid, name in c.fetchall()}

    # --- 11. Insert scientist-type affinities ---
    for scientist_name, type_name, affinity, rationale, is_sel in SCIENTIST_TYPE_AFFINITIES:
        c.execute(
            '''INSERT INTO scientist_type_affinity_design
               (scientist_id, type_id, affinity, rationale, is_selected)
               VALUES (?, ?, ?, ?, ?)''',
            (S[scientist_name], T[type_name], affinity, rationale, is_sel)
        )

    # --- 12. Insert incremental progression tree ---
    # Nodes
    for name, desc, flavor, type_name, category, tier, era, hist_date, scientist, sort in INCREMENTAL_NODES:
        c.execute(
            '''INSERT INTO prototype_incremental_node
               (name, description, flavor_text, type_id, category, tier, era,
                historical_date, scientist, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (name, desc, flavor, T.get(type_name), category, tier, era,
             hist_date, scientist, sort)
        )

    # Build node name -> id lookup
    c.execute('SELECT id, name FROM prototype_incremental_node')
    N = {name: nid for nid, name in c.fetchall()}

    # Costs
    for node_name, type_name, amount in INCREMENTAL_COSTS:
        c.execute(
            '''INSERT INTO prototype_incremental_cost (node_id, type_id, amount)
               VALUES (?, ?, ?)''',
            (N[node_name], T[type_name], amount)
        )

    # Prerequisites
    for node_name, required_name, group in INCREMENTAL_PREREQUISITES:
        c.execute(
            '''INSERT INTO prototype_incremental_prerequisite
               (node_id, required_node_id, prerequisite_group)
               VALUES (?, ?, ?)''',
            (N[node_name], N[required_name], group)
        )

    # Effects
    for node_name, effect_type, target_type_name, target_node_name, value, desc in INCREMENTAL_EFFECTS:
        c.execute(
            '''INSERT INTO prototype_incremental_effect
               (node_id, effect_type, target_type_id, target_node_id, value, description)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (N[node_name], effect_type, T.get(target_type_name),
             N.get(target_node_name), value, desc)
        )

    # --- 13. Insert roguelike progression ---

    # Meta-unlocks (must come first — nodes reference them)
    # Build wizard school scientist -> id lookup for character unlocks
    c.execute("SELECT id, scientist_name FROM wizard_school_design WHERE role = 'head'")
    WS = {sci: wid for wid, sci in c.fetchall()}

    for name, desc, layer, category, target_type_name, target_ws_scientist in ROGUELIKE_META_UNLOCKS:
        c.execute(
            '''INSERT INTO prototype_roguelike_meta_unlock
               (name, description, layer, category, target_type_id, target_wizard_school_id)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (name, desc, layer, category, T.get(target_type_name),
             WS.get(target_ws_scientist))
        )

    # Build meta-unlock name -> id lookup
    c.execute('SELECT id, name FROM prototype_roguelike_meta_unlock')
    MU = {name: mid for mid, name in c.fetchall()}

    # Meta-conditions
    for mu_name, cond_type, cond_type_name, cond_value, cond_type_b_name, desc in ROGUELIKE_META_CONDITIONS:
        c.execute(
            '''INSERT INTO prototype_roguelike_meta_condition
               (meta_unlock_id, condition_type, condition_type_id, condition_value,
                condition_type_b_id, description)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (MU[mu_name], cond_type, T.get(cond_type_name), cond_value,
             T.get(cond_type_b_name), desc)
        )

    # Mastery levels
    for level, name, desc, mod_type, mod_value in ROGUELIKE_MASTERY_LEVELS:
        c.execute(
            '''INSERT INTO prototype_roguelike_mastery_level
               (level, name, description, modifier_type, modifier_value)
               VALUES (?, ?, ?, ?, ?)''',
            (level, name, desc, mod_type, mod_value)
        )

    # Per-run nodes
    for name, desc, flavor, type_name, category, tier, branch, vis, mu_name, sort in ROGUELIKE_NODES:
        c.execute(
            '''INSERT INTO prototype_roguelike_node
               (name, description, flavor_text, type_id, category, tier, branch,
                visibility, meta_unlock_id, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (name, desc, flavor, T.get(type_name), category, tier, branch,
             vis, MU.get(mu_name), sort)
        )

    # Build roguelike node name -> id lookup
    c.execute('SELECT id, name FROM prototype_roguelike_node')
    RN = {name: rid for rid, name in c.fetchall()}

    # Node costs
    for node_name, type_name, amount in ROGUELIKE_NODE_COSTS:
        c.execute(
            '''INSERT INTO prototype_roguelike_node_cost (node_id, type_id, amount)
               VALUES (?, ?, ?)''',
            (RN[node_name], T[type_name], amount)
        )

    # Node prerequisites
    for node_name, required_name, group in ROGUELIKE_NODE_PREREQUISITES:
        c.execute(
            '''INSERT INTO prototype_roguelike_node_prerequisite
               (node_id, required_node_id, prerequisite_group)
               VALUES (?, ?, ?)''',
            (RN[node_name], RN[required_name], group)
        )

    # Node effects
    for node_name, effect_type, target_type_name, value, desc in ROGUELIKE_NODE_EFFECTS:
        c.execute(
            '''INSERT INTO prototype_roguelike_node_effect
               (node_id, effect_type, target_type_id, value, description)
               VALUES (?, ?, ?, ?, ?)''',
            (RN[node_name], effect_type, T.get(target_type_name), value, desc)
        )

    # Gate requirements
    for gate_name, req_type_name, req_depth in ROGUELIKE_GATE_REQUIREMENTS:
        c.execute(
            '''INSERT INTO prototype_roguelike_gate_requirement
               (gate_node_id, required_type_id, required_depth)
               VALUES (?, ?, ?)''',
            (RN[gate_name], T[req_type_name], req_depth)
        )

    # Research desk items
    for name, desc, mu_name, insight, material, max_purch, sort in ROGUELIKE_RESEARCH:
        c.execute(
            '''INSERT INTO prototype_roguelike_research
               (name, description, meta_unlock_id, insight_cost, material_cost,
                max_purchases, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (name, desc, MU.get(mu_name), insight, material, max_purch, sort)
        )

    # --- 14. Update types with selected FK references ---
    c.execute('''
        UPDATE types SET selected_old_name_id = (
            SELECT id FROM old_name_design
            WHERE old_name_design.type_id = types.id AND old_name_design.is_selected = 1
            LIMIT 1
        )
    ''')
    c.execute('''
        UPDATE types SET selected_status_effect_id = (
            SELECT id FROM status_effect_design
            WHERE status_effect_design.type_id = types.id AND status_effect_design.is_selected = 1
            LIMIT 1
        )
    ''')

    conn.commit()

    # --- Summary ---
    tables = [
        ('types', 'SELECT COUNT(*) FROM types'),
        ('old_name_design', 'SELECT COUNT(*) FROM old_name_design'),
        ('combination_design', 'SELECT COUNT(*) FROM combination_design'),
        ('unit_design', 'SELECT COUNT(*) FROM unit_design'),
        ('instrument_design', 'SELECT COUNT(*) FROM instrument_design'),
        ('status_effect_design', 'SELECT COUNT(*) FROM status_effect_design'),
        ('wizard_school_design', 'SELECT COUNT(*) FROM wizard_school_design'),
        ('counter_design', 'SELECT COUNT(*) FROM counter_design'),
        ('type_combination_design', 'SELECT COUNT(*) FROM type_combination_design'),
        ('effect_design', 'SELECT COUNT(*) FROM effect_design'),
        ('effect_type_link_design', 'SELECT COUNT(*) FROM effect_type_link_design'),
        ('scientist_design', 'SELECT COUNT(*) FROM scientist_design'),
        ('scientist_type_affinity_design', 'SELECT COUNT(*) FROM scientist_type_affinity_design'),
        ('prototype_incremental_node', 'SELECT COUNT(*) FROM prototype_incremental_node'),
        ('prototype_incremental_cost', 'SELECT COUNT(*) FROM prototype_incremental_cost'),
        ('prototype_incremental_prerequisite', 'SELECT COUNT(*) FROM prototype_incremental_prerequisite'),
        ('prototype_incremental_effect', 'SELECT COUNT(*) FROM prototype_incremental_effect'),
        ('prototype_roguelike_meta_unlock', 'SELECT COUNT(*) FROM prototype_roguelike_meta_unlock'),
        ('prototype_roguelike_meta_condition', 'SELECT COUNT(*) FROM prototype_roguelike_meta_condition'),
        ('prototype_roguelike_mastery_level', 'SELECT COUNT(*) FROM prototype_roguelike_mastery_level'),
        ('prototype_roguelike_node', 'SELECT COUNT(*) FROM prototype_roguelike_node'),
        ('prototype_roguelike_node_cost', 'SELECT COUNT(*) FROM prototype_roguelike_node_cost'),
        ('prototype_roguelike_node_prerequisite', 'SELECT COUNT(*) FROM prototype_roguelike_node_prerequisite'),
        ('prototype_roguelike_node_effect', 'SELECT COUNT(*) FROM prototype_roguelike_node_effect'),
        ('prototype_roguelike_gate_requirement', 'SELECT COUNT(*) FROM prototype_roguelike_gate_requirement'),
        ('prototype_roguelike_research', 'SELECT COUNT(*) FROM prototype_roguelike_research'),
    ]
    print('--- Build Summary ---')
    for name, query in tables:
        c.execute(query)
        print(f'  {name}: {c.fetchone()[0]} rows')

    c.execute('SELECT COUNT(*) FROM counter_design WHERE is_confirmed = 1')
    print(f'  confirmed counters: {c.fetchone()[0]}')
    c.execute('SELECT COUNT(*) FROM types WHERE selected_old_name_id IS NOT NULL')
    print(f'  types with selected old name: {c.fetchone()[0]}')
    c.execute('SELECT COUNT(*) FROM types WHERE selected_status_effect_id IS NOT NULL')
    print(f'  types with selected status effect: {c.fetchone()[0]}')
    c.execute('SELECT COUNT(*) FROM types WHERE dark_pair_type_id IS NOT NULL')
    print(f'  types with dark pair: {c.fetchone()[0]}')
    c.execute('SELECT COUNT(*) FROM types WHERE parent_type_id IS NOT NULL')
    print(f'  types with parent: {c.fetchone()[0]}')

    # Incremental progression summary
    c.execute("SELECT t.name, COUNT(*) FROM prototype_incremental_node n JOIN types t ON n.type_id = t.id GROUP BY t.name ORDER BY t.sort_order")
    print('  incremental nodes by type:')
    for name, count in c.fetchall():
        print(f'    {name}: {count}')
    c.execute("SELECT COUNT(*) FROM prototype_incremental_effect WHERE effect_type = 'unlock_type'")
    print(f'  type unlock gates: {c.fetchone()[0]}')

    # Roguelike progression summary
    c.execute("SELECT t.name, COUNT(*) FROM prototype_roguelike_node n JOIN types t ON n.type_id = t.id GROUP BY t.name ORDER BY t.sort_order")
    print('  roguelike nodes by type:')
    for name, count in c.fetchall():
        print(f'    {name}: {count}')
    c.execute("SELECT COUNT(*) FROM prototype_roguelike_node WHERE visibility = 'meta'")
    print(f'  roguelike meta-gated nodes: {c.fetchone()[0]}')
    c.execute("SELECT COUNT(*) FROM prototype_roguelike_node WHERE category = 'gate'")
    print(f'  roguelike secondary gates: {c.fetchone()[0]}')

    conn.close()
    print(f'\nDatabase written to {DB_PATH}')


if __name__ == '__main__':
    build()
