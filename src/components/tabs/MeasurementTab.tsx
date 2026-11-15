"use client";

import { useState, useMemo } from "react";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";

function BarChart({ values, label, unit, color }: { values: number[]; label: string; unit: string; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div style={{ padding: "12px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "3px" }}>
      <div style={{ fontSize: "8px", letterSpacing: "1.5px", color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "60px" }}>
        {values.map((v, i) => {
          const h = ((v - min) / range) * 50 + 10;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}px`,
                background: i === values.length - 1 ? color : `${color}60`,
                borderRadius: "1px 1px 0 0",
                transition: "height 0.3s ease",
                boxShadow: i === values.length - 1 ? `0 0 6px ${color}80` : "none",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "7px", color: "var(--text-muted)" }}>
        <span>-24h</span>
        <span style={{ color }}>
          {values[values.length - 1].toFixed(1)} {unit}
        </span>
        <span>now</span>
      </div>
    </div>
  );
}

function RadarChart({ metrics }: { metrics: Array<{ label: string; value: number; min: number; max: number }> }) {
  const n = metrics.length;
  const cx = 120;
  const cy = 120;
  const r = 90;

  const points = metrics.map((m, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const pct = (m.value - m.min) / (m.max - m.min);
    const pr = pct * r;
    return {
      x: cx + Math.cos(angle) * pr,
      y: cy + Math.sin(angle) * pr,
      lx: cx + Math.cos(angle) * (r + 18),
      ly: cy + Math.sin(angle) * (r + 18),
      label: m.label,
    };
  });

  const gridPoints = (scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + Math.cos(angle) * r * scale},${cy + Math.sin(angle) * r * scale}`;
    }).join(" ");

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg width={240} height={240} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={gridPoints(scale)}
          fill="none"
          stroke="rgba(0,229,255,0.1)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="rgba(0,229,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      <path d={pathD} fill="rgba(0,229,255,0.1)" stroke="#00e5ff" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#00e5ff" />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="rgba(0,229,255,0.6)"
            fontFamily="monospace"
          >
            {p.label.length > 6 ? p.label.slice(0, 6) : p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ComparisonTable() {
  const { metrics } = useAstrogliaStore();

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: "8px", letterSpacing: "2px", color: "var(--accent-cyan)" }}>
        MEASUREMENT TABLE — ALL SENSORS
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-glow)" }}>
              {["METRIC", "CURRENT", "BASELINE", "MIN", "MAX", "DEVIATION", "REGION", "STATUS"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 10px",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    letterSpacing: "1px",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => {
              const deviation = (((m.value - m.baseline) / m.baseline) * 100).toFixed(1);
              const devNum = parseFloat(deviation);
              const statusColor =
                m.status === "critical" ? "#ff1744" : m.status === "warning" ? "#ffb300" : "#39ff14";
              return (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: i % 2 === 0 ? "transparent" : "rgba(0,229,255,0.015)",
                  }}
                >
                  <td style={{ padding: "6px 10px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {m.label}
                  </td>
                  <td style={{ padding: "6px 10px", fontWeight: 700, color: statusColor }}>
                    {m.value} {m.unit}
                  </td>
                  <td style={{ padding: "6px 10px", color: "var(--text-muted)" }}>
                    {m.baseline}
                  </td>
                  <td style={{ padding: "6px 10px", color: "var(--text-muted)" }}>
                    {m.min}
                  </td>
                  <td style={{ padding: "6px 10px", color: "var(--text-muted)" }}>
                    {m.max}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      color: Math.abs(devNum) > 10 ? "#ffb300" : "var(--text-secondary)",
                    }}
                  >
                    {devNum > 0 ? "+" : ""}
                    {deviation}%
                  </td>
                  <td style={{ padding: "6px 10px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "7px", letterSpacing: "0.5px" }}>
                    {m.bodyRegion}
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    <span
                      style={{
                        fontSize: "7px",
                        fontWeight: 700,
                        color: statusColor,
                        padding: "2px 5px",
                        border: `1px solid ${statusColor}40`,
                        borderRadius: "2px",
                        background: `${statusColor}10`,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MeasurementTab() {
  const { metrics } = useAstrogliaStore();

  const radarData = metrics.slice(0, 8).map((m) => ({
    label: m.label.split(" ")[0],
    value: m.value,
    min: m.min,
    max: m.max,
  }));

  const historyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const noise = (Math.random() - 0.5) * 10;
      return 68 + noise;
    });
  }, []);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border-glow)", paddingBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", color: "var(--accent-cyan)" }}>
          MEASUREMENT CENTER
        </div>
        <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1px", marginTop: "2px" }}>
          QUANTITATIVE PHYSIOLOGICAL DATA · SOL 187
        </div>
      </div>

      {/* Top row: charts */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 1fr 1fr", gap: "12px" }}>
        {/* Radar */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "8px", letterSpacing: "1.5px", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", alignSelf: "flex-start" }}>
            VITALS RADAR
          </div>
          <RadarChart metrics={radarData} />
        </div>

        <BarChart
          values={historyData}
          label="Heart Rate — 24h"
          unit="bpm"
          color="#e91e63"
        />
        <BarChart
          values={Array.from({ length: 24 }, () => 97 + (Math.random() - 0.5) * 2)}
          label="SpO₂ — 24h"
          unit="%"
          color="#7c4dff"
        />
        <BarChart
          values={Array.from({ length: 24 }, () => 36.8 + (Math.random() - 0.5) * 0.6)}
          label="Core Temp — 24h"
          unit="°C"
          color="#00bcd4"
        />
      </div>

      {/* Full table */}
      <ComparisonTable />

      {/* Bottom stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {[
          { label: "AVG HEART RATE (24h)", value: "71.2 bpm", sub: "Normal range" },
          { label: "BONE DENSITY LOSS", value: "-0.8%/mo", sub: "Mars gravity effect" },
          { label: "SLEEP EFFICIENCY", value: "71.4%", sub: "Below target 85%" },
          { label: "RADIATION CUMULATIVE", value: "98.3 mSv", sub: "Sol 187 total" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "3px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "7px", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "2px" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "7px", color: "var(--text-muted)" }}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
