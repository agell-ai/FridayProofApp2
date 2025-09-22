import type { LucideIcon } from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'workspaces'
  | 'solutions'
  | 'projects-metrics'
  | 'systems-metrics'
  | 'clients-metrics'
  | 'team-metrics';

export interface ViewComponentProps {
  onNavigate?: (view: ViewId) => void;
}

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}
