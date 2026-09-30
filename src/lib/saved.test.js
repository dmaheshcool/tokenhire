import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const events = [];
globalThis.window = { dispatchEvent: (e) => events.push(e.type), addEventListener() {}, removeEventListener() {} };
globalThis.CustomEvent ??= class { constructor(type) { this.type = type; } };

const { SAVED_KEY, mergeSaved, readSaved, removeSaved, setSavedSync, toggleSaved } = await import("./saved.js");

beforeEach(() => { store.clear(); events.length = 0; setSavedSync(null); });

test("saves under th_saved_v1 with a version and save time", () => {
  toggleSaved("d1", 1000);
  assert.deepEqual(JSON.parse(store.get(SAVED_KEY)), { v: 1, items: [{ id: "d1", at: 1000 }] });
  assert.equal(SAVED_KEY, "th_saved_v1");
  toggleSaved("d1");
  assert.deepEqual(readSaved(), []);
  assert.ok(events.includes("th:saved"));
});

test("moves the old saved list over once", () => {
  store.set("th_saved_drives", JSON.stringify(["a", "b"]));
  assert.deepEqual(readSaved().map((x) => x.id), ["a", "b"]);
  assert.equal(store.has("th_saved_drives"), false);
  assert.equal(JSON.parse(store.get(SAVED_KEY)).items.length, 2);
});

test("survives a corrupt value", () => {
  store.set(SAVED_KEY, "{not json");
  assert.deepEqual(readSaved(), []);
});

test("remove and merge keep one entry per walk-in, earliest time wins", () => {
  toggleSaved("a", 50);
  toggleSaved("b", 60);
  removeSaved(["a"]);
  assert.deepEqual(readSaved().map((x) => x.id), ["b"]);
  mergeSaved([{ id: "b", at: 10 }, { id: "c", at: 70 }]);
  assert.deepEqual(readSaved(), [{ id: "b", at: 10 }, { id: "c", at: 70 }]);
});

test("a sync adapter sees every change", () => {
  const pushed = [];
  setSavedSync({ push: (items) => pushed.push(items.map((x) => x.id)) });
  toggleSaved("a");
  toggleSaved("b");
  assert.deepEqual(pushed, [["a"], ["a", "b"]]);
});
