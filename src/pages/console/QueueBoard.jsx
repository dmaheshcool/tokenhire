import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CornerUpLeft, Megaphone, NotebookPen, Pause, Search, SkipForward, UserX, X } from "lucide-react";
import { Btn, STROKE, useToast } from "../../components/ds.jsx";
import { preregList } from "../../lib/prereg.js";
import { NotesPanel } from "../app/EmployerPage.jsx";
import { isLastRound, nextRoundIdx, occupantOf, roundIndexOfRoom, waitingRoundIdx } from "../../lib/helpers.js";
import { calledOverdue, nextCall as pickNext } from "../../lib/queue-machine.js";
import { roleOf } from "../../lib/library.js";
import { tokenNumber } from "../../lib/listing.js";
import { t } from "../../i18n/strings.js";

const IN_ROUND = ["calling", "at_desk", "interviewing"];
const DONE = ["selected", "rejected", "onhold", "absent", "done"];
const OUTCOME_TONE = { selected: "var(--success)", rejected: "var(--danger)", onhold: "var(--warning)", absent: "var(--ink-3)" };

function elapsed(since) {
  if (!since) return "";
  const s = Math.max(0, Math.floor((Date.now() - since) / 1000));
  if (s > 12 * 3600) return "";
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function columnOf(c) {
  if (c.state === "wait") return "waiting";
  if (IN_ROUND.includes(c.state)) return "round";
  if (DONE.includes(c.state)) return "done";
  return null;
}

export function nextCall(drive, roomId) {
  return pickNext(drive, roomId);
}

function Card({ c, drive, col, actions, onDragStart, onNotes, deskMode }) {
  const round = (drive.rounds || [])[waitingRoundIdx(drive.rounds, c)];
  const role = roleOf(drive, c);
  return (
    <article className="board-card" draggable onDragStart={(e) => onDragStart(e, c)}>
      <div className="row between gap-8">
        <span className="token-pill mono">{tokenNumber(c.token)}</span>
        {role && (drive.roles || []).length > 1 && <span className="tag mono" title={role.title}>{role.code}</span>}
        <span className="tiny muted mono grow" style={{ textAlign: "right" }}>
          {col === "waiting" && elapsed(c.arrivedAt || c.at)}
          {col === "round" && (c.state === "calling"
            ? t("console.queue.calledAgo", { ago: elapsed(c.calledAt) })
            : [c.room?.name, elapsed(c.calledAt)].filter(Boolean).join(" · "))}
          {col === "done" && (deskMode ? (c.state === "absent" ? t("console.queue.labels.absent") : t("console.queue.cols.done")) : <span style={{ color: OUTCOME_TONE[c.state], fontWeight: 600 }}>{t(`console.queue.labels.${c.state}`)}</span>)}
        </span>
        {!deskMode && (
          <button type="button" className="btn btn-ghost btn-sm btn-icon" style={{ width: 30, height: 30, minHeight: 30 }} onClick={() => onNotes(c)} aria-label={`${t("console.queue.notes")}: ${c.name}`} title={t("console.queue.notes")}>
            <NotebookPen size={15} strokeWidth={STROKE} />
          </button>
        )}
      </div>
      <div>
        <p className="strong" style={{ margin: 0 }}>{c.name}</p>
        <p className="tiny muted" style={{ margin: "2px 0 0" }}>
          {col === "round" ? t(c.state === "calling" ? "console.queue.walking" : "console.queue.interviewing") : round?.name || t("console.form.roundN", { n: 1 })}
          {c.expBand ? ` · ${c.expBand}` : ""}
          {col === "waiting" && c.checkedIn === false && <span className="tag" style={{ marginLeft: 6 }}>{t("console.queue.notArrived")}</span>}
          {c.location_verified === false || c.location_verified === "unknown" ? <span className="tag" style={{ marginLeft: 6 }}>{t("console.queue.locUnknown")}</span> : null}
        </p>
      </div>
      {actions && <div className="row gap-4" style={{ flexWrap: "wrap" }}>{actions}</div>}
    </article>
  );
}

function OutcomeDialog({ cand, rounds, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const last = isLastRound(rounds, cand);
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div className="card card-pad stack gap-16 dialog" role="dialog" aria-modal="true" aria-labelledby="oc-title" onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
        <div className="row between">
          <h2 id="oc-title" className="h-4">{cand.name} · {tokenNumber(cand.token)}</h2>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label={t("buttons.close")}><X size={16} /></button>
        </div>
        <div className="stack gap-8">
          <Btn ref={ref} icon={Check} onClick={() => onPick("passed")}>{last ? t("console.queue.outcome.shortlist") : t("console.queue.moveTo", { n: nextRoundIdx(rounds, cand) + 1 })}</Btn>
          <Btn variant="secondary" icon={Pause} onClick={() => onPick("onhold")}>{t("console.queue.outcome.onhold")}</Btn>
          <Btn variant="secondary" icon={X} onClick={() => onPick("rejected")}>{t("console.queue.outcome.rejected")}</Btn>
          <Btn variant="ghost" icon={UserX} onClick={() => onPick("absent")}>{t("buttons.noShow")}</Btn>
        </div>
      </div>
    </div>
  );
}

export default function QueueBoard({ drive, act, disabled, deskMode }) {
  const toast = useToast();
  const [room, setRoom] = useState("");
  const [q, setQ] = useState("");
  const [over, setOver] = useState(null);
  const [view, setView] = useState("waiting");
  const [deciding, setDeciding] = useState(null);
  const [notesFor, setNotesFor] = useState(null);
  const drag = useRef(null);

  const cols = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (c) => !needle || c.name?.toLowerCase().includes(needle) || String(c.token).toLowerCase().includes(needle.replace(/^#/, "")) || tokenNumber(c.token).includes(needle);
    const out = { waiting: [], round: [], done: [] };
    for (const c of drive.candidates) {
      const col = columnOf(c);
      if (col && match(c)) out[col].push(c);
    }
    out.waiting.sort((a, b) => (waitingRoundIdx(drive.rounds, a) - waitingRoundIdx(drive.rounds, b)) || (a.at - b.at));
    out.round.sort((a, b) => (a.calledAt || 0) - (b.calledAt || 0));
    out.done.sort((a, b) => (b.decidedAt || 0) - (a.decidedAt || 0));
    return out;
  }, [drive, q]);

  async function callNext() {
    if (disabled || deskMode) return;
    if (deciding || notesFor) return;
    const pick = nextCall(drive, room);
    if (!pick) {
      const free = (drive.rooms || []).filter((r) => (!room || r.id === room) && !occupantOf(drive, r.id));
      const msg = !free.length
        ? (room ? t("console.queue.roomBusy", { room: drive.rooms.find((r) => r.id === room)?.name }) : t("console.queue.allBusy"))
        : t("console.queue.nobody");
      toast(msg, "err");
      return;
    }
    const r = await (act.callNext ? act.callNext(pick.room.id) : act.callTo(pick.cand.id, pick.room.id));
    if (r?.already) {
      toast(t("console.queue.alreadyCalled", { recruiter: r.cand?.calledBy || pick.cand.calledBy || "" }), "err");
      return;
    }
    if (!r?.ok) { toast(r?.error || t("console.queue.nobody"), "err"); return; }
    toast(t("console.queue.called", { token: tokenNumber(pick.cand.token).slice(1), room: pick.room.name }));
  }
  const callNextRef = useRef(callNext);
  callNextRef.current = callNext;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (document.querySelector("[role=dialog],[aria-modal=true]")) return;
      e.preventDefault();
      callNextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function callOne(c) {
    const pick = nextCall({ ...drive, candidates: drive.candidates.map((x) => (x.id === c.id ? x : x.state === "wait" ? { ...x, state: "hold-tmp" } : x)) }, room);
    if (!pick) { toast(t("console.queue.noRoom"), "err"); return; }
    const r = await act.callTo(c.id, pick.room.id);
    if (r?.already) { toast(t("console.queue.alreadyCalled", { recruiter: r.cand?.calledBy || c.calledBy || "" }), "err"); return; }
    if (!r?.ok) { toast(r?.error || t("console.queue.noRoom"), "err"); return; }
    toast(t("console.queue.called", { token: tokenNumber(c.token).slice(1), room: pick.room.name }));
  }

  async function outcome(c, o) {
    setDeciding(null);
    const r = o === "absent" ? await act.noShow(c.id) : await act.decide(c.id, o);
    if (!r?.ok) {
      toast(r?.code === "already_decided" ? t("console.queue.existingDecision") : (r?.error || t("console.queue.existingDecision")), "err");
      return;
    }
    toast(t("console.queue.decisionSaved"), "ok", { undo: () => act.undo(c.id) });
  }

  function onDrop(col) {
    setOver(null);
    const c = drive.candidates.find((x) => x.id === drag.current);
    drag.current = null;
    if (!c || disabled || columnOf(c) === col) return;
    if (col === "round") callOne(c);
    if (col === "waiting") act.recall(c.id);
    if (col === "done" && !deskMode) setDeciding(c);
  }

  const startDrag = (e, c) => { drag.current = c.id; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); };

  const column = (key, title, list, empty, actionsFor) => (
    <section className={`board-col${over === key ? " drop" : ""}${view === key ? " on" : ""}`} aria-label={title}
      onDragOver={(e) => { e.preventDefault(); setOver(key); }} onDragLeave={() => setOver((o) => (o === key ? null : o))} onDrop={(e) => { e.preventDefault(); onDrop(key); }}>
      <header className="row between" style={{ padding: "2px 4px 10px" }}>
        <h3 className="h-4">{title}</h3>
        <span className="mono strong">{list.length}</span>
      </header>
      <div className="stack gap-8">
        {list.length ? list.slice(0, 60).map((c) => (
          <Card key={c.id} c={c} drive={drive} col={key} onDragStart={startDrag} onNotes={setNotesFor} deskMode={deskMode} actions={disabled ? null : actionsFor(c)} />
        )) : <p className="small muted" style={{ padding: "18px 6px", textAlign: "center" }}>{empty}</p>}
        {list.length > 60 && <p className="tiny muted" style={{ textAlign: "center" }}>{t("console.queue.more", { n: list.length - 60 })}</p>}
      </div>
    </section>
  );

  const rooms = drive.rooms || [];
  const prereg = preregList(drive);
  return (
    <div className="stack gap-16">
      {prereg.length > 0 && (
        <div className="card card-pad stack gap-8">
          <p className="strong small" style={{ margin: 0 }}>{t("console.queue.preregCount", { n: prereg.length })}</p>
          <ul className="stack gap-4" style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {prereg.slice(0, 12).map((c) => (
              <li key={c.id} className="row between">
                <span>{c.name}</span>
                <span className="tag">{t("console.queue.prereg")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="small strong" style={{ margin: 0 }} aria-live="polite">
        {t("console.queue.summary", {
          waiting: drive.candidates.filter((c) => columnOf(c) === "waiting").length,
          inside: drive.candidates.filter((c) => columnOf(c) === "round").length,
          done: drive.candidates.filter((c) => columnOf(c) === "done").length,
        })}
      </p>
      <div className="row gap-8 queue-tools">
        <div className="search grow" style={{ minWidth: 200 }}>
          <Search size={17} strokeWidth={STROKE} aria-hidden="true" />
          <label className="sr-only" htmlFor="qb-search">{t("console.queue.search")}</label>
          <input id="qb-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("console.queue.search")} />
        </div>
        <label className="sr-only" htmlFor="qb-room">{t("console.queue.room")}</label>
        <select id="qb-room" className="select" style={{ width: "auto", minWidth: 180 }} value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">{t("console.queue.anyRoom")}</option>
          {rooms.map((r) => {
            const busy = occupantOf(drive, r.id);
            const ri = roundIndexOfRoom(drive.rounds, r);
            return <option key={r.id} value={r.id}>{r.name}{ri >= 0 ? ` · ${drive.rounds[ri].name}` : ""}{busy ? ` ${t("console.queue.busy")}` : ""}</option>;
          })}
        </select>
        <Btn icon={Megaphone} onClick={callNext} disabled={disabled || deskMode} aria-keyshortcuts="N">
          {t("buttons.callNext")} <span className="kbd hide-mobile" aria-hidden="true">N</span>
        </Btn>
      </div>

      <div className="board-switch" role="group" aria-label={t("console.queue.showColumn")}>
        {[["waiting", t("console.queue.cols.waiting")], ["round", t("console.queue.cols.round")], ["done", t("console.queue.cols.done")]].map(([k, l]) => (
          <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}>{l} <span className="mono">{cols[k].length}</span></button>
        ))}
      </div>
      <div className="board">
        {column("waiting", t("console.queue.cols.waiting"), cols.waiting, t("console.queue.empty"), (c) => (
          deskMode ? null : (
          <>
            <Btn size="sm" onClick={() => callOne(c)}>{t("console.queue.call")}</Btn>
            {c.checkedIn === false && <Btn size="sm" variant="secondary" onClick={() => act.arrived(c.id)}>{t("console.queue.arrived")}</Btn>}
            <Btn size="sm" variant="ghost" icon={SkipForward} onClick={() => act.skip(c.id)}>{t("buttons.skip")}</Btn>
            <Btn size="sm" variant="ghost" icon={UserX} onClick={() => act.noShow(c.id)}>{t("buttons.noShow")}</Btn>
          </>
          )
        ))}
        {column("round", t("console.queue.cols.round"), cols.round, t("console.queue.empty"), (c) => (
          <>
            {c.state === "calling"
              ? <>
                <Btn size="sm" onClick={() => act.move(c.id, "interviewing")}>{t("console.queue.started")}</Btn>
                <Btn size="sm" variant="ghost" onClick={() => act.callAgain(c.id)}>{t("console.queue.callAgain")}</Btn>
                {calledOverdue(c, drive) && <Btn size="sm" variant="ghost" icon={UserX} onClick={() => act.noShow(c.id)}>{t("buttons.noShow")}</Btn>}
              </>
              : c.state === "at_desk"
                ? !deskMode && <Btn size="sm" onClick={() => act.move(c.id, "interviewing")}>{t("console.queue.started")}</Btn>
              : !deskMode && <>
                {!isLastRound(drive.rounds, c) && <Btn size="sm" icon={Check} onClick={() => act.decide(c.id, "passed")}>{t("console.queue.moveTo", { n: nextRoundIdx(drive.rounds, c) + 1 })}</Btn>}
                <Btn size="sm" variant={isLastRound(drive.rounds, c) ? "primary" : "secondary"} onClick={() => setDeciding(c)}>{t("console.queue.decide")}</Btn>
              </>}
            <Btn size="sm" variant="ghost" icon={SkipForward} onClick={() => act.skip(c.id)}>{t("console.queue.skipEnd")}</Btn>
            {c.state === "calling" && <Btn size="sm" variant="ghost" icon={UserX} onClick={() => act.noShow(c.id)}>{t("buttons.noShow")}</Btn>}
          </>
        ))}
        {column("done", t("console.queue.cols.done"), cols.done, t("console.queue.empty"), (c) => (
          (!deskMode || c.state === "absent") && <Btn size="sm" variant="ghost" icon={CornerUpLeft} onClick={() => act.recall(c.id)}>{t("console.queue.recall")}</Btn>
        ))}
      </div>

      {deciding && <OutcomeDialog cand={deciding} rounds={drive.rounds} onPick={(o) => outcome(deciding, o)} onClose={() => setDeciding(null)} />}
      {notesFor && <NotesPanel cand={drive.candidates.find((x) => x.id === notesFor.id) || notesFor} rounds={drive.rounds} onClose={() => setNotesFor(null)} saveNote={act.saveNote} />}
    </div>
  );
}
