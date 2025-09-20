import React from 'react';
import { ArrowLeft, Building2, FolderOpen, Users, Activity, TrendingUp, Zap, Brain, GitBranch, Target, Database, Play, Calendar, Clock, BarChart3, Settings, ExternalLink } from 'lucide-react';
import { Tool } from '../../types/tools';
import { useTeam } from '../../hooks/useTeam';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import TeamMemberModal from '../Clients/TeamMemberModal';
import ClientModal from '../Projects/ClientModal';
import ProjectModal from '../Projects/ProjectModal';

interface ToolDetailsProps {
  tool: Tool;
  onBack: () => void;
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
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  testing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ToolDetails: React.FC<ToolDetailsProps> = ({ tool, onBack }) => {
  const { getTeamMembersByIds } = useTeam();
  const { clients } = useClients();
  const { projects } = useProjects();
  const [selectedTeamMember, setSelectedTeamMember] = React.useState(null);
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);
  
  const CategoryIcon = categoryIcons[tool.category];
  const categoryColorClass = categoryColors[tool.category];
  const statusColorClass = statusColors[tool.status];
  const assignedTeamMembers = getTeamMembersByIds(tool.teamMembers);
  
  // Get the actual client and project data
  const toolClient = clients.find(client => client.id === tool.clientId);
  const toolProject = projects.find(project => project.id === tool.projectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sunset-purple hover:text-sunset-pink transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColorClass}`}>
                  {tool.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColorClass}`}>
                  <span>{tool.clientId ? 'Client' : 'Business'}</span>
                  {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tool Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-900 dark:text-white">{tool.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Created</p>
                    <p className="text-gray-900 dark:text-white">{new Date(tool.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Last Updated</p>
                    <p className="text-gray-900 dark:text-white">{new Date(tool.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Section - Show when no client but has business account */}
            {!toolClient && tool.clientName && (
              <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Business</span>
                </h2>
                <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{tool.clientName}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Business Account</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Type:</span>
                      <span className="text-gray-900 dark:text-white">Internal Tool</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {tool.businessImpact && (
                <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Business Impact</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tool.businessImpact}</p>
                </div>
              )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance Metrics</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{tool.stats.usage}%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Usage Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tool.stats.efficiency}%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tool.stats.uptime}%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tool.stats.processingTime}ms</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Avg Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configure Tool</span>
              </button>
              <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>View Logs</span>
              </button>
              <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tool Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{tool.stats.totalRuns.toLocaleString()}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Total Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${tool.stats.costSavings.toLocaleString()}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{tool.stats.errorRate}%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Error Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Section */}
        {toolClient && (
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Client</span>
            </h2>
            <div 
              onClick={() => setSelectedClient(toolClient)}
              className="bg-white/20 dark:bg-white/10 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{toolClient.companyName}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{toolClient.industry}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="text-gray-900 dark:text-white">{toolClient.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    toolClient.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    toolClient.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {toolClient.status.charAt(0).toUpperCase() + toolClient.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Projects:</span>
                  <span className="text-gray-900 dark:text-white">{toolClient.projects.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Section */}
        {toolProject && (
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Project</span>
            </h2>
            <div 
              onClick={() => setSelectedProject(toolProject)}
              className="bg-white/20 dark:bg-white/10 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{toolProject.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    toolProject.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                    toolProject.status === 'development' ? 'bg-blue-500/20 text-blue-400' :
                    toolProject.status === 'testing' ? 'bg-purple-500/20 text-purple-400' :
                    toolProject.status === 'planning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {toolProject.status.charAt(0).toUpperCase() + toolProject.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{toolProject.description}</p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Systems:</span>
                  <span className="text-gray-900 dark:text-white">{toolProject.systems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Team Members:</span>
                  <span className="text-gray-900 dark:text-white">{toolProject.assignedUsers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(toolProject.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Section */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Team Members ({assignedTeamMembers.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedTeamMembers.map((member) => (
            <div 
              key={member.id}
              onClick={() => setSelectedTeamMember(member)}
              className="flex items-center space-x-3 p-4 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">{member.role}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                member.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Team Member Modal */}
      {selectedTeamMember && (
        <TeamMemberModal
          member={selectedTeamMember}
          onClose={() => setSelectedTeamMember(null)}
        />
      )}

      {/* Client Modal */}
      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default ToolDetails;