import type { LucideIcon } from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'company'
  | 'clients'
  | 'projects'
  | 'team'
  | 'workspaces'
  | 'tools'
  | 'solutions';

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}
