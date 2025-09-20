import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tool } from '../types/tools';
import { Client, Project } from '../types';
import { useClients } from './useClients';
import { useProjects } from './useProjects';
import { useAuth } from './useAuth';

type ToolFormPayload = {
  name: string;
  description: string;
  category: Tool['category'];
  status: Tool['status'];
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  teamMembers?: string[];
  businessImpact?: string;
  stats?: Partial<Tool['stats']>;
};

type ToolUpdatePayload = Partial<ToolFormPayload>;

type ToolOverride = Omit<Partial<Tool>, 'stats' | 'teamMembers'> & {
  stats?: Partial<Tool['stats']>;
  teamMembers?: string[];
};

const DEFAULT_TOOL_STATS: Tool['stats'] = {
  usage: 75,
  efficiency: 80,
  uptime: 98,
  processingTime: 220,
  totalRuns: 1500,
  costSavings: 18000,
  errorRate: 3,
};

const mapToolTypeToCategory = (toolType: string): Tool['category'] => {
  const typeMap: Record<string, Tool['category']> = {
    Automation: 'Automation',
    'AI Assistant': 'AI Tool',
    'Document Processing': 'ML',
    'Financial Tool': 'Automation',
    'Scheduling System': 'Workflow',
    'AI Classifier': 'ML',
  };
  return typeMap[toolType] || 'AI Tool';
};

const mapSystemTypeToCategory = (systemType: string): Tool['category'] => {
  const typeMap: Record<string, Tool['category']> = {
    automation: 'Automation',
    workflow: 'Workflow',
    integration: 'Automation',
    'ai-model': 'AI Tool',
  };
  return typeMap[systemType] || 'AI Tool';
};

const generateBusinessImpact = (toolType: string, industry: string): string => {
  const impacts = {
    Automation: `Reduces manual processing time by 75% in ${industry} operations`,
    'AI Assistant': 'Improves customer satisfaction by 40% through intelligent responses',
    'Document Processing': 'Processes documents 90% faster with 99% accuracy',
    'Financial Tool': 'Saves $25,000 annually through automated expense tracking',
    'Scheduling System': 'Reduces scheduling conflicts by 85% and improves efficiency',
    'AI Classifier': 'Automatically categorizes and routes requests with 95% accuracy',
    workflow: 'Streamlines business processes and improves operational efficiency',
    automation: 'Automates repetitive tasks and reduces manual workload',
    'ai-model': 'Leverages AI to improve decision making and accuracy',
    integration: 'Connects systems and improves data flow across platforms',
  };
  return impacts[toolType] || 'Streamlines business processes and improves efficiency';
};

const mergeStats = (base: Tool['stats'], updates?: Partial<Tool['stats']>): Tool['stats'] => {
  if (!updates) {
    return base;
  }
  return {
    ...base,
    ...updates,
  };
};

const mergeOverride = (base: ToolOverride | undefined, updates: ToolOverride): ToolOverride => ({
  ...base,
  ...updates,
  stats: updates.stats ? { ...(base?.stats || {}), ...updates.stats } : base?.stats,
  teamMembers: updates.teamMembers ?? base?.teamMembers,
});

const mergeToolWithOverride = (tool: Tool, override: ToolOverride | undefined): Tool => {
  if (!override) {
    return tool;
  }
  return {
    ...tool,
    ...override,
    teamMembers: override.teamMembers ?? tool.teamMembers,
    stats: override.stats ? mergeStats(tool.stats, override.stats) : tool.stats,
    updatedAt: override.updatedAt ?? tool.updatedAt,
  };
};

