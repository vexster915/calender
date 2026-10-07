// Deeper study for Orbit's shorter outlines: standards-based goals (cited by code) and extra key terms
// added to existing units (`extend`, by unit index), plus whole new units. dvcurriculum.js merges these.
import { std, unit, ext, terms } from './stdkit.js';

const sci = (re, max = 4) => std('science', re, max);
const hss = (re, max = 4) => std('hss', re, max);
const e = (g, t = []) => ({ g: [g].flat(Infinity), t: terms(t) });
const APA = ext('American Psychological Association — National Standards for High School Psychology Curricula', 'https://www.apa.org/education-career/k12/national-standards');
const ASA = ext('American Sociological Association — National Standards for High School Sociology', 'https://www.asanet.org/wp-content/uploads/savvy/ASA%20HS%20Standards%20(Final).pdf');
const AAA = ext('American Anthropological Association — what anthropologists study', 'https://americananthro.org/learn-teach/what-is-anthropology/');
const JEA = ext('Journalism Education Association — curriculum and standards', 'https://jea.org/curriculum/');
const SPJ = ext('Society of Professional Journalists — Code of Ethics', 'https://www.spj.org/ethicscode.asp');
const NCSS = ext('NCSS College, Career & Civic Life (C3) Framework', 'https://www.socialstudies.org/standards/c3');
const ASL = ext('ACTFL World-Readiness Standards (apply to ASL)', 'https://www.actfl.org/educator-resources/world-readiness-standards-for-learning-languages');
const NCIDQ = ext('CIDQ — interior design competencies (NCIDQ)', 'https://www.cidq.org/');

