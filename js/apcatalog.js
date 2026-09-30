// AP course catalog: official unit lists, exam weightings and exam formats, as published in each
// course's Course and Exam Description (CED) from the College Board. Weightings are the ranges the CED
// gives for the multiple-choice section. Formats reflect the current digital (Bluebook) exams.
// Question content is never copied from College Board — practice questions come from the student's
// own material (uploaded CEDs, class notes, AP Classroom printouts).

const mcq = (count, minutes, weight, note) => ({ kind: 'mcq', name: 'Multiple choice', count, minutes, weight, note });
// pts = points each response is scored out of on the real rubric (default 4 when rubrics vary per question).
const frq = (count, minutes, weight, note, name = 'Free response', pts = 4) => ({ kind: 'frq', name, count, minutes, weight, note, pts });
const U = (title, weight) => ({ title, weight });

const CALC_EXAM = [
  { ...mcq(29, 62, 35, 'Part A — no graphing calculator'), name: 'Multiple choice, Part A' },
  { ...mcq(13, 38, 15, 'Part B — graphing calculator required'), name: 'Multiple choice, Part B' },
  frq(2, 30, 16.7, 'Part A — graphing calculator required (9 pts each)', 'Free response, Part A', 9),
  frq(4, 60, 33.3, 'Part B — no calculator (9 pts each)', 'Free response, Part B', 9),
];

// AP English essays are scored on a 6-point analytic rubric.
const ENGLISH_RUBRIC = 'Thesis (0–1): a defensible thesis that responds to the prompt. Evidence & commentary (0–4): specific evidence, with commentary that explains how it supports your line of reasoning. Sophistication (0–1): complex understanding — nuance, tensions, broader context, or a consistently vivid style.';

const HISTORY_EXAM = [
  mcq(55, 55, 40, 'Stimulus-based sets (sources, images, maps, data)'),
  frq(3, 40, 20, 'Questions 1–2 required, then choose 3 or 4', 'Short answer (SAQ)', 3),
  frq(1, 60, 25, 'Document-based question (includes reading time) — 7-point rubric', 'Document-based (DBQ)', 7),
  frq(1, 40, 15, 'Long essay (choose 1 of 3) — 6-point rubric', 'Long essay (LEQ)', 6),
];

