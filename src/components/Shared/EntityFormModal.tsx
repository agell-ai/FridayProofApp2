import React, { useState, useEffect } from 'react';
import { X, User, Building2, Users, Wrench, Settings, FileText, ShoppingBag, Receipt, FileCheck } from 'lucide-react';

export type EntityType = 'client' | 'project' | 'team' | 'tool' | 'system' | 'template' | 'marketplace' | 'invoice' | 'proposal';

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: EntityType;
  initialData?: any;
}

interface ClientFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
}

interface ProjectFormValues {
  name: string;
  client: string;
  status: string;
  description: string;
  systems: string[];
}

interface TeamFormValues {
  name: string;
  email: string;
  role: string;
  company: string;
  skills: string[];
}

interface ToolFormValues {
  name: string;
  description: string;
  category: string;
  status: string;
}

interface SystemFormValues {
  name: string;
  description: string;
  category: string;
  status: string;
}

interface TemplateFormValues {
  name: string;
  description: string;
  category: string;
  usage: number;
  lastModified: string;
}

interface MarketplaceFormValues {
  name: string;
  description: string;
  category: string;
  downloads: number;
  rating: number;
  price: number;
}

interface InvoiceFormValues {
  amount: number;
  dueDate: string;
  status: string;
  description: string;
}

interface ProposalFormValues {
  title: string;
  value: number;
  status: string;
  description: string;
}

const iconMap = {
  client: Building2,
  project: Wrench,
  team: Users,
  tool: Settings,
  system: Settings,
  template: FileText,
  marketplace: ShoppingBag,
  invoice: Receipt,
  proposal: FileCheck,
};

const titleMap = {
  client: 'Client',
  project: 'Project',
  team: 'Team Member',
  tool: 'Tool',
  system: 'System',
  template: 'Template',
  marketplace: 'Marketplace Item',
  invoice: 'Invoice',
  proposal: 'Proposal',
};

const descriptionMap = {
  client: 'Add a new client to your workspace',
  project: 'Create a new project',
  team: 'Add a new team member',
  tool: 'Add a new tool',
  system: 'Add a new system',
  template: 'Create a new template',
  marketplace: 'Create a new marketplace listing',
  invoice: 'Create a new invoice',
  proposal: 'Create a new proposal',
};