export const AUG = {
  anatomy: { src: ['science'], extend: [
    e([sci(/^HS\+B\.L1U1\.7$/), 'Locate structures with directional terms, body planes and cavities'], ['Homeostasis|Keeping a stable internal environment (temperature, pH, glucose).', 'Sagittal / frontal / transverse planes|Divide the body into left–right, front–back and top–bottom.']),
    e(['Describe bone structure, joint types and the sliding filament model of contraction', 'Name the major bones and skeletal muscles'], ['Sliding filament theory|Actin and myosin filaments slide past each other to shorten a muscle.', 'Osteoblast / osteoclast|Cell that builds bone / cell that breaks down bone.']),
    e(['Explain how a neuron fires an action potential and signals across a synapse', 'Compare nervous and hormonal control using feedback loops'], ['Action potential|Electrical impulse traveling along a neuron.', 'Negative feedback|A response that reverses a change to restore balance (e.g. insulin lowering blood sugar).']),
    e(['Trace blood through the heart, lungs and body', 'Explain gas exchange in the alveoli'], ['Alveoli|Tiny air sacs where oxygen and carbon dioxide are exchanged.', 'Systole / diastole|Heart contraction / relaxation phases.']),
    e(['Follow food through mechanical and chemical digestion', 'Explain how nephrons filter blood', 'Compare innate and adaptive immunity'], ['Nephron|Filtering unit of the kidney.', 'Antibody|Protein made by B cells that tags pathogens.']),
  ], units: [
    unit('Cells, tissues & transport', [sci(/^(HS\.L1U1\.20|HS\+B\.L1U1\.[4-6])$/)], ['Organelle|A structure with a specific job inside a cell.', 'Epithelial tissue|Covers surfaces and lines organs.', 'Connective tissue|Supports and binds (bone, blood, cartilage).', 'Diffusion|Movement from high to low concentration.', 'Osmosis|Diffusion of water across a membrane.', 'Active transport|Moving substances against a gradient using ATP.']),
    unit('Integumentary system & disease', ['Describe the layers and functions of the skin', 'Connect body systems to common diseases and their treatment', sci(/^HS\.L1U3\.23$/, 1)], ['Epidermis|Outer skin layer.', 'Dermis|Skin layer with blood vessels, nerves and glands.', 'Melanin|Pigment that protects against UV light.', 'Pathogen|Disease-causing organism.', 'Vaccine|Trains the immune system to recognize a pathogen.', 'Diabetes|Disease of blood-sugar regulation.']),
  ] },
  earth: { src: ['science'], extend: [
    e([sci(/^(HS\.E2U1\.1[5-7]|HS\+E\.E2U1\.1[2-6])$/, 5)], ['Nebular theory|The solar system formed from a collapsing cloud of gas and dust.', 'Light-year|Distance light travels in one year.']),
    e([sci(/^(HS\.E1U1\.13|HS\+E\.E1U1\.[6-8])$/)], ['Convergent boundary|Plates move together (mountains, trenches).', 'Seafloor spreading|New crust forms at mid-ocean ridges.']),
    e(['Classify rocks by origin and explain the rock cycle', 'Use relative and absolute dating to sequence Earth history', sci(/^HS\+E\.E1U1\.7$/, 1)], ['Radiometric dating|Using radioactive decay to find an absolute age.', 'Law of superposition|Lower rock layers are older.']),
    e([sci(/^(HS\.E1U1\.11|HS\+E\.E1U1\.[1-3])$/)], ['Coriolis effect|Earth’s rotation deflects winds and currents.', 'Greenhouse effect|Gases trap heat in the atmosphere.']),
    e([sci(/^(HS\.E1U1\.12|HS\+E\.E1U1\.[45]|HS\.E1U3\.14|HS\+E\.E1U3\.9)$/, 5)], ['Aquifer|Underground layer of rock that holds water.', 'Weathering vs erosion|Breaking down rock vs. moving it.']),
  ], units: [
    unit('Earth & human activity (natural hazards and resources)', [sci(/^HS\+E\.E1U3\.1[01]$/), 'Evaluate how communities in Arizona prepare for drought, flooding and extreme heat'], ['Natural hazard|Earthquake, flood, volcano, drought or wildfire.', 'Renewable resource|Replenished naturally (solar, wind).', 'Nonrenewable resource|Limited supply (coal, oil, minerals).', 'Mitigation|Actions that reduce harm from hazards.', 'Monsoon|Seasonal wind shift bringing Arizona’s summer storms.', 'Sustainability|Meeting needs without harming future generations.']),
  ] },
  envsci: { src: ['science', ext('College Board — AP Environmental Science course overview (topic reference)', 'https://apcentral.collegeboard.org/courses/ap-environmental-science')], extend: [
    e([sci(/^HS\.L2U1\.19$|^HS\+B\.L2U1\.[13]$/)], ['Trophic level|An organism’s feeding position in a food chain.', '10% rule|About 10% of energy passes to the next trophic level.', 'Keystone species|Species with an outsized effect on its ecosystem.']),
    e([sci(/^HS\+B\.L(2U1\.1|4U1\.2)$/), 'Model population growth (exponential vs logistic)'], ['Carrying capacity|Largest population an environment can support.', 'Exponential growth|J-shaped growth without limits.', 'Logistic growth|S-shaped growth leveling at carrying capacity.']),
    e(['Explain how agriculture, mining and water use affect land and water', sci(/^HS\.E1U3\.14$/, 1)], ['Groundwater depletion|Pumping water faster than it recharges.', 'Desertification|Fertile land becoming desert.', 'Integrated pest management|Combining methods to control pests with fewer chemicals.']),
    e([sci(/^HS\.P4U3\.9$/, 1), 'Compare energy sources and pollution types'], ['Point-source pollution|Pollution from a single identifiable source.', 'Smog|Air pollution from vehicle and industrial emissions reacting in sunlight.', 'Eutrophication|Excess nutrients cause algal blooms and low oxygen.']),
    e([sci(/^HS\+E\.E1U1\.3$|^HS\+E\.E1U3\.11$/), sci(/^HS\.L2U3\.18$/, 1)], ['Carbon footprint|Total greenhouse gases caused by a person or activity.', 'Mitigation vs adaptation|Reducing climate change vs. adjusting to its effects.', 'Ocean acidification|Ocean pH dropping as it absorbs CO₂.']),
  ] },
  forensic: { src: ['science', ext('NIST Organization of Scientific Area Committees for Forensic Science', 'https://www.nist.gov/organization-scientific-area-committees-forensic-science')], extend: [
    e(['Secure and document a crime scene and maintain chain of custody', 'Distinguish physical, trace and biological evidence'], ['Locard’s exchange principle|Every contact leaves a trace.', 'Chain of custody|Documented record of who handled evidence.']),
    e(['Classify fingerprints and compare impressions', 'Explain class vs individual evidence'], ['Class evidence|Shared by a group (e.g. shoe brand).', 'Individual evidence|Linked to one source (e.g. fingerprint).', 'Minutiae|Ridge details used to match fingerprints.']),
    e([sci(/^HS\+B\.L3U1\.11$/, 1), 'Explain DNA profiling and blood typing'], ['STR analysis|DNA profiling comparing short tandem repeats.', 'Gel electrophoresis|Separating DNA fragments by size.', 'Blood spatter analysis|Interpreting bloodstain patterns.']),
    e(['Estimate time of death using body changes and insect evidence', 'Identify how poisons affect the body'], ['Rigor mortis|Stiffening of muscles after death.', 'Livor mortis|Pooling of blood after death.', 'Algor mortis|Cooling of the body after death.']),
  ], units: [
    unit('Trace evidence & chemistry', [sci(/^HS\.P1U1\.3$|^HS\+C\.P1U1\.5$/, 2), 'Analyze hair, fibers, glass and soil', 'Use chromatography and spectroscopy to identify substances'], ['Chromatography|Separating mixture components (e.g. inks).', 'Refractive index|How much a material bends light; used to compare glass.', 'Medulla|Central core of a hair.', 'Synthetic fiber|Man-made fiber such as nylon or polyester.', 'Spectroscopy|Identifying substances by the light they absorb or emit.', 'Presumptive test|Quick screening test (e.g. for blood).']),
    unit('Ballistics, documents & the courtroom', ['Match bullets and cartridge cases to firearms', 'Analyze handwriting and document alterations', 'Explain how forensic evidence is presented in court'], ['Rifling|Spiral grooves inside a gun barrel that mark bullets.', 'Striations|Scratches on a bullet from rifling.', 'Questioned document|A document whose authenticity is in doubt.', 'Expert witness|Specialist who testifies about evidence.', 'Frye/Daubert standard|Rules for admitting scientific evidence in court.', 'Forensic anthropology|Studying skeletal remains.']),
  ] },
  marine: { src: ['science', ext('NOAA Ocean Literacy Principles', 'https://oceanservice.noaa.gov/education/literacy.html')], extend: [
    e(['Describe ocean zones, seawater chemistry and currents', sci(/^HS\+E\.E1U1\.1$/, 1)], ['Salinity|Amount of dissolved salt in water.', 'Thermocline|Layer where water temperature drops rapidly with depth.', 'Upwelling|Deep, nutrient-rich water rising to the surface.']),
    e(['Classify marine organisms and their adaptations', sci(/^HS\+B\.L4U1\.14$/, 1)], ['Plankton|Drifting organisms (phytoplankton, zooplankton).', 'Nekton|Actively swimming animals.', 'Benthos|Organisms living on the sea floor.']),
    e([sci(/^HS\+B\.L(2U1\.[13]|4U1\.2)$/, 3)], ['Coral bleaching|Corals expel algae when stressed by heat.', 'Overfishing|Catching fish faster than they reproduce.', 'Marine protected area|Ocean region with limits on human activity.']),
  ], units: [
    unit('Ocean physics: waves, tides & currents', ['Explain how wind creates waves and the Moon causes tides', 'Describe global ocean circulation', sci(/^HS\.P4U1\.10$/, 1)], ['Tide|Regular rise and fall of sea level from the Moon’s and Sun’s gravity.', 'Spring / neap tide|Largest / smallest tidal range.', 'Gyre|Large circular ocean current system.', 'Thermohaline circulation|Global “conveyor belt” driven by temperature and salinity.', 'Tsunami|Wave caused by an undersea earthquake or landslide.', 'El Niño|Periodic warming of the Pacific that changes weather.']),
    unit('Coastal & deep-sea ecosystems', ['Describe threats to coastal ecosystems and ways to protect them', 'Compare intertidal zones, estuaries, kelp forests, coral reefs and the deep sea', 'Explain chemosynthesis at hydrothermal vents'], ['Intertidal zone|Shore area between high and low tide.', 'Estuary|Where river water meets the sea.', 'Kelp forest|Underwater forest of large brown algae.', 'Coral reef|Ecosystem built by coral polyps.', 'Hydrothermal vent|Deep-sea hot spring.', 'Chemosynthesis|Making food from chemicals instead of sunlight.']),
  ] },
  ela9: { src: ['ela910'], extend: [
    e([std('ela910', /^9-10\.RL\.[13]$/)]),
    e([std('ela910', /^9-10\.RL\.4$|^9-10\.L\.5$/)]),
    e([std('ela910', /^9-10\.RL\.[57]$/)]),
    e([std('ela910', /^9-10\.RL\.(2|10)$/)]),
    e([std('ela910', /^9-10\.(RI\.8|W\.1)$/)]),
    e([std('ela910', /^9-10\.(W\.[78]|L\.[12])$/, 3)]),
  ] },
  alg1: { src: ['alg1'], extend: [
    e([std('alg1', /^A1\.(A-SSE\.A\.1|A-CED\.A\.1|A-REI\.B\.3)$/)]),
    e([std('alg1', /^A1\.F-(IF\.A\.[12]|IF\.B\.6|LE\.A\.1)$/, 3)]),
    e([std('alg1', /^A1\.A-REI\.C\.[56]$|^A1\.A-REI\.D\.12$/)]),
    e([std('alg1', /^A1\.F-LE\.(A\.[23]|B\.5)$/)]),
    e([std('alg1', /^A1\.A-(APR\.A\.1|SSE\.B\.3)$/)]),
    e([std('alg1', /^A1\.(A-APR\.B\.3|F-IF\.C\.[78])$/)]),
    e([std('alg1', /^A1\.S-ID\.(A\.[1-3]|C\.9)$/, 3)]),
  ] },
  geo: { src: ['geo'], extend: [
    e([std('geo', /^G\.G-CO\.A\.[2-5]$/, 3)]),
    e([std('geo', /^G\.G-CO\.(C\.9|D\.12)$/)]),
    e([std('geo', /^G\.G-CO\.(B\.[78]|C\.10)$/)]),
    e([std('geo', /^G\.G-SRT\.(A\.[23]|C\.8)$/)]),
    e([std('geo', /^G\.G-C\.(A\.[23]|B\.5)$/)]),
    e([std('geo', /^G\.G-(GMD\.A\.3|GMD\.B\.4|MG\.A\.1)$/)]),
  ] },
  alg2: { src: ['alg2'], extend: [
    e([std('alg2', /^A2\.F-(BF\.B\.3|IF\.C\.9)$/)]),
    e([std('alg2', /^A2\.N-CN\.(A\.1|C\.7)$|^A2\.A-SSE\.B\.3$/)], ['Discriminant|b² − 4ac: tells the number and type of roots.', 'Vertex form|y = a(x − h)² + k.']),
    e([std('alg2', /^A2\.A-APR\.(B\.[23]|C\.4)$/)], ['Multiplicity|How many times a root repeats.', 'Synthetic division|Shortcut for dividing by x − a.']),
    e([std('alg2', /^A2\.A-(APR\.D\.6|REI\.A\.2)$/)], ['Extraneous solution|A solution that fails the original equation.', 'Radical equation|Equation with a variable under a root.']),
    e([std('alg2', /^A2\.F-LE\.(A\.4|B\.5)$|^A2\.F-BF\.B\.4$/)]),
  ] },
  finmath: { src: ['hss', 'qr'], extend: [
    e([std('qr', /^QR\.FR\.1$/), std('hss', /^HS\.E1\.1$/)], ['Form 1040|Federal individual income tax return.']),
    e([std('hss', /^HS\.E1\.2$/), std('qr', /^QR\.FR\.2$/)], ['Overdraft|Spending more than is in your account.', 'Emergency fund|Savings for unexpected expenses (3–6 months of costs).']),
    e([std('hss', /^HS\.E1\.3$/)], ['APR|Annual percentage rate: yearly cost of borrowing.']),
    e([std('hss', /^HS\.E1\.4$/), std('qr', /^QR\.(FR\.3|CR\.1)$/)]),
    e([std('hss', /^HS\.E1\.5$/), std('qr', /^QR\.FR\.4$/)], ['Premium|Regular payment for insurance.', 'Deductible|Amount you pay before insurance pays.']),
  ] },
  biology: { src: ['science'], extend: [
    e([sci(/^HS\+B\.L1U1\.7$/, 1)]),
    e([sci(/^HS\+B\.L1U1\.[46]$/)]),
    e([sci(/^HS\.L2U1\.21$|^HS\+B\.L2U1\.8$/)]),
    e([sci(/^HS\+B\.L3U1\.11$|^HS\.L3U1\.25$/)]),
    e([sci(/^HS\.L3U1\.24$|^HS\+B\.L3U1\.10$/)]),
    e([sci(/^HS\.L4U1\.2[78]$|^HS\+B\.L4U1\.14$/, 3)]),
    e([sci(/^HS\.L2U1\.19$|^HS\+B\.L2U1\.1$/)]),
  ] },
  chemistry: { src: ['science'], extend: [
    e(['Use significant figures, scientific notation and dimensional analysis', sci(/^HS\+C\.P1U1\.7$/, 1)]),
    e([sci(/^HS\.P1U1\.1$|^HS\+C\.P1U1\.[12]$/, 2)]),
    e([sci(/^HS\.P1U1\.2$|^HS\+C\.P1U1\.4$/)]),
    e([sci(/^HS\+C\.P1U1\.[57]$/)]),
    e([sci(/^HS\+C\.P1U1\.3$|^HS\.P1U1\.3$/)]),
    e([sci(/^HS\+C\.P1U1\.6$|^HS\.P1U3\.4$|^HS\+C\.P1U3\.8$/, 2)]),
  ] },
  physics: { src: ['science'], extend: [
    e([sci(/^HS\.P3U1\.6$/, 1), 'Solve constant-acceleration problems with kinematic equations'], []),
    e([sci(/^HS\+Phy\.P3U1\.3$|^HS\.P3U2\.7$/)], []),
    e([sci(/^HS\+Phy\.P3U1\.4$|^HS\+Phy\.P4U1\.6$/)], []),
    e([sci(/^HS\+Phy\.P3U1\.2$|^HS\.P2U1\.5$/)], ['Centripetal force|Net force toward the center of circular motion.', 'Universal gravitation|F = Gm₁m₂/r².', 'Orbital period|Time for one orbit.']),
    e([sci(/^HS\.P4U1\.10$/, 1)], []),
    e([sci(/^HS\+Phy\.P4U1\.8$|^HS\+Phy\.P2U1\.1$/)], []),
  ] },
  econ: { src: ['hss', ext('Council for Economic Education — National Standards', 'https://www.councilforeconed.org/resource/voluntary-national-content-standards-in-economics/')], extend: [
    e([hss(/^HS\.E2\.[1-3]$/)], ['Marginal analysis|Comparing the extra benefit and extra cost of one more unit.', 'Incentive|Reward or penalty that motivates behavior.']),
    e([hss(/^HS\.E3\.[12]$/)], ['Equilibrium|Price where quantity demanded equals quantity supplied.']),
    e([hss(/^HS\.E3\.[34]$/)], ['Monopoly|Market with a single seller.', 'Oligopoly|Market with a few large sellers.', 'Entrepreneur|Person who starts a business and takes its risks.']),
    e([hss(/^HS\.E4\.[1-4]$/)], ['Inflation|General rise in prices.']),
    e([hss(/^HS\.E1\.[1-5]$/, 5)], ['Credit score|Number showing creditworthiness.', 'Compound interest|Interest earned on interest.']),
  ], units: [
    unit('Global economy & trade', [hss(/^HS\.E5\.[1-4]$/)], ['Comparative advantage|Producing a good at a lower opportunity cost than others.', 'Tariff|Tax on imports.', 'Quota|Limit on the amount of a good imported.', 'Exchange rate|Value of one currency in terms of another.', 'Trade deficit|Imports exceed exports.', 'Free trade agreement|Pact reducing trade barriers (e.g. USMCA).']),
  ] },
  gov: { src: ['hss'], extend: [
    e([hss(/^HS\.C1\.[1-4]$/)], ['Popular sovereignty|Power comes from the people.', 'Social contract|People give up some freedoms for government protection.']),
    e([hss(/^HS\.C3\.[14]$/), hss(/^HS\.C2\.3$/, 1)], ['Federalism|Power divided between national and state governments.', 'Checks and balances|Each branch can limit the others.']),
    e([hss(/^HS\.C4\.[14]$/)], ['Judicial review|Courts can strike down unconstitutional laws (Marbury v. Madison).', 'Veto|President’s rejection of a bill.']),
    e([hss(/^HS\.C2\.[1246]$/)], ['Due process|Fair legal procedures required before government takes life, liberty or property.', 'Equal protection|14th Amendment guarantee of equal treatment under law.']),
    e([hss(/^HS\.C2\.5$|^HS\.C3\.2$/), 'Explain Arizona’s initiative, referendum and recall powers'], ['Initiative|Citizens propose laws by petition.', 'Referendum|Voters approve or reject a law.', 'Recall|Voters remove an official before the term ends.']),
  ], units: [
    unit('Elections, parties, media & policy', [hss(/^HS\.C3\.3$|^HS\.C4\.[2357]$/, 5)], ['Primary election|Election to choose a party’s candidate.', 'Electoral College|System of electors that chooses the president.', 'Interest group|Organization that tries to influence policy.', 'PAC|Political action committee that raises money for candidates.', 'Public policy|Government course of action on an issue.', 'Media bias|Slant in news coverage.']),
  ] },
  us: { src: ['hss'], extend: [
    e([hss(/^HS\.H1\.[36]$/), hss(/^HS\.C2\.3$/, 1)]),
    e([hss(/^HS\.H2\.[13]$|^HS\.H3\.5$/)]),
    e([hss(/^HS\.H1\.7$|^HS\.H3\.[13]$/)]),
    e([hss(/^HS\.H2\.4$|^HS\.E4\.2$/)]),
    e([hss(/^HS\.H4\.[14]$|^HS\.H2\.2$/)]),
    e([hss(/^HS\.SP[134]\.[1-3]$/, 4)]),
  ] },
  world: { src: ['hss'], extend: [
    e([hss(/^HS\.H1\.[125]$/)]),
    e([hss(/^HS\.H1\.[34]$|^HS\.H3\.2$/)]),
    e([hss(/^HS\.H4\.2$|^HS\.G3\.1$/)]),
    e([hss(/^HS\.H3\.[13]$|^HS\.H1\.7$/)]),
    e([hss(/^HS\.H2\.[1-4]$/)]),
    e([hss(/^HS\.SP[1-4]\.[12]$/, 4)]),
  ] },
  ww2: { src: ['hss'], extend: [
    e([hss(/^HS\.H2\.1$|^HS\.H3\.2$/), 'Explain how the Treaty of Versailles, the Depression and fascism led to war'], ['Treaty of Versailles|1919 treaty ending WWI that punished Germany.', 'Appeasement|Giving in to demands to avoid conflict (Munich, 1938).', 'Fascism|Authoritarian nationalism (Mussolini, Hitler).']),
    e([hss(/^HS\.H2\.3$/, 1), 'Trace turning points: Stalingrad, Midway, D-Day, the atomic bombs'], ['Blitzkrieg|“Lightning war”: fast, combined attacks.', 'Island hopping|U.S. strategy of capturing key Pacific islands.']),
    e([hss(/^HS\.H3\.4$|^HS\.H4\.1$/), 'Describe Arizona’s role: Navajo Code Talkers, POW and Japanese American incarceration camps'], ['Navajo Code Talkers|Diné Marines who used their language as an unbreakable code.', 'Executive Order 9066|1942 order leading to incarceration of Japanese Americans (incl. Poston and Gila River in Arizona).', 'Nuremberg Trials|Trials of Nazi leaders for war crimes.']),
  ], units: [
    unit('The war’s aftermath', [hss(/^HS\.H2\.2$|^HS\.C3\.4$/), 'Explain how WWII led to the United Nations and the Cold War'], ['United Nations|International organization founded in 1945 to keep peace.', 'Marshall Plan|U.S. aid to rebuild Western Europe.', 'Iron Curtain|Division between Soviet-controlled East and the West.', 'GI Bill|Benefits for returning veterans (education, home loans).', 'Universal Declaration of Human Rights|1948 UN statement of basic rights.', 'Cold War|U.S.–Soviet rivalry from 1947 to 1991.']),
    unit('Historians’ debates & sources', [hss(/^HS\.SP3\.[3-6]$/)], ['Primary source|First-hand evidence (letters, photos, propaganda).', 'Propaganda|Information used to promote a cause.', 'Historiography|How historians’ interpretations change.', 'Oral history|Recorded memories of participants.', 'Corroboration|Checking a source against others.', 'Contextualization|Placing a source in its time and place.']),
  ] },
  law: { src: ['hss', NCSS], extend: [
    e([hss(/^HS\.C4\.1$|^HS\.C1\.4$/), 'Distinguish criminal, civil, constitutional and administrative law'], ['Civil law|Disputes between private parties.', 'Precedent (stare decisis)|Following earlier court decisions.']),
    e(['Trace a case from arrest through trial, sentencing and appeal', 'Compare adult and juvenile justice'], ['Arraignment|First court appearance where charges are read and a plea entered.', 'Plea bargain|Agreement to plead guilty for a lesser charge or sentence.']),
    e([hss(/^HS\.C2\.3$/, 1), 'Apply the 4th, 5th, 6th and 8th Amendments to case scenarios'], ['Miranda rights|Warnings required before custodial questioning.', 'Exclusionary rule|Illegally obtained evidence cannot be used.']),
  ], units: [
    unit('Civil law, torts & contracts', ['Analyze a case scenario and identify the legal issue', 'Identify the elements of a valid contract', 'Explain negligence and other torts'], ['Contract|A legally enforceable agreement (offer, acceptance, consideration).', 'Tort|A civil wrong causing harm (e.g. negligence).', 'Negligence|Failure to use reasonable care.', 'Plaintiff|Person who brings a lawsuit.', 'Defendant|Person being sued or accused.', 'Small claims court|Court for minor civil disputes.']),
    unit('Landmark cases & the courts', [hss(/^HS\.C3\.[12]$/), 'Summarize landmark Supreme Court cases on rights'], ['Marbury v. Madison|Established judicial review (1803).', 'Gideon v. Wainwright|Right to a lawyer in felony cases (1963).', 'Miranda v. Arizona|Arizona case requiring Miranda warnings (1966).', 'Mapp v. Ohio|Applied the exclusionary rule to states (1961).', 'Tinker v. Des Moines|Students keep free-speech rights at school (1969).', 'New Jersey v. T.L.O.|School searches need only reasonable suspicion (1985).']),
  ] },
  psych: { src: [APA], extend: [
    e(['Compare research methods and explain ethical guidelines', 'Identify brain structures and neurotransmitters and their functions'], ['Correlation|Relationship between variables (not causation).', 'Neurotransmitter|Chemical messenger between neurons (dopamine, serotonin).']),
    e(['Compare classical and operant conditioning and observational learning', 'Explain encoding, storage and retrieval'], ['Classical conditioning|Learning by association (Pavlov).', 'Operant conditioning|Learning from consequences (Skinner).']),
    e(['Describe cognitive, social and moral development across the lifespan', 'Compare major theories of personality'], ['Big Five|Openness, conscientiousness, extraversion, agreeableness, neuroticism.', 'Attachment|Emotional bond between infant and caregiver.', 'Kohlberg’s stages|Levels of moral reasoning.']),
    e(['Describe major categories of psychological disorders', 'Compare treatment approaches'], ['DSM-5-TR|Manual used to diagnose mental disorders.', 'Cognitive behavioral therapy|Changing unhelpful thoughts and behaviors.']),
  ], units: [
    unit('Sensation, perception & consciousness', ['Explain how drugs and sleep loss affect consciousness', 'Explain how the senses detect and the brain interprets stimuli', 'Describe sleep stages and states of consciousness'], ['Sensation|Detecting stimuli.', 'Perception|Interpreting sensory information.', 'Absolute threshold|Weakest stimulus detected half the time.', 'Gestalt principles|Rules for organizing perceptions.', 'REM sleep|Sleep stage with rapid eye movement and vivid dreams.', 'Circadian rhythm|24-hour biological clock.']),
    unit('Social psychology', ['Apply social psychology concepts to real situations', 'Explain conformity, obedience and group influence', 'Describe attitudes, attribution and prejudice'], ['Conformity|Adjusting behavior to match a group (Asch).', 'Obedience|Following authority (Milgram).', 'Fundamental attribution error|Overestimating personality and underestimating situation.', 'Bystander effect|Less likely to help when others are present.', 'Cognitive dissonance|Discomfort from conflicting beliefs and actions.', 'Groupthink|Seeking harmony over good decisions.']),
  ] },
  sociology: { src: [ASA], extend: [
    e(['Explain the sociological imagination and major theoretical perspectives', 'Describe sociological research methods'], ['Sociological imagination|Seeing links between personal troubles and public issues (C. Wright Mills).', 'Functionalism|Society as parts working together.', 'Conflict theory|Society shaped by inequality and power struggles.']),
    e(['Describe the agents of socialization', 'Explain norms, values and deviance'], ['Agents of socialization|Family, school, peers, media.', 'Norm|Expected behavior in a group.', 'Deviance|Violating social norms.']),
    e(['Analyze social stratification by class, race and gender', 'Describe how institutions such as family, education and religion work'], ['Social stratification|Ranking of groups in a hierarchy.', 'Social mobility|Movement between social classes.', 'Institution|Established structure meeting social needs.']),
  ], units: [
    unit('Groups & social structure', ['Analyze group dynamics in a familiar organization', 'Distinguish primary and secondary groups', 'Explain roles, statuses and organizations'], ['Primary group|Small, close, long-lasting group (family, friends).', 'Secondary group|Larger, goal-oriented group.', 'Status|A social position.', 'Role|Expected behavior for a status.', 'Bureaucracy|Formal organization with rules and hierarchy.', 'In-group / out-group|Groups we belong to / do not belong to.']),
    unit('Social change & collective behavior', ['Research a social movement and its outcomes', 'Explain causes of social change and social movements', 'Analyze population, urbanization and technology'], ['Social movement|Organized effort to create or resist change.', 'Collective behavior|Unplanned group behavior (fads, crowds).', 'Urbanization|Growth of cities.', 'Globalization|Increasing worldwide interconnection.', 'Demography|Study of population.', 'Diffusion|Spread of cultural traits.']),
  ] },
  anthropology: { src: [AAA, 'hss'], extend: [
    e(['Describe the four fields of anthropology', 'Explain ethnographic fieldwork and cultural relativism'], ['Four fields|Cultural, biological, linguistic anthropology and archaeology.', 'Cultural relativism|Understanding a culture on its own terms.']),
    e(['Explain evidence for human evolution', 'Describe how culture is learned, shared and adaptive', hss(/^HS\.H1\.5$/, 1)], ['Hominin|Humans and their extinct close relatives.', 'Bipedalism|Walking on two legs.', 'Enculturation|Learning one’s own culture.']),
  ], units: [
    unit('Archaeology', ['Explain why artifacts should stay in context and laws that protect sites', 'Explain how archaeologists excavate, date and interpret sites', 'Describe Arizona’s ancestral cultures'], ['Artifact|Object made or used by humans.', 'Excavation|Systematic digging of a site.', 'Stratigraphy|Study of soil and rock layers.', 'Carbon-14 dating|Dating organic remains by radioactive decay.', 'Hohokam|Ancestral people of the Phoenix area known for canal irrigation.', 'Ancestral Puebloans|Builders of cliff dwellings in the Four Corners.']),
    unit('Language & culture', ['Compare how two languages express time, politeness or family', 'Explain how language shapes and reflects culture', 'Describe language change and endangered languages'], ['Linguistic anthropology|Study of language in social life.', 'Sapir-Whorf hypothesis|Idea that language influences thought.', 'Dialect|Regional or social variety of a language.', 'Endangered language|Language at risk of no longer being spoken.', 'Code-switching|Moving between languages or dialects.', 'Phoneme|Smallest unit of sound that changes meaning.']),
    unit('Kinship, economy & belief', ['Compare a culture’s practices to your own using cultural relativism', 'Compare kinship systems, economic exchange and political organization', 'Describe ritual and belief systems'], ['Kinship|Social relationships based on family ties.', 'Matrilineal / patrilineal|Descent traced through the mother / father.', 'Reciprocity|Exchange of goods and favors.', 'Band, tribe, chiefdom, state|Levels of political organization.', 'Rite of passage|Ritual marking a life transition.', 'Shaman|Religious specialist who mediates with spirits.']),
  ] },
  ela10: { src: ['ela910'], extend: [
    e([std('ela910', /^9-10\.RL\.[26]$/)], ['Cultural context|The beliefs and events surrounding a text.']),
    e([std('ela910', /^9-10\.RL\.[35]$/)], ['Hubris|Excessive pride leading to downfall.', 'Catharsis|Emotional release felt by an audience.']),
    e([std('ela910', /^9-10\.RI\.[689]$/, 3)], []),
    e([std('ela910', /^9-10\.W\.[78]$/)], []),
  ], units: [
    unit('Grammar, usage & language', [std('ela910', /^9-10\.L\.[1-5]$/, 5)], ['Parallel structure|Using the same grammatical form for items in a series.', 'Semicolon|Joins two closely related independent clauses.', 'Colon|Introduces a list, quotation or explanation.', 'Participial phrase|Phrase starting with a participle that acts as an adjective.', 'Euphemism|Mild word replacing a harsh one.', 'Oxymoron|Two contradictory words together (deafening silence).']),
  ] },
  ela11: { src: ['ela1112'], extend: [
    e([std('ela1112', /^11-12\.RI\.9$/)], ['Puritan plain style|Simple, direct writing of the Puritans.', 'Rhetorical appeal|Ethos, pathos or logos.']),
    e([std('ela1112', /^11-12\.RL\.[24]$/)], ['Self-reliance|Emerson’s idea of trusting oneself.', 'Nature as teacher|Transcendentalist belief in learning from nature.']),
    e([std('ela1112', /^11-12\.RL\.[35]$/)], ['Stream of consciousness|Narration following a character’s thoughts.', 'Lost Generation|Writers disillusioned after WWI.']),
    e([std('ela1112', /^11-12\.RL\.[69]$/)], ['Harlem Renaissance|1920s flowering of African American art and literature.', 'American Dream|Ideal of success through hard work.', 'Satire|Humor that criticizes society.']),
    e([std('ela1112', /^11-12\.W\.[17]$/)]),
  ] },
  ela12: { src: ['ela1112'], extend: [
    e([std('ela1112', /^11-12\.RL\.[26]$/)], ['Archetype|A universal character, situation or symbol.', 'Allegory|Story with a hidden moral or political meaning.', 'Epic|Long narrative poem about a hero.']),
    e([std('ela1112', /^11-12\.RL\.[35]$/)], ['Elizabethan era|Reign of Elizabeth I (1558–1603), Shakespeare’s time.', 'Romantic poets|Wordsworth, Coleridge, Keats, Shelley, Byron.']),
    e([std('ela1112', /^11-12\.W\.[245]$/)], ['Personal statement|College application essay about you.', 'Rhetorical analysis|Essay on how an author persuades.']),
    e([std('ela1112', /^11-12\.W\.[78]$/)]),
  ], units: [
    unit('Speaking, listening & media', [std('ela1112', /^11-12\.SL\.[1-6]$/, 5)], ['Socratic seminar|Text-based discussion led by questions.', 'Rhetoric|The art of persuasion.', 'Media literacy|Analyzing and evaluating media messages.', 'Diction|Word choice.', 'Syntax|Sentence structure.', 'Credibility|Trustworthiness of a speaker or source.']),
  ] },
  creative: { src: ['ela1112'], extend: [
    e([std('ela1112', /^11-12\.W\.3$/), 'Develop characters through action, dialogue and detail'], ['Show, don’t tell|Revealing through action and detail instead of stating.', 'Point of view|Who tells the story.', 'Dialogue tags|Said, asked and similar words attributing speech.']),
    e([std('ela1112', /^11-12\.L\.5$/), 'Write in fixed and free forms'], ['Free verse|Poetry without regular rhyme or meter.', 'Sonnet|14-line poem.', 'Haiku|Japanese form of 5-7-5 syllables.']),
  ], units: [
    unit('Creative nonfiction & memoir', ['Revise a memoir piece for voice and reflection', 'Shape real experience into a narrative', std('ela1112', /^11-12\.W\.3[a-e]?$/, 1)], ['Memoir|True story from the writer’s life.', 'Personal essay|Reflective nonfiction exploring an idea.', 'Scene vs summary|Showing a moment in detail vs. condensing time.', 'Reflection|The writer’s insight on events.', 'Narrative arc|Shape of rising tension and resolution.', 'Voice|The writer’s distinctive personality on the page.']),
    unit('Drama & screenwriting', ['Revise a scene so conflict and subtext drive it', 'Format a short script correctly', 'Write scenes with stage directions or screenplay format'], ['Monologue|Long speech by one character.', 'Stage directions|Instructions for movement and setting.', 'Subtext|Meaning beneath what characters say.', 'Slugline|Screenplay scene heading (INT./EXT.).', 'Conflict|Struggle that drives a scene.', 'Beat|Small unit of action or change in a scene.']),
    unit('Workshop, revision & publishing', ['Give and use specific workshop feedback', std('ela1112', /^11-12\.W\.[56]$/)], ['Workshop|Group feedback on drafts.', 'Revision|Re-seeing and reshaping a draft.', 'Editing|Correcting errors and polishing sentences.', 'Literary magazine|Publication of creative work.', 'Submission|Sending work to be considered for publication.', 'Portfolio|Collection of your best work.']),
  ] },
  speech: { src: ['ela910', 'ela1112'], extend: [
    e([std('ela1112', /^11-12\.SL\.4$/), 'Choose a purpose: inform, persuade or entertain', 'Research and outline a speech'], ['Speaking outline|Brief notes used while speaking.', 'Hook|Attention-getting opening.', 'Thesis|Central idea of the speech.']),
    e([std('ela1112', /^11-12\.SL\.[56]$/), 'Use voice, gestures and eye contact effectively'], ['Vocal variety|Changing pitch, rate and volume.', 'Filler words|Um, uh, like: reduce them.', 'Extemporaneous|Prepared but delivered from brief notes.']),
  ], units: [
    unit('Persuasive speaking & argument', ['Deliver a persuasive speech with credible evidence', std('ela1112', /^11-12\.SL\.3$/), 'Use Monroe’s motivated sequence'], ['Ethos|Appeal to credibility.', 'Pathos|Appeal to emotion.', 'Logos|Appeal to logic.', 'Monroe’s motivated sequence|Attention, need, satisfaction, visualization, action.', 'Fallacy|Flawed reasoning.', 'Rebuttal|Response to an opposing argument.']),
    unit('Listening, discussion & debate', ['Take part in a structured debate', std('ela910', /^9-10\.SL\.[12]$/)], ['Active listening|Focusing on and responding to a speaker.', 'Cross-examination|Questioning an opponent in debate.', 'Resolution|Statement debated in a formal debate.', 'Affirmative / negative|Sides for and against the resolution.', 'Moderator|Person who guides a discussion.', 'Constructive criticism|Specific, helpful feedback.']),
    unit('Special-occasion & group presentations', ['Deliver a group presentation with clear roles', 'Deliver impromptu, commemorative and group speeches', 'Design effective visual aids'], ['Impromptu speech|Speech with little preparation.', 'Toast|Short speech honoring someone.', 'Eulogy|Speech honoring someone who died.', 'Visual aid|Slide, chart or object supporting a talk.', 'Panel discussion|Group presentation with questions.', 'Speech anxiety|Nervousness about speaking; managed with practice and breathing.']),
  ] },
  journalism: { src: [JEA, SPJ, 'ela1112'], extend: [
    e([std('ela1112', /^11-12\.W\.2$/), 'Write leads and organize stories in inverted-pyramid form', 'Conduct interviews and attribute quotes'], ['Inverted pyramid|Most important facts first.', 'Attribution|Telling who said or provided information.']),
    e(['Apply the SPJ Code of Ethics: seek truth, minimize harm, act independently, be accountable', 'Explain libel, privacy and student press rights'], ['Libel|Published false statement that damages reputation.', 'Hazelwood v. Kuhlmeier|1988 case allowing school review of school-sponsored student publications.', 'Prior review|Administrator reads content before publication.', 'Fact-checking|Verifying every fact before publication.']),
  ], units: [
    unit('Story types & beats', ['Pitch story ideas and plan coverage for your beat', 'Write a review or column with a clear opinion', 'Write news, feature, sports, opinion and review stories'], ['Feature story|In-depth human-interest story.', 'Editorial|Opinion piece representing the publication.', 'Column|Regular opinion piece by one writer.', 'Beat|A topic area a reporter covers.', 'News peg|Timely reason a story runs now.', 'Sidebar|Short related story beside a main story.']),
    unit('Photojournalism & design', ['Write headlines that are accurate and concise', 'Compose news photos and write captions', 'Lay out pages with headlines and visual hierarchy'], ['Cutline|Caption under a photo.', 'Rule of thirds|Composition placing subjects on grid lines.', 'Headline|Short title summarizing a story.', 'Dominant element|Largest visual on a page.', 'Modular design|Layout in rectangular blocks.', 'Pull quote|Quote enlarged as a design element.']),
    unit('Multimedia, yearbook & publishing', ['Produce a short multimedia story', std('ela1112', /^11-12\.W\.6$/), 'Plan coverage and meet deadlines'], ['Ladder|Page-by-page plan of a yearbook.', 'Spread|Two facing pages.', 'Deadline|Date work must be finished.', 'Social media coverage|Live updates and posts for an audience.', 'Podcast|Episodic audio program.', 'Analytics|Data on readers and engagement.']),
  ] },
  cinema: { src: ['ela1112', 'media_arts'], extend: [
    e([std('ela1112', /^11-12\.RL\.7$/), arts1('respond')], ['Mise-en-scène|Everything placed in the frame: set, lighting, costume, actors.', 'Montage|Editing shots together to create meaning.', 'Diegetic sound|Sound that exists in the story world.']),
    e([arts1('connect'), 'Compare major film movements'], ['German Expressionism|1920s style of distorted sets and shadows.', 'Italian Neorealism|Post-WWII films on real locations with everyday people.', 'French New Wave|1960s films breaking conventions.', 'Film noir|Dark crime films of the 1940s–50s.']),
  ], units: [
    unit('Narrative & screenwriting', ['Analyze plot structure and character in film', std('ela1112', /^11-12\.RL\.[35]$/)], ['Three-act structure|Setup, confrontation, resolution.', 'Protagonist|Main character.', 'Inciting incident|Event that starts the main conflict.', 'Screenplay|Script for a film.', 'Subtext|Meaning beneath dialogue.', 'Non-linear narrative|Story told out of chronological order.']),
    unit('Cinematography & editing', ['Analyze a scene shot by shot', 'Create a short sequence that uses editing to build meaning', 'Explain how camera, lighting and editing create meaning'], ['Shot types|Wide, medium, close-up.', 'Camera angle|High, low, eye level, Dutch.', 'Tracking shot|Camera moves alongside the action.', 'Low-key lighting|High contrast, many shadows.', 'Match cut|Cut linking two shots by visual similarity.', 'Continuity editing|Editing for smooth, logical action.']),
    unit('Film criticism & history', [std('ela1112', /^11-12\.W\.[19]$/), 'Write a film review and analytical essay'], ['Auteur theory|The director as a film’s author.', 'Genre|Category such as western, horror, musical.', 'Silent era|Films before synchronized sound (before about 1927).', 'Hollywood studio system|1920s–50s era of studio-controlled filmmaking.', 'Film review|Evaluation of a film for an audience.', 'Representation|How groups are portrayed on screen.']),
  ] },
  comptech: { src: ['edtech', 'cs'], extend: [
    e([std('edtech', /^9-12\.2\.[a-d]$/)], ['File management|Organizing files in folders with clear names.', 'Cloud storage|Saving files online.']),
  ], units: [
    unit('Computer hardware & operating systems', [std('cs', /^HS\.CS\.(D|HS|T)\.1$/)], ['CPU|Processor that executes instructions.', 'RAM|Short-term working memory.', 'Storage (SSD/HDD)|Long-term data storage.', 'Operating system|Software managing hardware and apps (Windows, macOS, ChromeOS).', 'Input / output device|Keyboard, mouse / monitor, printer.', 'Driver|Software that lets the OS use a device.']),
    unit('Productivity software', ['Build a spreadsheet with formulas and a chart', std('edtech', /^9-12\.6\.[ac]$/)], ['Word processor|Program for documents (Word, Google Docs).', 'Spreadsheet|Program for data and formulas (Excel, Sheets).', 'Formula|Spreadsheet calculation starting with =.', 'Cell reference|Address like B3.', 'Presentation software|Program for slides.', 'Template|Pre-formatted starting file.']),
    unit('Networks, internet & security', [std('cs', /^HS\.NI\.(C\.[12]|NCO\.1)$/)], ['Internet|Global network of networks.', 'Router|Device that forwards data between networks.', 'IP address|Device’s network address.', 'Malware|Harmful software.', 'Firewall|Filters network traffic.', 'Encryption|Scrambling data so only authorized users can read it.']),
    unit('Data & computational thinking', [std('cs', /^HS\.DA\.(CVT|S|IM)\.\d$/, 4)], ['Binary|Base-2 number system.', 'Bit / byte|Binary digit / 8 bits.', 'Data visualization|Chart or graph showing data.', 'Algorithm|Step-by-step instructions.', 'Abstraction|Hiding detail to manage complexity.', 'Database|Organized collection of data.']),
  ] },
  interior: { src: [NCIDQ], extend: [
    e(['Apply the elements and principles of design to rooms', 'Use color schemes and the color wheel'], ['Monochromatic scheme|Tints and shades of one hue.', 'Complementary scheme|Opposite colors on the wheel.', 'Scale and proportion|Size relationships between objects and space.']),
    e(['Draw floor plans to scale', 'Plan traffic patterns and furniture arrangement'], ['Floor plan|Overhead drawing of a space.', 'Traffic pattern|Path people follow through a space.', 'CAD|Computer-aided design software.']),
  ], units: [
    unit('Housing, codes & accessibility', ['Read a basic building code requirement and apply it to a plan', 'Compare housing types and building codes', 'Design for accessibility (ADA, universal design)'], ['Universal design|Design usable by everyone.', 'ADA|Americans with Disabilities Act.', 'Building code|Minimum legal standards.', 'Egress|Way out of a building.', 'Load-bearing wall|Wall supporting structure above.', 'Zoning|Rules for how land may be used.']),
    unit('Materials, furniture & finishes', ['Estimate quantities and costs of materials', 'Select flooring, wall treatments, textiles and furniture', 'Compare furniture styles'], ['Hardwood vs laminate|Solid wood vs. printed composite flooring.', 'Textile|Fabric used in furnishings.', 'Window treatment|Curtains, blinds or shades.', 'Mid-century modern|1945–1970 style of clean lines and organic shapes.', 'Sustainable material|Renewable or recycled material.', 'Finish schedule|List of finishes for each room.']),
    unit('Lighting & kitchen/bath design', ['Plan a bathroom layout with required clearances', 'Plan ambient, task and accent lighting', 'Apply the kitchen work triangle'], ['Ambient lighting|General room lighting.', 'Task lighting|Light for specific activities.', 'Accent lighting|Light highlighting features.', 'Work triangle|Layout linking sink, stove and refrigerator.', 'Lumen|Measure of light output.', 'Color temperature|Warmth or coolness of light (Kelvin).']),
    unit('Clients, presentation & careers', ['Interpret a client brief and budget', 'Present a design board', std('proskills', /^1\.A$|^9\.C$/)], ['Client brief|Statement of client needs, style and budget.', 'Mood board|Collage of colors, materials and images.', 'Rendering|Realistic drawing of a design.', 'Merchandising|Displaying products to encourage sales.', 'NCIDQ|Professional interior design certification exam.', 'Budget|Planned costs.']),
  ] },
  french12: { src: ['wl'], extend: [
    e([std('wl', /^IC\.N[MH]\.1$/)], ['Comment ça va ?|How are you?']),
    e([std('wl', /^IL\.N[MH]\.1$/)], ['Quelle heure est-il ?|What time is it?']),
    e([std('wl', /^PS\.N[MH]\.1$/)], ['avoir|to have', 'être|to be']),
    e([std('wl', /^IR\.N[MH]\.1$/)], ['aller|to go']),
  ], units: [
    unit('Clothing, weather & seasons', [std('wl', /^PW\.N[MH]\.1$/), 'Describe clothing and the weather'], ['les vêtements|clothing', 'Il fait chaud / froid|It’s hot / cold', 'Il pleut|It’s raining', 'les saisons|seasons (le printemps, l’été, l’automne, l’hiver)', 'porter|to wear', 'l’accord des adjectifs|adjective agreement in gender and number']),
    unit('La francophonie', [std('wl', /^CUL\.I\.[12]$/), std('wl', /^COMP\.N\.2$/)], ['la francophonie|French-speaking world', 'le Québec|French-speaking Canadian province', 'Haïti|French- and Creole-speaking Caribbean nation', 'le Sénégal|French-speaking West African nation', 'la Belgique / la Suisse|French-speaking European countries', 'le 14 juillet|French national holiday (Bastille Day)']),
  ] },
  mandarin12: { src: ['wl'], extend: [
    e([std('wl', /^IC\.N[MH]\.1$/)], ['你好 (nǐ hǎo)|hello', '谢谢 (xièxie)|thank you']),
    e([std('wl', /^PS\.N[MH]\.1$/)], ['几 (jǐ)|how many (small numbers)', '岁 (suì)|years old']),
    e([std('wl', /^IL\.N[MH]\.1$/)], ['上课 (shàngkè)|to attend class', '喜欢 (xǐhuan)|to like']),
  ], units: [
    unit('Food & shopping', [std('wl', /^IR\.N[MH]\.1$/), 'Order food and ask prices'], ['吃 (chī)|to eat', '喝 (hē)|to drink', '多少钱 (duōshao qián)|how much money?', '块 (kuài)|yuan (spoken)', '饺子 (jiǎozi)|dumplings', '米饭 (mǐfàn)|cooked rice']),
    unit('Hobbies & weekends', [std('wl', /^PW\.N[MH]\.1$/), 'Describe hobbies and make plans'], ['周末 (zhōumò)|weekend', '打球 (dǎqiú)|to play ball', '看电影 (kàn diànyǐng)|to watch a movie', '听音乐 (tīng yīnyuè)|to listen to music', '一起 (yìqǐ)|together', '吧 (ba)|particle for suggestions']),
    unit('Chinese culture & festivals', ['Compare a Chinese festival to one you celebrate', std('wl', /^COMP\.N\.2$/), std('wl', /^CUL\.I\.1$/)], ['春节 (Chūnjié)|Spring Festival', '红包 (hóngbāo)|red envelope with money', '中秋节 (Zhōngqiūjié)|Mid-Autumn Festival', '月饼 (yuèbing)|mooncake', '生肖 (shēngxiào)|Chinese zodiac animal', '汉字 (Hànzì)|Chinese characters']),
  ] },
  asl12: { src: ['wl', ASL], extend: [
    e([std('wl', /^IC\.N[MH]\.1$/), 'Follow Deaf community etiquette for getting attention and conversation'], ['Deaf (capital D)|Cultural identity of the Deaf community.', 'Fingerspelling|Spelling words letter by letter with handshapes.', 'Gallaudet University|University for Deaf and hard of hearing students in Washington, D.C.']),
    e([std('wl', /^PS\.N[MH]\.1$/), 'Use non-manual markers and sign order in sentences'], ['Non-manual markers|Facial expressions and head movements that carry grammar.', 'Topic-comment structure|ASL sentence order: topic first, then comment.', 'Classifier|Handshape representing a category of objects and how they move.']),
  ], units: [
    unit('Numbers, time & calendar', ['Sign dates, times and ages in conversation', std('wl', /^IL\.N[MH]\.1$/)], ['Number incorporation|Number built into a sign (e.g. TWO-WEEKS).', 'Time line|Space in front of the signer showing past, present and future.', 'Days of the week|Signs initialized with letters (M, T, W…).', 'Age signs|Numbers signed from the chin.', 'Money signs|Signs for cents and dollars.', 'Ordinal numbers|First, second, third.']),
    unit('Family, school & daily life', [std('wl', /^IR\.N[MH]\.1$/), std('wl', /^PW\.N[MH]\.1$/)], ['Gender-based signing area|Male family signs near the forehead, female near the chin.', 'Wh-face|Lowered brows for who/what/where questions.', 'Yes/no face|Raised brows for yes/no questions.', 'Pronoun pointing|Indexing people and places in space.', 'Directional verb|Verb that moves between subject and object.', 'Role shift|Shoulder shift to show different speakers.']),
    unit('Deaf culture & history', [std('wl', /^CUL\.I\.[12]$/), std('wl', /^COMP\.N\.2$/)], ['Laurent Clerc|Deaf teacher who co-founded the first U.S. school for the Deaf (1817).', 'Deaf President Now|1988 protest at Gallaudet that won its first Deaf president.', 'Audism|Discrimination based on hearing ability.', 'Interpreter|Professional who translates between ASL and spoken English.', 'Deaf-blind|Having both hearing and vision loss.', 'Video relay service|Phone service using an ASL interpreter on video.']),
  ] },
  collegealg: { src: ['alg2', 'qr'], extend: [
    e([std('alg2', /^A2.A-(REI\.B|CED\.A)\.\d+$/, 3)], ['Absolute value inequality||x − a| < b means a − b < x < a + b.', 'Interval notation|Writing solution sets like [2, 5).', 'Extraneous solution|A solution that does not satisfy the original equation.']),
    e([std('alg2', /^A2\.F-IF\.[BC]\.\d+$|^A2\.F-BF\.B\.\d+$/, 3)], ['Composition|(f ∘ g)(x) = f(g(x)).', 'Inverse function|Undoes a function: f⁻¹(f(x)) = x.', 'Transformation|Shift, stretch or reflection of a graph.']),
    e([std('alg2', /^A2\.A-APR\.[BD]\.\d+$/, 3)], ['Rational function|Ratio of two polynomials.', 'Vertical asymptote|x-value where a rational function is undefined and grows without bound.', 'Remainder theorem|p(a) is the remainder when p(x) is divided by x − a.', 'End behavior|What a graph does as x → ±∞.']),
    e([std('alg2', /^A2\.F-LE\.[AB]\.\d+$/, 3), std('qr', /^QR\.FR\.3$/)], ['Logarithm|Exponent: log_b(x) = y means bʸ = x.', 'Natural log|Logarithm base e.', 'Compound interest|A = P(1 + r/n)ⁿᵗ.']),
    e([std('alg2', /^A2.A-REI\.[CD]\.\d+$/, 2)], ['Matrix|Rectangular array of numbers.', 'Determinant|Number from a square matrix; nonzero means invertible.', 'Elimination|Adding equations to remove a variable.']),
  ], units: [
    unit('Sequences, series & counting', ['Use the binomial theorem to expand powers', 'Find terms and sums of arithmetic and geometric sequences', 'Use permutations and combinations'], ['Arithmetic sequence|Constant difference between terms.', 'Geometric sequence|Constant ratio between terms.', 'Series|Sum of the terms of a sequence.', 'Sigma notation|Σ shorthand for sums.', 'Permutation|Arrangement where order matters (nPr).', 'Combination|Selection where order does not matter (nCr).']),
  ] },
  precalc: { src: ['precalc'], extend: [
    e([std('precalc', /^RFR\.AF\.[1-4]$/)], ['Domain and range|Allowed inputs and resulting outputs.', 'Asymptote|Line a graph approaches.']),
    e([std('precalc', /^RFR\.BF\.[1-6]$/, 4)], ['Inverse function|f⁻¹ undoes f.', 'Logarithm|Inverse of an exponential function.']),
    e([std('precalc', /^RFR\.ETT\.[4-6]$|^RT\.RTS\.[1-3]$/, 4)], ['Pythagorean identity|sin²θ + cos²θ = 1.']),
    e([std('precalc', /^RV\.(MP|EV)\.\d$/, 4), std('precalc', /^RT\.EPE\.[1-3]$/, 2)], ['Parametric equations|x and y written as functions of a parameter t.', 'Polar coordinates|(r, θ): distance and angle from the origin.']),
    e([std('precalc', /^RFR\.ISS\.[1-4]$/)], ['Infinite geometric series sum|S = a₁ / (1 − r) when |r| < 1.', 'Limit|Value a function approaches.', 'Sigma notation|Σ shorthand for sums.']),
  ], units: [
    unit('Conic sections', [std('precalc', /^RFR\.IC\.[1-5]$/)], ['Parabola|Set of points equidistant from a focus and a directrix.', 'Ellipse|Set of points whose distances to two foci sum to a constant.', 'Hyperbola|Set of points whose distances to two foci differ by a constant.', 'Circle|(x − h)² + (y − k)² = r².', 'Eccentricity|How stretched a conic is.', 'Focus|Fixed point that defines a conic.']),
    unit('Triangle trigonometry & matrices', [std('precalc', /^RFR\.ETT\.[1-3]$|^RM\.UM\.[1-4]$/, 6)], ['Law of Sines|a/sin A = b/sin B = c/sin C.', 'Law of Cosines|c² = a² + b² − 2ab cos C.', 'Area of a triangle (SAS)|½ab sin C.', 'Matrix multiplication|Row-by-column products.', 'Inverse matrix|A⁻¹ with AA⁻¹ = I.', 'Determinant|Number from a square matrix.']),
  ] },
  trig: { src: ['precalc', 'alg2'], extend: [
    e([std('alg2', /^A2\.F-TF\.A\.\d$/, 2)], ['Coterminal angles|Angles sharing a terminal side.', 'Reference angle|Acute angle to the x-axis.']),
    e([std('alg2', /^A2\.F-TF\.B\.\d$/, 2), std('precalc', /^RFR\.AF\.5$/)], ['Amplitude|Half the distance between max and min.', 'Period|Length of one cycle (2π/b).']),
    e([std('precalc', /^RT\.RTS\.[1-3]$/), std('alg2', /^A2\.F-TF\.C\.\d$/, 1)], ['Double-angle identity|sin 2θ = 2 sin θ cos θ.', 'Sum identity|sin(A + B) = sin A cos B + cos A sin B.', 'Inverse trig function|Gives the angle from a ratio (arcsin).']),
    e([std('precalc', /^RFR\.ETT\.[1-3]$/)], ['Ambiguous case (SSA)|Given two sides and a non-included angle, 0, 1 or 2 triangles may exist.', 'Bearing|Direction measured from north.']),
  ], units: [
    unit('Polar coordinates & vectors', [std('precalc', /^RT\.EPE\.[1-3]$|^RV\.EV\.[1-5]$/, 6)], ['Polar coordinates|(r, θ) location.', 'Rose curve|r = a cos(nθ) or a sin(nθ).', 'Cardioid|Heart-shaped polar graph r = a(1 ± cos θ).', 'Vector|Quantity with magnitude and direction.', 'Component form|⟨x, y⟩ form of a vector.', 'Magnitude|Length of a vector: √(x² + y²).']),
  ] },
  stats: { src: ['alg2', 'alg1', 'qr'], extend: [
    e([std('alg2', /^A2\.S-IC\.[AB]\.\d+$/, 3)], []),
    e([std('alg1', /^A1\.S-ID\.[AB]\.\d+$/, 3), std('qr', /^QR\.SPR\.[34]$/)], ['Outlier|A value far from the rest (beyond 1.5·IQR from the quartiles).']),
    e([std('alg2', /^A2\.S-CP\.[AB]\.\d+$/, 4)], ['Conditional probability|P(A|B) = P(A and B) / P(B).']),
    e([std('alg2', /^A2\.S-ID\.A\.4$|^A2\.S-IC\.B\.[45]$/, 3)], ['Margin of error|Range likely to contain the true value.']),
  ], units: [
    unit('Regression & bivariate data', [std('alg1', /^A1\.S-ID\.C\.\d+$/), std('qr', /^QR\.CR\.3$/)], ['Scatterplot|Graph of paired data.', 'Correlation coefficient (r)|Strength and direction of a linear relationship (−1 to 1).', 'Least-squares regression line|Line minimizing squared residuals.', 'Residual|Actual − predicted value.', 'Coefficient of determination (r²)|Share of variation explained by the model.', 'Extrapolation|Predicting outside the data range (risky).']),
  ] },
};

// Media-arts goal helper used by cinema (one goal per process, proficient level).
function arts1(process) {
  const re = { respond: /Perceive/, connect: /Synthesize/ }[process];
  return std('media_arts', (i) => re.test(i[2]) && i[0] === 'Proficient', 2);
}
