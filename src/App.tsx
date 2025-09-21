import React, { useEffect, useMemo, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { Footer } from './components/Shared/Footer';
import Company from './views/Company';
import Dashboard from './views/Dashboard';
import Workspaces from './views/Workspaces';
import Solutions from './views/Solutions';
import Clients from './views/Clients';
import Projects from './views/Projects';
import Team from './views/Team';
import Tools from './views/Tools';
import { DEFAULT_VIEW_ID } from './lib/navigation';
import { getAvailablePages } from './utils/permissions';
import type { ViewId } from './types/navigation';

const AppContent: React.FC = () => {
  const { user, account, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>(DEFAULT_VIEW_ID);

  const availablePages = useMemo(() => (user ? getAvailablePages(user) : []), [user]);

  useEffect(() => {
    if (!isLoading && availablePages.length > 0) {
      setActiveView((previous) => (availablePages.includes(previous) ? previous : availablePages[0]));
    }
  }, [availablePages, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-start)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-purple"></div>
      </div>
    );
  }

  if (!user || !account) {
    return <LoginForm />;
  }

  if (availablePages.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-start)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-[var(--fg)]">No sections available</p>
          <p className="text-sm text-[var(--fg-muted)]">Please contact your administrator to enable workspace views.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'company':
        return <Company />;
      case 'clients':
        return <Clients />;
      case 'projects':
        return <Projects />;
      case 'team':
        return <Team />;
      case 'workspaces':
        return <Workspaces />;
      case 'tools':
        return <Tools />;
      case 'solutions':
        return <Solutions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-start)]">
      <Header />
      <div className="flex-1 flex">
        <Sidebar activeView={activeView} availablePages={availablePages} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
