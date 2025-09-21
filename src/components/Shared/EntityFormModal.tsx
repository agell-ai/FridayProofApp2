import React, { useEffect, useMemo, useState } from 'react';
import { X, Building2, FolderOpen, Users, Wrench, Save, Sparkles, Activity, FileText, ShoppingBag } from 'lucide-react';
import { Client, Project, TeamMember, System, ClientTemplate, ClientLibraryItem } from '../../types';
import { Tool } from '../../types/tools';

export type EntityType = 'client' | 'project' | 'team' | 'tool' | 'system' | 'template' | 'asset';
export type FormMode = 'create' | 'edit';

export interface ClientFormValues {
  companyName: string;
  industry: string;
  location: string;
  status: Client['status'];
  website?: string;
  linkedinUrl?: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  status: Project['status'];
  clientId: string;
  assignedUsers: string[];
}

export interface TeamFormValues {
  name: string;
  email: string;
  role: TeamMember['role'];
  status: TeamMember['status'];
  phone?: string;
  city?: string;
  state?: string;
  skills: string[];
}

export interface ToolFormValues {
  name: string;
  description: string;
  category: Tool['category'];
  status: Tool['status'];
  clientId: string;
  projectId: string;
  teamMembers: string[];
  businessImpact?: string;
  stats: Tool['stats'];
}

export interface SystemFormValues {
  name: string;
  description: string;
  type: System['type'];
  status: System['status'];
  businessImpact: string;
  projectId: string;
}

export interface TemplateFormValues {
  name: string;
  category: string;
  usage: number;
  lastModified: string;
  clientId: string;
}

export interface AssetFormValues {
  name: string;
  type: ClientLibraryItem['type'];
  category: string;
  createdAt: string;
  clientId: string;
}

export type EntityFormValues =
  | ClientFormValues
  | ProjectFormValues
  | TeamFormValues
  | ToolFormValues
  | SystemFormValues
  | TemplateFormValues
  | AssetFormValues;

interface EntityFormModalProps {
  isOpen: boolean;
  type: EntityType;
  mode: FormMode;
  initialData?:
    | Client
    | Project
    | TeamMember
    | Tool
    | (System & { projectId?: string })
    | (ClientTemplate & { clientId: string })
    | (ClientLibraryItem & { clientId: string })
    | null;
  clients?: Client[];
  projects?: Project[];
  teamMembers?: TeamMember[];
  onClose: () => void;
  onSubmit: (values: EntityFormValues) => void;
}

type ClientFormProps = {
  mode: FormMode;
  initialData?: Client | null;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
};

type ProjectFormProps = {
  mode: FormMode;
  initialData?: Project | null;
  clients: Client[];
  teamMembers: TeamMember[];
  onSubmit: (values: ProjectFormValues) => void;
  onCancel: () => void;
};

type TeamFormProps = {
  mode: FormMode;
  initialData?: TeamMember | null;
  onSubmit: (values: TeamFormValues) => void;
  onCancel: () => void;
};

type ToolFormProps = {
  mode: FormMode;
  initialData?: Tool | null;
  clients: Client[];
  projects: Project[];
  teamMembers: TeamMember[];
  onSubmit: (values: ToolFormValues) => void;
  onCancel: () => void;
};

type SystemFormProps = {
  mode: FormMode;
  initialData?: (System & { projectId?: string }) | null;
  projects: Project[];
  onSubmit: (values: SystemFormValues) => void;
  onCancel: () => void;
};

type TemplateFormProps = {
  mode: FormMode;
  initialData?: (ClientTemplate & { clientId: string }) | null;
  clients: Client[];
  onSubmit: (values: TemplateFormValues) => void;
  onCancel: () => void;
};

type AssetFormProps = {
  mode: FormMode;
  initialData?: (ClientLibraryItem & { clientId: string }) | null;
  clients: Client[];
  onSubmit: (values: AssetFormValues) => void;
  onCancel: () => void;
};

const inputClassName =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition';

const labelClassName = 'block text-sm font-medium text-[var(--fg-muted)]';

const TOOL_STATS_TEMPLATE: Tool['stats'] = {
  usage: 75,
  efficiency: 80,
  uptime: 98,
  processingTime: 220,
  totalRuns: 1500,
  costSavings: 18000,
  errorRate: 3,
};

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
    <div>
      <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
      {description && <p className="text-xs text-[var(--fg-muted)]">{description}</p>}
    </div>
    {children}
  </div>
);

