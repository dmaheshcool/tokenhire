// Every user-facing string lives in src/locales/en.json.
// t("home.hero.sub") or t("card.inQueue", { n: 42 }) for text, tl("home.candidates.bullets") for lists.
import EN from "../locales/en.json" with { type: "json" };

export const STRINGS = EN;

function lookup(path) {
  return path.split(".").reduce((o, key) => (o == null ? o : o[key]), STRINGS);
}

function fill(text, vars) {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (m, key) => (vars[key] != null ? String(vars[key]) : m));
}

export function t(path, vars) {
  const v = lookup(path);
  if (typeof v !== "string") return path;
  return fill(v, vars);
}

/** A list from the copy file: strings are filled, objects are returned as they are. */
export function tl(path, vars) {
  const v = lookup(path);
  if (!Array.isArray(v)) return [];
  return v.map((item) => (typeof item === "string" ? fill(item, vars) : item));
}
