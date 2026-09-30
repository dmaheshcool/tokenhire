/** Prefix formula-like cells so Excel does not execute them. */
export function formulaSafe(value) {
  const s = String(value ?? "");
  if (/^[=+\-@\t]/.test(s)) return `'${s}`;
  return s;
}
