import React, { useMemo, useState } from 'react';
import { Cpu } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import type { ViewComponentProps } from '../types/navigation';

const SystemsMetrics: React.FC<ViewComponentProps> = () => {
  const { analyticsContext } = useMetricAnalytics();
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const automationMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'automation'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? automationMetrics[activeMetricId] ?? null : null;
  const systemsMetadata = CATEGORY_METADATA.automation;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <Cpu className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Automation systems metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Audit automation and AI systems with comprehensive insight into performance, reliability, and adoption.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Metric catalog</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Inspect adoption, reliability, and impact metrics for every automation in the workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCatalog.automation.map((definition) => {
            const metric = automationMetrics[definition.id];
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
        category="automation"
        metadata={systemsMetadata}
        metric={activeMetric}
        onClose={() => setActiveMetricId(null)}
      />
    </div>
  );
};

export default SystemsMetrics;
