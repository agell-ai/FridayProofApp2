import React, { useState } from 'react';
import { Plus, Activity, Brain, GitBranch, Target, Database, Play, Zap, Building2, Users, Calendar, BarChart3 } from 'lucide-react';
import { ArrowLeft, FolderOpen, Wrench, Settings, ExternalLink, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import { useTools } from '../hooks/useTools';
import { System } from '../types';
import SystemVisualizer from '../components/Systems/SystemVisualizer';
import TeamMemberModal from '../components/Clients/TeamMemberModal';
import ClientModal from '../components/Projects/ClientModal';
import ProjectModal from '../components/Projects/ProjectModal';
import { Card } from '../components/Shared/Card';

const Systems: React.FC = () => {
  const { projects, isLoading } = useProjects();
  const { clients } = useClients();
  const { getTeamMembersByIds, teamMembers } = useTeam();
  const { tools } = useTools();
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Extract all systems from projects
  const allSystems = projects.flatMap(project => 
    project.systems.map(system => ({
      ...system,
      projectName: project.name,
      projectId: project.id,
      clientName: project.clientId ? clients.find(c => c.id === project.clientId)?.companyName || 'Unknown Client' : 'Internal Project',
      teamMembers: getTeamMembersByIds(project.assignedUsers),
      project: project,
      client: project.clientId ? clients.find(c => c.id === project.clientId) : null
    }))
  );

  const systemTypeIcons = {
    automation: GitBranch,
    workflow: Activity,
    integration: Database,
    'ai-model': Brain,
  };

  const systemTypeColors = {
    automation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    workflow: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    integration: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'ai-model': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const statusColors = {
    design: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    testing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (selectedSystem) {
    const systemProject = selectedSystem.project;
    const systemClient = selectedSystem.client;
    const systemTeamMembers = selectedSystem.teamMembers;
    const systemTools = tools.filter(tool => tool.projectId === selectedSystem.projectId);
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSystem(null)}
          className="flex items-center space-x-2 text-sunset-purple hover:text-sunset-pink transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Systems</span>
        </button>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              {React.createElement(systemTypeIcons[selectedSystem.type], { className: "w-8 h-8 text-white" })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedSystem.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${systemTypeColors[selectedSystem.type]}`}>
                  {selectedSystem.type.replace('-', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedSystem.status]}`}>
                  {selectedSystem.status.charAt(0).toUpperCase() + selectedSystem.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Information */}
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-900 dark:text-white">{selectedSystem.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Created</p>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedSystem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Components</p>
                      <p className="text-gray-900 dark:text-white">{selectedSystem.components.length}</p>
                    </div>
                  </div>
                </div>

                {selectedSystem.businessImpact && (
                  <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Business Impact</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSystem.businessImpact}</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Metrics */}
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>System Metrics</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedSystem.status === 'active' ? '98%' : selectedSystem.status === 'development' ? '45%' : '75%'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedSystem.status === 'active' ? '92%' : selectedSystem.status === 'development' ? '65%' : '80%'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(Math.random() * 500) + 100}ms
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(Math.random() * 10000) + 1000}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Total Runs</div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </h2>
              <div className="h-64 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <div>
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-500 dark:text-gray-400" />
                  <p>System analytics chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Configure System</span>
                </button>
                <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm flex items-center justify-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Logs</span>
                </button>
                <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Full Analytics</span>
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Wrench className="w-5 h-5" />
                <span>Tools ({systemTools.length})</span>
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {systemTools.length > 0 ? systemTools.map((tool) => (
                  <div key={tool.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</p>
                      <div className={`w-2 h-2 rounded-full ${
                        tool.status === 'active' ? 'bg-green-400' : 
                        tool.status === 'development' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{tool.category}</span>
                      <span>{tool.stats.usage}% usage</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <Wrench className="w-8 h-8 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">No tools found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project */}
          {systemProject && (
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <FolderOpen className="w-5 h-5" />
                <span>Project</span>
              </h3>
              <div 
                onClick={() => setSelectedProject(systemProject)}
                className="bg-white/20 dark:bg-white/10 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{systemProject.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[systemProject.status]}`}>
                      {systemProject.status.charAt(0).toUpperCase() + systemProject.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{systemProject.description}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Systems:</span>
                    <span className="text-gray-900 dark:text-white">{systemProject.systems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Team Members:</span>
                    <span className="text-gray-900 dark:text-white">{systemProject.assignedUsers.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client */}
          {systemClient && (
            <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Client</span>
              </h3>
              <div 
                onClick={() => setSelectedClient(systemClient)}
                className="bg-white/20 dark:bg-white/10 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{systemClient.companyName}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{systemClient.industry}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Location:</span>
                    <span className="text-gray-900 dark:text-white">{systemClient.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      systemClient.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      systemClient.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {systemClient.status.charAt(0).toUpperCase() + systemClient.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Members ({systemTeamMembers.length})</span>
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {systemTeamMembers.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedTeamMember(member)}
                  className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">{member.role}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    member.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modals */}
        {selectedTeamMember && (
          <TeamMemberModal
            member={selectedTeamMember}
            onClose={() => setSelectedTeamMember(null)}
          />
        )}

        {selectedClient && (
          <ClientModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}

        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Systems</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your AI systems and workflows</p>
        </div>
        <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New System</span>
        </button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Systems</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{allSystems.length}</p>
            </div>
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg">
              <Activity className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Systems</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {allSystems.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">In Development</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {allSystems.filter(s => s.status === 'development').length}
              </p>
            </div>
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">System Efficiency</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {allSystems.length > 0 ? Math.round((allSystems.filter(s => s.status === 'active').length / allSystems.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSystems.map((system) => {
          const TypeIcon = systemTypeIcons[system.type];
          const typeColorClass = systemTypeColors[system.type];
          const statusColorClass = statusColors[system.status];

          return (
            <Card
              glowOnHover={true}
              key={system.id}
              onClick={() => setSelectedSystem(system)}
              className="p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gradient-orange transition-colors">
                      {system.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColorClass}`}>
                      {system.type.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorClass}`}>
                  {system.status}
                </span>
              </div>

              <p className="text-[var(--fg-muted)] text-sm mb-4 line-clamp-2">{system.description}</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[var(--fg)]">{system.clientName}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                  <Activity className="w-4 h-4" />
                  <span className="text-[var(--fg)]">{system.projectName}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                  <Users className="w-4 h-4" />
                  <span className="text-[var(--fg)]">{system.teamMembers.length} team member{system.teamMembers.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--fg-muted)]">Components</span>
                  <span className="text-[var(--fg)] font-medium">{system.components.length}</span>
                </div>
              </div>

              {system.businessImpact && (
                <div className="mt-3 p-3 bg-[var(--surface)] rounded-lg">
                  <p className="text-xs text-[var(--fg-muted)]">
                    <strong>Impact:</strong> {system.businessImpact}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {allSystems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 mb-4">No systems found</div>
          <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 mx-auto">
            <Plus className="w-5 h-5" />
            <span>Create Your First System</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Systems;