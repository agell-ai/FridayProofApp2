import React from 'react';
import { X, Building2, MapPin, Globe, Linkedin, Mail, Phone, User, ExternalLink, Calendar, Users, FolderOpen, Wrench, BarChart3, DollarSign } from 'lucide-react';
import { Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Shared/Button';

interface ClientModalProps {
  client: Client;
  onClose: () => void;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose }) => {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.companyName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{client.industry}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[client.status]}`}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
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
            {/* Company Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Location</p>
                      <p className="text-gray-900 dark:text-white">{client.location}</p>
                    </div>
                  </div>

                  {client.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Website</p>
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sunset-purple hover:text-sunset-pink transition-colors flex items-center space-x-1"
                        >
                          <span>{client.website}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {client.linkedinUrl && (
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">LinkedIn</p>
                        <a 
                          href={client.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sunset-purple hover:text-sunset-pink transition-colors flex items-center space-x-1"
                        >
                          <span>Company Profile</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Client Since</p>
                      <p className="text-gray-900 dark:text-white">{new Date(client.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contacts</h3>
                <div className="space-y-4">
                  {client.contacts.map((contact) => (
                    <div key={contact.id} className="bg-white/30 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{contact.title}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-sunset-purple hover:text-sunset-pink transition-colors text-sm"
                          >
                            {contact.email}
                          </a>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-sunset-purple hover:text-sunset-pink transition-colors text-sm"
                          >
                            {contact.phone}
                          </a>
                        </div>

                        {contact.linkedinUrl && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <a 
                              href={contact.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sunset-purple hover:text-sunset-pink transition-colors text-sm flex items-center space-x-1"
                            >
                              <span>LinkedIn Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{client.projectIds.length}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Active Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{client.contacts.length}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300">Last Updated</div>
                    <div className="text-gray-900 dark:text-white">{new Date(client.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className={`grid grid-cols-1 ${user?.accountType === 'consultant' ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
            {/* Projects Section */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5" />
                  <span>Projects ({client.projects.length})</span>
                </h4>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {client.projects.map((project) => (
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
                      <span>${project.budget.toLocaleString()}</span>
                      <span>{project.progress}% complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Section */}
            <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Wrench className="w-5 h-5" />
                  <span>Tools ({client.tools.length})</span>
                </h4>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {client.tools.map((tool) => (
                  <div key={tool.id} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</p>
                      <div className={`w-2 h-2 rounded-full ${
                        tool.status === 'active' ? 'bg-green-400' : 
                        tool.status === 'development' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{tool.type}</span>
                      <span>{tool.usage}% usage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members Section - Only show for non-consultant accounts */}
            {user?.accountType !== 'consultant' && (
              <div className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Team Members ({client.teamMemberIds.length})</span>
                  </h4>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {client.teamMemberIds.slice(0, 5).map((memberId, index) => (
                    <div key={memberId} className="p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {`TM${index + 1}`}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Team Member {index + 1}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Assigned to client</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Analytics Section */}
            <div className={`bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm ${user?.accountType === 'consultant' ? 'lg:col-span-1' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ${client.analytics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ${client.analytics.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">Monthly Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {client.analytics.projectsCompleted}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {client.analytics.clientSatisfaction > 0 ? client.analytics.clientSatisfaction.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">Satisfaction Score</div>
                </div>
              </div>
            </div>

            {/* Financials Section */}
            <div className={`bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm ${user?.accountType === 'consultant' ? 'lg:col-span-1' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Financials</span>
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Budget:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${client.financials.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Revenue:</span>
                  <span className="text-sm font-medium text-green-400">
                    ${client.financials.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Cost:</span>
                  <span className="text-sm font-medium text-orange-400">
                    ${client.financials.cost.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/20 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Profit:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${(client.financials.revenue - client.financials.cost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;