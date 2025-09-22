import { useState, useEffect } from 'react';
import { TeamMember, TeamMemberAnalytics } from '../types';
import { useAuth } from './useAuth';

// Mock team data (same as in Team.tsx but centralized)
const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-3',
    name: 'Lisa Park',
    email: 'employee@demo.com',
    role: 'employee',
    skills: ['Machine Learning', 'Python', 'Data Analysis', 'API Development'],
    projectIds: ['proj-1', 'proj-5', 'proj-10'],
    status: 'inactive',
    phone: '+1 (555) 123-4567',
    linkedinUrl: 'https://linkedin.com/in/lisapark',
    city: 'San Francisco',
    state: 'CA',
    companyName: 'Apex Digital Agency',
    analytics: {
      projectsCompleted: 8,
      hoursWorked: 1240,
      clientSatisfactionScore: 4.8,
      toolsCreated: 12,
      templatesCreated: 6,
      libraryContributions: 15,
      marketplaceItems: 3,
      monthlyProductivity: 92
    },
    clientIds: ['client-1', 'client-4'],
    teamMemberIds: ['tm-7', 'tm-9'],
    toolIds: ['tool-1', 'tool-2', 'tool-3'],
    libraryItemIds: ['lib-1', 'lib-2', 'lib-3'],
    templateIds: ['temp-1', 'temp-2'],
    marketplaceItemIds: ['mp-1', 'mp-2'],
    createdAt: '2023-04-12T14:32:00.000Z',
    updatedAt: '2024-07-08T16:45:00.000Z',
    lastActiveAt: '2024-07-11T09:15:00.000Z',
    lastAssignedAt: '2024-07-05T13:00:00.000Z'
  },
  {
    id: 'tm-4',
    name: 'Alex Rivera',
    email: 'contractor@demo.com',
    role: 'contractor',
    skills: ['UI/UX Design', 'Frontend Development', 'System Integration', 'Marketing Automation'],
    projectIds: ['proj-3', 'proj-6', 'proj-7'],
    status: 'active',
    phone: '+1 (555) 234-5678',
    linkedinUrl: 'https://linkedin.com/in/alexrivera',
    city: 'Austin',
    state: 'TX',
    companyName: 'Strategic AI Consultants',
    analytics: {
      projectsCompleted: 12,
      hoursWorked: 980,
      clientSatisfactionScore: 4.6,
      toolsCreated: 8,
      templatesCreated: 10,
      libraryContributions: 22,
      marketplaceItems: 5,
      monthlyProductivity: 88
    },
    clientIds: ['client-2', 'client-6'],
    teamMemberIds: ['tm-6', 'tm-8'],
    toolIds: ['tool-2', 'tool-4', 'tool-5'],
    libraryItemIds: ['lib-2', 'lib-4', 'lib-5'],
    templateIds: ['temp-2', 'temp-3', 'temp-4'],
    marketplaceItemIds: ['mp-2', 'mp-3', 'mp-4'],
    createdAt: '2022-11-03T18:20:00.000Z',
    updatedAt: '2024-06-18T20:10:00.000Z',
    lastActiveAt: '2024-06-20T17:05:00.000Z',
    lastAssignedAt: '2024-06-19T15:30:00.000Z'
  },
  {
    id: 'tm-5',
    name: 'Rachel Thompson',
    email: 'rachel.thompson@demo.com',
    role: 'employee',
    skills: ['Machine Learning', 'Natural Language Processing', 'Python', 'Healthcare Systems'],
    projectIds: ['6', '7'], // Business account projects
    status: 'active',
    phone: '+1 (555) 345-6789',
    linkedinUrl: 'https://linkedin.com/in/rachelthompson',
    city: 'Seattle',
    state: 'WA',
    companyName: 'InnovateTech Solutions',
    analytics: {
      projectsCompleted: 6,
      hoursWorked: 890,
      clientSatisfactionScore: 4.9,
      toolsCreated: 5,
      templatesCreated: 4,
      libraryContributions: 18,
      marketplaceItems: 2,
      monthlyProductivity: 95
    },
    clientIds: [], // No clients for business account
    teamMemberIds: ['tm-12'],
    toolIds: ['tool-business-1', 'tool-business-2'],
    libraryItemIds: ['lib-business-1', 'lib-business-2'],
    templateIds: ['temp-business-1'],
    marketplaceItemIds: ['mp-business-1'],
    createdAt: '2024-06-15T12:00:00.000Z',
    updatedAt: '2024-07-10T11:20:00.000Z',
    lastActiveAt: '2024-07-09T10:45:00.000Z',
    lastAssignedAt: '2024-06-30T08:30:00.000Z'
  },
  {
    id: 'tm-6',
    name: 'Carlos Martinez',
    email: 'carlos.martinez@demo.com',
    role: 'contractor',
    skills: ['Data Engineering', 'Cloud Architecture', 'ETL Pipelines', 'Financial Systems'],
    projectIds: ['proj-3', 'proj-4', 'proj-9'],
    status: 'active',
    phone: '+1 (555) 456-7890',
    linkedinUrl: 'https://linkedin.com/in/carlosmartinez',
    city: 'Denver',
    state: 'CO',
    companyName: 'Strategic AI Consultants',
    analytics: {
      projectsCompleted: 10,
      hoursWorked: 1150,
      clientSatisfactionScore: 4.7,
      toolsCreated: 15,
      templatesCreated: 8,
      libraryContributions: 25,
      marketplaceItems: 7,
      monthlyProductivity: 90
    },
    clientIds: ['client-2', 'client-3'],
    teamMemberIds: ['tm-4', 'tm-5'],
    toolIds: ['tool-4', 'tool-5', 'tool-6'],
    libraryItemIds: ['lib-4', 'lib-5', 'lib-6'],
    templateIds: ['temp-4', 'temp-5'],
    marketplaceItemIds: ['mp-3', 'mp-5', 'mp-6'],
    createdAt: '2023-08-21T09:30:00.000Z',
    updatedAt: '2024-07-07T18:55:00.000Z',
    lastActiveAt: '2024-07-08T14:40:00.000Z',
    lastAssignedAt: '2024-07-06T19:15:00.000Z'
  },
  {
    id: 'tm-7',
    name: 'Michael Torres',
    email: 'michael.torres@demo.com',
    role: 'employee',
    skills: ['Backend Development', 'Database Design', 'Cloud Architecture', 'E-commerce Systems'],
    projectIds: ['proj-1', 'proj-5', 'proj-10'],
    status: 'active',
    phone: '+1 (555) 567-8901',
    linkedinUrl: 'https://linkedin.com/in/michaeltorres',
    city: 'Miami',
    state: 'FL',
    companyName: 'Apex Digital Agency',
    analytics: {
      projectsCompleted: 9,
      hoursWorked: 1080,
      clientSatisfactionScore: 4.5,
      toolsCreated: 11,
      templatesCreated: 7,
      libraryContributions: 20,
      marketplaceItems: 4,
      monthlyProductivity: 87
    },
    clientIds: ['client-1', 'client-4'],
    teamMemberIds: ['tm-3', 'tm-8'],
    toolIds: ['tool-1', 'tool-7', 'tool-8'],
    libraryItemIds: ['lib-1', 'lib-7'],
    templateIds: ['temp-1', 'temp-6'],
    marketplaceItemIds: ['mp-1', 'mp-7'],
    createdAt: '2021-02-19T15:10:00.000Z',
    updatedAt: '2024-06-29T16:05:00.000Z',
    lastActiveAt: '2024-06-27T13:25:00.000Z',
    lastAssignedAt: '2024-06-15T09:00:00.000Z'
  },
  {
    id: 'tm-8',
    name: 'Emily Watson',
    email: 'emily.watson@demo.com',
    role: 'employee',
    skills: ['Quality Assurance', 'Test Automation', 'Performance Testing', 'System Integration'],
    projectIds: ['proj-3', 'proj-7', 'proj-11'],
    status: 'active',
    phone: '+1 (555) 678-9012',
    linkedinUrl: 'https://linkedin.com/in/emilywatson',
    city: 'Portland',
    state: 'OR',
    companyName: 'Apex Digital Agency',
    analytics: {
      projectsCompleted: 7,
      hoursWorked: 920,
      clientSatisfactionScore: 4.8,
      toolsCreated: 6,
      templatesCreated: 5,
      libraryContributions: 12,
      marketplaceItems: 2,
      monthlyProductivity: 91
    },
    clientIds: ['client-2', 'client-6'],
    teamMemberIds: ['tm-4', 'tm-7'],
    toolIds: ['tool-2', 'tool-3'],
    libraryItemIds: ['lib-2', 'lib-3'],
    templateIds: ['temp-2', 'temp-3'],
    marketplaceItemIds: ['mp-2'],
    createdAt: '2022-06-07T13:45:00.000Z',
    updatedAt: '2024-07-11T07:50:00.000Z',
    lastActiveAt: '2024-07-10T16:20:00.000Z',
    lastAssignedAt: '2024-07-09T18:05:00.000Z'
  },
  {
    id: 'tm-9',
    name: 'James Kim',
    email: 'james.kim@demo.com',
    role: 'contractor',
    skills: ['DevOps', 'Security', 'Infrastructure Management', 'Multi-platform Integration'],
    projectIds: ['proj-1', 'proj-4', 'proj-6'],
    status: 'active',
    phone: '+1 (555) 789-0123',
    linkedinUrl: 'https://linkedin.com/in/jameskim',
    city: 'Chicago',
    state: 'IL',
    companyName: 'Apex Digital Agency',
    analytics: {
      projectsCompleted: 14,
      hoursWorked: 1320,
      clientSatisfactionScore: 4.9,
      toolsCreated: 18,
      templatesCreated: 12,
      libraryContributions: 30,
      marketplaceItems: 8,
      monthlyProductivity: 96
    },
    clientIds: ['client-1', 'client-3', 'client-5'],
    teamMemberIds: ['tm-3', 'tm-5'],
    toolIds: ['tool-1', 'tool-6', 'tool-9'],
    libraryItemIds: ['lib-1', 'lib-6', 'lib-8'],
    templateIds: ['temp-1', 'temp-7', 'temp-8'],
    marketplaceItemIds: ['mp-1', 'mp-8', 'mp-9'],
    createdAt: '2021-12-01T10:00:00.000Z',
    updatedAt: '2024-05-30T21:10:00.000Z',
    lastActiveAt: '2024-05-24T12:35:00.000Z',
    lastAssignedAt: '2024-05-20T14:45:00.000Z'
  },
  {
    id: 'tm-10',
    name: 'Nina Patel',
    email: 'nina.patel@demo.com',
    role: 'employee',
    skills: ['AI Research', 'Computer Vision', 'Deep Learning', 'Advanced Analytics'],
    projectIds: ['proj-3', 'proj-12', 'proj-13'],
    status: 'active',
    phone: '+1 (555) 890-1234',
    linkedinUrl: 'https://linkedin.com/in/ninapatel',
    city: 'Boston',
    state: 'MA',
    companyName: 'Strategic AI Consultants',
    analytics: {
      projectsCompleted: 5,
      hoursWorked: 780,
      clientSatisfactionScore: 4.7,
      toolsCreated: 9,
      templatesCreated: 3,
      libraryContributions: 16,
      marketplaceItems: 3,
      monthlyProductivity: 89
    },
    clientIds: ['client-2', 'client-3'],
    teamMemberIds: ['tm-6', 'tm-11'],
    toolIds: ['tool-10', 'tool-11'],
    libraryItemIds: ['lib-9', 'lib-10'],
    templateIds: ['temp-9'],
    marketplaceItemIds: ['mp-10', 'mp-11'],
    createdAt: '2023-09-03T08:20:00.000Z',
    updatedAt: '2024-07-06T15:55:00.000Z',
    lastActiveAt: '2024-07-05T17:40:00.000Z',
    lastAssignedAt: '2024-07-05T11:30:00.000Z'
  },
  {
    id: 'tm-11',
    name: 'Jordan Lee',
    email: 'jordan.lee@demo.com',
    role: 'contractor',
    skills: ['Automation Engineering', 'Process Optimization', 'Integration', 'Workflow Design'],
    projectIds: ['proj-4', 'proj-14', 'proj-15'],
    status: 'active',
    phone: '+1 (555) 901-2345',
    linkedinUrl: 'https://linkedin.com/in/jordanlee',
    city: 'Phoenix',
    state: 'AZ',
    companyName: 'Strategic AI Consultants',
    analytics: {
      projectsCompleted: 11,
      hoursWorked: 1050,
      clientSatisfactionScore: 4.6,
      toolsCreated: 13,
      templatesCreated: 9,
      libraryContributions: 21,
      marketplaceItems: 6,
      monthlyProductivity: 93
    },
    clientIds: ['client-3', 'client-5'],
    teamMemberIds: ['tm-10', 'tm-12'],
    toolIds: ['tool-12', 'tool-13'],
    libraryItemIds: ['lib-11', 'lib-12'],
    templateIds: ['temp-10', 'temp-11'],
    marketplaceItemIds: ['mp-12', 'mp-13'],
    createdAt: '2022-01-15T11:15:00.000Z',
    updatedAt: '2024-06-02T10:30:00.000Z',
    lastActiveAt: '2024-05-28T09:05:00.000Z',
    lastAssignedAt: '2024-05-12T13:20:00.000Z'
  },
  {
    id: 'tm-12',
    name: 'Priya Singh',
    email: 'priya.singh@demo.com',
    role: 'employee',
    skills: ['Business Analysis', 'Requirements Gathering', 'Documentation', 'Process Design'],
    projectIds: ['6', '7'], // Business account projects
    status: 'active',
    phone: '+1 (555) 012-3456',
    linkedinUrl: 'https://linkedin.com/in/priyasingh',
    city: 'Atlanta',
    state: 'GA',
    companyName: 'InnovateTech Solutions',
    analytics: {
      projectsCompleted: 6,
      hoursWorked: 840,
      clientSatisfactionScore: 4.8,
      toolsCreated: 4,
      templatesCreated: 8,
      libraryContributions: 14,
      marketplaceItems: 2,
      monthlyProductivity: 85
    },
    clientIds: [], // No clients for business account
    teamMemberIds: ['tm-5'],
    toolIds: ['tool-business-3'],
    libraryItemIds: ['lib-business-3'],
    templateIds: ['temp-business-2'],
    marketplaceItemIds: ['mp-business-2'],
    createdAt: '2024-07-02T14:05:00.000Z',
    updatedAt: '2024-07-09T16:45:00.000Z',
    lastActiveAt: '2024-07-08T12:25:00.000Z',
    lastAssignedAt: '2024-07-02T15:10:00.000Z'
  }
];

