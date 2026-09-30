import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem, driveRoles, duplicateDrive, fieldAnswerOk, libraryOf, mergeItems, relinkDrives, renameItem, roleCode, rolesMirror,
  setActive, withNewItems,
} from "./library.js";
import { firstRoundIdx, isLastRound, nextRoundIdx } from "./helpers.js";

const org = { id: "o1", clients: [{ id: "cl_voice", name: "Voice process" }] };

test("a new library keeps old hiring teams as processes and seeds roles from drives", () => {
  const lib = libraryOf(org, [{ orgId: "o1", role: "Field Sales Executive" }, { orgId: "o2", role: "Someone else's role" }]);
  assert.deepEqual(lib.processes.map((p) => [p.id, p.name]), [["cl_voice", "Voice process"]]);
  assert.deepEqual(lib.roles.map((r) => r.title), ["Field Sales Executive"]);
  assert.ok(lib.documents.length >= 5);
  assert.ok(lib.documents.every((d) => !/aadhaar/i.test(d.label)));
});

test("adding is case-insensitive and brings back archived items", () => {
  let lib = libraryOf(org);
  const same = addItem(lib, "processes", "  voice   PROCESS ");
  assert.equal(same.lib, lib);
  assert.equal(same.item.id, "cl_voice");
  lib = setActive(lib, "processes", "cl_voice", false);
  const back = addItem(lib, "processes", "Voice process");
  assert.equal(back.item.active, true);
  const created = addItem(lib, "processes", "Warehouse");
  assert.equal(created.lib.processes.length, 2);
  assert.equal(addItem(lib, "documents", "Aadhaar card").item, null);
});

test("rename refuses a name that is already taken", () => {
  let lib = addItem(libraryOf(org), "processes", "Warehouse").lib;
  assert.equal(renameItem(lib, "processes", "cl_voice", "warehouse").error, "taken");
  lib = renameItem(lib, "processes", "cl_voice", "Inbound voice").lib;
  assert.equal(lib.processes[0].name, "Inbound voice");
});

test("merge moves drives and roles over, and removes the merged item", () => {
  let lib = addItem(libraryOf(org), "processes", "Voice (old)").lib;
  const old = lib.processes[1];
  lib = addItem(lib, "roles", "CSE", { processId: old.id }).lib;
  lib = mergeItems(lib, "processes", old.id, "cl_voice");
  assert.equal(lib.processes.length, 1);
  assert.equal(lib.roles[0].processId, "cl_voice");
  const drives = relinkDrives([{ id: "d1", orgId: "o1", clientId: old.id, clientName: "Voice (old)" }, { id: "d2", orgId: "o2", clientId: old.id }], "o1", "processes", old.id, lib.processes[0]);
  assert.equal(drives[0].clientName, "Voice process");
  assert.equal(drives[1].clientName, undefined);
});

test("relinking documents keeps one row and keeps it required", () => {
  const d = { id: "d1", orgId: "o1", documents: [{ id: "a", docId: "x", label: "CV", required: true }, { id: "b", docId: "y", label: "Resume", required: false }] };
  const [out] = relinkDrives([d], "o1", "documents", "x", { id: "y", label: "Resume" });
  assert.deepEqual(out.documents.map((x) => [x.label, x.required]), [["Resume", true]]);
  assert.deepEqual(out.docs, ["Resume"]);
});

test("withNewItems keeps a concurrent change and adds only new items", () => {
  const base = libraryOf(org);
  const mine = addItem(base, "rounds", "Versant test").lib;
  const theirs = addItem(base, "processes", "Warehouse").lib;
  const merged = withNewItems(theirs, mine);
  assert.ok(merged.processes.some((p) => p.name === "Warehouse"));
  assert.ok(merged.rounds.some((r) => r.name === "Versant test"));
});

test("role codes are short and unique within a drive", () => {
  assert.equal(roleCode("Customer Support Executive (Voice)"), "CSE");
  assert.equal(roleCode("Telecaller"), "TEL");
  assert.equal(roleCode("Customer Service Executive", ["CSE"]), "CSE2");
});

test("a drive with several roles mirrors them for the board", () => {
  const m = rolesMirror([
    { title: "Telecaller", openings: 10, expMin: 0, expMax: 1, payType: "month", payMin: "", payMax: "" },
    { title: "Team Lead", openings: 2, expMin: 2, expMax: 5, payType: "month", payMin: 30000, payMax: 40000 },
  ]);
  assert.equal(m.role, "Telecaller, Team Lead");
  assert.equal(m.openings, 12);
  assert.deepEqual([m.expMin, m.expMax, m.expNeeded], [0, 5, false]);
  assert.deepEqual([m.payMin, m.payMax], [30000, 40000]);
});

test("older drives read as a single role", () => {
  const [r] = driveRoles({ role: "Picker", openings: 20, payMin: 15000, payMax: 18000 });
  assert.equal(r.title, "Picker");
  assert.equal(r.openings, 20);
  assert.deepEqual(driveRoles({}), []);
});

test("rounds for some roles only are skipped for everyone else", () => {
  const rounds = [{ id: "a" }, { id: "b", roleIds: ["lead"] }, { id: "c" }];
  const agent = { roleId: "agent", roundIdx: 0 };
  assert.equal(nextRoundIdx(rounds, agent), 2);
  assert.equal(nextRoundIdx(rounds, { roleId: "lead", roundIdx: 0 }), 1);
  assert.equal(isLastRound(rounds, { roleId: "agent", roundIdx: 2 }), true);
  assert.equal(isLastRound(rounds, { roundIdx: 1 }), false);
  assert.equal(firstRoundIdx([{ id: "x", roleIds: ["lead"] }, { id: "y" }], "agent"), 1);
});

test("check-in answers are checked by type", () => {
  assert.equal(fieldAnswerOk({ required: true, type: "text" }, " "), false);
  assert.equal(fieldAnswerOk({ required: false, type: "text" }, ""), true);
  assert.equal(fieldAnswerOk({ type: "number" }, "30"), true);
  assert.equal(fieldAnswerOk({ type: "number" }, "thirty"), false);
  assert.equal(fieldAnswerOk({ type: "yesno", required: true }, "yes"), true);
  assert.equal(fieldAnswerOk({ type: "dropdown", options: ["Day", "Night"] }, "Evening"), false);
});

test("duplicate copies the setup but not the people", () => {
  const src = {
    id: "d1", orgId: "o1", role: "Picker", date: "2026-09-01", endDate: "2026-09-03", host: "HOST-AAA", gate: "GATE-AAA",
    candidates: [{ id: "W-001" }], seq: 12, wrappedAt: 5, gatePass: { code: "1234" }, rounds: [{ id: "r1", name: "HR" }], fields: [{ id: "f1" }],
  };
  const copy = duplicateDrive(src, { id: "d2", host: "HOST-BBB", gate: "GATE-BBB", desk: "XYZ", today: "2026-09-29" });
  assert.equal(copy.id, "d2");
  assert.deepEqual(copy.candidates, []);
  assert.equal(copy.seq, 0);
  assert.equal(copy.draft, true);
  assert.equal(copy.wrappedAt, undefined);
  assert.equal(copy.gatePass, undefined);
  assert.deepEqual(copy.rounds, src.rounds);
  assert.deepEqual([copy.date, copy.endDate], ["2026-09-30", "2026-10-02"]);
  const future = duplicateDrive({ ...src, date: "2026-10-10", endDate: "2026-10-10" }, { id: "d3", today: "2026-09-29" });
  assert.equal(future.date, "2026-10-10");
});
