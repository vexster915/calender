// Helpers that turn the Arizona standards (azstandards.js) into study-plan units: learning goals come
// from the standards (tagged with their code), key terms are Orbit's own 'term|definition' strings.
import { AZ } from './azstandards.js';

// Strip the heading text the standards pages run into the first item of a group, and cut sub-bullets.
export function tidy(text) {
  let t = String(text).replace(/\s+/g, ' ').trim();
  const sub = t.match(/\b\d+\.[A-Z] (?=[A-Z])/); // "COMPLEX COMMUNICATION: … 1.A Functions…"
  if (sub) t = t.slice(sub.index + sub[0].length);
  t = t.replace(/^\d+\.[A-Z]\.? /, '')
    .replace(/^[A-Z][A-Za-z]+(?: [A-Z][a-z]+)* - (?=[A-Z])/, '') // "Empowered Learner - Students…"
    .replace(/^[A-Z][A-Za-z ]+\([A-Z]+\) [A-Z]+ (?=[A-Z])/, '') // "Numerical Reasoning (NR) NR …"
    .split(/ [•✓] /)[0]
    .replace(/\. \d+-\d+\.\d+ .*$/, '') // edtech: next standard's text run on
    .replace(/ (Mathematically proficient students|Examples?:|Include problem-solving).*$/, '')
    .replace(/\s*\*\s*/g, ' ').trim();
  if (t.length > 230) t = t.replace(/\s*[([](?:e\.g\.|i\.e\.|such as|including)[^)\]]*[)\]]/g, ''); // drop example lists
  if (t.length > 230) {
    const cut = t.slice(0, 230).search(/(\. |; | \(e\.g\.,|, including )(?![^(]*\))[^.;]*$/);
    t = cut > 60 ? t.slice(0, cut) : `${t.slice(0, 220).replace(/\s+\S*$/, '')}…`;
  }
  return t.replace(/[.;:,]+$/, '');
}

// Goals from one standards set. `test` filters on the code (RegExp) or the whole item (function).
export function std(set, test, max = 8) {
  const s = AZ[set];
  if (!s) throw new Error(`unknown standards set ${set}`);
  const ok = typeof test === 'function' ? test : (i) => test.test(i[0].trim().replace(/\.$/, ''));
  const coded = !/^(Novice|Intermediate|Proficient|Accomplished|Advanced)$/.test(s.items[0]?.[0]);
  return s.items.filter(ok).slice(0, max).map(([code, text]) => (coded ? `${tidy(text)} (AZ ${code.trim().replace(/\.$/, '')})` : tidy(text)));
}

export const terms = (list) => list.map((x) => { const i = x.indexOf('|'); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
// Drops repeated goals and repeated terms (same term, any case) so merged sources don't double up.
export const uniqTerms = (list) => { const seen = new Set(); return list.filter(([t]) => { const k = t.trim().toLowerCase(); return !seen.has(k) && seen.add(k); }); };
export const unit = (title, topics, list = []) => ({ title, topics: [...new Set(topics.flat(Infinity).filter(Boolean))], terms: uniqTerms(terms(list)) });
export const ref = (set) => ({ name: AZ[set].name, url: AZ[set].url });
export const ext = (name, url) => ({ name, url });

// A curriculum record. The first source is the primary link shown in the app.
export const toSources = (list) => list.map((x) => (typeof x === 'string' ? ref(x) : x));
export function plan(label, sources, units) {
  const s = toSources(sources);
  return { label, source: 'standards', standards: s.map((x) => x.name).join('; '), sourceName: s[0].name, sourceUrl: s[0].url, sources: s, units };
}

// One unit per Arizona CTE standard heading: the measures are the goals, CTE_TERMS the flashcards.
export function cteUnits(set, termList, max = 12) {
  const items = AZ[set].items;
  const heads = [...new Set(items.map((i) => i[2]))];
  return heads.map((h, n) => unit(h, items.filter((i) => i[2] === h).slice(0, max).map(([c, t]) => `${tidy(t)} (AZ ${c})`), termList[n] || []));
}

// Arts standards: goals for one artistic process (Create/Perform/Respond/Connect) at chosen levels.
const PROCESS = { create: /Generate/, perform: /Select, Analyze/, respond: /Perceive/, connect: /Synthesize/ };
export const arts = (set, process, levels, max = 6) => std(set, (i) => PROCESS[process].test(i[2]) && levels.includes(i[0]), max);
