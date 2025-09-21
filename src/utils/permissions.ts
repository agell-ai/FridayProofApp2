import { User } from '../types';

export const getAvailablePages = (user: User): string[] => {
  const { accountType, role, enabledPages } = user;

  const allPages = ['dashboard', 'workspaces', 'solutions', 'analytics', 'archive'];
  
  // Define pages by account type
  const accountTypePages = {
    agency: allPages,
    consultant: ['dashboard', 'workspaces', 'solutions', 'analytics', 'archive'],
    business: ['dashboard', 'workspaces', 'solutions', 'analytics', 'archive']
  };

  // Define pages by role
  const rolePages = {
    owner: accountTypePages[accountType],
    manager: enabledPages || accountTypePages[accountType],
    employee: accountTypePages[accountType],
    contractor: accountTypePages[accountType],
    client: ['dashboard', 'workspaces', 'solutions']
  };
  
  return rolePages[role];
};

export const canAccessPage = (user: User, page: string): boolean => {
  const availablePages = getAvailablePages(user);
  return availablePages.includes(page);
};

export const getPageTitle = (page: string): string => {
  const titles = {
    dashboard: 'Dashboard',
    workspaces: 'Workspaces',
    solutions: 'Solutions',
    analytics: 'Analytics',
    archive: 'Archive'
  };
  return titles[page as keyof typeof titles] || 'Dashboard';
};