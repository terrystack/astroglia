"use client";

import { useState, useRef, useEffect } from "react";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";
import type { AgentMessage } from "@/core/contracts/astroglia.types";

const AGENT_RESPONSES: Record<string, string> = {
  default:
    "Analyzing telemetry data... All monitored vitals are within acceptable parameters for Martian surface conditions. Bone density trajectory and sleep quality metrics warrant attention. Recommend reviewing supplemental protocols.",
  heart:
    "Cardiac analysis complete. Heart rate nominal at 68–72 bpm. Blood pressure within acceptable range for 0.38g environment. No arrhythmia patterns detected. Continue monitoring HRV for stress indicators.",
  lungs:
    "Pulmonary function nominal. SpO₂ at 98%, well above the 90% mission threshold. Respiratory rate stable. Suit O₂ supply optimal. No dust particle infiltration detected in suit filters.",
  brain:
    "Neurological assessment: EEG alpha wave patterns indicate mild fatigue accumulation over Sol 183–187. Recommend 1.5h nap cycle today. Cognitive function at 87% baseline capacity. Sleep debt: 2.1h.",
  radiation:
    "Cumulative radiation exposure: 98.3 mSv over 187 sols. Daily dose: 0.52 mSv — within mission safety limits. GCR flux elevated today due to solar activity. Recommend limiting EVA duration by 20 min.",
  sleep:
    "Sleep analysis: Average 6.1h over past 7 sols. Sol 184 disrupted by EVA schedule shift. Circadian rhythm shows 22-min phase drift. Recommend light therapy at 06:00 and melatonin (0.5mg) at 21:30.",
  exercise:
    "Exercise protocol compliance: 89% over past 30 sols. Resistance training maintains muscle mass within 2% of Earth baseline. Recommend increasing lower-body load by 8% to counteract continued bone density loss.",
  nutrition:
    "Nutritional status: Caloric intake adequate at 2,840 kcal/sol. Vitamin D supplementation required — reduced UV exposure in habitat. Calcium-to-phosphorus ratio optimal. Hydration index: 82% — increase water intake by 300ml.",
  status:
    "SYSTEM STATUS: All 15 biosensors active. Telemetry latency: 4.2ms. Data integrity: 99.97%. Last full baseline calibration: Sol 180. Next scheduled diagnostic: Sol 195. Emergency alert system: ARMED.",
};

function getAgentResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("heart") || lower.includes("cardiac") || lower.includes("pulse")) return AGENT_RESPONSES.heart;
  if (lower.includes("lung") || lower.includes("oxygen") || lower.includes("spo") || lower.includes("breath")) return AGENT_RESPONSES.lungs;
  if (lower.includes("brain") || lower.includes("neuro") || lower.includes("eeg") || lower.includes("cognitive")) return AGENT_RESPONSES.brain;
  if (lower.includes("radiation") || lower.includes("rad") || lower.includes("dose")) return AGENT_RESPONSES.radiation;
  if (lower.includes("sleep") || lower.includes("rest") || lower.includes("circadian")) return AGENT_RESPONSES.sleep;
  if (lower.includes("exercise") || lower.includes("muscle") || lower.includes("bone") || lower.includes("density")) return AGENT_RESPONSES.exercise;
  if (lower.includes("nutrition") || lower.includes("food") || lower.includes("hydrat") || lower.includes("calor")) return AGENT_RESPONSES.nutrition;
  if (lower.includes("status") || lower.includes("system") || lower.includes("sensor") || lower.includes("diagnostic")) return AGENT_RESPONSES.status;
  return AGENT_RESPONSES.default;
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isAgent = message.role === "astroglia";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isAgent ? "row" : "row-reverse",
        alignItems: "flex-start",
        gap: "10px",
        maxWidth: "80%",
        alignSelf: isAgent ? "flex-start" : "flex-end",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "2px",
          background: isAgent ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isAgent ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.1)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: isAgent ? "var(--accent-cyan)" : "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        {isAgent ? "◆" : "◉"}
      </div>

      <div>
        <div
          style={{
            fontSize: "7px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
            marginBottom: "4px",
            textTransform: "uppercase",
          }}
        >
          {isAgent ? "ASTROGLIA AI" : "COMMANDER"} ·{" "}
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
        <div
          style={{
            background: isAgent
              ? "rgba(0,229,255,0.05)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${
              isAgent ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.08)"
            }`,
            borderRadius: "2px",
            padding: "10px 14px",
            fontSize: "11px",
            lineHeight: 1.7,
            color: isAgent ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", alignSelf: "flex-start" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "2px",
          background: "rgba(0,229,255,0.1)",
          border: "1px solid rgba(0,229,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "var(--accent-cyan)",
        }}
      >
        ◆
      </div>
      <div
        style={{
          background: "rgba(0,229,255,0.05)",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: "2px",
          padding: "10px 16px",
          display: "flex",
          gap: "4px",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              animation: `pulse-status 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AstrogliaAgentTab() {
  const { agentMessages, addAgentMessage, metrics } = useAstrogliaStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [agentMessages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    addAgentMessage({ role: "user", content: text });

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    setIsTyping(false);

    addAgentMessage({
      role: "astroglia",
      content: getAgentResponse(text),
    });
  };

  const nominalCount = metrics.filter((m) => m.status === "nominal").length;
  const warnCount = metrics.filter((m) => m.status === "warning").length;
  const critCount = metrics.filter((m) => m.status === "critical").length;

  const QUICK_PROMPTS = [
    "Show cardiac status",
    "Analyze sleep patterns",
    "Radiation exposure report",
    "Nutrition assessment",
    "Brain & cognitive status",
    "System diagnostics",
  ];

  return (
    <div style={{ height: "100%", display: "flex", overflow: "hidden" }}>
      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border-glow)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "var(--bg-panel)",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", color: "var(--accent-cyan)" }}>
              ASTROGLIA AGENT
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1px", marginTop: "2px" }}>
              AI DIAGNOSTIC ASSISTANT · MARTIAN HEALTH MANAGEMENT SYSTEM
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "8px", color: "#39ff14", letterSpacing: "1px" }}>● ONLINE</span>
            <span style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>v2.4.1-mars</span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {agentMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
              }}
              style={{
                background: "rgba(0,229,255,0.05)",
                border: "1px solid rgba(0,229,255,0.2)",
                borderRadius: "2px",
                color: "var(--text-secondary)",
                fontSize: "8px",
                letterSpacing: "0.5px",
                padding: "4px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.5)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-cyan)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.2)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-glow)",
            display: "flex",
            gap: "10px",
            background: "var(--bg-panel)",
            flexShrink: 0,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Query ASTROGLIA diagnostic AI..."
            style={{
              flex: 1,
              background: "rgba(0,229,255,0.03)",
              border: "1px solid rgba(0,229,255,0.2)",
              borderRadius: "2px",
              color: "var(--text-primary)",
              fontSize: "11px",
              fontFamily: "inherit",
              padding: "8px 12px",
              outline: "none",
              letterSpacing: "0.5px",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            style={{
              background:
                input.trim() && !isTyping
                  ? "rgba(0,229,255,0.15)"
                  : "rgba(0,229,255,0.03)",
              border: `1px solid ${
                input.trim() && !isTyping
                  ? "rgba(0,229,255,0.5)"
                  : "rgba(0,229,255,0.1)"
              }`,
              borderRadius: "2px",
              color:
                input.trim() && !isTyping
                  ? "var(--accent-cyan)"
                  : "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "1px",
              padding: "8px 16px",
              cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            SEND ▶
          </button>
        </div>
      </div>

      {/* Right sidebar */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border-glow)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "var(--accent-cyan)", marginBottom: "10px" }}>
            LIVE TELEMETRY FEED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "10px" }}>
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
                  padding: "6px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "7px", color: "var(--text-muted)", letterSpacing: "1px" }}>{label}</div>
              </div>
            ))}
          </div>
          {metrics.slice(0, 8).map((m) => {
            const color =
              m.status === "critical" ? "#ff1744" : m.status === "warning" ? "#ffb300" : "#39ff14";
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "8px",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{m.label.slice(0, 14)}</span>
                <span style={{ color, fontWeight: 700 }}>
                  {m.value} {m.unit}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "12px" }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: "var(--accent-cyan)", marginBottom: "10px" }}>
            AI CAPABILITIES
          </div>
          {[
            "Real-time vital analysis",
            "Anomaly detection (ML)",
            "1–24h health forecasting",
            "Drug interaction checks",
            "EVA readiness scoring",
            "Emergency protocol guidance",
            "Nutritional optimization",
            "Sleep cycle management",
          ].map((cap) => (
            <div
              key={cap}
              style={{
                fontSize: "8px",
                color: "var(--text-muted)",
                padding: "3px 0",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ color: "var(--accent-cyan)", opacity: 0.5 }}>▸</span>
              {cap}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
