import React, { useMemo, useState } from 'react';
import { FolderOpen } from 'lucide-react';

import MetricCatalogCard from './components/MetricCatalogCard';
import { MetricDetailModal } from './Dashboard';
import {
  computeMetricsForCategory,
  metricCatalog,
  useMetricAnalytics,
} from './metrics';
import { CATEGORY_METADATA } from './dashboardCategories';
import type { ViewComponentProps } from '../types/navigation';

const ProjectsMetrics: React.FC<ViewComponentProps> = () => {
  const { analyticsContext } = useMetricAnalytics();
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const projectMetrics = useMemo(
    () => computeMetricsForCategory(analyticsContext, 'projects'),
    [analyticsContext],
  );

  const activeMetric = activeMetricId ? projectMetrics[activeMetricId] ?? null : null;

  const projectsMetadata = CATEGORY_METADATA.projects;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[var(--fg)]">
          <FolderOpen className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Project delivery metrics</h1>
        </div>
        <p className="text-sm text-[var(--fg-muted)]">
          Explore the complete catalog of project delivery metrics with detailed insights for every engagement.
        </p>
      </header>

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