export const AP_COURSES = [
  // ---------------- Sciences ----------------
  {
    key: 'bio', name: 'AP Biology', slug: 'ap-biology', area: 'Science', color: '#43d17a',
    units: [U('Chemistry of Life', '8–11%'), U('Cells', '10–13%'), U('Cellular Energetics', '12–16%'), U('Cell Communication and Cell Cycle', '10–15%'), U('Heredity', '8–11%'), U('Gene Expression and Regulation', '12–16%'), U('Natural Selection', '13–20%'), U('Ecology', '10–15%')],
    exam: [mcq(60, 90, 50, 'Individual questions and data/experiment sets'), frq(6, 90, 50, 'Q1–2 interpreting experimental results (9 pts each) + Q3–6 short (4 pts each)', 'Free response', [9, 9, 4, 4, 4, 4])],
    tips: ['Practise reading graphs and experimental setups — most questions give you data to interpret.', 'For FRQs, answer exactly what the task verb asks: identify, describe, explain, justify, predict.', 'Science practices: concept explanation, visual representations, questions & methods, representing & describing data, statistical tests, argumentation.'],
    openstax: 'biology-2e',
  },
  {
    key: 'chem', name: 'AP Chemistry', slug: 'ap-chemistry', area: 'Science', color: '#3aa0ff',
    units: [U('Atomic Structure and Properties', '7–9%'), U('Compound Structure and Properties', '7–9%'), U('Properties of Substances and Mixtures', '18–22%'), U('Chemical Reactions', '7–9%'), U('Kinetics', '7–9%'), U('Thermochemistry', '7–9%'), U('Equilibrium', '7–9%'), U('Acids and Bases', '11–15%'), U('Thermodynamics and Electrochemistry', '7–9%')],
    exam: [mcq(60, 90, 50), frq(7, 105, 50, '3 long (10 pts) + 4 short (4 pts)', 'Free response', [10, 10, 10, 4, 4, 4, 4])],
    tips: ['Know the equations sheet and periodic table provided — practise with them, not a memorised copy.', 'Particulate diagrams show up often: draw and interpret them.', 'Show units and significant figures in every FRQ calculation.'],
    openstax: 'chemistry-2e',
  },
  {
    key: 'phys1', name: 'AP Physics 1', slug: 'ap-physics-1', area: 'Science', color: '#ff7a45',
    units: [U('Kinematics', '10–15%'), U('Force and Translational Dynamics', '18–23%'), U('Work, Energy, and Power', '18–23%'), U('Linear Momentum', '10–15%'), U('Torque and Rotational Dynamics', '10–15%'), U('Energy and Momentum of Rotating Systems', '5–8%'), U('Oscillations', '5–8%'), U('Fluids', '10–15%')],
    exam: [mcq(42, 85, 50, 'Calculator allowed'), frq(4, 95, 50, 'Mathematical routines, translation between representations, experimental design and analysis, qualitative/quantitative translation')],
    tips: ['Explain reasoning in words, equations AND diagrams — FRQs grade the connections between them.', 'Draw force diagrams before writing Newton’s 2nd law.', 'Fluids moved from Physics 2 into Physics 1 in 2024-25.'],
    openstax: 'college-physics-2e',
  },
  {
    key: 'phys2', name: 'AP Physics 2', slug: 'ap-physics-2', area: 'Science', color: '#f25f5c',
    units: [U('Thermodynamics', '15–18%'), U('Electric Force, Field, and Potential', '15–18%'), U('Electric Circuits', '15–18%'), U('Magnetism and Electromagnetism', '12–15%'), U('Geometric Optics', '12–15%'), U('Waves, Sound, and Physical Optics', '12–15%'), U('Modern Physics', '12–15%')],
    unitStart: 9,
    exam: [mcq(42, 85, 50, 'Calculator allowed'), frq(4, 95, 50, 'Mathematical routines, translation between representations, experimental design and analysis, qualitative/quantitative translation')],
    tips: ['Units are numbered 9–15, continuing from Physics 1.', 'Practise field-line and equipotential sketches.', 'Circuits questions reward qualitative reasoning before calculation.'],
    openstax: 'college-physics-2e',
  },
  {
    key: 'physcm', name: 'AP Physics C: Mechanics', slug: 'ap-physics-c-mechanics', area: 'Science', color: '#b55cff',
    units: [U('Kinematics', '10–15%'), U('Force and Translational Dynamics', '20–25%'), U('Work, Energy, and Power', '15–25%'), U('Linear Momentum', '10–20%'), U('Torque and Rotational Dynamics', '10–15%'), U('Energy and Momentum of Rotating Systems', '10–15%'), U('Oscillations', '10–15%')],
    exam: [mcq(42, 85, 50, 'Calculus-based; calculator allowed'), frq(4, 95, 50, 'Mathematical routines, translation between representations, experimental design and analysis, qualitative/quantitative translation')],
    tips: ['Expect derivatives and integrals — e.g. deriving velocity from force functions.', 'Rotational inertia by integration shows up regularly.'],
    openstax: 'university-physics-volume-1',
  },
  {
    key: 'apes', name: 'AP Environmental Science', slug: 'ap-environmental-science', area: 'Science', color: '#1fc8a9',
    units: [U('The Living World: Ecosystems', '6–8%'), U('The Living World: Biodiversity', '6–8%'), U('Populations', '10–15%'), U('Earth Systems and Resources', '10–15%'), U('Land and Water Use', '10–15%'), U('Energy Resources and Consumption', '10–15%'), U('Atmospheric Pollution', '7–10%'), U('Aquatic and Terrestrial Pollution', '7–10%'), U('Global Change', '15–20%')],
    exam: [mcq(80, 90, 60), frq(3, 70, 40, 'Design an investigation, analyze quantitative data, environmental problem with calculations (10 pts each)', 'Free response', 10)],
    tips: ['Calculations are done without a calculator on older exams and are always about units — practise dimensional analysis.', 'Always pair an environmental problem with a specific, realistic solution.'],
    openstax: 'biology-2e',
  },
  // ---------------- Math & CS ----------------
  {
    key: 'calcab', name: 'AP Calculus AB', slug: 'ap-calculus-ab', area: 'Math & CS', color: '#7c5cff',
    units: [U('Limits and Continuity', '10–15%'), U('Differentiation: Definition and Fundamental Properties', '10–15%'), U('Differentiation: Composite, Implicit, and Inverse Functions', '5–10%'), U('Contextual Applications of Differentiation', '10–15%'), U('Analytical Applications of Differentiation', '15–20%'), U('Integration and Accumulation of Change', '15–20%'), U('Differential Equations', '5–10%'), U('Applications of Integration', '10–15%')],
    exam: CALC_EXAM,
    tips: ['Justify conclusions with calculus theorems by name (MVT, IVT, EVT) and check their conditions.', 'FRQs reward correct notation and units in context.'],
    openstax: 'calculus-volume-1',
  },
  {
    key: 'calcbc', name: 'AP Calculus BC', slug: 'ap-calculus-bc', area: 'Math & CS', color: '#6d4dff',
    units: [U('Limits and Continuity', '5–10%'), U('Differentiation: Definition and Fundamental Properties', '5–10%'), U('Differentiation: Composite, Implicit, and Inverse Functions', '5–10%'), U('Contextual Applications of Differentiation', '5–10%'), U('Analytical Applications of Differentiation', '10–15%'), U('Integration and Accumulation of Change', '15–20%'), U('Differential Equations', '5–10%'), U('Applications of Integration', '5–10%'), U('Parametric Equations, Polar Coordinates, and Vector-Valued Functions', '10–15%'), U('Infinite Sequences and Series', '15–20%')],
    exam: CALC_EXAM,
    tips: ['Series (Unit 10) is 15–20% — know convergence tests and Taylor error bounds cold.', 'BC exams include an AB subscore.'],
    openstax: 'calculus-volume-2',
  },
  {
    key: 'precalc', name: 'AP Precalculus', slug: 'ap-precalculus', area: 'Math & CS', color: '#00b8d9',
    units: [U('Polynomial and Rational Functions', '30–40%'), U('Exponential and Logarithmic Functions', '25–40%'), U('Trigonometric and Polar Functions', '30–35%'), U('Functions Involving Parameters, Vectors, and Matrices', 'not on exam')],
    exam: [mcq(42, 105, 62.5, 'Part A 29 q / 65 min no calculator · Part B 13 q / 40 min graphing calculator'), frq(4, 70, 37.5, '2 graphing-calculator + 2 no-calculator questions (6 pts each)', 'Free response', 6)],
    tips: ['Only Units 1–3 are on the AP Exam.', 'Be ready to model real contexts and interpret parameters.'],
    openstax: 'precalculus-2e',
  },
  {
    key: 'stats', name: 'AP Statistics', slug: 'ap-statistics', area: 'Math & CS', color: '#ffb020',
    units: [U('Exploring One-Variable Data and Collecting Data', '20–30%'), U('Probability, Random Variables, and Probability Distributions', '15–25%'), U('Inference for Categorical Data: Proportions', '15–25%'), U('Inference for Quantitative Data: Means', '10–20%'), U('Regression Analysis', '10–20%')],
    exam: [mcq(42, 90, 50), frq(4, 90, 50, 'Four 10-point questions: two multi-focus, one inference, one more (scored analytically)', 'Free response', 10)],
    tips: ['Redesigned into 5 units starting 2026–27.', 'Every inference answer needs: hypotheses, conditions, test/interval, conclusion in context.', 'Communication counts — answer “in context” every time.'],
    openstax: 'introductory-statistics-2e',
  },
  {
    key: 'csa', name: 'AP Computer Science A', slug: 'ap-computer-science-a', area: 'Math & CS', color: '#3aa0ff',
    units: [U('Using Objects and Methods', '15–25%'), U('Selection and Iteration', '25–35%'), U('Class Creation', '10–18%'), U('Data Collections', '30–40%')],
    exam: [mcq(42, 90, 55, 'Java code reading and tracing'), frq(4, 90, 45, 'Methods & control (7 pts), class design (7), ArrayList (5), 2D array (6)', 'Free response', [7, 7, 5, 6])],
    tips: ['Revised to 4 units starting 2025-26.', 'Trace code by hand with a table of variable values.', 'Write FRQ code that compiles-in-spirit: correct signatures and loop bounds matter.'],
    openstax: 'introduction-python-programming',
  },
  {
    key: 'csp', name: 'AP Computer Science Principles', slug: 'ap-computer-science-principles', area: 'Math & CS', color: '#43d17a',
    units: [U('Creative Development', '10–13%'), U('Data', '17–22%'), U('Algorithms and Programming', '30–35%'), U('Computer Systems and Networks', '11–15%'), U('Impact of Computing', '21–26%')],
    unitWord: 'Big Idea',
    exam: [mcq(70, 120, 70), frq(2, 60, 30, 'Create performance task: written responses about your program', 'Create task (written response)')],
    tips: ['The Create task program is done in class; on exam day you answer questions about your own code.', 'Know the AP pseudocode reference sheet.'],
    openstax: 'introduction-python-programming',
  },
  // ---------------- History & Social Science ----------------
  {
    key: 'apush', name: 'AP U.S. History', slug: 'ap-united-states-history', area: 'History & Social Science', color: '#f25f5c', unitWord: 'Period',
    units: [U('1491–1607', '4–6%'), U('1607–1754', '6–8%'), U('1754–1800', '10–17%'), U('1800–1848', '10–17%'), U('1844–1877', '10–17%'), U('1865–1898', '10–17%'), U('1890–1945', '10–17%'), U('1945–1980', '10–17%'), U('1980–Present', '4–6%')],
    exam: HISTORY_EXAM,
    tips: ['Historical thinking skills: causation, comparison, continuity & change over time.', 'DBQ: thesis, contextualisation, use ≥4 documents, sourcing (HIPP) for 2, outside evidence, complexity.'],
    openstax: 'us-history',
  },
  {
    key: 'world', name: 'AP World History: Modern', slug: 'ap-world-history-modern', centralSlug: 'ap-world-history', area: 'History & Social Science', color: '#ff9f43',
    units: [U('The Global Tapestry (c. 1200–1450)', '8–10%'), U('Networks of Exchange (c. 1200–1450)', '8–10%'), U('Land-Based Empires (c. 1450–1750)', '12–15%'), U('Transoceanic Interconnections (c. 1450–1750)', '12–15%'), U('Revolutions (c. 1750–1900)', '12–15%'), U('Consequences of Industrialization (c. 1750–1900)', '12–15%'), U('Global Conflict (c. 1900–present)', '8–10%'), U('Cold War and Decolonization (c. 1900–present)', '8–10%'), U('Globalization (c. 1900–present)', '8–10%')],
    exam: HISTORY_EXAM,
    tips: ['Think in comparisons across regions — the course rewards connections.', 'Memorise 2–3 specific examples per unit to use as evidence in essays.'],
    openstax: 'world-history-volume-2',
  },
  {
    key: 'euro', name: 'AP European History', slug: 'ap-european-history', area: 'History & Social Science', color: '#b55cff',
    units: [U('Renaissance and Exploration', '10–15%'), U('Age of Reformation', '10–15%'), U('Absolutism and Constitutionalism', '10–15%'), U('Scientific, Philosophical, and Political Developments', '10–15%'), U('Conflict, Crisis, and Reaction in the Late 18th Century', '10–15%'), U('Industrialization and Its Effects', '10–15%'), U('19th-Century Perspectives and Political Developments', '10–15%'), U('20th-Century Global Conflicts', '10–15%'), U('Cold War and Contemporary Europe', '10–15%')],
    exam: HISTORY_EXAM,
    tips: ['Track themes: interaction of Europe and the world, economic development, cultural/intellectual shifts, states and institutions, social organisation, national and European identity.'],
    openstax: 'world-history-volume-2',
  },
  {
    key: 'gov', name: 'AP U.S. Government and Politics', slug: 'ap-united-states-government-and-politics', area: 'History & Social Science', color: '#3aa0ff',
    units: [U('Foundations of American Democracy', '15–22%'), U('Interactions Among Branches of Government', '25–36%'), U('Civil Liberties and Civil Rights', '13–18%'), U('American Political Ideologies and Beliefs', '10–15%'), U('Political Participation', '20–27%')],
    exam: [mcq(55, 80, 50), frq(4, 100, 50, 'Concept application (3 pts), quantitative analysis (4), SCOTUS comparison (4), argument essay (6)', 'Free response', [3, 4, 4, 6])],
    tips: ['Know the required foundational documents (e.g. Federalist 10 & 51, Brutus 1) and required Supreme Court cases.', 'Argument essay: defensible claim, two pieces of evidence (one from a foundational document), reasoning, respond to an opposing view.'],
    openstax: 'american-government-3e',
  },
  {
    key: 'compgov', name: 'AP Comparative Government and Politics', slug: 'ap-comparative-government-and-politics', area: 'History & Social Science', color: '#1fc8a9',
    units: [U('Political Systems, Regimes, and Governments', '18–27%'), U('Political Institutions', '22–33%'), U('Political Culture and Participation', '11–18%'), U('Party and Electoral Systems and Citizen Organizations', '13–18%'), U('Political and Economic Changes and Development', '16–24%')],
    exam: [mcq(55, 60, 50), frq(4, 90, 50, 'Conceptual analysis (4 pts), quantitative (5), comparative (5), argument essay (5)', 'Free response', [4, 5, 5, 5])],
    tips: ['Six course countries: China, Iran, Mexico, Nigeria, Russia, United Kingdom — compare them constantly.'],
    openstax: 'introduction-political-science',
  },
  {
    key: 'hug', name: 'AP Human Geography', slug: 'ap-human-geography', area: 'History & Social Science', color: '#43d17a',
    units: [U('Thinking Geographically', '8–10%'), U('Population and Migration Patterns and Processes', '12–17%'), U('Cultural Patterns and Processes', '12–17%'), U('Political Patterns and Processes', '12–17%'), U('Agriculture and Rural Land-Use Patterns and Processes', '12–17%'), U('Cities and Urban Land-Use Patterns and Processes', '12–17%'), U('Industrial and Economic Development Patterns and Processes', '12–17%')],
    exam: [mcq(60, 60, 50), frq(3, 75, 50, 'No stimulus, one stimulus, two stimuli (7 pts each)', 'Free response', 7)],
    tips: ['Learn the models (demographic transition, von Thünen, Burgess, Rostow…) and their limitations.', 'Always tie concepts to scale: local, regional, global.'],
    openstax: 'introduction-sociology-3e',
  },
  {
    key: 'psych', name: 'AP Psychology', slug: 'ap-psychology', area: 'History & Social Science', color: '#ff6b8b',
    units: [U('Biological Bases of Behavior', '15–25%'), U('Cognition', '15–25%'), U('Development and Learning', '15–25%'), U('Social Psychology and Personality', '15–25%'), U('Mental and Physical Health', '15–25%')],
    exam: [mcq(75, 90, 66.7, 'Concept application 65% · research methods 25% · data interpretation 10%'), frq(2, 70, 33.3, 'Article analysis (AAQ) + evidence-based question (EBQ), 7 points each', 'Free response', 7)],
    tips: ['Redesigned in 2024-25: fewer vocab drills, more applying concepts to scenarios.', 'Know research design vocabulary: IV/DV, operational definitions, sampling, ethics.'],
    openstax: 'psychology-2e',
  },
  {
    key: 'macro', name: 'AP Macroeconomics', slug: 'ap-macroeconomics', area: 'History & Social Science', color: '#ffb020',
    units: [U('Basic Economic Concepts', '5–10%'), U('Economic Indicators and the Business Cycle', '12–17%'), U('National Income and Price Determination', '17–27%'), U('Financial Sector', '18–23%'), U('Long-Run Consequences of Stabilization Policies', '20–30%'), U('Open Economy—International Trade and Finance', '10–13%')],
    exam: [mcq(60, 70, 66.7), frq(3, 60, 33.3, '1 long (10 pts) + 2 short (5 pts), with graphs; includes 10-min reading', 'Free response', [10, 5, 5])],
    tips: ['Graph fluency is everything: AD/AS, money market, loanable funds, Phillips curve, FOREX.', 'Label every axis and curve, and show the shift direction.'],
    openstax: 'principles-macroeconomics-3e',
  },
  {
    key: 'micro', name: 'AP Microeconomics', slug: 'ap-microeconomics', area: 'History & Social Science', color: '#ff7a45',
    units: [U('Basic Economic Concepts', '12–15%'), U('Supply and Demand', '20–25%'), U('Production, Cost, and the Perfect Competition Model', '22–25%'), U('Imperfect Competition', '15–22%'), U('Factor Markets', '10–13%'), U('Market Failure and the Role of Government', '8–13%')],
    exam: [mcq(60, 70, 66.7), frq(3, 60, 33.3, '1 long (10 pts) + 2 short (5 pts), with graphs; includes 10-min reading', 'Free response', [10, 5, 5])],
    tips: ['Master MR = MC and where firms produce in each market structure.', 'Practise drawing side-by-side firm and market graphs.'],
    openstax: 'principles-microeconomics-3e',
  },
  // ---------------- English ----------------
  {
    key: 'lang', name: 'AP English Language and Composition', slug: 'ap-english-language-and-composition', area: 'English', color: '#8b6cff', skillBased: true,
    // The CED's 9 units each spiral the same four big ideas: rhetorical situation, claims & evidence,
    // reasoning & organization, and style — so they're numbered rather than named.
    units: Array.from({ length: 9 }, (_, i) => U(`Reading & writing skills, cycle ${i + 1}`, 'skills')),
    exam: [mcq(45, 60, 45, 'Reading and writing (revision) questions'), frq(3, 135, 55, 'Synthesis, rhetorical analysis, argument (includes 15 min reading) — 6-point rubric each', 'Essays', 6)],
    // Original practice prompts in the style of the open argument essay (used until you add released prompts).
    prompts: [
      'Many people believe that failure teaches more than success does. Write an essay that argues your position on the extent to which this claim is valid.',
      'Some argue that constant convenience has made modern life less meaningful. Write an essay that argues your position on the relationship between convenience and meaning.',
      'Write an essay that argues your position on whether it is better for a person to be a specialist or a generalist.',
      'Some communities value tradition above innovation. Write an essay that argues your position on the value of preserving tradition.',
    ].map((p) => ({ prompt: `${p} In your response you should: respond to the prompt with a thesis that presents a defensible position; provide evidence to support your line of reasoning; explain how the evidence supports your line of reasoning; use appropriate grammar and punctuation.`, rubric: ENGLISH_RUBRIC })),
    tips: ['Skill-based: all 9 units revisit rhetorical situation, claims & evidence, reasoning & organization, and style at increasing depth.', 'Rhetorical analysis: explain HOW choices build the argument, not just WHAT they are.'],
    openstax: 'writing-guide',
  },
  {
    key: 'lit', name: 'AP English Literature and Composition', slug: 'ap-english-literature-and-composition', area: 'English', color: '#ff6b8b', skillBased: true,
    units: ['I', 'II', 'III'].flatMap((n) => [U(`Short Fiction ${n}`, 'skills'), U(`Poetry ${n}`, 'skills'), U(`Longer Fiction or Drama ${n}`, 'skills')]),
    exam: [mcq(55, 60, 45, 'Passages of prose and poetry'), frq(3, 120, 55, 'Poetry analysis, prose analysis, literary argument — 6-point rubric each', 'Essays', 6)],
    // Original practice prompts in the style of the literary argument essay (Q3).
    prompts: [
      'In many works of literature, a character must choose between loyalty to a group and loyalty to their own conscience. Choose a work of fiction in which a character faces such a choice. Then analyze how that choice contributes to an interpretation of the work as a whole.',
      'Places in literature often shape the people who live there. Choose a work in which a setting significantly influences a character. Then analyze how that influence contributes to an interpretation of the work as a whole.',
      'A minor character can illuminate the values of a central character. Choose a work in which a minor character plays this role. Then analyze how the minor character contributes to an interpretation of the work as a whole.',
      'Many works explore the gap between how characters see themselves and how others see them. Choose a work that explores this gap. Then analyze how it contributes to an interpretation of the work as a whole.',
    ].map((p) => ({ prompt: `${p} Do not merely summarize the plot. In your response you should: respond to the prompt with a thesis that presents a defensible interpretation; provide evidence to support your line of reasoning; explain how the evidence supports your line of reasoning.`, rubric: ENGLISH_RUBRIC })),
    tips: ['The 9 units cycle Short Fiction → Poetry → Longer Fiction/Drama three times, each round going deeper.', 'Build a “go-to” list of 3–4 novels/plays you know deeply for the literary argument essay.'],
    openstax: 'writing-guide',
  },
];

