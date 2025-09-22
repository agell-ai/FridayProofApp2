import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, FolderOpen, Handshake, SlidersHorizontal, Users, Wrench, X } from 'lucide-react';

import StatsCard from '../components/Dashboard/StatsCard';
import { Card } from '../components/Shared/Card';
import { useAuth } from '../hooks/useAuth';
import type { ViewComponentProps } from '../types/navigation';
import {
  CATEGORY_METADATA,
  CATEGORY_ORDER,
  type MetricCategory,
  type MetricCategoryMetadata,
} from './dashboardCategories';
import {
  TONE_CLASSES,
  metricCatalog,
  useMetricAnalytics,
  type MetricDefinition,
  type MetricResult,
  formatCurrency,
  formatDecimal,
  formatPercent,
} from './metrics';

const METRIC_STORAGE_KEY = 'friday-dashboard-metric-selections';
const METRICS_PER_CATEGORY = 3;

const DEFAULT_METRIC_SELECTIONS: Record<MetricCategory, string[]> = {
  clients: ['active-clients', 'recurring-revenue', 'client-satisfaction'],
  projects: ['projects-in-flight', 'deployment-rate', 'automation-density'],
  team: ['active-collaborators', 'team-utilization', 'delivery-output'],
  automation: ['active-automation', 'automation-usage', 'automation-savings'],
};

const sanitizeCategorySelection = (selection: string[], category: MetricCategory): string[] => {
  const available = metricCatalog[category].map((metric) => metric.id);
  const unique = Array.from(new Set(selection.filter((id) => available.includes(id))));
  if (unique.length >= METRICS_PER_CATEGORY) {
    return unique.slice(0, METRICS_PER_CATEGORY);
  }

  const defaults = DEFAULT_METRIC_SELECTIONS[category];
  const merged = [...unique];
  for (const candidate of defaults) {
    if (merged.length >= METRICS_PER_CATEGORY) {
      break;
    }
    if (!merged.includes(candidate)) {
      merged.push(candidate);
    }
  }

  if (merged.length < METRICS_PER_CATEGORY) {
    for (const candidate of available) {
      if (merged.length >= METRICS_PER_CATEGORY) {
        break;
      }
      if (!merged.includes(candidate)) {
        merged.push(candidate);
      }
    }
  }

  return merged.slice(0, METRICS_PER_CATEGORY);
};

const sanitizeSelections = (
  selections: Partial<Record<MetricCategory, string[]>>,
): Record<MetricCategory, string[]> => {
  return CATEGORY_ORDER.reduce((acc, category) => {
    const current = selections[category] ?? DEFAULT_METRIC_SELECTIONS[category];
    acc[category] = sanitizeCategorySelection(current, category);
    return acc;
  }, {} as Record<MetricCategory, string[]>);
};

const loadStoredSelections = (): Record<MetricCategory, string[]> => {
  if (typeof window === 'undefined') {
    return DEFAULT_METRIC_SELECTIONS;
  }

  try {
    const raw = window.localStorage.getItem(METRIC_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_METRIC_SELECTIONS;
    }

    const parsed = JSON.parse(raw) as Partial<Record<MetricCategory, string[]>>;
    return sanitizeSelections(parsed);
  } catch (error) {
    console.warn('Unable to parse dashboard metric selections from storage', error);
    return DEFAULT_METRIC_SELECTIONS;
  }
};

export const MetricCard: React.FC<{
  metric: MetricResult;
  onSelect: () => void;
}> = ({ metric, onSelect }) => {
  return (
    <Card
      glowOnHover
      className="p-5 transition-transform duration-300 hover:-translate-y-0.5"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--fg-muted)]">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">{metric.value}</p>
          {metric.change && (
            <p className={`mt-1 text-sm font-medium ${metric.changeTone ? TONE_CLASSES[metric.changeTone] : ''}`}>
              {metric.change}
            </p>
          )}
          {metric.secondaryLabel && (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">{metric.secondaryLabel}</p>
          )}
        </div>
        <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{metric.description}</p>
      </div>
    </Card>
  );
};

interface MetricCustomizationModalProps {
  isOpen: boolean;
  category: MetricCategory | null;
  metadata?: MetricCategoryMetadata;
  options: MetricDefinition[];
  selected: string[];
  onSave: (nextSelection: string[]) => void;
  onClose: () => void;
}

