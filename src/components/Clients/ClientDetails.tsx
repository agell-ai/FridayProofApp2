import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, DollarSign, FileText, Plus, Edit } from 'lucide-react';
import { Client } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { InvoiceFormModal } from './InvoiceFormModal';
import { ProposalFormModal } from './ProposalFormModal';
import { EntityFormModal } from '../Shared/EntityFormModal';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose }) => {
  const { invoices, proposals } = useClients();
  const { projects } = useProjects();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter projects for this client
  const clientProjects = projects.filter(project => project.clientId === client.id);
  
  // Filter invoices for this client
  const clientInvoices = invoices.filter(invoice => invoice.clientId === client.id);
  
  // Calculate total revenue
  const totalRevenue = clientInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Calculate project metrics
  const projectMetrics = clientProjects.reduce((acc, project) => {
    acc.totalValue += project.budget || 0;
    acc.completedValue += project.status === 'completed' ? (project.budget || 0) : 0;
    return acc;
  }, { totalValue: 0, completedValue: 0 });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.companyName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{client.industry}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Client</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${client.contacts[0]?.email}`} className="text-blue-600 hover:text-blue-700">
                      {client.contacts[0]?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{client.contacts[0]?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white">{client.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                    <p className="text-gray-900 dark:text-white">{client.industry}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Client Since</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Summary</h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${client.analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Project Value</p>
                    <p className="text-2xl font-bold text-blue-600">${client.projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Proposal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
            
            {clientProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'deployed' ? 'bg-green-100 text-green-800' :
                          project.status === 'development' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                        <span className="text-gray-900 dark:text-white">${project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Started:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No projects found for this client.</p>
            )}
          </div>

          {/* Invoices */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoices</h2>
            
            {clientInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Invoice #</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Amount</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          {invoice.number}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No invoices found for this client.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInvoiceModal && (
        <InvoiceFormModal
          clientId={client.id}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showProposalModal && (
        <ProposalFormModal
          clientId={client.id}
          onClose={() => setShowProposalModal(false)}
        />
      )}

      {showEditModal && (
        <EntityFormModal
          type="client"
          entity={client}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ClientDetails;