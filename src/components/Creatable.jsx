import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { t } from "../i18n/strings.js";
import { STROKE } from "./ds.jsx";

const keyOf = (s) => String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

function nearMatch(typed, options) {
  const k = keyOf(typed);
  if (k.length < 3) return null;
  return options.find((o) => {
    const l = keyOf(o.label);
    if (!l || l === k) return false;
    if (l.startsWith(k) || k.startsWith(l)) return Math.abs(l.length - k.length) <= 2;
    return l.includes(k) && k.length >= 4;
  }) || null;
}

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
  const hint = nearMatch(typed, options);
  const rows = useMemo(() => {
    const k = keyOf(typed);
    const shown = options.filter((o) => !k || keyOf(o.label).includes(k)).slice(0, 30);
    const exact = options.some((o) => keyOf(o.label) === k);
    return onCreate && typed && !exact ? [...shown, { create: true, label: typed }] : shown;
  }, [options, typed, onCreate]);
  const showList = open && (rows.length > 0 || hint);

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
          {hint && onCreate && typed && !options.some((o) => keyOf(o.label) === keyOf(typed)) && (
            <div className="suggest-opt tiny muted" style={{ pointerEvents: "none" }}>{t("library.didYouMean", { existing: hint.label })}</div>
          )}
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

export function CreatableSelect(props) {
  return <Creatable {...props} />;
}

export function TagSelect({ id, tags, suggestions, onAdd, onRemove, placeholder }) {
  const [text, setText] = useState("");
  const options = suggestions.filter((s) => !tags.some((t) => keyOf(t) === keyOf(s))).map((label) => ({ id: label, label }));
  return (
    <div className="stack gap-8">
      {tags.length > 0 && (
        <div className="wrap-row gap-8">
          {tags.map((tag) => (
            <span key={tag} className="chip" style={{ paddingRight: 4 }}>
              {tag}
              <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={t("library.removeTag", { name: tag })} onClick={() => onRemove(tag)}>
                <X size={14} strokeWidth={STROKE} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Creatable id={id} value={text} options={options} placeholder={placeholder}
        onChange={setText} onPick={(o) => { onAdd(o.label); setText(""); }}
        onCreate={(v) => { onAdd(v.trim()); setText(""); }} />
    </div>
  );
}
