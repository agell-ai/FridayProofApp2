import React, { useState } from 'react';
import { ArrowLeft, Edit, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../components/Shared/Button';
import { Card } from '../components/Shared/Card';
import { EntityFormModal } from '../components/Shared/EntityFormModal';
import { useTools } from '../hooks/useTools';

interface ProjectDetailsPageProps {
  project: any;
  onClose: () => void;
}

export function ProjectDetailsPage({ project, onClose }: ProjectDetailsPageProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { tools } = useTools();

  // Get tools/systems used in this project
  const projectSystems = tools.filter(tool => 
    project.systems?.includes(tool.id) || 
    project.description?.toLowerCase().includes(tool.name.toLowerCase())
  );

  // Mock data for costs and returns
  const mockCosts = {
    development: 15000,
    tools: 2400,
    maintenance: 1200,
    total: 18600
  };

  const mockReturns = {
    monthly: 8500,
    annual: 102000,
    roi: 448
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Client: {project.subtitle}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Project</span>
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Overview */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Project Overview
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : project.status === 'completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Last Updated
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {project.meta}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {project.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Tools/Systems Used */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tools & Systems
                    </h2>
                    {projectSystems.length > 0 ? (
                      <div className="space-y-3">
                        {projectSystems.map((system) => (
                          <div key={system.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {system.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {system.description}
                                </p>
                              </div>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                {system.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No specific tools/systems assigned to this project yet.
                      </p>
                    )}
                  </div>
                </Card>

                {/* Team Members */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team Members
                    </h2>
                    <div className="space-y-3">
                      {project.team?.map((member: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                              {member.name?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name || `Team Member ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.role || 'Team Member'}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400">
                          No team members assigned yet.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Financial Overview */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Financial Overview
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Costs
                        </label>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${mockCosts.total.toLocaleString()}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Development</span>
                            <span className="text-gray-900 dark:text-white">${mockCosts.development.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Tools</span>
                            <span className="text-gray-900 dark:text-white">${mockCosts.tools.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Maintenance</span>
                            <span className="text-gray-900 dark:text-white">${mockCosts.maintenance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Expected Returns */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Expected Returns
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Annual Revenue
                        </label>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${mockReturns.annual.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Monthly Revenue
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${mockReturns.monthly.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          ROI
                        </label>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {mockReturns.roi}%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Project Timeline */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Timeline
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Project Started</p>
                          <p className="text-xs text-gray-500">2 months ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Development Phase</p>
                          <p className="text-xs text-gray-500">In progress</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Testing Phase</p>
                          <p className="text-xs text-gray-500">Upcoming</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EntityFormModal
          type="project"
          entity={project}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProject) => {
            console.log('Updated project:', updatedProject);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}