import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ClipboardCheck, DoorOpen, FileSpreadsheet, LayoutGrid, Megaphone, MonitorPlay, PlusCircle, ScanLine, Search, Timer } from "lucide-react";
import { Btn, STROKE } from "../components/ds.jsx";
import { createDrivePath } from "../components/SiteChrome.jsx";
import { FaqList } from "./HomePage.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";

const ICONS = {
  candidates: [Search, DoorOpen, ScanLine, Timer, DoorOpen],
  companies: [PlusCircle, LayoutGrid, MonitorPlay, Megaphone, ClipboardCheck, FileSpreadsheet],
};
const TABS = ["candidates", "companies"];

export default function HowItWorksPage() {
  useMeta({ title: t("howPage.meta.title"), description: t("howPage.meta.description") });
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const tab = TABS.includes(params.get("tab")) ? params.get("tab") : "candidates";
  const steps = tl(`howPage.${tab}`);
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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
        <div className="wrap" style={{ maxWidth: 880 }}>
          <div className="tabs" role="tablist" aria-label={t("howPage.title")} style={{ marginBottom: 32 }}>
            {TABS.map((k) => (
              <button key={k} type="button" role="tab" id={`hw-tab-${k}`} aria-selected={tab === k} aria-controls="hw-panel"
                onClick={() => setParams(k === "candidates" ? {} : { tab: k }, { replace: true })}>
                {t(`howPage.tabs.${k}`)}
              </button>
            ))}
          </div>
          <ol id="hw-panel" role="tabpanel" aria-labelledby={`hw-tab-${tab}`} className="stack gap-16" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((s, i) => {
              const Icon = ICONS[tab][i] || DoorOpen;
              return (
                <li key={s.t} className="card card-pad row gap-16" style={{ alignItems: "flex-start" }}>
                  <span className={`step-icon${i === 0 ? " lime" : ""}`}><Icon size={22} strokeWidth={STROKE} aria-hidden="true" /></span>
                  <div className="stack gap-4">
                    <h2 className="h-4"><span className="mono faint" style={{ marginRight: 10 }}>0{i + 1}</span>{s.t}</h2>
                    <p className="body muted" style={{ margin: 0 }}>{s.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="panel row between gap-16" style={{ marginTop: 32, padding: 28, flexWrap: "wrap" }}>
            <span className="h-3">{t("howPage.ready")}</span>
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              <Btn to="/walk-ins">{t("buttons.browse")}</Btn>
              <Btn to={createDrivePath()} variant="secondary">{t("buttons.createDrive")}</Btn>
            </div>
          </div>
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
