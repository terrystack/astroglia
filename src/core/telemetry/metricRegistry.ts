import type { VitalMetric, BodyRegion } from "../contracts/astroglia.types";

interface MetricTemplate {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  baseline: number;
  bodyRegion: BodyRegion;
}

export const METRIC_REGISTRY: MetricTemplate[] = [
  { id: "heart_rate", label: "Heart Rate", unit: "bpm", min: 40, max: 180, baseline: 68, bodyRegion: "heart" },
  { id: "blood_pressure_sys", label: "Systolic BP", unit: "mmHg", min: 80, max: 200, baseline: 118, bodyRegion: "heart" },
  { id: "blood_pressure_dia", label: "Diastolic BP", unit: "mmHg", min: 50, max: 130, baseline: 76, bodyRegion: "heart" },
  { id: "spo2", label: "SpO₂", unit: "%", min: 85, max: 100, baseline: 98, bodyRegion: "lungs" },
  { id: "respiratory_rate", label: "Respiratory Rate", unit: "br/min", min: 8, max: 35, baseline: 14, bodyRegion: "lungs" },
  { id: "core_temp", label: "Core Temperature", unit: "°C", min: 35, max: 40, baseline: 36.8, bodyRegion: "systemic" },
  { id: "skin_temp", label: "Skin Temperature", unit: "°C", min: 30, max: 38, baseline: 33.5, bodyRegion: "systemic" },
  { id: "eeg_alpha", label: "EEG Alpha", unit: "μV", min: 0, max: 50, baseline: 22, bodyRegion: "brain" },
  { id: "cortisol", label: "Cortisol", unit: "μg/dL", min: 2, max: 25, baseline: 12, bodyRegion: "systemic" },
  { id: "hydration", label: "Hydration Index", unit: "%", min: 50, max: 100, baseline: 82, bodyRegion: "systemic" },
  { id: "muscle_fatigue_l", label: "Muscle Fatigue L", unit: "index", min: 0, max: 100, baseline: 15, bodyRegion: "legs" },
  { id: "muscle_fatigue_r", label: "Muscle Fatigue R", unit: "index", min: 0, max: 100, baseline: 14, bodyRegion: "arms" },
  { id: "radiation_dose", label: "Radiation Dose", unit: "mSv/d", min: 0, max: 5, baseline: 0.5, bodyRegion: "systemic" },
  { id: "bone_density", label: "Bone Density", unit: "g/cm²", min: 0.5, max: 2.0, baseline: 1.2, bodyRegion: "spine" },
  { id: "sleep_quality", label: "Sleep Quality", unit: "score", min: 0, max: 100, baseline: 75, bodyRegion: "brain" },
];

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function computeStatus(value: number, template: MetricTemplate): VitalMetric["status"] {
  const range = template.max - template.min;
  const deviation = Math.abs(value - template.baseline) / (range * 0.5);
  if (deviation > 0.7) return "critical";
  if (deviation > 0.4) return "warning";
  return "nominal";
}

function computeTrend(prev: number, curr: number): VitalMetric["trend"] {
  const diff = curr - prev;
  if (Math.abs(diff) < 0.01) return "stable";
  return diff > 0 ? "up" : "down";
}

let _prevValues: Record<string, number> = {};

export function generateLiveMetrics(noiseScale = 1): VitalMetric[] {
  const now = Date.now();
  return METRIC_REGISTRY.map((template) => {
    const noise = (Math.random() - 0.5) * 2 * noiseScale;
    const drift = (template.max - template.min) * 0.04 * noise;
    const rawValue = template.baseline + drift;
    const value = parseFloat(clamp(rawValue, template.min, template.max).toFixed(1));
    const prev = _prevValues[template.id] ?? value;
    _prevValues[template.id] = value;

    return {
      id: template.id,
      label: template.label,
      value,
      unit: template.unit,
      min: template.min,
      max: template.max,
      baseline: template.baseline,
      status: computeStatus(value, template),
      timestamp: now,
      trend: computeTrend(prev, value),
      bodyRegion: template.bodyRegion,
    };
  });
}
