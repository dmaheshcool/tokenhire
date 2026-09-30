import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const { readTheme, writeTheme } = await import("./theme-pref.js");

beforeEach(() => store.clear());

test("theme defaults to light and only stores an explicit dark choice", () => {
  assert.equal(readTheme(), "light");
  writeTheme("dark");
  assert.equal(readTheme(), "dark");
  writeTheme("light");
  assert.equal(readTheme(), "light");
});
