import React from 'react';
import { LogOut } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { NAVIGATION_ITEMS } from '../../lib/navigation';
import type { ViewId } from '../../types/navigation';
import { Logo } from '../Shared/Logo';

interface SidebarProps {
  activeView: ViewId;
  availablePages: ViewId[];
  onViewChange: (view: ViewId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, availablePages, onViewChange }) => {
  const { user, account, logout } = useAuth();

  if (!user || !account) return null;

  const menuItems = NAVIGATION_ITEMS.filter((item) => availablePages.includes(item.id));

  return (
    <div className="w-64 bg-[var(--bg-start)] border-r border-[var(--border)] flex flex-col">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id} className="relative group">
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-lg transition-opacity duration-300 z-0 ${
                    isActive ? 'opacity-75' : 'opacity-0 group-hover:opacity-75'
                  }`}
                  style={{ filter: 'blur(2px)' }}
                  aria-hidden="true"
                />
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`relative z-10 w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-[var(--fg)] bg-[var(--card)] shadow-sm'
                      : 'text-[var(--fg-muted)] group-hover:bg-[var(--card)] group-hover:text-[var(--fg)] group-hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-[var(--accent-orange)] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--fg)]">{user?.name}</p>
            <p className="text-xs text-[var(--fg-muted)] capitalize">
              {user?.role} • {user?.accountType}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
