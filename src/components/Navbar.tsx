"use client";

import { useAstrogliaStore } from "@/store/useAstrogliaStore";

type Tab = "body3d" | "monitoring" | "measurement" | "agent";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "body3d", label: "Body 3D", icon: "◈" },
  { id: "monitoring", label: "Monitoring & Prediction", icon: "⬡" },
  { id: "measurement", label: "Measurement", icon: "◉" },
  { id: "agent", label: "Astroglia Agent", icon: "◆" },
];

export default function Navbar() {
  const { activeTab, setActiveTab, crewMember, isLive, toggleLive, metrics } =
    useAstrogliaStore();

  const overallStatus =
    metrics.some((m) => m.status === "critical")
      ? "critical"
      : metrics.some((m) => m.status === "warning")
      ? "warning"
      : "nominal";

  const statusColor =
    overallStatus === "critical"
      ? "#ff1744"
      : overallStatus === "warning"
      ? "#ffb300"
      : "#39ff14";

  return (
    <nav
      style={{
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-glow)",
        display: "flex",
        alignItems: "center",
        gap: "0",
        padding: "0 16px",
        height: "52px",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginRight: "24px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.5px",
            color: "var(--accent-cyan)",
            opacity: 0.6,
            fontWeight: 300,
          }}
        >
          ▲ NASA / MARS-BASE-7
        </span>
        <span
          style={{
            fontWeight: 800,
            fontSize: "17px",
            letterSpacing: "4px",
            color: "var(--accent-cyan)",
            textShadow:
              "0 0 12px rgba(0,229,255,0.9), 0 0 30px rgba(0,229,255,0.4)",
          }}
        >
          ASTROGLIA
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "stretch", flex: 1, height: "100%" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive
                  ? "rgba(0,229,255,0.07)"
                  : "transparent",
                border: "none",
                borderBottom: isActive
                  ? "2px solid var(--accent-cyan)"
                  : "2px solid transparent",
                color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                padding: "0 18px",
                cursor: "pointer",
                fontSize: "11px",
                letterSpacing: "1.5px",
                fontWeight: isActive ? 700 : 400,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                transition: "all 0.15s ease",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right side: crew info + live indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              letterSpacing: "1px",
            }}
          >
            {crewMember.name}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            SOL {crewMember.missionDay} · {crewMember.role}
          </div>
        </div>

        {/* Status dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: statusColor,
            boxShadow: `0 0 6px ${statusColor}, 0 0 12px ${statusColor}60`,
            animation:
              overallStatus !== "nominal"
                ? "pulse-status 1s ease-in-out infinite"
                : "none",
          }}
        />

        {/* Live toggle */}
        <button
          onClick={toggleLive}
          style={{
            background: isLive
              ? "rgba(57,255,20,0.1)"
              : "rgba(100,100,100,0.1)",
            border: `1px solid ${isLive ? "rgba(57,255,20,0.4)" : "rgba(100,100,100,0.3)"}`,
            borderRadius: "3px",
            color: isLive ? "#39ff14" : "#666",
            fontSize: "9px",
            letterSpacing: "1px",
            padding: "3px 8px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
          }}
        >
          {isLive ? "● LIVE" : "○ PAUSED"}
        </button>
      </div>
    </nav>
  );
}
