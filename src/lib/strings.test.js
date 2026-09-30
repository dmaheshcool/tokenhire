import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { STRINGS, t, tl } from "../i18n/strings.js";
import { copyFromSource, findUsSpellings } from "./spelling.js";

const SRC = new URL("..", import.meta.url).pathname;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(jsx?|mjs)$/.test(name) && !name.endsWith(".test.js") ? [p] : [];
  });
}

const lookup = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), STRINGS);

test("every t() and tl() path used in src exists in en.json", () => {
  const missing = [];
  for (const file of files(SRC)) {
    const text = readFileSync(file, "utf8");
    if (!/i18n\/strings\.js/.test(text)) continue;
    for (const [, fn, path] of text.matchAll(/\b(tl?)\("([A-Za-z0-9_.]+)"/g)) {
      const v = lookup(path);
      const ok = fn === "tl" ? Array.isArray(v) : typeof v === "string";
      if (!ok) missing.push(`${file.replace(SRC, "")}: ${fn}("${path}")`);
    }
  }
  assert.deepEqual(missing, []);
});

test("keys built at runtime exist", () => {
  const groups = {
    "status.": ["today", "tomorrow", "week", "ended", "later", "draft", "scheduled", "live", "wrapped"],
    "browse.exp.": ["any", "fresher", "0-1", "1-3", "3-5", "5+"],
    "browse.dates.": ["any", "today", "tomorrow", "week", "month"],
    "browse.payOpts.": ["any", "15", "25", "40", "60"],
    "browse.sorts.": ["soonest", "pay", "queue"],
    "card.payUnit.": ["month", "day", "hour", "task", "year", "fixed"],
    "console.form.payTypes.": ["month", "day", "hour", "task", "year", "fixed"],
    "console.form.fieldTypes.": ["text", "number", "yesno", "dropdown"],
    "library.kinds.": ["processes", "roles", "documents", "rounds"],
    "library.help.": ["processes", "roles", "documents", "rounds"],
    "library.addTitle.": ["processes", "roles", "documents", "rounds"],
    "library.placeholder.": ["processes", "roles", "documents", "rounds"],
    "checkin.": ["yes", "no"],
    "console.tabs.": ["queue", "rooms", "candidates", "report"],
    "ats.templates.": ["generic", "workday", "greenhouse", "lever", "zoho", "successfactors"],
    "ats.hints.": ["generic", "workday", "greenhouse", "lever", "zoho", "successfactors"],
    "console.report.funnel.": ["registered", "checkedIn", "interviewed", "shortlisted"],
    "console.report.states.": ["wait", "calling", "interviewing", "selected", "rejected", "onhold", "absent"],
    "console.queue.labels.": ["selected", "rejected", "onhold", "absent"],
    "token.decision.": ["selected", "rejected", "onhold"],
    "howPage.tabs.": ["candidates", "companies"],
    "forCo.pilot.": ["name", "email", "phone", "company", "city", "roles", "size"],
  };
  for (const [prefix, keys] of Object.entries(groups)) {
    for (const k of keys) assert.equal(typeof lookup(prefix + k), "string", prefix + k);
  }
  for (const e of ["noResults", "noCity", "noSaved"]) {
    for (const part of ["t", "d", "cta"]) assert.equal(typeof lookup(`empty.${e}.${part}`), "string", `empty.${e}.${part}`);
  }
});

test("placeholders use {{double braces}}", () => {
  const bad = [];
  const walk = (v, path) => {
    if (typeof v === "string") { if (/(^|[^{])\{\w+\}(?!\})/.test(v)) bad.push(path); return; }
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  };
  walk(STRINGS, "");
  assert.deepEqual(bad, []);
});

test("copy uses en-IN spelling", async () => {
  const { spellingProblems } = await import("../../scripts/check-spelling.mjs");
  assert.deepEqual(spellingProblems(), []);
});

test("spelling check flags US copy but not code values", () => {
  const found = (s) => findUsSpellings(s).map((h) => h.word);
  assert.deepEqual(found("A calm, organized day"), ["organized"]);
  assert.deepEqual(found("Pick a color"), ["color"]);
  assert.deepEqual(found("Visit the help center"), ["center"]);
  assert.deepEqual(found("A calm, organised day at the centre. Pick a colour."), []);
  const copy = copyFromSource(`<div style={{ textAlign: "center", color: k.mid }}>Primary color</div><input autoComplete="organization" />`);
  assert.deepEqual(copy.flatMap(found), ["color"]);
});

test("t fills {{vars}} and leaves unknown ones", () => {
  assert.equal(t("card.inQueue", { n: 12 }), "12 in queue");
  assert.equal(t("browse.cityTitle", { city: "Pune" }), "Walk-ins in Pune");
  assert.equal(t("card.inQueue"), "{{n}} in queue");
  assert.equal(t("no.such.key"), "no.such.key");
  assert.equal(tl("detail.before.tips").length, 3);
});
