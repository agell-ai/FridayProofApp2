import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { Card } from '../Shared/Card';
import type { CategoryMetric } from './dashboardTypes';

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  accent: string;
  metrics: CategoryMetric[];
  onClick?: () => void;
  active?: boolean;
}

const trendIconMap = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
} as const;

const trendColorMap = {
  up: 'text-emerald-500 dark:text-emerald-300',
  down: 'text-rose-500 dark:text-rose-300',
  neutral: 'text-[var(--fg-muted)]',
} as const;

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  icon: Icon,
  accent,
  metrics,
  onClick,
  active = false,
}) => {
  const primaryMetric = metrics[0];
  const secondaryMetrics = metrics.slice(1);

  const PrimaryTrendIcon = primaryMetric?.trend ? trendIconMap[primaryMetric.trend] : null;

  return (
    <Card
      glowOnHover
      activeGlow={active}
      onClick={onClick}
      className="p-5 flex flex-col gap-4 min-h-[220px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--fg-muted)]">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">
            {primaryMetric?.value ?? '—'}
          </p>
          {primaryMetric?.changeLabel && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                primaryMetric.trend ? trendColorMap[primaryMetric.trend] : 'text-[var(--fg-muted)]'
              }`}
            >
              {PrimaryTrendIcon && <PrimaryTrendIcon className="h-3.5 w-3.5" />}
              <span>{primaryMetric.changeLabel}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${accent} text-white shadow-inner shadow-black/10`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {secondaryMetrics.length > 0 && (
        <div className="space-y-3">
          {secondaryMetrics.map((metric) => {
            const SecondaryTrendIcon = metric.trend ? trendIconMap[metric.trend] : null;
            const percent = metric.progress !== undefined
              ? Math.max(0, Math.min(100, metric.progress))
              : undefined;

            return (
              <div key={metric.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-sm font-semibold text-[var(--fg)]">{metric.value}</span>
                </div>
                {percent !== undefined ? (
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-[var(--surface)]/70 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {metric.changeLabel && (
                      <div
                        className={`flex items-center gap-1 text-[10px] uppercase tracking-wide ${
                          metric.trend ? trendColorMap[metric.trend] : 'text-[var(--fg-muted)]'
                        }`}
                      >
                        {SecondaryTrendIcon && <SecondaryTrendIcon className="h-3 w-3" />}
                        <span>{metric.changeLabel}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  metric.changeLabel && (
                    <div
                      className={`flex items-center gap-1 text-[10px] uppercase tracking-wide ${
                        metric.trend ? trendColorMap[metric.trend] : 'text-[var(--fg-muted)]'
                      }`}
                    >
                      {SecondaryTrendIcon && <SecondaryTrendIcon className="h-3 w-3" />}
                      <span>{metric.changeLabel}</span>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
