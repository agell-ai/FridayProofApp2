import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Handshake,
  FolderOpen,
  Users,
  Wrench,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';

import StatsCard from '../components/Dashboard/StatsCard';
import { Card } from '../components/Shared/Card';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useTools } from '../hooks/useTools';
import type { Client, Project, TeamMember } from '../types';
import type { Tool } from '../types/tools';
import {
  CATEGORY_METADATA,
  CATEGORY_ORDER,
  type MetricCategory,
  type MetricCategoryMetadata,
} from './dashboardCategories';

const ACTIVE_PROJECT_STATUSES = new Set(['planning', 'development', 'testing', 'maintenance']);
const METRIC_STORAGE_KEY = 'friday-dashboard-metric-selections';
const METRICS_PER_CATEGORY = 3;

const TONE_CLASSES = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  neutral: 'text-[var(--fg-muted)]',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-rose-600 dark:text-rose-400',
} as const;

type MetricTone = keyof typeof TONE_CLASSES;


type MetricDetailStat = {
  label: string;
  value: string;
  tone?: MetricTone;
};

type MetricDetail = {
  title: string;
  description: string;
  stats: MetricDetailStat[];
  insights?: string[];
  footnote?: string;
};

type MetricComputedValue = {
  value: string;
  change?: string;
  changeTone?: MetricTone;
  secondaryLabel?: string;
  detail: MetricDetail;
};

type MetricDefinition = {
  id: string;
  label: string;
  description: string;
  tags?: string[];
  compute: (context: MetricComputeContext) => MetricComputedValue;
};

