import React from 'react';
import { X } from 'lucide-react';
import { Card } from '../Shared/Card';
import type {
  CategoryKey,
  CategoryMeta,
  DashboardAnalyticsSummary,
  CategoryMetric,
} from './dashboardTypes';

interface CategoryDetailModalProps {
  isOpen: boolean;
  category: CategoryKey | null;
  onClose: () => void;
  analytics: DashboardAnalyticsSummary;
  metrics: Record<CategoryKey, Record<string, CategoryMetric>>;
  metricOrder: Record<CategoryKey, string[]>;
  metadata: Record<CategoryKey, CategoryMeta>;
}

const trendColorMap = {
  up: 'text-emerald-500 dark:text-emerald-300',
  down: 'text-rose-500 dark:text-rose-300',
  neutral: 'text-[var(--fg-muted)]',
} as const;

const DetailMetricCard: React.FC<{ metric: CategoryMetric }> = ({ metric }) => (
  <Card className="p-4 bg-[var(--surface)]/70">
    <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{metric.label}</p>
    <p className="mt-2 text-xl font-semibold text-[var(--fg)]">{metric.value}</p>
    {metric.changeLabel && (
      <p
        className={`mt-1 text-xs font-medium ${
          metric.trend ? trendColorMap[metric.trend] : 'text-[var(--fg-muted)]'
        }`}
      >
        {metric.changeLabel}
      </p>
    )}
  </Card>
);

const ProgressRow: React.FC<{
  label: string;
  valueLabel: string;
  percent: number;
  accent?: string;
}> = ({ label, valueLabel, percent, accent = 'from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)]' }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm text-[var(--fg-muted)]">
      <span>{label}</span>
      <span className="font-semibold text-[var(--fg)]">{valueLabel}</span>
    </div>
    <div className="h-2 rounded-full bg-[var(--surface)]/60 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  </div>
);

