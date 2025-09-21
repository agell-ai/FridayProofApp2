import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, PlusCircle, Upload } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import SolutionCard, { SolutionCardData } from '../components/Solutions/SolutionCard';
import { EntityFormModal, ToolFormValues, TemplateFormValues, MarketplaceFormValues } from '../components/Shared/EntityFormModal';
import { Tool } from '../types/tools';

// Utility function for generating consistent pseudo-random numbers
const deterministicNumber = (seed: string, min: number, max: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  return Math.floor(normalized * (max - min + 1)) + min;
};

const solutionTypes = ['active', 'library', 'marketplace'] as const;

type SolutionType = (typeof solutionTypes)[number];

type ToolFormState = {
  mode: 'create' | 'edit';
  tool?: Tool;
};

type TemplateFormState = {
  mode: 'create' | 'edit';
  template?: any;
};

type MarketplaceFormState = {
  mode: 'create' | 'edit';
  item?: any;
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
  active: 'Active',
  library: 'Library',
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

const Solutions: React.FC = () => {
  const { 
    tools, 
    isLoading: loadingTools, 
    createTool, 
    updateTool,
    templates,
    marketplaceItems,
    createTemplate,
    updateTemplate,
    createMarketplaceItem,
    updateMarketplaceItem
  } = useTools();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { teamMembers } = useTeam();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SolutionType>('active');
  const [summaryFilterStatus, setSummaryFilterStatus] = useState<string>('all');
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
  const [templateFormState, setTemplateFormState] = useState<TemplateFormState | null>(null);
  const [marketplaceFormState, setMarketplaceFormState] = useState<MarketplaceFormState | null>(null);

  const systems = useMemo(() => {
    return projects.flatMap((project) =>
      project.systems.map((system) => ({
        system,
        project,
        client: clients.find((client) => client.id === project.clientId) || null,
      }))
    );
  }, [projects, clients]);

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

    if (activeTab === 'active') {
      // Combine tools and systems for Active tab
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
    } else if (activeTab === 'library') {
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
    } else if (activeTab === 'marketplace') {
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
    }

    return items;
  }, [tools, systems, templates, marketplaceItems, formatRoi, activeTab]);

  const filteredSolutions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return solutionItems.filter((item) => {
      // Filter by status when on Active tab
      if (activeTab === 'active' && summaryFilterStatus !== 'all' && item.status !== summaryFilterStatus) {
        return false;
      }

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
  }, [solutionItems, searchTerm, activeTab, summaryFilterStatus]);

  const summaryStats = useMemo(() => {
    if (activeTab === 'active') {
      const activeItems = [...tools, ...systems.map(s => s.system)];
      const totalActive = activeItems.length;
      const deployed = activeItems.filter(item => item.status === 'deployed' || item.status === 'active').length;
      const testing = activeItems.filter(item => item.status === 'testing').length;
      const development = activeItems.filter(item => item.status === 'development').length;

      return [
        { 
          label: 'Total Active', 
          value: totalActive,
          onClick: () => setSummaryFilterStatus('all'),
          isActive: summaryFilterStatus === 'all'
        },
        { 
          label: 'Deployed', 
          value: deployed,
          onClick: () => setSummaryFilterStatus('deployed'),
          isActive: summaryFilterStatus === 'deployed'
        },
        { 
          label: 'Testing', 
          value: testing,
          onClick: () => setSummaryFilterStatus('testing'),
          isActive: summaryFilterStatus === 'testing'
        },
        { 
          label: 'Development', 
          value: development,
          onClick: () => setSummaryFilterStatus('development'),
          isActive: summaryFilterStatus === 'development'
        },
      ];
    } else if (activeTab === 'library') {
      const totalTemplates = templates.length;
      const categories = templates.map(t => t.category);
      const mostUsedCategory = categories.length > 0 ? 
        categories.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        ) : 'N/A';
      const avgUsage = templates.length > 0 ? 
        Math.round(templates.reduce((sum, t) => sum + t.usage, 0) / templates.length) : 0;

      return [
        { label: 'Total Templates', value: totalTemplates },
        { label: 'Most Used Category', value: mostUsedCategory },
        { label: 'New This Month', value: 3 }, // Mocked
        { label: 'Avg Usage', value: avgUsage },
      ];
    } else {
      const totalItems = marketplaceItems.length;
      const totalDownloads = marketplaceItems.reduce((sum, item) => sum + item.downloads, 0);
      const avgRating = marketplaceItems.length > 0 ? 
        (marketplaceItems.reduce((sum, item) => sum + parseFloat(item.rating), 0) / marketplaceItems.length).toFixed(1) : '0.0';

      return [
        { label: 'Total Items', value: totalItems },
        { label: 'Top Rated', value: `${avgRating}/5` },
        { label: 'Total Downloads', value: formatNumber(totalDownloads) },
        { label: 'New This Month', value: 2 }, // Mocked
      ];
    }
  }, [tools, systems, templates, marketplaceItems, activeTab, summaryFilterStatus]);

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

  const handleTemplateSubmit = (values: TemplateFormValues) => {
    if (!templateFormState) return;

    if (templateFormState.mode === 'create') {
      createTemplate({
        name: values.name,
        description: values.description,
        category: values.category,
        usage: values.usage,
        lastModified: new Date().toISOString(),
        owner: 'Internal',
      });
    } else if (templateFormState.template) {
      updateTemplate(templateFormState.template.id, {
        name: values.name,
        description: values.description,
        category: values.category,
        usage: values.usage,
        lastModified: new Date().toISOString(),
      });
    }

    setTemplateFormState(null);
  };

  const handleMarketplaceSubmit = (values: MarketplaceFormValues) => {
    if (!marketplaceFormState) return;

    if (marketplaceFormState.mode === 'create') {
      createMarketplaceItem({
        name: values.name,
        description: values.description,
        category: values.category,
        downloads: values.downloads,
        rating: values.rating.toString(),
        price: values.price,
        owner: 'Internal',
        createdAt: new Date().toISOString(),
      });
    } else if (marketplaceFormState.item) {
      updateMarketplaceItem(marketplaceFormState.item.id, {
        name: values.name,
        description: values.description,
        category: values.category,
        downloads: values.downloads,
        rating: values.rating.toString(),
        price: values.price,
      });
    }

    setMarketplaceFormState(null);
  };

  const handleCreateTemplate = (sourceItem: SolutionCardData) => {
    const sourceData = sourceItem.type === 'tool' 
      ? tools.find(t => t.id === sourceItem.id)
      : systems.find(s => s.system.id === sourceItem.id)?.system;

    if (sourceData) {
      setTemplateFormState({
        mode: 'create',
        template: {
          name: `${sourceData.name} Template`,
          description: `Template based on ${sourceData.name}`,
          category: sourceItem.type === 'tool' ? sourceData.category : sourceData.type,
          usage: 0,
          lastModified: new Date().toISOString(),
          owner: 'Internal',
        }
      });
    }
  };

  const handleListInMarketplace = (templateItem: SolutionCardData) => {
    const template = templates.find(t => t.id === templateItem.id);
    
    if (template) {
      setMarketplaceFormState({
        mode: 'create',
        item: {
          name: template.name,
          description: template.description,
          category: template.category,
          downloads: 0,
          rating: '0.0',
          price: 99,
          owner: template.owner,
          createdAt: new Date().toISOString(),
        }
      });
    }
  };

  const handleTabChange = (tab: SolutionType) => {
    setActiveTab(tab);
    setSummaryFilterStatus('all');
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'active': return 'Create Tool';
      case 'library': return 'Create Template';
      case 'marketplace': return 'Create Listing';
      default: return 'Create';
    }
  };

  const handleCreateClick = () => {
    switch (activeTab) {
      case 'active':
        setToolFormState({ mode: 'create' });
        break;
      case 'library':
        setTemplateFormState({ mode: 'create' });
        break;
      case 'marketplace':
        setMarketplaceFormState({ mode: 'create' });
        break;
    }
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
                const isActive = activeTab === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTabChange(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCreateClick}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              {getCreateButtonText()}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border px-4 py-3 transition-all cursor-pointer ${
                'isActive' in stat && stat.isActive
                  ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                  : 'border-[var(--border)] bg-[var(--surface)]/60 hover:bg-[var(--surface)]'
              }`}
              onClick={'onClick' in stat ? stat.onClick : undefined}
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
              } : item.type === 'template' ? () => {
                const template = templates.find((candidate) => candidate.id === item.id);
                if (template) {
                  setTemplateFormState({ mode: 'edit', template });
                }
              } : item.type === 'marketplace' ? () => {
                const marketplaceItem = marketplaceItems.find((candidate) => candidate.id === item.id);
                if (marketplaceItem) {
                  setMarketplaceFormState({ mode: 'edit', item: marketplaceItem });
                }
              } : undefined}
              onCreateTemplate={activeTab === 'active' ? () => handleCreateTemplate(item) : undefined}
              onListInMarketplace={activeTab === 'library' ? () => handleListInMarketplace(item) : undefined}
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

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white"
            >
              Save Metrics
            </button>
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

      <EntityFormModal
        isOpen={Boolean(templateFormState)}
        type="template"
        mode={templateFormState?.mode || 'create'}
        initialData={templateFormState?.template}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setTemplateFormState(null)}
        onSubmit={handleTemplateSubmit}
      />

      <EntityFormModal
        isOpen={Boolean(marketplaceFormState)}
        type="marketplace"
        mode={marketplaceFormState?.mode || 'create'}
        initialData={marketplaceFormState?.item}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setMarketplaceFormState(null)}
        onSubmit={handleMarketplaceSubmit}
      />
    </div>
  );
};

export default Solutions;