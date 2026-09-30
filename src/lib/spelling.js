// Copy is written in Indian English (en-IN), which follows British spelling.
export const US_SPELLINGS = [
  [/\borgani[z]\w*/gi, "organis…"],
  [/\bcolor(s|ed|ful|ing)?\b/gi, "colour"],
  [/\bcenter(s|ed|ing)?\b/gi, "centre"],
  [/\bfavor\w*/gi, "favour…"],
  [/\bbehavior\w*/gi, "behaviour"],
  [/\bhonor\w*/gi, "honour"],
  [/\bneighbor\w*/gi, "neighbour"],
  [/\blabor\b/gi, "labour"],
  [/\banalyz\w*/gi, "analys…"],
  [/\b(real|recogn|priorit|custom|author|categor|optim|summar|apolog|emphas|final|minim|maxim|util|synchron|special)iz(e|es|ed|ing|ation|ations)\b/gi, "…ise / …isation"],
  [/\bcancel(ed|ing)\b/gi, "cancelled / cancelling"],
  [/\blabel(ed|ing)\b/gi, "labelled / labelling"],
  [/\benrollment\b/gi, "enrolment"],
  [/\bcatalog\b/gi, "catalogue"],
  [/\bgray\b/gi, "grey"],
];

export function findUsSpellings(text) {
  const hits = [];
  for (const [re, fix] of US_SPELLINGS) {
    for (const m of text.matchAll(re)) hits.push({ word: m[0], fix });
  }
  return hits;
}

// Pulls user-facing copy out of a JSX/JS source: JSX text between tags, and
// quoted strings that read like a sentence (start with a capital, contain a space).
// Single-word literals such as "center" or "organization" are code values, not copy.
export function copyFromSource(src) {
  const out = [];
  for (const [, s] of src.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) out.push(s);
  for (const [, , s] of src.matchAll(/(["'`])([A-Z][^"'`\n]*\s[^"'`\n]*)\1/g)) out.push(s);
  return out;
}
