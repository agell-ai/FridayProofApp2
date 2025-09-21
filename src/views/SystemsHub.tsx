import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, PlusCircle, BarChart3, Upload, Clock } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import SolutionCard, { SolutionCardData } from '../components/Solutions/SolutionCard';
import ToolDetails from '../components/Tools/ToolDetails';
import SystemDetails from '../components/Solutions/SystemDetails';
import AssetDetails from '../components/Solutions/AssetDetails';
import ManualRoiModal, { ManualMetricsState, ResourceOption as RoiResourceOption } from '../components/Solutions/ManualRoiModal';
import BulkRoiModal from '../components/Solutions/BulkRoiModal';
import {
  EntityFormModal,
  EntityFormValues,
  ToolFormValues,
  SystemFormValues,
  TemplateFormValues,
  AssetFormValues,
  FormMode,
} from '../components/Shared/EntityFormModal';
import { Button } from '../components/Shared/Button';
import { Tool } from '../types/tools';
import { Project, Client, System, ClientTemplate, ClientLibraryItem } from '../types';

const tabOptions = [
  { value: 'active' as const, label: 'Active' },
  { value: 'library' as const, label: 'Library' },
  { value: 'marketplace' as const, label: 'Marketplace' },
];

const filterLabelMap = {
  active: 'Status',
  library: 'Category',
  marketplace: 'Category',
} as const;

type ActiveTab = (typeof tabOptions)[number]['value'];
type TimeRange = '30d' | '90d' | 'ytd' | 'all';

type RoiMetricRecord = {
  costSavings: number;
  hoursSaved: number;
  revenueGenerated: number;
  adoptionRate: number;
  efficiencyGain: number;
  lastUpdated: string;
};

interface SystemEntry {
  system: System;
  project: Project;
  client: Client | null;
}

interface TemplateEntry {
  template: ClientTemplate;
  client: Client;
}

interface MarketplaceEntry {
  item: ClientLibraryItem;
  client: Client;
  downloads: number;
  rating: number;
}

interface TemplateDetailData {
  id: string;
  name: string;
  category: string;
  usage: number;
  lastModified: string;
  owner: string;
  description: string;
}

interface MarketplaceDetailData {
  id: string;
  name: string;
  category: string;
  type: string;
  createdAt: string;
  downloads: number;
  rating: number;
  owner: string;
  description: string;
}

type DetailState =
  | { type: 'tool'; tool: Tool }
  | { type: 'system'; system: System; project: Project; client: Client | null }
  | { type: 'template'; data: TemplateDetailData }
  | { type: 'marketplace'; data: MarketplaceDetailData };

type FormState =
  | { type: 'tool'; mode: FormMode; tool?: Tool }
  | { type: 'system'; mode: FormMode; system: System; projectId: string }
  | { type: 'template'; mode: FormMode; template: ClientTemplate; clientId: string }
  | { type: 'asset'; mode: FormMode; asset: ClientLibraryItem; clientId: string };

const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last quarter' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
];

const formatCurrency = (value: number) => {
  if (!value) return '$0';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value: number) => {
  if (!value) return '0';
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

const deterministicNumber = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000;
  }
  const ratio = hash / 1_000;
  return Math.round(min + ratio * (max - min));
};

const toTitleCase = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isWithinRange = (dateString: string | undefined, range: TimeRange) => {
  if (range === 'all' || !dateString) {
    return true;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return true;
  }

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const dayInMs = 24 * 60 * 60 * 1_000;

  switch (range) {
    case '30d':
      return diffInMs <= 30 * dayInMs;
    case '90d':
      return diffInMs <= 90 * dayInMs;
    case 'ytd': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    }
    default:
      return true;
  }
};

const getTemplateKey = (clientId: string, templateId: string) => `${clientId}::${templateId}`;
const getMarketplaceKey = (clientId: string, assetId: string) => `${clientId}::${assetId}`;

