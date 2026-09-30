import { drivePath, venueLine } from "./listing.js";
import { datesLabel, hoursLabel } from "./status.js";
import { t } from "../i18n/strings.js";

export function driveUrl(drive) {
  const base = (import.meta.env?.BASE_URL || "/").replace(/\/$/, "");
  return `${window.location.origin}${base}${drivePath(drive)}`;
}

export function shareText(drive) {
  return t("share.text", { role: drive.role, company: drive.company, dates: datesLabel(drive), hours: hoursLabel(drive), place: venueLine(drive) });
}

/** Opens the phone's share sheet, or copies the link where there isn't one. */
export async function shareDrive(drive, toast) {
  const url = driveUrl(drive);
  const title = t("detail.sticky", { company: drive.company, role: drive.role });
  try {
    if (navigator.share) {
      await navigator.share({ title, text: shareText(drive), url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${shareText(drive)} ${url}`);
    toast?.(t("toast.copied"));
    return "copied";
  } catch {
    return "dismissed";
  }
}
