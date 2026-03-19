"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ApiLocationStatus = "granted" | "unavailable";

type ScanPayload = {
  publicTagId: string;
  clientTimestamp: string;
  locationStatus: ApiLocationStatus;
  lat?: number;
  lng?: number;
  accuracy?: number;
};

type LocationResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      accuracy?: number;
    }
  | {
      ok: false;
    };

function getLocation(): Promise<LocationResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false });
  }

  if (!("geolocation" in navigator)) {
    return Promise.resolve({ ok: false });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          ok: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Number.isFinite(pos.coords.accuracy)
            ? pos.coords.accuracy
            : undefined,
        });
      },
      () => {
        resolve({ ok: false });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 0,
      },
    );
  });
}

export function ScanClient(props: { publicTagId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<
    "init" | "getting_location" | "sending" | "error_invalid" | "error_other"
  >("init");
  const [detail, setDetail] = useState("");

  const clientTimestamp = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setPhase("getting_location");

        const loc = await getLocation();
        if (cancelled) return;

        setPhase("sending");

        const payload: ScanPayload = loc.ok
          ? {
              publicTagId: props.publicTagId,
              clientTimestamp,
              locationStatus: "granted",
              lat: loc.lat,
              lng: loc.lng,
              accuracy: loc.accuracy,
            }
          : {
              publicTagId: props.publicTagId,
              clientTimestamp,
              locationStatus: "unavailable",
            };

        const res = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (cancelled) return;

        if (res.ok) {
          router.replace("/done");
          return;
        }

        if (res.status === 404) {
          setPhase("error_invalid");
          return;
        }

        setPhase("error_other");
        setDetail(`status:${res.status}`);
      } catch (e) {
        if (cancelled) return;

        const msg = e instanceof Error ? e.message : "unknown";
        setPhase("error_other");
        setDetail(msg);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [clientTimestamp, props.publicTagId, router]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {phase === "init" && <p style={{ margin: 0 }}>読み込み中…</p>}

      {phase === "getting_location" && (
        <p style={{ margin: 0 }}>位置情報を確認しています…</p>
      )}

      {phase === "sending" && (
        <p style={{ margin: 0 }}>送信しています…</p>
      )}

      {phase === "error_invalid" && (
        <>
          <h1 style={{ fontSize: 18, margin: 0 }}>無効なQRコードです</h1>
          <p style={{ marginTop: 12, marginBottom: 0 }}>
            お手数ですが、もう一度お試しください。
          </p>
        </>
      )}

      {phase === "error_other" && (
        <>
          <h1 style={{ fontSize: 18, margin: 0 }}>送信できませんでした</h1>
          <p style={{ marginTop: 12, marginBottom: 0 }}>
            電波状況をご確認のうえ、時間をおいて再度お試しください。
          </p>
          {process.env.NODE_ENV !== "production" && detail ? (
            <p style={{ marginTop: 12, marginBottom: 0, opacity: 0.7 }}>
              {detail}
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}