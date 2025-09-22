import type { LucideIcon } from 'lucide-react';

export type ViewId = 'dashboard' | 'workspaces' | 'solutions';

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}
