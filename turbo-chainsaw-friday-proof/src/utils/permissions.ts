import { User } from '../types';

export const getAvailablePages = (user: User): string[] => {
  const { accountType, role, enabledPages } = user;
  
  const allPages = ['dashboard', 'company', 'clients', 'projects', 'team', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'];
  
  // Define pages by account type
  const accountTypePages = {
    agency: allPages,
    consultant: ['dashboard', 'company', 'clients', 'projects', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'],
    business: ['dashboard', 'company', 'projects', 'team', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive']
  };
  
  // Define pages by role
  const rolePages = {
    owner: accountTypePages[accountType],
    manager: enabledPages || (accountType === 'consultant' ? ['dashboard', 'company', 'clients', 'projects', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'] : ['dashboard', 'company', 'clients', 'projects', 'team', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive']), // Managers see only what owner enables
    employee: accountType === 'consultant' ? ['dashboard', 'company', 'projects', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'] : ['dashboard', 'company', 'projects', 'team', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'],
    contractor: accountType === 'consultant' ? ['dashboard', 'company', 'projects', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'] : ['dashboard', 'company', 'projects', 'team', 'tools', 'systems', 'analytics', 'templates', 'marketplace', 'archive'],
    client: ['dashboard', 'company', 'projects', 'team', 'tools', 'systems'] // This role shouldn't exist for business accounts
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
    company: 'Company',
    clients: 'Clients',
    projects: 'Projects',
    team: 'Team',
    tools: 'Tools',
    systems: 'Systems',
    analytics: 'Analytics',
    templates: 'Templates',
    marketplace: 'Marketplace',
    archive: 'Archive'
  };
  return titles[page as keyof typeof titles] || 'Dashboard';
};