const ClientForm: React.FC<{ data: ClientFormValues; onChange: (data: ClientFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Company Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter company name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Email
      </label>
      <input
        type="email"
        value={data.email}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter email address"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Phone
      </label>
      <input
        type="tel"
        value={data.phone}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter phone number"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  </div>
);

const ProjectForm: React.FC<{ data: ProjectFormValues; onChange: (data: ProjectFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Project Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter project name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Client
      </label>
      <input
        type="text"
        value={data.client}
        onChange={(e) => onChange({ ...data, client: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter client name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="planning">Planning</option>
        <option value="development">Development</option>
        <option value="testing">Testing</option>
        <option value="deployed">Deployed</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter project description"
      />
    </div>
  </div>
);

const TeamForm: React.FC<{ data: TeamFormValues; onChange: (data: TeamFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter full name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Email
      </label>
      <input
        type="email"
        value={data.email}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter email address"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Role
      </label>
      <input
        type="text"
        value={data.role}
        onChange={(e) => onChange({ ...data, role: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter role"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Company
      </label>
      <input
        type="text"
        value={data.company}
        onChange={(e) => onChange({ ...data, company: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter company"
      />
    </div>
  </div>
);

const ToolForm: React.FC<{ data: ToolFormValues; onChange: (data: ToolFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tool Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter tool name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter tool description"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        value={data.category}
        onChange={(e) => onChange({ ...data, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="development">Development</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
        <option value="analytics">Analytics</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="development">Development</option>
        <option value="testing">Testing</option>
        <option value="deployed">Deployed</option>
      </select>
    </div>
  </div>
);

const SystemForm: React.FC<{ data: SystemFormValues; onChange: (data: SystemFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        System Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter system name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter system description"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        value={data.category}
        onChange={(e) => onChange({ ...data, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="automation">Automation</option>
        <option value="integration">Integration</option>
        <option value="workflow">Workflow</option>
        <option value="monitoring">Monitoring</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="development">Development</option>
        <option value="testing">Testing</option>
        <option value="deployed">Deployed</option>
      </select>
    </div>
  </div>
);

const TemplateForm: React.FC<{ data: TemplateFormValues; onChange: (data: TemplateFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Template Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter template name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter template description"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        value={data.category}
        onChange={(e) => onChange({ ...data, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="web">Web</option>
        <option value="mobile">Mobile</option>
        <option value="automation">Automation</option>
        <option value="integration">Integration</option>
      </select>
    </div>
  </div>
);

const MarketplaceForm: React.FC<{ data: MarketplaceFormValues; onChange: (data: MarketplaceFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Item Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter item name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter item description"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        value={data.category}
        onChange={(e) => onChange({ ...data, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="template">Template</option>
        <option value="plugin">Plugin</option>
        <option value="theme">Theme</option>
        <option value="component">Component</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Price ($)
      </label>
      <input
        type="number"
        value={data.price}
        onChange={(e) => onChange({ ...data, price: parseFloat(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter price"
        min="0"
        step="0.01"
      />
    </div>
  </div>
);

const InvoiceForm: React.FC<{ data: InvoiceFormValues; onChange: (data: InvoiceFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Amount ($)
      </label>
      <input
        type="number"
        value={data.amount}
        onChange={(e) => onChange({ ...data, amount: parseFloat(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter amount"
        min="0"
        step="0.01"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Due Date
      </label>
      <input
        type="date"
        value={data.dueDate}
        onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter invoice description"
      />
    </div>
  </div>
);

const ProposalForm: React.FC<{ data: ProposalFormValues; onChange: (data: ProposalFormValues) => void }> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Title
      </label>
      <input
        type="text"
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter proposal title"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Value ($)
      </label>
      <input
        type="number"
        value={data.value}
        onChange={(e) => onChange({ ...data, value: parseFloat(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Enter proposal value"
        min="0"
        step="0.01"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        value={data.status}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
        placeholder="Enter proposal description"
      />
    </div>
  </div>
);

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  initialData
}) => {
  const [formData, setFormData] = useState<any>(() => {
    const defaults = {
      client: { name: '', email: '', phone: '', company: '', status: 'active' },
      project: { name: '', client: '', status: 'planning', description: '', systems: [] },
      team: { name: '', email: '', role: '', company: '', skills: [] },
      tool: { name: '', description: '', category: 'development', status: 'development' },
      system: { name: '', description: '', category: 'automation', status: 'development' },
      template: { name: '', description: '', category: 'web', usage: 0, lastModified: new Date().toISOString() },
      marketplace: { name: '', description: '', category: 'template', downloads: 0, rating: 0, price: 0 },
      invoice: { amount: 0, dueDate: '', status: 'draft', description: '' },
      proposal: { title: '', value: 0, status: 'draft', description: '' },
    };
    return initialData || defaults[type] || {};
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const Icon = iconMap[type];
  const title = titleMap[type];
  const description = descriptionMap[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {initialData ? `Edit ${title}` : `Add ${title}`}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'client' && <ClientForm data={formData} onChange={setFormData} />}
          {type === 'project' && <ProjectForm data={formData} onChange={setFormData} />}
          {type === 'team' && <TeamForm data={formData} onChange={setFormData} />}
          {type === 'tool' && <ToolForm data={formData} onChange={setFormData} />}
          {type === 'system' && <SystemForm data={formData} onChange={setFormData} />}
          {type === 'template' && <TemplateForm data={formData} onChange={setFormData} />}
          {type === 'marketplace' && <MarketplaceForm data={formData} onChange={setFormData} />}
          {type === 'invoice' && <InvoiceForm data={formData} onChange={setFormData} />}
          {type === 'proposal' && <ProposalForm data={formData} onChange={setFormData} />}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};