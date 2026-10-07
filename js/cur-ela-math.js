// Orbit study outlines for O'Connor English and math courses (see dvcurriculum.js for how sources work).
export const u = (title, topics, terms = []) => ({ title, topics, terms });

// ------------------------------------------------------------------ English
const ELA_SKILLS = [
  ['Claim', 'The main argument a writer makes and must support with evidence.'],
  ['Textual evidence', 'Quotes, paraphrases or details from a text used to support an interpretation.'],
  ['Theme', 'The central message or insight about life that a work explores.'],
  ['Thesis statement', 'One or two sentences stating the main point an essay will prove.'],
  ['Counterclaim', 'An opposing argument a writer acknowledges and then rebuts.'],
  ['MLA format', 'A citation style (author-page in-text citations + Works Cited list) used in English classes.'],
];
const ELA = {
  ela9: {
    label: 'English Language Arts 1-2 (Grade 9)', standards: 'Arizona ELA Standards, grades 9–10',
    units: [
      u('Short stories & the elements of fiction', ['Identify plot structure, conflict and point of view', 'Analyze how authors develop complex characters', 'Determine theme and how details shape it'], [
        ['Exposition', 'The opening of a story that introduces characters, setting and background.'], ['Rising action', 'Events that build tension toward the climax.'], ['Climax', 'The turning point of highest tension in a plot.'], ['Resolution', 'The end of the story where the conflict is resolved.'], ['Internal conflict', 'A struggle within a character’s own mind.'], ['External conflict', 'A struggle between a character and an outside force.'], ['Point of view', 'The perspective from which a story is told (first, second, third limited or omniscient).'], ['Foreshadowing', 'Hints about events that will happen later in a story.'],
      ]),
      u('Poetry', ['Analyze figurative language, sound and structure', 'Explain how form contributes to meaning'], [
        ['Metaphor', 'A direct comparison of two unlike things without “like” or “as”.'], ['Simile', 'A comparison using “like” or “as”.'], ['Personification', 'Giving human qualities to non-human things.'], ['Imagery', 'Language that appeals to the five senses.'], ['Alliteration', 'Repetition of initial consonant sounds in nearby words.'], ['Stanza', 'A group of lines forming a unit in a poem.'], ['Tone', 'The author’s attitude toward the subject.'], ['Mood', 'The feeling a text creates in the reader.'],
      ]),
      u('Drama (e.g. Romeo and Juliet)', ['Analyze how dialogue and stage directions reveal character', 'Trace dramatic irony and tragic structure'], [
        ['Soliloquy', 'A long speech a character gives alone on stage, revealing inner thoughts.'], ['Aside', 'A brief remark to the audience that other characters do not hear.'], ['Dramatic irony', 'When the audience knows something the characters do not.'], ['Tragic flaw', 'A character trait that leads to a hero’s downfall (hamartia).'], ['Iambic pentameter', 'A line of ten syllables in five unstressed–stressed pairs, common in Shakespeare.'], ['Foil', 'A character who contrasts with another to highlight their traits.'],
      ]),
      u('Novel study', ['Track character development and theme across a long text', 'Write a literary analysis paragraph with embedded evidence'], [
        ['Protagonist', 'The main character of a story.'], ['Antagonist', 'The character or force that opposes the protagonist.'], ['Symbol', 'An object or image that represents a larger idea.'], ['Motif', 'A recurring image, idea or element that supports a theme.'], ['Characterization', 'How an author reveals a character (direct or indirect).'],
      ]),
      u('Argument & informational writing', ['Delineate an argument and evaluate its reasoning', 'Write an argument with a clear claim, evidence and reasoning'], ELA_SKILLS),
      u('Research & grammar', ['Gather relevant sources and avoid plagiarism', 'Use correct sentence structure and punctuation'], [
        ['Paraphrase', 'Restating a source’s idea in your own words (still requires a citation).'], ['Plagiarism', 'Presenting someone else’s words or ideas as your own.'], ['Run-on sentence', 'Two independent clauses joined without proper punctuation.'], ['Semicolon', 'Punctuation that joins two closely related independent clauses.'], ['Credible source', 'A source that is accurate, current, unbiased and written by a qualified author.'],
      ]),
    ],
  },
  ela10: {
    label: 'English Language Arts 3-4 (Grade 10, world literature)', standards: 'Arizona ELA Standards, grades 9–10',
    units: [
      u('World literature & cultural context', ['Analyze how culture and history shape a text', 'Compare perspectives from different world traditions'], [
        ['Cultural context', 'The beliefs, history and values of the society in which a work was written.'], ['Archetype', 'A universal character, symbol or pattern (e.g. the hero’s journey).'], ['Allegory', 'A story in which characters and events represent abstract ideas.'], ['Satire', 'Using humor, irony or exaggeration to criticize people or society.'], ['Epic', 'A long narrative poem about a heroic figure.'],
      ]),
      u('Drama & tragedy', ['Analyze tragic structure and the tragic hero', 'Explain how a playwright builds tension'], [
        ['Tragic hero', 'A noble character whose flaw leads to their downfall.'], ['Catharsis', 'The emotional release an audience feels at the end of a tragedy.'], ['Hubris', 'Excessive pride, a common tragic flaw.'], ['Chorus', 'In Greek drama, a group that comments on the action.'],
      ]),
      u('Rhetoric & nonfiction', ['Identify rhetorical appeals and devices', 'Evaluate the effectiveness of an argument'], [
        ['Ethos', 'An appeal to the speaker’s credibility or character.'], ['Pathos', 'An appeal to the audience’s emotions.'], ['Logos', 'An appeal to logic, facts and reasoning.'], ['Rhetorical question', 'A question asked for effect rather than an answer.'], ['Anaphora', 'Repetition of a word or phrase at the start of successive clauses.'], ['Diction', 'An author’s word choice.'],
      ]),
      u('Research paper', ['Develop a research question and thesis', 'Synthesize multiple sources with correct MLA citations'], ELA_SKILLS),
    ],
  },
  ela11: {
    label: 'English Language Arts 5-6 (Grade 11, American literature)', standards: 'Arizona ELA Standards, grades 11–12',
    units: [
      u('Foundations of American literature', ['Analyze founding documents and early American writing', 'Explain Puritan and Enlightenment ideas in texts'], [
        ['Puritanism', 'Early American religious movement emphasizing hard work, sin and God’s will.'], ['Enlightenment', '18th-century movement valuing reason, science and individual rights.'], ['Declaration of Independence', '1776 document by Jefferson arguing for natural rights and independence.'], ['Jeremiad', 'A sermon or text lamenting a society’s moral decline.'],
      ]),
      u('Romanticism & Transcendentalism', ['Explain how Romantic and Transcendentalist writers view nature and the individual'], [
        ['Romanticism', 'Movement valuing emotion, imagination, nature and the individual.'], ['Transcendentalism', 'Emerson and Thoreau’s belief in intuition, self-reliance and the divinity of nature.'], ['Dark Romanticism', 'Poe, Hawthorne and Melville’s focus on sin, evil and the irrational.'], ['Self-reliance', 'Emerson’s idea of trusting one’s own judgment over society’s.'],
      ]),
      u('Realism, Naturalism & Modernism', ['Analyze how literature responded to the Civil War, industry and World War I'], [
        ['Realism', 'Movement depicting ordinary life accurately, without idealizing it.'], ['Naturalism', 'Belief that heredity and environment control human fate.'], ['Modernism', 'Early 20th-century writing marked by fragmentation, disillusionment and experimentation.'], ['Harlem Renaissance', '1920s flowering of African American art and literature (Hughes, Hurston).'], ['Stream of consciousness', 'Narration that follows a character’s continuous flow of thoughts.'],
      ]),
      u('Contemporary voices & the American Dream', ['Evaluate how the American Dream is portrayed and challenged'], [
        ['American Dream', 'The idea that anyone can achieve success through hard work.'], ['Unreliable narrator', 'A narrator whose credibility is questionable.'], ['Juxtaposition', 'Placing two contrasting things side by side for effect.'],
      ]),
      u('Research, speech & argument', ['Deliver a persuasive speech', 'Write a research-based argument'], ELA_SKILLS),
    ],
  },
  ela12: {
    label: 'English Language Arts 7-8 (Grade 12)', standards: 'Arizona ELA Standards, grades 11–12',
    units: [
      u('Comparative world themes', ['Compare how texts from different times treat a common theme'], [
        ['Comparative analysis', 'Examining similarities and differences between two or more texts.'], ['Universal theme', 'A message that applies across cultures and time periods.'], ['Frame narrative', 'A story told within another story.'],
      ]),
      u('British literature & drama', ['Analyze Shakespearean tragedy and its language'], [
        ['Anglo-Saxon period', 'Early English era of epic poetry such as Beowulf.'], ['Sonnet', 'A 14-line poem, often in iambic pentameter.'], ['Blank verse', 'Unrhymed iambic pentameter.'], ['Pun', 'A play on words with multiple meanings.'],
      ]),
      u('Essay strategies & college writing', ['Develop sentences and paragraphs with varied syntax', 'Write timed essays and a college personal statement'], [
        ['Topic sentence', 'The sentence stating a paragraph’s main idea.'], ['Transition', 'A word or phrase connecting ideas (however, therefore).'], ['Syntax', 'The arrangement of words and phrases in a sentence.'], ['Personal statement', 'A college application essay about the writer’s experiences and goals.'],
      ]),
      u('Argument & research', ['Write an evidence-based argument'], ELA_SKILLS),
    ],
  },
};

