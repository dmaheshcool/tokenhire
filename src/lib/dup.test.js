import test from "node:test";
import assert from "node:assert/strict";
import { dupOf } from "./helpers.js";

test("one active token per phone or device; finished tokens do not block", () => {
  const drive = {
    candidates: [
      { phone: "9959001122", deviceId: "dev-a", state: "wait" },
      { phone: "9848111001", deviceId: "dev-b", state: "selected" },
    ],
  };
  assert.equal(dupOf(drive, { phone: "9959001122", deviceId: "other" })?.phone, "9959001122");
  assert.equal(dupOf(drive, { phone: "9000000000", deviceId: "dev-a" })?.deviceId, "dev-a");
  assert.equal(dupOf(drive, { phone: "9848111001", deviceId: "dev-b" }), undefined);
});
