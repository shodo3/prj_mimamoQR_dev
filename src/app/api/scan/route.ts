import { NextResponse } from "next/server";

import { getTagConfig } from "@/config/tags";
import { getNotifyEmailsForTag } from "@/server/config/notifyTargets";
import { sendEmail } from "@/server/notify/email";
import {
  appendScanEvent,
  buildMapUrl,
  createScanEvent,
  type LocationStatus,
} from "@/server/storage/scanEvents";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isLocationStatus(v: unknown): v is LocationStatus {
  return (
    v === "granted" ||
    v === "denied" ||
    v === "unavailable" ||
    v === "timeout" ||
    v === "error"
  );
}

function buildEmailText(params: {
  publicTagId: string;
  serverTimestamp: string;
  clientTimestamp: string;
  locationStatus: LocationStatus;
  mapUrl?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
}) {
  const lines: string[] = [];
  lines.push("QRがスキャンされました。");
  lines.push("");
  lines.push(`時刻（サーバ）: ${params.serverTimestamp}`);
  lines.push(`時刻（端末）: ${params.clientTimestamp}`);
  lines.push(`publicTagId: ${params.publicTagId}`);
  lines.push("");

  if (params.mapUrl && isFiniteNumber(params.lat) && isFiniteNumber(params.lng)) {
    lines.push("位置情報: 取得できました");
    lines.push(`lat,lng: ${params.lat},${params.lng}`);
    if (isFiniteNumber(params.accuracy)) {
      lines.push(`accuracy(m): ${params.accuracy}`);
    }
    lines.push(`地図: ${params.mapUrl}`);
  } else {
    lines.push("位置情報: 取得されませんでした");
    lines.push(`status: ${params.locationStatus}`);
  }

  return lines.join("\n");
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const publicTagId = b.publicTagId;
  const clientTimestamp = b.clientTimestamp;
  const locationStatus = b.locationStatus;

  if (!isNonEmptyString(publicTagId) || !isNonEmptyString(clientTimestamp)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!isLocationStatus(locationStatus)) {
    return NextResponse.json({ error: "invalid_location_status" }, { status: 400 });
  }

  const tag = getTagConfig(publicTagId.trim());
  if (!tag) {
    // publicTagId の存在/無効はここで止める（内部情報は返さない）
    return NextResponse.json({ error: "invalid_tag" }, { status: 404 });
  }

  const lat = b.lat;
  const lng = b.lng;
  const accuracy = b.accuracy;

  const hasLatLng = isFiniteNumber(lat) && isFiniteNumber(lng);
  const mapUrl = hasLatLng ? buildMapUrl(lat, lng) : undefined;

  const draft = createScanEvent({
    publicTagId: tag.publicTagId,
    clientTimestamp: clientTimestamp.trim(),
    locationStatus,
    lat: hasLatLng ? lat : undefined,
    lng: hasLatLng ? lng : undefined,
    accuracy: isFiniteNumber(accuracy) ? accuracy : undefined,
    mapUrl,
  });

  const text = buildEmailText({
    publicTagId: draft.publicTagId,
    serverTimestamp: draft.serverTimestamp,
    clientTimestamp: draft.clientTimestamp,
    locationStatus: draft.locationStatus,
    mapUrl: draft.mapUrl,
    lat: draft.lat,
    lng: draft.lng,
    accuracy: draft.accuracy,
  });

  const notifyEmails = await getNotifyEmailsForTag(tag.publicTagId);
  const notify =
    notifyEmails.length > 0
      ? await sendEmail({
          to: notifyEmails,
          subject: "【QRscan】スキャン通知",
          text,
        })
      : {
          ok: false as const,
          message:
            "通知先未設定のため送信をスキップしました（config/notifyTargets.json）。",
        };

  const event = {
    ...draft,
    notifyResult: { ok: notify.ok, message: notify.message },
  };
  await appendScanEvent(event);

  return NextResponse.json({ ok: true }, { status: 200 });
}

