// World languages (Spanish unit titles come from DVUSD's public Spanish 1-2 / 3-4 / 5-6 curriculum
// documents), CTE and elective outlines, and term banks used by DVUSD-guide courses (PE, Health,
// visual & performing arts).
import { u } from './cur-ela-math.js';

const DV_SPANISH = 'https://www.dvusd.org/departments/cia/content-areas/world-languages';

const LANG = {
  spanish12: {
    label: 'Spanish 1-2', source: 'dvusd', sourceName: 'DVUSD Spanish 1-2 curriculum document', sourceUrl: DV_SPANISH, standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Unidad 1 · ¡Mucho gusto!', ['Greet people, introduce yourself and ask how someone is', 'Use numbers, the alphabet, days and dates'], [['Hola', 'Hello'], ['¿Cómo te llamas?', 'What is your name?'], ['Me llamo…', 'My name is…'], ['Mucho gusto', 'Nice to meet you'], ['¿Cómo estás?', 'How are you? (informal)'], ['Hasta luego', 'See you later'], ['¿Qué día es hoy?', 'What day is today?'], ['¿De dónde eres?', 'Where are you from?']]),
      u('Unidad 2 · ¡Al colegio!', ['Talk about classes, schedules and school supplies', 'Use -ar verbs and telling time'], [['la clase', 'class'], ['el horario', 'schedule'], ['el cuaderno', 'notebook'], ['¿Qué hora es?', 'What time is it?'], ['estudiar', 'to study'], ['necesitar', 'to need'], ['tener que + infinitivo', 'to have to (do something)'], ['la tarea', 'homework']]),
      u('Unidad 3 · ¡En la ciudad!', ['Describe places in a town and give directions', 'Use ir and ir a + infinitive'], [['la biblioteca', 'library'], ['el parque', 'park'], ['el restaurante', 'restaurant'], ['ir', 'to go (voy, vas, va, vamos, van)'], ['ir a + infinitivo', 'going to (do something)'], ['a la derecha / a la izquierda', 'to the right / to the left'], ['cerca de / lejos de', 'near / far from']]),
      u('Unidad 4 · La familia y los amigos', ['Describe family members and friends', 'Use ser, adjective agreement and possessives'], [['la madre / el padre', 'mother / father'], ['el hermano / la hermana', 'brother / sister'], ['los abuelos', 'grandparents'], ['alto / bajo', 'tall / short'], ['simpático', 'nice, friendly'], ['mi / tu / su', 'my / your / his-her-their'], ['ser', 'to be (characteristics): soy, eres, es, somos, son']]),
      u('Unidad 5 · La rutina y la diversión', ['Describe daily routines and free-time activities', 'Use reflexive and stem-changing verbs'], [['levantarse', 'to get up'], ['despertarse (e→ie)', 'to wake up'], ['ducharse', 'to shower'], ['jugar (u→ue)', 'to play'], ['me gusta / me gustan', 'I like (one thing / several things)'], ['los fines de semana', 'on weekends']]),
      u('Unidad 6 · Mi casa es tu casa', ['Describe a home and household chores', 'Use estar and prepositions of location'], [['la cocina', 'kitchen'], ['el dormitorio', 'bedroom'], ['la sala', 'living room'], ['hacer la cama', 'to make the bed'], ['estar', 'to be (location, feelings): estoy, estás, está…'], ['al lado de', 'next to'], ['encima de / debajo de', 'on top of / under']]),
      u('Unidad 7 · Las diversiones de todo el año', ['Talk about weather, seasons, holidays and celebrations', 'Use the preterite of regular verbs'], [['Hace calor / frío', 'It’s hot / cold'], ['Llueve', 'It’s raining'], ['el verano / el invierno', 'summer / winter'], ['la fiesta', 'party, celebration'], ['celebrar', 'to celebrate'], ['ayer', 'yesterday'], ['Preterite -ar endings', '-é, -aste, -ó, -amos, -aron']]),
    ],
  },
  spanish34: {
    label: 'Spanish 3-4', source: 'dvusd', sourceName: 'DVUSD Spanish 3-4 curriculum document', sourceUrl: DV_SPANISH, standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Unidad 1 · La tecnología en la vida diaria', ['Discuss technology use; review present tense'], [['el teléfono celular', 'cell phone'], ['la computadora portátil', 'laptop'], ['descargar', 'to download'], ['enviar un mensaje', 'to send a message'], ['la contraseña', 'password'], ['las redes sociales', 'social media']]),
      u('Unidad 2 · Vivir en salud', ['Talk about health, the body and healthy habits; use commands'], [['el cuerpo', 'body'], ['me duele…', 'my … hurts'], ['la gripe', 'the flu'], ['hacer ejercicio', 'to exercise'], ['Come frutas.', 'Eat fruit. (informal command)'], ['sano / saludable', 'healthy']]),
      u('Unidad 3 · Vamos a la ciudad', ['Navigate a city and use public transportation; preterite vs. imperfect'], [['el metro', 'subway'], ['la parada de autobús', 'bus stop'], ['doblar', 'to turn'], ['seguir derecho', 'to go straight'], ['Preterite', 'Completed actions at a specific time.'], ['Imperfect', 'Ongoing, habitual or background past actions.']]),
      u('Unidad 4 · Diversión para todos', ['Describe entertainment and leisure; use the imperfect'], [['el concierto', 'concert'], ['la película', 'movie'], ['de niño/a, yo jugaba…', 'as a child, I used to play…'], ['divertirse (e→ie)', 'to have fun']]),
      u('Unidad 5 · De compras', ['Shop, compare prices and clothing; use direct object pronouns'], [['la tienda', 'store'], ['¿Cuánto cuesta?', 'How much does it cost?'], ['la talla', 'size (clothing)'], ['barato / caro', 'cheap / expensive'], ['lo / la / los / las', 'direct object pronouns (it, them)'], ['probarse (o→ue)', 'to try on']]),
      u('Unidad 8 · De viaje a España', ['Plan a trip and learn about Spain; use the future tense'], [['el aeropuerto', 'airport'], ['el pasaporte', 'passport'], ['hacer la maleta', 'to pack a suitcase'], ['Viajaré…', 'I will travel… (future tense)'], ['la Comunidad de Madrid', 'region containing Spain’s capital, Madrid']]),
    ],
  },
  spanish56: {
    label: 'Spanish 5-6', source: 'dvusd', sourceName: 'DVUSD Spanish 5-6 curriculum document', sourceUrl: DV_SPANISH, standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Unidad 1 · Hola', ['Review core tenses and introductions in depth'], [['presentarse', 'to introduce oneself'], ['el pasatiempo', 'hobby'], ['Present perfect', 'he/has/ha + past participle (he comido = I have eaten).']]),
      u('Unidad 2 · En casa y en familia', ['Discuss family relationships and responsibilities'], [['llevarse bien', 'to get along well'], ['los quehaceres', 'chores'], ['el apoyo', 'support']]),
      u('Unidad 3 · Las noticias', ['Discuss news and current events; use the passive voice and se'], [['el periódico', 'newspaper'], ['el titular', 'headline'], ['Se dice que…', 'It is said that…'], ['el reportaje', 'report']]),
      u('Unidad 4 · Comuniquemos', ['Express opinions and give advice; present subjunctive'], [['Es importante que + subjuntivo', 'It’s important that…'], ['Ojalá que…', 'Hopefully…'], ['Subjunctive triggers (WEIRDO)', 'Wishes, Emotions, Impersonal expressions, Recommendations, Doubt, Ojalá.']]),
      u('Unidad 5 · La vida de la ciudad y el campo', ['Compare city and rural life'], [['el campo', 'countryside'], ['la granja', 'farm'], ['el tráfico', 'traffic'], ['la contaminación', 'pollution']]),
      u('Unidad 6 · Los viajes', ['Plan travel; use conditional tense'], [['Yo viajaría…', 'I would travel… (conditional)'], ['el alojamiento', 'lodging'], ['el itinerario', 'itinerary']]),
      u('Unidad 8 · La salud', ['Discuss health and wellness at an advanced level'], [['la salud mental', 'mental health'], ['el estrés', 'stress'], ['la receta', 'prescription / recipe']]),
    ],
  },
  french12: {
    label: 'French 1-2', standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Greetings & introductions', ['Greet, introduce yourself and say where you are from'], [['Bonjour', 'Hello'], ['Je m’appelle…', 'My name is…'], ['Comment ça va ?', 'How’s it going?'], ['Enchanté(e)', 'Nice to meet you'], ['Au revoir', 'Goodbye']]),
      u('School & time', ['Talk about classes and schedules; use -er verbs'], [['l’école', 'school'], ['le cours', 'class'], ['Quelle heure est-il ?', 'What time is it?'], ['étudier', 'to study'], ['les devoirs', 'homework']]),
      u('Family & description', ['Describe people; use être and avoir and adjective agreement'], [['la famille', 'family'], ['être', 'to be (je suis, tu es, il est…)'], ['avoir', 'to have (j’ai, tu as, il a…)'], ['grand(e) / petit(e)', 'tall / short']]),
      u('Food, town & leisure', ['Order food, describe places, talk about activities; use aller'], [['le café', 'café / coffee'], ['Je voudrais…', 'I would like…'], ['aller', 'to go (je vais…)'], ['le week-end', 'weekend'], ['le passé composé', 'past tense formed with avoir/être + past participle']]),
    ],
  },
  mandarin12: {
    label: 'Mandarin 1-2 H', standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Pinyin, tones & greetings', ['Pronounce the four tones; greet and introduce yourself'], [['你好 (nǐ hǎo)', 'Hello'], ['谢谢 (xièxie)', 'Thank you'], ['我叫… (wǒ jiào…)', 'My name is…'], ['Four tones', 'ā (flat), á (rising), ǎ (dip), à (falling)'], ['再见 (zàijiàn)', 'Goodbye']]),
      u('Numbers, dates & family', ['Count, give dates and describe family'], [['一二三 (yī èr sān)', 'one, two, three'], ['妈妈 (māma)', 'mom'], ['爸爸 (bàba)', 'dad'], ['几岁? (jǐ suì?)', 'How old? (for children)']]),
      u('School & daily life', ['Talk about classes, time and routines'], [['学校 (xuéxiào)', 'school'], ['老师 (lǎoshī)', 'teacher'], ['现在几点? (xiànzài jǐ diǎn?)', 'What time is it now?'], ['喜欢 (xǐhuan)', 'to like']]),
    ],
  },
  asl12: {
    label: 'American Sign Language 1-2', standards: 'Arizona World and Native Languages Standards',
    units: [
      u('Deaf culture & the basics of ASL', ['Explain Deaf culture and ASL as a full language'], [['ASL', 'American Sign Language, a complete language with its own grammar.'], ['Deaf (capital D)', 'Identity as a member of the Deaf cultural community.'], ['Fingerspelling', 'Spelling words letter by letter with handshapes.'], ['Non-manual markers', 'Facial expressions and head movements that carry grammar.']]),
      u('ASL grammar', ['Use parameters of a sign and basic sentence structure'], [['Five parameters', 'Handshape, location, movement, palm orientation, non-manual markers.'], ['Topic–comment structure', 'Common ASL order: name the topic, then comment on it.'], ['Classifier', 'A handshape representing a category of objects and their movement.']]),
    ],
  },
};

