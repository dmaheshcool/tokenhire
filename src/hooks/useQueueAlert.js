import { useCallback, useEffect, useRef, useState } from "react";

let audioCtx;

function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.09;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    /* ignore locked audio */
  }
}

export function armAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    audioCtx.resume();
  } catch {
    /* ignore */
  }
}

/** Sound + vibration when the candidate becomes next or is called. Needs a tap to unlock audio. */
export function useQueueAlert({ state, ahead }) {
  const [armed, setArmed] = useState(false);
  const prev = useRef(null);

  const arm = useCallback(() => {
    armAudio();
    setArmed(true);
  }, []);

  useEffect(() => {
    const key = `${state}:${ahead}`;
    const last = prev.current;
    prev.current = key;
    if (!last || last === key) return;
    const [lastState, lastAhead] = last.split(":");
    const becameNext = state === "wait" && ahead === 0 && lastState === "wait" && Number(lastAhead) > 0;
    const called = state === "calling" && lastState !== "calling";
    if (!becameNext && !called) return;
    try { navigator.vibrate?.([180, 70, 180, 70, 240]); } catch { /* ignore */ }
    if (armed) beep();
  }, [state, ahead, armed]);

  return { armed, arm };
}
