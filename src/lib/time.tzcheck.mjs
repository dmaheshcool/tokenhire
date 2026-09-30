import { formatIST, fromIST } from "./time.js";
import { hoursLabel } from "./status.js";

const ms = fromIST("2026-10-05", "10:00");
const drive = { date: "2026-10-05", startTime: "10:00", endTime: "16:00" };
process.stdout.write(`${new Date(ms).toISOString()}|${formatIST(ms, { date: true, time: true })}|${hoursLabel(drive)}`);
