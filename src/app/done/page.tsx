"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DoneContent() {
  const searchParams = useSearchParams();
  const time = searchParams.get("t") ?? "--:--";
  const hasLocation = searchParams.get("loc") === "1";
  const locationLabel = hasLocation ? "この場所付近" : "位置は取得できませんでした";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "linear-gradient(165deg, #fff5f7 0%, #f0f7ff 50%, #f5fff8 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "28px 24px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.85)",
          boxShadow: "0 12px 40px rgba(80, 60, 120, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#2d2a32",
            letterSpacing: "0.02em",
            lineHeight: 1.4,
          }}
        >
          ✔ スキャンされました
        </p>
        <p
          style={{
            margin: "18px 0 0",
            fontSize: 15,
            color: "#5c5666",
            lineHeight: 1.65,
          }}
        >
          <span style={{ marginRight: 6 }} aria-hidden>
            📍
          </span>
          {locationLabel}
        </p>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 15,
            color: "#5c5666",
            lineHeight: 1.65,
          }}
        >
          <span style={{ marginRight: 6 }} aria-hidden>
            🕒
          </span>
          {time}
        </p>
        <p
          style={{
            margin: "20px 0 0",
            fontSize: 13,
            color: "#8a8494",
          }}
        >
          ありがとうございます。
        </p>
      </div>
    </main>
  );
}

export default function DonePage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ margin: 0, color: "#666" }}>読み込み中…</p>
        </main>
      }
    >
      <DoneContent />
    </Suspense>
  );
}
