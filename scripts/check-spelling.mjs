import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { copyFromSource, findUsSpellings } from "../src/lib/spelling.js";

const ROOT = new URL("..", import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(jsx?|json)$/.test(name) && !name.endsWith(".test.js") ? [p] : [];
  });
}

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, out);
  return out;
}

export function spellingProblems() {
  const problems = [];
  const report = (file, texts) => {
    for (const s of texts) for (const h of findUsSpellings(s)) problems.push(`${relative(ROOT, file)}: "${h.word}" → ${h.fix}`);
  };
  for (const file of walk(join(ROOT, "src"))) {
    const text = readFileSync(file, "utf8");
    if (file.endsWith(".json")) report(file, strings(JSON.parse(text)));
    else if (!file.endsWith("spelling.js")) report(file, copyFromSource(text));
  }
  const html = join(ROOT, "index.html");
  report(html, [...readFileSync(html, "utf8").matchAll(/<title>([^<]*)<|content="([^"]*)"/g)].map((m) => m[1] ?? m[2]));
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = spellingProblems();
  if (problems.length) {
    console.error(`Use en-IN spelling in copy:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
}
