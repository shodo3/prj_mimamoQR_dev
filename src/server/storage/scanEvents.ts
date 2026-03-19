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

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  // Node.js >= 18 を想定（crypto.randomUUID）
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  // フォールバック（MVP用途）
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
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

/**
 * Vercelでのローカルファイル書き込みを前提としない。
 * MVP段階では保存ではなくログ出力のみで「落ちない」ことを優先する。
 */
export async function saveScanEvent(event: ScanEvent): Promise<{ ok: true }> {
  // JSON.stringify は循環参照しないイベント構造のため安全
  console.log("[scanEvent]", JSON.stringify(event));
  return { ok: true };
}

// route.ts からの既存import を維持（ファイル保存ではなくログ出力）
export async function appendScanEvent(event: ScanEvent): Promise<void> {
  await saveScanEvent(event);
}