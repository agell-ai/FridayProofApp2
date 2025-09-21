import type { LucideIcon } from 'lucide-react';

export type CategoryKey = 'clients' | 'projects' | 'team' | 'tools';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface CategoryMetric {
  id: string;
  label: string;
  value: string;
  changeLabel?: string;
  trend?: TrendDirection;
  progress?: number;
}

export interface CategoryMeta {
  key: CategoryKey;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  hideForBusiness?: boolean;
}

export interface ClientAnalyticsSummary {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  prospectClients: number;
  totalRevenue: number;
  avgSatisfaction: number;
  avgResponseTime: number;
}

export interface ProjectAnalyticsSummary {
  totalProjects: number;
  byStatus: Record<'planning' | 'development' | 'testing' | 'deployed' | 'maintenance', number>;
  totalSystems: number;
  activeSystems: number;
}

export interface TeamAnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  byRole: Record<'employee' | 'contractor' | 'manager', number>;
  avgProductivity: number;
  totalHours: number;
  avgSatisfaction: number;
}

export interface ToolAnalyticsSummary {
  totalTools: number;
  byCategory: Record<string, number>;
  byStatus: Record<'active' | 'development' | 'testing' | 'inactive' | 'error', number>;
  avgUsage: number;
  avgEfficiency: number;
  totalCostSavings: number;
}

export interface DashboardAnalyticsSummary {
  clients: ClientAnalyticsSummary;
  projects: ProjectAnalyticsSummary;
  team: TeamAnalyticsSummary;
  tools: ToolAnalyticsSummary;
}
