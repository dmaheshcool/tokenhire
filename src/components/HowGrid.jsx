import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Btn } from "./ds.jsx";
import { t, tl } from "../i18n/strings.js";
import { faqAudienceFrom, readPrevFaqPath } from "../lib/faq-audience.js";

function Phone({ children }) {
  return (
    <div className="how-phone">
      <div className="how-phone-screen">{children}</div>
    </div>
  );
}

function Laptop({ children }) {
  return (
    <div className="how-laptop">
      <div className="how-laptop-bar" aria-hidden="true"><span /><span /><span /></div>
      <div className="how-laptop-screen">{children}</div>
    </div>
  );
}

function Stage({ children }) {
  return (
    <div className="how-stage">
      {children}
      <p className="how-sample">{t("home.sample")}</p>
    </div>
  );
}

function MockWalkInCard() {
  return (
    <Phone>
      <div className="hm-card">
        <span className="hm-mono">CS</span>
        <p className="hm-role">{t("howPage.mock.role")}</p>
        <p className="hm-co">{t("howPage.mock.company")}</p>
        <p className="hm-meta">{t("howPage.mock.place")}</p>
        <p className="hm-meta">{t("howPage.mock.when")}</p>
        <span className="hm-btn">{t("howPage.mock.view")}</span>
      </div>
    </Phone>
  );
}

function MockWhenForm() {
  return (
    <Laptop>
      <p className="hl-label">{t("howPage.mock.whenTitle")}</p>
      <div className="hl-chips">
        <span className="on">{t("status.today")}</span>
        <span>{t("status.tomorrow")}</span>
      </div>
      <div className="hl-times">
        <span>09:00</span>
        <span>18:00</span>
      </div>
      <p className="hl-sum">{t("howPage.mock.whenSum")}</p>
      <span className="hm-btn">{t("howPage.mock.publish")}</span>
    </Laptop>
  );
}

function MockScan() {
  return (
    <Phone>
      <div className="hm-cam">
        <p className="hm-cam-cap">{t("howPage.mock.scan")}</p>
        <div className="hm-qr-frame">
          <span /><span /><span /><span />
        </div>
        <span className="hm-alt">{t("howPage.mock.codeInstead")}</span>
      </div>
    </Phone>
  );
}

function MockLobby() {
  return (
    <Laptop>
      <div className="hl-lobby">
        <div className="hm-qr-sq" />
        <p className="hl-code">V4C-VNX</p>
        <div className="hl-ring-wrap">
          <svg className="hl-ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="hl-ring-track" cx="24" cy="24" r="18" />
            <circle className="hl-ring-arc" cx="24" cy="24" r="18" />
          </svg>
          <p>{t("howPage.mock.ring")}</p>
        </div>
      </div>
    </Laptop>
  );
}

function MockToken() {
  return (
    <Phone>
      <div className="hm-token">
        <p className="hm-kicker">{t("howPage.mock.yourToken")}</p>
        <p className="hm-num">#043</p>
        <p className="hm-fact">{t("howPage.mock.ahead")}</p>
        <p className="hm-fact">{t("howPage.mock.wait")}</p>
        <span className="hm-room">{t("howPage.mock.room")}</span>
      </div>
    </Phone>
  );
}

function MockBoard() {
  return (
    <Laptop>
      <div className="hl-board">
        <div className="hl-col neu">
          <p>{t("howPage.mock.colQueue")}</p>
          <span>#044</span><span>#045</span>
        </div>
        <div className="hl-col blue">
          <p>{t("howPage.mock.colRound")}</p>
          <span>#042</span>
        </div>
        <div className="hl-col green">
          <p>{t("howPage.mock.colDone")}</p>
          <span>#041</span>
        </div>
      </div>
      <span className="hm-btn hl-call">{t("howPage.mock.callNext")}</span>
    </Laptop>
  );
}

function MockResult() {
  return (
    <Phone>
      <div className="hm-token">
        <p className="hm-kicker">{t("howPage.mock.yourToken")}</p>
        <p className="hm-num">#043</p>
        <p className="hm-chip pass">{t("howPage.mock.round1")}</p>
        <p className="hm-chip next">{t("howPage.mock.round2")}</p>
        <span className="hm-btn">{t("howPage.mock.calendar")}</span>
      </div>
    </Phone>
  );
}

