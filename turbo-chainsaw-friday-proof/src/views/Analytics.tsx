import React, { useState } from 'react';
import { Users, FolderOpen, Wrench, Building2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useTools } from '../hooks/useTools';

const Analytics = () => {
  const { user } = useAuth();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { teamMembers } = useTeam();
  const { tools } = useTools();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const dashboardAnalytics = {
    revenue: { value: 125000, change: 12, trend: 'up' },
    newClients: { value: 8, change: 3, trend: 'up' },
    activeProjects: { value: 15, change: 2, trend: 'up' }
  };

  const clientAnalytics = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    prospectClients: clients.filter(c => c.status === 'prospect').length,
    totalRevenue: clients.reduce((sum, client) => sum + client.analytics.totalRevenue, 0),
    avgSatisfaction: clients.length > 0 ? clients.reduce((sum, client) => sum + client.analytics.clientSatisfaction, 0) / clients.length : 0,
    avgResponseTime: clients.length > 0 ? clients.reduce((sum, client) => sum + client.analytics.responseTime, 0) / clients.length : 0
  };

  const projectAnalytics = {
    totalProjects: projects.length,
    byStatus: {
      planning: projects.filter(p => p.status === 'planning').length,
      development: projects.filter(p => p.status === 'development').length,
      testing: projects.filter(p => p.status === 'testing').length,
      deployed: projects.filter(p => p.status === 'deployed').length,
      maintenance: projects.filter(p => p.status === 'maintenance').length
    },
    totalSystems: projects.reduce((sum, project) => sum + project.systems.length, 0),
    activeSystems: projects.reduce((sum, project) => sum + project.systems.filter(s => s.status === 'active').length, 0)
  };

  const teamAnalytics = {
    totalMembers: teamMembers.length,
    byRole: {
      employee: teamMembers.filter(m => m.role === 'employee').length,
      contractor: teamMembers.filter(m => m.role === 'contractor').length,
      manager: teamMembers.filter(m => m.role === 'manager').length
    },
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    avgProductivity: teamMembers.length > 0 ? teamMembers.reduce((sum, member) => sum + member.analytics.monthlyProductivity, 0) / teamMembers.length : 0,
    totalHours: teamMembers.reduce((sum, member) => sum + member.analytics.hoursWorked, 0),
    avgSatisfaction: teamMembers.length > 0 ? teamMembers.reduce((sum, member) => sum + member.analytics.clientSatisfactionScore, 0) / teamMembers.length : 0
  };

  const toolAnalytics = {
    totalTools: tools.length,
    byCategory: {
      ML: tools.filter(t => t.category === 'ML').length,
      LLM: tools.filter(t => t.category === 'LLM').length,
      GPT: tools.filter(t => t.category === 'GPT').length,
      'AI Tool': tools.filter(t => t.category === 'AI Tool').length,
      Agent: tools.filter(t => t.category === 'Agent').length,
      Automation: tools.filter(t => t.category === 'Automation').length,
      Workflow: tools.filter(t => t.category === 'Workflow').length
    },
    byStatus: {
      active: tools.filter(t => t.status === 'active').length,
      development: tools.filter(t => t.status === 'development').length,
      testing: tools.filter(t => t.status === 'testing').length,
      inactive: tools.filter(t => t.status === 'inactive').length,
      error: tools.filter(t => t.status === 'error').length
    },
    avgUsage: tools.length > 0 ? tools.reduce((sum, tool) => sum + tool.stats.usage, 0) / tools.length : 0,
    avgEfficiency: tools.length > 0 ? tools.reduce((sum, tool) => sum + tool.stats.efficiency, 0) / tools.length : 0,
    totalCostSavings: tools.reduce((sum, tool) => sum + tool.stats.costSavings, 0)
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-[var(--fg-muted)]" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--fg-muted)]">Revenue</span>
              {getTrendIcon(dashboardAnalytics.revenue.trend)}
            </div>
            <div className="text-2xl font-bold text-[var(--fg)]">{formatCurrency(dashboardAnalytics.revenue.value)}</div>
            <div className="text-sm text-green-600 dark:text-green-400">+{dashboardAnalytics.revenue.change}% from last month</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--fg-muted)]">New Clients</span>
              {getTrendIcon(dashboardAnalytics.newClients.trend)}
            </div>
            <div className="text-2xl font-bold text-[var(--fg)]">{dashboardAnalytics.newClients.value}</div>
            <div className="text-sm text-green-600 dark:text-green-400">+{dashboardAnalytics.newClients.change} from last month</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--fg-muted)]">Active Projects</span>
              {getTrendIcon(dashboardAnalytics.activeProjects.trend)}
            </div>
            <div className="text-2xl font-bold text-[var(--fg)]">{dashboardAnalytics.activeProjects.value}</div>
            <div className="text-sm text-green-600 dark:text-green-400">+{dashboardAnalytics.activeProjects.change} this week</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.8</div>
            <div className="text-sm text-[var(--fg-muted)]">Overall Satisfaction</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">92%</div>
            <div className="text-sm text-[var(--fg-muted)]">Team Utilization</div>
          </div>
        </div>
      </div>

      {/* Client Analytics */}
      {user?.accountType !== 'business' && (
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center space-x-2 text-xl font-semibold text-[var(--fg)]">
              <Building2 className="w-5 h-5" />
              <span>Client Analytics</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 max-w-sm">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold text-[var(--fg)]">{clientAnalytics.totalClients}</div>
                  <div className="text-sm text-[var(--fg-muted)]">Total Clients</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{clientAnalytics.activeClients}</div>
                  <div className="text-sm text-[var(--fg-muted)]">Active</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{clientAnalytics.prospectClients}</div>
                  <div className="text-sm text-[var(--fg-muted)]">Prospects</div>
                </div>
              </div>
            </div>
            <div className="space-y-4 max-w-sm">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--fg-muted)]">Total Revenue</span>
                  <span className="text-lg font-bold text-[var(--fg)]">{formatCurrency(clientAnalytics.totalRevenue)}</span>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--fg-muted)]">Avg Satisfaction</span>
                  <span className="text-lg font-bold text-[var(--fg)]">{clientAnalytics.avgSatisfaction.toFixed(1)}/5</span>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--fg-muted)]">Avg Response Time</span>
                  <span className="text-lg font-bold text-[var(--fg)]">{clientAnalytics.avgResponseTime.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Analytics */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center space-x-2 text-xl font-semibold text-[var(--fg)]">
            <FolderOpen className="w-5 h-5" />
            <span>Project Analytics</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-[var(--fg)] mb-3">Project Status Distribution</h4>
              <div className="space-y-2">
                {Object.entries(projectAnalytics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--fg-muted)] capitalize">{status}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'deployed' ? 'bg-green-400' :
                        status === 'development' ? 'bg-blue-400' :
                        status === 'testing' ? 'bg-purple-400' :
                        status === 'planning' ? 'bg-yellow-400' :
                        'bg-orange-400'
                      }`} />
                      <span className="text-sm font-medium text-[var(--fg)]">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-[var(--fg)]">{projectAnalytics.totalProjects}</div>
              <div className="text-sm text-[var(--fg-muted)]">Total Projects</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projectAnalytics.totalSystems}</div>
              <div className="text-sm text-[var(--fg-muted)]">Total Systems</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{projectAnalytics.activeSystems}</div>
              <div className="text-sm text-[var(--fg-muted)]">Active Systems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Analytics */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center space-x-2 text-xl font-semibold text-[var(--fg)]">
            <Users className="w-5 h-5" />
            <span>Team Analytics</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-[var(--fg)] mb-3">Team Composition</h4>
              <div className="space-y-2">
                {Object.entries(teamAnalytics.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--fg-muted)] capitalize">{role}s</span>
                    <span className="text-sm font-medium text-[var(--fg)]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-[var(--fg)]">{teamAnalytics.totalMembers}</div>
              <div className="text-sm text-[var(--fg-muted)]">Total Members</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{teamAnalytics.activeMembers}</div>
              <div className="text-sm text-[var(--fg-muted)]">Active</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(teamAnalytics.avgProductivity)}%</div>
              <div className="text-sm text-[var(--fg-muted)]">Avg Productivity</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamAnalytics.avgSatisfaction.toFixed(1)}</div>
              <div className="text-sm text-[var(--fg-muted)]">Avg Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Analytics */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center space-x-2 text-xl font-semibold text-[var(--fg)]">
            <Wrench className="w-5 h-5" />
            <span>Tool Analytics</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-[var(--fg)] mb-3">Tool Categories</h4>
              <div className="space-y-2">
                {Object.entries(toolAnalytics.byCategory).map(([category, count]) => (
                  count > 0 && (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg-muted)]">{category}</span>
                      <span className="text-sm font-medium text-[var(--fg)]">{count}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-[var(--fg)] mb-3">Tool Status</h4>
              <div className="space-y-2">
                {Object.entries(toolAnalytics.byStatus).map(([status, count]) => (
                  count > 0 && (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg-muted)] capitalize">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'active' ? 'bg-green-400' :
                          status === 'development' ? 'bg-blue-400' :
                          status === 'testing' ? 'bg-purple-400' :
                          status === 'inactive' ? 'bg-gray-400' :
                          'bg-red-400'
                        }`} />
                        <span className="text-sm font-medium text-[var(--fg)]">{count}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 max-w-sm">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-[var(--fg)]">{toolAnalytics.totalTools}</div>
              <div className="text-sm text-[var(--fg-muted)]">Total Tools</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(toolAnalytics.avgUsage)}%</div>
              <div className="text-sm text-[var(--fg-muted)]">Avg Usage</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(toolAnalytics.avgEfficiency)}%</div>
              <div className="text-sm text-[var(--fg-muted)]">Avg Efficiency</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(toolAnalytics.totalCostSavings)}</div>
              <div className="text-sm text-[var(--fg-muted)]">Cost Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;