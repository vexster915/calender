// Orbit study outlines for O'Connor science and social studies courses.
// DVUSD's own HS science and social studies curriculum guides are staff-only, so these follow the
// Arizona standards the Academic Planning Guide lists for each course.
import { u } from './cur-ela-math.js';

const SCIENCE_PRACTICES = [
  ['Independent variable', 'The factor the experimenter changes on purpose.'],
  ['Dependent variable', 'The factor measured in response to the change.'],
  ['Control variable', 'A factor kept the same so it doesn’t affect results.'],
  ['Hypothesis', 'A testable prediction, often “If … then … because …”.'],
  ['Claim-evidence-reasoning (CER)', 'Answer format: state a claim, give data as evidence, explain why the evidence supports it.'],
];

const SCI = {
  biology: {
    label: 'Biology', standards: 'Arizona Science Standards — HS Life Science (L1–L4) plus physical/earth essentials listed by DVUSD',
    units: [
      u('Science practices & biochemistry', ['Design controlled experiments and analyze data', 'Describe the structure and function of carbohydrates, lipids, proteins and nucleic acids'], [
        ...SCIENCE_PRACTICES.slice(0, 3), ['Carbohydrate', 'Sugar/starch molecule used for quick energy and structure (monomer: monosaccharide).'], ['Protein', 'Chain of amino acids that does most of the cell’s work, including enzymes.'], ['Lipid', 'Fats, oils and phospholipids; long-term energy and cell membranes.'], ['Nucleic acid', 'DNA or RNA, built from nucleotides; stores genetic information.'], ['Enzyme', 'A protein catalyst that speeds up reactions by lowering activation energy.'],
      ]),
      u('Cells & homeostasis', ['Compare prokaryotic and eukaryotic cells', 'Explain transport across the membrane and homeostasis'], [
        ['Prokaryote', 'A cell with no nucleus or membrane-bound organelles (bacteria).'], ['Eukaryote', 'A cell with a nucleus and membrane-bound organelles.'], ['Cell membrane', 'Phospholipid bilayer that controls what enters and leaves the cell.'], ['Mitochondrion', 'Organelle where cellular respiration makes ATP.'], ['Chloroplast', 'Plant organelle where photosynthesis occurs.'], ['Diffusion', 'Movement of particles from high to low concentration.'], ['Osmosis', 'Diffusion of water across a selectively permeable membrane.'], ['Active transport', 'Moving substances against the concentration gradient using energy (ATP).'], ['Homeostasis', 'Keeping a stable internal environment.'],
      ]),
      u('Energy in living systems', ['Model photosynthesis and cellular respiration as energy and matter flows'], [
        ['Photosynthesis', '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.'], ['Cellular respiration', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP.'], ['ATP', 'Adenosine triphosphate, the cell’s energy currency.'], ['Fermentation', 'Anaerobic process that makes a little ATP plus lactic acid or alcohol.'], ['Producer', 'An organism that makes its own food (autotroph).'],
      ]),
      u('DNA, genes & protein synthesis', ['Explain DNA structure and replication', 'Trace transcription and translation; explain mutations'], [
        ['DNA', 'Double helix of nucleotides; base pairs A–T and G–C.'], ['Gene', 'A segment of DNA that codes for a protein.'], ['Transcription', 'Copying DNA into mRNA in the nucleus.'], ['Translation', 'Reading mRNA codons at the ribosome to build a protein.'], ['Codon', 'Three mRNA bases that code for one amino acid.'], ['Mutation', 'A change in the DNA sequence.'], ['Mitosis', 'Cell division producing two identical body cells.'],
      ]),
      u('Heredity & genetics', ['Use Punnett squares and pedigrees', 'Explain how meiosis creates variation'], [
        ['Allele', 'A version of a gene.'], ['Dominant', 'An allele that shows its trait when only one copy is present.'], ['Recessive', 'An allele whose trait shows only with two copies.'], ['Genotype', 'The allele combination an organism has (e.g. Bb).'], ['Phenotype', 'The observable trait.'], ['Meiosis', 'Cell division producing four genetically different gametes with half the chromosomes.'], ['Crossing over', 'Exchange of DNA between homologous chromosomes during meiosis.'],
      ]),
      u('Evolution', ['Explain natural selection and evidence for common ancestry'], [
        ['Natural selection', 'Individuals with helpful heritable traits survive and reproduce more.'], ['Adaptation', 'A heritable trait that improves survival or reproduction.'], ['Homologous structures', 'Similar structures from a common ancestor (e.g. human arm, whale flipper).'], ['Fitness', 'An organism’s ability to survive and reproduce.'], ['Speciation', 'Formation of a new species.'],
      ]),
      u('Ecology', ['Model energy flow and matter cycles in ecosystems', 'Explain population growth and human impact'], [
        ['Food web', 'Interconnected feeding relationships in an ecosystem.'], ['10% rule', 'About 10% of energy passes to the next trophic level.'], ['Carrying capacity', 'The largest population an environment can support.'], ['Carbon cycle', 'Movement of carbon through photosynthesis, respiration, decomposition and combustion.'], ['Biodiversity', 'Variety of life in an area.'], ['Symbiosis', 'Close relationship between species: mutualism, commensalism or parasitism.'],
      ]),
    ],
  },
  chemistry: {
    label: 'Chemistry', standards: 'Arizona Science Standards — HS Physical Science (P1–P4) and Earth essentials listed by DVUSD',
    units: [
      u('Matter & measurement', ['Use significant figures, units and dimensional analysis', 'Classify matter and its changes'], [
        ['Significant figures', 'The meaningful digits in a measurement.'], ['Dimensional analysis', 'Converting units by multiplying by conversion factors.'], ['Density', 'Mass ÷ volume.'], ['Physical change', 'A change in form without making a new substance.'], ['Chemical change', 'A change that forms new substances.'], ['Pure substance', 'An element or compound with fixed composition.'],
      ]),
      u('Atomic structure & the periodic table', ['Describe subatomic particles, isotopes and electron configuration', 'Explain periodic trends'], [
        ['Proton', 'Positive particle in the nucleus; number = atomic number.'], ['Neutron', 'Neutral particle in the nucleus.'], ['Electron', 'Negative particle in orbitals around the nucleus.'], ['Isotope', 'Atoms of an element with different numbers of neutrons.'], ['Valence electrons', 'Outermost electrons involved in bonding.'], ['Atomic radius trend', 'Decreases across a period, increases down a group.'], ['Electronegativity', 'An atom’s pull on shared electrons; highest at fluorine.'],
      ]),
      u('Bonding & molecular structure', ['Compare ionic, covalent and metallic bonds', 'Draw Lewis structures and predict shapes'], [
        ['Ionic bond', 'Transfer of electrons between a metal and nonmetal.'], ['Covalent bond', 'Sharing of electrons between nonmetals.'], ['Polar molecule', 'Molecule with uneven charge distribution.'], ['VSEPR', 'Electron pairs repel, determining molecular shape.'], ['Intermolecular forces', 'Attractions between molecules: dispersion, dipole–dipole, hydrogen bonding.'],
      ]),
      u('Reactions & stoichiometry', ['Balance equations and classify reactions', 'Use moles to calculate amounts of reactants and products'], [
        ['Law of conservation of mass', 'Mass is neither created nor destroyed in a reaction.'], ['Mole', '6.022 × 10²³ particles (Avogadro’s number).'], ['Molar mass', 'Mass of one mole of a substance, in g/mol.'], ['Limiting reactant', 'The reactant that runs out first and limits product.'], ['Percent yield', '(actual ÷ theoretical) × 100.'], ['Combustion', 'Reaction with O₂ producing CO₂ and H₂O.'],
      ]),
      u('Gases, solutions & energy', ['Apply gas laws', 'Calculate concentration; explain endothermic vs exothermic'], [
        ['Ideal gas law', 'PV = nRT.'], ['Boyle’s law', 'At constant T, pressure and volume are inversely related.'], ['Molarity', 'Moles of solute per liter of solution.'], ['Exothermic', 'Releases heat (ΔH negative).'], ['Endothermic', 'Absorbs heat (ΔH positive).'],
      ]),
      u('Equilibrium, acids & bases, nuclear', ['Predict shifts with Le Châtelier’s principle', 'Calculate pH; compare fission and fusion'], [
        ['Le Châtelier’s principle', 'A system at equilibrium shifts to counteract a change.'], ['pH', '−log[H⁺]; below 7 acidic, above 7 basic.'], ['Acid', 'Proton (H⁺) donor.'], ['Base', 'Proton acceptor.'], ['Fission', 'Splitting a heavy nucleus, releasing energy.'], ['Fusion', 'Joining light nuclei, releasing energy (powers stars).'], ['Half-life', 'Time for half of a radioactive sample to decay.'],
      ]),
    ],
  },
  physics: {
    label: 'Physics', standards: 'Arizona Science Standards — HS Physical Science (P1–P4)',
    units: [
      u('Motion (kinematics)', ['Describe motion with graphs and equations'], [
        ['Displacement', 'Change in position, with direction.'], ['Velocity', 'Displacement ÷ time (speed with direction).'], ['Acceleration', 'Change in velocity ÷ time.'], ['Free fall', 'Motion under gravity alone; a = 9.8 m/s² downward.'], ['Slope of a position–time graph', 'Velocity.'], ['Area under a velocity–time graph', 'Displacement.'],
      ]),
      u('Forces & Newton’s laws', ['Draw free-body diagrams and apply Newton’s laws'], [
        ['Newton’s first law', 'An object keeps its motion unless a net force acts (inertia).'], ['Newton’s second law', 'F_net = ma.'], ['Newton’s third law', 'Forces come in equal and opposite pairs.'], ['Friction', 'Force opposing sliding; f = μN.'], ['Weight', 'Force of gravity: W = mg.'], ['Normal force', 'Support force perpendicular to a surface.'],
      ]),
      u('Momentum & energy', ['Apply conservation of momentum and energy'], [
        ['Momentum', 'p = mv.'], ['Impulse', 'FΔt = Δp.'], ['Kinetic energy', 'KE = ½mv².'], ['Gravitational potential energy', 'PE = mgh.'], ['Work', 'W = Fd cos θ.'], ['Power', 'Work ÷ time (watts).'], ['Conservation of energy', 'Total energy in a closed system stays constant.'],
      ]),
      u('Gravity & circular motion', ['Apply Newton’s law of gravitation and centripetal force'], [
        ['Centripetal acceleration', 'a = v²/r, toward the center.'], ['Universal gravitation', 'F = Gm₁m₂/r².'], ['Orbit', 'Continuous free fall around a body.'],
      ]),
      u('Waves, sound & light', ['Relate wave speed, frequency and wavelength', 'Explain the electromagnetic spectrum'], [
        ['Wave equation', 'v = fλ.'], ['Frequency', 'Waves per second (hertz).'], ['Transverse wave', 'Vibration perpendicular to wave travel (light).'], ['Longitudinal wave', 'Vibration parallel to wave travel (sound).'], ['Electromagnetic spectrum', 'Radio, microwave, infrared, visible, UV, X-ray, gamma.'], ['Doppler effect', 'Change in observed frequency due to relative motion.'],
      ]),
      u('Electricity & magnetism', ['Analyze circuits with Ohm’s law', 'Explain electromagnetic induction'], [
        ['Ohm’s law', 'V = IR.'], ['Series circuit', 'One path; current is the same everywhere.'], ['Parallel circuit', 'Multiple paths; voltage is the same across branches.'], ['Coulomb’s law', 'F = kq₁q₂/r².'], ['Electromagnetic induction', 'A changing magnetic field induces a current (generators).'],
      ]),
    ],
  },
  earth: {
    label: 'Earth Science', standards: 'Arizona Science Standards — HS Earth & Space Science (E1–E2)',
    units: [
      u('Earth’s place in the universe', ['Explain the Big Bang, star life cycles and the solar system'], [
        ['Big Bang theory', 'The universe began about 13.8 billion years ago from a hot, dense state and is expanding.'], ['Red shift', 'Light from receding galaxies is stretched to longer wavelengths.'], ['Nuclear fusion', 'Stars fuse hydrogen into helium, releasing energy.'], ['Light-year', 'Distance light travels in one year.'], ['Kepler’s laws', 'Planets orbit in ellipses; closer planets move faster.'],
      ]),
      u('Plate tectonics', ['Explain plate boundaries and the evidence for plate tectonics'], [
        ['Divergent boundary', 'Plates move apart (mid-ocean ridges).'], ['Convergent boundary', 'Plates collide (subduction, mountains).'], ['Transform boundary', 'Plates slide past each other (San Andreas Fault).'], ['Mantle convection', 'Heat-driven flow in the mantle that moves plates.'], ['Seafloor spreading', 'New crust forms at ridges and moves outward.'],
      ]),
      u('Rocks, minerals & Earth’s history', ['Use the rock cycle and relative/absolute dating'], [
        ['Igneous rock', 'Forms from cooled magma or lava.'], ['Sedimentary rock', 'Forms from compacted, cemented sediment.'], ['Metamorphic rock', 'Forms when heat and pressure change existing rock.'], ['Law of superposition', 'Lower rock layers are older.'], ['Radiometric dating', 'Using radioactive decay to find a rock’s absolute age.'],
      ]),
      u('Weather & climate', ['Explain atmosphere, weather systems and climate change'], [
        ['Greenhouse effect', 'Gases trap heat radiated from Earth’s surface.'], ['Front', 'Boundary between air masses.'], ['Climate', 'Long-term average weather in a region.'], ['Coriolis effect', 'Earth’s rotation deflects winds and currents.'],
      ]),
      u('Water & resources', ['Model the water cycle and evaluate resource use in Arizona'], [
        ['Water cycle', 'Evaporation, condensation, precipitation and runoff.'], ['Aquifer', 'Underground layer of rock holding groundwater.'], ['Renewable resource', 'A resource replaced naturally on a human timescale.'], ['Erosion', 'Movement of weathered material by wind, water or ice.'],
      ]),
    ],
  },
  envsci: {
    label: 'Environmental Science', standards: 'Arizona Science Standards — HS Earth, Life and Physical essentials listed by DVUSD',
    units: [
      u('Ecosystems & biodiversity', ['Describe energy flow, cycles and biodiversity'], [
        ['Ecosystem', 'All organisms and nonliving factors in an area.'], ['Keystone species', 'A species with a large effect on its ecosystem.'], ['Nitrogen cycle', 'Nitrogen moves through fixation, nitrification and denitrification.'], ['Succession', 'Gradual change in a community over time.'],
      ]),
      u('Populations & human impact', ['Analyze human population growth and its effects'], [
        ['Carrying capacity', 'Maximum population an environment can sustain.'], ['Demographic transition', 'Shift from high to low birth and death rates as countries develop.'], ['Ecological footprint', 'Land and water needed to support a person’s lifestyle.'],
      ]),
      u('Water, land & food', ['Evaluate water use, soil and agriculture'], [
        ['Watershed', 'Land area draining into a body of water.'], ['Desertification', 'Productive land turning into desert.'], ['Integrated pest management', 'Combining methods to control pests with fewer chemicals.'],
      ]),
      u('Energy & pollution', ['Compare energy sources and their impacts'], [
        ['Fossil fuels', 'Coal, oil and natural gas formed from ancient organisms.'], ['Renewable energy', 'Solar, wind, hydro, geothermal.'], ['Smog', 'Air pollution formed from emissions and sunlight.'], ['Eutrophication', 'Excess nutrients cause algae blooms and low oxygen.'],
      ]),
      u('Climate change & sustainability', ['Evaluate evidence and solutions for climate change'], [
        ['Greenhouse gas', 'A gas like CO₂ or methane that traps heat.'], ['Carbon footprint', 'Total greenhouse gases caused by a person or activity.'], ['Sustainability', 'Meeting present needs without harming future generations.'],
      ]),
    ],
  },
  anatomy: {
    label: 'Anatomy & Physiology', standards: 'Arizona Science Standards — HS Life Science (L1–L4)',
    units: [
      u('Body organization', ['Use anatomical terms and levels of organization'], [
        ['Anatomical position', 'Standing upright, facing forward, palms forward.'], ['Superior / inferior', 'Toward the head / toward the feet.'], ['Anterior / posterior', 'Front / back.'], ['Tissue', 'Group of similar cells working together (epithelial, connective, muscle, nervous).'], ['Homeostasis', 'Maintaining a stable internal environment, mostly by negative feedback.'],
      ]),
      u('Skeletal & muscular systems', ['Identify major bones and muscles and how movement happens'], [
        ['Axial skeleton', 'Skull, vertebral column and rib cage.'], ['Appendicular skeleton', 'Limbs and the girdles that attach them.'], ['Ligament', 'Connects bone to bone.'], ['Tendon', 'Connects muscle to bone.'], ['Sarcomere', 'The contractile unit of a muscle fiber.'],
      ]),
      u('Nervous & endocrine systems', ['Explain nerve impulses and hormone control'], [
        ['Neuron', 'A nerve cell that sends electrical signals.'], ['Synapse', 'Gap where neurons communicate with neurotransmitters.'], ['Central nervous system', 'Brain and spinal cord.'], ['Hormone', 'Chemical messenger released into the blood by endocrine glands.'], ['Insulin', 'Hormone that lowers blood glucose.'],
      ]),
      u('Cardiovascular & respiratory systems', ['Trace blood flow and gas exchange'], [
        ['Atrium', 'Upper chamber of the heart that receives blood.'], ['Ventricle', 'Lower chamber that pumps blood out.'], ['Artery', 'Carries blood away from the heart.'], ['Vein', 'Carries blood toward the heart.'], ['Alveoli', 'Tiny air sacs where gas exchange happens.'],
      ]),
      u('Digestive, urinary, immune & reproductive', ['Explain digestion, filtration and immune defenses'], [
        ['Small intestine', 'Main site of nutrient absorption.'], ['Nephron', 'Filtering unit of the kidney.'], ['Antibody', 'Protein that targets a specific antigen.'], ['White blood cell', 'Immune cell that fights infection.'],
      ]),
    ],
  },
  forensic: {
    label: 'Forensic Science', standards: 'Arizona Science Standards — HS Life & Physical essentials listed by DVUSD',
    units: [
      u('Crime scene investigation', ['Process a crime scene and maintain chain of custody'], [
        ['Chain of custody', 'Documented record of everyone who handled evidence.'], ['Locard’s exchange principle', 'Every contact leaves a trace.'], ['Trace evidence', 'Small items like hair, fibers or soil.'], ['Physical vs biological evidence', 'Objects and marks vs. material from a living thing.'],
      ]),
      u('Fingerprints & impressions', ['Classify and lift fingerprints'], [
        ['Loop, whorl, arch', 'The three basic fingerprint patterns (loops most common).'], ['Latent print', 'An invisible print revealed with powder or chemicals.'], ['Minutiae', 'Ridge details (bifurcations, ridge endings) used to match prints.'],
      ]),
      u('DNA & serology', ['Explain DNA profiling and blood typing'], [
        ['DNA profiling', 'Comparing STR regions to identify a person.'], ['Gel electrophoresis', 'Separates DNA fragments by size.'], ['Blood type', 'A, B, AB or O, based on antigens on red blood cells.'], ['Blood spatter analysis', 'Using drop shape and pattern to reconstruct events.'],
      ]),
      u('Toxicology, entomology & death', ['Estimate time of death and identify toxins'], [
        ['Rigor mortis', 'Stiffening of muscles after death (starts in 2–6 hours).'], ['Livor mortis', 'Pooling of blood that settles after death.'], ['Forensic entomology', 'Using insects to estimate time of death.'], ['Toxicology', 'Study of poisons and drugs in the body.'],
      ]),
    ],
  },
  marine: {
    label: 'Marine Biology', standards: 'Arizona Science Standards — HS Life & Earth essentials listed by DVUSD',
    units: [
      u('Ocean basics', ['Describe ocean zones, currents and seawater'], [
        ['Photic zone', 'Sunlit upper ocean where photosynthesis happens.'], ['Salinity', 'Amount of dissolved salt, about 35 parts per thousand.'], ['Upwelling', 'Cold, nutrient-rich water rising to the surface.'],
      ]),
      u('Marine life', ['Classify plankton, invertebrates, fish and mammals'], [
        ['Phytoplankton', 'Tiny drifting producers at the base of ocean food webs.'], ['Zooplankton', 'Tiny drifting animals.'], ['Cnidarian', 'Jellyfish, corals and anemones with stinging cells.'], ['Cetacean', 'Whales, dolphins and porpoises.'],
      ]),
      u('Marine ecosystems & conservation', ['Explain coral reefs, kelp forests and human threats'], [
        ['Coral bleaching', 'Corals expel algae when stressed by heat, turning white.'], ['Estuary', 'Where fresh river water mixes with salt water.'], ['Overfishing', 'Catching fish faster than they can reproduce.'],
      ]),
    ],
  },
  astronomy: {
    label: 'Astronomy', standards: 'Arizona Science Standards — HS Earth & Space and Physical essentials listed by DVUSD',
    units: [
      u('The sky & motion', ['Explain seasons, phases and eclipses'], [
        ['Seasons', 'Caused by Earth’s 23.5° axial tilt, not distance from the Sun.'], ['Lunar phases', 'Changing amount of the Moon’s lit side we see.'], ['Solar eclipse', 'The Moon blocks the Sun.'], ['Lunar eclipse', 'Earth’s shadow falls on the Moon.'],
      ]),
      u('Light & telescopes', ['Use spectra to learn about stars'], [
        ['Spectroscopy', 'Splitting light to identify composition.'], ['Refracting telescope', 'Uses lenses.'], ['Reflecting telescope', 'Uses mirrors.'],
      ]),
      u('The solar system', ['Compare terrestrial and Jovian planets'], [
        ['Terrestrial planets', 'Rocky inner planets: Mercury, Venus, Earth, Mars.'], ['Jovian planets', 'Gas and ice giants: Jupiter, Saturn, Uranus, Neptune.'], ['Asteroid belt', 'Region between Mars and Jupiter.'],
      ]),
      u('Stars, galaxies & cosmology', ['Trace stellar evolution and the expanding universe'], [
        ['Main sequence', 'Stage where a star fuses hydrogen in its core.'], ['Supernova', 'Explosion of a massive star.'], ['Black hole', 'Region where gravity is so strong light cannot escape.'], ['Hubble’s law', 'More distant galaxies recede faster.'],
      ]),
    ],
  },
};

const HIST_SKILLS = [
  ['Primary source', 'A source created during the time being studied (letters, photos, laws).'],
  ['Secondary source', 'A later interpretation of events (textbooks, articles).'],
  ['Sourcing (HIPP)', 'Analyze a source’s Historical context, Intended audience, Purpose and Point of view.'],
  ['Causation', 'Explaining the causes and effects of events.'],
  ['Continuity and change', 'What stayed the same and what changed over time.'],
];

const SS = {
  world: {
    label: 'World History', standards: 'Arizona History & Social Science Standards — World History',
    units: [
      u('Foundations & classical civilizations', ['Compare early river valley and classical civilizations'], [
        ['Neolithic Revolution', 'Shift from hunting and gathering to farming.'], ['Mesopotamia', 'Early civilization between the Tigris and Euphrates rivers.'], ['Code of Hammurabi', 'Early Babylonian law code.'], ['Athenian democracy', 'Direct democracy of male citizens in ancient Athens.'], ['Pax Romana', 'About 200 years of relative peace in the Roman Empire.'], ['Silk Road', 'Trade routes linking China to the Mediterranean.'],
      ]),
      u('Post-classical world & belief systems', ['Explain the spread of world religions and empires'], [
        ['Feudalism', 'Medieval system of land given for loyalty and military service.'], ['Islamic Golden Age', 'Flourishing of science and culture in the Islamic world (8th–13th c.).'], ['Crusades', 'Religious wars for control of the Holy Land.'], ['Mongol Empire', 'Largest contiguous land empire, founded by Genghis Khan.'], ['Black Death', '14th-century plague that killed a third of Europe.'],
      ]),
      u('Renaissance, Reformation & exploration', ['Analyze changes in European thought and global exploration'], [
        ['Renaissance', 'Rebirth of classical learning and art in Europe (14th–17th c.).'], ['Humanism', 'Focus on human potential and achievement.'], ['Protestant Reformation', 'Religious movement begun by Martin Luther in 1517.'], ['Columbian Exchange', 'Transfer of plants, animals and diseases between hemispheres.'], ['Mercantilism', 'Policy of building wealth through exports and colonies.'],
      ]),
      u('Revolutions & industrialization', ['Compare political revolutions and the Industrial Revolution'], [
        ['Enlightenment', 'Movement emphasizing reason and natural rights (Locke, Rousseau).'], ['French Revolution', '1789 revolution that overthrew the monarchy.'], ['Industrial Revolution', 'Shift to machine production beginning in Britain.'], ['Nationalism', 'Strong loyalty to one’s nation.'], ['Imperialism', 'Extending power by taking over other territories.'],
      ]),
      u('World wars & the 20th century', ['Explain causes and effects of WWI, WWII and the Cold War'], [
        ['MAIN causes of WWI', 'Militarism, Alliances, Imperialism, Nationalism.'], ['Treaty of Versailles', '1919 treaty that punished Germany after WWI.'], ['Totalitarianism', 'Government controlling every aspect of life.'], ['Holocaust', 'Nazi genocide of six million Jews and millions of others.'], ['Cold War', 'Rivalry between the US and USSR (1947–1991).'], ['Decolonization', 'Colonies gaining independence after WWII.'],
      ]),
      u('Historical thinking', ['Analyze sources and write DBQ-style arguments'], HIST_SKILLS),
    ],
  },
  us: {
    label: 'United States History', standards: 'Arizona History & Social Science Standards — U.S. History',
    units: [
      u('Colonization to the Constitution', ['Explain colonial life, the Revolution and the founding'], [
        ['Mayflower Compact', '1620 agreement for self-government at Plymouth.'], ['Salutary neglect', 'Britain’s loose enforcement of colonial laws before 1763.'], ['Declaration of Independence', '1776 statement of natural rights and break from Britain.'], ['Articles of Confederation', 'First US government; weak central power.'], ['Federalism', 'Power divided between national and state governments.'], ['Bill of Rights', 'First ten amendments to the Constitution.'],
      ]),
      u('Expansion, sectionalism & Civil War', ['Explain westward expansion, slavery and the Civil War'], [
        ['Manifest Destiny', 'Belief the US should expand across the continent.'], ['Missouri Compromise', '1820 deal balancing free and slave states.'], ['Dred Scott decision', '1857 ruling that enslaved people were not citizens.'], ['Emancipation Proclamation', '1863 order freeing enslaved people in Confederate states.'], ['Reconstruction', 'Rebuilding the South (1865–1877); 13th, 14th, 15th Amendments.'],
      ]),
      u('Industrialization & the Progressive Era', ['Analyze industry, immigration and reform'], [
        ['Gilded Age', 'Era of rapid growth hiding corruption and inequality.'], ['Monopoly', 'One company controlling an entire industry.'], ['Progressive Era', 'Reform movement (1890s–1920s) tackling corruption and working conditions.'], ['19th Amendment', 'Gave women the right to vote (1920).'],
      ]),
      u('World wars & the Great Depression', ['Explain the 1920s, the Depression, New Deal and WWII'], [
        ['Great Depression', 'Severe economic downturn after the 1929 crash.'], ['New Deal', 'FDR’s programs for relief, recovery and reform.'], ['Pearl Harbor', '1941 Japanese attack that brought the US into WWII.'], ['Japanese American internment', 'Forced relocation of Japanese Americans during WWII.'],
      ]),
      u('Cold War & civil rights', ['Analyze Cold War policies and the civil rights movement'], [
        ['Containment', 'US policy to stop the spread of communism.'], ['Brown v. Board of Education', '1954 ruling ending legal school segregation.'], ['Civil Rights Act of 1964', 'Banned discrimination by race, color, religion, sex or national origin.'], ['Voting Rights Act of 1965', 'Outlawed discriminatory voting practices.'], ['Vietnam War', 'Long, divisive US war against communist North Vietnam.'],
      ]),
      u('Modern America & historical thinking', ['Explain events since 1980 and analyze sources'], [
        ['Reaganomics', 'Tax cuts and deregulation policies of the 1980s.'], ['9/11', 'Terrorist attacks on September 11, 2001.'], ...HIST_SKILLS.slice(0, 3),
      ]),
    ],
  },
  gov: {
    label: 'Government', standards: 'Arizona History & Social Science Standards — Civics/Government',
    units: [
      u('Foundations of government', ['Explain the ideas behind US democracy'], [
        ['Popular sovereignty', 'Power comes from the people.'], ['Social contract', 'People give up some freedom to a government in exchange for protection.'], ['Limited government', 'Government power is restricted by law.'], ['Rule of law', 'Everyone, including leaders, must obey the law.'],
      ]),
      u('The Constitution', ['Describe separation of powers, checks and balances and amendments'], [
        ['Separation of powers', 'Legislative, executive and judicial branches with different jobs.'], ['Checks and balances', 'Each branch can limit the others (e.g. veto, judicial review).'], ['Amendment process', 'Proposed by 2/3 of Congress, ratified by 3/4 of states.'], ['Federalism', 'Power shared between national and state governments.'],
      ]),
      u('Branches of government', ['Explain how Congress, the President and the courts work'], [
        ['Bicameral', 'Two-house legislature (Senate and House).'], ['Veto', 'President’s rejection of a bill; Congress can override with 2/3.'], ['Judicial review', 'Courts can strike down unconstitutional laws (Marbury v. Madison).'], ['Executive order', 'A directive from the President with the force of law.'],
      ]),
      u('Rights & participation', ['Explain civil liberties, civil rights and voting'], [
        ['Civil liberties', 'Freedoms protected from government interference (First Amendment).'], ['Due process', 'Fair legal procedures before depriving someone of rights.'], ['Electoral College', 'System of electors that chooses the President.'], ['Interest group', 'Organization that tries to influence policy.'],
      ]),
      u('State & local government (Arizona)', ['Describe Arizona’s government and how citizens participate'], [
        ['Initiative', 'Citizens propose a law by petition and vote on it (allowed in Arizona).'], ['Referendum', 'Voters approve or reject a law passed by the legislature.'], ['Recall', 'Voters remove an elected official before the term ends.'],
      ]),
    ],
  },
  econ: {
    label: 'Economics', standards: 'Arizona History & Social Science Standards — Economics (incl. personal finance)',
    units: [
      u('Economic thinking', ['Apply scarcity, choices and opportunity cost'], [
        ['Scarcity', 'Limited resources vs. unlimited wants.'], ['Opportunity cost', 'The value of the next best alternative given up.'], ['Factors of production', 'Land, labor, capital and entrepreneurship.'], ['Marginal analysis', 'Comparing the additional benefit and cost of one more unit.'],
      ]),
      u('Supply, demand & markets', ['Analyze how prices are set'], [
        ['Law of demand', 'As price rises, quantity demanded falls.'], ['Law of supply', 'As price rises, quantity supplied rises.'], ['Equilibrium', 'Price where quantity supplied equals quantity demanded.'], ['Price ceiling', 'Legal maximum price; can cause shortages.'], ['Elasticity', 'How much quantity responds to a price change.'],
      ]),
      u('Market structures & business', ['Compare competition, monopoly and business organizations'], [
        ['Perfect competition', 'Many sellers of identical products.'], ['Monopoly', 'A single seller with no close substitutes.'], ['Corporation', 'Business owned by shareholders with limited liability.'],
      ]),
      u('Macroeconomics', ['Measure the economy and explain fiscal and monetary policy'], [
        ['GDP', 'Total value of final goods and services produced in a country.'], ['Inflation', 'Rise in the general price level.'], ['Unemployment rate', 'Percent of the labor force without a job.'], ['Fiscal policy', 'Government taxing and spending to steer the economy.'], ['Monetary policy', 'The Federal Reserve managing money supply and interest rates.'],
      ]),
      u('Personal finance', ['Budget, use credit wisely and plan for the future'], [
        ['Budget', 'Plan for income, spending and saving.'], ['Credit score', 'Measure of creditworthiness (300–850).'], ['Compound interest', 'Interest on principal plus past interest.'], ['Net worth', 'Assets minus liabilities.'],
      ]),
    ],
  },
  psych: {
    label: 'Psychology', standards: 'Social Science elective',
    units: [
      u('Methods & the brain', ['Describe research methods and brain structures'], [
        ['Experiment', 'The only method that can show cause and effect.'], ['Neuron', 'A nerve cell.'], ['Frontal lobe', 'Brain area for planning, decisions and personality.'], ['Amygdala', 'Brain structure linked to fear and emotion.'], ['Neurotransmitter', 'Chemical messenger between neurons (e.g. dopamine, serotonin).'],
      ]),
      u('Learning & memory', ['Compare classical and operant conditioning; explain memory'], [
        ['Classical conditioning', 'Learning by association (Pavlov’s dogs).'], ['Operant conditioning', 'Learning from rewards and punishments (Skinner).'], ['Short-term memory', 'Holds about 7 ± 2 items briefly.'], ['Spacing effect', 'Spreading study over time improves long-term memory.'],
      ]),
      u('Development & personality', ['Explain development stages and personality theories'], [
        ['Piaget', 'Theorist of cognitive development stages.'], ['Erikson', 'Theorist of psychosocial stages (e.g. identity vs role confusion).'], ['Big Five', 'Openness, conscientiousness, extraversion, agreeableness, neuroticism.'],
      ]),
      u('Disorders & therapy', ['Describe major disorders and treatments'], [
        ['Anxiety disorder', 'Persistent, excessive worry or fear.'], ['Major depressive disorder', 'Persistent low mood and loss of interest.'], ['ADHD', 'A neurodevelopmental condition affecting attention, activity and impulse control.'], ['Cognitive behavioral therapy', 'Therapy that changes unhelpful thoughts and behaviors.'],
      ]),
    ],
  },
  sociology: {
    label: 'Sociology', standards: 'Social Science elective',
    units: [
      u('The sociological perspective', ['Use major sociological theories'], [
        ['Sociological imagination', 'Seeing how personal troubles connect to society.'], ['Functionalism', 'Society as parts working together for stability.'], ['Conflict theory', 'Society shaped by inequality and power struggles.'], ['Symbolic interactionism', 'Society built through everyday interactions and symbols.'],
      ]),
      u('Culture & socialization', ['Explain how people learn culture'], [
        ['Norms', 'Expected rules of behavior.'], ['Socialization', 'Learning the values and behaviors of a society.'], ['Agents of socialization', 'Family, school, peers and media.'],
      ]),
      u('Inequality & institutions', ['Analyze stratification, deviance and institutions'], [
        ['Social stratification', 'Ranking of groups in a hierarchy.'], ['Deviance', 'Behavior that violates norms.'], ['Social institution', 'A major structure like family, education or government.'],
      ]),
    ],
  },
  law: {
    label: 'Law in Society / Criminal Justice', standards: 'Social Science elective',
    units: [
      u('Foundations of law', ['Explain sources of law and the court system'], [
        ['Constitutional law', 'Law based on the Constitution.'], ['Statute', 'A law passed by a legislature.'], ['Civil law', 'Disputes between people (e.g. contracts).'], ['Criminal law', 'Offenses against the state, prosecuted by the government.'],
      ]),
      u('Criminal justice process', ['Trace a case from arrest to sentencing'], [
        ['Probable cause', 'Reasonable grounds needed for an arrest or search warrant.'], ['Miranda rights', 'Right to remain silent and to an attorney.'], ['Indictment', 'Formal charge by a grand jury.'], ['Beyond a reasonable doubt', 'Standard of proof in criminal cases.'],
      ]),
      u('Constitutional rights', ['Apply the 4th, 5th, 6th and 8th Amendments'], [
        ['Fourth Amendment', 'Protects against unreasonable searches and seizures.'], ['Fifth Amendment', 'Protects against self-incrimination and double jeopardy.'], ['Sixth Amendment', 'Right to a speedy, public trial and a lawyer.'], ['Eighth Amendment', 'Bans cruel and unusual punishment.'],
      ]),
    ],
  },
  anthropology: {
    label: 'Anthropology', standards: 'Social Science elective',
    units: [
      u('What anthropology studies', ['Compare the four fields of anthropology'], [
        ['Cultural anthropology', 'Study of living cultures.'], ['Archaeology', 'Study of past cultures through material remains.'], ['Biological anthropology', 'Study of human evolution and variation.'], ['Linguistic anthropology', 'Study of language in culture.'],
      ]),
      u('Human origins & culture', ['Explain human evolution and cultural practices'], [
        ['Hominin', 'Humans and their extinct close relatives.'], ['Ethnography', 'Detailed study of a culture through fieldwork.'], ['Cultural relativism', 'Understanding a culture on its own terms.'],
      ]),
    ],
  },
  ww2: {
    label: 'World War II History', standards: 'Social Science elective',
    units: [
      u('Road to war', ['Explain the rise of dictators and appeasement'], [
        ['Appeasement', 'Giving in to aggressor demands to avoid war (Munich, 1938).'], ['Fascism', 'Authoritarian nationalism led by a dictator.'], ['Blitzkrieg', '“Lightning war”: fast German attacks with tanks and planes.'],
      ]),
      u('The war in Europe & the Pacific', ['Trace major battles and turning points'], [
        ['Battle of Stalingrad', 'Turning point on the Eastern Front (1942–43).'], ['D-Day', 'Allied invasion of Normandy, June 6, 1944.'], ['Battle of Midway', 'Turning point in the Pacific (1942).'], ['Island hopping', 'US strategy of capturing selected Pacific islands.'],
      ]),
      u('Home front, Holocaust & legacy', ['Analyze the Holocaust and the war’s outcomes'], [
        ['Holocaust', 'Nazi genocide of six million Jews and millions of others.'], ['Rosie the Riveter', 'Symbol of women working in war industries.'], ['United Nations', 'International organization founded in 1945.'], ['Hiroshima and Nagasaki', 'Japanese cities hit by atomic bombs in August 1945.'],
      ]),
    ],
  },
};

export const SCI_SS = { ...SCI, ...SS };
