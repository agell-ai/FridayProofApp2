import {
  LayoutDashboard,
  Building2,
  Handshake,
  FolderOpen,
  Users,
  PanelsTopLeft,
  Wrench,
  Share2,
  BarChart3,
} from 'lucide-react';

import type { NavigationItem, ViewId } from '../types/navigation';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'clients', label: 'Clients', icon: Handshake },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'workspaces', label: 'Workspaces', icon: PanelsTopLeft },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'solutions', label: 'Solutions Hub', icon: Share2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const DEFAULT_VIEW_ID: ViewId = NAVIGATION_ITEMS[0]?.id ?? 'dashboard';
