import React, { useMemo, useState } from 'react';
import { RefreshCw, Search, Users } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeMetricsForCategory,
  computeTeamAnalytics,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import { Card } from '../components/Shared/Card';
import type { ViewComponentProps } from '../types/navigation';
import type { TeamMember } from '../types';

type TeamStatusFilter = 'all' | TeamMember['status'];
type TeamTypeFilter = 'all' | TeamMember['type'];
type TimeRangeValue = '30d' | '90d' | '365d' | 'all';

const STATUS_OPTIONS: Array<{ value: TeamStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const TYPE_OPTIONS: Array<{ value: TeamTypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'inactive', label: 'Inactive' },
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

const TeamMetrics: React.FC<ViewComponentProps> = () => {
  const { teamMembers, clientAnalytics, projectAnalytics, automationAnalytics } = useMetricAnalytics();

  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TeamTypeFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('90d');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const filteredTeamMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return teamMembers.filter((member) => {
      if (statusFilter !== 'all' && member.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'all' && member.type !== typeFilter) {
        return false;
      }

      if (normalizedSearch && !member.name.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      const dateToCheck = member.lastActiveAt ?? member.updatedAt;
      if (!isWithinTimeRange(dateToCheck, timeRange)) {
        return false;
      }

      return true;
    });
  }, [teamMembers, statusFilter, typeFilter, searchTerm, timeRange]);

  const filteredTeamAnalytics = useMemo(
    () => computeTeamAnalytics(filteredTeamMembers),
    [filteredTeamMembers],
  );

  const analyticsContext = useMemo(
    () => ({
      clients: clientAnalytics,
      projects: projectAnalytics,
      team: filteredTeamAnalytics,
      automation: automationAnalytics,
    }),
    [clientAnalytics, projectAnalytics, filteredTeamAnalytics, automationAnalytics],
  );

  const teamMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'team'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? teamMetrics[activeMetricId] ?? null : null;
  const teamMetadata = CATEGORY_METADATA.team;

  const totalMembers = teamMembers.length;
  const filteredCount = filteredTeamMembers.length;

  const topContributors = filteredTeamAnalytics.topProductiveMembers;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Team performance metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Track utilization, satisfaction, and enablement impact across every collaborator.
        </p>
      </header>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Filter team members</h2>
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
            <span className="font-medium text-[var(--fg)]">Team status</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TeamStatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Team type</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TeamTypeFilter)}
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
            <span className="font-medium text-[var(--fg)]">Team member</span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name"
                className="flex-1 bg-transparent text-sm text-[var(--fg)] focus:outline-none"
              />
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Filtered collaborators</p>
            <p className="text-lg font-semibold text-[var(--fg)]">
              {filteredCount} of {totalMembers} teammates
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-sm text-[var(--fg-muted)]">
            {timeRange === 'all' ? 'All activity' : TIME_RANGE_OPTIONS.find((option) => option.value === timeRange)?.label}
          </div>
        </div>
        {filteredCount > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {topContributors.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--fg)]">{member.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{member.role}</p>
                  </div>
                  <span className="text-xs text-[var(--fg-muted)]">
                    Productivity {Math.round(member.productivity)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">No team members match the selected filters yet.</p>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Metric catalog</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Assess utilization, satisfaction, and enablement asset creation across the entire team.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCatalog.team.map((definition) => {
            const metric = teamMetrics[definition.id];
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
        category="team"
        metadata={teamMetadata}
        metric={activeMetric}
        onClose={() => setActiveMetricId(null)}
      />
    </div>
  );
};

export default TeamMetrics;
