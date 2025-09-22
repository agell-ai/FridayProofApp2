import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Upload, X } from 'lucide-react';
import { Button } from '../Shared/Button';
import { Card } from '../Shared/Card';
import { ROI_METRIC_CONFIG, ROI_METRIC_KEYS } from '../../types/roi';
import type {
  ResourceOption,
  RoiMetricKey,
  RoiMetricRecord,
  RoiMetricUnit,
  RoiMetricValue,
} from '../../types/roi';

interface RoiManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceOptions: ResourceOption[];
  metricsMap: Record<string, RoiMetricRecord>;
  onManualUpdate: (key: string, metrics: RoiMetricRecord) => void;
  onBulkImport: (updates: Array<{ key: string; metrics: RoiMetricRecord }>) => void;
  defaultKey?: string;
}

interface FeedbackState {
  message: string;
  tone: 'positive' | 'negative';
}

type RoiFormState = Record<`${RoiMetricKey}${'Pre' | 'Post'}`, string>;

const REQUIRED_HEADERS = [
  'resourceKey',
  ...ROI_METRIC_KEYS.flatMap((key) => [`${key}Pre`, `${key}Post`]),
] as const;

const createEmptyFormState = (): RoiFormState => {
  const state = {} as RoiFormState;
  ROI_METRIC_KEYS.forEach((key) => {
    state[`${key}Pre` as `${RoiMetricKey}Pre`] = '';
    state[`${key}Post` as `${RoiMetricKey}Post`] = '';
  });
  return state;
};

const formatCurrency = (value: number) => {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value: number) => {
  if (!value) return '0';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatMetricValue = (unit: RoiMetricUnit, value: number) => {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'hours':
      return `${formatNumber(value)} hrs`;
    case 'percentage': {
      if (!Number.isFinite(value)) return '0%';
      const bounded = Math.max(0, Math.min(100, value));
      return Number.isInteger(bounded) ? `${bounded}%` : `${bounded.toFixed(1)}%`;
    }
    default:
      return formatNumber(value);
  }
};

const formatDeltaValue = (unit: RoiMetricUnit, delta: number) => {
  if (!delta) {
    return 'No change';
  }

  const sign = delta > 0 ? '+' : '-';
  const magnitude = Math.abs(delta);

  switch (unit) {
    case 'currency':
      return `${sign}${formatCurrency(magnitude)}`;
    case 'hours':
      return `${sign}${formatNumber(magnitude)} hrs`;
    case 'percentage': {
      const rounded = Math.round(magnitude * 10) / 10;
      const valueText = Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
      return `${sign}${valueText} pts`;
    }
    default:
      return `${sign}${formatNumber(magnitude)}`;
  }
};

