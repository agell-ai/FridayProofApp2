import React from 'react';
import { Building2, FolderOpen, Users, Pencil } from 'lucide-react';
import { Card } from '../Shared/Card';

type WorkspaceType = 'client' | 'project' | 'team';

type MetricTone = 'default' | 'positive' | 'warning' | 'critical';

export interface WorkspaceMetric {
  label: string;
  value: string;
  tone?: MetricTone;
}

export interface WorkspaceCardData {
  id: string;
  type: WorkspaceType;
  title: string;
  subtitle: string;
  status: string;
  meta: string;
  tags: string[];
  metrics: WorkspaceMetric[];
}

interface WorkspaceCardProps {
  data: WorkspaceCardData;
  onEdit: (data: WorkspaceCardData) => void;
}

const typeConfig: Record<WorkspaceType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  client: { label: 'Client', icon: Building2 },
  project: { label: 'Project', icon: FolderOpen },
  team: { label: 'Team', icon: Users },
};

const statusStyles: Record<string, string> = {
  active: 'border-emerald-200 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  prospect: 'border-amber-200 text-amber-600 dark:text-amber-300 bg-amber-500/10',
  planning: 'border-sky-200 text-sky-600 dark:text-sky-300 bg-sky-500/10',
  development: 'border-indigo-200 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10',
  testing: 'border-purple-200 text-purple-600 dark:text-purple-300 bg-purple-500/10',
  deployed: 'border-emerald-200 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  maintenance: 'border-blue-200 text-blue-600 dark:text-blue-300 bg-blue-500/10',
  inactive: 'border-slate-200 text-slate-600 dark:text-slate-300 bg-slate-500/10',
};

const toneStyles: Record<MetricTone, string> = {
  default: 'text-[var(--fg)]',
  positive: 'text-emerald-600 dark:text-emerald-300',
  warning: 'text-amber-600 dark:text-amber-300',
  critical: 'text-rose-600 dark:text-rose-300',
};

const formatStatus = (status: string) =>
  status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ data, onEdit }) => {
  const Icon = typeConfig[data.type].icon;
  const statusClass = statusStyles[data.status] || 'border-[var(--border)] text-[var(--fg-muted)] bg-[var(--surface)]';

  return (
    <Card glowOnHover className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--fg)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[var(--fg)]">{data.title}</h3>
              <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                {typeConfig[data.type].label}
              </span>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">{data.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClass}`}>
            {formatStatus(data.status)}
          </span>
          <button
            type="button"
            onClick={() => onEdit(data)}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition-colors"
            aria-label={`Edit ${data.title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--fg-muted)]">{data.meta}</p>

      {data.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {data.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
            >
              <p className="text-xs text-[var(--fg-muted)]">{metric.label}</p>
              <p className={`text-sm font-semibold ${toneStyles[metric.tone || 'default']}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.tags.slice(0, 5).map((tag) => (
            <span
              key={`${data.id}-${tag}`}
              className="px-2 py-1 rounded-full bg-[var(--surface)] text-xs text-[var(--fg-muted)] capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WorkspaceCard;
