import { ArrowRight, Building2, ClipboardCheck, DoorOpen, Megaphone, PlusCircle, ScanLine, Search, Ticket, Timer, UserRound } from "lucide-react";
import { Btn, Reveal, STROKE } from "../components/ds.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t } from "../i18n/strings.js";

const CANDIDATE = [[Search, "c1"], [Ticket, "c2"], [Timer, "c3"], [DoorOpen, "c4"]];
const COMPANY = [[PlusCircle, "k1"], [ScanLine, "k2"], [Megaphone, "k3"], [ClipboardCheck, "k4"]];

function Track({ id, icon: Icon, title, steps, cta, to, dark }) {
  return (
    <Reveal className={`card card-pad stack gap-24${dark ? " band-dark" : ""}`} style={{ padding: 32, ...(dark ? { borderColor: "transparent" } : {}) }} aria-labelledby={id}>
      <div className="row gap-12">
        <span className={`step-icon${dark ? " lime" : ""}`}><Icon size={24} strokeWidth={STROKE} aria-hidden="true" /></span>
        <h2 id={id} className="h-2">{title}</h2>
      </div>
      <ol className="stack gap-20" style={{ listStyle: "none", margin: 0, padding: 0, gap: 20 }}>
        {steps.map(([StepIcon, key], i) => (
          <li key={key} className="row gap-16" style={{ alignItems: "flex-start" }}>
            <span className="mono" style={{ width: 28, flexShrink: 0, fontWeight: 700, opacity: 0.5, paddingTop: 2 }}>0{i + 1}</span>
            <div className="stack gap-4">
              <h3 className="h-4 row gap-8"><StepIcon size={18} strokeWidth={STROKE} aria-hidden="true" />{t(`howPage.${key}.t`)}</h3>
              <p className="body" style={{ margin: 0, color: "inherit", opacity: 0.78 }}>{t(`howPage.${key}.d`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: "auto" }}><Btn to={to} size="lg" variant={dark ? "lime" : "primary"} iconRight={ArrowRight}>{cta}</Btn></div>
    </Reveal>
  );
}

export default function HowItWorksPage() {
  useMeta({ title: "How it works", description: t("howPage.lede") });
  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 56 }}>
          <p className="eyebrow">How it works</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("howPage.title")}</h1>
          <p className="lede" style={{ marginTop: 20, maxWidth: 720 }}>{t("howPage.lede")}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="wrap cards-2" style={{ alignItems: "stretch" }}>
          <Track id="hw-cand" icon={UserRound} title={t("howPage.candidates")} steps={CANDIDATE} cta={t("howPage.ctaCandidates")} to="/walk-ins" />
          <Track id="hw-co" icon={Building2} title={t("howPage.companies")} steps={COMPANY} cta={t("howPage.ctaCompanies")} to="/for-companies" dark />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="hw-about">
        <div className="wrap">
          <div className="panel stack gap-8" style={{ padding: 32 }}>
            <h2 id="hw-about" className="h-3">About TokenHire</h2>
            <p className="body" style={{ margin: 0, maxWidth: 820 }}>{t("howPage.about")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
