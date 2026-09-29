import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, DoorOpen, FileSpreadsheet, LayoutGrid, Plus, Search, ShieldCheck, Ticket, Users } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { Btn, CountUp, DriveCard, LiveDot, QueueBar, Reveal, STROKE, useSaved } from "../components/ds.jsx";
import { createDrivePath } from "../components/SiteChrome.jsx";
import { HERO_CITIES, boardStats, cityPath, publicDrives, sortForBoard } from "../lib/listing.js";
import { driveStatus, driveWhen } from "../lib/status.js";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";

function HeroPhone() {
  return (
    <div className="phone" aria-label={t("home.phone.alt")} role="img">
      <div className="phone-screen stack gap-12">
        <div className="row between">
          <span className="tiny strong" style={{ fontWeight: 700 }}>{t("home.phone.company")}</span>
          <span className="status status-live">{t("home.phone.live")}</span>
        </div>
        <div className="ticket" style={{ "--cut": "74px" }}>
          <div className="ticket-top" style={{ padding: "14px 16px 0" }}>
            <p className="tiny muted" style={{ margin: 0, fontWeight: 600 }}>{t("home.phone.role")}</p>
            <p className="tiny muted" style={{ margin: "2px 0 0" }}>{t("home.phone.place")}</p>
          </div>
          <div className="ticket-tear" style={{ margin: "0 14px" }} />
          <div className="ticket-body" style={{ padding: "14px 16px 16px" }}>
            <p className="tiny muted" style={{ margin: 0, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{t("home.phone.yourToken")}</p>
            <p className="ticket-num" style={{ fontSize: 64, margin: "6px 0 10px" }}>{t("home.phone.token")}</p>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="small strong">{t("home.phone.ahead")}</span>
              <span className="small muted">{t("home.phone.wait")}</span>
            </div>
            <QueueBar value={35} max={42} label={t("home.phone.progress")} />
          </div>
        </div>
        <div className="card" style={{ padding: "12px 14px", borderRadius: 14 }}>
          <span className="small strong" style={{ fontWeight: 700 }}>{t("home.phone.room")}</span>
        </div>
        <ol className="timeline" style={{ padding: "4px 4px 0" }} aria-hidden="true">
          {tl("home.phone.timeline").map((label, i) => {
            const st = i === 0 ? "done" : i === 1 ? "now" : "";
            return (
              <li key={label} className={st} style={{ fontSize: 12.5, paddingBottom: 10 }}>
                <span className="tl-dot" style={{ width: 16, height: 16 }}>{st === "done" && <Check size={10} strokeWidth={3} />}</span>{label}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Hero({ stats }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const v = q.trim();
    nav(v ? `/walk-ins?q=${encodeURIComponent(v)}` : "/walk-ins");
  };
  return (
    <section className="mesh">
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <p className="row gap-8 small" style={{ margin: "0 0 20px", fontWeight: 600, color: "var(--ink-2)" }}>
          <LiveDot /> <span>{t("home.hero.live", { n: stats.live })}</span>
        </p>
        <h1 className="h-display hero-title">{t("tagline")}</h1>
        <div className="grid-12" style={{ alignItems: "start", marginTop: 28 }}>
          <div className="span-7 stack gap-24" style={{ paddingTop: 8 }}>
            <p className="lede" style={{ fontSize: "clamp(18px, 1.9vw, 23px)" }}>{t("home.hero.sub")}</p>
            <form className="search" role="search" onSubmit={submit} style={{ maxWidth: 560 }}>
              <Search size={20} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", flexShrink: 0 }} />
              <label htmlFor="hero-q" className="sr-only">{t("home.hero.searchPlaceholder")}</label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.hero.searchPlaceholder")} autoComplete="off" />
              <button type="submit" className="btn btn-primary">{t("home.hero.search")}</button>
            </form>
            <div className="stack gap-8">
              <span className="small muted" style={{ fontWeight: 600 }}>{t("home.hero.citiesLabel")}</span>
              <div className="chips-scroll" aria-label={t("home.hero.citiesLabel")}>
                {HERO_CITIES.map((c) => <Link key={c} to={cityPath(c)} className="chip">{c}</Link>)}
              </div>
            </div>
          </div>
          <div className="span-5 row hero-phone" style={{ justifyContent: "center" }}>
            <HeroPhone />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatStrip({ stats }) {
  const items = [
    [stats.today, t("home.stats.today")],
    [stats.inQueue, t("home.stats.queue")],
    [stats.cities, t("home.stats.cities")],
  ];
  return (
    <div className="wrap" style={{ marginTop: -36, position: "relative" }}>
      <div className="stats" aria-label={t("home.stats.label")}>
        {items.map(([n, label]) => (
          <div key={label}>
            <span className="stat-num"><CountUp value={n} /></span>
            <span className="small muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Steps() {
  const steps = [
    [Search, t("home.steps.s1.t"), t("home.steps.s1.d")],
    [Ticket, t("home.steps.s2.t"), t("home.steps.s2.d")],
    [DoorOpen, t("home.steps.s3.t"), t("home.steps.s3.d")],
  ];
  return (
    <section className="section" aria-labelledby="how-h">
      <div className="wrap">
        <p className="eyebrow">{t("home.steps.eyebrow")}</p>
        <h2 id="how-h" className="h-1" style={{ margin: "10px 0 40px" }}>{t("home.steps.title")}</h2>
        <div className="cards-3">
          {steps.map(([Icon, title, body], i) => (
            <Reveal key={title} delay={i * 80} className="card card-pad stack gap-16">
              <div className="row between">
                <span className={`step-icon${i === 1 ? " lime" : ""}`}><Icon size={24} strokeWidth={STROKE} aria-hidden="true" /></span>
                <span className="mono faint" style={{ fontSize: 14, fontWeight: 700 }}>0{i + 1}</span>
              </div>
              <h3 className="h-3">{title}</h3>
              <p className="body muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audiences() {
  const bullets = (list) => (
    <ul className="bullets">
      {list.map((b) => <li key={b}><Check size={18} strokeWidth={2} aria-hidden="true" /><span>{b}</span></li>)}
    </ul>
  );
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap cards-2">
        <Reveal className="card card-pad stack gap-24" style={{ padding: 32 }}>
          <p className="eyebrow">{t("home.candidates.eyebrow")}</p>
          <h2 className="h-2">{t("home.candidates.title")}</h2>
          {bullets(tl("home.candidates.bullets"))}
          <div style={{ marginTop: "auto" }}><Btn to="/walk-ins" size="lg" iconRight={ArrowRight}>{t("home.candidates.cta")}</Btn></div>
        </Reveal>
        <Reveal delay={80} className="card card-pad band-dark stack gap-24" style={{ padding: 32, borderColor: "transparent" }}>
          <p className="eyebrow" style={{ color: "var(--lime)" }}>{t("home.companies.eyebrow")}</p>
          <h2 className="h-2">{t("home.companies.title")}</h2>
          {bullets(tl("home.companies.bullets"))}
          <div style={{ marginTop: "auto" }}><Btn to={createDrivePath()} variant="lime" size="lg" iconRight={ArrowRight}>{t("home.companies.cta")}</Btn></div>
        </Reveal>
      </div>
    </section>
  );
}

function Today({ drives }) {
  const saved = useSaved();
  const list = useMemo(() => {
    const pub = publicDrives(drives);
    const today = sortForBoard(pub.filter((d) => driveWhen(d).key === "today"));
    const next = sortForBoard(pub.filter((d) => driveStatus(d) === "scheduled" && driveWhen(d).key !== "today"));
    const seen = new Set();
    const out = [];
    for (const d of [...today, ...next]) {
      const key = `${d.company}|${d.role}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(d);
      if (out.length === 6) break;
    }
    return { cards: out, empty: today.length === 0 };
  }, [drives]);
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="today-h">
      <div className="wrap">
        <div className="row between gap-16" style={{ marginBottom: 28, flexWrap: "wrap" }}>
          <h2 id="today-h" className="h-1 row gap-12"><LiveDot /> {t("home.today.title")}</h2>
          <Link to="/walk-ins" className="link row gap-6">{t("home.today.seeAll")} <ArrowRight size={18} strokeWidth={STROKE} aria-hidden="true" /></Link>
        </div>
        {list.empty && <p className="body muted" style={{ marginBottom: 20 }}>{t("home.today.empty")}</p>}
        <div className="cards-3">
          {list.cards.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}
        </div>
      </div>
    </section>
  );
}

export function MiniBoard() {
  const col = (title, tokens, tone) => (
    <div className="stack gap-8" style={{ background: "rgba(255,255,255,.05)", borderRadius: 14, padding: 12, minWidth: 0 }}>
      <span className="tiny" style={{ color: "#9AA1B4", fontWeight: 600 }}>{title} · <span className="mono">{tokens.length}</span></span>
      {tokens.map(([n, who, room]) => (
        <div key={n} className="row gap-8" style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "8px 10px" }}>
          <span className={`token-pill${tone === "lime" ? " lime" : ""}`} style={tone === "lime" ? undefined : { background: "#F2F3F7", color: "#0B1020" }}>{n}</span>
          <span className="tiny grow" style={{ color: "#C9CDD8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{who}</span>
          {room && <span className="tiny" style={{ color: "#9AA1B4" }}>{room}</span>}
        </div>
      ))}
    </div>
  );
  const [waiting, inRound, done] = tl("home.board.cols");
  return (
    <div className="card" style={{ background: "#121729", borderColor: "rgba(255,255,255,.08)", padding: 16 }} aria-hidden="true">
      <div className="row between" style={{ marginBottom: 14 }}>
        <span className="small" style={{ color: "#fff", fontWeight: 700 }}>{t("home.board.queue")}</span>
        <span className="btn btn-lime btn-sm" style={{ pointerEvents: "none" }}>{t("buttons.callNext")} <span className="kbd" style={{ borderColor: "rgba(11,16,32,.3)" }}>N</span></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        {col(waiting, [["#043", "Ritu S."], ["#044", "Imran K."], ["#045", "Asha P."]])}
        {col(inRound, [["#041", "Varun M.", "A"], ["#042", "Neha J.", "B"]], "lime")}
        {col(done, [["#039", "Arjun R."], ["#040", "Divya N."]])}
      </div>
    </div>
  );
}

const BAND_ICONS = [LayoutGrid, Users, ShieldCheck, FileSpreadsheet];

function Proof() {
  const items = tl("home.band.items").map((it, i) => [BAND_ICONS[i], it.t, it.d]);
  return (
    <section className="band-dark section" aria-labelledby="proof-h">
      <div className="wrap">
        <p className="eyebrow" style={{ color: "var(--lime)" }}>{t("home.band.eyebrow")}</p>
        <h2 id="proof-h" className="h-1" style={{ margin: "10px 0 40px" }}>{t("home.band.title")}</h2>
      </div>
      <div className="wrap grid-12" style={{ alignItems: "start", rowGap: 32 }}>
        <div className="span-6">
          <MiniBoard />
        </div>
        <div className="span-6">
          <div className="cards-2">
            {items.map(([Icon, title, body]) => (
              <div key={title} className="stack gap-12" style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                <Icon size={24} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--lime)" }} />
                <h3 className="h-3">{title}</h3>
                <p className="body" style={{ color: "#C9CDD8" }}>{body}</p>
              </div>
            ))}
          </div>
          <div className="row gap-12" style={{ marginTop: 28, flexWrap: "wrap" }}>
            <Btn to="/how-it-works?tab=companies" variant="lime" size="lg" iconRight={ArrowRight}>{t("home.band.cta")}</Btn>
            <Btn to={createDrivePath()} variant="ghost" size="lg" icon={Plus} className="on-dark">{t("buttons.createDrive")}</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items }) {
  return (
    <div className="faq">
      {items.map(({ q, a }) => (
        <details key={q}>
          <summary>{q}<Plus size={22} strokeWidth={STROKE} aria-hidden="true" /></summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

function Faq() {
  return (
    <section className="section" aria-labelledby="faq-h">
      <div className="wrap grid-12">
        <div className="span-4 stack gap-16">
          <h2 id="faq-h" className="h-1">{t("home.faq.title")}</h2>
          <Link to="/how-it-works#faq" className="link row gap-6">{t("home.faq.seeAll")} <ArrowRight size={18} strokeWidth={STROKE} aria-hidden="true" /></Link>
        </div>
        <div className="span-8"><FaqList items={tl("faq.c").slice(0, 5)} /></div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="close-h">
      <div className="wrap">
        <div className="panel row between gap-24" style={{ padding: 40, flexWrap: "wrap" }}>
          <div className="stack gap-8">
            <h2 id="close-h" className="h-2">{t("home.closing.title")}</h2>
            <p className="body muted" style={{ margin: 0 }}>{t("home.closing.body")}</p>
          </div>
          <Btn to="/for-companies#pilot" size="lg" iconRight={ArrowRight}>{t("home.closing.cta")}</Btn>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { drives } = useStore();
  const stats = useMemo(() => boardStats(drives), [drives]);
  useMeta({ title: t("home.meta.title"), description: t("home.meta.description") });
  return (
    <>
      <Hero stats={stats} />
      <StatStrip stats={stats} />
      <Steps />
      <Audiences />
      <Today drives={drives} />
      <Proof />
      <Faq />
      <Closing />
    </>
  );
}
