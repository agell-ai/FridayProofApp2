export interface RoiMetricValue {
  pre: number;
  post: number;
}

export const ROI_METRIC_KEYS = [
  'costSavings',
  'revenueGenerated',
  'hoursSaved',
  'adoptionRate',
  'efficiencyGain',
] as const;

export type RoiMetricKey = (typeof ROI_METRIC_KEYS)[number];

export type RoiMetricUnit = 'currency' | 'hours' | 'percentage';

export interface RoiMetricRecord {
  costSavings: RoiMetricValue;
  revenueGenerated: RoiMetricValue;
  hoursSaved: RoiMetricValue;
  adoptionRate: RoiMetricValue;
  efficiencyGain: RoiMetricValue;
  lastUpdated: string;
}

export const ROI_METRIC_CONFIG: Record<RoiMetricKey, { label: string; unit: RoiMetricUnit }> = {
  costSavings: { label: 'Cost Savings', unit: 'currency' },
  revenueGenerated: { label: 'Revenue Impact', unit: 'currency' },
  hoursSaved: { label: 'Hours Saved', unit: 'hours' },
  adoptionRate: { label: 'Adoption Rate', unit: 'percentage' },
  efficiencyGain: { label: 'Efficiency Gain', unit: 'percentage' },
};

export interface ResourceOption {
  key: string;
  label: string;
}
