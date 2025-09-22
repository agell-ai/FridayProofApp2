import React from 'react';
import { Pencil, CalendarDays } from 'lucide-react';
import { Project, Client } from '../../types';
import { Card } from '../Shared/Card';

const statusStyles: Record<Project['status'], string> = {
  planning: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
  development: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  testing: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  deployed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  maintenance: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
};

const formatStatus = (status: string) =>
  status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

interface ProjectCardProps {
  project: Project;
  client: Client | null;
  onOpen: (project: Project) => void;
  onEdit: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, client, onOpen, onEdit }) => {
  const statusClass = statusStyles[project.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <Card
      glowOnHover
      onClick={() => onOpen(project)}
      className="p-5 h-full transition"
      aria-label={`Open project ${project.name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--fg)]">{project.name}</h3>
          <p className="text-sm text-[var(--fg-muted)]">
            Client: {client ? client.companyName : 'Internal'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
            {formatStatus(project.status)}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(project);
            }}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label={`Edit ${project.name}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-[var(--fg-muted)]">
        <CalendarDays className="w-4 h-4" />
        <span>Updated {formatDate(project.updatedAt)}</span>
      </div>
    </Card>
  );
};

export default ProjectCard;
