import React, { useEffect, useMemo, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { TeamProvider } from './hooks/useTeam';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { Footer } from './components/Shared/Footer';
import Dashboard from './views/Dashboard';
import Workspaces from './views/Workspaces';
import Solutions from './views/Solutions';
import ProjectsMetrics from './views/ProjectsMetrics';
import SystemsMetrics from './views/SystemsMetrics';
import ClientsMetrics from './views/ClientsMetrics';
import TeamMetrics from './views/TeamMetrics';
import { DEFAULT_VIEW_ID } from './lib/navigation';
import { getAvailablePages } from './utils/permissions';
import type { ViewComponentProps, ViewId } from './types/navigation';

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType<ViewComponentProps>> = {
  dashboard: Dashboard,
  workspaces: Workspaces,
  solutions: Solutions,
  'projects-metrics': ProjectsMetrics,
  'systems-metrics': SystemsMetrics,
  'clients-metrics': ClientsMetrics,
  'team-metrics': TeamMetrics,
};

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

  const ActiveViewComponent = VIEW_COMPONENTS[activeView] ?? VIEW_COMPONENTS[DEFAULT_VIEW_ID];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-start)]">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} availablePages={availablePages} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <ActiveViewComponent onNavigate={setActiveView} />
          </main>
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
        <TeamProvider>
          <AppContent />
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
