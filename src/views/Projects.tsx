import React, { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CheckCircle2,
  Filter,
  Hourglass,
  Layers,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import ProjectCard from '../components/Projects/ProjectCard';
import ProjectModal from '../components/Projects/ProjectModal';
import { Card } from '../components/Shared/Card';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import {
  DATE_RANGE_OPTIONS,
  DEFAULT_TIME_RANGE,
  DateRangeKey,
  getDateRange,
  getDateRangeLabel,
  isDateWithinRange,
} from '../utils/timeRanges';

type StatusFilterValue = 'all' | Project['status'];
type MetricKey = 'total' | 'completed' | 'in-progress' | 'new';

interface MetricDefinition {
  key: MetricKey;
  label: string;
  description: string;
  statuses?: Project['status'][];
  icon: LucideIcon;
  accentClass: string;
}

const statusOrder: Project['status'][] = [
  'planning',
  'development',
  'testing',
  'deployed',
  'maintenance',
];

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: 'total',
    label: 'Total',
    description: 'Projects in view',
    icon: Layers,
    accentClass: 'text-[var(--accent-orange)]',
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Deployed or under maintenance',
    statuses: ['deployed', 'maintenance'],
    icon: CheckCircle2,
    accentClass: 'text-emerald-500',
  },
  {
    key: 'in-progress',
    label: 'In-Progress',
    description: 'Active delivery work',
    statuses: ['development', 'testing'],
    icon: Hourglass,
    accentClass: 'text-sky-500',
  },
  {
    key: 'new',
    label: 'New',
    description: 'Recently kicked off',
    statuses: ['planning'],
    icon: Sparkles,
    accentClass: 'text-amber-500',
  },
];

const METRIC_BY_KEY = METRIC_DEFINITIONS.reduce<Record<MetricKey, MetricDefinition>>(
  (acc, definition) => {
    acc[definition.key] = definition;
    return acc;
  },
  {} as Record<MetricKey, MetricDefinition>,
);

const matchesMetric = (project: Project, definition: MetricDefinition) => {
  if (!definition.statuses || definition.statuses.length === 0) {
    return true;
  }

  return definition.statuses.includes(project.status);
};

const formatStatusLabel = (status: string) =>
  status
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const Projects: React.FC = () => {
  const { projects, isLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('total');
  const [timeRange, setTimeRange] = useState<DateRangeKey>(DEFAULT_TIME_RANGE);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<Project['status']>();
    projects.forEach((project) => {
      statuses.add(project.status);
    });

    return statusOrder.filter((status) => statuses.has(status));
  }, [projects]);

  const baseFilteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const range = getDateRange(timeRange);

    return projects.filter((project) => {
      if (
        normalizedSearch &&
        ![project.name, project.description, project.status]
          .map((value) => value.toLowerCase())
          .some((value) => value.includes(normalizedSearch))
      ) {
        return false;
      }

      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      const createdMatches = isDateWithinRange(project.createdAt, range);
      const updatedMatches = isDateWithinRange(project.updatedAt, range);

      return createdMatches || updatedMatches;
    });
  }, [projects, searchTerm, statusFilter, timeRange]);

  const filteredProjects = useMemo(() => {
    const definition = METRIC_BY_KEY[activeMetric];

    if (!definition || !definition.statuses || definition.statuses.length === 0) {
      return baseFilteredProjects;
    }

    return baseFilteredProjects.filter((project) => matchesMetric(project, definition));
  }, [baseFilteredProjects, activeMetric]);

  const metricCounts = useMemo(() => {
    const counts = METRIC_DEFINITIONS.reduce<Record<MetricKey, number>>((acc, definition) => {
      acc[definition.key] = 0;
      return acc;
    }, {
      total: 0,
      completed: 0,
      'in-progress': 0,
      new: 0,
    });

    baseFilteredProjects.forEach((project) => {
      METRIC_DEFINITIONS.forEach((definition) => {
        if (matchesMetric(project, definition)) {
          counts[definition.key] += 1;
        }
      });
    });

    return counts;
  }, [baseFilteredProjects]);

  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      chips.push(`Search: "${trimmedSearch}"`);
    }

    if (statusFilter !== 'all') {
      chips.push(`Status: ${formatStatusLabel(statusFilter)}`);
    }

    if (activeMetric !== 'total') {
      chips.push(`Metric: ${METRIC_BY_KEY[activeMetric].label}`);
    }

    if (timeRange !== 'all') {
      chips.push(`Range: ${getDateRangeLabel(timeRange)}`);
    }

    return chips;
  }, [searchTerm, statusFilter, activeMetric, timeRange]);

  const handleMetricSelect = (key: MetricKey) => {
    setActiveMetric((previous) => (previous === key && key !== 'total' ? 'total' : key));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--fg)]">Projects</h1>
              <p className="text-sm text-[var(--fg-muted)]">
                Monitor every engagement, understand momentum, and spot what needs support.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  placeholder="Search by project name, description, or status"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Time range
                </span>
                {DATE_RANGE_OPTIONS.map((option) => {
                  const isActive = option.value === timeRange;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTimeRange(option.value)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${
                        isActive
                          ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white shadow-sm'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:self-end lg:self-start">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <select
                className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilterValue)}
              >
                <option value="all">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_DEFINITIONS.map((definition) => {
          const count = metricCounts[definition.key] ?? 0;
          const isActive = activeMetric === definition.key;
          const Icon = definition.icon;

          return (
            <button
              key={definition.key}
              type="button"
              onClick={() => handleMetricSelect(definition.key)}
              aria-pressed={isActive}
              className="w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
            >
              <Card glowOnHover activeGlow={isActive} className="h-full p-5">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                        {definition.label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">{count}</p>
                      <p className="mt-1 text-xs text-[var(--fg-muted)]">{definition.description}</p>
                    </div>
                    <div
                      className={`rounded-lg p-2 ${
                        isActive ? 'bg-[var(--surface)]/80' : 'bg-[var(--surface)]/60'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? definition.accentClass : 'text-[var(--fg-muted)]'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">
                    {isActive
                      ? 'Click again to view all projects'
                      : 'Click to filter project list'}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--fg-muted)]">
        <span>
          Showing{' '}
          <span className="font-medium text-[var(--fg)]">{filteredProjects.length}</span>{' '}
          of {metricCounts.total ?? baseFilteredProjects.length} projects
        </span>
        {activeMetric !== 'total' && (
          <button
            type="button"
            onClick={() => setActiveMetric('total')}
            className="text-xs font-semibold text-[var(--accent-purple)] transition hover:underline"
          >
            Clear metric filter
          </button>
        )}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center">
          <p className="text-lg font-semibold text-[var(--fg)]">
            {projects.length === 0 ? 'No projects available yet' : 'No projects match your filters'}
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            {projects.length === 0
              ? 'Create your first project to kick off collaboration.'
              : 'Try adjusting your search, status selection, metric, or time range to broaden the results.'}
          </p>

          {activeFilterChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--fg-muted)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default Projects;