const generateAdditionalTools = (clients: Client[], projects: Project[]): Tool[] => {
  const additionalTools: Tool[] = [];

  const uniqueToolTemplates = [
    {
      name: 'Smart Email Classifier',
      description: 'AI-powered email classification and routing system',
      category: 'ML' as const,
      type: 'Email Processing',
    },
    {
      name: 'Predictive Analytics Engine',
      description: 'Machine learning model for business forecasting',
      category: 'ML' as const,
      type: 'Analytics',
    },
    {
      name: 'Conversational AI Agent',
      description: 'GPT-powered customer service chatbot',
      category: 'GPT' as const,
      type: 'Chatbot',
    },
    {
      name: 'Document Intelligence System',
      description: 'LLM-based document analysis and extraction',
      category: 'LLM' as const,
      type: 'Document AI',
    },
    {
      name: 'Workflow Orchestrator',
      description: 'Automated workflow management and execution',
      category: 'Workflow' as const,
      type: 'Orchestration',
    },
    {
      name: 'Intelligent Process Agent',
      description: 'Autonomous agent for business process automation',
      category: 'Agent' as const,
      type: 'Process Agent',
    },
  ];

  clients.forEach((client, clientIndex) => {
    if (clientIndex < uniqueToolTemplates.length) {
      const template = uniqueToolTemplates[clientIndex];
      const project = projects.find((item) => item.clientId === client.id);

      const tool: Tool = {
        id: `tool-unique-${clientIndex + 1}`,
        name: template.name,
        description: template.description,
        category: template.category,
        status: 'active',
        clientId: client.id,
        clientName: client.companyName,
        projectId: project?.id || 'unknown',
        projectName: project?.name || 'Unknown Project',
        teamMembers: project?.assignedUsers || client.teamMemberIds.slice(0, 2),
        businessImpact: generateBusinessImpact(template.type, client.industry),
        stats: {
          usage: Math.floor(Math.random() * 40) + 60,
          efficiency: Math.floor(Math.random() * 30) + 70,
          uptime: Math.floor(Math.random() * 10) + 90,
          processingTime: Math.floor(Math.random() * 500) + 100,
          totalRuns: Math.floor(Math.random() * 10000) + 1000,
          costSavings: Math.floor(Math.random() * 50000) + 10000,
          errorRate: Math.floor(Math.random() * 5) + 1,
        },
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };
      additionalTools.push(tool);
    }
  });

  return additionalTools;
};

