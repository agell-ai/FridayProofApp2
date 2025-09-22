export interface RoiMetricRecord {
  costSavings: number;
  hoursSaved: number;
  revenueGenerated: number;
  adoptionRate: number;
  efficiencyGain: number;
  lastUpdated: string;
}

export interface ResourceOption {
  key: string;
  label: string;
}
