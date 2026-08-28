import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "store.json");
const ROW_ID = "live";

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Supabase over HTTPS rather than a raw Postgres pool: serverless functions come and
// go constantly and would otherwise exhaust Postgres connection slots.
const sb = url && key
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const mode = sb ? "postgres" : "file";

export async function readState() {
  if (sb) {
    const { data, error } = await sb.from("app_state").select("data").eq("id", ROW_ID).maybeSingle();
    if (error) throw error;
    return data?.data || null;
  }
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return null;
  }
}

let pending = null;
let timer = null;
let inFlight = Promise.resolve();

async function flush() {
  const snapshot = pending;
  pending = null;
  timer = null;
  if (!snapshot) return;
  if (sb) {
    const { error } = await sb.from("app_state").upsert({ id: ROW_ID, data: snapshot, updated_at: new Date().toISOString() });
    if (error) throw error;
    return;
  }
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(snapshot, null, 2));
}

/**
 * Coalesces bursts of writes into one round-trip. Callers that must not lose the
 * write (auth, check-in) should await settled() before responding.
 */
export function writeState(state) {
  pending = state;
  if (timer) return inFlight;
  timer = setTimeout(() => {
    inFlight = flush().catch(() => {});
  }, 120);
  return inFlight;
}

export async function settled() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    inFlight = flush().catch(() => {});
  }
  await inFlight;
}
