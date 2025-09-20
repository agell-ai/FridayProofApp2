import { useState, useEffect } from 'react';
import { Project, System, Component } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'RetailMax E-commerce Automation',
    description: 'Complete automation system for order processing, inventory management, customer communications, and fraud detection',
    status: 'development',
    clientId: 'client-1',
    accountId: 'acc-1', // Agency account
    assignedUsers: ['tm-3', 'tm-7', 'tm-9'], // Lisa Park, Michael Torres, James Kim
    managerId: 'user-4', // Marcus Thompson (Manager)
    systems: [
      {
        id: 'sys-1',
        name: 'Order Processing Workflow',
        description: 'Automated order validation, payment processing, and fulfillment initiation',
        type: 'workflow',
        status: 'active',
        businessImpact: 'Reduces order processing time by 80% and eliminates manual errors',
        projectId: '1',
        components: [
          {
            id: 'comp-1',
            name: 'Order Trigger',
            type: 'trigger',
            description: 'Detects new orders from multiple channels',
            status: 'active',
            position: { x: 100, y: 100 },
            systemId: 'sys-1'
          },
          {
            id: 'comp-2',
            name: 'Payment Validator',
            type: 'condition',
            description: 'Validates payment information and fraud detection',
            status: 'active',
            position: { x: 300, y: 100 },
            systemId: 'sys-1'
          },
          {
            id: 'comp-3',
            name: 'Inventory Check',
            type: 'ai-processor',
            description: 'AI-powered inventory availability and allocation',
            status: 'active',
            position: { x: 500, y: 100 },
            systemId: 'sys-1'
          }
        ],
        connections: [
          {
            id: 'conn-1',
            sourceId: 'comp-1',
            targetId: 'comp-2',
            type: 'data',
            systemId: 'sys-1'
          },
          {
            id: 'conn-2',
            sourceId: 'comp-2',
            targetId: 'comp-3',
            type: 'conditional',
            systemId: 'sys-1'
          }
        ],
        createdAt: '2024-01-15T10:00:00Z'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'TechCorp Customer Support AI',
    description: 'Intelligent customer support system with automated ticket routing, response generation, and sentiment analysis',
    status: 'testing',
    clientId: 'client-2',
    accountId: 'acc-1', // Agency account
    assignedUsers: ['tm-4', 'tm-6', 'tm-8', 'tm-10'], // Alex Rivera, Carlos Martinez, Emily Watson, Nina Patel
    managerId: 'user-4', // Marcus Thompson (Manager)
    systems: [
      {
        id: 'sys-2',
        name: 'Support Ticket Router',
        description: 'AI-powered ticket classification and routing system',
        type: 'ai-model',
        status: 'testing',
        businessImpact: 'Reduces response time by 60% and improves customer satisfaction',
        projectId: '2',
        components: [
          {
            id: 'comp-4',
            name: 'Ticket Intake',
            type: 'trigger',
            description: 'Captures support tickets from multiple channels',
            status: 'active',
            position: { x: 100, y: 100 },
            systemId: 'sys-2'
          },
          {
            id: 'comp-5',
            name: 'Sentiment Analyzer',
            type: 'ai-processor',
            description: 'Analyzes customer sentiment and urgency',
            status: 'active',
            position: { x: 300, y: 100 },
            systemId: 'sys-2'
          },
          {
            id: 'comp-6',
            name: 'Auto Responder',
            type: 'action',
            description: 'Generates contextual responses using AI',
            status: 'testing',
            position: { x: 500, y: 100 },
            systemId: 'sys-2'
          }
        ],
        connections: [
          {
            id: 'conn-3',
            sourceId: 'comp-4',
            targetId: 'comp-5',
            type: 'data',
            systemId: 'sys-2'
          },
          {
            id: 'conn-4',
            sourceId: 'comp-5',
            targetId: 'comp-6',
            type: 'conditional',
            systemId: 'sys-2'
          }
        ],
        createdAt: '2024-01-12T08:00:00Z'
      }
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    name: 'FinanceFlow Automation Platform',
    description: 'Comprehensive financial automation including invoice processing, expense tracking, and budget forecasting',
    status: 'deployed',
    clientId: 'client-3',
    accountId: 'acc-2', // Consultant account
    assignedUsers: ['tm-5', 'tm-6', 'tm-9', 'tm-11'], // Rachel Thompson, Carlos Martinez, James Kim, Jordan Lee
    systems: [
      {
        id: 'sys-3',
        name: 'Invoice Processing Engine',
        description: 'Automated invoice extraction, validation, and approval workflow',
        type: 'automation',
        status: 'active',
        businessImpact: 'Processes 95% of invoices automatically, saving 40 hours per week',
        projectId: '3',
        components: [
          {
            id: 'comp-7',
            name: 'Document Scanner',
            type: 'trigger',
            description: 'OCR-powered document ingestion',
            status: 'active',
            position: { x: 100, y: 100 },
            systemId: 'sys-3'
          },
          {
            id: 'comp-8',
            name: 'Data Extractor',
            type: 'ai-processor',
            description: 'AI-powered data extraction from invoices',
            status: 'active',
            position: { x: 300, y: 100 },
            systemId: 'sys-3'
          },
          {
            id: 'comp-9',
            name: 'Approval Router',
            type: 'condition',
            description: 'Routes invoices based on amount and vendor',
            status: 'active',
            position: { x: 500, y: 100 },
            systemId: 'sys-3'
          }
        ],
        connections: [
          {
            id: 'conn-5',
            sourceId: 'comp-7',
            targetId: 'comp-8',
            type: 'data',
            systemId: 'sys-3'
          },
          {
            id: 'conn-6',
            sourceId: 'comp-8',
            targetId: 'comp-9',
            type: 'data',
            systemId: 'sys-3'
          }
        ],
        createdAt: '2024-01-05T12:00:00Z'
      }
    ],
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-25T10:15:00Z'
  },
  {
    id: '4',
    name: 'MarketingPro Campaign Optimizer',
    description: 'AI-driven marketing campaign optimization with real-time bidding and audience targeting',
    status: 'planning',
    clientId: 'client-4',
    accountId: 'acc-1', // Agency account
    assignedUsers: ['tm-3', 'tm-7'], // Lisa Park, Michael Torres
    managerId: 'user-4', // Marcus Thompson (Manager)
    systems: [],
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z'
  },
  {
    id: '5',
    name: 'HealthTech Patient Management',
    description: 'Automated patient scheduling, reminder system, and health data analysis platform',
    status: 'maintenance',
    clientId: 'client-5',
    accountId: 'acc-3',
    assignedUsers: ['tm-5', 'tm-9', 'tm-12'], // Rachel Thompson, James Kim, Priya Singh
    systems: [
      {
        id: 'sys-4',
        name: 'Appointment Scheduler',
        description: 'Intelligent appointment scheduling with conflict resolution',
        type: 'automation',
        status: 'active',
        businessImpact: 'Reduces scheduling conflicts by 90% and improves patient satisfaction',
        projectId: '5',
        components: [
          {
            id: 'comp-10',
            name: 'Booking Interface',
            type: 'trigger',
            description: 'Patient booking requests from web and mobile',
            status: 'active',
            position: { x: 100, y: 100 },
            systemId: 'sys-4'
          },
          {
            id: 'comp-11',
            name: 'Availability Engine',
            type: 'ai-processor',
            description: 'AI-powered availability optimization',
            status: 'active',
            position: { x: 300, y: 100 },
            systemId: 'sys-4'
          },
          {
            id: 'comp-12',
            name: 'Confirmation System',
            type: 'action',
            description: 'Automated confirmation and reminder system',
            status: 'active',
            position: { x: 500, y: 100 },
            systemId: 'sys-4'
          }
        ],
        connections: [
          {
            id: 'conn-7',
            sourceId: 'comp-10',
            targetId: 'comp-11',
            type: 'data',
            systemId: 'sys-4'
          },
          {
            id: 'conn-8',
            sourceId: 'comp-11',
            targetId: 'comp-12',
            type: 'trigger',
            systemId: 'sys-4'
          }
        ],
        createdAt: '2023-12-20T09:00:00Z'
      }
    ],
    createdAt: '2023-12-20T09:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  // Business account projects (no clientId, accountId is the business account)
  {
    id: '6',
    name: 'Internal Process Automation',
    description: 'Streamline internal business processes including HR workflows, document management, and reporting',
    status: 'development',
    clientId: '', // No client for business account
    accountId: 'acc-3', // Business account
    assignedUsers: ['tm-5', 'tm-12'], // Rachel Thompson, Priya Singh
    systems: [
      {
        id: 'sys-5',
        name: 'HR Workflow System',
        description: 'Automated employee onboarding and document processing',
        type: 'workflow',
        status: 'development',
        businessImpact: 'Reduces HR processing time by 70% and improves employee experience',
        projectId: '6',
        components: [
          {
            id: 'comp-13',
            name: 'Employee Data Intake',
            type: 'trigger',
            description: 'Captures new employee information',
            status: 'active',
            position: { x: 100, y: 100 },
            systemId: 'sys-5'
          },
          {
            id: 'comp-14',
            name: 'Document Generator',
            type: 'action',
            description: 'Generates employment documents automatically',
            status: 'development',
            position: { x: 300, y: 100 },
            systemId: 'sys-5'
          }
        ],
        connections: [
          {
            id: 'conn-9',
            sourceId: 'comp-13',
            targetId: 'comp-14',
            type: 'data',
            systemId: 'sys-5'
          }
        ],
        createdAt: '2024-01-20T10:00:00Z'
      }
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z'
  },
  {
    id: '7',
    name: 'Business Intelligence Dashboard',
    description: 'Comprehensive analytics and reporting system for business metrics and KPIs',
    status: 'planning',
    clientId: '', // No client for business account
    accountId: 'acc-3', // Business account
    assignedUsers: ['tm-12'], // Priya Singh
    systems: [],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Filter projects based on user's account
      let filteredProjects = mockProjects;
      
      if (user?.accountType === 'business') {
        // For business accounts, show only projects assigned to their account (no clientId)
        filteredProjects = mockProjects.filter(project => 
          project.accountId === user.accountId && !project.clientId
        );
      } else {
        // For agency/consultant accounts, show all projects
        filteredProjects = mockProjects;
      }
      
      setProjects(filteredProjects);
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'systems'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      systems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
};