const renderClientDetail = (analytics: DashboardAnalyticsSummary['clients']) => {
  const total = analytics.totalClients || 1;
  const activeRate = (analytics.activeClients / total) * 100;
  const prospectRate = (analytics.prospectClients / total) * 100;
  const inactiveRate = (analytics.inactiveClients / total) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Pipeline distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressRow label="Active" valueLabel={`${analytics.activeClients}`} percent={activeRate} accent="from-emerald-500 to-emerald-400" />
          <ProgressRow label="Prospects" valueLabel={`${analytics.prospectClients}`} percent={prospectRate} accent="from-sky-500 to-sky-400" />
          <ProgressRow label="Dormant" valueLabel={`${analytics.inactiveClients}`} percent={inactiveRate} accent="from-slate-500 to-slate-400" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Experience metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressRow
            label="Avg satisfaction"
            valueLabel={`${analytics.avgSatisfaction.toFixed(1)} / 5`}
            percent={(analytics.avgSatisfaction / 5) * 100}
            accent="from-purple-500 to-purple-400"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[var(--fg-muted)]">
              <span>Avg response time</span>
              <span className="font-semibold text-[var(--fg)]">{analytics.avgResponseTime.toFixed(1)}h</span>
            </div>
            <div className="relative h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/40 via-transparent to-slate-500/10 dark:from-slate-500/20 dark:via-transparent dark:to-slate-900/40" />
              <div className="absolute left-0 top-1/2 h-px w-full bg-[var(--border)]/60" />
              <div
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--accent-purple)]/40 to-transparent"
                style={{ height: `${Math.min(100, (analytics.avgResponseTime / 8) * 100)}%` }}
              />
              <div className="absolute inset-0 flex flex-col justify-between px-3 py-2 text-[10px] text-[var(--fg-muted)]">
                <span>Target ≤ 3h</span>
                <span className="self-end">Service window 8h</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const renderProjectDetail = (analytics: DashboardAnalyticsSummary['projects']) => {
  const total = analytics.totalProjects || 1;
  const statusEntries = Object.entries(analytics.byStatus) as [keyof typeof analytics.byStatus, number][];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Delivery pipeline</h3>
        <div className="space-y-3">
          {statusEntries.map(([status, count]) => (
            <ProgressRow
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              valueLabel={`${count} projects`}
              percent={(count / total) * 100}
              accent={
                status === 'deployed'
                  ? 'from-emerald-500 to-emerald-400'
                  : status === 'development'
                    ? 'from-sky-500 to-sky-400'
                    : status === 'testing'
                      ? 'from-purple-500 to-purple-400'
                      : status === 'planning'
                        ? 'from-amber-500 to-amber-400'
                        : 'from-slate-500 to-slate-400'
              }
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Systems overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressRow
            label="Total systems"
            valueLabel={`${analytics.totalSystems}`}
            percent={analytics.totalProjects > 0 ? (analytics.totalSystems / (analytics.totalProjects * 3)) * 100 : 0}
            accent="from-cyan-500 to-cyan-400"
          />
          <ProgressRow
            label="Active systems"
            valueLabel={`${analytics.activeSystems}`}
            percent={analytics.totalSystems > 0 ? (analytics.activeSystems / analytics.totalSystems) * 100 : 0}
            accent="from-emerald-500 to-emerald-400"
          />
        </div>
        <div className="mt-6">
          <div className="text-sm font-medium text-[var(--fg)] mb-2">Deployment readiness</div>
          <div className="relative h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--surface)]/40" />
            <div className="grid h-full grid-cols-12">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`border-r border-dashed border-[var(--border)]/40 ${
                    index < Math.round((analytics.byStatus.deployed / total) * 12)
                      ? 'bg-gradient-to-br from-emerald-500/40 via-emerald-400/20 to-transparent'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            Highlights the proportion of work that is ready for launch based on deployment counts.
          </p>
        </div>
      </Card>
    </div>
  );
};

const renderTeamDetail = (analytics: DashboardAnalyticsSummary['team']) => {
  const total = analytics.totalMembers || 1;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Team composition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressRow
            label="Managers"
            valueLabel={`${analytics.byRole.manager}`}
            percent={(analytics.byRole.manager / total) * 100}
            accent="from-indigo-500 to-indigo-400"
          />
          <ProgressRow
            label="Employees"
            valueLabel={`${analytics.byRole.employee}`}
            percent={(analytics.byRole.employee / total) * 100}
            accent="from-sky-500 to-sky-400"
          />
          <ProgressRow
            label="Contractors"
            valueLabel={`${analytics.byRole.contractor}`}
            percent={(analytics.byRole.contractor / total) * 100}
            accent="from-teal-500 to-teal-400"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Performance pulse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressRow
            label="Avg productivity"
            valueLabel={`${Math.round(analytics.avgProductivity)}%`}
            percent={Math.min(100, analytics.avgProductivity)}
            accent="from-emerald-500 to-emerald-400"
          />
          <ProgressRow
            label="Avg satisfaction"
            valueLabel={`${analytics.avgSatisfaction.toFixed(1)} / 5`}
            percent={(analytics.avgSatisfaction / 5) * 100}
            accent="from-purple-500 to-purple-400"
          />
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-sm text-[var(--fg-muted)]">
              <span>Hours captured this period</span>
              <span className="font-semibold text-[var(--fg)]">{analytics.totalHours.toLocaleString()}</span>
            </div>
            <div className="relative h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-transparent to-slate-500/10 dark:from-slate-600/20 dark:via-transparent dark:to-slate-900/40" />
              <div className="absolute inset-0 flex items-end gap-1 px-2 pb-2">
                {Array.from({ length: 6 }).map((_, index) => {
                  const height = 40 + index * 10;
                  return (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-[var(--accent-orange)]/60 via-[var(--accent-pink)]/50 to-[var(--accent-purple)]/60"
                      style={{ height: `${Math.min(100, height)}%` }}
                    />
                  );
                })}
              </div>
              <div className="absolute top-1 left-2 text-[10px] uppercase tracking-wide text-[var(--fg-muted)]">
                Rolling weeks
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const renderToolDetail = (analytics: DashboardAnalyticsSummary['tools']) => {
  const total = analytics.totalTools || 1;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Usage and adoption</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressRow
            label="Avg usage"
            valueLabel={`${Math.round(analytics.avgUsage)}%`}
            percent={analytics.avgUsage}
            accent="from-emerald-500 to-emerald-400"
          />
          <ProgressRow
            label="Avg efficiency"
            valueLabel={`${Math.round(analytics.avgEfficiency)}%`}
            percent={analytics.avgEfficiency}
            accent="from-cyan-500 to-cyan-400"
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-wide text-[var(--fg-muted)]">
          {Object.entries(analytics.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2">
              <span className="capitalize">{status}</span>
              <span className="text-sm font-semibold text-[var(--fg)]">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Category coverage</h3>
        <div className="space-y-3">
          {Object.entries(analytics.byCategory)
            .filter(([, count]) => count > 0)
            .map(([category, count]) => (
              <ProgressRow
                key={category}
                label={category}
                valueLabel={`${count} tools`}
                percent={(count / total) * 100}
                accent="from-purple-500 to-purple-400"
              />
            ))}
        </div>
        <div className="mt-6">
          <div className="text-sm font-medium text-[var(--fg)] mb-2">Savings trend</div>
          <div className="relative h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-emerald-500/5" />
            <div className="absolute inset-0 flex items-end gap-1 px-2 pb-2">
              {Array.from({ length: 8 }).map((_, index) => {
                const height = 30 + index * 8;
                return (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500/70 to-emerald-300/70"
                    style={{ height: `${Math.min(100, height)}%` }}
                  />
                );
              })}
            </div>
            <div className="absolute top-1 left-2 text-[10px] uppercase tracking-wide text-[var(--fg-muted)]">
              Growth over periods
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  category,
  onClose,
  analytics,
  metrics,
  metricOrder,
  metadata,
}) => {
  if (!isOpen || !category) {
    return null;
  }

  const meta = metadata[category];
  const Icon = meta.icon;
  const summaryOrder = metricOrder[category];
  const categoryMetrics = metrics[category];

  const summaryMetrics = summaryOrder
    .map((id) => categoryMetrics[id])
    .filter((metric): metric is CategoryMetric => Boolean(metric));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/15 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-8 py-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--fg)]">{meta.title} overview</h2>
              <p className="text-sm text-[var(--fg-muted)]">{meta.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 p-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
            aria-label="Close detail view"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-8 py-6">
          {summaryMetrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryMetrics.map((metric) => (
                <DetailMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          )}

          {category === 'clients' && renderClientDetail(analytics.clients)}
          {category === 'projects' && renderProjectDetail(analytics.projects)}
          {category === 'team' && renderTeamDetail(analytics.team)}
          {category === 'tools' && renderToolDetail(analytics.tools)}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