type MetricResult = MetricComputedValue & {
  id: string;
  label: string;
  description: string;
  tags?: string[];
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatDecimal = (value: number, digits = 1): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatPercent = (value: number, digits = 0): string =>
  `${Number.isFinite(value) ? value.toFixed(digits) : '0'}%`;

const formatHours = (value: number): string => `${formatNumber(value)} hrs`;

const formatList = (items: string[]): string => items.join(', ');

type ProposalSummary = {
  title: string;
  value: number;
  status: string;
};

type ClientAnalyticsSummary = {
  clients: Client[];
  totalClients: number;
  activeClients: Client[];
  inactiveClients: Client[];
  prospectClients: Client[];
  totalRevenue: number;
  monthlyRevenue: number;
  avgSatisfaction: number;
  avgResponseTime: number;
  totalProjects: number;
  averageProjectsPerClient: number;
  industriesCoverage: Record<string, number>;
  proposals: {
    total: number;
    accepted: number;
    sent: number;
    pending: number;
    winRate: number;
    acceptedValue: number;
    pipelineValue: number;
    highestValue?: ProposalSummary;
  };
  invoices: {
    total: number;
    paid: number;
    overdue: number;
    pending: number;
    outstandingAmount: number;
    paidAmount: number;
  };
  topRevenueClients: Array<{ id: string; name: string; revenue: number; status: string; projects: number }>;
  topSatisfactionClients: Array<{ id: string; name: string; satisfaction: number; responseTime: number; projects: number }>;
};

type ProjectAnalyticsSummary = {
  projects: Project[];
  totalProjects: number;
  statusCounts: Record<Project['status'], number>;
  activeProjects: Project[];
  deployedProjects: Project[];
  maintenanceProjects: Project[];
  totalSystems: number;
  activeSystems: number;
  testingSystems: number;
  systemStatusCounts: Record<string, number>;
  systemTypeCounts: Record<string, number>;
  automationDensity: number;
  averageTeamSize: number;
  maxTeamSize: number;
  totalAssignments: number;
  clientsWithProjects: number;
  clientsWithActiveProjects: number;
  topProjects: Array<{ id: string; name: string; status: Project['status']; systems: number; teamSize: number }>;
};

type TeamAnalyticsSummary = {
  teamMembers: TeamMember[];
  totalMembers: number;
  activeMembers: TeamMember[];
  roleCounts: Record<TeamMember['role'], number>;
  avgProductivity: number;
  avgSatisfaction: number;
  totalHours: number;
  totalProjectsDelivered: number;
  creators: {
    toolsCreated: number;
    templatesCreated: number;
    libraryContributions: number;
    marketplaceItems: number;
  };
  crossFunctionalMembers: number;
  averageClientsSupported: number;
  topProductiveMembers: Array<{
    id: string;
    name: string;
    productivity: number;
    projectsCompleted: number;
    role: TeamMember['role'];
  }>;
};

type AutomationAnalyticsSummary = {
  tools: Tool[];
  totalTools: number;
  activeTools: Tool[];
  testingTools: Tool[];
  statusCounts: Record<Tool['status'], number>;
  categoryCounts: Record<Tool['category'], number>;
  totalCostSavings: number;
  totalRuns: number;
  avgUsage: number;
  avgEfficiency: number;
  avgUptime: number;
  averageProcessingTime: number;
  coverage: {
    categories: number;
    activeCategories: number;
  };
  automationLeaders: Array<{ id: string; name: string; usage: number; clientName: string }>;
};

type MetricComputeContext = {
  clients: ClientAnalyticsSummary;
  projects: ProjectAnalyticsSummary;
  team: TeamAnalyticsSummary;
  automation: AutomationAnalyticsSummary;
};

const metricCatalog: Record<MetricCategory, MetricDefinition[]> = {
  clients: [
    {
      id: 'active-clients',
      label: 'Active client coverage',
      description: 'Track coverage of active clients alongside pipeline velocity.',
      tags: ['portfolio', 'pipeline'],
      compute: ({ clients }) => {
        const activeCount = clients.activeClients.length;
        const prospectCount = clients.prospectClients.length;
        const inactiveCount = clients.inactiveClients.length;
        const total = clients.totalClients;
        const coverage = total > 0 ? (activeCount / total) * 100 : 0;

        return {
          value: formatNumber(activeCount),
          change: `${formatNumber(prospectCount)} prospect${prospectCount === 1 ? '' : 's'} in pipeline`,
          changeTone: prospectCount > 0 ? 'positive' : 'neutral',
          secondaryLabel:
            total > 0
              ? `${formatPercent(coverage, 0)} of portfolio · Avg ${formatDecimal(
                  clients.averageProjectsPerClient,
                  1
                )} projects/client`
              : 'Invite your first client to begin tracking coverage.',
          detail: {
            title: 'Client lifecycle distribution',
            description: 'Active accounts, prospects, and inactive relationships.',
            stats: [
              {
                label: 'Portfolio coverage',
                value: formatPercent(coverage, 0),
                tone: coverage >= 60 ? 'positive' : coverage >= 30 ? 'neutral' : 'warning',
              },
              {
                label: 'Prospect pipeline',
                value: formatNumber(prospectCount),
                tone: prospectCount > 0 ? 'positive' : 'neutral',
              },
              {
                label: 'Inactive relationships',
                value: formatNumber(inactiveCount),
              },
            ],
            insights:
              clients.topRevenueClients.length > 0
                ? clients.topRevenueClients.map(
                    (client) =>
                      `${client.name} · ${formatCurrency(client.revenue)} lifetime value across ${client.projects} project${
                        client.projects === 1 ? '' : 's'
                      }.`
                  )
                : ['Add client records to populate revenue insights.'],
          },
        };
      },
    },
    {
      id: 'recurring-revenue',
      label: 'Monthly revenue run rate',
      description: 'How much revenue is materializing across active accounts.',
      tags: ['revenue', 'billing'],
      compute: ({ clients }) => {
        const activeCount = clients.activeClients.length || 1;
        const outstanding = clients.invoices.outstandingAmount;
        const avgPerClient = clients.monthlyRevenue / activeCount;

        return {
          value: formatCurrency(clients.monthlyRevenue),
          change: `Lifetime ${formatCurrency(clients.totalRevenue)}`,
          changeTone: 'positive',
          secondaryLabel: `Avg ${formatCurrency(avgPerClient)} per active client`,
          detail: {
            title: 'Revenue momentum',
            description: 'Monthly recurring revenue alongside pipeline and collections health.',
            stats: [
              {
                label: 'Monthly run rate',
                value: formatCurrency(clients.monthlyRevenue),
                tone: 'positive',
              },
              {
                label: 'Lifetime revenue',
                value: formatCurrency(clients.totalRevenue),
                tone: 'positive',
              },
              {
                label: 'Outstanding invoices',
                value: formatCurrency(outstanding),
                tone: outstanding > 0 ? 'warning' : 'positive',
              },
            ],
            insights:
              clients.topRevenueClients.length > 0
                ? clients.topRevenueClients.map(
                    (client) =>
                      `${client.name} drives ${formatCurrency(client.revenue)} in lifetime value (${client.projects} project${
                        client.projects === 1 ? '' : 's'
                      }).`
                  )
                : ['No revenue captured yet. Log engagements to populate insights.'],
          },
        };
      },
    },
    {
      id: 'client-satisfaction',
      label: 'Client satisfaction pulse',
      description: 'Blend satisfaction scores with responsiveness indicators.',
      tags: ['experience', 'service'],
      compute: ({ clients }) => {
        const rating = clients.avgSatisfaction;
        const responseTime = clients.avgResponseTime;
        const tone = rating >= 4.5 ? 'positive' : rating >= 4 ? 'neutral' : 'warning';
        const responseTone = responseTime <= 3 ? 'positive' : responseTime <= 6 ? 'neutral' : 'warning';
        const topClient = clients.topSatisfactionClients[0];

        return {
          value: `${formatDecimal(rating, 1)}/5`,
          change: `Avg response ${formatDecimal(responseTime, 1)}h`,
          changeTone: responseTone,
          secondaryLabel: topClient
            ? `${topClient.name} leads at ${formatDecimal(topClient.satisfaction, 1)}/5`
            : 'Gather feedback to establish a baseline.',
          detail: {
            title: 'Service quality snapshot',
            description: 'Average satisfaction, responsiveness, and standout accounts.',
            stats: [
              {
                label: 'Average satisfaction',
                value: `${formatDecimal(rating, 1)}/5`,
                tone,
              },
              {
                label: 'Average response time',
                value: `${formatDecimal(responseTime, 1)} hrs`,
                tone: responseTone,
              },
              {
                label: 'Top rated client',
                value: topClient
                  ? `${topClient.name} · ${formatDecimal(topClient.satisfaction, 1)}/5`
                  : 'Pending feedback',
                tone: topClient ? 'positive' : 'neutral',
              },
            ],
            insights: [
              `Maintain sub-${formatDecimal(Math.max(responseTime - 1, 2), 0)} hour responses for enterprise accounts.`,
              topClient
                ? `${topClient.name} shows the strongest satisfaction—capture testimonial insights while momentum is high.`
                : 'Capture CSAT and response metrics across engagements to surface coaching moments.',
            ],
          },
        };
      },
    },
    {
      id: 'proposal-win-rate',
      label: 'Proposal win rate',
      description: 'Conversion velocity for in-flight and closed proposals.',
      tags: ['pipeline', 'conversion'],
      compute: ({ clients }) => {
        const { proposals } = clients;
        const winRate = proposals.winRate;
        const tone = winRate >= 50 ? 'positive' : winRate >= 30 ? 'neutral' : 'warning';
        const pending = proposals.pending;
        const highest = proposals.highestValue;

        return {
          value: formatPercent(winRate, 0),
          change:
            proposals.total > 0
              ? `${formatNumber(proposals.accepted)} won · ${formatNumber(proposals.total)} total`
              : 'No proposals sent yet',
          changeTone: tone,
          secondaryLabel:
            pending > 0
              ? `${formatNumber(pending)} awaiting decision · $${formatNumber(
                  Math.round(proposals.pipelineValue / 1000)
                )}k in pipeline`
              : 'No pending proposals',
          detail: {
            title: 'Commercial conversion',
            description: 'Closed-won performance, outstanding follow-ups, and top-line value.',
            stats: [
              {
                label: 'Total proposals',
                value: formatNumber(proposals.total),
              },
              {
                label: 'Accepted value',
                value: formatCurrency(proposals.acceptedValue),
                tone: 'positive',
              },
              {
                label: 'Pipeline value',
                value: formatCurrency(proposals.pipelineValue),
                tone: pending > 0 ? 'warning' : 'neutral',
              },
            ],
            insights: [
              proposals.total > 0
                ? `${formatNumber(proposals.accepted)} proposal${
                    proposals.accepted === 1 ? ' has' : 's have'
                  } been accepted this period.`
                : 'Send proposals to begin tracking conversion health.',
              highest
                ? `Highest value opportunity: ${highest.title} (${formatCurrency(highest.value)}) currently ${highest.status}.`
                : 'Surface large opportunities early to align the delivery team.',
            ],
          },
        };
      },
    },
    {
      id: 'collections-health',
      label: 'Collections health',
      description: 'Monitor payments received and outstanding balances.',
      tags: ['finance', 'cash flow'],
      compute: ({ clients }) => {
        const { invoices } = clients;
        const outstanding = invoices.outstandingAmount;
        const overdueTone = outstanding > 0 ? 'warning' : 'positive';

        return {
          value: formatCurrency(outstanding),
          change: `${formatNumber(invoices.overdue)} overdue · ${formatNumber(invoices.pending)} pending`,
          changeTone: overdueTone,
          secondaryLabel: `${formatNumber(invoices.paid)} paid invoices · ${formatCurrency(invoices.paidAmount)} collected`,
          detail: {
            title: 'Billing and payments',
            description: 'Balance cash flow with outstanding receivables.',
            stats: [
              {
                label: 'Outstanding balance',
                value: formatCurrency(outstanding),
                tone: overdueTone,
              },
              {
                label: 'Overdue invoices',
                value: formatNumber(invoices.overdue),
                tone: invoices.overdue > 0 ? 'warning' : 'positive',
              },
              {
                label: 'Collected to date',
                value: formatCurrency(invoices.paidAmount),
                tone: 'positive',
              },
            ],
            insights: [
              overdueTone === 'warning'
                ? 'Prioritize outreach on overdue invoices to stabilize cash flow.'
                : 'All invoices are current—keep finance and delivery teams aligned on renewals.',
              `Pipeline proposals represent ${formatCurrency(clients.proposals.pipelineValue)} in potential new revenue.`,
            ],
          },
        };
      },
    },
  ],
  projects: [
    {
      id: 'projects-in-flight',
      label: 'Projects in motion',
      description: 'Visibility into engagements that are actively being delivered.',
      tags: ['delivery', 'progress'],
      compute: ({ projects }) => {
        const activeCount = projects.activeProjects.length;
        const total = projects.totalProjects;
        const testingCount = projects.statusCounts.testing ?? 0;
        const coverage = total > 0 ? (activeCount / total) * 100 : 0;

        return {
          value: formatNumber(activeCount),
          change: `${formatNumber(testingCount)} project${testingCount === 1 ? '' : 's'} in testing`,
          changeTone: testingCount > 0 ? 'neutral' : 'positive',
          secondaryLabel:
            total > 0
              ? `${formatPercent(coverage, 0)} of portfolio active`
              : 'No projects in flight—spin up a project to begin tracking delivery.',
          detail: {
            title: 'Delivery pipeline',
            description: 'Where active workstreams sit across the lifecycle.',
            stats: [
              { label: 'Planning', value: formatNumber(projects.statusCounts.planning ?? 0) },
              { label: 'Development', value: formatNumber(projects.statusCounts.development ?? 0) },
              { label: 'Testing', value: formatNumber(projects.statusCounts.testing ?? 0) },
            ],
            insights:
              projects.topProjects.length > 0
                ? projects.topProjects.map(
                    (project) =>
                      `${project.name} (${project.systems} system${project.systems === 1 ? '' : 's'}) with ${project.teamSize} team member${
                        project.teamSize === 1 ? '' : 's'
                      } assigned.`
                  )
                : ['Create project records to unlock delivery analytics.'],
          },
        };
      },
    },
    {
      id: 'deployment-rate',
      label: 'Deployment rate',
      description: 'How quickly workstreams are reaching production.',
      tags: ['outcomes', 'velocity'],
      compute: ({ projects, clients }) => {
        const total = projects.totalProjects;
        const deployed = projects.deployedProjects.length;
        const maintenance = projects.maintenanceProjects.length;
        const rate = total > 0 ? (deployed / total) * 100 : 0;
        const tone = rate >= 40 ? 'positive' : rate >= 25 ? 'neutral' : 'warning';
        const activeClientsCoverage =
          clients.totalClients > 0
            ? (projects.clientsWithActiveProjects / clients.totalClients) * 100
            : 0;

        return {
          value: formatPercent(rate, 0),
          change: `${formatNumber(deployed)} deployed · ${formatNumber(maintenance)} in maintenance`,
          changeTone: tone,
          secondaryLabel:
            clients.totalClients > 0
              ? `${formatPercent(activeClientsCoverage, 0)} of clients have an active project`
              : 'Add clients to understand delivery coverage.',
          detail: {
            title: 'Launch momentum',
            description: 'Balance active delivery with live operations maintenance.',
            stats: [
              {
                label: 'Deployment rate',
                value: formatPercent(rate, 0),
                tone,
              },
              {
                label: 'Live maintenance',
                value: formatNumber(maintenance),
              },
              {
                label: 'Clients with live projects',
                value: formatNumber(projects.clientsWithActiveProjects),
              },
            ],
            insights: [
              deployed > 0
                ? `${formatNumber(deployed)} project${deployed === 1 ? ' is' : 's are'} in production.`
                : 'No deployments yet—align delivery and enablement teams to push launches over the line.',
              projects.clientsWithActiveProjects > 0
                ? `${formatPercent(activeClientsCoverage, 0)} of clients are currently live.`
                : 'Activate client projects to increase deployment coverage.',
            ],
          },
        };
      },
    },
    {
      id: 'automation-density',
      label: 'Automation density',
      description: 'Average systems deployed per project in flight.',
      tags: ['automation', 'architecture'],
      compute: ({ projects }) => {
        const density = projects.automationDensity;
        const totalSystems = projects.totalSystems;
        const testingSystems = projects.testingSystems;

        return {
          value: formatDecimal(density, 1),
          change: `${formatNumber(totalSystems)} total systems · ${formatNumber(testingSystems)} in testing`,
          changeTone: testingSystems > 0 ? 'neutral' : 'positive',
          secondaryLabel: `Avg team size ${formatDecimal(projects.averageTeamSize, 1)} · Max ${formatNumber(projects.maxTeamSize)}`,
          detail: {
            title: 'Systems footprint',
            description: 'Inventory of automation and AI systems powering each project.',
            stats: [
              {
                label: 'Active systems',
                value: formatNumber(projects.activeSystems),
                tone: 'positive',
              },
              {
                label: 'Testing systems',
                value: formatNumber(testingSystems),
                tone: testingSystems > 0 ? 'warning' : 'neutral',
              },
              {
                label: 'System types',
                value: `${formatNumber(Object.keys(projects.systemTypeCounts).length)} categories`,
              },
            ],
            insights: [
              density >= 2
                ? 'Projects are well instrumented—keep investing in re-usable patterns.'
                : 'Consider layering additional automation to improve throughput.',
              `Top system load: ${projects.topProjects
                .map((project) => `${project.name} (${project.systems})`)
                .join(', ') || 'Add systems to begin tracking density.'}`,
            ],
          },
        };
      },
    },
    {
      id: 'team-allocation',
      label: 'Team allocation',
      description: 'How delivery capacity is distributed across engagements.',
      tags: ['resourcing', 'planning'],
      compute: ({ projects }) => {
        const averageTeamSize = projects.averageTeamSize;
        const totalAssignments = projects.totalAssignments;
        const tone = averageTeamSize >= 3 && averageTeamSize <= 6 ? 'positive' : 'neutral';

        return {
          value: formatDecimal(averageTeamSize, 1),
          change: `${formatNumber(totalAssignments)} total assignments across portfolio`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(projects.clientsWithProjects)} clients supported`,
          detail: {
            title: 'Capacity distribution',
            description: 'Balance staffing across initiatives and client accounts.',
            stats: [
              {
                label: 'Average team size',
                value: formatDecimal(averageTeamSize, 1),
                tone,
              },
              {
                label: 'Max team size',
                value: formatNumber(projects.maxTeamSize),
              },
              {
                label: 'Clients covered',
                value: formatNumber(projects.clientsWithProjects),
              },
            ],
            insights: [
              averageTeamSize > 6
                ? 'Large delivery pods detected—review if work can be modularized.'
                : 'Team sizes are within the target range for balanced delivery.',
              `Top staffing demand: ${
                projects.topProjects.length > 0
                  ? projects.topProjects.map((project) => `${project.name} (${project.teamSize})`).join(', ')
                  : 'Add projects to understand staffing patterns.'
              }`,
            ],
          },
        };
      },
    },
    {
      id: 'client-coverage',
      label: 'Client delivery coverage',
      description: 'Share of clients with an active delivery engagement.',
      tags: ['portfolio', 'coverage'],
      compute: ({ projects, clients }) => {
        const totalClients = clients.totalClients;
        const engaged = projects.clientsWithActiveProjects;
        const coverage = totalClients > 0 ? (engaged / totalClients) * 100 : 0;
        const tone = coverage >= 60 ? 'positive' : coverage >= 30 ? 'neutral' : 'warning';

        return {
          value: formatPercent(coverage, 0),
          change:
            totalClients > 0
              ? `${formatNumber(engaged)} of ${formatNumber(totalClients)} clients`
              : 'No clients configured yet',
          changeTone: tone,
          secondaryLabel: `${formatNumber(projects.totalProjects)} total projects`,
          detail: {
            title: 'Portfolio activation',
            description: 'Gauge how many client relationships have active delivery work.',
            stats: [
              {
                label: 'Active clients',
                value: formatNumber(engaged),
                tone,
              },
              {
                label: 'Total clients',
                value: formatNumber(totalClients),
              },
              {
                label: 'Projects in portfolio',
                value: formatNumber(projects.totalProjects),
              },
            ],
            insights: [
              coverage >= 60
                ? 'Strong coverage across the client base—monitor renewals to sustain momentum.'
                : 'Activate dormant accounts with discovery sessions or pilot proposals.',
              `Current pipeline: ${formatNumber(projects.activeProjects.length)} active · ${formatNumber(
                projects.deployedProjects.length
              )} deployed.`,
            ],
          },
        };
      },
    },
  ],
  team: [
    {
      id: 'active-collaborators',
      label: 'Active collaborators',
      description: 'Team members with live contributions across engagements.',
      tags: ['workforce', 'capacity'],
      compute: ({ team }) => {
        const activeCount = team.activeMembers.length;
        const total = team.totalMembers;
        const coverage = total > 0 ? (activeCount / total) * 100 : 0;
        const tone = coverage >= 80 ? 'positive' : coverage >= 60 ? 'neutral' : 'warning';

        return {
          value: formatNumber(activeCount),
          change: `${formatPercent(coverage, 0)} of team active`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(team.roleCounts.manager ?? 0)} managers · ${formatNumber(
            team.roleCounts.contractor ?? 0
          )} contractors`,
          detail: {
            title: 'Team engagement',
            description: 'Breakdown of active talent across roles and status.',
            stats: [
              {
                label: 'Employees',
                value: formatNumber(team.roleCounts.employee ?? 0),
              },
              {
                label: 'Contractors',
                value: formatNumber(team.roleCounts.contractor ?? 0),
              },
              {
                label: 'Managers',
                value: formatNumber(team.roleCounts.manager ?? 0),
              },
            ],
            insights: [
              coverage >= 80
                ? 'Most of the team is engaged—monitor workload to avoid burnout.'
                : 'Several teammates are under-utilized—rebalance assignments.',
              team.topProductiveMembers.length > 0
                ? `Top contributors: ${formatList(
                    team.topProductiveMembers.map(
                      (member) => `${member.name} (${formatPercent(member.productivity, 0)})`
                    )
                  )}`
                : 'Invite collaborators to capture productivity insights.',
            ],
          },
        };
      },
    },
    {
      id: 'team-utilization',
      label: 'Team utilization',
      description: 'Average monthly productivity and satisfaction scores.',
      tags: ['productivity', 'experience'],
      compute: ({ team }) => {
        const utilization = team.avgProductivity;
        const satisfaction = team.avgSatisfaction;
        const tone = utilization >= 85 ? 'positive' : utilization >= 70 ? 'neutral' : 'warning';
        const satisfactionTone = satisfaction >= 4.5 ? 'positive' : satisfaction >= 4 ? 'neutral' : 'warning';

        return {
          value: formatPercent(utilization, 0),
          change: `Satisfaction ${formatDecimal(satisfaction, 1)}/5`,
          changeTone: satisfactionTone,
          secondaryLabel: `${formatNumber(team.totalProjectsDelivered)} projects delivered`,
          detail: {
            title: 'Productivity pulse',
            description: 'Blend utilization, satisfaction, and workload to inform resourcing.',
            stats: [
              {
                label: 'Average productivity',
                value: formatPercent(utilization, 0),
                tone,
              },
              {
                label: 'Average satisfaction',
                value: `${formatDecimal(satisfaction, 1)}/5`,
                tone: satisfactionTone,
              },
              {
                label: 'Hours logged',
                value: formatHours(team.totalHours),
              },
            ],
            insights: [
              utilization >= 90
                ? 'Utilization is high—hold capacity planning sessions with project leads.'
                : 'Utilization headroom is available—consider accelerating backlog initiatives.',
              `Marketplace contributions: ${formatNumber(team.creators.marketplaceItems)} published assets.`,
            ],
          },
        };
      },
    },
    {
      id: 'delivery-output',
      label: 'Delivery output',
      description: 'Project completions and enablement assets produced.',
      tags: ['output', 'impact'],
      compute: ({ team }) => {
        const tone = team.totalProjectsDelivered > 0 ? 'positive' : 'neutral';

        return {
          value: formatNumber(team.totalProjectsDelivered),
          change: `${formatHours(team.totalHours)} contributed`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(team.creators.toolsCreated)} tools · ${formatNumber(
            team.creators.templatesCreated
          )} templates`,
          detail: {
            title: 'Delivery impact',
            description: 'Connect shipped projects to reusable assets created by the team.',
            stats: [
              {
                label: 'Tools built',
                value: formatNumber(team.creators.toolsCreated),
                tone: 'positive',
              },
              {
                label: 'Templates published',
                value: formatNumber(team.creators.templatesCreated),
              },
              {
                label: 'Library contributions',
                value: formatNumber(team.creators.libraryContributions),
              },
            ],
            insights: [
              team.topProductiveMembers.length > 0
                ? `${team.topProductiveMembers[0].name} leads with ${formatNumber(
                    team.topProductiveMembers[0].projectsCompleted
                  )} completed projects.`
                : 'Document team completions to highlight standout contributors.',
              `Marketplace assets live: ${formatNumber(team.creators.marketplaceItems)}.`,
            ],
          },
        };
      },
    },
    {
      id: 'cross-functional',
      label: 'Cross-functional coverage',
      description: 'Collaboration across clients and internal squads.',
      tags: ['collaboration', 'accounts'],
      compute: ({ team }) => {
        const crossFunctional = team.crossFunctionalMembers;
        const total = team.totalMembers;
        const coverage = total > 0 ? (crossFunctional / total) * 100 : 0;
        const tone = coverage >= 40 ? 'positive' : coverage >= 25 ? 'neutral' : 'warning';

        return {
          value: formatNumber(crossFunctional),
          change: `${formatPercent(coverage, 0)} of team`,
          changeTone: tone,
          secondaryLabel: `Avg clients supported ${formatDecimal(team.averageClientsSupported, 1)}`,
          detail: {
            title: 'Multi-client collaboration',
            description: 'Understand how talent is shared across accounts.',
            stats: [
              {
                label: 'Cross-functional members',
                value: formatNumber(crossFunctional),
                tone,
              },
              {
                label: 'Average clients supported',
                value: formatDecimal(team.averageClientsSupported, 1),
              },
              {
                label: 'Marketplace assets',
                value: formatNumber(team.creators.marketplaceItems),
              },
            ],
            insights: [
              coverage >= 40
                ? 'Cross-functional coverage is healthy—maintain shared context with weekly syncs.'
                : 'Introduce shadowing or rotational programs to widen cross-client expertise.',
              `Top collaborators: ${formatList(
                team.topProductiveMembers
                  .slice(0, 2)
                  .map((member) => `${member.name} (${formatPercent(member.productivity, 0)})`)
              ) || 'Add team metrics to highlight collaborators.'}`,
            ],
          },
        };
      },
    },
    {
      id: 'enablement-assets',
      label: 'Enablement assets',
      description: 'Reusable automations and templates ready for redeployment.',
      tags: ['enablement', 'assets'],
      compute: ({ team }) => {
        const totalAssets =
          team.creators.toolsCreated + team.creators.templatesCreated + team.creators.libraryContributions;
        const tone = totalAssets > 0 ? 'positive' : 'neutral';

        return {
          value: formatNumber(totalAssets),
          change: `${formatNumber(team.creators.toolsCreated)} tools · ${formatNumber(
            team.creators.templatesCreated
          )} templates`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(team.creators.libraryContributions)} library items shared`,
          detail: {
            title: 'Reusable catalog',
            description: 'Track the inventory of assets that accelerate future delivery.',
            stats: [
              {
                label: 'Automation tools',
                value: formatNumber(team.creators.toolsCreated),
              },
              {
                label: 'Templates',
                value: formatNumber(team.creators.templatesCreated),
              },
              {
                label: 'Library contributions',
                value: formatNumber(team.creators.libraryContributions),
              },
            ],
            insights: [
              totalAssets > 0
                ? 'Promote top-performing assets to clients and partners to drive reuse.'
                : 'Encourage the team to document wins as templates and automations.',
              `Marketplace-ready assets: ${formatNumber(team.creators.marketplaceItems)} ready for listing.`,
            ],
          },
        };
      },
    },
  ],
  automation: [
    {
      id: 'active-automation',
      label: 'Active automations',
      description: 'Operational automations powering your delivery programs.',
      tags: ['automation', 'operations'],
      compute: ({ automation }) => {
        const activeCount = automation.activeTools.length;
        const testingCount = automation.testingTools.length;
        const tone = activeCount > 0 ? 'positive' : 'neutral';

        return {
          value: formatNumber(activeCount),
          change: `${formatNumber(testingCount)} in testing`,
          changeTone: testingCount > 0 ? 'neutral' : tone,
          secondaryLabel: `${formatNumber(automation.statusCounts.development ?? 0)} in development`,
          detail: {
            title: 'Automation inventory',
            description: 'Track live automations, upcoming launches, and testing workload.',
            stats: [
              {
                label: 'Active automations',
                value: formatNumber(activeCount),
                tone,
              },
              {
                label: 'In testing',
                value: formatNumber(testingCount),
                tone: testingCount > 0 ? 'warning' : 'neutral',
              },
              {
                label: 'Categories covered',
                value: `${formatNumber(Object.keys(automation.categoryCounts).length)} segments`,
              },
            ],
            insights: [
              automation.automationLeaders.length > 0
                ? `Top performers: ${formatList(
                    automation.automationLeaders.map(
                      (tool) => `${tool.name} (${formatPercent(tool.usage, 0)} usage)`
                    )
                  )}`
                : 'Spin up automations to surface usage insights.',
              testingCount > 0
                ? 'Coordinate with QA to accelerate testing into production.'
                : 'All automations are live—evaluate backlog for new opportunities.',
            ],
          },
        };
      },
    },
    {
      id: 'automation-usage',
      label: 'Automation adoption',
      description: 'Average utilization and efficiency of deployed tools.',
      tags: ['usage', 'efficiency'],
      compute: ({ automation }) => {
        const usage = automation.avgUsage;
        const efficiency = automation.avgEfficiency;
        const tone = usage >= 75 ? 'positive' : usage >= 55 ? 'neutral' : 'warning';

        return {
          value: formatPercent(usage, 0),
          change: `Efficiency ${formatPercent(efficiency, 0)}`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(automation.totalRuns)} lifetime runs`,
          detail: {
            title: 'Adoption and efficiency',
            description: 'Blend utilization, efficiency, and run counts.',
            stats: [
              {
                label: 'Average usage',
                value: formatPercent(usage, 0),
                tone,
              },
              {
                label: 'Average efficiency',
                value: formatPercent(efficiency, 0),
              },
              {
                label: 'Total runs',
                value: formatNumber(automation.totalRuns),
              },
            ],
            insights: [
              usage >= 75
                ? 'Automation adoption is strong—highlight wins with client stakeholders.'
                : 'Drive enablement sessions to deepen automation usage.',
              `Leaders: ${formatList(
                automation.automationLeaders.map((tool) => `${tool.name} (${formatPercent(tool.usage, 0)})`)
              ) || 'Add tools to capture usage insights.'}`,
            ],
          },
        };
      },
    },
    {
      id: 'automation-savings',
      label: 'Cost savings to date',
      description: 'Financial impact generated by automation runs.',
      tags: ['impact', 'finance'],
      compute: ({ automation }) => {
        const tone = automation.totalCostSavings > 0 ? 'positive' : 'neutral';

        return {
          value: formatCurrency(automation.totalCostSavings),
          change: `${formatNumber(automation.totalRuns)} automated runs captured`,
          changeTone: tone,
          secondaryLabel: `Avg processing ${Math.round(automation.averageProcessingTime)}ms`,
          detail: {
            title: 'Financial impact',
            description: 'Quantify savings delivered through automation at scale.',
            stats: [
              {
                label: 'Total cost savings',
                value: formatCurrency(automation.totalCostSavings),
                tone,
              },
              {
                label: 'Average usage',
                value: formatPercent(automation.avgUsage, 0),
              },
              {
                label: 'Average processing time',
                value: `${Math.round(automation.averageProcessingTime)} ms`,
              },
            ],
            insights: [
              automation.totalCostSavings > 0
                ? 'Reinvest realized savings into roadmap accelerators or client value-add projects.'
                : 'Quantify impact by tagging automations with savings assumptions.',
              `Automation categories: ${formatList(Object.keys(automation.categoryCounts)) || 'Add tools to categorize impact.'}`,
            ],
          },
        };
      },
    },
    {
      id: 'automation-reliability',
      label: 'Automation reliability',
      description: 'Reliability and uptime across the automation estate.',
      tags: ['reliability', 'quality'],
      compute: ({ automation }) => {
        const uptime = automation.avgUptime;
        const processing = automation.averageProcessingTime;
        const tone = uptime >= 98 ? 'positive' : uptime >= 95 ? 'neutral' : 'warning';

        return {
          value: formatPercent(uptime, 1),
          change: `Avg processing ${Math.round(processing)}ms`,
          changeTone: tone,
          secondaryLabel: `${formatNumber(automation.testingTools.length)} tools in testing`,
          detail: {
            title: 'Reliability pulse',
            description: 'Ensure automations maintain SLAs and user trust.',
            stats: [
              {
                label: 'Average uptime',
                value: formatPercent(uptime, 1),
                tone,
              },
              {
                label: 'Average efficiency',
                value: formatPercent(automation.avgEfficiency, 0),
              },
              {
                label: 'Testing backlog',
                value: formatNumber(automation.testingTools.length),
                tone: automation.testingTools.length > 0 ? 'warning' : 'neutral',
              },
            ],
            insights: [
              uptime >= 98
                ? 'Reliability is excellent—celebrate with customer success stories.'
                : 'Review monitoring alerts and error handling to raise uptime.',
              `Key tools: ${formatList(
                automation.automationLeaders.map((tool) => `${tool.name} (${formatPercent(tool.usage, 0)} usage)`)
              ) || 'Add operational automations to track reliability.'}`,
            ],
          },
        };
      },
    },
    {
      id: 'automation-coverage',
      label: 'Automation coverage',
      description: 'Breadth of categories where automation is in production.',
      tags: ['portfolio', 'coverage'],
      compute: ({ automation }) => {
        const { coverage, categoryCounts } = automation;
        const totalCategories = coverage.categories;
        const activeCategories = coverage.activeCategories;
        const tone = activeCategories >= Math.max(1, totalCategories - 1) ? 'positive' : 'neutral';

        return {
          value: `${formatNumber(activeCategories)}/${formatNumber(totalCategories)}`,
          change: `${formatPercent((activeCategories / Math.max(1, totalCategories)) * 100, 0)} of categories active`,
          changeTone: tone,
          secondaryLabel: formatList(Object.keys(categoryCounts)) || 'No categories tracked yet',
          detail: {
            title: 'Category coverage',
            description: 'Ensure automation is deployed in priority domains.',
            stats: [
              {
                label: 'Categories with automations',
                value: formatNumber(activeCategories),
                tone,
              },
              {
                label: 'Total categories tracked',
                value: formatNumber(totalCategories),
              },
              {
                label: 'Top category',
                value:
                  Object.entries(categoryCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.join(': ') || 'Pending data',
              },
            ],
            insights: [
              activeCategories >= totalCategories - 1
                ? 'Automation is broadly deployed—maintain governance and documentation.'
                : 'Expand automation coverage into additional categories with repeatable wins.',
              `Automation leaders include ${
                automation.automationLeaders.length > 0
                  ? formatList(automation.automationLeaders.map((tool) => tool.name))
                  : 'new tools awaiting launch'
              }.`,
            ],
          },
        };
      },
    },
  ],
};
const DEFAULT_METRIC_SELECTIONS: Record<MetricCategory, string[]> = {
  clients: ['active-clients', 'recurring-revenue', 'client-satisfaction'],
  projects: ['projects-in-flight', 'deployment-rate', 'automation-density'],
  team: ['active-collaborators', 'team-utilization', 'delivery-output'],
  automation: ['active-automation', 'automation-usage', 'automation-savings'],
};

const sanitizeCategorySelection = (selection: string[], category: MetricCategory): string[] => {
  const available = metricCatalog[category].map((metric) => metric.id);
  const unique = Array.from(new Set(selection.filter((id) => available.includes(id))));
  if (unique.length >= METRICS_PER_CATEGORY) {
    return unique.slice(0, METRICS_PER_CATEGORY);
  }

  const defaults = DEFAULT_METRIC_SELECTIONS[category];
  const merged = [...unique];
  for (const candidate of defaults) {
    if (merged.length >= METRICS_PER_CATEGORY) {
      break;
    }
    if (!merged.includes(candidate)) {
      merged.push(candidate);
    }
  }

  if (merged.length < METRICS_PER_CATEGORY) {
    for (const candidate of available) {
      if (merged.length >= METRICS_PER_CATEGORY) {
        break;
      }
      if (!merged.includes(candidate)) {
        merged.push(candidate);
      }
    }
  }

  return merged.slice(0, METRICS_PER_CATEGORY);
};

const sanitizeSelections = (
  selections: Partial<Record<MetricCategory, string[]>>
): Record<MetricCategory, string[]> => {
  return CATEGORY_ORDER.reduce((acc, category) => {
    const current = selections[category] ?? DEFAULT_METRIC_SELECTIONS[category];
    acc[category] = sanitizeCategorySelection(current, category);
    return acc;
  }, {} as Record<MetricCategory, string[]>);
};

const loadStoredSelections = (): Record<MetricCategory, string[]> => {
  if (typeof window === 'undefined') {
    return DEFAULT_METRIC_SELECTIONS;
  }

  try {
    const raw = window.localStorage.getItem(METRIC_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_METRIC_SELECTIONS;
    }

    const parsed = JSON.parse(raw) as Partial<Record<MetricCategory, string[]>>;
    return sanitizeSelections(parsed);
  } catch (error) {
    console.warn('Unable to parse dashboard metric selections from storage', error);
    return DEFAULT_METRIC_SELECTIONS;
  }
};

const MetricCard: React.FC<{
  metric: MetricResult;
  onSelect: () => void;
}> = ({ metric, onSelect }) => {
  return (
    <Card
      glowOnHover
      className="p-5 transition-transform duration-300 hover:-translate-y-0.5"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--fg-muted)]">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">{metric.value}</p>
          {metric.change && (
            <p className={`mt-1 text-sm font-medium ${metric.changeTone ? TONE_CLASSES[metric.changeTone] : ''}`}>
              {metric.change}
            </p>
          )}
          {metric.secondaryLabel && (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">{metric.secondaryLabel}</p>
          )}
        </div>
        <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{metric.description}</p>
      </div>
    </Card>
  );
};

interface MetricCustomizationModalProps {
  isOpen: boolean;
  category: MetricCategory | null;
  metadata?: MetricCategoryMetadata;
  options: MetricDefinition[];
  selected: string[];
  onSave: (nextSelection: string[]) => void;
  onClose: () => void;
}

const MetricCustomizationModal: React.FC<MetricCustomizationModalProps> = ({
  isOpen,
  category,
  metadata,
  options,
  selected,
  onSave,
  onClose,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selected);

  useEffect(() => {
    if (isOpen) {
      setLocalSelection(selected);
    }
  }, [isOpen, selected]);

  if (!isOpen || !category || !metadata) {
    return null;
  }

  const toggleSelection = (id: string) => {
    setLocalSelection((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      if (prev.length >= METRICS_PER_CATEGORY) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  const Icon = metadata.icon;
  const atLimit = localSelection.length >= METRICS_PER_CATEGORY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              <Icon className="h-4 w-4" />
              <span>{metadata.title}</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-[var(--fg)]">Customize metrics</h2>
            <p className="text-sm text-[var(--fg-muted)]">
              Choose up to {METRICS_PER_CATEGORY} metrics to highlight for this category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[420px] space-y-3 overflow-y-auto px-6 py-4">
          {options.map((option) => {
            const isSelected = localSelection.includes(option.id);
            const disabled = !isSelected && atLimit;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleSelection(option.id)}
                disabled={disabled}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-purple)]/70'
                } ${disabled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-transparent bg-[var(--accent-purple)] text-white'
                        : 'border-[var(--border)] text-[var(--fg-muted)]'
                    }`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : option.label.slice(0, 1)}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--fg)]">{option.label}</p>
                    <p className="text-sm text-[var(--fg-muted)]">{option.description}</p>
                    {option.tags && option.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {option.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--fg-muted)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <span className="text-sm text-[var(--fg-muted)]">
            {localSelection.length} of {METRICS_PER_CATEGORY} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={localSelection.length !== METRICS_PER_CATEGORY}
              className="rounded-lg bg-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              Save selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricDetailModalProps {
  isOpen: boolean;
  category: MetricCategory | null;
  metadata?: MetricCategoryMetadata;
  metric?: MetricResult | null;
  onClose: () => void;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ isOpen, category, metadata, metric, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !category || !metadata || !metric) {
    return null;
  }

  const Icon = metadata.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              <Icon className="h-4 w-4" />
              <span>{metadata.title}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--fg)]">{metric.label}</h2>
            <p className="text-sm text-[var(--fg-muted)]">{metric.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-4xl font-semibold text-[var(--fg)]">{metric.value}</p>
                {metric.secondaryLabel && (
                  <p className="text-sm text-[var(--fg-muted)]">{metric.secondaryLabel}</p>
                )}
              </div>
              {metric.change && (
                <span className={`text-sm font-medium ${metric.changeTone ? TONE_CLASSES[metric.changeTone] : ''}`}>
                  {metric.change}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {metric.detail.stats.map((stat) => (
              <div
                key={`${metric.id}-${stat.label}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">{stat.label}</p>
                <p className={`mt-2 text-lg font-semibold ${stat.tone ? TONE_CLASSES[stat.tone] : 'text-[var(--fg)]'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {metric.detail.insights && metric.detail.insights.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Suggested actions
              </h3>
              <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
                {metric.detail.insights.map((insight, index) => (
                  <li key={`${metric.id}-insight-${index}`}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {metric.detail.footnote && (
            <p className="mt-6 text-xs text-[var(--fg-muted)]">{metric.detail.footnote}</p>
          )}
        </div>
      </div>
    </div>
  );
};
const Dashboard: React.FC = () => {
  const { user, account } = useAuth();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { teamMembers } = useTeam();
  const { tools } = useTools();

  const clientAnalytics = useMemo<ClientAnalyticsSummary>(() => {
    const activeClients = clients.filter((client) => client.status === 'active');
    const inactiveClients = clients.filter((client) => client.status === 'inactive');
    const prospectClients = clients.filter((client) => client.status === 'prospect');

    const totalRevenue = clients.reduce((sum, client) => sum + (client.analytics?.totalRevenue ?? 0), 0);
    const monthlyRevenue = clients.reduce((sum, client) => sum + (client.analytics?.monthlyRevenue ?? 0), 0);
    const avgSatisfaction =
      clients.length > 0
        ? clients.reduce((sum, client) => sum + (client.analytics?.clientSatisfaction ?? 0), 0) / clients.length
        : 0;
    const avgResponseTime =
      clients.length > 0
        ? clients.reduce((sum, client) => sum + (client.analytics?.responseTime ?? 0), 0) / clients.length
        : 0;

    const totalProjects = clients.reduce((sum, client) => sum + client.projects.length, 0);
    const averageProjectsPerClient = clients.length > 0 ? totalProjects / clients.length : 0;

    const industriesCoverage = clients.reduce<Record<string, number>>((acc, client) => {
      acc[client.industry] = (acc[client.industry] ?? 0) + 1;
      return acc;
    }, {});

    const proposals = clients.flatMap((client) => client.proposals ?? []);
    const acceptedProposals = proposals.filter((proposal) => proposal.status === 'accepted');
    const sentProposals = proposals.filter((proposal) => proposal.status === 'sent');
    const pendingProposals = proposals.filter((proposal) => proposal.status === 'draft' || proposal.status === 'sent');
    const proposalWinRate = proposals.length > 0 ? (acceptedProposals.length / proposals.length) * 100 : 0;
    const acceptedValue = acceptedProposals.reduce((sum, proposal) => sum + (proposal.value ?? 0), 0);
    const pipelineValue = pendingProposals.reduce((sum, proposal) => sum + (proposal.value ?? 0), 0);
    const highestValueProposal = proposals
      .slice()
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];

    const invoices = clients.flatMap((client) => client.invoices ?? []);
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid');
    const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue');
    const pendingInvoices = invoices.filter((invoice) => invoice.status === 'pending');
    const outstandingAmount = [...overdueInvoices, ...pendingInvoices].reduce(
      (sum, invoice) => sum + (invoice.amount ?? 0),
      0
    );
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0);

    const topRevenueClients = clients
      .map((client) => ({
        id: client.id,
        name: client.companyName,
        revenue: client.analytics?.totalRevenue ?? 0,
        status: client.status,
        projects: client.projects.length,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const topSatisfactionClients = clients
      .map((client) => ({
        id: client.id,
        name: client.companyName,
        satisfaction: client.analytics?.clientSatisfaction ?? 0,
        responseTime: client.analytics?.responseTime ?? 0,
        projects: client.projects.length,
      }))
      .sort((a, b) => b.satisfaction - a.satisfaction)
      .slice(0, 3);

    return {
      clients,
      totalClients: clients.length,
      activeClients,
      inactiveClients,
      prospectClients,
      totalRevenue,
      monthlyRevenue,
      avgSatisfaction,
      avgResponseTime,
      totalProjects,
      averageProjectsPerClient,
      industriesCoverage,
      proposals: {
        total: proposals.length,
        accepted: acceptedProposals.length,
        sent: sentProposals.length,
        pending: pendingProposals.length,
        winRate: proposalWinRate,
        acceptedValue,
        pipelineValue,
        highestValue: highestValueProposal
          ? {
              title: highestValueProposal.title,
              value: highestValueProposal.value ?? 0,
              status: highestValueProposal.status,
            }
          : undefined,
      },
      invoices: {
        total: invoices.length,
        paid: paidInvoices.length,
        overdue: overdueInvoices.length,
        pending: pendingInvoices.length,
        outstandingAmount,
        paidAmount,
      },
      topRevenueClients,
      topSatisfactionClients,
    };
  }, [clients]);

  const projectAnalytics = useMemo<ProjectAnalyticsSummary>(() => {
    const statusCounts = projects.reduce<Record<Project['status'], number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
      return acc;
    }, {
      planning: 0,
      development: 0,
      testing: 0,
      deployed: 0,
      maintenance: 0,
    });

    const activeProjects = projects.filter((project) => ACTIVE_PROJECT_STATUSES.has(project.status));
    const deployedProjects = projects.filter((project) => project.status === 'deployed');
    const maintenanceProjects = projects.filter((project) => project.status === 'maintenance');

    const systems = projects.flatMap((project) => project.systems);
    const systemStatusCounts = systems.reduce<Record<string, number>>((acc, system) => {
      acc[system.status] = (acc[system.status] ?? 0) + 1;
      return acc;
    }, {});
    const systemTypeCounts = systems.reduce<Record<string, number>>((acc, system) => {
      acc[system.type] = (acc[system.type] ?? 0) + 1;
      return acc;
    }, {});

    const activeSystems = systems.filter((system) => system.status === 'active');
    const testingSystems = systems.filter((system) => system.status === 'testing');

    const teamSizes = projects.map((project) => project.assignedUsers.length);
    const totalAssignments = teamSizes.reduce((sum, size) => sum + size, 0);
    const averageTeamSize = teamSizes.length > 0 ? totalAssignments / teamSizes.length : 0;
    const maxTeamSize = teamSizes.reduce((max, size) => Math.max(max, size), 0);

    const automationDensity = projects.length > 0 ? systems.length / projects.length : 0;
    const clientsWithProjects = new Set(projects.map((project) => project.clientId)).size;
    const clientsWithActiveProjects = new Set(activeProjects.map((project) => project.clientId)).size;

    const topProjects = projects
      .map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        systems: project.systems.length,
        teamSize: project.assignedUsers.length,
      }))
      .sort((a, b) => b.systems - a.systems)
      .slice(0, 3);

    return {
      projects,
      totalProjects: projects.length,
      statusCounts,
      activeProjects,
      deployedProjects,
      maintenanceProjects,
      totalSystems: systems.length,
      activeSystems: activeSystems.length,
      testingSystems: testingSystems.length,
      systemStatusCounts,
      systemTypeCounts,
      automationDensity,
      averageTeamSize,
      maxTeamSize,
      totalAssignments,
      clientsWithProjects,
      clientsWithActiveProjects,
      topProjects,
    };
  }, [projects]);

  const teamAnalytics = useMemo<TeamAnalyticsSummary>(() => {
    const activeMembers = teamMembers.filter((member) => member.status === 'active');
    const roleCounts = teamMembers.reduce<Record<TeamMember['role'], number>>((acc, member) => {
      acc[member.role] = (acc[member.role] ?? 0) + 1;
      return acc;
    }, {
      manager: 0,
      employee: 0,
      contractor: 0,
    });

    const avgProductivity =
      teamMembers.length > 0
        ? teamMembers.reduce((sum, member) => sum + (member.analytics?.monthlyProductivity ?? 0), 0) /
          teamMembers.length
        : 0;
    const avgSatisfaction =
      teamMembers.length > 0
        ? teamMembers.reduce((sum, member) => sum + (member.analytics?.clientSatisfactionScore ?? 0), 0) /
          teamMembers.length
        : 0;
    const totalHours = teamMembers.reduce((sum, member) => sum + (member.analytics?.hoursWorked ?? 0), 0);
    const totalProjectsDelivered = teamMembers.reduce(
      (sum, member) => sum + (member.analytics?.projectsCompleted ?? 0),
      0
    );
    const creators = {
      toolsCreated: teamMembers.reduce((sum, member) => sum + (member.analytics?.toolsCreated ?? 0), 0),
      templatesCreated: teamMembers.reduce((sum, member) => sum + (member.analytics?.templatesCreated ?? 0), 0),
      libraryContributions: teamMembers.reduce((sum, member) => sum + (member.analytics?.libraryContributions ?? 0), 0),
      marketplaceItems: teamMembers.reduce((sum, member) => sum + (member.analytics?.marketplaceItems ?? 0), 0),
    };

    const crossFunctionalMembers = teamMembers.filter((member) => (member.clientIds ?? []).length > 1).length;
    const averageClientsSupported =
      teamMembers.length > 0
        ? teamMembers.reduce((sum, member) => sum + (member.clientIds?.length ?? 0), 0) / teamMembers.length
        : 0;

    const topProductiveMembers = teamMembers
      .map((member) => ({
        id: member.id,
        name: member.name,
        productivity: member.analytics?.monthlyProductivity ?? 0,
        projectsCompleted: member.analytics?.projectsCompleted ?? 0,
        role: member.role,
      }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 3);

    return {
      teamMembers,
      totalMembers: teamMembers.length,
      activeMembers,
      roleCounts,
      avgProductivity,
      avgSatisfaction,
      totalHours,
      totalProjectsDelivered,
      creators,
      crossFunctionalMembers,
      averageClientsSupported,
      topProductiveMembers,
    };
  }, [teamMembers]);

  const automationAnalytics = useMemo<AutomationAnalyticsSummary>(() => {
    const activeTools = tools.filter((tool) => tool.status === 'active');
    const testingTools = tools.filter((tool) => tool.status === 'testing');

    const statusCounts = tools.reduce<Record<Tool['status'], number>>((acc, tool) => {
      acc[tool.status] = (acc[tool.status] ?? 0) + 1;
      return acc;
    }, {
      active: 0,
      development: 0,
      testing: 0,
      inactive: 0,
      error: 0,
    });

    const categoryCounts = tools.reduce<Record<Tool['category'], number>>((acc, tool) => {
      acc[tool.category] = (acc[tool.category] ?? 0) + 1;
      return acc;
    }, {} as Record<Tool['category'], number>);

    const totalCostSavings = tools.reduce((sum, tool) => sum + (tool.stats?.costSavings ?? 0), 0);
    const totalRuns = tools.reduce((sum, tool) => sum + (tool.stats?.totalRuns ?? 0), 0);
    const avgUsage = tools.length > 0 ? tools.reduce((sum, tool) => sum + (tool.stats?.usage ?? 0), 0) / tools.length : 0;
    const avgEfficiency =
      tools.length > 0
        ? tools.reduce((sum, tool) => sum + (tool.stats?.efficiency ?? 0), 0) / tools.length
        : 0;
    const avgUptime = tools.length > 0 ? tools.reduce((sum, tool) => sum + (tool.stats?.uptime ?? 0), 0) / tools.length : 0;
    const averageProcessingTime =
      tools.length > 0
        ? tools.reduce((sum, tool) => sum + (tool.stats?.processingTime ?? 0), 0) / tools.length
        : 0;

    const coverage = {
      categories: Object.keys(categoryCounts).length,
      activeCategories: Object.values(categoryCounts).filter((count) => count > 0).length,
    };

    const automationLeaders = tools
      .map((tool) => ({
        id: tool.id,
        name: tool.name,
        usage: tool.stats?.usage ?? 0,
        clientName: tool.clientName,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 3);

    return {
      tools,
      totalTools: tools.length,
      activeTools,
      testingTools,
      statusCounts,
      categoryCounts,
      totalCostSavings,
      totalRuns,
      avgUsage,
      avgEfficiency,
      avgUptime,
      averageProcessingTime,
      coverage,
      automationLeaders,
    };
  }, [tools]);

  const [selectedMetrics, setSelectedMetrics] = useState<Record<MetricCategory, string[]>>(
    () => loadStoredSelections()
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(selectedMetrics));
    }
  }, [selectedMetrics]);

  const analyticsContext = useMemo<MetricComputeContext>(
    () => ({
      clients: clientAnalytics,
      projects: projectAnalytics,
      team: teamAnalytics,
      automation: automationAnalytics,
    }),
    [clientAnalytics, projectAnalytics, teamAnalytics, automationAnalytics]
  );

  const computedMetrics = useMemo(() => {
    const results: Record<MetricCategory, Record<string, MetricResult>> = {
      clients: {},
      projects: {},
      team: {},
      automation: {},
    };

    (Object.keys(metricCatalog) as MetricCategory[]).forEach((category) => {
      metricCatalog[category].forEach((definition) => {
        results[category][definition.id] = {
          id: definition.id,
          label: definition.label,
          description: definition.description,
          tags: definition.tags,
          ...definition.compute(analyticsContext),
        };
      });
    });

    return results;
  }, [analyticsContext]);

  const [customizingCategory, setCustomizingCategory] = useState<MetricCategory | null>(null);
  const [detailMetric, setDetailMetric] = useState<{ category: MetricCategory; metricId: string } | null>(null);

  const handleSaveSelection = useCallback((category: MetricCategory, nextSelection: string[]) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [category]: sanitizeCategorySelection(nextSelection, category),
    }));
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Active Clients',
        value: clientAnalytics.activeClients.length,
        change: `${clientAnalytics.prospectClients.length} prospects`,
        icon: Handshake,
        changeTone: clientAnalytics.prospectClients.length > 0 ? ('positive' as const) : ('neutral' as const),
      },
      {
        title: 'Projects in Motion',
        value: projectAnalytics.activeProjects.length,
        change: `${projectAnalytics.deployedProjects.length} deployed`,
        icon: FolderOpen,
        changeTone: projectAnalytics.deployedProjects.length > 0 ? ('positive' as const) : ('neutral' as const),
      },
      {
        title: 'Team Utilization',
        value: `${formatPercent(teamAnalytics.avgProductivity, 0)}`,
        change: `${formatDecimal(teamAnalytics.avgSatisfaction, 1)}/5 satisfaction`,
        icon: Users,
        changeTone: teamAnalytics.avgProductivity >= 80 ? ('positive' as const) : ('neutral' as const),
      },
      {
        title: 'Automation Savings',
        value: formatCurrency(automationAnalytics.totalCostSavings),
        change: `${formatPercent(automationAnalytics.avgEfficiency, 0)} efficiency`,
        icon: Wrench,
        changeTone: automationAnalytics.totalCostSavings > 0 ? ('positive' as const) : ('neutral' as const),
      },
    ],
    [
      automationAnalytics.avgEfficiency,
      automationAnalytics.totalCostSavings,
      clientAnalytics.activeClients.length,
      clientAnalytics.prospectClients.length,
      projectAnalytics.activeProjects.length,
      projectAnalytics.deployedProjects.length,
      teamAnalytics.avgProductivity,
      teamAnalytics.avgSatisfaction,
    ]
  );

  const activeCategoryMetadata = customizingCategory ? CATEGORY_METADATA[customizingCategory] : undefined;
  const activeDetailMetadata = detailMetric ? CATEGORY_METADATA[detailMetric.category] : undefined;
  const activeDetailMetric =
    detailMetric ? computedMetrics[detailMetric.category]?.[detailMetric.metricId] ?? null : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--fg-muted)]">Dashboard Overview</p>
          <h1 className="text-3xl font-bold text-[var(--fg)]">
            {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome back!'}
          </h1>
          <p className="text-sm text-[var(--fg-muted)]">
            {account
              ? `Here’s how ${account.name} is performing across workstreams.`
              : 'Here’s how your workspace is performing across workstreams.'}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            changeTone={card.changeTone}
          />
        ))}
      </section>

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const metadata = CATEGORY_METADATA[category];
          const SectionIcon = metadata.icon;
          const selections = selectedMetrics[category] ?? DEFAULT_METRIC_SELECTIONS[category];
          return (
            <section key={category}>
              <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--surface)]" glowOnHover>
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${metadata.accent}`} />
                <div className="relative space-y-6 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                        <SectionIcon className="h-4 w-4" />
                        <span>{metadata.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--fg-muted)]">{metadata.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomizingCategory(category)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Customize
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {selections.map((metricId) => {
                      const metric = computedMetrics[category][metricId];
                      if (!metric) {
                        return null;
                      }
                      return (
                        <MetricCard
                          key={metricId}
                          metric={metric}
                          onSelect={() => setDetailMetric({ category, metricId })}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>
            </section>
          );
        })}
      </div>

      <MetricCustomizationModal
        isOpen={customizingCategory !== null}
        category={customizingCategory}
        metadata={activeCategoryMetadata}
        options={customizingCategory ? metricCatalog[customizingCategory] : []}
        selected={customizingCategory ? selectedMetrics[customizingCategory] ?? [] : []}
        onSave={(selection) => {
          if (customizingCategory) {
            handleSaveSelection(customizingCategory, selection);
          }
        }}
        onClose={() => setCustomizingCategory(null)}
      />

      <MetricDetailModal
        isOpen={detailMetric !== null}
        category={detailMetric?.category ?? null}
        metadata={activeDetailMetadata}
        metric={activeDetailMetric}
        onClose={() => setDetailMetric(null)}
      />
    </div>
  );
};

export default Dashboard;
