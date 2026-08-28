import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { bdy, box, dsp, input, k, outline, solid, typ } from "../../theme.js";
import { Field } from "../../components/ui.jsx";

const STEPS = [
  ["rounds", "Rounds"],
  ["panel", "Interviewers"],
  ["rooms", "Rooms"],
  ["review", "Review"],
];

const rid = () => `r_${Math.random().toString(36).slice(2, 8)}`;
const mid = () => `rm_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Runs once before a drive opens. Everything here used to be assumed: three rounds,
 * three rooms and three hard-coded interviewer names. Asking up front is what makes
 * "send to the next round" resolve to a real person in a real room.
 */
export default function DriveSetup({ drive, onDone, onCancel, maxRooms = 8 }) {
  const [step, setStep] = useState(0);
  const [rounds, setRounds] = useState(() =>
    (drive.rounds?.length ? drive.rounds : [{ id: rid(), name: "HR screening" }]).map((r) => ({ ...r })),
  );
  const [rooms, setRooms] = useState(() =>
    (drive.rooms?.length ? drive.rooms : [{ id: mid(), name: "Room 1", interviewer: "" }]).map((r) => ({
      ...r,
      roundId: r.roundId || "",
    })),
  );

  const key = STEPS[step][0];

  const roundErr = useMemo(() => {
    if (!rounds.length) return "Add at least one round.";
    if (rounds.some((r) => !r.name.trim())) return "Give every round a name.";
    return "";
  }, [rounds]);

  const panelErr = useMemo(() => {
    if (!rooms.length) return "Add at least one interviewer.";
    if (rooms.some((r) => !r.interviewer.trim())) return "Enter a name for every interviewer.";
    return "";
  }, [rooms]);

  const roomErr = useMemo(() => {
    if (rooms.some((r) => !r.name.trim())) return "Give every room a name.";
    if (rooms.some((r) => !r.roundId)) return "Choose which round each room handles.";
    const covered = new Set(rooms.map((r) => r.roundId));
    const missing = rounds.filter((r) => !covered.has(r.id));
    if (missing.length) return `No room is running ${missing.map((m) => m.name).join(", ")}. Every round needs somewhere to send people.`;
    return "";
  }, [rooms, rounds]);

  const err = key === "rounds" ? roundErr : key === "panel" ? panelErr : key === "rooms" ? roomErr : "";
  const [touched, setTouched] = useState(false);

  function next() {
    if (err) { setTouched(true); return; }
    setTouched(false);
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    onDone({
      rounds: rounds.map(({ id, name }) => ({ id, name: name.trim() })),
      rooms: rooms.map(({ id, name, interviewer, roundId }) => ({ id, name: name.trim(), interviewer: interviewer.trim(), roundId })),
    });
  }
  function back() {
    setTouched(false);
    if (step === 0) { onCancel?.(); return; }
    setStep(step - 1);
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", fontFamily: bdy }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>
          Set up {drive.role || "this walk-in"}
        </h1>
        <p style={{ fontSize: 13.5, color: k.mid, margin: 0, lineHeight: 1.55 }}>
          Four short steps. You can change any of it later.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {STEPS.map(([id, label], i) => (
          <div key={id} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 99, background: i <= step ? k.coral : k.line, marginBottom: 7 }} />
            <div style={{ fontSize: 11.5, fontWeight: i === step ? 700 : 500, color: i === step ? k.ink : k.faint }}>{label}</div>
          </div>
        ))}
      </div>

      {key === "rounds" && (
        <Panel
          title="How many rounds will each candidate go through?"
          hint="Candidates move to the next round only when an interviewer passes them."
        >
          {rounds.map((r, i) => (
            <Row key={r.id} index={i + 1} onRemove={rounds.length > 1 ? () => setRounds(rounds.filter((x) => x.id !== r.id)) : null}>
              <input
                value={r.name}
                onChange={(e) => setRounds(rounds.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
                placeholder={`Round ${i + 1} name`}
                style={{ ...input, flex: 1 }}
              />
            </Row>
          ))}
          <AddBtn label="Add a round" onClick={() => setRounds([...rounds, { id: rid(), name: "" }])} />
        </Panel>
      )}

      {key === "panel" && (
        <Panel
          title="Who is interviewing today?"
          hint="One line per person. They each get a room in the next step."
        >
          {rooms.map((r, i) => (
            <Row key={r.id} index={i + 1} onRemove={rooms.length > 1 ? () => setRooms(rooms.filter((x) => x.id !== r.id)) : null}>
              <input
                value={r.interviewer}
                onChange={(e) => setRooms(rooms.map((x) => (x.id === r.id ? { ...x, interviewer: e.target.value } : x)))}
                placeholder="Full name"
                style={{ ...input, flex: 1 }}
              />
            </Row>
          ))}
          {rooms.length < maxRooms && (
            <AddBtn label="Add an interviewer" onClick={() => setRooms([...rooms, { id: mid(), name: `Room ${rooms.length + 1}`, interviewer: "", roundId: "" }])} />
          )}
        </Panel>
      )}

      {key === "rooms" && (
        <Panel
          title="Where is each person sitting, and which round do they run?"
          hint="When a candidate passes a round, they are sent to a room running the next one."
        >
          {rooms.map((r) => (
            <div key={r.id} style={{ ...box, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{r.interviewer || "Unnamed interviewer"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="g2">
                <Field label="Room">
                  <input
                    value={r.name}
                    onChange={(e) => setRooms(rooms.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
                    placeholder="Room 1"
                    style={input}
                  />
                </Field>
                <Field label="Runs which round">
                  <select
                    value={r.roundId}
                    onChange={(e) => setRooms(rooms.map((x) => (x.id === r.id ? { ...x, roundId: e.target.value } : x)))}
                    style={input}
                  >
                    <option value="">Choose a round</option>
                    {rounds.map((rd) => <option key={rd.id} value={rd.id}>{rd.name}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          ))}
        </Panel>
      )}

      {key === "review" && (
        <Panel title="Ready to open the doors?" hint="">
          {rounds.map((rd, i) => {
            const staffed = rooms.filter((r) => r.roundId === rd.id);
            return (
              <div key={rd.id} style={{ ...box, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 9 }}>
                  <span style={{ fontFamily: typ, fontSize: 11, fontWeight: 700, color: k.coral }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{rd.name}</span>
                </div>
                {staffed.map((r) => (
                  <div key={r.id} style={{ fontSize: 13, color: k.ink2, display: "flex", gap: 8, alignItems: "center", padding: "3px 0" }}>
                    <Check size={13} color={k.teal} /> {r.interviewer} · {r.name}
                  </div>
                ))}
              </div>
            );
          })}
        </Panel>
      )}

      {touched && err ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 12, lineHeight: 1.5 }}>{err}</div> : null}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 24 }}>
        <button type="button" onClick={back} style={{ ...outline, gap: 7 }}>
          <ArrowLeft size={15} /> {step === 0 ? "Cancel" : "Back"}
        </button>
        <button type="button" onClick={next} style={{ ...solid, gap: 7, opacity: touched && err ? 0.6 : 1 }}>
          {step === STEPS.length - 1 ? "Open the walk-in" : "Continue"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }) {
  return (
    <div>
      <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: hint ? 4 : 14 }}>{title}</div>
      {hint ? <p style={{ fontSize: 13, color: k.mid, margin: "0 0 16px", lineHeight: 1.55 }}>{hint}</p> : null}
      {children}
    </div>
  );
}

function Row({ index, children, onRemove }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
      <span style={{ fontFamily: typ, fontSize: 12, color: k.faint, width: 20, flexShrink: 0 }}>{String(index).padStart(2, "0")}</span>
      {children}
      <button
        type="button"
        onClick={onRemove || undefined}
        disabled={!onRemove}
        aria-label="Remove"
        style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${k.line}`, background: "#fff", color: onRemove ? k.mid : k.line, cursor: onRemove ? "pointer" : "default",
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function AddBtn({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...outline, gap: 7, marginTop: 4 }}>
      <Plus size={15} /> {label}
    </button>
  );
}
