import test from "node:test";
import assert from "node:assert/strict";
import { faqAudienceFrom, faqJsonLd, isEmployerPath, pathOnly } from "./faq-audience.js";

test("query param wins over employer referrer", () => {
  assert.equal(faqAudienceFrom({ searchFor: "candidates", previousPath: "/register" }), "candidates");
  assert.equal(faqAudienceFrom({ searchFor: "employers", previousPath: "/walk-ins" }), "employers");
});

test("employer pages default the FAQ to employers", () => {
  assert.equal(faqAudienceFrom({ previousPath: "/register" }), "employers");
  assert.equal(faqAudienceFrom({ previousPath: "/for-companies" }), "employers");
  assert.equal(faqAudienceFrom({ previousPath: "/company/start" }), "employers");
  assert.equal(faqAudienceFrom({ referrer: "https://tokenhire.app/register" }), "employers");
});

test("missing clues default to candidates", () => {
  assert.equal(faqAudienceFrom({}), "candidates");
  assert.equal(faqAudienceFrom({ previousPath: "/walk-ins" }), "candidates");
});

test("path helpers strip query and host", () => {
  assert.equal(pathOnly("https://x.test/register?x=1#y"), "/register");
  assert.ok(isEmployerPath("/company/start"));
  assert.equal(isEmployerPath("/walk-ins"), false);
});

test("JSON-LD includes both FAQ groups", () => {
  const ld = faqJsonLd([
    { items: [{ q: "A?", a: "A." }] },
    { items: [{ q: "B?", a: "B." }] },
  ]);
  assert.equal(ld["@type"], "FAQPage");
  assert.equal(ld.mainEntity.length, 2);
  assert.equal(ld.mainEntity[1].name, "B?");
});
