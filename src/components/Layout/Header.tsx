import React, { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Logo } from '../Shared/Logo';
import ThemeToggle from '../Shared/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import AccountModal from './AccountModal';

export function Header() {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, account } = useAuth();
 
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--header)]">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-auto" />
            {account && (
              <div className="text-2xl font-bold text-[var(--fg)]">
                {account.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition-all"
              />
            </div>
            
            <ThemeToggle />
            
            {/* Settings/Account */}
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="p-2 text-[var(--fg-muted)] rounded-lg transition-colors"
              aria-label="Account Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Account Modal */}
      {isAccountModalOpen && (
        <AccountModal
          user={user}
          account={account}
          onClose={() => setIsAccountModalOpen(false)}
        />
      )}
    </>
  );
}

export default Header;