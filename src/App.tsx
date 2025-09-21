import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { Footer } from './components/Shared/Footer';
import Company from './views/Company';
import Workspaces from './views/Workspaces';
import SystemsHub from './views/Solutions';
import Analytics from './views/Analytics';

const AppContent: React.FC = () => {
  const { user, account, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

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

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Analytics />;
      case 'company':
        return <Company />;
      case 'analytics':
        return <Analytics />;
      case 'workspaces':
        return <Workspaces />;
      case 'systemsHub':
        return <SystemsHub />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-start)]">
      <Header />
      <div className="flex-1 flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;