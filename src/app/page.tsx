"use client";

import { useEffect } from "react";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";
import Navbar from "@/components/Navbar";
import Body3DTab from "@/components/tabs/Body3DTab";
import MonitoringTab from "@/components/tabs/MonitoringTab";
import MeasurementTab from "@/components/tabs/MeasurementTab";
import AstrogliaAgentTab from "@/components/tabs/AstrogliaAgentTab";

export default function Home() {
  const { activeTab, isLive, refreshMetrics } = useAstrogliaStore();

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(refreshMetrics, 2000);
    return () => clearInterval(interval);
  }, [isLive, refreshMetrics]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--bg-deep)",
      }}
    >
      <Navbar />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "body3d" && <Body3DTab />}
        {activeTab === "monitoring" && <MonitoringTab />}
        {activeTab === "measurement" && <MeasurementTab />}
        {activeTab === "agent" && <AstrogliaAgentTab />}
      </div>
    </main>
  );
}
