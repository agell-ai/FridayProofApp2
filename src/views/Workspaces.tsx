import React, { useEffect, useMemo, useState } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import {
  EntityFormModal,
  EntityFormValues,
  ClientFormValues,
  ProjectFormValues,
  TeamFormValues,
  ProposalFormValues,
} from '../components/Shared/EntityFormModal';
import { Button } from '../components/Shared/Button';
import ProjectCard from '../components/Workspaces/ProjectCard';
import ClientCard from '../components/Workspaces/ClientCard';
import TeamMemberCard from '../components/Workspaces/TeamMemberCard';
import ProjectDetails from '../components/Workspaces/ProjectDetails';
import ClientDetails from '../components/Workspaces/ClientDetails';
import TeamMemberDetailsModal from '../components/Workspaces/TeamMemberDetailsModal';
import InvoiceFormModal, { InvoiceFormValues } from '../components/Workspaces/InvoiceFormModal';
import { Client, ClientInvoice, ClientProposal, Project, System, TeamMember } from '../types';

type WorkspaceView = 'project' | 'client' | 'team';

const viewLabels: Record<WorkspaceView, string> = {
  project: 'Projects',
  client: 'Clients',
  team: 'Team',
};

const addLabels: Record<WorkspaceView, string> = {
  project: 'Project',
  client: 'Client',
  team: 'Team Member',
};

const searchPlaceholders: Record<WorkspaceView, string> = {
  project: 'Search projects by name, status, or client',
  client: 'Search clients by name, industry, or status',
  team: 'Search team members by name, company, or skill',
};

type FormState = {
  type: WorkspaceView | 'proposal';
  mode: 'create' | 'edit';
  entity?: Client | Project | TeamMember | ClientProposal;
  clientContext?: Client | null;
};

const buildSystemsFromNames = (names: string[], project: Project): System[] => {
  const sanitized = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  const existingByName = new Map(project.systems.map((system) => [system.name.toLowerCase(), system]));
  const usedIds = new Set<string>();
  const results: System[] = [];

  sanitized.forEach((name, index) => {
    const lower = name.toLowerCase();
    const matched = existingByName.get(lower);
    if (matched) {
      usedIds.add(matched.id);
      results.push({ ...matched, name });
      return;
    }

    const unusedExisting = project.systems.find((system) => !usedIds.has(system.id));
    if (unusedExisting) {
      usedIds.add(unusedExisting.id);
      results.push({ ...unusedExisting, name });
      return;
    }

    results.push({
      id: `sys-${project.id}-${Date.now()}-${index}`,
      name,
      description: `${name} system for ${project.name}`,
      type: 'workflow',
      status: 'design',
      projectId: project.id,
      businessImpact: '',
      components: [],
      connections: [],
      createdAt: new Date().toISOString(),
    });
  });

  return results;
};

