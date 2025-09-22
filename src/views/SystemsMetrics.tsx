import React, { useMemo, useState } from 'react';
import { Cpu, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeAutomationAnalytics,
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import { Card } from '../components/Shared/Card';
import type { ViewComponentProps } from '../types/navigation';
import type { Tool } from '../types/tools';

type TimeRangeValue = '30d' | '90d' | '365d' | 'all';

type ToolStatusFilter = 'all' | Tool['status'];
type ToolCategoryFilter = 'all' | Tool['category'];

const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeValue; label: string }> = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

const STATUS_OPTIONS: Array<{ value: ToolStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'error', label: 'Error' },
];

const TYPE_OPTIONS: Array<{ value: ToolCategoryFilter; label: string }> = [
  { value: 'all', label: 'All categories' },
  { value: 'ML', label: 'ML' },
  { value: 'LLM', label: 'LLM' },
  { value: 'GPT', label: 'GPT' },
  { value: 'AI Tool', label: 'AI Tool' },
  { value: 'Agent', label: 'Agent' },
  { value: 'Automation', label: 'Automation' },
  { value: 'Workflow', label: 'Workflow' },
];

const isWithinTimeRange = (dateString: string | undefined, range: TimeRangeValue): boolean => {
  if (range === 'all') {
    return true;
  }

  const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  if (!dateString) {
    return true;
  }

  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) {
    return true;
  }

  return timestamp >= threshold;
};

const SystemsMetrics: React.FC<ViewComponentProps> = () => {
  const { tools, clientAnalytics, projectAnalytics, teamAnalytics } = useMetricAnalytics();

  const [statusFilter, setStatusFilter] = useState<ToolStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ToolCategoryFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('90d');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tools.filter((tool) => {
      if (statusFilter !== 'all' && tool.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'all' && tool.category !== typeFilter) {
        return false;
      }

      if (normalizedSearch && !tool.name.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      const dateToCheck = tool.updatedAt ?? tool.createdAt;
      if (!isWithinTimeRange(dateToCheck, timeRange)) {
        return false;
      }

      return true;
    });
  }, [tools, statusFilter, typeFilter, timeRange, searchTerm]);

  const analyticsContext = useMemo(() => {
    const automationAnalytics = computeAutomationAnalytics(filteredTools);

    return {
      clients: clientAnalytics,
      projects: projectAnalytics,
      team: teamAnalytics,
      automation: automationAnalytics,
    };
  }, [filteredTools, clientAnalytics, projectAnalytics, teamAnalytics]);

  const automationMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'automation'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? automationMetrics[activeMetricId] ?? null : null;
  const systemsMetadata = CATEGORY_METADATA.automation;

  const totalTools = tools.length;
  const filteredCount = filteredTools.length;

  const topSystems = useMemo(
    () =>
      filteredTools
        .slice()
        .sort((a, b) => (b.stats?.usage ?? 0) - (a.stats?.usage ?? 0))
        .slice(0, 6),
    [filteredTools],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <Cpu className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Automation systems metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Audit automation and AI systems with granular filters for status, deployment recency, and platform category.
        </p>
      </header>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Filter systems</h2>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setTimeRange('90d');
              setSearchTerm('');
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">System status</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ToolStatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">System category</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as ToolCategoryFilter)}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Time range</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as TimeRangeValue)}
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">System name</span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by system or project"
                className="flex-1 bg-transparent text-sm text-[var(--fg)] focus:outline-none"
              />
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Filtered systems</p>
            <p className="text-lg font-semibold text-[var(--fg)]">
              {filteredCount} of {totalTools} automations
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-sm text-[var(--fg-muted)]">
            <SlidersHorizontal className="h-4 w-4" />
            {STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? 'All statuses'}
          </div>
        </div>
        {topSystems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {topSystems.map((tool) => (
              <div
                key={tool.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[var(--fg)]">{tool.name}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{tool.category} · {tool.status}</p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Usage {tool.stats?.usage ?? 0}% · Efficiency {tool.stats?.efficiency ?? 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">No systems match the selected filters at the moment.</p>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Metric catalog</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Inspect adoption, reliability, and impact metrics for every automation in the workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCatalog.automation.map((definition) => {
            const metric = automationMetrics[definition.id];
            if (!metric) {
              return null;
            }

            return (
              <MetricCatalogCard
                key={definition.id}
                metric={metric}
                onSelect={() => setActiveMetricId(definition.id)}
              />
            );
          })}
        </div>
      </section>

      <MetricDetailModal
        isOpen={activeMetricId !== null}
        category="automation"
        metadata={systemsMetadata}
        metric={activeMetric}
        onClose={() => setActiveMetricId(null)}
      />
    </div>
  );
};

export default SystemsMetrics;
