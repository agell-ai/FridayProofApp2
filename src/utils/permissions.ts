import { NAVIGATION_ITEMS } from '../lib/navigation';
import { User } from '../types';
import type { ViewId } from '../types/navigation';

const ALL_PAGES: ViewId[] = NAVIGATION_ITEMS.map((item) => item.id);

const BUSINESS_RESTRICTED_PAGES: ViewId[] = ALL_PAGES.filter((page) => page !== 'clients');

const CONTRACTOR_ALLOWED_PAGES: ViewId[] = [
  'dashboard',
  'projects',
  'team',
  'workspaces',
  'tools',
  'solutions',
];

const CLIENT_ALLOWED_PAGES: ViewId[] = [
  'dashboard',
  'company',
  'projects',
  'workspaces',
  'tools',
  'solutions',
];

const filterPages = (pages: ViewId[], allowed: ViewId[]): ViewId[] =>
  pages.filter((page): page is ViewId => allowed.includes(page));

export const getAvailablePages = (user: User): ViewId[] => {
  const { accountType, role, enabledPages } = user;

  const accountTypePages: Record<User['accountType'], ViewId[]> = {
    agency: ALL_PAGES,
    consultant: ALL_PAGES,
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

export const getPageTitle = (page: ViewId): string => {
  const match = NAVIGATION_ITEMS.find((item) => item.id === page);
  return match?.label ?? 'Dashboard';
};
