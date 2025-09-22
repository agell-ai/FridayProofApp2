import React from 'react';
import { ChevronRight } from 'lucide-react';

import { Card } from '../../components/Shared/Card';
import type { MetricResult, MetricTone } from '../metrics';

const TONE_STYLES: Record<MetricTone, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  neutral: 'text-[var(--fg-muted)]',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-rose-600 dark:text-rose-400',
};

interface MetricCatalogCardProps {
  metric: MetricResult;
  onSelect?: () => void;
}

const MetricCatalogCard: React.FC<MetricCatalogCardProps> = ({ metric, onSelect }) => {
  const isInteractive = typeof onSelect === 'function';

  return (
    <Card
      glowOnHover={isInteractive}
      onClick={onSelect}
      className={`h-full p-5 ${
        isInteractive ? 'cursor-pointer transition-transform duration-300 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--fg)]">{metric.label}</h3>
            <p className="text-sm text-[var(--fg-muted)]">{metric.description}</p>
            {metric.tags && metric.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metric.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--fg-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-3xl font-semibold text-[var(--fg)]">{metric.value}</span>
            {metric.change && (
              <span className={`text-sm font-medium ${metric.changeTone ? TONE_STYLES[metric.changeTone] : ''}`}>
                {metric.change}
              </span>
            )}
            {metric.secondaryLabel && (
              <span className="text-xs text-[var(--fg-muted)]">{metric.secondaryLabel}</span>
            )}
          </div>
        </div>

        {metric.detail.stats.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {metric.detail.stats.slice(0, 3).map((stat) => (
              <div
                key={`${metric.id}-${stat.label}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
                <p
                  className={`mt-1 text-sm font-semibold ${stat.tone ? TONE_STYLES[stat.tone] : 'text-[var(--fg)]'}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {isInteractive && (
          <div className="flex items-center justify-end gap-2 text-sm font-medium text-[var(--accent-purple)]">
            <span>View details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCatalogCard;