const ClientForm: React.FC<ClientFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<ClientFormValues>({
    companyName: initialData?.companyName || '',
    industry: initialData?.industry || '',
    location: initialData?.location || '',
    status: initialData?.status || 'active',
    website: initialData?.website || '',
    linkedinUrl: initialData?.linkedinUrl || '',
  });

  useEffect(() => {
    setFormValues({
      companyName: initialData?.companyName || '',
      industry: initialData?.industry || '',
      location: initialData?.location || '',
      status: initialData?.status || 'active',
      website: initialData?.website || '',
      linkedinUrl: initialData?.linkedinUrl || '',
    });
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ ...formValues, website: formValues.website?.trim() || undefined, linkedinUrl: formValues.linkedinUrl?.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Company Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Company Name</label>
            <input
              className={inputClassName}
              value={formValues.companyName}
              onChange={(event) => setFormValues((prev) => ({ ...prev, companyName: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Industry</label>
            <input
              className={inputClassName}
              value={formValues.industry}
              onChange={(event) => setFormValues((prev) => ({ ...prev, industry: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Location</label>
            <input
              className={inputClassName}
              value={formValues.location}
              onChange={(event) => setFormValues((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Status</label>
            <select
              className={inputClassName}
              value={formValues.status}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as Client['status'] }))}
            >
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Links" description="Optional references to help your team find key information quickly.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Website</label>
            <input
              className={inputClassName}
              value={formValues.website || ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, website: event.target.value }))}
              placeholder="https://company.com"
            />
          </div>
          <div>
            <label className={labelClassName}>LinkedIn</label>
            <input
              className={inputClassName}
              value={formValues.linkedinUrl || ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, linkedinUrl: event.target.value }))}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Add Client' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const ProjectForm: React.FC<ProjectFormProps> = ({ mode, initialData, clients, teamMembers, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<ProjectFormValues>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'planning',
    clientId: initialData?.clientId || (clients[0]?.id ?? ''),
    assignedUsers: initialData?.assignedUsers || [],
  });

  useEffect(() => {
    setFormValues({
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'planning',
      clientId: initialData?.clientId || (clients[0]?.id ?? ''),
      assignedUsers: initialData?.assignedUsers || [],
    });
  }, [initialData, clients]);

  const toggleUser = (userId: string) => {
    setFormValues((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter((id) => id !== userId)
        : [...prev.assignedUsers, userId],
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Project Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Status</label>
            <select
              className={inputClassName}
              value={formValues.status}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as Project['status'] }))}
            >
              <option value="planning">Planning</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="deployed">Deployed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Client</label>
            <select
              className={inputClassName}
              value={formValues.clientId}
              onChange={(event) => setFormValues((prev) => ({ ...prev, clientId: event.target.value }))}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClassName}>Description</label>
            <textarea
              className={`${inputClassName} min-h-[96px]`}
              value={formValues.description}
              onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="What outcome should this project deliver?"
            />
          </div>
        </div>
      </Section>

      <Section title="Assigned Team" description="Choose collaborators responsible for delivery.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamMembers.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm text-[var(--fg)]">
              <input
                type="checkbox"
                checked={formValues.assignedUsers.includes(member.id)}
                onChange={() => toggleUser(member.id)}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-orange)] focus:ring-[var(--accent-purple)]"
              />
              <span>{member.name}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Add Project' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const TeamForm: React.FC<TeamFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<TeamFormValues>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'employee',
    status: initialData?.status || 'active',
    phone: initialData?.phone || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    skills: initialData?.skills || [],
  });
  const [skillsInput, setSkillsInput] = useState<string>((initialData?.skills || []).join(', '));

  useEffect(() => {
    setFormValues({
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'employee',
      status: initialData?.status || 'active',
      phone: initialData?.phone || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      skills: initialData?.skills || [],
    });
    setSkillsInput((initialData?.skills || []).join(', '));
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...formValues,
      skills: skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Team Member">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Full Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Email</label>
            <input
              type="email"
              className={inputClassName}
              value={formValues.email}
              onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Role</label>
            <select
              className={inputClassName}
              value={formValues.role}
              onChange={(event) => setFormValues((prev) => ({ ...prev, role: event.target.value as TeamMember['role'] }))}
            >
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Status</label>
            <select
              className={inputClassName}
              value={formValues.status}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as TeamMember['status'] }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Contact" description="Optional ways to keep in touch.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClassName}>Phone</label>
            <input
              className={inputClassName}
              value={formValues.phone || ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div>
            <label className={labelClassName}>City</label>
            <input
              className={inputClassName}
              value={formValues.city || ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, city: event.target.value }))}
            />
          </div>
          <div>
            <label className={labelClassName}>State</label>
            <input
              className={inputClassName}
              value={formValues.state || ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, state: event.target.value }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Skills" description="Comma separate skills to help with resourcing.">
        <input
          className={inputClassName}
          value={skillsInput}
          onChange={(event) => setSkillsInput(event.target.value)}
          placeholder="AI Strategy, Automation, Client Success"
        />
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Add Team Member' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const ToolForm: React.FC<ToolFormProps> = ({ mode, initialData, clients, projects, teamMembers, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<ToolFormValues>(() => {
    const stats = initialData?.stats || TOOL_STATS_TEMPLATE;
    return {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || 'Automation',
      status: initialData?.status || 'active',
      clientId: initialData?.clientId || (clients[0]?.id ?? ''),
      projectId: initialData?.projectId || (projects[0]?.id ?? ''),
      teamMembers: initialData?.teamMembers || [],
      businessImpact: initialData?.businessImpact || '',
      stats: {
        usage: stats.usage,
        efficiency: stats.efficiency,
        uptime: stats.uptime,
        processingTime: stats.processingTime,
        totalRuns: stats.totalRuns,
        costSavings: stats.costSavings,
        errorRate: stats.errorRate,
      },
    };
  });

  useEffect(() => {
    const stats = initialData?.stats || TOOL_STATS_TEMPLATE;
    setFormValues({
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || 'Automation',
      status: initialData?.status || 'active',
      clientId: initialData?.clientId || (clients[0]?.id ?? ''),
      projectId: initialData?.projectId || (projects[0]?.id ?? ''),
      teamMembers: initialData?.teamMembers || [],
      businessImpact: initialData?.businessImpact || '',
      stats: {
        usage: stats.usage,
        efficiency: stats.efficiency,
        uptime: stats.uptime,
        processingTime: stats.processingTime,
        totalRuns: stats.totalRuns,
        costSavings: stats.costSavings,
        errorRate: stats.errorRate,
      },
    });
  }, [initialData, clients, projects]);

  const availableProjects = useMemo(() => {
    if (!formValues.clientId) return projects;
    return projects.filter((project) => project.clientId === formValues.clientId || !project.clientId);
  }, [formValues.clientId, projects]);

  const toggleTeamMember = (memberId: string) => {
    setFormValues((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter((id) => id !== memberId)
        : [...prev.teamMembers, memberId],
    }));
  };

  const handleStatsChange = (field: keyof Tool['stats'], value: string) => {
    setFormValues((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: Number(value),
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Tool Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Category</label>
            <select
              className={inputClassName}
              value={formValues.category}
              onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value as Tool['category'] }))}
            >
              <option value="Automation">Automation</option>
              <option value="Workflow">Workflow</option>
              <option value="ML">ML</option>
              <option value="LLM">LLM</option>
              <option value="GPT">GPT</option>
              <option value="AI Tool">AI Tool</option>
              <option value="Agent">Agent</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Status</label>
            <select
              className={inputClassName}
              value={formValues.status}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as Tool['status'] }))}
            >
              <option value="active">Active</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Description</label>
            <textarea
              className={`${inputClassName} min-h-[96px]`}
              value={formValues.description}
              onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="What problem does this tool solve?"
            />
          </div>
        </div>
      </Section>

      <Section title="Associations" description="Connect the tool to a client, project, and people.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Client</label>
            <select
              className={inputClassName}
              value={formValues.clientId}
              onChange={(event) => setFormValues((prev) => ({ ...prev, clientId: event.target.value }))}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClassName}>Project</label>
            <select
              className={inputClassName}
              value={formValues.projectId}
              onChange={(event) => setFormValues((prev) => ({ ...prev, projectId: event.target.value }))}
            >
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClassName}>Team Members</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {teamMembers.map((member) => (
              <label key={member.id} className="flex items-center gap-2 text-sm text-[var(--fg)]">
                <input
                  type="checkbox"
                  checked={formValues.teamMembers.includes(member.id)}
                  onChange={() => toggleTeamMember(member.id)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-orange)] focus:ring-[var(--accent-purple)]"
                />
                <span>{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClassName}>Business Impact</label>
          <textarea
            className={`${inputClassName} min-h-[80px]`}
            value={formValues.businessImpact || ''}
            onChange={(event) => setFormValues((prev) => ({ ...prev, businessImpact: event.target.value }))}
            placeholder="How does this solution move the needle?"
          />
        </div>
      </Section>

      <Section title="Performance Metrics" description="Use these inputs to calculate ROI across dashboards and analytics.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Adoption Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClassName}
              value={formValues.stats.usage}
              onChange={(event) => handleStatsChange('usage', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Efficiency Gain (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClassName}
              value={formValues.stats.efficiency}
              onChange={(event) => handleStatsChange('efficiency', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Uptime (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClassName}
              value={formValues.stats.uptime}
              onChange={(event) => handleStatsChange('uptime', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Processing Time (ms)</label>
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={formValues.stats.processingTime}
              onChange={(event) => handleStatsChange('processingTime', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Total Runs</label>
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={formValues.stats.totalRuns}
              onChange={(event) => handleStatsChange('totalRuns', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Cost Savings ($)</label>
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={formValues.stats.costSavings}
              onChange={(event) => handleStatsChange('costSavings', event.target.value)}
            />
          </div>
          <div>
            <label className={labelClassName}>Error Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClassName}
              value={formValues.stats.errorRate}
              onChange={(event) => handleStatsChange('errorRate', event.target.value)}
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {mode === 'create' ? 'Create Tool' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const SystemForm: React.FC<SystemFormProps> = ({ mode, initialData, projects, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<SystemFormValues>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'automation',
    status: initialData?.status || 'design',
    businessImpact: initialData?.businessImpact || '',
    projectId: initialData?.projectId || projects[0]?.id || '',
  });

  useEffect(() => {
    setFormValues({
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'automation',
      status: initialData?.status || 'design',
      businessImpact: initialData?.businessImpact || '',
      projectId: initialData?.projectId || projects[0]?.id || '',
    });
  }, [initialData, projects]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="System Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Type</label>
            <select
              className={inputClassName}
              value={formValues.type}
              onChange={(event) => setFormValues((prev) => ({ ...prev, type: event.target.value as System['type'] }))}
            >
              <option value="automation">Automation</option>
              <option value="workflow">Workflow</option>
              <option value="integration">Integration</option>
              <option value="ai-model">AI Model</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Status</label>
            <select
              className={inputClassName}
              value={formValues.status}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as System['status'] }))}
            >
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Description</label>
            <textarea
              className={`${inputClassName} min-h-[96px]`}
              value={formValues.description}
              onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Context" description="Attach the system to the right program.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Project</label>
            <select
              className={inputClassName}
              value={formValues.projectId}
              onChange={(event) => setFormValues((prev) => ({ ...prev, projectId: event.target.value }))}
              disabled={mode === 'edit'}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClassName}>Business Impact</label>
            <textarea
              className={`${inputClassName} min-h-[96px]`}
              value={formValues.businessImpact}
              onChange={(event) => setFormValues((prev) => ({ ...prev, businessImpact: event.target.value }))}
              placeholder="Summarize the measurable outcomes this system delivers."
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Create System' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const TemplateForm: React.FC<TemplateFormProps> = ({ mode, initialData, clients, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<TemplateFormValues>({
    name: initialData?.name || '',
    category: initialData?.category || '',
    usage: initialData?.usage || 0,
    lastModified: initialData?.lastModified ? initialData.lastModified.slice(0, 10) : new Date().toISOString().slice(0, 10),
    clientId: initialData?.clientId || clients[0]?.id || '',
  });

  useEffect(() => {
    setFormValues({
      name: initialData?.name || '',
      category: initialData?.category || '',
      usage: initialData?.usage || 0,
      lastModified: initialData?.lastModified ? initialData.lastModified.slice(0, 10) : new Date().toISOString().slice(0, 10),
      clientId: initialData?.clientId || clients[0]?.id || '',
    });
  }, [initialData, clients]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...formValues,
      usage: Number(formValues.usage),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Template Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Template Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Category</label>
            <input
              className={inputClassName}
              value={formValues.category}
              onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Launches</label>
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={formValues.usage}
              onChange={(event) => setFormValues((prev) => ({ ...prev, usage: Number(event.target.value) }))}
            />
          </div>
          <div>
            <label className={labelClassName}>Last Updated</label>
            <input
              type="date"
              className={inputClassName}
              value={formValues.lastModified}
              onChange={(event) => setFormValues((prev) => ({ ...prev, lastModified: event.target.value }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Owner" description="Templates stay linked to their originating client.">
        <div>
          <label className={labelClassName}>Client</label>
          <select className={inputClassName} value={formValues.clientId} disabled>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Create Template' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const AssetForm: React.FC<AssetFormProps> = ({ mode, initialData, clients, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<AssetFormValues>({
    name: initialData?.name || '',
    type: initialData?.type || 'component',
    category: initialData?.category || '',
    createdAt: initialData?.createdAt ? initialData.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    clientId: initialData?.clientId || clients[0]?.id || '',
  });

  useEffect(() => {
    setFormValues({
      name: initialData?.name || '',
      type: initialData?.type || 'component',
      category: initialData?.category || '',
      createdAt: initialData?.createdAt ? initialData.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      clientId: initialData?.clientId || clients[0]?.id || '',
    });
  }, [initialData, clients]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Asset Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Asset Name</label>
            <input
              className={inputClassName}
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Type</label>
            <select
              className={inputClassName}
              value={formValues.type}
              onChange={(event) => setFormValues((prev) => ({ ...prev, type: event.target.value as ClientLibraryItem['type'] }))}
            >
              <option value="component">Component</option>
              <option value="template">Template</option>
              <option value="workflow">Workflow</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Category</label>
            <input
              className={inputClassName}
              value={formValues.category}
              onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClassName}>Published</label>
            <input
              type="date"
              className={inputClassName}
              value={formValues.createdAt}
              onChange={(event) => setFormValues((prev) => ({ ...prev, createdAt: event.target.value }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Contributor" description="Marketplace assets stay tied to their source client.">
        <div>
          <label className={labelClassName}>Client</label>
          <select className={inputClassName} value={formValues.clientId} disabled>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Create Asset' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const iconMap: Record<EntityType, React.ComponentType<{ className?: string }>> = {
  client: Building2,
  project: FolderOpen,
  team: Users,
  tool: Wrench,
  system: Activity,
  template: FileText,
  asset: ShoppingBag,
};

const titleMap: Record<EntityType, string> = {
  client: 'Client',
  project: 'Project',
  team: 'Team Member',
  tool: 'Tool',
  system: 'System',
  template: 'Template',
  asset: 'Marketplace Asset',
};

const descriptionMap: Record<EntityType, string> = {
  client: 'Track partner organizations with all of the essentials in one place.',
  project: 'Organize initiatives, attach contributors, and capture context.',
  team: 'Invite collaborators and keep their skills current.',
  tool: 'Catalog automations, agents, and AI workflows across the business.',
  system: 'Document the architecture, status, and impact for each deployed system.',
  template: 'Maintain reusable playbooks and launch-ready templates.',
  asset: 'Manage marketplace-ready components contributed by your ecosystem.',
};

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  type,
  mode,
  initialData,
  clients = [],
  projects = [],
  teamMembers = [],
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const Icon = iconMap[type];
  const title = titleMap[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/10 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center text-white shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                {mode === 'create' ? `Create ${title}` : `Edit ${title}`}
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">{descriptionMap[type]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          {type === 'client' && (
            <ClientForm
              mode={mode}
              initialData={initialData as Client | null}
              onSubmit={onSubmit as (values: ClientFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'project' && (
            <ProjectForm
              mode={mode}
              initialData={initialData as Project | null}
              clients={clients}
              teamMembers={teamMembers}
              onSubmit={onSubmit as (values: ProjectFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'team' && (
            <TeamForm
              mode={mode}
              initialData={initialData as TeamMember | null}
              onSubmit={onSubmit as (values: TeamFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'tool' && (
            <ToolForm
              mode={mode}
              initialData={initialData as Tool | null}
              clients={clients}
              projects={projects}
              teamMembers={teamMembers}
              onSubmit={onSubmit as (values: ToolFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'system' && (
            <SystemForm
              mode={mode}
              initialData={initialData as (System & { projectId?: string }) | null}
              projects={projects}
              onSubmit={onSubmit as (values: SystemFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'template' && (
            <TemplateForm
              mode={mode}
              initialData={initialData as (ClientTemplate & { clientId: string }) | null}
              clients={clients}
              onSubmit={onSubmit as (values: TemplateFormValues) => void}
              onCancel={onClose}
            />
          )}

          {type === 'asset' && (
            <AssetForm
              mode={mode}
              initialData={initialData as (ClientLibraryItem & { clientId: string }) | null}
              clients={clients}
              onSubmit={onSubmit as (values: AssetFormValues) => void}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityFormModal;
