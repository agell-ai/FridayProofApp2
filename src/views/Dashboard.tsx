import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Edit,
  FolderOpen,
  Users,
  Wrench,
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import CategoryDetailModal from '../components/Dashboard/CategoryDetailModal';
import { Card } from '../components/Shared/Card';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useTools } from '../hooks/useTools';
import type {
  CategoryKey,
  CategoryMeta,
  CategoryMetric,
  DashboardAnalyticsSummary,
} from '../components/Dashboard/dashboardTypes';

interface MetricOption {
  id: string;
  label: string;
  description: string;
  compute: () => CategoryMetric;
}

const STORAGE_KEY = 'dashboard.metricSelections.v1';

const CATEGORY_METADATA: Record<CategoryKey, CategoryMeta> = {
  clients: {
    key: 'clients',
    title: 'Clients',
    description: 'Account health, revenue, and responsiveness insights.',
    icon: Building2,
    accent: 'from-amber-500 via-orange-500 to-pink-500',
    hideForBusiness: true,
  },
  projects: {
    key: 'projects',
    title: 'Projects',
    description: 'Delivery pipeline status across every engagement.',
    icon: FolderOpen,
    accent: 'from-sky-500 via-blue-500 to-indigo-500',
  },
  team: {
    key: 'team',
    title: 'Team',
    description: 'Utilization, satisfaction, and productivity pulse.',
    icon: Users,
    accent: 'from-purple-500 via-fuchsia-500 to-rose-500',
  },
  tools: {
    key: 'tools',
    title: 'Tools',
    description: 'Automation performance and category adoption trends.',
    icon: Wrench,
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
};

const DEFAULT_SELECTIONS: Record<CategoryKey, string[]> = {
  clients: ['totalClients', 'activeClients', 'avgSatisfaction'],
  projects: ['totalProjects', 'developmentMix', 'deployedProjects'],
  team: ['totalMembers', 'avgProductivity', 'avgSatisfaction'],
  tools: ['totalTools', 'activeTools', 'avgUsage'],
};

const cloneSelections = (selections: Record<CategoryKey, string[]>) => ({
  clients: [...selections.clients],
  projects: [...selections.projects],
  team: [...selections.team],
  tools: [...selections.tools],
});

const readSelectionsFromStorage = (): Record<CategoryKey, string[]> => {
  const defaults = cloneSelections(DEFAULT_SELECTIONS);

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaults;
    }

    const parsed = JSON.parse(stored) as Partial<Record<CategoryKey, string[]>>;
    const merged = cloneSelections(DEFAULT_SELECTIONS);

    (Object.keys(merged) as CategoryKey[]).forEach((key) => {
      const ids = parsed[key];
      if (Array.isArray(ids) && ids.length > 0) {
        merged[key] = ids.filter((id): id is string => typeof id === 'string');
      }
    });

    return merged;
  } catch (error) {
    console.error('Failed to read dashboard selections', error);
    return defaults;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { teamMembers } = useTeam();
  const { tools } = useTools();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [metricSelections, setMetricSelections] = useState<Record<CategoryKey, string[]>>(() =>
    readSelectionsFromStorage()
  );
  const [draftSelections, setDraftSelections] = useState<Record<CategoryKey, string[]>>(() =>
    cloneSelections(metricSelections)
  );
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  const visibleCategories = useMemo(() => {
    return (Object.keys(CATEGORY_METADATA) as CategoryKey[])
      .map((key) => CATEGORY_METADATA[key])
      .filter((meta) => !(meta.hideForBusiness && user?.accountType === 'business'));
  }, [user]);

  const clientAnalytics = useMemo<DashboardAnalyticsSummary['clients']>(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((client) => client.status === 'active').length;
    const prospectClients = clients.filter((client) => client.status === 'prospect').length;
    const inactiveClients = clients.filter((client) => client.status === 'inactive').length;

    const totalRevenue = clients.reduce((sum, client) => sum + client.analytics.totalRevenue, 0);
    const avgSatisfaction =
      totalClients > 0
        ? clients.reduce((sum, client) => sum + client.analytics.clientSatisfaction, 0) / totalClients
        : 0;
    const avgResponseTime =
      totalClients > 0
        ? clients.reduce((sum, client) => sum + client.analytics.responseTime, 0) / totalClients
        : 0;

    return {
      totalClients,
      activeClients,
      prospectClients,
      inactiveClients,
      totalRevenue,
      avgSatisfaction,
      avgResponseTime,
    };
  }, [clients]);

  const projectAnalytics = useMemo<DashboardAnalyticsSummary['projects']>(() => {
    const totalProjects = projects.length;
    const byStatus = {
      planning: projects.filter((project) => project.status === 'planning').length,
      development: projects.filter((project) => project.status === 'development').length,
      testing: projects.filter((project) => project.status === 'testing').length,
      deployed: projects.filter((project) => project.status === 'deployed').length,
      maintenance: projects.filter((project) => project.status === 'maintenance').length,
    };

    const totalSystems = projects.reduce((sum, project) => sum + project.systems.length, 0);
    const activeSystems = projects.reduce(
      (sum, project) => sum + project.systems.filter((system) => system.status === 'active').length,
      0
    );

    return {
      totalProjects,
      byStatus,
      totalSystems,
      activeSystems,
    };
  }, [projects]);

  const teamAnalytics = useMemo<DashboardAnalyticsSummary['team']>(() => {
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter((member) => member.status === 'active').length;
    const inactiveMembers = teamMembers.filter((member) => member.status === 'inactive').length;

    const byRole = {
      employee: teamMembers.filter((member) => member.role === 'employee').length,
      contractor: teamMembers.filter((member) => member.role === 'contractor').length,
      manager: teamMembers.filter((member) => member.role === 'manager').length,
    };

    const avgProductivity =
      totalMembers > 0
        ? teamMembers.reduce((sum, member) => sum + member.analytics.monthlyProductivity, 0) / totalMembers
        : 0;
    const totalHours = teamMembers.reduce((sum, member) => sum + member.analytics.hoursWorked, 0);
    const avgSatisfaction =
      totalMembers > 0
        ? teamMembers.reduce((sum, member) => sum + member.analytics.clientSatisfactionScore, 0) / totalMembers
        : 0;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      byRole,
      avgProductivity,
      totalHours,
      avgSatisfaction,
    };
  }, [teamMembers]);

  const toolAnalytics = useMemo<DashboardAnalyticsSummary['tools']>(() => {
    const totalTools = tools.length;
    const byCategory = tools.reduce<Record<string, number>>((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {});

    const byStatus = {
      active: tools.filter((tool) => tool.status === 'active').length,
      development: tools.filter((tool) => tool.status === 'development').length,
      testing: tools.filter((tool) => tool.status === 'testing').length,
      inactive: tools.filter((tool) => tool.status === 'inactive').length,
      error: tools.filter((tool) => tool.status === 'error').length,
    };

    const avgUsage = totalTools > 0 ? tools.reduce((sum, tool) => sum + tool.stats.usage, 0) / totalTools : 0;
    const avgEfficiency =
      totalTools > 0 ? tools.reduce((sum, tool) => sum + tool.stats.efficiency, 0) / totalTools : 0;
    const totalCostSavings = tools.reduce((sum, tool) => sum + tool.stats.costSavings, 0);

    return {
      totalTools,
      byCategory,
      byStatus,
      avgUsage,
      avgEfficiency,
      totalCostSavings,
    };
  }, [tools]);

  const analyticsSummary = useMemo<DashboardAnalyticsSummary>(
    () => ({
      clients: clientAnalytics,
      projects: projectAnalytics,
      team: teamAnalytics,
      tools: toolAnalytics,
    }),
    [clientAnalytics, projectAnalytics, teamAnalytics, toolAnalytics]
  );

  const metricCatalog = useMemo<Record<CategoryKey, MetricOption[]>>(() => {
    const clientActiveRate =
      analyticsSummary.clients.totalClients > 0
        ? analyticsSummary.clients.activeClients / analyticsSummary.clients.totalClients
        : 0;
    const prospectRate =
      analyticsSummary.clients.totalClients > 0
        ? analyticsSummary.clients.prospectClients / analyticsSummary.clients.totalClients
        : 0;

    const projectTotal = analyticsSummary.projects.totalProjects;
    const deploymentShare =
      projectTotal > 0 ? (analyticsSummary.projects.byStatus.deployed / projectTotal) * 100 : 0;
    const developmentShare =
      projectTotal > 0 ? (analyticsSummary.projects.byStatus.development / projectTotal) * 100 : 0;

    const teamActiveRate =
      analyticsSummary.team.totalMembers > 0
        ? (analyticsSummary.team.activeMembers / analyticsSummary.team.totalMembers) * 100
        : 0;

    const toolActiveRate =
      analyticsSummary.tools.totalTools > 0
        ? (analyticsSummary.tools.byStatus.active / analyticsSummary.tools.totalTools) * 100
        : 0;

    return {
      clients: [
        {
          id: 'totalClients',
          label: 'Total clients',
          description: 'Accounts currently managed across your practice.',
          compute: () => ({
            id: 'totalClients',
            label: 'Total clients',
            value: analyticsSummary.clients.totalClients.toString(),
            changeLabel: `${Math.round(clientActiveRate * 100)}% active mix`,
            trend:
              clientActiveRate >= 0.6 ? 'up' : clientActiveRate <= 0.3 ? 'down' : 'neutral',
          }),
        },
        {
          id: 'activeClients',
          label: 'Active clients',
          description: 'Clients with active retainers or live projects.',
          compute: () => ({
            id: 'activeClients',
            label: 'Active clients',
            value: analyticsSummary.clients.activeClients.toString(),
            progress:
              analyticsSummary.clients.totalClients > 0
                ? (analyticsSummary.clients.activeClients / analyticsSummary.clients.totalClients) * 100
                : 0,
            changeLabel: `${analyticsSummary.clients.prospectClients} prospects in pipeline`,
            trend:
              analyticsSummary.clients.prospectClients >= analyticsSummary.clients.inactiveClients
                ? 'up'
                : 'neutral',
          }),
        },
        {
          id: 'prospectClients',
          label: 'Prospect pipeline',
          description: 'Accounts in active pursuit or proposal stage.',
          compute: () => ({
            id: 'prospectClients',
            label: 'Prospect pipeline',
            value: analyticsSummary.clients.prospectClients.toString(),
            progress: prospectRate * 100,
            changeLabel: `${Math.round(prospectRate * 100)}% of total`,
            trend: prospectRate >= 0.2 ? 'up' : 'neutral',
          }),
        },
        {
          id: 'totalRevenue',
          label: 'Lifetime revenue',
          description: 'Aggregate value captured across all clients.',
          compute: () => ({
            id: 'totalRevenue',
            label: 'Lifetime revenue',
            value: formatCurrency(analyticsSummary.clients.totalRevenue),
            changeLabel: `Avg ${formatCurrency(
              analyticsSummary.clients.totalClients > 0
                ? analyticsSummary.clients.totalRevenue / analyticsSummary.clients.totalClients
                : 0
            )} per client`,
            trend:
              analyticsSummary.clients.totalRevenue >= 100000 ? 'up' : 'neutral',
          }),
        },
        {
          id: 'avgSatisfaction',
          label: 'Client satisfaction',
          description: 'Rolling satisfaction feedback from engagements.',
          compute: () => ({
            id: 'avgSatisfaction',
            label: 'Client satisfaction',
            value: `${analyticsSummary.clients.avgSatisfaction.toFixed(1)} / 5`,
            progress: (analyticsSummary.clients.avgSatisfaction / 5) * 100,
            changeLabel: 'Goal ≥ 4.5',
            trend:
              analyticsSummary.clients.avgSatisfaction >= 4.5
                ? 'up'
                : analyticsSummary.clients.avgSatisfaction < 4
                  ? 'down'
                  : 'neutral',
          }),
        },
        {
          id: 'avgResponseTime',
          label: 'Response time',
          description: 'Average hours to acknowledge client requests.',
          compute: () => ({
            id: 'avgResponseTime',
            label: 'Response time',
            value: `${analyticsSummary.clients.avgResponseTime.toFixed(1)}h`,
            progress: Math.max(
              0,
              Math.min(100, ((8 - analyticsSummary.clients.avgResponseTime) / 8) * 100)
            ),
            changeLabel: 'Target ≤ 3h',
            trend:
              analyticsSummary.clients.avgResponseTime <= 3
                ? 'up'
                : analyticsSummary.clients.avgResponseTime > 6
                  ? 'down'
                  : 'neutral',
          }),
        },
      ],
      projects: [
        {
          id: 'totalProjects',
          label: 'Total projects',
          description: 'All workstreams currently in motion.',
          compute: () => ({
            id: 'totalProjects',
            label: 'Total projects',
            value: analyticsSummary.projects.totalProjects.toString(),
            changeLabel: `${analyticsSummary.projects.byStatus.deployed} deployed`,
            trend:
              analyticsSummary.projects.byStatus.deployed >=
              analyticsSummary.projects.byStatus.development
                ? 'up'
                : 'neutral',
          }),
        },
        {
          id: 'developmentMix',
          label: 'In development',
          description: 'Projects actively being implemented.',
          compute: () => ({
            id: 'developmentMix',
            label: 'In development',
            value: analyticsSummary.projects.byStatus.development.toString(),
            progress: developmentShare,
            changeLabel: `${Math.round(developmentShare)}% of pipeline`,
            trend: developmentShare <= 45 ? 'up' : 'neutral',
          }),
        },
        {
          id: 'testingQueue',
          label: 'In testing',
          description: 'Initiatives in QA or validation.',
          compute: () => ({
            id: 'testingQueue',
            label: 'In testing',
            value: analyticsSummary.projects.byStatus.testing.toString(),
            progress:
              projectTotal > 0 ? (analyticsSummary.projects.byStatus.testing / projectTotal) * 100 : 0,
            changeLabel: `${analyticsSummary.projects.byStatus.testing} QA cycles`,
            trend:
              analyticsSummary.projects.byStatus.testing > analyticsSummary.projects.byStatus.development
                ? 'down'
                : 'neutral',
          }),
        },
        {
          id: 'totalSystems',
          label: 'Total systems',
          description: 'Automation systems tracked across delivery.',
          compute: () => ({
            id: 'totalSystems',
            label: 'Total systems',
            value: analyticsSummary.projects.totalSystems.toString(),
            changeLabel: `${analyticsSummary.projects.activeSystems} active`,
            trend:
              analyticsSummary.projects.activeSystems >= analyticsSummary.projects.totalSystems * 0.7
                ? 'up'
                : 'neutral',
          }),
        },
        {
          id: 'deployedProjects',
          label: 'Deployment rate',
          description: 'Share of work that has launched to production.',
          compute: () => ({
            id: 'deployedProjects',
            label: 'Deployment rate',
            value: analyticsSummary.projects.byStatus.deployed.toString(),
            progress: deploymentShare,
            changeLabel: `${Math.round(deploymentShare)}% deployed`,
            trend: deploymentShare >= 40 ? 'up' : 'neutral',
          }),
        },
      ],
      team: [
        {
          id: 'totalMembers',
          label: 'Team size',
          description: 'Total collaborators across the account.',
          compute: () => ({
            id: 'totalMembers',
            label: 'Team size',
            value: analyticsSummary.team.totalMembers.toString(),
            changeLabel: `${analyticsSummary.team.activeMembers} active`,
            trend:
              teamActiveRate >= 70 ? 'up' : teamActiveRate <= 40 ? 'down' : 'neutral',
          }),
        },
        {
          id: 'activeMembers',
          label: 'Active members',
          description: 'Contributors billing or shipping work this period.',
          compute: () => ({
            id: 'activeMembers',
            label: 'Active members',
            value: analyticsSummary.team.activeMembers.toString(),
            progress: teamActiveRate,
            changeLabel: `${Math.round(teamActiveRate)}% utilization`,
            trend: teamActiveRate >= 70 ? 'up' : 'neutral',
          }),
        },
        {
          id: 'avgProductivity',
          label: 'Productivity',
          description: 'Average monthly productivity score.',
          compute: () => ({
            id: 'avgProductivity',
            label: 'Productivity',
            value: `${Math.round(analyticsSummary.team.avgProductivity)}%`,
            progress: Math.min(100, analyticsSummary.team.avgProductivity),
            changeLabel: 'Target ≥ 75%',
            trend:
              analyticsSummary.team.avgProductivity >= 75
                ? 'up'
                : analyticsSummary.team.avgProductivity < 60
                  ? 'down'
                  : 'neutral',
          }),
        },
        {
          id: 'avgSatisfaction',
          label: 'Satisfaction',
          description: 'Team sentiment from retros and NPS.',
          compute: () => ({
            id: 'avgSatisfaction',
            label: 'Satisfaction',
            value: `${analyticsSummary.team.avgSatisfaction.toFixed(1)} / 5`,
            progress: (analyticsSummary.team.avgSatisfaction / 5) * 100,
            changeLabel: 'Goal ≥ 4.2',
            trend:
              analyticsSummary.team.avgSatisfaction >= 4.2
                ? 'up'
                : analyticsSummary.team.avgSatisfaction < 3.8
                  ? 'down'
                  : 'neutral',
          }),
        },
        {
          id: 'totalHours',
          label: 'Hours captured',
          description: 'Hours logged across delivery squads.',
          compute: () => ({
            id: 'totalHours',
            label: 'Hours captured',
            value: analyticsSummary.team.totalHours.toLocaleString(),
            changeLabel: 'Rolling 30 day view',
            trend: 'neutral',
          }),
        },
      ],
      tools: [
        {
          id: 'totalTools',
          label: 'Total tools',
          description: 'Automations, agents, and workflows catalogued.',
          compute: () => ({
            id: 'totalTools',
            label: 'Total tools',
            value: analyticsSummary.tools.totalTools.toString(),
            changeLabel: `${analyticsSummary.tools.byCategory['Automation'] ?? 0} automations`,
            trend: 'neutral',
          }),
        },
        {
          id: 'activeTools',
          label: 'Active tools',
          description: 'Automations currently running in production.',
          compute: () => ({
            id: 'activeTools',
            label: 'Active tools',
            value: analyticsSummary.tools.byStatus.active.toString(),
            progress: toolActiveRate,
            changeLabel: `${Math.round(toolActiveRate)}% live`,
            trend: toolActiveRate >= 60 ? 'up' : 'neutral',
          }),
        },
        {
          id: 'avgUsage',
          label: 'Usage rate',
          description: 'Average utilization across the stack.',
          compute: () => ({
            id: 'avgUsage',
            label: 'Usage rate',
            value: `${Math.round(analyticsSummary.tools.avgUsage)}%`,
            progress: analyticsSummary.tools.avgUsage,
            changeLabel: 'Target ≥ 75%',
            trend:
              analyticsSummary.tools.avgUsage >= 75
                ? 'up'
                : analyticsSummary.tools.avgUsage < 55
                  ? 'down'
                  : 'neutral',
          }),
        },
        {
          id: 'avgEfficiency',
          label: 'Efficiency',
          description: 'Median efficiency across automations.',
          compute: () => ({
            id: 'avgEfficiency',
            label: 'Efficiency',
            value: `${Math.round(analyticsSummary.tools.avgEfficiency)}%`,
            progress: analyticsSummary.tools.avgEfficiency,
            changeLabel: 'Target ≥ 80%',
            trend:
              analyticsSummary.tools.avgEfficiency >= 80
                ? 'up'
                : analyticsSummary.tools.avgEfficiency < 65
                  ? 'down'
                  : 'neutral',
          }),
        },
        {
          id: 'totalCostSavings',
          label: 'Cost savings',
          description: 'Documented savings generated by automation.',
          compute: () => ({
            id: 'totalCostSavings',
            label: 'Cost savings',
            value: formatCurrency(analyticsSummary.tools.totalCostSavings),
            changeLabel: 'Annualized impact',
            trend: 'up',
          }),
        },
      ],
    };
  }, [analyticsSummary]);

  const metricsByCategory = useMemo<Record<CategoryKey, Record<string, CategoryMetric>>>(() => {
    const catalogEntries = {} as Record<CategoryKey, Record<string, CategoryMetric>>;
    (Object.keys(metricCatalog) as CategoryKey[]).forEach((category) => {
      catalogEntries[category] = metricCatalog[category].reduce<Record<string, CategoryMetric>>((acc, option) => {
        acc[option.id] = option.compute();
        return acc;
      }, {});
    });
    return catalogEntries;
  }, [metricCatalog]);

  const metricOrder = useMemo<Record<CategoryKey, string[]>>(() => {
    const order = {} as Record<CategoryKey, string[]>;
    (Object.keys(metricCatalog) as CategoryKey[]).forEach((category) => {
      order[category] = metricCatalog[category].map((option) => option.id);
    });
    return order;
  }, [metricCatalog]);

  useEffect(() => {
    setMetricSelections((prev) => {
      let changed = false;
      const next: Record<CategoryKey, string[]> = {
        clients: [...prev.clients],
        projects: [...prev.projects],
        team: [...prev.team],
        tools: [...prev.tools],
      };

      (Object.keys(metricCatalog) as CategoryKey[]).forEach((category) => {
        const availableIds = new Set(metricCatalog[category].map((option) => option.id));
        const current = prev[category] ?? [];
        const filtered = current.filter((id) => availableIds.has(id));

        if (filtered.length === 0) {
          next[category] = metricCatalog[category].slice(0, 3).map((option) => option.id);
          changed = true;
        } else if (filtered.length !== current.length) {
          next[category] = filtered;
          changed = true;
        } else {
          next[category] = [...filtered];
        }
      });

      return changed ? next : prev;
    });
  }, [metricCatalog]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metricSelections));
    }
  }, [metricSelections]);

  const openCustomize = () => {
    setDraftSelections(cloneSelections(metricSelections));
    setIsCustomizeOpen(true);
  };

  const toggleDraftMetric = (category: CategoryKey, metricId: string) => {
    setDraftSelections((prev) => {
      const current = prev[category] ?? [];
      const nextSelection = current.includes(metricId)
        ? current.filter((id) => id !== metricId)
        : [...current, metricId];

      return {
        ...prev,
        [category]: nextSelection,
      };
    });
  };

  const moveDraftMetric = (category: CategoryKey, metricId: string, direction: 'up' | 'down') => {
    setDraftSelections((prev) => {
      const current = prev[category] ?? [];
      const index = current.indexOf(metricId);
      if (index === -1) {
        return prev;
      }

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= current.length) {
        return prev;
      }

      const reordered = [...current];
      const temp = reordered[index];
      reordered[index] = reordered[swapIndex];
      reordered[swapIndex] = temp;

      return {
        ...prev,
        [category]: reordered,
      };
    });
  };

  const resetCustomization = () => {
    setDraftSelections(cloneSelections(DEFAULT_SELECTIONS));
  };

  const saveCustomization = () => {
    setMetricSelections(cloneSelections(draftSelections));
    setIsCustomizeOpen(false);
  };

  const disableSave = visibleCategories.some((category) => (draftSelections[category.key] ?? []).length === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Intelligence dashboard</h1>
          <p className="text-sm text-[var(--fg-muted)]">
            Adaptive analytics across clients, projects, team, and tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(event) => setSelectedTimeframe(event.target.value as typeof selectedTimeframe)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            type="button"
            onClick={openCustomize}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Edit className="h-4 w-4" />
            Customize
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleCategories.map((category) => {
          const availableIds = metricOrder[category.key] ?? [];
          const selectedIds = (metricSelections[category.key] ?? []).filter((id) => availableIds.includes(id));
          const displayIds = selectedIds.length > 0 ? selectedIds : availableIds.slice(0, 3);
          const metrics = displayIds
            .map((id) => metricsByCategory[category.key]?.[id])
            .filter((metric): metric is CategoryMetric => Boolean(metric));

          return (
            <StatsCard
              key={category.key}
              title={category.title}
              icon={category.icon}
              accent={category.accent}
              metrics={metrics}
              onClick={() => setActiveCategory(category.key)}
              active={activeCategory === category.key}
            />
          );
        })}
      </div>

      <Card className="p-6 bg-[var(--surface)]/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--fg)]">Dashboard focus</h3>
            <p className="text-sm text-[var(--fg-muted)]">
              Selections are saved for your workspace and automatically hydrate on return.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--fg-muted)]">
            <span>Timeframe</span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--fg)]">
              {selectedTimeframe === 'week' && 'This week'}
              {selectedTimeframe === 'month' && 'This month'}
              {selectedTimeframe === 'quarter' && 'This quarter'}
              {selectedTimeframe === 'year' && 'This year'}
            </span>
          </div>
        </div>
      </Card>

      <CategoryDetailModal
        isOpen={Boolean(activeCategory)}
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
        analytics={analyticsSummary}
        metrics={metricsByCategory}
        metricOrder={metricOrder}
        metadata={CATEGORY_METADATA}
      />

      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/15 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--fg)]">Customize dashboard</h2>
                <p className="text-sm text-[var(--fg-muted)]">
                  Choose the metrics that appear for each category at the top of the dashboard.
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {visibleCategories.map((category) => {
                const options = metricCatalog[category.key];

                return (
                  <Card key={category.key} className="p-5 bg-[var(--surface)]/60">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--fg)]">{category.title}</h3>
                        <p className="text-sm text-[var(--fg-muted)]">{category.description}</p>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">
                        {draftSelections[category.key]?.length ?? 0} selected
                      </span>
                    </div>
                    <div className="space-y-3">
                      {options.map((option) => {
                        const isSelected = draftSelections[category.key]?.includes(option.id) ?? false;
                        const index = draftSelections[category.key]?.indexOf(option.id) ?? -1;
                        return (
                          <div
                            key={option.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3"
                          >
                            <label className="flex flex-1 cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleDraftMetric(category.key, option.id)}
                                className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--accent-purple)] focus:ring-[var(--accent-pink)]"
                              />
                              <span>
                                <span className="block text-sm font-semibold text-[var(--fg)]">{option.label}</span>
                                <span className="block text-xs text-[var(--fg-muted)]">{option.description}</span>
                              </span>
                            </label>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => moveDraftMetric(category.key, option.id, 'up')}
                                disabled={!isSelected || index <= 0}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--fg-muted)] hover:text-[var(--fg)] disabled:opacity-40"
                                aria-label="Move metric up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveDraftMetric(category.key, option.id, 'down')}
                                disabled={!isSelected || index === (draftSelections[category.key]?.length ?? 0) - 1}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--fg-muted)] hover:text-[var(--fg)] disabled:opacity-40"
                                aria-label="Move metric down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)]/80 px-6 py-4">
              <button
                type="button"
                onClick={resetCustomization}
                className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                Reset to defaults
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--surface)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCustomization}
                  disabled={disableSave}
                  className="rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save selections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
