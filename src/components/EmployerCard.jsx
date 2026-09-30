import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Btn, STROKE } from "./ds.jsx";
import { t, tl } from "../i18n/strings.js";

export function MiniBoard() {
  const chip = (n, tone) => {
    const bg = tone === "round" ? "rgba(143,168,255,0.35)" : tone === "done" ? "rgba(22,163,74,0.22)" : "#E8ECF5";
    return <span className="token-pill" style={{ background: bg, color: "#1E2A44" }}>{n}</span>;
  };
  const col = (title, rows, tone) => (
    <div className="mini-board-col">
      <span className="tiny" style={{ color: "var(--slate-muted)", fontWeight: 600 }}>{title} · <span className="mono">{rows.length}</span></span>
      {rows.map(([n, name]) => (
        <div key={n} className="mini-board-row">
          {chip(n, tone)}
          <span className="tiny grow" style={{ color: "var(--slate-text)" }}>{name}</span>
        </div>
      ))}
    </div>
  );
  const [waiting, inRound, done] = tl("home.board.cols");
  return (
    <div className="mini-board" aria-hidden="true">
      <div className="row between" style={{ marginBottom: 14 }}>
        <span className="small" style={{ color: "var(--slate-text)", fontWeight: 700 }}>{t("home.board.queue")} · {t("home.sample")}</span>
        <span className="btn btn-slate-primary btn-sm" style={{ pointerEvents: "none" }}>{t("buttons.callNext")}</span>
      </div>
      <div className="mini-board-grid">
        {col(waiting, tl("home.board.wait"), "")}
        {col(inRound, tl("home.board.round"), "round")}
        {col(done, tl("home.board.done"), "done")}
      </div>
    </div>
  );
}

export function EmployerCard({ howEmployers = false }) {
  return (
    <section className="employer-card-sec" aria-labelledby="employer-card-h">
      <div className="wrap">
        <div className="employer-card employer-band">
          <div className="employer-band-copy">
            <p className="employer-card-label">{t("home.companies.eyebrow")}</p>
            <h2 id="employer-card-h" className="employer-card-h">{t("home.companies.title")}</h2>
            <p className="employer-band-support">{t("home.hero.companySupport")}</p>
            <div className="row gap-12 wrap-row employer-card-actions">
              <Btn to="/register" size="lg" className="btn-slate-primary" iconRight={ArrowRight}>{t("nav.startHiring")}</Btn>
              <Btn to="/for-companies#pilot" variant="ghost" size="lg" className="on-slate">{t("nav.bookPilot")}</Btn>
            </div>
            {howEmployers && (
              <p className="employer-how-link">
                <Link to="/how-it-works?for=employers" className="link">{t("home.companies.howEmployers")}</Link>
              </p>
            )}
          </div>
          <MiniBoard />
        </div>
      </div>
    </section>
  );
}

export function EmployerTicks() {
  return (
    <section className="employer-card-sec" aria-labelledby="employer-ticks-h">
      <div className="wrap">
        <div className="employer-card">
          <p className="employer-card-label">{t("home.companies.eyebrow")}</p>
          <h2 id="employer-ticks-h" className="employer-card-h">{t("home.companies.title")}</h2>
          <ul className="bullets employer-card-bullets">
            {tl("home.companies.bullets").map((b) => (
              <li key={b}><CircleCheck size={20} strokeWidth={STROKE} aria-hidden="true" />{b}</li>
            ))}
          </ul>
          <div className="row gap-12 wrap-row employer-card-actions">
            <Btn to="/register" size="lg" className="btn-slate-primary" iconRight={ArrowRight}>{t("nav.startHiring")}</Btn>
            <Btn to="/for-companies#pilot" variant="ghost" size="lg" className="on-slate">{t("nav.bookPilot")}</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
