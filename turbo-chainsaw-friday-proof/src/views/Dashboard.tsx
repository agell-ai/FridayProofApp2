import React from 'react';
import { Edit, Users, FolderOpen, Wrench, TrendingUp, Activity, DollarSign, Clock } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, account } = useAuth();

  const handleModify = () => {
    // Handle modify action
    console.log('Modify dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={handleModify}
          className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Edit className="w-5 h-5" />
          <span>Modify</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Revenue"
          value="$48.2K"
          change="+12% from last month"
          icon={DollarSign}
        />
        <StatsCard
          title="New Clients"
          value="3"
          change="+1 from last month"
          icon={Users}
        />
        <StatsCard
          title="Active Projects"
          value="12"
          change="+2 this week"
          icon={FolderOpen}
        />
        <StatsCard
          title="Projects Completed"
          value="5"
          change="+2 from last month"
          icon={FolderOpen}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
            <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center justify-between p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">E-commerce Automation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">RetailMax Solutions</p>
              </div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                In Progress
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Customer Support AI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">TechCorp Industries</p>
              </div>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                Testing
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Invoice Processing</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">FinanceFlow Corp</p>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Deployed
              </span>
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h3>
            <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">System Uptime</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">99.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Avg Response Time</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1.2s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Client Satisfaction</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">4.9/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Active Tools</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">156</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 rounded-lg transition-colors text-left backdrop-blur-sm">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-gray-900 dark:text-white font-medium">New Project</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Start a new automation project</p>
          </button>
          <button className="p-4 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 rounded-lg transition-colors text-left backdrop-blur-sm">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-gray-900 dark:text-white font-medium">Add Team Member</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Invite someone to your team</p>
          </button>
          <button className="p-4 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 rounded-lg transition-colors text-left backdrop-blur-sm">
            <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-gray-900 dark:text-white font-medium">Deploy Tool</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Launch a new AI tool</p>
          </button>
          <button className="p-4 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 rounded-lg transition-colors text-left backdrop-blur-sm">
            <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-gray-900 dark:text-white font-medium">View Analytics</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Check performance metrics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;