function MockExport() {
  return (
    <Laptop>
      <table className="hl-table">
        <thead>
          <tr>
            <th>{t("howPage.mock.colName")}</th>
            <th>{t("howPage.mock.colRnd")}</th>
            <th>{t("howPage.mock.colNotes")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Ritu S.</td><td>2</td><td>Strong</td></tr>
          <tr><td>Amit K.</td><td>1</td><td>Hold</td></tr>
          <tr><td>Neha P.</td><td>2</td><td>—</td></tr>
        </tbody>
      </table>
      <span className="hm-btn">{t("howPage.mock.export")}</span>
    </Laptop>
  );
}

const MOCKS = [
  [MockWalkInCard, MockWhenForm],
  [MockScan, MockLobby],
  [MockToken, MockBoard],
  [MockResult, MockExport],
];

function Half({ kind, title, body, Mock }) {
  return (
    <div className={`how-half ${kind}`}>
      <span className={`how-tag ${kind === "cand" ? "cand" : "emp"}`}>
        {kind === "cand" ? t("howPage.pillCandidate") : t("howPage.pillEmployer")}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="how-mock" aria-hidden="true">
        <Stage><Mock /></Stage>
      </div>
    </div>
  );
}

export function HowGrid({ ctas }) {
  const [params, setParams] = useSearchParams();
  const forParam = params.get("for");
  const inferred = useMemo(() => faqAudienceFrom({
    searchFor: forParam,
    previousPath: readPrevFaqPath(),
    referrer: typeof document !== "undefined" ? document.referrer : "",
  }), [forParam]);
  const [audience, setAudience] = useState(inferred);
  const root = useRef(null);

  useEffect(() => {
    setAudience(inferred);
    if (forParam !== inferred) setParams({ for: inferred }, { replace: true });
  }, [inferred, forParam, setParams]);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const bands = [...el.querySelectorAll(".how-band")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      bands.forEach((b) => b.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    bands.forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) b.classList.add("in");
      else io.observe(b);
    });
    return () => io.disconnect();
  }, []);

  const rows = tl("howPage.rows");
  const srs = tl("howPage.sr");

  function pick(next) {
    setAudience(next);
    setParams({ for: next }, { replace: true });
  }

  return (
    <div ref={root} className="how-grid" data-for={audience}>
      <div className="how-switch" role="group" aria-label={t("howPage.eyebrow")}>
        <button type="button" className={audience === "candidates" ? "on" : ""} aria-pressed={audience === "candidates"} onClick={() => pick("candidates")}>
          {t("howPage.switchJob")}
        </button>
        <button type="button" className={audience === "employers" ? "on" : ""} aria-pressed={audience === "employers"} onClick={() => pick("employers")}>
          {t("howPage.switchHire")}
        </button>
      </div>
      {rows.map((row, i) => {
        const [CandMock, EmpMock] = MOCKS[i] || MOCKS[0];
        return (
          <article key={row.moment} className="how-band">
            <p className="sr-only">{srs[i] || `${row.moment}. ${row.candidateTitle}. ${row.employerTitle}.`}</p>
            <div className="how-step-head">
              <span className="how-step-pill">
                <span className="how-dot">{i + 1}</span>
                <span className="how-moment">{row.moment}</span>
              </span>
            </div>
            <div className="how-band-body">
              <Half kind="cand" title={row.candidateTitle} body={row.candidate} Mock={CandMock} />
              <div className="how-meanwhile" aria-hidden="true"><span /></div>
              <Half kind="emp" title={row.employerTitle} body={row.company} Mock={EmpMock} />
            </div>
          </article>
        );
      })}
      {ctas && (
        <div className="how-ctas">
          <Btn to="/walk-ins" className="btn-slate-primary how-cta-job">{t("buttons.browse")}</Btn>
          <Btn to="/register" variant="ghost" className="how-cta-outline how-cta-hire">{t("nav.startHiring")}</Btn>
          <p className="how-cta-alt how-cta-alt-hire">
            <Link to="/register" className="link">{t("howPage.switchHire")}</Link>
          </p>
          <p className="how-cta-alt how-cta-alt-job">
            <Link to="/walk-ins" className="link">{t("howPage.switchJob")}</Link>
          </p>
        </div>
      )}
    </div>
  );
}