export const useTools = () => {
  const [generatedTools, setGeneratedTools] = useState<Tool[]>([]);
  const [customTools, setCustomTools] = useState<Tool[]>([]);
  const [toolOverrides, setToolOverrides] = useState<Record<string, ToolOverride>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { clients } = useClients();
  const { projects } = useProjects();
  const { user, account } = useAuth();

  const generateToolsFromData = useCallback(() => {
    const nextGenerated: Tool[] = [];

    if (user?.accountType !== 'business') {
      clients.forEach((client) => {
        client.tools.forEach((clientTool) => {
          const project = projects.find((item) => item.clientId === client.id);

          nextGenerated.push({
            id: clientTool.id,
            name: clientTool.name,
            description: `${clientTool.type} system for ${client.companyName}`,
            category: mapToolTypeToCategory(clientTool.type),
            status:
              clientTool.status === 'active'
                ? 'active'
                : clientTool.status === 'development'
                  ? 'development'
                  : 'inactive',
            clientId: client.id,
            clientName: client.companyName,
            projectId: project?.id || 'unknown',
            projectName: project?.name || 'Unknown Project',
            teamMembers: project?.assignedUsers || client.teamMemberIds,
            businessImpact: generateBusinessImpact(clientTool.type, client.industry),
            stats: {
              usage: clientTool.usage || Math.floor(Math.random() * 40) + 60,
              efficiency: Math.floor(Math.random() * 30) + 70,
              uptime: Math.floor(Math.random() * 10) + 90,
              processingTime: Math.floor(Math.random() * 500) + 100,
              totalRuns: Math.floor(Math.random() * 10000) + 1000,
              costSavings: Math.floor(Math.random() * 50000) + 10000,
              errorRate: Math.floor(Math.random() * 5) + 1,
            },
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
          });
        });
      });
    }

    projects.forEach((project) => {
      const client = user?.accountType === 'business' ? null : clients.find((item) => item.id === project.clientId);
      const entityName = user?.accountType === 'business' ? account?.name || 'Business Account' : client?.companyName;

      if (!entityName) {
        return;
      }

      project.systems.forEach((system) => {
        if (nextGenerated.some((item) => item.name === system.name)) {
          return;
        }

        nextGenerated.push({
          id: system.id,
          name: system.name,
          description: system.description,
          category: mapSystemTypeToCategory(system.type),
          status:
            system.status === 'active'
              ? 'active'
              : system.status === 'development'
                ? 'development'
                : system.status === 'testing'
                  ? 'testing'
                  : 'inactive',
          clientId: client?.id || '',
          clientName: entityName,
          projectId: project.id,
          projectName: project.name,
          teamMembers: project.assignedUsers,
          businessImpact: system.businessImpact,
          stats: {
            usage: Math.floor(Math.random() * 40) + 60,
            efficiency: Math.floor(Math.random() * 30) + 70,
            uptime: Math.floor(Math.random() * 10) + 90,
            processingTime: Math.floor(Math.random() * 500) + 100,
            totalRuns: Math.floor(Math.random() * 10000) + 1000,
            costSavings: Math.floor(Math.random() * 50000) + 10000,
            errorRate: Math.floor(Math.random() * 5) + 1,
          },
          createdAt: system.createdAt,
          updatedAt: project.updatedAt,
        });
      });
    });

    if (user?.accountType !== 'business') {
      nextGenerated.push(...generateAdditionalTools(clients, projects));
    }

    setGeneratedTools(nextGenerated);
    setIsLoading(false);
  }, [account?.name, clients, projects, user?.accountType]);

  useEffect(() => {
    if (projects.length === 0) {
      if (user?.accountType === 'business' || clients.length > 0) {
        setGeneratedTools([]);
        setIsLoading(false);
      }
      return;
    }

    if (user?.accountType !== 'business' && clients.length === 0) {
      return;
    }

    generateToolsFromData();
  }, [clients, projects, user?.accountType, generateToolsFromData]);

  const createTool = (toolData: ToolFormPayload) => {
    const timestamp = new Date().toISOString();
    const associatedClient = toolData.clientId ? clients.find(client => client.id === toolData.clientId) : undefined;
    const associatedProject = toolData.projectId ? projects.find(project => project.id === toolData.projectId) : undefined;
    const newTool: Tool = {
      id: Date.now().toString(),
      name: toolData.name,
      description: toolData.description,
      category: toolData.category,
      status: toolData.status,
      clientId: toolData.clientId || '',
      clientName: toolData.clientName || associatedClient?.companyName || (toolData.clientId ? 'Client' : 'Internal'),
      projectId: toolData.projectId || '',
      projectName: toolData.projectName || associatedProject?.name || (toolData.projectId ? 'Project' : 'Standalone'),
      teamMembers: toolData.teamMembers || associatedProject?.assignedUsers || [],
      businessImpact: toolData.businessImpact,
      stats: mergeStats(DEFAULT_TOOL_STATS, toolData.stats),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setCustomTools(prev => [...prev, newTool]);
    return newTool;
  };

  const updateTool = (id: string, updates: ToolUpdatePayload) => {
    const timestamp = new Date().toISOString();
    let updatedCustom = false;

    setCustomTools(prev => prev.map(tool => {
      if (tool.id !== id) return tool;
      updatedCustom = true;
      const associatedClient = updates.clientId ? clients.find(client => client.id === updates.clientId) : undefined;
      const associatedProject = updates.projectId ? projects.find(project => project.id === updates.projectId) : undefined;
      return {
        ...tool,
        ...updates,
        clientId: updates.clientId ?? tool.clientId,
        clientName: updates.clientName ?? associatedClient?.companyName ?? tool.clientName,
        projectId: updates.projectId ?? tool.projectId,
        projectName: updates.projectName ?? associatedProject?.name ?? tool.projectName,
        teamMembers: updates.teamMembers ?? associatedProject?.assignedUsers ?? tool.teamMembers,
        businessImpact: updates.businessImpact ?? tool.businessImpact,
        stats: mergeStats(tool.stats, updates.stats),
        updatedAt: timestamp,
      };
    }));

    if (!updatedCustom) {
      setToolOverrides(prev => ({
        ...prev,
        [id]: mergeOverride(prev[id], {
          ...updates,
          updatedAt: timestamp,
        }),
      }));
    }
  };

  const deleteTool = (id: string) => {
    setCustomTools(prev => prev.filter(tool => tool.id !== id));
    setToolOverrides(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const tools = useMemo(() => {
    const mergedGenerated = generatedTools.map(tool => mergeToolWithOverride(tool, toolOverrides[tool.id]));
    return [...mergedGenerated, ...customTools];
  }, [generatedTools, customTools, toolOverrides]);

  return {
    tools,
    isLoading,
    createTool,
    updateTool,
    deleteTool,
  };
};