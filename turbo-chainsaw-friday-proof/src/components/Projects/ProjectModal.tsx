import React from 'react';
import { X, FolderOpen, Calendar, Users, Building2, Wrench, Clock } from 'lucide-react';
import { Project } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useTeam } from '../../hooks/useTeam';
import { useAuth } from '../../hooks/useAuth';
import TeamMemberModal from '../Clients/TeamMemberModal';
import ClientModal from './ClientModal';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const statusColors = {
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  testing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  deployed: 'bg-green-500/20 text-green-400 border-green-500/30',
  maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { clients } = useClients();
  const { getTeamMembersByIds } = useTeam();
  const { user } = useAuth();
  const [selectedTeamMember, setSelectedTeamMember] = React.useState(null);
  const [selectedClient, setSelectedClient] = React.useState(null);
  
  const projectClient = clients.find(client => client.id === project.clientId);
  const assignedTeamMembers = getTeamMembersByIds(project.assignedUsers);
  const projectManager = project.managerId ? getTeamMembersByIds([project.managerId])[0] : null;
  
  // Calculate basic analytics
  const totalSystems = project.systems.length;
  const activeSystems = project.systems.filter(s => s.status === 'active').length;
  const systemEfficiency = totalSystems > 0 ? Math.round((activeSystems / totalSystems) * 100) : 0;
  const estimatedValue = projectClient ? Math.floor(Math.random() * 100000) + 50000 : 75000;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
              <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[project.status]}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-900 dark:text-white">{project.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Created</p>
                        <p className="text-gray-900 dark:text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Last Updated</p>
                        <p className="text-gray-900 dark:text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Systems Overview */}
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Wrench className="w-5 h-5" />
                  <span>Systems Overview ({totalSystems})</span>
                </h3>
                {project.systems.length > 0 ? (
                  <div className="space-y-3">
                    {project.systems.map((system) => (
                      <div key={system.id} className="p-4 bg-white/30 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{system.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${
                            system.status === 'active' ? 'bg-green-400' : 
                            system.status === 'development' ? 'bg-blue-400' : 
                            system.status === 'testing' ? 'bg-purple-400' :
                            system.status === 'design' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{system.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{system.type.replace('-', ' ')}</span>
                          <span className="capitalize">{system.status}</span>
                        </div>
                        {system.businessImpact && (
                          <div className="mt-2 p-2 bg-white/20 dark:bg-white/10 rounded text-xs text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                            <strong>Impact:</strong> {system.businessImpact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 dark:text-gray-300">No systems configured yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Analytics</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSystems}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Total Systems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeSystems}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Active Systems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{systemEfficiency}%</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">System Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">${estimatedValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Estimated Value</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                    Add System
                  </button>
                  <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm">
                    Edit Project
                  </button>
                  <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client and Team Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Section */}
            {projectClient && (
              <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Client</span>
                </h4>
                <div 
                  onClick={() => setSelectedClient(projectClient)}
                  className="bg-white/20 dark:bg-white/10 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{projectClient.companyName}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{projectClient.industry}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <span className="text-gray-900 dark:text-white">{projectClient.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        projectClient.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        projectClient.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {projectClient.status.charAt(0).toUpperCase() + projectClient.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Projects:</span>
                      <span className="text-gray-900 dark:text-white">{projectClient.projects.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Section */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Members ({assignedTeamMembers.length}{projectManager ? ' + 1 Manager' : ''})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {projectManager && user?.accountType === 'agency' && (
                  <div 
                    key={projectManager.id}
                    onClick={() => setSelectedTeamMember(projectManager)}
                    className="flex items-center space-x-3 p-3 bg-gradient-primary rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {projectManager.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{projectManager.name}</p>
                      <p className="text-xs text-white/80">Project Manager</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
                {assignedTeamMembers.map((member) => (
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
    </div>
  );
};

export default ProjectModal;