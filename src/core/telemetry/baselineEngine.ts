import type { BaselineProfile, VitalMetric } from "../contracts/astroglia.types";

export function computeBaseline(
  history: VitalMetric[][],
  crewMemberId: string
): BaselineProfile {
  const accumulator: Record<string, number[]> = {};

  for (const snapshot of history) {
    for (const metric of snapshot) {
      if (!accumulator[metric.id]) accumulator[metric.id] = [];
      accumulator[metric.id].push(metric.value);
    }
  }

  const result: BaselineProfile["metrics"] = {};

  for (const [id, values] of Object.entries(accumulator)) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    result[id] = { mean, stdDev, min, max };
  }

  return { crewMemberId, metrics: result };
}

export function detectAnomalies(
  current: VitalMetric[],
  baseline: BaselineProfile
): Array<{ metricId: string; zScore: number; severity: "mild" | "moderate" | "severe" }> {
  const anomalies = [];
  for (const metric of current) {
    const base = baseline.metrics[metric.id];
    if (!base || base.stdDev === 0) continue;
    const zScore = Math.abs(metric.value - base.mean) / base.stdDev;
    if (zScore > 1.5) {
      const severity: "mild" | "moderate" | "severe" =
        zScore > 3 ? "severe" : zScore > 2 ? "moderate" : "mild";
      anomalies.push({ metricId: metric.id, zScore, severity });
    }
  }
  return anomalies;
}
