import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { readDeviceId } = await import("./device.js");

beforeEach(() => store.clear());

test("device id is created once and reused", () => {
  const a = readDeviceId();
  const b = readDeviceId();
  assert.ok(a && a.length >= 8);
  assert.equal(b, a);
});
