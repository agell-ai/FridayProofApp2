import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ToolCard from '../components/Tools/ToolCard';
import ToolDetails from '../components/Tools/ToolDetails';
import { useTools } from '../hooks/useTools';
import { Tool } from '../types/tools';
import { Button } from '../components/Shared/Button';

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
        <Button glowOnHover className="font-semibold text-white group-hover:text-white group-focus-within:text-white">
          <Plus className="w-5 h-5" />
          <span>New Tool</span>
        </Button>
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
          <Button
            glowOnHover
            wrapperClassName="mx-auto w-full max-w-xs"
            className="w-full justify-center font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Tool</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Tools;