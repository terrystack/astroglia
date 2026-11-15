import { create } from "zustand";
import type { VitalMetric, AgentMessage, CrewMember } from "@/core/contracts/astroglia.types";
import { generateLiveMetrics } from "@/core/telemetry/metricRegistry";

type Tab = "body3d" | "monitoring" | "measurement" | "agent";

interface AstrogliaState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  metrics: VitalMetric[];
  refreshMetrics: () => void;

  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;

  crewMember: CrewMember;

  agentMessages: AgentMessage[];
  addAgentMessage: (msg: Omit<AgentMessage, "id" | "timestamp">) => void;

  isLive: boolean;
  toggleLive: () => void;
}

const MOCK_CREW: CrewMember = {
  id: "crew-001",
  name: "Dr. Elena Vasquez",
  role: "Mission Commander",
  missionDay: 187,
  metrics: [],
  overallStatus: "nominal",
};

export const useAstrogliaStore = create<AstrogliaState>((set, get) => ({
  activeTab: "body3d",
  setActiveTab: (tab) => set({ activeTab: tab }),

  metrics: generateLiveMetrics(),
  refreshMetrics: () => set({ metrics: generateLiveMetrics() }),

  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  crewMember: MOCK_CREW,

  agentMessages: [
    {
      id: "init-1",
      role: "astroglia",
      content:
        "ASTROGLIA diagnostic system online. All vitals nominal. Mission Day 187 — crew health within acceptable parameters. Bone density monitoring suggests initiating supplemental calcium protocol.",
      timestamp: Date.now() - 60000,
    },
  ],
  addAgentMessage: (msg) =>
    set((state) => ({
      agentMessages: [
        ...state.agentMessages,
        { ...msg, id: `msg-${Date.now()}`, timestamp: Date.now() },
      ],
    })),

  isLive: true,
  toggleLive: () => set((state) => ({ isLive: !state.isLive })),
}));
