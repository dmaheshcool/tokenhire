import { useMemo } from "react";
import { Bookmark, Share2, Trash2 } from "lucide-react";
import { Btn, CardSkeleton, DriveCard, EmptyState, useSaved, useToast } from "../components/ds.jsx";
import RemindMe from "../components/RemindMe.jsx";
import { useStore } from "../context/Store.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { sortForBoard } from "../lib/listing.js";
import { shareDrive } from "../lib/share.js";
import { driveStatus } from "../lib/status.js";
import { t } from "../i18n/strings.js";

function Actions({ drive, toast }) {
  const open = driveStatus(drive) === "scheduled";
  return (
    <>
      {open && <RemindMe drive={drive} size="sm" />}
      <Btn variant="ghost" size="sm" icon={Share2} onClick={() => shareDrive(drive, toast)} className="push">{t("buttons.share")}</Btn>
    </>
  );
}

export default function SavedPage() {
  const { drives, hydrated, apiOk } = useStore();
  const saved = useSaved();
  const toast = useToast();
  useMeta({ title: t("savedPage.meta.title"), description: t("savedPage.meta.description") });

  const { upcoming, ended, missing } = useMemo(() => {
    const byId = new Map(drives.filter((d) => d.visibility !== "private").map((d) => [d.id, d]));
    const found = saved.ids.map((id) => byId.get(id)).filter(Boolean);
    return {
      upcoming: sortForBoard(found.filter((d) => driveStatus(d) !== "wrapped")),
      ended: sortForBoard(found.filter((d) => driveStatus(d) === "wrapped")),
      missing: saved.ids.filter((id) => !byId.has(id)),
    };
  }, [drives, saved.ids]);

  const loading = !hydrated && apiOk !== false;
  const clearEnded = () => { saved.remove(ended.map((d) => d.id)); toast(t("savedPage.clearedEnded")); };

  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
          <p className="eyebrow">{t("savedPage.eyebrow")}</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("savedPage.title")}</h1>
          <p className="lede" style={{ marginTop: 16 }}>{t("savedPage.note")}</p>
        </div>
      </section>
      <section className="wrap" style={{ paddingTop: 32, paddingBottom: 96 }}>
        {loading && saved.count > 0 ? (
          <div className="cards-2"><CardSkeleton /><CardSkeleton /></div>
        ) : !saved.count ? (
          <EmptyState icon={Bookmark} title={t("empty.noSaved.t")} body={t("empty.noSaved.d")} action={<Btn to="/walk-ins">{t("empty.noSaved.cta")}</Btn>} />
        ) : (
          <div className="stack gap-48" style={{ gap: 48 }}>
            <div className="stack gap-16">
              <h2 className="h-3">{t("savedPage.upcoming", { n: upcoming.length })}</h2>
              {upcoming.length
                ? <div className="cards-2">{upcoming.map((d) => <DriveCard key={d.id} drive={d} saved={saved} actions={<Actions drive={d} toast={toast} />} />)}</div>
                : <p className="body muted" style={{ margin: 0 }}>{t("savedPage.noUpcoming")}</p>}
            </div>
            {ended.length > 0 && (
              <div className="stack gap-16">
                <div className="row between gap-12" style={{ flexWrap: "wrap" }}>
                  <h2 className="h-3">{t("savedPage.ended", { n: ended.length })}</h2>
                  <Btn variant="ghost" size="sm" icon={Trash2} onClick={clearEnded}>{t("savedPage.clearEnded")}</Btn>
                </div>
                <div className="cards-2">{ended.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}</div>
              </div>
            )}
            {hydrated && missing.length > 0 && (
              <div className="panel row between gap-12" style={{ padding: 16, flexWrap: "wrap" }}>
                <p className="small" style={{ margin: 0 }}>{t(missing.length === 1 ? "savedPage.missingOne" : "savedPage.missing", { n: missing.length })}</p>
                <Btn variant="ghost" size="sm" onClick={() => saved.remove(missing)}>{t("savedPage.removeMissing")}</Btn>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
