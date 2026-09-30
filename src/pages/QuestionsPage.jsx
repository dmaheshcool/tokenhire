import { useEffect, useId, useMemo, useState } from "react";
import { Building2, ChevronDown, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { STROKE } from "../components/ds.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";
import { faqAudienceFrom, faqJsonLd, readPrevFaqPath } from "../lib/faq-audience.js";

function countLabel(n) {
  return n === 1 ? t("faq.countOne") : t("faq.count", { n });
}

function Accordion({ items, group }) {
  const uid = useId();
  const [open, setOpen] = useState(0);
  useEffect(() => { setOpen(0); }, [group]);

  return (
    <div className={`q-acc q-acc-${group}`}>
      {items.map((item, i) => {
        const panelId = `${uid}-p-${i}`;
        const btnId = `${uid}-b-${i}`;
        const on = open === i;
        return (
          <div key={item.q} className={`q-acc-row${on ? " open" : ""}`}>
            <h3 className="q-acc-h">
              <button
                type="button"
                id={btnId}
                className="q-acc-btn"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setOpen(i)}
              >
                <span>{item.q}</span>
                <span className="q-acc-chev" aria-hidden="true">
                  <ChevronDown size={16} strokeWidth={STROKE} />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={`q-acc-panel${on ? " open" : ""}`} aria-hidden={!on}>
              <div className="q-acc-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function QuestionsPage() {
  const [params, setParams] = useSearchParams();
  const forParam = params.get("for");
  const inferred = useMemo(() => faqAudienceFrom({
    searchFor: forParam,
    previousPath: readPrevFaqPath(),
    referrer: typeof document !== "undefined" ? document.referrer : "",
  }), [forParam]);
  const [audience, setAudience] = useState(inferred);

  useEffect(() => {
    setAudience(inferred);
    if (forParam !== inferred) setParams({ for: inferred }, { replace: true });
  }, [inferred, forParam, setParams]);

  const cand = tl("faq.candidates.items");
  const emp = tl("faq.employers.items");
  const items = audience === "employers" ? emp : cand;
  const group = audience === "employers" ? "employers" : "candidates";
  const email = t("footer.email");

  useMeta({
    title: t("faq.meta.title"),
    description: t("faq.meta.description"),
    jsonLd: faqJsonLd([
      { items: cand },
      { items: emp },
    ]),
  });

  function pick(next) {
    setAudience(next);
    setParams({ for: next }, { replace: true });
  }

  return (
    <section className="section q-page-sec">
      <div className="wrap q-page">
        <aside className="q-side">
          <div className="q-intro">
            <h1 className="q-h1">{t("faq.title")}</h1>
            <p className="q-sub">{t("faq.sub")}</p>
          </div>
          <div className="q-switch" role="group" aria-label={t("faq.title")}>
            <button
              type="button"
              className={`q-opt cand${audience === "candidates" ? " on" : ""}`}
              aria-pressed={audience === "candidates"}
              onClick={() => pick("candidates")}
            >
              <span className="q-opt-icon" aria-hidden="true"><Search size={16} strokeWidth={STROKE} /></span>
              <span className="q-opt-copy">
                <span className="q-opt-label">{t("faq.switchCandidates")}</span>
                <span className="q-opt-count">{countLabel(cand.length)}</span>
              </span>
            </button>
            <button
              type="button"
              className={`q-opt emp${audience === "employers" ? " on" : ""}`}
              aria-pressed={audience === "employers"}
              onClick={() => pick("employers")}
            >
              <span className="q-opt-icon" aria-hidden="true"><Building2 size={16} strokeWidth={STROKE} /></span>
              <span className="q-opt-copy">
                <span className="q-opt-label">{t("faq.switchEmployers")}</span>
                <span className="q-opt-count">{countLabel(emp.length)}</span>
              </span>
            </button>
          </div>
          <p className="q-stuck">
            {t("faq.stuckLead")}{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </aside>
        <div className="q-main" key={group}>
          <div className={`q-group-card ${group}`}>
            <span className={`q-group-pill ${group}`}>{t(`faq.${group}.pill`)}</span>
            <h2 className="q-group-title">{t(`faq.${group}.title`)}</h2>
            <p className="q-group-line">{t(`faq.${group}.line`)}</p>
          </div>
          <Accordion items={items} group={group} />
        </div>
      </div>
    </section>
  );
}

