import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { DriveCard, STROKE, useSaved } from "../components/ds.jsx";
import { EmployerCard } from "../components/EmployerCard.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { LiveHeroRow } from "../components/LiveStrip.jsx";
import { CityChip } from "../components/CityChip.jsx";
import { HERO_CITIES, cityPath, publicDrives, sortForBoard } from "../lib/listing.js";
import { driveStatus, driveWhen } from "../lib/status.js";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";

function HeroToken() {
  return (
    <aside className="hero-token" aria-hidden="true">
      <p className="hero-token-kicker">{t("home.phone.yourToken")}</p>
      <p className="hero-token-num">{t("home.phone.token")}</p>
      <div className="hero-token-facts">
        <p>{t("home.phone.ahead")}</p>
        <p>{t("home.phone.wait")}</p>
        <p className="hero-token-room">{t("home.phone.room")}</p>
      </div>
    </aside>
  );
}

function Hero() {
  const { drives } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const go = (query) => {
    const next = String(query ?? q).trim();
    nav(next ? `/walk-ins?q=${encodeURIComponent(next)}` : "/walk-ins");
  };
  return (
    <section className="home-hero mesh" aria-label={t("home.hero.label")}>
      <div className="wrap">
        <div className="home-hero-main">
          <div className="home-hero-copy">
            <h1 className="home-hero-h1">{t("home.hero.candidateH1")}</h1>
            <p className="home-hero-sub">{t("home.hero.sub")}</p>
            <div className="home-search">
              <SearchBox drives={drives} value={q} onChange={setQ} onSubmit={go} />
            </div>
            <div className="home-cities" role="navigation" aria-label={t("home.hero.citiesAria")}>
              {HERO_CITIES.map((c) => <CityChip key={c} city={c} />)}
            </div>
            <p className="home-hero-how">
              <Link to="/how-it-works" className="link">{t("home.hero.howCandidates")}</Link>
            </p>
          </div>
          <HeroToken />
        </div>
        <LiveHeroRow />
      </div>
    </section>
  );
}

function Happening({ drives }) {
  const saved = useSaved();
  const cards = useMemo(() => {
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
      if (out.length === 3) break;
    }
    return out;
  }, [drives]);
  return (
    <section className="home-today" aria-labelledby="now-h">
      <div className="wrap">
        <div className="row between gap-16" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <h2 id="now-h" className="h-2">{t("home.today.now")}</h2>
          <Link to="/walk-ins" className="link row gap-6">{t("home.today.seeAll")} <ArrowRight size={18} strokeWidth={STROKE} aria-hidden="true" /></Link>
        </div>
        {cards.length === 0 && <p className="body muted">{t("home.today.empty")}</p>}
        <div className="cards-3 home-cards">
          {cards.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}
        </div>
      </div>
    </section>
  );
}

function Cities({ drives }) {
  const counts = useMemo(() => {
    const m = new Map();
    for (const d of publicDrives(drives)) {
      if (!d.city) continue;
      m.set(d.city, (m.get(d.city) || 0) + 1);
    }
    const order = HERO_CITIES.filter((c) => m.has(c));
    for (const c of [...m.keys()].sort()) if (!order.includes(c)) order.push(c);
    return order.map((c) => [c, m.get(c) || 0]);
  }, [drives]);
  return (
    <section className="home-cities-sec" aria-labelledby="cities-h">
      <div className="wrap">
        <h2 id="cities-h" className="h-2" style={{ marginBottom: 16 }}>{t("home.cities.title")}</h2>
        <div className="city-tiles">
          {counts.map(([c, n]) => (
            <Link key={c} to={cityPath(c)} className="city-tile">
              <span className="h-4">{c}</span>
              <span className="tiny muted">{t(n === 1 ? "home.cities.one" : "home.cities.n", { n })}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { drives } = useStore();
  useMeta({ title: t("home.meta.title"), description: t("home.meta.description") });
  return (
    <>
      <Hero />
      <Happening drives={drives} />
      <Cities drives={drives} />
      <EmployerCard howEmployers />
    </>
  );
}
