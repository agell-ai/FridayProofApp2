import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ToolCard from '../components/Tools/ToolCard';
import ToolDetails from '../components/Tools/ToolDetails';
import { useTools } from '../hooks/useTools';
import { Tool } from '../types/tools';

const Tools: React.FC = () => {
  const { tools, isLoading } = useTools();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  if (selectedTool) {
    return <ToolDetails tool={selectedTool} onBack={() => setSelectedTool(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        </div>
        <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Tool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => setSelectedTool(tool)}
          />
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No tools found</div>
          <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 mx-auto">
            <Plus className="w-5 h-5" />
            <span>Create Your First Tool</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Tools;