type TeamMemberInput = Pick<TeamMember, 'name' | 'email' | 'role' | 'status'> & {
  phone?: string;
  city?: string;
  state?: string;
  linkedinUrl?: string;
  managerId?: string;
  skills?: string[];
  projectIds?: string[];
  clientIds?: string[];
  teamMemberIds?: string[];
  toolIds?: string[];
  libraryItemIds?: string[];
  templateIds?: string[];
  marketplaceItemIds?: string[];
  analytics?: Partial<TeamMemberAnalytics>;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
  lastAssignedAt?: string;
};

const defaultTeamAnalytics: TeamMemberAnalytics = {
  projectsCompleted: 0,
  hoursWorked: 0,
  clientSatisfactionScore: 0,
  toolsCreated: 0,
  templatesCreated: 0,
  libraryContributions: 0,
  marketplaceItems: 0,
  monthlyProductivity: 0,
};

export const useTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, account } = useAuth();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Filter team members based on user's account and projects
      let filteredMembers = mockTeamMembers;
      
      if (user?.accountType === 'business') {
        // For business accounts, show team members who work on business projects
        filteredMembers = mockTeamMembers.filter(member =>
          member.companyName === account?.name ||
          member.projectIds.some(projectId => ['6', '7'].includes(projectId)) // Business project IDs
        );
      }

      setTeamMembers(filteredMembers);
      setIsLoading(false);
    }, 500);
  }, [user, account]);

  const getTeamMembersByIds = (ids: string[]): TeamMember[] => {
    return teamMembers.filter(member => ids.includes(member.id));
  };

  const getTeamMemberById = (id: string): TeamMember | undefined => {
    return teamMembers.find(member => member.id === id);
  };

  const createTeamMember = (memberData: TeamMemberInput) => {
    const now = new Date().toISOString();
    const createdAt = memberData.createdAt ?? now;
    const lastActiveAt = memberData.lastActiveAt ?? now;
    const updatedAt = memberData.updatedAt ?? now;
    const lastAssignedAt =
      memberData.lastAssignedAt ?? (memberData.projectIds && memberData.projectIds.length > 0 ? now : undefined);

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: memberData.name,
      email: memberData.email,
      role: memberData.role,
      status: memberData.status,
      phone: memberData.phone,
      linkedinUrl: memberData.linkedinUrl,
      city: memberData.city,
      state: memberData.state,
      companyName: account?.name || 'Internal Team',
      skills: memberData.skills || [],
      projectIds: memberData.projectIds || [],
      managerId: memberData.managerId,
      analytics: memberData.analytics
        ? { ...defaultTeamAnalytics, ...memberData.analytics }
        : { ...defaultTeamAnalytics },
      clientIds: memberData.clientIds || [],
      teamMemberIds: memberData.teamMemberIds || [],
      toolIds: memberData.toolIds || [],
      libraryItemIds: memberData.libraryItemIds || [],
      templateIds: memberData.templateIds || [],
      marketplaceItemIds: memberData.marketplaceItemIds || [],
      createdAt,
      updatedAt,
      lastActiveAt,
      lastAssignedAt,
    };
    setTeamMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMemberInput>) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id !== id) {
        return member;
      }

      const nextUpdatedAt = updates.updatedAt ?? new Date().toISOString();
      const nextLastActiveAt = updates.lastActiveAt ?? member.lastActiveAt;
      const nextLastAssignedAt = updates.lastAssignedAt ?? member.lastAssignedAt;

      return {
        ...member,
        ...updates,
        phone: updates.phone ?? member.phone,
        city: updates.city ?? member.city,
        state: updates.state ?? member.state,
        skills: updates.skills ?? member.skills,
        projectIds: updates.projectIds ?? member.projectIds,
        clientIds: updates.clientIds ?? member.clientIds,
        teamMemberIds: updates.teamMemberIds ?? member.teamMemberIds,
        toolIds: updates.toolIds ?? member.toolIds,
        libraryItemIds: updates.libraryItemIds ?? member.libraryItemIds,
        templateIds: updates.templateIds ?? member.templateIds,
        marketplaceItemIds: updates.marketplaceItemIds ?? member.marketplaceItemIds,
        analytics: updates.analytics
          ? { ...member.analytics, ...updates.analytics }
          : member.analytics,
        updatedAt: nextUpdatedAt,
        lastActiveAt: nextLastActiveAt,
        lastAssignedAt: nextLastAssignedAt,
      };
    }));
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  return {
    teamMembers,
    isLoading,
    getTeamMembersByIds,
    getTeamMemberById,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
};