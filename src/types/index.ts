import type { ViewId } from './navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'employee' | 'contractor' | 'client';
  accountType: 'agency' | 'consultant' | 'business';
  accountId: string;
  managerId?: string; // For employees/contractors assigned to managers
  enabledPages?: ViewId[]; // For managers - pages enabled by owner
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'agency' | 'consultant' | 'business';
  ownerId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance';
  clientId: string;
  accountId: string;
  assignedUsers: string[]; // User IDs assigned to this project
  managerId?: string; // Manager ID - required for agency client projects
  systems: System[];
  createdAt: string;
  updatedAt: string;
}

export interface System {
  id: string;
  name: string;
  description: string;
  type: 'automation' | 'workflow' | 'integration' | 'ai-model';
  status: 'design' | 'development' | 'testing' | 'active' | 'inactive';
  components: Component[];
  connections: Connection[];
  businessImpact: string;
  projectId: string;
  createdAt: string;
}

export interface Component {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'ai-processor' | 'data-source' | 'output';
  description: string;
  status: 'configured' | 'pending' | 'error' | 'active';
  position: { x: number; y: number };
  systemId: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'data' | 'trigger' | 'conditional';
  systemId: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee' | 'contractor';
  type: 'internal' | 'external' | 'inactive';
  avatar?: string;
  skills: string[];
  projectIds: string[];
  managerId?: string;
  status: 'active' | 'inactive';
  phone?: string;
  linkedinUrl?: string;
  city?: string;
  state?: string;
  companyName: string; // Company name from the Account they were created by
  analytics: TeamMemberAnalytics;
  clientIds: string[];
  teamMemberIds: string[];
  toolIds: string[];
  libraryItemIds: string[];
  templateIds: string[];
  marketplaceItemIds: string[];
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastAssignedAt?: string;
}

export interface TeamMemberAnalytics {
  projectsCompleted: number;
  hoursWorked: number;
  clientSatisfactionScore: number;
  toolsCreated: number;
  templatesCreated: number;
  libraryContributions: number;
  marketplaceItems: number;
  monthlyProductivity: number;
}

export interface ClientContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
}

export interface Client {
  id: string;
  companyName: string;
  location: string;
  website?: string;
  linkedinUrl?: string;
  industry: string;
  status: 'active' | 'inactive' | 'prospect';
  contacts: ClientContact[];
  projectIds: string[];
  teamMemberIds: string[];
  projects: ClientProject[];
  tools: ClientTool[];
  library: ClientLibraryItem[];
  templates: ClientTemplate[];
  invoices: ClientInvoice[];
  proposals: ClientProposal[];
  analytics: ClientAnalytics;
  financials: ClientFinancials;
  createdAt: string;
  updatedAt: string;
}


export interface ClientProject {
  id: string;
  name: string;
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance';
  startDate: string;
  endDate?: string;
  budget: number;
  progress: number;
}

export interface ClientTool {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'development';
  lastUsed: string;
  usage: number;
}

export interface ClientLibraryItem {
  id: string;
  name: string;
  type: 'component' | 'template' | 'workflow';
  category: string;
  createdAt: string;
  templateId?: string;
}

export interface ClientTemplate {
  id: string;
  name: string;
  category: string;
  usage: number;
  lastModified: string;
  isTemplate: boolean;
}

export interface ClientInvoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

export interface ClientProposal {
  id: string;
  title: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sentDate?: string;
  responseDate?: string;
}

export interface ClientAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  projectsCompleted: number;
  averageProjectValue: number;
  clientSatisfaction: number;
  responseTime: number;
}

export interface ClientFinancials {
  budget: number;
  revenue: number;
  cost: number;
}