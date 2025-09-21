import React, { useMemo } from 'react';
import { Handshake, FolderOpen, Users, Wrench } from 'lucide-react';

import StatsCard from '../components/Dashboard/StatsCard';
import { Card } from '../components/Shared/Card';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useTools } from '../hooks/useTools';

const ACTIVE_PROJECT_STATUSES = new Set(['planning', 'development', 'testing', 'maintenance']);

const Dashboard: React.FC = () => {
  const { user, account } = useAuth();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { teamMembers } = useTeam();
  const { tools } = useTools();

  const activeClients = useMemo(
    () => clients.filter((client) => client.status === 'active'),
    [clients]
  );

  const prospectClients = useMemo(
    () => clients.filter((client) => client.status === 'prospect'),
    [clients]
  );

  const activeProjects = useMemo(
    () => projects.filter((project) => ACTIVE_PROJECT_STATUSES.has(project.status)),
    [projects]
  );

  const deployedProjects = useMemo(
    () => projects.filter((project) => project.status === 'deployed'),
    [projects]
  );

  const activeTeamMembers = useMemo(
    () => teamMembers.filter((member) => member.status === 'active'),
    [teamMembers]
  );

  const activeTools = useMemo(
    () => tools.filter((tool) => tool.status === 'active'),
    [tools]
  );

  const toolsInTesting = useMemo(
    () => tools.filter((tool) => tool.status === 'testing'),
    [tools]
  );

  const automationCategories = useMemo(() => {
    const categoryCounts = tools.reduce<Record<string, number>>((counts, tool) => {
      counts[tool.category] = (counts[tool.category] ?? 0) + 1;
      return counts;
    }, {});

    return Object.entries(categoryCounts)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 3);
  }, [tools]);

  const highlightedClients = activeClients.slice(0, 3);
  const highlightedProjects = activeProjects.slice(0, 3);

  const summaryCards = [
    {
      title: 'Active Clients',
      value: activeClients.length,
      change: `${prospectClients.length} prospects`,
      icon: Handshake,
      changeTone: 'neutral' as const,
    },
    {
      title: 'Projects in Motion',
      value: activeProjects.length,
      change: `${deployedProjects.length} deployed`,
      icon: FolderOpen,
      changeTone: 'positive' as const,
    },
    {
      title: 'Team Members Engaged',
      value: activeTeamMembers.length,
      change: `${teamMembers.length} total collaborators`,
      icon: Users,
      changeTone: 'neutral' as const,
    },
    {
      title: 'Active Automations',
      value: activeTools.length,
      change: `${toolsInTesting.length} in testing`,
      icon: Wrench,
      changeTone: toolsInTesting.length > 0 ? ('warning' as const) : ('positive' as const),
    },
  ];

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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6 space-y-4" glowOnHover>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--fg)]">Client Highlights</h2>
            <span className="text-sm text-[var(--fg-muted)]">{clients.length} total</span>
          </div>
          <ul className="space-y-3">
            {highlightedClients.map((client) => (
              <li
                key={client.id}
                className="flex items-start justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--fg)]">{client.companyName}</p>
                  <p className="text-sm text-[var(--fg-muted)]">{client.industry}</p>
                </div>
                <span className="text-sm font-medium text-[var(--fg-muted)]">{client.projects.length} projects</span>
              </li>
            ))}
            {highlightedClients.length === 0 && (
              <li className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
                No active clients yet. Invite a client to get started.
              </li>
            )}
          </ul>
        </Card>

        <Card className="p-6 space-y-4" glowOnHover>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--fg)]">Project Momentum</h2>
            <span className="text-sm text-[var(--fg-muted)]">{projects.length} total</span>
          </div>
          <ul className="space-y-3">
            {highlightedProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-start justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--fg)]">{project.name}</p>
                  <p className="text-sm text-[var(--fg-muted)] capitalize">{project.status}</p>
                </div>
                <span className="text-sm font-medium text-[var(--fg-muted)]">{project.systems.length} systems</span>
              </li>
            ))}
            {highlightedProjects.length === 0 && (
              <li className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
                No projects in motion. Create a project to track progress.
              </li>
            )}
          </ul>
        </Card>
      </section>

      <section>
        <Card className="p-6 space-y-6" glowOnHover>
          <div>
            <h2 className="text-lg font-semibold text-[var(--fg)]">Automation Coverage</h2>
            <p className="text-sm text-[var(--fg-muted)]">
              Track where your automation efforts are concentrated across categories.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {automationCategories.map(([category, count]) => (
              <div
                key={category}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <p className="text-sm font-medium text-[var(--fg)]">{category}</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--fg)]">{count}</p>
                <p className="text-xs text-[var(--fg-muted)]">Active solutions</p>
              </div>
            ))}
            {automationCategories.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
                No automation tools yet. Add a tool to populate insights.
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
