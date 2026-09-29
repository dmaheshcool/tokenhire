import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CornerUpLeft, Megaphone, NotebookPen, Pause, Search, SkipForward, UserX, X } from "lucide-react";
import { Btn, STROKE, useToast } from "../../components/ds.jsx";
import { NotesPanel } from "../app/EmployerPage.jsx";
import { isLastRound, occupantOf, roundIndexOfRoom, waitingRoundIdx } from "../../lib/helpers.js";
import { tokenNumber } from "../../lib/listing.js";
import { t } from "../../i18n/strings.js";

const IN_ROUND = ["calling", "interviewing"];
const DONE = ["selected", "rejected", "onhold", "absent"];
const OUTCOME = { selected: "Shortlisted", rejected: "Not selected", onhold: "On hold", absent: "No-show" };
const OUTCOME_TONE = { selected: "var(--success)", rejected: "var(--danger)", onhold: "var(--warning)", absent: "var(--ink-3)" };

function elapsed(since) {
  if (!since) return "";
  const m = Math.max(0, Math.round((Date.now() - since) / 60000));
  if (m > 12 * 60) return "";
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function columnOf(c) {
  if (c.state === "wait") return "waiting";
  if (IN_ROUND.includes(c.state)) return "round";
  if (DONE.includes(c.state)) return "done";
  return null;
}

/** First free room and the next person waiting for that room's round. */
export function nextCall(drive, roomId) {
  const rooms = (drive.rooms || []).filter((r) => (roomId ? r.id === roomId : true) && !occupantOf(drive, r.id));
  const waiting = drive.candidates.filter((c) => c.state === "wait")
    .sort((a, b) => (Number(b.checkedIn !== false) - Number(a.checkedIn !== false)) || (a.at - b.at));
  for (const room of rooms) {
    const ri = roundIndexOfRoom(drive.rounds, room);
    const cand = waiting.find((c) => ri < 0 || waitingRoundIdx(drive.rounds, c) === ri);
    if (cand) return { cand, room };
  }
  return null;
}

function Card({ c, drive, col, actions, onDragStart, onNotes, deskMode }) {
  const round = (drive.rounds || [])[waitingRoundIdx(drive.rounds, c)];
  return (
    <article className="board-card" draggable onDragStart={(e) => onDragStart(e, c)}>
      <div className="row between gap-8">
        <span className="token-pill mono">{tokenNumber(c.token)}</span>
        <span className="tiny muted mono grow" style={{ textAlign: "right" }}>
          {col === "waiting" && elapsed(c.arrivedAt || c.at)}
          {col === "round" && [c.room?.name, elapsed(c.calledAt)].filter(Boolean).join(" · ")}
          {col === "done" && (deskMode ? (c.state === "absent" ? OUTCOME.absent : "Done") : <span style={{ color: OUTCOME_TONE[c.state], fontWeight: 600 }}>{OUTCOME[c.state]}</span>)}
        </span>
        {!deskMode && (
          <button type="button" className="btn btn-ghost btn-sm btn-icon" style={{ width: 30, height: 30, minHeight: 30 }} onClick={() => onNotes(c)} aria-label={`Notes for ${c.name}`} title="Notes">
            <NotebookPen size={15} strokeWidth={STROKE} />
          </button>
        )}
      </div>
      <div>
        <p className="strong" style={{ margin: 0 }}>{c.name}</p>
        <p className="tiny muted" style={{ margin: "2px 0 0" }}>
          {col === "round" ? (c.state === "calling" ? "Called, walking over" : "In interview") : round?.name || "Round 1"}
          {c.expBand ? ` · ${c.expBand}` : ""}
          {col === "waiting" && c.checkedIn === false && <span className="tag" style={{ marginLeft: 6 }}>{t("console.queue.notArrived")}</span>}
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
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="stack gap-8">
          <Btn ref={ref} icon={Check} onClick={() => onPick("passed")}>{last ? "Shortlist" : "Pass to next round"}</Btn>
          <Btn variant="secondary" icon={Pause} onClick={() => onPick("onhold")}>On hold</Btn>
          <Btn variant="secondary" icon={X} onClick={() => onPick("rejected")}>Not selected</Btn>
          <Btn variant="ghost" icon={UserX} onClick={() => onPick("absent")}>{t("console.queue.noShow")}</Btn>
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

  function callNext() {
    if (disabled) return;
    const pick = nextCall(drive, room);
    if (!pick) {
      const free = (drive.rooms || []).filter((r) => (!room || r.id === room) && !occupantOf(drive, r.id));
      const msg = !free.length
        ? (room ? `${drive.rooms.find((r) => r.id === room)?.name} is busy.` : "Every room is busy. Mark someone done first.")
        : t("console.queue.nobody");
      toast(msg, "err");
      return;
    }
    act.callTo(pick.cand.id, pick.room.id);
    toast(t("console.queue.called", { token: tokenNumber(pick.cand.token), room: pick.room.name }));
  }
  const callNextRef = useRef(callNext);
  callNextRef.current = callNext;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      callNextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function callOne(c) {
    const pick = nextCall({ ...drive, candidates: drive.candidates.map((x) => (x.id === c.id ? x : x.state === "wait" ? { ...x, state: "hold-tmp" } : x)) }, room);
    if (!pick) { toast("No free room for this round.", "err"); return; }
    act.callTo(c.id, pick.room.id);
    toast(t("console.queue.called", { token: tokenNumber(c.token), room: pick.room.name }));
  }

  function outcome(c, o) {
    setDeciding(null);
    if (o === "absent") act.noShow(c.id);
    else act.decide(c.id, o);
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
        {list.length > 60 && <p className="tiny muted" style={{ textAlign: "center" }}>and {list.length - 60} more. Search to find someone.</p>}
      </div>
    </section>
  );

  const rooms = drive.rooms || [];
  return (
    <div className="stack gap-16">
      <div className="row gap-8 queue-tools">
        <div className="search grow" style={{ minWidth: 200 }}>
          <Search size={17} strokeWidth={STROKE} aria-hidden="true" />
          <label className="sr-only" htmlFor="qb-search">{t("console.queue.search")}</label>
          <input id="qb-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("console.queue.search")} />
        </div>
        <label className="sr-only" htmlFor="qb-room">{t("console.queue.room")}</label>
        <select id="qb-room" className="select" style={{ width: "auto", minWidth: 180 }} value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Any free room</option>
          {rooms.map((r) => {
            const busy = occupantOf(drive, r.id);
            const ri = roundIndexOfRoom(drive.rounds, r);
            return <option key={r.id} value={r.id}>{r.name}{ri >= 0 ? ` · ${drive.rounds[ri].name}` : ""}{busy ? " (busy)" : ""}</option>;
          })}
        </select>
        <Btn icon={Megaphone} onClick={callNext} disabled={disabled} aria-keyshortcuts="N">
          {t("console.queue.callNext")} <span className="kbd hide-mobile" aria-hidden="true">N</span>
        </Btn>
      </div>

      <div className="board-switch" role="group" aria-label="Show column">
        {[["waiting", t("console.queue.waiting")], ["round", t("console.queue.inRound")], ["done", t("console.queue.done")]].map(([k, l]) => (
          <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}>{l} <span className="mono">{cols[k].length}</span></button>
        ))}
      </div>
      <div className="board">
        {column("waiting", t("console.queue.waiting"), cols.waiting, t("console.queue.emptyWaiting"), (c) => (
          <>
            <Btn size="sm" onClick={() => callOne(c)}>Call</Btn>
            {c.checkedIn === false && <Btn size="sm" variant="secondary" onClick={() => act.arrived(c.id)}>Arrived</Btn>}
            <Btn size="sm" variant="ghost" icon={SkipForward} onClick={() => act.skip(c.id)}>{t("console.queue.skip")}</Btn>
            <Btn size="sm" variant="ghost" icon={UserX} onClick={() => act.noShow(c.id)}>{t("console.queue.noShow")}</Btn>
          </>
        ))}
        {column("round", t("console.queue.inRound"), cols.round, t("console.queue.emptyRound"), (c) => (
          <>
            {c.state === "calling"
              ? <Btn size="sm" onClick={() => act.move(c.id, "interviewing")}>Started</Btn>
              : !deskMode && <Btn size="sm" icon={Check} onClick={() => setDeciding(c)}>{t("console.queue.done1")}</Btn>}
            <Btn size="sm" variant="ghost" icon={SkipForward} onClick={() => act.skip(c.id)}>{t("console.queue.skip")}</Btn>
            {c.state === "calling" && <Btn size="sm" variant="ghost" icon={UserX} onClick={() => act.noShow(c.id)}>{t("console.queue.noShow")}</Btn>}
          </>
        ))}
        {column("done", t("console.queue.done"), cols.done, t("console.queue.emptyDone"), (c) => (
          (!deskMode || c.state === "absent") && <Btn size="sm" variant="ghost" icon={CornerUpLeft} onClick={() => act.recall(c.id)}>{t("console.queue.recall")}</Btn>
        ))}
      </div>

      {deciding && <OutcomeDialog cand={deciding} rounds={drive.rounds} onPick={(o) => outcome(deciding, o)} onClose={() => setDeciding(null)} />}
      {notesFor && <NotesPanel cand={drive.candidates.find((x) => x.id === notesFor.id) || notesFor} rounds={drive.rounds} onClose={() => setNotesFor(null)} saveNote={act.saveNote} />}
    </div>
  );
}
