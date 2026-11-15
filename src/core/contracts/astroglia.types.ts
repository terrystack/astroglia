export type VitalStatus = "nominal" | "warning" | "critical" | "unknown";

export interface VitalMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  baseline: number;
  status: VitalStatus;
  timestamp: number;
  trend: "up" | "down" | "stable";
  bodyRegion: BodyRegion;
}

export type BodyRegion =
  | "head"
  | "chest"
  | "heart"
  | "lungs"
  | "abdomen"
  | "arms"
  | "legs"
  | "spine"
  | "brain"
  | "systemic";

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  missionDay: number;
  metrics: VitalMetric[];
  overallStatus: VitalStatus;
}

export interface TelemetrySnapshot {
  crewMemberId: string;
  timestamp: number;
  metrics: VitalMetric[];
}

export interface PredictionPoint {
  timestamp: number;
  value: number;
  confidence: number;
}

export interface MetricPrediction {
  metricId: string;
  points: PredictionPoint[];
  riskLevel: VitalStatus;
  recommendation: string;
}

export interface BaselineProfile {
  crewMemberId: string;
  metrics: Record<string, { mean: number; stdDev: number; min: number; max: number }>;
}

export interface AgentMessage {
  id: string;
  role: "user" | "astroglia";
  content: string;
  timestamp: number;
  attachedMetrics?: string[];
}
