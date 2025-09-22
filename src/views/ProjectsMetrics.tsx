import React, { useMemo, useState } from 'react';
import { Clock, FolderOpen, RefreshCw, Search } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeClientAnalytics,
  computeMetricsForCategory,
  computeProjectAnalytics,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import { Card } from '../components/Shared/Card';
import type { ViewComponentProps } from '../types/navigation';
import type { Project } from '../types';

const PROJECT_STATUS_OPTIONS: Array<{ value: 'all' | Project['status']; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'maintenance', label: 'Maintenance' },
];

type TimeRangeValue = '30d' | '90d' | '365d' | 'all';

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

const ProjectsMetrics: React.FC<ViewComponentProps> = () => {
  const { clients, projects, teamAnalytics, automationAnalytics } = useMetricAnalytics();

  const [statusFilter, setStatusFilter] = useState<'all' | Project['status']>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('90d');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      if (normalizedSearch && !project.name.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      const dateToCheck = project.updatedAt ?? project.createdAt;
      if (!isWithinTimeRange(dateToCheck, timeRange)) {
        return false;
      }

      return true;
    });
  }, [projects, statusFilter, searchTerm, timeRange]);

  const filteredClients = useMemo(() => {
    const projectClientIds = new Set(filteredProjects.map((project) => project.clientId));
    return clients.filter((client) => projectClientIds.has(client.id));
  }, [clients, filteredProjects]);

  const analyticsContext = useMemo(() => {
    const projectAnalytics = computeProjectAnalytics(filteredProjects);
    const clientAnalytics = computeClientAnalytics(filteredClients);

    return {
      clients: clientAnalytics,
      projects: projectAnalytics,
      team: teamAnalytics,
      automation: automationAnalytics,
    };
  }, [filteredClients, filteredProjects, teamAnalytics, automationAnalytics]);

  const projectMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'projects'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? projectMetrics[activeMetricId] ?? null : null;

  const projectsMetadata = CATEGORY_METADATA.projects;
  const totalProjects = projects.length;
  const filteredCount = filteredProjects.length;

  const topProjects = useMemo(
    () =>
      filteredProjects
        .slice()
        .sort((a, b) => Date.parse(b.updatedAt ?? b.createdAt) - Date.parse(a.updatedAt ?? a.createdAt))
        .slice(0, 5),
    [filteredProjects],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <FolderOpen className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Project delivery metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Explore the full catalog of project delivery metrics with focused filters for status, time range, and specific engagements.
        </p>
      </header>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Filter projects</h2>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
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
            <span className="font-medium text-[var(--fg)]">Project status</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | Project['status'])}
            >
              {PROJECT_STATUS_OPTIONS.map((option) => (
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
          <label className="space-y-1 text-sm text-[var(--fg-muted)] md:col-span-2">
            <span className="font-medium text-[var(--fg)]">Project name</span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by project title"
                className="flex-1 bg-transparent text-sm text-[var(--fg)] focus:outline-none"
              />
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Filtered scope</p>
            <p className="text-lg font-semibold text-[var(--fg)]">
              {filteredCount} of {totalProjects} projects
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-sm text-[var(--fg-muted)]">
            <Clock className="h-4 w-4" />
            {TIME_RANGE_OPTIONS.find((option) => option.value === timeRange)?.label ?? 'All time'}
          </div>
        </div>
        {topProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {topProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--fg)]">{project.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{project.status}</p>
                  </div>
                  <span className="text-xs text-[var(--fg-muted)]">
                    Updated {new Date(project.updatedAt ?? project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">
            No projects match the selected filters yet.
          </p>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Metric catalog</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Review every available project metric. Select any tile to open detailed insights, recommended actions, and supporting statistics.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCatalog.projects.map((definition) => {
            const metric = projectMetrics[definition.id];
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
        category="projects"
        metadata={projectsMetadata}
        metric={activeMetric}
        onClose={() => setActiveMetricId(null)}
      />
    </div>
  );
};

export default ProjectsMetrics;
