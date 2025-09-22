import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, Pencil, PlusCircle, Search } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import SolutionCard, { SolutionCardData } from '../components/Solutions/SolutionCard';
import { EntityFormModal, ToolFormValues } from '../components/Shared/EntityFormModal';
import { Tool } from '../types/tools';
import { Button } from '../components/Shared/Button';
import { Card } from '../components/Shared/Card';
import RoiManagerModal from '../components/Solutions/RoiManagerModal';
import SystemFormModal, { SystemFormValues } from '../components/Solutions/SystemFormModal';
import TemplateFormModal, { TemplateFormValues } from '../components/Solutions/TemplateFormModal';
import MarketplaceFormModal, { MarketplaceFormValues } from '../components/Solutions/MarketplaceFormModal';
import { ROI_METRIC_CONFIG, ROI_METRIC_KEYS } from '../types/roi';
import type { ResourceOption, RoiMetricKey, RoiMetricRecord, RoiMetricUnit } from '../types/roi';
import type { Client, ClientLibraryItem, ClientTemplate, Project, System } from '../types';
import { isMarketplaceTemplateAsset, isTemplateAsset } from './solutionsFilters';

const hubViews = ['active', 'library', 'marketplace'] as const;

type HubView = (typeof hubViews)[number];

type ActiveStatusFilter = 'all' | 'active' | 'testing' | 'development';

type ToolFormState = {
  mode: 'create' | 'edit';
  tool?: Tool;
};

type SystemFormState = {
  mode: 'create' | 'edit';
  initialValues?: SystemFormValues;
};

type TemplateModalState = {
  mode: 'create' | 'edit';
  initialValues?: TemplateFormValues;
};

type MarketplaceModalState = {
  mode: 'create' | 'edit';
  initialValues?: MarketplaceFormValues;
};

const viewLabels: Record<HubView, string> = {
  active: 'Active',
  library: 'Library',
  marketplace: 'Marketplace',
};

type ActiveItemEntry = {
  card: SolutionCardData;
  meta:
    | { kind: 'tool'; tool: Tool }
    | { kind: 'system'; system: System; project: Project; client: Client | null };
};

type LibraryItemEntry = {
  card: SolutionCardData;
  meta: {
    kind: 'template';
    template: ClientTemplate;
    client: Client;
    description: string;
    isMarketplaceAsset: boolean;
    marketplaceItem?: ClientLibraryItem;
  };
};

type MarketplaceItemEntry = {
  card: SolutionCardData;
  meta: {
    kind: 'marketplace';
    item: ClientLibraryItem;
    client: Client;
    description: string;
    downloads: number;
    rating: number;
  };
};

const formatCurrency = (value: number) => {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value: number) => {
  if (!value) return '0';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatMetricValue = (unit: RoiMetricUnit, value: number) => {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'hours':
      return `${formatNumber(value)} hrs`;
    case 'percentage': {
      if (!Number.isFinite(value)) return '0%';
      const bounded = Math.max(0, Math.min(100, value));
      return Number.isInteger(bounded) ? `${bounded}%` : `${bounded.toFixed(1)}%`;
    }
    default:
      return formatNumber(value);
  }
};

const formatDeltaValue = (unit: RoiMetricUnit, delta: number) => {
  if (!delta) {
    return 'No change';
  }

  const sign = delta > 0 ? '+' : '-';
  const magnitude = Math.abs(delta);

  switch (unit) {
    case 'currency':
      return `${sign}${formatCurrency(magnitude)}`;
    case 'hours':
      return `${sign}${formatNumber(magnitude)} hrs`;
    case 'percentage': {
      const rounded = Math.round(magnitude * 10) / 10;
      const valueText = Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
      return `${sign}${valueText} pts`;
    }
    default:
      return `${sign}${formatNumber(magnitude)}`;
  }
};

const createMetricRange = (
  post: number,
  ratio = 0.6,
  { min = 0, max }: { min?: number; max?: number } = {},
) => {
  if (!Number.isFinite(post)) {
    return { pre: min, post: min };
  }

  const limitedPost = max !== undefined ? Math.min(Math.max(post, min), max) : Math.max(post, min);
  const baseline = limitedPost * ratio;
  const limitedPre = max !== undefined ? Math.min(Math.max(baseline, min), limitedPost) : Math.min(Math.max(baseline, min), limitedPost);

  const roundedPost = Math.round(limitedPost);
  const roundedPre = Math.round(limitedPre);

  if (roundedPre > roundedPost) {
    return { pre: roundedPost, post: roundedPost };
  }

  return { pre: roundedPre, post: roundedPost };
};

const createPercentageRange = (post: number, ratio = 0.6) =>
  createMetricRange(post, ratio, { min: 0, max: 100 });

const deterministicNumber = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1000;
  }
  const ratio = hash / 1000;
  return Math.round(min + ratio * (max - min));
};

const toTitleCase = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
};

