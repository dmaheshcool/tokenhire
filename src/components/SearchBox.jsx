import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Briefcase, Building2, MapPin, Search, X } from "lucide-react";
import { searchSuggestions } from "../lib/listing.js";
import { t } from "../i18n/strings.js";
import { STROKE } from "./ds.jsx";

const GROUPS = [
  ["roles", Briefcase],
  ["companies", Building2],
  ["cities", MapPin],
];

export default function SearchBox({ drives, value, onChange, onSubmit, compact = false, busy = false }) {
  const id = useId();
  const listId = `${id}-list`;
  const wrap = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  const groups = useMemo(() => searchSuggestions(drives, value), [drives, value]);
  const flat = useMemo(() => GROUPS.flatMap(([key]) => groups[key].map((s) => ({ ...s, group: key }))), [groups]);
  const showList = open && flat.length > 0;

  useEffect(() => { setActive(-1); }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, id]);

  const choose = (label) => {
    onChange(label);
    setOpen(false);
    onSubmit(label);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      if (showList) { e.preventDefault(); setOpen(false); }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!flat.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + flat.length) % flat.length);
      return;
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (showList && active >= 0) choose(flat[active].label);
      else submit(e);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setOpen(false);
    onSubmit(value);
  };

  let n = -1;
  return (
    <div ref={wrap} className={`searchbox${compact ? " searchbox-compact" : ""}`}>
      <form className="search" role="search" onSubmit={submit}>
        <Search size={compact ? 18 : 22} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", flexShrink: 0 }} />
        <label htmlFor={`${id}-q`} className="sr-only">{t("home.hero.searchPlaceholder")}</label>
        <input
          id={`${id}-q`}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t(narrow && !compact ? "home.hero.searchPlaceholderShort" : "home.hero.searchPlaceholder")}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        />
        {value && (
          <button type="button" className="search-clear" aria-label={t("home.search.clear")}
            onClick={() => { onChange(""); setOpen(false); wrap.current?.querySelector("input")?.focus(); }}>
            <X size={18} strokeWidth={STROKE} aria-hidden="true" />
          </button>
        )}
        <button type="submit" className={`btn btn-primary${compact ? " btn-sm" : " search-go"}`} aria-busy={busy || undefined} disabled={busy}>
          {!compact && <Search className="search-go-icon" size={18} strokeWidth={STROKE} aria-hidden="true" />}
          {busy
            ? t("home.hero.searching")
            : compact
              ? t("home.hero.search")
              : <>
                <span className="search-label-full">{t("home.hero.search")}</span>
                <span className="search-label-short">{t("home.hero.searchShort")}</span>
              </>}
        </button>
      </form>
      {showList && (
        <div id={listId} role="listbox" className="suggest" aria-label={t("home.search.suggestions")}>
          {GROUPS.map(([key, Icon]) => groups[key].length > 0 && (
            <div key={key} role="group" aria-labelledby={`${id}-g-${key}`}>
              <div id={`${id}-g-${key}`} className="suggest-head">{t(`home.search.groups.${key}`)}</div>
              {groups[key].map((s) => {
                n += 1;
                const i = n;
                return (
                  <div key={s.label} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}
                    className="suggest-opt" onPointerDown={(e) => e.preventDefault()} onClick={() => choose(s.label)}
                    onPointerEnter={() => setActive(i)}>
                    <Icon size={16} strokeWidth={STROKE} aria-hidden="true" />
                    <span className="grow">{s.label}</span>
                    <span className="suggest-count">{t(s.count === 1 ? "home.search.countOne" : "home.search.count", { n: s.count })}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