// Task verbs used in AP free-response questions and what each one requires.
export const TASK_VERBS = [
  ['Identify', 'Name or point out the answer — no explanation needed.'],
  ['Describe', 'Give the relevant characteristics of something (what it is / what happens).'],
  ['Explain', 'Give the how or why — connect cause to effect with reasoning.'],
  ['Justify', 'Give evidence or reasoning that supports a claim or answer.'],
  ['Predict / Make a claim', 'State an expected outcome; usually followed by a justification.'],
  ['Calculate', 'Show the steps and the setup, with units, to reach a numerical answer.'],
  ['Compare', 'Give similarities AND/OR differences between two things, explicitly.'],
  ['Evaluate', 'Judge the significance or validity of something using evidence.'],
  ['Support / Refute / Qualify', 'Take a position on a claim and back it with specific evidence.'],
  ['Represent / Draw / Sketch', 'Produce a diagram, graph or model with correct labels.'],
];

export const courseByKey = (key) => AP_COURSES.find((c) => c.key === key);
export const unitLabel = (course, i) => (i === null || i === undefined || i < 0 ? 'Skills' : `${course.unitWord || 'Unit'} ${(course.unitStart || 1) + i}`);

// Midpoint of a "10–15%" range, used to weight practice exams like the real one.
export function weightMid(w) {
  const m = String(w).match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
  if (m) return (parseFloat(m[1]) + parseFloat(m[2])) / 2;
  const n = parseFloat(w);
  return Number.isFinite(n) ? n : 0;
}

