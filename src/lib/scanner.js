import jsQR from "jsqr";

// A GATE poster may be scanned by our in-app camera or by the phone's native camera.
// Accept the full URL, a bare ?g= param, or someone typing the code into the box.
const six = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

// Returns { gate, desk } — desk is only present when the QR came from a waiting-room
// screen, which is what lets a single scan both find the drive and prove presence.
export function gateCodeFrom(raw) {
  const text = (raw || "").trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    const g = six(url.searchParams.get("g") || url.searchParams.get("c"));
    const d = six(url.searchParams.get("d"));
    if (g) return { gate: g, desk: d || null };
  } catch {
    // not a URL — fall through to the plain-code forms below
  }
  const m = text.toUpperCase().match(/(?:GATE|DESK|PASS)-?([A-Z0-9]{4,6})/);
  if (m) return { gate: m[1], desk: null };
  const bare = six(text);
  return bare.length >= 4 ? { gate: bare, desk: null } : null;
}

/**
 * Starts a rear-camera QR scan and calls onCode with the first decoded value.
 * Uses the native BarcodeDetector when present (Android Chrome) and otherwise
 * decodes frames with jsQR, which is what makes this work on iOS Safari.
 * Returns a stop() function; call it on unmount.
 */
export async function startQrScan(video, onCode, onError) {
  let live = true;
  let stream;
  const stop = () => {
    live = false;
    stream?.getTracks?.().forEach((t) => t.stop());
    if (video) video.srcObject = null;
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch (e) {
    // Distinguish "user said no" from "no camera here" so the copy can be useful.
    const denied = e?.name === "NotAllowedError" || e?.name === "SecurityError";
    onError?.(denied ? "denied" : "unavailable");
    return stop;
  }

  video.srcObject = stream;
  video.setAttribute("playsinline", "true"); // iOS refuses inline playback without this
  video.muted = true;
  try {
    await video.play();
  } catch {
    onError?.("unavailable");
    return stop;
  }

  const detector = "BarcodeDetector" in window
    ? new window.BarcodeDetector({ formats: ["qr_code"] })
    : null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let last = 0;

  const tick = async (now) => {
    if (!live) return;
    // ~8 decodes/sec is plenty and keeps mid-range phones from overheating.
    if (now - last > 120 && video.readyState >= 2 && video.videoWidth) {
      last = now;
      try {
        let value = null;
        if (detector) {
          const codes = await detector.detect(video);
          value = codes?.[0]?.rawValue || null;
        } else {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          value = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data || null;
        }
        if (value && live) {
          navigator.vibrate?.(40);
          stop();
          onCode(value);
          return;
        }
      } catch {
        // a bad frame is normal; keep scanning
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return stop;
}
