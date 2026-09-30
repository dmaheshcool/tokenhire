import { test } from "node:test";
import assert from "node:assert/strict";
import { ATS_TEMPLATES, atsBytes, atsRows, buildAtsReport, fileBase } from "./ats.js";
import { resumeZipPath } from "./resume.js";
import { xlsxBytes } from "./xlsx.js";

const t0 = Date.parse("2026-09-29T04:30:00.000Z"); // 10:00 IST

const drive = {
  id: "d_test",
  company: "Vistaar Services",
  role: "Collections Officer",
  date: "2026-09-29",
  startsAt: "2026-09-29T04:30:00.000Z",
  city: "Hyderabad",
  venue: "HITEC City, Tower B",
  branch: "Hyderabad HITEC",
  clientName: "Retail BFSI",
  rounds: [
    { id: "r1", name: "HR screening" },
    { id: "r2", name: "Ops round" },
  ],
  fields: [
    { id: "cf_notice", label: "Notice period (days)" },
    { id: "cf_co", label: "Current company" },
  ],
  candidates: [
    {
      id: "W-001", token: "W-001", name: "Ananya Rao", phone: "9959001122", email: "ananya.rao@gmail.com",
      expBand: "1–3 yrs", state: "selected", checkedIn: true, arrivedAt: t0, at: t0 - 20 * 60000,
      calledAt: t0 + 5 * 60000, decidedAt: t0 + 12 * 60000, roundIdx: 1,
      roundOutcomes: { r1: "selected", r2: "selected" },
      notes: { r2: "Clear spoken English" },
      roundLog: {
        r1: { start: t0, end: t0 + 6 * 60000, room: "Room 1", interviewer: "Priya" },
        r2: { start: t0 + 7 * 60000, end: t0 + 12 * 60000, room: "Room 2", interviewer: "Arun", score: "8" },
      },
      answers: { cf_notice: "30", cf_co: "HDFC Bank" },
      resume: { name: "ananya_rao.pdf", type: "application/pdf", data: "data:application/pdf;base64,JVBERi0=" },
    },
    {
      id: "W-002", token: "W-002", name: "Ravi Teja", phone: "9848337766", email: "ravi@gmail.com",
      state: "absent", checkedIn: false, at: t0, resume: null,
    },
  ],
};

test("Generic candidate sheet uses the spec columns and IST times", () => {
  const [head, row] = atsRows(drive, "generic");
  assert.equal(head[0], "Drive ID");
  assert.equal(head[2], "Date (IST)");
  assert.ok(head.includes("Round 1 start (IST)"));
  assert.ok(head.includes("Notice period (days)"));
  assert.equal(row[head.indexOf("Drive ID")], "d_test");
  assert.equal(row[head.indexOf("Process")], "Retail BFSI");
  assert.equal(row[head.indexOf("Token")], "W-001");
  assert.equal(row[head.indexOf("Current company")], "HDFC Bank");
  assert.equal(row[head.indexOf("Notice period")], "30");
  assert.equal(row[head.indexOf("Notice period (days)")], "30");
  assert.equal(row[head.indexOf("Final status")], "Shortlisted");
  assert.equal(row[head.indexOf("Resume file name")], "W-001_Ananya_Rao.pdf");
  assert.match(row[head.indexOf("Date (IST)")], /2026/);
  assert.match(row[head.indexOf("Check-in time (IST)")], /IST/);
  assert.match(row[head.indexOf("Round 1 start (IST)")], /IST/);
  assert.equal(row[head.indexOf("Resume link")], "");
});

test("templates only rename columns", () => {
  const [generic] = atsRows(drive, "generic");
  const [workday] = atsRows(drive, "workday");
  assert.equal(generic.length, workday.length);
  assert.equal(workday[generic.indexOf("Full name")], "Legal Name");
  assert.equal(workday[generic.indexOf("Role applied")], "Job Profile");
  assert.ok(!ATS_TEMPLATES.some((x) => /darwinbox|keka/i.test(x.id)));
  assert.deepEqual(ATS_TEMPLATES.map((x) => x.id), ["generic", "workday", "greenhouse", "lever", "zoho", "successfactors"]);
});

test("Rounds sheet is long format and Summary counts the funnel", () => {
  const { sheets } = buildAtsReport(drive, "generic");
  assert.deepEqual(sheets.map((s) => s.name), ["Candidates", "Rounds", "Summary"]);
  const [rHead, r1] = sheets[1].rows;
  assert.equal(rHead[2], "Round");
  assert.equal(r1[1], "W-001");
  assert.equal(r1[3], "HR screening");
  const [sHead, sRow] = sheets[2].rows;
  assert.equal(sRow[sHead.indexOf("Registered")], 2);
  assert.equal(sRow[sHead.indexOf("Checked in")], 1);
  assert.equal(sRow[sHead.indexOf("Shortlisted")], 1);
  assert.equal(sRow[sHead.indexOf("No-shows")], 1);
  assert.equal(sRow[sHead.indexOf("Interviewed (round 1: HR screening)")], 1);
});

test("CSV+resumes zip uses token_name paths and xlsx is a real zip", () => {
  const zip = atsBytes(drive, "generic", "zip");
  assert.equal(zip.filename.endsWith("_resumes.zip"), true);
  const names = [...zip.bytes].length;
  assert.ok(names > 100);
  const asText = Buffer.from(zip.bytes).toString("binary");
  assert.ok(asText.includes("resumes/W-001_Ananya_Rao.pdf"));
  assert.equal(resumeZipPath("W-001", "Ananya Rao", "pdf"), "resumes/W-001_Ananya_Rao.pdf");
  const xlsx = atsBytes(drive, "workday", "xlsx");
  assert.equal(xlsx.bytes[0], 0x50);
  assert.equal(xlsx.bytes[1], 0x4B);
  const book = Buffer.from(xlsxBytes(buildAtsReport(drive, "generic").sheets)).toString("utf8");
  assert.ok(book.includes("Candidates"));
  assert.ok(book.includes("Rounds"));
  assert.ok(book.includes("Summary"));
  assert.equal(fileBase(drive, "generic"), "Vistaar_Services_2026-09-29_generic");
});

test("resume link is only filled when the server passes a signer", () => {
  const [head, row] = buildAtsReport(drive, "generic", { resumeUrl: (c) => `https://app.example/api/files/${c.token}` }).sheets[0].rows;
  assert.equal(row[head.indexOf("Resume link")], "https://app.example/api/files/W-001");
});
