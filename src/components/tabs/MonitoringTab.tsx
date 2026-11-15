"use client";

import { useMemo } from "react";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";
import type { VitalMetric } from "@/core/contracts/astroglia.types";

function MiniSparkline({ metric }: { metric: VitalMetric }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const noise = (Math.random() - 0.5) * (metric.max - metric.min) * 0.08;
      pts.push(metric.baseline + noise);
    }
    pts.push(metric.value);
    return pts;
  }, [metric.id, metric.value]);

  const minV = Math.min(...points);
  const maxV = Math.max(...points);
  const range = maxV - minV || 1;

  const w = 100;
  const h = 32;
  const pad = 2;

  const path = points
    .map((v, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - minV) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const color =
    metric.status === "critical"
      ? "#ff1744"
      : metric.status === "warning"
      ? "#ffb300"
      : "#39ff14";

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
      <circle
        cx={
          pad + ((points.length - 1) / (points.length - 1)) * (w - pad * 2)
        }
        cy={
          h -
          pad -
          ((points[points.length - 1] - minV) / range) * (h - pad * 2)
        }
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function MetricCard({ metric }: { metric: VitalMetric }) {
  const color =
    metric.status === "critical"
      ? "#ff1744"
      : metric.status === "warning"
      ? "#ffb300"
      : "#39ff14";

  const pct = ((metric.value - metric.min) / (metric.max - metric.min)) * 100;

  const predictions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const drift = ((Math.random() - 0.5) * (metric.max - metric.min)) * 0.05;
      pts.push(Math.min(metric.max, Math.max(metric.min, metric.value + drift * i)));
    }
    return pts;
  }, [metric.id]);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${color}25`,
        borderRadius: "3px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "1.5px",
              color: "var(--text-secondary)",
              marginBottom: "2px",
              textTransform: "uppercase",
            }}
          >
            {metric.label}
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color,
              lineHeight: 1,
              textShadow: `0 0 10px ${color}50`,
            }}
          >
            {metric.value}
            <span style={{ fontSize: "10px", fontWeight: 400, marginLeft: "4px", color: "var(--text-muted)" }}>
              {metric.unit}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "7px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
              marginBottom: "2px",
            }}
          >
            STATUS
          </div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "2px 6px",
              border: `1px solid ${color}40`,
              borderRadius: "2px",
              background: `${color}10`,
            }}
          >
            {metric.status}
          </div>
        </div>
      </div>

      <MiniSparkline metric={metric} />

      {/* Range bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "7px",
            color: "var(--text-muted)",
            marginBottom: "3px",
          }}
        >
          <span>{metric.min}</span>
          <span style={{ color: "rgba(0,229,255,0.4)" }}>baseline: {metric.baseline}</span>
          <span>{metric.max}</span>
        </div>
        <div
          style={{
            height: "3px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "2px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${((metric.baseline - metric.min) / (metric.max - metric.min)) * 100}%`,
              top: "-1px",
              width: "1px",
              height: "5px",
              background: "rgba(0,229,255,0.5)",
            }}
          />
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: color,
              borderRadius: "2px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Prediction */}
      <div
        style={{
          fontSize: "7px",
          color: "var(--text-muted)",
          letterSpacing: "0.5px",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "6px",
        }}
      >
        <span style={{ color: "rgba(0,229,255,0.5)", letterSpacing: "1px" }}>
          TREND:{" "}
        </span>
        {metric.trend === "up"
          ? "↑ Increasing"
          : metric.trend === "down"
          ? "↓ Decreasing"
          : "→ Stable"}{" "}
        · 1h forecast:{" "}
        <span style={{ color }}>
          {predictions[predictions.length - 1].toFixed(1)} {metric.unit}
        </span>
      </div>
    </div>
  );
}

export default function MonitoringTab() {
  const { metrics } = useAstrogliaStore();

  const critical = metrics.filter((m) => m.status === "critical");
  const warning = metrics.filter((m) => m.status === "warning");
  const nominal = metrics.filter((m) => m.status === "nominal");

  const sections = [
    { label: "CRITICAL ALERTS", metrics: critical, color: "#ff1744" },
    { label: "WARNINGS", metrics: warning, color: "#ffb300" },
    { label: "NOMINAL", metrics: nominal, color: "#39ff14" },
  ].filter((s) => s.metrics.length > 0);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-glow)",
          paddingBottom: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "3px",
              color: "var(--accent-cyan)",
            }}
          >
            MONITORING & PREDICTION
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
              marginTop: "2px",
            }}
          >
            REAL-TIME PHYSIOLOGICAL ANALYSIS · MARTIAN ENVIRONMENT
          </div>
        </div>
        <div
          style={{
            fontSize: "9px",
            color: "var(--text-secondary)",
            textAlign: "right",
            letterSpacing: "0.5px",
          }}
        >
          <div>{metrics.length} ACTIVE SENSORS</div>
          <div style={{ color: "#39ff14" }}>
            {nominal.length}/{metrics.length} NOMINAL
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "2px",
              color: section.color,
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: section.color,
                boxShadow: `0 0 6px ${section.color}`,
              }}
            />
            {section.label} ({section.metrics.length})
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "10px",
            }}
          >
            {section.metrics.map((m) => (
              <MetricCard key={m.id} metric={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
