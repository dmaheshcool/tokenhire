import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Flashlight, FlashlightOff, Keyboard, ScanLine } from "lucide-react";
import { Btn } from "../components/ds.jsx";
import { Logo, AudienceStrip } from "../components/SiteChrome.jsx";
import { api } from "../lib/api.js";
import { gateCodeFrom, startQrScan } from "../lib/scanner.js";
import { readGeo, writeProof } from "../lib/proof.js";
import { readDeviceId } from "../lib/device.js";
import { formatLobbyCode } from "../lib/lobby.js";
import { t } from "../i18n/strings.js";
import { useMeta } from "../hooks/useMeta.js";

export default function CheckInPage() {
  const { driveId: routeDrive } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const preset = params.get("k") || params.get("code") || params.get("d") || "";
  const [showCode, setShowCode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState("");
  const [code, setCode] = useState(preset ? formatLobbyCode(preset) : "");
  const [driveId, setDriveId] = useState(routeDrive || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState("idle");
  const [torch, setTorch] = useState(false);
  const [torchOk, setTorchOk] = useState(false);
  const videoRef = useRef(null);
  const codeRef = useRef(null);
  const stopRef = useRef(null);
  const autoRef = useRef(false);

  useMeta({ title: t("scan.meta") });

  useEffect(() => {
    if (routeDrive) setDriveId(routeDrive);
  }, [routeDrive]);

  useEffect(() => {
    const k = params.get("k") || params.get("d") || params.get("code");
    if (k) {
      setCode(formatLobbyCode(k));
      setShowCode(true);
    }
  }, [params]);

  useEffect(() => () => { stopRef.current?.(); }, []);

  useEffect(() => {
    if (showCode) codeRef.current?.focus();
  }, [showCode]);

  async function apply(raw, methodHint, idHint) {
    setBusy(true);
    setErr("");
    const found = gateCodeFrom(raw) || {};
    const id = idHint || found.driveId || driveId || routeDrive;
    const six = found.code || raw;
    let geo = null;
    try { geo = await readGeo(); } catch { geo = null; }
    try {
      const r = await api.lobbyCheck({
        ...(id ? { driveId: id } : {}),
        code: six,
        k: six,
        method: methodHint,
        geo,
        deviceId: readDeviceId(),
      });
      writeProof({
        driveId: r.driveId || id,
        method: r.method,
        location_verified: r.location_verified,
        at: Date.now(),
      });
      nav(`/app/join?drive=${encodeURIComponent(r.driveId || id)}`, { replace: true });
    } catch (e) {
      const msg = e.message || t("scan.fail");
      setErr(msg);
      if (e.data?.reason === "location" || /desk pass/i.test(msg)) setShowPass(true);
      else setShowCode(true);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const k = params.get("k") || params.get("code");
    if (!k || autoRef.current) return;
    autoRef.current = true;
    apply(k, params.get("k") ? "lobby_qr" : "typed_code", routeDrive);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function startScan() {
    setErr("");
    setScan("starting");
    const stop = await startQrScan(
      videoRef.current,
      (raw) => {
        setScan("idle");
        const found = gateCodeFrom(raw);
        if (found?.driveId) setDriveId(found.driveId);
        apply(raw, "lobby_qr", found?.driveId);
      },
      (reason) => {
        const kind = reason === "denied" ? "denied" : "unsupported";
        setScan(kind);
        setShowCode(true);
      },
    );
    stopRef.current = stop;
    const track = videoRef.current?.srcObject?.getVideoTracks?.()[0];
    const caps = track?.getCapabilities?.();
    setTorchOk(!!caps?.torch);
    setScan((s) => (s === "starting" ? "scanning" : s));
  }

  function stopScan() {
    stopRef.current?.();
    stopRef.current = null;
    setScan("idle");
    setTorch(false);
    setTorchOk(false);
  }

  function typeInstead() {
    stopScan();
    setShowCode(true);
  }

  async function toggleTorch() {
    const track = videoRef.current?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;
    const next = !torch;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorch(next);
    } catch { setTorchOk(false); }
  }

  const live = scan === "scanning" || scan === "starting";

  return (
    <div className="ds scan-screen">
      <header className="wrap row between" style={{ maxWidth: 480, padding: "16px 20px" }}>
        <Link to="/" aria-label={t("nav.home")} style={{ textDecoration: "none" }}><Logo size={26} /></Link>
        <Btn to="/walk-ins" variant="ghost" size="sm">{t("buttons.browse")}</Btn>
      </header>
      <main className="wrap" style={{ maxWidth: 480, padding: "0 20px 40px" }}>
        <h1 className="h-2">{t("nav.scanCheckIn")}</h1>
        <p className="body muted" style={{ margin: "8px 0 16px" }}>{t("scan.lede")}</p>

        <div className="card scan-card">
          <div className="scan-frame" style={{ display: live ? "block" : "none" }}>
            <video ref={videoRef} muted playsInline />
            <div className="scan-overlay" aria-hidden="true" />
            {live && (
              <button type="button" className="scan-enter-pill" onClick={typeInstead}>
                <Keyboard size={18} aria-hidden="true" />
                {t("scan.typeInstead")}
              </button>
            )}
          </div>
          {!live && (
            <div className="scan-actions">
              <Btn icon={ScanLine} block onClick={startScan}>{t("scan.openCamera")}</Btn>
            </div>
          )}
          {live && (
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              <Btn variant="secondary" onClick={stopScan}>{scan === "starting" ? t("scan.opening") : t("scan.stop")}</Btn>
              {torchOk && (
                <Btn variant="ghost" icon={torch ? FlashlightOff : Flashlight} onClick={toggleTorch}>
                  {torch ? t("scan.torchOff") : t("scan.torchOn")}
                </Btn>
              )}
            </div>
          )}
          {scan === "denied" && <p className="small" style={{ color: "var(--warning-ink)", margin: 0 }}>{t("scan.denied")}</p>}
          {scan === "unsupported" && <p className="small" style={{ color: "var(--warning-ink)", margin: 0 }}>{t("scan.unsupported")}</p>}

          {showCode && (
            <form className="scan-code-form" onSubmit={(e) => { e.preventDefault(); apply(code, "typed_code", driveId || routeDrive); }}>
              <label className="label" htmlFor="lobby-code">{t("scan.codeLabel")}</label>
              <input
                ref={codeRef}
                id="lobby-code"
                className="input scan-code"
                value={code}
                maxLength={7}
                autoCapitalize="characters"
                autoComplete="off"
                inputMode="text"
                placeholder={t("scan.placeholder")}
                onChange={(e) => setCode(formatLobbyCode(e.target.value))}
              />
              <Btn type="submit" block disabled={busy || !code.trim()}>{busy ? t("scan.checking") : t("buttons.continue")}</Btn>
            </form>
          )}

          {showPass && (
            <form className="scan-code-form" onSubmit={(e) => { e.preventDefault(); apply(pass, "desk_pass", driveId || routeDrive); }}>
              <label className="label" htmlFor="desk-pass">{t("scan.passLabel")}</label>
              <input
                id="desk-pass"
                className="input scan-code"
                value={pass}
                maxLength={6}
                inputMode="numeric"
                autoComplete="off"
                placeholder="000000"
                onChange={(e) => setPass(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <p className="tiny muted">{t("scan.passHint")}</p>
              <Btn type="submit" block disabled={busy || pass.length !== 6}>{busy ? t("scan.checking") : t("buttons.continue")}</Btn>
            </form>
          )}

          <div className="scan-help">
            <button type="button" className="link" onClick={typeInstead}>{t("scan.helpType")}</button>
            <button type="button" className="link" onClick={() => { stopScan(); setShowPass(true); }}>{t("scan.helpPass")}</button>
            <Link to="/walk-ins" className="link">{t("scan.helpBrowse")}</Link>
          </div>

          <p className="small muted scan-loc" style={{ margin: 0 }}>{t("scan.locationHint")}</p>
        </div>

        {err && (
          <div className="stack gap-8" style={{ marginTop: 12 }}>
            <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>
            <div className="row gap-8 wrap-row">
              <Btn size="sm" variant="secondary" onClick={() => { setErr(""); setShowCode(true); }}>{t("scan.helpType")}</Btn>
              <Btn size="sm" variant="ghost" onClick={() => { setErr(""); setShowPass(true); }}>{t("scan.deskHint")}</Btn>
              <Btn size="sm" variant="ghost" to="/walk-ins">{t("buttons.browse")}</Btn>
            </div>
          </div>
        )}
      </main>
      <AudienceStrip kind="candidate" />
    </div>
  );
}
