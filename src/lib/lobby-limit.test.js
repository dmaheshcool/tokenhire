import assert from "node:assert/strict";
import test from "node:test";
import { lobbyCooling, lobbyFail, lobbyRateKeys, resetLobbyFails } from "../../server/lobby-limit.js";

test("rate limit is keyed by device id and IP, 5 per minute then 60s cooldown", () => {
  resetLobbyFails();
  const now = 1_000_000;
  const [ipKey, devKey] = lobbyRateKeys("1.2.3.4", "device-abc");
  assert.equal(ipKey, "ip:1.2.3.4");
  assert.equal(devKey, "dev:device-abc");
  for (let i = 0; i < 4; i++) lobbyFail(devKey, now);
  assert.equal(lobbyCooling(devKey, now), false);
  lobbyFail(devKey, now);
  assert.equal(lobbyCooling(devKey, now + 1_000), true);
  assert.equal(lobbyCooling(devKey, now + 61_000), false);
  assert.equal(lobbyCooling(ipKey, now), false);
  for (let i = 0; i < 5; i++) lobbyFail(ipKey, now);
  assert.equal(lobbyCooling(ipKey, now + 1_000), true);
});
