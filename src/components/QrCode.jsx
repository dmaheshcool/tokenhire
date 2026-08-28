import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { k } from "../theme.js";

// Rendered locally instead of via an image service: hall wi-fi is unreliable and a
// blank poster QR stops the whole queue.
export default function QrCode({ value, size = 180, dark = k.ink, light = "#FFFFFF", alt = "QR code" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !value) return;
    let cancelled = false;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark, light },
    }).catch(() => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    return () => { cancelled = true; };
  }, [value, size, dark, light]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      role="img"
      aria-label={alt}
      style={{ width: size, height: size, display: "block", borderRadius: 4 }}
    />
  );
}
