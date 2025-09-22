import React from 'react';
import { X, MapPin, Phone, Mail, Briefcase, CheckCircle2 } from 'lucide-react';
import { TeamMember, Project } from '../../types';

interface TeamMemberDetailsModalProps {
  member: TeamMember | null;
  projects: Project[];
  onClose: () => void;
}

const statusStyles: Record<TeamMember['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const normalizeProjectMatch = (project: Project, projectId: string) =>
  project.id === projectId || `proj-${project.id}` === projectId;

const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({ member, projects, onClose }) => {
  if (!member) {
    return null;
  }

  const assignedProjects = member.projectIds
    .map((projectId) => projects.find((project) => normalizeProjectMatch(project, projectId)))
    .filter((value): value is Project => Boolean(value));

  const statusClass = statusStyles[member.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--fg)]">{member.name}</h2>
            <p className="text-sm text-[var(--fg-muted)]">{member.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
              {member.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
              aria-label="Close team member details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-[var(--fg-muted)]">Role</p>
              <p className="text-sm text-[var(--fg)]">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-[var(--fg-muted)]">Projects Completed</p>
              <p className="text-sm text-[var(--fg)]">{member.analytics.projectsCompleted}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-[var(--fg-muted)]">Email</p>
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 text-sm text-[var(--accent-purple)] hover:underline"
              >
                <Mail className="w-4 h-4" />
                {member.email}
              </a>
            </div>
            {member.phone && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-[var(--fg-muted)]">Phone</p>
                <p className="flex items-center gap-2 text-sm text-[var(--fg)]">
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </p>
              </div>
            )}
            {(member.city || member.state) && (
              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs font-medium uppercase text-[var(--fg-muted)]">Location</p>
                <p className="flex items-center gap-2 text-sm text-[var(--fg)]">
                  <MapPin className="w-4 h-4" />
                  {[member.city, member.state].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-[var(--fg-muted)] mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {member.skills.length === 0 ? (
                <span className="text-sm text-[var(--fg-muted)]">No skills captured yet.</span>
              ) : (
                member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded-full bg-[var(--surface)] text-xs text-[var(--fg)]"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[var(--fg)]">
              <Briefcase className="w-4 h-4" />
              <span>Projects ({assignedProjects.length})</span>
            </div>
            <div className="space-y-3">
              {assignedProjects.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">Not assigned to any active projects.</p>
              ) : (
                assignedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{project.name}</p>
                      <p className="text-xs text-[var(--fg-muted)]">Status: {project.status}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      {project.status === 'deployed' || project.status === 'maintenance'
                        ? 'In production'
                        : 'In progress'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetailsModal;
