import React, { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import type { ViewComponentProps } from '../types/navigation';

const ClientsMetrics: React.FC<ViewComponentProps> = () => {
  const { analyticsContext } = useMetricAnalytics();
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const clientMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'clients'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? clientMetrics[activeMetricId] ?? null : null;
  const clientsMetadata = CATEGORY_METADATA.clients;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Client portfolio metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Dive into revenue, satisfaction, and lifecycle metrics for every client relationship.
        </p>
      </header>

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