// ------------------------------------------------------------------ CTE & electives
const CTE = {
  accounting: { label: 'Accounting', standards: 'Arizona CTE Accounting program standards', units: [
    u('The accounting equation', ['Analyze transactions with the accounting equation'], [['Accounting equation', 'Assets = Liabilities + Owner’s Equity.'], ['Asset', 'Something of value a business owns.'], ['Liability', 'A debt the business owes.'], ['Owner’s equity', 'The owner’s claim on assets.'], ['Revenue', 'Income earned from selling goods or services.'], ['Expense', 'A cost of running the business.']]),
    u('Journals, ledgers & the accounting cycle', ['Record debits and credits and post to ledgers'], [['Debit', 'Left side of an account.'], ['Credit', 'Right side of an account.'], ['General journal', 'Book where transactions are first recorded in date order.'], ['Trial balance', 'List of accounts proving total debits equal total credits.'], ['Accounting cycle', 'Analyze → journalize → post → trial balance → adjust → statements → close.']]),
    u('Financial statements', ['Prepare income statements and balance sheets'], [['Income statement', 'Shows revenue, expenses and net income for a period.'], ['Balance sheet', 'Shows assets, liabilities and equity at a point in time.'], ['Net income', 'Revenue minus expenses.'], ['Depreciation', 'Spreading an asset’s cost over its useful life.']]),
    u('Payroll & taxes', ['Calculate payroll and withholdings'], [['Gross earnings', 'Pay before deductions.'], ['FICA', 'Social Security and Medicare taxes.'], ['Form 1040', 'The individual income tax return (VITA program focus).']]),
  ] },
  marketing: { label: 'Marketing', standards: 'Arizona CTE Marketing program standards', units: [
    u('Marketing basics', ['Explain the marketing concept and the 4 Ps'], [['Marketing mix (4 Ps)', 'Product, Price, Place, Promotion.'], ['Target market', 'The specific group a business aims to reach.'], ['Market segmentation', 'Dividing a market by demographics, geography, psychographics or behavior.'], ['SWOT analysis', 'Strengths, Weaknesses, Opportunities, Threats.']]),
    u('Promotion & selling', ['Plan promotions and personal selling'], [['Promotional mix', 'Advertising, sales promotion, public relations, personal selling.'], ['Brand', 'A name, symbol or design identifying a product.'], ['ROI', 'Return on investment.']]),
    u('Entrepreneurship', ['Write a basic business plan'], [['Entrepreneur', 'A person who starts and runs a business, taking on risk.'], ['Business plan', 'Document describing a business’s goals and strategy.'], ['Break-even point', 'Sales level where revenue equals total costs.']]),
  ] },
  sportsmed: { label: 'Sports Medicine', standards: 'Arizona CTE Sports Medicine & Rehabilitation standards', units: [
    u('Anatomy for sports medicine', ['Identify major bones, muscles and joints'], [['Ligament', 'Connects bone to bone.'], ['Tendon', 'Connects muscle to bone.'], ['ACL', 'Anterior cruciate ligament in the knee.'], ['Rotator cuff', 'Four muscles stabilizing the shoulder.']]),
    u('Injury care & prevention', ['Evaluate injuries and apply first aid'], [['RICE', 'Rest, Ice, Compression, Elevation.'], ['Sprain', 'Injury to a ligament.'], ['Strain', 'Injury to a muscle or tendon.'], ['Concussion', 'A brain injury caused by a blow or jolt to the head.'], ['Heat stroke', 'Life-threatening rise in body temperature; cool immediately and call 911.']]),
    u('Taping, rehab & careers', ['Apply taping techniques and rehab principles'], [['Range of motion', 'How far a joint can move.'], ['Athletic trainer', 'Licensed professional who prevents and treats sports injuries.'], ['Physical therapist', 'Professional who restores movement and function.']]),
  ] },
  earlychild: { label: 'Early Childhood Education', standards: 'Arizona CTE Early Childhood Education standards', units: [
    u('Child development', ['Describe physical, cognitive, social and emotional development'], [['Gross motor skills', 'Large movements like walking and jumping.'], ['Fine motor skills', 'Small movements like grasping and drawing.'], ['Piaget', 'Theorist of children’s cognitive stages.'], ['Developmentally appropriate practice', 'Teaching matched to a child’s age and development.']]),
    u('Health, safety & guidance', ['Maintain safe environments and positive guidance'], [['Positive guidance', 'Teaching appropriate behavior through encouragement and clear limits.'], ['Mandated reporter', 'Person legally required to report suspected child abuse.']]),
    u('Curriculum & careers', ['Plan age-appropriate learning activities'], [['Lesson plan', 'Plan with objectives, activities and assessment.'], ['Observation', 'Watching and recording children’s behavior to assess development.']]),
  ] },
  eduprof: { label: 'Education Professions', standards: 'Arizona CTE Education Professions standards', units: [
    u('Learners & learning', ['Explain how students learn'], [['Bloom’s taxonomy', 'Levels of thinking from remember to create.'], ['Differentiation', 'Adjusting instruction for different learners.'], ['Formative assessment', 'Checks for understanding during learning.'], ['Summative assessment', 'Evaluation at the end of a unit.']]),
    u('Planning & teaching', ['Write and deliver a lesson'], [['Learning objective', 'Statement of what students will be able to do.'], ['Classroom management', 'Strategies for an organized, respectful classroom.']]),
  ] },
  software: { label: 'Software & App Design', standards: 'Arizona CTE Software & App Design standards', units: [
    u('Programming fundamentals', ['Use variables, conditionals and loops'], [['Variable', 'A named storage location for data.'], ['Conditional', 'Code that runs only if a condition is true (if/else).'], ['Loop', 'Code that repeats (for, while).'], ['Function', 'A reusable, named block of code.'], ['Algorithm', 'Step-by-step instructions to solve a problem.']]),
    u('Data & debugging', ['Use lists and debug programs'], [['Array / list', 'An ordered collection of values.'], ['Boolean', 'A true/false value.'], ['Syntax error', 'Code that breaks the language’s rules.'], ['Logic error', 'Code runs but gives the wrong result.']]),
    u('App design', ['Design user interfaces and test apps'], [['User interface (UI)', 'What the user sees and interacts with.'], ['User experience (UX)', 'How easy and pleasant the app is to use.'], ['Iteration', 'Repeatedly improving a design based on testing.']]),
  ] },
  graphic: { label: 'Graphic Design', standards: 'Arizona CTE Graphic Design standards', units: [
    u('Design principles', ['Apply elements and principles of design'], [['Contrast', 'Difference that creates visual interest.'], ['Alignment', 'Lining up elements to create order.'], ['Hierarchy', 'Arranging elements to show importance.'], ['White space', 'Empty space that gives a design room to breathe.']]),
    u('Typography & color', ['Choose typefaces and color schemes'], [['Serif', 'Typeface with small strokes at letter ends.'], ['Sans serif', 'Typeface without those strokes.'], ['Kerning', 'Space between individual letter pairs.'], ['Complementary colors', 'Opposites on the color wheel.'], ['CMYK vs RGB', 'Print colors (cyan, magenta, yellow, black) vs. screen colors (red, green, blue).']]),
    u('Software & production', ['Use raster and vector tools'], [['Raster image', 'Made of pixels; loses quality when enlarged.'], ['Vector image', 'Made of paths; scales without losing quality.'], ['Resolution', 'Pixel density, e.g. 300 dpi for print.']]),
  ] },
  film: { label: 'Film & TV Production', standards: 'Arizona CTE Film & TV standards', units: [
    u('Pre-production', ['Write scripts, storyboards and shot lists'], [['Storyboard', 'Panels sketching each shot.'], ['Shot list', 'Planned list of every shot.'], ['Logline', 'One-sentence summary of a story.']]),
    u('Camera & sound', ['Use shots, angles, lighting and audio'], [['Rule of thirds', 'Placing subjects along a 3×3 grid.'], ['Close-up', 'Shot filling the frame with a subject’s face or detail.'], ['Three-point lighting', 'Key, fill and back light.'], ['B-roll', 'Supplemental footage.']]),
    u('Post-production', ['Edit for continuity and story'], [['Continuity', 'Consistent details from shot to shot.'], ['J-cut / L-cut', 'Audio leading or trailing the video cut.'], ['Color grading', 'Adjusting color for mood and consistency.']]),
  ] },
  digitalcomm: { label: 'Digital Communications', standards: 'Arizona CTE Digital Communications standards', units: [
    u('Media literacy & ethics', ['Evaluate media and follow copyright law'], [['Copyright', 'Legal protection for original creative work.'], ['Fair use', 'Limited use of copyrighted work for purposes like education or commentary.'], ['Creative Commons', 'Licenses that let creators share work with conditions.']]),
    u('Producing content', ['Plan and produce digital media'], [['Target audience', 'The people a message is designed for.'], ['Call to action', 'A prompt telling the audience what to do next.']]),
  ] },
  interior: { label: 'Interior Architectural Design', standards: 'Arizona CTE Interior Design standards', units: [
    u('Elements & principles', ['Apply design elements and principles to spaces'], [['Scale', 'Size of an object relative to the space.'], ['Proportion', 'Size relationships between parts.'], ['Focal point', 'Area that draws the eye first.']]),
    u('Space planning & drafting', ['Read floor plans and plan traffic flow'], [['Floor plan', 'Overhead drawing of a room’s layout.'], ['Traffic pattern', 'The paths people use to move through a space.'], ['Elevation', 'Drawing of a wall seen straight on.']]),
  ] },
  construction: { label: 'Construction Technologies', standards: 'Arizona CTE Construction Technologies standards', units: [
    u('Safety & tools', ['Follow OSHA safety and use hand and power tools'], [['OSHA', 'Occupational Safety and Health Administration.'], ['PPE', 'Personal protective equipment (glasses, gloves, hard hat).'], ['GFCI', 'Ground-fault circuit interrupter that prevents shocks.']]),
    u('Blueprints & framing', ['Read blueprints and frame walls'], [['Blueprint', 'Technical drawing of a building plan.'], ['Stud', 'Vertical framing member, usually 16 in on center.'], ['Header', 'Beam over a door or window opening.']]),
  ] },
  jrotc: { label: 'Air Force JROTC (Aerospace Science)', standards: 'Air Force JROTC curriculum', units: [
    u('Aviation history', ['Trace the history of flight'], [['Wright brothers', 'Made the first powered, controlled flight in 1903.'], ['Charles Lindbergh', 'First solo nonstop transatlantic flight (1927).'], ['Tuskegee Airmen', 'First Black military aviators in the US armed forces (WWII).']]),
    u('Science of flight', ['Explain the four forces of flight'], [['Lift', 'Upward force from airflow over the wings.'], ['Thrust', 'Forward force from engines.'], ['Drag', 'Air resistance opposing motion.'], ['Bernoulli’s principle', 'Faster-moving air has lower pressure.']]),
    u('Leadership', ['Practice leadership, customs and courtesies'], [['Chain of command', 'Order of authority in an organization.'], ['Core values (USAF)', 'Integrity first, service before self, excellence in all we do.']]),
  ] },
  journalism: { label: 'Journalism / Newspaper / Yearbook', standards: 'ELA elective', units: [
    u('News writing', ['Write leads and inverted-pyramid stories'], [['Lead', 'Opening sentence(s) of a news story, answering who/what/when/where/why.'], ['Inverted pyramid', 'Most important information first.'], ['Attribution', 'Stating where information came from.'], ['AP style', 'Associated Press rules for news writing.']]),
    u('Ethics & law', ['Apply press ethics and law'], [['Libel', 'Publishing false statements that damage reputation.'], ['Objectivity', 'Reporting without personal bias.']]),
  ] },
  creative: { label: 'Creative Writing', standards: 'ELA elective', units: [
    u('Fiction craft', ['Develop character, setting and conflict'], [['Show, don’t tell', 'Reveal through action and detail rather than statements.'], ['Dialogue', 'Characters’ spoken words.'], ['In medias res', 'Starting a story in the middle of the action.']]),
    u('Poetry craft', ['Experiment with form and figurative language'], [['Free verse', 'Poetry without regular meter or rhyme.'], ['Enjambment', 'A sentence continuing past the end of a line.'], ['Haiku', 'Three lines of 5–7–5 syllables.']]),
  ] },
  speech: { label: 'Communications / Public Speaking', standards: 'ELA elective', units: [
    u('Speech preparation', ['Organize informative and persuasive speeches'], [['Thesis', 'The central idea of a speech.'], ['Monroe’s motivated sequence', 'Attention, need, satisfaction, visualization, action.'], ['Extemporaneous', 'Prepared but delivered from brief notes.']]),
    u('Delivery', ['Use voice, eye contact and gestures'], [['Projection', 'Speaking loudly enough to be heard.'], ['Pacing', 'Speed of delivery.'], ['Filler words', 'Um, like, you know — avoid them.']]),
  ] },
  cinema: { label: 'Cinema Studies', standards: 'ELA elective', units: [
    u('Film language', ['Analyze shots, editing and sound'], [['Mise-en-scène', 'Everything placed in the frame: set, lighting, costume, actors.'], ['Montage', 'Editing a sequence of shots to compress time or build meaning.'], ['Diegetic sound', 'Sound that exists in the film’s world.']]),
    u('Genres & movements', ['Compare genres and film movements'], [['Film noir', '1940s–50s crime films with dark visuals and moral ambiguity.'], ['Auteur', 'A director with a distinctive personal style.']]),
  ] },
  comptech: { label: 'Computer Technology', standards: 'Elective', units: [
    u('Digital literacy', ['Use productivity software and stay safe online'], [['Phishing', 'Fake messages that trick you into giving personal information.'], ['Two-factor authentication', 'A second step beyond a password to log in.'], ['Spreadsheet formula', 'Calculation starting with = (e.g. =SUM(A1:A5)).'], ['Cloud storage', 'Saving files on remote servers accessed online.']]),
  ] },
};

