import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHourLimiter } from "./email-limit.js";

test("email lookup allows 10 checks then blocks", () => {
  const over = makeHourLimiter(10, 60 * 60 * 1000);
  for (let i = 0; i < 10; i += 1) assert.equal(over("ip"), false);
  assert.equal(over("ip"), true);
  assert.equal(over("other"), false);
});
