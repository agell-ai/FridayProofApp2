import React from 'react';
import {
  ArrowLeft,
  Brain,
  GitBranch,
  Layers,
  Share2,
  BarChart3,
  Building2,
  FileText,
} from 'lucide-react';
import { System, Project, Client } from '../../types';

interface SystemDetailsProps {
  system: System;
  project: Project;
  client: Client | null;
  onBack: () => void;
}

const typeConfig: Record<System['type'], { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }> = {
  automation: {
    label: 'Automation',
    icon: GitBranch,
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20',
  },
  workflow: {
    label: 'Workflow',
    icon: Layers,
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  },
  integration: {
    label: 'Integration',
    icon: Share2,
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
  },
  'ai-model': {
    label: 'AI Model',
    icon: Brain,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  },
};

const statusStyles: Record<System['status'], string> = {
  design: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
  development: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20',
  testing: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
};

const formatStatus = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const SystemDetails: React.FC<SystemDetailsProps> = ({ system, project, client, onBack }) => {
  const config = typeConfig[system.type];
  const StatusIcon = config.icon;
  const statusClass = statusStyles[system.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Systems Hub</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center text-white shadow-lg">
              <StatusIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[var(--fg)]">{system.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border ${config.badgeClass}`}>
                  {config.label}
                </span>
                <span className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusClass}`}>
                  {formatStatus(system.status)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]">
                  Project · {project.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>System Overview</span>
            </h2>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{system.description}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4">
                <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">Project Status</p>
                <p className="text-[var(--fg)] font-semibold mt-1">{formatStatus(project.status)}</p>
                <p className="text-xs text-[var(--fg-muted)] mt-2">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
              {client && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4">
                  <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">Client</p>
                  <div className="mt-1 flex items-center gap-2 text-[var(--fg)] font-semibold">
                    <Building2 className="w-4 h-4" />
                    <span>{client.companyName}</span>
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] mt-2">Industry · {client.industry}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>Architecture</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {system.components.map((component) => (
                <div key={component.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--fg)]">{component.name}</span>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--fg-muted)]">
                      {formatStatus(component.type)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{component.description}</p>
                  <span className="inline-flex items-center text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                    Status · {formatStatus(component.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Performance Snapshot</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[var(--fg)]">{system.components.length}</p>
                <p className="text-xs text-[var(--fg-muted)]">Components</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--fg)]">{system.connections.length}</p>
                <p className="text-xs text-[var(--fg-muted)]">Connections</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--fg)]">{project.assignedUsers.length}</p>
                <p className="text-xs text-[var(--fg-muted)]">Contributors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--fg)]">{new Date(system.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-[var(--fg-muted)]">Launched</p>
              </div>
            </div>
          </div>

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur space-y-3">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Business Impact</h3>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{system.businessImpact}</p>
          </div>

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur space-y-3">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Process Documentation</h3>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              Capture configuration changes, test runs, and deployment decisions alongside this record so delivery teams and
              stakeholders stay aligned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDetails;
