import { useState, useMemo } from 'react';
import { 
  Client, 
  ClientContact, 
  ClientProject, 
  ClientTool, 
  ClientLibraryItem, 
  ClientTemplate, 
  ClientInvoice, 
  ClientProposal, 
  ClientAnalytics, 
  ClientFinancials 
} from '../types';

const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'Acme Corporation',
    location: '123 Business Ave, New York, NY 10001',
    website: 'https://acme.com',
    linkedinUrl: 'https://linkedin.com/company/acme',
    industry: 'Technology',
    status: 'active',
    contacts: [
      {
        id: '1',
        name: 'John Smith',
        title: 'CEO',
        email: 'john@acme.com',
        phone: '+1 (555) 123-4567',
        linkedinUrl: 'https://linkedin.com/in/johnsmith'
      }
    ],
    projectIds: ['1', '2'],
    teamMemberIds: ['1', '2'],
    projects: [
      {
        id: '1',
        name: 'Website Redesign',
        status: 'development',
        startDate: '2024-01-01',
        budget: 50000,
        progress: 75
      }
    ],
    tools: [],
    library: [],
    templates: [],
    invoices: [],
    proposals: [],
    analytics: {
      totalRevenue: 125000,
      monthlyRevenue: 15000,
      projectsCompleted: 3,
      averageProjectValue: 41667,
      clientSatisfaction: 4.8,
      responseTime: 2.5
    },
    financials: {
      budget: 150000,
      revenue: 125000,
      cost: 75000
    },
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    companyName: 'TechStart Inc',
    location: '456 Innovation Blvd, San Francisco, CA 94105',
    website: 'https://techstart.com',
    industry: 'Software',
    status: 'active',
    contacts: [
      {
        id: '2',
        name: 'Sarah Johnson',
        title: 'CTO',
        email: 'sarah@techstart.com',
        phone: '+1 (555) 987-6543'
      }
    ],
    projectIds: ['3'],
    teamMemberIds: ['3'],
    projects: [
      {
        id: '2',
        name: 'Mobile App Development',
        status: 'testing',
        startDate: '2023-12-01',
        budget: 85000,
        progress: 90
      }
    ],
    tools: [],
    library: [],
    templates: [],
    invoices: [],
    proposals: [],
    analytics: {
      totalRevenue: 85000,
      monthlyRevenue: 12000,
      projectsCompleted: 2,
      averageProjectValue: 42500,
      clientSatisfaction: 4.6,
      responseTime: 3.0
    },
    financials: {
      budget: 100000,
      revenue: 85000,
      cost: 55000
    },
    createdAt: '2023-08-15',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    companyName: 'Global Solutions',
    location: '789 Enterprise Way, Chicago, IL 60601',
    website: 'https://globalsolutions.com',
    industry: 'Consulting',
    status: 'prospect',
    contacts: [
      {
        id: '3',
        name: 'Michael Brown',
        title: 'Director of Operations',
        email: 'michael@globalsolutions.com',
        phone: '+1 (555) 456-7890'
      }
    ],
    projectIds: [],
    teamMemberIds: [],
    projects: [],
    tools: [],
    library: [],
    templates: [],
    invoices: [],
    proposals: [],
    analytics: {
      totalRevenue: 45000,
      monthlyRevenue: 8000,
      projectsCompleted: 1,
      averageProjectValue: 45000,
      clientSatisfaction: 4.2,
      responseTime: 4.0
    },
    financials: {
      budget: 60000,
      revenue: 45000,
      cost: 30000
    },
    createdAt: '2023-12-01',
    updatedAt: '2024-01-10'
  }
];

const mockInvoices: ClientInvoice[] = [
  {
    id: '1',
    clientId: '1',
    number: 'INV-001',
    amount: 25000,
    status: 'pending',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    clientId: '1',
    number: 'INV-002',
    amount: 15000,
    status: 'paid',
    dueDate: '2024-01-30',
    paidDate: '2024-01-28'
  },
  {
    id: '3',
    clientId: '2',
    number: 'INV-003',
    amount: 35000,
    status: 'overdue',
    dueDate: '2024-02-28',
  }
];

const mockProposals: ClientProposal[] = [
  {
    id: '1',
    clientId: '3',
    title: 'Digital Transformation Initiative',
    value: 150000,
    status: 'sent',
    sentDate: '2024-01-10'
  },
  {
    id: '2',
    clientId: '1',
    title: 'Marketing Automation Setup',
    value: 25000,
    status: 'accepted',
    sentDate: '2024-01-05',
    responseDate: '2024-01-12'
  }
];

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [invoices, setInvoices] = useState<ClientInvoice[]>(mockInvoices);
  const [proposals, setProposals] = useState<ClientProposal[]>(mockProposals);
  const [loading, setLoading] = useState(false);

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newClient: Client = {
        ...clientData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
      return newClient;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setLoading(true);
    try {
      setClients(prev => prev.map(client => 
        client.id === id 
          ? { ...client, ...updates, updatedAt: new Date().toISOString() }
          : client
      ));
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    setLoading(true);
    try {
      setClients(prev => prev.filter(client => client.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<ClientInvoice, 'id'>) => {
    setLoading(true);
    try {
      const newInvoice: ClientInvoice = {
        ...invoiceData,
        id: Date.now().toString()
      };
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: Omit<ClientProposal, 'id'>) => {
    setLoading(true);
    try {
      const newProposal: ClientProposal = {
        ...proposalData,
        id: Date.now().toString()
      };
      setProposals(prev => [...prev, newProposal]);
      return newProposal;
    } finally {
      setLoading(false);
    }
  };

  const getClientInvoices = (clientId: string) => {
    return invoices.filter(invoice => invoice.clientId === clientId);
  };

  const getClientProposals = (clientId: string) => {
    return proposals.filter(proposal => proposal.clientId === clientId);
  };

  const getClientRevenue = (clientId: string) => {
    return invoices
      .filter(invoice => invoice.clientId === clientId && invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    pending: clients.filter(c => c.status === 'prospect').length,
    totalRevenue: clients.reduce((sum, client) => sum + client.analytics.totalRevenue, 0)
  }), [clients]);

  return {
    clients,
    invoices,
    proposals,
    loading,
    stats,
    createClient,
    updateClient,
    deleteClient,
    createInvoice,
    createProposal,
    getClientInvoices,
    getClientProposals,
    getClientRevenue
  };
};