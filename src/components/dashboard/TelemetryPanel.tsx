"use client";

import { useAstrogliaStore } from "@/store/useAstrogliaStore";
import type { VitalMetric } from "@/core/contracts/astroglia.types";

function MetricRow({ metric }: { metric: VitalMetric }) {
  const pct = ((metric.value - metric.min) / (metric.max - metric.min)) * 100;

  const statusColor =
    metric.status === "critical"
      ? "#ff1744"
      : metric.status === "warning"
      ? "#ffb300"
      : "#39ff14";

  const trendIcon =
    metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→";

  return (
    <div
      style={{
        padding: "7px 10px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background =
          "rgba(0,229,255,0.04)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            color: "var(--text-secondary)",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          {metric.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              fontSize: "9px",
              color: statusColor,
              opacity: 0.7,
            }}
          >
            {trendIcon}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: statusColor,
              textShadow: `0 0 6px ${statusColor}60`,
            }}
          >
            {metric.value}
          </span>
          <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>
            {metric.unit}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "2px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "1px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: statusColor,
            boxShadow: `0 0 4px ${statusColor}`,
            transition: "width 0.5s ease",
            borderRadius: "1px",
          }}
        />
      </div>
    </div>
  );
}

export default function TelemetryPanel() {
  const { metrics, crewMember, selectedRegion, setSelectedRegion } =
    useAstrogliaStore();

  const regions = [
    { id: null, label: "ALL" },
    { id: "heart", label: "CARDIAC" },
    { id: "lungs", label: "PULM." },
    { id: "brain", label: "NEURO" },
    { id: "systemic", label: "SYSTEM" },
  ];

  const filtered = selectedRegion
    ? metrics.filter((m) => m.bodyRegion === selectedRegion)
    : metrics;

  const nominalCount = metrics.filter((m) => m.status === "nominal").length;
  const warnCount = metrics.filter((m) => m.status === "warning").length;
  const critCount = metrics.filter((m) => m.status === "critical").length;

  return (
    <div
      style={{
        width: "240px",
        height: "100%",
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-glow)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 12px 8px",
          borderBottom: "1px solid var(--border-glow)",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "2px",
            color: "var(--accent-cyan)",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          ◈ VITALS DASHBOARD
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "4px",
          }}
        >
          {[
            { label: "NOM", value: nominalCount, color: "#39ff14" },
            { label: "WARN", value: warnCount, color: "#ffb300" },
            { label: "CRIT", value: critCount, color: "#ff1744" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${color}30`,
                borderRadius: "2px",
                padding: "4px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color }}>
                {value}
              </div>
              <div
                style={{ fontSize: "7px", color: "var(--text-muted)", letterSpacing: "1px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Region filters */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
        }}
      >
        {regions.map((r) => (
          <button
            key={r.label}
            onClick={() => setSelectedRegion(r.id)}
            style={{
              background:
                selectedRegion === r.id
                  ? "rgba(0,229,255,0.15)"
                  : "transparent",
              border: `1px solid ${
                selectedRegion === r.id
                  ? "rgba(0,229,255,0.5)"
                  : "rgba(0,229,255,0.1)"
              }`,
              borderRadius: "2px",
              color:
                selectedRegion === r.id
                  ? "var(--accent-cyan)"
                  : "var(--text-muted)",
              fontSize: "7px",
              letterSpacing: "0.5px",
              padding: "2px 5px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: selectedRegion === r.id ? 700 : 400,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Metrics list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((metric) => (
          <MetricRow key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "8px",
          color: "var(--text-muted)",
          letterSpacing: "0.5px",
          lineHeight: "1.6",
        }}
      >
        <div>CREW: {crewMember.name}</div>
        <div>MISSION DAY: {crewMember.missionDay}</div>
        <div>LAST SYNC: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
