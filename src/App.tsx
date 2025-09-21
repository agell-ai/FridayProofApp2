import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Projects from './views/Projects';
import { Team } from './views/Team';
import { Tools } from './views/Tools';
import { Solutions } from './views/Solutions';
import { Workspaces } from './views/Workspaces';
import Analytics from './views/Analytics';
import Company from './views/Company';
import { ProjectDetailsPage } from './views/ProjectDetailsPage';

type View = 'dashboard' | 'clients' | 'projects' | 'team' | 'tools' | 'solutions' | 'workspaces' | 'analytics' | 'company';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const renderView = () => {
    if (selectedProject) {
      return (
        <ProjectDetailsPage
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      );
    }

    if (selectedClient) {
      return (
        <ClientDetailsPage
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'projects':
        return <Projects />;
      case 'team':
        return <Team />;
      case 'tools':
        return <Tools />;
      case 'solutions':
        return <Solutions />;
      case 'workspaces':
        return (
          <Workspaces
            onSelectProject={setSelectedProject}
            onSelectClient={setSelectedClient}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'company':
        return <Company />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 ml-64 pt-16">
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;