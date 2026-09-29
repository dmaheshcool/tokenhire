import { useState } from "react";
import { ArrowRight, Check, CircleCheck, ClipboardList, DoorOpen, FileSpreadsheet, LayoutGrid, NotebookPen, Ticket } from "lucide-react";
import { Btn, Reveal, STROKE } from "../components/ds.jsx";
import { createDrivePath } from "../components/SiteChrome.jsx";
import { MiniBoard } from "./HomePage.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { api } from "../lib/api.js";
import { HIDE_PRICING } from "../lib/flags.js";
import { PUBLIC_PLANS, isWorkEmail, planPrice } from "../lib/helpers.js";
import { t } from "../i18n/strings.js";

const FEATURES = [
  [Ticket, "f1"], [DoorOpen, "f2"], [LayoutGrid, "f3"], [NotebookPen, "f4"], [ClipboardList, "f5"], [FileSpreadsheet, "f6"],
];

function Features() {
  return (
    <section className="section" aria-labelledby="fc-features">
      <div className="wrap">
        <p className="eyebrow">What you get</p>
        <h2 id="fc-features" className="h-1" style={{ margin: "10px 0 40px" }}>Everything drive day needs.</h2>
        <div className="cards-3">
          {FEATURES.map(([Icon, key], i) => (
            <Reveal key={key} delay={(i % 3) * 80} className="card card-pad stack gap-12">
              <span className={`step-icon${i === 2 ? " lime" : ""}`}><Icon size={24} strokeWidth={STROKE} aria-hidden="true" /></span>
              <h3 className="h-3">{t(`forCo.features.${key}.t`)}</h3>
              <p className="body muted">{t(`forCo.features.${key}.d`)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="section" style={{ paddingTop: 0, scrollMarginTop: 80 }} aria-labelledby="fc-pricing">
      <div className="wrap">
        <p className="eyebrow">{t("forCo.pricing.title")}</p>
        <h2 id="fc-pricing" className="h-1" style={{ margin: "10px 0 12px" }}>Pay per drive or per month.</h2>
        <p className="lede" style={{ marginBottom: 40 }}>{t("forCo.pricing.lede")}</p>
        <div className="cards-3">
          {PUBLIC_PLANS.map((p) => {
            const price = planPrice(p);
            return (
              <div key={p.id} className={`card card-pad stack gap-16${p.best ? " band-dark" : ""}`} style={p.best ? { borderColor: "transparent" } : undefined}>
                <div className="row between">
                  <h3 className="h-3">{p.name}</h3>
                  {p.best && <span className="status status-live">Most teams</span>}
                </div>
                <p style={{ margin: 0 }}>
                  <span className="mono" style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>{price.label}</span>
                  {price.unit && <span className="small" style={{ opacity: 0.7 }}> {price.unit}</span>}
                </p>
                <p className="small" style={{ margin: 0, opacity: 0.75 }}>{p.blurb}</p>
                <ul className="bullets">
                  {p.highlights.map((h) => <li key={h}><Check size={18} strokeWidth={2} aria-hidden="true" /><span>{h}</span></li>)}
                </ul>
                <div style={{ marginTop: "auto" }}>
                  {p.talk
                    ? <Btn href="#pilot" variant={p.best ? "lime" : "secondary"} block>{t("forCo.book")}</Btn>
                    : <Btn to={createDrivePath()} variant={p.best ? "lime" : "primary"} block>{t("nav.createDrive")}</Btn>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const EMPTY = { name: "", email: "", company: "", phone: "", city: "", size: "", date: "", notes: "" };

function PilotForm() {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.company.trim()) { setErr(t("forCo.pilot.errRequired")); return; }
    if (!isWorkEmail(f.email)) { setErr(t("forCo.pilot.errWork")); document.getElementById("pl-email")?.focus(); return; }
    setErr("");
    setBusy(true);
    try {
      await api.pilot(f);
      setSent(f.email.trim());
      setF(EMPTY);
    } catch (x) {
      setErr(x.status === 400 || x.status === 429 ? x.message : "We couldn’t send this right now. Please try again in a few minutes.");
    } finally {
      setBusy(false);
    }
  }

  const field = (k, props = {}, span = 6) => (
    <div className={`field span-${span}`}>
      <label className="label" htmlFor={`pl-${k}`}>{t(`forCo.pilot.${k}`)}{["name", "email", "company"].includes(k) ? "" : <span className="faint"> (optional)</span>}</label>
      <input id={`pl-${k}`} className="input" value={f[k]} onChange={set(k)} {...props} />
    </div>
  );

  return (
    <section id="pilot" className="section" style={{ paddingTop: 0, scrollMarginTop: 80 }} aria-labelledby="fc-pilot">
      <div className="wrap grid-12" style={{ alignItems: "start", rowGap: 32 }}>
        <div className="span-5 stack gap-16">
          <p className="eyebrow">Contact</p>
          <h2 id="fc-pilot" className="h-1">{t("forCo.pilot.title")}</h2>
          <p className="lede">{t("forCo.pilot.lede")}</p>
          <ul className="bullets">
            {["We set up your first drive with you", "Your team learns the console in one call", "Candidates need nothing but a phone"].map((b) => (
              <li key={b}><Check size={18} strokeWidth={2} aria-hidden="true" /><span>{b}</span></li>
            ))}
          </ul>
        </div>
        <div className="span-7">
          {sent ? (
            <div className="card card-pad stack gap-12" role="status">
              <CircleCheck size={32} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--success)" }} />
              <h3 className="h-3">{t("forCo.pilot.sent.t")}</h3>
              <p className="body muted">{t("forCo.pilot.sent.d", { email: sent })}</p>
              <div><Btn variant="secondary" onClick={() => setSent("")}>Send another</Btn></div>
            </div>
          ) : (
            <form className="card card-pad grid-12" style={{ rowGap: 16 }} onSubmit={submit} noValidate>
              {field("name", { autoComplete: "name", required: true })}
              {field("email", { type: "email", autoComplete: "email", required: true, "aria-invalid": err === t("forCo.pilot.errWork") })}
              {field("company", { autoComplete: "organization", required: true })}
              {field("phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
              {field("city", {}, 4)}
              {field("size", { inputMode: "numeric", placeholder: "200" }, 4)}
              {field("date", { type: "date" }, 4)}
              <div className="field span-12">
                <label className="label" htmlFor="pl-notes">{t("forCo.pilot.notes")}<span className="faint"> (optional)</span></label>
                <textarea id="pl-notes" className="textarea" rows={4} value={f.notes} onChange={set("notes")} />
              </div>
              {err && <p className="small span-12" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
              <div className="span-12"><Btn type="submit" size="lg" disabled={busy}>{busy ? t("forCo.pilot.sending") : t("forCo.pilot.submit")}</Btn></div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ForCompaniesPage() {
  useMeta({ title: "For companies", description: t("forCo.lede") });
  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 80 }}>
          <p className="eyebrow">{t("forCo.eyebrow")}</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("forCo.title")}</h1>
          <div className="grid-12" style={{ alignItems: "center", marginTop: 28, rowGap: 32 }}>
            <div className="span-6 stack gap-24">
              <p className="lede" style={{ fontSize: "clamp(18px, 1.9vw, 22px)" }}>{t("forCo.lede")}</p>
              <div className="row gap-12" style={{ flexWrap: "wrap" }}>
                <Btn href="#pilot" size="lg" iconRight={ArrowRight}>{t("forCo.book")}</Btn>
                <Btn to={createDrivePath()} variant="secondary" size="lg">{t("nav.createDrive")}</Btn>
              </div>
            </div>
            <div className="span-6"><MiniBoard /></div>
          </div>
        </div>
      </section>
      <Features />
      {!HIDE_PRICING && <Pricing />}
      <PilotForm />
    </>
  );
}
