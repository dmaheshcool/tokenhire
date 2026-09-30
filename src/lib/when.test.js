import assert from "node:assert/strict";
import test from "node:test";
import {
  applyInterviewTimes, formatInr, interviewMinutes, isOvernight, parseClock, parseInr,
  weekdayDate, whenFieldErrors, whenLiveLines,
} from "./when.js";

test("parseClock accepts Indian-friendly typed times", () => {
  assert.equal(parseClock("930"), "09:30");
  assert.equal(parseClock("9.30 am"), "09:30");
  assert.equal(parseClock("21:30"), "21:30");
  assert.equal(parseClock("2 pm"), "14:00");
  assert.equal(parseClock("12 am"), "00:00");
});

test("overnight interviews and +1 day length", () => {
  assert.equal(isOvernight("18:00", "02:00"), true);
  assert.equal(isOvernight("10:00", "16:00"), false);
  assert.equal(interviewMinutes("18:00", "02:00"), 8 * 60);
  assert.equal(interviewMinutes("10:00", "10:00"), 0);
});

test("weekday date is unambiguous en-IN", () => {
  const shown = weekdayDate("2026-10-02");
  assert.match(shown, /Fri/);
  assert.match(shown, /2 Oct 2026/);
  assert.doesNotMatch(shown, /\d{2}\/\d{2}\/\d{4}/);
});

test("check-in times follow start and end until edited", () => {
  const next = applyInterviewTimes(
    { startTime: "10:00", endTime: "16:00", doorsTouched: false, lastTouched: false, multiDay: false, date: "2026-10-02" },
    { startTime: "09:00", endTime: "13:00" },
  );
  assert.equal(next.doorsOpenTime, "08:30");
  assert.equal(next.lastEntryTime, "12:30");
});

test("past date and equal start/end messages", () => {
  const now = Date.parse("2026-10-05T10:00:00+05:30");
  const past = whenFieldErrors({ date: "2026-10-01", startTime: "10:00", endTime: "16:00", doorsOpenTime: "09:30", lastEntryTime: "15:30" }, now);
  assert.equal(past.date, "Pick today or a later date.");
  const same = whenFieldErrors({ date: "2026-10-06", startTime: "10:00", endTime: "10:00", doorsOpenTime: "09:30", lastEntryTime: "09:30" }, now);
  assert.equal(same.endTime, "End time must be after the start time.");
});

test("live overnight line names both calendar days", () => {
  const lines = whenLiveLines({
    date: "2026-10-02", endDate: "2026-10-02", multiDay: false,
    startTime: "18:00", endTime: "02:00", doorsOpenTime: "17:30", lastEntryTime: "01:30",
  });
  assert.match(lines.when, /Fri, 2 Oct/);
  assert.match(lines.when, /Sat, 3 Oct/);
  assert.match(lines.when, /6:00 PM/);
  assert.match(lines.when, /2:00 AM IST/);
});

test("INR grouping as you type", () => {
  assert.equal(formatInr("18000"), "18,000");
  assert.equal(parseInr("18,000"), 18000);
});
