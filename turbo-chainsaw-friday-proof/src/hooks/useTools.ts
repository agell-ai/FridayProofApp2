import { useState, useEffect } from 'react';
import { Tool } from '../types/tools';
import { useClients } from './useClients';
import { useProjects } from './useProjects';
import { useAuth } from '../contexts/AuthContext';

export const useTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { clients } = useClients();
  const { projects } = useProjects();
  const { user } = useAuth();

  useEffect(() => {
    if (projects.length > 0 && (user?.accountType !== 'business' ? clients.length > 0 : true)) {
      generateToolsFromData();
    }
  }, [clients, projects, user]);

  const generateToolsFromData = () => {
    const generatedTools: Tool[] = [];

    // Only generate tools from client data for non-business accounts
    if (user?.accountType !== 'business') {
      // Generate tools from client tools
      clients.forEach(client => {
        client.tools.forEach(clientTool => {
          // Find associated project
          const project = projects.find(p => p.clientId === client.id);
          
          const tool: Tool = {
            id: clientTool.id,
            name: clientTool.name,
            description: `${clientTool.type} system for ${client.companyName}`,
            category: mapToolTypeToCategory(clientTool.type),
            status: clientTool.status === 'active' ? 'active' : 
                    clientTool.status === 'development' ? 'development' : 'inactive',
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
          };
          generatedTools.push(tool);
        });
      });
    }

    // Generate tools from project systems
    projects.forEach(project => {
      // For business accounts, there's no client
      const client = user?.accountType === 'business' ? null : clients.find(c => c.id === project.clientId);
      
      // For business accounts, use account name; for others, require client
      const entityName = user?.accountType === 'business' 
        ? user.account?.name || 'Business Account'
        : client?.companyName;
      
      if (!entityName) return;

      project.systems.forEach(system => {
        // Skip if we already have a tool for this system
        if (generatedTools.some(t => t.name === system.name)) return;

        const tool: Tool = {
          id: system.id,
          name: system.name,
          description: system.description,
          category: mapSystemTypeToCategory(system.type),
          status: system.status === 'active' ? 'active' : 
                  system.status === 'development' ? 'development' :
                  system.status === 'testing' ? 'testing' : 'inactive',
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
        };
        generatedTools.push(tool);
      });
    });

    // Add some additional unique tools for variety (only for non-business accounts)
    if (user?.accountType !== 'business') {
      const additionalTools = generateAdditionalTools(clients, projects);
      generatedTools.push(...additionalTools);
    }

    setTools(generatedTools);
    setIsLoading(false);
  };

  const mapToolTypeToCategory = (toolType: string): Tool['category'] => {
    const typeMap: Record<string, Tool['category']> = {
      'Automation': 'Automation',
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
      'automation': 'Automation',
      'workflow': 'Workflow',
      'integration': 'Automation',
      'ai-model': 'AI Tool',
    };
    return typeMap[systemType] || 'AI Tool';
  };

  const generateBusinessImpact = (toolType: string, industry: string): string => {
    const impacts = {
      'Automation': `Reduces manual processing time by 75% in ${industry} operations`,
      'AI Assistant': `Improves customer satisfaction by 40% through intelligent responses`,
      'Document Processing': `Processes documents 90% faster with 99% accuracy`,
      'Financial Tool': `Saves $25,000 annually through automated expense tracking`,
      'Scheduling System': `Reduces scheduling conflicts by 85% and improves efficiency`,
      'AI Classifier': `Automatically categorizes and routes requests with 95% accuracy`,
      'workflow': `Streamlines business processes and improves operational efficiency`,
      'automation': `Automates repetitive tasks and reduces manual workload`,
      'ai-model': `Leverages AI to improve decision making and accuracy`,
      'integration': `Connects systems and improves data flow across platforms`,
    };
    return impacts[toolType] || `Streamlines business processes and improves efficiency`;
  };

  const generateAdditionalTools = (clients: any[], projects: any[]): Tool[] => {
    const additionalTools: Tool[] = [];
    
    // Generate some unique tools not covered by existing data
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
        const project = projects.find(p => p.clientId === client.id);
        
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

  return {
    tools,
    isLoading,
  };
};