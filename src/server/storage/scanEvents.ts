type SaveScanEventInput = {
  id: string;
  serverTimestamp: string;
  publicTagId: string;
  clientTimestamp: string;
  locationStatus: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  mapUrl?: string;
  notifyResult?: unknown;
};

export async function saveScanEvent(event: SaveScanEventInput) {
  // Vercelではローカルファイル保存を行わない。
  // MVP段階ではログ出力のみで通し、通知導線の検証を優先する。
  console.log("[scanEvent]", JSON.stringify(event));
  return { ok: true };
}