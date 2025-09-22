import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Filter, PlusCircle, Search } from 'lucide-react';
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
import type { ResourceOption, RoiMetricRecord } from '../types/roi';

const solutionTypes = ['tool', 'system', 'template', 'marketplace'] as const;

type SolutionType = (typeof solutionTypes)[number];

type ToolFormState = {
  mode: 'create' | 'edit';
  tool?: Tool;
};

const typeLabels: Record<SolutionType, string> = {
  tool: 'Tools',
  system: 'Systems',
  template: 'Templates',
  marketplace: 'Marketplace',
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

const deterministicNumber = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1000;
  }
  const ratio = hash / 1000;
  return Math.round(min + ratio * (max - min));
};

const Solutions: React.FC = () => {
  const { tools, isLoading: loadingTools, createTool, updateTool } = useTools();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { teamMembers } = useTeam();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypes, setActiveTypes] = useState<SolutionType[]>([...solutionTypes]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roiMetrics, setRoiMetrics] = useState<Record<string, RoiMetricRecord>>({});
  const [toolFormState, setToolFormState] = useState<ToolFormState | null>(null);
  const [isRoiManagerOpen, setIsRoiManagerOpen] = useState(false);

  const systems = useMemo(() => {
    return projects.flatMap((project) =>
      project.systems.map((system) => ({
        system,
        project,
        client: clients.find((client) => client.id === project.clientId) || null,
      }))
    );
  }, [projects, clients]);

  const templates = useMemo(() => (
    clients.flatMap((client) =>
      client.templates.map((template) => ({
        id: `${client.id}-${template.id}`,
        name: template.name,
        description: `${template.category} playbook maintained by ${client.companyName}.`,
        category: template.category,
        usage: template.usage,
        owner: client.companyName,
        lastModified: template.lastModified,
      }))
    )
  ), [clients]);

  const marketplaceItems = useMemo(() => (
    clients.flatMap((client) =>
      client.library.map((item) => ({
        id: `${client.id}-${item.id}`,
        name: item.name,
        description: `${item.type} contribution from ${client.companyName}.`,
        category: item.category,
        owner: client.companyName,
        downloads: deterministicNumber(item.id, 120, 1400),
        rating: (deterministicNumber(`${item.id}-rating`, 40, 50) / 10).toFixed(1),
        createdAt: item.createdAt,
      }))
    )
  ), [clients]);

  useEffect(() => {
    setRoiMetrics((prev) => {
      const next = { ...prev };

      tools.forEach((tool) => {
        const key = `tool-${tool.id}`;
        if (!next[key]) {
          next[key] = {
            costSavings: tool.stats.costSavings,
            hoursSaved: Math.max(40, Math.round(tool.stats.totalRuns / 50)),
            revenueGenerated: Math.round(tool.stats.costSavings * 1.5),
            adoptionRate: tool.stats.usage,
            efficiencyGain: tool.stats.efficiency,
            lastUpdated: tool.updatedAt,
          };
        }
      });

      systems.forEach(({ system, project }) => {
        const key = `system-${system.id}`;
        if (!next[key]) {
          next[key] = {
            costSavings: deterministicNumber(system.id, 15000, 60000),
            hoursSaved: deterministicNumber(`${system.id}-hours`, 200, 1400),
            revenueGenerated: deterministicNumber(`${system.id}-revenue`, 25000, 120000),
            adoptionRate: deterministicNumber(`${system.id}-adoption`, 60, 95),
            efficiencyGain: deterministicNumber(`${system.id}-efficiency`, 55, 90),
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
      return {
        costSavings: formatCurrency(metrics.costSavings),
        hoursSaved: `${formatNumber(metrics.hoursSaved)} hrs`,
        revenueGenerated: formatCurrency(metrics.revenueGenerated),
        adoptionRate: `${metrics.adoptionRate}%`,
        efficiencyGain: `${metrics.efficiencyGain}%`,
        lastUpdated: new Date(metrics.lastUpdated).toLocaleDateString(),
      };
    },
    [roiMetrics]
  );

  const solutionItems: SolutionCardData[] = useMemo(() => {
    const items: SolutionCardData[] = [];

    tools.forEach((tool) => {
      items.push({
        id: tool.id,
        type: 'tool',
        title: tool.name,
        description: tool.description,
        status: tool.status,
        owner: tool.clientName ? `Client • ${tool.clientName}` : undefined,
        meta: `Project • ${tool.projectName}`,
        tags: [tool.category.toLowerCase(), tool.projectName, tool.clientName].filter(Boolean) as string[],
        metrics: [
          { label: 'Usage', value: `${tool.stats.usage}%`, tone: 'positive' },
          { label: 'Efficiency', value: `${tool.stats.efficiency}%`, tone: 'positive' },
        ],
        roi: formatRoi(`tool-${tool.id}`),
      });
    });

    systems.forEach(({ system, project, client }) => {
      items.push({
        id: system.id,
        type: 'system',
        title: system.name,
        description: system.description,
        status: system.status,
        owner: client ? `Client • ${client.companyName}` : 'Internal',
        meta: `Project • ${project.name}`,
        tags: [system.type, system.status, project.name],
        metrics: [
          { label: 'Components', value: String(system.components.length) },
          { label: 'Connections', value: String(system.connections.length) },
        ],
        roi: formatRoi(`system-${system.id}`),
        access: {
          mode: 'read-only',
          label: 'Managed in Projects workspace',
          description: `Update ${system.name} within the ${project.name} project.`,
        },
      });
    });

    templates.forEach((template) => {
      items.push({
        id: template.id,
        type: 'template',
        title: template.name,
        description: template.description,
        owner: template.owner,
        meta: `Last modified • ${new Date(template.lastModified).toLocaleDateString()}`,
        tags: [template.category.toLowerCase()],
        metrics: [
          { label: 'Usage', value: `${template.usage} launches`, tone: 'positive' },
        ],
        access: {
          mode: 'read-only',
          label: `${template.owner} managed template`,
          description: 'Templates sync automatically from the client workspace.',
        },
      });
    });

    marketplaceItems.forEach((item) => {
      items.push({
        id: item.id,
        type: 'marketplace',
        title: item.name,
        description: item.description,
        owner: item.owner,
        meta: `Published • ${new Date(item.createdAt).toLocaleDateString()}`,
        tags: [item.category.toLowerCase()],
        metrics: [
          { label: 'Downloads', value: formatNumber(item.downloads), tone: 'positive' },
          { label: 'Rating', value: `${item.rating}/5`, tone: 'positive' },
        ],
        access: {
          mode: 'read-only',
          label: 'Curated marketplace asset',
          description: `Request updates through ${item.owner}.`,
        },
      });
    });

    return items;
  }, [tools, systems, templates, marketplaceItems, formatRoi]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    solutionItems.forEach((item) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses);
  }, [solutionItems]);

  const filteredSolutions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return solutionItems.filter((item) => {
      if (!activeTypes.includes(item.type as SolutionType)) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      if (!normalizedSearch) return true;

      const searchable = [
        item.title,
        item.description,
        item.owner,
        item.meta,
        ...(item.tags || []),
        ...item.metrics.map((metric) => metric.label),
        ...item.metrics.map((metric) => metric.value),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchable.some((value) => value.includes(normalizedSearch));
    });
  }, [solutionItems, activeTypes, statusFilter, searchTerm]);

  const summaryStats = useMemo(() => [
    { label: 'Tools', value: tools.length },
    { label: 'Systems', value: systems.length },
    { label: 'Templates', value: templates.length },
    { label: 'Marketplace Assets', value: marketplaceItems.length },
  ], [tools.length, systems.length, templates.length, marketplaceItems.length]);

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
            costSavings: metrics.costSavings,
            usage: metrics.adoptionRate,
            efficiency: metrics.efficiencyGain,
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
              costSavings: metrics.costSavings,
              usage: metrics.adoptionRate,
              efficiency: metrics.efficiencyGain,
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

  const toggleType = (type: SolutionType) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Automation & Intelligence Hub</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Explore every agent, workflow, template, and marketplace asset from a single searchable catalog.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="Search by tool, system, template, or owner"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {solutionTypes.map((type) => {
                const isActive = activeTypes.includes(type);
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleType(type)}
                    className={`min-w-[140px] ${
                      isActive
                        ? 'border-[var(--accent-purple)] bg-[var(--surface)] text-[var(--fg)] shadow-sm'
                        : 'border-[var(--border)]/80 text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {typeLabels[type]}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <select
                  className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRoiManagerOpen(true)}
                disabled={resourceOptions.length === 0}
                className="gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                <BarChart3 className="h-4 w-4" />
                Manage ROI
              </Button>

              <Button
                variant="primary"
                size="sm"
                glowOnHover
                onClick={() => setToolFormState({ mode: 'create' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tool
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat) => (
            <Card key={stat.label} glowOnHover className="p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--fg)]">{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {loadingTools ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent-orange)] border-t-transparent"></div>
        </div>
      ) : filteredSolutions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">No assets found</p>
          <p className="mt-2 text-sm">Try refining your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSolutions.map((item) => (
            <SolutionCard
              key={`${item.type}-${item.id}`}
              data={item}
              onEdit={item.type === 'tool' ? () => {
                const tool = tools.find((candidate) => candidate.id === item.id);
                if (tool) {
                  setToolFormState({ mode: 'edit', tool });
                }
              } : undefined}
            />
          ))}
        </div>
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

      <RoiManagerModal
        isOpen={isRoiManagerOpen}
        onClose={() => setIsRoiManagerOpen(false)}
        resourceOptions={resourceOptions}
        metricsMap={roiMetrics}
        onManualUpdate={handleManualRoiUpdate}
        onBulkImport={handleBulkRoiImport}
      />
    </div>
  );
};

export default Solutions;
