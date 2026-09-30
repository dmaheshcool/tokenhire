import { test } from "node:test";
import assert from "node:assert/strict";
import { setupProgress } from "./setup.js";

test("agency setup starts with add your first client", () => {
  const agency = setupProgress({ kind: "agency", members: [{}], branches: [] }, []);
  assert.equal(agency.items[0].id, "hiringTeams");
  assert.equal(agency.items[0].titleKey, "console.setup.items.client");
  const own = setupProgress({ kind: "captive", members: [{}], branches: [] }, []);
  assert.equal(own.items[0].id, "team");
  assert.equal(own.items[1].titleKey, "console.setup.items.hiringTeams");
});
