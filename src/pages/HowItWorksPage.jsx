import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, DoorOpen, FileSpreadsheet, LayoutGrid, Megaphone, MonitorPlay, PlusCircle, ScanLine, Search, Timer, UserRound } from "lucide-react";
import { Btn, Reveal, STROKE } from "../components/ds.jsx";
import { createDrivePath } from "../components/SiteChrome.jsx";
import { FaqList } from "./HomePage.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";

const CANDIDATE_ICONS = [Search, DoorOpen, ScanLine, Timer, DoorOpen];
const COMPANY_ICONS = [PlusCircle, LayoutGrid, MonitorPlay, Megaphone, ClipboardCheck, FileSpreadsheet];

function Track({ id, icon: Icon, title, steps, icons, cta, to, dark }) {
  return (
    <Reveal id={id} className={`card card-pad stack gap-24${dark ? " band-dark" : ""}`} style={{ padding: 32, scrollMarginTop: 80, ...(dark ? { borderColor: "transparent" } : {}) }} aria-labelledby={`${id}-title`}>
      <div className="row gap-12">
        <span className={`step-icon${dark ? " lime" : ""}`}><Icon size={24} strokeWidth={STROKE} aria-hidden="true" /></span>
        <h2 id={`${id}-title`} className="h-2">{title}</h2>
      </div>
      <ol className="stack gap-20" style={{ listStyle: "none", margin: 0, padding: 0, gap: 20 }}>
        {steps.map((s, i) => {
          const StepIcon = icons[i] || DoorOpen;
          return (
            <li key={s.t} className="row gap-16" style={{ alignItems: "flex-start" }}>
              <span className="mono" style={{ width: 28, flexShrink: 0, fontWeight: 700, opacity: 0.5, paddingTop: 2 }}>0{i + 1}</span>
              <div className="stack gap-4">
                <h3 className="h-4 row gap-8"><StepIcon size={18} strokeWidth={STROKE} aria-hidden="true" />{s.t}</h3>
                <p className="body" style={{ margin: 0, color: "inherit", opacity: 0.78 }}>{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div style={{ marginTop: "auto" }}><Btn to={to} size="lg" variant={dark ? "lime" : "primary"} iconRight={ArrowRight}>{cta}</Btn></div>
    </Reveal>
  );
}

export default function HowItWorksPage() {
  useMeta({ title: t("howPage.meta.title"), description: t("howPage.meta.description") });
  const { hash, search } = useLocation();
  useEffect(() => {
    const target = hash ? hash.slice(1) : new URLSearchParams(search).get("tab");
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [hash, search]);

  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 56 }}>
          <p className="eyebrow">{t("howPage.eyebrow")}</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("howPage.title")}</h1>
          <p className="lede" style={{ marginTop: 20, maxWidth: 720 }}>{t("howPage.sub")}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="wrap cards-2" style={{ alignItems: "stretch" }}>
          <Track id="candidates" icon={UserRound} title={t("howPage.tabs.candidates")} steps={tl("howPage.candidates")} icons={CANDIDATE_ICONS} cta={t("buttons.browse")} to="/walk-ins" />
          <Track id="companies" icon={Building2} title={t("howPage.tabs.companies")} steps={tl("howPage.companies")} icons={COMPANY_ICONS} cta={t("buttons.createDrive")} to={createDrivePath()} dark />
        </div>
      </section>
      <section id="faq" className="section" style={{ paddingTop: 0, scrollMarginTop: 80 }} aria-labelledby="hw-faq">
        <div className="wrap grid-12" style={{ rowGap: 24 }}>
          <div className="span-4"><h2 id="hw-faq" className="h-1">{t("howPage.faqTitle")}</h2></div>
          <div className="span-8 stack gap-32">
            <div className="stack gap-12">
              <h3 className="h-3">{t("faq.candidates")}</h3>
              <FaqList items={tl("faq.c")} />
            </div>
            <div className="stack gap-12">
              <h3 className="h-3">{t("faq.companies")}</h3>
              <FaqList items={tl("faq.k")} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
