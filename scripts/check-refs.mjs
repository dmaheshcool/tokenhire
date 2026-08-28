// Catches components and helpers that are used but never imported or defined.
// These crash only when a specific branch renders, so a build succeeds and the bug
// ships. Run with: node scripts/check-refs.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname;
const GLOBALS = new Set([
  "React", "Fragment", "Math", "JSON", "Object", "Array", "String", "Number", "Boolean",
  "Date", "Map", "Set", "Promise", "Error", "URL", "Intl", "RegExp", "TextEncoder",
  "SpeechSynthesisUtterance", "Image", "FileReader", "Blob", "MutationObserver",
  "IntersectionObserver", "ResizeObserver", "Notification", "AbortController",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}

let bad = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");

  const known = new Set(GLOBALS);
  // import { a, b as c } from ...  /  import d from ...  /  import * as e from ...
  for (const m of src.matchAll(/import\s+([^;]+?)\s+from\s+["'][^"']+["']/g)) {
    for (const part of m[1].split(/[,{}]/)) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) known.add(name);
    }
  }
  for (const m of src.matchAll(/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) known.add(m[1]);
  for (const m of src.matchAll(/^\s*(?:export\s+)?(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) known.add(m[1]);
  // locally destructured or assigned names anywhere (params, consts inside functions)
  for (const m of src.matchAll(/(?:const|let|var)\s+\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/[:=]/).pop()?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) known.add(name);
    }
  }
  for (const m of src.matchAll(/(?:const|let|var)\s+\[([^\]]+)\]/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) known.add(name);
    }
  }
  // component params like function Foo({ Icon: I }) and ({ I }) => ...
  for (const m of src.matchAll(/\(\s*\{([^}]*)\}\s*\)\s*(?:=>|\{)/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/[:=]/).pop()?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) known.add(name);
    }
  }
  // array-destructured callback params, e.g. .map(([id, label, Icon]) => ...)
  for (const m of src.matchAll(/\(\s*\[([^\]]*)\]\s*(?:,[^)]*)?\)\s*=>/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/[:=]/).pop()?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) known.add(name);
    }
  }

  const missing = new Set();
  for (const m of src.matchAll(/<([A-Z][\w$]*)/g)) {
    if (!known.has(m[1])) missing.add(m[1]);
  }

  if (missing.size) {
    bad += missing.size;
    console.log(`${file.replace(ROOT, "src")}: ${[...missing].join(", ")}`);
  }
}

if (bad) {
  console.log(`\n${bad} undefined component reference(s).`);
  process.exit(1);
}
console.log("No undefined component references.");
