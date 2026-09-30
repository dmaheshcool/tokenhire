import { Link } from "react-router-dom";
import { EmployerCard } from "../components/EmployerCard.jsx";
import { HowGrid } from "../components/HowGrid.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t } from "../i18n/strings.js";

export default function HowItWorksPage() {
  useMeta({ title: t("howPage.meta.title"), description: t("howPage.meta.description") });
  return (
    <>
      <section className="section how-page" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div className="wrap">
          <p className="eyebrow">{t("howPage.label")}</p>
          <h1 className="how-page-h1">{t("howPage.title")}</h1>
          <p className="lede how-page-sub">{t("howPage.sub")}</p>
          <div style={{ marginTop: 40 }}><HowGrid ctas /></div>
        </div>
      </section>
      <EmployerCard />
      <section id="faq" className="section q-teaser" style={{ paddingTop: 0, scrollMarginTop: 80 }} aria-labelledby="hw-faq">
        <div className="wrap">
          <h2 id="hw-faq" className="h-1">{t("faq.title")}</h2>
          <p className="lede" style={{ margin: "8px 0 20px", maxWidth: 640 }}>{t("faq.sub")}</p>
          <p style={{ margin: 0 }}>
            <Link to="/questions?for=candidates" className="link">{t("faq.switchCandidates")}</Link>
            {" · "}
            <Link to="/questions?for=employers" className="link">{t("faq.switchEmployers")}</Link>
            {" · "}
            <Link to="/questions" className="link">{t("faq.seeAll")}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