const SystemsHub: React.FC = () => {
  const { tools, isLoading: loadingTools, createTool, updateTool } = useTools();
  const { projects, isLoading: loadingProjects, updateSystem } = useProjects();
  const { clients, isLoading: loadingClients, updateTemplate, updateLibraryItem } = useClients();
  const { teamMembers, isLoading: loadingTeam } = useTeam();

  const [activeTab, setActiveTab] = useState<ActiveTab>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedDetail, setSelectedDetail] = useState<DetailState | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [roiMetrics, setRoiMetrics] = useState<Record<string, RoiMetricRecord>>({});
  const [selectedResourceKey, setSelectedResourceKey] = useState('');
  const [manualMetrics, setManualMetrics] = useState<ManualMetricsState>({
    costSavings: '',
    hoursSaved: '',
    revenueGenerated: '',
    adoptionRate: '',
    efficiencyGain: '',
  });
  const [importFeedback, setImportFeedback] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const isLoading = loadingTools || loadingProjects || loadingClients || loadingTeam;

  const systems = useMemo<SystemEntry[]>(
    () =>
      projects.flatMap((project) =>
        project.systems.map((system) => ({
          system,
          project,
          client: clients.find((client) => client.id === project.clientId) || null,
        }))
      ),
    [projects, clients]
  );

  const templateEntries = useMemo<TemplateEntry[]>(
    () =>
      clients.flatMap((client) =>
        client.templates.map((template) => ({
          template,
          client,
        }))
      ),
    [clients]
  );

  const marketplaceEntries = useMemo<MarketplaceEntry[]>(
    () =>
      clients.flatMap((client) =>
        client.library.map((item) => ({
          item,
          client,
          downloads: deterministicNumber(item.id, 120, 1_400),
          rating: deterministicNumber(`${item.id}-rating`, 40, 50) / 10,
        }))
      ),
    [clients]
  );

  const templateLookup = useMemo(() => {
    const map = new Map<string, TemplateEntry>();
    templateEntries.forEach((entry) => {
      map.set(getTemplateKey(entry.client.id, entry.template.id), entry);
    });
    return map;
  }, [templateEntries]);

  const marketplaceLookup = useMemo(() => {
    const map = new Map<string, MarketplaceEntry>();
    marketplaceEntries.forEach((entry) => {
      map.set(getMarketplaceKey(entry.client.id, entry.item.id), entry);
    });
    return map;
  }, [marketplaceEntries]);

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
            costSavings: deterministicNumber(system.id, 15_000, 60_000),
            hoursSaved: deterministicNumber(`${system.id}-hours`, 200, 1_400),
            revenueGenerated: deterministicNumber(`${system.id}-revenue`, 25_000, 120_000),
            adoptionRate: deterministicNumber(`${system.id}-adoption`, 60, 95),
            efficiencyGain: deterministicNumber(`${system.id}-efficiency`, 55, 90),
            lastUpdated: project.updatedAt,
          };
        }
      });

      return next;
    });
  }, [tools, systems]);

  const resourceOptions = useMemo<RoiResourceOption[]>(() => {
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
  }, [selectedMetrics]);

  useEffect(() => {
    setFilterValue('all');
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'active') {
      setIsManualModalOpen(false);
      setIsBulkModalOpen(false);
    }
  }, [activeTab]);

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

  const activeSummary = useMemo(() => {
    const activeTools = tools.filter((tool) => tool.status === 'active').length;
    const activeSystems = systems.filter(({ system }) => system.status === 'active').length;

    const adoptionValues = [
      ...tools.map((tool) => tool.stats.usage),
      ...systems.map(({ system }) => roiMetrics[`system-${system.id}`]?.adoptionRate ?? 0),
    ];
    const efficiencyValues = [
      ...tools.map((tool) => tool.stats.efficiency),
      ...systems.map(({ system }) => roiMetrics[`system-${system.id}`]?.efficiencyGain ?? 0),
    ];

    const avgAdoption = adoptionValues.length
      ? Math.round(adoptionValues.reduce((sum, value) => sum + value, 0) / adoptionValues.length)
      : 0;
    const avgEfficiency = efficiencyValues.length
      ? Math.round(efficiencyValues.reduce((sum, value) => sum + value, 0) / efficiencyValues.length)
      : 0;

    return [
      { label: 'Active Tools', value: activeTools.toString() },
      { label: 'Active Systems', value: activeSystems.toString() },
      { label: 'Avg Adoption', value: `${avgAdoption}%` },
      { label: 'Avg Efficiency', value: `${avgEfficiency}%` },
    ];
  }, [tools, systems, roiMetrics]);

  const librarySummary = useMemo(() => {
    const totalTemplates = templateEntries.length;
    const avgLaunches = totalTemplates
      ? Math.round(templateEntries.reduce((sum, entry) => sum + entry.template.usage, 0) / totalTemplates)
      : 0;
    const maintainers = new Set(templateEntries.map((entry) => entry.client.id)).size;

    return [
      { label: 'Templates', value: totalTemplates.toString() },
      { label: 'Avg Launches', value: formatNumber(avgLaunches) },
      { label: 'Maintainers', value: maintainers.toString() },
    ];
  }, [templateEntries]);

  const marketplaceSummary = useMemo(() => {
    const totalAssets = marketplaceEntries.length;
    const totalDownloads = marketplaceEntries.reduce((sum, entry) => sum + entry.downloads, 0);
    const avgRating = totalAssets
      ? marketplaceEntries.reduce((sum, entry) => sum + entry.rating, 0) / totalAssets
      : 0;

    return [
      { label: 'Marketplace Assets', value: totalAssets.toString() },
      { label: 'Total Downloads', value: formatNumber(totalDownloads) },
      { label: 'Average Rating', value: `${avgRating.toFixed(1)}/5` },
    ];
  }, [marketplaceEntries]);

  const summaryCards = activeTab === 'active' ? activeSummary : activeTab === 'library' ? librarySummary : marketplaceSummary;

  const activeFilterOptions = useMemo(() => {
    const statuses = new Set<string>();
    tools.forEach((tool) => statuses.add(tool.status));
    systems.forEach(({ system }) => statuses.add(system.status));
    return Array.from(statuses).sort((a, b) => a.localeCompare(b));
  }, [tools, systems]);

  const libraryFilterOptions = useMemo(() => {
    const categories = new Set<string>();
    templateEntries.forEach((entry) => categories.add(entry.template.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [templateEntries]);

  const marketplaceFilterOptions = useMemo(() => {
    const categories = new Set<string>();
    marketplaceEntries.forEach((entry) => categories.add(entry.item.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [marketplaceEntries]);

  const filterOptions = activeTab === 'active'
    ? activeFilterOptions
    : activeTab === 'library'
      ? libraryFilterOptions
      : marketplaceFilterOptions;

  const activeCards = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const entries = [
      ...tools.map((tool) => {
        const card: SolutionCardData = {
          id: tool.id,
          type: 'tool',
          title: tool.name,
          description: tool.description,
          status: tool.status,
          owner: tool.clientName ? `Client • ${tool.clientName}` : 'Internal',
          meta: `Project • ${tool.projectName}`,
          tags: [tool.category, tool.projectName].filter(Boolean) as string[],
          metrics: [
            { label: 'Usage', value: `${tool.stats.usage}%`, tone: 'positive' },
            { label: 'Efficiency', value: `${tool.stats.efficiency}%`, tone: 'positive' },
          ],
          roi: formatRoi(`tool-${tool.id}`),
        };

        const searchValues = [
          tool.name,
          tool.description,
          tool.clientName,
          tool.projectName,
          tool.category,
          tool.status,
          ...card.tags,
          ...card.metrics.flatMap((metric) => [metric.label, metric.value]),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return {
          card,
          updatedAt: tool.updatedAt,
          status: tool.status,
          searchValues,
        };
      }),
      ...systems.map(({ system, project, client }) => {
        const card: SolutionCardData = {
          id: system.id,
          type: 'system',
          title: system.name,
          description: system.description,
          status: system.status,
          owner: client ? `Client • ${client.companyName}` : 'Internal',
          meta: `Project • ${project.name}`,
          tags: [toTitleCase(system.type), project.name],
          metrics: [
            { label: 'Components', value: String(system.components.length) },
            { label: 'Connections', value: String(system.connections.length) },
          ],
          roi: formatRoi(`system-${system.id}`),
        };

        const searchValues = [
          system.name,
          system.description,
          project.name,
          client?.companyName,
          system.type,
          system.status,
          ...card.tags,
          ...card.metrics.flatMap((metric) => [metric.label, metric.value]),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return {
          card,
          updatedAt: project.updatedAt,
          status: system.status,
          searchValues,
        };
      }),
    ];

    return entries
      .filter((entry) => {
        if (timeRange !== 'all' && !isWithinRange(entry.updatedAt, timeRange)) {
          return false;
        }
        if (filterValue !== 'all' && entry.status !== filterValue) {
          return false;
        }
        if (!normalized) {
          return true;
        }
        return entry.searchValues.some((value) => value.includes(normalized));
      })
      .map((entry) => entry.card);
  }, [tools, systems, formatRoi, searchTerm, filterValue, timeRange]);

  const libraryCards = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return templateEntries
      .map((entry) => {
        const key = getTemplateKey(entry.client.id, entry.template.id);
        const card: SolutionCardData = {
          id: key,
          type: 'template',
          title: entry.template.name,
          description: `${entry.template.category} playbook maintained by ${entry.client.companyName}.`,
          owner: `Maintainer • ${entry.client.companyName}`,
          meta: `Updated • ${new Date(entry.template.lastModified).toLocaleDateString()}`,
          tags: [entry.template.category],
          metrics: [
            { label: 'Launches', value: formatNumber(entry.template.usage), tone: 'positive' },
          ],
        };

        const searchValues = [
          entry.template.name,
          entry.template.category,
          entry.client.companyName,
          entry.template.lastModified,
          ...card.tags,
          ...card.metrics.flatMap((metric) => [metric.label, metric.value]),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return {
          card,
          updatedAt: entry.template.lastModified,
          category: entry.template.category,
          searchValues,
        };
      })
      .filter((entry) => {
        if (timeRange !== 'all' && !isWithinRange(entry.updatedAt, timeRange)) {
          return false;
        }
        if (filterValue !== 'all' && entry.category !== filterValue) {
          return false;
        }
        if (!normalized) {
          return true;
        }
        return entry.searchValues.some((value) => value.includes(normalized));
      })
      .map((entry) => entry.card);
  }, [templateEntries, searchTerm, filterValue, timeRange]);

  const marketplaceCards = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return marketplaceEntries
      .map((entry) => {
        const key = getMarketplaceKey(entry.client.id, entry.item.id);
        const card: SolutionCardData = {
          id: key,
          type: 'marketplace',
          title: entry.item.name,
          description: `${entry.item.type} contribution from ${entry.client.companyName}.`,
          owner: `Contributor • ${entry.client.companyName}`,
          meta: `Published • ${new Date(entry.item.createdAt).toLocaleDateString()}`,
          tags: [entry.item.category],
          metrics: [
            { label: 'Downloads', value: formatNumber(entry.downloads), tone: 'positive' },
            { label: 'Rating', value: `${entry.rating.toFixed(1)}/5`, tone: 'positive' },
          ],
        };

        const searchValues = [
          entry.item.name,
          entry.item.type,
          entry.item.category,
          entry.client.companyName,
          entry.item.createdAt,
          ...card.tags,
          ...card.metrics.flatMap((metric) => [metric.label, metric.value]),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return {
          card,
          updatedAt: entry.item.createdAt,
          category: entry.item.category,
          searchValues,
        };
      })
      .filter((entry) => {
        if (timeRange !== 'all' && !isWithinRange(entry.updatedAt, timeRange)) {
          return false;
        }
        if (filterValue !== 'all' && entry.category !== filterValue) {
          return false;
        }
        if (!normalized) {
          return true;
        }
        return entry.searchValues.some((value) => value.includes(normalized));
      })
      .map((entry) => entry.card);
  }, [marketplaceEntries, searchTerm, filterValue, timeRange]);

  const cardsToRender = activeTab === 'active' ? activeCards : activeTab === 'library' ? libraryCards : marketplaceCards;

  const handleCardClick = (card: SolutionCardData) => {
    switch (card.type) {
      case 'tool': {
        const tool = tools.find((item) => item.id === card.id);
        if (tool) {
          setSelectedDetail({ type: 'tool', tool });
        }
        break;
      }
      case 'system': {
        const entry = systems.find(({ system }) => system.id === card.id);
        if (entry) {
          setSelectedDetail({ type: 'system', system: entry.system, project: entry.project, client: entry.client });
        }
        break;
      }
      case 'template': {
        const entry = templateLookup.get(card.id);
        if (entry) {
          const detail: TemplateDetailData = {
            id: card.id,
            name: entry.template.name,
            category: entry.template.category,
            usage: entry.template.usage,
            lastModified: entry.template.lastModified,
            owner: entry.client.companyName,
            description: `${entry.template.category} playbook maintained by ${entry.client.companyName}.`,
          };
          setSelectedDetail({ type: 'template', data: detail });
        }
        break;
      }
      case 'marketplace': {
        const entry = marketplaceLookup.get(card.id);
        if (entry) {
          const detail: MarketplaceDetailData = {
            id: card.id,
            name: entry.item.name,
            category: entry.item.category,
            type: entry.item.type,
            createdAt: entry.item.createdAt,
            downloads: entry.downloads,
            rating: entry.rating,
            owner: entry.client.companyName,
            description: `${entry.item.type} contribution from ${entry.client.companyName}.`,
          };
          setSelectedDetail({ type: 'marketplace', data: detail });
        }
        break;
      }
      default:
        break;
    }
  };

  const handleEdit = (card: SolutionCardData) => {
    switch (card.type) {
      case 'tool': {
        const tool = tools.find((item) => item.id === card.id);
        if (tool) {
          setFormState({ type: 'tool', mode: 'edit', tool });
        }
        break;
      }
      case 'system': {
        const entry = systems.find(({ system }) => system.id === card.id);
        if (entry) {
          setFormState({ type: 'system', mode: 'edit', system: entry.system, projectId: entry.project.id });
        }
        break;
      }
      case 'template': {
        const entry = templateLookup.get(card.id);
        if (entry) {
          setFormState({ type: 'template', mode: 'edit', template: entry.template, clientId: entry.client.id });
        }
        break;
      }
      case 'marketplace': {
        const entry = marketplaceLookup.get(card.id);
        if (entry) {
          setFormState({ type: 'asset', mode: 'edit', asset: entry.item, clientId: entry.client.id });
        }
        break;
      }
      default:
        break;
    }
  };

  const handleEntitySubmit = (values: EntityFormValues) => {
    if (!formState) return;

    switch (formState.type) {
      case 'tool': {
        const payload = values as ToolFormValues;
        if (formState.mode === 'create') {
          createTool({
            name: payload.name,
            description: payload.description,
            category: payload.category,
            status: payload.status,
            clientId: payload.clientId,
            projectId: payload.projectId,
            clientName: clients.find((client) => client.id === payload.clientId)?.companyName,
            projectName: projects.find((project) => project.id === payload.projectId)?.name,
            teamMembers: payload.teamMembers,
            businessImpact: payload.businessImpact,
            stats: payload.stats,
          });
        } else if (formState.tool) {
          updateTool(formState.tool.id, {
            name: payload.name,
            description: payload.description,
            category: payload.category,
            status: payload.status,
            clientId: payload.clientId,
            projectId: payload.projectId,
            clientName: clients.find((client) => client.id === payload.clientId)?.companyName,
            projectName: projects.find((project) => project.id === payload.projectId)?.name,
            teamMembers: payload.teamMembers,
            businessImpact: payload.businessImpact,
            stats: payload.stats,
          });
        }
        break;
      }
      case 'system': {
        const payload = values as SystemFormValues;
        updateSystem(formState.projectId, formState.system.id, {
          name: payload.name,
          description: payload.description,
          type: payload.type,
          status: payload.status,
          businessImpact: payload.businessImpact,
          projectId: payload.projectId,
        });
        break;
      }
      case 'template': {
        const payload = values as TemplateFormValues;
        updateTemplate(formState.clientId, formState.template.id, {
          name: payload.name,
          category: payload.category,
          usage: payload.usage,
          lastModified: payload.lastModified,
        });
        break;
      }
      case 'asset': {
        const payload = values as AssetFormValues;
        updateLibraryItem(formState.clientId, formState.asset.id, {
          name: payload.name,
          type: payload.type,
          category: payload.category,
          createdAt: payload.createdAt,
        });
        break;
      }
      default:
        break;
    }

    setFormState(null);
  };

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
    setIsManualModalOpen(false);
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

  const updateManualMetric = (field: keyof ManualMetricsState, value: string) => {
    setManualMetrics((prev) => ({ ...prev, [field]: value }));
  };

  if (selectedDetail) {
    switch (selectedDetail.type) {
      case 'tool':
        return <ToolDetails tool={selectedDetail.tool} onBack={() => setSelectedDetail(null)} />;
      case 'system':
        return (
          <SystemDetails
            system={selectedDetail.system}
            project={selectedDetail.project}
            client={selectedDetail.client}
            onBack={() => setSelectedDetail(null)}
          />
        );
      case 'template':
        return <AssetDetails type="template" data={selectedDetail.data} onBack={() => setSelectedDetail(null)} />;
      case 'marketplace':
        return <AssetDetails type="marketplace" data={selectedDetail.data} onBack={() => setSelectedDetail(null)} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Systems Hub</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Search every automation, template, and marketplace asset from a single control center.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="Search by name, owner, category, or status"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {tabOptions.map((option) => {
                const isActive = activeTab === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveTab(option.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                  <select
                    className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                  >
                    <option value="all">All {filterLabelMap[activeTab].toLowerCase()}s</option>
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {toTitleCase(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                  <select
                    className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    value={timeRange}
                    onChange={(event) => setTimeRange(event.target.value as TimeRange)}
                  >
                    {timeRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeTab === 'active' && (
                <div className="flex items-center gap-2">
                  <Button
                    glowOnHover
                    disabled={resourceOptions.length === 0}
                    onClick={() => setIsManualModalOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Manual ROI</span>
                    </span>
                  </Button>
                  <Button
                    glowOnHover
                    disabled={resourceOptions.length === 0}
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Bulk Import</span>
                    </span>
                  </Button>
                  <Button glowOnHover onClick={() => setFormState({ type: 'tool', mode: 'create' })}>
                    <span className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Tool</span>
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--fg)]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent-orange)] border-t-transparent" />
        </div>
      ) : cardsToRender.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">
            {activeTab === 'active'
              ? 'No systems or tools match your filters'
              : activeTab === 'library'
                ? 'No templates found'
                : 'No marketplace assets available'}
          </p>
          <p className="mt-2 text-sm">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardsToRender.map((card) => (
            <SolutionCard
              key={`${card.type}-${card.id}`}
              data={card}
              onEdit={handleEdit}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      <ManualRoiModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        resourceOptions={resourceOptions}
        selectedResourceKey={selectedResourceKey}
        onSelectResource={setSelectedResourceKey}
        metrics={manualMetrics}
        onChange={updateManualMetric}
        onSubmit={handleManualSubmit}
      />

      <BulkRoiModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleImport}
        feedback={importFeedback}
      />

      <EntityFormModal
        isOpen={Boolean(formState)}
        type={formState?.type || 'tool'}
        mode={formState?.mode || 'create'}
        initialData={
          formState?.type === 'tool'
            ? formState.tool || null
            : formState?.type === 'system'
              ? { ...formState.system, projectId: formState.projectId }
              : formState?.type === 'template'
                ? { ...formState.template, clientId: formState.clientId }
                : formState?.type === 'asset'
                  ? { ...formState.asset, clientId: formState.clientId }
                  : null
        }
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setFormState(null)}
        onSubmit={handleEntitySubmit}
      />
    </div>
  );
};

export default SystemsHub;
