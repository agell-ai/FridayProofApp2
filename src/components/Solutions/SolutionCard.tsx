import React from 'react';
import { Activity, Layers, ShoppingBag, Sparkles, Pencil, BarChart3, FileText, Lock } from 'lucide-react';
import { Card } from '../Shared/Card';

type SolutionType = 'tool' | 'system' | 'template' | 'marketplace';

type MetricTone = 'default' | 'positive' | 'warning' | 'critical';

export interface SolutionMetric {
  label: string;
  value: string;
  tone?: MetricTone;
}

export interface SolutionRoiSummary {
  costSavings: string;
  hoursSaved: string;
  revenueGenerated: string;
  adoptionRate: string;
  efficiencyGain: string;
  lastUpdated?: string;
}

export interface SolutionCardData {
  id: string;
  type: SolutionType;
  title: string;
  description: string;
  status?: string;
  owner?: string;
  meta?: string;
  tags: string[];
  metrics: SolutionMetric[];
  roi?: SolutionRoiSummary;
  access?: SolutionAccessInfo;
}

export interface SolutionAccessInfo {
  mode: 'editable' | 'read-only';
  label: string;
  description?: string;
}

interface SolutionCardProps {
  data: SolutionCardData;
  onEdit?: (data: SolutionCardData) => void;
}

const typeConfig: Record<SolutionType, { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }> = {
  tool: {
    label: 'Tool',
    icon: Sparkles,
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  },
  system: {
    label: 'System',
    icon: Activity,
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20',
  },
  template: {
    label: 'Template',
    icon: FileText,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  },
  marketplace: {
    label: 'Marketplace',
    icon: ShoppingBag,
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
  },
};

const statusStyles: Record<string, string> = {
  active: 'border-emerald-200 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  development: 'border-indigo-200 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10',
  testing: 'border-purple-200 text-purple-600 dark:text-purple-300 bg-purple-500/10',
  inactive: 'border-slate-200 text-slate-600 dark:text-slate-300 bg-slate-500/10',
  retired: 'border-rose-200 text-rose-600 dark:text-rose-300 bg-rose-500/10',
};

const toneStyles: Record<MetricTone, string> = {
  default: 'text-[var(--fg)]',
  positive: 'text-emerald-600 dark:text-emerald-300',
  warning: 'text-amber-600 dark:text-amber-300',
  critical: 'text-rose-600 dark:text-rose-300',
};

const formatLabel = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const SolutionCard: React.FC<SolutionCardProps> = ({ data, onEdit }) => {
  const type = typeConfig[data.type];
  const StatusIcon = type.icon;
  const statusClass = data.status ? statusStyles[data.status] || 'border-[var(--border)] text-[var(--fg-muted)] bg-[var(--surface)]' : '';

  return (
    <Card glowOnHover className="p-6 h-full flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
            <StatusIcon className="w-5 h-5 text-[var(--fg)]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-[var(--fg)]">{data.title}</h3>
              <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${type.badgeClass}`}>
                {type.label}
              </span>
              {data.status && (
                <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusClass}`}>
                  {formatLabel(data.status)}
                </span>
              )}
            </div>
            {data.owner && <p className="text-sm text-[var(--fg-muted)]">{data.owner}</p>}
          </div>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(data)}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label={`Edit ${data.title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{data.description}</p>

      {data.meta && (
        <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
          <Layers className="w-4 h-4" />
          <span>{data.meta}</span>
        </div>
      )}

      {data.metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <p className="text-xs text-[var(--fg-muted)]">{metric.label}</p>
              <p className={`text-sm font-semibold ${toneStyles[metric.tone || 'default']}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {data.access?.mode === 'read-only' && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/70 p-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="rounded-full bg-[var(--surface)] p-1.5">
              <Lock className="h-4 w-4 text-[var(--fg-muted)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--fg)]">{data.access.label}</p>
              {data.access.description && (
                <p className="mt-1 text-xs text-[var(--fg-muted)]">{data.access.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {data.roi && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
            <BarChart3 className="w-4 h-4" />
            <span>ROI Snapshot</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--fg-muted)] text-xs">Cost Savings</p>
              <p className="font-semibold text-[var(--fg)]">{data.roi.costSavings}</p>
            </div>
            <div>
              <p className="text-[var(--fg-muted)] text-xs">Hours Saved</p>
              <p className="font-semibold text-[var(--fg)]">{data.roi.hoursSaved}</p>
            </div>
            <div>
              <p className="text-[var(--fg-muted)] text-xs">Revenue Impact</p>
              <p className="font-semibold text-[var(--fg)]">{data.roi.revenueGenerated}</p>
            </div>
            <div>
              <p className="text-[var(--fg-muted)] text-xs">Adoption & Efficiency</p>
              <p className="font-semibold text-[var(--fg)]">
                {data.roi.adoptionRate} · {data.roi.efficiencyGain}
              </p>
            </div>
          </div>
          {data.roi.lastUpdated && (
            <p className="text-[10px] text-[var(--fg-muted)]">Updated {data.roi.lastUpdated}</p>
          )}
        </div>
      )}

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-[var(--fg-muted)]">
          {data.tags.slice(0, 6).map((tag) => (
            <span key={`${data.id}-${tag}`} className="px-2 py-1 rounded-full bg-[var(--surface)] capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SolutionCard;
