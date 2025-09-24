import { FolderOpen, Handshake, LayoutDashboard, PanelsTopLeft, Share2, Users, Wrench } from 'lucide-react';

import type { NavigationItem, ViewId } from '../types/navigation';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects-metrics', label: 'Project Metrics', icon: FolderOpen, showInSidebar: false },
  { id: 'systems-metrics', label: 'Systems Metrics', icon: Wrench, showInSidebar: false },
  { id: 'clients-metrics', label: 'Client Metrics', icon: Handshake, showInSidebar: false },
  { id: 'team-metrics', label: 'Team Metrics', icon: Users, showInSidebar: false },
  { id: 'workspaces', label: 'Workspaces', icon: PanelsTopLeft },
  { id: 'solutions', label: 'Solutions Hub', icon: Share2 },
];

export const DEFAULT_VIEW_ID: ViewId = NAVIGATION_ITEMS[0]?.id ?? 'dashboard';
