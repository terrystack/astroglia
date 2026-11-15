"use client";

import dynamic from "next/dynamic";
import TelemetryPanel from "@/components/dashboard/TelemetryPanel";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";

// Dynamic import to avoid SSR issues with Three.js
const BodyCanvas = dynamic(() => import("@/components/body3d/BodyCanvas"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(0,229,255,0.4)",
        fontSize: "11px",
        letterSpacing: "3px",
      }}
    >
      INITIALIZING BODY SCAN...
    </div>
  ),
});

function RegionInfoPanel() {
  const { selectedRegion, metrics } = useAstrogliaStore();

  if (!selectedRegion) {
    return (
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        CLICK A BODY REGION TO INSPECT
      </div>
    );
  }

  const regionMetrics = metrics.filter((m) => m.bodyRegion === selectedRegion);

  return (
    <div
      style={{
        padding: "10px 12px",
        borderTop: "1px solid var(--border-glow)",
        background: "rgba(0,229,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          letterSpacing: "2px",
          color: "var(--accent-cyan)",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        ◈ {selectedRegion.toUpperCase()} REGION
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {regionMetrics.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>{m.label}</span>
            <span
              style={{
                color:
                  m.status === "critical"
                    ? "#ff1744"
                    : m.status === "warning"
                    ? "#ffb300"
                    : "#39ff14",
                fontWeight: 700,
              }}
            >
              {m.value} {m.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Body3DTab() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Left: Telemetry panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "240px",
          flexShrink: 0,
        }}
      >
        <TelemetryPanel />
        <RegionInfoPanel />
      </div>

      {/* Center: 3D Canvas */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <BodyCanvas />
      </div>

      {/* Right: Status sidebar */}
      <div
        style={{
          width: "180px",
          flexShrink: 0,
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border-glow)",
          display: "flex",
          flexDirection: "column",
          padding: "12px 10px",
          gap: "10px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "2px",
            color: "var(--accent-cyan)",
            marginBottom: "4px",
          }}
        >
          SYSTEM STATUS
        </div>

        {[
          { label: "O₂ SUPPLY", value: "98.4%", status: "nominal" },
          { label: "SUIT PRESS.", value: "101.3 kPa", status: "nominal" },
          { label: "RADIATION", value: "0.52 mSv/d", status: "nominal" },
          { label: "GRAVITY ENV.", value: "0.38g", status: "nominal" },
          { label: "TEMP ENV.", value: "21.4°C", status: "nominal" },
          { label: "CO₂ LEVEL", value: "0.04%", status: "warning" },
          { label: "DUST EXP.", value: "LOW", status: "nominal" },
          { label: "SLEEP DEBT", value: "2.1h", status: "warning" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "2px",
              padding: "7px 8px",
            }}
          >
            <div
              style={{
                fontSize: "7px",
                color: "var(--text-muted)",
                letterSpacing: "0.5px",
                marginBottom: "2px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color:
                  item.status === "warning"
                    ? "#ffb300"
                    : item.status === "critical"
                    ? "#ff1744"
                    : "#39ff14",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "auto",
            fontSize: "7px",
            color: "var(--text-muted)",
            letterSpacing: "0.5px",
            lineHeight: 1.8,
          }}
        >
          <div style={{ color: "var(--accent-cyan)", marginBottom: "4px", letterSpacing: "1px" }}>
            MARS BASE-7
          </div>
          <div>LAT: 18.65°N</div>
          <div>LON: 77.5°E</div>
          <div>ALT: -2140m</div>
          <div>SOL: 187</div>
        </div>
      </div>
    </div>
  );
}
