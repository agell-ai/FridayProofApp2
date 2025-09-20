export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'ML' | 'LLM' | 'GPT' | 'AI Tool' | 'Agent' | 'Automation' | 'Workflow';
  status: 'active' | 'development' | 'testing' | 'inactive' | 'error';
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  teamMembers: string[]; // Team member IDs
  businessImpact?: string;
  stats: {
    usage: number; // Percentage
    efficiency: number; // Percentage
    uptime: number; // Percentage
    processingTime: number; // Milliseconds
    totalRuns: number;
    costSavings: number; // Dollar amount
    errorRate: number; // Percentage
  };
  createdAt: string;
  updatedAt: string;
}