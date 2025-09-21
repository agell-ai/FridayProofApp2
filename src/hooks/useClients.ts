import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Client, ClientTemplate, ClientLibraryItem } from '../types';

// Mock clients data
const mockClients: Client[] = [
  {
    id: 'client-1',
    companyName: 'RetailMax Solutions',
    location: 'San Francisco, CA',
    website: 'https://retailmax.com',
    linkedinUrl: 'https://linkedin.com/company/retailmax',
    industry: 'E-commerce',
    status: 'active',
    contacts: [
      {
        id: 'contact-1',
        name: 'Sarah Johnson',
        title: 'Chief Technology Officer',
        email: 'sarah.johnson@retailmax.com',
        phone: '+1 (555) 123-4567',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson'
      },
      {
        id: 'contact-2',
        name: 'Michael Chen',
        title: 'VP of Operations',
        email: 'michael.chen@retailmax.com',
        phone: '+1 (555) 123-4568',
        linkedinUrl: 'https://linkedin.com/in/michaelchen'
      }
    ],
    projectIds: ['1'],
    teamMemberIds: ['tm-3', 'tm-7', 'tm-9'],
    projects: [
      {
        id: 'proj-1',
        name: 'E-commerce Automation',
        status: 'development',
        startDate: '2024-01-15',
        budget: 75000,
        progress: 65
      },
      {
        id: 'proj-2',
        name: 'Inventory Management System',
        status: 'deployed',
        startDate: '2023-11-01',
        endDate: '2024-01-10',
        budget: 45000,
        progress: 100
      }
    ],
    tools: [
      {
        id: 'tool-1',
        name: 'Order Processing Bot',
        type: 'Automation',
        status: 'active',
        lastUsed: '2024-01-25',
        usage: 95
      },
      {
        id: 'tool-2',
        name: 'Customer Support AI',
        type: 'AI Assistant',
        status: 'active',
        lastUsed: '2024-01-24',
        usage: 87
      }
    ],
    library: [
      {
        id: 'lib-1',
        name: 'Payment Gateway Component',
        type: 'component',
        category: 'E-commerce',
        createdAt: '2024-01-10'
      },
      {
        id: 'lib-2',
        name: 'Email Notification Workflow',
        type: 'workflow',
        category: 'Communication',
        createdAt: '2024-01-05'
      }
    ],
    templates: [
      {
        id: 'temp-1',
        name: 'Order Fulfillment Template',
        category: 'E-commerce',
        usage: 12,
        lastModified: '2024-01-20'
      }
    ],
    invoices: [
      {
        id: 'inv-1',
        number: 'INV-2024-001',
        amount: 25000,
        status: 'paid',
        dueDate: '2024-01-15',
        paidDate: '2024-01-12'
      },
      {
        id: 'inv-2',
        number: 'INV-2024-002',
        amount: 30000,
        status: 'pending',
        dueDate: '2024-02-15'
      }
    ],
    proposals: [
      {
        id: 'prop-1',
        title: 'Advanced Analytics Dashboard',
        value: 85000,
        status: 'sent',
        sentDate: '2024-01-20'
      }
    ],
    analytics: {
      totalRevenue: 120000,
      monthlyRevenue: 25000,
      projectsCompleted: 3,
      averageProjectValue: 55000,
      clientSatisfaction: 4.8,
      responseTime: 2.5
    },
    financials: {
      budget: 150000,
      revenue: 120000,
      cost: 85000
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'client-2',
    companyName: 'TechCorp Industries',
    location: 'Austin, TX',
    website: 'https://techcorp.com',
    linkedinUrl: 'https://linkedin.com/company/techcorp',
    industry: 'Technology',
    status: 'active',
    contacts: [
      {
        id: 'contact-3',
        name: 'Daniel Rodriguez',
        title: 'Head of Customer Success',
        email: 'daniel.rodriguez@techcorp.com',
        phone: '+1 (555) 234-5678',
        linkedinUrl: 'https://linkedin.com/in/danielrodriguez'
      }
    ],
    projectIds: ['2'],
    teamMemberIds: ['tm-4', 'tm-6', 'tm-8', 'tm-10'],
    projects: [
      {
        id: 'proj-3',
        name: 'Customer Support AI',
        status: 'testing',
        startDate: '2024-01-12',
        budget: 60000,
        progress: 80
      }
    ],
    tools: [
      {
        id: 'tool-3',
        name: 'Ticket Routing System',
        type: 'AI Classifier',
        status: 'active',
        lastUsed: '2024-01-25',
        usage: 92
      }
    ],
    library: [
      {
        id: 'lib-3',
        name: 'Sentiment Analysis Component',
        type: 'component',
        category: 'AI',
        createdAt: '2024-01-15'
      }
    ],
    templates: [
      {
        id: 'temp-2',
        name: 'Support Ticket Template',
        category: 'Customer Service',
        usage: 8,
        lastModified: '2024-01-18'
      }
    ],
    invoices: [
      {
        id: 'inv-3',
        number: 'INV-2024-003',
        amount: 20000,
        status: 'paid',
        dueDate: '2024-01-20',
        paidDate: '2024-01-18'
      }
    ],
    proposals: [
      {
        id: 'prop-2',
        title: 'Advanced AI Integration',
        value: 95000,
        status: 'draft'
      }
    ],
    analytics: {
      totalRevenue: 80000,
      monthlyRevenue: 20000,
      projectsCompleted: 2,
      averageProjectValue: 50000,
      clientSatisfaction: 4.6,
      responseTime: 3.2
    },
    financials: {
      budget: 95000,
      revenue: 80000,
      cost: 55000
    },
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'client-3',
    companyName: 'FinanceFlow Corp',
    location: 'New York, NY',
    website: 'https://financeflow.com',
    linkedinUrl: 'https://linkedin.com/company/financeflow',
    industry: 'Financial Services',
    status: 'active',
    contacts: [
      {
        id: 'contact-4',
        name: 'Jennifer Martinez',
        title: 'Chief Financial Officer',
        email: 'jennifer.martinez@financeflow.com',
        phone: '+1 (555) 345-6789',
        linkedinUrl: 'https://linkedin.com/in/jennifermartinez'
      },
      {
        id: 'contact-5',
        name: 'Robert Kim',
        title: 'Director of IT',
        email: 'robert.kim@financeflow.com',
        phone: '+1 (555) 345-6790',
        linkedinUrl: 'https://linkedin.com/in/robertkim'
      }
    ],
    projectIds: ['3'],
    teamMemberIds: ['tm-5', 'tm-6', 'tm-9', 'tm-11'],
    projects: [
      {
        id: 'proj-4',
        name: 'Invoice Processing Automation',
        status: 'deployed',
        startDate: '2024-01-05',
        endDate: '2024-01-25',
        budget: 90000,
        progress: 100
      }
    ],
    tools: [
      {
        id: 'tool-4',
        name: 'Invoice OCR Scanner',
        type: 'Document Processing',
        status: 'active',
        lastUsed: '2024-01-25',
        usage: 98
      },
      {
        id: 'tool-5',
        name: 'Expense Tracker',
        type: 'Financial Tool',
        status: 'active',
        lastUsed: '2024-01-24',
        usage: 85
      }
    ],
    library: [
      {
        id: 'lib-4',
        name: 'Financial Data Validator',
        type: 'component',
        category: 'Finance',
        createdAt: '2024-01-08'
      }
    ],
    templates: [
      {
        id: 'temp-3',
        name: 'Invoice Approval Workflow',
        category: 'Finance',
        usage: 15,
        lastModified: '2024-01-22'
      }
    ],
    invoices: [
      {
        id: 'inv-4',
        number: 'INV-2024-004',
        amount: 45000,
        status: 'paid',
        dueDate: '2024-01-30',
        paidDate: '2024-01-28'
      },
      {
        id: 'inv-5',
        number: 'INV-2024-005',
        amount: 35000,
        status: 'pending',
        dueDate: '2024-02-28'
      }
    ],
    proposals: [
      {
        id: 'prop-3',
        title: 'Advanced Financial Analytics',
        value: 120000,
        status: 'accepted',
        sentDate: '2024-01-10',
        responseDate: '2024-01-15'
      }
    ],
    analytics: {
      totalRevenue: 180000,
      monthlyRevenue: 40000,
      projectsCompleted: 4,
      averageProjectValue: 67500,
      clientSatisfaction: 4.9,
      responseTime: 1.8
    },
    financials: {
      budget: 200000,
      revenue: 180000,
      cost: 120000
    },
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-25T10:15:00Z'
  },
  {
    id: 'client-4',
    companyName: 'MarketingPro Agency',
    location: 'Los Angeles, CA',
    website: 'https://marketingpro.com',
    linkedinUrl: 'https://linkedin.com/company/marketingpro',
    industry: 'Marketing & Advertising',
    status: 'prospect',
    contacts: [
      {
        id: 'contact-6',
        name: 'Amanda Wilson',
        title: 'Creative Director',
        email: 'amanda.wilson@marketingpro.com',
        phone: '+1 (555) 456-7890',
        linkedinUrl: 'https://linkedin.com/in/amandawilson'
      }
    ],
    projectIds: ['4'],
    teamMemberIds: ['tm-3', 'tm-7'],
    projects: [
      {
        id: 'proj-5',
        name: 'Campaign Optimization Platform',
        status: 'planning',
        startDate: '2024-02-01',
        budget: 70000,
        progress: 15
      }
    ],
    tools: [],
    library: [],
    templates: [],
    invoices: [],
    proposals: [
      {
        id: 'prop-4',
        title: 'AI-Driven Marketing Automation',
        value: 70000,
        status: 'sent',
        sentDate: '2024-01-22'
      }
    ],
    analytics: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      projectsCompleted: 0,
      averageProjectValue: 0,
      clientSatisfaction: 0,
      responseTime: 0
    },
    financials: {
      budget: 70000,
      revenue: 0,
      cost: 5000
    },
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z'
  },
  {
    id: 'client-5',
    companyName: 'HealthTech Innovations',
    location: 'Boston, MA',
    website: 'https://healthtech.com',
    linkedinUrl: 'https://linkedin.com/company/healthtech',
    industry: 'Healthcare Technology',
    status: 'active',
    contacts: [
      {
        id: 'contact-7',
        name: 'Dr. Lisa Thompson',
        title: 'Chief Medical Officer',
        email: 'lisa.thompson@healthtech.com',
        phone: '+1 (555) 567-8901',
        linkedinUrl: 'https://linkedin.com/in/lisathompson'
      },
      {
        id: 'contact-8',
        name: 'James Park',
        title: 'VP of Engineering',
        email: 'james.park@healthtech.com',
        phone: '+1 (555) 567-8902',
        linkedinUrl: 'https://linkedin.com/in/jamespark'
      }
    ],
    projectIds: ['5'],
    teamMemberIds: ['tm-5', 'tm-9', 'tm-12'],
    projects: [
      {
        id: 'proj-6',
        name: 'Patient Management System',
        status: 'maintenance',
        startDate: '2023-12-20',
        endDate: '2024-01-15',
        budget: 110000,
        progress: 100
      }
    ],
    tools: [
      {
        id: 'tool-6',
        name: 'Appointment Scheduler',
        type: 'Scheduling System',
        status: 'active',
        lastUsed: '2024-01-25',
        usage: 94
      }
    ],
    library: [
      {
        id: 'lib-5',
        name: 'Patient Data Validator',
        type: 'component',
        category: 'Healthcare',
        createdAt: '2023-12-25'
      }
    ],
    templates: [
      {
        id: 'temp-4',
        name: 'Appointment Reminder Template',
        category: 'Healthcare',
        usage: 25,
        lastModified: '2024-01-10'
      }
    ],
    invoices: [
      {
        id: 'inv-6',
        number: 'INV-2024-006',
        amount: 55000,
        status: 'paid',
        dueDate: '2024-01-20',
        paidDate: '2024-01-18'
      }
    ],
    proposals: [
      {
        id: 'prop-5',
        title: 'Advanced Health Analytics',
        value: 150000,
        status: 'accepted',
        sentDate: '2023-12-15',
        responseDate: '2023-12-20'
      }
    ],
    analytics: {
      totalRevenue: 165000,
      monthlyRevenue: 15000,
      projectsCompleted: 3,
      averageProjectValue: 88000,
      clientSatisfaction: 4.7,
      responseTime: 2.1
    },
    financials: {
      budget: 175000,
      revenue: 165000,
      cost: 110000
    },
    createdAt: '2023-12-20T09:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: 'client-6',
    companyName: 'EcoSmart Solutions',
    location: 'Seattle, WA',
    website: 'https://ecosmart.com',
    linkedinUrl: 'https://linkedin.com/company/ecosmart',
    industry: 'Clean Technology',
    status: 'active',
    contacts: [
      {
        id: 'contact-9',
        name: 'Maria Garcia',
        title: 'Sustainability Director',
        email: 'maria.garcia@ecosmart.com',
        phone: '+1 (555) 678-9012',
        linkedinUrl: 'https://linkedin.com/in/mariagarcia'
      }
    ],
    projectIds: [],
    teamMemberIds: ['tm-4', 'tm-8'],
    projects: [],
    tools: [],
    library: [],
    templates: [],
    invoices: [],
    proposals: [
      {
        id: 'prop-6',
        title: 'Green Technology Automation',
        value: 95000,
        status: 'draft'
      }
    ],
    analytics: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      projectsCompleted: 0,
      averageProjectValue: 0,
      clientSatisfaction: 0,
      responseTime: 0
    },
    financials: {
      budget: 95000,
      revenue: 0,
      cost: 2000
    },
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-20T09:30:00Z'
  }
];

