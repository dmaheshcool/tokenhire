import { useState, useEffect } from "react";

/** Phones only. A desktop or laptop keeps the computer UI even in a narrow pane. */
export function isPhoneDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

export function applyDeviceClass() {
  const phone = isPhoneDevice();
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("is-phone", phone);
    document.documentElement.classList.toggle("is-computer", !phone);
  }
  return phone;
}

export function useNarrow() {
  const [n, setN] = useState(applyDeviceClass);
  useEffect(() => { setN(applyDeviceClass()); }, []);
  return n;
}