// ------------------------------------------------------------------ term banks for DVUSD-guide courses
export const TERM_BANKS = {
  pe: [['FITT principle', 'Frequency, Intensity, Time, Type: the variables of an exercise plan.'], ['Overload', 'Working harder than normal to improve fitness.'], ['Progression', 'Gradually increasing workload over time.'], ['Specificity', 'Training the specific body part or skill you want to improve.'], ['Target heart rate', 'About 60–85% of max heart rate (max ≈ 220 − age).'], ['Aerobic exercise', 'Sustained activity using oxygen (running, cycling).'], ['Anaerobic exercise', 'Short, intense bursts without enough oxygen (sprinting, lifting).'], ['Body composition', 'Ratio of fat mass to lean mass.'], ['Isometric contraction', 'Muscle tenses without changing length (plank).'], ['Concentric vs eccentric', 'Muscle shortening vs. lengthening under load.'], ['Static stretch', 'Holding a stretch without movement; best after exercise.'], ['Dynamic stretch', 'Moving stretches; best as a warm-up.']],
  strength: [['Repetition (rep)', 'One complete movement of an exercise.'], ['Set', 'A group of repetitions.'], ['1RM', 'One-repetition maximum: the most weight you can lift once.'], ['Hypertrophy', 'Increase in muscle size.'], ['Spotter', 'Partner who assists and keeps a lifter safe.'], ['Compound exercise', 'Works several muscle groups (squat, deadlift, bench press).'], ['Progressive overload', 'Gradually increasing weight, reps or volume.']],
  health: [['Wellness', 'Balance of physical, mental, emotional and social health.'], ['Nutrients', 'Carbohydrates, proteins, fats, vitamins, minerals and water.'], ['Calorie', 'Unit of energy in food.'], ['MyPlate', 'USDA guide: fruits, vegetables, grains, protein, dairy.'], ['Addiction', 'Compulsive use of a substance despite harm.'], ['Tolerance', 'Needing more of a drug to get the same effect.'], ['Communicable disease', 'An illness that spreads from person to person.'], ['Chronic disease', 'A long-lasting condition such as diabetes or heart disease.'], ['CPR', 'Chest compressions (and breaths) to keep blood flowing in cardiac arrest.'], ['Refusal skills', 'Strategies for saying no to risky behavior.'], ['Stress', 'The body’s response to a demand or threat.'], ['Consent', 'Clear, freely given agreement.']],
  visual: [['Elements of art', 'Line, shape, form, color, value, texture, space.'], ['Principles of design', 'Balance, contrast, emphasis, movement, pattern, rhythm, unity.'], ['Value', 'Lightness or darkness of a color.'], ['Complementary colors', 'Opposite on the color wheel (red/green, blue/orange).'], ['Analogous colors', 'Next to each other on the color wheel.'], ['Positive / negative space', 'Space occupied by the subject / the space around it.'], ['Perspective', 'Creating depth on a flat surface (e.g. one-point perspective).'], ['Composition', 'Arrangement of elements in a work of art.'], ['Critique (DAIJ)', 'Describe, Analyze, Interpret, Judge.'], ['Portfolio', 'A curated collection of an artist’s best work.']],
  ceramics: [['Greenware', 'Unfired clay.'], ['Bisqueware', 'Clay fired once, before glazing.'], ['Wedging', 'Kneading clay to remove air bubbles.'], ['Slip', 'Liquid clay used as glue.'], ['Score and slip', 'Scratch surfaces and add slip to join clay.'], ['Kiln', 'Oven for firing ceramics.'], ['Coil / slab / pinch', 'The three main hand-building methods.']],
  theatre: [['Blocking', 'The planned movement of actors on stage.'], ['Upstage / downstage', 'Away from / toward the audience.'], ['Stage left / right', 'Actor’s left / right when facing the audience.'], ['Proscenium', 'Stage framed by an arch, with the audience on one side.'], ['Monologue', 'A long speech by one character.'], ['Objective', 'What a character wants in a scene.'], ['Improvisation', 'Unscripted, spontaneous performance.'], ['Strike', 'Taking down the set after a production.'], ['Cue', 'A signal for an actor or technical change.'], ['Projection', 'Speaking loudly and clearly to reach the audience.']],
  dance: [['Choreography', 'The art of designing dance sequences.'], ['Elements of dance (BEST)', 'Body, Energy, Space, Time.'], ['Plié', 'Ballet bend of the knees.'], ['Relevé', 'Rising onto the balls of the feet.'], ['Level', 'High, middle or low position in space.'], ['Tempo', 'Speed of the music or movement.'], ['Canon', 'Dancers perform the same movement one after another.'], ['Unison', 'Dancers move together at the same time.']],
  music: [['Tempo', 'Speed of the music (allegro = fast, adagio = slow).'], ['Dynamics', 'Volume: pp, p, mp, mf, f, ff.'], ['Crescendo', 'Gradually getting louder.'], ['Time signature', 'Top number: beats per measure; bottom: which note gets the beat.'], ['Key signature', 'Sharps or flats at the start of a staff that set the key.'], ['Fermata', 'Hold the note longer than written.'], ['Staccato', 'Short, detached notes.'], ['Legato', 'Smooth, connected notes.'], ['Intonation', 'Playing or singing in tune.'], ['Interval', 'Distance between two pitches (e.g. M3, P5).'], ['Sight-reading', 'Performing music at first sight.']],
};

export const LANG_CTE = { ...LANG, ...CTE };
