import React, { useState, useMemo } from 'react';
import { Search, Plus, Users, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import { WorkspaceCard } from '../components/Workspaces/WorkspaceCard';
import { EntityFormModal } from '../components/Shared/EntityFormModal';
import { EntityType } from '../types';

interface WorkspacesProps {
  onSelectProject: (project: any) => void;
  onSelectClient: (client: any) => void;
}

export default function Workspaces({ onSelectProject, onSelectClient }: WorkspacesProps) {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { teamMembers } = useTeam();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<'project' | 'client' | 'team'>('project');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<any>(null);

  // Filter items based on active type and search term
  const filteredItems = useMemo(() => {
    let items: any[] = [];
    
    switch (activeType) {
      case 'project':
        items = projects.map(project => ({
          ...project,
          type: 'project' as const,
          title: project.name,
          subtitle: project.client,
          meta: `Updated ${new Date(project.updatedAt).toLocaleDateString()}`,
          status: project.status
        }));
        break;
      case 'client':
        items = clients.map(client => ({
          ...client,
          type: 'client' as const,
          title: client.name,
          subtitle: client.industry,
          meta: `Updated ${new Date(client.updatedAt).toLocaleDateString()}`,
          status: client.status
        }));
        break;
      case 'team':
        items = teamMembers.map(member => ({
          ...member,
          type: 'team' as const,
          title: member.name,
          subtitle: member.company,
          meta: member.email,
          status: member.status
        }));
        break;
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  }, [activeType, projects, clients, teamMembers, searchTerm]);

  // Calculate summary stats for active type
  const summaryStats = useMemo(() => {
    switch (activeType) {
      case 'project':
        return {
          total: projects.length,
          active: projects.filter(p => p.status === 'active').length,
          completed: projects.filter(p => p.status === 'completed').length
        };
      case 'client':
        return {
          total: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          completed: clients.filter(c => c.status === 'inactive').length
        };
      case 'team':
        return {
          total: teamMembers.length,
          active: teamMembers.filter(m => m.status === 'active').length,
          completed: teamMembers.filter(m => m.status === 'inactive').length
        };
    }
  }, [activeType, projects, clients, teamMembers]);

  const handleCardClick = (item: any) => {
    switch (item.type) {
      case 'project':
        onSelectProject(item);
        break;
      case 'client':
        onSelectClient(item);
        break;
      case 'team':
        setSelectedTeamMember(item);
        break;
    }
  };

  const getAddButtonText = () => {
    switch (activeType) {
      case 'project':
        return 'Add Project';
      case 'client':
        return 'Add Client';
      case 'team':
        return 'Add Team Member';
    }
  };

  const getEntityType = (): EntityType => {
    switch (activeType) {
      case 'project':
        return 'project';
      case 'client':
        return 'client';
      case 'team':
        return 'team';
    }
  };

  // Check permissions for tabs
  const canViewClients = user?.accountType === 'agency' || user?.accountType === 'consultant';
  const canViewTeam = user?.accountType === 'agency' || user?.accountType === 'business';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workspaces
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your {activeType}s and collaborate with your team
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {getAddButtonText()}
        </button>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveType('project')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeType === 'project'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2 inline" />
          Projects
        </button>
        
        {canViewClients && (
          <button
            onClick={() => setActiveType('client')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeType === 'client'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 mr-2 inline" />
            Clients
          </button>
        )}
        
        {canViewTeam && (
          <button
            onClick={() => setActiveType('team')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeType === 'team'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2 inline" />
            Team
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total {activeType === 'project' ? 'Projects' : activeType === 'client' ? 'Clients' : 'Team Members'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {activeType === 'project' ? 'Completed' : activeType === 'client' ? 'Inactive' : 'Inactive'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${activeType}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <WorkspaceCard
            key={item.id}
            item={item}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Briefcase className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeType}s found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? `No ${activeType}s match your search criteria.`
              : `Get started by creating your first ${activeType}.`
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {getAddButtonText()}
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <EntityFormModal
          type={getEntityType()}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedTeamMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Team Member Details
                </h2>
                <button
                  onClick={() => setSelectedTeamMember(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedTeamMember.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTeamMember.role} at {selectedTeamMember.company}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <a
                      href={`mailto:${selectedTeamMember.email}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {selectedTeamMember.email}
                    </a>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedTeamMember.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {selectedTeamMember.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeamMember.skills?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-gray-500">No skills listed</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Projects
                  </label>
                  <div className="space-y-2">
                    {selectedTeamMember.currentProjects?.map((project: string, index: number) => (
                      <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        {project}
                      </div>
                    )) || <span className="text-gray-500">No current projects</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Projects Completed
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTeamMember.projectsCompleted || 0}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Join Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedTeamMember.joinDate ? new Date(selectedTeamMember.joinDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}