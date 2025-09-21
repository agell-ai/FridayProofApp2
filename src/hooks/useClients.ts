import { useState, useMemo } from 'react';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  projects: number;
  revenue: number;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  description: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  description: string;
  createdAt: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    status: 'active',
    projects: 3,
    revenue: 125000,
    lastContact: '2024-01-15',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1 (555) 987-6543',
    company: 'TechStart Inc',
    status: 'active',
    projects: 2,
    revenue: 85000,
    lastContact: '2024-01-12',
    createdAt: '2023-08-15',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    name: 'Global Solutions',
    email: 'info@globalsolutions.com',
    phone: '+1 (555) 456-7890',
    company: 'Global Solutions',
    status: 'pending',
    projects: 1,
    revenue: 45000,
    lastContact: '2024-01-10',
    createdAt: '2023-12-01',
    updatedAt: '2024-01-10'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    amount: 25000,
    dueDate: '2024-02-15',
    status: 'sent',
    description: 'Website Development - Phase 1',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    clientId: '1',
    amount: 15000,
    dueDate: '2024-01-30',
    status: 'paid',
    description: 'Mobile App Consultation',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    clientId: '2',
    amount: 35000,
    dueDate: '2024-02-28',
    status: 'draft',
    description: 'E-commerce Platform Development',
    createdAt: '2024-01-12'
  }
];

const mockProposals: Proposal[] = [
  {
    id: '1',
    clientId: '3',
    title: 'Digital Transformation Initiative',
    value: 150000,
    status: 'sent',
    description: 'Complete digital transformation including new website, mobile app, and automation systems.',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    clientId: '1',
    title: 'Marketing Automation Setup',
    value: 25000,
    status: 'accepted',
    description: 'Implementation of marketing automation tools and workflows.',
    createdAt: '2024-01-05'
  }
];

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
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

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newProposal: Proposal = {
        ...proposalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
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
    pending: clients.filter(c => c.status === 'pending').length,
    totalRevenue: clients.reduce((sum, client) => sum + client.revenue, 0)
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