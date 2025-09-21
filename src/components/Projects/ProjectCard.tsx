import React from 'react';
import { Calendar, Users, Activity, ChevronRight } from 'lucide-react';
import { Project } from '../../types';
import { Card } from '../Shared/Card';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const statusColors = {
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  testing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  deployed: 'bg-green-500/20 text-green-400 border-green-500/30',
  maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Card
      glowOnHover={true}
      onClick={onClick}
      className="p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold leading-snug text-gray-900 dark:text-white mb-2 text-balance transition-colors duration-200 sm:text-xl group-hover:text-sunset-orange"
          >
            {project.name}
          </h3>
          <p className="text-[var(--fg-muted)] text-sm leading-relaxed text-pretty break-words line-clamp-3 sm:line-clamp-2">
            {project.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-gradient-orange transition-colors" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
        <div className="flex items-center space-x-4 text-sm text-[var(--fg-muted)]">
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span className="text-[var(--fg)]">{project.systems.length} systems</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--fg-muted)]">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span className="text-[var(--fg)]">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span className="text-[var(--fg-muted)]">Client Project</span>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;