// ------------------------------------------------------------------ Math
const MATH = {
  alg1: {
    label: 'Algebra 1-2', standards: 'Arizona Mathematics Standards — Algebra I',
    units: [
      u('Expressions & equations', ['Solve multi-step linear equations and inequalities', 'Rearrange formulas for a variable'], [
        ['Variable', 'A letter that represents an unknown value.'], ['Coefficient', 'The number multiplied by a variable (in 4x, it is 4).'], ['Like terms', 'Terms with the same variable raised to the same power.'], ['Distributive property', 'a(b + c) = ab + ac.'], ['Inequality', 'A statement comparing values with <, >, ≤ or ≥; flip the sign when multiplying or dividing by a negative.'], ['Literal equation', 'An equation with several variables, like a formula, solved for one of them.'],
      ]),
      u('Linear functions', ['Interpret slope and intercepts in context', 'Write and graph lines in slope-intercept, point-slope and standard form'], [
        ['Function', 'A relation where each input has exactly one output.'], ['Slope', 'Rate of change: rise over run, (y₂ − y₁)/(x₂ − x₁).'], ['y-intercept', 'Where a graph crosses the y-axis (the value of y when x = 0).'], ['Slope-intercept form', 'y = mx + b, where m is slope and b is the y-intercept.'], ['Point-slope form', 'y − y₁ = m(x − x₁).'], ['Domain', 'The set of all possible inputs of a function.'], ['Range', 'The set of all possible outputs of a function.'],
      ]),
      u('Systems of equations', ['Solve systems by graphing, substitution and elimination'], [
        ['System of equations', 'Two or more equations with the same variables.'], ['Substitution method', 'Solve one equation for a variable and substitute into the other.'], ['Elimination method', 'Add or subtract equations to cancel a variable.'], ['No solution', 'Parallel lines: same slope, different intercepts.'], ['Infinitely many solutions', 'The two equations describe the same line.'],
      ]),
      u('Exponents & exponential functions', ['Apply exponent rules', 'Model growth and decay with exponential functions'], [
        ['Product rule', 'xᵃ · xᵇ = xᵃ⁺ᵇ.'], ['Power rule', '(xᵃ)ᵇ = xᵃᵇ.'], ['Zero exponent', 'Any nonzero number to the 0 power equals 1.'], ['Negative exponent', 'x⁻ⁿ = 1/xⁿ.'], ['Exponential growth', 'y = a(1 + r)ˣ, where r is the growth rate.'], ['Exponential decay', 'y = a(1 − r)ˣ, where r is the decay rate.'],
      ]),
      u('Polynomials & factoring', ['Add, subtract and multiply polynomials', 'Factor GCF, trinomials and difference of squares'], [
        ['Polynomial', 'A sum of terms with whole-number exponents.'], ['Degree', 'The highest exponent in a polynomial.'], ['Binomial', 'A polynomial with two terms.'], ['Trinomial', 'A polynomial with three terms.'], ['Difference of squares', 'a² − b² = (a + b)(a − b).'], ['GCF', 'Greatest common factor, factored out first.'],
      ]),
      u('Quadratic functions', ['Graph parabolas and identify vertex and roots', 'Solve quadratics by factoring, square roots, completing the square and the quadratic formula'], [
        ['Quadratic function', 'f(x) = ax² + bx + c; its graph is a parabola.'], ['Vertex', 'The highest or lowest point of a parabola; x = −b/(2a).'], ['Axis of symmetry', 'The vertical line through the vertex.'], ['Roots / zeros', 'The x-values where f(x) = 0 (x-intercepts).'], ['Quadratic formula', 'x = (−b ± √(b² − 4ac)) / (2a).'], ['Discriminant', 'b² − 4ac: positive = 2 real roots, zero = 1, negative = none.'],
      ]),
      u('Statistics', ['Summarize data with center and spread', 'Interpret scatter plots and lines of best fit'], [
        ['Mean', 'The average: sum of values divided by how many.'], ['Median', 'The middle value when data are ordered.'], ['Interquartile range', 'Q3 − Q1, the spread of the middle 50%.'], ['Outlier', 'A value far from the rest of the data.'], ['Correlation coefficient (r)', 'A number from −1 to 1 measuring strength and direction of a linear relationship.'], ['Correlation vs causation', 'Two variables moving together does not prove one causes the other.'],
      ]),
    ],
  },
  geo: {
    label: 'Geometry 1-2', standards: 'Arizona Mathematics Standards — Geometry',
    units: [
      u('Foundations & transformations', ['Use precise definitions of points, lines and angles', 'Describe translations, reflections, rotations and dilations'], [
        ['Rigid transformation', 'A move that preserves size and shape: translation, reflection or rotation.'], ['Dilation', 'A transformation that enlarges or shrinks a figure by a scale factor.'], ['Congruent', 'Same size and shape.'], ['Similar', 'Same shape, proportional sides, equal angles.'], ['Midpoint formula', '((x₁ + x₂)/2, (y₁ + y₂)/2).'], ['Distance formula', '√((x₂ − x₁)² + (y₂ − y₁)²).'],
      ]),
      u('Angles, lines & proof', ['Prove theorems about angles formed by parallel lines and a transversal', 'Write two-column and paragraph proofs'], [
        ['Vertical angles', 'Opposite angles formed by intersecting lines; always congruent.'], ['Corresponding angles', 'Same position at each intersection with parallel lines; congruent.'], ['Alternate interior angles', 'On opposite sides of the transversal, inside the parallel lines; congruent.'], ['Supplementary angles', 'Two angles adding to 180°.'], ['Complementary angles', 'Two angles adding to 90°.'], ['Postulate', 'A statement accepted as true without proof.'],
      ]),
      u('Triangles & congruence', ['Prove triangles congruent', 'Use triangle sum and exterior angle theorems'], [
        ['Triangle sum theorem', 'The interior angles of a triangle add to 180°.'], ['SSS, SAS, ASA, AAS', 'Shortcuts that prove two triangles are congruent.'], ['CPCTC', 'Corresponding parts of congruent triangles are congruent.'], ['Isosceles triangle theorem', 'Angles opposite congruent sides are congruent.'], ['Exterior angle theorem', 'An exterior angle equals the sum of the two remote interior angles.'],
      ]),
      u('Similarity & right triangles', ['Use similarity to solve problems', 'Apply the Pythagorean theorem and trigonometric ratios'], [
        ['Pythagorean theorem', 'a² + b² = c² in a right triangle.'], ['SOH CAH TOA', 'sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.'], ['45-45-90 triangle', 'Sides in ratio 1 : 1 : √2.'], ['30-60-90 triangle', 'Sides in ratio 1 : √3 : 2.'], ['AA similarity', 'Two pairs of congruent angles make triangles similar.'],
      ]),
      u('Circles', ['Relate central angles, inscribed angles, arcs and chords', 'Write equations of circles'], [
        ['Radius', 'Distance from the center to the circle.'], ['Inscribed angle', 'Half the measure of its intercepted arc.'], ['Tangent', 'A line touching a circle at one point; perpendicular to the radius there.'], ['Circle equation', '(x − h)² + (y − k)² = r².'], ['Arc length', '(θ/360) × 2πr.'],
      ]),
      u('Area, volume & probability', ['Find area and volume of 2-D and 3-D figures', 'Calculate probabilities of compound events'], [
        ['Area of a circle', 'πr².'], ['Volume of a cylinder', 'πr²h.'], ['Volume of a cone', '(1/3)πr²h.'], ['Volume of a sphere', '(4/3)πr³.'], ['Independent events', 'P(A and B) = P(A) · P(B).'], ['Conditional probability', 'P(B | A) = P(A and B) / P(A).'],
      ]),
    ],
  },
  alg2: {
    label: 'Algebra 3-4 (Algebra II)', standards: 'Arizona Mathematics Standards — Algebra II',
    units: [
      u('Functions & transformations', ['Transform parent functions', 'Find inverses and compose functions'], [
        ['Parent function', 'The simplest function of a family (e.g. y = x²).'], ['Vertical shift', 'f(x) + k moves the graph up k units.'], ['Horizontal shift', 'f(x − h) moves the graph right h units.'], ['Inverse function', 'Undoes f; swap x and y and solve.'], ['Composition', '(f ∘ g)(x) = f(g(x)).'],
      ]),
      u('Quadratics & complex numbers', ['Solve quadratics with complex solutions'], [
        ['Imaginary unit', 'i = √−1, so i² = −1.'], ['Complex number', 'a + bi.'], ['Complex conjugate', 'a − bi; multiplying conjugates gives a real number.'], ['Vertex form', 'y = a(x − h)² + k.'],
      ]),
      u('Polynomial functions', ['Analyze end behavior and zeros', 'Divide polynomials'], [
        ['End behavior', 'What f(x) does as x → ±∞; set by the leading term.'], ['Multiplicity', 'How many times a zero repeats; even = touches, odd = crosses.'], ['Remainder theorem', 'f(a) equals the remainder when f(x) is divided by (x − a).'], ['Fundamental theorem of algebra', 'A degree-n polynomial has n complex roots.'],
      ]),
      u('Rational & radical functions', ['Simplify rational expressions', 'Solve radical equations and check for extraneous solutions'], [
        ['Vertical asymptote', 'Where the denominator is zero (after canceling).'], ['Horizontal asymptote', 'End behavior of a rational function, from comparing degrees.'], ['Extraneous solution', 'A solution that appears algebraically but fails in the original equation.'], ['Rational exponent', 'x^(m/n) = ⁿ√(xᵐ).'],
      ]),
      u('Exponential & logarithmic functions', ['Convert between exponential and log form', 'Solve exponential equations with logs'], [
        ['Logarithm', 'log_b(x) = y means bʸ = x.'], ['Natural log', 'ln x = log base e.'], ['Product rule (logs)', 'log(ab) = log a + log b.'], ['Change of base', 'log_b(x) = log x / log b.'], ['Compound interest', 'A = P(1 + r/n)ⁿᵗ.'], ['Continuous growth', 'A = Pe^(rt).'],
      ]),
      u('Sequences, trig & statistics', ['Use arithmetic and geometric sequences', 'Extend trig to the unit circle', 'Use normal distributions'], [
        ['Arithmetic sequence', 'aₙ = a₁ + (n − 1)d.'], ['Geometric sequence', 'aₙ = a₁ · rⁿ⁻¹.'], ['Radian', 'An angle measure; π radians = 180°.'], ['Unit circle', 'Circle of radius 1; a point is (cos θ, sin θ).'], ['Normal distribution', 'Bell-shaped; about 68–95–99.7% within 1, 2, 3 standard deviations.'],
      ]),
    ],
  },
  precalc: {
    label: 'Precalculus H', standards: 'Arizona Mathematics Standards — Precalculus',
    units: [
      u('Functions & their graphs', ['Analyze families of functions, piecewise functions and inverses'], [
        ['Even function', 'f(−x) = f(x); symmetric about the y-axis.'], ['Odd function', 'f(−x) = −f(x); symmetric about the origin.'], ['Piecewise function', 'A function defined by different rules on different intervals.'], ['One-to-one', 'Each output comes from exactly one input; needed for an inverse.'],
      ]),
      u('Polynomial, rational, exponential & log functions', ['Model with these functions and solve equations'], [
        ['Rational root theorem', 'Possible rational roots are ±(factors of constant)/(factors of leading coefficient).'], ['Oblique asymptote', 'Occurs when the numerator’s degree is one more than the denominator’s.'], ['e', 'Euler’s number, about 2.718.'],
      ]),
      u('Trigonometric functions', ['Use the unit circle and graph sine and cosine', 'Prove identities and solve trig equations'], [
        ['Amplitude', 'Half the distance between max and min of a sinusoid.'], ['Period', 'Length of one cycle; for sin(bx) it is 2π/b.'], ['Pythagorean identity', 'sin²θ + cos²θ = 1.'], ['Law of sines', 'a/sin A = b/sin B = c/sin C.'], ['Law of cosines', 'c² = a² + b² − 2ab cos C.'],
      ]),
      u('Vectors, polar & parametric', ['Operate on vectors', 'Convert between polar and rectangular coordinates'], [
        ['Vector', 'A quantity with magnitude and direction.'], ['Dot product', 'u · v = u₁v₁ + u₂v₂.'], ['Polar coordinates', '(r, θ): distance from origin and angle.'], ['Parametric equations', 'x and y both written in terms of a third variable t.'],
      ]),
      u('Limits & sequences (intro to calculus)', ['Find limits numerically and graphically', 'Sum series'], [
        ['Limit', 'The value a function approaches as x approaches a number.'], ['Geometric series sum', 'S = a₁ / (1 − r) when |r| < 1.'], ['Sigma notation', 'Σ shorthand for a sum.'],
      ]),
    ],
  },
  stats: {
    label: 'Probability & Statistics', standards: 'Arizona Mathematics Standards — Statistics & Probability',
    units: [
      u('Collecting data', ['Design surveys and experiments; spot bias'], [
        ['Population', 'The entire group you want to learn about.'], ['Sample', 'The part of the population you actually measure.'], ['Simple random sample', 'Every group of n individuals has an equal chance of being chosen.'], ['Bias', 'A systematic error that favors certain outcomes.'], ['Control group', 'The group that does not receive the treatment.'], ['Placebo', 'A fake treatment used for comparison.'],
      ]),
      u('Describing data', ['Choose displays and summarize center and spread'], [
        ['Histogram', 'Bar graph of a quantitative variable’s distribution.'], ['Standard deviation', 'Typical distance of values from the mean.'], ['Skewed right', 'A long tail to the right; mean > median.'], ['Box plot', 'Display of the five-number summary.'], ['z-score', '(x − mean) / standard deviation.'],
      ]),
      u('Probability', ['Compute probabilities with rules, tables and tree diagrams'], [
        ['Sample space', 'The set of all possible outcomes.'], ['Complement', 'P(not A) = 1 − P(A).'], ['Mutually exclusive', 'Events that cannot happen together.'], ['Addition rule', 'P(A or B) = P(A) + P(B) − P(A and B).'], ['Expected value', 'The long-run average: Σ x · P(x).'],
      ]),
      u('Distributions & inference', ['Use normal and binomial models', 'Interpret confidence intervals and margin of error'], [
        ['Binomial distribution', 'Counts successes in n independent trials with the same p.'], ['Normal distribution', 'Symmetric bell curve described by mean and SD.'], ['Margin of error', 'How far the true value is likely to be from the estimate.'], ['Confidence interval', 'A range of plausible values for a population parameter.'], ['Statistical significance', 'A result unlikely to happen by chance alone.'],
      ]),
    ],
  },
  trig: {
    label: 'Trigonometry', standards: 'Arizona Mathematics Standards — Trigonometry',
    units: [
      u('Angles & the unit circle', ['Convert degrees and radians', 'Find exact trig values'], [
        ['Radian', 'Angle that cuts an arc equal to the radius; π rad = 180°.'], ['Reference angle', 'The acute angle a terminal side makes with the x-axis.'], ['Coterminal angles', 'Angles that share a terminal side (differ by 360°).'], ['ASTC', 'All Students Take Calculus: which trig functions are positive in each quadrant.'],
      ]),
      u('Graphs of trig functions', ['Graph and transform sine, cosine and tangent'], [
        ['Amplitude', '|a| in y = a sin(bx).'], ['Period', '2π/|b| for sine and cosine.'], ['Phase shift', 'Horizontal shift of a sinusoid.'], ['Tangent period', 'π/|b|.'],
      ]),
      u('Identities & equations', ['Verify identities and solve equations'], [
        ['Reciprocal identities', 'csc = 1/sin, sec = 1/cos, cot = 1/tan.'], ['Pythagorean identity', 'sin²θ + cos²θ = 1.'], ['Double-angle (sine)', 'sin 2θ = 2 sin θ cos θ.'],
      ]),
      u('Solving triangles', ['Use the laws of sines and cosines'], [
        ['Law of sines', 'a/sin A = b/sin B = c/sin C.'], ['Law of cosines', 'c² = a² + b² − 2ab cos C.'], ['Ambiguous case', 'SSA can give 0, 1 or 2 triangles.'], ['Area (SAS)', '(1/2)ab sin C.'],
      ]),
    ],
  },
  collegealg: {
    label: 'College Algebra / College Math', standards: 'Arizona Mathematics Standards — Algebra II & beyond',
    units: [
      u('Equations & inequalities', ['Solve linear, quadratic, absolute-value and rational equations'], [
        ['Absolute value equation', '|x| = a means x = a or x = −a.'], ['Interval notation', 'Brackets include an endpoint, parentheses exclude it.'], ['Quadratic formula', 'x = (−b ± √(b² − 4ac)) / (2a).'],
      ]),
      u('Functions', ['Analyze, combine and invert functions'], [
        ['Function notation', 'f(x) names the output for input x.'], ['Average rate of change', '(f(b) − f(a)) / (b − a).'], ['Inverse function', 'f⁻¹ undoes f.'],
      ]),
      u('Polynomial & rational functions', ['Find zeros and asymptotes'], [
        ['Synthetic division', 'A shortcut for dividing a polynomial by (x − c).'], ['Asymptote', 'A line a graph approaches but does not reach.'],
      ]),
      u('Exponential & logarithmic models', ['Solve growth, decay and interest problems'], [
        ['Logarithm', 'log_b(x) = y means bʸ = x.'], ['Half-life', 'Time for a quantity to fall to half its amount.'], ['Compound interest', 'A = P(1 + r/n)ⁿᵗ.'],
      ]),
      u('Systems & matrices', ['Solve systems with matrices'], [
        ['Matrix', 'A rectangular array of numbers.'], ['Row reduction', 'Using row operations to solve a system.'], ['Determinant', 'A number from a square matrix; if 0, no unique solution.'],
      ]),
    ],
  },
  finmath: {
    label: 'Financial Math', standards: 'Arizona Mathematics + Personal Finance standards',
    units: [
      u('Income & taxes', ['Calculate gross and net pay', 'Read a pay stub and understand tax withholding'], [
        ['Gross pay', 'Total earnings before deductions.'], ['Net pay', 'Take-home pay after taxes and deductions.'], ['FICA', 'Social Security and Medicare payroll taxes.'], ['W-4', 'Form telling your employer how much tax to withhold.'], ['W-2', 'Form showing a year’s wages and taxes withheld.'],
      ]),
      u('Banking & budgeting', ['Build a budget', 'Compare checking and savings accounts'], [
        ['Budget', 'A plan for spending and saving income.'], ['50/30/20 rule', '50% needs, 30% wants, 20% savings.'], ['Emergency fund', 'Savings for unexpected expenses, often 3–6 months of costs.'], ['APY', 'Annual percentage yield, including compounding.'],
      ]),
      u('Credit & loans', ['Calculate interest on loans and credit cards', 'Explain how credit scores work'], [
        ['APR', 'Annual percentage rate charged on borrowed money.'], ['Credit score', 'A number (300–850) estimating how likely you are to repay debt.'], ['Principal', 'The amount borrowed, not counting interest.'], ['Amortization', 'Paying off a loan with regular payments of interest and principal.'], ['Minimum payment', 'Smallest amount due; paying only this makes debt last much longer.'],
      ]),
      u('Saving & investing', ['Compare investment options and the power of compounding'], [
        ['Compound interest', 'Interest earned on both principal and previously earned interest.'], ['Rule of 72', '72 ÷ interest rate ≈ years to double money.'], ['Stock', 'A share of ownership in a company.'], ['Bond', 'A loan to a company or government that pays interest.'], ['Diversification', 'Spreading money across investments to reduce risk.'], ['Roth IRA', 'Retirement account funded with after-tax money that grows tax-free.'],
      ]),
      u('Big purchases & insurance', ['Compare buying vs. leasing and renting vs. owning', 'Explain insurance terms'], [
        ['Down payment', 'Upfront cash paid toward a large purchase.'], ['Deductible', 'What you pay before insurance pays.'], ['Premium', 'The regular price of an insurance policy.'], ['Depreciation', 'Loss of value over time, e.g. a new car.'],
      ]),
    ],
  },
};

export const ELA_MATH = { ...ELA, ...MATH };
