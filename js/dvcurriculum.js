// Curriculum for O'Connor (DVUSD) catalog courses, from three kinds of source (always shown in the app):
//   'dvusd' — units and outcomes from DVUSD's own public curriculum guides (PE, Health, visual and
//             performing arts, band/choir, Spanish), with a link to the guide.
//   'orbit' — Orbit's study outline aligned to the Arizona standards the planning guide lists, used
//             where DVUSD's guide is staff-only (district login), e.g. HS science and social studies.
//   'none'  — no public curriculum: the course description plus whatever PDFs you upload.
// Units carry `topics` (learning goals → checklist) and `terms` ([term, definition] → flashcards).
import { ELA_MATH } from './cur-ela-math.js';
import { SCI_SS } from './cur-sci-ss.js';
import { LANG_CTE, TERM_BANKS } from './cur-lang-cte.js';
import { DV_OUTCOMES } from './dvoutcomes.js';

const OUTLINES = { ...ELA_MATH, ...SCI_SS, ...LANG_CTE };
const BANK_LABEL = { pe: 'Fitness vocabulary', strength: 'Strength training vocabulary', health: 'Health vocabulary', visual: 'Art vocabulary', ceramics: 'Ceramics vocabulary', theatre: 'Theatre vocabulary', dance: 'Dance vocabulary', music: 'Music vocabulary' };

export function curriculumFor(course) {
  if (!course) return null;
  const vocab = (bank) => (bank && TERM_BANKS[bank] ? [{ title: BANK_LABEL[bank], topics: [], terms: TERM_BANKS[bank] }] : []);
  if (course.cur?.startsWith('dv:')) {
    const o = DV_OUTCOMES[course.cur];
    if (o) return { label: o.label, source: 'dvusd', sourceName: o.sourceName, sourceUrl: o.sourceUrl, units: [...o.units.map((x) => ({ ...x, terms: [] })), ...vocab(course.bank || o.bank)] };
  }
  const c = course.cur && OUTLINES[course.cur];
  if (c) return { label: c.label, source: c.source || 'orbit', sourceName: c.sourceName, sourceUrl: c.sourceUrl, standards: c.standards, units: c.units };
  if (course.bank) return { label: course.title, source: 'orbit', standards: 'Key vocabulary for this course', units: vocab(course.bank) };
  return { label: course.title, source: 'none', units: [] };
}

export const OUTLINE_KEYS = Object.keys(OUTLINES);
