import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, PlusCircle, Upload } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import SolutionCard, { SolutionCardData } from '../components/Solutions/SolutionCard';
import { EntityFormModal, ToolFormValues } from '../components/Shared/EntityFormModal';
import { Button } from '../components/Shared/Button';
import { Tool } from '../types/tools';

const solutionTypes = ['tool', 'system', 'template', 'marketplace'] as const;

type SolutionType = (typeof solutionTypes)[number];

type ToolFormState = {
  mode: 'create' | 'edit';
  tool?: Tool;
};

interface RoiMetricRecord {
  costSavings: number;
  hoursSaved: number;
  revenueGenerated: number;
  adoptionRate: number;
  efficiencyGain: number;
  lastUpdated: string;
}

interface ResourceOption {
  key: string;
  label: string;
}

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
  const [selectedResourceKey, setSelectedResourceKey] = useState<string>('');
  const [manualMetrics, setManualMetrics] = useState({
    costSavings: '',
    hoursSaved: '',
    revenueGenerated: '',
    adoptionRate: '',
    efficiencyGain: '',
  });
  const [importFeedback, setImportFeedback] = useState<string>('');
  const [toolFormState, setToolFormState] = useState<ToolFormState | null>(null);

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

  useEffect(() => {
    if (resourceOptions.length === 0) {
      setSelectedResourceKey('');
      return;
    }

    if (!resourceOptions.some((option) => option.key === selectedResourceKey)) {
      setSelectedResourceKey(resourceOptions[0].key);
    }
  }, [resourceOptions, selectedResourceKey]);

  const selectedMetrics = selectedResourceKey ? roiMetrics[selectedResourceKey] : undefined;

  useEffect(() => {
    if (selectedMetrics) {
      setManualMetrics({
        costSavings: String(selectedMetrics.costSavings || ''),
        hoursSaved: String(selectedMetrics.hoursSaved || ''),
        revenueGenerated: String(selectedMetrics.revenueGenerated || ''),
        adoptionRate: String(selectedMetrics.adoptionRate || ''),
        efficiencyGain: String(selectedMetrics.efficiencyGain || ''),
      });
    }
  }, [selectedMetrics, selectedResourceKey]);

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

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedResourceKey) return;

    const updatedMetrics: RoiMetricRecord = {
      costSavings: Number(manualMetrics.costSavings) || 0,
      hoursSaved: Number(manualMetrics.hoursSaved) || 0,
      revenueGenerated: Number(manualMetrics.revenueGenerated) || 0,
      adoptionRate: Number(manualMetrics.adoptionRate) || 0,
      efficiencyGain: Number(manualMetrics.efficiencyGain) || 0,
      lastUpdated: new Date().toISOString(),
    };

    setRoiMetrics((prev) => ({
      ...prev,
      [selectedResourceKey]: updatedMetrics,
    }));

    if (selectedResourceKey.startsWith('tool-')) {
      const toolId = selectedResourceKey.replace('tool-', '');
      updateTool(toolId, {
        stats: {
          costSavings: updatedMetrics.costSavings,
          usage: updatedMetrics.adoptionRate,
          efficiency: updatedMetrics.efficiencyGain,
        },
      });
    }

    setImportFeedback('');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result?.toString();
      if (!text) {
        setImportFeedback('Unable to read file contents.');
        return;
      }

      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) {
        setImportFeedback('No data rows found in the import file.');
        return;
      }

      const [headerLine, ...rows] = lines;
      const headers = headerLine.split(',').map((header) => header.trim());
      const requiredHeaders = ['resourceKey', 'costSavings', 'hoursSaved', 'revenueGenerated', 'adoptionRate', 'efficiencyGain'];

      if (!requiredHeaders.every((header) => headers.includes(header))) {
        setImportFeedback('Invalid column headers. Expected: resourceKey, costSavings, hoursSaved, revenueGenerated, adoptionRate, efficiencyGain.');
        return;
      }

      const updates: Array<{ key: string; metrics: RoiMetricRecord }> = [];

      rows.forEach((row) => {
        const values = row.split(',');
        if (values.length < headers.length) return;

        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = values[index]?.trim() || '';
        });

        const key = record.resourceKey;
        if (!key) return;

        updates.push({
          key,
          metrics: {
            costSavings: Number(record.costSavings) || 0,
            hoursSaved: Number(record.hoursSaved) || 0,
            revenueGenerated: Number(record.revenueGenerated) || 0,
            adoptionRate: Number(record.adoptionRate) || 0,
            efficiencyGain: Number(record.efficiencyGain) || 0,
            lastUpdated: new Date().toISOString(),
          },
        });
      });

      if (updates.length === 0) {
        setImportFeedback('No valid rows found to import.');
        return;
      }

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

      setImportFeedback(`Imported ROI metrics for ${updates.length} resource${updates.length === 1 ? '' : 's'}.`);
    };

    reader.readAsText(file);
    event.target.value = '';
  };

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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {solutionTypes.map((type) => {
                const isActive = activeTypes.includes(type);
                return (
                  <Button
                    key={type}
                    size="sm"
                    glowOnHover
                    activeGlow={isActive}
                    onClick={() => toggleType(type)}
                    innerClassName={`px-3 py-2 text-sm font-medium ${isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}
                  >
                    {typeLabels[type]}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
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
                onClick={() => setToolFormState({ mode: 'create' })}
                glowOnHover
                innerClassName="font-semibold"
              >
                <PlusCircle className="h-4 w-4" />
                Add Tool
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--fg)]">{stat.value}</p>
            </div>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Manual ROI Update</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Capture the latest impact metrics when you have verified numbers from finance or operations teams.
          </p>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Resource</label>
              <select
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={selectedResourceKey}
                onChange={(event) => setSelectedResourceKey(event.target.value)}
              >
                {resourceOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--fg-muted)]">Cost Savings ($)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={manualMetrics.costSavings}
                  onChange={(event) => setManualMetrics((prev) => ({ ...prev, costSavings: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fg-muted)]">Hours Saved</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={manualMetrics.hoursSaved}
                  onChange={(event) => setManualMetrics((prev) => ({ ...prev, hoursSaved: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fg-muted)]">Revenue Generated ($)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={manualMetrics.revenueGenerated}
                  onChange={(event) => setManualMetrics((prev) => ({ ...prev, revenueGenerated: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fg-muted)]">Adoption Rate (%)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={manualMetrics.adoptionRate}
                  onChange={(event) => setManualMetrics((prev) => ({ ...prev, adoptionRate: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fg-muted)]">Efficiency Gain (%)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={manualMetrics.efficiencyGain}
                  onChange={(event) => setManualMetrics((prev) => ({ ...prev, efficiencyGain: event.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" glowOnHover innerClassName="font-semibold">
              Save Metrics
            </Button>
          </form>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Bulk ROI Import</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Drop in CSV exports from your BI platform to update cost savings, hours saved, revenue, adoption, and efficiency in one shot.
          </p>
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/40 p-5 text-sm text-[var(--fg-muted)]">
            <p className="font-medium text-[var(--fg)]">Expected columns</p>
            <p className="mt-1">resourceKey, costSavings, hoursSaved, revenueGenerated, adoptionRate, efficiencyGain</p>
          </div>
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-6 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]">
            <Upload className="h-5 w-5" />
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          {importFeedback && <p className="text-sm text-[var(--fg-muted)]">{importFeedback}</p>}
        </div>
      </div>

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
    </div>
  );
};

export default Solutions;
