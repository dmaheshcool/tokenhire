import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { t } from "../i18n/strings.js";
import { STROKE } from "./ds.jsx";

const keyOf = (s) => String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Type to search a company's list. When nothing matches exactly, the last row offers
 * to create the typed text. `onCreate` saves it to the library.
 */
export default function Creatable({ id, value, onChange, options, onPick, onCreate, placeholder, invalid, describedBy }) {
  const wrap = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id}-list`;

  const typed = String(value ?? "").trim();
  const rows = useMemo(() => {
    const k = keyOf(typed);
    const shown = options.filter((o) => !k || keyOf(o.label).includes(k)).slice(0, 30);
    const exact = options.some((o) => keyOf(o.label) === k);
    return onCreate && typed && !exact ? [...shown, { create: true, label: typed }] : shown;
  }, [options, typed, onCreate]);
  const showList = open && rows.length > 0;

  useEffect(() => { setActive(-1); }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, id]);

  const choose = (row) => {
    setOpen(false);
    if (row.create) onCreate(row.label);
    else onPick(row);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { if (showList) { e.preventDefault(); e.stopPropagation(); setOpen(false); } return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!rows.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + rows.length) % rows.length);
      return;
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing && showList) {
      e.preventDefault();
      const pick = active >= 0 ? rows[active] : rows.length === 1 || rows[0]?.create ? rows[0] : rows.find((r) => r.create);
      if (pick) choose(pick);
      else setOpen(false);
    }
  };

  return (
    <div ref={wrap} className="creatable">
      <input
        id={id} className="input" value={value} placeholder={placeholder} autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
        role="combobox" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined} aria-describedby={describedBy}
      />
      <button type="button" className="creatable-toggle" tabIndex={-1} aria-hidden="true"
        onPointerDown={(e) => e.preventDefault()} onClick={() => { setOpen((o) => !o); wrap.current?.querySelector("input")?.focus(); }}>
        <ChevronDown size={18} strokeWidth={STROKE} />
      </button>
      {showList && (
        <div id={listId} role="listbox" className="suggest creatable-list">
          {rows.map((row, i) => (
            <div key={row.create ? "__create" : row.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}
              className={`suggest-opt${row.create ? " suggest-create" : ""}`}
              onPointerDown={(e) => e.preventDefault()} onClick={() => choose(row)} onPointerEnter={() => setActive(i)}>
              {row.create
                ? <><Plus size={16} strokeWidth={STROKE} aria-hidden="true" /><span className="grow">{t("library.create", { text: row.label })}</span></>
                : <>
                  <span className="grow">{row.label}</span>
                  {row.hint && <span className="suggest-count">{row.hint}</span>}
                  {keyOf(row.label) === keyOf(typed) && <Check size={16} strokeWidth={STROKE} aria-hidden="true" />}
                </>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