export const links = (course) => ({
  classroom: 'https://apclassroom.collegeboard.org/',
  course: `https://apcentral.collegeboard.org/courses/${course.centralSlug || course.slug}`,
  pastFrq: `https://apcentral.collegeboard.org/courses/${course.centralSlug || course.slug}/exam/past-exam-questions`,
  students: `https://apstudents.collegeboard.org/courses/${course.slug}`,
  khan: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(course.name)}`,
  openstax: course.openstax ? `https://openstax.org/details/books/${course.openstax}` : null,
});

// ---------------- Regular (non-AP) classes: free, public course material ----------------
// OpenStax textbooks are free, peer-reviewed, openly licensed and downloadable as PDF — perfect
// to upload into Orbit when a class has no handouts of its own.
const OPENSTAX = [
  [/anatom|physiolog/i, 'anatomy-and-physiology-2e', 'Anatomy & Physiology 2e'],
  [/micro ?bio/i, 'microbiology', 'Microbiology'],
  [/bio/i, 'biology-2e', 'Biology 2e'],
  [/organic/i, 'organic-chemistry', 'Organic Chemistry'],
  [/chem/i, 'chemistry-2e', 'Chemistry 2e'],
  [/astro/i, 'astronomy-2e', 'Astronomy 2e'],
  [/phys(?!io)/i, 'college-physics-2e', 'College Physics 2e'],
  [/psych/i, 'psychology-2e', 'Psychology 2e'],
  [/socio/i, 'introduction-sociology-3e', 'Introduction to Sociology 3e'],
  [/(us|u\.s\.|american) hist|apush/i, 'us-history', 'U.S. History'],
  [/world hist|global hist|euro/i, 'world-history-volume-2', 'World History, Vol. 2'],
  [/gov|civics|politic/i, 'american-government-3e', 'American Government 3e'],
  [/macro/i, 'principles-macroeconomics-3e', 'Principles of Macroeconomics 3e'],
  [/micro ?econ/i, 'principles-microeconomics-3e', 'Principles of Microeconomics 3e'],
  [/econ/i, 'principles-economics-3e', 'Principles of Economics 3e'],
  [/stat/i, 'introductory-statistics-2e', 'Introductory Statistics 2e'],
  [/calc/i, 'calculus-volume-1', 'Calculus Vol. 1'],
  [/pre-?calc|trig/i, 'precalculus-2e', 'Precalculus 2e'],
  [/algebra|math/i, 'college-algebra-2e', 'College Algebra 2e'],
  [/philos/i, 'introduction-philosophy', 'Introduction to Philosophy'],
  [/computer|coding|program|python/i, 'introduction-python-programming', 'Introduction to Python Programming'],
  [/account/i, 'principles-financial-accounting', 'Principles of Accounting'],
  [/english|writing|lit|composition/i, 'writing-guide', 'Writing Guide with Handbook'],
];

export function resourcesFor(name = '') {
  const out = [];
  const hit = OPENSTAX.find(([re]) => re.test(name));
  if (hit) out.push({ label: `OpenStax: ${hit[2]} (free PDF)`, url: `https://openstax.org/details/books/${hit[1]}`, note: 'Download the chapter PDF and upload it to make a study set.' });
  out.push({ label: 'All OpenStax subjects', url: 'https://openstax.org/subjects', note: 'Free, openly licensed textbooks.' });
  out.push({ label: `Khan Academy: ${name || 'search'}`, url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(name)}`, note: 'Free lessons and practice.' });
  return out;
}
