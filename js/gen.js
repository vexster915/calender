// Turns raw class material (PDF text, pasted notes) into study cards — entirely in the browser.
//
// It looks for the ways notes usually express facts:
//   1. Glossary lines        "Mitosis: division of a cell into two identical cells"
//                            "Osmosis – diffusion of water across a membrane"
//   2. Definition sentences  "Photosynthesis is the process plants use to..."
//   3. Q&A pairs             "Q: What is ATP?  A: The cell's energy currency"
//   4. Fill-in-the-blank     key sentences with their most important word blanked out
// and ranks key sentences to produce a short "Key points" summary.

const STOP = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can
  could did do does doing down during each either else ever every few for from further had has have having he her here hers him his
  how however i if in into is it its itself just least less like made make many may me might more most much must my neither no nor
  not now of off often on once one only or other our ours out over own per perhaps rather same several she should since so some such
  than that the their theirs them then there these they this those though through thus to too under until up upon us use used using
  very was we were what when where whether which while who whom whose why will with within without would yet you your also etc eg ie
  called known include includes including example examples important therefore another first second third new way ways
  get gets got take takes took taken place part form time number type types kind kinds thing things well much makes another around across along among toward towards via each`.split(/\s+/),
);
const PRONOUN_START = /^(it|this|that|these|those|they|he|she|there|here|which|what|who|we|you|i|one|each|some|many|most|all|such)\b/i;

// ---------- text cleanup ----------
export function cleanText(raw) {
  return String(raw || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[­​]/g, '') // soft hyphens, zero-width
    .replace(/[ \t ]+/g, ' ')
    .replace(/(\w)-\n(\w)/g, '$1$2') // re-join hyphenated line breaks
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const BULLET = /^\s*(?:[-•*▪●◦‣∙·–]|\(?\d{1,3}[.)]|\(?[a-z][.)])\s+/;
const DEF_LINE = /^([A-Za-z][^:=–—]{0,70}?)\s*(?::|=|–|—|\s-\s)\s*(.+)$/;

// "Term: …", "Term – …" at the start of a line begins a new glossary entry.
function looksLikeEntry(line) {
  const m = line.match(/^([A-Z][\w'()/+ -]{0,50}?)\s*(?::|–|—|-(?=\s))\s+\S/);
  return !!m && wordCount(m[1]) <= 5;
}

function isHeading(line) {
  const words = line.split(/\s+/);
  return words.length <= 8 && !/[.:;,]$/.test(line) && (line === line.toUpperCase() || /^(chapter|unit|section|lesson|part)\b/i.test(line));
}

// Merge wrapped lines back together, keeping bullets / new definitions / headings as boundaries.
function logicalLines(text) {
  const out = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      out.push('');
      continue;
    }
    const prev = out[out.length - 1];
    const continues =
      prev &&
      !BULLET.test(line) &&
      !isHeading(line) &&
      !isHeading(prev) &&
      !looksLikeEntry(line) &&
      !/[.!?:]$/.test(prev) &&
      (/^[a-z(,;]/.test(line) || prev.length > 60);
    if (continues) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out;
}

function tidy(s) {
  return s
    .replace(BULLET, '')
    .replace(/\s+/g, ' ')
    .replace(/^["'(\s]+|["')\s]+$/g, '')
    .trim();
}
function sentenceCase(s) {
  s = s.trim().replace(/[.;,]$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

export function splitSentences(text) {
  const paragraphs = logicalLines(text)
    .join('\n')
    .split(/\n{2,}|\n(?=\s*(?:[-•*▪●]|\d+[.)])\s)/);
  const out = [];
  for (const p of paragraphs) {
    const flat = p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!flat) continue;
    // Split on sentence ends, but not after common abbreviations or initials.
    const parts = flat.split(/(?<=[.!?])\s+(?=["(]?[A-Z0-9])/);
    let buf = '';
    for (const part of parts) {
      buf = buf ? `${buf} ${part}` : part;
      if (/\b(e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|St|Fig|No|approx|ca)\.$/i.test(buf) || /\b[A-Z]\.$/.test(buf)) continue;
      out.push(tidy(buf));
      buf = '';
    }
    if (buf) out.push(tidy(buf));
  }
  return out.filter((s) => s.length > 3);
}

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

// ---------- keyword statistics ----------
function keywordStats(sentences) {
  const freq = new Map();
  const display = new Map();
  for (const s of sentences) {
    for (const w of s.match(/[A-Za-z][A-Za-z'-]{2,}/g) || []) {
      const k = w.toLowerCase();
      if (STOP.has(k) || k.length < 4) continue;
      freq.set(k, (freq.get(k) || 0) + 1);
      if (!display.has(k) || /^[a-z]/.test(display.get(k))) display.set(k, w);
    }
  }
  return { freq, display };
}

// ---------- extractors ----------
function glossaryCards(lines) {
  const cards = [];
  for (const raw of lines) {
    const line = tidy(raw);
    if (line.length < 8 || line.length > 400) continue;
    const m = line.match(DEF_LINE);
    if (!m) continue;
    const term = m[1].trim();
    const def = m[2].trim();
    const tw = wordCount(term);
    if (tw > 7 || wordCount(def) < 2 || def.length < 6) continue;
    if (/^(q|a|question|answer|note|notes|example|examples|figure|fig|page|source|name|date|class|period|due|http|https|www)$/i.test(term)) continue;
    if (/^\d+$/.test(term) || /\d{1,2}:\d{2}/.test(line.slice(0, 8))) continue; // times like 10:30
    if (/[.!?]$/.test(term)) continue;
    if (line === line.toUpperCase() || /^(unit|chapter|section|lesson|part|week|day)\s*\d/i.test(term)) continue;
    cards.push({ term: sentenceCase(term), def: sentenceCase(def), kind: 'def' });
  }
  return cards;
}

const VERB = /\s+(?:is|are|refers to|refer to|means|is defined as|are defined as|is known as|describes|is called)\s+/;
function definitionSentenceCards(sentences) {
  const cards = [];
  for (const s of sentences) {
    const wc = wordCount(s);
    if (wc < 5 || wc > 45) continue;
    const m = s.match(VERB);
    if (!m) continue;
    let term = s.slice(0, m.index).replace(/^(the|a|an)\s+/i, '').trim();
    let def = s.slice(m.index + m[0].length).trim();
    const tw = wordCount(term);
    if (!term || tw > 5 || PRONOUN_START.test(term) || /[,;:]/.test(term)) continue;
    if (/^(not|also|often|usually|very|more|less|only|then|in|on|at|by|to|so)\b/i.test(def)) continue;
    if (wordCount(def) < 3) continue;
    // Term should look like a noun phrase: mostly content words.
    const content = term.split(/\s+/).filter((w) => !STOP.has(w.toLowerCase()));
    if (!content.length) continue;
    if (m[0].includes('is called') || m[0].includes('is known as')) [term, def] = [def.replace(/[.!?]$/, ''), term];
    cards.push({ term: sentenceCase(term), def: sentenceCase(def), kind: 'def' });
  }
  return cards;
}

function qaCards(lines) {
  const cards = [];
  for (let i = 0; i < lines.length; i++) {
    const line = tidy(lines[i]);
    const inline = line.match(/^(?:q(?:uestion)?\s*\d*[:.)]\s*)(.+?\?)\s*(?:a(?:nswer)?\s*[:.)]\s*)(.+)$/i);
    if (inline) {
      cards.push({ term: inline[1], def: sentenceCase(inline[2]), kind: 'qa' });
      continue;
    }
    const q = line.match(/^(?:q(?:uestion)?\s*\d*[:.)]\s*)?(.{8,200}\?)$/i);
    if (q && lines[i + 1]) {
      const next = tidy(lines[i + 1]);
      const a = next.match(/^(?:a(?:nswer)?\s*[:.)]\s*)?(.{1,300})$/i);
      if (a && !/\?$/.test(next) && (/^(q|question)/i.test(line) || /^(a|answer)\b/i.test(next))) {
        cards.push({ term: q[1], def: sentenceCase(a[1]), kind: 'qa' });
        i++;
      }
    }
  }
  return cards;
}

function scoreSentences(sentences, stats) {
  return sentences.map((s, i) => {
    const words = (s.match(/[A-Za-z][A-Za-z'-]{2,}/g) || []).map((w) => w.toLowerCase()).filter((w) => !STOP.has(w) && w.length >= 4);
    const wc = wordCount(s);
    let score = words.reduce((t, w) => t + Math.log1p(stats.freq.get(w) || 0), 0) / Math.sqrt(Math.max(wc, 1));
    if (wc < 7 || wc > 45) score *= 0.3;
    if (/\d/.test(s)) score *= 1.1;
    if (/^(for example|for instance|however|but|and|so|also)\b/i.test(s)) score *= 0.6;
    if (PRONOUN_START.test(s)) score *= 0.7;
    if (/^[a-z]/.test(s) || /^(q|a)\s*:/i.test(s)) score *= 0.2;
    if (/\?$/.test(s)) score *= 0.4;
    return { s, i, score };
  });
}

function clozeCards(scored, stats, used, limit) {
  const cards = [];
  for (const { s } of [...scored].sort((a, b) => b.score - a.score)) {
    if (cards.length >= limit) break;
    const wc = wordCount(s);
    if (wc < 7 || wc > 40 || used.has(norm(s))) continue;
    if (/^[a-z]/.test(s) || /\?$/.test(s) || /^(q|a|question|answer)\s*[:.)]/i.test(s)) continue;
    // Candidate answers: numbers/years, capitalised multi-word names, then high-frequency keywords.
    const candidates = [];
    for (const m of s.matchAll(/\b(1[0-9]{3}|20[0-9]{2}|\d+(?:\.\d+)?%?)\b/g)) candidates.push({ text: m[1], score: 2.2, at: m.index });
    for (const m of s.matchAll(/\b([A-Z][a-z]+(?:\s+(?:of\s+)?[A-Z][a-z]+)+)\b/g)) if (m.index > 0) candidates.push({ text: m[1], score: 3, at: m.index });
    for (const m of s.matchAll(/[A-Za-z][A-Za-z'-]{3,}/g)) {
      const k = m[0].toLowerCase();
      if (STOP.has(k)) continue;
      const f = stats.freq.get(k) || 0;
      if (f < 2 && !/^[A-Z]/.test(m[0])) continue;
      candidates.push({ text: m[0], score: Math.log1p(f) * (m[0].length > 6 ? 1.25 : 1) * (/^[A-Z]/.test(m[0]) && m.index > 0 ? 1.4 : 1), at: m.index });
    }
    if (!candidates.length) continue;
    candidates.sort((a, b) => b.score - a.score);
    const pick = candidates[0];
    if (pick.score < 1) continue;
    const blanked = `${s.slice(0, pick.at)}_____${s.slice(pick.at + pick.text.length)}`;
    used.add(norm(s));
    cards.push({ term: blanked, def: pick.text, kind: 'cloze' });
  }
  return cards;
}

// ---------- public ----------
export function generateCards(rawText, { maxCards = 60, cloze = true } = {}) {
  const text = cleanText(rawText);
  const lines = logicalLines(text).filter(Boolean);
  const sentences = splitSentences(text);
  const stats = keywordStats(sentences);

  const seen = new Set();
  const used = new Set();
  const cards = [];
  const push = (c) => {
    const k = norm(c.term);
    if (!k || seen.has(k) || c.term.length > 300 || c.def.length > 500) return;
    seen.add(k);
    cards.push(c);
  };
  qaCards(lines).forEach(push);
  glossaryCards(lines).forEach(push);
  definitionSentenceCards(sentences).forEach((c) => {
    push(c);
  });
  for (const c of cards) used.add(norm(`${c.term} ${c.def}`));
  for (const s of sentences) {
    const ls = s.toLowerCase();
    if (cards.some((c) => ls.includes(c.def.slice(0, 30).toLowerCase()))) used.add(norm(s));
  }

  const scored = scoreSentences(sentences, stats);
  if (cloze) clozeCards(scored, stats, used, Math.max(0, Math.min(25, maxCards - cards.length))).forEach(push);

  const keyPoints = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
    .filter((s) => wordCount(s) >= 6);

  const topics = [...stats.freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([k]) => stats.display.get(k));

  return { cards: cards.slice(0, maxCards), keyPoints, topics, stats: { words: wordCount(text), sentences: sentences.length } };
}

// Paste/import: "term<TAB>definition" per line (Quizlet export), or "term - def", "term: def", "term, def".
export function parseImport(text, sep = 'auto') {
  const rows = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const seps = { tab: '\t', dash: ' - ', colon: ':', comma: ',' };
  let chosen = sep;
  if (sep === 'auto') {
    const count = (s) => rows.filter((r) => r.includes(s)).length;
    chosen = Object.entries(seps).sort((a, b) => count(b[1]) - count(a[1]))[0][0];
    if (!rows.some((r) => r.includes(seps[chosen]))) return [];
  }
  const s = seps[chosen];
  return rows
    .map((r) => {
      const i = r.indexOf(s);
      if (i <= 0) return null;
      const term = r.slice(0, i).trim();
      const def = r.slice(i + s.length).trim();
      return term && def ? { term, def, kind: 'manual' } : null;
    })
    .filter(Boolean);
}

// ---------- answer checking ----------
function simplify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(the|a|an|to|of)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// Returns 'correct' | 'close' | 'wrong'
export function checkAnswer(given, expected) {
  const g = simplify(given);
  const e = simplify(expected);
  if (!g) return 'wrong';
  if (g === e) return 'correct';
  const tol = Math.max(1, Math.floor(e.length * 0.15));
  if (levenshtein(g, e) <= tol) return 'correct';
  // Long answers: enough of the key words present
  const ew = e.split(' ').filter((w) => w.length > 3 && !STOP.has(w));
  if (ew.length >= 3) {
    const gw = new Set(g.split(' '));
    const hit = ew.filter((w) => gw.has(w) || [...gw].some((x) => x.length > 3 && levenshtein(x, w) <= 1)).length;
    if (hit / ew.length >= 0.7) return 'correct';
    if (hit / ew.length >= 0.4) return 'close';
  }
  if (e.includes(g) && g.length >= e.length * 0.5) return 'close';
  if (levenshtein(g, e) <= tol * 2) return 'close';
  return 'wrong';
}
