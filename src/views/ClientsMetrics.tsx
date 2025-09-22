import React, { useMemo, useState } from 'react';
import { Building2, RefreshCw, Search, Tags } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeClientAnalytics,
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import { Card } from '../components/Shared/Card';
import type { ViewComponentProps } from '../types/navigation';
import type { Client } from '../types';

type ClientStatusFilter = 'all' | Client['status'];
type TimeRangeValue = '30d' | '90d' | '365d' | 'all';

const STATUS_OPTIONS: Array<{ value: ClientStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeValue; label: string }> = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
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

const ClientsMetrics: React.FC<ViewComponentProps> = () => {
  const { clients, projectAnalytics, teamAnalytics, automationAnalytics } = useMetricAnalytics();

  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('90d');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<'all' | string>('all');
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const industryOptions = useMemo(() => {
    const industries = Array.from(new Set(clients.map((client) => client.industry))).sort();
    return ['all', ...industries];
  }, [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      if (statusFilter !== 'all' && client.status !== statusFilter) {
        return false;
      }

      if (industryFilter !== 'all' && client.industry !== industryFilter) {
        return false;
      }

      if (normalizedSearch && !client.companyName.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      const dateToCheck = client.updatedAt ?? client.createdAt;
      if (!isWithinTimeRange(dateToCheck, timeRange)) {
        return false;
      }

      return true;
    });
  }, [clients, statusFilter, industryFilter, searchTerm, timeRange]);

  const filteredClientAnalytics = useMemo(
    () => computeClientAnalytics(filteredClients),
    [filteredClients],
  );

  const analyticsContext = useMemo(
    () => ({
      clients: filteredClientAnalytics,
      projects: projectAnalytics,
      team: teamAnalytics,
      automation: automationAnalytics,
    }),
    [filteredClientAnalytics, projectAnalytics, teamAnalytics, automationAnalytics],
  );

  const clientMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'clients'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? clientMetrics[activeMetricId] ?? null : null;
  const clientsMetadata = CATEGORY_METADATA.clients;

  const totalClients = clients.length;
  const filteredCount = filteredClients.length;

  const topRevenueClients = filteredClientAnalytics.topRevenueClients;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Client portfolio metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Dive into revenue, satisfaction, and lifecycle metrics for every client relationship with targeted filters.
        </p>
      </header>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Filter clients</h2>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setTimeRange('90d');
              setSearchTerm('');
              setIndustryFilter('all');
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Client status</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ClientStatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Industry</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value as 'all' | string)}
            >
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'All industries' : industry}
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
            <span className="font-medium text-[var(--fg)]">Client name</span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by organization"
                className="flex-1 bg-transparent text-sm text-[var(--fg)] focus:outline-none"
              />
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Filtered clients</p>
            <p className="text-lg font-semibold text-[var(--fg)]">
              {filteredCount} of {totalClients} accounts
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-sm text-[var(--fg-muted)]">
            <Tags className="h-4 w-4" />
            {industryFilter === 'all' ? 'All industries' : industryFilter}
          </div>
        </div>
        {filteredCount > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {topRevenueClients.slice(0, 4).map((client) => (
              <div
                key={client.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--fg)]">{client.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">${client.revenue.toLocaleString()} revenue</p>
                  </div>
                  <span className="text-xs text-[var(--fg-muted)]">{client.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">No clients match the selected filters yet.</p>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Metric catalog</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Monitor lifecycle, revenue, and satisfaction metrics across the complete client portfolio.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCatalog.clients.map((definition) => {
            const metric = clientMetrics[definition.id];
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
        category="clients"
        metadata={clientsMetadata}
        metric={activeMetric}
        onClose={() => setActiveMetricId(null)}
      />
    </div>
  );
};

export default ClientsMetrics;
