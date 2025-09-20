import React from 'react';
import { Building2, FolderOpen, Users, Activity, Zap, Brain, GitBranch, Target, Play } from 'lucide-react';
import { Tool } from '../../types/tools';
import { Card } from '../Shared/Card';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

const categoryIcons = {
  'ML': Brain,
  'LLM': Zap,
  'GPT': Brain,
  'AI Tool': Target,
  'Agent': Play,
  'Automation': GitBranch,
  'Workflow': Activity,
};

const categoryColors = {
  'ML': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'LLM': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'GPT': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'AI Tool': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Agent': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Automation': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Workflow': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

const statusColors = {
  active: 'bg-green-400',
  development: 'bg-blue-400',
  testing: 'bg-purple-400',
  inactive: 'bg-gray-400',
  error: 'bg-red-400',
};

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const CategoryIcon = categoryIcons[tool.category];
  const categoryColorClass = categoryColors[tool.category];

  return (
    <Card
      glowOnHover={true}
      onClick={onClick}
      className="p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gradient-orange transition-colors">
              {tool.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColorClass}`}>
              {tool.category}
            </span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[tool.status]}`} />
      </div>

      <p className="text-[var(--fg-muted)] text-sm mb-4 line-clamp-2">{tool.description}</p>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
          <Building2 className="w-4 h-4" />
          <span className="text-[var(--fg)]">{tool.clientName || 'Internal'}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
          <FolderOpen className="w-4 h-4" />
          <span className="text-[var(--fg)]">{tool.projectName}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
          <Users className="w-4 h-4" />
          <span className="text-[var(--fg)]">{tool.teamMembers.length} team member{tool.teamMembers.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--fg)]">{tool.stats.usage}%</div>
            <div className="text-xs text-[var(--fg-muted)]">Usage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--fg)]">{tool.stats.efficiency}%</div>
            <div className="text-xs text-[var(--fg-muted)]">Efficiency</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ToolCard;