const Workspaces: React.FC = () => {
  const {
    clients,
    isLoading: loadingClients,
    createClient,
    updateClient,
    createProposal,
    updateProposal,
  } = useClients();
  const { projects, isLoading: loadingProjects, createProject, updateProject } = useProjects();
  const { teamMembers, isLoading: loadingTeam, createTeamMember, updateTeamMember } = useTeam();
  const { user } = useAuth();

  const availableViews = useMemo<WorkspaceView[]>(() => {
    const views: WorkspaceView[] = ['project'];
    if (user?.accountType === 'agency' || user?.accountType === 'consultant') {
      views.push('client');
    }
    if (user?.accountType === 'agency' || user?.accountType === 'business') {
      views.push('team');
    }
    return views;
  }, [user?.accountType]);

  const [selectedView, setSelectedView] = useState<WorkspaceView>('project');
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (!availableViews.includes(selectedView) && availableViews.length > 0) {
      setSelectedView(availableViews[0]);
    }
  }, [availableViews, selectedView]);

  useEffect(() => {
    if (selectedView !== 'project') {
      setSelectedProject(null);
    }
    if (selectedView !== 'client') {
      setSelectedClient(null);
    }
    if (selectedView !== 'team') {
      setSelectedTeamMember(null);
    }
  }, [selectedView]);

  useEffect(() => {
    if (!selectedProject) return;
    const updated = projects.find((project) => project.id === selectedProject.id);
    if (updated && updated !== selectedProject) {
      setSelectedProject(updated);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    if (!selectedClient) return;
    const updated = clients.find((client) => client.id === selectedClient.id);
    if (updated && updated !== selectedClient) {
      setSelectedClient(updated);
    }
  }, [clients, selectedClient]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const projectResults = useMemo(() => {
    if (!normalizedSearch) {
      return projects;
    }

    return projects.filter((project) => {
      const client = clients.find((item) => item.id === project.clientId);
      const values = [
        project.name,
        project.status,
        project.description,
        client?.companyName ?? '',
      ];
      return values.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [projects, clients, normalizedSearch]);

  const clientResults = useMemo(() => {
    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) => {
      const values = [client.companyName, client.status, client.industry, client.location];
      return values.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [clients, normalizedSearch]);

  const teamResults = useMemo(() => {
    if (!normalizedSearch) {
      return teamMembers;
    }

    return teamMembers.filter((member) => {
      const values = [
        member.name,
        member.email,
        member.companyName,
        member.role,
        member.city ?? '',
        member.state ?? '',
        ...member.skills,
      ];
      return values.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [teamMembers, normalizedSearch]);

  const isLoading = loadingClients || loadingProjects || loadingTeam;

  const summaryStats = useMemo(() => {
    const stats: { label: string; value: number }[] = [
      { label: 'Projects', value: projects.length },
    ];

    if (availableViews.includes('client')) {
      stats.push({ label: 'Clients', value: clients.length });
    }

    if (availableViews.includes('team')) {
      stats.push({ label: 'Team Members', value: teamMembers.length });
    }

    return stats;
  }, [projects.length, clients.length, teamMembers.length, availableViews]);

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
        const { systems, ...projectData } = payload;
        if (formState.mode === 'create') {
          createProject({
            ...projectData,
            accountId: user?.accountId || 'acc-1',
          });
        } else if (formState.entity) {
          const project = formState.entity as Project;
          const updatedSystems = buildSystemsFromNames(systems, project);
          updateProject(project.id, {
            ...projectData,
            systems: updatedSystems,
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
      case 'proposal': {
        const payload = values as ProposalFormValues;
        const client = formState.clientContext ?? selectedClient;
        if (!client) {
          break;
        }

        if (formState.mode === 'create') {
          createProposal(client.id, payload);
        } else if (formState.entity) {
          updateProposal(client.id, (formState.entity as ClientProposal).id, payload);
        }
        break;
      }
      default:
        break;
    }

    setFormState(null);
  };

  const handleInvoiceSubmit = (values: InvoiceFormValues) => {
    if (!selectedClient) {
      return;
    }

    const newInvoice: ClientInvoice = {
      id: `inv-${Date.now()}`,
      number: values.number,
      amount: values.amount,
      status: values.status,
      dueDate: values.dueDate,
      ...(values.paidDate ? { paidDate: values.paidDate } : {}),
    };

    updateClient(selectedClient.id, {
      invoices: [...selectedClient.invoices, newInvoice],
    });

    setSelectedClient((previous) =>
      previous ? { ...previous, invoices: [...previous.invoices, newInvoice] } : previous
    );

    setInvoiceModalOpen(false);
  };

  const activeClientForModal = formState?.type === 'proposal'
    ? formState.clientContext ?? selectedClient ?? null
    : null;

  const renderProjects = () => {
    if (selectedProject) {
      const client = clients.find((item) => item.id === selectedProject.clientId) ?? null;
      const assignedTeam = teamMembers.filter((member) => selectedProject.assignedUsers.includes(member.id));

      return (
        <ProjectDetails
          project={selectedProject}
          client={client}
          teamMembers={assignedTeam}
          onBack={() => setSelectedProject(null)}
          onEdit={(project) => setFormState({ type: 'project', mode: 'edit', entity: project })}
        />
      );
    }

    if (projectResults.length === 0) {
      return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">No projects found</p>
          <p className="mt-2 text-sm">Try a different search or create a new project to get started.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projectResults.map((project) => {
          const client = clients.find((item) => item.id === project.clientId) ?? null;
          return (
            <ProjectCard
              key={project.id}
              project={project}
              client={client}
              onOpen={setSelectedProject}
              onEdit={(item) => setFormState({ type: 'project', mode: 'edit', entity: item })}
            />
          );
        })}
      </div>
    );
  };

  const renderClients = () => {
    if (selectedClient) {
      const clientProjects = projects.filter((project) => project.clientId === selectedClient.id);

      return (
        <ClientDetails
          client={selectedClient}
          projects={clientProjects}
          onBack={() => setSelectedClient(null)}
          onEdit={(client) => setFormState({ type: 'client', mode: 'edit', entity: client })}
          onCreateInvoice={() => setInvoiceModalOpen(true)}
          onCreateProposal={() => setFormState({ type: 'proposal', mode: 'create', clientContext: selectedClient })}
        />
      );
    }

    if (clientResults.length === 0) {
      return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">No clients found</p>
          <p className="mt-2 text-sm">Adjust your search or add a new client to begin tracking engagements.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientResults.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onOpen={setSelectedClient}
            onEdit={(item) => setFormState({ type: 'client', mode: 'edit', entity: item })}
          />
        ))}
      </div>
    );
  };

  const renderTeam = () => {
    if (teamResults.length === 0) {
      return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center text-[var(--fg-muted)]">
          <p className="text-lg font-semibold text-[var(--fg)]">No team members found</p>
          <p className="mt-2 text-sm">Invite collaborators or search for a different name or skill.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teamResults.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onOpen={setSelectedTeamMember}
            onEdit={(item) => setFormState({ type: 'team', mode: 'edit', entity: item })}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'project':
        return renderProjects();
      case 'client':
        return renderClients();
      case 'team':
        return renderTeam();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Workspaces</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Navigate every project, client relationship, and teammate from a single command hub.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder={searchPlaceholders[selectedView]}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {availableViews.map((view) => (
                <Button
                  key={view}
                  type="button"
                  size="sm"
                  variant={view === selectedView ? 'gradient' : 'outline'}
                  onClick={() => setSelectedView(view)}
                  className="rounded-lg px-4 py-2 text-sm font-medium"
                >
                  {viewLabels[view]}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              variant="gradient"
              onClick={() => setFormState({ type: selectedView, mode: 'create' })}
              className="gap-2 px-4 py-2 text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              Add {addLabels[selectedView]}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent-orange)] border-t-transparent" />
        </div>
      ) : (
        renderContent()
      )}

      <EntityFormModal
        isOpen={Boolean(formState)}
        type={(formState?.type ?? 'client') as FormState['type']}
        mode={formState?.mode ?? 'create'}
        initialData={formState?.entity}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        activeClient={activeClientForModal}
        onClose={() => setFormState(null)}
        onSubmit={handleFormSubmit}
      />

      <TeamMemberDetailsModal
        member={selectedTeamMember}
        projects={projects}
        onClose={() => setSelectedTeamMember(null)}
      />

      <InvoiceFormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  );
};

export default Workspaces;
