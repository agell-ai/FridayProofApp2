import React from 'react';
import { Edit, Building2, Users, FolderOpen, Mail } from 'lucide-react';
import { Button } from '../Shared/Button';

interface WorkspaceItem {
  id: string;
  type: 'project' | 'client' | 'team';
  title: string;
  subtitle?: string;
  meta?: string;
  status: string;
  updatedAt: string;
  email?: string;
}

interface WorkspaceCardProps {
  item: WorkspaceItem;
  onClick: () => void;
  onEdit: () => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ item, onClick, onEdit }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'project':
        return <FolderOpen className="w-5 h-5 text-blue-600" />;
      case 'client':
        return <Building2 className="w-5 h-5 text-green-600" />;
      case 'team':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <FolderOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on hold':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if edit button was clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.title}
            </h3>
            
            {item.subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {item.subtitle}
              </p>
            )}
            
            {item.type === 'team' && item.email && (
              <a 
                href={`mailto:${item.email}`}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4 mr-1" />
                {item.email}
              </a>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                
                <span className="text-xs text-gray-500">
                  Updated {formatDate(item.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          className="flex-shrink-0 ml-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};