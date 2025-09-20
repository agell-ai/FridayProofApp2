import React from 'react';
import { System, Component } from '../../types';
import { 
  Zap, 
  Play, 
  GitBranch, 
  Brain, 
  Database, 
  Target,
  ArrowRight
} from 'lucide-react';

interface SystemVisualizerProps {
  system: System;
}

const componentIcons = {
  trigger: Play,
  action: Target,
  condition: GitBranch,
  'ai-processor': Brain,
  'data-source': Database,
  output: Zap,
};

const componentColors = {
  trigger: 'bg-green-500/20 border-green-500/50 text-green-400',
  action: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  condition: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  'ai-processor': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  'data-source': 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  output: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
};

const SystemVisualizer: React.FC<SystemVisualizerProps> = ({ system }) => {
  return (
    <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur-md shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{system.name}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{system.description}</p>
        
        <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Business Impact</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{system.businessImpact}</p>
        </div>
      </div>

      <div className="relative">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Flow</h4>
        
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {system.components.map((component, index) => {
            const Icon = componentIcons[component.type];
            const colorClass = componentColors[component.type];
            
            return (
              <React.Fragment key={component.id}>
                <div className={`flex-shrink-0 p-4 rounded-lg border-2 ${colorClass} min-w-[200px]`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{component.name}</span>
                  </div>
                  <p className="text-xs opacity-80 mb-2">{component.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize">{component.type.replace('-', ' ')}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      component.status === 'active' ? 'bg-green-400' : 
                      component.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                  </div>
                </div>
                
                {index < system.components.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SystemVisualizer;