type ClientInput = Pick<Client, 'companyName' | 'location' | 'industry' | 'status'> &
  Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>;

const defaultAnalytics: Client['analytics'] = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  projectsCompleted: 0,
  averageProjectValue: 0,
  clientSatisfaction: 0,
  responseTime: 0,
};

const defaultFinancials: Client['financials'] = {
  budget: 0,
  revenue: 0,
  cost: 0,
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);

    if (user?.accountType === 'business') {
      setClients([]);
      setIsLoading(false);
      return;
    }

    // Simulate API call
    const timeout = setTimeout(() => {
      setClients(mockClients);
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [user?.accountType]);

  const createClient = (clientData: ClientInput): Client | null => {
    if (user?.accountType === 'business') {
      return null;
    }

    const timestamp = new Date().toISOString();
    const newClient: Client = {
      id: Date.now().toString(),
      companyName: clientData.companyName,
      location: clientData.location,
      industry: clientData.industry,
      status: clientData.status,
      website: clientData.website,
      linkedinUrl: clientData.linkedinUrl,
      contacts: clientData.contacts || [],
      projectIds: clientData.projectIds || [],
      teamMemberIds: clientData.teamMemberIds || [],
      projects: clientData.projects || [],
      tools: clientData.tools || [],
      library: clientData.library || [],
      templates: clientData.templates || [],
      invoices: clientData.invoices || [],
      proposals: clientData.proposals || [],
      analytics: clientData.analytics
        ? { ...defaultAnalytics, ...clientData.analytics }
        : { ...defaultAnalytics },
      financials: clientData.financials
        ? { ...defaultFinancials, ...clientData.financials }
        : { ...defaultFinancials },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    if (user?.accountType === 'business') {
      return;
    }

    setClients(prev => prev.map(client => {
      if (client.id !== id) {
        return client;
      }

      const nextClient: Client = {
        ...client,
        ...updates,
        contacts: updates.contacts ?? client.contacts,
        projectIds: updates.projectIds ?? client.projectIds,
        teamMemberIds: updates.teamMemberIds ?? client.teamMemberIds,
        projects: updates.projects ?? client.projects,
        tools: updates.tools ?? client.tools,
        library: updates.library ?? client.library,
        templates: updates.templates ?? client.templates,
        invoices: updates.invoices ?? client.invoices,
        proposals: updates.proposals ?? client.proposals,
        analytics: updates.analytics
          ? { ...client.analytics, ...updates.analytics }
          : client.analytics,
        financials: updates.financials
          ? { ...client.financials, ...updates.financials }
          : client.financials,
        updatedAt: new Date().toISOString(),
      };

      return nextClient;
    }));
  };

  const updateTemplate = (clientId: string, templateId: string, updates: Partial<ClientTemplate>) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) {
        return client;
      }

      return {
        ...client,
        templates: client.templates.map(template =>
          template.id === templateId ? { ...template, ...updates } : template
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const updateLibraryItem = (clientId: string, itemId: string, updates: Partial<ClientLibraryItem>) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) {
        return client;
      }

      return {
        ...client,
        library: client.library.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const deleteClient = (id: string) => {
    if (user?.accountType === 'business') {
      return;
    }

    setClients(prev => prev.filter(client => client.id !== id));
  };

  return {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
    updateTemplate,
    updateLibraryItem,
  };
};