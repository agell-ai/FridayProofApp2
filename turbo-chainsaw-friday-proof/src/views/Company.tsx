import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Clock } from 'lucide-react';

const Company: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Total Revenue</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">$485K</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <DollarSign className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Active Projects</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">24</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+3 this week</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <Activity className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Team Members</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">12</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">95% utilization</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <Users className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Avg Response Time</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">2.4h</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">-15% improvement</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <Clock className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[var(--fg)]">Revenue Trend</h3>
            <BarChart3 className="w-5 h-5 text-[var(--fg-muted)]" />
          </div>
          <div className="h-64 flex items-center justify-center text-[var(--fg-muted)]">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[var(--fg-muted)]" />
              <p>Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[var(--fg)]">Project Status</h3>
            <Activity className="w-5 h-5 text-[var(--fg-muted)]" />
          </div>
          <div className="h-64 flex items-center justify-center text-[var(--fg-muted)]">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[var(--fg-muted)]" />
              <p>Project status chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
        <h3 className="text-xl font-semibold text-[var(--fg)] mb-6">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">98.5%</div>
            <div className="text-sm text-[var(--fg-muted)]">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">4.8/5</div>
            <div className="text-sm text-[var(--fg-muted)]">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">156</div>
            <div className="text-sm text-[var(--fg-muted)]">Tools Deployed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;