import { LayoutDashboard, PanelsTopLeft, Share2 } from 'lucide-react';

import type { NavigationItem, ViewId } from '../types/navigation';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspaces', label: 'Workspaces', icon: PanelsTopLeft },
  { id: 'solutions', label: 'Systems Hub', icon: Share2 },
];

export const DEFAULT_VIEW_ID: ViewId = NAVIGATION_ITEMS[0]?.id ?? 'dashboard';
