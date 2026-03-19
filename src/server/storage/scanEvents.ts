import { promises as fs } from "node:fs";
import path from "node:path";

export type LocationStatus =
  | "granted"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

export type ScanEvent = {
  id: string;
  publicTagId: string;
  serverTimestamp: string;
  clientTimestamp: string;
  locationStatus: LocationStatus;
  lat?: number;
  lng?: number;
  accuracy?: number;
  mapUrl?: string;
  notifyResult?: {
    ok: boolean;
    message?: string;
  };
};

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "scanEvents.jsonl");

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  // crypto.randomUUID() が利用できる環境を前提（Node 18+）
  return globalThis.crypto.randomUUID();
}

export function buildMapUrl(lat: number, lng: number) {
  const q = `${lat},${lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=17`;
}

export function createScanEvent(
  input: Omit<ScanEvent, "id" | "serverTimestamp">,
): ScanEvent {
  return {
    id: newId(),
    serverTimestamp: nowIso(),
    ...input,
  };
}

export async function appendScanEvent(event: ScanEvent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(EVENTS_FILE, `${JSON.stringify(event)}\n`, "utf8");
}

