import React from 'react';
import { X, Mail, Phone, Linkedin, MapPin, BarChart3, Users, FolderOpen, Wrench, BookOpen, BookTemplate as FileTemplate, ShoppingBag, User } from 'lucide-react';
import { TeamMember } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useTeam } from '../../hooks/useTeam';

interface TeamMemberModalProps {
  member: TeamMember;
  onClose: () => void;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ member, onClose }) => {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { getTeamMembersByIds } = useTeam();

  // Get actual clients this team member works with
  const memberClients = clients.filter(client => 
    client.teamMemberIds.includes(member.id)
  );

  // Get actual projects this team member works on
  const memberProjects = projects.filter(project => 
    project.assignedUsers.includes(member.id)
  );

  // Get team collaborators (other team members on same projects)
  const collaboratorIds = [...new Set(
    memberProjects.flatMap(project => project.assignedUsers)
      .filter(id => id !== member.id)
  )];
  const collaborators = getTeamMembersByIds(collaboratorIds);

  // Calculate tools, library items, templates, marketplace items from projects
  const memberTools = memberProjects.flatMap(project => 
    project.systems.map(system => ({
      id: system.id,
      name: system.name,
      type: system.type,
      status: system.status,
      projectName: project.name
    }))
  );

  const memberLibraryItems = memberClients.flatMap(client => 
    client.library.map(item => ({
      ...item,
      clientName: client.companyName
    }))
  );

  const memberTemplates = memberClients.flatMap(client => 
    client.templates.map(template => ({
      ...template,
      clientName: client.companyName
    }))
  );

  // Mock marketplace items based on member's contributions
  const memberMarketplaceItems = memberTools.slice(0, Math.min(3, memberTools.length)).map((tool, index) => ({
    id: `mp-${member.id}-${index + 1}`,
    name: `${tool.name} Template`,
    type: 'Template',
    downloads: Math.floor(Math.random() * 100) + 10,
    rating: (Math.random() * 2 + 3).toFixed(1)
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{member.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Email</p>
                      <a href={`mailto:${member.email}`} className="text-sunset-purple hover:text-sunset-pink transition-colors">
                        {member.email}
                      </a>
                    </div>
                  </div>

                  {member.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Phone</p>
                        <a href={`tel:${member.phone}`} className="text-sunset-purple hover:text-sunset-pink transition-colors">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {member.linkedinUrl && (
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">LinkedIn</p>
                        <a 
                          href={member.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sunset-purple hover:text-sunset-pink transition-colors"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}

                  {member.city && member.state && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Location</p>
                        <p className="text-gray-900 dark:text-white">{member.city}, {member.state}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm rounded-md backdrop-blur-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{member.analytics.projectsCompleted}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{member.analytics.hoursWorked.toLocaleString()}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Hours Worked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{member.analytics.clientSatisfactionScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{member.analytics.monthlyProductivity}%</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Productivity</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{memberClients.length}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{memberProjects.length}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Current Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{memberTools.length}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Systems Built</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clients */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Associated Clients ({memberClients.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberClients.map((client) => (
                  <div key={client.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{client.companyName}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{client.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{client.location}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        client.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FolderOpen className="w-5 h-5" />
                <span>Projects ({memberProjects.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberProjects.map((project) => (
                  <div key={project.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'development' ? 'bg-blue-500/20 text-blue-400' :
                        project.status === 'testing' ? 'bg-purple-500/20 text-purple-400' :
                        project.status === 'planning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{project.systems.length} systems</span>
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Team Collaborators ({collaborators.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{collaborator.name}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">{collaborator.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Wrench className="w-5 h-5" />
                <span>Systems & Tools ({memberTools.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberTools.map((tool) => (
                  <div key={tool.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</p>
                      <div className={`w-2 h-2 rounded-full ${
                        tool.status === 'active' ? 'bg-green-400' : 
                        tool.status === 'development' ? 'bg-blue-400' : 
                        tool.status === 'testing' ? 'bg-purple-400' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span className="capitalize">{tool.type.replace('-', ' ')}</span>
                      <span>{tool.projectName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Library */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Library Access ({memberLibraryItems.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberLibraryItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <span className="capitalize">{item.type} • {item.category}</span>
                      <span>{item.clientName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FileTemplate className="w-5 h-5" />
                <span>Templates Used ({memberTemplates.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberTemplates.map((template) => (
                  <div key={template.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <span>{template.category} • {template.usage} uses</span>
                      <span>{template.clientName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Marketplace Contributions ({memberMarketplaceItems.length})</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {memberMarketplaceItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <span>{item.type} • ⭐ {item.rating}</span>
                      <span>{item.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberModal;