import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import type { ViewComponentProps } from '../types/navigation';

const TeamMetrics: React.FC<ViewComponentProps> = () => {
  const { analyticsContext } = useMetricAnalytics();
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const teamMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'team'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? teamMetrics[activeMetricId] ?? null : null;
  const teamMetadata = CATEGORY_METADATA.team;

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
