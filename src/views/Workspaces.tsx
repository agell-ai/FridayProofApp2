import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import WorkspaceCard, { WorkspaceCardData } from '../components/Workspaces/WorkspaceCard';
import { EntityFormModal, EntityFormValues, ClientFormValues, ProjectFormValues, TeamFormValues } from '../components/Shared/EntityFormModal';
import { Button } from '../components/Shared/Button';
import { Client, Project, TeamMember } from '../types';

const typeOrder = ['client', 'project', 'team'] as const;

type WorkspaceType = (typeof typeOrder)[number];

type FormState = {
  type: WorkspaceType;
  mode: 'create' | 'edit';
  entity?: Client | Project | TeamMember;
};

const typeLabels: Record<WorkspaceType, string> = {
  client: 'Client',
  project: 'Project',
  team: 'Team Member',
};

const Workspaces: React.FC = () => {
  const { clients, isLoading: loadingClients, createClient, updateClient } = useClients();
  const { projects, isLoading: loadingProjects, createProject, updateProject } = useProjects();
  const { teamMembers, isLoading: loadingTeam, createTeamMember, updateTeamMember } = useTeam();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypes, setActiveTypes] = useState<WorkspaceType[]>([...typeOrder]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formState, setFormState] = useState<FormState | null>(null);
  const creationTypeOptions = useMemo<WorkspaceType[]>(
    () => (user?.accountType === 'business' ? ['project', 'team'] : [...typeOrder]),
    [user?.accountType]
  );
  const [createType, setCreateType] = useState<WorkspaceType>(() =>
    user?.accountType === 'business' ? 'project' : 'client'
  );

  useEffect(() => {
    if (creationTypeOptions.length > 0 && !creationTypeOptions.includes(createType)) {
      setCreateType(creationTypeOptions[0]);
    }
  }, [createType, creationTypeOptions]);

  const isLoading = loadingClients || loadingProjects || loadingTeam;

  const workspaceItems: WorkspaceCardData[] = useMemo(() => {
    const formatCurrency = (value: number) => {
      if (!value) return '$0';
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
      return `$${value.toLocaleString()}`;
    };

    const clientEntries: WorkspaceCardData[] = clients.map((client) => ({
      id: client.id,
      type: 'client',
      title: client.companyName,
      subtitle: client.industry,
      status: client.status,
      meta: `Updated ${new Date(client.updatedAt).toLocaleDateString()}`,
      tags: [client.status, client.industry, client.location, ...client.contacts.map((contact) => contact.title)],
      metrics: [
        { label: 'Projects', value: String(client.projectIds.length) },
        { label: 'Team', value: String(client.teamMemberIds.length) },
        { label: 'Lifetime Revenue', value: formatCurrency(client.analytics.totalRevenue), tone: 'positive' },
      ],
    }));

    const projectEntries: WorkspaceCardData[] = projects.map((project) => {
      const client = clients.find((item) => item.id === project.clientId);
      return {
        id: project.id,
        type: 'project',
        title: project.name,
        subtitle: client ? `For ${client.companyName}` : 'Internal initiative',
        status: project.status,
        meta: `Updated ${new Date(project.updatedAt).toLocaleDateString()}`,
        tags: [project.status, client?.industry || 'internal', ...project.systems.map((system) => system.type)],
        metrics: [
          { label: 'Systems', value: String(project.systems.length) },
          { label: 'Assigned Team', value: String(project.assignedUsers.length) },
        ],
      };
    });

    const teamEntries: WorkspaceCardData[] = teamMembers.map((member) => ({
      id: member.id,
      type: 'team',
      title: member.name,
      subtitle: `${member.role.charAt(0).toUpperCase() + member.role.slice(1)} · ${member.companyName}`,
      status: member.status,
      meta: member.city && member.state ? `${member.city}, ${member.state}` : member.city || member.state || 'Remote',
      tags: [member.role, member.status, ...member.skills],
      metrics: [
        { label: 'Projects', value: String(member.projectIds.length) },
        { label: 'Productivity', value: `${member.analytics.monthlyProductivity}%`, tone: 'positive' },
      ],
    }));

    return [...clientEntries, ...projectEntries, ...teamEntries];
  }, [clients, projects, teamMembers]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    workspaceItems.forEach((item) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses);
  }, [workspaceItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return workspaceItems.filter((item) => {
      const matchesType = activeTypes.includes(item.type as WorkspaceType);
      if (!matchesType) return false;

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      if (!matchesStatus) return false;

      if (!normalizedSearch) return true;

      const searchableValues = [
        item.title,
        item.subtitle,
        item.meta,
        ...(item.tags || []),
        ...item.metrics.map((metric) => metric.label),
        ...item.metrics.map((metric) => metric.value),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchableValues.some((value) => value.includes(normalizedSearch));
    });
  }, [workspaceItems, activeTypes, statusFilter, searchTerm]);

  const summaryStats = useMemo(() => [
    { label: 'Clients', value: clients.length },
    { label: 'Projects', value: projects.length },
    { label: 'Team Members', value: teamMembers.length },
  ], [clients.length, projects.length, teamMembers.length]);

  const handleFormSubmit = (values: EntityFormValues) => {
    if (!formState) return;

    switch (formState.type) {
      case 'client': {
        const payload = values as ClientFormValues;
        if (formState.mode === 'create') {
          createClient({
            companyName: payload.companyName,
            industry: payload.industry,
            location: payload.location,
            status: payload.status,
            website: payload.website,
            linkedinUrl: payload.linkedinUrl,
          });
        } else if (formState.entity) {
          updateClient((formState.entity as Client).id, payload);
        }
        break;
      }
      case 'project': {
        const payload = values as ProjectFormValues;
        if (formState.mode === 'create') {
          createProject({
            name: payload.name,
            description: payload.description,
            status: payload.status,
            clientId: payload.clientId,
            accountId: user?.accountId || 'acc-1',
            assignedUsers: payload.assignedUsers,
          });
        } else if (formState.entity) {
          updateProject((formState.entity as Project).id, {
            name: payload.name,
            description: payload.description,
            status: payload.status,
            clientId: payload.clientId,
            assignedUsers: payload.assignedUsers,
          });
        }
        break;
      }
      case 'team': {
        const payload = values as TeamFormValues;
        if (formState.mode === 'create') {
          createTeamMember({
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status,
            phone: payload.phone,
            city: payload.city,
            state: payload.state,
            skills: payload.skills,
          });
        } else if (formState.entity) {
          updateTeamMember((formState.entity as TeamMember).id, {
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status,
            phone: payload.phone,
            city: payload.city,
            state: payload.state,
            skills: payload.skills,
          });
        }
        break;
      }
      default:
        break;
    }

    setFormState(null);
  };

  const toggleType = (type: WorkspaceType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Workspaces</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Search and manage every client, project, and teammate from a unified view.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="Search by name, industry, status, or skill"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {typeOrder.map((type) => {
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

              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  value={createType}
                  onChange={(event) => setCreateType(event.target.value as WorkspaceType)}
                >
                  {creationTypeOptions.map((type) => (
                    <option key={`create-${type}`} value={type}>
                      {typeLabels[type]}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setFormState({ type: createType, mode: 'create' })}
                  glowOnHover
                  innerClassName="font-semibold"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add {typeLabels[createType]}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent-orange)] border-t-transparent"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">No matches found</p>
          <p className="mt-2 text-sm">
            Try adjusting your filters or search for a different keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <WorkspaceCard
              key={item.id}
              data={item}
              onEdit={(data) => {
                const entity =
                  data.type === 'client'
                    ? clients.find((client) => client.id === data.id)
                    : data.type === 'project'
                      ? projects.find((project) => project.id === data.id)
                      : teamMembers.find((member) => member.id === data.id);

                if (entity) {
                  setFormState({ type: data.type, mode: 'edit', entity });
                }
              }}
            />
          ))}
        </div>
      )}

      <EntityFormModal
        isOpen={Boolean(formState)}
        type={formState?.type || 'client'}
        mode={formState?.mode || 'create'}
        initialData={formState?.entity}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setFormState(null)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Workspaces;
