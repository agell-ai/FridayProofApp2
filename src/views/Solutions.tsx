import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, PlusCircle, Search } from 'lucide-react';
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
import type { ResourceOption, RoiMetricRecord } from '../types/roi';
import type { Client, ClientLibraryItem, ClientTemplate, Project, System } from '../types';

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
    setTemplateDescriptions((prev) => {
      const next = { ...prev };
      clients.forEach((client) => {
        client.templates.forEach((template) => {
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
        client.templates.map((template) => {
          const key = `${client.id}-${template.id}`;
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
          };
        })
      ),
    [clients, templateDescriptions]
  );

  const marketplaceItems = useMemo(
    () =>
      clients.flatMap((client) =>
        client.library.map((item) => {
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
          owner: tool.clientName ? `Client • ${tool.clientName}` : undefined,
          meta: tool.projectName ? `Project • ${tool.projectName}` : undefined,
          tags: [tool.category.toLowerCase(), tool.projectName, tool.clientName].filter(Boolean) as string[],
          metrics: [
            { label: 'Usage', value: `${tool.stats.usage}%`, tone: 'positive' },
            { label: 'Efficiency', value: `${tool.stats.efficiency}%`, tone: 'positive' },
          ],
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
          meta: `Project • ${project.name}`,
          tags: [system.type, system.status, project.name],
          metrics: [
            { label: 'Components', value: String(system.components.length) },
            { label: 'Connections', value: String(system.connections.length) },
          ],
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

          if (!client || !template) {
            return null;
          }

          return {
            card: {
              id: item.id,
              type: 'template',
              title: item.name,
              description: item.description,
              owner: `Client • ${client.companyName}`,
              meta: `Last modified • ${new Date(item.lastModified).toLocaleDateString()}`,
              tags: [item.category.toLowerCase()],
              metrics: [
                { label: 'Usage', value: `${item.usage} launches`, tone: 'positive' },
              ],
            },
            meta: {
              kind: 'template',
              template,
              client,
              description: item.description,
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

          if (!client || !libraryItem) {
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

  const filteredLibraryItems = useMemo(() => {
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

  const filteredMarketplaceItems = useMemo(() => {
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

  const activeSummary = useMemo(
    () => [
      { label: 'Active (total)', value: activeItems.length, filter: 'all' as ActiveStatusFilter },
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
    const { itemId, clientId, name, type, category, description, downloads = 0, rating = 0 } = values;
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
        item.id === itemId ? { ...item, name, type, category } : item
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
      },
    });
  };

  const isActiveView = activeView === 'active';
  const isLibraryView = activeView === 'library';
  const hasResults = isActiveView
    ? filteredActiveItems.length > 0
    : isLibraryView
      ? filteredLibraryItems.length > 0
      : filteredMarketplaceItems.length > 0;

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
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Systems Hub</h1>
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
              {isActiveView && (
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
              )}

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

        {isActiveView && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeSummary.map((stat) => {
              const isSelected = activeStatusFilter === stat.filter;
              return (
                <Card
                  key={stat.label}
                  glowOnHover
                  activeGlow={isSelected}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isActiveView &&
            filteredActiveItems.map((entry) => (
              <SolutionCard
                key={`active-${entry.card.id}`}
                data={entry.card}
                onEdit={() => {
                  if (entry.meta.kind === 'tool') {
                    setToolFormState({ mode: 'edit', tool: entry.meta.tool });
                  } else {
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
                  }
                }}
                onCreateTemplate={() => handleCreateTemplateFromActive(entry)}
              />
            ))}

          {isLibraryView &&
            filteredLibraryItems.map((entry) => (
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
                onListInMarketplace={() => handleListTemplateInMarketplace(entry)}
              />
            ))}

          {!isActiveView && !isLibraryView &&
            filteredMarketplaceItems.map((entry) => (
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
                    },
                  })
                }
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
