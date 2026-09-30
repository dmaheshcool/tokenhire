import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordIssue } from "./password.js";

test("passwords must be 8+ characters and not a common phrase", () => {
  assert.equal(passwordIssue("short"), "short");
  assert.equal(passwordIssue("password"), "common");
  assert.equal(passwordIssue("HrDesk9x"), null);
  assert.equal(passwordIssue("demo1234"), null);
});
