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
  /**
   * Controls whether the item should render in the sidebar navigation. Defaults to true when
   * omitted so existing entries continue to appear unless explicitly hidden.
   */
  showInSidebar?: boolean;
}
