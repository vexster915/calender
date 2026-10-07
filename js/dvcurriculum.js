// Curriculum for O'Connor (DVUSD) catalog courses, from three kinds of source (always shown in the app):
//   'dvusd' — units and outcomes from DVUSD's own public curriculum guides (PE, Health, visual and
//             performing arts, band/choir, Spanish), with a link to the guide.
//   'orbit' — Orbit's study outline aligned to the Arizona standards the planning guide lists, used
//             where DVUSD's guide is staff-only (district login), e.g. HS science and social studies.
//   'standards' — no public district curriculum, so the study plan is built from published standards:
//             Arizona's (goals cited by code) or the AP / national framework, linked in `sources`.
//             Orbit outlines that were deepened this way (cur-augment.js) also show as 'standards'.
//   'none'  — no public curriculum: the course description plus whatever PDFs you upload.
// Units carry `topics` (learning goals → checklist) and `terms` ([term, definition] → flashcards).
import { ELA_MATH } from './cur-ela-math.js';
import { SCI_SS } from './cur-sci-ss.js';
import { LANG_CTE, TERM_BANKS } from './cur-lang-cte.js';
import { DV_OUTCOMES } from './dvoutcomes.js';
import { DEEP_CTE, DEEP_CAP, DEEP_MUSIC, DEEP_ELECT } from './cur-deep.js';
import { DEEP_ELD, DEEP_WL } from './cur-deep-lang.js';
import { AUG } from './cur-augment.js';
import { toSources, uniqTerms } from './stdkit.js';

const OUTLINES = { ...ELA_MATH, ...SCI_SS, ...LANG_CTE };
const DEEP = { ...DEEP_CTE, ...DEEP_CAP, ...DEEP_MUSIC, ...DEEP_ELECT, ...DEEP_ELD, ...DEEP_WL };

// An Orbit outline plus its standards-based additions (extra goals/terms per unit, new units).
function augmented(key, c) {
  const a = AUG[key];
  if (!a) return { label: c.label, source: c.source || 'orbit', sourceName: c.sourceName, sourceUrl: c.sourceUrl, standards: c.standards, units: c.units };
  const sources = toSources(a.src);
  const units = c.units.map((x, i) => (a.extend?.[i] ? { ...x, topics: [...new Set([...x.topics, ...a.extend[i].g])], terms: uniqTerms([...x.terms, ...a.extend[i].t]) } : x));
  return { label: c.label, source: 'standards', standards: [c.standards, ...sources.map((s) => s.name)].filter(Boolean).join('; '), sourceName: sources[0].name, sourceUrl: sources[0].url, sources, units: [...units, ...(a.units || [])] };
}
const BANK_LABEL = { pe: 'Fitness vocabulary', strength: 'Strength training vocabulary', health: 'Health vocabulary', visual: 'Art vocabulary', ceramics: 'Ceramics vocabulary', theatre: 'Theatre vocabulary', dance: 'Dance vocabulary', music: 'Music vocabulary' };

export function curriculumFor(course) {
  if (!course) return null;
  const vocab = (bank) => (bank && TERM_BANKS[bank] ? [{ title: BANK_LABEL[bank], topics: [], terms: TERM_BANKS[bank] }] : []);
  if (course.cur?.startsWith('dv:')) {
    const o = DV_OUTCOMES[course.cur];
    if (o) return { label: o.label, source: 'dvusd', sourceName: o.sourceName, sourceUrl: o.sourceUrl, units: [...o.units.map((x) => ({ ...x, terms: [] })), ...vocab(course.bank || o.bank)] };
  }
  if (course.cur && DEEP[course.cur]) return DEEP[course.cur];
  const c = course.cur && OUTLINES[course.cur];
  if (c) return augmented(course.cur, c);
  if (course.bank) return { label: course.title, source: 'orbit', standards: 'Key vocabulary for this course', units: vocab(course.bank) };
  return { label: course.title, source: 'none', units: [] };
}

export const OUTLINE_KEYS = [...new Set([...Object.keys(OUTLINES), ...Object.keys(DEEP)])];
