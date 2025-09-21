import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, MapPin, Globe, Linkedin, Mail, Phone, User, ExternalLink, Calendar, Users, FolderOpen, Wrench, BookOpen, BookTemplate as FileTemplate, FileText, Presentation as PresentationChart, BarChart3, DollarSign, Clock, X } from 'lucide-react';
import { Client, ClientProposal } from '../../types';
import TeamMemberModal from './TeamMemberModal';
import ProjectModal from '../Projects/ProjectModal';
import { Button } from '../Shared/Button';
import { EntityFormModal, ProposalFormValues, FormMode } from '../Shared/EntityFormModal';

import { useTeam } from '../../hooks/useTeam';
import { useProjects } from '../../hooks/useProjects';
import { useTools } from '../../hooks/useTools';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
  onCreateProposal: (proposal: Omit<ClientProposal, 'id'>) => ClientProposal | null;
  onUpdateProposal: (
    proposalId: string,
    updates: Partial<Omit<ClientProposal, 'id'>>,
  ) => ClientProposal | null;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  onBack,
  onCreateProposal,
  onUpdateProposal,
}) => {
  const { getTeamMembersByIds } = useTeam();
  const { projects } = useProjects();
  const { tools } = useTools();
  const assignedTeamMembers = getTeamMembersByIds(client.teamMemberIds);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState<ClientProposal | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalFormMode, setProposalFormMode] = useState<FormMode>('create');
  const [proposalFormInitial, setProposalFormInitial] = useState<ClientProposal | null>(null);

  // Get actual project data for client projects
  const clientProjects = projects.filter(project => project.clientId === client.id);
  
  // Get actual tools data for client tools
  const clientTools = tools.filter(tool => tool.clientId === client.id);
  
  // Also include projects from client.projects data if they exist
  const allClientProjects = [...clientProjects];
  
  // Add any additional projects from client.projects that aren't already included
  client.projects.forEach(clientProject => {
    if (!allClientProjects.find(p => p.name === clientProject.name)) {
      // Create a mock project object from client project data
      const mockProject = {
        id: clientProject.id,
        name: clientProject.name,
        description: `${clientProject.name} project for ${client.companyName}`,
        status: clientProject.status,
        clientId: client.id,
        accountId: 'acc-1',
        assignedUsers: client.teamMemberIds.slice(0, 2),
        systems: [],
        createdAt: clientProject.startDate,
        updatedAt: clientProject.endDate || new Date().toISOString()
      };
      allClientProjects.push(mockProject);
    }
  });

  // Combine client tools with actual tools data
  const allClientTools = [...clientTools];
  
  // Add any additional tools from client.tools that aren't already included
  client.tools.forEach(clientTool => {
    if (!allClientTools.find(t => t.name === clientTool.name)) {
      // Create a mock tool object from client tool data
      const mockTool = {
        id: clientTool.id,
        name: clientTool.name,
        description: `${clientTool.type} system for ${client.companyName}`,
        category: 'AI Tool',
        status: clientTool.status === 'active' ? 'active' : 
                clientTool.status === 'development' ? 'development' : 'inactive',
        clientId: client.id,
        clientName: client.companyName,
        projectId: 'unknown',
        projectName: 'Unknown Project',
        teamMembers: client.teamMemberIds.slice(0, 2),
        businessImpact: `Streamlines ${client.industry} processes and improves efficiency`,
        stats: {
          usage: clientTool.usage || 85,
          efficiency: 90,
          uptime: 95,
          processingTime: 200,
          totalRuns: 5000,
          costSavings: 25000,
          errorRate: 2,
        },
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };
      allClientTools.push(mockTool);
    }
  });

  useEffect(() => {
    if (!selectedProposal) {
      return;
    }

    const latestProposal = client.proposals.find(proposal => proposal.id === selectedProposal.id);
    if (latestProposal && latestProposal !== selectedProposal) {
      setSelectedProposal(latestProposal);
    }
  }, [client.proposals, selectedProposal]);

  const closeProposalModal = () => {
    const editingProposal = proposalFormMode === 'edit' ? proposalFormInitial : null;

    setIsProposalModalOpen(false);
    setProposalFormInitial(null);

    if (editingProposal) {
      const latest = client.proposals.find(proposal => proposal.id === editingProposal.id);
      if (latest) {
        setSelectedProposal(latest);
      }
    }
  };

  const handleProposalFormSubmit = (values: ProposalFormValues) => {
    if (proposalFormMode === 'create') {
      const created = onCreateProposal(values);
      if (!created) {
        return;
      }
      setSelectedProposal(created);
      closeProposalModal();
      return;
    }

    if (proposalFormMode === 'edit' && proposalFormInitial) {
      const updated = onUpdateProposal(proposalFormInitial.id, values);
      if (!updated) {
        return;
      }
      setSelectedProposal(updated);
      closeProposalModal();
      return;
    }
  };

  const openCreateProposalModal = () => {
    setProposalFormMode('create');
    setProposalFormInitial(null);
    setIsProposalModalOpen(true);
  };

  const openEditProposalModal = (proposal: ClientProposal) => {
    setSelectedProposal(null);
    setProposalFormMode('edit');
    setProposalFormInitial(proposal);
    setIsProposalModalOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sunset-purple hover:text-sunset-pink transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clients</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.companyName}</h1>
              <p className="text-gray-600 dark:text-gray-400">{client.industry}</p>
            </div>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[client.status]}`}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Information</h2>
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
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contacts</h2>
            <div className="space-y-4">
              {client.contacts.map((contact) => (
                <div key={contact.id} className="bg-white/20 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
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
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
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

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                glowOnHover
                className="w-full"
                onClick={openCreateProposalModal}
              >
                <div className="flex items-center justify-center gap-2">
                  <PresentationChart className="w-4 h-4" />
                  <span>Create Proposal</span>
                </div>
              </Button>
              <button className="w-full bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                New Project
              </button>
              <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm">
                Edit Client
              </button>
              <button className="w-full bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/40 dark:hover:bg-white/15 transition-colors backdrop-blur-sm">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team ({assignedTeamMembers.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {assignedTeamMembers.slice(0, 3).map((member) => (
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
                  <p className="text-xs text-gray-700 dark:text-gray-300">{member.role}</p>
                </div>
              </div>
            ))}
            {assignedTeamMembers.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{assignedTeamMembers.length - 3} more members
              </p>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Projects ({client.projects.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {allClientProjects.slice(0, 3).map((project) => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{project.name}</p>
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
            {allClientProjects.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{allClientProjects.length - 3} more projects
              </p>
            )}
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Tools ({allClientTools.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {allClientTools.slice(0, 3).map((tool) => (
              <div 
                key={tool.id} 
                onClick={() => setSelectedTool(tool)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{tool.name}</p>
                  <div className={`w-2 h-2 rounded-full ${
                    tool.status === 'active' ? 'bg-green-400' : 
                    tool.status === 'development' ? 'bg-blue-400' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{tool.category || tool.type}</span>
                  <span>{tool.stats?.usage || tool.usage || 0}% usage</span>
                </div>
              </div>
            ))}
            {allClientTools.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{allClientTools.length - 3} more tools
              </p>
            )}
          </div>
        </div>

        {/* Library Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Library ({client.library.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {client.library.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedLibraryItem(item)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{item.name}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                  <span className="capitalize">{item.type}</span>
                  <span>{item.category}</span>
                </div>
              </div>
            ))}
            {client.library.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{client.library.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileTemplate className="w-5 h-5" />
              <span>Templates ({client.templates.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {client.templates.slice(0, 3).map((template) => (
              <div 
                key={template.id} 
                onClick={() => setSelectedTemplate(template)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{template.name}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                  <span>{template.category}</span>
                  <span>{template.usage} uses</span>
                </div>
              </div>
            ))}
            {client.templates.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{client.templates.length - 3} more templates
              </p>
            )}
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Invoices ({client.invoices.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {client.invoices.slice(0, 3).map((invoice) => (
              <div 
                key={invoice.id} 
                onClick={() => setSelectedInvoice(invoice)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{invoice.number}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>${invoice.amount.toLocaleString()}</span>
                  <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {client.invoices.length > 3 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                +{client.invoices.length - 3} more invoices
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Proposals and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposals Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <PresentationChart className="w-5 h-5" />
              <span>Proposals ({client.proposals.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {client.proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                onClick={() => setSelectedProposal(proposal)}
                className="p-3 bg-white/20 dark:bg-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 cursor-pointer hover:scale-105 group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sunset-orange transition-colors">{proposal.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    proposal.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>${proposal.value.toLocaleString()}</span>
                  {proposal.sentDate && (
                    <span>Sent: {new Date(proposal.sentDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </h3>
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
      </div>

      {/* Financials Section */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Financials</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ${client.financials.budget.toLocaleString()}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Budget</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total Allocated</div>
          </div>
          <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${client.financials.revenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Revenue</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Generated</div>
          </div>
          <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              ${client.financials.cost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Cost</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Total Expenses</div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/20 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Profit Margin:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                ${(client.financials.revenue - client.financials.cost).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Budget Utilization:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {client.financials.budget > 0 ? Math.round((client.financials.cost / client.financials.budget) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <EntityFormModal
        isOpen={isProposalModalOpen}
        type="proposal"
        mode={proposalFormMode}
        initialData={proposalFormInitial}
        activeClient={client}
        onClose={closeProposalModal}
        onSubmit={handleProposalFormSubmit}
      />

      {/* Team Member Modal */}
      {selectedTeamMember && (
        <TeamMemberModal
          member={selectedTeamMember}
          onClose={() => setSelectedTeamMember(null)}
        />
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Modals for other sections */}
      {selectedLibraryItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-2xl w-full p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLibraryItem.name}</h2>
              <button
                onClick={() => setSelectedLibraryItem(null)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</h3>
                <p className="text-gray-900 dark:text-white capitalize">{selectedLibraryItem.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h3>
                <p className="text-gray-900 dark:text-white">{selectedLibraryItem.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created</h3>
                <p className="text-gray-900 dark:text-white">{new Date(selectedLibraryItem.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-2xl w-full p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h3>
                <p className="text-gray-900 dark:text-white">{selectedTemplate.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usage Count</h3>
                <p className="text-gray-900 dark:text-white">{selectedTemplate.usage} times</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Modified</h3>
                <p className="text-gray-900 dark:text-white">{new Date(selectedTemplate.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-2xl w-full p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice {selectedInvoice.number}</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedInvoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    selectedInvoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</h3>
                <p className="text-gray-900 dark:text-white">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
              {selectedInvoice.paidDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid Date</h3>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-2xl w-full p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProposal.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditProposalModal(selectedProposal)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedProposal.value.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProposal.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    selectedProposal.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    selectedProposal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                  </span>
                </div>
              </div>
              {selectedProposal.sentDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sent Date</h3>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedProposal.sentDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedProposal.responseDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Date</h3>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedProposal.responseDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tool Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-md z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTool.name}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedTool.category || 'AI Tool'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      selectedTool.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      selectedTool.status === 'development' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      selectedTool.status === 'testing' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      selectedTool.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {selectedTool.status.charAt(0).toUpperCase() + selectedTool.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tool Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tool Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                        <p className="text-gray-900 dark:text-white">{selectedTool.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Created</p>
                            <p className="text-gray-900 dark:text-white">{new Date(selectedTool.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Last Updated</p>
                            <p className="text-gray-900 dark:text-white">{new Date(selectedTool.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {selectedTool.businessImpact && (
                        <div className="bg-white/30 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg p-4 backdrop-blur-sm">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Business Impact</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTool.businessImpact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {selectedTool.stats && (
                    <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Performance Metrics</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTool.stats.usage || selectedTool.usage || 0}%</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Usage Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedTool.stats.efficiency || 90}%</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Efficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedTool.stats.uptime || 95}%</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Uptime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedTool.stats.processingTime || 200}ms</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Avg Response</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tool Stats</h4>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTool.stats?.totalRuns?.toLocaleString() || '5,000'}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">Total Runs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">${selectedTool.stats?.costSavings?.toLocaleString() || '25,000'}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">Cost Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTool.stats?.errorRate || 2}%</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">Error Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;