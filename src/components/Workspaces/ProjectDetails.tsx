import React, { useMemo } from 'react';
import { ArrowLeft, Users, Sparkles, CalendarDays, Building2, Cpu, BarChart3 } from 'lucide-react';
import { Project, Client, TeamMember } from '../../types';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';

const statusProgress: Record<Project['status'], number> = {
  planning: 25,
  development: 50,
  testing: 70,
  deployed: 100,
  maintenance: 60,
};

const formatStatus = (status: string) =>
  status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return '$0';
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
};

const deterministicNumber = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 10_000;
  }
  const ratio = hash / 10_000;
  return Math.round(min + ratio * (max - min));
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

interface ProjectDetailsProps {
  project: Project;
  client: Client | null;
  teamMembers: TeamMember[];
  onBack: () => void;
  onEdit: (project: Project) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, client, teamMembers, onBack, onEdit }) => {
  const progress = statusProgress[project.status] ?? 50;

  const financials = useMemo(() => {
    const baseCost = deterministicNumber(`${project.id}-cost`, 45_000, 160_000);
    const expectedReturn = baseCost + deterministicNumber(`${project.id}-return`, 20_000, 190_000);
    const roi = expectedReturn - baseCost;
    return { baseCost, expectedReturn, roi };
  }, [project.id]);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-[var(--accent-purple)] hover:text-[var(--fg)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </button>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-[var(--fg)]">{project.name}</h2>
              <span className="px-2 py-1 text-xs font-semibold rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                {formatStatus(project.status)}
              </span>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">Updated {formatDate(project.updatedAt)}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
              <CalendarDays className="w-4 h-4" />
              <span>Started {formatDate(project.createdAt)}</span>
            </div>
          </div>

          <Button type="button" variant="gradient" onClick={() => onEdit(project)} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Edit Project
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-[var(--fg-muted)]">
            <span>Delivery Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)]"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 bg-[var(--surface)]">
            <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Client</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--fg)]">
              <Building2 className="w-4 h-4" />
              <span>{client ? client.companyName : 'Internal initiative'}</span>
            </div>
          </Card>
          <Card className="p-4 bg-[var(--surface)]">
            <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Projected Cost</p>
            <p className="mt-2 text-lg font-semibold text-[var(--fg)]">{formatCurrency(financials.baseCost)}</p>
          </Card>
          <Card className="p-4 bg-[var(--surface)]">
            <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Expected Return</p>
            <p className="mt-2 text-lg font-semibold text-emerald-500">{formatCurrency(financials.expectedReturn)}</p>
          </Card>
        </div>

        <Card className="p-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
            <BarChart3 className="w-4 h-4" />
            <span>ROI Outlook</span>
          </div>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            This project is forecasted to generate {formatCurrency(financials.roi)} in net benefits based on comparable client initiatives.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-[var(--surface)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
              <Cpu className="w-4 h-4" />
              <span>Systems &amp; Tools</span>
            </div>
            <div className="space-y-3">
              {project.systems.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">No systems have been linked to this project yet.</p>
              ) : (
                project.systems.map((system) => (
                  <div
                    key={system.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--fg)]">{system.name}</p>
                      <span className="text-xs text-[var(--fg-muted)] capitalize">{system.type.replace('-', ' ')}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--fg-muted)]">Status: {formatStatus(system.status)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-[var(--surface)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </div>
            <div className="space-y-3">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">No team members are assigned yet.</p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{member.name}</p>
                      <p className="text-xs text-[var(--fg-muted)]">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                    </div>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-[var(--accent-purple)] hover:underline"
                    >
                      {member.email}
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetails;