const progressWidth = (value: number) => {
  const percent = clampPercent(value);
  if (percent <= 0) {
    return '0%';
  }
  return `${Math.max(percent, 6)}%`;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

type ActiveDetailViewProps = {
  entry: ActiveItemEntry;
  roiMetrics?: RoiMetricRecord;
  onBack: () => void;
  onEdit: () => void;
  onManageRoi: () => void;
  roiAvailable: boolean;
};

const ActiveDetailView: React.FC<ActiveDetailViewProps> = ({
  entry,
  roiMetrics,
  onBack,
  onEdit,
  onManageRoi,
  roiAvailable,
}) => {
  const isTool = entry.meta.kind === 'tool';
  const emptyMetricValue = { pre: 0, post: 0 } as const;

  const roiEntries = ROI_METRIC_KEYS.map((key) => {
    const metric = roiMetrics?.[key] ?? emptyMetricValue;
    const config = ROI_METRIC_CONFIG[key];
    const delta = metric.post - metric.pre;
    const tone: 'positive' | 'negative' | 'neutral' =
      delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';

    return {
      key,
      label: config.label,
      delta,
      tone,
      deltaText: formatDeltaValue(config.unit, delta),
      baselineText: `Baseline ${formatMetricValue(config.unit, metric.pre)} → Current ${formatMetricValue(
        config.unit,
        metric.post
      )}`,
    };
  });

  const roiLastUpdated = roiMetrics?.lastUpdated;

  const detailItems = isTool
    ? [
        { label: 'Project', value: entry.meta.tool.projectName || 'Unassigned' },
        { label: 'Client', value: entry.meta.tool.clientName || 'Internal' },
        { label: 'Category', value: toTitleCase(entry.meta.tool.category) },
        { label: 'Status', value: toTitleCase(entry.meta.tool.status) },
        { label: 'Created', value: formatDate(entry.meta.tool.createdAt) },
        { label: 'Last Updated', value: formatDate(entry.meta.tool.updatedAt) },
      ]
    : [
        { label: 'Project', value: entry.meta.project.name },
        { label: 'Client', value: entry.meta.client?.companyName || 'Internal' },
        { label: 'System Type', value: toTitleCase(entry.meta.system.type) },
        { label: 'Status', value: toTitleCase(entry.meta.system.status) },
        { label: 'Created', value: formatDate(entry.meta.system.createdAt) },
        { label: 'Last Updated', value: formatDate(entry.meta.project.updatedAt) },
      ];

  const performanceMetrics = isTool
    ? [
        {
          label: 'Usage',
          value: `${entry.meta.tool.stats.usage}%`,
          percent: entry.meta.tool.stats.usage,
        },
        {
          label: 'Efficiency',
          value: `${entry.meta.tool.stats.efficiency}%`,
          percent: entry.meta.tool.stats.efficiency,
        },
        {
          label: 'Uptime',
          value: `${entry.meta.tool.stats.uptime}%`,
          percent: entry.meta.tool.stats.uptime,
        },
        {
          label: 'Reliability',
          value: `${clampPercent(100 - entry.meta.tool.stats.errorRate)}%`,
          helper: `Error rate ${entry.meta.tool.stats.errorRate}%`,
          percent: 100 - entry.meta.tool.stats.errorRate,
        },
      ]
    : [];

  const totalComponents = !isTool ? entry.meta.system.components.length : 0;
  const activeComponents = !isTool
    ? entry.meta.system.components.filter((component) => component.status === 'active').length
    : 0;
  const connectionCount = !isTool ? entry.meta.system.connections.length : 0;
  const componentBreakdown = !isTool
    ? Object.entries(
        entry.meta.system.components.reduce<Record<string, number>>((accumulator, component) => {
          const key = component.type;
          accumulator[key] = (accumulator[key] || 0) + 1;
          return accumulator;
        }, {})
      )
        .map(([type, count]) => ({
          type,
          label: toTitleCase(type),
          count,
        }))
        .sort((a, b) => b.count - a.count)
    : [];

  const componentDensity = !isTool && totalComponents > 0
    ? Math.round((connectionCount / totalComponents) * 10) / 10
    : 0;

  const businessImpact = isTool
    ? entry.meta.tool.businessImpact
    : entry.meta.system.businessImpact;

  const renderProgress = (percent: number) => (
    <div className="h-2 rounded-full bg-[var(--surface)]">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)]"
        style={{ width: progressWidth(percent) }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to active overview
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <Pencil className="h-4 w-4" />
            Edit {isTool ? 'Tool' : 'System'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onManageRoi}
            disabled={!roiAvailable}
            className="gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <BarChart3 className="h-4 w-4" />
            Manage ROI
          </Button>
        </div>
      </div>

      <Card className="space-y-5 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--fg-muted)]">
              {isTool ? 'Tool' : 'System'}
            </span>
            {entry.card.status && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--fg)]">
                {toTitleCase(entry.card.status)}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-semibold text-[var(--fg)]">{entry.card.title}</h2>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{entry.card.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-3"
            >
              <p className="text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--fg)]">{item.value}</p>
            </div>
          ))}
        </div>

      </Card>

      <Card className="space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--fg)]">ROI Overview</h3>
            <p className="text-sm text-[var(--fg-muted)]">
              Baseline versus post-implementation impact across every metric.
            </p>
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            Last updated {roiLastUpdated ? formatDate(roiLastUpdated) : 'not yet recorded'}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {roiEntries.map((metric) => {
            const toneClass =
              metric.tone === 'positive'
                ? 'text-emerald-500 dark:text-emerald-400'
                : metric.tone === 'negative'
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-[var(--fg)]';

            return (
              <div
                key={metric.key}
                className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">
                    {metric.label}
                  </span>
                  <span className={`text-sm font-semibold ${toneClass}`}>{metric.deltaText}</span>
                </div>
                <p className="text-xs text-[var(--fg-muted)]">{metric.baselineText}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {isTool ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4 p-6">
            <h3 className="text-base font-semibold text-[var(--fg)]">Performance Signals</h3>
            <div className="space-y-3">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--fg-muted)]">{metric.label}</span>
                    <span className="font-semibold text-[var(--fg)]">{metric.value}</span>
                  </div>
                  {renderProgress(metric.percent)}
                  {metric.helper && (
                    <p className="text-[11px] text-[var(--fg-muted)]">{metric.helper}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="text-base font-semibold text-[var(--fg)]">Operational Context</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Total Runs</p>
                <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{formatNumber(entry.meta.tool.stats.totalRuns)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Avg Processing Time</p>
                <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{`${(entry.meta.tool.stats.processingTime / 1000).toFixed(1)}s`}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Team Contributors</p>
                <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{entry.meta.tool.teamMembers.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Uptime (rolling)</p>
                <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{`${entry.meta.tool.stats.uptime}%`}</p>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Business Notes</p>
              <p className="mt-2 text-sm text-[var(--fg)] leading-relaxed">
                {businessImpact || 'Document the business impact to capture measurable outcomes for stakeholders.'}
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-4 p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">System Footprint</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Components</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{formatNumber(totalComponents)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Active Components</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{formatNumber(activeComponents)}</p>
                  <div className="mt-2">{renderProgress((activeComponents / (totalComponents || 1)) * 100)}</div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Connections</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{formatNumber(connectionCount)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Integration Density</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{componentDensity.toFixed(1)}</p>
                  <p className="text-[11px] text-[var(--fg-muted)]">Connections per component</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">Component Mix</h3>
              <div className="space-y-3">
                {componentBreakdown.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--fg-muted)]">{item.label}</span>
                      <span className="font-semibold text-[var(--fg)]">{formatNumber(item.count)}</span>
                    </div>
                    {renderProgress((item.count / (totalComponents || 1)) * 100)}
                  </div>
                ))}
                {componentBreakdown.length === 0 && (
                  <p className="text-sm text-[var(--fg-muted)]">No components recorded yet.</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="space-y-3 p-6">
            <h3 className="text-base font-semibold text-[var(--fg)]">Business Notes</h3>
            <p className="text-sm text-[var(--fg)] leading-relaxed">
              {businessImpact || 'Document the business impact to inform delivery and ROI conversations.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

const Solutions: React.FC = () => {
  const { tools, isLoading: loadingTools, createTool, updateTool } = useTools();
  const { projects, updateProject } = useProjects();
  const { clients, updateClient } = useClients();
  const { teamMembers } = useTeam();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<HubView>('active');
  const [activeStatusFilter, setActiveStatusFilter] = useState<ActiveStatusFilter>('all');
  const [roiMetrics, setRoiMetrics] = useState<Record<string, RoiMetricRecord>>({});
  const [toolFormState, setToolFormState] = useState<ToolFormState | null>(null);
  const [systemFormState, setSystemFormState] = useState<SystemFormState | null>(null);
  const [templateFormState, setTemplateFormState] = useState<TemplateModalState | null>(null);
  const [marketplaceFormState, setMarketplaceFormState] = useState<MarketplaceModalState | null>(null);
  const [isRoiManagerOpen, setIsRoiManagerOpen] = useState(false);
  const [selectedActiveEntry, setSelectedActiveEntry] = useState<ActiveItemEntry | null>(null);
  const [roiManagerDefaultKey, setRoiManagerDefaultKey] = useState<string | null>(null);
  const [templateDescriptions, setTemplateDescriptions] = useState<Record<string, string>>({});
  const [marketplaceDescriptions, setMarketplaceDescriptions] = useState<Record<string, string>>({});
  const [marketplaceMetrics, setMarketplaceMetrics] = useState<Record<string, { downloads: number; rating: number }>>({});
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showCreateMenu) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCreateMenu]);

  useEffect(() => {
    if (activeView !== 'active') {
      setSelectedActiveEntry(null);
    }
  }, [activeView]);

  useEffect(() => {
    setTemplateDescriptions((prev) => {
      const next = { ...prev };
      clients.forEach((client) => {
        client.templates.filter(isTemplateAsset).forEach((template) => {
          const key = `${client.id}-${template.id}`;
          if (!next[key]) {
            next[key] = `${template.category} playbook maintained by ${client.companyName}.`;
          }
        });
      });
      return next;
    });
  }, [clients]);

  useEffect(() => {
    setMarketplaceDescriptions((prev) => {
      const next = { ...prev };
      clients.forEach((client) => {
        client.library.forEach((item) => {
          const key = `${client.id}-${item.id}`;
          if (!next[key]) {
            next[key] = `${item.type} contribution from ${client.companyName}.`;
          }
        });
      });
      return next;
    });

    setMarketplaceMetrics((prev) => {
      const next = { ...prev };
      clients.forEach((client) => {
        client.library.forEach((item) => {
          const key = `${client.id}-${item.id}`;
          if (!next[key]) {
            next[key] = {
              downloads: deterministicNumber(item.id, 120, 1400),
              rating: Number((deterministicNumber(`${item.id}-rating`, 40, 50) / 10).toFixed(1)),
            };
          }
        });
      });
      return next;
    });
  }, [clients]);

  useEffect(() => {
    if (activeView !== 'active') {
      setIsRoiManagerOpen(false);
    }
  }, [activeView]);

  const systems = useMemo(() => {
    return projects.flatMap((project) =>
      project.systems.map((system) => ({
        system,
        project,
        client: clients.find((client) => client.id === project.clientId) || null,
      }))
    );
  }, [projects, clients]);

  const libraryItems = useMemo(
    () =>
      clients.flatMap((client) =>
        client.templates.filter(isTemplateAsset).map((template) => {
          const key = `${client.id}-${template.id}`;
          const marketplaceItem = client.library.find((item) => item.templateId === template.id);
          return {
            id: key,
            templateId: template.id,
            clientId: client.id,
            clientName: client.companyName,
            name: template.name,
            description: templateDescriptions[key] || `${template.category} playbook maintained by ${client.companyName}.`,
            category: template.category,
            usage: template.usage,
            lastModified: template.lastModified,
            marketplaceItem,
          };
        })
      ),
    [clients, templateDescriptions]
  );

  const marketplaceItems = useMemo(
    () =>
      clients.flatMap((client) =>
        client.library.filter(isMarketplaceTemplateAsset).map((item) => {
          const key = `${client.id}-${item.id}`;
          const metrics = marketplaceMetrics[key] || { downloads: 0, rating: 0 };
          return {
            id: key,
            itemId: item.id,
            clientId: client.id,
            clientName: client.companyName,
            name: item.name,
            type: item.type,
            description: marketplaceDescriptions[key] || `${item.type} contribution from ${client.companyName}.`,
            category: item.category,
            downloads: metrics.downloads,
            rating: metrics.rating,
            createdAt: item.createdAt,
          };
        })
      ),
    [clients, marketplaceDescriptions, marketplaceMetrics]
  );

  useEffect(() => {
    setRoiMetrics((prev) => {
      const next = { ...prev };

      tools.forEach((tool) => {
        const key = `tool-${tool.id}`;
        if (!next[key]) {
          const costSavingsPost = tool.stats.costSavings;
          const revenuePost = Math.round(costSavingsPost * 1.5);
          const hoursPost = Math.max(40, Math.round(tool.stats.totalRuns / 50));
          const adoptionPost = tool.stats.usage;
          const efficiencyPost = tool.stats.efficiency;

          next[key] = {
            costSavings: createMetricRange(costSavingsPost, 0.55),
            revenueGenerated: createMetricRange(revenuePost, 0.5),
            hoursSaved: createMetricRange(hoursPost, 0.6),
            adoptionRate: createPercentageRange(adoptionPost, 0.65),
            efficiencyGain: createPercentageRange(efficiencyPost, 0.6),
            lastUpdated: tool.updatedAt,
          };
        }
      });

      systems.forEach(({ system, project }) => {
        const key = `system-${system.id}`;
        if (!next[key]) {
          const costSavingsPost = deterministicNumber(system.id, 15000, 60000);
          const hoursPost = deterministicNumber(`${system.id}-hours`, 200, 1400);
          const revenuePost = deterministicNumber(`${system.id}-revenue`, 25000, 120000);
          const adoptionPost = deterministicNumber(`${system.id}-adoption`, 60, 95);
          const efficiencyPost = deterministicNumber(`${system.id}-efficiency`, 55, 90);

          next[key] = {
            costSavings: createMetricRange(costSavingsPost, 0.55),
            hoursSaved: createMetricRange(hoursPost, 0.6),
            revenueGenerated: createMetricRange(revenuePost, 0.5),
            adoptionRate: createPercentageRange(adoptionPost, 0.6),
            efficiencyGain: createPercentageRange(efficiencyPost, 0.6),
            lastUpdated: project.updatedAt,
          };
        }
      });

      return next;
    });
  }, [tools, systems]);

  const resourceOptions: ResourceOption[] = useMemo(() => {
    const toolOptions = tools.map((tool) => ({
      key: `tool-${tool.id}`,
      label: `Tool • ${tool.name}`,
    }));
    const systemOptions = systems.map(({ system, project }) => ({
      key: `system-${system.id}`,
      label: `System • ${system.name} (${project.name})`,
    }));
    return [...toolOptions, ...systemOptions];
  }, [tools, systems]);

  const formatRoi = useCallback(
    (key: string): SolutionCardData['roi'] => {
      const metrics = roiMetrics[key];
      if (!metrics) return undefined;
      const getDelta = (metricKey: RoiMetricKey) => {
        const metric = metrics[metricKey];
        const config = ROI_METRIC_CONFIG[metricKey];
        return formatDeltaValue(config.unit, metric.post - metric.pre);
      };
      return {
        costSavings: getDelta('costSavings'),
        hoursSaved: getDelta('hoursSaved'),
        revenueGenerated: getDelta('revenueGenerated'),
        adoptionRate: getDelta('adoptionRate'),
        efficiencyGain: getDelta('efficiencyGain'),
        lastUpdated: (() => {
          if (!metrics.lastUpdated) return undefined;
          const formatted = formatDate(metrics.lastUpdated);
          return formatted === '—' ? undefined : formatted;
        })(),
      };
    },
    [roiMetrics]
  );

  const getActiveEntryKey = (entry: ActiveItemEntry) =>
    entry.meta.kind === 'tool'
      ? `tool-${entry.meta.tool.id}`
      : `system-${entry.meta.system.id}`;

  const handleEditActiveEntry = (entry: ActiveItemEntry) => {
    if (entry.meta.kind === 'tool') {
      setToolFormState({ mode: 'edit', tool: entry.meta.tool });
      return;
    }

    setSystemFormState({
      mode: 'edit',
      initialValues: {
        systemId: entry.meta.system.id,
        projectId: entry.meta.project.id,
        name: entry.meta.system.name,
        description: entry.meta.system.description,
        status: entry.meta.system.status,
        type: entry.meta.system.type,
        businessImpact: entry.meta.system.businessImpact,
      },
    });
  };

  const handleSelectActiveEntry = (entry: ActiveItemEntry) => {
    setSelectedActiveEntry(entry);
    setShowCreateMenu(false);
  };

  const handleOpenRoiManagerForEntry = (entry: ActiveItemEntry) => {
    setRoiManagerDefaultKey(getActiveEntryKey(entry));
    setIsRoiManagerOpen(true);
  };

  const handleBackToActiveList = () => {
    setSelectedActiveEntry(null);
  };

  const activeItems = useMemo<ActiveItemEntry[]>(() => {
    const entries: ActiveItemEntry[] = [];

    tools.forEach((tool) => {
      entries.push({
        card: {
          id: tool.id,
          type: 'tool',
          title: tool.name,
          description: tool.description,
          status: tool.status,
          owner: tool.clientName ? `Client • ${tool.clientName}` : 'Internal',
          tags: [],
          metrics: [],
          roi: formatRoi(`tool-${tool.id}`),
        },
        meta: { kind: 'tool', tool },
      });
    });

    systems.forEach(({ system, project, client }) => {
      entries.push({
        card: {
          id: system.id,
          type: 'system',
          title: system.name,
          description: system.description,
          status: system.status,
          owner: client ? `Client • ${client.companyName}` : 'Internal',
          tags: [],
          metrics: [],
          roi: formatRoi(`system-${system.id}`),
        },
        meta: { kind: 'system', system, project, client },
      });
    });

    return entries;
  }, [tools, systems, formatRoi]);

  const libraryEntries = useMemo<LibraryItemEntry[]>(
    () =>
      libraryItems
        .map((item) => {
          const client = clients.find((candidate) => candidate.id === item.clientId);
          const template = client?.templates.find((candidate) => candidate.id === item.templateId);

          if (!client || !isTemplateAsset(template)) {
            return null;
          }

          const isMarketplaceAsset = Boolean(item.marketplaceItem);
          const marketplaceMeta =
            item.marketplaceItem?.createdAt
              ? `Marketplace asset • ${new Date(item.marketplaceItem.createdAt).toLocaleDateString()}`
              : 'Marketplace asset';

          return {
            card: {
              id: item.id,
              type: 'template',
              title: item.name,
              description: item.description,
              owner: `Client • ${client.companyName}`,
              meta: isMarketplaceAsset
                ? marketplaceMeta
                : `Last modified • ${new Date(item.lastModified).toLocaleDateString()}`,
              tags: [item.category.toLowerCase()],
              metrics: [
                { label: 'Usage', value: `${item.usage} launches`, tone: 'positive' },
              ],
              badges: isMarketplaceAsset ? ['marketplace'] : undefined,
            },
            meta: {
              kind: 'template',
              template,
              client,
              description: item.description,
              isMarketplaceAsset,
              marketplaceItem: item.marketplaceItem,
            },
          } satisfies LibraryItemEntry;
        })
        .filter((entry): entry is LibraryItemEntry => Boolean(entry)),
    [clients, libraryItems]
  );

  const marketplaceEntries = useMemo<MarketplaceItemEntry[]>(
    () =>
      marketplaceItems
        .map((item) => {
          const client = clients.find((candidate) => candidate.id === item.clientId);
          const libraryItem = client?.library.find((candidate) => candidate.id === item.itemId);

          if (!client || !isMarketplaceTemplateAsset(libraryItem)) {
            return null;
          }

          return {
            card: {
              id: item.id,
              type: 'marketplace',
              title: item.name,
              description: item.description,
              owner: `Publisher • ${client.companyName}`,
              meta: `Published • ${new Date(item.createdAt).toLocaleDateString()}`,
              tags: [item.category.toLowerCase()],
              metrics: [
                { label: 'Downloads', value: formatNumber(item.downloads), tone: 'positive' },
                { label: 'Rating', value: `${item.rating.toFixed(1)}/5`, tone: 'positive' },
              ],
              badges: ['template'],
            },
            meta: {
              kind: 'marketplace',
              item: libraryItem,
              client,
              description: item.description,
              downloads: item.downloads,
              rating: item.rating,
            },
          } satisfies MarketplaceItemEntry;
        })
        .filter((entry): entry is MarketplaceItemEntry => Boolean(entry)),
    [clients, marketplaceItems]
  );

  const filteredActiveItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return activeItems.filter(({ card }) => {
      if (activeStatusFilter !== 'all' && card.status !== activeStatusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        card.title,
        card.description,
        card.owner,
        card.meta,
        ...(card.tags || []),
        ...card.metrics.map((metric) => metric.label),
        ...card.metrics.map((metric) => metric.value),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchable.some((value) => value.includes(normalizedSearch));
    });
  }, [activeItems, activeStatusFilter, searchTerm]);

  useEffect(() => {
    if (!selectedActiveEntry) {
      return;
    }

    const exists = filteredActiveItems.some((entry) => entry.card.id === selectedActiveEntry.card.id);
    if (!exists) {
      setSelectedActiveEntry(null);
    }
  }, [filteredActiveItems, selectedActiveEntry]);

  const filteredLibraryEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return libraryEntries.filter(({ card }) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        card.title,
        card.description,
        card.owner,
        card.meta,
        ...(card.tags || []),
        ...card.metrics.map((metric) => metric.label),
        ...card.metrics.map((metric) => metric.value),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchable.some((value) => value.includes(normalizedSearch));
    });
  }, [libraryEntries, searchTerm]);

  const filteredMarketplaceEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return marketplaceEntries.filter(({ card }) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        card.title,
        card.description,
        card.owner,
        card.meta,
        ...(card.tags || []),
        ...card.metrics.map((metric) => metric.label),
        ...card.metrics.map((metric) => metric.value),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchable.some((value) => value.includes(normalizedSearch));
    });
  }, [marketplaceEntries, searchTerm]);

  const libraryViewEntries = useMemo(
    () => filteredLibraryEntries.filter((entry) => entry.card.type === 'template'),
    [filteredLibraryEntries],
  );

  const marketplaceViewEntries = useMemo(
    () => filteredMarketplaceEntries.filter((entry) => entry.card.type === 'marketplace'),
    [filteredMarketplaceEntries],
  );

  const activeSummary = useMemo(
    () => [
      { label: 'Total', value: activeItems.length, filter: 'all' as ActiveStatusFilter },
      {
        label: 'Deployed',
        value: activeItems.filter(({ card }) => card.status === 'active').length,
        filter: 'active' as ActiveStatusFilter,
      },
      {
        label: 'Testing',
        value: activeItems.filter(({ card }) => card.status === 'testing').length,
        filter: 'testing' as ActiveStatusFilter,
      },
      {
        label: 'Development',
        value: activeItems.filter(({ card }) => card.status === 'development').length,
        filter: 'development' as ActiveStatusFilter,
      },
    ],
    [activeItems]
  );

  const handleManualRoiUpdate = useCallback(
    (key: string, metrics: RoiMetricRecord) => {
      if (!key) return;

      setRoiMetrics((prev) => ({
        ...prev,
        [key]: metrics,
      }));

      if (key.startsWith('tool-')) {
        const toolId = key.replace('tool-', '');
        updateTool(toolId, {
          stats: {
            costSavings: metrics.costSavings.post,
            usage: metrics.adoptionRate.post,
            efficiency: metrics.efficiencyGain.post,
          },
        });
      }
    },
    [updateTool],
  );

  const handleBulkRoiImport = useCallback(
    (updates: Array<{ key: string; metrics: RoiMetricRecord }>) => {
      if (!updates.length) return;

      setRoiMetrics((prev) => {
        const next = { ...prev };
        updates.forEach(({ key, metrics }) => {
          next[key] = metrics;
        });
        return next;
      });

      updates.forEach(({ key, metrics }) => {
        if (key.startsWith('tool-')) {
          const toolId = key.replace('tool-', '');
          updateTool(toolId, {
            stats: {
              costSavings: metrics.costSavings.post,
              usage: metrics.adoptionRate.post,
              efficiency: metrics.efficiencyGain.post,
            },
          });
        }
      });
    },
    [updateTool],
  );

  const handleToolSubmit = (values: ToolFormValues) => {
    if (!toolFormState) return;

    if (toolFormState.mode === 'create') {
      createTool({
        name: values.name,
        description: values.description,
        category: values.category,
        status: values.status,
        clientId: values.clientId,
        projectId: values.projectId,
        clientName: clients.find((client) => client.id === values.clientId)?.companyName,
        projectName: projects.find((project) => project.id === values.projectId)?.name,
        teamMembers: values.teamMembers,
        businessImpact: values.businessImpact,
        stats: values.stats,
      });
    } else if (toolFormState.tool) {
      updateTool(toolFormState.tool.id, {
        name: values.name,
        description: values.description,
        category: values.category,
        status: values.status,
        clientId: values.clientId,
        projectId: values.projectId,
        clientName: clients.find((client) => client.id === values.clientId)?.companyName,
        projectName: projects.find((project) => project.id === values.projectId)?.name,
        teamMembers: values.teamMembers,
        businessImpact: values.businessImpact,
        stats: values.stats,
      });
    }

    setToolFormState(null);
  };
  const handleSystemSubmit = (values: SystemFormValues) => {
    const { systemId, projectId, name, description, status, type, businessImpact } = values;
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      setSystemFormState(null);
      return;
    }

    if (systemFormState?.mode === 'create') {
      const newSystem: System = {
        id: systemId || `system-${Date.now()}`,
        name,
        description,
        status,
        type,
        businessImpact,
        components: [],
        connections: [],
        projectId,
        createdAt: new Date().toISOString(),
      };
      updateProject(projectId, { systems: [...project.systems, newSystem] });
    } else if (systemFormState?.mode === 'edit' && systemId) {
      const updatedSystems = project.systems.map((system) =>
        system.id === systemId
          ? {
              ...system,
              name,
              description,
              status,
              type,
              businessImpact,
            }
          : system
      );
      updateProject(projectId, { systems: updatedSystems });
    }

    setSystemFormState(null);
  };

  const handleTemplateSubmit = (values: TemplateFormValues) => {
    const { templateId, clientId, name, category, usage, description } = values;
    const client = clients.find((candidate) => candidate.id === clientId);

    if (!client) {
      setTemplateFormState(null);
      return;
    }

    const descriptionValue = description || `${category} playbook maintained by ${client.companyName}.`;

    if (templateFormState?.mode === 'create') {
      const newTemplateId = templateId || `template-${Date.now()}`;
      const newTemplate: ClientTemplate = {
        id: newTemplateId,
        name,
        category,
        usage,
        lastModified: new Date().toISOString(),
        isTemplate: true,
      };
      updateClient(clientId, { templates: [...client.templates, newTemplate] });
      setTemplateDescriptions((prev) => ({
        ...prev,
        [`${clientId}-${newTemplateId}`]: descriptionValue,
      }));
    } else if (templateFormState?.mode === 'edit' && templateId) {
      const updatedTemplates = client.templates.map((template) =>
        template.id === templateId
          ? { ...template, name, category, usage, lastModified: new Date().toISOString() }
          : template
      );
      updateClient(clientId, { templates: updatedTemplates });
      setTemplateDescriptions((prev) => ({
        ...prev,
        [`${clientId}-${templateId}`]: descriptionValue,
      }));
    }

    setTemplateFormState(null);
  };

  const handleMarketplaceSubmit = (values: MarketplaceFormValues) => {
    const { itemId, clientId, name, type, category, description, downloads = 0, rating = 0, templateId } = values;
    const client = clients.find((candidate) => candidate.id === clientId);

    if (!client) {
      setMarketplaceFormState(null);
      return;
    }

    const descriptionValue = description || `${type} contribution from ${client.companyName}.`;

    if (marketplaceFormState?.mode === 'create') {
      const newItemId = itemId || `market-${Date.now()}`;
      const newItem: ClientLibraryItem = {
        id: newItemId,
        name,
        type,
        category,
        createdAt: new Date().toISOString(),
        ...(templateId ? { templateId } : {}),
      };
      updateClient(clientId, { library: [...client.library, newItem] });
      setMarketplaceDescriptions((prev) => ({
        ...prev,
        [`${clientId}-${newItemId}`]: descriptionValue,
      }));
      setMarketplaceMetrics((prev) => ({
        ...prev,
        [`${clientId}-${newItemId}`]: { downloads, rating },
      }));
    } else if (marketplaceFormState?.mode === 'edit' && itemId) {
      const updatedLibrary = client.library.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name,
              type,
              category,
              ...(templateId !== undefined ? { templateId } : {}),
            }
          : item
      );
      updateClient(clientId, { library: updatedLibrary });
      setMarketplaceDescriptions((prev) => ({
        ...prev,
        [`${clientId}-${itemId}`]: descriptionValue,
      }));
      setMarketplaceMetrics((prev) => ({
        ...prev,
        [`${clientId}-${itemId}`]: { downloads, rating },
      }));
    }

    setMarketplaceFormState(null);
  };

  const handleViewSelect = (view: HubView) => {
    setActiveView(view);
    setShowCreateMenu(false);
    if (view !== 'active') {
      setActiveStatusFilter('all');
    }
  };

  const handleCreateTool = () => {
    setShowCreateMenu(false);
    setToolFormState({ mode: 'create' });
  };

  const handleCreateSystem = () => {
    setShowCreateMenu(false);
    setSystemFormState({ mode: 'create' });
  };

  const handleCreateClick = () => {
    if (activeView === 'active') {
      setShowCreateMenu((prev) => !prev);
      return;
    }

    if (activeView === 'library') {
      setTemplateFormState({ mode: 'create' });
    } else {
      setMarketplaceFormState({ mode: 'create' });
    }
  };

  const handleCreateTemplateFromActive = (entry: ActiveItemEntry) => {
    if (entry.meta.kind === 'tool') {
      const tool = entry.meta.tool;
      const description = tool.businessImpact
        ? tool.businessImpact
        : `Template generated from ${tool.name}.`;
      if (!tool.clientId && !clients[0]) {
        return;
      }
      setTemplateFormState({
        mode: 'create',
        initialValues: {
          clientId: tool.clientId || clients[0]?.id || '',
          name: `${tool.name} Template`,
          category: tool.category,
          usage: 0,
          description,
        },
      });
    } else {
      const { system, client } = entry.meta;
      const description = system.businessImpact
        ? system.businessImpact
        : `System blueprint derived from ${system.name}.`;
      const defaultClientId = client?.id || clients[0]?.id || '';
      if (!defaultClientId) {
        return;
      }
      setTemplateFormState({
        mode: 'create',
        initialValues: {
          clientId: defaultClientId,
          name: `${system.name} Template`,
          category: system.type,
          usage: 0,
          description,
        },
      });
    }
  };

  const handleUseTemplate = (entry: LibraryItemEntry) => {
    const client = clients.find((candidate) => candidate.id === entry.meta.client.id);

    if (!client) {
      return;
    }

    const updatedTemplates = client.templates.map((template) => {
      if (template.id !== entry.meta.template.id) {
        return template;
      }

      const currentUsage = Number.isFinite(template.usage) ? template.usage : 0;

      return {
        ...template,
        usage: currentUsage + 1,
      };
    });

    updateClient(client.id, { templates: updatedTemplates });
  };

  const handleListTemplateInMarketplace = (entry: LibraryItemEntry) => {
    if (!clients.length) {
      return;
    }
    setMarketplaceFormState({
      mode: 'create',
      initialValues: {
        clientId: entry.meta.client.id,
        name: entry.meta.template.name,
        type: 'template',
        category: entry.meta.template.category,
        description: `Marketplace listing for ${entry.meta.template.name}.`,
        templateId: entry.meta.template.id,
      },
    });
  };

  const isActiveView = activeView === 'active';
  const isLibraryView = activeView === 'library';
  const selectedResourceKey = selectedActiveEntry ? getActiveEntryKey(selectedActiveEntry) : null;
  const isSelectedResourceAvailable = selectedResourceKey
    ? resourceOptions.some((option) => option.key === selectedResourceKey)
    : false;
  const hasResults = isActiveView
    ? filteredActiveItems.length > 0
    : isLibraryView
      ? libraryViewEntries.length > 0
      : marketplaceViewEntries.length > 0;

  const emptyStateMessage = isActiveView
    ? 'No systems or tools found'
    : isLibraryView
      ? 'No templates in your library yet'
      : 'No marketplace listings yet';

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Solutions Hub</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Manage live systems, reusable templates, and marketplace listings from a single control center.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="Search systems, templates, or marketplace listings"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {hubViews.map((view) => {
                const isSelected = activeView === view;
                return (
                  <Button
                    key={view}
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSelect(view)}
                    className={`min-w-[120px] ${
                      isSelected
                        ? 'border-[var(--accent-purple)] bg-[var(--surface)] text-[var(--fg)] shadow-sm'
                        : 'border-[var(--border)]/80 text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {viewLabels[view]}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div ref={isActiveView ? createMenuRef : undefined} className="relative">
                <Button variant="primary" size="sm" glowOnHover onClick={handleCreateClick} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create
                </Button>
                {isActiveView && showCreateMenu && (
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-[var(--fg)] hover:bg-[var(--surface)]"
                      onClick={handleCreateTool}
                    >
                      New Tool
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-[var(--fg)] hover:bg-[var(--surface)]"
                      onClick={handleCreateSystem}
                    >
                      New System
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isActiveView && !selectedActiveEntry && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeSummary.map((stat) => {
              const isSelected = activeStatusFilter === stat.filter;
              return (
                <Card
                  key={stat.label}
                  glowOnHover
                  activeGlow={isSelected}
                  glowStyle="outline"
                  onClick={() => setActiveStatusFilter(stat.filter)}
                  className={`p-4 ${isSelected ? 'border-[var(--accent-purple)] bg-[var(--surface)]' : ''}`}
                >
                  <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--fg)]">{stat.value}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {loadingTools && isActiveView ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent-orange)] border-t-transparent"></div>
        </div>
      ) : !hasResults ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">{emptyStateMessage}</p>
          <p className="mt-2 text-sm">Try refining your filters or search keywords.</p>
        </div>
      ) : (
        <>
          {isActiveView ? (
            selectedActiveEntry ? (
              <ActiveDetailView
                entry={selectedActiveEntry}
                roiMetrics={selectedResourceKey ? roiMetrics[selectedResourceKey] : undefined}
                onBack={handleBackToActiveList}
                onEdit={() => handleEditActiveEntry(selectedActiveEntry)}
                onManageRoi={() => handleOpenRoiManagerForEntry(selectedActiveEntry)}
                roiAvailable={isSelectedResourceAvailable}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredActiveItems.map((entry) => (
                  <SolutionCard
                    key={`active-${entry.card.id}`}
                    data={entry.card}
                    onSelect={() => handleSelectActiveEntry(entry)}
                    onEdit={() => handleEditActiveEntry(entry)}
                    showTags={false}
                    onCreateTemplate={() => handleCreateTemplateFromActive(entry)}
                  />
                ))}
              </div>
            )
          ) : isLibraryView ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {libraryViewEntries.map((entry) => (
                <SolutionCard
                  key={`library-${entry.card.id}`}
                  data={entry.card}
                  onEdit={() =>
                    setTemplateFormState({
                      mode: 'edit',
                      initialValues: {
                        templateId: entry.meta.template.id,
                        clientId: entry.meta.client.id,
                        name: entry.meta.template.name,
                        category: entry.meta.template.category,
                        usage: entry.meta.template.usage,
                        description: entry.meta.description,
                      },
                    })
                  }
                  onCreateTemplate={() => handleUseTemplate(entry)}
                  createTemplateLabel="Use Template"
                  onListInMarketplace={
                    entry.meta.isMarketplaceAsset ? undefined : () => handleListTemplateInMarketplace(entry)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {marketplaceViewEntries.map((entry) => (
                <SolutionCard
                  key={`market-${entry.card.id}`}
                  data={entry.card}
                  onEdit={() =>
                    setMarketplaceFormState({
                      mode: 'edit',
                      initialValues: {
                        itemId: entry.meta.item.id,
                        clientId: entry.meta.client.id,
                        name: entry.meta.item.name,
                        type: entry.meta.item.type,
                        category: entry.meta.item.category,
                        description: entry.meta.description,
                        downloads: entry.meta.downloads,
                        rating: entry.meta.rating,
                        templateId: entry.meta.item.templateId,
                      },
                    })
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <EntityFormModal
        isOpen={Boolean(toolFormState)}
        type="tool"
        mode={toolFormState?.mode || 'create'}
        initialData={toolFormState?.tool}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setToolFormState(null)}
        onSubmit={handleToolSubmit}
      />

      <SystemFormModal
        isOpen={Boolean(systemFormState)}
        mode={systemFormState?.mode || 'create'}
        projects={projects}
        initialValues={systemFormState?.initialValues}
        onClose={() => setSystemFormState(null)}
        onSubmit={handleSystemSubmit}
      />

      <TemplateFormModal
        isOpen={Boolean(templateFormState)}
        mode={templateFormState?.mode || 'create'}
        clients={clients}
        initialValues={templateFormState?.initialValues}
        onClose={() => setTemplateFormState(null)}
        onSubmit={handleTemplateSubmit}
      />

      <MarketplaceFormModal
        isOpen={Boolean(marketplaceFormState)}
        mode={marketplaceFormState?.mode || 'create'}
        clients={clients}
        initialValues={marketplaceFormState?.initialValues}
        onClose={() => setMarketplaceFormState(null)}
        onSubmit={handleMarketplaceSubmit}
      />

      <RoiManagerModal
        isOpen={isRoiManagerOpen}
        onClose={() => {
          setIsRoiManagerOpen(false);
          setRoiManagerDefaultKey(null);
        }}
        resourceOptions={resourceOptions}
        metricsMap={roiMetrics}
        onManualUpdate={handleManualRoiUpdate}
        onBulkImport={handleBulkRoiImport}
        defaultKey={roiManagerDefaultKey || undefined}
      />
    </div>
  );
};

export default Solutions;
