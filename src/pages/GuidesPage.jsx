import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronLeft, Clock } from "lucide-react";
import { Btn, EmptyState, Reveal, STROKE } from "../components/ds.jsx";
import { GUIDES, guideBySlug } from "../data/guides.js";
import { useMeta } from "../hooks/useMeta.js";
import { t } from "../i18n/strings.js";

function GuideCard({ g, i }) {
  return (
    <Reveal delay={(i % 3) * 80} className="card card-pad card-lift stack gap-12" style={{ position: "relative" }}>
      <h2 className="h-3"><Link to={`/guides/${g.slug}`} className="cover-link" style={{ color: "inherit", textDecoration: "none" }}>{g.title}</Link></h2>
      <p className="body muted" style={{ margin: 0 }}>{g.dek}</p>
      <p className="small muted row gap-6" style={{ marginTop: "auto" }}><Clock size={15} strokeWidth={STROKE} aria-hidden="true" />{t("guides.minutes", { n: g.minutes })}</p>
    </Reveal>
  );
}

function Index() {
  useMeta({ title: t("guides.meta.title"), description: t("guides.meta.description") });
  const groups = ["Candidates", "Companies"];
  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 56 }}>
          <p className="eyebrow">{t("guides.eyebrow")}</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("guides.title")}</h1>
          <p className="lede" style={{ marginTop: 20 }}>{t("guides.sub")}</p>
        </div>
      </section>
      {groups.map((a) => (
        <section key={a} className="section" style={{ paddingTop: a === groups[0] ? 48 : 0 }} aria-labelledby={`g-${a}`}>
          <div className="wrap">
            <h2 id={`g-${a}`} className="h-2" style={{ marginBottom: 24 }}>{t(a === "Companies" ? "guides.companies" : "guides.candidates")}</h2>
            <div className="cards-3">{GUIDES.filter((g) => g.audience === a).map((g, i) => <GuideCard key={g.slug} g={g} i={i} />)}</div>
          </div>
        </section>
      ))}
    </>
  );
}

function Article({ g }) {
  useMeta({ title: g.title, description: g.dek });
  const more = GUIDES.filter((x) => x.slug !== g.slug && x.audience === g.audience).slice(0, 2);
  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 48, paddingBottom: 48, maxWidth: 1040 }}>
          <Link to="/guides" className="link small row gap-4" style={{ display: "inline-flex" }}><ChevronLeft size={16} strokeWidth={STROKE} aria-hidden="true" />{t("guides.back")}</Link>
          <p className="small muted row gap-8" style={{ marginTop: 24 }}>
            <span className="tag">{t(g.audience === "Companies" ? "guides.companies" : "guides.candidates")}</span><Clock size={15} strokeWidth={STROKE} aria-hidden="true" />{t("guides.minutes", { n: g.minutes })}
          </p>
          <h1 className="h-1" style={{ marginTop: 12 }}>{g.title}</h1>
          <p className="lede" style={{ marginTop: 14 }}>{g.dek}</p>
        </div>
      </section>
      <article className="section" style={{ paddingTop: 40 }}>
        <div className="wrap stack gap-24" style={{ maxWidth: 1040 }}>
          {g.body.map(([h, p]) => (
            <div key={p.slice(0, 24)} className="stack gap-8">
              {h && <h2 className="h-3">{h}</h2>}
              <p className="body" style={{ fontSize: 17.5, lineHeight: 1.7, margin: 0, maxWidth: 760 }}>{p}</p>
            </div>
          ))}
          <div className="panel row between gap-16" style={{ flexWrap: "wrap", marginTop: 16 }}>
            <span className="strong">{t(g.audience === "Companies" ? "guides.ctaCompanies" : "guides.ctaCandidates")}</span>
            {g.audience === "Companies"
              ? <Btn to="/for-companies" iconRight={ArrowRight}>{t("nav.companies")}</Btn>
              : <Btn to="/walk-ins" iconRight={ArrowRight}>{t("buttons.browse")}</Btn>}
          </div>
          {more.length > 0 && (
            <div className="stack gap-12" style={{ marginTop: 24 }}>
              <h2 className="h-4">{t("guides.more")}</h2>
              <div className="cards-2">{more.map((x, i) => <GuideCard key={x.slug} g={x} i={i} />)}</div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}

export default function GuidesPage() {
  const { slug } = useParams();
  if (!slug) return <Index />;
  const g = guideBySlug(slug);
  if (!g) return <div className="wrap section"><EmptyState icon={BookOpen} title={t("guides.missing")} action={<Btn to="/guides">{t("guides.back")}</Btn>} /></div>;
  return <Article g={g} />;
}