const MetricCustomizationModal: React.FC<MetricCustomizationModalProps> = ({
  isOpen,
  category,
  metadata,
  options,
  selected,
  onSave,
  onClose,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selected);

  useEffect(() => {
    if (isOpen) {
      setLocalSelection(selected);
    }
  }, [isOpen, selected]);

  if (!isOpen || !category || !metadata) {
    return null;
  }

  const toggleSelection = (id: string) => {
    setLocalSelection((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      if (prev.length >= METRICS_PER_CATEGORY) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  const Icon = metadata.icon;
  const atLimit = localSelection.length >= METRICS_PER_CATEGORY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              <Icon className="h-4 w-4" />
              <span>{metadata.title}</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-[var(--fg)]">Customize metrics</h2>
            <p className="text-sm text-[var(--fg-muted)]">
              Choose up to {METRICS_PER_CATEGORY} metrics to highlight for this category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[420px] space-y-3 overflow-y-auto px-6 py-4">
          {options.map((option) => {
            const isSelected = localSelection.includes(option.id);
            const disabled = !isSelected && atLimit;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleSelection(option.id)}
                disabled={disabled}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-purple)]/70'
                } ${disabled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-transparent bg-[var(--accent-purple)] text-white'
                        : 'border-[var(--border)] text-[var(--fg-muted)]'
                    }`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : option.label.slice(0, 1)}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--fg)]">{option.label}</p>
                    <p className="text-sm text-[var(--fg-muted)]">{option.description}</p>
                    {option.tags && option.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {option.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--fg-muted)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <span className="text-sm text-[var(--fg-muted)]">
            {localSelection.length} of {METRICS_PER_CATEGORY} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={localSelection.length !== METRICS_PER_CATEGORY}
              className="rounded-lg bg-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              Save selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricDetailModalProps {
  isOpen: boolean;
  category: MetricCategory | null;
  metadata?: MetricCategoryMetadata;
  metric?: MetricResult | null;
  onClose: () => void;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ isOpen, category, metadata, metric, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !category || !metadata || !metric) {
    return null;
  }

  const Icon = metadata.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              <Icon className="h-4 w-4" />
              <span>{metadata.title}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--fg)]">{metric.label}</h2>
            <p className="text-sm text-[var(--fg-muted)]">{metric.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-4xl font-semibold text-[var(--fg)]">{metric.value}</p>
                {metric.secondaryLabel && (
                  <p className="text-sm text-[var(--fg-muted)]">{metric.secondaryLabel}</p>
                )}
              </div>
              {metric.change && (
                <span className={`text-sm font-medium ${metric.changeTone ? TONE_CLASSES[metric.changeTone] : ''}`}>
                  {metric.change}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {metric.detail.stats.map((stat) => (
              <div
                key={`${metric.id}-${stat.label}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
                <p className={`mt-2 text-lg font-semibold ${stat.tone ? TONE_CLASSES[stat.tone] : 'text-[var(--fg)]'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {metric.detail.insights && metric.detail.insights.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Suggested actions
              </h3>
              <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
                {metric.detail.insights.map((insight, index) => (
                  <li key={`${metric.id}-insight-${index}`}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {metric.detail.footnote && (
            <p className="mt-6 text-xs text-[var(--fg-muted)]">{metric.detail.footnote}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<ViewComponentProps> = ({ onNavigate }) => {
  const { user, account } = useAuth();
  const {
    clientAnalytics,
    projectAnalytics,
    teamAnalytics,
    automationAnalytics,
    computedMetrics,
  } = useMetricAnalytics();

  const [selectedMetrics, setSelectedMetrics] = useState<Record<MetricCategory, string[]>>(
    () => loadStoredSelections()
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(selectedMetrics));
    }
  }, [selectedMetrics]);

  const [customizingCategory, setCustomizingCategory] = useState<MetricCategory | null>(null);
  const [detailMetric, setDetailMetric] = useState<{ category: MetricCategory; metricId: string } | null>(null);

  const handleSaveSelection = useCallback((category: MetricCategory, nextSelection: string[]) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [category]: sanitizeCategorySelection(nextSelection, category),
    }));
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Active Clients',
        value: clientAnalytics.activeClients.length,
        change: `${clientAnalytics.prospectClients.length} prospects`,
        icon: Handshake,
        changeTone: clientAnalytics.prospectClients.length > 0 ? ('positive' as const) : ('neutral' as const),
        viewId: 'clients-metrics' as const,
      },
      {
        title: 'Projects in Motion',
        value: projectAnalytics.activeProjects.length,
        change: `${projectAnalytics.deployedProjects.length} deployed`,
        icon: FolderOpen,
        changeTone: projectAnalytics.deployedProjects.length > 0 ? ('positive' as const) : ('neutral' as const),
        viewId: 'projects-metrics' as const,
      },
      {
        title: 'Team Utilization',
        value: `${formatPercent(teamAnalytics.avgProductivity, 0)}`,
        change: `${formatDecimal(teamAnalytics.avgSatisfaction, 1)}/5 satisfaction`,
        icon: Users,
        changeTone: teamAnalytics.avgProductivity >= 80 ? ('positive' as const) : ('neutral' as const),
        viewId: 'team-metrics' as const,
      },
      {
        title: 'Automation Savings',
        value: formatCurrency(automationAnalytics.totalCostSavings),
        change: `${formatPercent(automationAnalytics.avgEfficiency, 0)} efficiency`,
        icon: Wrench,
        changeTone: automationAnalytics.totalCostSavings > 0 ? ('positive' as const) : ('neutral' as const),
        viewId: 'systems-metrics' as const,
      },
    ],
    [
      automationAnalytics.avgEfficiency,
      automationAnalytics.totalCostSavings,
      clientAnalytics.activeClients.length,
      clientAnalytics.prospectClients.length,
      projectAnalytics.activeProjects.length,
      projectAnalytics.deployedProjects.length,
      teamAnalytics.avgProductivity,
      teamAnalytics.avgSatisfaction,
    ],
  );

  const activeCategoryMetadata = customizingCategory ? CATEGORY_METADATA[customizingCategory] : undefined;
  const activeDetailMetadata = detailMetric ? CATEGORY_METADATA[detailMetric.category] : undefined;
  const activeDetailMetric =
    detailMetric ? computedMetrics[detailMetric.category]?.[detailMetric.metricId] ?? null : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--fg-muted)]">Dashboard Overview</p>
          <h1 className="text-3xl font-bold text-[var(--fg)]">
            {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome back!'}
          </h1>
          <p className="text-sm text-[var(--fg-muted)]">
            {account
              ? `Here’s how ${account.name} is performing across workstreams.`
              : 'Here’s how your workspace is performing across workstreams.'}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            changeTone={card.changeTone}
            onClick={onNavigate ? () => onNavigate(card.viewId) : undefined}
          />
        ))}
      </section>

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const metadata = CATEGORY_METADATA[category];
          const SectionIcon = metadata.icon;
          const selections = selectedMetrics[category] ?? DEFAULT_METRIC_SELECTIONS[category];
          return (
            <section key={category}>
              <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--surface)]" glowOnHover>
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${metadata.accent}`} />
                <div className="relative space-y-6 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                        <SectionIcon className="h-4 w-4" />
                        <span>{metadata.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--fg-muted)]">{metadata.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomizingCategory(category)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Customize
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {selections.map((metricId) => {
                      const metric = computedMetrics[category][metricId];
                      if (!metric) {
                        return null;
                      }
                      return (
                        <MetricCard
                          key={metricId}
                          metric={metric}
                          onSelect={() => setDetailMetric({ category, metricId })}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>
            </section>
          );
        })}
      </div>

      <MetricCustomizationModal
        isOpen={customizingCategory !== null}
        category={customizingCategory}
        metadata={activeCategoryMetadata}
        options={customizingCategory ? metricCatalog[customizingCategory] : []}
        selected={customizingCategory ? selectedMetrics[customizingCategory] ?? [] : []}
        onSave={(selection) => {
          if (customizingCategory) {
            handleSaveSelection(customizingCategory, selection);
          }
        }}
        onClose={() => setCustomizingCategory(null)}
      />

      <MetricDetailModal
        isOpen={detailMetric !== null}
        category={detailMetric?.category ?? null}
        metadata={activeDetailMetadata}
        metric={activeDetailMetric}
        onClose={() => setDetailMetric(null)}
      />
    </div>
  );
};

export default Dashboard;