const RoiManagerModal: React.FC<RoiManagerModalProps> = ({
  isOpen,
  onClose,
  resourceOptions,
  metricsMap,
  onManualUpdate,
  onBulkImport,
  defaultKey,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [formValues, setFormValues] = useState<RoiFormState>(() => createEmptyFormState());
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const optionMap = useMemo(() => {
    const entries = new Map<string, ResourceOption>();
    resourceOptions.forEach((option) => entries.set(option.key, option));
    return entries;
  }, [resourceOptions]);

  const selectedMetrics = selectedKey ? metricsMap[selectedKey] : undefined;
  const selectedOption = selectedKey ? optionMap.get(selectedKey) : undefined;
  const hasResources = resourceOptions.length > 0;
  const snapshotMetrics = useMemo(() => {
    if (!selectedMetrics) {
      return [] as Array<{
        key: RoiMetricKey;
        label: string;
        deltaText: string;
        baselineText: string;
        tone: 'positive' | 'negative' | 'neutral';
      }>;
    }

    return ROI_METRIC_KEYS.map((key) => {
      const metric = selectedMetrics[key];
      const config = ROI_METRIC_CONFIG[key];
      const delta = metric.post - metric.pre;
      const tone: 'positive' | 'negative' | 'neutral' =
        delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';

      return {
        key,
        label: config.label,
        deltaText: formatDeltaValue(config.unit, delta),
        baselineText: `Baseline ${formatMetricValue(config.unit, metric.pre)} → Current ${formatMetricValue(
          config.unit,
          metric.post,
        )}`,
        tone,
      };
    });
  }, [selectedMetrics]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedKey('');
      setFormValues(createEmptyFormState());
      setFeedback(null);
      return;
    }

    if (!hasResources) {
      setSelectedKey('');
      setFormValues(createEmptyFormState());
      return;
    }

    if (defaultKey && optionMap.has(defaultKey) && selectedKey !== defaultKey) {
      setSelectedKey(defaultKey);
      return;
    }

    if (!selectedKey || !optionMap.has(selectedKey)) {
      setSelectedKey(resourceOptions[0].key);
    }
  }, [
    isOpen,
    hasResources,
    optionMap,
    resourceOptions,
    selectedKey,
    defaultKey,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    if (selectedMetrics) {
      const next = createEmptyFormState();
      ROI_METRIC_KEYS.forEach((key) => {
        const metric = selectedMetrics[key];
        next[`${key}Pre` as `${RoiMetricKey}Pre`] = String(metric?.pre ?? '');
        next[`${key}Post` as `${RoiMetricKey}Post`] = String(metric?.post ?? '');
      });
      setFormValues(next);
    } else {
      setFormValues(createEmptyFormState());
    }
  }, [isOpen, selectedMetrics]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedKey) {
      setFeedback({ message: 'Select a resource to update its ROI metrics.', tone: 'negative' });
      return;
    }

    const parsedMetrics = {} as Record<RoiMetricKey, RoiMetricValue>;
    ROI_METRIC_KEYS.forEach((key) => {
      parsedMetrics[key] = {
        pre: Number(formValues[`${key}Pre` as `${RoiMetricKey}Pre`]) || 0,
        post: Number(formValues[`${key}Post` as `${RoiMetricKey}Post`]) || 0,
      };
    });

    const metrics: RoiMetricRecord = {
      costSavings: parsedMetrics.costSavings,
      revenueGenerated: parsedMetrics.revenueGenerated,
      hoursSaved: parsedMetrics.hoursSaved,
      adoptionRate: parsedMetrics.adoptionRate,
      efficiencyGain: parsedMetrics.efficiencyGain,
      lastUpdated: new Date().toISOString(),
    };

    onManualUpdate(selectedKey, metrics);

    const label = selectedOption?.label || 'selected resource';
    setFeedback({ message: `Saved ROI metrics for ${label}.`, tone: 'positive' });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result?.toString() || '';
      if (!text.trim()) {
        setFeedback({ message: 'Unable to read file contents.', tone: 'negative' });
        return;
      }

      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) {
        setFeedback({ message: 'No data rows found in the import file.', tone: 'negative' });
        return;
      }

      const [headerLine, ...rows] = lines;
      const headers = headerLine.split(',').map((header) => header.trim());
      const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

      if (missingHeaders.length > 0) {
        setFeedback({
          message: `Missing required columns: ${missingHeaders.join(', ')}.`,
          tone: 'negative',
        });
        return;
      }

      const updates: Array<{ key: string; metrics: RoiMetricRecord }> = [];

      rows.forEach((row) => {
        const values = row.split(',');
        if (values.length < headers.length) return;

        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = values[index]?.trim() || '';
        });

        const key = record.resourceKey;
        if (!key) return;

        updates.push({
          key,
          metrics: {
            costSavings: {
              pre: Number(record.costSavingsPre) || 0,
              post: Number(record.costSavingsPost) || 0,
            },
            revenueGenerated: {
              pre: Number(record.revenueGeneratedPre) || 0,
              post: Number(record.revenueGeneratedPost) || 0,
            },
            hoursSaved: {
              pre: Number(record.hoursSavedPre) || 0,
              post: Number(record.hoursSavedPost) || 0,
            },
            adoptionRate: {
              pre: Number(record.adoptionRatePre) || 0,
              post: Number(record.adoptionRatePost) || 0,
            },
            efficiencyGain: {
              pre: Number(record.efficiencyGainPre) || 0,
              post: Number(record.efficiencyGainPost) || 0,
            },
            lastUpdated: new Date().toISOString(),
          },
        });
      });

      if (updates.length === 0) {
        setFeedback({ message: 'No valid rows found to import.', tone: 'negative' });
        return;
      }

      onBulkImport(updates);
      setFeedback({
        message: `Imported ROI metrics for ${updates.length} resource${updates.length === 1 ? '' : 's'}.`,
        tone: 'positive',
      });
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKey(event.target.value);
    setFeedback(null);
  };

  const handleInputChange = (field: keyof RoiFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
      setFeedback(null);
    };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roi-manager-title"
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 py-4">
          <div>
            <h2 id="roi-manager-title" className="text-lg font-semibold text-[var(--fg)]">
              ROI management
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Keep financial impact metrics in sync across every automation asset.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--fg-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            aria-label="Close ROI manager"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <Card glowOnHover className="space-y-3 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--fg)]">Select resource</p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Choose the automation, system, or template whose ROI metrics you need to refresh.
                  </p>
                </div>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={selectedKey}
                  onChange={handleResourceChange}
                  disabled={!hasResources}
                >
                  {resourceOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!hasResources && (
                  <p className="text-xs text-[var(--fg-muted)]">
                    No ROI-enabled resources yet. Publish a tool or connect a system to start tracking impact.
                  </p>
                )}
              </Card>

              <Card glowOnHover className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--fg)]">Manual entry</p>
                  {selectedMetrics?.lastUpdated && (
                    <span className="text-xs text-[var(--fg-muted)]">
                      Last updated {new Date(selectedMetrics.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--fg-muted)]">
                  Capture baseline and post-implementation metrics to keep ROI deltas accurate.
                </p>
                <form className="space-y-4" onSubmit={handleManualSubmit}>
                  <div className="space-y-4">
                    {ROI_METRIC_KEYS.map((key) => {
                      const config = ROI_METRIC_CONFIG[key];
                      const preField = `${key}Pre` as `${RoiMetricKey}Pre`;
                      const postField = `${key}Post` as `${RoiMetricKey}Post`;
                      const isPercentage = config.unit === 'percentage';
                      const unitHint =
                        config.unit === 'currency'
                          ? '$'
                          : config.unit === 'hours'
                          ? 'hrs'
                          : '%';

                      return (
                        <div key={key} className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
                            {config.label}
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                              <label
                                className="text-[11px] font-medium uppercase tracking-wide text-[var(--fg-muted)]"
                                htmlFor={`roi-${key}-pre`}
                              >
                                Pre-implementation ({unitHint})
                              </label>
                              <input
                                id={`roi-${key}-pre`}
                                type="number"
                                min="0"
                                max={isPercentage ? 100 : undefined}
                                step="any"
                                placeholder={
                                  config.unit === 'currency'
                                    ? 'Baseline impact before rollout'
                                    : config.unit === 'hours'
                                    ? 'Hours saved before automation'
                                    : 'Adoption before rollout'
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                                value={formValues[preField]}
                                onChange={handleInputChange(preField)}
                                disabled={!hasResources}
                              />
                            </div>
                            <div>
                              <label
                                className="text-[11px] font-medium uppercase tracking-wide text-[var(--fg-muted)]"
                                htmlFor={`roi-${key}-post`}
                              >
                                Post-implementation ({unitHint})
                              </label>
                              <input
                                id={`roi-${key}-post`}
                                type="number"
                                min="0"
                                max={isPercentage ? 100 : undefined}
                                step="any"
                                placeholder={
                                  config.unit === 'currency'
                                    ? 'Measured impact after rollout'
                                    : config.unit === 'hours'
                                    ? 'Hours saved with automation'
                                    : 'Adoption after rollout'
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                                value={formValues[postField]}
                                onChange={handleInputChange(postField)}
                                disabled={!hasResources}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    glowOnHover
                    disabled={!hasResources}
                  >
                    Save metrics
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <Card glowOnHover className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                  <BarChart3 className="h-4 w-4" />
                  <span>ROI snapshot</span>
                </div>
                {snapshotMetrics.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {snapshotMetrics.map((metric) => {
                      const toneClass =
                        metric.tone === 'positive'
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : metric.tone === 'negative'
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-[var(--fg)]';

                      return (
                        <div key={metric.key} className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{metric.label}</p>
                          <p className={`text-sm font-semibold ${toneClass}`}>{metric.deltaText}</p>
                          <p className="text-xs text-[var(--fg-muted)]">{metric.baselineText}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--fg-muted)]">
                    Metrics will appear here after you log them manually or import a CSV.
                  </p>
                )}
              </Card>

              <Card glowOnHover className="space-y-4 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--fg)]">Bulk import</p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Upload a CSV to refresh multiple assets at once. Provide both pre- and post-implementation columns (e.g.,
                    costSavingsPre, costSavingsPost) for each metric.
                  </p>
                </div>
                <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/40 p-4 text-xs text-[var(--fg-muted)]">
                  <p className="font-medium text-[var(--fg)]">Required headers</p>
                  <p className="mt-1">{REQUIRED_HEADERS.join(', ')}</p>
                </div>
                <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-6 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]">
                  <Upload className="h-5 w-5" />
                  Upload CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
                </label>
              </Card>
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                feedback.tone === 'positive'
                  ? 'border-emerald-400/60 text-emerald-500'
                  : 'border-rose-400/60 text-rose-500'
              }`}
            >
              {feedback.tone === 'positive' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoiManagerModal;
