import { NAVIGATION_ITEMS } from '../lib/navigation';
import { User } from '../types';
import type { ViewId } from '../types/navigation';

export const allPages: ViewId[] = NAVIGATION_ITEMS.map((item) => item.id);

export const titles: Record<ViewId, string> = NAVIGATION_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  {} as Record<ViewId, string>,
);

const BUSINESS_RESTRICTED_PAGES: ViewId[] = allPages.filter((page) => page !== 'clients');

const CONTRACTOR_ALLOWED_PAGES: ViewId[] = [
  'dashboard',
  'projects',
  'team',
  'workspaces',
  'tools',
  'solutions',
  'archive',
];

const CLIENT_ALLOWED_PAGES: ViewId[] = [
  'dashboard',
  'company',
  'projects',
  'workspaces',
  'tools',
  'solutions',
  'archive',
];

const filterPages = (pages: ViewId[], allowed: ViewId[]): ViewId[] =>
  pages.filter((page): page is ViewId => allowed.includes(page));

export const getAvailablePages = (user: User): ViewId[] => {
  const { accountType, role, enabledPages } = user;

  const accountTypePages: Record<User['accountType'], ViewId[]> = {
    agency: allPages,
    consultant: allPages,
    business: BUSINESS_RESTRICTED_PAGES,
  };

  const basePages = accountTypePages[accountType];

  const rolePages: Record<User['role'], ViewId[]> = {
    owner: basePages,
    manager: (enabledPages ?? basePages).filter((page): page is ViewId => basePages.includes(page)),
    employee: basePages,
    contractor: filterPages(basePages, CONTRACTOR_ALLOWED_PAGES),
    client: filterPages(basePages, CLIENT_ALLOWED_PAGES),
  };

  return rolePages[role];
};

export const canAccessPage = (user: User, page: ViewId): boolean => {
  const availablePages = getAvailablePages(user);
  return availablePages.includes(page);
};

export const getPageTitle = (page: ViewId): string => titles[page] ?? 'Dashboard';
